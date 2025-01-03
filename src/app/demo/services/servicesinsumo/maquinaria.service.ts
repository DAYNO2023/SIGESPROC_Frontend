import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { Maquinaria, MaquinariaCrud } from '../../models/modelsinsumo/maquinariaviewmodel';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class  MaquinariaService {

  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;

  constructor(private http: HttpClient) { }
  private Maquinaria = `${this.apiUrl}/api/Maquinaria`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }
  
  Listar (){
    return  this.http.get<MaquinariaCrud[]>(`${this. Maquinaria}/Listar`,this.getHttpOptions()).toPromise();
  }

  Buscar(id: number): Observable< Maquinaria> {
    return this.http.get< Maquinaria>(`${this. Maquinaria}/Buscar/${id}`, this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this. Maquinaria}/Insertar`,modelo, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<Maquinaria>(`${this.Maquinaria}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number){
    return this.http.delete<any>(`${this. Maquinaria}/Eliminar?id=${id}`, this.getHttpOptions()).toPromise();
  }
}
