import { GeoLocationService, Location } from './../../core/services/geo-location-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonIcon, IonButtons, IonSpinner
} from '@ionic/angular/standalone';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBack, mapOutline, locateOutline, handLeft,
  checkmarkCircle, close, checkmark
} from 'ionicons/icons';

declare var google: any;

@Component({
  selector: 'app-select-destination-page',
  templateUrl: './select-destination-page.page.html',
  styleUrls: ['./select-destination-page.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonButtons, IonIcon, IonButton, IonContent, IonHeader,
    IonTitle, IonToolbar, IonSpinner
  ]
})
export class SelectDestinationPagePage implements OnInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;

  map: any;
  selectedLocation: Location | null = null;
  marker: any;
  startLocation: Location | null = null;
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private platform: Platform,
    private locationService: GeoLocationService,
    private alertCtrl: AlertController
  ) {
    addIcons({
      arrowBack, mapOutline, locateOutline, handLeft,
      checkmarkCircle, close, checkmark
    });
  }

  ngOnInit() {
    this.startLocation = this.locationService.getStartLocation();

    if (!this.startLocation) {
      this.showAlert('Error', 'No se encontró la ubicación de inicio');
      this.router.navigate(['/start-trip-page']);
      return;
    }
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      // Pequeño delay para asegurar que el contenedor del mapa esté renderizado
      setTimeout(() => {
        this.loadMap();
      }, 100);
    });
  }

  loadMap() {
    if (!this.startLocation) return;

    this.isLoading = true;

    const mapOptions = {
      center: { lat: this.startLocation.lat, lng: this.startLocation.lng },
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      },
      clickableIcons: false,
      gestureHandling: 'greedy',
      disableDoubleClickZoom: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ]
    };

    try {
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      // Marcador del punto de inicio
      new google.maps.Marker({
        position: { lat: this.startLocation.lat, lng: this.startLocation.lng },
        map: this.map,
        title: 'Punto de inicio',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        }
      });

      // Agregar listener para clicks en el mapa
      this.map.addListener('click', (event: any) => {
        this.placeMarker(event.latLng);
      });

      // Cuando el mapa esté listo
      google.maps.event.addListenerOnce(this.map, 'tilesloaded', () => {
        this.isLoading = false;
      });

    } catch (error) {
      console.error('Error loading map:', error);
      this.isLoading = false;
      this.showAlert('Error', 'No se pudo cargar el mapa. Intenta nuevamente.');
    }
  }

  placeMarker(location: any) {
    // Remover marcador anterior si existe
    if (this.marker) {
      this.marker.setMap(null);
    }

    // Crear nuevo marcador
    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
      title: 'Punto de destino',
      animation: google.maps.Animation.DROP,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    });

    this.selectedLocation = {
      lat: location.lat(),
      lng: location.lng()
    };
  }

  clearSelection() {
    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }
    this.selectedLocation = null;
  }

  centerOnStartLocation() {
    if (this.startLocation && this.map) {
      this.map.setCenter({ lat: this.startLocation.lat, lng: this.startLocation.lng });
      this.map.setZoom(14);
    }
  }

  confirmDestination() {
    if (!this.selectedLocation) {
      this.showAlert('Atención', 'Por favor, selecciona un punto de destino en el mapa');
      return;
    }

    this.locationService.setEndLocation(this.selectedLocation);
    this.router.navigate(['/trip-summary-page']);
  }

  goBack() {
    this.router.navigate(['/start-trip-page']);
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
