import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonButton,
  IonIcon, IonList, IonItem, IonLabel, IonCardSubtitle,
  IonFabButton, IonFab, IonBadge, IonRefresher, IonRefresherContent,
  IonButtons, IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  call, logoWhatsapp, mail, location, time, business, map,
  mapOutline, chatbubbles, shareSocial, flame, checkmarkCircle,
  chatbubbleEllipses, navigate, shieldCheckmark, car, card
} from 'ionicons/icons';
import { WhatsAppService } from '../../../core/services/whatsapp-service';
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
  standalone: true,
  imports: [
    IonBackButton, IonButtons, IonRefresherContent, IonRefresher,
    IonBadge, IonFab, IonFabButton, IonCardSubtitle, CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon,
    IonList, IonItem, IonLabel
  ]
})
export class ContactoPage {
  private whatsappService = inject(WhatsAppService);

  constructor() {
    addIcons({
      chatbubbles, shareSocial, flame, checkmarkCircle, business,
      location, time, call, chatbubbleEllipses, logoWhatsapp,
      mail, map, navigate, shieldCheckmark, car, card, mapOutline
    });
  }

  async llamar() {
    await Browser.open({ url: 'tel:+573235162298' });
  }

  async abrirWhatsApp() {
    await this.whatsappService.enviarMensaje('573235162298', 'Hola, estoy interesado en sus productos');
  }

  async abrirWhatsAppExpresos() {
    await this.whatsappService.enviarMensaje('573235162298', 'Hola, necesito un servicio de expreso');
  }

  async abrirMapa() {
    await Browser.open({ url: 'https://www.google.com/maps?q=4.6097,-74.0817' });
  }

  // Método para compartir contacto
  async compartirContacto() {
    try {
      await Share.share({
        title: 'ColGas - Distribuidora',
        text: 'Contacta a ColGas - Tu proveedor confiable de gas\n📞 Teléfono: +57 323 516 2298\n📍 Dirección: Calle 100 #15-20, Bogotá D.C.',
        url: 'https://maps.google.com/?q=4.6097,-74.0817',
        dialogTitle: 'Compartir contacto de ColGas'
      });
    } catch (error) {
      console.error('Error al compartir:', error);
      // Fallback: copiar al portapapeles
      this.copiarAlPortapapeles();
    }
  }

  // Método para refrescar la página
  async refrescar(event: any) {
    // Simular una recarga de datos
    setTimeout(() => {
      event.target.complete();
      // Aquí puedes agregar lógica para recargar datos si es necesario
      console.log('Datos actualizados');
    }, 1500);
  }

  // Método para enviar email
  async enviarEmail() {
    const email = 'ventas@colgas.com';
    const asunto = 'Consulta - ColGas Distribuidora';
    const cuerpo = 'Hola, me gustaría obtener más información sobre sus productos y servicios.';

    await Browser.open({
      url: `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
    });
  }

  // Método fallback para compartir (copiar al portapapeles)
  private async copiarAlPortapapeles() {
    const texto = `ColGas - Distribuidora\n📞 Teléfono: +57 323 516 2298\n📍 Dirección: Calle 100 #15-20, Bogotá D.C.\n🕒 Horario: Lunes a Sábado 7:00 AM - 8:00 PM, Domingos 8:00 AM - 2:00 PM`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(texto);
        this.mostrarMensaje('Contacto copiado al portapapeles');
      } else {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = texto;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.mostrarMensaje('Contacto copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error al copiar:', error);
      this.mostrarMensaje('Error al copiar contacto');
    }
  }

  // Método para mostrar mensajes (puedes implementar un toast)
  private mostrarMensaje(mensaje: string) {
    // Aquí puedes implementar un servicio de toast o usar alert
    console.log(mensaje);
    // Ejemplo con alert:
    // alert(mensaje);
  }

  // Método adicional para verificar si está dentro del horario de atención
  estaAbierto(): boolean {
    const ahora = new Date();
    const hora = ahora.getHours();
    const minutos = ahora.getMinutes();
    const dia = ahora.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

    // Lunes a Sábado: 7:00 - 20:00
    if (dia >= 1 && dia <= 6) {
      return (hora > 7 || (hora === 7 && minutos >= 0)) &&
             (hora < 20 || (hora === 20 && minutos === 0));
    }

    // Domingo: 8:00 - 14:00
    if (dia === 0) {
      return (hora > 8 || (hora === 8 && minutos >= 0)) &&
             (hora < 14 || (hora === 14 && minutos === 0));
    }

    return false;
  }
}
