import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { Presupuesto } from '../../models/modelsproyecto/presupuestoviewmodel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PresupuestoService {

  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;  
  private PresupuestoEncabezado = `${this.apiUrl}/api/PresupuestoEncabezado`;
  private Etapa = `${this.apiUrl}/api/Etapa`;
  private Proyecto = `${this.apiUrl}/api/Proyecto`;
  private UnidadMedida = `${this.apiUrl}/api/UnidadMedida`;
  private Actividad = `${this.apiUrl}/api/Actividade`;
  private Empleado = `${this.apiUrl}/api/Empleado`;
  private Cliente = `${this.apiUrl}/api/Cliente`;
  private CostoPorActividad = `${this.apiUrl}/api/CostoPorActividad`;
  private PresupuestoXTasaCambio = `${this.apiUrl}/api/PresupuestoPorTasaCambio`;
  private Impuesto = `${this.apiUrl}/api/Impuesto`;
  private EtapaPorProyecto = `${this.apiUrl}/api/EtapaPorProyecto`;
  private InsumoPorActividad = `${this.apiUrl}/api/InsumoPorActividad`;
  private InsumosPorProveedor = `${this.apiUrl}/api/InsumoPorProveedor`;
  private MaquinariasPorProveedor = `${this.apiUrl}/api/MaquinariaPorProveedor`;
  private MaquinariaPorActividad = `${this.apiUrl}/api/RentaMaquinariaPorActividad`;
  private ReferenciaCelda = `${this.apiUrl}/api/ReferenciaCelda`;



  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }
  
  Listar (){
    return this.http.get<any>(`${this.PresupuestoEncabezado}/Listar`,this.getHttpOptions())
    .toPromise();
  }

  BuscarMaquinariaPorProveedores(prov: number) {
    return this.http.get<any>(`${this.MaquinariasPorProveedor}/Buscar/${prov}`, this.getHttpOptions())
    .toPromise();
  }


  ListarInsumosPorProveedor (id: number){
    return this.http.get<any>(`${this.InsumosPorProveedor}/Listar/${id}`,this.getHttpOptions())
    .toPromise();
  }

  ListarReferencia (){
    return this.http.get<any>(`${this.ReferenciaCelda}/Listar`,this.getHttpOptions())
    .toPromise();
  }

  ListarProyectos (){
    return this.http.get<any>(`${this.Proyecto}/Listar`,this.getHttpOptions())
    .toPromise();
  }
  ListarActividadesProyecto(id: number) {
    return this.http.get<any>(`${this.Proyecto}/ListarActividades?id=${id}`, this.getHttpOptions())
    .toPromise();
  }

  ListarMaquinariasPorProveedor(id: number) {
    return this.http.get<any>(`${this.Proyecto}/ListarActividades?id=${id}`, this.getHttpOptions())
    .toPromise();
  }

  ListarImpuesto (){
    return this.http.get<any[]>(`${this.Impuesto}/Listar`,this.getHttpOptions())
    .toPromise();
  }

  ListarUnidades(){
    return this.http.get<any[]>(`${this.UnidadMedida}/Listar`,this.getHttpOptions())
    .toPromise();
  }
  BuscarUnidad(id: number) {
    return this.http.get<any>(`${this.UnidadMedida}/Buscar/${id}`, this.getHttpOptions())
    .toPromise();
  }
  PresupuestoAprobado(pren_Id: number,proy_Id: number) {
    return this.http.delete<any>(`${this.PresupuestoEncabezado}/Aprobado?pren_Id=${pren_Id}&proy_Id=${proy_Id}`, this.getHttpOptions())
    .toPromise();
  }

  BuscarProyectoPorNombre(proy_Nombre: string){
    return this.http.get<any>(`${this.Proyecto}/BuscarPorNombre?proy_Nombre=${proy_Nombre}`, this.getHttpOptions())
    .toPromise();
  }

  BuscarEtapaPorNombre2(etap_Descripcion: string) {
    return this.http.get<any>(`${this.Etapa}/BuscarPorNombre?etap_Descripcion=${etap_Descripcion}`, this.getHttpOptions())
      .toPromise();
  }

  ListarEmpleados (){
    return this.http.get<any[]>(`${this.Empleado}/Listar`,this.getHttpOptions())
    .toPromise();
  }

  
  ListarInsumosPorAcitividad(id?: number){
    return this.http.get<any>(`${this.InsumoPorActividad}/ListarPresupuestos?id=${id}`, this.getHttpOptions())
    .toPromise();
}

