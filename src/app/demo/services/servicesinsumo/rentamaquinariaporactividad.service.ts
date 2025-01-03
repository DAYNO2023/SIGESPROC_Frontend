import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';
import { RentaMaquinariaPorActividad } from '../../models/modelsinsumo/rentamaquinariaporactividadviewmodel';

@Injectable({
  providedIn: 'root'
})
export class RentaMaquinariaPorActividadService {
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private options: {} = {
    headers: new HttpHeaders({
      'XApiKey': `${this.apiKey}`,
    })
  };

  constructor(
    private http: HttpClient
  ) {}

  Eliminar(id: number){
    return this.http.delete<any>(`${this.apiUrl}/api/Eliminar/${id}`, this.options)
      .toPromise();
  }

  Buscar(id: number){
    return this.http.post<any>(`${this.apiUrl}/api/Buscar`, id, this.options)
      .toPromise()
      .then(result => result.data as RentaMaquinariaPorActividad)
      .then(data => data);
  }

  Insertar(modelo: RentaMaquinariaPorActividad){
    return this.http.post<any>(`${this.apiUrl}/api/Insertar`, modelo, this.options)
      .toPromise();
  }

  Listar(){
    return this.http.get<any>(`${this.apiUrl}/api/Listar`, this.options)
      .toPromise() 
      .then(result => result.data as RentaMaquinariaPorActividad[])
      .then(data => data);
  }

  Actualizar(modelo: RentaMaquinariaPorActividad){
    return this.http.put<any>(`${this.apiUrl}/api/Actualizar`, modelo, this.options)
      .toPromise();
  }
}