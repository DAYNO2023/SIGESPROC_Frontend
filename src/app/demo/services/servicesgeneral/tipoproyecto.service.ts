import { HttpHeaders, HttpClient } from "@angular/common/http";
import { environment } from "src/environment/environment";
import { Injectable } from "@angular/core";
import { TipoProyecto } from "../../models/modelsgeneral/tipoproyectoviewmodel";

@Injectable({
    providedIn: 'root'
  })
export class TipoProyectoService {
  // Propiedades
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private options: {} = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'XApiKey': `${this.apiKey}`,
    })
  };

  // Constructor
  constructor(
    private http: HttpClient
  ) {}

  // Endpoints
  Eliminar(id: number){
    return this.http.put<any>(`${this.apiUrl}/api/TipoProyecto/Eliminar`, id, this.options)
      .toPromise(); 
  }

  Buscar(id: number){
    return this.http.get<any>(`${this.apiUrl}/api/TipoProyecto/Buscar/${id}`, this.options)
      .toPromise()
      .then(result => result.data as TipoProyecto)
      .then(data => data);
  }

  Insertar(modelo: any){
    return this.http.post<any>(`${this.apiUrl}/api/TipoProyecto/Insertar`, modelo, this.options)
      .toPromise();
  } 

  Listar(){
    return this.http.get<any>(`${this.apiUrl}/api/TipoProyecto/Listar`, this.options)
      .toPromise()
      .then(result => result.data as TipoProyecto[])
      .then(data => data);
  } 

  Actualizar(modelo: any){
    return this.http.put<any>(`${this.apiUrl}/api/TipoProyecto/Actualizar`, modelo, this.options)
      .toPromise();
  }
}
