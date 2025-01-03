import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { Bodega } from '../../models/modelsinsumo/bodegaviewmodel';

@Injectable({
  providedIn: 'root'
})
export class BodegaService {

  // Constructor con inyección del servicio HttpClient
  constructor(private http: HttpClient) { }

  // URL base de la API, obtenida del archivo de configuración del entorno
  private apiUrl: string = environment.apiUrl;

  // Clave API, obtenida del archivo de configuración del entorno
  private apiKey: string = environment.apiKey;

  // Endpoint específico para bodegas
  private Bodega = `${this.apiUrl}/api/Bodega`;

  // Opciones HTTP, incluyendo encabezados con la clave API
  private options: {} = {
    headers: new HttpHeaders({
      'XApiKey': `${this.apiKey}`,
    })
  };

  /**
   * Listar todas las bodegas
   * @returns Observable con la lista de bodegas
   */
  Listar(): Observable<any> {
    return this.http.get<any>(`${this.Bodega}/Listar`, this.options);
  }

  
  BuscarTablaMaestra(id: number): Observable<any> {
    return this.http.get<any>(`${this.Bodega}/BuscarInsumosEquipoSeguridad/${id}`, this.options);
  }
  /**
   * Buscar una bodega por su ID
   * @param id - Identificador de la bodega a buscar
   * @returns Observable con la bodega encontrada
   */
  Buscar(id: number): Observable<Bodega> {
    return this.http.get<any>(`${this.Bodega}/Buscar/${id}`, this.options).pipe(
        map(result => result.data as Bodega)
      );
  }

  /**
   * Insertar una nueva bodega
   * @param modelo - Objeto Bodega a insertar
   * @returns Observable con el resultado de la operación de inserción
   */
  Insertar(modelo: any): Observable<any> {
    return this.http.post<any>(`${this.Bodega}/Insertar`, modelo, this.options);
  }

  /**
   * Actualizar una bodega existente
   * @param modelo - Objeto Bodega con los datos actualizados
   * @returns Observable con el resultado de la operación de actualización
   */
  Actualizar(modelo: any): Observable<any> {
    return this.http.put<any>(`${this.Bodega}/Actualizar`, modelo, this.options);
  }

  /**
   * Eliminar una bodega por su ID
   * @param id - Identificador de la bodega a eliminar
   * @returns Promesa con el resultado de la operación de eliminación
   */
  Eliminar(id: number): Promise<any> {
    return this.http.put<any>(`${this.Bodega}/Eliminar`, id, this.options).toPromise();
  }

  BuscarTablaBodega(id: number, bode: number): Observable<any> {
    return this.http.get<any>(`${this.Bodega}/ListarInsumos/${id},${bode}`, this.options);
  }
}
