 import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { GoogleApiService, ExpresoCalculoResponse } from '../services/google-api-service';
import { firstValueFrom } from 'rxjs';
export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface TripInfo {
  distance: number; // en kilómetros
  duration: number; // en minutos
  pricePerKm: number;
  totalPrice: number;
  polyline?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeoLocationService {
 private startLocation: Location | null = null;
  private endLocation: Location | null = null;
  private currentTripInfo: TripInfo | null = null;

  constructor(private apiService: GoogleApiService) {}

  /**
   * Solicita permisos de ubicación y obtiene la posición actual
   */
  async getCurrentLocation(): Promise<Location> {
    try {
      // IMPORTANTE: Primero solicitar permisos explícitamente
      const permissionStatus = await Geolocation.checkPermissions();
      console.log('Estado de permisos:', permissionStatus);

      if (permissionStatus.location === 'denied') {
        throw new Error('Los permisos de ubicación fueron denegados');
      }

      if (permissionStatus.location !== 'granted') {
        console.log('Solicitando permisos de ubicación...');
        const requestResult = await Geolocation.requestPermissions();
        console.log('Resultado de solicitud:', requestResult);

        if (requestResult.location !== 'granted') {
          throw new Error('Debes permitir el acceso a la ubicación para usar esta función');
        }
      }

      console.log('Obteniendo posición actual...');
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000, // Aumentado a 15 segundos
        maximumAge: 0 // No usar ubicación en caché
      });

      console.log('Posición obtenida:', position);

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    } catch (error: any) {
      console.error('Error obteniendo ubicación:', error);

      // Mensajes de error más específicos
      if (error.message?.includes('denied')) {
        throw new Error('Los permisos de ubicación fueron denegados. Por favor, habilítalos en la configuración de la app.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('No se pudo obtener tu ubicación. Asegúrate de tener el GPS activado e intenta nuevamente.');
      } else if (error.message?.includes('unavailable')) {
        throw new Error('El servicio de ubicación no está disponible. Verifica que el GPS esté activado.');
      }

      throw new Error('No se pudo obtener la ubicación actual: ' + (error.message || 'Error desconocido'));
    }
  }

  setStartLocation(location: Location) {
    this.startLocation = location;
  }

  setEndLocation(location: Location) {
    this.endLocation = location;
  }

  getStartLocation(): Location | null {
    return this.startLocation;
  }

  getEndLocation(): Location | null {
    return this.endLocation;
  }

  async calculateTripInfo(): Promise<TripInfo | null> {
    if (!this.startLocation || !this.endLocation) {
      return null;
    }

    try {
      // Llamar al backend para calcular precio y ruta
      const response: ExpresoCalculoResponse = await firstValueFrom(
        this.apiService.calcularPrecio(
          this.startLocation.lat,
          this.startLocation.lng,
          this.endLocation.lat,
          this.endLocation.lng
        )
      );

      this.currentTripInfo = {
        distance: response.distanciaKm,
        duration: response.duracionMinutos,
        pricePerKm: response.precioPorKm,
        totalPrice: response.precioTotal,
        polyline: response.rutaPolyline
      };

      return this.currentTripInfo;
    } catch (error) {
      console.error('Error calculando información del viaje:', error);
      throw error;
    }
  }

  getCurrentTripInfo(): TripInfo | null {
    return this.currentTripInfo;
  }

  reset() {
    this.startLocation = null;
    this.endLocation = null;
    this.currentTripInfo = null;
  }
}
