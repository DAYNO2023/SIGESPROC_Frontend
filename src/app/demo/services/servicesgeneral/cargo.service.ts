import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { environment } from 'src/environment/environment';
import { Cargo } from '../../models/modelsgeneral/cargoviewmodel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CargoService {

  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private Cargo = `${this.apiUrl}/api/Cargo`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar (){
    return this.http.get<Cargo[]>(`${this.Cargo}/Listar`,this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.Cargo}/Insertar`,modelo, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<Cargo>(`${this.Cargo}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.Cargo}/Eliminar?id=${id}`, this.getHttpOptions());
  }
  
  Eliminar2(id:number){
    return this.http.delete<any>(`${this.Cargo}/Eliminar?id=${id}`, this.getHttpOptions())
      .toPromise();
  }
}
