import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ExpresoCalculoResponse {
  distanciaKm: number;
  duracionMinutos: number;
  precioPorKm: number;
  precioTotal: number;
  rutaPolyline?: string;
}

export interface ExpresoRequest {
  nombreCliente: string;
  telefono: string;
  latitudOrigen: number;
  longitudOrigen: number;
  direccionOrigen?: string;
  latitudDestino: number;
  longitudDestino: number;
  direccionDestino?: string;
}

export interface ExpresoResponse {
  id: number;
  cliente: {
    id: number;
    nombre: string;
    telefono: string;
  };
  latitudOrigen: number;
  longitudOrigen: number;
  direccionOrigen?: string;
  latitudDestino: number;
  longitudDestino: number;
  direccionDestino?: string;
  distanciaKm: number;
  duracionMinutos: number;
  precioPorKm: number;
  precioTotal: number;
  rutaPolyline?: string;
  estado: string;
  fechaSolicitud: string;
  mensajeWhatsApp: string;
  urlWhatsApp: string;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleApiService {
  private apiUrl = environment.apiUrl; // 'http://localhost:8080/api' o tu URL

  constructor(private http: HttpClient) { }

  /**
   * Calcular precio de viaje sin crear solicitud
   */
  calcularPrecio(
    latOrigen: number,
    lngOrigen: number,
    latDestino: number,
    lngDestino: number
  ): Observable<ExpresoCalculoResponse> {
    const body = {
      latitudOrigen: latOrigen,
      longitudOrigen: lngOrigen,
      latitudDestino: latDestino,
      longitudDestino: lngDestino
    };

    return this.http.post<ExpresoCalculoResponse>(
      `${this.apiUrl}/expresos/calcular`,
      body
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crear solicitud de expreso
   */
  crearSolicitud(request: ExpresoRequest): Observable<ExpresoResponse> {
    return this.http.post<ExpresoResponse>(
      `${this.apiUrl}/expresos`,
      request
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener solicitud por ID
   */
  obtenerSolicitud(id: number): Observable<ExpresoResponse> {
    return this.http.get<ExpresoResponse>(
      `${this.apiUrl}/expresos/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener historial por teléfono
   */
  obtenerHistorial(telefono: string): Observable<ExpresoResponse[]> {
    return this.http.get<ExpresoResponse[]>(
      `${this.apiUrl}/expresos/cliente/${telefono}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Error en la API:', error);
    let errorMessage = 'Ocurrió un error en el servidor';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error?.message) {
      // Error del servidor con mensaje
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
