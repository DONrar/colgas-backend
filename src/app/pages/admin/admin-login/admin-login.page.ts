import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, personOutline, logInOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/AuthService ';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.page.html',
  styleUrls: ['./admin-login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner
  ]
})
export class AdminLoginPage {
  username = '';
  password = '';
  errorMessage = signal('');
  isLoading = signal(false);
  private returnUrl = '/admin-dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ lockClosedOutline, personOutline, logInOutline });

    // Obtener URL de retorno si existe
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/admin-dashboard';
    });

    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onLogin() {
    this.errorMessage.set('');

    if (!this.username || !this.password) {
      this.errorMessage.set('Por favor ingresa usuario y contraseña');
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        if (response.success) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Error de conexión. Intente nuevamente.');
        console.error('Error de login:', error);
      }
    });
  }
}
