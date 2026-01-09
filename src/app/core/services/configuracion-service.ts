import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Configuracion {
  clave: string;
  valor: string;
  descripcion?: string;
  valorBoolean?: boolean;  // Añade esta propiedad
}
@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/config`;

  obtenerTodasConfiguraciones(): Observable<Configuracion[]> {
    return this.http.get<Configuracion[]>(this.apiUrl).pipe(
      catchError(() => of([])) // Retorna array vacío si hay error
    );
  }

  obtenerConfiguracion(clave: string): Observable<Configuracion | null> {
    return this.http.get<Configuracion>(`${this.apiUrl}/${clave}`).pipe(
      catchError(() => of(null)) // Retorna null si no existe
    );
  }

  actualizarConfiguracion(config: Configuracion): Observable<Configuracion> {
    return this.http.put<Configuracion>(
      `${this.apiUrl}/${config.clave}`,
      { valor: config.valor }
    ).pipe(
      catchError((error) => {
        // Si la configuración no existe (404), la creamos
        if (error.status === 404) {
          return this.crearConfiguracion(config);
        }
        throw error;
      })
    );
  }

  crearConfiguracion(config: Configuracion): Observable<Configuracion> {
    return this.http.post<Configuracion>(this.apiUrl, config);
  }

  /**
   * Método que actualiza o crea una configuración automáticamente
   */
  guardarConfiguracion(config: Configuracion): Observable<Configuracion> {
    return this.obtenerConfiguracion(config.clave).pipe(
      switchMap(existingConfig => {
        if (existingConfig) {
          // Si existe, la actualizamos
          return this.http.put<Configuracion>(
            `${this.apiUrl}/${config.clave}`,
            { valor: config.valor }
          );
        } else {
          // Si no existe, la creamos
          return this.http.post<Configuracion>(this.apiUrl, config);
        }
      })
    );
  }

  /**
   * Método para guardar múltiples configuraciones en lote
   */
  guardarConfiguraciones(configs: Configuracion[]): Observable<Configuracion[]> {
    const requests = configs.map(config => this.guardarConfiguracion(config));
    return forkJoin(requests);
  }

  // Método especial para obtener el precio por km
  getPrecioPorKm(): Observable<number> {
    return this.obtenerConfiguracion('precio_por_km').pipe(
      map(config => {
        if (config && config.valor) {
          return parseInt(config.valor, 10) || 1500;
        }
        return 1500; // Valor por defecto
      }),
      catchError(() => of(1500))
    );
  }

  /**
   * Inicializa las configuraciones por defecto si no existen
   */
  inicializarConfiguracionesPorDefecto(): Observable<Configuracion[]> {
    const configuracionesPorDefecto: Configuracion[] = [
      {
        clave: 'precio_por_km',
        valor: '1500',
        descripcion: 'Precio por kilómetro para cálculos de viajes'
      },
      {
        clave: 'precio_minimo',
        valor: '10000',
        descripcion: 'Precio mínimo para viajes'
      },
      {
        clave: 'tiempo_espera',
        valor: '15',
        descripcion: 'Tiempo de espera incluido en minutos'
      },
      {
        clave: 'radio_cobertura',
        valor: '20',
        descripcion: 'Radio de cobertura en kilómetros'
      },
      {
        clave: 'notificaciones_email',
        valor: 'true',
        descripcion: 'Habilitar notificaciones por email'
      },
      {
        clave: 'modo_mantenimiento',
        valor: 'false',
        descripcion: 'Habilitar modo mantenimiento'
      }
    ];

    // Primero obtenemos todas las configuraciones existentes
    return this.obtenerTodasConfiguraciones().pipe(
      switchMap(existingConfigs => {
        const existingKeys = new Set(existingConfigs.map(c => c.clave));

        // Filtramos las que no existen
        const nuevasConfiguraciones = configuracionesPorDefecto.filter(
          config => !existingKeys.has(config.clave)
        );

        if (nuevasConfiguraciones.length === 0) {
          return of(existingConfigs);
        }

        // Creamos las configuraciones que faltan
        return this.guardarConfiguraciones(nuevasConfiguraciones);
      })
    );
  }
}
