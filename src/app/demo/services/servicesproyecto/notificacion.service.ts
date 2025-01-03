import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Maquinaria, MaquinariaCrud } from '../../models/modelsinsumo/maquinariaviewmodel';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environment/environment';
import { Usuario } from '../../models/modelsacceso/usuarioviewmodel';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class  NotificacionesService {
    private apiUrl: string = environment.apiUrl;
    private apiKey: string = environment.apiKey;
    private UsuarioEncabezado = `${this.apiUrl}/api/Usuario`;

    constructor(private http: HttpClient) { }
    private Notificacion = `${this.apiUrl}/api/Notificacion`;
    private Alerta = `${this.apiUrl}/api/Alerta`;
    private Pantallas = `${this.apiUrl}/api/Pantalla`;
    private NotificacionesPorUsuario =`${this.apiUrl}/api/NotificacionAlertaPorUsuario` ;
    private getHttpOptions() {
        return {
          headers: new HttpHeaders({
            'XApiKey': `${this.apiKey}`
          })
        };
    }

    ListarUsuarios (){
        return this.http.get<Usuario[]>(`${this.UsuarioEncabezado}/ListarNotificacion`,this.getHttpOptions());
      }

      ListarUsuariosAwait (){
        return this.http.get<Usuario[]>(`${this.UsuarioEncabezado}/ListarNotificacion`,this.getHttpOptions()).toPromise();
      }

      Buscar(id: number): Observable<any> {
        return this.http.get<any>(`${this.Notificacion}/Buscar/${id}`, this.getHttpOptions());
      }

    Listar(): Observable<any> {
        return this.http.get<any>(`${this.Notificacion}/Listar`, this.getHttpOptions());
    }

    ListarIndex(): Observable<any> {
        return this.http.get<any>(`${this.Notificacion}/ListarNotificaciones`, this.getHttpOptions());
    }


    ListarPantallas(): Observable<any> {
        return this.http.get<any>(`${this.Pantallas}/Listar`, this.getHttpOptions());
    }

    Eliminar(id:number):Observable<any>{
        return this.http.delete<any>(`${this.Notificacion}/Eliminar?id=${id}`, this.getHttpOptions());
      }


    ListarTipos(): Observable<any> {
      return this.http.get<any>(`${this.Notificacion}/ListarTipos`, this.getHttpOptions());
  }

    Contar(): Observable<any> {
        return this.http.get<any>(`${this.Notificacion}/Contar`, this.getHttpOptions());
    }

    Insertar(modelo:any): Observable<any> {
        return this.http.post<any>(`${this.Notificacion}/Insertar`,modelo, this.getHttpOptions());
    }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {

          errorMessage = `Error: ${error.error.message}`;
        } else {

          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(errorMessage);
      }

    InsertarNotificacion(detalles: any[]): Observable<any> {
        return this.http.post<any>(`${this.Notificacion}/InsertarNotificaciones`, detalles, this.getHttpOptions())
        .pipe(catchError(this.handleError));
      }

      InsertarAlerta(detalles: any[]): Observable<any> {
        return this.http.post<any>(`${this.Alerta}/InsertarAlertas`, detalles, this.getHttpOptions())
        .pipe(catchError(this.handleError));
      }


    BuscarPorUsuario(usua_Id : number): Observable<any>{
      return this.http.get<any>(`${this.NotificacionesPorUsuario}/BuscarNotificacion/${usua_Id}`, this.getHttpOptions());
    }

    Leer(napu_Id : number): Observable<any> {
      return this.http.get<any>(`${this.NotificacionesPorUsuario}/Leer/${napu_Id}`, this.getHttpOptions());
  }

  ListarTokens() : Observable<any>{
    return this.http.get<any>(`${this.NotificacionesPorUsuario}/ListarTokens`, this.getHttpOptions());
  }
  ListarTokensUsuario(usua_Id : number) : Observable<any>{
    return this.http.get<any>(`${this.NotificacionesPorUsuario}/ListarTokensPorUsuario/${usua_Id}`, this.getHttpOptions());
  }

  InsertarTokens(modelo :any ): Observable<any> {
    return this.http.post<any>(`${this.NotificacionesPorUsuario}/InsertarToken`,modelo, this.getHttpOptions());
}

EliminarToken(usua_Id :number, token: string ): Observable<any> {
  return this.http.delete<any>(`${this.NotificacionesPorUsuario}/EliminarToken?id=${usua_Id}&token=${token}`, this.getHttpOptions());
}

}
