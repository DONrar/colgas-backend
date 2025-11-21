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
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  logoWhatsapp,
  home,
  copyOutline
} from 'ionicons/icons';
import { PedidoService } from '../../core/services/pedido-service';
import { WhatsAppService } from '../../core/services/whatsapp-service';
import { ToastService } from '../../core/services/toast-service';
import { PedidoResponse } from '../../core/models/pedido.model';
import { Clipboard } from '@capacitor/clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-pedido-confirmado',
  templateUrl: './pedido-confirmado.page.html',
  styleUrls: ['./pedido-confirmado.page.scss'],
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
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonSpinner, FormsModule, CommonModule, ReactiveFormsModule]
})
export class PedidoConfirmadoPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pedidoService = inject(PedidoService);
  private whatsappService = inject(WhatsAppService);
  private toastService = inject(ToastService);

  pedido = signal<PedidoResponse | null>(null);
  cargando = signal(true);

  constructor() {
    addIcons({ checkmarkCircle, logoWhatsapp, home, copyOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPedido(+id);
    } else {
      this.router.navigate(['/tabs/productos']);
    }
  }

  cargarPedido(id: number) {
    this.pedidoService.obtenerPorId(id).subscribe({
      next: (pedido) => {
        this.pedido.set(pedido);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar pedido:', error);
        this.toastService.error('Error al cargar el pedido');
        this.cargando.set(false);
        this.router.navigate(['/tabs/productos']);
      }
    });
  }

  async enviarPorWhatsApp() {
    const pedidoData = this.pedido();
    if (pedidoData && pedidoData.urlWhatsApp) {
      await this.whatsappService.abrirWhatsApp(pedidoData.urlWhatsApp);
    }
  }

  async copiarMensaje() {
    const pedidoData = this.pedido();
    if (pedidoData && pedidoData.mensajeWhatsApp) {
      try {
        await Clipboard.write({
          string: pedidoData.mensajeWhatsApp
        });
        this.toastService.success('Mensaje copiado al portapapeles');
      } catch (error) {
        console.error('Error al copiar:', error);
        this.toastService.error('No se pudo copiar el mensaje');
      }
    }
  }

  obtenerNombreMetodoPago(metodo: string): string {
    const nombres: { [key: string]: string } = {
      'EFECTIVO': 'Efectivo',
      'TRANSFERENCIA': 'Transferencia Bancaria',
      'DAVIPLATA': 'Daviplata',
      'NEQUI': 'Nequi'
    };
    return nombres[metodo] || metodo;
  }

  formatearPrecio(precio?: number | null): string {
    if (precio == null) {       // null o undefined
      return '0';               // o lo que quieras mostrar
    }
    return precio.toLocaleString('es-CO');
  }


}
