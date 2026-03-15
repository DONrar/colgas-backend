import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonApp, IonRouterOutlet, IonItem, IonLabel, IonIcon, IonMenuToggle, IonContent, IonList, IonToolbar, IonHeader, IonTitle, IonMenu, IonButtons, IonButton, IonBadge } from '@ionic/angular/standalone';
import { MenuController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import {
  carOutline, clipboardOutline, gridOutline, statsChartOutline,
  cubeOutline, settingsOutline, closeOutline, cashOutline,
  heart, cartOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { FavoritosService } from './/core/services/favoritos-service';
import { CarritoService } from './core/services/carrito-service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonButton, IonButtons, IonTitle, IonHeader, IonToolbar, IonList,
    IonContent, IonIcon, IonLabel, IonItem, IonApp, IonRouterOutlet,
    IonMenuToggle, IonMenu, RouterLink, IonBadge
  ],
})
export class AppComponent {
  private favoritosService = inject(FavoritosService);
  private carritoService = inject(CarritoService);

  // Signals públicos para el template
  cantidadFavoritos = this.favoritosService.cantidadFavoritos;
  cantidadCarrito = this.carritoService.cantidadTotal;

  constructor(private menuController: MenuController) {
    addIcons({
      gridOutline,
      statsChartOutline,
      clipboardOutline,
      carOutline,
      cubeOutline,
      settingsOutline,
      closeOutline,
      cashOutline,
      heart,
      cartOutline
    });
  }

  cerrarMenu() {
    this.menuController.close();
  }

  async ngOnInit() {
    if (Capacitor.getPlatform() === 'android') {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: '#132440' });
        await StatusBar.setStyle({ style: Style.Light });
      } catch {}
    }
  }
}
