import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { Riesgo } from '../../models/modelsproyecto/proyectoviewmodel';

@Injectable({providedIn: 'root'})
export class RiesgoService {
    // Propiedades
    private apiUrl: string = environment.apiUrl;
    private apiKey: string = environment.apiKey;
    private options: {} = {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`,
      })
    };

    constructor(
        private http: HttpClient
    ) { }
    
    // Endpoints
    Eliminar(id: number){
        return this.http.delete<any>(`${this.apiUrl}/api/GestionRiesgo/Eliminar/${id}`, this.options)
          .toPromise();
    }

    Buscar(id: number){
        return this.http.post<any>(`${this.apiUrl}/api/GestionRiesgo/Buscar/${id}`, null, this.options)
          .toPromise()
          .then(result => result.data as Riesgo)
          .then(data => data);
    }

    Insertar(modelo: Riesgo){
        return this.http.post<any>(`${this.apiUrl}/api/GestionRiesgo/Insertar`, modelo, this.options)
          .toPromise();
    }

    Listar(id: number){
        return this.http.get<any>(`${this.apiUrl}/api/GestionRiesgo/Listar/${id}`, this.options)
          .toPromise()
          .then(result => result.data as Riesgo[])
          .then(data => data);
    }

    Actualizar(modelo: Riesgo){
        return this.http.put<any>(`${this.apiUrl}/api/GestionRiesgo/Actualizar`, modelo, this.options)
          .toPromise();
    }
}