import { Producto } from "./producto.model";

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

export interface Carrito {
  items: ItemCarrito[];
  total: number;
  cantidadTotal: number;
}
