import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';
import { Pantalla } from '../../models/modelsacceso/pantallaviewmodel';

@Injectable({
  providedIn: 'root'
})
export class PantallaService {
    // Propiedades
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private options: {} = {
    headers: new HttpHeaders({
      'XApiKey': `${this.apiKey}`,
    }),
  };

//   Constructor
  constructor(
    private http: HttpClient
  ) {}

//   Endpoints

  Eliminar(id: number){
    return this.http.delete<any>(`${this.apiUrl}/api/Pantalla/Eliminar/${id}`, this.options)
      .toPromise();
  }

  Buscar(id?: number){
    return this.http.post<any>(`${this.apiUrl}/api/Pantalla/Buscar/${id}`, null, this.options)
      .toPromise()
      .then(result => result.data as Pantalla)
      .then(data => data);
  }

  Insertar(modelo: Pantalla){
    return this.http.post<any>(`${this.apiUrl}/api/Pantalla/Insertar`, modelo, this.options)
      .toPromise();
  }

  Listar(){
    return this.http.get<any>(`${this.apiUrl}/api/Pantalla/Listar`, this.options)
      .toPromise()
      .then(result => result.data as Pantalla[])
      .then(data => data);
  }

  Actualizar(modelo: Pantalla){
    return this.http.put<any>(`${this.apiUrl}/api/Pantalla/Actualizar`, modelo, this.options)
      .toPromise();
  }
}
