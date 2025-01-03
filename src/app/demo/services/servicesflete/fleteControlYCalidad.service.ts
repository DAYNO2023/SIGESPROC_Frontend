import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { FleteControlCalidad } from '../../models/modelsflete/fletecontrolycalidadviewmodel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FleteControlCalidadService {


  constructor(private http: HttpClient) { }

  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private fleteControlCalidadEncabezado = `${this.apiUrl}/api/FleteControlCalidad`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar(): Observable<FleteControlCalidad[]> {
    return this.http.get<FleteControlCalidad[]>(`${this.fleteControlCalidadEncabezado}/Listar`, this.getHttpOptions());
  }

  Buscar(id: number): Observable<FleteControlCalidad> {
    return this.http.get<FleteControlCalidad>(`${this.fleteControlCalidadEncabezado}/Buscar/${id}`, this.getHttpOptions());
  }

  Insertar(modelo: FleteControlCalidad): Observable<any> {
    return this.http.post<any>(`${this.fleteControlCalidadEncabezado}/Insertar`, modelo, this.getHttpOptions());
  }


  Actualizar(modelo: FleteControlCalidad): Observable<any> {
    return this.http.put<any>(`${this.fleteControlCalidadEncabezado}/Actualizar`, modelo, this.getHttpOptions());
  }

  Eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.fleteControlCalidadEncabezado}/Eliminar?id=${id}`, this.getHttpOptions());
  }

  BuscarIncidencias(id: number): Observable<FleteControlCalidad> {
    return this.http.get<FleteControlCalidad>(`${this.fleteControlCalidadEncabezado}/BuscarIncidencias/${id}`, this.getHttpOptions());
  }
}