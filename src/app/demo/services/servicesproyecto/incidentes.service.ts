import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'

import { incidentes , Imagenes } from '../../models/modelsproyecto/incidentesviewmodel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class incidentesService {

  constructor(private http: HttpClient) { }


  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private incidentes = `${this.apiUrl}/api/Incidente`;
  private imagenes = `${this.apiUrl}/api/ImagenPorIncidente`;
  private documentoBienRaizEncabezado = `${this.apiUrl}/api/DocumentoBienRaiz`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar (id: number){
    return this.http.get<incidentes[]>(`${this.incidentes}/Listar/${id}`,this.getHttpOptions());
  }


  ListarProyectosConControl(): Observable<any> {
    return this.http.get<any>(`${this.incidentes}/ListarProyectosIncidente`, this.getHttpOptions());
  }

  ListarControlCalidadPorProyectos(id : number): Observable<any> {
    return this.http.get<any>(`${this.incidentes}/ListarIncidentesPorProyecto/${id}`, this.getHttpOptions());
  }


  Buscar(id: number): Observable<incidentes> {
    return this.http.get<incidentes>(`${this.incidentes}/Buscar/${id}`, this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.incidentes}/Insertar`,modelo, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<any>(`${this.incidentes}/Actualizar`,modelo, this.getHttpOptions());
  }

  // Eliminar(id:number):Observable<any>{
  //   return this.http.delete<any>(`${this.incidentes}/Eliminar?id=${id}`, this.getHttpOptions());
  // }

  
  Eliminar2(id:number){
    return this.http.delete<any>(`${this.incidentes}/Eliminar?id=${id}`, this.getHttpOptions())
    .toPromise();
  }


  //Imagenes
  InsertarImagenes(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.imagenes}/Insertar`,modelo, this.getHttpOptions());
  }

 
  EnviarImagen(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.documentoBienRaizEncabezado}/Subir`, formData, {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    });
  }
  
  ActualizarImagenes(modelo:any):Observable<any>{
    return this.http.put<any>(`${this.imagenes}/Actualizar`,modelo, this.getHttpOptions());
  }


  EliminarImagenes(id:number):Observable<any>{
    return this.http.delete<any>(`${this.imagenes}/Eliminar?id=${id}`, this.getHttpOptions());
  }



  
}
