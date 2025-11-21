import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api-service'
import { Producto, TipoProducto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private api = inject(ApiService);

  obtenerTodos(): Observable<Producto[]> {
    return this.api.get<Producto[]>('/productos');
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.api.get<Producto>(`/productos/${id}`);
  }

  obtenerPorTipo(tipo: TipoProducto): Observable<Producto[]> {
    return this.api.get<Producto[]>(`/productos/tipo/${tipo}`);
  }

  buscarPorNombre(nombre: string): Observable<Producto[]> {
    return this.api.get<Producto[]>(`/productos/buscar?nombre=${nombre}`);
  }
}
