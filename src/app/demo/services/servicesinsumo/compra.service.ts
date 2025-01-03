import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environment/environment';
import { CompraEncabezado, CompraDetalle, autocompleteEmpleado } from '../../models/modelsinsumo/compraviewmodel';

@Injectable({
  providedIn: 'root'
})
export class CompraService {

  private apiUrl: string = environment.apiUrl; //Link de url del servidor
  private apiKey: string = environment.apiKey; //Llave de la api

  private Compra = `${this.apiUrl}/api/CompraEncabezado`; //Link de la api de el controlador de compra encabezado
  private CompraDetalle = `${this.apiUrl}/api/CompraDetalle`; //Link de la api de el controlador de compra Detalle
  private EmpleadoEncabezado = `${this.apiUrl}/api/Empleado`; //Link de la api de el controlador de Empleado
  private Proyectos = `${this.apiUrl}/api/Proyecto`;//Link de la api de el controlador de proyecto
  private EtapaPorProyecto = `${this.apiUrl}/api/EtapaPorProyecto`; //Link de la api de el controlador de etapa por proveedor
  private ActidadesPorEtapa = `${this.apiUrl}/api/Actividade`; //Link de la api de el controlador de compra encabezado

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`,
        'Content-Type': 'application/json'
      })
    };
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {

      errorMessage = `Error: ${error.error.message}`;
    } else {

      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }



  BuscarPorEncabezadoId(coen_Id: any) {
    return this.http.get<CompraEncabezado[]>(`${this.Compra}/BuscarPorDetalleCotizacion/${coen_Id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  VerificarNumeroCompraUnico(coen_numeroCompra: string, prov_Id: number): Observable<number> {
    // Construimos la URL con los parámetros
    const url = `${this.Compra}/VerificarNumeroCompraUnico?coen_numeroCompra=${coen_numeroCompra}&prov_Id=${prov_Id}`;

    // Realizamos la solicitud HTTP GET
    return this.http.get<number>(url, this.getHttpOptions())
      .pipe(
        catchError(this.handleError) // Manejamos errores si ocurren
      );
  }


  Listar(): Observable<CompraEncabezado[]> {
    return this.http.get<CompraEncabezado[]>(`${this.Compra}/Listar`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  ListarProyectos(): Observable<CompraEncabezado[]> { //Servicio de Listado de proyectos
    return this.http.get<CompraEncabezado[]>(`${this.Proyectos}/Listar`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }


  ListarEmpleados(): Observable<autocompleteEmpleado[]> { //Servicio de Listado de Empleados
    return this.http.get<autocompleteEmpleado[]>(`${this.EmpleadoEncabezado}/Listar`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  ListarMetodosPago(): Observable<CompraEncabezado[]> {
    return this.http.get<CompraEncabezado[]>(`${this.Compra}/ListarPagos`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  Buscar(id: number): Observable<CompraEncabezado> {
    return this.http.get<CompraEncabezado>(`${this.Compra}/Buscar/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  InsertarCompraEncabezado(modelo: any): Observable<any> {
    return this.http.post<any>(`${this.Compra}/Insertar`, modelo, this.getHttpOptions());
  }

  Insertar(modelo: any): Observable<any> {
    return this.http.post<any>(`${this.Compra}/InsertarCompra`, modelo, this.getHttpOptions());
  }


  Actualizar(modelo: CompraEncabezado): Observable<CompraEncabezado> {
    return this.http.put<CompraEncabezado>(`${this.Compra}/Actualizar`, modelo, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  Eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.Compra}/Eliminar?id=${id}`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
}

  ListarFechas(fechaInicio: Date, fechaFin: Date): Observable<CompraEncabezado[]> {
    return this.http.get<CompraEncabezado[]>(`${this.Compra}/ListarFechas?fechaInicio=${fechaInicio.toISOString()}&fechaFin=${fechaFin.toISOString()}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  BuscarPorCotizacion(coti_Id: number): Observable<CompraEncabezado[]> {
    return this.http.get<CompraEncabezado[]>(`${this.Compra}/BuscarPorCotizacion/${coti_Id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
}

  ListarCompraDetalle(): Observable<CompraDetalle[]> {
    return this.http.get<CompraDetalle[]>(`${this.CompraDetalle}/Listar`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  EliminarCompra(coen_Id: number): Observable<any> {
    return this.http.delete<any>(`${this.Compra}/EliminarCompra/${coen_Id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
}


  BuscarCompraDetalle(id: number): Observable<CompraDetalle> {
    return this.http.get<CompraDetalle>(`${this.CompraDetalle}/Buscar/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }


  BuscarCompraDetalleEncabezado(id: number): Observable<CompraDetalle[]> {
    return this.http.get<CompraDetalle[]>(`${this.CompraDetalle}/FiltroDetalleEncabezado/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }


  InsertarCompraDetalle(detalles: any[]): Observable<any> {
    return this.http.post<any>(`${this.Compra}/InsertarCompra`, detalles, this.getHttpOptions())
    .pipe(catchError(this.handleError));


  }





  ActualizarCompraDetalle(detalles: any[]): Observable<any> {
    return this.http.put<any>(`${this.CompraDetalle}/Actualizar`, detalles, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  ActualizarCompraNumero(detalles: any): Observable<any> {
    return this.http.put<any>(`${this.Compra}/ActualizarCompra`, detalles, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  EliminarCompraDetalle(id: number): Observable<any> {
    return this.http.delete<any>(`${this.CompraDetalle}/Eliminar?id=${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  //#region Destinos
  //Servicios de CompraDetalleDestino
  ListarCompraDetalleDestino(id: number): Observable<any> {
    return this.http.get<any>(`${this.CompraDetalle}/ListarDestino/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  ListarCompraDetalleDestinoMaquinaria(id: number): Observable<any> {
    return this.http.get<any>(`${this.CompraDetalle}/ListarDestinoMaquinaria/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  BuscarCompraDetalleDestino(id: number): Observable<any> {
    return this.http.get<any>(`${this.CompraDetalle}/BuscarDestino/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  InsertarCompraDetalleDestino(modelo: any): Observable<any> {
    return this.http.post<any>(`${this.CompraDetalle}/InsertarDestino`, modelo, this.getHttpOptions())
    .pipe(catchError(this.handleError));
  }


  InsertarCompraDetalleDestinoExacto(modelo: any): Observable<any> {
    return this.http.post<any>(`${this.CompraDetalle}/InsertarDestinoExacto`, modelo, this.getHttpOptions())
    .pipe(catchError(this.handleError));
  }

  ActualizarCompraDetalleDestinoDefecto(modelo: any): Observable<any> {
    return this.http.put<any>(`${this.CompraDetalle}/ActualizarDestinoDefecto`, modelo, this.getHttpOptions())
  }

  ActualizarCompraDetalleDestino(modelo: any): Observable<any> {
    return this.http.put<any>(`${this.CompraDetalle}/ActualizarDestino`, modelo, this.getHttpOptions())
  }

  EliminarCompraDetalleDestino(id: number): Observable<any> {
    return this.http.delete<any>(`${this.CompraDetalle}/EliminarDestino/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  EliminarCompraDetalleDestinoMaquinaria(id: number): Observable<any> {
    return this.http.delete<any>(`${this.CompraDetalle}/EliminarDestinoMaquinaria/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }
  //#endregion

  //#region DestinosPor Actividades

  ListarProyectosPorEtapa(id: number): Observable<any> {
    return this.http.get<any>(`${this.EtapaPorProyecto}/Listar/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  ListarActividadesPorEtapa(id: number): Observable<any> {
    return this.http.get<any>(`${this.CompraDetalle}/ListarActividadesPorEtapaFill/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  InsertarRentaMaquinaria(modelo: any): Observable <any>{
    return this.http.post<any>(`${this.apiUrl}/api/RentaMaquinariaPorActividad/Insertar`, modelo, this.getHttpOptions())
    .pipe(catchError(this.handleError));

    }

  BuscarCotizacionDetalle(code_Id: number): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/api/CotizacionDetalle/Buscar/${code_Id}`, this.getHttpOptions())
        .pipe(catchError(this.handleError));
  }

  InsertarCompraDetalleDestinoPorProyecto(modelo: any): Observable<any> {
    return this.http.post<any>(`${this.CompraDetalle}/InsertarDestinoPorProyecto`, modelo, this.getHttpOptions())
    .pipe(catchError(this.handleError));
  }


  InsertarCompraDetalleDestinoPorProyectoExacto(modelo: any): Observable<any> {
    return this.http.post<any>(`${this.CompraDetalle}/InsertarDestinoProyectoExacto`, modelo, this.getHttpOptions())
    .pipe(catchError(this.handleError));
  }

  //#endregion
}
