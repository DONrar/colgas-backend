import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonButtons,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cube, receipt, statsChart, alertCircle,
  checkmarkCircle, timeOutline, bicycleOutline, add,
  refreshOutline, notificationsOutline, shieldCheckmarkOutline,
  serverOutline, barChart, checkmarkDoneOutline, trophy,
  navigate, alertCircleOutline, cubeOutline, pricetagsOutline,
  trendingUpOutline, flash, documentText, settings,
  arrowForward, list, checkmarkDone, addCircle } from 'ionicons/icons';
import { PedidoService } from '../../../core/services/pedido-service';
import { ProductoService } from '../../../core/services/producto-service';
import { EstadoPedido } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner,
    RouterLink,
    IonButtons
  ]
})
export class AdminDashboardPage implements OnInit {
  private pedidoService = inject(PedidoService);
  private productoService = inject(ProductoService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  // Señales principales
  cargando = signal(true);
  pedidosPendientes = signal(0);
  pedidosConfirmados = signal(0);
  pedidosEnCamino = signal(0);
  pedidosCompletados = signal(0);
  productosStockBajo = signal(0);
  totalProductos = signal(0);
  productosActivos = signal(0);

  // Señales del sistema
  ultimaActualizacion = signal('Hace unos momentos');
  tiempoRespuesta = signal(120);
  systemStatus = signal('Operativo');

  // Computadas
  alertas = computed(() => {
    return this.pedidosPendientes() + this.productosStockBajo();
  });

  valorTotalInventario = computed(() => {
    // Valor estimado del inventario
    return this.totalProductos() * 50000;
  });

  constructor() {
    addIcons({refreshOutline,statsChart,notificationsOutline,timeOutline,serverOutline,shieldCheckmarkOutline,alertCircle,arrowForward,alertCircleOutline,checkmarkCircle,bicycleOutline,barChart,checkmarkDone,navigate,checkmarkDoneOutline,trophy,list,cube,cubeOutline,pricetagsOutline,trendingUpOutline,flash,addCircle,receipt,documentText,settings,add});
  }

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando.set(true);
    const inicio = Date.now();

    try {
      // Cargar datos en paralelo
      await Promise.all([
        this.cargarPedidos(),
        this.cargarProductos()
      ]);

      this.tiempoRespuesta.set(Date.now() - inicio);
      this.ultimaActualizacion.set('Justo ahora');
      this.systemStatus.set('Operativo');

    } catch (error) {
      console.error('Error cargando datos:', error);
      this.showToast('Error al cargar datos del panel', 'warning');
      this.systemStatus.set('Con errores');
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarPedidos() {
    try {
      const [pendientes, confirmados, enCamino, completados] = await Promise.all([
        this.pedidoService.obtenerPorEstado(EstadoPedido.PENDIENTE).toPromise(),
        this.pedidoService.obtenerPorEstado(EstadoPedido.CONFIRMADO).toPromise(),
        this.pedidoService.obtenerPorEstado(EstadoPedido.EN_CAMINO).toPromise(),
        this.pedidoService.obtenerPorEstado(EstadoPedido.ENTREGADO).toPromise()
      ]);

      this.pedidosPendientes.set(pendientes?.length || 0);
      this.pedidosConfirmados.set(confirmados?.length || 0);
      this.pedidosEnCamino.set(enCamino?.length || 0);

      // Completados (últimos 30 días)
      if (completados) {
        const treintaDiasAtras = new Date();
        treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

        const completadosRecientes = completados.filter(pedido => {
          const fechaPedido = new Date(pedido.fechaPedido);
          return fechaPedido >= treintaDiasAtras;
        });

        this.pedidosCompletados.set(completadosRecientes.length);
      }

    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  }

  async cargarProductos() {
    try {
      const productos = await this.productoService.obtenerTodos().toPromise();

      if (productos) {
        this.totalProductos.set(productos.length);

        // Contar productos con stock bajo
        const stockBajo = productos.filter(p => (p.stock ?? 0) <= 10).length;
        this.productosStockBajo.set(stockBajo);

        // Contar productos activos
        const activos = productos.filter(p => p.activo !== false).length;
        this.productosActivos.set(activos);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  }

  async refresh() {
    await this.cargarDatos();
    this.showToast('Panel actualizado correctamente', 'success');
  }

  notificaciones() {
    this.router.navigate(['/admin/notificaciones']);
  }

  irAPedidos() {
    this.router.navigate(['/admin/pedidos']);
  }

  irAProductos() {
    this.router.navigate(['/admin/productos']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
