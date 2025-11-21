import { Coordenadas } from "./ubicacion.model";

export interface InfoContacto {
  nombre: string;
  direccion: string;
  telefono: string;
  whatsapp: string;
  email?: string;
  ubicacion: Coordenadas;
  horario: string;
}
