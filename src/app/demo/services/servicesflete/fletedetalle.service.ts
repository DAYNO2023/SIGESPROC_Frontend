import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { FleteDetalle, FleteDetalleExtendido } from '../../models/modelsflete/fletedetalleviewmodel';
import { InsumoPorProveedor, EquipoPorProveedor, EquipoPorProveedorExtendido } from '../../models/modelsinsumo/insumoporproveedorviewmodel';
import { ActividadPorEtapa } from '../../models/modelsproyecto/proyectoviewmodel';

@Injectable({
  providedIn: 'root'
})
export class FleteDetalleService {
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private FleteDetalleUrl = `${this.apiUrl}/api/FleteDetalle`;
  private InsumoPorProveedorUrl = `${this.apiUrl}/api/InsumoPorProveedor`;
  private ActividadPorEtapaUrl = `${this.apiUrl}/api/ActividadPorEtapa`;
  private EquipoPorProveedorUrl = `${this.apiUrl}/api/EquipoSeguridad`;




  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': this.apiKey
      })
    };
  }

  //listar actividad por etapa
  ListarActividadesPorEtapa(): Observable<ActividadPorEtapa[]> {
    return this.http.get<ActividadPorEtapa[]>(`${this.ActividadPorEtapaUrl}/ListarActividad`, this.getHttpOptions());
  }

  // Listar equipos de seguridad por proveedor
  ListadoEquiposPorProveedor(): Observable<EquipoPorProveedor[]>  {
    return this.http.get<EquipoPorProveedor[]>(`${this.EquipoPorProveedorUrl}/ListarEquipoPorProveedor`, this.getHttpOptions());
  }
  ListarInsumosPorProveedor(): Observable<InsumoPorProveedor[]> {
    return this.http.get<InsumoPorProveedor[]>(`${this.InsumoPorProveedorUrl}/Listar`, this.getHttpOptions());
  }

  //items filtrados en el componente por bodega(solo listado general)
  ListarInsumosPorBodega(bodegaId: number): Observable<InsumoPorProveedor[]> {
    const url = `${this.InsumoPorProveedorUrl}/Buscar/${bodegaId}`;
    return this.http.get<InsumoPorProveedor[]>(url, this.getHttpOptions());
  }

  // Listar equipos de seguridad por bodega
  ListadoEquiposPorBodega(bodegaId: number): Observable<EquipoPorProveedorExtendido[]> {
    return this.http.get<EquipoPorProveedorExtendido[]>(`${this.EquipoPorProveedorUrl}/BuscarEquipoPorProveedor/${bodegaId}`, this.getHttpOptions());
  }
  
  Listar(id: number): Observable<FleteDetalle[]> {
    return this.http.get<FleteDetalle[]>(`${this.FleteDetalleUrl}/Buscar/${id}`, this.getHttpOptions());
  }

  //cambiarrrrrrrrrrrr
  Buscar(id: number): Observable<FleteDetalle[]> {
    return this.http.get<FleteDetalle[]>(`${this.FleteDetalleUrl}/BuscarDetalles/${id}`, this.getHttpOptions());
  }


  Insertar(modelo: FleteDetalle): Observable<any> {
    return this.http.post<any>(`${this.FleteDetalleUrl}/Insertar`, modelo, this.getHttpOptions());
  }

  Actualizar(modelo: FleteDetalle): Observable<any> {
    return this.http.put<any>(`${this.FleteDetalleUrl}/Actualizar`, modelo, this.getHttpOptions());
  }


  Eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.FleteDetalleUrl}/Eliminar/${id}`, this.getHttpOptions());
  }


  //nuevs listados insumos actividades por etapa

  // Listar insumos por actividad por etapa
  ListadoInsumosPorActividadPorEtapa() {
    return this.http.get<InsumoPorProveedor[]>(`${this.FleteDetalleUrl}/ListarInsumosPorActividadEtapa`, this.getHttpOptions());
  }


  // Listar insumos por actividad por etapa filtrado por id de actividad por etapa
  ListadoInsumosPorActividadEtapafiltrado(bodegaId: number) {
    return this.http.get<InsumoPorProveedor[]>(`${this.FleteDetalleUrl}/BuscarInsumosPorActividadEtapa/${bodegaId}`, this.getHttpOptions());
  }


  // Listar insumos por actividad por etapa filtrado por id de actividad por etapa
  ListadoEquiposPorActividadEtapafiltrado(bodegaId: number) {
    return this.http.get<EquipoPorProveedorExtendido[]>(`${this.FleteDetalleUrl}/BuscarEquiposPorActividadEtapa/${bodegaId}`, this.getHttpOptions());
  }

}