import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Niveles } from '../../models/modelsgeneral/nivelesviewmodel';
import { Observable } from 'rxjs';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { environment } from 'src/environment/environment';
import { firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NivelesService {

  constructor(private http: HttpClient) { }

  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private nivel = `${this.apiUrl}/api/Nivel`;
  
  private options: {} = {

      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
  };

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar(): Observable<Niveles[]> {
    return this.http.get<Niveles[]>(`${this.nivel}/Listar`, this.getHttpOptions());
  }

  Buscar(id: number): Observable<Niveles> {
    return this.http.get<Niveles>(`${this.nivel}/Buscar/${id}`, this.getHttpOptions());
  }


  Insertar(modelo: any): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.nivel}/Insertar`, modelo, this.getHttpOptions());
  }

  Actualizar(modelo: Niveles): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${this.nivel}/Actualizar`, modelo, this.getHttpOptions());
  }

  Eliminar(id: number) {
    return this.http.put<any>(`${this.nivel}/Eliminar`,id, this.options).toPromise();
  }
}
