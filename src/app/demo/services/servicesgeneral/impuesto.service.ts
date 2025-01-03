import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { environment } from 'src/environment/environment';
import { Impuesto } from '../../models/modelsgeneral/impuestoviewmodel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImpuestoService {

  constructor(private http: HttpClient) { }
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;
  private impuesto = `${this.apiUrl}/api/Impuesto`;


  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  Listar (){
    return this.http.get<Impuesto[]>(`${this.impuesto}/Listar`,this.getHttpOptions());
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<Impuesto>(`${this.impuesto}/Actualizar`,modelo, this.getHttpOptions());
  }


}
