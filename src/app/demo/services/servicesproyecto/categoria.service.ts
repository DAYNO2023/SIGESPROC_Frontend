import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'

import { Categoria } from '../../models/modelsproyecto/categoriaviewmodel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { Respuesta } from 'src/app/demo/services/ServiceResult';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  constructor(private http: HttpClient) { }

  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private Categoria = `${this.apiUrl}/api/Categoria`;

  private options: {} = {

    headers: new HttpHeaders({
      'XApiKey': `${this.apiKey}`
    })
  };

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }


  
  Listar (){
    return this.http.get<Categoria[]>(`${this.Categoria}/Listar`,this.getHttpOptions());
  }

  Buscar(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.Categoria}/Buscar/${id}`, this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.Categoria}/Insertar`,modelo, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<any>(`${this.Categoria}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id: number){
    return this.http.put<any>(`${this.Categoria}/Eliminar`,id, this.options).toPromise();
  }
}
