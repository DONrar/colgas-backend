import { Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from '../../../../environments/environment';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonButton, IonIcon, IonList, IonItem,
  IonLabel, IonInput, IonNote, IonText, IonFooter, IonSegment,
  IonSegmentButton, IonSpinner, AlertController, Platform
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { navigate, location, checkmark, map as mapIcon, search } from 'ionicons/icons';
import { ExpresoService } from '../../../core/services/expreso-service';
import { UbicacionService } from '../../../core/services/ubicacion-service';
import { LoadingService } from '../../../core/services/loading-service';
import { ToastService } from '../../../core/services/toast-service';
import { StorageService } from '../../../core/services/storage-service';
import { ExpresoCalculo, ExpresoRequest } from '../../../core/models/expreso.model';
import { Coordenadas } from '../../../core/models/ubicacion.model';



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
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon,
    IonList, IonItem, IonLabel, IonInput, IonNote, IonText, IonFooter,
    IonSegment, IonSegmentButton, IonSpinner]
})
export class ExpresosPage implements OnInit, AfterViewInit {
  @ViewChild('mapRef') mapRef!: ElementRef;

  private expresoService = inject(ExpresoService);
  private ubicacionService = inject(UbicacionService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController); // ✅ Agregado
  private platform = inject(Platform); // ✅ Agregado

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

  private calculoCache: Map<string, CalculoCache> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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

    const destinoGuardado = sessionStorage.getItem('destino_seleccionado');
    if (destinoGuardado) {
      const destino = JSON.parse(destinoGuardado);
      this.latitudDestino = destino.latitud;
      this.longitudDestino = destino.longitud;
      this.destinoSeleccionado.set(true);
      sessionStorage.removeItem('destino_seleccionado');
      this.toastService.success('Destino cargado desde el mapa');
    }
  }

  async ngAfterViewInit() {
    if (this.modoSeleccion === 'mapa') {
      await this.inicializarMapa();
    }
  }

  async inicializarMapa() {
    try {
      const permisos = await this.ubicacionService.verificarPermisos();
      if (!permisos) {
        console.warn('Permisos de ubicación no otorgados');
      }

      const coordenadasDefault = { lat: 4.6097, lng: -74.0817 };

      console.log('Inicializando Google Maps con API Key:', environment.googleMapsApiKey?.substring(0, 10) + '...');

      this.googleMap = await GoogleMap.create({
        id: 'expresos-map',
        element: this.mapRef.nativeElement,
        apiKey: environment.googleMapsApiKey,
        config: {
          center: coordenadasDefault,
          zoom: 12,
          androidLiteMode: false
          // Removido: disableDefaultUI - no es una propiedad válida en GoogleMapConfig
        }
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      this.mapaListo.set(true);

      await this.googleMap.setOnMapClickListener((event) => {
        this.seleccionarDestino(event.latitude, event.longitude);
      });

      console.log('Mapa inicializado correctamente');
      this.toastService.success('Toca en el mapa para seleccionar el destino');
    } catch (error) {
      console.error('Error detallado al inicializar mapa:', error);
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

  // expresos.page.ts - Versión Mejorada
async obtenerUbicacionOrigen() {
  try {
    console.log('🔄 Iniciando proceso de obtención de ubicación...');

    await this.loadingService.mostrar('Obteniendo tu ubicación...');

    // Agregar timeout para evitar bloqueos
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: No se pudo obtener la ubicación en 30 segundos')), 30000);
    });

    const ubicacionPromise = this.ubicacionService.obtenerUbicacionActual();

    const coords = await Promise.race([ubicacionPromise, timeoutPromise]) as any;

    this.origen = coords;
    this.origenObtenido.set(true);

    console.log('📍 Ubicación obtenida:', coords);

    // Actualizar mapa si está disponible
    if (this.googleMap) {
      console.log('🗺️ Actualizando mapa con nueva ubicación...');

      await this.googleMap.setCamera({
        coordinate: {
          lat: coords.latitud,
          lng: coords.longitud
        },
        zoom: 14,
        animate: true
      });

      // Remover marcador anterior si existe
      if (this.origenMarkerId) {
        await this.googleMap.removeMarker(this.origenMarkerId);
      }

      // Agregar nuevo marcador
      this.origenMarkerId = await this.googleMap.addMarker({
        coordinate: {
          lat: coords.latitud,
          lng: coords.longitud
        },
        title: 'Tu ubicación actual',
        snippet: `Precisión: ${coords.precision?.toFixed(1)}m`
      });

      console.log('✅ Marcador de ubicación agregado al mapa');
    }

    await this.loadingService.ocultar();

    // Mostrar toast de éxito
    this.toastService.success('Ubicación obtenida correctamente ✓');

    // Log adicional para debugging
    console.log('🎉 Proceso de ubicación completado exitosamente');

  } catch (error: any) {
    console.error('❌ Error en obtenerUbicacionOrigen:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    await this.loadingService.ocultar();

    // Mensajes de error más específicos
    let mensajeError = 'No se pudo obtener la ubicación';

    if (error.message.includes('permission') || error.message.includes('permiso')) {
      mensajeError = 'Permiso de ubicación denegado. Activa los permisos en Configuración → Aplicaciones → TuApp → Permisos';
    } else if (error.message.includes('GPS') || error.message.includes('Position')) {
      mensajeError = 'GPS desactivado. Activa la ubicación en ajustes del dispositivo';
    } else if (error.message.includes('Timeout')) {
      mensajeError = 'Tiempo de espera agotado. Verifica tu conexión y GPS';
    }

    this.toastService.error(mensajeError);

    // Opcional: Mostrar alerta con instrucciones
    this.mostrarInstruccionesUbicacion(mensajeError);
  }
}

// Método para mostrar instrucciones detalladas
async mostrarInstruccionesUbicacion(mensaje: string) {
  const alert = await this.alertCtrl.create({
    header: 'Problema con la ubicación',
    message: `
      <p>${mensaje}</p>
      <p><strong>Solución:</strong></p>
      <ol>
        <li>Ve a Configuración → Aplicaciones</li>
        <li>Encuentra "${this.appName}"</li>
        <li>Selecciona "Permisos"</li>
        <li>Activa "Ubicación"</li>
        <li>Asegúrate de que el GPS esté activado</li>
      </ol>
    `,
    buttons: [
      {
        text: 'Entendido',
        role: 'cancel'
      },
      {
        text: 'Abrir Configuración',
        handler: () => {
          // Intentar abrir configuración de la app
          if (this.platform.is('android')) {
            // Para Android
            (window as any).cordova.plugins.diagnostic.switchToSettings();
          }
        }
      }
    ]
  });

  await alert.present();
}

// Agregar esta propiedad
private appName = 'TuApp'; // Cambia por el nombre de tu app
  puedeCalcular(): boolean {
    return this.origenObtenido() && this.latitudDestino !== null && this.longitudDestino !== null;
  }

  async calcularViaje() {
    if (!this.puedeCalcular() || !this.origen) return;

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
