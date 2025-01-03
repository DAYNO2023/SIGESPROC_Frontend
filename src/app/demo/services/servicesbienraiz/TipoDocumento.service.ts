import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'

import { tipodocumento } from '../../models/modelsbienraiz/TipoDocumentoViewModel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoDocumentoService {

  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private TipodocumentoEncabezado = `${this.apiUrl}/api/TipoDocumento`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar (){
    return this.http.get<tipodocumento[]>(`${this.TipodocumentoEncabezado}/Listar`,this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.TipodocumentoEncabezado}/Insertar`,modelo, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<tipodocumento>(`${this.TipodocumentoEncabezado}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.TipodocumentoEncabezado}/Eliminar?id=${id}`, this.getHttpOptions());
  }
}
