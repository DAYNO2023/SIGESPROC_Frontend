import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'

import { Actividad } from '../../models/modelsproyecto/actividadviewmodel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {

  constructor(private http: HttpClient) { }


  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private Actividad = `${this.apiUrl}/api/Actividade`;

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar (){
    return this.http.get<Actividad[]>(`${this.Actividad}/Listar`,this.getHttpOptions());
  }

  Buscar(id: number): Observable<Actividad> {
    return this.http.get<Actividad>(`${this.Actividad}/Buscar/${id}`, this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.Actividad}/Insertar`,modelo, this.getHttpOptions());
  }

  Insertar2(modelo:any){
    return this.http.post<any>(`${this.Actividad}/Insertar`,modelo, this.getHttpOptions())
      .toPromise();
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<any>(`${this.Actividad}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.Actividad}/Eliminar?id=${id}`, this.getHttpOptions());
  }
}
