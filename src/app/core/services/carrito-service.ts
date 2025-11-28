import { Injectable, signal, computed } from '@angular/core';
import { ItemCarrito } from '../models/carrito.model';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  // Signal principal para los items del carrito
  private itemsSignal = signal<ItemCarrito[]>([]);

  // Signals de solo lectura para el componente
  items = this.itemsSignal.asReadonly();

  cantidadTotal = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.cantidad, 0)
  );

  total = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.subtotal, 0)
  );

  constructor() {
    this.cargarDesdeStorage();
  }

  // Método para agregar producto (maneja IDs opcionales)
  agregarProducto(producto: Producto, cantidad: number = 1): void {
    const itemsActuales = [...this.itemsSignal()];

    // Si el producto no tiene ID, usar nombre como identificador temporal
    const identificador = producto.id || producto.nombre;

    const itemExistente = itemsActuales.find(i =>
      (i.producto.id && i.producto.id === producto.id) ||
      (!i.producto.id && i.producto.nombre === producto.nombre)
    );

    if (itemExistente) {
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.producto.precio;
    } else {
      itemsActuales.push({
        producto,
        cantidad,
        subtotal: cantidad * producto.precio
      });
    }

    this.actualizarItems(itemsActuales);
  }

  // Método para actualizar cantidad (maneja IDs opcionales)
  actualizarCantidad(productoId: number | string, cantidad: number): void {
    if (cantidad <= 0) {
      this.eliminarProducto(productoId);
      return;
    }

    const itemsActuales = this.itemsSignal().map(item => {
      const coincidePorId = typeof productoId === 'number' && item.producto.id === productoId;
      const coincidePorNombre = typeof productoId === 'string' && item.producto.nombre === productoId;

      if (coincidePorId || coincidePorNombre) {
        return {
          ...item,
          cantidad,
          subtotal: cantidad * item.producto.precio
        };
      }
      return item;
    });

    this.actualizarItems(itemsActuales);
  }

  // Método para eliminar producto (maneja IDs opcionales)
  eliminarProducto(productoId: number | string): void {
    const itemsActuales = this.itemsSignal().filter(item => {
      const coincidePorId = typeof productoId === 'number' && item.producto.id === productoId;
      const coincidePorNombre = typeof productoId === 'string' && item.producto.nombre === productoId;

      return !(coincidePorId || coincidePorNombre);
    });

    this.actualizarItems(itemsActuales);
  }

  // Método para eliminar producto por nombre (para casos sin ID)
  eliminarProductoPorNombre(nombre: string): void {
    this.eliminarProducto(nombre);
  }

  // Método para limpiar todo el carrito
  limpiarCarrito(): void {
    this.itemsSignal.set([]);
    localStorage.removeItem('colgas_carrito');
  }

  // Método para obtener el carrito actual
  obtenerCarrito(): ItemCarrito[] {
    return this.itemsSignal();
  }

  // Método auxiliar para actualizar items y guardar en storage
  private actualizarItems(items: ItemCarrito[]): void {
    this.itemsSignal.set(items);
    this.guardarEnStorage();
  }

  // Guardar en localStorage
  private guardarEnStorage(): void {
    try {
      localStorage.setItem('colgas_carrito', JSON.stringify(this.itemsSignal()));
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  }

  // Cargar desde localStorage
  private cargarDesdeStorage(): void {
    const data = localStorage.getItem('colgas_carrito');
    if (data) {
      try {
        const items = JSON.parse(data);
        this.itemsSignal.set(items);
      } catch (error) {
        console.error('Error al cargar carrito:', error);
        this.limpiarCarrito(); // Limpiar datos corruptos
      }
    }
  }

  // Método para verificar si un producto está en el carrito
  estaEnCarrito(producto: Producto): boolean {
    return this.itemsSignal().some(item =>
      (item.producto.id && item.producto.id === producto.id) ||
      (!item.producto.id && item.producto.nombre === producto.nombre)
    );
  }

  // Método para obtener la cantidad de un producto específico
  obtenerCantidadProducto(producto: Producto): number {
    const item = this.itemsSignal().find(i =>
      (i.producto.id && i.producto.id === producto.id) ||
      (!i.producto.id && i.producto.nombre === producto.nombre)
    );
    return item ? item.cantidad : 0;
  }
}