ListarMaquinariasPorAcitividad(id: number){
  return this.http.get<any>(`${this.MaquinariaPorActividad}/ListarPresupuesto?id=${id}`, this.getHttpOptions())
  .toPromise();
}

  ListarClientes (){
    return this.http.get<any[]>(`${this.Cliente}/Listar`,this.getHttpOptions()).toPromise();
  }
  ListarActividades (){
    return this.http.get<any[]>(`${this.Actividad}/Listar`,this.getHttpOptions()).toPromise();
  }
  LlenarActividadesPorEtapa(etap_Id: number, proy_Id: number) {
    return this.http.get<any>(`${this.Actividad}/ListarActividadesPorEtapa?etap_Id=${etap_Id}&proy_Id=${proy_Id}`, this.getHttpOptions()).toPromise();
  }

  ListarEtapaPorProyecto(id: number){
    return this.http.get<any>(`${this.EtapaPorProyecto}/Listar/${id}`, this.getHttpOptions()).toPromise();
}
  ListarCostosActividad(acti_Id: number, unme_Id: number) {
    return this.http.get<any>(`${this.Actividad}/ListarCostosActividades?acti_Id=${acti_Id}&unme_Id=${unme_Id}`, this.getHttpOptions())
    .toPromise();
  }

  ListarEtapa (){
    return this.http.get<any[]>(`${this.Etapa}/Listar`,this.getHttpOptions()).toPromise();
  }
  ListarPresupuestoXTasa(id: number) {
    return this.http.get<any>(`${this.PresupuestoXTasaCambio}/Listar/${id}`, this.getHttpOptions()).toPromise();
  }

  BuscarCliente(DNI: string){
    return this.http.get<any>(`${this.PresupuestoEncabezado}/BuscarPorDNICliente?DNI=${DNI}`, this.getHttpOptions()).toPromise();
  }
  BuscarEmpleado(DNI: string){
    return this.http.get<any>(`${this.PresupuestoEncabezado}/BuscarPorDNIEmpleado?DNI=${DNI}`, this.getHttpOptions()).toPromise();
  }

  Buscar(id: number): Observable<Presupuesto> {
    return this.http.get<Presupuesto>(`${this.PresupuestoEncabezado}/Buscar/${id}`, this.getHttpOptions());
  }

  InsertarCostoPorActividad(modelo:any){
    return this.http.post<any>(`${this.CostoPorActividad}/Insertar`,modelo, this.getHttpOptions()).toPromise();
  }

  InsertarActividad(modelo:any){
    return this.http.post<any>(`${this.Actividad}/Insertar`,modelo, this.getHttpOptions()).toPromise();
  }

  InsertarInsumoPorActividad(modelo:any){
    return this.http.post<any>(`${this.InsumoPorActividad}/Insertar`,modelo, this.getHttpOptions()).toPromise();
  }

  ActualizarInsumoPorActividad(modelo:any){
    return this.http.put<any>(`${this.InsumoPorActividad}/Actualizar`,modelo, this.getHttpOptions()).toPromise();
  }
  InsertarMaquinariaPorActividad(modelo:any){
    return this.http.post<any>(`${this.MaquinariaPorActividad}/Insertar`,modelo, this.getHttpOptions()).toPromise();
  }

  ActualizarMaquinariaPorActividad(modelo:any){
    return this.http.put<any>(`${this.MaquinariaPorActividad}/Actualizar`,modelo, this.getHttpOptions()).toPromise();
  }

  EliminarInsumoPorActividad(id:number){
    return this.http.delete<any>(`${this.InsumoPorActividad}/Eliminar?id=${id}`, this.getHttpOptions()).toPromise();
  }
  EliminarMaquinariaPorActividad(id:number){
    return this.http.delete<any>(`${this.MaquinariaPorActividad}/Eliminar?id=${id}`, this.getHttpOptions()).toPromise();
  }

  InsertarUnidad(modelo:any){
    return this.http.post<any>(`${this.UnidadMedida}/Insertar`,modelo, this.getHttpOptions()).toPromise();
  }

 
  InsertarEtapaPorProyecto2(modelo:any){
    return this.http.post<any>(`${this.EtapaPorProyecto}/Insertar`,modelo, this.getHttpOptions())
      .toPromise();
  }



  InsertarEtapa2(modelo:any){
    return this.http.post<any>(`${this.Etapa}/Insertar`,modelo, this.getHttpOptions())
      .toPromise();
  }

  Insertar(modelo:any){
    return this.http.post<any>(`${this.PresupuestoEncabezado}/Insertar`,modelo, this.getHttpOptions()).toPromise();
  }
  
  ActualizarCostoPorActividad(modelo:any){
    return this.http.put<any>(`${this.CostoPorActividad}/Actualizar`,modelo, this.getHttpOptions())
    .toPromise();
  }
  PresupuestoRechazado(modelo:any){
    return this.http.put<any>(`${this.PresupuestoEncabezado}/Rechazado`,modelo, this.getHttpOptions()).toPromise();
  }

  Actualizar(modelo:any){
    return this.http.put<any>(`${this.PresupuestoEncabezado}/Actualizar`,modelo, this.getHttpOptions()).toPromise();
  }

  Eliminar(id:number){
    return this.http.delete<any>(`${this.PresupuestoEncabezado}/Eliminar?id=${id}`, this.getHttpOptions()).toPromise();
  }
}
