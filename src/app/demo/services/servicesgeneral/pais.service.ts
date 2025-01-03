import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

import { Pais } from '../../models/modelsgeneral/paisviewmodel';
import { Respuesta } from 'src/app/demo/services/ServiceResult';

@Injectable({
  providedIn: 'root'
})
export class PaisService {
  // Propiedades privadas para la URL de la API y la clave API
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;

  // Endpoint específico para el controlador de países
  private pais = `${this.apiUrl}/api/Pais`;

  // Opciones HTTP, incluyendo encabezados con la clave API
  private options: {} = {
    headers: new HttpHeaders({
      'XApiKey': `${this.apiKey}`,
    })
  };

  // Constructor con inyección del servicio HttpClient
  constructor(private http: HttpClient) {}

  /**
   * Listar todos los países.
   * @returns Observable con la lista de países
   */
  Listar(): Observable<Pais[]> {
    return this.http.get<Pais[]>(`${this.pais}/Listar`, this.options);
  }

  /**
   * Listar todos los países utilizando promesas.
   * @returns Promesa con la lista de países
   */
  Listar2() {
    return this.http.get<any>(`${this.pais}/Listar`, this.options)
      .toPromise()
      .then((response) => response.data as Pais[])
      .then((data) => data);
  }

  /**
   * Buscar un país por su ID.
   * @param id - Identificador del país a buscar
   * @returns Observable con el país encontrado
   */
  Buscar(id: number): Observable<any> {
    return this.http.get<any>(`${this.pais}/Buscar/${id}`, this.options).pipe(
        map(result => result.data as Pais[])
      );
  }

  /**
   * Insertar un nuevo país.
   * @param modelo - Objeto Pais a insertar
   * @returns Observable con el resultado de la operación de inserción
   */
  Insertar(modelo: Pais): Observable<any> {
    console.log('Insertar modelo:', modelo); // Línea de depuración
    return this.http.post<any>(`${this.pais}/Insertar`, modelo, this.options);
  }

  /**
   * Actualizar un país existente.
   * @param modelo - Objeto Pais con los datos actualizados
   * @returns Observable con el resultado de la operación de actualización
   */
  Actualizar(modelo: Pais): Observable<any> {
    console.log('Actualizar modelo:', modelo); // Línea de depuración
    return this.http.put<any>(`${this.pais}/Actualizar`, modelo, this.options);
  }

  /**
   * Eliminar un país por su ID.
   * @param id - Identificador del país a eliminar
   * @returns Promesa con el resultado de la operación de eliminación
   */
  Eliminar(id: number) {
    return this.http.put<any>(`${this.pais}/Eliminar`, id, this.options)
      .toPromise();
  }
}
