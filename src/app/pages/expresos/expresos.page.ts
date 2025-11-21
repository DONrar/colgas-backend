import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonNote,
  IonText,
  IonFooter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  navigate,
  location,
  checkmark
} from 'ionicons/icons';
import { ExpresoService } from '../../core/services/expreso-service';
import { UbicacionService } from '../../core/services/ubicacion-service';
import { LoadingService } from '../../core/services/loading-service';
import { ToastService } from '../../core/services/toast-service';
import { StorageService } from '../../core/services/storage-service';
import { ExpresoCalculo, ExpresoRequest } from '../../core/models/expreso.model';
import { Coordenadas } from '../../core/models/ubicacion.model';

interface DatosCliente {
  nombre: string;
  telefono: string;
}
@Component({
  selector: 'app-expresos',
  templateUrl: './expresos.page.html',
  styleUrls: ['./expresos.page.scss'],
  standalone: true,
  imports: [ CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonNote,
    IonText,
    IonFooter]
})
export class ExpresosPage implements OnInit {
 private expresoService = inject(ExpresoService);
  private ubicacionService = inject(UbicacionService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  datosCliente: DatosCliente = {
    nombre: '',
    telefono: ''
  };

  direccionOrigen = '';
  direccionDestino = '';

  latitudDestino: number | null = null;
  longitudDestino: number | null = null;

  origenObtenido = signal(false);
  calculo = signal<ExpresoCalculo | null>(null);
  error = signal<string | null>(null);

  private origen: Coordenadas | null = null;

  constructor() {
    addIcons({ navigate, location, checkmark });
  }

  ngOnInit() {
    // Cargar datos guardados
    const datosGuardados = this.storageService.obtener<DatosCliente>('colgas_cliente');
    if (datosGuardados) {
      this.datosCliente = datosGuardados;
    }
  }

  async obtenerUbicacionOrigen() {
    try {
      await this.loadingService.mostrar('Obteniendo ubicación...');
      const coords = await this.ubicacionService.obtenerUbicacionActual();
      this.origen = coords;
      this.origenObtenido.set(true);
      await this.loadingService.ocultar();
      this.toastService.success('Ubicación de origen obtenida');
    } catch (error) {
      await this.loadingService.ocultar();
      this.toastService.error('No se pudo obtener la ubicación');
      console.error('Error ubicación:', error);
    }
  }

  puedeCalcular(): boolean {
    return this.origenObtenido() &&
           this.latitudDestino !== null &&
           this.longitudDestino !== null;
  }

  async calcularViaje() {
    if (!this.puedeCalcular() || !this.origen) {
      return;
    }

    this.error.set(null);
    await this.loadingService.mostrar('Calculando viaje...');

    this.expresoService.calcularPrecio({
      latitudOrigen: this.origen.latitud,
      longitudOrigen: this.origen.longitud,
      latitudDestino: this.latitudDestino!,
      longitudDestino: this.longitudDestino!
    }).subscribe({
      next: async (resultado) => {
        this.calculo.set(resultado);
        await this.loadingService.ocultar();
        this.toastService.success('Viaje calculado correctamente');
      },
      error: async (error) => {
        await this.loadingService.ocultar();
        console.error('Error al calcular:', error);
        this.error.set('No se pudo calcular la ruta. Verifica las coordenadas.');
        this.toastService.error('Error al calcular el viaje');
      }
    });
  }

  formularioValido(): boolean {
    return this.datosCliente.nombre.trim() !== '' &&
           this.datosCliente.telefono.trim() !== '';
  }

  async confirmarExpreso() {
    if (!this.formularioValido() || !this.origen || !this.calculo()) {
      this.toastService.warning('Por favor completa todos los campos');
      return;
    }

    await this.loadingService.mostrar('Creando solicitud...');

    const request: ExpresoRequest = {
      nombreCliente: this.datosCliente.nombre,
      telefono: this.datosCliente.telefono,
      latitudOrigen: this.origen.latitud,
      longitudOrigen: this.origen.longitud,
      direccionOrigen: this.direccionOrigen || undefined,
      latitudDestino: this.latitudDestino!,
      longitudDestino: this.longitudDestino!,
      direccionDestino: this.direccionDestino || undefined
    };

    this.expresoService.crearSolicitud(request).subscribe({
      next: async (response) => {
        await this.loadingService.ocultar();

        // Guardar datos del cliente
        this.storageService.guardar('colgas_cliente', this.datosCliente);

        // Redirigir a confirmación
        this.router.navigate(['/expreso-confirmado', response.id]);
      },
      error: async (error) => {
        await this.loadingService.ocultar();
        console.error('Error al crear expreso:', error);
        this.toastService.error('Error al crear la solicitud');
      }
    });
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }

}
