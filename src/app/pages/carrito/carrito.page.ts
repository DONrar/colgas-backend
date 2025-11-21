import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonNote,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonText,
  IonFooter,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trash,
  add,
  remove,
  cart,
  checkmark
} from 'ionicons/icons';
import { CarritoService } from '../../core/services/carrito-service';
import { ToastService } from '../../core/services/toast-service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  imports: [ CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem, 
    IonButton,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonNote,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonText,
    IonFooter,
    IonCard,
    IonCardContent]
})
export class CarritoPage {
 private carritoService = inject(CarritoService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  items = this.carritoService.items;
  cantidadTotal = this.carritoService.cantidadTotal;
  total = this.carritoService.total;

  constructor() {
    addIcons({ trash, add, remove, cart, checkmark });
  }

  aumentarCantidad(productoId: number) {
    const item = this.items().find(i => i.producto.id === productoId);
    if (item) {
      this.carritoService.actualizarCantidad(productoId, item.cantidad + 1);
    }
  }

  disminuirCantidad(productoId: number) {
    const item = this.items().find(i => i.producto.id === productoId);
    if (item && item.cantidad > 1) {
      this.carritoService.actualizarCantidad(productoId, item.cantidad - 1);
    } else if (item && item.cantidad === 1) {
      this.eliminar(productoId);
    }
  }

  eliminar(productoId: number) {
    this.carritoService.eliminarProducto(productoId);
    this.toastService.success('Producto eliminado del carrito');
  }

  procederAlCheckout() {
    this.router.navigate(['/checkout']);
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }
}
