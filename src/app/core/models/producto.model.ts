export enum TipoProducto {
  PIPETA = 'PIPETA',
  ACCESORIO = 'ACCESORIO',
  REPUESTO = 'REPUESTO'
}

export interface Producto {
  id?: number;           // Opcional - se genera en el backend
  nombre: string;
  tipo: TipoProducto;
  peso?: string;
  precio: number;
  imagen?: string;
  stock?: number;
  descripcion?: string;
  activo?: boolean;      // Opcional - por defecto true en el backend
}
