import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { Maquinaria, Nivel } from '../../models/modelsinsumo/maquinariaviewmodel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { Cotizacion } from '../../models/modelsinsumo/cotizacionviewmodel';
import { Proveedor } from '../../models/modelsinsumo/proveedorviewmodel';
import { Insumo, InsumoPorMedida } from '../../models/modelsinsumo/insumoviewmodel';
import { ddlCategorias, ddlMaterial, ddlSubcategoria } from '../../models/modelsinsumo/insumosviewmodel';
import { Material } from '../../models/modelsinsumo/materialviewmodel';
import { UnidadesPorInsumo, UnidadMedida } from '../../models/modelsgeneral/unidadmedidaviewmodel';
import { CotizacionImpuesto } from '../../models/modelsinsumo/cotizacionesviewmodel';
import { firstValueFrom } from 'rxjs';
import { an } from '@fullcalendar/core/internal-common';
import { Respuesta } from '../ServiceResult';
@Injectable({
  providedIn: 'root'
})
export class  CotizacionService {

  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;

  constructor(private http: HttpClient) { }
  private CotizacionEncabezado = `${this.apiUrl}/api/Cotizacion`;
  private CotizacionDetalleEncabezado = `${this.apiUrl}/api/CotizacionDetalle`;
  private ProveedorEncabezado = `${this.apiUrl}/api/Proveedor`;
  private InsumoEncabezado = `${this.apiUrl}/api/Insumo`;
  private CategoriaEncabezado = `${this.apiUrl}/api/Categoria`;
  private EquiposSeguridadEncabezado = `${this.apiUrl}/api/EquipoSeguridad`;
  private Material = `${environment.apiUrl}/api/Material`;
  private Subcategoria = `${environment.apiUrl}/api/SubCategoria`;
  private UnidadMedidaEncabezado = `${environment.apiUrl}/api/UnidadMedida`;
  private NivelEncabezado = `${environment.apiUrl}/api/Nivel`;
  private MaquinariaEncabezado = `${environment.apiUrl}/api/Maquinaria`;
  private InsumoPorMedida = `${environment.apiUrl}/api/InsumoPorMedida`;
  private impuesto = `${this.apiUrl}/api/Impuesto`;
  private InsumoPorProveedor = `${environment.apiUrl}/api/InsumoPorProveedor`;
  private MaquinariaPorProveedor = `${environment.apiUrl}/api/MaquinariaPorProveedor`;
  private CotizacionPorDocumento = `${environment.apiUrl}/api/CotizacionPorDocumento`;
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }
  SubirDocumento(file: File) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<any>(`${this.CotizacionPorDocumento}/SubirDocumento`, formData,  this.getHttpOptions())
      .toPromise()
      .then(response => response.filePath);
  }

  EliminarImagen(documentos: any) {
    return this.http.post<any>(`${this.CotizacionPorDocumento}/Eliminar`, documentos, this.getHttpOptions())
      .toPromise();
  }
  BuscarMedidasPorInsumo(prov: number, id: number): Observable<any> {
    return this.http.get<any>(`${this.InsumoPorMedida}/Buscar/${prov},${id}`, this.getHttpOptions());
  }

  BuscarMaquinariaPorProveedores(prov: number): Observable<any> {
    return this.http.get<any>(`${this.MaquinariaPorProveedor}/Buscar/${prov}`, this.getHttpOptions());
  }

  BuscarEquiposPorProveedores(prov: number): Observable<any> {
    return this.http.get<any>(`${this.EquiposSeguridadEncabezado}/BuscarPorProveedor/${prov}`, this.getHttpOptions());
  }
  BuscarTablaCotizacion(id: number, coti: number) {
    return this.http.get<any>(`${this.CotizacionEncabezado}/ListarArticulos/${id},${coti}`, this.getHttpOptions()).toPromise();
  }
  ListarProveedores (){
    return this.http.get<Proveedor[]>(`${this.ProveedorEncabezado}/Listar`,this.getHttpOptions());
  }

  ListarInsumos(){
    return firstValueFrom(
      this.http.get<any>(`${this.InsumoEncabezado}/Listar`,this.getHttpOptions()));

  }
  ListarSubCategorias (id: number){
    return firstValueFrom(
    this.http.get<ddlSubcategoria[]>(`${this.Subcategoria}/ListarPorCategoria/${id}`,this.getHttpOptions()));
  }
  BuscarTablaMaestra(id: number): Observable<any> {
    return this.http.get<any>(`${this.CotizacionEncabezado}/ListarArticulosPorCotizacion/${id}`, this.getHttpOptions());
  }
  ListarInsumosPorMedidas (id: number){
    return this.http.get<Insumo[]>(`${this.UnidadMedidaEncabezado}/Listar/${id}`,this.getHttpOptions());
  }


  ListarMateriales (){
    return this.http.get<Material[]>(`${this.Material}/Listar`,this.getHttpOptions());
  }



  async ListarCategorias() {
    return await this.http.get<any[]>(`${this.CategoriaEncabezado}/Listar`, this.getHttpOptions()).toPromise();
}
  ListarEquipos (){
    return firstValueFrom(
      this.http.get<any>(`${this.EquiposSeguridadEncabezado}/Listar`,this.getHttpOptions()));
  }

  listarUnidadesDeMedida (){
    return firstValueFrom(
      this.http.get<any>(`${this.UnidadMedidaEncabezado}/Listar`,this.getHttpOptions()));
  }

  ListarNiveles (){
    return this.http.get<Nivel[]>(`${this.NivelEncabezado}/Listar`,this.getHttpOptions());
  }

  ListarMaquinaria (){
    return this.http.get<any>(`${this.MaquinariaEncabezado}/Listar`, this.getHttpOptions())
    .toPromise()
    .then(result => result.data as Maquinaria[])
    .then(data => data);
  }
  Listar (){
    return this.http.get< Cotizacion[]>(`${this.CotizacionEncabezado}/Listar`,this.getHttpOptions());
  }
  ListarImpuesto (){
    return this.http.get< CotizacionImpuesto[]>(`${this.impuesto}/Listar`,this.getHttpOptions());
  }
  Buscar(id: number): Observable< Cotizacion> {
    return this.http.get< Maquinaria>(`${this.CotizacionEncabezado}/Buscar/${id}`, this.getHttpOptions());
  }

  Insertar(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.CotizacionEncabezado}/Insertar`,modelo, this.getHttpOptions());
  }

  InsertarDocumento(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.CotizacionPorDocumento}/Insertar`,modelo, this.getHttpOptions());
  }


  InsertarInsumo(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.InsumoEncabezado}/InsertarInsumo`,modelo, this.getHttpOptions());
  }
  InsertarInsumo2(modelo:any){
    return this.http.post<any>(`${this.InsumoEncabezado}/InsertarInsumo`,modelo, this.getHttpOptions())
      .toPromise()
      .then((response) => response as Respuesta);
  }
  InsertarMaquinaria(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.MaquinariaEncabezado}/InsertarMaquinaria`,modelo, this.getHttpOptions());
  }

  InsertarEquipoProveedor(modelo:any):Observable<any>{
    return this.http.post<any>(`${this.EquiposSeguridadEncabezado}/InsertarPorProveedor`,modelo, this.getHttpOptions());
  }


  Actualizar(modelo: Maquinaria):Observable< Cotizacion>{
    return this.http.put< Maquinaria>(`${this. CotizacionEncabezado}/Actualizar`,modelo, this.getHttpOptions());
  }

  Finalizar(id:number):Observable<any>{
    return this.http.delete<any>(`${this. CotizacionEncabezado}/Finalizar?id=${id}`, this.getHttpOptions());
  }

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this. CotizacionEncabezado}/Eliminar?id=${id}`, this.getHttpOptions());
  }

  EliminarDetalle(id:number):Observable<any>{
    return this.http.delete<any>(`${this.CotizacionDetalleEncabezado}/Eliminar?id=${id}`, this.getHttpOptions());
  }


  EliminarInsumo(id: number){
    return this.http.put<any>(`${this.InsumoPorProveedor}/Eliminar`, id, this.getHttpOptions())
      .toPromise();
  }
  EliminarMaquinaria(id: number){
    return this.http.put<any>(`${this.MaquinariaPorProveedor}/Eliminar`, id, this.getHttpOptions())
    .toPromise();
  }

  EliminarEquipo(id: number){
    return this.http.put<any>(`${this.EquiposSeguridadEncabezado}/EliminarPorProveedor`, id, this.getHttpOptions())
    .toPromise();
  }

  EnviarImagen(formData: FormData, id: number): Observable<any> {
    return this.http.post<any>(`${this.CotizacionEncabezado}/Subir/${id}`, formData, {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    });
  }

  ListarPdf (id: number){
    return this.http.get<any[]>(`${this.CotizacionPorDocumento}/ListarPDF/${id}`,this.getHttpOptions());
  }

  ListarWord (id: number){
    return this.http.get<any[]>(`${this.CotizacionPorDocumento}/ListarWord/${id}`,this.getHttpOptions());
  }

  ListarImagenes (id: number){
    return this.http.get<any[]>(`${this.CotizacionPorDocumento}/ListarImagenes/${id}`,this.getHttpOptions());
  }
}
