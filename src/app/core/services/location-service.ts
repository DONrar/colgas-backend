// src/app/core/services/location-service.ts
import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface TripInfo {
  origin: Location;
  destination: Location;
  distance: number;
  duration: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly PRICE_PER_KM = 2000; // Precio por kilómetro en COP

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

  async checkPermissions(): Promise<boolean> {
    try {
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        return request.location === 'granted';
      }
      return true;
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  }

  async searchLocation(query: string): Promise<Location | null> {
    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      const result = await geocoder.geocode({ address: query });

      if (result.results && result.results.length > 0) {
        const location = result.results[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng(),
          address: result.results[0].formatted_address
        };
      }
      return null;
    } catch (error) {
      console.error('Error buscando ubicación:', error);
      return null;
    }
  }

  async calculateRoute(origin: Location, destination: Location): Promise<TripInfo | null> {
    try {
      const directionsService = new (window as any).google.maps.DirectionsService();

      const result = await directionsService.route({
        origin: new (window as any).google.maps.LatLng(origin.lat, origin.lng),
        destination: new (window as any).google.maps.LatLng(destination.lat, destination.lng),
        travelMode: (window as any).google.maps.TravelMode.DRIVING
      });

      if (result.routes && result.routes.length > 0) {
        const route = result.routes[0].legs[0];
        const distanceKm = route.distance!.value / 1000;
        const durationMin = route.duration!.value / 60;
        const price = distanceKm * this.PRICE_PER_KM;

        return {
          origin,
          destination,
          distance: distanceKm,
          duration: durationMin,
          price
        };
      }
      return null;
    } catch (error) {
      console.error('Error calculando ruta:', error);
      return null;
    }
  }

  formatWhatsAppMessage(tripInfo: TripInfo, clientName: string, clientPhone: string): string {
    const message = `🚗 SOLICITUD DE VIAJE
📱 Cliente: ${clientName}
📞 Tel: ${clientPhone}
📍 Origen: https://www.google.com/maps?q=${tripInfo.origin.lat},${tripInfo.origin.lng}
🎯 Destino: https://www.google.com/maps?q=${tripInfo.destination.lat},${tripInfo.destination.lng}
📏 Distancia: ${tripInfo.distance.toFixed(2)} km
⏱️ Duración: ${Math.round(tripInfo.duration)} minutos
💰 Precio: $${tripInfo.price.toLocaleString('es-CO')} COP`;

    return encodeURIComponent(message);
  }

  sendToWhatsApp(message: string, phoneNumber: string) {
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  }
}
