import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { environment } from 'src/environment/environment';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class graficosServices {

  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private dashboard = `${this.apiUrl}/api/Dashboard`;
  private proyecto = `${this.apiUrl}/api/Proyecto`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }
//cotizaciones
  ListarTotalComprasMes (){
    return this.http.get<any[]>(`${this.dashboard}/DashboardTotalesComprasMensuales`,this.getHttpOptions());
  }

  ListarTopProveedores (){
    return this.http.get<any[]>(`${this.dashboard}/DashboardTop5Proveedores`,this.getHttpOptions());
  }

  ListarTop5GlobaldeArticulos (){
    return this.http.get<any[]>(`${this.dashboard}/DashboardTop5ArticulosCompradoss`,this.getHttpOptions());
  }

  ListarTop5deCadaArticulos (){
    return this.http.get<any[]>(`${this.dashboard}/DashboardTop5ArticulosporcadaCompradoss`,this.getHttpOptions());
  }

  //Proyectos
  ListarProyectosMayorPresupuesto (){
    return this.http.get<any[]>(`${this.dashboard}/DashboardTop5ProyectosMayorPresupuesto`,this.getHttpOptions());
  }

  DashboardIncidenciasPorMes (){
    return this.http.get<any[]>(`${this.dashboard}/DashboardIncidenciasPorMes`,this.getHttpOptions());
  }

  ListarProyectos (){
    return this.http.get<any[]>(`${this.proyecto}/Listar`,this.getHttpOptions());
  }

  ListarProyectosPorDepartamentos (){
    return this.http.get<any[]>(`${this.dashboard}/DashboardProyectosPorDepartamentos`,this.getHttpOptions());
  }


//fletes
  Listartasaincidenciasfletes (){
    return this.http.get<any[]>(`${this.dashboard}/DashboardFletesTasaIncidencias`,this.getHttpOptions());
  }

  ListarTopBodegas (){
    return this.http.get<any[]>(`${this.dashboard}/DashboardTop5BodegasDestino`,this.getHttpOptions());
  }

  ListarProyectosmasEnviados (){
    return this.http.get<any[]>(`${this.dashboard}/DashboardProyectosRelacionados`,this.getHttpOptions());
  }
  

  //Bienes raices
  ListarVentasPorAgentes (){
    return this.http.get<any[]>(`${this.dashboard}/DashboardVentasPorAgente`,this.getHttpOptions());
  }

  ListarTerrenosVendidos (){
    return this.http.get<any[]>(`${this.dashboard}/DashboardTerrenosPorMees`,this.getHttpOptions());
  }

  ListarBienraiz (){
    return this.http.get<any[]>(`${this.dashboard}/DashboardcomparativoBienraiz`,this.getHttpOptions());
  }

}
