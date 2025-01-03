import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { environment } from 'src/environment/environment';
import { equiposeguridad } from '../../models/modelsproyecto/equiposeguridadviewmodel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class equiposeguridadService {

  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private EquipoSeguridadEncabezado = `${this.apiUrl}/api/EquipoSeguridad`;

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }
  
  Listar (){
    return this.http.get<equiposeguridad[]>(`${this.EquipoSeguridadEncabezado}/Listar`,this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.EquipoSeguridadEncabezado}/Insertar`,modelo, this.getHttpOptions());
  }

  Buscar(id: number): Observable<equiposeguridad> {
    return this.http.get<equiposeguridad>(`${this.EquipoSeguridadEncabezado}/Buscar/${id}`, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<equiposeguridad>(`${this.EquipoSeguridadEncabezado}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.EquipoSeguridadEncabezado}/Eliminar?id=${id}`, this.getHttpOptions());
  }


}

