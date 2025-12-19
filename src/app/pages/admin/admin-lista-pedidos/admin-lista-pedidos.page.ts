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
  IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, refresh, checkmarkCircle, timeOutline, bicycleOutline, closeCircle } from 'ionicons/icons';
import { PedidoService } from '../../../core/services/pedido-service';
import { ToastService } from '../../../core/services/toast-service';
import { PedidoResponse, EstadoPedido } from '../../../core/models/pedido.model'; 

@Component({
  selector: 'app-admin-lista-pedidos',
  templateUrl: './admin-lista-pedidos.page.html',
  styleUrls: ['./admin-lista-pedidos.page.scss'],
  standalone: true,
  imports: [ CommonModule,
    FormsModule,
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
    IonCol]
})
export class AdminListaPedidosPage implements OnInit {
private pedidoService = inject(PedidoService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  pedidos = signal<PedidoResponse[]>([]);
  estadoSeleccionado = signal<EstadoPedido | 'TODOS'>('TODOS');
  cargando = signal(true);

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
      total: todos.length,
      pendientes: todos.filter(p => p.estado === EstadoPedido.PENDIENTE).length,
      confirmados: todos.filter(p => p.estado === EstadoPedido.CONFIRMADO).length,
      enCamino: todos.filter(p => p.estado === EstadoPedido.EN_CAMINO).length,
      entregados: todos.filter(p => p.estado === EstadoPedido.ENTREGADO).length,
      cancelados: todos.filter(p => p.estado === EstadoPedido.CANCELADO).length
    };
  });

  constructor() {
    addIcons({ eye, refresh, checkmarkCircle, timeOutline, bicycleOutline, closeCircle });
  }

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando.set(true);

    // Cargar todos los estados y combinarlos
    const estados = [
      EstadoPedido.PENDIENTE,
      EstadoPedido.CONFIRMADO,
      EstadoPedido.EN_CAMINO,
      EstadoPedido.ENTREGADO,
      EstadoPedido.CANCELADO
    ];

    let todosPedidos: PedidoResponse[] = [];
    let completados = 0;

    estados.forEach(estado => {
      this.pedidoService.obtenerPorEstado(estado).subscribe({
        next: (pedidos) => {
          todosPedidos = [...todosPedidos, ...pedidos];
          completados++;

          if (completados === estados.length) {
            // Ordenar por fecha más reciente
            todosPedidos.sort((a, b) =>
              new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime()
            );
            this.pedidos.set(todosPedidos);
            this.cargando.set(false);
          }
        },
        error: (error) => {
          console.error('Error al cargar pedidos:', error);
          completados++;
          if (completados === estados.length) {
            this.cargando.set(false);
          }
        }
      });
    });
  }

  handleRefresh(event: any) {
    let todosPedidos: PedidoResponse[] = [];
    let completados = 0;

    const estados = [
      EstadoPedido.PENDIENTE,
      EstadoPedido.CONFIRMADO,
      EstadoPedido.EN_CAMINO,
      EstadoPedido.ENTREGADO,
      EstadoPedido.CANCELADO
    ];

    estados.forEach(estado => {
      this.pedidoService.obtenerPorEstado(estado).subscribe({
        next: (pedidos) => {
          todosPedidos = [...todosPedidos, ...pedidos];
          completados++;

          if (completados === estados.length) {
            todosPedidos.sort((a, b) =>
              new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime()
            );
            this.pedidos.set(todosPedidos);
            event.target.complete();
            this.toastService.success('Pedidos actualizados');
          }
        },
        error: () => {
          completados++;
          if (completados === estados.length) {
            event.target.complete();
          }
        }
      });
    });
  }

  cambiarEstado(evento: any) {
    this.estadoSeleccionado.set(evento.detail.value);
  }

  verDetalle(id: number) {
    this.router.navigate(['/admin/pedidos/detalle', id]);
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

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

}
