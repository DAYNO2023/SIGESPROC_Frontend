import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UsuarioService } from '../demo/services/servicesacceso/usuario.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private cookieService: CookieService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Verificar si el usuario es administrador
    const isAdmin = this.cookieService.get('usua_Admin') === 'true';
    const roleId = this.cookieService.get('role_Id');

    // console.log('Admin:', isAdmin);
    // console.log('Requested URL:', state.url);

    // Si es administrador, permite el acceso
    if (isAdmin) {
      // console.log('Acceso permitido para Admin');
      return of(true); // El administrador tiene acceso a todas las rutas
    }

    // Verificar si el usuario tiene acceso a la pantalla solicitada
    const pantallasPermitidas = this.usuarioService.getPantallasPermitidas();
    // console.log('Pantallas permitidas:', pantallasPermitidas);

    const rutaSinBase = this.extraerRutaSinBase(state.url);
    const rutaNormalizadaprevia = this.normalizarCadena(rutaSinBase);
    const rutaNormalizada = rutaNormalizadaprevia.split(';')[0];
    // console.log("ENTRAAAAAA")
// Lógica de comparación con las pantallas permitidas
const isAllowed = pantallasPermitidas.some(pantalla => {
  const pantallaNormalizada = this.normalizarCadena(pantalla); 
  // console.log(`Comparando pantalla permitida: ${pantallaNormalizada} con URL: ${rutaNormalizada}`);
  return pantallaNormalizada.includes(rutaNormalizada) || rutaNormalizada.includes(pantallaNormalizada);
});

    if (isAllowed) {
      // console.log('Acceso permitido:', rutaSinBase);
      return of(true); // Si la pantalla está permitida, permite acceso
    } else {
      // console.log('Acceso denegado, redirigiendo al login.');
      this.router.navigate(['/auth/accessdenied']);
      return of(false); // Si no está permitida, redirige al login
    }
  }

// Extraer el último segmento de la URL
private extraerRutaSinBase(url: string): string {
  const segmentos = url.split('/');
  const ultimoSegmento = segmentos.pop() || ''; // Devolver el último segmento
  // console.log('Último segmento de la URL:', ultimoSegmento);
  return this.normalizarCadena(ultimoSegmento); // Normalizar el último segmento
}

// Normalizar la cadena para la comparación
private normalizarCadena(cadena: string): string {
  return cadena
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/\s+/g, "") // Eliminar todos los espacios
    .toLowerCase()
    .trim();
}
}
