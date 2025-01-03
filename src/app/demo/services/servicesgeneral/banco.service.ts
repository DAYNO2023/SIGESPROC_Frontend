import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Banco } from '../../models/modelsgeneral/bancoviewmodel';
import { Respuesta } from '../ServiceResult';
import { environment } from 'src/environment/environment';

@Injectable({
    providedIn: 'root',
})
export class BancoService {
    //Inyectamos el HttpClient
    constructor(private http: HttpClient) {}
    //Definimos la url de la API según el ambiente
    private API_URL: string = environment.apiUrl;
    //Definimos la Key de seguridad de la API
    private apiKey: string = environment.apiKey;
    //Definimos la url base para hacer las peticiones
    private BaseUrl = `${this.API_URL}/api/Banco`;

    private getHttpOptions() {
        return {
            headers: new HttpHeaders({
                XApiKey: `${this.apiKey}`,
            }),
        };
    }

    banco: Banco;
    //Método para obtener el listado de los bancos
    getData(): Observable<Banco[]> {
        return this.http.get<Banco[]>(
            this.BaseUrl + '/Listar',
            this.getHttpOptions()
        );
    }
    //Método para editar un banco
    Editar(json: Banco): Observable<boolean> {
        return this.http
            .put<Respuesta>(this.BaseUrl + '/Actualizar', json, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    XApiKey: `${this.apiKey}`,
                }),
            })
            .pipe(map((res) => res.code >= 200 && res.code < 300));
    }
    //Método para insertar un banco
    Insertar(json: Banco): Observable<boolean> {
        return this.http
            .post<Respuesta>(this.BaseUrl + '/Insertar', json, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    XApiKey: `${this.apiKey}`,
                }),
            })
            .pipe(map((res) => res.code >= 200 && res.code < 300));
    }
    //Método para eliminar un banco
    Eliminar(id: number): Observable<boolean> {
        return this.http
            .delete<Respuesta>(
                `${this.BaseUrl}/Eliminar?id=${id}`,
                this.getHttpOptions()
            )
            .pipe(map((res) => res.code >= 200 && res.code < 300));
    }
}
