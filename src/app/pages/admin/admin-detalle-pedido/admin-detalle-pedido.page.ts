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
  IonChip,
  IonLabel,
  IonList,
  IonItem,
  IonSpinner,
  IonButtons,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  AlertController,
  ActionSheetController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle, closeCircle, arrowForward,
  bicycleOutline, logoWhatsapp, timeOutline, location
} from 'ionicons/icons';
import { PedidoService } from '../../../core/services/pedido-service';
import { ToastService } from '../../../core/services/toast-service';
import { PedidoResponse, EstadoPedido } from '../../../core/models/pedido.model';
import { ActionSheetButton } from '@ionic/angular';

@Component({
  selector: 'app-admin-detalle-pedido',
  templateUrl: './admin-detalle-pedido.page.html',
  styleUrls: ['./admin-detalle-pedido.page.scss'],
  standalone: true,
  imports: [CommonModule,
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
    IonChip,
    IonLabel,
    IonList,
    IonItem,
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
    addIcons({
      checkmarkCircle, closeCircle, arrowForward,
      bicycleOutline, logoWhatsapp, timeOutline, location
    });
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
    if (pedidoActual?.urlWhatsApp) {
      window.open(pedidoActual.urlWhatsApp, '_blank');
    }
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

}
