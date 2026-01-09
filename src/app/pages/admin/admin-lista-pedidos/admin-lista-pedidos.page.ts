import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonMenuButton,
  IonToast,
  IonFab,
  IonFabButton, IonBackButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eye, refresh, checkmarkCircle, timeOutline, bicycleOutline, closeCircle,
  receipt, person, calendar, time, cube, location, card, apps,
  checkmarkCircleOutline, checkmarkDoneOutline, arrowBack,
  refreshOutline, notificationsOutline, serverOutline,
  shieldCheckmarkOutline, alertCircle, arrowForward,
  alertCircleOutline, barChart, navigate, trophy, list,
  pricetagsOutline, trendingUpOutline, flash, documentText,
  settings, addCircle, cash, speedometer, logoUsd, save,
  construct, hardwareChip, call, chevronForward, trash,
  create, arrowDown, createOutline, bicycle, checkmarkDone
} from 'ionicons/icons';
import { PedidoService } from '../../../core/services/pedido-service';
import { ToastService } from '../../../core/services/toast-service';
import { PedidoResponse, EstadoPedido } from '../../../core/models/pedido.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-lista-pedidos',
  templateUrl: './admin-lista-pedidos.page.html',
  styleUrls: ['./admin-lista-pedidos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent, 
    IonLabel,
    IonButton,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonBadge,
    IonButtons,
    IonMenuButton,
    IonToast,
    IonFab,
    IonFabButton
  ]
})
export class AdminListaPedidosPage implements OnInit {
  private pedidoService = inject(PedidoService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // 🔥 EXPONER EL ENUM PARA EL TEMPLATE
  EstadoPedido = EstadoPedido;

  pedidos = signal<PedidoResponse[]>([]);
  estadoSeleccionado = signal<EstadoPedido | 'TODOS'>('TODOS');
  cargando = signal(true);
  mostrarToast = signal(false);
  mensajeToast = signal('');
  toastColor = signal<'success' | 'warning' | 'danger'>('success');
  actualizandoEstado = signal<number | null>(null);

  // Computed para filtrar pedidos
  pedidosFiltrados = computed(() => {
    const estado = this.estadoSeleccionado();
    if (estado === 'TODOS') {
      return this.pedidos();
    }
    return this.pedidos().filter(p => p.estado === estado);
  });

  // Estadísticas computadas
  estadisticas = computed(() => {
    const todos = this.pedidos();
    return {
      pendientes: todos.filter(p => p.estado === EstadoPedido.PENDIENTE).length,
      confirmados: todos.filter(p => p.estado === EstadoPedido.CONFIRMADO).length,
      enCamino: todos.filter(p => p.estado === EstadoPedido.EN_CAMINO).length,
      entregados: todos.filter(p => p.estado === EstadoPedido.ENTREGADO).length
    };
  });

  constructor() {
    addIcons({
      eye, refresh, checkmarkCircle, timeOutline, bicycleOutline, closeCircle,
      receipt, person, calendar, time, cube, location, card, apps,
      checkmarkCircleOutline, checkmarkDoneOutline, arrowBack,
      refreshOutline, notificationsOutline, serverOutline,
      shieldCheckmarkOutline, alertCircle, arrowForward,
      alertCircleOutline, barChart, navigate, trophy, list,
      pricetagsOutline, trendingUpOutline, flash, documentText,
      settings, addCircle, cash, speedometer, logoUsd, save,
      construct, hardwareChip, call, chevronForward, trash,
      create, arrowDown, createOutline, bicycle, checkmarkDone
    });
  }

  ngOnInit() {
    this.cargarPedidos();
  }

  async cargarPedidos() {
    this.cargando.set(true);

    try {
      // Cargar todos los estados en paralelo
      const [pendientes, confirmados, enCamino, entregados] = await Promise.all([
        firstValueFrom(this.pedidoService.obtenerPorEstado(EstadoPedido.PENDIENTE)),
        firstValueFrom(this.pedidoService.obtenerPorEstado(EstadoPedido.CONFIRMADO)),
        firstValueFrom(this.pedidoService.obtenerPorEstado(EstadoPedido.EN_CAMINO)),
        firstValueFrom(this.pedidoService.obtenerPorEstado(EstadoPedido.ENTREGADO))
      ]);

      // Combinar todos los pedidos
      const todosPedidos = [...pendientes, ...confirmados, ...enCamino, ...entregados];

      // Ordenar por fecha más reciente
      todosPedidos.sort((a, b) =>
        new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime()
      );

      this.pedidos.set(todosPedidos);
      this.mostrarMensaje('Pedidos cargados correctamente', 'success');

    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      this.mostrarMensaje('Error al cargar los pedidos', 'danger');
    } finally {
      this.cargando.set(false);
    }
  }

  handleRefresh(event: any) {
    this.cargarPedidos().then(() => {
      if (event && event.target) {
        event.target.complete();
      }
    });
  }

  // Método para refrescar manualmente (sin parámetro event)
  handleRefreshManual() {
    this.cargarPedidos();
  }

  cambiarEstado(evento: any) {
    this.estadoSeleccionado.set(evento.detail.value);
  }

  // Método para cambiar estado manualmente (desde las estadísticas)
  cambiarEstadoManual(estado: EstadoPedido | 'TODOS'): void {
    this.estadoSeleccionado.set(estado);
  }

  // Método para cambiar estado rápido de un pedido
  async cambiarEstadoPedido(pedido: PedidoResponse, nuevoEstado: EstadoPedido) {
    this.actualizandoEstado.set(pedido.id || null);

    try {
      // Aquí implementarías la lógica para cambiar el estado
      // Por ejemplo:
      // await firstValueFrom(this.pedidoService.cambiarEstado(pedido.id, nuevoEstado));

      // Actualizar el estado localmente
      const pedidosActualizados = this.pedidos().map(p => {
        if (p.id === pedido.id) {
          return { ...p, estado: nuevoEstado };
        }
        return p;
      });

      this.pedidos.set(pedidosActualizados);

      this.mostrarMensaje(`Pedido #${pedido.id} cambiado a ${this.getTextoEstado(nuevoEstado)}`, 'success');

    } catch (error) {
      console.error('Error cambiando estado del pedido:', error);
      this.mostrarMensaje('Error al cambiar el estado del pedido', 'danger');
    } finally {
      this.actualizandoEstado.set(null);
    }
  }

  // Método para confirmar eliminación (opcional)
  async confirmarEliminar(pedido: PedidoResponse) {
    // Implementar lógica de confirmación y eliminación
    // Podrías usar un alert o modal de confirmación
    console.log('Confirmar eliminación del pedido:', pedido.id);
  }

  verDetalle(id: number) {
    this.router.navigate(['/admin/pedidos/detalle', id]);
  }

  // Métodos helper para el template
  getEstadoClass(estado: EstadoPedido): string {
    switch (estado) {
      case EstadoPedido.PENDIENTE: return 'pending';
      case EstadoPedido.CONFIRMADO: return 'confirmed';
      case EstadoPedido.EN_CAMINO: return 'en-camino';
      case EstadoPedido.ENTREGADO: return 'delivered';
      default: return '';
    }
  }

  volver() {
    this.router.navigate(['/admin-dashboard']);
  }

  getEstadoBadgeClass(estado: EstadoPedido): string {
    switch (estado) {
      case EstadoPedido.PENDIENTE: return 'pending-badge';
      case EstadoPedido.CONFIRMADO: return 'confirmed-badge';
      case EstadoPedido.EN_CAMINO: return 'en-camino-badge';
      case EstadoPedido.ENTREGADO: return 'delivered-badge';
      default: return '';
    }
  }

  getEstadoIcon(estado: EstadoPedido): string {
    switch (estado) {
      case EstadoPedido.PENDIENTE: return 'time-outline';
      case EstadoPedido.CONFIRMADO: return 'checkmark-circle-outline';
      case EstadoPedido.EN_CAMINO: return 'bicycle-outline';
      case EstadoPedido.ENTREGADO: return 'checkmark-done-outline';
      default: return 'help-circle-outline';
    }
  }

  getTextoEstado(estado: EstadoPedido): string {
    switch (estado) {
      case EstadoPedido.PENDIENTE: return 'Pendiente';
      case EstadoPedido.CONFIRMADO: return 'Confirmado';
      case EstadoPedido.EN_CAMINO: return 'En Camino';
      case EstadoPedido.ENTREGADO: return 'Entregado';
      default: return 'Desconocido';
    }
  }

  getMetodoPagoTexto(metodo: string): string {
    switch (metodo?.toUpperCase()) {
      case 'EFECTIVO': return 'Efectivo';
      case 'TARJETA': return 'Tarjeta';
      case 'TRANSFERENCIA': return 'Transferencia';
      default: return metodo || 'No especificado';
    }
  }

  formatearPrecio(precio: number): string {
    return precio.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearHora(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  totalPedidos(): number {
    const stats = this.estadisticas();
    return stats.pendientes + stats.confirmados + stats.enCamino + stats.entregados;
  }

  mostrarMensaje(mensaje: string, color: 'success' | 'warning' | 'danger') {
    this.mensajeToast.set(mensaje);
    this.toastColor.set(color);
    this.mostrarToast.set(true);

    setTimeout(() => {
      this.mostrarToast.set(false);
    }, 2000);
  }

  // Método para obtener el próximo estado posible
  getSiguienteEstado(estadoActual: EstadoPedido): EstadoPedido | null {
    switch (estadoActual) {
      case EstadoPedido.PENDIENTE:
        return EstadoPedido.CONFIRMADO;
      case EstadoPedido.CONFIRMADO:
        return EstadoPedido.EN_CAMINO;
      case EstadoPedido.EN_CAMINO:
        return EstadoPedido.ENTREGADO;
      default:
        return null;
    }
  }

  // Método para verificar si se puede cambiar el estado
  puedeCambiarEstado(estadoActual: EstadoPedido): boolean {
    return this.getSiguienteEstado(estadoActual) !== null;
  }
}
