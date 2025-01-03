import { Injectable } from '@angular/core';
import { Insumo, Fill, ddlMaterial, ddlSubcategoria, ddlSubcategoriaPorcategorias, ddlCategorias,InsumoEnviar } from '../../models/modelsinsumo/insumosviewmodel';
import { environment } from '../../../../environment/environment';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InsumoService {
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;

  private options: {} = {
    headers: new HttpHeaders({
      'XApiKey': `${this.apiKey}`,
    })
  };
  private Insumo = `${environment.apiUrl}/api/Insumo/`;
  private Material = `${environment.apiUrl}/api/Material/`;
  private Subcategoria = `${environment.apiUrl}/api/SubCategoria/`;


  private httpOptions = {
    headers: new HttpHeaders({
      'XApiKey': this.apiKey
    })
  };

  constructor(private http: HttpClient) { }

  Listar(): Observable<Insumo[]> {
    return this.http.get<Insumo[]>(`${this.Insumo}Listar`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }
  // ListarMaterial(){
  //   return this.http.get<any>(`${this.Material}Listar`, this.options)
  //     .toPromise()
  //     .then(result => result.data as ddlMaterial[])
  //     .then(data => data);
  // }
  ListarMaterial(): Observable<ddlMaterial[]> {
    return this.http.get<ddlMaterial[]>(`${this.Insumo}ListarMaterial`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  ListarSubcategoria(): Observable<ddlSubcategoria[]> {
    return this.http.get<ddlSubcategoria[]>(`${this.Subcategoria}Listar`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }


  ListarCategoria(): Observable<ddlCategorias[]> {
    return this.http.get<ddlCategorias[]>(`${this.Insumo}ListarCate`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  Insertar(modelo: any): Observable<any> {
    return this.http.post<any>(`${this.Insumo}Insertar`, modelo, this.httpOptions).pipe(
      catchError(error => {
        console.error('Error en la solicitud:', error);
        if (error.status === 400) {
          console.error('Detalles del error de validación:', error.error);
        }
        return throwError(error);
      })
    );
  }
  

  Obtener(id: number): Observable<Insumo> {
    return this.http.get<Insumo>(`${this.Insumo}Buscar/${id}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  ListarSubcategoriasPorCategoria(id: number): Observable<ddlSubcategoria[]> {
    return this.http.get<ddlSubcategoria[]>(`${this.Insumo}Mostrar/${id}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
}



  Actualizar(modelo: any): Observable<any> {
    return this.http.put<any>(`${this.Insumo}Actualizar`, modelo, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  Eliminar(idInsumo: number): Observable<any> {
    return this.http.delete<void>(`${this.Insumo}Eliminar`, {
      headers: new HttpHeaders({
        'XApiKey': this.apiKey
      }),
      params: {
        id: idInsumo.toString()
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  Llenar(codigo: number): Observable<Fill> {
    return this.http.get<Fill>(`${this.Insumo}Buscar/${codigo}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
}
