import { Cliente } from "./cliente.models";

export enum EstadoExpreso {
  SOLICITADO = 'SOLICITADO',
  ASIGNADO = 'ASIGNADO',
  EN_CURSO = 'EN_CURSO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO'
}

export interface ExpresoCalculoRequest {
  latitudOrigen: number;
  longitudOrigen: number;
  latitudDestino: number;
  longitudDestino: number;
}

export interface ExpresoCalculo {
  distanciaKm: number;
  duracionMinutos: number;
  precioPorKm: number;
  precioTotal: number;
  rutaPolyline: string;
}

export interface ExpresoRequest {
  nombreCliente: string;
  telefono: string;
  latitudOrigen: number;
  longitudOrigen: number;
  direccionOrigen?: string;
  latitudDestino: number;
  longitudDestino: number;
  direccionDestino?: string;
}

export interface ExpresoResponse {
  id: number;
  cliente: Cliente;
  latitudOrigen: number;
  longitudOrigen: number;
  direccionOrigen?: string;
  latitudDestino: number;
  longitudDestino: number;
  direccionDestino?: string;
  distanciaKm: number;
  precioPorKm: number;
  precioTotal: number;
  duracionMinutos?: number;
  rutaPolyline?: string;
  estado: EstadoExpreso;
  fechaSolicitud: string;
  mensajeWhatsApp: string;
  urlWhatsApp: string;
}
