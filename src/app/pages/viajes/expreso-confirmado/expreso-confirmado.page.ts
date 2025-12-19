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
import { checkmarkCircle, logoWhatsapp, home, copyOutline } from 'ionicons/icons';
import { ExpresoService } from '../../../core/services/expreso-service';
import { WhatsAppService } from '../../../core/services/whatsapp-service';
import { ToastService } from '../../../core/services/toast-service';
import { ExpresoResponse } from '../../../core/models/expreso.model';
import { Clipboard } from '@capacitor/clipboard';

@Component({
  selector: 'app-expreso-confirmado',
  templateUrl: './expreso-confirmado.page.html',
  styleUrls: ['./expreso-confirmado.page.scss'],
  standalone: true,
  imports: [CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonIcon, IonList, IonItem,
    IonLabel, IonSpinner]
})
export class ExpresoConfirmadoPage implements OnInit {
 private route = inject(ActivatedRoute);
  private router = inject(Router);
  private expresoService = inject(ExpresoService);
  private whatsappService = inject(WhatsAppService);
  private toastService = inject(ToastService);

  expreso = signal<ExpresoResponse | null>(null);
  cargando = signal(true);

  constructor() {
    addIcons({ checkmarkCircle, logoWhatsapp, home, copyOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.expresoService.obtenerPorId(+id).subscribe({
        next: (data) => { this.expreso.set(data); this.cargando.set(false); },
        error: () => { this.toastService.error('Error al cargar'); this.router.navigate(['/tabs/expresos']); }
      });
    }
  }

  async enviarPorWhatsApp() {
    if (this.expreso()?.urlWhatsApp) {
      await this.whatsappService.abrirWhatsApp(this.expreso()!.urlWhatsApp);
    }
  }

  async copiarMensaje() {
    if (this.expreso()?.mensajeWhatsApp) {
      await Clipboard.write({ string: this.expreso()!.mensajeWhatsApp });
      this.toastService.success('Mensaje copiado');
    }
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }
}
