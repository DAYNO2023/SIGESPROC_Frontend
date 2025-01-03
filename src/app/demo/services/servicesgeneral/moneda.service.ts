import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http'

import { environment } from 'src/environment/environment';

import { Moneda } from '../../models/modelsgeneral/monedaviewmodel';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonedaService {

  constructor(private http: HttpClient) { }

  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private Moneda = `${this.apiUrl}/api/Moneda`;



  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar (){
    return this.http.get<Moneda[]>(`${this.Moneda}/Listar`,this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.Moneda}/Insertar`,modelo, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<Moneda>(`${this.Moneda}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id: number): Observable<any> {
    return this.http.delete<void>(`${this.Moneda}/Eliminar?id=${id}`, this.getHttpOptions());
}

}
