import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api-service';
import { PedidoRequest, PedidoResponse, EstadoPedido } from '../models/pedido.model';

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

  // Métodos para admin
  obtenerPorEstado(estado: EstadoPedido): Observable<PedidoResponse[]> {
    return this.api.get<PedidoResponse[]>(`/pedidos/estado/${estado}`);
  }

  obtenerTodos(): Observable<PedidoResponse[]> {
    // Asumiendo que el backend puede tener un endpoint para todos los pedidos
    // Si no existe, puedes obtener todos los estados y combinarlos
    return this.api.get<PedidoResponse[]>('/pedidos');
  }

  actualizarEstado(id: number, estado: EstadoPedido): Observable<PedidoResponse> {
    return this.api.put<PedidoResponse>(`/pedidos/${id}/estado`, { estado });
  }
}
