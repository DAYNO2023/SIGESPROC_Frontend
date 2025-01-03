import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { EtapaPorProyecto } from '../../models/modelsproyecto/proyectoviewmodel';

@Injectable({providedIn: 'root'})
export class EtapaPorProyectoService {
    // Propiedades
    private apiUrl: string = environment.apiUrl;
    private apiKey: string = environment.apiKey;
    private options: {} = {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`,
      })
    };
    constructor(private http: HttpClient) { }
     // Endpoints
    Eliminar(id: number){
        return this.http.delete<any>(`${this.apiUrl}/api/EtapaPorProyecto/Eliminar/${id}`, this.options)
          .toPromise();
    }

    Buscar(id?: number){
      return this.http.get<any>(`${this.apiUrl}/api/EtapaPorProyecto/Buscar/${id}`, this.options)
        .toPromise()
        .then(result => result.data as EtapaPorProyecto)
        .then(data => data);
    }

    Insertar(modelo: EtapaPorProyecto){
        return this.http.post<any>(`${this.apiUrl}/api/EtapaPorProyecto/Insertar`, modelo, this.options)
          .toPromise();
    }

    Listar(id?: number){
        return this.http.post<any>(`${this.apiUrl}/api/EtapaPorProyecto/Listar`, id, this.options)
          .toPromise()
          .then(result => result.data as EtapaPorProyecto[])
          .then(data => data);
    }

    Actualizar(modelo: EtapaPorProyecto){
        return this.http.put<any>(`${this.apiUrl}/api/EtapaPorProyecto/Actualizar`, modelo, this.options)
          .toPromise();
    }
}