import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonButton,
  IonIcon, IonList, IonItem, IonLabel, IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { call, logoWhatsapp, mail, location, time } from 'ionicons/icons';
import { WhatsAppService } from '../../core/services/whatsapp-service';
import { Browser } from '@capacitor/browser';


@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon,
    IonList, IonItem, IonLabel ]
})
export class ContactoPage {
 private whatsappService = inject(WhatsAppService);

  constructor() {
    addIcons({ call, logoWhatsapp, mail, location, time });
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

}
