import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
  IonCardContent,
  IonCardTitle,
  IonCardHeader,
  IonBadge,
  IonAlert,
  IonToast,
  IonCardSubtitle,
  IonChip,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trash,
  add,
  remove,
  cart,
  checkmark,
  cartOutline,
  removeCircle,
  storefront,
  trashOutline,
  cube,
  close,
  bookmark,
  shieldCheckmark,
  lockClosed,
  arrowForward,
  flask,
  construct,
  hardwareChip,
  scale,
  warning,
  eye,
  receipt,
  time,
  headset,
  informationCircle,
  chatbubble
} from 'ionicons/icons';
import { CarritoService } from '../../../core/services/carrito-service';
import { ToastService } from '../../../core/services/toast-service';
import { Producto } from '../../../core/models/producto.model';

interface CartItem {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    RouterLink,
    IonRefresher,
    IonChip,
    IonCardSubtitle,
    IonToast,
    IonAlert,
    IonBadge,
    IonCardHeader,
    IonCardTitle,
    CommonModule,
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
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonFooter,
    IonCard,
    IonCardContent,
    IonLabel
  ]
})
export class CarritoPage {
  private carritoService = inject(CarritoService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Usamos signals del servicio directamente
  items = this.carritoService.items;
  cantidadTotal = this.carritoService.cantidadTotal;
  total = this.carritoService.total;

  // Propiedades para el toast
  mostrarToast = false;
  mensajeToast = '';

  // Propiedades para el alert de limpiar carrito
  mostrarAlertLimpiar = false;
  alertButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
    },
    {
      text: 'Limpiar',
      role: 'confirm',
      handler: () => {
        this.limpiarCarrito();
      }
    }
  ];

  constructor() {
    addIcons({
      cart, cartOutline, removeCircle, storefront, flask, construct, hardwareChip,
      trashOutline, close, scale, remove, add, warning, trash, bookmark, eye,
      receipt, shieldCheckmark, time, headset, informationCircle, chatbubble,
      lockClosed, arrowForward, cube, checkmark
    });
  }

  // Métodos actualizados para manejar IDs opcionales
  aumentarCantidad(item: CartItem) {
    const identificador = item.producto.id || item.producto.nombre;
    this.carritoService.actualizarCantidad(identificador, item.cantidad + 1);
    this.mostrarMensaje('Cantidad aumentada');
  }

  disminuirCantidad(item: CartItem) {
    const identificador = item.producto.id || item.producto.nombre;

    if (item.cantidad > 1) {
      this.carritoService.actualizarCantidad(identificador, item.cantidad - 1);
      this.mostrarMensaje('Cantidad disminuida');
    } else {
      this.eliminarItem(item);
    }
  }

  eliminarItem(item: CartItem) {
    const identificador = item.producto.id || item.producto.nombre;
    this.carritoService.eliminarProducto(identificador);
    this.mostrarMensaje('Producto eliminado del carrito');
  }

  limpiarCarrito() {
    this.carritoService.limpiarCarrito();
    this.mostrarMensaje('Carrito limpiado');
    this.mostrarAlertLimpiar = false;
  }

  guardarParaMasTarde(item: CartItem) {
    this.mostrarMensaje(`"${item.producto.nombre}" guardado para después`);
    console.log('Producto guardado para más tarde:', item);
  }

  procederAlCheckout() {
    if (this.items().length === 0) {
      this.mostrarMensaje('El carrito está vacío', 'error');
      return;
    }

    // Verificar stock de todos los productos
    const productosSinStock = this.items().filter(item => !this.tieneStockSuficiente(item));
    if (productosSinStock.length > 0) {
      this.mostrarMensaje('Algunos productos no tienen stock suficiente', 'error');
      return;
    }

    this.router.navigate(['/checkout']);
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }

  // Método auxiliar para verificar si un producto tiene stock disponible
  tieneStockSuficiente(item: CartItem): boolean {
    // Si no hay información de stock, asumimos que hay stock suficiente
    if (item.producto.stock === undefined || item.producto.stock === null) {
      return true;
    }
    return item.producto.stock >= item.cantidad;
  }

  // Método para obtener el mensaje de stock
  obtenerMensajeStock(item: CartItem): string {
    if (item.producto.stock === undefined || item.producto.stock === null) {
      return 'Stock disponible';
    }

    if (item.producto.stock === 0) {
      return 'Agotado';
    } else if (item.producto.stock < item.cantidad) {
      return `Solo ${item.producto.stock} disponibles`;
    } else if (item.producto.stock <= 10) {
      return `Últimas ${item.producto.stock} unidades`;
    } else {
      return 'Stock disponible';
    }
  }

  // Método para refrescar el carrito
  refrescarCarrito(event: any) {
    setTimeout(() => {
      // Simular recarga de datos
      event.target.complete();
      this.mostrarMensaje('Carrito actualizado');
    }, 1000);
  }

  navegarATipo(tipo: string) {
    this.router.navigate(['/tabs/productos'], {
      queryParams: { tipo: tipo }
    });
  }

  calcularProgreso(): number {
    return 33; // Primer paso del checkout
  }

  verDetalleProducto(producto: Producto) {
    // En una app real, navegarías a la página de detalle del producto
    this.mostrarMensaje(`Vista previa de ${producto.nombre}`);
    console.log('Ver detalle del producto:', producto);

    // Ejemplo de navegación (descomenta si tienes la ruta):
    // this.router.navigate(['/productos', producto.id]);
  }

  getTipoIcon(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'PIPETA': 'flask',
      'ACCESORIO': 'construct',
      'REPUESTO': 'hardware-chip',
      'TODOS': 'apps'
    };
    return iconos[tipo] || 'cube';
  }

  getTipoNombre(tipo: string): string {
    const nombres: { [key: string]: string } = {
      'PIPETA': 'Pipeta',
      'ACCESORIO': 'Accesorio',
      'REPUESTO': 'Repuesto',
      'TODOS': 'Todos'
    };
    return nombres[tipo] || tipo;
  }

  contactarSoporte() {
    this.mostrarMensaje('Redirigiendo a soporte...');
    console.log('Contactar soporte');
    window.open('https://wa.me/+573212891040?text=Hola, necesito ayuda con mi pedido', '_blank');
  }

  mostrarConfirmacionLimpiar() {
    this.mostrarAlertLimpiar = true;
  }

  puedeProcederCheckout(): boolean {
    return this.items().length > 0 &&
           this.items().every(item => this.tieneStockSuficiente(item));
  }

  // Método para mostrar mensajes con toast
  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'warning' = 'success') {
    this.mensajeToast = mensaje;
    this.mostrarToast = true;

    // También mostrar en consola para debugging
    console.log(`Toast [${tipo}]:`, mensaje);
  }

  // Método para obtener productos sin stock suficiente
  obtenerProductosSinStockSuficiente(): CartItem[] {
    return this.items().filter(item => !this.tieneStockSuficiente(item));
  }

  // Método para verificar si hay productos sin stock
  tieneProductosSinStock(): boolean {
    return this.obtenerProductosSinStockSuficiente().length > 0;
  }

  // Método para obtener el total de productos sin stock
  cantidadProductosSinStock(): number {
    return this.obtenerProductosSinStockSuficiente().length;
  }
}
