import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { environment } from 'src/environment/environment';
import { DropDownEstadoCivil, EstadoCivil } from '../../models/modelsgeneral/estadoCivilviewmodel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadoCivilService {

  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private EstadoCivil = `${this.apiUrl}/api/EstadoCivil`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar (){
    return this.http.get<EstadoCivil[]>(`${this.EstadoCivil}/Listar`,this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.EstadoCivil}/Insertar`,modelo, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<EstadoCivil>(`${this.EstadoCivil}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.EstadoCivil}/Eliminar?id=${id}`, this.getHttpOptions());
  }

  DropDown (){
return this.http.get<DropDownEstadoCivil[]>(`${this.EstadoCivil}/DropDownEstadoCivil`,this.getHttpOptions());
} 
}
