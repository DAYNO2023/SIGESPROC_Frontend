import { Injectable } from '@angular/core';
import { Empleado } from '../../models/modelsgeneral/empleadoviewmodel';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Respuesta } from '../ServiceResult';
import { Deduccion } from '../../models/modelsplanilla/deduccionviewmodel';
import { environment } from 'src/environment/environment';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { HistorialDePago } from '../../models/modelsgeneral/historialdepagoviewmodel';

@Injectable({
    providedIn: 'root',
})
export class EmpleadoService {
    //Definimos una variable que muestre si se el sistema está cargando o no
    cargando: boolean = true;
    //Definimos una variable que muestre si el tab de deducciones está bloqueado
    public tabDeduccionesBloqueado: boolean = false;
    //Definimos una variable que maneje el estado de la pantalla que se está mostrando actualmente
    pantallas: Map<string, boolean> = new Map<string, boolean>()
        .set('Index', true)
        .set('Detalle', false)
        .set('Historial', false);
    //Definimos una variable que represente si se muestra o no el formulario
    mostrarPantallaForm: boolean = false;
    //Definimos los tabs del formulario
    tabs: { name: string; value: number }[] = [
        { name: 'Datos generales', value: 1 },
        { name: 'Deducciones', value: 2 },
        { name: 'Prestamos', value: 3 },
    ];
    //Definimos una variable que muestre el tab actual
    tabActual: number = 0;

