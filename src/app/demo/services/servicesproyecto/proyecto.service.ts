import { HttpHeaders, HttpClient } from "@angular/common/http";
import { environment } from "src/environment/environment";
import { Proyecto } from "../../models/modelsproyecto/proyectoviewmodel";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
export class ProyectoService {
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
        return this.http.put<any>(`${this.apiUrl}/api/Proyecto/Eliminar`, id, this.options)
          .toPromise();
      }

      Buscar(id: number){
        return this.http.post<any>(`${this.apiUrl}/api/Proyecto/Buscar`, id, this.options)
          .toPromise()
          .then(result => result.data as Proyecto)
          .then(data => data);
      }

      Insertar(modelo: Proyecto){
        return this.http.post<any>(`${this.apiUrl}/api/Proyecto/Insertar`, modelo, this.options)
          .toPromise();
      }

      Listar(){
        return this.http.get<any>(`${this.apiUrl}/api/Proyecto/Listar`, this.options)
          .toPromise()
          .then(result => result as Proyecto[])
          .then(data => data);
      }

      Actualizar(modelo: Proyecto){
        return this.http.put<any>(`${this.apiUrl}/api/Proyecto/Actualizar`, modelo, this.options)
          .toPromise();
      }
}
