import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CookieService } from 'ngx-cookie-service';
import { MenuItem, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { filter } from 'rxjs/operators';
import { Gravedades } from 'src/app/demo/models/GravedadIzitoastEnum';
import { Empleado } from 'src/app/demo/models/modelsgeneral/empleadoviewmodel';
import { HistorialDePago } from 'src/app/demo/models/modelsgeneral/historialdepagoviewmodel';
import { Deduccion } from 'src/app/demo/models/modelsplanilla/deduccionviewmodel';
import {
    Deducciones,
    ListadoEmpleadosPlanilla,
} from 'src/app/demo/models/modelsplanilla/planillaviewmdel';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { EmpleadoService } from 'src/app/demo/services/servicesgeneral/empleado.service';
import { DeduccionService } from 'src/app/demo/services/servicesplanilla/deduccion.service';
import { planillaservice } from 'src/app/demo/services/Servicesplanilla/planilla.service';
import { PrestamoService } from 'src/app/demo/services/servicesplanilla/prestamo.service';
import { ToastService } from 'src/app/demo/services/toast.service';

@Component({
    selector: 'app-empleado',
    templateUrl: './empleado.component.html',
    styleUrl: './empleado.component.scss',
    providers: [MessageService],
})
export class EmpleadoComponent implements OnInit {
    //Inicialización de la variable que contiene las opciones del botón de acciones del datatable
    items: MenuItem[] = [];
    //Inicialización de la variable que contiene las opciones del botón de acciones del datatable
    itemsHistorial: MenuItem[] = [];
    //Inicialización de la variable que contiene las opciones del botón de acciones del datatable
    itemsPlanilla: MenuItem[] = [];
    //Tabla vacía para la tabla detalle
    tablaVacia = [{}];
    //Variable que indica si el usuario ya intentó subir el formulario
    submitted: boolean = false;
    //Variable que indica si el usuario ya intentó activar o desactivar el empleado
    submittedEmpl_Estado: boolean = false;
    //Variable que indica si el modal de activación o desactivación del empleado es visible
    mostrarModalActivacion: boolean = false;
    //Declaración de la variable que indica si el tab de deducciones es accessible
    tabDeduccionesBloqueado: boolean;
    //Inicialización de la variable que almacena las deducciones por empleado
    deduccionesDelEmpleado: {
        deem_Id: number;
        dedu_Id: number;
        empl_Id: number;
        dedu_Porcentaje: number;
        dedu_EsMontoFijo: boolean;
        dedu_Descripcion: string;
    }[] = [];
    //Inicialización de la variable que almacena las deducciones
    deducciones: Deduccion[] = [];
    //Inicialización de la variable que almacena las deducciones para la pantalla de Detalle
    deduccionesDetalle: Deduccion[] = [];
    //Inicialización de la variable que indica si la previsualización del Historial de pagos del empleado es visible
    isPdfVisible: boolean = false;
    //Inicialización de la variable que indica si el botón para ocultar la previsualización es visible
    isRegresarVisible: boolean = false;
    idsDeduccionesDelEmpleado: number[];
    mostrarMsjLimite: boolean;
    mostrarModalEditarDeducciones: boolean;
    sumaDeCuotasDePrestamosPendientes: number;
    capacidadDePagoPorCuota: number;
    usua_Id: number;
    plan_Id: number;
    numDeducciones: number;
    totalColumnas: number;
    deduccion: Deduccion[];
    listadoplanilla: ListadoEmpleadosPlanilla[];
    deduccionesDetallePlanilla: Deducciones[];
    modalDeducciones: boolean;
    empl_Nombre: any;
    empl_Apellido: any;
    salariobasePlanilla: any;
    empleadosFiltradorDeducciones: ListadoEmpleadosPlanilla[];
    totalDeducido: number;
    sueldoTotal: number;
    salariobase: number;
    selectedPlanilla: any;
    Usuario: string;
    constructor(
        //Inyectamos el servicio de los empleados
        public empleadoService: EmpleadoService,
        //Inyectamos el servicio de deducciones
        private deduccionService: DeduccionService,
        //Inyectamos el servicio de deducciones
        private prestamoService: PrestamoService,
        //Inyectamos el servicio para mostrar toasts en la pantalla
        private toastService: ToastService,
        //Inyectamos el servicio para mostrar sanitizar elementos del DOM
        private sanitizer: DomSanitizer,
        //LLamamos al servicio de global para traer la nomenclatura de moneda
        public globalMoneda: globalmonedaService,
        public router: Router,
        public cookieService: CookieService,
        private servicePlanilla: planillaservice
    ) {
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                // Si la URL coincide con la de este componente, forzamos la ejecución
                if (
                    event.urlAfterRedirects.includes(
                        '/sigesproc/general/Colaboradores'
                    )
                ) {
                    // Aquí puedes volver a ejecutar ngOnInit o un método específico
                    this.ngOnInit();
                }
            });
    }
    //Inicialización de la variable que almacena las columnas del datatable de empleados
    columnas: { prop: string; titulo: string }[] = [];
    //Inicialización de la variable que almacena las columnas del datatable de deducciones
    columnasDeducciones: { prop: string; titulo: string }[] = [];
    ngOnInit() {
        this.Usuario = this.cookieService.get('usua_Usuario');
        const token = this.cookieService.get('Token');
        if (token === 'false') {
            this.router.navigate(['/auth/login']);
        }
        //Seteamos el Id del usuario loggeado
        this.usua_Id = parseInt(this.cookieService.get('usua_Id'));
        //Llamamos a la nomenclatura de la moneda para setearla en el HTML
        if (!this.globalMoneda.getState()) {
            this.globalMoneda.setState();
        }
        //Mostramos la pantalla del Index
        this.empleadoService.mostrarPantallaForm = false;
        this.empleadoService.mostrarPantalla('Index');
        //Establece las columnas del datatable
        const columnasMap = new Map<string, string>();
        columnasMap.set('empl_Nombre', 'Nombre');
        columnasMap.set('empl_Apellido', 'Apellido');
        columnasMap.set('empl_DNI', 'DNI');
        columnasMap.set('empl_Telefono', 'Teléfono');
        columnasMap.set('empl_Sexo', 'Sexo');
        columnasMap.set('fechaNacimiento', 'Fecha Nacimiento');
        columnasMap.set('estadoCivil', 'Estado Civil');
        columnasMap.set('estado', 'Estado');
        columnasMap.set('ciudad', 'Ciudad');
        columnasMap.set('cargo', 'Cargo');
        columnasMap.set('frecuencia', 'Frecuencia Pago');
        columnasMap.set('banco', 'Banco');
        columnasMap.set('empl_NoBancario', 'No. De cuenta bancaria');
        columnasMap.set('empl_Salario', 'Salario');
        columnasMap.set('empl_Prestaciones', 'Prestaciones');
        columnasMap.set('empl_OtrasRemuneraciones', 'Otras Remuneraciones');
        columnasMap.set('empl_CorreoElectronico', 'Correo');
        this.columnas = Array.from(columnasMap, ([key, value]) => ({
            prop: key,
            titulo: value,
        }));
        //Asignamos la variable que indica si el tab de deducciones está bloqueado
        this.tabDeduccionesBloqueado =
            this.empleadoService.tabDeduccionesBloqueado;
        //Cargamos los empleados si están vacíos
        if (this.empleadoService.empleados.length === 0) {
            this.empleadoService.cargarData();
        }
        //Opciones del boton del datatable
        this.items = [
            {
                label: 'Editar',
                icon: 'pi pi-user-edit',
                command: (event) => {
                    //Seteamos el tab actual al formulario de datos generales
                    this.empleadoService.tabActual = 0;
                    //Cargamos las deducciones por empleado
                    this.cargarDeduccionesDelEmpleado();
                    //Mostramos el formulario de los tabs
                    this.empleadoService.mostrarForm(true);
                    //Cargar prestamos por empleado
                    this.prestamoService.cargarData(
                        this.empleadoService.empleado.empl_Id
                    );
                },
            },
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: (event) => {
                    //Mostramos la pantalla de Detalle
                    this.empleadoService.mostrarPantalla('Detalle');
                    //Cargamos las deducciones por empleado
                    this.cargarDeduccionesDelEmpleado();
                },
            },
            {
                //Cambiamos el texto y el icono del botón según el estado del empleado
                label: this.empleadoService.empleado.empl_Estado
                    ? 'Desactivar'
                    : 'Activar',
                icon: this.empleadoService.empleado.empl_Estado
                    ? 'pi pi-lock'
                    : 'pi pi-lock-open',
                command: (event) => {
                    if (this.empleadoService.empleado.empl_Estado) {
                        this.empleadoService.empleado.empl_Prestaciones = null;
                        this.empleadoService.empleado.empl_OtrasRemuneraciones =
                            null;
                    }
                    this.empleadoService.empleado.empl_ObservacionActivar = '';
                    this.empleadoService.empleado.empl_ObservacionInactivar =
                        '';
                    this.submittedEmpl_Estado = false;
                    this.mostrarModalActivacion = true;
                },
            },
            {
                //Cambiamos el texto y el icono del botón según el estado del empleado
                label: 'Historial de pago',
                icon: 'pi pi-print',
                command: (event) => {
                    //Cargamos los proyectos por empleado
                    this.cargarHistorial();
                    this.empleadoService.mostrarPantalla('Historial');
                },
            },
        ];
        //Opciones del boton del datatable
        this.itemsHistorial = [
            {
                label: 'Planilla',
                icon: 'pi pi-money-bill',
                command: (event) => {
                    this.DetallesPlanilla();
                },
            },
        ];
        // Configura los elementos del menú
        this.itemsPlanilla = [
            {
                label: 'Deducciones',
                icon: 'pi pi-money-bill',
                command: (event) => this.FiltradoDeduccionesPorEmpleados(),
            },
        ];
        //Asignamos las columnas del datatable de deducciones
        const columnasDeduccionesMap = new Map<string, string>();
        columnasDeduccionesMap.set('codigo', 'No. ');
        columnasDeduccionesMap.set('dedu_Descripcion', 'Deducción');
        columnasDeduccionesMap.set('dedu_Porcentaje', 'Valor');
        this.columnasDeducciones = Array.from(
            columnasDeduccionesMap,
            ([key, value]) => ({
                prop: key,
                titulo: value,
            })
        );
        //Cargamos las deducciones
        this.cargarDeduccionesData();
    }

    //Sanitiza la url de la imagen
    sanitizarUrl(base64: string): SafeUrl {
        return this.sanitizer.bypassSecurityTrustUrl(base64);
    }

    // Filtra las deducciones por empleados
    async FiltradoDeduccionesPorEmpleados() {
        this.empleadoService.mostrarPantalla('DeduccionesInterno');
        // this.create = false;
        this.empl_Nombre = this.selectedPlanilla.empl_Nombre;
        this.empl_Apellido = this.selectedPlanilla.empl_Apellido;
        this.salariobasePlanilla = this.selectedPlanilla.empl_Salario;

        this.empleadosFiltradorDeducciones = this.listadoplanilla.filter(
            (pl) => {
                return pl.empl_Id == this.selectedPlanilla.empl_Id;
            }
        );

        this.totalDeducido =
            this.empleadosFiltradorDeducciones[0].deducciones[0].totalDeducido;
        this.sueldoTotal =
            this.empleadosFiltradorDeducciones[0].deducciones[0].sueldoTotal;
        this.salariobase =
            this.empleadosFiltradorDeducciones[0].deducciones[0].empl_Salario;

        //   console.log( this.empleadosFiltradorDeducciones, '<-- La data de los empleados filtrados por deducciones')
    }

    botonCambiarSiEsMontoFijoClick(deduccion: Deduccion) {
        if (
            this.empleadoService.deduccionesDelEmpleado.some(
                (dedu) => dedu.dedu_Id === deduccion.dedu_Id
            )
        ) {
            this.actualizarDeduccionesDelEmpleado(deduccion);
        }
    }

    valorDeduccionOnBlur(deduccion: Deduccion) {
        if (
            this.empleadoService.deduccionesDelEmpleado.some(
                (dedu) => dedu.dedu_Id === deduccion.dedu_Id
            )
        ) {
            this.actualizarDeduccionesDelEmpleado(deduccion);
        }
    }

    //Actualiza una deducción del arreglo de deducciones del empleado
    actualizarDeduccionesDelEmpleado(deduccion: Deduccion) {
        if (deduccion.dedu_Porcentaje) {
            // console.log(this.empleadoService.deduccionesDelEmpleado, 'ANTES this.empleadoService.deduccionesDelEmpleado');

            this.empleadoService.deduccionesDelEmpleado =
                this.empleadoService.deduccionesDelEmpleado.filter(
                    (item) => item.dedu_Id !== deduccion.dedu_Id
                );

            // console.log(this.empleadoService.deduccionesDelEmpleado, 'DESPUES this.empleadoService.deduccionesDelEmpleado');

            this.deduccionesDelEmpleado = this.deduccionesDelEmpleado.filter(
                (item) => item.dedu_Id !== deduccion.dedu_Id
            );
            // this.idsDeduccionesDelEmpleado = this.idsDeduccionesDelEmpleado.filter(dedu_Id=>dedu_Id !== deduccion.dedu_Id);
            this.empleadoService.deduccionesDelEmpleado.push({
                deem_Id: 0,
                dedu_Id: deduccion.dedu_Id,
                empl_Id: this.empleadoService.empleado.empl_Id
                    ? this.empleadoService.empleado.empl_Id
                    : 0,
                dedu_Descripcion: deduccion.dedu_Descripcion,
                dedu_EsMontoFijo: deduccion.dedu_EsMontoFijo,
                dedu_Porcentaje: deduccion.dedu_Porcentaje,
            });
            // this.idsDeduccionesDelEmpleado.push(deduccion.dedu_Id)
        }
    }

    //Carga las deducciones del empleado
    cargarDeduccionesDelEmpleado() {
        this.empleadoService
            .getdeduccionesDelEmpleado(this.empleadoService.empleado.empl_Id)
            .subscribe(
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
                    // console.log(data, 'data');

                    //Asignamos las deducciones del empleado en el arreglo de deduccionesDelEmpleado
                    this.deduccionesDelEmpleado = [...data];
                    //Asignamos los Ids de las deducciones en el arreglo de idsDeduccionesDelEmpleado
                    this.idsDeduccionesDelEmpleado =
                        this.deduccionesDelEmpleado.map(
                            (deduccion) => deduccion.dedu_Id
                        );
                    //Asigamos las deduccionesDelEmpleado del servicio
                    this.empleadoService.deduccionesDelEmpleado =
                        this.deduccionesDelEmpleado;
                    //Cargamos las deducciones
                    this.cargarDeduccionesData();
                    //Ordenamos las deducciones para la tabla mostrada en la pantalla de Detalle
                    this.deduccionesDetalle = this.deducciones
                        .filter((ded) =>
                            this.deduccionesDelEmpleado.some(
                                (item) => item.dedu_Id === ded.dedu_Id
                            )
                        )
                        .sort(
                            (a, b) =>
                                parseInt(a.codigo.toString()) -
                                parseInt(b.codigo.toString())
                        )
                        .map((ded, i) => {
                            return {
                                ...ded,
                                codigo: i + 1,
                            };
                        });
                },
                (error) => {
                    //Si hay un error en el sistema que se comunique con un administrador
                    this.toastService.toast(
                        Gravedades.error,
                        'Algo salió mal. Comuníquese con un Administrador.'
                    );
                }
            );
    }

    //Lógica del botón de siguiente o guardar de la pantalla de prestamos por empleado
    handleSiguientePrestamos() {
        if (this.empleadoService.empleado.empl_Id) {
            this.empleadoService.tabActual = 3;
        } else {
            this.empleadoService.mostrarPantalla('Index');
            this.empleadoService.mostrarPantallaForm = false;
        }
    }

    //Lógica del botón de nuevo
    botonNuevoClick() {
        this.empleadoService.deduccionesDelEmpleado = [];
        this.deduccionesDelEmpleado = [];
        this.idsDeduccionesDelEmpleado = [];
        this.empleadoService.tabActual = 0;
        this.empleadoService.mostrarForm(false);
        this.empleadoService.empleado = new Empleado(this.usua_Id, new Date());
    }

    // Calcular la suma de las deducciones
    calcularSumaDeDeducciones(): number {
        // console.log(
        //     this.empleadoService.deduccionesDelEmpleado,
        //     'this.empleadoService.deduccionesDelEmpleado'
        // );

        return (
            this.empleadoService.deduccionesDelEmpleado
                // .filter((ded) => this.deduccionesDelEmpleado.some(item=>item.dedu_Id === ded.dedu_Id))
                .reduce(
                    (
                        total: number,
                        deduccion: {
                            deem_Id: number;
                            dedu_Id: number;
                            empl_Id: number;
                            dedu_Porcentaje: number;
                            dedu_EsMontoFijo: boolean;
                            dedu_Descripcion: string;
                        }
                    ) => {
                        let porcentaje = deduccion.dedu_Porcentaje;

                        if (!deduccion.dedu_EsMontoFijo) {
                            return (
                                total +
                                porcentaje *
                                    (this.empleadoService.empleado
                                        .empl_Salario /
                                        100)
                            );
                        } else {
                            return total + porcentaje;
                        }
                    },
                    0
                )
        );
    }

    //Lógica de los checkboxes del datatable de deducciones por empleado
    handleCheckbox(deduccion: Deduccion) {
        const checked = this.idsDeduccionesDelEmpleado.includes(
            deduccion.dedu_Id
        );

        if (checked) {
            this.empleadoService.deduccionesDelEmpleado.push({
                deem_Id: 0,
                dedu_Id: deduccion.dedu_Id,
                empl_Id: this.empleadoService.empleado.empl_Id
                    ? this.empleadoService.empleado.empl_Id
                    : 0,
                dedu_Descripcion: deduccion.dedu_Descripcion,
                dedu_EsMontoFijo: deduccion.dedu_EsMontoFijo,
                dedu_Porcentaje: deduccion.dedu_Porcentaje,
            });
        } else {
            this.empleadoService.deduccionesDelEmpleado =
                this.empleadoService.deduccionesDelEmpleado.filter(
                    (item) => item.dedu_Id !== deduccion.dedu_Id
                );
        }
    }

    calcularSumaDeCuotasDePrestamosPendientes(): number {
        const sumaCuotas = this.prestamoService.prestamos
            .filter(
                (pres) => pres.empl_Id === this.empleadoService.empleado.empl_Id
            )
            .reduce((total, prestamo) => {
                // Sumar las cuotas de los préstamos pendientes (estado "En proceso")
                if (prestamo.estadoPrestamo === 'En proceso') {
                    return total + prestamo.cuota; // Asegúrate de que "cuota" sea la propiedad correcta
                }
                return total;
            }, 0);
        this.sumaDeCuotasDePrestamosPendientes = sumaCuotas;
        return sumaCuotas; // Devuelve la suma de las cuotas
    }

    obtenerCapacidadDePagoPorCuota(): number {
        const sumaDeDeducciones = this.calcularSumaDeDeducciones();
        const capacidadDePago =
            this.empleadoService.empleado.empl_Salario -
            sumaDeDeducciones -
            this.calcularSumaDeCuotasDePrestamosPendientes();

        // console.log('sumaDeDeducciones', sumaDeDeducciones);
        // Retorna la capacidad de pago
        return capacidadDePago > 0 ? capacidadDePago : 0;
    }

    botonGuardarDeduccionesClick() {
        const capacidadDePagoPorCuota = this.obtenerCapacidadDePagoPorCuota();
        this.capacidadDePagoPorCuota = capacidadDePagoPorCuota;
        // console.log(capacidadDePagoPorCuota, 'capacidadDePagoPorCuota');
        // console.log(typeof this.cuota, 'typeof cuota');
        // console.log(this.cuota, 'cuota');

        if (capacidadDePagoPorCuota === 0) {
            this.mostrarMsjLimite = true;
            return;
        }
        this.mostrarMsjLimite = false;
        this.mostrarModalEditarDeducciones = true;
    }

    guardarDeducciones() {
        this.deduccionService
            .EditarDeduccionesDelEmpleado(
                this.empleadoService.deduccionesDelEmpleado.map((deem) => {
                    return {
                        ...deem,
                        deem_EsMontoFijo: deem.dedu_EsMontoFijo,
                        deem_Porcentaje: deem.dedu_Porcentaje,
                        usua_Creacion: this.usua_Id,
                        deem_FechaCreacion: new Date().toISOString(),
                    };
                })
            )
            .subscribe(
                (exito: boolean) => {
                    if (!exito) {
                        this.toastService.toast(
                            Gravedades.error,
                            'Algo salió mal. Comuníquese con un Administrador.'
                        );
                    } else {
                        this.mostrarModalEditarDeducciones = false;
                        this.toastService.toast(
                            Gravedades.success,
                            'Actualizado con Éxito.'
                        );
                    }
                },
                (error) => {
                    // console.log(error);
                    this.toastService.toast(
                        Gravedades.error,
                        'Algo salió mal. Comuníquese con un Administrador.'
                    );
                }
            );
    }

    //Carga las deducciones
    cargarDeduccionesData() {
        this.deduccionService.getData().subscribe(
            (data: Deduccion[]) => {
                this.empleadoService.deducciones = data
                    .map((dedu) => ({
                        ...dedu,
                        dedu_EsMontoFijo:
                            this.empleadoService.deduccionesDelEmpleado.some(
                                (deduccion) =>
                                    deduccion.dedu_Id === dedu.dedu_Id
                            )
                                ? this.empleadoService.deduccionesDelEmpleado.find(
                                      (deduccion) =>
                                          deduccion.dedu_Id === dedu.dedu_Id
                                  ).dedu_EsMontoFijo
                                : dedu.dedu_EsMontoFijo,
                        dedu_Porcentaje:
                            this.empleadoService.deduccionesDelEmpleado.some(
                                (deduccion) =>
                                    deduccion.dedu_Id === dedu.dedu_Id
                            )
                                ? this.empleadoService.deduccionesDelEmpleado.find(
                                      (deduccion) =>
                                          deduccion.dedu_Id === dedu.dedu_Id
                                  ).dedu_Porcentaje
                                : dedu.dedu_Porcentaje,
                        _checked: false,
                    }))
                    .sort((a, b) => a.codigo - b.codigo);
                //Asignamos las deducciones
                this.deducciones = this.empleadoService.deducciones;
            },
            (error) => {
                // console.log(error);
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
            }
        );
    }

    //Filtra el datatable
    filtrar(tabla: Table, event: Event) {
        tabla.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    //Lógica cuando selecciona un empleado
    seleccionarEmpleado(empleado: Empleado) {
        // console.log(empleado);

        this.empleadoService.empleado = { ...empleado };
        //El botón de acciones no es reactivo por eso se vuelven a setear las opciones
        this.items = [
            {
                label: 'Editar',
                icon: 'pi pi-user-edit',
                command: (event) => {
                    //Seteamos el tab actual al formulario de datos generales
                    this.empleadoService.tabActual = 0;
                    //Cargamos las deducciones por empleado
                    this.cargarDeduccionesDelEmpleado();
                    //Mostramos el formulario de los tabs
                    this.empleadoService.mostrarForm(true);
                    //Cargar prestamos por empleado
                    this.prestamoService.cargarData(
                        this.empleadoService.empleado.empl_Id
                    );
                },
            },
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: (event) => {
                    //Mostramos la pantalla de Detalle
                    this.empleadoService.mostrarPantalla('Detalle');
                    //Cargamos las deducciones por empleado
                    this.cargarDeduccionesDelEmpleado();
                },
            },
            {
                //Cambiamos el texto y el icono del botón según el estado del empleado
                label: this.empleadoService.empleado.empl_Estado
                    ? 'Desactivar'
                    : 'Activar',
                icon: this.empleadoService.empleado.empl_Estado
                    ? 'pi pi-lock'
                    : 'pi pi-lock-open',
                command: (event) => {
                    if (this.empleadoService.empleado.empl_Estado) {
                        this.empleadoService.empleado.empl_Prestaciones = null;
                        this.empleadoService.empleado.empl_OtrasRemuneraciones =
                            null;
                    }
                    this.empleadoService.empleado.empl_ObservacionActivar = '';
                    this.empleadoService.empleado.empl_ObservacionInactivar =
                        '';
                    this.submittedEmpl_Estado = false;
                    this.mostrarModalActivacion = true;
                },
            },
            {
                //Cambiamos el texto y el icono del botón según el estado del empleado
                label: 'Historial de pago',
                icon: 'pi pi-print',
                command: (event) => {
                    //Cargamos los proyectos por empleado
                    this.cargarHistorial();
                    this.empleadoService.mostrarPantalla('Historial');
                },
            },
        ];
    }

    //Lógica del botón de regresar
    botonRegresarClick() {
        if (this.isRegresarVisible) {
            //Vaciamos el html del elemento contenedor del previsualizador de pdf
            document.getElementById('pdfContainer').innerHTML = '';
            //Asignamos el valor de la variables que indica si el previsualizador es visible a false
            this.isRegresarVisible = false;
            this.isPdfVisible = false;
        } else {
            //Que lo redirija al Index
            this.empleadoService.mostrarPantallaForm = false;
            this.empleadoService.mostrarPantalla('Index');
            //Reseteamos la variable del empleado
            this.empleadoService.empleado = new Empleado(
                this.usua_Id,
                new Date()
            );
        }
    }

    //Lógica del botón de siguiente o guardar de la pantalla de deducciones por empleado
    botonDeduccionesClick() {
        if (this.empleadoService.empleado.empl_Id) {
            this.empleadoService.tabActual = 2;
        } else {
            this.submitted = true;
            //VALIDACIONES
            let todosLosCamposLlenos = true;
            if (this.empleadoService.empleado.empl_Id) {
                //Asignamos la fecha y el usuario que está editando
                this.empleadoService.empleado.usua_Modificacion = this.usua_Id;
                this.empleadoService.empleado.empl_FechaModificacion =
                    new Date();
                for (const prop in this.empleadoService.empleado) {
                    //Si el cargo tiene el Id del cargo de jefe de obra y el salario está vació no hay problema
                    if (
                        prop === 'empl_Salario' &&
                        this.empleadoService.empleado.carg_Id === 1
                    ) {
                        continue;
                    }
                    //Omitimos los campos que no necesiten validación, estos se traen por respuesta de la API
                    if (
                        prop === 'codigo' ||
                        prop === 'banc' ||
                        prop === 'cargo' ||
                        prop === 'carg' ||
                        prop === 'salario' ||
                        prop === 'salarioPromedio' ||
                        prop === 'deduccionesJSON' ||
                        prop === 'empl_Prestaciones' ||
                        prop === 'empl_OtrasRemuneraciones' ||
                        prop === 'empl_Imagen' ||
                        prop === 'usuaModificacion' ||
                        prop === 'fechaModificacion' ||
                        prop === 'empl_ObservacionActivar' ||
                        prop === 'empl_ObservacionInactivar' ||
                        prop === 'empl_Estado'
                    ) {
                        continue;
                    }
                    //Si un campo está vacío
                    if (!this.empleadoService.empleado[prop]) {
                        todosLosCamposLlenos = false;
                        break;
                    }
                }
            } else {
                for (const prop in this.empleadoService.empleado) {
                    //Si el cargo tiene el Id del cargo de jefe de obra y el salario está vació no hay problema
                    if (
                        prop === 'empl_Salario' &&
                        this.empleadoService.empleado.carg_Id === 1
                    ) {
                        continue;
                    }
                    //Omitimos los campos que no necesiten validación, estos se traen por respuesta de la API
                    if (
                        prop === 'empl_Id' ||
                        prop === 'empl_Imagen' ||
                        prop === 'salario' ||
                        prop === 'salarioPromedio' ||
                        prop === 'empl_Prestaciones' ||
                        prop === 'deduccionesJSON' ||
                        prop === 'empl_OtrasRemuneraciones' ||
                        prop === 'usua_Modificacion' ||
                        prop === 'empl_ObservacionActivar' ||
                        prop === 'empl_ObservacionInactivar' ||
                        prop === 'codigo'
                    ) {
                        continue;
                    }
                    //Si un campo está vacío
                    if (!this.empleadoService.empleado[prop]) {
                        todosLosCamposLlenos = false;
                        break;
                    }
                }
            }
            //Verificamos si todos los campos están llenos y validados
            if (
                todosLosCamposLlenos &&
                this.validarDNI() &&
                this.validarNombre() &&
                this.validarApellido() &&
                this.validarTelefono() &&
                this.validarCorreo() &&
                this.validarCuenta() &&
                this.validarSalario()
            ) {
                //Entonces insertamos el empleado
                this.insertarEmpleado();
            } else {
                //Mostramos un toast que le dé a entender que los campos o están vacío o están inválidos
                this.toastService.toast(
                    Gravedades.warning,
                    'Hay datos generales inválidos.'
                );
            }
        }
    }

    //Solo deja ingresar números letras
    soloLetrasKeypress($event: any) {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        const input = $event.target.value + $event.key;
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        if (!regex.test(input)) {
            $event.preventDefault();
        }
    }

    //Valida que la observación de activar solo contengan letras y espacios
    validarObservacionActivar() {
        if (!this.empleadoService.empleado.empl_ObservacionActivar) {
            return false;
        }
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        return regex.test(
            this.empleadoService.empleado.empl_ObservacionActivar
        );
    }

    //Valida que la observación de inactivar solo contengan letras y espacios
    validarObservacionInactivar() {
        if (!this.empleadoService.empleado.empl_ObservacionInactivar) {
            return false;
        }
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        return regex.test(
            this.empleadoService.empleado.empl_ObservacionInactivar
        );
    }

    //Retorna un booleano que indica si es un número de télefono válido
    validarTelefono(): boolean {
        const regex = /^\+?(\d[\d-. ]+)?(\([\d-. ]+\))?[\d-. ]+\d$/;
        if (this.empleadoService.empleado.empl_Telefono.length < 5) {
            return false;
        }
        return regex.test(this.empleadoService.empleado.empl_Telefono);
    }

    //Retorna un booleano que indica si es un correo válido
    validarCorreo(): boolean {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(this.empleadoService.empleado.empl_CorreoElectronico);
    }
    //Valida que el DNI, teléfono y el no. cuenta sean números
    validarDNI(): boolean {
        const regex = /^\d+$/;
        if (this.empleadoService.empleado.empl_DNI.length !== 13) {
            return false;
        }
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        return regex.test(this.empleadoService.empleado.empl_DNI);
    }

    //Valida que el DNI, teléfono y el no. cuenta sean números
    validarCuenta(): boolean {
        const regex = /^\d+$/;
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        return regex.test(this.empleadoService.empleado.empl_NoBancario);
    }

    //Valida que el nombre y el apellido solo contengan letras y espacios
    validarNombre() {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        return regex.test(this.empleadoService.empleado.empl_Nombre);
    }

    //Valida que el nombre y el apellido solo contengan letras y espacios
    validarApellido() {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        return regex.test(this.empleadoService.empleado.empl_Apellido);
    }
    //Valida que el salario sea un número decimal y si el empleado es jefe de obra
    validarSalario(): boolean {
        const regex = /^\d*\.?\d*$/;
        if (this.empleadoService.empleado.carg_Id === 1) {
            return true;
        }
        return regex.test(
            this.empleadoService.empleado.empl_Salario.toString()
        );
    }
    //Inserta un empleado por medio de una petición post
    insertarEmpleado() {
        this.empleadoService.Insertar(this.empleadoService.empleado).subscribe(
            (respuesta: Respuesta) => {
                //Si no hubo problema al insertar
                if (respuesta.code >= 200 && respuesta.code < 300) {
                    if (this.empleadoService.imagen) {
                        this.empleadoService
                            .SubirImagen(
                                this.empleadoService.imagen,
                                respuesta.data.codeStatus
                            )
                            .subscribe(
                                (respuestaImagen: Respuesta) => {
                                    if (
                                        respuestaImagen.code >= 200 &&
                                        respuestaImagen.code < 300
                                    ) {
                                        //Reseteamos el estado del formulario
                                        this.submitted = false;
                                        //Mostramos un toast de éxito
                                        this.toastService.toast(
                                            Gravedades.success,
                                            'Insertado con Éxito.'
                                        );
                                        //Volvemos a cargar los empleados
                                        this.empleadoService.cargarData();
                                        //Mostramos la pantalla de Index
                                        this.empleadoService.mostrarPantallaForm =
                                            false;
                                        this.empleadoService.mostrarPantalla(
                                            'Index'
                                        );
                                    } else {
                                        //Si es un error del sistema que se comunique con un administrador
                                        this.toastService.toast(
                                            Gravedades.error,
                                            'Algo salió mal. Comuníquese con un Administrador.'
                                        );
                                    }
                                },
                                (errorImagen) => {
                                    //Si es un error del sistema que se comunique con un administrador
                                    this.toastService.toast(
                                        Gravedades.error,
                                        'Algo salió mal. Comuníquese con un Administrador.'
                                    );
                                }
                            );
                    } else {
                        //Reseteamos el estado del formulario
                        this.submitted = false;
                        //Mostramos un toast de éxito
                        this.toastService.toast(
                            Gravedades.success,
                            'Insertado con Éxito.'
                        );
                        //Volvemos a cargar los empleados
                        this.empleadoService.cargarData();
                        //Mostramos la pantalla de Index
                        this.empleadoService.mostrarPantallaForm = false;
                        this.empleadoService.mostrarPantalla('Index');
                    }
                } else {
                    //Sino mostramos un toast que indique si es un correo o una identidad ya existente
                    if (respuesta.data && respuesta.data.codeStatus < 0) {
                        this.toastService.toast(
                            Gravedades.error,
                            respuesta.data.codeStatus === -2
                                ? 'Ya existe un empleado con ese correo.'
                                : 'Ya existe un empleado con esa identidad.'
                        );
                    } else {
                        //Si es un error del sistema que se comunique con un administrador
                        this.toastService.toast(
                            Gravedades.error,
                            'Algo salió mal. Comuníquese con un Administrador.'
                        );
                    }
                }
            },
            (error) => {
                //Si es un error del sistema que se comunique con un administrador
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
            }
        );
    }

    desactivarOactivarClick() {
        this.submittedEmpl_Estado = true;
        if (
            this.empleadoService.empleado.empl_Estado &&
            this.validarObservacionInactivar()
        ) {
            // console.log(this.empleadoService.empleado.empl_ObservacionActivar);
            this.desactivarOactivarEmpleado();
        }
        if (
            !this.empleadoService.empleado.empl_Estado &&
            this.validarObservacionActivar()
        ) {
            // console.log(this.empleadoService.empleado.empl_ObservacionActivar);
            this.desactivarOactivarEmpleado();
        }
    }

    //Activa o desactiva un empleado
    desactivarOactivarEmpleado() {
        this.empleadoService[
            this.empleadoService.empleado.empl_Estado ? 'Desactivar' : 'Activar'
        ]().subscribe(
            (respuesta: Respuesta) => {
                //Si no hubo problema al insertar
                if (respuesta.code >= 200 && respuesta.code < 300) {
                    this.submittedEmpl_Estado = false;
                    //Le mostramos un toast de éxito
                    this.toastService.toast(
                        Gravedades.success,
                        this.empleadoService.empleado.empl_Estado
                            ? 'Colaborador desactivado con Éxito.'
                            : 'Colaborador activado con Éxito.'
                    );
                    // console.log(this.empleadoService.empleado.empl_Estado, 'ANTES');

                    //Actualizamos el estado del empleado
                    this.empleadoService.empleado.empl_Estado =
                        !this.empleadoService.empleado.empl_Estado;
                    // console.log(this.empleadoService.empleado.empl_Estado, 'DESPUES');
                    const indexDelEmpleadoEditado =
                        this.empleadoService.empleados.findIndex(
                            (empleado) =>
                                empleado.empl_Id ===
                                this.empleadoService.empleado.empl_Id
                        );
                    this.empleadoService.empleados[indexDelEmpleadoEditado] = {
                        ...this.empleadoService.empleado,
                        empl_Prestaciones:
                            this.empleadoService.empleado.empl_Prestaciones ??
                            0,
                        empl_OtrasRemuneraciones:
                            this.empleadoService.empleado
                                .empl_OtrasRemuneraciones ?? 0,
                        empl_ObservacionActivar: this.empleadoService.empleado
                            .empl_Estado
                            ? this.empleadoService.empleado
                                  .empl_ObservacionActivar
                            : this.empleadoService.empleados[
                                  indexDelEmpleadoEditado
                              ].empl_ObservacionActivar,
                        empl_ObservacionInactivar: this.empleadoService.empleado
                            .empl_Estado
                            ? this.empleadoService.empleados[
                                  indexDelEmpleadoEditado
                              ].empl_ObservacionInactivar
                            : this.empleadoService.empleado
                                  .empl_ObservacionInactivar,
                    };
                    //Ocultamos el modal de confirmación de actualización del estado del empleado
                    this.mostrarModalActivacion = false;
                } else {
                    if (this.empleadoService.empleado.empl_Estado) {
                        if (
                            respuesta.data &&
                            respuesta.data.codeStatus === -1
                        ) {
                            //Mostramos un toast de error
                            this.toastService.toast(
                                Gravedades.error,
                                `${this.empleadoService.empleado.empl_Nombre} es responsable de una actividad en el proyecto ${respuesta.data.messageStatus}.`
                            );
                            return;
                        }
                    }
                    //Mostramos un toast de error
                    this.toastService.toast(
                        Gravedades.error,
                        'Algo salió mal. Comuníquese con un Administrador.'
                    );
                    //Ocultamos el modal de confirmación de actualización del estado del empleado
                    this.mostrarModalActivacion = false;
                }
            },
            (error) => {
                //Mostramos un toast de error
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
                //Ocultamos el modal de confirmación de actualización del estado del empleado
                this.mostrarModalActivacion = false;
            }
        );
    }

    //Establece las columnas para el datatable del historial de pago
    expandedRows: expandedRows = {};
    historialDePago: HistorialDePago[];
    columnasHistorial: { prop: string; titulo: string }[] = [];

    //Carga el historial de pago del empleado
    cargarHistorial() {
        this.columnasHistorial = [
            { prop: 'codigo', titulo: 'No.' },
            { prop: 'plan_NumNomina', titulo: 'No. Nómina' },
            { prop: 'nombreCompleto', titulo: 'Nombre' },
            { prop: 'cargo', titulo: 'Cargo' },
            { prop: 'frecuencia', titulo: 'Frecuencia' },
            { prop: 'empl_Salario', titulo: 'Salario Bruto' },
            { prop: 'totalDeducido', titulo: 'Total Deducido' },
            { prop: 'totalPrestamos', titulo: 'Total Préstamos' },
            { prop: 'plde_SueldoNeto', titulo: 'Total Liquidado' },
        ];
        this.empleadoService.getHistorial().subscribe(
            (data: HistorialDePago[]) => {
                this.historialDePago = data;
            },
            (error) => {
                // console.log(error);
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
            }
        );
    }

    private addHeader(doc: jsPDF) {
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();

        const logo = '/assets/demo/images/encabezado_footer_horizontal4k.png';
        doc.addImage(logo, 'PNG', 0, -18, 370, 50);

        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text(
            `${this.empleadoService.empleado.empl_Nombre} ${this.empleadoService.empleado.empl_Apellido}`,
            doc.internal.pageSize.width / 2,
            50,
            {
                align: 'center',
            }
        );

        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        doc.text(
            `Fecha de emisión: ${date} ${time}`,
            doc.internal.pageSize.width - 10,
            10,
            { align: 'right' }
        );

        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        doc.text(
            `Generado por: ${this.Usuario}`,
            doc.internal.pageSize.width - 10,
            20,
            { align: 'right' }
        );
    }

    private addFooter(doc: jsPDF, pageNumber: number) {
        doc.setDrawColor(255, 215, 0);
        doc.setLineWidth(1);
        doc.line(10, 287, doc.internal.pageSize.width - 10, 287);

        const footerLogo =
            '/assets/demo/images/encabezado_footer_horizontal4k.png';
        doc.addImage(footerLogo, 'PNG', 0, 197.8, 375, 50);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(
            `Página ${pageNumber}`,
            doc.internal.pageSize.width - 165,
            210,
            { align: 'right' }
        );
    }

    private addTabContentToDoc(doc: jsPDF): void {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        // Configure the table headers
        const tableHeaders = [
            'No.',
            'No. Nómina',
            'Nombre',
            'Cargo',
            'Frecuencia',
            'Salario Bruto',
            'Total Deducido',
            'Total Préstamos',
            'Total Liquidado',
        ];

        let totalLiquidado = 0;
        // Configure the table body with child rows
        const tableBody = this.historialDePago.flatMap(
            (item: HistorialDePago, index) => {
                totalLiquidado += item.plde_SueldoNeto;
                // Main row
                const mainRow = [
                    item.codigo || 0,
                    item.plan_NumNomina || 0,
                    item.nombreCompleto || '',
                    item.cargo || '',
                    item.frecuencia || '',
                    `${
                        this.globalMoneda.getState().mone_Abreviatura
                    } ${new Intl.NumberFormat('en-EN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(item.empl_Salario)}` || '0.00',
                    `${
                        this.globalMoneda.getState().mone_Abreviatura
                    } ${new Intl.NumberFormat('en-EN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(item.totalDeducido)}` || '0.00',
                    `${
                        this.globalMoneda.getState().mone_Abreviatura
                    } ${new Intl.NumberFormat('en-EN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(item.totalPrestamos)}` || '0.00',
                    `${
                        this.globalMoneda.getState().mone_Abreviatura
                    } ${new Intl.NumberFormat('en-EN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(item.plde_SueldoNeto)}` || '0.00',
                ];
                return [mainRow];
            }
        );

        // Generate the table in the document
        doc.autoTable({
            startY: 60,
            head: [tableHeaders], // Header row
            body: tableBody, // Data rows, including child rows
            theme: 'striped', // Optional: grid or plain
            styles: {
                halign: 'center',
                font: 'helvetica',
                lineWidth: 0.1,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [255, 237, 58],
                textColor: [0, 0, 0],
                fontSize: 12,
                fontStyle: 'bold',
                halign: 'center',
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                fontSize: 10,
                halign: 'center',
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240],
            },
            margin: { top: 60, bottom: 30 },
        });

        // Add totals section after the table
        const finalY = (doc as any).lastAutoTable.finalY;
        const pageWidth = doc.internal.pageSize.width;
        const marginRight = 20;

        const totalsConfig = [
            {
                label: 'Total liquidado a la fecha: ',
                value:
                    `${
                        this.globalMoneda.getState().mone_Abreviatura
                    } ${new Intl.NumberFormat('en-EN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(totalLiquidado)}` || '0.00',
            },
        ];

        doc.setFontSize(10);
        totalsConfig.forEach((total, index) => {
            doc.text(
                `${total.label}: ${total.value}`,
                pageWidth - marginRight,
                finalY + 15 + index * 10,
                { align: 'right' }
            );
        });
    }

    private openPdfInDiv(doc: jsPDF) {
        const string = doc.output('datauristring');
        const iframe = `<iframe width='100%' height='100%' src='${string}'></iframe>`;
        const pdfContainer = document.getElementById('pdfContainer');
        if (pdfContainer) {
            pdfContainer.innerHTML = iframe;
            this.isPdfVisible = true;
            //   this.cd.detectChanges();
        }
    }

    mostrarPrevisualizacion() {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [216, 356],
        });

        this.addHeader(doc);
        this.addTabContentToDoc(doc);
        this.addFooter(doc, 1);

        const pageCount = doc.internal.pages.length;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            this.addHeader(doc);
            //La número de página de la última página siempre es un número mayor porque seteamos el footer de forma manual
            if (i === pageCount) {
                this.addFooter(doc, i - 1);
            } else {
                this.addFooter(doc, i);
            }
        }
        this.openPdfInDiv(doc);
        this.isRegresarVisible = true;
    }

    seleccionarPlanilla(plan_Id: number) {
        this.plan_Id = plan_Id;
    }

    async DetallesPlanilla() {
        const id = this.plan_Id;
        this.servicePlanilla.ListadoDeduccionesPorPlaniall(id).subscribe(
            (data: Deduccion[]) => {
                // console.log(data.length);

                this.numDeducciones = data.length + 1;

                this.totalColumnas = data.length + 10;
                // this.loading = true;

                // console.log("El numero de deducciones es: ", this.numDeducciones);

                // Formatea las deducciones para mostrar el porcentaje
                this.deduccion = data.map((dedu) => ({
                    ...dedu,
                }));

                // console.log(data, 'data');
            },
            (error) => {
                // console.log(error);
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
            }
        );
        await this.servicePlanilla.ListadoDetallePlanilla(id).then(
            (data: ListadoEmpleadosPlanilla[]) => {
                //   console.log(data.length);

                // Asigna los datos de empleados a la lista
                this.listadoplanilla = data.map((listado) => ({
                    ...listado,
                    dedu_Porcentaje: listado.empl_Salario,
                }));

                //   console.log(data), 'La data de la lista de empleados es de: ';
            },

            (error) => {
                // console.log(error);
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
            }
        );

        await this.servicePlanilla
            .ListadoDeduccionesPorPlaniallaPorEmpleadp(id)
            .then(
                (data: Deducciones[]) => {
                    //   console.log(data.length);

                    // Formatea las deducciones para mostrar el porcentaje
                    this.deduccionesDetallePlanilla = data.map((dedu) => ({
                        ...dedu,
                    }));
                    this.empleadoService.mostrarPantalla('Planilla');
                    //   console.log(data, 'data');
                },
                (error) => {
                    //   console.log(error);
                    this.toastService.toast(
                        Gravedades.error,
                        'Algo salió mal. Comuníquese con un Administrador.'
                    );
                }
            );

        this.listadoplanilla = this.listadoplanilla.map((pl) => {
            // Asignar deducciones filtradas a cada elemento de listadoplanilla
            return {
                ...pl,
                deducciones: this.deduccionesDetallePlanilla.filter(
                    (depl) => depl.empl_Id == pl.empl_Id
                ),
            };
        });

        // console.log("El listado de las deducciones filtradas es de este metodo es", this.listadoplanilla)
        // console.log("Este es el nuumero total de columnas para deducciones de la planilla detalle", this.numDeducciones)
    }
}
interface expandedRows {
    [key: string]: boolean;
}
