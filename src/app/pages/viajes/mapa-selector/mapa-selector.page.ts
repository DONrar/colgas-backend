import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonFab,
  IonFabButton,
  IonCard,
  IonCardContent,
  IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, checkmark, locate } from 'ionicons/icons';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast-service';
import { UbicacionService } from '../../../core/services/ubicacion-service';

@Component({
  selector: 'app-mapa-selector',
  templateUrl: './mapa-selector.page.html',
  styleUrls: ['./mapa-selector.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonButtons,
    IonFab,
    IonFabButton,
    IonCard,
    IonCardContent,
    IonText
  ]
})
export class MapaSelectorPage implements AfterViewInit {
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;

  private router = inject(Router);
  private toastService = inject(ToastService);
  private ubicacionService = inject(UbicacionService);
  private googleMap?: GoogleMap;

  destinoSeleccionado = false;
  destinoLat: number | null = null;
  destinoLng: number | null = null;
  private marcadorId: string | null = null;

  constructor() {
    addIcons({ arrowBack, checkmark, locate });
  }

  async ngAfterViewInit() {
    await this.inicializarMapa();
  }

  async inicializarMapa() {
    try {
      const coordenadasDefault = { lat: 4.6097, lng: -74.0817 };

      this.googleMap = await GoogleMap.create({
        id: 'mapa-selector',
        element: this.mapRef.nativeElement,
        apiKey: environment.googleMapsApiKey,
        config: {
          center: coordenadasDefault,
          zoom: 13,
          androidLiteMode: false
          // ✅ Removido: disableDefaultUI - no es una propiedad válida
        },
        forceCreate: true
      });

      // Listener de clicks en el mapa
      await this.googleMap.setOnMapClickListener(async (event) => {
        await this.seleccionarDestino(event.latitude, event.longitude);
      });

      this.toastService.success('Toca en el mapa para seleccionar destino');
    } catch (error) {
      console.error('Error al inicializar mapa:', error);
      this.toastService.error('Error al cargar el mapa');
    }
  }

  async seleccionarDestino(lat: number, lng: number) {
    if (!this.googleMap) return;

    this.destinoLat = lat;
    this.destinoLng = lng;
    this.destinoSeleccionado = true;

    // Eliminar marcador anterior
    if (this.marcadorId) {
      await this.googleMap.removeMarker(this.marcadorId);
    }

    // Agregar nuevo marcador
    this.marcadorId = await this.googleMap.addMarker({
      coordinate: { lat, lng },
      title: 'Destino',
      snippet: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    });

    this.toastService.success('Destino seleccionado');
  }

  async irAMiUbicacion() {
    try {
      const coords = await this.ubicacionService.obtenerUbicacionActual();

      if (this.googleMap) {
        await this.googleMap.setCamera({
          coordinate: { lat: coords.latitud, lng: coords.longitud },
          zoom: 15,
          animate: true
        });
      }

      this.toastService.success('Centrado en tu ubicación');
    } catch (error) {
      this.toastService.error('No se pudo obtener tu ubicación');
    }
  }

  confirmarDestino() {
    if (this.destinoLat && this.destinoLng) {
      // Guardar en sessionStorage para recuperar en la página anterior
      sessionStorage.setItem('destino_seleccionado', JSON.stringify({
        latitud: this.destinoLat,
        longitud: this.destinoLng
      }));

      this.router.navigate(['/tabs/expresos']);
    }
  }

  volver() {
    this.router.navigate(['/tabs/expresos']);
  }

  ngOnDestroy() {
    if (this.googleMap) {
      this.googleMap.destroy();
    }
  }
}
