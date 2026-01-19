import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonButton,
  IonIcon,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { AuthService } from '../..//../core/services/AuthService ';

@Component({
  selector: 'app-logout-button',
  template: `
    <ion-button
      fill="clear"
      (click)="confirmLogout()"
      color="danger"
    >
      <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
    </ion-button>
  `,
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon]
})
export class LogoutButtonComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ logOutOutline });
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          role: 'confirm',
          handler: () => {
            this.logout();
          }
        }
      ]
    });

    await alert.present();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }
}
