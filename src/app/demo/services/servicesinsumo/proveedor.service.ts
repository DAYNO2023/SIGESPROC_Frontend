import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';
import { Proveedor } from '../../models/modelsinsumo/proveedorviewmodel';
import { firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
    // Propiedades
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  
  private options: {} = {
    headers: new HttpHeaders({
      'XApiKey': `${this.apiKey}`,
    })
  };

//   Constructor
  constructor(
    private http: HttpClient
  ) {}

//   Endpoints

Eliminar(id: number){
    return this.http.delete<any>(`${this.apiUrl}/api/Proveedor/Eliminar/${id}`, this.options)
      .toPromise();
  }

  Buscar(id: number){
    return this.http.get<any>(`${this.apiUrl}/api/Proveedor/Buscar/${id}`, this.options)
      .toPromise()
      .then(result => result.data as Proveedor)
      .then(data => data);
  }

  Insertar(modelo: Proveedor){
    return this.http.post<any>(`${this.apiUrl}/api/Proveedor/Insertar`, modelo, this.options)
      .toPromise();
  }

  Listar(){
    return firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/api/Proveedor/Listar`, this.options)
    ).then(result => result.data as Proveedor[]);
  }

  Actualizar(modelo: Proveedor){
    return this.http.put<any>(`${this.apiUrl}/api/Proveedor/Actualizar`, modelo, this.options)
      .toPromise();
  }
}
