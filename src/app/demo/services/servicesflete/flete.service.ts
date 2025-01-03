import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Usuario } from '../../models/modelsacceso/usuarioviewmodel';
import { Flete, Proyecto, Bodega } from '../../models/modelsflete/fleteviewmodel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class FleteService {

  constructor(private http: HttpClient) { }


  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private Flete = `${this.apiUrl}/api/FleteEncabezado`;
  private Empleado = `${this.apiUrl}/api/Empleado`;
  private Bodega = `${this.apiUrl}/api/Bodega`;
  private Proyecto = `${this.apiUrl}/api/Proyecto/Listar`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  subirComprobante(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<any>(`${this.Flete}/Subir`, formData, this.getHttpOptions());
  }



  Listar() {
    return this.http.get<Flete[]>(`${this.Flete}/Listar`, this.getHttpOptions());
  }
  Listarb(): Observable<Bodega[]> {
    return this.http.get<Bodega[]>(`${this.Bodega}/Listar`, this.getHttpOptions());
  }

  ListarEmpleados() {
    return this.http.get<Usuario[]>(`${this.Empleado}/Listar`, this.getHttpOptions());
  }

  ListarBodegas() {
    return this.http.get<any[]>(`${this.Bodega}/Listar`, this.getHttpOptions());
  }

  ListarBodegasSalida(): Observable<Bodega[]> {
    return this.http.get<Bodega[]>(`${this.apiUrl}/api/Bodega/Listar`, this.getHttpOptions());
  }


  ListarProyectos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.Proyecto}`, this.getHttpOptions());
  }

  Buscar(id: number): Observable<Flete> {
    return this.http.get<Flete>(`${this.Flete}/Buscar/${id}`, this.getHttpOptions());
  }

  Insertar(modelo: any): Observable<any> {
    return this.http.post<any>(`${this.Flete}/Insertar`, modelo, this.getHttpOptions());
  }

  Actualizar(modelo: Flete): Observable<any> {
    return this.http.put<any>(`${this.Flete}/Actualizar`, modelo, this.getHttpOptions());
  }
  Eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.Flete}/Eliminar/${id}`, this.getHttpOptions());
  }

  SubirDocumento(file: File): Promise<string> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<{ filePath: string }>(`${this.Flete}/SubirDocumento`, formData, this.getHttpOptions())
      .toPromise()
      .then(response => response.filePath)
      .catch(error => {
        throw error;
      });
  }

  CargarDocumento(path: string): Promise<Blob> {
    return this.http.get(`${this.apiUrl}/${path}`, { responseType: 'blob' })
      .toPromise();
  }




}