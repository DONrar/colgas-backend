import { GeoLocationService, Location } from '../../../core/services/geo-location-service';
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
  checkmarkCircle, close, checkmark, search,
  closeCircle, location, informationCircle, sadOutline
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
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef;

  map: any;
  selectedLocation: Location | null = null;
  selectedLocationName: string = '';
  marker: any;
  startLocation: Location | null = null;
  isLoading: boolean = true;
  loadingMessage: string = 'Cargando mapa...';

  // Búsqueda
  searchQuery: string = '';
  showSuggestions: boolean = false;
  predictions: any[] = [];
  autocompleteService: any;
  placesService: any;
  searchTimeout: any;

  constructor(
    private router: Router,
    private platform: Platform,
    private locationService: GeoLocationService,
    private alertCtrl: AlertController
  ) {
    addIcons({
      arrowBack, mapOutline, locateOutline, handLeft,
      checkmarkCircle, close, checkmark, search,
      closeCircle, location, informationCircle, sadOutline
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
      setTimeout(() => {
        this.loadMap();
      }, 100);
    });
  }

  loadMap() {
    if (!this.startLocation) return;

    this.isLoading = true;
    this.loadingMessage = 'Cargando mapa...';

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

      // Inicializar servicios de búsqueda
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.placesService = new google.maps.places.PlacesService(this.map);

      // Marcador del punto de inicio
      new google.maps.Marker({
        position: { lat: this.startLocation.lat, lng: this.startLocation.lng },
        map: this.map,
        title: 'Punto de inicio',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        }
      });

      // Listener para clicks en el mapa
      this.map.addListener('click', (event: any) => {
        this.placeMarkerAndGetAddress(event.latLng);
      });

      // Configurar el input de búsqueda
      this.setupSearchInput();

      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        this.isLoading = false;
      });

      setTimeout(() => {
        if (this.isLoading) {
          this.isLoading = false;
        }
      }, 2000);

    } catch (error) {
      console.error('Error loading map:', error);
      this.isLoading = false;
      this.showAlert('Error', 'No se pudo cargar el mapa. Intenta nuevamente.');
    }
  }

  setupSearchInput() {
    if (!this.searchInput) return;

    this.searchInput.nativeElement.addEventListener('input', (e: any) => {
      this.searchQuery = e.target.value;

      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      if (this.searchQuery.length < 3) {
        this.predictions = [];
        this.showSuggestions = false;
        return;
      }

      this.searchTimeout = setTimeout(() => {
        this.searchPlaces(this.searchQuery);
      }, 300);
    });
  }

  searchPlaces(query: string) {
    if (!this.autocompleteService || !this.startLocation) return;

    const request = {
      input: query,
      location: new google.maps.LatLng(
        this.startLocation.lat,
        this.startLocation.lng
      ),
      radius: 50000, // 50km de radio
      componentRestrictions: { country: 'co' } // Restringir a Colombia
    };

    this.autocompleteService.getPlacePredictions(
      request,
      (predictions: any, status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          this.predictions = predictions;
          this.showSuggestions = true;
        } else {
          this.predictions = [];
          this.showSuggestions = true;
        }
      }
    );
  }

  selectPrediction(prediction: any) {
    this.isLoading = true;
    this.loadingMessage = 'Obteniendo ubicación...';
    this.showSuggestions = false;

    this.placesService.getDetails(
      { placeId: prediction.place_id },
      (place: any, status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place.geometry) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };

          this.selectedLocationName = place.name || prediction.description;
          this.searchQuery = this.selectedLocationName;

          // Centrar el mapa en la ubicación
          this.map.setCenter(location);
          this.map.setZoom(16);

          // Colocar marcador
          this.placeMarker(place.geometry.location);

          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.showAlert('Error', 'No se pudo obtener la ubicación del lugar seleccionado');
        }
      }
    );
  }

  placeMarkerAndGetAddress(location: any) {
    this.placeMarker(location);

    // Obtener nombre del lugar usando Geocoding reverso
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: location }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        this.selectedLocationName = results[0].formatted_address;
        this.searchQuery = this.selectedLocationName;
      }
    });
  }

  placeMarker(location: any) {
    if (this.marker) {
      this.marker.setMap(null);
    }

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

  onSearchFocus() {
    if (this.searchQuery && this.predictions.length > 0) {
      this.showSuggestions = true;
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.predictions = [];
    this.showSuggestions = false;
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
  }

  clearSelection() {
    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }
    this.selectedLocation = null;
    this.selectedLocationName = '';
    this.clearSearch();
  }

  centerOnStartLocation() {
    if (this.startLocation && this.map) {
      this.map.setCenter({ lat: this.startLocation.lat, lng: this.startLocation.lng });
      this.map.setZoom(14);
    }
  }

  confirmDestination() {
    if (!this.selectedLocation) {
      this.showAlert('Atención', 'Por favor, selecciona un punto de destino');
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
