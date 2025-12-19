// ubicacion-service.ts - Versión Corregida
import { Injectable, inject } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular';
import { Coordenadas } from '../models/ubicacion.model';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {
  private platform = inject(Platform);

  async obtenerUbicacionActual(): Promise<Coordenadas> {
    try {
      console.log('📍 Iniciando obtención de ubicación...');

      // Verificar si estamos en un dispositivo nativo
      if (!this.platform.is('capacitor')) {
        console.log('⚠️ Ejecutando en navegador - usando navigator.geolocation');
        return await this.obtenerUbicacionNavegador();
      }

      // Para Android/iOS nativo
      console.log('📱 Ejecutando en dispositivo nativo - usando Capacitor Geolocation');

      // 1. Verificar permisos
      const permisos = await Geolocation.checkPermissions();
      console.log('📋 Permisos actuales:', permisos);

      if (permisos.location !== 'granted') {
        console.log('🔒 Solicitando permisos...');
        const solicitud = await Geolocation.requestPermissions();
        console.log('📋 Resultado de solicitud de permisos:', solicitud);

        if (solicitud.location !== 'granted') {
          throw new Error('Permiso de ubicación denegado por el usuario');
        }
      }

      // 2. Obtener ubicación con opciones mejoradas
      console.log('🎯 Obteniendo posición...');
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000, // 30 segundos
        maximumAge: 60000 // 1 minuto
      });

      console.log('✅ Ubicación obtenida exitosamente:', {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      });

      return {
        latitud: position.coords.latitude,
        longitud: position.coords.longitude,
        precision: position.coords.accuracy // Ahora es opcional
      };

    } catch (error: any) {
      console.error('❌ Error detallado al obtener ubicación:', {
        name: error.name,
        message: error.message,
        code: error.code
      });

      // Manejar errores específicos
      if (error.code === 1 || error.message?.includes('permission') || error.message?.includes('permiso')) {
        throw new Error('Permiso de ubicación denegado. Por favor, activa los permisos de ubicación en configuración.');
      } else if (error.code === 2 || error.code === 3 || error.message?.includes('GPS') || error.message?.includes('Position')) {
        throw new Error('No se pudo obtener la ubicación. Verifica que el GPS esté activado.');
      } else if (error.message?.includes('Timeout')) {
        throw new Error('Tiempo de espera agotado. Verifica tu conexión y GPS.');
      } else {
        throw new Error(`Error al obtener ubicación: ${error.message || 'Error desconocido'}`);
      }
    }
  }

  // Método alternativo para navegador
  private obtenerUbicacionNavegador(): Promise<Coordenadas> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada en este navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
            precision: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Error desconocido al obtener ubicación';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permiso de ubicación denegado';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Información de ubicación no disponible';
              break;
            case error.TIMEOUT:
              message = 'Tiempo de espera agotado';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000
        }
      );
    });
  }

  async verificarPermisos(): Promise<boolean> {
    try {
      if (!this.platform.is('capacitor')) {
        return new Promise((resolve) => {
          if (!navigator.permissions) {
            resolve(false);
            return;
          }

          navigator.permissions.query({ name: 'geolocation' as any })
            .then((result) => resolve(result.state === 'granted'))
            .catch(() => resolve(false));
        });
      }

      const permisos = await Geolocation.checkPermissions();
      return permisos.location === 'granted';
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  }
}
