import { Cliente } from "./cliente.models";
import { Producto } from "./producto.model";

export enum MetodoPago {
  EFECTIVO = 'EFECTIVO', 
  DAVIPLATA = 'DAVIPLATA',
  NEQUI = 'NEQUI',
  NU = 'NU',
  BANCOLOMBIA = 'BANCOLOMBIA'
}

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  EN_CAMINO = 'EN_CAMINO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO'
}

export interface ItemPedido {
  productoId?: number;  // Hacer opcional
  nombreProducto: string; // Agregar nombre como respaldo
  cantidad: number;
  precioUnitario: number; // Agregar precio para respaldo
}

export interface ItemPedidoResponse {
  id: number;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoRequest {
  nombreCliente: string;
  telefono: string;
  metodoPago: MetodoPago;
  pagaCon?: number;
  items: ItemPedido[];
  direccionEntrega?: string;
  latitud?: number;
  longitud?: number;
}

export interface PedidoResponse {
  id: number;
  cliente: Cliente;
  items: ItemPedidoResponse[];
  total: number;
  metodoPago: MetodoPago;
  pagaCon?: number;
  vueltas?: number;
  direccionEntrega?: string;
  latitud?: number;
  longitud?: number;
  estado: EstadoPedido;
  fechaPedido: string;
  mensajeWhatsApp: string;
  urlWhatsApp: string;
}
