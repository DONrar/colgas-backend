// ubicacion.model.ts
export interface Coordenadas {
  latitud: number;
  longitud: number;
  precision?: number; // Hacerlo opcional
}

export interface Ubicacion extends Coordenadas {
  direccion?: string;
}
