import { GeoLocationService } from './../../core/services/geo-location-service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonCardHeader, IonCardTitle, IonCardContent, IonCard, IonBadge, IonButtons } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  navigate, map, location, checkmarkCircle, lockClosed,
  informationCircleOutline, flagOutline, navigateOutline,
  checkmark, checkmarkDone, arrowBack
} from 'ionicons/icons';
@Component({
  selector: 'app-start-trip-page',
  templateUrl: './start-trip-page.page.html',
  styleUrls: ['./start-trip-page.page.scss'],
  standalone: true,
  imports: [IonButtons, IonBadge, IonCard, IonCardContent, IonCardTitle, IonCardHeader, IonIcon, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class StartTripPagePage  {
 currentLocation: any = null;

  constructor(
    private router: Router,
    private locationService: GeoLocationService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    addIcons({
      navigate, map, location, checkmarkCircle, lockClosed,
      informationCircleOutline, flagOutline, navigateOutline,
      checkmark, checkmarkDone, arrowBack
    });
  }

  ionViewWillEnter() {
    // Reiniciar el servicio cada vez que se entra a la página
    this.locationService.reset();
    this.currentLocation = null;
  }

  async useCurrentLocation() {
    const loading = await this.loadingCtrl.create({
      message: 'Obteniendo tu ubicación...',
      spinner: 'crescent'
    });

    await loading.present();

    try {
      this.currentLocation = await this.locationService.getCurrentLocation();
      this.locationService.setStartLocation(this.currentLocation);

      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Ubicación obtenida',
        message: 'Tu ubicación actual ha sido establecida como punto de inicio',
        buttons: ['OK']
      });
      await alert.present();
    } catch (error) {
      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo obtener tu ubicación. Verifica que los permisos estén habilitados.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  goToSelectDestination() {
    if (!this.currentLocation) {
      this.showAlert('Atención', 'Por favor, primero usa tu ubicación actual');
      return;
    }

    this.router.navigate(['/select-destination-page']);
  }

 volver() {
    this.router.navigate(['/historial']); // o la ruta que corresponda
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
