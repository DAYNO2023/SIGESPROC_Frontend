import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { environment } from 'src/environment/environment';
import { Estado,DropDownEstados, DropDownPaises } from '../../models/modelsgeneral/estadoviewmodel ';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class EstadoService {

  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;

  private Estado = `${this.apiUrl}/api/Estado`;
  private Pais = `${this.apiUrl}/api/Pais`;




  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  //  DropDown (){
  //   return this.http.get<DropDownEstados[]>(`${this.estadoEncabezado}/DropDownEstados`,this.getHttpOptions());
  // }

  Listar (){
    return this.http.get<Estado[]>(`${this.Estado}/Listar`,this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.Estado}/Insertar`,modelo, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<Estado>(`${this.Estado}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.Estado}/Eliminar?id=${id}`, this.getHttpOptions());
  }

  DropDown (){
    return this.http.get<DropDownEstados[]>(`${this.Estado}/Listar`,this.getHttpOptions());
  }

  DropDownPaises (){
    return this.http.get<DropDownPaises[]>(`${this.Pais}/DropDownPaises`,this.getHttpOptions());  //DropDownEstadosByCountry
  }

  DropDownEstadosByCountry (id:number){
    return this.http.post<any>(`${this.Estado}/EstadoPorPais/${id}`,null,this.getHttpOptions());  //DropDownEstadosByCountry
  }

  DropDownEstadosByCountry2 (id:number){
    return this.http.post<any>(`${this.Estado}/EstadoPorPais/${id}`,null,this.getHttpOptions())
        .toPromise()
        .then(data => data as Estado[])
        .then(data => data);  //DropDownEstadosByCountry
  }

}


