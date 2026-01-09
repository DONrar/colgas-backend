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
  IonSpinner,
  IonButtons,
  IonBackButton,
  IonBadge,
  AlertController,
  ActionSheetController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle, closeCircle, arrowForward, carOutline,
  logoWhatsapp, timeOutline, location, navigate, calendar,
  person, call, map, speedometer, cash, sync, play,
  checkmarkDone, close, checkmark
} from 'ionicons/icons';
import { ExpresoService } from '../../../core/services/expreso-service';
import { ToastService } from '../../../core/services/toast-service';
import { ExpresoResponse, EstadoExpreso } from '../../../core/models/expreso.model';
import { ActionSheetButton } from '@ionic/angular';

@Component({
  selector: 'app-admin-detalle-expreso',
  templateUrl: './admin-detalle-expreso.page.html',
  styleUrls: ['./admin-detalle-expreso.page.scss'],
  standalone: true,
  imports: [
    IonBadge,
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
    IonSpinner,
    IonButtons,
    IonBackButton
  ]
})
export class AdminDetalleExpresoPage implements OnInit {
  private expresoService = inject(ExpresoService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private actionSheetController = inject(ActionSheetController);

  expreso = signal<ExpresoResponse | null>(null);
  cargando = signal(true);
  actualizando = signal(false);

  EstadoExpreso = EstadoExpreso;

  constructor() {
    addIcons({
      checkmarkCircle, closeCircle, arrowForward, carOutline,
      logoWhatsapp, timeOutline, location, navigate, calendar,
      person, call, map, speedometer, cash, sync, play,
      checkmarkDone, close, checkmark
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarExpreso(parseInt(id));
    }
  }

  cargarExpreso(id: number) {
    this.cargando.set(true);
    this.expresoService.obtenerPorId(id).subscribe({
      next: (expreso) => {
        this.expreso.set(expreso);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar expreso:', error);
        this.toastService.error('Error al cargar el expreso');
        this.cargando.set(false);
        this.router.navigate(['/admin/expresos']);
      }
    });
  }

  async mostrarOpcionesEstado() {
    const expresoActual = this.expreso();
    if (!expresoActual) return;

    const estadosDisponibles = this.getEstadosDisponibles(expresoActual.estado);

    const buttons: ActionSheetButton[] = estadosDisponibles.map(estado => ({
      text: this.getTextoEstado(estado),
      icon: this.getIconoEstado(estado),
      handler: () => {
        this.confirmarCambioEstado(estado);
      }
    }));

    buttons.push({
      text: 'Cancelar',
      icon: 'close',
      role: 'cancel'
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'Cambiar estado del expreso',
      buttons: buttons
    });

    await actionSheet.present();
  }

  getEstadosDisponibles(estadoActual: EstadoExpreso): EstadoExpreso[] {
    switch (estadoActual) {
      case EstadoExpreso.SOLICITADO:
        return [EstadoExpreso.ASIGNADO, EstadoExpreso.CANCELADO];
      case EstadoExpreso.ASIGNADO:
        return [EstadoExpreso.EN_CURSO, EstadoExpreso.CANCELADO];
      case EstadoExpreso.EN_CURSO:
        return [EstadoExpreso.COMPLETADO];
      default:
        return [];
    }
  }

  async confirmarCambioEstado(nuevoEstado: EstadoExpreso) {
    const alert = await this.alertController.create({
      header: 'Confirmar cambio',
      message: `¿Cambiar estado a "${this.getTextoEstado(nuevoEstado)}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.cambiarEstado(nuevoEstado);
          }
        }
      ]
    });

    await alert.present();
  }

  cambiarEstado(nuevoEstado: EstadoExpreso) {
    const expresoActual = this.expreso();
    if (!expresoActual) return;

    this.actualizando.set(true);
    this.expresoService.actualizarEstado(expresoActual.id, nuevoEstado).subscribe({
      next: (expresoActualizado) => {
        this.expreso.set(expresoActualizado);
        this.toastService.success('Estado actualizado correctamente');
        this.actualizando.set(false);
      },
      error: (error) => {
        console.error('Error al actualizar estado:', error);
        this.toastService.error('Error al actualizar el estado');
        this.actualizando.set(false);
      }
    });
  }

  abrirWhatsApp() {
    const expresoActual = this.expreso();
    if (!expresoActual) return;

    const telefono = this.formatearTelefonoWhatsApp(expresoActual.cliente.telefono);
    const mensaje = this.generarMensajeWhatsApp(expresoActual);
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  private formatearTelefonoWhatsApp(telefono: string): string {
    // Eliminar espacios, guiones y paréntesis
    let telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');

    // Si no tiene código de país, agregar +57 (Colombia)
    if (!telefonoLimpio.startsWith('+')) {
      if (telefonoLimpio.startsWith('57')) {
        telefonoLimpio = '+' + telefonoLimpio;
      } else {
        telefonoLimpio = '+57' + telefonoLimpio;
      }
    }

    // Retornar sin el + para la URL de WhatsApp
    return telefonoLimpio.replace('+', '');
  }

  private generarMensajeWhatsApp(expreso: ExpresoResponse): string {
    let mensaje = `¡Hola ${expreso.cliente.nombre}! 👋\n\n`;
    mensaje += `Le escribimos respecto a su servicio de expreso #${expreso.id}.\n\n`;

    switch (expreso.estado) {
      case EstadoExpreso.SOLICITADO:
        mensaje += `Su solicitud ha sido recibida y está siendo procesada. En breve le confirmaremos los detalles del servicio.\n`;
        break;
      case EstadoExpreso.ASIGNADO:
        mensaje += `Su servicio ha sido asignado y estamos preparando todo para recogerlo.\n`;
        mensaje += `📍 Origen: ${expreso.direccionOrigen || 'Ubicación GPS'}\n`;
        mensaje += `📍 Destino: ${expreso.direccionDestino || 'Ubicación GPS'}\n`;
        break;
      case EstadoExpreso.EN_CURSO:
        mensaje += `Su servicio está en curso. Estamos en camino.\n`;
        break;
      case EstadoExpreso.COMPLETADO:
        mensaje += `Su servicio ha sido completado exitosamente. ¡Gracias por preferirnos! 🙏\n`;
        break;
      default:
        mensaje += `Estado actual: ${this.getTextoEstado(expreso.estado)}\n`;
    }

    mensaje += `\n💰 Valor del servicio: $${this.formatearPrecio(expreso.precioTotal)}\n`;
    mensaje += `\n¿Tiene alguna pregunta o necesita información adicional?`;

    return mensaje;
  }

  abrirMapa() {
    const expresoActual = this.expreso();
    if (expresoActual) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${expresoActual.latitudOrigen},${expresoActual.longitudOrigen}&destination=${expresoActual.latitudDestino},${expresoActual.longitudDestino}`;
      window.open(url, '_blank');
    }
  }

  verMapaOrigen() {
    const expresoActual = this.expreso();
    if (expresoActual) {
      const url = `https://www.google.com/maps?q=${expresoActual.latitudOrigen},${expresoActual.longitudOrigen}`;
      window.open(url, '_blank');
    }
  }

  verMapaDestino() {
    const expresoActual = this.expreso();
    if (expresoActual) {
      const url = `https://www.google.com/maps?q=${expresoActual.latitudDestino},${expresoActual.longitudDestino}`;
      window.open(url, '_blank');
    }
  }

  getTextoEstado(estado: EstadoExpreso): string {
    const textos = {
      [EstadoExpreso.SOLICITADO]: 'Solicitado',
      [EstadoExpreso.ASIGNADO]: 'Asignado',
      [EstadoExpreso.EN_CURSO]: 'En Curso',
      [EstadoExpreso.COMPLETADO]: 'Completado',
      [EstadoExpreso.CANCELADO]: 'Cancelado'
    };
    return textos[estado];
  }

  getIconoEstado(estado: EstadoExpreso): string {
    const iconos = {
      [EstadoExpreso.SOLICITADO]: 'time-outline',
      [EstadoExpreso.ASIGNADO]: 'checkmark-circle',
      [EstadoExpreso.EN_CURSO]: 'car-outline',
      [EstadoExpreso.COMPLETADO]: 'checkmark-done',
      [EstadoExpreso.CANCELADO]: 'close-circle'
    };
    return iconos[estado];
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

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearPrecio(precio: number): string {
    return precio.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}
