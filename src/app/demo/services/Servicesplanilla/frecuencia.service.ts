import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { Frecuencia, FrecuenciaDDL } from '../../models/modelsplanilla/frecuenciaviewmodel';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FrecuenciaService {

  constructor(private http: HttpClient) { }

  // URL base de la API obtenida de las variables de entorno
  private apiUrl: string = environment.apiUrl;
  // Clave de la API obtenida de las variables de entorno
  private apiKey: string = environment.apiKey;
  // URL para el endpoint de frecuencia
  private frecuenciaEncabezado = `${this.apiUrl}/api/Frecuencia`;

  // Método privado para obtener las opciones HTTP, incluyendo las cabeceras
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  // Método para listar todas las frecuencias

  Listar() {
    return this.http.get<Frecuencia[]>(`${this.frecuenciaEncabezado}/Listar`, this.getHttpOptions());
  }


  ddl(): Observable<FrecuenciaDDL[]> {
    return this.http.get<FrecuenciaDDL[]>(`${this.frecuenciaEncabezado}/Listar`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError) // Manejo de errores
      );
  }

  // Método para buscar una frecuencia por su ID
  Buscar(id: number): Observable<Frecuencia> {
    return this.http.get<Frecuencia>(`${this.frecuenciaEncabezado}/Buscar/${id}`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError) // Manejo de errores
      );
  }

  // Método para insertar una nueva frecuencia
  Insertar(modelo: any): Observable<any> {
    return this.http.post<any>(`${this.frecuenciaEncabezado}/Insertar`, modelo, this.getHttpOptions())
      .pipe(
        catchError(this.handleError) // Manejo de errores
      );
  }

  // Método para actualizar una frecuencia existente
  Actualizar(modelo: any): Observable<any> {
    return this.http.put<any>(`${this.frecuenciaEncabezado}/Actualizar`, modelo, this.getHttpOptions())
      .pipe(
        catchError(this.handleError) // Manejo de errores
      );
  }

  // Método para eliminar una frecuencia por su ID
  Eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.frecuenciaEncabezado}/Eliminar/${id}`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError) // Manejo de errores
      );
  }

  // Método privado para manejar errores en las peticiones HTTP
  private handleError(error: HttpErrorResponse): Observable<any> {
    let errorMessage = 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error?.messageStatus || error.message}`;
    }
    return throwError({ codeStatus: -1, messageStatus: errorMessage });
  }

}
