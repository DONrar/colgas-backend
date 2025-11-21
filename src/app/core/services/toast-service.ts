import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastCtrl = inject(ToastController);

  async mostrar(
    mensaje: string,
    color: 'success' | 'danger' | 'warning' | 'primary' = 'primary',
    duracion: number = 2000
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: duracion,
      color,
      position: 'bottom',
      buttons: [{
        text: 'OK',
        role: 'cancel'
      }]
    });
    await toast.present();
  }

  async success(mensaje: string): Promise<void> {
    await this.mostrar(mensaje, 'success');
  }

  async error(mensaje: string): Promise<void> {
    await this.mostrar(mensaje, 'danger', 3000);
  }

  async warning(mensaje: string): Promise<void> {
    await this.mostrar(mensaje, 'warning');
  }
}
