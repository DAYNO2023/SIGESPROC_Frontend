import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'

import { DDL, ddlempresa, EstadisticasFletes_Comparacion, EstadisticasFletes_Llegada, ReporteComparacionMonetaria, ReporteComparativoProductos, ReportecomprasPendientesEnvio, ReporteComprasRealizadas, ReporteCotizacionesPorRangoPrecios, ReporteEmpleadoPorEstado, ReporteFletesPorFecha, ReporteHistorialCotizaciones, ReporteHistorialPagosPorProyecto, ReporteInsumosAProyecto, ReporteInsumosBodega, ReporteInsumosTransportadosPorActividad, ReporteInsumosUltimoPrecio, ReportePorUbicacion, ReporteProcesoVenta, ReporteProgresoActividades, ReporteTerrenoFechaCreracion, ReporteTerrenosPorEstadoProyecto, ReporteVentasPorEmpresa} from '../../models/ModelReporte/ReporteViewModel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { firstValueFrom } from 'rxjs';
import { ActividadPorEtapa, Proyecto } from '../../models/modelsflete/fleteviewmodel';

@Injectable({
  providedIn: 'root'
})
export class reporteService {

  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private ReporteEncabezado = `${this.apiUrl}/api/Reporte`;
  private Proyecto = `${this.apiUrl}/api/Proyecto/Listar`;
  private ActividadPorEtapaUrl = `${this.apiUrl}/api/ActividadPorEtapa`;
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  GetReporteventas(fechaInicio: string, fechaFinal: string): Observable<ReporteTerrenoFechaCreracion[]> {
    // Construye la URL de la API con los parámetros
    const url = `${this.apiUrl}/ReporteTerrenoFechaCreacion/${fechaInicio},${fechaFinal}`;
    return this.http.get<ReporteTerrenoFechaCreracion[]>(url, this.getHttpOptions());
  }
  Getreporteterreno(fechaInicio: string, fechaFinal: string): Observable<ReporteTerrenoFechaCreracion[]> {
    return this.http.get<ReporteTerrenoFechaCreracion[]>(`${this.ReporteEncabezado}/ReporteTerrenoFechaCreacion/${fechaInicio},${fechaFinal}`, this.getHttpOptions());
  }

  GetReporteTerrenosPorEstadoProyecto(fechaInicio: string, fechaFinal: string, tipo: boolean): Observable<ReporteTerrenosPorEstadoProyecto[]> {
    return this.http.get<ReporteTerrenosPorEstadoProyecto[]>(`${this.ReporteEncabezado}/ReporteTerrenosPorEstadoProyecto/${fechaInicio},${fechaFinal},${tipo}`, this.getHttpOptions());
  }
  GEtReporteVentasPorEmpresa(empresa: number): Observable<ReporteVentasPorEmpresa[]> {
    return this.http.get<ReporteVentasPorEmpresa[]>(`${this.ReporteEncabezado}/ReporteVentasPorEmpresa/${empresa}`, this.getHttpOptions());
  }

  Listar (){
    return this.http.get<ddlempresa[]>(`${this.ReporteEncabezado}/DropDownEmpresa`,this.getHttpOptions());
  }
  GetReporteEmpleadoPorEstado(estado: boolean): Observable<ReporteEmpleadoPorEstado[]> {
    return this.http.get<ReporteEmpleadoPorEstado[]>(`${this.ReporteEncabezado}/ReporteEmpleadoPorEstado/${estado}`, this.getHttpOptions());
  }

