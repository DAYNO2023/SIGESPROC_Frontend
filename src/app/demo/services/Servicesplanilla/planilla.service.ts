
import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'

import { Planilla } from '../../models/modelsplanilla/planillaviewmdel';
import { PagoJefeObraPlanillaViewModel } from '../../models/modelsplanilla/planillajefeobraviewmodel';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { ListadoEmpleadosPlanilla, Deducciones } from '../../models/modelsplanilla/planillaviewmdel'
import { timeout } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
  })

  export class planillaservice {

    constructor(private http: HttpClient) { }
    private apiUrl: string = environment.apiUrl;
    private apiUrlAPI: string = 'https://localhost:44337';
    private apiKey: string = environment.apiKey;
    private planillaEncabezado = `${this.apiUrl}/api/Planilla`;
  
    private options: {} = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'XApiKey': `${this.apiKey}`,
      })
    };
  
    private getHttpOptions() {
      return {
        headers: new HttpHeaders({
          'XApiKey': `${this.apiKey}`
        })
      };
    }

    InsertarJObra(modelo : any, fecha:string  ){ 
        return this.http.post<any>(`${this.planillaEncabezado}/InsertarJefe/`+fecha+``,modelo,this.getHttpOptions()).toPromise() ;
    }   
    Insertar(modelo:any){ 
      return this.http.post<any>(`${this.planillaEncabezado}/Insertar`,modelo,this.getHttpOptions()).toPromise() ;
  }   

    Listar(){
      return this.http.get<any>(`${this.planillaEncabezado}/Listar`, this.options).toPromise();
    }

    ListadoEmpleadoNormal(modelo: any) {
      return this.http.post<ListadoEmpleadosPlanilla[]>(`${this.planillaEncabezado}/ListadoPlanilla`, modelo, this.options)
        .toPromise();
    }

    ListadoDetallePlanilla(id:number){
      return this.http.get<any>(`${this.planillaEncabezado}/VerDetallesPlanilla/`+id+``,this.options).toPromise();
    }   
    ListadoDeduccionesJefes(fecha:string){
      return this.http.get<any>(`${this.planillaEncabezado}/ListarDeduccionesJefesObras/`+fecha+``,this.options);
    }  

    ListadoDeduccionesPorPlaniall(id:number){
      return this.http.get<any>(`${this.planillaEncabezado}/BuscarDeduccionesPorPlanilla/`+id+``,this.options);
    }  

    ListadoDeduccionesPorPlaniallaPorEmpleadp(id:number){
      return this.http.get<any>(`${this.planillaEncabezado}/BuscarDeduccionesPorPlanillaPorEmpleado/`+id+``,this.options).toPromise();
    }  

    // ListadoEmpleadoNormal(modelo: any){
    //   return this.http.post<ListadoEmpleadosPlanilla[]>(`${this.planillaEncabezado}/ListarEmpleadoPago`,modelo,this.getHttpOptions()).toPromise();
    // }   

    ListarDeduccionesPorEmpleados(id: number){
      return this.http.get<Deducciones[]>(`${this.planillaEncabezado}/DeduccionesPorEmpelados/`+id+``,this.getHttpOptions()).toPromise();
    }

    ListarJefeObra(fecha:string): Observable<PagoJefeObraPlanillaViewModel[]> {
      return this.http.get<PagoJefeObraPlanillaViewModel[]>(
          `${this.planillaEncabezado}/ListarPlanillaJefesObras/`+fecha+``, 
          this.getHttpOptions()
      );
  }
  
  ListarJefeObra2(fecha:string): Observable<PagoJefeObraPlanillaViewModel[]> {
    return this.http.get<PagoJefeObraPlanillaViewModel[]>(
        `${this.planillaEncabezado}/ListarDeduccionesJefesObras2/`+fecha+``, 
        this.getHttpOptions()
    );
}

  }
