import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { UnidadMedida } from '../../models/modelsgeneral/unidadmedidaviewmodel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';


@Injectable({
  providedIn: 'root'
})
export class unidadMedidaService {

  constructor(private http: HttpClient) { }

  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private UnidadMedidaEncabezado = `${this.apiUrl}/api/UnidadMedida`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }
  
  Listar (){
    return this.http.get<UnidadMedida[]>(`${this.UnidadMedidaEncabezado}/Listar`,this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.UnidadMedidaEncabezado}/Insertar`,modelo, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<UnidadMedida>(`${this.UnidadMedidaEncabezado}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.UnidadMedidaEncabezado}/Eliminar?id=${id}`, this.getHttpOptions());
  }



}

