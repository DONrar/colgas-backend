import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSegment,
  IonSegmentButton, IonLabel, IonList, IonItem, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonButton,
  IonIcon, IonNote, IonSpinner, IonText, IonInput, IonBadge, NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cart, car, search, timeOutline, searchOutline, cartOutline, cash, card, chevronForward, carOutline, navigate } from 'ionicons/icons';
import { PedidoService } from '../../core/services/pedido-service';
import { ExpresoService } from '../../core/services/expreso-service';
import { ToastService } from '../../core/services/toast-service';
import { StorageService } from '../../core/services/storage-service';
import { PedidoResponse } from '../../core/models/pedido.model';
import { ExpresoResponse } from '../../core/models/expreso.model';


@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonSegment, IonSegmentButton, IonLabel, IonItem, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon,
    IonSpinner, IonText, IonInput, IonBadge]
})
export class HistorialPage implements OnInit {
  private pedidoService = inject(PedidoService);
  private expresoService = inject(ExpresoService);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);
  private navCtrl = inject(NavController);

  tipoSeleccionado = 'pedidos';
  telefono = '';
  cargando = signal(false);
  pedidos = signal<PedidoResponse[]>([]);
  expresos = signal<ExpresoResponse[]>([]);

  constructor() {
    addIcons({ timeOutline, cart, car, searchOutline, search, cartOutline, cash, card, chevronForward, carOutline, navigate });
  }

  ngOnInit() {
    const cliente = this.storageService.obtener<any>('colgas_cliente');
    if (cliente?.telefono) {
      this.telefono = cliente.telefono;
      this.buscar();
    }
  }

  cambiarTipo() {
    if (this.telefono) this.buscar();
  }

  buscar() {
    if (!this.telefono.trim()) {
      this.toastService.warning('Ingresa un teléfono');
      return;
    }

    this.cargando.set(true);
    if (this.tipoSeleccionado === 'pedidos') {
      this.pedidoService.obtenerHistorial(this.telefono).subscribe({
        next: (data) => { this.pedidos.set(data); this.cargando.set(false); },
        error: () => { this.toastService.error('Error'); this.cargando.set(false); }
      });
    } else {
      this.expresoService.obtenerHistorial(this.telefono).subscribe({
        next: (data) => { this.expresos.set(data); this.cargando.set(false); },
        error: () => { this.toastService.error('Error'); this.cargando.set(false); }
      });
    }
  }

  // Navegación a detalles
  verDetallePedido(pedido: PedidoResponse) {
    this.navCtrl.navigateForward(['/pedido-detalle', pedido.id]);
  }

  verDetalleExpreso(expreso: ExpresoResponse) {
    this.navCtrl.navigateForward(['/expreso-detalle', expreso.id]);
  }

  getBadgeClass(estado: string): string {
    const estadoMap: { [key: string]: string } = {
      'COMPLETADO': 'badge-success',
      'ENTREGADO': 'badge-success',
      'EN_CURSO': 'badge-primary',
      'EN_CAMINO': 'badge-primary',
      'ASIGNADO': 'badge-info',
      'CONFIRMADO': 'badge-info',
      'SOLICITADO': 'badge-warning',
      'PENDIENTE': 'badge-warning',
      'CANCELADO': 'badge-warning'
    };
    return estadoMap[estado] || 'badge-info';
  }

  getEstadoText(estado: string): string {
    const estadoText: { [key: string]: string } = {
      'COMPLETADO': 'Completado',
      'ENTREGADO': 'Entregado',
      'EN_CURSO': 'En curso',
      'EN_CAMINO': 'En camino',
      'ASIGNADO': 'Asignado',
      'CONFIRMADO': 'Confirmado',
      'SOLICITADO': 'Solicitado',
      'PENDIENTE': 'Pendiente',
      'CANCELADO': 'Cancelado'
    };
    return estadoText[estado] || estado;
  }

  formatearMoneda(valor: number): string {
    return `$${valor.toLocaleString('es-CO')}`;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
