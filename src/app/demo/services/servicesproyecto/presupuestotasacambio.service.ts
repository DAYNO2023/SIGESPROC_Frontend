import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { PresupuestoPorTasaCambio } from '../../models/modelsproyecto/presupuestotasacambio';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PresupuestotasacambioService {
  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private PresupuestoTasaCambio = `${this.apiUrl}/api/PresupuestoPorTasaCambio`;
  private TasaCambio = `${this.apiUrl}/api/TasaCambio`;
  private Moneda = `${this.apiUrl}/api/Moneda`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar(id: number) {
    return this.http.get<any>(`${this.PresupuestoTasaCambio}/Listar/${id}`, this.getHttpOptions()).toPromise();
  }

  ListarConversiones(id: number) {
    return this.http.get<any>(`${this.TasaCambio}/ListarConversiones?id=${id}`, this.getHttpOptions()).toPromise();
  }


  ListarValoresMoneda(mone_Id: number, taca_Id: number) {
    return this.http.get<any>(`${this.Moneda}/ObtenerValorMoneda?mone_Id=${mone_Id}&taca_Id=${taca_Id}`, this.getHttpOptions())
    .toPromise();
  }

  ListarMonedas (){
    return this.http.get<any[]>(`${this.Moneda}/Listar`,this.getHttpOptions()).toPromise();
  }

  Insertar(modelo:any){
    return this.http.post<any>(`${this.PresupuestoTasaCambio}/Insertar`,modelo, this.getHttpOptions()).toPromise();
  }
  Actualizar(modelo:any){
    return this.http.put<any>(`${this.PresupuestoTasaCambio}/Actualizar`,modelo, this.getHttpOptions()).toPromise();
  }

  
  Eliminar(id:number){
    return this.http.delete<any>(`${this.PresupuestoTasaCambio}/Eliminar?id=${id}`, this.getHttpOptions()).toPromise();
  }
}
