import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Coordenadas } from '../models/ubicacion.model';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {

  async obtenerUbicacionActual(): Promise<Coordenadas> {
    try {
      const permiso = await Geolocation.checkPermissions();

      if (permiso.location !== 'granted') {
        const solicitud = await Geolocation.requestPermissions();
        if (solicitud.location !== 'granted') {
          throw new Error('Permiso de ubicación denegado');
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      return {
        latitud: position.coords.latitude,
        longitud: position.coords.longitude
      };
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      throw error;
    }
  }

  async verificarPermisos(): Promise<boolean> {
    const permiso = await Geolocation.checkPermissions();
    return permiso.location === 'granted';
  }
}
