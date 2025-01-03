import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { Etapa } from '../../models/modelsproyecto/etapaviewmodel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class EtapaService {

  constructor(private http: HttpClient) { }


  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private Etapa = `${this.apiUrl}/api/Etapa`;

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }
  
  Listar (){
    return this.http.get<Etapa[]>(`${this.Etapa}/Listar`,this.getHttpOptions());
  }

  Listar2(){
    return this.http.get<any>(`${this.Etapa}/Listar`,this.getHttpOptions())
      .toPromise()
      .then((data) => data as Etapa[])
      .then(data => data);
  }

  Buscar(id: number): Observable<Etapa> {
    return this.http.get<Etapa>(`${this.Etapa}/Buscar/${id}`, this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.Etapa}/Insertar`,modelo, this.getHttpOptions());
  }

  Insertar2(modelo:any){
    return this.http.post<any>(`${this.Etapa}/Insertar`,modelo, this.getHttpOptions())
      .toPromise();
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<any>(`${this.Etapa}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.Etapa}/Eliminar?id=${id}`, this.getHttpOptions());
  }
}
