import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EmpresaBienRaiz } from '../../models/modelsbienraiz/empresabienraizviewmodel';
import { Observable } from 'rxjs';
import { DropDownEmpresas} from '../../models/modelsbienraiz/empresabienraizviewmodel';
import { environment } from 'src/environment/environment';


@Injectable({
  providedIn: 'root'
})
export class EmpresaBienRaizService {

  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private empresaBienRaizEncabezado = `${this.apiUrl}/api/EmpresaBienesRaices`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }
  private options: {} = {
    headers: new HttpHeaders({
      'XApiKey': `${this.apiKey}`,
    })
  };
  Listar(): Observable<EmpresaBienRaiz[]> {
    return this.http.get<EmpresaBienRaiz[]>(`${this.empresaBienRaizEncabezado}/Listar`, this.getHttpOptions());
  }

  Buscar(id: number): Observable<EmpresaBienRaiz> {
    return this.http.get<EmpresaBienRaiz>(`${this.empresaBienRaizEncabezado}/Buscar/${id}`, this.getHttpOptions());
  }

  Insertar(modelo: EmpresaBienRaiz): Observable<any> {
    return this.http.post<any>(`${this.empresaBienRaizEncabezado}/Insertar`, modelo, this.getHttpOptions());
  }

  // Actualizar(modelo: EmpresaBienRaiz): Observable<EmpresaBienRaiz> {
  //   return this.http.put<EmpresaBienRaiz>(`${this.empresaBienRaizEncabezado}/Actualizar`, modelo, this.getHttpOptions());
  // }
  Actualizar(modelo:any):Observable<any>{
    return this.http.put<EmpresaBienRaiz>(`${this.empresaBienRaizEncabezado}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id: number){
    return this.http.put<any>(`${this.empresaBienRaizEncabezado}/Eliminar`, id, this.options)
      .toPromise();
  }

  DropDown (): Observable<DropDownEmpresas[]> {
    return this.http.get<DropDownEmpresas[]>(`${this.empresaBienRaizEncabezado}/Listar`,this.getHttpOptions());
  }

}
