import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { Maquinaria, MaquinariaCrud } from '../../models/modelsinsumo/maquinariaviewmodel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class  GestionAdicionalService {
    private apiUrl: string = environment.apiUrl;
    private apiKey: string = environment.apiKey;

    constructor(private http: HttpClient) { }
    private Gestion = `${this.apiUrl}/api/GestionAdicional`;
    private images = `${this.apiUrl}/api/ImagenPorGestionAdicional`

    private getHttpOptions() {
        return {
          headers: new HttpHeaders({
            'XApiKey': `${this.apiKey}`
          })
        };
      }

      getApiUrl(): string {
        return this.apiUrl;
      }

    Listar(): Observable<any> {
        return this.http.get<any>(`${this.Gestion}/Listar`, this.getHttpOptions());
    }

    Insertar(modelo:any):Observable<any>{
      return this.http.post<any>(`${this.Gestion}/Insertar`,modelo, this.getHttpOptions());
    }

    Actualizar(modelo:any):Observable<any>{
      return this.http.put<any>(`${this.Gestion}/Actualizar`,modelo, this.getHttpOptions());
    }

    ListarImages(adic_Id : number): Observable<any> {
      return this.http.get<any>(`${this.images}/Listar/${adic_Id}`, this.getHttpOptions());
  }

    InsertarImangenes(modelo:any):Observable<any>{
      return this.http.post<any>(`${this.images}/Insertar`,modelo, this.getHttpOptions());
    }

    Eliminar(id: number):Observable<any>{
      return this.http.delete<any>(`${this.Gestion}/Eliminar?id=${id}`, this.getHttpOptions());
    }

    EliminarImagen(id:number):Observable<any>{
      return this.http.delete<any>(`${this.images}/Eliminar/${id}`, this.getHttpOptions());
    }
}
