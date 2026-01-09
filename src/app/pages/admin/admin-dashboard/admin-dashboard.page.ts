import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonBadge, IonGrid, IonRow, IonCol, IonSpinner, IonButtons, ToastController, IonToast, IonRange, IonChip, IonLabel, IonFabButton, IonFab, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cube, receipt, statsChart, alertCircle,
  checkmarkCircle, timeOutline, bicycleOutline, add,
  refreshOutline, notificationsOutline, shieldCheckmarkOutline,
  serverOutline, barChart, checkmarkDoneOutline, trophy,
  navigate, alertCircleOutline, cubeOutline, pricetagsOutline,
  trendingUpOutline, flash, documentText, settings,
  arrowForward, list, checkmarkDone, addCircle, cash,
  speedometer, logoUsd, save, card, refresh,
  car} from 'ionicons/icons';
import { PedidoService } from '../../../core/services/pedido-service';
import { ProductoService } from '../../../core/services/producto-service';
import { ConfiguracionService } from '../../../core/services/configuracion-service';
import { EstadoPedido } from '../../../core/models/pedido.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,
  imports: [ 
    CommonModule,
    FormsModule,
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
    IonSpinner,
    RouterLink,
    IonButtons,  IonMenuButton]
})
export class AdminDashboardPage implements OnInit {
  private pedidoService = inject(PedidoService);
  private productoService = inject(ProductoService);
  private configuracionService = inject(ConfiguracionService);
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
  precioPorKm = 1500;
  guardandoPrecio = signal(false);

  // Señales del sistema
  ultimaActualizacion = signal('Hace unos momentos');
  tiempoRespuesta = signal(120);
  systemStatus = signal('Operativo');
  mostrarToast = signal(false);
  mensajeToast = signal('');
  toastColor = signal<'success' | 'warning' | 'danger'>('success');

  // Computadas
  alertas = computed(() => {
    return this.pedidosPendientes() + this.productosStockBajo();
  });

  valorTotalInventario = computed(() => {
    return this.totalProductos() * 50000;
  });

  constructor() {
    addIcons({refreshOutline,statsChart,notificationsOutline,timeOutline,serverOutline,shieldCheckmarkOutline,alertCircle,arrowForward,alertCircleOutline,checkmarkCircle,barChart,checkmarkDone,navigate,checkmarkDoneOutline,trophy,list,cube,cubeOutline,pricetagsOutline,trendingUpOutline,flash,addCircle,receipt,documentText,settings,cash,speedometer,logoUsd,save,card,refresh,add, car, bicycleOutline});
  }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando.set(true);
    const inicio = Date.now();

    try {
      // Cargar datos en paralelo
      await Promise.all([
        this.cargarPedidos(),
        this.cargarProductos(),
        this.cargarPrecioPorKm()
      ]);

      this.tiempoRespuesta.set(Date.now() - inicio);
      this.ultimaActualizacion.set('Justo ahora');
      this.systemStatus.set('Operativo');

    } catch (error) {
      console.error('Error cargando datos:', error);
      this.mostrarMensaje('Error al cargar datos del panel', 'warning');
      this.systemStatus.set('Con errores');
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarPedidos() {
    try {
      const [pendientes, confirmados, enCamino, completados] = await Promise.all([
        firstValueFrom(this.pedidoService.obtenerPorEstado(EstadoPedido.PENDIENTE)),
        firstValueFrom(this.pedidoService.obtenerPorEstado(EstadoPedido.CONFIRMADO)),
        firstValueFrom(this.pedidoService.obtenerPorEstado(EstadoPedido.EN_CAMINO)),
        firstValueFrom(this.pedidoService.obtenerPorEstado(EstadoPedido.ENTREGADO))
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
      const productos = await firstValueFrom(this.productoService.obtenerTodos());

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

  async cargarPrecioPorKm() {
    try {
      const precio = await firstValueFrom(this.configuracionService.getPrecioPorKm());
      this.precioPorKm = precio;
    } catch (error) {
      console.error('Error cargando precio por km:', error);
      this.precioPorKm = 1500; // Valor por defecto
    }
  }

  async guardarPrecioPorKm() {
    if (this.precioPorKm <= 0) {
      this.mostrarMensaje('El precio por km debe ser mayor a 0', 'warning');
      return;
    }

    this.guardandoPrecio.set(true);

    try {
      const config = {
        clave: 'precio_por_km',
        valor: this.precioPorKm.toString(),
        descripcion: 'Precio por kilómetro para cálculos de viajes'
      };

      await firstValueFrom(this.configuracionService.guardarConfiguracion(config));
      this.mostrarMensaje('Precio por km guardado correctamente', 'success');
      this.actualizarEstado();

    } catch (error) {
      console.error('Error guardando precio por km:', error);
      this.mostrarMensaje('Error al guardar el precio por km', 'danger');
    } finally {
      this.guardandoPrecio.set(false);
    }
  }

  restablecerPrecioPorKm() {
    this.precioPorKm = 1500;
    this.mostrarMensaje('Precio restablecido al valor por defecto', 'success');
  }

  onPrecioPorKmChange(event: any) {
    const value = event.detail?.value || this.precioPorKm;
    if (value < 100) {
      this.precioPorKm = 100;
    }
  }

  async refresh() {
    await this.cargarDatos();
    this.mostrarMensaje('Panel actualizado correctamente', 'success');
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

  formatearPrecio(valor: number): string {
    return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  mostrarMensaje(mensaje: string, color: 'success' | 'warning' | 'danger') {
    this.mensajeToast.set(mensaje);
    this.toastColor.set(color);
    this.mostrarToast.set(true);

    setTimeout(() => {
      this.cerrarToast();
    }, 2000);
  }

  cerrarToast() {
    this.mostrarToast.set(false);
  }

  actualizarEstado() {
    this.ultimaActualizacion.set('Justo ahora');
  }
}
