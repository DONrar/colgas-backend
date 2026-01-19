import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../core/services/AuthService ';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener el token
  const token = authService.getToken();

  // Si hay token y la petición es a la API (no es login), agregar el header
  if (token && !req.url.includes('/auth/login')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor responde 401, la sesión expiró
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        // Limpiar sesión y redirigir al login
        authService.logout().subscribe();
        router.navigate(['/admin-login'], {
          queryParams: { expired: 'true' }
        });
      }
      return throwError(() => error);
    })
  );
};
