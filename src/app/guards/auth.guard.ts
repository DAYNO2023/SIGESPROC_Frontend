import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    public cookieService: CookieService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Verificar si el usuario está logueado usando role_Id o usua_Admin
    const roleId = this.cookieService.get('role_Id');
    const isAdmin = this.cookieService.get('usua_Admin');

    const isLoggedIn = !!(roleId || isAdmin);

    // Debugging para ver las cookies en consola
    // console.log('El admin del usuario es:', isAdmin);
    // console.log('El rol del usuario es:', roleId);
    // console.log('Is Logged In:', isLoggedIn);

    // Si el usuario no está logueado, redirige al login
    if (!isLoggedIn) {
      
      // console.log('Access denied, redirecting to login.');
      this.router.navigate(['/auth/login']); // Redirige a la página de inicio de sesión
      return false;
    }

    return true; // Si está autenticado, permite el acceso
  }
}
