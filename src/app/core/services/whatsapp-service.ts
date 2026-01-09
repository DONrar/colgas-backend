import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {

  async abrirWhatsApp(url: string): Promise<void> {
    try {
      // Usar window.open directamente para evitar problemas de codificación con Browser.open
      // Browser.open de Capacitor puede causar doble codificación de caracteres especiales
      window.open(url, '_system');
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
      // Fallback secundario
      try {
        await Browser.open({ url });
      } catch (e) {
        window.open(url, '_blank');
      }
    }
  }

  async enviarMensaje(numero: string, mensaje: string): Promise<void> {
    // Asegurarse de codificar correctamente el mensaje
    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/${numero}?text=${mensajeCodificado}`;
    await this.abrirWhatsApp(url);
  }
}
