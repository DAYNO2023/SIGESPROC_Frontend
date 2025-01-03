import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { ciudad , DropDownCiudades} from '../../models/modelsgeneral/ciudadviewmodel';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ciudadService {


  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;

  constructor(private http: HttpClient) { }
  private ciudadEncabezado = `${environment.apiUrl}/api/Ciudad`;



  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  //CiudadPorEstado

  DropDown (){
    return this.http.get<DropDownCiudades[]>(`${this.ciudadEncabezado}/DropDownCiudades`,this.getHttpOptions());
  }


  DropDownByState (id:number){
    return this.http.post<DropDownCiudades[]>(`${this.ciudadEncabezado}/CiudadPorEstado/${id}`,null,this.getHttpOptions());
  }

  DropDownByState2 (id:number){
    return this.http.post<any>(`${this.ciudadEncabezado}/CiudadPorEstado/${id}`,null,this.getHttpOptions())
        .toPromise()
        .then(data => data as ciudad[])
        .then(data => data);
  }


  Listar (){
    return this.http.get<ciudad[]>(`${this.ciudadEncabezado}/Listar`,this.getHttpOptions());
  }

  private handleError(error: any) {
    console.error('An error occurred', error);
    return throwError(error);
  }
  
 Insertar(modelo: any): Observable<any> {
    return this.http.post<any>(`${this.ciudadEncabezado}/Insertar`, modelo, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  Actualizar(modelo:any):Observable<any>{
    return this.http.put<ciudad>(`${this.ciudadEncabezado}/Actualizar`,modelo, this.getHttpOptions());
  }

  Eliminar(id:number){
    return this.http.delete<any>(`${this.ciudadEncabezado}/Eliminar?id=${id}`, this.getHttpOptions())
    .toPromise();
  }



}

