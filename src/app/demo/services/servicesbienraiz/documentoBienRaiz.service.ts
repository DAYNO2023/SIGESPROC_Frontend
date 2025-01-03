import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DocumentoBienRaiz } from '../../models/modelsbienraiz/documentobienraizviewmodel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentoBienRaizService {

  constructor(private http: HttpClient) { }

  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private documentoBienRaizEncabezado = `${this.apiUrl}/api/DocumentoBienRaiz`;

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar(): Observable<DocumentoBienRaiz[]> {
    return this.http.get<DocumentoBienRaiz[]>(`${this.documentoBienRaizEncabezado}/Listar`, this.getHttpOptions());
  }

  ListarPDF(id: number): Observable<DocumentoBienRaiz[]> {
    return this.http.get<DocumentoBienRaiz[]>(`${this.documentoBienRaizEncabezado}/ListarPDF/${id}`, this.getHttpOptions());
  }

  ListarImagen(id: number): Observable<DocumentoBienRaiz[]> {
    return this.http.get<DocumentoBienRaiz[]>(`${this.documentoBienRaizEncabezado}/ListarImagen/${id}`, this.getHttpOptions());
  }

  ListarWord(id: number): Observable<DocumentoBienRaiz[]> {
    return this.http.get<DocumentoBienRaiz[]>(`${this.documentoBienRaizEncabezado}/ListarWord/${id}`, this.getHttpOptions());
  }

  ListarOtros(id: number): Observable<DocumentoBienRaiz[]> {
    return this.http.get<DocumentoBienRaiz[]>(`${this.documentoBienRaizEncabezado}/ListarOtros/${id}`, this.getHttpOptions());
  }
  ListarWord2(id: number): Observable<DocumentoBienRaiz[]> {
    return this.http.get<DocumentoBienRaiz[]>(`${this.documentoBienRaizEncabezado}/ListarTerrenoWord/${id}`, this.getHttpOptions());
  }

  ListarOtros2(id: number): Observable<DocumentoBienRaiz[]> {
    return this.http.get<DocumentoBienRaiz[]>(`${this.documentoBienRaizEncabezado}/ListarTerrenoOtros/${id}`, this.getHttpOptions());
  }

  ListarExcel(id: number): Observable<DocumentoBienRaiz[]> {
    return this.http.get<DocumentoBienRaiz[]>(`${this.documentoBienRaizEncabezado}/ListarExcel/${id}`, this.getHttpOptions());
  }
  ListarTerrenoPDF(id: number): Observable<DocumentoBienRaiz[]> {
    return this.http.get<DocumentoBienRaiz[]>(`${this.documentoBienRaizEncabezado}/ListarTerrenoPDF/${id}`, this.getHttpOptions());
  }

  ListarTerrenoImagen(id: number): Observable<DocumentoBienRaiz[]> {
    return this.http.get<DocumentoBienRaiz[]>(`${this.documentoBienRaizEncabezado}/ListarTerrenoImagen/${id}`, this.getHttpOptions());
  }

  ListarTerrenoExcel(id: number): Observable<DocumentoBienRaiz[]> {
    return this.http.get<DocumentoBienRaiz[]>(`${this.documentoBienRaizEncabezado}/ListarTerrenoExcel/${id}`, this.getHttpOptions());
  }

  ListarTiposDocumento(): Observable<{ tido_Id: number, tido_Descripcion: string }[]> {
    return this.http.get<{ tido_Id: number, tido_Descripcion: string }[]>(`${this.documentoBienRaizEncabezado}/ListarTipoDocumento`, this.getHttpOptions());
  }

  Buscar(id: number): Observable<DocumentoBienRaiz> {
    return this.http.get<DocumentoBienRaiz>(`${this.documentoBienRaizEncabezado}/Buscar/${id}`, this.getHttpOptions());
  }

  Insertar(modelo: DocumentoBienRaiz): Observable<any> {
    return this.http.post<any>(`${this.documentoBienRaizEncabezado}/Insertar`, modelo, this.getHttpOptions());
  }

  Actualizar(modelo: DocumentoBienRaiz): Observable<any> {
    return this.http.put<any>(`${this.documentoBienRaizEncabezado}/Actualizar`, modelo, this.getHttpOptions());
  }

  Eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.documentoBienRaizEncabezado}/Eliminar?id=${id}`, this.getHttpOptions());
  }

  EliminarDocumentoterreno(id: number): Observable<any> {
    return this.http.delete<any>(`${this.documentoBienRaizEncabezado}/EliminarTerreno?id=${id}`, this.getHttpOptions());
  }
  
  EnviarImagen(formData: FormData): Observable<any> {
    console.log('FormData enviado:', formData.get('file')); 
    return this.http.post<any>(`${this.documentoBienRaizEncabezado}/Subir`, formData, {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    });
  }

  obtenerDocumentoPorTerrenoId(id: string): Observable<DocumentoBienRaiz> {
    return this.http.get<DocumentoBienRaiz>(`${this.documentoBienRaizEncabezado}/BuscarDocumentosPorTerreno/${id}`, this.getHttpOptions());
  }
}

