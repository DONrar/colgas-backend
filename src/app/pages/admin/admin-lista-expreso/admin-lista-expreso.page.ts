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
  IonButtons,
  IonMenuButton,
  IonToast,
  IonFab,
  IonFabButton,
  IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eye, refresh, checkmarkCircle, timeOutline, carOutline, closeCircle,
  navigate, person, calendar, time, location, card, apps,
  checkmarkCircleOutline, checkmarkDoneOutline, arrowBack,
  refreshOutline, map, logoWhatsapp, call, speedometer,
  chevronForward, create, arrowDown, bicycle, checkmarkDone,
  playCircle, checkmark, close, list, personCircle, flag, cash } from 'ionicons/icons';
import { ExpresoService } from '../../../core/services/expreso-service';
import { ToastService } from '../../../core/services/toast-service';
import { ExpresoResponse, EstadoExpreso } from '../../../core/models/expreso.model';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-admin-lista-expreso',
  templateUrl: './admin-lista-expreso.page.html',
  styleUrls: ['./admin-lista-expreso.page.scss'],
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
    IonButton,
    IonIcon, 
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonBadge,
    IonButtons,
    IonMenuButton,
    IonToast,
    IonFab,
    IonFabButton]
})
export class AdminListaExpresoPage implements OnInit {
 private expresoService = inject(ExpresoService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Exponer el enum para el template
  EstadoExpreso = EstadoExpreso;

  expresos = signal<ExpresoResponse[]>([]);
  estadoSeleccionado = signal<EstadoExpreso | 'TODOS'>('TODOS');
  cargando = signal(true);
  mostrarToast = signal(false);
  mensajeToast = signal('');
  toastColor = signal<'success' | 'warning' | 'danger'>('success');
  actualizandoEstado = signal<number | null>(null);

  // Computed para filtrar expresos
  expresosFiltrados = computed(() => {
    const estado = this.estadoSeleccionado();
    if (estado === 'TODOS') {
      return this.expresos();
    }
    return this.expresos().filter(e => e.estado === estado);
  });

  // Estadísticas computadas
  estadisticas = computed(() => {
    const todos = this.expresos();
    return {
      solicitados: todos.filter(e => e.estado === EstadoExpreso.SOLICITADO).length,
      asignados: todos.filter(e => e.estado === EstadoExpreso.ASIGNADO).length,
      enCurso: todos.filter(e => e.estado === EstadoExpreso.EN_CURSO).length,
      completados: todos.filter(e => e.estado === EstadoExpreso.COMPLETADO).length
    };
  });

  constructor() {
    addIcons({carOutline,refreshOutline,timeOutline,checkmarkCircleOutline,checkmarkDoneOutline,apps,eye,list,calendar,personCircle,call,logoWhatsapp,location,arrowDown,flag,speedometer,time,cash,checkmarkDone,map,chevronForward,refresh,checkmarkCircle,closeCircle,navigate,person,card,arrowBack,create,bicycle,playCircle,checkmark,close});
  }

  ngOnInit() {
    this.cargarExpresos();
  }

  // Método para obtener el título según el estado
getTituloEstado(): string {
  const estado = this.estadoSeleccionado();
  if (estado === 'TODOS') {
    return 'Todos los Expresos';
  }
  return `Expresos ${this.getTextoEstado(estado)}s`;
}
  async cargarExpresos() {
    this.cargando.set(true);

    try {
      // Cargar todos los estados en paralelo
      const [solicitados, asignados, enCurso, completados] = await Promise.all([
        firstValueFrom(this.expresoService.obtenerPorEstado(EstadoExpreso.SOLICITADO)),
        firstValueFrom(this.expresoService.obtenerPorEstado(EstadoExpreso.ASIGNADO)),
        firstValueFrom(this.expresoService.obtenerPorEstado(EstadoExpreso.EN_CURSO)),
        firstValueFrom(this.expresoService.obtenerPorEstado(EstadoExpreso.COMPLETADO))
      ]);

      // Combinar todos los expresos
      const todosExpresos = [...solicitados, ...asignados, ...enCurso, ...completados];

      // Ordenar por fecha más reciente
      todosExpresos.sort((a, b) =>
        new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()
      );

      this.expresos.set(todosExpresos);
      this.mostrarMensaje('Expresos cargados correctamente', 'success');

    } catch (error) {
      console.error('Error al cargar expresos:', error);
      this.mostrarMensaje('Error al cargar los expresos', 'danger');
    } finally {
      this.cargando.set(false);
    }
  }

  handleRefresh(event: any) {
    this.cargarExpresos().then(() => {
      if (event && event.target) {
        event.target.complete();
      }
    });
  }

  handleRefreshManual() {
    this.cargarExpresos();
  }

  cambiarEstado(evento: any) {
    this.estadoSeleccionado.set(evento.detail.value);
  }

  cambiarEstadoManual(estado: EstadoExpreso | 'TODOS'): void {
    this.estadoSeleccionado.set(estado);
  }

  async cambiarEstadoExpreso(expreso: ExpresoResponse, nuevoEstado: EstadoExpreso) {
    this.actualizandoEstado.set(expreso.id || null);

    try {
      await firstValueFrom(this.expresoService.actualizarEstado(expreso.id, nuevoEstado));

      // Actualizar el estado localmente
      const expresosActualizados = this.expresos().map(e => {
        if (e.id === expreso.id) {
          return { ...e, estado: nuevoEstado };
        }
        return e;
      });

      this.expresos.set(expresosActualizados);
      this.mostrarMensaje(`Expreso #${expreso.id} cambiado a ${this.getTextoEstado(nuevoEstado)}`, 'success');

    } catch (error) {
      console.error('Error cambiando estado del expreso:', error);
      this.mostrarMensaje('Error al cambiar el estado del expreso', 'danger');
    } finally {
      this.actualizandoEstado.set(null);
    }
  }

  verDetalle(id: number) {
    this.router.navigate(['/admin/expresos/detalle', id]);
  }

  volver() {
    this.router.navigate(['/admin-dashboard']);
  }

  // Métodos helper
  getEstadoClass(estado: EstadoExpreso): string {
    switch (estado) {
      case EstadoExpreso.SOLICITADO: return 'solicitado';
      case EstadoExpreso.ASIGNADO: return 'asignado';
      case EstadoExpreso.EN_CURSO: return 'en-curso';
      case EstadoExpreso.COMPLETADO: return 'completado';
      case EstadoExpreso.CANCELADO: return 'cancelado';
      default: return '';
    }
  }

  getEstadoBadgeClass(estado: EstadoExpreso): string {
    switch (estado) {
      case EstadoExpreso.SOLICITADO: return 'solicitado-badge';
      case EstadoExpreso.ASIGNADO: return 'asignado-badge';
      case EstadoExpreso.EN_CURSO: return 'en-curso-badge';
      case EstadoExpreso.COMPLETADO: return 'completado-badge';
      case EstadoExpreso.CANCELADO: return 'cancelado-badge';
      default: return '';
    }
  }

  getEstadoIcon(estado: EstadoExpreso): string {
    switch (estado) {
      case EstadoExpreso.SOLICITADO: return 'time-outline';
      case EstadoExpreso.ASIGNADO: return 'checkmark-circle-outline';
      case EstadoExpreso.EN_CURSO: return 'car-outline';
      case EstadoExpreso.COMPLETADO: return 'checkmark-done-outline';
      case EstadoExpreso.CANCELADO: return 'close-circle';
      default: return 'help-circle-outline';
    }
  }

  getTextoEstado(estado: EstadoExpreso): string {
    switch (estado) {
      case EstadoExpreso.SOLICITADO: return 'Solicitado';
      case EstadoExpreso.ASIGNADO: return 'Asignado';
      case EstadoExpreso.EN_CURSO: return 'En Curso';
      case EstadoExpreso.COMPLETADO: return 'Completado';
      case EstadoExpreso.CANCELADO: return 'Cancelado';
      default: return 'Desconocido';
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

  totalExpresos(): number {
    const stats = this.estadisticas();
    return stats.solicitados + stats.asignados + stats.enCurso + stats.completados;
  }

  mostrarMensaje(mensaje: string, color: 'success' | 'warning' | 'danger') {
    this.mensajeToast.set(mensaje);
    this.toastColor.set(color);
    this.mostrarToast.set(true);

    setTimeout(() => {
      this.mostrarToast.set(false);
    }, 2000);
  }

  getSiguienteEstado(estadoActual: EstadoExpreso): EstadoExpreso | null {
    switch (estadoActual) {
      case EstadoExpreso.SOLICITADO:
        return EstadoExpreso.ASIGNADO;
      case EstadoExpreso.ASIGNADO:
        return EstadoExpreso.EN_CURSO;
      case EstadoExpreso.EN_CURSO:
        return EstadoExpreso.COMPLETADO;
      default:
        return null;
    }
  }

  puedeCambiarEstado(estadoActual: EstadoExpreso): boolean {
    return this.getSiguienteEstado(estadoActual) !== null;
  }

  abrirWhatsApp(expreso: ExpresoResponse) {
    if (expreso.urlWhatsApp) {
      window.open(expreso.urlWhatsApp, '_blank');
    }
  }

  abrirMapa(expreso: ExpresoResponse) {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${expreso.latitudOrigen},${expreso.longitudOrigen}&destination=${expreso.latitudDestino},${expreso.longitudDestino}`;
    window.open(url, '_blank');
  }

}
