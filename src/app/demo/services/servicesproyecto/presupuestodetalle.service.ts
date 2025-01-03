import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { Presupuesto } from '../../models/modelsproyecto/presupuestoviewmodel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PresupuestodetalleService {

  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;  
  private PresupuestoDetalle = `${this.apiUrl}/api/PresupuestoDetalle`;

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar(id: number) {
    return this.http.get<any>(`${this.PresupuestoDetalle}/Listar/${id}`, this.getHttpOptions()).toPromise();
  }

  Insertar(modelo:any){
    return this.http.post<any>(`${this.PresupuestoDetalle}/Insertar`,modelo, this.getHttpOptions()).toPromise();
  }
  

  Actualizar(modelo:any){
    return this.http.put<any>(`${this.PresupuestoDetalle}/Actualizar`,modelo, this.getHttpOptions()).toPromise();
  }

  Eliminar(id:number){
    return this.http.delete<any>(`${this.PresupuestoDetalle}/Eliminar?id=${id}`, this.getHttpOptions())
    .toPromise();
  }
}
