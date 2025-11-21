import { Injectable, inject } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCtrl = inject(LoadingController);
  private loading: HTMLIonLoadingElement | null = null;

  async mostrar(mensaje: string = 'Cargando...'): Promise<void> {
    this.loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner: 'crescent'
    });
    await this.loading.present();
  }

  async ocultar(): Promise<void> {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }
}
