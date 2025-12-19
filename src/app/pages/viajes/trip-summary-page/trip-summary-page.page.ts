import { GoogleApiService, ExpresoRequest } from '../../../core/services/google-api-service';
import { GeoLocationService, TripInfo } from '../../../core/services/geo-location-service';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton,
  IonItem, IonLabel, IonCardContent, IonCardHeader, IonCardTitle,
  IonCard, IonButtons, IonSpinner, AlertController, ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBack, receiptOutline, checkmarkDone, carSportOutline,
  navigateOutline, timeOutline, pricetagOutline, locationOutline,
  informationCircleOutline, checkmarkCircle, closeCircle,
  playForward, flag, alertCircleOutline, shareOutline,
  createOutline, bookmarkOutline, refreshOutline,
  cashOutline, speedometerOutline, calculatorOutline,
  shieldCheckmarkOutline, cardOutline, listOutline,
  copyOutline, callOutline } from 'ionicons/icons';
import { Clipboard } from '@capacitor/clipboard';

@Component({
  selector: 'app-trip-summary-page',
  templateUrl: './trip-summary-page.page.html',
  styleUrls: ['./trip-summary-page.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonButtons, IonCard, IonCardTitle, IonCardHeader, IonCardContent,
     IonButton, IonIcon, IonContent, IonHeader,
    IonTitle, IonToolbar, IonSpinner
  ]
})
export class TripSummaryPagePage implements OnInit {
  private router = inject(Router);
  private locationService = inject(GeoLocationService);
  private apiService = inject(GoogleApiService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  tripInfo: TripInfo | null = null;
  isLoading = true;
  isProcessing = false;
  startLocation: any = null;
  endLocation: any = null;

  constructor() {
    addIcons({arrowBack,receiptOutline,shareOutline,checkmarkDone, cashOutline,navigateOutline,timeOutline,calculatorOutline,pricetagOutline,checkmarkCircle,informationCircleOutline,locationOutline,playForward,flag,copyOutline,shieldCheckmarkOutline,cardOutline,createOutline,bookmarkOutline,closeCircle,listOutline,callOutline,alertCircleOutline,refreshOutline,carSportOutline,speedometerOutline});
  }

  async ngOnInit() {
    await this.loadTripInfo();
  }

  async loadTripInfo() {
    this.isLoading = true;

    try {
      this.tripInfo = await this.locationService.calculateTripInfo();
      this.startLocation = this.locationService.getStartLocation();
      this.endLocation = this.locationService.getEndLocation();

      if (!this.tripInfo) {
        throw new Error('No se pudo calcular la información del viaje');
      }
    } catch (error: any) {
      console.error('Error cargando información:', error);
      await this.showAlert('Error', error.message || 'No se pudo calcular la información del viaje');
    } finally {
      this.isLoading = false;
    }
  }

  getStartAddress(): string {
    if (!this.startLocation) {
      return 'Ubicación no disponible';
    }

    if (this.startLocation.address) {
      return this.startLocation.address;
    }

    if (this.startLocation.lat && this.startLocation.lng) {
      return `${this.startLocation.lat.toFixed(6)}, ${this.startLocation.lng.toFixed(6)}`;
    }

    return 'Ubicación seleccionada';
  }

  getEndAddress(): string {
    if (!this.endLocation) {
      return 'Ubicación no disponible';
    }

    if (this.endLocation.address) {
      return this.endLocation.address;
    }

    if (this.endLocation.lat && this.endLocation.lng) {
      return `${this.endLocation.lat.toFixed(6)}, ${this.endLocation.lng.toFixed(6)}`;
    }

    return 'Ubicación seleccionada';
  }

  async copyCoordinates(location: any) {
    if (!location) return;

    const coords = `${location.lat}, ${location.lng}`;
    try {
      await Clipboard.write({
        string: coords
      });
      this.showToast('Coordenadas copiadas al portapapeles', 'success');
    } catch (error) {
      this.showToast('Error al copiar coordenadas', 'warning');
    }
  }

  async compartirViaje() {
    if (!this.tripInfo) return;

    const mensaje = `🚗 Viaje calculado:\n` +
      `📍 Origen: ${this.getStartAddress()}\n` +
      `📍 Destino: ${this.getEndAddress()}\n` +
      `📏 Distancia: ${this.tripInfo.distance} km\n` +
      `⏱️ Tiempo: ${this.tripInfo.duration} min\n` +
      `💰 Total: ${this.formatCurrency(this.tripInfo.totalPrice)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Resumen de Viaje',
          text: mensaje
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    } else {
      try {
        await Clipboard.write({
          string: mensaje
        });
        this.showToast('Resumen copiado al portapapeles', 'success');
      } catch (error) {
        this.showToast('Error al copiar el resumen', 'warning');
      }
    }
  }

  calculateBaseFare(): number {
    if (!this.tripInfo) return 0;
    return this.tripInfo.totalPrice * 0.4; // 40% como tarifa base
  }

  calculateDistanceCost(): number {
    if (!this.tripInfo) return 0;
    return this.tripInfo.totalPrice * 0.5; // 50% por distancia
  }

  calculateTimeCost(): number {
    if (!this.tripInfo) return 0;
    return this.tripInfo.totalPrice * 0.1; // 10% por tiempo
  }

  async confirmTrip() {
    const alert = await this.alertCtrl.create({
      header: 'Datos del cliente',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre completo',
          attributes: {
            required: true,
            minlength: 3
          }
        },
        {
          name: 'telefono',
          type: 'tel',
          placeholder: 'Teléfono (ej: 3001234567)',
          attributes: {
            required: true,
            maxlength: 10,
            minlength: 10,
            pattern: '[0-9]{10}'
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          cssClass: 'btn-confirm',
          handler: async (data) => {
            if (!data.nombre || !data.telefono) {
              this.showAlert('Error', 'Por favor completa todos los campos');
              return false;
            }

            if (data.telefono.length !== 10 || !/^\d+$/.test(data.telefono)) {
              this.showAlert('Error', 'El teléfono debe tener 10 dígitos numéricos');
              return false;
            }

            await this.procesarViaje(data.nombre, data.telefono);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async procesarViaje(nombre: string, telefono: string) {
    this.isProcessing = true;

    try {
      const startLoc = this.locationService.getStartLocation();
      const endLoc = this.locationService.getEndLocation();

      if (!startLoc || !endLoc) {
        throw new Error('Ubicaciones no disponibles');
      }

      const request: ExpresoRequest = {
        nombreCliente: nombre,
        telefono: telefono,
        latitudOrigen: startLoc.lat,
        longitudOrigen: startLoc.lng,
        direccionOrigen: startLoc.address || this.getStartAddress(),
        latitudDestino: endLoc.lat,
        longitudDestino: endLoc.lng,
        direccionDestino: endLoc.address || this.getEndAddress()
      };

      const response = await this.apiService.crearSolicitud(request).toPromise();

      if (response) {
        const alert = await this.alertCtrl.create({
          header: '¡Viaje confirmado!',
          message: `Tu viaje ha sido solicitado exitosamente.\n\n` +
                   `📋 Código: ${response.id || 'N/A'}\n` +
                   `💰 Total: ${this.formatCurrency(this.tripInfo?.totalPrice || 0)}\n\n` +
                   `¿Deseas contactar al conductor por WhatsApp?`,
          buttons: [
            {
              text: 'Ver detalles',
              role: 'cancel',
              handler: () => {
                this.router.navigate(['/tabs/viajes', response.id]);
              }
            },
            {
              text: 'Abrir WhatsApp',
              cssClass: 'btn-success',
              handler: () => {
                this.abrirWhatsApp(response.urlWhatsApp);
              }
            }
          ]
        });

        await alert.present();
      }
    } catch (error: any) {
      console.error('Error creando solicitud:', error);
      this.showAlert('Error', error.message || 'No se pudo crear la solicitud de viaje');
    } finally {
      this.isProcessing = false;
    }
  }

  abrirWhatsApp(url: string) {
    window.open(url, '_system');
  }

  goBack() {
    this.router.navigate(['/select-destination-page']);
  }

  modificarViaje() {
    this.router.navigate(['/select-destination-page'], {
      state: {
        startLocation: this.startLocation,
        endLocation: this.endLocation
      }
    });
  }

  async guardarParaDespues() {
    const alert = await this.alertCtrl.create({
      header: 'Guardar viaje',
      message: '¿Quieres guardar este viaje para solicitarlo más tarde?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: () => {
            this.saveTripToStorage();
          }
        }
      ]
    });

    await alert.present();
  }

  saveTripToStorage() {
    const tripData = {
      startLocation: this.startLocation,
      endLocation: this.endLocation,
      tripInfo: this.tripInfo,
      timestamp: new Date().toISOString()
    };

    // Guardar en localStorage
    const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
    savedTrips.push(tripData);
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));

    this.showToast('Viaje guardado para después', 'success');
  }

  startNewTrip() {
    this.router.navigate(['/start-trip-page']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
