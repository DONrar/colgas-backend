import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonNote,
  IonIcon,
  IonFooter,
  IonRadioGroup,
  IonRadio,
  IonTextarea
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { location, cash, card, send } from 'ionicons/icons';
import { CarritoService } from '../../core/services/carrito-service';
import { PedidoService } from '../../core/services/pedido-service';
import { UbicacionService } from '../../core/services/ubicacion-service';
import { LoadingService } from '../../core/services/loading-service';
import { ToastService } from '../../core/services/toast-service';
import { StorageService } from '../../core/services/storage-service';
import { MetodoPago, PedidoRequest } from '../../core/models/pedido.model';

interface DatosCliente {
  nombre: string;
  telefono: string;
}
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [ CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput, 
    IonButton,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonNote,
    IonIcon,
    IonFooter,
    IonRadioGroup,
    IonRadio,
    IonTextarea]
})
export class CheckoutPage implements OnInit {
private carritoService = inject(CarritoService);
  private pedidoService = inject(PedidoService);
  private ubicacionService = inject(UbicacionService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  items = this.carritoService.items;
  total = this.carritoService.total;

  datosCliente: DatosCliente = {
    nombre: '',
    telefono: ''
  };

  direccion = '';
  metodoPago: MetodoPago = MetodoPago.EFECTIVO;
  pagaCon: number | null = null;

  ubicacionObtenida = signal(false);
  private latitud: number | null = null;
  private longitud: number | null = null;

  constructor() {
    addIcons({ location, cash, card, send });
  }

  ngOnInit() {
    // Cargar datos guardados
    const datosGuardados = this.storageService.obtener<DatosCliente>('colgas_cliente');
    if (datosGuardados) {
      this.datosCliente = datosGuardados;
    }

    // Verificar si hay items en el carrito
    if (this.items().length === 0) {
      this.toastService.warning('Tu carrito está vacío');
      this.router.navigate(['/tabs/productos']);
    }
  }

  async obtenerUbicacion() {
    try {
      await this.loadingService.mostrar('Obteniendo ubicación...');
      const coords = await this.ubicacionService.obtenerUbicacionActual();
      this.latitud = coords.latitud;
      this.longitud = coords.longitud;
      this.ubicacionObtenida.set(true);
      await this.loadingService.ocultar();
      this.toastService.success('Ubicación obtenida correctamente');
    } catch (error) {
      await this.loadingService.ocultar();
      this.toastService.error('No se pudo obtener la ubicación');
      console.error('Error ubicación:', error);
    }
  }

  formularioValido(): boolean {
    const datosValidos = this.datosCliente.nombre.trim() !== '' &&
                         this.datosCliente.telefono.trim() !== '';

    const pagoValido = this.metodoPago !== MetodoPago.EFECTIVO ||
                       (this.pagaCon !== null && this.pagaCon >= this.total());

    return datosValidos && pagoValido;
  }

  async confirmarPedido() {
    if (!this.formularioValido()) {
      this.toastService.warning('Por favor completa todos los campos');
      return;
    }

    await this.loadingService.mostrar('Creando pedido...');

    const pedido: PedidoRequest = {
      nombreCliente: this.datosCliente.nombre,
      telefono: this.datosCliente.telefono,
      metodoPago: this.metodoPago,
      items: this.items().map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad
      })),
      direccionEntrega: this.direccion || undefined,
      latitud: this.latitud || undefined,
      longitud: this.longitud || undefined
    };

    if (this.metodoPago === MetodoPago.EFECTIVO && this.pagaCon) {
      pedido.pagaCon = this.pagaCon;
    }

    this.pedidoService.crearPedido(pedido).subscribe({
      next: async (response) => {
        await this.loadingService.ocultar();

        // Guardar datos del cliente
        this.storageService.guardar('colgas_cliente', this.datosCliente);

        // Limpiar carrito
        this.carritoService.limpiar();

        // Redirigir a confirmación
        this.router.navigate(['/pedido-confirmado', response.id]);
      },
      error: async (error) => {
        await this.loadingService.ocultar();
        console.error('Error al crear pedido:', error);
        this.toastService.error('Error al crear el pedido. Intenta nuevamente.');
      }
    });
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }

}
