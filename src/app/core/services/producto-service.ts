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

  convertirArchivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  crear(producto: Producto): Observable<Producto> {
    return this.api.post<Producto>('/productos', producto);
  }

  actualizar(id: number, producto: Producto): Observable<Producto> {
    return this.api.put<Producto>(`/productos/${id}`, producto);
  }

  eliminar(id: number): Observable<void> {
    return this.api.delete<void>(`/productos/${id}`);
  }

  // Método adicional para actualizar solo el stock
  actualizarStock(id: number, cantidad: number): Observable<Producto> {
    return this.api.put<Producto>(`/productos/${id}/stock`, { stock: cantidad });
  }
}
