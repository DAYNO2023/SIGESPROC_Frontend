import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { Pago } from '../../models/modelsproyecto/pagoviewmodel';

@Injectable({providedIn: 'root'})
export class PagoService {
    private apiUrl: string = environment.apiUrl;
    private apiKey: string = environment.apiKey;
    private options: {} = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'XApiKey': `${this.apiKey}`,
      })
    };
    
    constructor(
        private http: HttpClient
      ) {}
    
    Eliminar(id: number){
        return this.http.put<any>(`${this.apiUrl}/api/Pago/Eliminar`, id, this.options)
            .toPromise();
    }

    Buscar(id: number){
        return this.http.post<any>(`${this.apiUrl}/api/Pago/Buscar`, id, this.options)
            .toPromise()
            .then(result => result.data as Pago)
            .then(data => data);
    }
  
    Insertar(modelo: Pago){
        return this.http.post<any>(`${this.apiUrl}/api/Pago/Insertar`, modelo, this.options)
            .toPromise();
    }
  
    Listar(){
        return this.http.get<any>(`${this.apiUrl}/api/Pago/Listar`, this.options)
            .toPromise()
            .then(result => result.data as Pago[])
            .then(data => data);
    }
  
    Actualizar(modelo: Pago){
        return this.http.put<any>(`${this.apiUrl}/api/Pago/Actualizar`, modelo, this.options)
            .toPromise();
    }  
}