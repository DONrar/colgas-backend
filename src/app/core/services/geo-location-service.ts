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
}

@Injectable({
  providedIn: 'root',
})
export class GeoLocationService {
  private startLocation: Location | null = null;
  private endLocation: Location | null = null;
  private currentTripInfo: TripInfo | null = null;

  constructor(private apiService: GoogleApiService) {}

  async getCurrentLocation(): Promise<Location> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      throw new Error('No se pudo obtener la ubicación actual');
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
