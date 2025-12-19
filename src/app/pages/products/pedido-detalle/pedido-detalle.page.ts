import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonItem,
  IonLabel, IonIcon, IonButton, IonBadge, IonList,
  IonText, IonChip, IonGrid, IonRow, IonCol, IonSpinner, IonButtons } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBack, cash, card, location, time,
  checkmarkCircle, closeCircle, car, person, receiptOutline, calendarOutline, timeOutline, personOutline, personCircleOutline, callOutline, locationOutline, cartOutline, cubeOutline, cardOutline, logoWhatsapp, documentTextOutline,
  phonePortrait} from 'ionicons/icons';
import { PedidoService } from '../../../core/services/pedido-service';
import { PedidoResponse, EstadoPedido, MetodoPago } from '../../../core/models/pedido.model';
import { ToastService } from '../../../core/services/toast-service';
@Component({
  selector: 'app-pedido-detalle',
  templateUrl: './pedido-detalle.page.html',
  styleUrls: ['./pedido-detalle.page.scss'],
  standalone: true,
  imports: [IonButtons,  IonBadge, IonSpinner, IonList, IonItem, IonLabel, IonCardTitle, IonCard, IonCardHeader, IonCardContent, IonIcon, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PedidoDetallePage implements OnInit {
 private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pedidoService = inject(PedidoService);
  private toastService = inject(ToastService);

  pedido: PedidoResponse | null = null;
  cargando = true;
  pedidoId!: number;

  constructor() {
    addIcons({arrowBack,receiptOutline,calendarOutline,timeOutline,personOutline,personCircleOutline,callOutline,locationOutline,cartOutline,cubeOutline,cardOutline,logoWhatsapp,documentTextOutline,cash,card,location,time,checkmarkCircle,closeCircle,car,person, phonePortrait});
  }

  ngOnInit() {
    this.pedidoId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarPedido();
  }

  cargarPedido() {
    this.cargando = true;
    this.pedidoService.obtenerPorId(this.pedidoId).subscribe({
      next: (pedido) => {
        this.pedido = pedido;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando pedido:', error);
        this.toastService.error('Error al cargar el pedido');
        this.cargando = false;
      }
    });
  }

  getEstadoColor(estado: EstadoPedido): string {
    const colores = {
      [EstadoPedido.ENTREGADO]: 'success',
      [EstadoPedido.EN_CAMINO]: 'primary',
      [EstadoPedido.CONFIRMADO]: 'secondary',
      [EstadoPedido.PENDIENTE]: 'warning',
      [EstadoPedido.CANCELADO]: 'danger'
    };
    return colores[estado] || 'medium';
  }

  getEstadoTexto(estado: EstadoPedido): string {
    const textos = {
      [EstadoPedido.ENTREGADO]: 'Entregado',
      [EstadoPedido.EN_CAMINO]: 'En camino',
      [EstadoPedido.CONFIRMADO]: 'Confirmado',
      [EstadoPedido.PENDIENTE]: 'Pendiente',
      [EstadoPedido.CANCELADO]: 'Cancelado'
    };
    return textos[estado] || estado;
  }

  getMetodoPagoTexto(metodo: MetodoPago): string {
    const textos = {
      [MetodoPago.EFECTIVO]: 'Efectivo',
      [MetodoPago.TRANSFERENCIA]: 'Transferencia',
      [MetodoPago.DAVIPLATA]: 'DaviPlata',
      [MetodoPago.NEQUI]: 'Nequi'
    };
    return textos[metodo] || metodo;
  }

  formatearMoneda(valor: number): string {
    return `$${valor.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  volver() {
    this.router.navigate(['/historial']);
  }

  abrirWhatsApp() {
    if (this.pedido?.urlWhatsApp) {
      window.open(this.pedido.urlWhatsApp, '_blank');
    }
  }

  // Métodos adicionales para el componente TypeScript
getBadgeClass(estado: string): string {
  const estadoMap: { [key: string]: string } = {
    'ENTREGADO': 'badge-success',
    'EN_CAMINO': 'badge-primary',
    'CONFIRMADO': 'badge-info',
    'PENDIENTE': 'badge-warning',
    'CANCELADO': 'badge-warning'
  };
  return estadoMap[estado] || 'badge-info';
}

getMetodoPagoClass(metodo: string): string {
  const metodoMap: { [key: string]: string } = {
    'EFECTIVO': 'success',
    'TRANSFERENCIA': 'primary',
    'DAVIPLATA': 'warning',
    'NEQUI': 'info'
  };
  return metodoMap[metodo] || 'primary';
}

getMetodoPagoIcon(metodo: string): string {
  const iconMap: { [key: string]: string } = {
    'EFECTIVO': 'cash',
    'TRANSFERENCIA': 'card',
    'DAVIPLATA': 'phone-portrait',
    'NEQUI': 'phone-portrait'
  };
  return iconMap[metodo] || 'card';
}

formatearHora(fecha: string): string {
  return new Date(fecha).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

}
