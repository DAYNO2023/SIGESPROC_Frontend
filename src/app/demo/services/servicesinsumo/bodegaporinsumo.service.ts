import { BodegaPorInsumo } from '../../models/modelsinsumo/bodegaporinsumoviewmodel'; 
import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class BodegaPorInsumoService {

  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;

  constructor(private http: HttpClient) { }
  private BodegaPorInsumo = `${this.apiUrl}/api/BodegaPorInsumo`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }
  
  Listar (id: number){
    console.log("id = " + id);
    return this.http.get<BodegaPorInsumo[]>(`${this.BodegaPorInsumo}/Listar?id=${id}`,this.getHttpOptions());
  }

  Buscar(id: number): Observable<any> {
    return this.http.get<any>(`${this.BodegaPorInsumo}/Buscar/${id}`, this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.BodegaPorInsumo}/Insertar`,modelo, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<BodegaPorInsumo>(`${this.BodegaPorInsumo}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.BodegaPorInsumo}/Eliminar?id=${id}`, this.getHttpOptions());
  }
}
