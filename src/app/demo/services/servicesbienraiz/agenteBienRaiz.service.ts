import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { AgenteBienRaiz, AgenteBienRaiz2 } from '../../models/modelsbienraiz/agentebienraizviewmodel';
import { Observable } from 'rxjs';
import { Respuesta } from '../ServiceResult';

@Injectable({
  providedIn: 'root'
})
export class agenteBienRaizService {
  constructor(private http: HttpClient) { }

  // URL base de la API y clave de API, obtenidas del archivo de configuración de entorno.
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;

  // URL específica para el servicio de agentes de bienes raíces.
  private agenteBienRaizEncabezado = `${this.apiUrl}/api/AgenteBienesRaices`;

  // Método privado para obtener las opciones HTTP, incluyendo los encabezados necesarios.
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  // Lista todos los agentes de bienes raíces.
  Listar(): Observable<AgenteBienRaiz[]> {
    return this.http.get<AgenteBienRaiz[]>(`${this.agenteBienRaizEncabezado}/Listar`, this.getHttpOptions());
  }

  // Inserta un nuevo agente de bienes raíces.
  Insertar(modelo: any): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.agenteBienRaizEncabezado}/Insertar`, modelo, this.getHttpOptions());
  }

  // Actualiza un agente de bienes raíces existente.
  Actualizar(modelo: any): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${this.agenteBienRaizEncabezado}/Actualizar`, modelo, this.getHttpOptions());
  }

  // Elimina un agente de bienes raíces mediante una solicitud PUT.
  // Se utiliza el método `toPromise` para convertir el observable en una promesa.
  Eliminar(id: number): Promise<any> {
    return this.http.put<any>(`${this.apiUrl}/api/AgenteBienesRaices/Eliminar`, id, this.getHttpOptions())
      .toPromise();
  }

  // Lista todos los agentes de bienes raíces. Similar a `Listar`, pero se ha separado para mayor claridad.
  ListarAgentes(): Observable<AgenteBienRaiz[]> {
    return this.http.get<AgenteBienRaiz[]>(`${this.agenteBienRaizEncabezado}/Listar`, this.getHttpOptions());
  }

  // Busca un agente de bienes raíces por su DNI.
  BuscarAgente(dni: string): Observable<AgenteBienRaiz2> {
    return this.http.get<AgenteBienRaiz2>(`${this.agenteBienRaizEncabezado}/Buscar/${dni}`, this.getHttpOptions());
  }
}
