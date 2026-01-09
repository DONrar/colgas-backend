import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonButtons,
  IonBackButton,
  AlertController,
  ActionSheetController, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle, closeCircle, arrowForward,
  bicycleOutline, logoWhatsapp, timeOutline, location, receipt, calendar, person, personCircle, call, map, cube, scale, cash, card, sync, print, informationCircle, ellipsisVertical, share } from 'ionicons/icons';
import { PedidoService } from '../../../core/services/pedido-service';
import { ToastService } from '../../../core/services/toast-service';
import { PedidoResponse, EstadoPedido } from '../../../core/models/pedido.model';
import { ActionSheetButton } from '@ionic/angular';

@Component({
  selector: 'app-admin-detalle-pedido',
  templateUrl: './admin-detalle-pedido.page.html',
  styleUrls: ['./admin-detalle-pedido.page.scss'],
  standalone: true,
  imports: [IonBadge, CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonButtons,
    IonBackButton]
})
export class AdminDetallePedidoPage implements OnInit {
  private pedidoService = inject(PedidoService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private actionSheetController = inject(ActionSheetController);

  pedido = signal<PedidoResponse | null>(null);
  cargando = signal(true);
  actualizando = signal(false);

  EstadoPedido = EstadoPedido;

  constructor() {
    addIcons({receipt,logoWhatsapp,calendar,arrowForward,person,personCircle,call,location,map,cube,scale,cash,card,sync,print,informationCircle,ellipsisVertical,share,checkmarkCircle,closeCircle,bicycleOutline,timeOutline});
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPedido(parseInt(id));
    }
  }

  cargarPedido(id: number) {
    this.cargando.set(true);
    this.pedidoService.obtenerPorId(id).subscribe({
      next: (pedido) => {
        this.pedido.set(pedido);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar pedido:', error);
        this.toastService.error('Error al cargar el pedido');
        this.cargando.set(false);
        this.router.navigate(['/admin/pedidos']);
      }
    });
  }

  async mostrarOpcionesEstado() {
    const pedidoActual = this.pedido();
    if (!pedidoActual) return;

    const estadosDisponibles = this.getEstadosDisponibles(pedidoActual.estado);

    const buttons: ActionSheetButton[] = estadosDisponibles.map(estado => ({
      text: this.getTextoEstado(estado),
      icon: this.getIconoEstado(estado),
      handler: () => {
        this.confirmarCambioEstado(estado);
      }
    }));


    buttons.push({
      text: 'Cancelar',
      icon: 'close',
      role: 'cancel',
      handler: () => { }
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'Cambiar estado del pedido',
      buttons: buttons
    });

    await actionSheet.present();
  }

  getEstadosDisponibles(estadoActual: EstadoPedido): EstadoPedido[] {
    switch (estadoActual) {
      case EstadoPedido.PENDIENTE:
        return [EstadoPedido.CONFIRMADO, EstadoPedido.CANCELADO];
      case EstadoPedido.CONFIRMADO:
        return [EstadoPedido.EN_CAMINO, EstadoPedido.CANCELADO];
      case EstadoPedido.EN_CAMINO:
        return [EstadoPedido.ENTREGADO];
      default:
        return [];
    }
  }

