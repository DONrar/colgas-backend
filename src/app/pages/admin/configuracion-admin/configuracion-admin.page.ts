import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonButton,
  IonIcon, IonSpinner, IonButtons, IonToast, IonInput,
  IonToggle, IonRange, IonLabel, IonList, IonItem,
  IonFabButton, IonFab, IonChip, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack, settings, refreshOutline, cash, speedometer,
  card, settingsOutline, construct, save, checkmark, download,
  cloudUpload, cog, informationCircle, server,
  personCircle, warning, checkmarkCircle, timeOutline,
  statsChart, notificationsOutline, serverOutline,
  shieldCheckmarkOutline, alertCircle, arrowForward,
  alertCircleOutline, bicycleOutline, barChart, checkmarkDone,
  navigate, checkmarkDoneOutline, trophy, list, cube,
  cubeOutline, pricetagsOutline, trendingUpOutline, flash,
  addCircle, receipt, documentText, mail, logoUsd, time, cloudUploadOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { ConfiguracionService, Configuracion } from '../../../core/services/configuracion-service';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-configuracion-admin',
  templateUrl: './configuracion-admin.page.html',
  styleUrls: ['./configuracion-admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonButton,
    IonIcon, IonSpinner, IonButtons, IonToast, IonRange, IonLabel,
      IonChip,  CommonModule, FormsModule, ReactiveFormsModule
  ]
})
export class ConfiguracionAdminPage implements OnInit {
  private configuracionService = inject(ConfiguracionService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  // Señales de estado
  cargando = signal(true);
  guardando = signal(false);
  mostrarToast = signal(false);
  mensajeToast = signal('');
  toastColor = signal<'success' | 'warning' | 'danger'>('success');
  ultimaActualizacion = signal('Hace unos momentos');
  systemStatus = signal('Operativo');

  // Configuraciones principales
  precioPorKm = 1500;
  modoMantenimiento = false;

  // Configuraciones avanzadas
  configuracionesAvanzadas = signal<Configuracion[]>([]);

  // Configuraciones por defecto
  private configuracionesPorDefecto: Configuracion[] = [
    {
      clave: 'precio_por_km',
      valor: '1500',
      descripcion: 'Precio por kilómetro para cálculos de viajes'
    }
  ];

  constructor() {
    addIcons({arrowBack,refreshOutline,settings,save,serverOutline,timeOutline,alertCircle,cog,cash,speedometer,logoUsd,card,time,navigate,cloudUploadOutline,settingsOutline,construct,checkmark,download,cloudUpload,informationCircle,server,personCircle,warning,checkmarkCircle,statsChart,notificationsOutline,shieldCheckmarkOutline,arrowForward,alertCircleOutline,bicycleOutline,barChart,checkmarkDone,checkmarkDoneOutline,trophy,list,cube,cubeOutline,pricetagsOutline,trendingUpOutline,flash,addCircle,receipt,documentText,mail});
  }

  async ngOnInit() {
    await this.cargarConfiguraciones();
  }

  async cargarConfiguraciones() {
    this.cargando.set(true);

    try {
      // Primero intentamos cargar configuraciones existentes
      const configuraciones = await firstValueFrom(
        this.configuracionService.obtenerTodasConfiguraciones()
      );

      if (configuraciones.length === 0) {
        // Si no hay configuraciones, inicializamos las por defecto
        await firstValueFrom(
          this.configuracionService.inicializarConfiguracionesPorDefecto()
        );

        // Recargamos después de inicializar
        await this.cargarValoresPorDefecto();
      } else {
        // Cargamos los valores desde la base de datos
        await this.cargarValoresDesdeConfiguraciones(configuraciones);
      }

      // Cargar configuraciones avanzadas (las que no son principales)
      await this.cargarConfiguracionesAvanzadas(configuraciones || []);

      this.systemStatus.set('Operativo');
      this.ultimaActualizacion.set('Justo ahora');

    } catch (error) {
      console.error('Error cargando configuraciones:', error);
      this.systemStatus.set('Con errores');
      this.mostrarMensaje('Error al cargar la configuración', 'warning');

      // Si hay error, cargamos valores por defecto
      await this.cargarValoresPorDefecto();
    } finally {
      this.cargando.set(false);
    }
  }

  private async cargarValoresDesdeConfiguraciones(configuraciones: Configuracion[]) {
    const configMap = new Map(configuraciones.map(c => [c.clave, c]));

    // Precio por km
    const precioKm = configMap.get('precio_por_km');
    this.precioPorKm = precioKm ? parseInt(precioKm.valor, 10) || 1500 : 1500;

  }

  private async cargarValoresPorDefecto() {
    // Cargamos valores por defecto
    this.precioPorKm = 1500;
    this.modoMantenimiento = false;
  }

  private async cargarConfiguracionesAvanzadas(configuraciones: Configuracion[]) {
    // Filtramos configuraciones principales
    const clavesPrincipales = new Set(this.configuracionesPorDefecto.map(c => c.clave));
    const avanzadas = configuraciones.filter(c => !clavesPrincipales.has(c.clave));

    // Procesamos valores booleanos
    const procesadas = avanzadas.map(config => ({
      ...config,
      valorBoolean: config.valor === 'true'
    }));

    this.configuracionesAvanzadas.set(procesadas);
  }

  async guardarPrecioPorKm() {
    if (this.precioPorKm <= 0) {
      this.mostrarMensaje('El precio por km debe ser mayor a 0', 'warning');
      return;
    }

    this.guardando.set(true);

    try {
      const config: Configuracion = {
        clave: 'precio_por_km',
        valor: this.precioPorKm.toString(),
        descripcion: 'Precio por kilómetro para cálculos de viajes'
      };

      await firstValueFrom(this.configuracionService.guardarConfiguracion(config));
      this.mostrarMensaje('Precio por km guardado correctamente', 'success');
      this.actualizarEstado();

    } catch (error) {
      console.error('Error guardando precio por km:', error);
      this.mostrarMensaje('Error al guardar el precio por km', 'danger');
    } finally {
      this.guardando.set(false);
    }
  }



  async guardarConfiguracionesAvanzadas() {
    this.guardando.set(true);

    try {
      const configs = this.configuracionesAvanzadas().map(config => ({
        clave: config.clave,
        valor: config.valorBoolean !== undefined ? config.valorBoolean.toString() : config.valor,
        descripcion: config.descripcion
      }));

      await firstValueFrom(this.configuracionService.guardarConfiguraciones(configs));
      this.mostrarMensaje('Configuraciones avanzadas guardadas', 'success');
      this.actualizarEstado();

    } catch (error) {
      console.error('Error guardando configuraciones avanzadas:', error);
      this.mostrarMensaje('Error al guardar configuraciones avanzadas', 'danger');
    } finally {
      this.guardando.set(false);
    }
  }

  async guardarTodo() {
    this.guardando.set(true);

    try {
      const todasConfigs: Configuracion[] = [
        {
          clave: 'precio_por_km',
          valor: this.precioPorKm.toString(),
          descripcion: 'Precio por kilómetro para cálculos de viajes'
        },

        {
          clave: 'modo_mantenimiento',
          valor: this.modoMantenimiento.toString(),
          descripcion: 'Habilitar modo mantenimiento'
        },
        ...this.configuracionesAvanzadas().map(config => ({
          clave: config.clave,
          valor: config.valorBoolean !== undefined ? config.valorBoolean.toString() : config.valor,
          descripcion: config.descripcion
        }))
      ];

      await firstValueFrom(this.configuracionService.guardarConfiguraciones(todasConfigs));
      this.mostrarMensaje('Todas las configuraciones guardadas correctamente', 'success');
      this.actualizarEstado();

    } catch (error) {
      console.error('Error guardando todas las configuraciones:', error);
      this.mostrarMensaje('Error al guardar configuraciones', 'danger');
    } finally {
      this.guardando.set(false);
    }
  }

  restablecerPrecioPorKm() {
    this.precioPorKm = 1500;
    this.mostrarMensaje('Precio restablecido al valor por defecto', 'success');
  }

  // Helper Methods
  formatearPrecio(valor: number): string {
    return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  isBooleanConfig(config: Configuracion): boolean {
    return config.valor === 'true' || config.valor === 'false' ||
           config.valor.toLowerCase() === 'si' || config.valor.toLowerCase() === 'no';
  }

  actualizarEstado() {
    this.ultimaActualizacion.set('Justo ahora');
  }

  // Event handlers
  onPrecioPorKmChange(event: any) {
    const value = event.detail?.value || this.precioPorKm;
    if (value < 100) {
      this.precioPorKm = 100;
    }
  }


  onTiempoEsperaChange(event: any) {
    console.log('Tiempo de espera cambiado:', event.detail.value);
  }

  onRadioCoberturaChange(event: any) {
    console.log('Radio de cobertura cambiado:', event.detail.value);
  }

  onNotificacionesEmailChange(event: any) {
    console.log('Notificaciones email:', event.detail.checked);
  }

  onModoMantenimientoChange(event: any) {
    const activado = event.detail.checked;
    if (activado) {
      this.mostrarMensaje('Modo mantenimiento activado. Los usuarios no podrán hacer nuevas solicitudes.', 'warning');
    } else {
      this.mostrarMensaje('Modo mantenimiento desactivado', 'success');
    }
  }

  onConfigAvanzadaChange(config: Configuracion) {
    console.log('Configuración avanzada cambiada:', config);
  }

  async refresh() {
    await this.cargarConfiguraciones();
  }

  mostrarMensaje(mensaje: string, color: 'success' | 'warning' | 'danger') {
    this.mensajeToast.set(mensaje);
    this.toastColor.set(color);
    this.mostrarToast.set(true);

    // Auto-ocultar después de 2 segundos
    setTimeout(() => {
      this.cerrarToast();
    }, 2000);
  }

  cerrarToast() {
    this.mostrarToast.set(false);
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }
}
