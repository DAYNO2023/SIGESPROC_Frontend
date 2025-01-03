import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'

import { mantenimiento } from '../../models/modelsbienraiz/mantenimientoViewModel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {

  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private mantenimientoEncabezado = `${this.apiUrl}/api/Mantenimiento`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar (){
    return this.http.get<mantenimiento[]>(`${this.mantenimientoEncabezado}/Listar`,this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.mantenimientoEncabezado}/Insertar`,modelo, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<mantenimiento>(`${this.mantenimientoEncabezado}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.mantenimientoEncabezado}/Eliminar?id=${id}`, this.getHttpOptions());
  }
}
