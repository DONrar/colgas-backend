import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api-service'
import {
  ExpresoCalculoRequest,
  ExpresoCalculo,
  ExpresoRequest,
  ExpresoResponse,
  EstadoExpreso
} from '../models/expreso.model';

@Injectable({
  providedIn: 'root'
})
export class ExpresoService {
  private api = inject(ApiService);

  calcularPrecio(request: ExpresoCalculoRequest): Observable<ExpresoCalculo> {
    return this.api.post<ExpresoCalculo>('/expresos/calcular', request);
  }

  crearSolicitud(request: ExpresoRequest): Observable<ExpresoResponse> {
    return this.api.post<ExpresoResponse>('/expresos', request);
  }

  obtenerPorId(id: number): Observable<ExpresoResponse> {
    return this.api.get<ExpresoResponse>(`/expresos/${id}`);
  }

  obtenerHistorial(telefono: string): Observable<ExpresoResponse[]> {
    return this.api.get<ExpresoResponse[]>(`/expresos/cliente/${telefono}`);
  }

  obtenerPorEstado(estado: EstadoExpreso): Observable<ExpresoResponse[]> {
    return this.api.get<ExpresoResponse[]>(`/expresos/estado/${estado}`);
  }

  actualizarEstado(id: number, estado: EstadoExpreso): Observable<ExpresoResponse> {
    return this.api.put<ExpresoResponse>(`/expresos/${id}/estado`, { estado });
  }
}