  GetReporteFletesPorFecha(fechainicio : string, fechafin: string): Observable<ReporteFletesPorFecha[]> {
    return this.http.get<ReporteFletesPorFecha[]>(`${this.ReporteEncabezado}/ReporteFletesPorFecha/${fechainicio},${fechafin}`, this.getHttpOptions());
  }
  GetReporteHistorialCotizaciones(fechainicio : string, fechafin: string,id : number,todo : boolean ): Observable<ReporteHistorialCotizaciones[]> {
    return this.http.get<ReporteHistorialCotizaciones[]>(`${this.ReporteEncabezado}/ReporteHistorialCotizaciones/${fechainicio},${fechafin},${id},${todo}`, this.getHttpOptions());
  }
  ListarProveedor (){
    return this.http.get<ddlempresa[]>(`${this.ReporteEncabezado}/DropDownProveedor`,this.getHttpOptions());
  }
  GetReporteComprasRealizadas(fechainicio : string, fechafin: string ): Observable<ReporteComprasRealizadas[]> {
    return this.http.get<ReporteComprasRealizadas[]>(`${this.ReporteEncabezado}/ReporteComprasRealizadas/${fechainicio},${fechafin}`, this.getHttpOptions());
  }
  GetReporteComparacionMonetaria(proy_Id : number ): Observable<ReporteComparacionMonetaria[]> {
    return this.http.get<ReporteComparacionMonetaria[]>(`${this.ReporteEncabezado}/ReporteComparacionMonetaria/${proy_Id}`, this.getHttpOptions());
  }
  ListarProyecto (){
    return this.http.get<DDL[]>(`${this.ReporteEncabezado}/DropDownProyecto`,this.getHttpOptions());
  }
  Listartasacambio (){
    return this.http.get<DDL[]>(`${this.ReporteEncabezado}/DropDownTasaCambio`,this.getHttpOptions());
  }
  GetReporteCotizacionesPorRangoPrecios(tipo: number, precio: string, mostrar: boolean): Observable<ReporteCotizacionesPorRangoPrecios[]> {
    return this.http.get<ReporteCotizacionesPorRangoPrecios[]>(`${this.ReporteEncabezado}/ReporteCotizacionesPorRangoPrecios/${tipo}/${precio}/${mostrar}`, this.getHttpOptions());
  }
  GetReporteInsumosBodega(fechainicio: string, fechafin: string): Observable<ReporteInsumosBodega[]> {
    return this.http.get<ReporteInsumosBodega[]>(`${this.ReporteEncabezado}/ReporteInsumosBodega/${fechainicio},${fechafin}`, this.getHttpOptions());
  }
  GetReporteInsumosAProyecto(fechainicio: string, fechafin: string): Observable<ReporteInsumosAProyecto[]> {
    return this.http.get<ReporteInsumosAProyecto[]>(`${this.ReporteEncabezado}/ReporteInsumosAProyecto/${fechainicio},${fechafin}`, this.getHttpOptions());
  }
  GetReporteHistorialPagosPorProyecto(fechainicio: string, fechafin: string, Proy_id: number): Observable<ReporteHistorialPagosPorProyecto[]> {
    return this.http.get<ReporteHistorialPagosPorProyecto[]>(`${this.ReporteEncabezado}/ReporteHistorialPagosPorProyecto/${fechainicio},${fechafin},${Proy_id}`, this.getHttpOptions());
  }
  GetReporteComparativoProductos(tipo: number): Observable<ReporteComparativoProductos[]> {
    return this.http.get<ReporteComparativoProductos[]>(`${this.ReporteEncabezado}/ReporteComparativoProductos/${tipo}`, this.getHttpOptions());
  }
  GetReportecomprasPendientesEnvio(fechainicio: string, fechafin: string): Observable<ReportecomprasPendientesEnvio[]> {
    return this.http.get<ReportecomprasPendientesEnvio[]>(`${this.ReporteEncabezado}/ReportecomprasPendientesEnvio/${fechainicio},${fechafin}`, this.getHttpOptions());
  }
  GetReporteProgresoActividades( Proy_id: number,fechainicio: string, fechafin: string): Observable<ReporteProgresoActividades[]> {
    return this.http.get<ReporteProgresoActividades[]>(`${this.ReporteEncabezado}/ReporteProgresoActividades/${Proy_id},${fechainicio},${fechafin}`, this.getHttpOptions());
  }
  GetReportePorUbicacion(ubicacion: boolean): Observable<ReportePorUbicacion[]> {
    return this.http.get<ReportePorUbicacion[]>(`${this.ReporteEncabezado}/ReportePorUbicacion/${ubicacion}`, this.getHttpOptions());
  }
  GetEstadisticasFletes_Comparacion(flen_Id: number ): Observable<EstadisticasFletes_Comparacion[]> {
    return this.http.get<EstadisticasFletes_Comparacion[]>(`${this.ReporteEncabezado}/EstadisticasFletes_Comparacion/${flen_Id}`, this.getHttpOptions());
  }
  GetReporteProcesoVenta(tipo: number,estado: boolean): Observable<ReporteProcesoVenta[]> {
    return this.http.get<ReporteProcesoVenta[]>(`${this.ReporteEncabezado}/ReporteProcesoVenta/${tipo},${estado}`, this.getHttpOptions());
  }
  GetEstadisticasFletes_Llegada(fechainicio: string, fechafin: string): Observable<EstadisticasFletes_Llegada[]> {
    return this.http.get<EstadisticasFletes_Llegada[]>(`${this.ReporteEncabezado}/EstadisticasFletes_Llegada/${fechainicio},${fechafin}`, this.getHttpOptions());
  }
  GetReporteInsumosTransportadosPorActividad(fechainicio: string, fechafin: string, ActividadId: number): Observable<ReporteInsumosTransportadosPorActividad[]> {
    return this.http.get<ReporteInsumosTransportadosPorActividad[]>(`${this.ReporteEncabezado}/ReporteInsumosTransportadosPorActividad/${fechainicio},${fechafin},${ActividadId}`, this.getHttpOptions());
  }
  GetReporteInsumosUltimoPrecio(numeroCompra: string): Observable<ReporteInsumosUltimoPrecio[]> {
    return this.http.get<ReporteInsumosUltimoPrecio[]>(`${this.ReporteEncabezado}/ReporteInsumosUltimoPrecio/${numeroCompra}`, this.getHttpOptions());
  }
  ListarCompra (){
    return this.http.get<DDL[]>(`${this.ReporteEncabezado}/DropCompra`,this.getHttpOptions());
  }
  Listarflete (){
    return this.http.get<DDL[]>(`${this.ReporteEncabezado}/DropDownFletes`,this.getHttpOptions());
  }
  ListarActividad (){
    return this.http.get<DDL[]>(`${this.ReporteEncabezado}/DropActividades`,this.getHttpOptions());
  }
ListarEtapa(id: number) {
  return this.http.get<DDL[]>(`${this.ReporteEncabezado}/DropActividades/${id}`, this.getHttpOptions());
}

  ListarProyectos(): Promise<Proyecto[]> {
    return firstValueFrom(
      this.http.get<Proyecto[]>(`${this.Proyecto}`, this.getHttpOptions())
    );
  }
  ListarActividadesPorEtapa(): Observable<ActividadPorEtapa[]> {
    return this.http.get<ActividadPorEtapa[]>(`${this.ActividadPorEtapaUrl}/ListarActividad`, this.getHttpOptions());
  }
  GetReporteArticuloActividad(id: Number, eleccion: Number): Observable<any[]> {
    return this.http.get<any[]>(`${this.ReporteEncabezado}/ReporteArticulosActividades/${id},${eleccion}`, this.getHttpOptions());
  }
}
