export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  fechaRegistro: string;
}
