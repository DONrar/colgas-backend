import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  IonSpinner,
  IonButtons,
  ModalController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  logoWhatsapp,
  copyOutline,
  arrowBack,
  shareOutline,
  timeOutline,
  cashOutline,
  documentText,
  personCircle,
  call,
  location,
  card,
  swapHorizontal,
  cart,
  arrowForward,
  eyeOutline,
  informationCircle,
  addCircle,
  list,
  callOutline,
  receiptOutline,
  home
} from 'ionicons/icons';
import { PedidoService } from '../../../core/services/pedido-service';
import { WhatsAppService } from '../../../core/services/whatsapp-service';
import { ToastService } from '../../../core/services/toast-service';
import { PedidoResponse, MetodoPago, EstadoPedido, ItemPedidoResponse } from '../../../core/models/pedido.model';
import { Clipboard } from '@capacitor/clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-pedido-confirmado',
  templateUrl: './pedido-confirmado.page.html',
  styleUrls: ['./pedido-confirmado.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButtons,
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
    IonLabel,
    IonNote,
    IonSpinner,
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ]
})
export class PedidoConfirmadoPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pedidoService = inject(PedidoService);
  private whatsappService = inject(WhatsAppService);
  private toastService = inject(ToastService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  // Señales
  pedido = signal<PedidoResponse | null>(null);
  cargando = signal(true);

  // Propiedades computadas
  subtotal = computed(() => {
    const pedidoData = this.pedido();
    if (!pedidoData) return 0;
    return pedidoData.items.reduce((total, item) => total + item.subtotal, 0);
  });

  costoEnvio = computed(() => {
    const pedidoData = this.pedido();
    // Si no hay costo de envío en el modelo, calcular un 5% del subtotal
    return pedidoData?.direccionEntrega ? this.subtotal() * 0.05 : 0;
  });

  descuento = computed(() => {
    const pedidoData = this.pedido();
    // Si no hay descuento en el modelo, retornar 0
    return 0;
  });

  totalConExtras = computed(() => {
    return this.subtotal() + this.costoEnvio() - this.descuento();
  });

  constructor() {
    addIcons({arrowBack,checkmarkCircle,shareOutline,timeOutline,cashOutline,documentText,personCircle,call,location,card,swapHorizontal,cart,arrowForward,logoWhatsapp,copyOutline,eyeOutline,informationCircle,addCircle,list,callOutline,receiptOutline,home});
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

  // Navegación
  volver() {
    this.router.navigate(['/tabs/productos']);
  }

  async compartir() {
    const pedidoData = this.pedido();
    if (!pedidoData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pedido #${pedidoData.id}`,
          text: `Mi pedido #${pedidoData.id} ha sido confirmado. Total: $${this.formatearPrecio(pedidoData.total)}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    } else {
      this.copiarMensaje();
    }
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

  async verResumen() {
    const pedidoData = this.pedido();
    if (!pedidoData) return;

    const alert = await this.alertCtrl.create({
      header: 'Resumen del Pedido',
      message: this.generarResumenTexto(),
      buttons: ['Cerrar'],
      cssClass: 'resumen-alert'
    });

    await alert.present();
  }

  private generarResumenTexto(): string {
    const pedidoData = this.pedido();
    if (!pedidoData) return '';

    let resumen = `
      <strong>Pedido #${pedidoData.id}</strong><br><br>
      <strong>Cliente:</strong> ${pedidoData.cliente.nombre}<br>
      <strong>Teléfono:</strong> ${pedidoData.cliente.telefono}<br>
      <strong>Método de pago:</strong> ${this.obtenerNombreMetodoPago(pedidoData.metodoPago)}<br>
      <strong>Total:</strong> $${this.formatearPrecio(pedidoData.total)}<br><br>
      <strong>Productos:</strong><br>
    `;

    pedidoData.items.forEach(item => {
      resumen += `- ${item.producto.nombre} x${item.cantidad}: $${this.formatearPrecio(item.subtotal)}<br>`;
    });

    return resumen;
  }

  calcularTiempoEntrega(): number {
    // Lógica para calcular tiempo de entrega
    // Por defecto, 30 minutos + 5 minutos por producto
    const pedidoData = this.pedido();
    if (!pedidoData) return 30;

    const baseTime = 30;
    const extraTime = pedidoData.items.length * 5;
    return baseTime + extraTime;
  }

  getBadgeClass(metodoPago: MetodoPago): string {
    const classes: Record<MetodoPago, string> = {
      [MetodoPago.EFECTIVO]: 'badge-success',
      [MetodoPago.TRANSFERENCIA]: 'badge-primary',
      [MetodoPago.DAVIPLATA]: 'badge-info',
      [MetodoPago.NEQUI]: 'badge-warning'
    };

    return classes[metodoPago] || 'badge-primary';
  }

  obtenerNombreMetodoPago(metodo: MetodoPago): string {
    const nombres: { [key in MetodoPago]: string } = {
      [MetodoPago.EFECTIVO]: 'Efectivo',
      [MetodoPago.TRANSFERENCIA]: 'Transferencia Bancaria',
      [MetodoPago.DAVIPLATA]: 'Daviplata',
      [MetodoPago.NEQUI]: 'Nequi'
    };
    return nombres[metodo] || metodo;
  }

  formatearPrecio(precio?: number | null): string {
    if (precio == null) {
      return '0';
    }
    return precio.toLocaleString('es-CO');
  }
}
