import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  nombre?: string;
  username?: string;
  expiracion?: string;
}

export interface AdminUser {
  username: string;
  nombre: string;
  token: string;
  expiracion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl + '/auth';
  private readonly STORAGE_KEY = 'admin_session';

  private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
  public currentUser$: Observable<AdminUser | null> = this.currentUserSubject.asObservable();

  constructor() {
    this.verificarSesionGuardada();
  }

  /**
   * Verifica si hay una sesión guardada y si sigue siendo válida
   */
  private verificarSesionGuardada(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored) as AdminUser;

        // Verificar si el token ha expirado localmente
        if (user.expiracion && new Date(user.expiracion) > new Date()) {
          this.currentUserSubject.next(user);
          // Validar con el servidor en segundo plano
          this.validarTokenEnServidor(user.token);
        } else {
          // Token expirado, limpiar
          this.limpiarSesion();
        }
      } catch {
        this.limpiarSesion();
      }
    }
  }

  /**
   * Valida el token con el servidor
   */
  private validarTokenEnServidor(token: string): void {
    this.http.get<any>(`${this.API_URL}/validar`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      catchError(() => {
        this.limpiarSesion();
        return of(null);
      })
    ).subscribe(response => {
      if (response && !response.valid) {
        this.limpiarSesion();
      }
    });
  }

  /**
   * Realiza el login contra el backend
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = { username, password };

    return this.http.post<LoginResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => {
        if (response.success && response.token) {
          const user: AdminUser = {
            username: response.username!,
            nombre: response.nombre!,
            token: response.token,
            expiracion: response.expiracion!
          };
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      }),
      catchError(error => {
        const errorResponse: LoginResponse = {
          success: false,
          message: error.error?.message || 'Error de conexión con el servidor'
        };
        return of(errorResponse);
      })
    );
  }

  /**
   * Cierra la sesión
   */
  logout(): Observable<any> {
    const user = this.currentUserSubject.value;

    if (user?.token) {
      return this.http.post(`${this.API_URL}/logout`, {}, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      }).pipe(
        tap(() => this.limpiarSesion()),
        catchError(() => {
          this.limpiarSesion();
          return of({ success: true });
        })
      );
    }

    this.limpiarSesion();
    return of({ success: true });
  }

  /**
   * Limpia la sesión local
   */
  private limpiarSesion(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;

    // Verificar expiración local
    if (user.expiracion && new Date(user.expiracion) <= new Date()) {
      this.limpiarSesion();
      return false;
    }

    return true;
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return this.currentUserSubject.value?.token || null;
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): AdminUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Valida la sesión con el servidor (para usar en el guard)
   */
  validarSesion(): Observable<boolean> {
    const token = this.getToken();

    if (!token) {
      return of(false);
    }

    return this.http.get<{ valid: boolean; message: string }>(`${this.API_URL}/validar`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(response => {
        if (!response.valid) {
          this.limpiarSesion();
        }
        return response.valid;
      }),
      catchError(() => {
        this.limpiarSesion();
        return of(false);
      })
    );
  }
}
