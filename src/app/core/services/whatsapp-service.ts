import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {

  async abrirWhatsApp(url: string): Promise<void> {
    try {
      await Browser.open({ url });
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
      window.open(url, '_blank');
    }
  }

  async enviarMensaje(numero: string, mensaje: string): Promise<void> {
    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/${numero}?text=${mensajeCodificado}`;
    await this.abrirWhatsApp(url);
  }
}
