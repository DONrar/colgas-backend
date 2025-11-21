import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  guardar(clave: string, valor: any): void {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch (error) {
      console.error('Error al guardar en storage:', error);
    }
  }

  obtener<T>(clave: string): T | null {
    try {
      const data = localStorage.getItem(clave);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error al leer storage:', error);
      return null;
    }
  }

  eliminar(clave: string): void {
    localStorage.removeItem(clave);
  }

  limpiar(): void {
    localStorage.clear();
  }
}
