import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { ActividadPorEtapa } from '../../models/modelsproyecto/proyectoviewmodel';
import { EtapaPorProyecto } from '../../models/modelsinsumo/compraviewmodel';
import { InsumoPorProveedor } from '../../models/modelsinsumo/insumoporproveedorviewmodel';
import { Maquinaria } from '../../models/modelsinsumo/maquinariaviewmodel';
import { EquipoSeguridadPorProveedor } from '../../models/modelsinsumo/equiposeguridadporproveedorviewmodel';
import { InsumoPorActividad } from '../../models/modelsproyecto/insumoporactividadviewmodel';
import { RentaMaquinariaPorActividad } from '../../models/modelsproyecto/rentamaquinariaporactividadviewmodel';
import { EquipoSeguridadPorActividad } from '../../models/modelsproyecto/equiposeguridadporactividadviewmodel';

@Injectable({providedIn: 'root'})
export class ActividadPorEtapaService {
    // Propiedades
    private apiUrl: string = environment.apiUrl;
    private apiKey: string = environment.apiKey;
    private options: {} = {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`,
      })
    };
    constructor(private http: HttpClient) { }
    
    // Endpoints
    Eliminar(id: number){
        return this.http.delete<any>(`${this.apiUrl}/api/ActividadPorEtapa/Eliminar/${id}`, this.options)
          .toPromise();
    }

    Buscar(id: number){
        return this.http.get<any>(`${this.apiUrl}/api/ActividadPorEtapa/Buscar/${id}`, this.options)
          .toPromise()
          .then(result => result.data as ActividadPorEtapa)
          .then(data => data);
    }

    Insertar(modelo: ActividadPorEtapa){
        return this.http.post<any>(`${this.apiUrl}/api/ActividadPorEtapa/Insertar`, modelo, this.options)
          .toPromise();
    }

    Listar(id?: number){
        return this.http.get<any>(`${this.apiUrl}/api/ActividadPorEtapa/Listar/${id}`, this.options)
          .toPromise()
          .then(result => result.data as ActividadPorEtapa[])
          .then(data => data);
    }
    
    ListarInsumos(id?: number){
      return this.http.get<any>(`${this.apiUrl}/api/ActividadPorEtapa/ListarInsumos/${id}`, this.options)
        .toPromise()
        .then(result => result.data as InsumoPorActividad[])
        .then(data => data);
    }

    ListarMaquinarias(id?: number){
      return this.http.get<any>(`${this.apiUrl}/api/ActividadPorEtapa/ListarMaquinarias/${id}`, this.options)
        .toPromise()
        .then(result => result.data as RentaMaquinariaPorActividad[])
        .then(data => data);
    }

    ListarEquiposSeguridad(){
      return this.http.get<any>(`${this.apiUrl}/api/ActividadPorEtapa/ListarEquiposSeguridad`, this.options)
        .toPromise()
        .then(result => result.data as EquipoSeguridadPorActividad[])
        .then(data => data);
    }

    ListarInsumosPorActividad(id?: number){
      return this.http.get<any>(`${this.apiUrl}/api/InsumoPorActividad/Listar/${id}`, this.options)
        .toPromise()
        .then(result => result.data as InsumoPorActividad[])
        .then(data => data);
    }
    
    ListarRentaMaquinariasPorActividad(id?: number){
      return this.http.get<any>(`${this.apiUrl}/api/RentaMaquinariaPorActividad/Listar/${id}`, this.options)
        .toPromise()
        .then(result => result.data as RentaMaquinariaPorActividad[])
        .then(data => data);
    }

    ListarEquiposSeguridadPorActividad(id?: number){
      return this.http.get<any>(`${this.apiUrl}/api/EquipoSeguridadPorActividad/Listar/${id}`, this.options)
        .toPromise()
        .then(result => result.data as EquipoSeguridadPorActividad[])
        .then(data => data);
    }

    Actualizar(modelo: ActividadPorEtapa){
        return this.http.put<any>(`${this.apiUrl}/api/ActividadPorEtapa/Actualizar`, modelo, this.options)
          .toPromise();
    }

    Replicar(modelo: EtapaPorProyecto){
      return this.http.post<any>(`${this.apiUrl}/api/ActividadPorEtapa/Replicar`, modelo, this.options)
        .toPromise();
    }

    AutoCompletar(id: number){
      return this.http.get<any>(`${this.apiUrl}/api/ActividadPorEtapa/AutoCompletar/${id}`, this.options)
        .toPromise();
    }
}