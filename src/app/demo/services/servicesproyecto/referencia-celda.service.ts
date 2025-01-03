import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { Referencia } from '../../models/modelsproyecto/referenciaceldaviewmodel'; 

@Injectable({providedIn: 'root'})
export class ReferenciaService {
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
    Eliminar(modelo: Referencia){
        return this.http.put<any>(`${this.apiUrl}/api/ReferenciaCelda/Eliminar`, modelo, this.options)
          .toPromise();
    }

    Insertar(modelo: Referencia){
        return this.http.post<any>(`${this.apiUrl}/api/ReferenciaCelda/Insertar`, modelo, this.options)
          .toPromise();
    }

    Listar(){
        return this.http.get<any>(`${this.apiUrl}/api/ReferenciaCelda/Listar`, this.options)
          .toPromise()
    }

}