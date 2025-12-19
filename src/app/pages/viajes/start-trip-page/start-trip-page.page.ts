import { GeoLocationService } from '../../../core/services/geo-location-service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonIcon, IonCardHeader, IonCardTitle, IonCardContent,
  IonCard, IonBadge, IonButtons, IonSpinner
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { addIcons } from 'ionicons';
import {
  navigate, map, location, checkmarkCircle, lockClosed,
  informationCircleOutline, flagOutline, navigateOutline,
  checkmark, checkmarkDone, arrowBack, warning, time } from 'ionicons/icons';

@Component({
  selector: 'app-start-trip-page',
  templateUrl: './start-trip-page.page.html',
  styleUrls: ['./start-trip-page.page.scss'],
  standalone: true,
  imports: [
    IonSpinner, IonButtons, IonBadge, IonCard, IonCardContent, IonCardTitle,
    IonCardHeader, IonIcon, IonButton, IonContent, IonHeader,
    IonTitle, IonToolbar, CommonModule, FormsModule
  ]
})
export class StartTripPagePage {
  currentLocation: any = null;
  isLoading = false;  // Usar variable en lugar de LoadingController

  constructor(
    private router: Router,
    private locationService: GeoLocationService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({arrowBack,navigate,location,checkmark,navigateOutline,checkmarkCircle,time,checkmarkDone,flagOutline,lockClosed,map,informationCircleOutline,warning});
    console.log('StartTripPagePage - Constructor inicializado');
    console.log('locationService:', this.locationService);
  }

  ionViewWillEnter() {
    console.log('StartTripPagePage - ionViewWillEnter');
    this.locationService.reset();
    this.currentLocation = null;
    this.isLoading = false;
  }

  async useCurrentLocation() {
    console.log('═══════════════════════════════════════');
    console.log('🔵 useCurrentLocation - INICIADO');
    console.log('═══════════════════════════════════════');
    console.log('1️⃣ Verificando servicio...');
    console.log('locationService existe?', !!this.locationService);
    console.log('locationService:', this.locationService);

    if (!this.locationService) {
      console.error('❌ locationService es undefined!');
      alert('ERROR: El servicio de ubicación no está disponible');
      return;
    }
    console.log('✅ Servicio disponible');

    // Prevenir clicks múltiples
    if (this.isLoading) {
      console.log('⚠️ Ya hay una operación en curso');
      return;
    }

    this.isLoading = true;
    console.log('2️⃣ Iniciando obtención de ubicación...');

    try {
      console.log('3️⃣ Verificando plugin Geolocation...');
      console.log('Capacitor.isPluginAvailable("Geolocation"):', Capacitor.isPluginAvailable('Geolocation'));

      if (!Capacitor.isPluginAvailable('Geolocation')) {
        throw new Error('Plugin Geolocation NO disponible');
      }
      console.log('✅ Plugin disponible');

      console.log('4️⃣ Verificando permisos...');
      const permissions = await Geolocation.checkPermissions();
      console.log('Permisos:', JSON.stringify(permissions));

      if (permissions.location !== 'granted') {
        console.log('4.1 Solicitando permisos...');
        const requested = await Geolocation.requestPermissions();
        console.log('Permisos solicitados:', JSON.stringify(requested));

        if (requested.location !== 'granted') {
          throw new Error('Permisos de ubicación denegados.\n\nPor favor, ve a:\nConfiguracion > Apps > ColGas > Permisos\ny activa la ubicación.');
        }
      }
      console.log('✅ Permisos concedidos');

      console.log('5️⃣ Obteniendo posición...');
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });

      console.log('✅✅✅ POSICIÓN OBTENIDA:');
      console.log('Lat:', position.coords.latitude);
      console.log('Lng:', position.coords.longitude);
      console.log('Accuracy:', position.coords.accuracy, 'm');

      this.currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      console.log('6️⃣ Guardando en servicio...');
      this.locationService.setStartLocation(this.currentLocation);
      console.log('✅ Guardado');

      // Mostrar toast de éxito
      const toast = await this.toastCtrl.create({
        message: '✅ Ubicación obtenida correctamente',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
      await toast.present();

      console.log('7️⃣ Mostrando alerta de éxito...');
      const alert = await this.alertCtrl.create({
        header: '✅ ¡Ubicación obtenida!',
        message: `Tu ubicación ha sido establecida correctamente.\n\n` +
                 `📍 Latitud: ${this.currentLocation.lat.toFixed(6)}\n` +
                 `📍 Longitud: ${this.currentLocation.lng.toFixed(6)}\n` +
                 `📏 Precisión: ${position.coords.accuracy.toFixed(0)}m`,
        buttons: ['Continuar']
      });
      await alert.present();
      console.log('✅ Alerta mostrada');

    } catch (error: any) {
      console.error('═══════════════════════════════════════');
      console.error('❌ ERROR CAPTURADO');
      console.error('Tipo:', typeof error);
      console.error('Mensaje:', error?.message);
      console.error('Code:', error?.code);
      console.error('Stack:', error?.stack);
      console.error('Error completo:', JSON.stringify(error, null, 2));
      console.error('═══════════════════════════════════════');

      let errorMessage = 'No se pudo obtener tu ubicación.';

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code === 1) {
        errorMessage = 'Permisos denegados.\n\nActiva la ubicación en:\nConfiguracion > Apps > ColGas > Permisos';
      } else if (error?.code === 2) {
        errorMessage = 'Ubicación no disponible.\n\nVerifica que el GPS esté activado.';
      } else if (error?.code === 3) {
        errorMessage = 'Tiempo agotado.\n\nIntenta salir al exterior o acercarte a una ventana.';
      }

      const alert = await this.alertCtrl.create({
        header: '❌ Error',
        message: errorMessage,
        buttons: [
          {
            text: 'Ver guía',
            handler: () => {
              this.showTroubleshootingAlert();
            }
          },
          {
            text: 'Reintentar',
            handler: () => {
              setTimeout(() => {
                this.useCurrentLocation();
              }, 300);
            }
          },
          {
            text: 'Cerrar',
            role: 'cancel'
          }
        ]
      });
      await alert.present();

    } finally {
      this.isLoading = false;
      console.log('🏁 useCurrentLocation - FIN');
      console.log('═══════════════════════════════════════\n');
    }
  }

  async showTroubleshootingAlert() {
    const alert = await this.alertCtrl.create({
      header: '🔧 Guía de solución',
      message:
        '✅ Pasos para solucionar:\n\n' +
        '1️⃣ Ve a Configuración del teléfono\n' +
        '2️⃣ Toca en "Apps" o "Aplicaciones"\n' +
        '3️⃣ Busca y toca "ColGas"\n' +
        '4️⃣ Toca en "Permisos"\n' +
        '5️⃣ Toca en "Ubicación"\n' +
        '6️⃣ Selecciona "Permitir todo el tiempo" o "Permitir solo mientras se usa"\n\n' +
        '7️⃣ Activa el GPS (desliza desde arriba y toca el ícono de ubicación)\n\n' +
        '8️⃣ Vuelve a la app e intenta nuevamente',
      buttons: ['Entendido']
    });
    await alert.present();
  }

  goToSelectDestination() {
    console.log('🗺️ goToSelectDestination');

    if (!this.currentLocation) {
      this.showAlert('Atención', 'Por favor, primero usa tu ubicación actual');
      return;
    }

    this.router.navigate(['/select-destination-page']);
  }

  volver() {
    this.router.navigate(['/historial']);
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
