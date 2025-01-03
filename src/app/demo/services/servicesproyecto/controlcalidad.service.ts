import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class  ControlCalidadService {
    private apiUrl: string = environment.apiUrl;
    private apiKey: string = environment.apiKey;
  
    constructor(private http: HttpClient) { }
    private Control = `${this.apiUrl}/api/ControlDeCalidad`;
    private images = `${this.apiUrl}/api/ImagenPorControlCalidad`

    private getHttpOptions() {
        return {
          headers: new HttpHeaders({
            'XApiKey': `${this.apiKey}`
          })
        };
      }

    Listar(): Observable<any> {
        return this.http.get<any>(`${this.Control}/Listar`, this.getHttpOptions());
    }

    ListarProyectosConControl(): Observable<any> {
      return this.http.get<any>(`${this.Control}/ListarProyectos`, this.getHttpOptions());
    }

    ListarControlCalidadPorProyectos(id : number): Observable<any> {
      return this.http.get<any>(`${this.Control}/ListarControlesPorProyecto/${id}`, this.getHttpOptions());
    }
ListarPorActividad(acet_Id: number): Observable<any> {
  return this.http.get<any>(`${this.Control}/ListarPorActividad/${acet_Id}`, this.getHttpOptions());
}

    Insertar(modelo:any):Observable<any>{
      return this.http.post<any>(`${this.Control}/Insertar`,modelo, this.getHttpOptions());
    }
    
    Actualizar(modelo:any):Observable<any>{
      return this.http.put<any>(`${this.Control}/Actualizar`,modelo, this.getHttpOptions());
    }

    ListarImages(coca_Id : number): Observable<any> {
      return this.http.get<any>(`${this.images}/Listar/${coca_Id}`, this.getHttpOptions());
   }

    InsertarImangenes(modelo:any):Observable<any>{
      return this.http.post<any>(`${this.images}/Insertar`,modelo, this.getHttpOptions());
    }
    
    Eliminar(id: number):Observable<any>{
      return this.http.delete<any>(`${this.Control}/Eliminar?id=${id}`, this.getHttpOptions());
    }
    
    Aprobar(id: number):Observable<any>{
      return this.http.get<any>(`${this.Control}/Aprobar?id=${id}`, this.getHttpOptions());
    }
    
    EliminarImagen(id:number):Observable<any>{
      return this.http.delete<any>(`${this.images}/Eliminar?id=${id}`, this.getHttpOptions());
    }
}