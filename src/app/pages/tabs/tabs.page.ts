import { Component, inject, computed } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cart,
  car,
  time,
  call,
  flame
} from 'ionicons/icons';
import { CarritoService } from '../../core/services/carrito-service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonBadge]
})
export class TabsPage{

  private carritoService = inject(CarritoService);

  cantidadCarrito = this.carritoService.cantidadTotal;

  constructor() {
    addIcons({ cart, car, time, call, flame });
  }
}
