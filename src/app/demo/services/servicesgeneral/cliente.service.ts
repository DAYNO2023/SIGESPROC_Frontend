import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { Cliente } from '../../models/modelsgeneral/clienteviewmodel';

import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(private http: HttpClient) { }
  private apiKey: string = environment.apiKey;
  private apiUrl: string = environment.apiUrl;
  private Cliente = `${this.apiUrl}/api/Cliente`;
  private clienteprocesoventa = `${this.apiUrl}/api/Mantenimiento`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar (){
    return this.http.get<Cliente[]>(`${this.Cliente}/Listar`,this.getHttpOptions());
  }

  BuscarClientePorDNI(dni: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.clienteprocesoventa}/Buscar/${dni}`, this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.Cliente}/Insertar`,modelo, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<Cliente>(`${this.Cliente}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.Cliente}/Eliminar?id=${id}`, this.getHttpOptions());
  }

  Eliminar2(id:number){
    return this.http.delete<any>(`${this.Cliente}/Eliminar?id=${id}`, this.getHttpOptions())
    .toPromise();
  }
}
