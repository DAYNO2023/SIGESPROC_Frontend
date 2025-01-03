import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { drop, subcategoria } from '../../models/modelsgeneral/subcategoriaviewmodel';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SubCategoriaService {

  constructor(private http: HttpClient) { }

  // URL base de la API obtenida de las variables de entorno
  private apiUrl: string = environment.apiUrl;
  // Clave de la API obtenida de las variables de entorno
  private apiKey: string = environment.apiKey;
  // URL para el endpoint de categoría
  private categoria = `${this.apiUrl}/api/Categoria`;
  // URL para el endpoint de subcategoría
  private subcategoriaEncabezado = `${this.apiUrl}/api/SubCategoria`;

  // Método privado para obtener las opciones HTTP, incluyendo las cabeceras
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`,
        'Content-Type': 'application/json'
      })
    };
  }

  // Método para listar todas las subcategorías
  Listar() {
    return this.http.get<subcategoria[]>(`${this.subcategoriaEncabezado}/Listar`, this.getHttpOptions());
  }


  // Método para buscar una subcategoría por su ID
  Buscar(id: number): Observable<subcategoria> {
    return this.http.get<subcategoria>(`${this.subcategoriaEncabezado}/Buscar/${id}`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError) // Manejo de errores
      );
  }

  // Método para insertar una nueva subcategoría
  Insertar(modelo: any): Observable<any> {
    return this.http.post<any>(`${this.subcategoriaEncabezado}/Insertar`, modelo, this.getHttpOptions())
      .pipe(
        catchError(this.handleError) // Manejo de errores
      );
  }

  // Método para actualizar una subcategoría existente
  Actualizar(modelo: any): Observable<any> {
    return this.http.put<any>(`${this.subcategoriaEncabezado}/Actualizar`, modelo, this.getHttpOptions())
      .pipe(
        catchError(this.handleError) // Manejo de errores
      );
  }

  // Método para eliminar una subcategoría por su ID
  Eliminar(id:number){
    return this.http.delete<any>(`${this.subcategoriaEncabezado}/Eliminar/${id}`, this.getHttpOptions()).toPromise();
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

  // Método para obtener la lista de categorías
  DROP(): Observable<drop[]> {
    return this.http.get<drop[]>(`${this.categoria}/Listar`, this.getHttpOptions());
  }
}
