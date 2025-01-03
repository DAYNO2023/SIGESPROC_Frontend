import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'

import { Observable } from 'rxjs';
import { Rol } from '../../models/modelsacceso/rolviewmodel';
import { TreeNode } from 'primeng/api';
import { environment } from 'src/environment/environment';
import { PantallaPorRol } from '../../models/modelsacceso/pantallaporrolviewmodel';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private RolEncabezado = `${this.apiUrl}/api/Rol`;
  private PantallRolEncabezado = `${this.apiUrl}/api/PantallaPorRol`;





  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar() {
    return this.http.get<Rol[]>(`${this.RolEncabezado}/Listar`, this.getHttpOptions());
  }

  Buscar(id: number): Observable<PantallaPorRol> {
    return this.http.get<PantallaPorRol>(`${this.PantallRolEncabezado}/Buscar/${id}`, this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.RolEncabezado}/Insertar`,modelo, this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<Rol>(`${this.RolEncabezado}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number){
    return this.http.delete<any>(`${this.RolEncabezado}/Eliminar/${id}`, this.getHttpOptions()).toPromise();
  }




}

