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
  arrowBack, navigate, car, time, speedometer,
  checkmarkCircle, closeCircle, person, location, navigateOutline, calendarOutline, timeOutline, personOutline, personCircleOutline, callOutline, carSportOutline, speedometerOutline, cashOutline, locationOutline, playCircle, flag, logoWhatsapp, mapOutline, carOutline } from 'ionicons/icons';
import { ExpresoService } from '../../../core/services/expreso-service';
import { ExpresoResponse, EstadoExpreso } from '../../../core/models/expreso.model';
import { ToastService } from '../../../core/services/toast-service';
@Component({
  selector: 'app-expreso-detalle',
  templateUrl: './expreso-detalle.page.html',
  styleUrls: ['./expreso-detalle.page.scss'],
  standalone: true,
  imports: [IonButtons, IonSpinner, IonBadge, IonCardHeader, IonCard, IonCardContent, IonCardTitle, IonButton, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ExpresoDetallePage implements OnInit {
 private route = inject(ActivatedRoute);
  private router = inject(Router);
  private expresoService = inject(ExpresoService);
  private toastService = inject(ToastService);

  expreso: ExpresoResponse | null = null;
  cargando = true;
  expresoId!: number;

  constructor() {
    addIcons({arrowBack,navigateOutline,calendarOutline,timeOutline,personOutline,personCircleOutline,callOutline,carSportOutline,speedometerOutline,cashOutline,locationOutline,playCircle,flag,navigate,time,logoWhatsapp,mapOutline,carOutline,car,speedometer,checkmarkCircle,closeCircle,person,location});
  }

  ngOnInit() {
    this.expresoId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarExpreso();
  }

  cargarExpreso() {
    this.cargando = true;
    this.expresoService.obtenerPorId(this.expresoId).subscribe({
      next: (expreso) => {
        this.expreso = expreso;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando expreso:', error);
        this.toastService.error('Error al cargar el viaje express');
        this.cargando = false;
      }
    });
  }

  getEstadoColor(estado: EstadoExpreso): string {
    const colores = {
      [EstadoExpreso.COMPLETADO]: 'success',
      [EstadoExpreso.EN_CURSO]: 'primary',
      [EstadoExpreso.ASIGNADO]: 'secondary',
      [EstadoExpreso.SOLICITADO]: 'warning',
      [EstadoExpreso.CANCELADO]: 'danger'
    };
    return colores[estado] || 'medium';
  }

  getEstadoTexto(estado: EstadoExpreso): string {
    const textos = {
      [EstadoExpreso.COMPLETADO]: 'Completado',
      [EstadoExpreso.EN_CURSO]: 'En curso',
      [EstadoExpreso.ASIGNADO]: 'Asignado',
      [EstadoExpreso.SOLICITADO]: 'Solicitado',
      [EstadoExpreso.CANCELADO]: 'Cancelado'
    };
    return textos[estado] || estado;
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
    if (this.expreso?.urlWhatsApp) {
      window.open(this.expreso.urlWhatsApp, '_blank');
    }
  }

  abrirMapa() {
    if (this.expreso?.latitudOrigen && this.expreso?.longitudOrigen) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${this.expreso.latitudOrigen},${this.expreso.longitudOrigen}&destination=${this.expreso.latitudDestino},${this.expreso.longitudDestino}&travelmode=driving`;
      window.open(url, '_blank');
    }
  }
// Métodos adicionales para el componente TypeScript
getBadgeClass(estado: string): string {
  const estadoMap: { [key: string]: string } = {
    'COMPLETADO': 'badge-success',
    'EN_CURSO': 'badge-primary',
    'ASIGNADO': 'badge-info',
    'SOLICITADO': 'badge-warning',
    'CANCELADO': 'badge-warning'
  };
  return estadoMap[estado] || 'badge-info';
}


formatearMoneda(valor: number): string {
  return `$${valor.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

formatearHora(fecha: string): string {
  return new Date(fecha).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

formatearDuracion(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} min`;
  } else {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
  }
}

}
