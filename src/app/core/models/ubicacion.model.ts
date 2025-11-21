export interface Coordenadas {
  latitud: number;
  longitud: number;
}

export interface Ubicacion extends Coordenadas {
  direccion?: string;
}
