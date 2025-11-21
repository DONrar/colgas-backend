import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSegment,
  IonSegmentButton, IonLabel, IonList, IonItem, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonButton,
  IonIcon, IonNote, IonSpinner, IonText, IonInput, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cart, car, search } from 'ionicons/icons';
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

  tipoSeleccionado = 'pedidos';
  telefono = '';
  cargando = signal(false);
  pedidos = signal<PedidoResponse[]>([]);
  expresos = signal<ExpresoResponse[]>([]);

  constructor() {
    addIcons({ cart, car, search });
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

  getColorEstado(estado: string): string {
    const colores: any = {
      'PENDIENTE': 'warning', 'SOLICITADO': 'warning',
      'CONFIRMADO': 'primary', 'ASIGNADO': 'primary',
      'EN_CAMINO': 'secondary', 'EN_CURSO': 'secondary',
      'ENTREGADO': 'success', 'COMPLETADO': 'success',
      'CANCELADO': 'danger'
    };
    return colores[estado] || 'medium';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO');
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }
}
