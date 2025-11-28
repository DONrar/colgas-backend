import { GoogleApiService, ExpresoRequest } from './../../core/services/google-api-service';
import { GeoLocationService, TripInfo } from './../../core/services/geo-location-service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonItem, IonLabel, IonCardContent, IonCardHeader, IonCardTitle, IonCard, IonButtons } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { AlertController, LoadingController, ModalController } from '@ionic/angular';


@Component({
  selector: 'app-trip-summary-page',
  templateUrl: './trip-summary-page.page.html',
  styleUrls: ['./trip-summary-page.page.scss'],
  standalone: true,
  imports: [IonButtons, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonLabel, IonItem, IonButton, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class TripSummaryPagePage implements OnInit {
tripInfo: TripInfo | null = null;
  isLoading = true;

  constructor(
    private router: Router,
    private locationService: GeoLocationService,
    private apiService: GoogleApiService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    await this.loadTripInfo();
  }

  async loadTripInfo() {
    const loading = await this.loadingCtrl.create({
      message: 'Calculando información del viaje...',
      spinner: 'crescent'
    });

    await loading.present();

    try {
      this.tripInfo = await this.locationService.calculateTripInfo();

      if (!this.tripInfo) {
        throw new Error('No se pudo calcular la información del viaje');
      }
    } catch (error: any) {
      console.error('Error cargando información:', error);
      await this.showAlert('Error', error.message || 'No se pudo calcular la información del viaje');
      this.router.navigate(['/start-trip']);
    } finally {
      await loading.dismiss();
      this.isLoading = false;
    }
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
            required: true
          }
        },
        {
          name: 'telefono',
          type: 'tel',
          placeholder: 'Teléfono (ej: 3001234567)',
          attributes: {
            required: true,
            maxlength: 10,
            minlength: 10
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
          handler: async (data) => {
            if (!data.nombre || !data.telefono) {
              this.showAlert('Error', 'Por favor completa todos los campos');
              return false;
            }

            if (data.telefono.length !== 10) {
              this.showAlert('Error', 'El teléfono debe tener 10 dígitos');
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
    const loading = await this.loadingCtrl.create({
      message: 'Creando solicitud...',
      spinner: 'crescent'
    });

    await loading.present();

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
        direccionOrigen: startLoc.address,
        latitudDestino: endLoc.lat,
        longitudDestino: endLoc.lng,
        direccionDestino: endLoc.address
      };

      const response = await this.apiService.crearSolicitud(request).toPromise();

      await loading.dismiss();

      if (response) {
        // Mostrar alerta con opción de abrir WhatsApp
        const alert = await this.alertCtrl.create({
          header: '¡Viaje confirmado!',
          message: 'Tu viaje ha sido solicitado exitosamente. ¿Deseas contactar al conductor por WhatsApp?',
          buttons: [
            {
              text: 'Ahora no',
              role: 'cancel',
              handler: () => {
                this.router.navigate(['/start-trip']);
              }
            },
            {
              text: 'Abrir WhatsApp',
              handler: () => {
                this.abrirWhatsApp(response.urlWhatsApp);
                this.router.navigate(['/start-trip']);
              }
            }
          ]
        });

        await alert.present();
      }
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error creando solicitud:', error);
      this.showAlert('Error', error.message || 'No se pudo crear la solicitud de viaje');
    }
  }

  abrirWhatsApp(url: string) {
    window.open(url, '_system');
  }

  goBack() {
    this.router.navigate(['/select-destination']);
  }

  startNewTrip() {
    this.router.navigate(['/start-trip']);
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

}
