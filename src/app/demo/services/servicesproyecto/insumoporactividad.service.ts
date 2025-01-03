import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { InsumoPorActividad } from '../../models/modelsproyecto/insumoporactividadviewmodel';

@Injectable({providedIn: 'root'})
export class InsumoPorActividadService {
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
        return this.http.put<any>(`${this.apiUrl}/api/Proyecto/Eliminar`, id, this.options)
            .toPromise();
    }

    Buscar(id: number){
        return this.http.post<any>(`${this.apiUrl}/api/Proyecto/Buscar`, id, this.options)
            .toPromise()
            .then(result => result.data as InsumoPorActividad)
            .then(data => data);
    }
  
    Insertar(modelo: InsumoPorActividad){
        return this.http.post<any>(`${this.apiUrl}/api/InsumoPorActividad/Insertar`, modelo, this.options)
            .toPromise();
    }
  
    Listar(id: number){
        return this.http.get<any>(`${this.apiUrl}/api/InsumoPorActividad/Listar/${id}}`, this.options)
            .toPromise()
            .then(result => result as InsumoPorActividad[])
            .then(data => data);
    }
  
    Actualizar(modelo: InsumoPorActividad){
        return this.http.put<any>(`${this.apiUrl}/api/InsumoPorActividad/Actualizar`, modelo, this.options)
            .toPromise();
    }  
}