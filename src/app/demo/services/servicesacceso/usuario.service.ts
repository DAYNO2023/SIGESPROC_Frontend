import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../../models/modelsacceso/usuarioviewmodel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { Respuesta } from '../ServiceResult';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private usuarioActual: Usuario[] = [];
  private pantallasPermitidas: { pant_Descripcion: string }[] = []; // Manejo de pantallas

  constructor(private http: HttpClient) { 
        // Cargar pantallas permitidas desde LocalStorage al iniciar el servicio
        const pantallasGuardadas = localStorage.getItem('pantallasPermitidas');
        if (pantallasGuardadas) {
          this.pantallasPermitidas = JSON.parse(pantallasGuardadas);
        }
  }

  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private EmpleadoEncabezado = `${this.apiUrl}/api/Empleado`;
  private UsuarioEncabezado = `${this.apiUrl}/api/Usuario`;

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  ListarEmpleados(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.EmpleadoEncabezado}/Listar`, this.getHttpOptions());
  }

  Listar(): Promise<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.UsuarioEncabezado}/Listar`, this.getHttpOptions()).toPromise();
  }

  UsuarioBuscar(id: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.UsuarioEncabezado}/Buscar/${id}`, this.getHttpOptions());
  }

  ReestablecerContra(id: number, clave: string, nueva: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.UsuarioEncabezado}/RestablecerFlutter/${id}/${clave}/${nueva}`, this.getHttpOptions());
  }

  IniciarSesionWeb(user: string, clave: string): Promise<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.UsuarioEncabezado}/InicioSesion/${user}/${clave}`, this.getHttpOptions()).toPromise();
  }

  ReestablecerCorreo(id: number, correo: string): Observable<any> {
    return this.http.get(`${this.UsuarioEncabezado}/RestablecerCorreo/${id}/${correo}`, this.getHttpOptions());
  }

  ReestablecerCorreoWeb (id: number , correo: string, usuario: string){
    return this.http.get(`${this.UsuarioEncabezado}/RestablecerContraWebb/`+id+`/`+correo+`/`+usuario+``,

      {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            XApiKey: `${this.apiKey}`,
        }),
      }

    )
  }

  VerificarCodigoReestablecerWeb (id: number , codigo: number){
    return this.http.get(`${this.UsuarioEncabezado}/VerificarCodigoReestablecerWeb/`+id+`/`+codigo+``,

      {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            XApiKey: `${this.apiKey}`,
        }),
      }

    )
  }

  Insertar(modelo: any): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.UsuarioEncabezado}/Insertar`, modelo, this.getHttpOptions());
  }

  Actualizar(modelo: any): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${this.UsuarioEncabezado}/Actualizar`, modelo, this.getHttpOptions());
  }

  Reestablecer(modelo: any): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${this.UsuarioEncabezado}/Reestablecer`, modelo, this.getHttpOptions());
  }

  Eliminar(id: number, observacion: any): Observable<any> {
    return this.http.delete<any>(`${this.UsuarioEncabezado}/Eliminar?id=${id}&name=${encodeURIComponent(observacion)}`, this.getHttpOptions());
  }
  


  // Método para obtener pantallas permitidas desde la sesión activa
  async obtenerPantallasPermitidasDesdeSesion(roleId: string): Promise<void> {
    try {
      const pantallas = await this.http.get<{ pant_Descripcion: string }[]>(`${this.UsuarioEncabezado}/ObtenerPantallasPorRole/${roleId}`, this.getHttpOptions()).toPromise();

 

      this.setPantallasPermitidas(pantallas);
      localStorage.setItem('pantallasPermitidas', JSON.stringify(pantallas));

    } catch (error) {

    }
  }

  setPantallasPermitidas(pantallas: { pant_Descripcion: string }[]) {
    this.pantallasPermitidas = pantallas;
  }

  getPantallasPermitidas(): string[] {
    return this.pantallasPermitidas.map(p => p.pant_Descripcion.toLowerCase().trim());
  }

  // Manejo de usuario actual
  setUsuarioActual(usuario: Usuario[]) {
    this.usuarioActual = usuario;
  }

  getUsuarioActual(): Usuario[] {
    return this.usuarioActual;
  }

  




}
