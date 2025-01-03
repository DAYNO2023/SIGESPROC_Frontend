import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { ContratoEmpleado } from '../../models/modelsproyecto/proyectoviewmodel';

@Injectable({providedIn: 'root'})
export class ContratoEmpleadoService {
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
        return this.http.put<any>(`${this.apiUrl}/api/ContratoEmpleado/Eliminar/${id}`, null, this.options)
          .toPromise();
    }

    Buscar(id: number){
        return this.http.post<any>(`${this.apiUrl}/api/ContratoEmpleado/Buscar/${id}`, null, this.options)
          .toPromise()
          .then(result => result.data as ContratoEmpleado)
          .then(data => data);
    }

    Insertar(modelo: ContratoEmpleado){
        return this.http.post<any>(`${this.apiUrl}/api/ContratoEmpleado/Insertar`, modelo, this.options)
          .toPromise();
    }

    Listar(){
        return this.http.get<any>(`${this.apiUrl}/api/ContratoEmpleado/Listar`, this.options)
          .toPromise()
          .then(result => result.data as ContratoEmpleado[])
          .then(data => data);
    }

    Actualizar(modelo: ContratoEmpleado){
        return this.http.put<any>(`${this.apiUrl}/api/ContratoEmpleado/Actualizar`, modelo, this.options)
          .toPromise();
    }
}
