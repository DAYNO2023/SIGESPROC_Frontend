import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { TasaCambio } from '../../models/modelsgeneral/tasacambioviewmodel';
import { Observable } from 'rxjs';
import { Respuesta } from '../ServiceResult';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class TasaCambiosService {

  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private TasaCambio = `${this.apiUrl}/api/TasaCambio`;

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`,
        'Content-Type': 'application/json'  // Asegúrate de que este encabezado esté presente
      })
    };
  }

  Listar(): Observable<TasaCambio[]> {
    return this.http.get<TasaCambio[]>(`${this.TasaCambio}/Listar`, this.getHttpOptions());
  }

  Buscar(id: number): Observable<TasaCambio> {
    return this.http.get<TasaCambio>(`${this.TasaCambio}/Buscar/${id}`, this.getHttpOptions());
  }

  Insertar(modelo: any): Observable<any> {
    return this.http.post<any>(`${this.TasaCambio}/Insertar`, modelo, this.getHttpOptions());
  }

  Actualizar(modelo: TasaCambio): Observable<any> {
    console.log('Actualizar modelo:', modelo); // Línea de depuración
    return this.http.put<any>(`${this.TasaCambio}/Actualizar`, modelo, this.getHttpOptions());
  }

  Eliminar(id: number): Observable<Respuesta> {
    return this.http.delete<Respuesta>(`${this.TasaCambio}/Eliminar?id=${id}`, this.getHttpOptions());
  }
}
