import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { Documento } from '../../models/modelsproyecto/proyectoviewmodel';

@Injectable({providedIn: 'root'})
export class DocumentoService {
    // Propiedades
    private apiUrl: string = environment.apiUrl;
    private apiKey: string = environment.apiKey;
    private options: {} = {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`,
      })
    };
    constructor(private http: HttpClient) { }
    
    // Endpoints
    Eliminar(id: number){
        return this.http.put<any>(`${this.apiUrl}/api/Documento/Eliminar/${id}`, null, this.options)
          .toPromise();
    }

    Buscar(id: number){
        return this.http.post<any>(`${this.apiUrl}/api/Documento/Buscar/${id}`, null, this.options)
          .toPromise()
          .then(result => result.data as Documento)
          .then(data => data);
    }

    Insertar(modelo: Documento){
        return this.http.post<any>(`${this.apiUrl}/api/Documento/Insertar`, modelo, this.options)
          .toPromise();
    }

    Listar(id?: number){
        return this.http.get<any>(`${this.apiUrl}/api/Documento/Listar/${id}`, this.options)
          .toPromise()
          .then(result => result.data as Documento[])
          .then(data => data);
    }

    Actualizar(modelo: Documento){
        return this.http.put<any>(`${this.apiUrl}/api/Documento/Actualizar`, modelo, this.options)
          .toPromise();
    }

    SubirDocumento(file: File) {
      const formData: FormData = new FormData();
      formData.append('file', file, file.name);
  
      return this.http.post<any>(`${this.apiUrl}/api/Documento/SubirDocumento`, formData, this.options)
        .toPromise()
        .then(response => response.filePath);
    }

    CargarDocumento(path: string): Promise<Blob> {
      return this.http.get(`${this.apiUrl}/${path}`, { responseType: 'blob' })
          .toPromise();
  }
}