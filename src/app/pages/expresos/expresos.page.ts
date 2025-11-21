import { Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from '../../../environments/environment';
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
  IonFooter,
  IonSegment,
  IonSegmentButton,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  navigate,
  location,
  checkmark,
  map as mapIcon, create, search } from 'ionicons/icons';
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

interface CalculoCache {
  key: string;
  resultado: ExpresoCalculo;
  timestamp: number;
}
@Component({
  selector: 'app-expresos',
  templateUrl: './expresos.page.html',
  styleUrls: ['./expresos.page.scss'],
  standalone: true,
  imports: [CommonModule,
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
    IonSegment,
    IonNote,
    IonText,
    IonFooter, IonSegmentButton, IonSpinner]
})
export class ExpresosPage implements OnInit, AfterViewInit {
  @ViewChild('mapRef') mapRef!: ElementRef;

  private expresoService = inject(ExpresoService);
  private ubicacionService = inject(UbicacionService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  datosCliente: DatosCliente = { nombre: '', telefono: '' };
  direccionOrigen = '';
  direccionDestino = '';
  latitudDestino: number | null = null;
  longitudDestino: number | null = null;
  busquedaTexto = '';

  origenObtenido = signal(false);
  destinoSeleccionado = signal(false);
  calculo = signal<ExpresoCalculo | null>(null);
  error = signal<string | null>(null);
  mapaListo = signal(false);
  lugaresEncontrados = signal<any[]>([]);

  modoSeleccion: 'mapa' | 'busqueda' | 'manual' = 'mapa';
  private origen: Coordenadas | null = null;
  private googleMap: GoogleMap | null = null;
  private destinoMarkerId: string | null = null;
  private origenMarkerId: string | null = null;

  // Cache para reducir llamadas a la API
  private calculoCache: Map<string, CalculoCache> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // Lugares predefinidos (sin costo)
  private lugaresFrecuentes = [
    { id: 1, nombre: 'Aeropuerto El Dorado', direccion: 'Bogotá', lat: 4.7016, lng: -74.1469 },
    { id: 2, nombre: 'Terminal de Transporte', direccion: 'Bogotá', lat: 4.6560, lng: -74.0981 },
    { id: 3, nombre: 'Centro Comercial Unicentro', direccion: 'Bogotá', lat: 4.6613, lng: -74.0397 },
    { id: 4, nombre: 'Centro Histórico La Candelaria', direccion: 'Bogotá', lat: 4.5981, lng: -74.0758 }
  ];

  constructor() {
    addIcons({ navigate, location, checkmark, map: mapIcon, search });
  }

  ngOnInit() {
    const datosGuardados = this.storageService.obtener<DatosCliente>('colgas_cliente');
    if (datosGuardados) this.datosCliente = datosGuardados;
  }

  async ngAfterViewInit() {
    if (this.modoSeleccion === 'mapa') {
      await this.inicializarMapa();
    }
  }

  async inicializarMapa() {
    try {
      const coordenadasDefault = { lat: 4.6097, lng: -74.0817 };

      this.googleMap = await GoogleMap.create({
        id: 'expresos-map',
        element: this.mapRef.nativeElement,
        apiKey: environment.googleMapsApiKey,
        config: {
          center: coordenadasDefault,
          zoom: 12,
          androidLiteMode: false
        }
      });

      this.mapaListo.set(true);

      await this.googleMap.setOnMapClickListener((event) => {
        this.seleccionarDestino(event.latitude, event.longitude);
      });

      this.toastService.success('Toca en el mapa para seleccionar el destino');
    } catch (error) {
      console.error('Error al inicializar mapa:', error);
      this.toastService.error('Error al cargar el mapa. Usa búsqueda o modo manual.');
      this.modoSeleccion = 'busqueda';
    }
  }

  async seleccionarDestino(lat: number, lng: number) {
    if (!this.googleMap) return;

    this.latitudDestino = lat;
    this.longitudDestino = lng;
    this.destinoSeleccionado.set(true);

    if (this.destinoMarkerId) {
      await this.googleMap.removeMarker(this.destinoMarkerId);
    }

    this.destinoMarkerId = await this.googleMap.addMarker({
      coordinate: { lat, lng },
      title: 'Destino',
      snippet: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    });

    this.toastService.success('Destino seleccionado');
  }

  buscarLugar() {
    const texto = this.busquedaTexto.toLowerCase().trim();
    if (!texto) {
      this.lugaresEncontrados.set([]);
      return;
    }
    // Búsqueda local sin costo
    const resultados = this.lugaresFrecuentes.filter(lugar =>
      lugar.nombre.toLowerCase().includes(texto) ||
      lugar.direccion.toLowerCase().includes(texto)
    );
    this.lugaresEncontrados.set(resultados);
  }

  seleccionarLugar(lugar: any) {
    this.latitudDestino = lugar.lat;
    this.longitudDestino = lugar.lng;
    this.direccionDestino = lugar.nombre;
    this.destinoSeleccionado.set(true);
    this.lugaresEncontrados.set([]);
    this.toastService.success(`Destino: ${lugar.nombre}`);
  }

  async cambiarModoSeleccion() {
    if (this.modoSeleccion === 'mapa' && !this.googleMap) {
      await this.inicializarMapa();
    }
  }

  async obtenerUbicacionOrigen() {
    try {
      await this.loadingService.mostrar('Obteniendo ubicación...');
      const coords = await this.ubicacionService.obtenerUbicacionActual();
      this.origen = coords;
      this.origenObtenido.set(true);

      if (this.googleMap) {
        await this.googleMap.setCamera({
          coordinate: { lat: coords.latitud, lng: coords.longitud },
          zoom: 14,
          animate: true
        });

        if (this.origenMarkerId) {
          await this.googleMap.removeMarker(this.origenMarkerId);
        }

        this.origenMarkerId = await this.googleMap.addMarker({
          coordinate: { lat: coords.latitud, lng: coords.longitud },
          title: 'Tu ubicación'
        });
      }

      await this.loadingService.ocultar();
      this.toastService.success('Ubicación de origen obtenida');
    } catch (error) {
      await this.loadingService.ocultar();
      this.toastService.error('No se pudo obtener la ubicación');
    }
  }

  puedeCalcular(): boolean {
    return this.origenObtenido() && this.latitudDestino !== null && this.longitudDestino !== null;
  }

  async calcularViaje() {
    if (!this.puedeCalcular() || !this.origen) return;

    // Verificar cache primero (reducir costos)
    const cacheKey = `${this.origen.latitud.toFixed(4)},${this.origen.longitud.toFixed(4)}-${this.latitudDestino!.toFixed(4)},${this.longitudDestino!.toFixed(4)}`;
    const cached = this.calculoCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      this.calculo.set(cached.resultado);
      this.toastService.success('Cálculo obtenido desde caché');
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
        // Guardar en cache
        this.calculoCache.set(cacheKey, { key: cacheKey, resultado, timestamp: Date.now() });
        await this.loadingService.ocultar();
        this.toastService.success('Viaje calculado correctamente');
      },
      error: async (error) => {
        await this.loadingService.ocultar();
        console.error('Error al calcular:', error);
        this.error.set('No se pudo calcular la ruta. Verifica las coordenadas e intenta nuevamente.');
        this.toastService.error('Error al calcular el viaje');
      }
    });
  }

  formularioValido(): boolean {
    return this.datosCliente.nombre.trim() !== '' && this.datosCliente.telefono.trim() !== '';
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
        this.storageService.guardar('colgas_cliente', this.datosCliente);
        this.router.navigate(['/expreso-confirmado', response.id]);
      },
      error: async (error) => {
        await this.loadingService.ocultar();
        console.error('Error al crear expreso:', error);
        this.toastService.error('Error al crear la solicitud. Intenta nuevamente.');
      }
    });
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }

  ngOnDestroy() {
    if (this.googleMap) {
      this.googleMap.destroy();
    }
  }
}
