import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { environment } from 'src/environment/environment';
import { Estado,DropDownEstados, DropDownPaises } from '../../models/modelsgeneral/estadoviewmodel ';
import { Observable } from 'rxjs';
import { AgenteBienRaiz, AgenteBienRaiz2 } from '../../models/modelsbienraiz/agentebienraizviewmodel';

import { Respuesta } from '../ServiceResult';

@Injectable({
  providedIn: 'root'
})


export class DashboardService {
    constructor(private http: HttpClient) { }
    private apiUrl: string = environment.apiUrl;
    private apiKey: string = environment.apiKey;
    private dashboard = `${this.apiUrl}/api/Dashboard`;
    private agenteBienRaizEncabezado = `${this.apiUrl}/api/AgenteBienesRaices`;
    private Estado = `${this.apiUrl}/api/Estado`;

    private getHttpOptions() {
        return {
          headers: new HttpHeaders({
            'XApiKey': `${this.apiKey}`
          })
        };
      }

        // Lista todos los agentes de bienes raíces.
  Listar(): Observable<any[]> {
    return this.http.get<any[]>(`${this.agenteBienRaizEncabezado}/Listar`, this.getHttpOptions());
  }

 UbicacionesCompra (fechainicio : string, fechafin: string ): Observable<any> {
  return this.http.get<any>(`${this.dashboard}/TopDestinosCompras/${fechainicio},${fechafin}`, this.getHttpOptions());
}

  ComprasRealizadas(fechainicio : string, fechafin: string ): Observable<any> {
    return this.http.get<any>(`${this.dashboard}/DashboardTotalesComprasPorFecha/${fechainicio},${fechafin}`, this.getHttpOptions());
  }

  ProveedoreMasComprados (fechainicio : string, fechafin: string ): Observable<any> {
    return this.http.get<any>(`${this.dashboard}/ProveedoresMasComprados/${fechainicio},${fechafin}`, this.getHttpOptions());
  }

  IncidenciasPorfechas (fechainicio : string, fechafin: string ): Observable<any> {
    return this.http.get<any>(`${this.dashboard}/IncidenciasPorfechas/${fechainicio},${fechafin}`, this.getHttpOptions());
  }


  MayorCostoPorFechas (fechainicio : string, fechafin: string ): Observable<any> {
    return this.http.get<any>(`${this.dashboard}/MayorCostoPorFechas/${fechainicio},${fechafin}`, this.getHttpOptions());
  }

  ProyectosconMayorCostoporDepartamento (id: number): Observable<any>{
    return this.http.get<any>(`${this.dashboard}/ProyectosconMayorCostoporDepartamento/${id}`,this.getHttpOptions());
  }


  UbicacionesFletes (fechaInicio: string, fechaFin : string): Observable<any>{
    return this.http.get<any>(`${this.dashboard}/Top5BodegasDestino/${fechaInicio},${fechaFin}`,this.getHttpOptions());
  }

  IncidentesFletes (fechaInicio: string, fechaFin : string): Observable<any>{
    return this.http.get<any>(`${this.dashboard}/TasaIncidenciasMesFletes/${fechaInicio},${fechaFin}`,this.getHttpOptions());
  }



  VentasPorAgente (fechaInicio: string, fechaFin : string): Observable<any>{
    return this.http.get<any>(`${this.dashboard}/TotalesVentasPorAgente/${fechaInicio},${fechaFin}`,this.getHttpOptions());
  }
  VentasTerrenosPorMes (fechainicio : string, fechafin: string ): Observable<any>{
    return this.http.get<any>(`${this.dashboard}/TotalesTerrenos/${fechainicio},${fechafin}`,this.getHttpOptions());
  }
  VentaBienesRaicePorFecha (fechainicio : string, fechafin: string): Observable<any>{
    return this.http.get<any>(`${this.dashboard}/TotalesVentaBienesRaices/${fechainicio},${fechafin}`,this.getHttpOptions());
  }
  IncidentesActividades (): Observable<any>{
    return this.http.get<any>(`${this.dashboard}/DashboardIncidenciasPorMes`,this.getHttpOptions());
  }
  DeudasPorEmpleado (id: number): Observable<any>{
    return this.http.get<any>(`${this.dashboard}/DashboardDeudasPorEmpleado/${id}`,this.getHttpOptions());
  }
  PagosJefeObra (fechainicio : string, fechafin: string): Observable<any>{
    return this.http.get<any>(`${this.dashboard}/PagosJefesdeObra/${fechainicio},${fechafin}`,this.getHttpOptions());
  }
  BancosMasAcreditados (fechainicio : string, fechafin: string): Observable<any>{
    return this.http.get<any>(`${this.dashboard}/TopBancosMasAcreditados/${fechainicio},${fechafin}`,this.getHttpOptions());
  }
  TotalPlanillaAnual (fechaactual: string): Observable<any>{
    return this.http.get<any>(`${this.dashboard}/TotalAnual/${fechaactual}`,this.getHttpOptions());
  }
 FletesAsociadosProyecto (fechaInicio: string, fechaFin : string): Observable<any>{
    return this.http.get<any>(`${this.dashboard}/ProyectosRelacionadosFletes/${fechaInicio},${fechaFin}`,this.getHttpOptions());
  }
  TotalesBienRaiz (fechaInicio: string, fechaFin : string): Observable<any>{
    return this.http.get<any>(`${this.dashboard}/TotalesVendidosNovendidos/${fechaInicio},${fechaFin}`,this.getHttpOptions());
  }


  JefesdeObra (): Observable<any>{
    return this.http.get<any>(`${this.dashboard}/JefesObra`,this.getHttpOptions());
  }

  Listarestados (){
    return this.http.get<Estado[]>(`${this.Estado}/Listar`,this.getHttpOptions());
  }
}