  async confirmarCambioEstado(nuevoEstado: EstadoPedido) {
    const alert = await this.alertController.create({
      header: 'Confirmar cambio',
      message: `¿Cambiar estado a "${this.getTextoEstado(nuevoEstado)}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.cambiarEstado(nuevoEstado);
          }
        }
      ]
    });

    await alert.present();
  }

  cambiarEstado(nuevoEstado: EstadoPedido) {
    const pedidoActual = this.pedido();
    if (!pedidoActual) return;

    this.actualizando.set(true);
    this.pedidoService.actualizarEstado(pedidoActual.id, nuevoEstado).subscribe({
      next: (pedidoActualizado) => {
        this.pedido.set(pedidoActualizado);
        this.toastService.success('Estado actualizado correctamente');
        this.actualizando.set(false);
      },
      error: (error) => {
        console.error('Error al actualizar estado:', error);
        this.toastService.error('Error al actualizar el estado');
        this.actualizando.set(false);
      }
    });
  }

  abrirWhatsApp() {
    const pedidoActual = this.pedido();
    if (!pedidoActual) return;

    const telefono = this.formatearTelefonoWhatsApp(pedidoActual.cliente.telefono);
    const mensaje = this.generarMensajeWhatsApp(pedidoActual);
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  private formatearTelefonoWhatsApp(telefono: string): string {
    // Eliminar espacios, guiones y paréntesis
    let telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');

    // Si no tiene código de país, agregar +57 (Colombia)
    if (!telefonoLimpio.startsWith('+')) {
      if (telefonoLimpio.startsWith('57')) {
        telefonoLimpio = '+' + telefonoLimpio;
      } else {
        telefonoLimpio = '+57' + telefonoLimpio;
      }
    }

    // Retornar sin el + para la URL de WhatsApp
    return telefonoLimpio.replace('+', '');
  }

  private generarMensajeWhatsApp(pedido: PedidoResponse): string {
    let mensaje = `¡Hola ${pedido.cliente.nombre}! 👋\n\n`;
    mensaje += `Le escribimos respecto a su pedido #${pedido.id}.\n\n`;

    switch (pedido.estado) {
      case EstadoPedido.PENDIENTE:
        mensaje += `Su pedido ha sido recibido y está pendiente de confirmación. En breve le confirmaremos la disponibilidad.\n`;
        break;
      case EstadoPedido.CONFIRMADO:
        mensaje += `¡Su pedido ha sido confirmado! ✅\n`;
        mensaje += `Estamos preparando su pedido para enviarlo a su dirección.\n`;
        break;
      case EstadoPedido.EN_CAMINO:
        mensaje += `🚚 ¡Su pedido está en camino!\n`;
        mensaje += `Nuestro repartidor se dirige a su ubicación. Por favor esté atento.\n`;
        break;
      case EstadoPedido.ENTREGADO:
        mensaje += `Su pedido ha sido entregado exitosamente. ¡Gracias por su compra! 🙏\n`;
        break;
      default:
        mensaje += `Estado actual: ${this.getTextoEstado(pedido.estado)}\n`;
    }

    // Agregar resumen de productos
    mensaje += `\n📦 *Resumen del pedido:*\n`;
    pedido.items.forEach(item => {
      mensaje += `• ${item.cantidad}x ${item.producto.nombre}`;
      if (item.producto.peso) {
        mensaje += ` (${item.producto.peso})`;
      }
      mensaje += `\n`;
    });

    // Dirección de entrega
    if (pedido.direccionEntrega) {
      mensaje += `\n📍 Dirección: ${pedido.direccionEntrega}\n`;
    }

    // Total y método de pago
    mensaje += `\n💰 Total: $${this.formatearPrecio(pedido.total)}\n`;
    mensaje += `💳 Método de pago: ${pedido.metodoPago}\n`;

    if (pedido.pagaCon && pedido.vueltas) {
      mensaje += `💵 Paga con: $${this.formatearPrecio(pedido.pagaCon)}\n`;
      mensaje += `🔄 Vueltas: $${this.formatearPrecio(pedido.vueltas)}\n`;
    }

    mensaje += `\n¿Tiene alguna pregunta o necesita información adicional?`;

    return mensaje;
  }

  abrirMapa() {
    const pedidoActual = this.pedido();
    if (pedidoActual?.latitud && pedidoActual?.longitud) {
      const url = `https://www.google.com/maps?q=${pedidoActual.latitud},${pedidoActual.longitud}`;
      window.open(url, '_blank');
    }
  }

  getColorEstado(estado: EstadoPedido): string {
    const colores = {
      [EstadoPedido.PENDIENTE]: 'warning',
      [EstadoPedido.CONFIRMADO]: 'primary',
      [EstadoPedido.EN_CAMINO]: 'tertiary',
      [EstadoPedido.ENTREGADO]: 'success',
      [EstadoPedido.CANCELADO]: 'danger'
    };
    return colores[estado];
  }

  getTextoEstado(estado: EstadoPedido): string {
    const textos = {
      [EstadoPedido.PENDIENTE]: 'Pendiente',
      [EstadoPedido.CONFIRMADO]: 'Confirmado',
      [EstadoPedido.EN_CAMINO]: 'En Camino',
      [EstadoPedido.ENTREGADO]: 'Entregado',
      [EstadoPedido.CANCELADO]: 'Cancelado'
    };
    return textos[estado];
  }

  getIconoEstado(estado: EstadoPedido): string {
    const iconos = {
      [EstadoPedido.PENDIENTE]: 'time-outline',
      [EstadoPedido.CONFIRMADO]: 'checkmark-circle',
      [EstadoPedido.EN_CAMINO]: 'bicycle-outline',
      [EstadoPedido.ENTREGADO]: 'checkmark-circle',
      [EstadoPedido.CANCELADO]: 'close-circle'
    };
    return iconos[estado];
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstadoBadgeClass(estado: EstadoPedido): string {
    switch (estado) {
      case EstadoPedido.PENDIENTE: return 'pending-badge';
      case EstadoPedido.CONFIRMADO: return 'confirmed-badge';
      case EstadoPedido.EN_CAMINO: return 'en-camino-badge';
      case EstadoPedido.ENTREGADO: return 'delivered-badge';
      case EstadoPedido.CANCELADO: return 'canceled-badge';
      default: return '';
    }
  }

  formatearPrecio(precio: number): string {
    return precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}
