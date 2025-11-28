import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonNote,
  IonIcon,
  IonFooter,
  IonRadioGroup,
  IonRadio,
  IonTextarea,
  IonCardSubtitle, IonToast } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  location, cash, card, send, person, checkmark, personCircle,
  personOutline, callOutline, homeOutline, checkmarkCircle,
  cashOutline, cardOutline, phonePortraitOutline, alertCircle, receipt, shieldCheckmark, time, headset } from 'ionicons/icons';
import { CarritoService } from '../../core/services/carrito-service';
import { PedidoService } from '../../core/services/pedido-service';
import { UbicacionService } from '../../core/services/ubicacion-service';
import { LoadingService } from '../../core/services/loading-service';
import { ToastService } from '../../core/services/toast-service';
import { StorageService } from '../../core/services/storage-service';
import { MetodoPago, PedidoRequest, ItemPedido } from '../../core/models/pedido.model';

interface DatosCliente {
  nombre: string;
  telefono: string;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [IonToast,
    IonCardSubtitle,
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonFooter,
    IonTextarea,
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonRadioGroup,
    IonRadio,
    IonNote,
    IonButton
  ]
})
export class CheckoutPage implements OnInit {
  private carritoService = inject(CarritoService);
  private pedidoService = inject(PedidoService);
  private ubicacionService = inject(UbicacionService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  items = this.carritoService.items;
  total = this.carritoService.total;

  datosCliente: DatosCliente = {
    nombre: '',
    telefono: ''
  };

  direccion = '';
  metodoPago: MetodoPago = MetodoPago.EFECTIVO;
  pagaCon: number | null = null;

  // Agregar las propiedades faltantes
  isLoading = false;
  mostrarToast = false;
  mensajeToast = '';

  ubicacionObtenida = signal(false);
  private latitud: number | null = null;
  private longitud: number | null = null;

  // Exponer el enum MetodoPago para usar en el template
  readonly MetodoPago = MetodoPago;

  constructor() {
    addIcons({card,person,location,checkmark,personCircle,personOutline,callOutline,homeOutline,checkmarkCircle,cashOutline,cardOutline,phonePortraitOutline,alertCircle,receipt,shieldCheckmark,time,headset,send,cash});
  }

  ngOnInit() {
    // Cargar datos guardados
    const datosGuardados = this.storageService.obtener<DatosCliente>('colgas_cliente');
    if (datosGuardados) {
      this.datosCliente = datosGuardados;
    }

    // Verificar si hay items en el carrito
    if (this.items().length === 0) {
      this.toastService.error('Tu carrito está vacío');
      this.router.navigate(['/tabs/productos']);
    }
  }

  // Agregar el método faltante para seleccionar método de pago
  seleccionarMetodoPago(metodo: MetodoPago) {
    this.metodoPago = metodo;
  }

  async obtenerUbicacion() {
    try {
      await this.loadingService.mostrar('Obteniendo ubicación...');
      const coords = await this.ubicacionService.obtenerUbicacionActual();
      this.latitud = coords.latitud;
      this.longitud = coords.longitud;
      this.ubicacionObtenida.set(true);
      await this.loadingService.ocultar();
      this.toastService.success('Ubicación obtenida correctamente');
    } catch (error) {
      await this.loadingService.ocultar();
      this.toastService.error('No se pudo obtener la ubicación');
      console.error('Error ubicación:', error);
    }
  }

  formularioValido(): boolean {
    const datosValidos = this.datosCliente.nombre.trim() !== '' &&
                         this.datosCliente.telefono.trim() !== '';

    const direccionValida = this.direccion.trim() !== '' || this.ubicacionObtenida();

    const pagoValido = this.metodoPago !== MetodoPago.EFECTIVO ||
                       (this.pagaCon !== null && this.pagaCon >= this.total());

    return datosValidos && direccionValida && pagoValido;
  }

  async confirmarPedido() {
    if (!this.formularioValido()) {
      this.toastService.error('Por favor completa todos los campos');
      return;
    }

    // Validar que hay items en el carrito
    if (this.items().length === 0) {
      this.toastService.error('El carrito está vacío');
      return;
    }

    // Filtrar y mapear items para asegurar que cumplen con ItemPedido
    const itemsParaPedido: ItemPedido[] = this.items()
      .filter(item => {
        // Filtrar solo items con productoId definido
        const tieneIdValido = item.producto.id !== undefined && item.producto.id !== null;
        if (!tieneIdValido) {
          console.warn('Producto sin ID omitido:', item.producto.nombre);
        }
        return tieneIdValido;
      })
      .map(item => {
        // Crear objeto ItemPedido con todas las propiedades requeridas
        const itemPedido: ItemPedido = {
          productoId: item.producto.id as number, // Type assertion seguro porque ya filtramos
          cantidad: item.cantidad,
          nombreProducto: item.producto.nombre, // Propiedad requerida según el error
          precioUnitario: item.producto.precio   // Propiedad requerida según el error
        };
        return itemPedido;
      });

    // Verificar que al menos hay un item válido
    if (itemsParaPedido.length === 0) {
      this.toastService.error('No hay productos válidos en el carrito. Todos los productos deben tener un ID válido.');
      return;
    }

    // Mostrar advertencia si se omitieron algunos productos
    const productosOmitidos = this.items().length - itemsParaPedido.length;
    if (productosOmitidos > 0) {
      this.toastService.warning(`${productosOmitidos} producto(s) sin ID válido fueron omitidos`);
    }

    this.isLoading = true;
    await this.loadingService.mostrar('Creando pedido...');

    const pedido: PedidoRequest = {
      nombreCliente: this.datosCliente.nombre,
      telefono: this.datosCliente.telefono,
      metodoPago: this.metodoPago,
      items: itemsParaPedido,
      direccionEntrega: this.direccion || undefined,
      latitud: this.latitud || undefined,
      longitud: this.longitud || undefined
    };

    if (this.metodoPago === MetodoPago.EFECTIVO && this.pagaCon) {
      pedido.pagaCon = this.pagaCon;
    }

    this.pedidoService.crearPedido(pedido).subscribe({
      next: async (response) => {
        this.isLoading = false;
        await this.loadingService.ocultar();

        // Guardar datos del cliente
        this.storageService.guardar('colgas_cliente', this.datosCliente);

        // Limpiar carrito usando el método correcto
        this.carritoService.limpiarCarrito();

        // Redirigir a confirmación
        this.router.navigate(['/pedido-confirmado', response.id]);
      },
      error: async (error) => {
        this.isLoading = false;
        await this.loadingService.ocultar();
        console.error('Error al crear pedido:', error);
        this.toastService.error('Error al crear el pedido. Intenta nuevamente.');
      }
    });
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }

  getCheckoutProgress(): number {
    let progress = 0;

    // Datos del cliente (25%)
    if (this.datosCliente.nombre && this.datosCliente.telefono) {
      progress += 25;
    }

    // Dirección (25%)
    if (this.direccion || this.ubicacionObtenida()) {
      progress += 25;
    }

    // Método de pago (25%)
    if (this.metodoPago) {
      progress += 25;
    }

    // Validación completa (25%)
    if (this.formularioValido()) {
      progress += 25;
    }

    return progress;
  }

  // Método para calcular vueltas (si es pago en efectivo)
  calcularVueltas(): number {
    if (this.metodoPago === MetodoPago.EFECTIVO && this.pagaCon && this.pagaCon > this.total()) {
      return this.pagaCon - this.total();
    }
    return 0;
  }

  // Método para obtener métodos de pago para el template
  getMetodosPago(): { value: MetodoPago; label: string; icon: string }[] {
    return [
      { value: MetodoPago.EFECTIVO, label: 'Efectivo', icon: 'cash' },
      { value: MetodoPago.TRANSFERENCIA, label: 'Transferencia', icon: 'card' },
      { value: MetodoPago.DAVIPLATA, label: 'DaviPlata', icon: 'phone-portrait' },
      { value: MetodoPago.NEQUI, label: 'Nequi', icon: 'phone-portrait' }
    ];
  }

  // Método para verificar si hay productos sin ID (para mostrar advertencia)
  tieneProductosSinId(): boolean {
    return this.items().some(item => item.producto.id === undefined || item.producto.id === null);
  }

  // Método para obtener la lista de productos sin ID
  obtenerProductosSinId(): string[] {
    return this.items()
      .filter(item => item.producto.id === undefined || item.producto.id === null)
      .map(item => item.producto.nombre);
  }
}
