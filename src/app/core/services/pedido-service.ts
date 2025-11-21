import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api-service'
import { PedidoRequest, PedidoResponse } from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private api = inject(ApiService);

  crearPedido(pedido: PedidoRequest): Observable<PedidoResponse> {
    return this.api.post<PedidoResponse>('/pedidos', pedido);
  }

  obtenerPorId(id: number): Observable<PedidoResponse> {
    return this.api.get<PedidoResponse>(`/pedidos/${id}`);
  }

  obtenerHistorial(telefono: string): Observable<PedidoResponse[]> {
    return this.api.get<PedidoResponse[]>(`/pedidos/cliente/${telefono}`);
  }
}
