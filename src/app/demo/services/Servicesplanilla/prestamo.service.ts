import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Prestamo } from '../../models/modelsplanilla/prestamoviewmodel';
import { environment } from 'src/environment/environment';
import { Abono } from '../../models/modelsplanilla/abonoviewmodel';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root',
})
export class PrestamoService {
    //Definimos una variable que muestre si se el sistema está cargando o no
    cargando: boolean = true;
    //Definimos una variable que maneje el estado de la pantalla que se está mostrando actualmente
    pantallas: Map<string, boolean> = new Map<string, boolean>()
        .set('Index', true)
        .set('Detalle', false)
        .set('Form', false)
        .set('Historial', false);
    //Definimos una variable que represente si se muestra o no el formulario
    mostrarPantallaForm: boolean = false;
    //Método para actualizar el estado de las pantallas en el Map de pantallas
    mostrarPantalla(_pantalla: string) {
        this.pantallas.forEach((valor, pantalla) =>
            this.pantallas.set(pantalla, false)
        );
        this.pantallas.set(_pantalla, true);
    }
    //Método para mostrar el formulario
    mostrarForm(editando: boolean) {
        this.mostrarPantallaForm = true;
        this.mostrarPantalla('Form');
        if (!editando) {
            this.prestamo = new Prestamo(
                parseInt(this.cookieService.get('usua_Id')),
                new Date()
            );
        }
    }
    //Definimos una variable de la lista de los prestamos
    prestamos: Prestamo[] = [];
    //Definimos un préstamo inicial
    prestamo: Prestamo = new Prestamo(
        parseInt(this.cookieService.get('usua_Id')),
        new Date()
    );
    //Métodoa para cargar los préstamos
    cargarData(empl_Id?: number) {
        this.prestamo = null;
        this.getData().subscribe(
            (data: Prestamo[]) => {
                // console.log(
                //     data,
                //     'prestamos'
                // );

                //Seteamos la variable de cargando a falso
                this.cargando = false;
                //Seteamos la lista de préstamos
                this.prestamos = data.map((pres) => ({
                    ...pres,
                    //Parseamos las variables para mostrarlas en el datatable
                    codigo:
                        typeof pres.codigo === 'string'
                            ? parseInt(pres.codigo)
                            : pres.codigo,
                    tasaInteres:
                        (pres.pres_TasaInteres * 100).toString() + ' %',
                    fechaPrimerPago: new Date(
                        pres.pres_FechaPrimerPago
                    ).toLocaleDateString(),
                    pres_FechaPrimerPago: new Date(pres.pres_FechaPrimerPago),
                    fechaUltimoPago: new Date(
                        pres.fechaUltimoPago
                    ).toLocaleDateString(),
                    estadoPrestamo:
                        typeof pres.total === 'number' &&
                        typeof pres.pres_Abonado === 'number'
                            ? parseFloat(pres.total.toString()).toFixed(2) ===
                              parseFloat(pres.pres_Abonado.toString()).toFixed(
                                  2
                              )
                                ? 'Cancelado'
                                : 'En proceso'
                            : 'En proceso',
                    fechaCreacion: new Date(
                        pres.pres_FechaCreacion
                    ).toLocaleDateString(),
                    fechaModificacion: pres.pres_FechaModificacion
                        ? new Date(
                              pres.pres_FechaModificacion
                          ).toLocaleDateString()
                        : '',
                }));
                //Si tenemos el id de un empleado, filtramos los prestamos según el id
                if (empl_Id) {
                    this.prestamos = this.prestamos.filter(
                        (pres) => pres.empl_Id === empl_Id
                    );

                    // console.log(this.prestamos, 'this.prestamos');
                    //Seteamos el codigo para el rownumber(#) del datatable
                    for (
                        let index = 0;
                        index < this.prestamos.length;
                        index++
                    ) {
                        this.prestamos[index].codigo = index + 1;
                    }
                }
            },
            (error) => {
                // console.log(error);
                
                //Seteamos la variable de cargando a falso
                this.cargando = false;
            }
        );
        // console.clear()
    }

    constructor(
        //Inyectamos el HttpClient
        private http: HttpClient,
        //Inyectamos el Router
        public router: Router,
        //Inyectamos el CookieService
        public cookieService: CookieService
    ) {}
    //Definimos la url de la API según el ambiente
    private API_URL: string = environment.apiUrl;
    //Definimos la Key de seguridad de la API
    private apiKey: string = environment.apiKey;
    //Definimos la url base para hacer las peticiones   
    private BaseUrl = `${this.API_URL}/api/Prestamo`;

    private getHttpOptions() {
        return {
            headers: new HttpHeaders({
                XApiKey: `${this.apiKey}`,
            }),
        };
    }
    //Método para obtener el listado de los préstamos
    getData(): Observable<Prestamo[]> {
        return this.http.get<Prestamo[]>(
            this.BaseUrl + '/Listar',
            this.getHttpOptions()
        );
    }
    //Método para editar un préstamo
    Editar(json: Prestamo): Observable<any> {
        return this.http
            .put<any>(
                this.BaseUrl + '/Actualizar',
                {
                    ...json,
                    pres_TasaInteres: json.pres_TasaInteres / 100,
                },
                {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                        XApiKey: `${this.apiKey}`,
                    }),
                }
            )
            .pipe(map((res) => res.code >= 200 && res.code < 300));
    }
    //Método para insertar un préstamo
    Insertar(json: Prestamo): Observable<any> {
        return this.http
            .post<any>(
                this.BaseUrl + '/Insertar',
                {
                    ...json,
                    pres_TasaInteres: json.pres_TasaInteres / 100,
                },
                {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                        XApiKey: `${this.apiKey}`,
                    }),
                }
            )
            .pipe(map((res) => res.code >= 200 && res.code < 300));
    }
    //Método para editar un abono de un préstamo
    EditarAbono(json: Abono): Observable<any> {
        return this.http
            .put<any>(this.BaseUrl + '/ActualizarAbono', json, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    XApiKey: `${this.apiKey}`,
                }),
            })
            .pipe(map((res) => res.code >= 200 && res.code < 300));
    }
    //Método para insertar un abono a un préstamo
    InsertarAbono(json: Abono): Observable<any> {
        return this.http
            .post<any>(this.BaseUrl + '/InsertarAbono', json, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    XApiKey: `${this.apiKey}`,
                }),
            })
            .pipe(map((res) => res.code >= 200 && res.code < 300));
    }
    //Método para eliminar un préstamo
    Eliminar(id: number): Observable<any> {
        return this.http
            .delete<any>(
                `${this.BaseUrl}/Eliminar?id=${id}`,
                this.getHttpOptions()
            )
            .pipe(map((res) => res.code >= 200 && res.code < 300));
    }
}
