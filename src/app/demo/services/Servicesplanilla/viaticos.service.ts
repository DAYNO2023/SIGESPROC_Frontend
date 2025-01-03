import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { ViaticosEncabezados } from '../../models/modelsplanilla/viaticoencviewmodel'; 
import { ViaticosDetalles } from '../../models/modelsplanilla/viaticodetviewmodel'; 
import { Usuario } from '../../models/modelsacceso/usuarioviewmodel';
import { ViaticosEncDet } from '../../models/modelsplanilla/viaticoencdetviewmodel'; 
import { categoriaviaticoService } from 'src/app/demo/services/Servicesplanilla/categoriaviatico.service';

@Injectable({
  providedIn: 'root'
})
export class ViaticoService {

  private apiUrl: string = environment.apiUrl; // Cambia esto por la URL de tu API
  private apiKey: string = environment.apiKey; // Cambia esto por tu clave de API
  private ViaticosEncabezado = `${this.apiUrl}/api/ViaticosEnc`;
  private ViaticosDet = `${this.apiUrl}/api/ViaticosDet`;
  private Empleado = `${this.apiUrl}/api/Empleado`;
  
  constructor(private http: HttpClient) { }
  private options: {} = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
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

  EliminarDetalle(id:number):Observable<any>{
    return this.http.delete<any>(`${this.ViaticosDet}/Eliminar/${id}`, this.getHttpOptions());
  }
  ActualizarFactura(modelo: any): Observable<any> {
    return this.http.put<any>(`${this.ViaticosDet}/Actualizar`, modelo, this.getHttpOptions());
  }

  Listar(id:number): Observable<ViaticosEncabezados[]> {
    return this.http.get<ViaticosEncabezados[]>(`${this.ViaticosEncabezado}/Listar?usua_Id=${id}`, this.getHttpOptions());
  }
  ListarP(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/Proyecto/Listar`, this.options);
}
  getViaticoDetalles(vien_Id: number): Observable<ViaticosEncDet[]> {
    return this.http.get<ViaticosEncDet[]>(`${this.ViaticosEncabezado}/BuscarEncDet/${vien_Id}`, this.getHttpOptions());
  }

  Insertar(modelo: ViaticosEncabezados): Observable<any> {
    return this.http.post<any>(`${this.ViaticosEncabezado}/Insertar`, modelo, this.getHttpOptions());
  }
  InsertarFactura(modelo: ViaticosDetalles): Observable<any> {
    return this.http.post<any>(`${this.ViaticosDet}/Insertar`, modelo, this.getHttpOptions());
  }
  Actualizar(modelo: ViaticosEncabezados): Observable<any> {
    return this.http.put<any>(`${this.ViaticosEncabezado}/Actualizar`, modelo, this.getHttpOptions());
  }

  Eliminar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.ViaticosEncabezado}/Eliminar/${id}`, this.getHttpOptions());
  }
  Finalizar(id:number):Observable<any>{
    return this.http.delete<any>(`${this.ViaticosEncabezado}/Finalizar/${id}`, this.getHttpOptions());
  }
  ListarEmpleados (){
    return this.http.get<Usuario[]>(`${this.Empleado}/Listar`,this.getHttpOptions());
  }


  ListarProyectos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/Proyectos/Listar`, this.getHttpOptions());
  }

  ListarEtapas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/Etapas/Listar`, this.getHttpOptions());
  }
  ListarCategorias(): Observable<any[]> {
    return this.http.get<any[]>( `${this.apiUrl}/api/CategoriaViatico/Listar`, this.getHttpOptions());
  }
}
