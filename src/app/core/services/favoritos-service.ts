import { Injectable, signal, computed } from '@angular/core';
import { Producto } from '../models/producto.model';

const FAVORITOS_KEY = 'colgas_favoritos';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {

  // Signal con los productos favoritos
  private _favoritos = signal<Producto[]>(this.cargarFavoritosDeStorage());

  // Signals públicos de solo lectura
  readonly favoritos = this._favoritos.asReadonly();
  readonly cantidadFavoritos = computed(() => this._favoritos().length);
  readonly idsFavoritos = computed(() => new Set(this._favoritos().map(p => p.id)));

  constructor() {
    // Cargar favoritos al iniciar
    this.cargarFavoritosDeStorage();
  }

  /**
   * Verifica si un producto está en favoritos
   */
  esFavorito(productoId: number | undefined): boolean {
    if (!productoId) return false;
    return this.idsFavoritos().has(productoId);
  }

  /**
   * Agrega un producto a favoritos
   */
  agregarFavorito(producto: Producto): boolean {
    if (!producto.id) return false;

    if (this.esFavorito(producto.id)) {
      return false; // Ya existe
    }

    const favoritosActuales = this._favoritos();
    this._favoritos.set([...favoritosActuales, producto]);
    this.guardarEnStorage();
    return true;
  }

  /**
   * Elimina un producto de favoritos
   */
  eliminarFavorito(productoId: number | undefined): boolean {
    if (!productoId) return false;

    const favoritosActuales = this._favoritos();
    const nuevosFavoritos = favoritosActuales.filter(p => p.id !== productoId);

    if (nuevosFavoritos.length === favoritosActuales.length) {
      return false; // No se encontró
    }

    this._favoritos.set(nuevosFavoritos);
    this.guardarEnStorage();
    return true;
  }

  /**
   * Alterna el estado de favorito de un producto
   */
  toggleFavorito(producto: Producto): { agregado: boolean; mensaje: string } {
    if (!producto.id) {
      return { agregado: false, mensaje: 'Error: Producto sin ID' };
    }

    if (this.esFavorito(producto.id)) {
      this.eliminarFavorito(producto.id);
      return { agregado: false, mensaje: `${producto.nombre} eliminado de favoritos` };
    } else {
      this.agregarFavorito(producto);
      return { agregado: true, mensaje: `${producto.nombre} agregado a favoritos` };
    }
  }

  /**
   * Elimina todos los favoritos
   */
  limpiarFavoritos(): void {
    this._favoritos.set([]);
    this.guardarEnStorage();
  }

  /**
   * Actualiza la información de un producto en favoritos
   * Útil cuando cambia el stock o precio
   */
  actualizarProducto(productoActualizado: Producto): void {
    if (!productoActualizado.id) return;

    const favoritosActuales = this._favoritos();
    const index = favoritosActuales.findIndex(p => p.id === productoActualizado.id);

    if (index !== -1) {
      const nuevosFavoritos = [...favoritosActuales];
      nuevosFavoritos[index] = productoActualizado;
      this._favoritos.set(nuevosFavoritos);
      this.guardarEnStorage();
    }
  }

  /**
   * Actualiza múltiples productos en favoritos
   */
  actualizarProductos(productosActualizados: Producto[]): void {
    const favoritosActuales = this._favoritos();
    const productosMap = new Map(productosActualizados.map(p => [p.id, p]));

    const nuevosFavoritos = favoritosActuales.map(fav => {
      const actualizado = productosMap.get(fav.id);
      return actualizado || fav;
    });

    this._favoritos.set(nuevosFavoritos);
    this.guardarEnStorage();
  }

  /**
   * Carga favoritos desde localStorage
   */
  private cargarFavoritosDeStorage(): Producto[] {
    try {
      const data = localStorage.getItem(FAVORITOS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    }
    return [];
  }

  /**
   * Guarda favoritos en localStorage
   */
  private guardarEnStorage(): void {
    try {
      localStorage.setItem(FAVORITOS_KEY, JSON.stringify(this._favoritos()));
    } catch (error) {
      console.error('Error al guardar favoritos:', error);
    }
  }
}
