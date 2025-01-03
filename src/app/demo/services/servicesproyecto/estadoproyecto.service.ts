import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { environment } from 'src/environment/environment';
import { estadoproyecto } from '../../models/modelsproyecto/estadoproyectoviewmodel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class estadoproyectoService {


  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private EstadoProyectoEncabezado = `${this.apiUrl}/api/EstadoProyecto`;

 
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }
  
  Listar (){
    return this.http.get<estadoproyecto[]>(`${this.EstadoProyectoEncabezado}/Listar`,this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.EstadoProyectoEncabezado}/Insertar`,modelo, this.getHttpOptions());
  }
  Buscar(id: number): Observable<estadoproyecto> {
    return this.http.get<estadoproyecto>(`${this.EstadoProyectoEncabezado}/Buscar/${id}`, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<estadoproyecto>(`${this.EstadoProyectoEncabezado}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.EstadoProyectoEncabezado}/Eliminar?id=${id}`, this.getHttpOptions());
  }


}