    imagen: any;
    //Método para actualizar el estado de las pantallas en el Map de pantallas
    mostrarPantalla(_pantalla: string) {
        this.pantallas.forEach((valor, pantalla) =>
            this.pantallas.set(pantalla, false)
        );
        this.pantallas.set(_pantalla, true);
    }
    //Método para mostrar el formulario
    mostrarForm(editando: boolean) {
        if (editando) {
            this.tabDeduccionesBloqueado = false;
        } else {
            this.tabDeduccionesBloqueado = true;
        }
        this.mostrarPantallaForm = true;
        this.mostrarPantalla('Form');
        if (!editando) {
            this.empleado = new Empleado(
                parseInt(this.cookieService.get('usua_Id')),
                new Date()
            );
        }
    }
    //Definimos una variable de la lista de los empleados
    empleados: Empleado[] = [];
    //Definimos un empleado inicial
    empleado: Empleado = new Empleado(
        parseInt(this.cookieService.get('usua_Id')),
        new Date()
    );
    //Definimos una variable de la lista de las deducciones
    deducciones: Deduccion[];
    //Definimos una variable de la lista de las deducciones del empleado
    deduccionesDelEmpleado: {
        deem_Id: number;
        dedu_Id: number;
        empl_Id: number;
        dedu_Porcentaje: number;
        dedu_EsMontoFijo: boolean;
        dedu_Descripcion: string;
    }[] = [];
    //Método para cargar las deducciones del empleado
    cargarDeduccionesDelEmpleado() {
        this.getdeduccionesDelEmpleado(this.empleado.empl_Id).subscribe(
            (
                data: {
                    deem_Id: number;
                    dedu_Id: number;
                    empl_Id: number;
                    dedu_Porcentaje: number;
                    dedu_EsMontoFijo: boolean;
                    dedu_Descripcion: string;
                }[]
            ) => {
                this.deduccionesDelEmpleado = { ...data };
                //Si está incluida en las deducciones la chekeamos para el datatable del tab de deducciones del empleado
                this.deducciones.forEach((dedu) => {
                    if (data.some((deduc) => deduc.dedu_Id === dedu.dedu_Id)) {
                        dedu._checked = true;
                    }
                });
            },
            (error) => {
                // console.log(error);
            }
        );
    }
    //Método para obtener las deducciones del empleado
    getdeduccionesDelEmpleado(empl_Id: number) {
        return this.http.get<
            {
                deem_Id: number;
                dedu_Id: number;
                empl_Id: number;
                dedu_Porcentaje: number;
                dedu_EsMontoFijo: boolean;
                dedu_Descripcion: string;
            }[]
        >(
            `${this.API_URL}/api/Deduccion/BuscarDeduccionPorEmpleado/${empl_Id}`,
            this.getHttpOptions()
        );
    }
    //Método para cargar los empleados
    cargarData() {
        this.getData().subscribe(
            (data: Empleado[]) => {
                // console.log(data.filter(empl=>empl.carg_Id === 1).sort((a, b) => a.salarioPromedio - b.salarioPromedio), 'jefes de obra');
                // this.empleados = {...data,
                //     fechaNacimiento: data.empl_FechaNacimiento.toISOString()
                // };

                //Seteamos la lista de préstamos
                this.empleados = data.map((empl) => ({
                    ...empl,
                    //Parseamos las variables para mostrarlas en el datatable
                    empl_FechaNacimiento: new Date(empl.empl_FechaNacimiento),
                    empl_Sexo:
                        empl.empl_Sexo === 'F' ? 'Femenino' : 'Masculino',
                    salario: 'L. ' + empl.empl_Salario.toFixed(2),
                    fechaNacimiento: new Date(
                        empl.empl_FechaNacimiento
                    ).toLocaleDateString(),
                    fechaCreacion: new Date(
                        empl.empl_FechaCreacion
                    ).toLocaleDateString(),
                    fechaModificacion: empl.empl_FechaModificacion
                        ? new Date(
                              empl.empl_FechaModificacion
                          ).toLocaleDateString()
                        : '',
                    empl_Imagen: empl.empl_Imagen
                        ? `${empl.empl_Imagen}&t=${new Date().getTime()}`
                        : '',
                }));
                //Seteamos la variable de cargando a falso
                this.cargando = false;
            },
            (error) => {
                // console.log(error);
                
                //Seteamos la variable de cargando a falso
                this.cargando = false;
            }
        );
    }
    //Método para obtener un empleado según su DNI
    getEmpleado(DNI: string): Observable<Empleado> {
        return this.http.get<Empleado>(
            this.BaseUrl + '/BuscarPorDNI/' + DNI,
            this.getHttpOptions()
        );
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
    public BaseUrl = `${this.API_URL}/api/Empleado`;

    private getHttpOptions() {
        return {
            headers: new HttpHeaders({
                XApiKey: `${this.apiKey}`,
            }),
        };
    }
    //Método para obtener el listado de los empleados
    getData(): Observable<Empleado[]> {
        return this.http.get<Empleado[]>(
            this.BaseUrl + '/Listar',
            this.getHttpOptions()
        );
    }
    //Método para obtener el historial de pago del empleado
    getHistorial(): Observable<HistorialDePago[]> {
        return this.http.get<HistorialDePago[]>(
            this.BaseUrl + '/HistorialDePago?empl_Id=' + this.empleado.empl_Id,
            this.getHttpOptions()
        );
    }
    //Método para subir la imagen del empleado
    SubirImagen(image: File | null, empl_Id: number): Observable<any> {
        // console.log(empl_Id, 'empl_Id');
        
        //Creamos un formData
        const formData = new FormData();
        if (image) {
            //Si hay una imagen la agregamos al formData
            formData.append('imagen', image, empl_Id.toString());
        }
        //Realizamos la petición post, el endpoint depende si hay imagen o no
        return this.http.post<Respuesta>(
            image
                ? this.BaseUrl + '/SubirImagen'
                : this.BaseUrl + '/QuitarImagen?empl_Id=' + empl_Id,
            image ? formData : null,
            {
                headers: new HttpHeaders({
                    XApiKey: `${this.apiKey}`,
                }),
            }
        );
    }
    //Método para editar un empleado
    Editar(json: Empleado): Observable<any> {
        return this.http.put<Respuesta>(
            this.BaseUrl + '/Actualizar',
            {
                ...json,
                empl_FechaNacimiento: json.empl_FechaNacimiento.toISOString(),
                empl_Salario: json.empl_Salario ?? 0,
            },
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    XApiKey: `${this.apiKey}`,
                }),
            }
        );
    }
    //Método para insertar un empleado
    Insertar(json: Empleado): Observable<any> {
        return this.http.post<Respuesta>(
            this.BaseUrl + '/Insertar',
            {
                ...json,
                empl_FechaNacimiento: json.empl_FechaNacimiento.toISOString(),
                deduccionesJSON: JSON.stringify(
                    this.deduccionesDelEmpleado.map((deem) => {
                        return {
                            ...deem,
                            deem_Porcentaje: deem.dedu_Porcentaje,
                            deem_EsMontoFijo: deem.dedu_EsMontoFijo,
                        };
                    })
                ),
                empl_Salario: json.empl_Salario ?? 0,
            },
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    XApiKey: `${this.apiKey}`,
                }),
            }
        );
    }
    //Método para desactivar un empleado
    Desactivar(): Observable<Respuesta> {
        return this.http.put<Respuesta>(
            `${this.BaseUrl}/Desactivar`,
            {
                ...this.empleado,
                empl_Prestaciones: this.empleado.empl_Prestaciones
                    ? this.empleado.empl_Prestaciones
                    : 0,
                empl_OtrasRemuneraciones: this.empleado.empl_OtrasRemuneraciones
                    ? this.empleado.empl_OtrasRemuneraciones
                    : 0,
            },
            this.getHttpOptions()
        );
    }
    //Método para activar un empleado
    Activar(): Observable<Respuesta> {
        return this.http.put<Respuesta>(
            `${this.BaseUrl}/Activar`,
            {
                ...this.empleado,
                empl_Prestaciones: this.empleado.empl_Prestaciones
                    ? this.empleado.empl_Prestaciones
                    : 0,
                empl_OtrasRemuneraciones: this.empleado.empl_OtrasRemuneraciones
                    ? this.empleado.empl_OtrasRemuneraciones
                    : 0,
            },
            this.getHttpOptions()
        );
    }
}
