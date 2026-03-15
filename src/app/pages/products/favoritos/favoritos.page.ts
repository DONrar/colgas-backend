import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonButton, IonIcon, IonBadge, IonCard, IonRefresher, IonRefresherContent,
  IonModal, IonFooter, IonToast, IonAlert
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heart, heartOutline, heartDislike, cart, flame, trash, trashOutline,
  checkmarkCircle, closeCircle, warning, close, scale, construct, hardwareChip,
  arrowDown
} from 'ionicons/icons';
import { FavoritosService } from '../../../core/services/favoritos-service';
import { CarritoService } from '../../../core/services/carrito-service';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonBadge,
    IonCard,
    IonRefresher,
    IonRefresherContent,
    IonModal,
    IonFooter,
    IonToast,
    IonAlert
  ]
})
export class FavoritosPage {
  private favoritosService = inject(FavoritosService);
  private carritoService = inject(CarritoService);
  private router = inject(Router);

  // Signals del servicio
  favoritos = this.favoritosService.favoritos;
  cantidadCarrito = this.carritoService.cantidadTotal;

  // Computed para productos disponibles (con stock)
  productosDisponibles = computed(() =>
    this.favoritos().filter(p => p.stock === undefined || p.stock === null || p.stock > 0)
  );

  // Estado del modal
  mostrarModalDetalle = false;
  productoSeleccionado: Producto | null = null;

  // Estado del toast
  mostrarToast = false;
  mensajeToast = '';
  colorToast = '#3B9797';

  // Estado del alert
  mostrarAlertLimpiar = false;
  alertButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
      cssClass: 'alert-button-cancel'
    },
    {
      text: 'Eliminar todos',
      role: 'destructive',
      cssClass: 'alert-button-confirm',
      handler: () => {
        this.limpiarFavoritos();
      }
    }
  ];

  constructor() {
    addIcons({
      heart, heartOutline, heartDislike, cart, flame, trash, trashOutline,
      checkmarkCircle, closeCircle, warning, close, scale, construct, hardwareChip,
      arrowDown
    });
  }

  // Navegación
  irAProductos() {
    this.router.navigate(['/productos']);
  }

  irAlCarrito() {
    this.router.navigate(['/carrito']);
  }

  // Refrescar
  async refrescar(event: any) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.mostrarMensaje('Favoritos actualizados', '#3B9797');
    } finally {
      event.target.complete();
    }
  }

  // Acciones de favoritos
  eliminarFavorito(producto: Producto) {
    const resultado = this.favoritosService.toggleFavorito(producto);
    this.mostrarMensaje(resultado.mensaje, '#BF092F');
  }

  confirmarLimpiarFavoritos() {
    this.mostrarAlertLimpiar = true;
  }

  limpiarFavoritos() {
    this.favoritosService.limpiarFavoritos();
    this.mostrarMensaje('Todos los favoritos han sido eliminados', '#BF092F');
  }

  // Acciones de carrito
  agregarAlCarrito(producto: Producto) {
    if (producto.stock === 0) {
      this.mostrarMensaje('Este producto no tiene stock disponible', '#BF092F');
      return;
    }
    this.carritoService.agregarProducto(producto, 1);
    this.mostrarMensaje(`${producto.nombre} agregado al carrito`, '#3B9797');
  }

  agregarTodosAlCarrito() {
    const disponibles = this.productosDisponibles();
    let agregados = 0;

    disponibles.forEach(producto => {
      this.carritoService.agregarProducto(producto, 1);
      agregados++;
    });

    this.mostrarMensaje(`${agregados} productos agregados al carrito`, '#3B9797');
  }

  // Modal de detalle
  abrirModalDetalle(producto: Producto) {
    this.productoSeleccionado = producto;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle() {
    this.mostrarModalDetalle = false;
    this.productoSeleccionado = null;
  }

  agregarAlCarritoDesdeModal() {
    if (this.productoSeleccionado) {
      this.agregarAlCarrito(this.productoSeleccionado);
      this.cerrarModalDetalle();
    }
  }

  eliminarFavoritoDesdeModal() {
    if (this.productoSeleccionado) {
      this.eliminarFavorito(this.productoSeleccionado);
      this.cerrarModalDetalle();
    }
  }

  // Utilidades
  getTipoIcon(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'PIPETA': 'flame',
      'ACCESORIO': 'construct',
      'REPUESTO': 'hardware-chip'
    };
    return iconos[tipo] || 'cube';
  }

  getTipoNombre(tipo: string): string {
    const nombres: { [key: string]: string } = {
      'PIPETA': 'Pipeta',
      'ACCESORIO': 'Accesorio',
      'REPUESTO': 'Repuesto'
    };
    return nombres[tipo] || tipo;
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }

  private mostrarMensaje(mensaje: string, color: string = '#3B9797') {
    this.mensajeToast = mensaje;
    this.colorToast = color;
    this.mostrarToast = true;
  }
}
