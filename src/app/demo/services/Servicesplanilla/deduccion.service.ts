import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { APIResponse } from '../../models/APIresponseviewmodel';
import { Deduccion } from '../../models/modelsplanilla/deduccionviewmodel';
import { Respuesta } from '../ServiceResult';
import { environment } from 'src/environment/environment';
import { EmpleadoService } from '../servicesgeneral/empleado.service';

@Injectable({
    providedIn: 'root',
})
export class DeduccionService {

    constructor(private http: HttpClient,
        //Inyectamos el servicio de empleado
        private empleadoService:EmpleadoService
    ) {}
    //Definimos la url de la API según el ambiente
    private API_URL: string = environment.apiUrl;
    //Definimos la Key de seguridad de la API
    private apiKey: string = environment.apiKey;
    //Definimos la url base para hacer las peticiones
    private BaseUrl = `${this.API_URL}/api/Deduccion`;

    //Método para editar las deducciones del empleado
    EditarDeduccionesDelEmpleado(deduccionesDelEmpleado: 
        {
            deem_Id: number;
            dedu_Id: number;
            empl_Id: number;
            deem_Porcentaje: number;
            deem_EsMontoFijo: boolean;
            dedu_Descripcion: string;
            usua_Creacion: number,
            deem_FechaCreacion: string
        }[]
    ) {
        return this.http
            .put<Respuesta>(
                this.BaseUrl + '/ActualizarDeduccionesDelEmpleado',
                {
                    ...deduccionesDelEmpleado[0],
                    //Asignamos el empl_Id según el empleado actual que se esté editando en el servicio
                    empl_Id: this.empleadoService.empleado.empl_Id,
                    //La API espera un string de las deducciones del empleado
                    deduccionesJSON: JSON.stringify(deduccionesDelEmpleado)
                },
                //Adjuntamos los headers para la petición
                {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                        XApiKey: `${this.apiKey}`,
                    }),
                }
            )
            //Verificamos si la actualización de datos fué exitosa
            .pipe(map((res) => res.code >= 200 && res.code < 300));
    }

    private getHttpOptions() {
        return {
            headers: new HttpHeaders({
                XApiKey: `${this.apiKey}`,
            }),
        };
    }

    deduccion: Deduccion;

    //Método para obtener el listado de las deducciones
    getData(): Observable<Deduccion[]> {
        return this.http
            .get<Deduccion[]>(this.BaseUrl + '/Listar', this.getHttpOptions())
            .pipe(map((response) => this.mapResponse(response)));
    }
    //Método para editar  una deducción
    Editar(json: Deduccion): Observable<any> {
        return this.http
            .put<Respuesta>(this.BaseUrl + '/Actualizar', json, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    XApiKey: `${this.apiKey}`,
                }),
            })
    }
    //Método para insertar una deducción
    Insertar(json: Deduccion): Observable<any> {
        return this.http
            .post<Respuesta>(this.BaseUrl + '/Insertar', json, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    XApiKey: `${this.apiKey}`,
                }),
            })
    }
    //Método para eliminar una deducción
    Eliminar(id: number): Observable<boolean> {
        return this.http
            .delete<Respuesta>(
                `${this.BaseUrl}/Eliminar?id=${id}`,
                this.getHttpOptions()
            )
            .pipe(map((res) => res.code >= 200 && res.code < 300));
    }

    //Método para obtener sólo los atributos que necesitamos del response
    private mapResponse(data: any[]): Deduccion[] {
        return data.map((item: Deduccion) => {
            const model: Deduccion = {
                codigo: item.codigo,
                dedu_Id: item.dedu_Id,
                dedu_Descripcion: item.dedu_Descripcion,
                dedu_EsMontoFijo: item.dedu_EsMontoFijo,
                dedu_Estado: item.dedu_Estado ?? true,
                dedu_FechaCreacion: item.dedu_FechaCreacion,
                fechaCreacion: new Date(
                    item.dedu_FechaCreacion
                ).toLocaleDateString(),
                fechaModificacion: item.dedu_FechaModificacion
                    ? new Date(
                            item.dedu_FechaModificacion
                        ).toLocaleDateString()
                    : '',
                dedu_FechaModificacion: item.dedu_FechaModificacion,
                dedu_Porcentaje: item.dedu_Porcentaje,
                usua_Creacion: item.usua_Creacion,
                usua_Modificacion: item.usua_Modificacion,
                usuaCreacion: item.usuaCreacion,
                usuaModificacion: item.usuaModificacion,
                numDeducciones: item.numDeducciones
            };
            return model;
        });
    }
}
