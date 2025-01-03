import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { Contrato } from '../../models/modelsproyecto/proyectoviewmodel';

@Injectable({providedIn: 'root'})
export class ContratoService {
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
        return this.http.put<any>(`${this.apiUrl}/api/Contrato/Eliminar/${id}`, null, this.options)
          .toPromise();
    }

    Buscar(id: number){
        return this.http.post<any>(`${this.apiUrl}/api/Contrato/Buscar/${id}`, null, this.options)
          .toPromise()
          .then(result => result.data as Contrato)
          .then(data => data);
    }

    Insertar(modelo: Contrato){
        return this.http.post<any>(`${this.apiUrl}/api/Contrato/Insertar`, modelo, this.options)
          .toPromise();
    }

    Listar(){
        return this.http.get<any>(`${this.apiUrl}/api/Contrato/Listar`, this.options)
          .toPromise()
          .then(result => result.data as Contrato[])
          .then(data => data);
    }

    Actualizar(modelo: Contrato){
        return this.http.put<any>(`${this.apiUrl}/api/Contrato/Actualizar`, modelo, this.options)
          .toPromise();
    }
}