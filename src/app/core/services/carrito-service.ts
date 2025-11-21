import { Injectable, signal, computed } from '@angular/core';
import { ItemCarrito } from '../models/carrito.model';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private itemsSignal = signal<ItemCarrito[]>([]);

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

  agregarProducto(producto: Producto, cantidad: number = 1): void {
    const itemsActuales = [...this.itemsSignal()];
    const itemExistente = itemsActuales.find(i => i.producto.id === producto.id);

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

    this.itemsSignal.set(itemsActuales);
    this.guardarEnStorage();
  }

  actualizarCantidad(productoId: number, cantidad: number): void {
    if (cantidad <= 0) {
      this.eliminarProducto(productoId);
      return;
    }

    const itemsActuales = this.itemsSignal().map(item => {
      if (item.producto.id === productoId) {
        return {
          ...item,
          cantidad,
          subtotal: cantidad * item.producto.precio
        };
      }
      return item;
    });

    this.itemsSignal.set(itemsActuales);
    this.guardarEnStorage();
  }

  eliminarProducto(productoId: number): void {
    const itemsActuales = this.itemsSignal().filter(
      item => item.producto.id !== productoId
    );
    this.itemsSignal.set(itemsActuales);
    this.guardarEnStorage();
  }

  limpiar(): void {
    this.itemsSignal.set([]);
    localStorage.removeItem('colgas_carrito');
  }

  private guardarEnStorage(): void {
    localStorage.setItem('colgas_carrito', JSON.stringify(this.itemsSignal()));
  }

  private cargarDesdeStorage(): void {
    const data = localStorage.getItem('colgas_carrito');
    if (data) {
      try {
        this.itemsSignal.set(JSON.parse(data));
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      }
    }
  }
}
