import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { CostoActividad } from '../../models/modelsplanilla/costopoactividadviewmodel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { UnidadMedida } from '../../models/modelsgeneral/unidadmedidaviewmodel';
import { Actividad } from '../../models/modelsproyecto/actividadviewmodel';

@Injectable({
    providedIn: 'root'
  })
  export class costoActivadService {
  
    constructor(private http: HttpClient) { }
  
    private apiUrl: string = environment.apiUrl;
    private apiKey: string = environment.apiKey;
    private CostoActividadEncabezado = `${this.apiUrl}/api/CostoPorActividad`;
  
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
    ListarUM (){
      return this.http.get<UnidadMedida[]>(`${this.apiUrl}/api/UnidadMedida/Listar`,this.getHttpOptions());
    }
    ListarActividad (){
      return this.http.get<Actividad[]>(`${this.apiUrl}/api/Actividade/Listar`,this.getHttpOptions());
    }
    Listar (){
      return this.http.get<CostoActividad[]>(`${this.CostoActividadEncabezado}/Listar`,this.getHttpOptions()).toPromise();
    }
    
  
    Insertar(modelo:any):Observable<any>{
      return this.http.post<any>(`${this.CostoActividadEncabezado}/Insertar`,modelo, this.getHttpOptions());
    }
  
    Actualizar(modelo:any):Observable<any>{
      return this.http.put<CostoActividad>(`${this.CostoActividadEncabezado}/Actualizar`,modelo, this.getHttpOptions());
    }
  
 
  
    Eliminar(id: number){
      return this.http.put<any>(`${this.CostoActividadEncabezado}/Eliminar`, id, this.options)
        .toPromise();
    }
  
  
  }
  
  