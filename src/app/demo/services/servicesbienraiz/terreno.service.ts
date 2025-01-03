import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { environment } from 'src/environment/environment';
import { RespuestaServicio, Terreno ,ddldoc,ddlproyecto} from '../../models/modelsbienraiz/terrenoviewmodel';
import { Observable } from 'rxjs';
import { ciudad } from '../../models/modelsgeneral/ciudadviewmodel';


@Injectable({
  providedIn: 'root'
})
export class TerrenoService {

  constructor(private http: HttpClient) { }

  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private agenteBienRaizEncabezado = `${this.apiUrl}/api/Terreno`;
  private ciudadEncabezado = `${environment.apiUrl}/api/Ciudad`;
  private tipodocuEncabezado = `${environment.apiUrl}/api/DocumentoBienRaiz`;
  private proyectoAterreno = `${environment.apiUrl}/api/ProyectoContruccionBienRaiz`;
  private contruccionbienRaizEncabezado = `${this.apiUrl}/api/ProyectoContruccionBienRaiz`;
  private Proyecto = `${this.apiUrl}/api/Proyecto`;
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  
  Listar (){
    return this.http.get<Terreno[]>(`${this.agenteBienRaizEncabezado}/Listar`,this.getHttpOptions());
  }
  ListarProyectoContruccionBienRaiz(){
    return this.http.get<ddlproyecto[]>(`${this.Proyecto}/Listar`, this.getHttpOptions());
  }
  insertarProyectoContruccionBienRaiz(modelo :any): Observable<any> {
    return this.http.post<any>(`${this.contruccionbienRaizEncabezado}/Insertar`,modelo, this.getHttpOptions());
  }

  tipodocuemnto (){
    return this.http.get<ddldoc[]>(`${this.tipodocuEncabezado}/ListarTipoDocumento`,this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.agenteBienRaizEncabezado}/Insertar`,modelo, this.getHttpOptions());
  }

  BuscarTablaMaestra(id: number): Observable<any> {
    return this.http.get<any>(`${this.agenteBienRaizEncabezado}/DocumentoPorTerreno/${id}`, this.getHttpOptions());
  }

  InsertarproyectoAmodelo(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.proyectoAterreno}/Insertar`,modelo, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<Terreno>(`${this.agenteBienRaizEncabezado}/Actualizar`,modelo, this.getHttpOptions());
  }

  

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.agenteBienRaizEncabezado}/Eliminar?id=${id}`, this.getHttpOptions());
  }
  Desactivar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.agenteBienRaizEncabezado}/Desactivar?id=${id}`, this.getHttpOptions());
  }




}
