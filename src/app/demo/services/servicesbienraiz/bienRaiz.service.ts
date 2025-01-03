import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { BienRaiz, ProyectoContruccionBienRaiz,ddldoc } from '../../models/modelsbienraiz/bienraizviewmodel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BienRaizService {

  constructor(private http: HttpClient) { }

  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private bienRaizEncabezado = `${this.apiUrl}/api/BienRaiz`;
  private contruccionbienRaizEncabezado = `${this.apiUrl}/api/ProyectoContruccionBienRaiz`;

  private tipodocuEncabezado = `${environment.apiUrl}/api/DocumentoBienRaiz`;

  private options: {} = {
    headers: new HttpHeaders({
      'XApiKey': `${this.apiKey}`,
    })
  };
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }
  ListarProyectoContruccionBienRaiz(): Observable<ProyectoContruccionBienRaiz[]> {
    return this.http.get<BienRaiz[]>(`${this.contruccionbienRaizEncabezado}/Listar`, this.getHttpOptions());
  }
  BuscarProyecto(id: number): Observable<BienRaiz> {
    return this.http.get<BienRaiz>(`${this.contruccionbienRaizEncabezado}/Buscar/${id}`, this.getHttpOptions());
  }

  Listar(): Observable<BienRaiz[]> {
    return this.http.get<BienRaiz[]>(`${this.bienRaizEncabezado}/Listar`, this.getHttpOptions());
  }

  Buscar(id: number): Observable<BienRaiz> {
    return this.http.get<BienRaiz>(`${this.bienRaizEncabezado}/Buscar/${id}`, this.getHttpOptions());
  }

  Insertar(modelo: BienRaiz): Observable<any> {
    return this.http.post<any>(`${this.bienRaizEncabezado}/Insertar`, modelo, this.getHttpOptions());
  }

  Actualizar(modelo: any): Observable<any> {
    return this.http.put<BienRaiz>(`${this.bienRaizEncabezado}/Actualizar`, modelo, this.getHttpOptions());
  }


  Eliminar(id: number){
    return this.http.put<any>(`${this.bienRaizEncabezado}/Eliminar`, id, this.options)
      .toPromise();
  }

  finalizar(id: number): Promise<any> {
    return this.http.put<any>(`${this.bienRaizEncabezado}/Desactivar`, id, this.getHttpOptions()).toPromise();
  }
  

  BuscarTablaMaestra(id: number): Observable<any> {
    return this.http.get<any>(`${this.bienRaizEncabezado}/DocumentoPorBienRaiz/${id}`, this.getHttpOptions());
  }
  private apimagenUrl = 'https://api.imgbb.com/1/upload';
  private apiimagenKey = '200fe8447d77c936db33a6d227daf243';


  uploadImage(image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('key', this.apiimagenKey);

    return this.http.post(this.apimagenUrl, formData);
}
tipodocuemnto (){
  return this.http.get<ddldoc[]>(`${this.tipodocuEncabezado}/ListarTipoDocumento`,this.getHttpOptions());
}

}
