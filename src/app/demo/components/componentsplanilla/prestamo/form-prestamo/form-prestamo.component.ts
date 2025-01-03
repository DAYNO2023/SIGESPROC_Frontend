import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Empleado } from 'src/app/demo/models/modelsgeneral/empleadoviewmodel';
import { Prestamo } from 'src/app/demo/models/modelsplanilla/prestamoviewmodel';
import { EmpleadoService } from 'src/app/demo/services/servicesgeneral/empleado.service';
import { PrestamoService } from 'src/app/demo/services/servicesplanilla/prestamo.service';
import { FieldsetModule } from 'primeng/fieldset';
import { FrecuenciaDDL } from 'src/app/demo/models/modelsplanilla/frecuenciaviewmodel';
import { FrecuenciaService } from 'src/app/demo/services/servicesplanilla/frecuencia.service';
import { Gravedades } from 'src/app/demo/models/GravedadIzitoastEnum';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastService } from 'src/app/demo/services/toast.service';
import { ExpandedRows } from 'src/app/demo/models/IExpandedRows';
import { Abono } from 'src/app/demo/models/modelsplanilla/abonoviewmodel';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CheckboxModule } from 'primeng/checkbox';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Deduccion } from 'src/app/demo/models/modelsplanilla/deduccionviewmodel';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { NotificationManagerService } from 'src/app/demo/services/notificacionservice/NotificacionGlobal.service';
import { NotificacionUpdateService } from 'src/app/demo/services/servicesproyecto/Notificacionactualizar.service';
import { Usuario } from 'src/app/demo/models/modelsacceso/usuarioviewmodel';
import { NotificacionesService } from 'src/app/demo/services/servicesproyecto/notificacion.service';
import moment from 'moment';
@Component({
    selector: 'app-form-prestamo',
    standalone: true,
    imports: [
        CheckboxModule,
        InputGroupModule,
        InputGroupAddonModule,
        CommonModule,
        InputTextModule,
        TableModule,
        InputNumberModule,
        FormsModule,
        CalendarModule,
        RadioButtonModule,
        DropdownModule,
        ToastModule,
        SplitButtonModule,
        DialogModule,
        FieldsetModule,
        ReactiveFormsModule,
        AutoCompleteModule,
    ],
    providers: [MessageService],
    templateUrl: './form-prestamo.component.html',
    styleUrl: './form-prestamo.component.scss',
})
export class FormPrestamoComponent implements OnInit {
    @Input() empl_Id: number;
    prestamo: Prestamo = new Prestamo(
        parseInt(this.cookieService.get('usua_Id')),
        new Date()
    );
    frecuencias_de_pago: FrecuenciaDDL[];
    prestamoTemp: Prestamo;
    submitted: boolean = false;
    submittedAbono: boolean = false;
    esContratista: boolean = true;
    buscando: boolean;
    pres_FechaPrimerPago: string;
    cuota: number;
    interes: number;
    tieneInteres: boolean = false;
    items: MenuItem[] = [];

    tablaVacia = [{}];
    minDate: Date;
    minDateAbono: Date;
    maxDateAbono: Date;

    abrirCollapseForm: boolean = true;
    mostrarModalEliminar: boolean = false;
    mostrarModalEditar: boolean = false;
    mostrarPantallaDetalle: boolean = false;
    habilitadoParaEditar: boolean = true;
    filtradoEmpleado: Empleado[] = [];
    filtradoFrecuencias: FrecuenciaDDL[];

    mostrarModalAbono: boolean = false;

    expandedRows: ExpandedRows = {};

    abono: Abono = new Abono(
        parseInt(this.cookieService.get('usua_Id')),
        new Date()
    );
    mostrarModalConfirmacion: boolean = false;

    isPdfVisible: boolean = false;
    isRegresarVisible: boolean = false;
    deducciones: Deduccion[];
    empl_Salario: number;
    frec_Id: number;
    empl_Estado: boolean;
    empl_NombreCompleto: string;
    empl_DNI: string;
    mostrarMsjLimite: boolean = false;
    capacidadDePagoPorCuota: number;
    sumaDeCuotasDePrestamosPendientes: number;
    usua_Id: number;
    Usuario: string;
    montoMaximoAabonar: number = 0;

    constructor(
        //Inyectamos el servicio de préstamos
        public prestamoService: PrestamoService,
        //Inyectamos el servicio de empleados
        public empleadoService: EmpleadoService,
        //Inyectamos el servicio de frecuencias
        private frecuenciaService: FrecuenciaService,
        //Inyectamos el servicio de toasts
        private toastService: ToastService,
        //LLamamos al servicio de global para traer la nomenclatura de moneda
        public globalMoneda: globalmonedaService,
        public router: Router,
        public cookieService: CookieService,
        private notificacionesService: NotificacionesService,
        private notificacionUpdateService: NotificacionUpdateService,
        private notificationManagerService: NotificationManagerService
    ) {}
    columnas: { prop: string; titulo: string }[] = [];
    columnasAbonos: { prop: string; titulo: string }[] = [];

    ngOnInit() {
        const token = this.cookieService.get('Token');
        if (token == 'false') {
            this.router.navigate(['/auth/login']);
        }
        this.minDateAbono = new Date();
        this.minDateAbono.setFullYear(1924);
        this.maxDateAbono = new Date();
        this.maxDateAbono.setFullYear(this.maxDateAbono.getFullYear() + 5);
        //Seteamos el Id del usuario loggeado
        this.usua_Id = parseInt(this.cookieService.get('usua_Id'));
        this.Usuario = this.cookieService.get('usua_Usuario');

        //Llamamos a la nomenclatura de la moneda para setearla en el HTML
        if (!this.globalMoneda.getState()) {
            this.globalMoneda.setState();
        }

        //Carga los empleados

        this.empleadoService.getData().subscribe(
            (data: Empleado[]) => {
                // console.log(data);
                // this.empleados = {...data,
                //     fechaNacimiento: data.empl_FechaNacimiento.toISOString()
                // };
                this.empleadoService.empleados = data.map((empl) => ({
                    ...empl,
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
                this.empleadoService.cargando = false;

                //Establece la variable del préstamo
                if (this.empl_Id) {
                    this.prestamoService.cargarData(this.empl_Id);
                    // console.log(this.empl_Id);
                    this.prestamo = new Prestamo(
                        this.usua_Id,
                        new Date(),
                        this.empl_Id
                    );

                    const empleado = this.empleadoService.empleados.find(
                        (empl) => empl.empl_Id === this.prestamo.empl_Id
                    );
                    this.empl_Salario = empleado.salarioPromedio;
                    this.empl_Estado = empleado.empl_Estado;
                    this.frec_Id = empleado.frec_Id;
                    this.empl_NombreCompleto =
                        empleado.empl_Nombre + ' ' + empleado.empl_Apellido;
                    this.empl_DNI = empleado.empl_DNI;
                } else {
                    if (this.prestamoService.prestamo) {
                        // console.log(
                        //     this.prestamoService.prestamo,
                        //     'this.prestamoService.prestamo'
                        // );
                        this.prestamo = this.prestamoService.prestamo;
                        this.pres_FechaPrimerPago = new Date(
                            this.prestamo.pres_FechaPrimerPago
                        ).toLocaleDateString();
                        this.cuota = this.prestamo.pres_Pagos
                            ? parseFloat(
                                  (
                                      this.prestamo.pres_Monto /
                                      this.prestamo.pres_Pagos
                                  ).toFixed(2)
                              )
                            : 0;
                        if (this.prestamo.pres_Id) {
                            const empleado =
                                this.empleadoService.empleados.find(
                                    (empl) =>
                                        empl.empl_Id === this.prestamo.empl_Id
                                );
                            this.empl_Salario = empleado.salarioPromedio;
                            this.empl_Estado = empleado.empl_Estado;
                            this.frec_Id = empleado.frec_Id;
                            this.empl_NombreCompleto =
                                empleado.empl_Nombre +
                                ' ' +
                                empleado.empl_Apellido;
                            this.empl_DNI = empleado.empl_DNI;

                            this.tieneInteres =
                                this.prestamo.pres_TasaInteres !== 0;
                            if (this.tieneInteres) {
                                this.interes =
                                    this.prestamo.pres_Monto *
                                    this.prestamo.pres_TasaInteres;
                                this.cuota =
                                    this.cuota +
                                    this.cuota * this.prestamo.pres_TasaInteres;
                                this.prestamo.pres_TasaInteres =
                                    this.prestamo.pres_TasaInteres * 100;
                            }
                            this.habilitadoParaEditar =
                                this.prestamo.pres_Abonado === 0;
                        }
                    }
                }
            },
            (error) => {
                // console.log(error);
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
                this.empleadoService.cargando = false;
            }
        );

        this.minDate = new Date();
        this.pres_FechaPrimerPago = new Date().toLocaleDateString();

        //Establece las columnas del datatable
        const columnasMap = new Map<string, string>();
        columnasMap.set('pres_Descripcion', 'Descripción');
        columnasMap.set('pres_Monto', 'Monto');
        columnasMap.set('total', 'Total a Pagar');
        columnasMap.set('pres_Abonado', 'Abonado');
        columnasMap.set('cuota', 'Cuota');
        columnasMap.set('tasaInteres', 'Tasa Interés');
        columnasMap.set('interes', 'Interés');
        columnasMap.set('frec_Descripcion', 'Frecuencia');
        columnasMap.set('pres_Pagos', 'No. Pagos');
        columnasMap.set('pagosRestantes', 'Pagos restantes');
        columnasMap.set('fechaPrimerPago', 'Fecha Primer Pago');
        columnasMap.set('fechaUltimoPago', 'Fecha Estimada Último Pago ');
        this.columnas = Array.from(columnasMap, ([key, value]) => ({
            prop: key,
            titulo: value,
        }));

        const columnasAbonosMap = new Map<string, string>();
        columnasAbonosMap.set('abpr_MontoAbonado', 'Monto');
        columnasAbonosMap.set('fecha', 'Fecha');
        this.columnasAbonos = Array.from(columnasAbonosMap, ([key, value]) => ({
            prop: key,
            titulo: value,
        }));

        //CARGA LAS FRECUENCIAS
        this.frecuenciaService.ddl().subscribe(
            (data: FrecuenciaDDL[]) => {
                this.frecuencias_de_pago = data;
            },
            (error) => {
                console.error(error);
            }
        );

        //Opciones del boton del datatable
        this.items = [
            {
                label: 'Editar',
                icon: 'pi pi-user-edit',
                command: (event) => {
                    this.abrirCollapseForm = true;
                    this.setPrestamo();
                    // console.log(primerPago.diff(hoy, 'days'));
                    this.tieneInteres = this.prestamo.pres_TasaInteres !== 0;
                    if (this.tieneInteres) {
                        this.interes =
                            this.prestamo.pres_Monto *
                            this.prestamo.pres_TasaInteres;
                        this.cuota =
                            this.cuota +
                            this.cuota * this.prestamo.pres_TasaInteres;
                        this.prestamo.pres_TasaInteres =
                            this.prestamo.pres_TasaInteres * 100;
                    }
                    this.habilitadoParaEditar =
                        this.prestamo.pres_Abonado === 0;
                    // console.log(
                    //     this.habilitadoParaEditar,
                    //     'this.habilitadoParaEditar'
                    // );
                },
            },
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: (event) => {
                    this.mostrarPantallaDetalle = true;
                },
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: (event) => {
                    this.mostrarModalEliminar = true;
                },
            },
            {
                label: 'Abonar',
                icon: 'pi pi-money-bill',
                command: (event) => {
                    if (this.prestamoTemp.estadoPrestamo === 'Cancelado') {
                        this.toastService.toast(
                            Gravedades.warning,
                            'El préstamo ya está cancelado.'
                        );
                        this.mostrarModalEliminar = false;
                    } else {
                        this.mostrarModalAbonar();
                        this.abono = new Abono(
                            this.usua_Id,
                            new Date(),
                            this.prestamoTemp.pres_Id
                        );
                    }
                },
            },
            {
                label: 'Historial',
                icon: 'pi pi-print',
                command: (event) =>
                    this.mostrarPrevisualizacion(this.prestamoTemp),
            },
        ];
        // console.clear()
    }

    //Setea el préstamo con que se van a realizar las acciones posteriores
    seleccionarAbono(abono: Abono) {
        this.abono = { ...abono };
    }

    mostrarModalAbonar(abono?: Abono) {
        this.submittedAbono = false;
        if (abono) {
            //Se vuelve a parsear a tipo Date porque cuando se selecciona el abono, lo setea como string, entonces el p-calendar no lo agarra
            abono.abpr_Fecha = new Date(abono.abpr_Fecha.toString());
            this.abono = { ...abono };
        }
        this.mostrarModalAbono = true;
    }

    botonRegresarClick() {
        this.prestamoService.mostrarPantallaForm = false;
        this.prestamoService.mostrarPantalla('Index');
    }

    //Establece la variable del prestamo de la var temporal
    setPrestamo() {
        this.prestamo = { ...this.prestamoTemp };
        const empleado = this.empleadoService.empleados.find(
            (empl) => empl.empl_Id === this.prestamo.empl_Id
        );
        this.empl_Salario = empleado.salarioPromedio;
        this.empl_Estado = empleado.empl_Estado;
        this.frec_Id = empleado.frec_Id;

        this.empl_NombreCompleto =
            empleado.empl_Nombre + ' ' + empleado.empl_Apellido;
        this.empl_DNI = empleado.empl_DNI;
        this.cuota = this.prestamo.pres_Pagos
            ? parseFloat(
                  (this.prestamo.pres_Monto / this.prestamo.pres_Pagos).toFixed(
                      2
                  )
              )
            : 0;
    }

    //Lógica cuando escribe en el autocomplete ddl
    filterEmpleado(event: any) {
        const query = event.query
            ? event.query.toLowerCase()
            : this.prestamo.empleado
            ? this.prestamo.empleado.toLowerCase()
            : '';

        this.filtradoEmpleado = this.empleadoService.empleados
            .filter(
                (empleado) =>
                    empleado.empleado.toLowerCase().includes(query) &&
                    empleado.empl_Estado === true
            )
            .sort((a, b) => a.empl_Nombre.localeCompare(b.empl_Nombre));
        if (this.filtradoEmpleado.length === 1) {
            const opcionEncontrada = this.filtradoEmpleado.find(
                (item) =>
                    item.empleado.split('-')[0].trim().toLocaleLowerCase() ===
                        query ||
                    item.empleado.split('-')[1].trim().toLocaleLowerCase() ===
                        query
            );
            if (opcionEncontrada) {
                this.prestamo.empl_Id = opcionEncontrada.empl_Id;
                this.prestamo.empleado = opcionEncontrada.empleado;
                this.empl_Salario = opcionEncontrada.salarioPromedio;
                this.empl_Estado = opcionEncontrada.empl_Estado;
                this.frec_Id = opcionEncontrada.frec_Id;
                this.empl_NombreCompleto =
                    opcionEncontrada.empl_Nombre +
                    ' ' +
                    opcionEncontrada.empl_Apellido;
                this.empl_DNI = opcionEncontrada.empl_DNI;
            }
        } else {
            this.prestamo.empl_Id = 0;
        }
    }

    //Lógica cuando selecciona una opción del autocomplete ddl
    onEmpleadoSelect(event: any) {
        const empleadoSeleccionado = event;
        this.prestamo.empl_Id = empleadoSeleccionado.value.empl_Id;
        this.prestamo.empleado = empleadoSeleccionado.value.empleado;
        const empleado = this.filtradoEmpleado.find(
            (empl) =>
                empl.empl_Id.toString() ===
                empleadoSeleccionado.value.empl_Id.toString()
        );
        this.empl_Salario = empleado.salarioPromedio;
        this.empl_Estado = empleado.empl_Estado;
        this.frec_Id = empleado.frec_Id;
        this.empl_NombreCompleto =
            empleado.empl_Nombre + ' ' + empleado.empl_Apellido;
        this.empl_DNI = empleado.empl_DNI;
    }
    filterFrecuencias(event: any) {
        // Convertir la consulta a minúsculas
        const query = event.query.toLowerCase();

        // Filtrar las frecuencias que contienen la consulta en su descripción
        this.filtradoFrecuencias = this.frecuencias_de_pago.filter((frec) =>
            frec.frecuencia.toLowerCase().includes(query)
        );

        // Si solo hay una coincidencia tras el filtrado
        if (this.filtradoFrecuencias.length === 1) {
            // Buscar una coincidencia exacta en la lista original
            const opcionEncontrada = this.frecuencias_de_pago.find(
                (item) => item.frec_Descripcion.toLowerCase() === query
            );

            // Si se encuentra una coincidencia exacta, actualizar el objeto empleado
            if (opcionEncontrada) {
                this.prestamo.frec_Id = opcionEncontrada.frec_Id;
                this.prestamo.frec_Descripcion =
                    opcionEncontrada.frec_Descripcion;
            }
        }
    }

    //Lógica cuando selecciona una opción del autocomplete ddl
    onFrecuenciaSelect(event: any) {
        const frecuenciaSeleccionada = event;
        // console.log(estadoCivilSeleccionado.value.civi_Id);
        this.prestamo.frec_Id = frecuenciaSeleccionada.value.frec_Id;
        this.prestamo.frec_Descripcion =
            frecuenciaSeleccionada.value.frec_Descripcion;
    }

    //Selecciona un prestamo en la variable temporal
    seleccionarPrestamo(prestamo: Prestamo) {
        this.prestamoTemp = { ...prestamo };
    }

    // //Solo deja ingresar números
    // soloNumerosKeypress($event: any) {
    //     const regex = /^\d*\.?\d*$/;
    //     const input = $event.target.value + $event.key;
    //     if (!regex.test(input)) {
    //         $event.preventDefault();
    //     }
    // }

    //Filtra el datatable
    filtrar(tabla: Table, event: Event) {
        tabla.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    removerEspaciosInnecesarios(texto: string) {
        return texto.trim().replace(/\s{2,}/g, ' ');
    }

    //Valida la decripción de la deducción
    validarDescripcion() {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/;
        //Valida que la descripción no sea un número
        const regexNumeros = /^\d*\.?\d*$/;
        if (regexNumeros.test(this.prestamo.pres_Descripcion)) {
            return false;
        }
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        return regex.test(this.prestamo.pres_Descripcion);
    }

    //Lógica cuando deja los campos numéricos
    soloNumerosChange($event: any, prop: string) {
        const regex = /^\d*\.?\d*$/;
        const input = $event.target.value;
        if (input === '.') {
            $event.target.value = 0;
            this.prestamo[prop] = 0;
            return;
        }
        if (!regex.test(input)) {
            $event.target.value = 0;
            this.prestamo[prop] = 0;
        } else {
            this.prestamo[prop] = input ? parseFloat(input).toFixed(2) : 0;
            if (prop === 'pres_Monto' && this.prestamo.pres_Pagos > 0) {
                this.calcularCuota();
            }
        }
    }

    // //Solo deja ingresar letras, números y espacios
    // soloNumerosEnterosKeypress($event: any) {
    //     const regex = /^\d+$/;
    //     const input = $event.target.value + $event.key;
    //     if (!regex.test(input)) {
    //         $event.preventDefault();
    //     }
    // }

    calcularCuota() {
        this.interes =
            (this.prestamo.pres_Monto * this.prestamo.pres_TasaInteres) / 100;
        if (!this.prestamo.pres_Pagos) {
            return;
        }
        if (
            parseFloat(this.prestamo.pres_Pagos.toString()) >
            parseFloat(this.prestamo.pres_Monto.toString())
        ) {
            const montoParseado = parseInt(
                parseFloat((this.prestamo.pres_Monto - 1).toString()).toFixed(0)
            );
            if (montoParseado > 0) {
                this.prestamo.pres_Pagos = montoParseado;
            } else {
                this.prestamo.pres_Pagos = 1;
            }
        }
        if (parseFloat(this.prestamo.pres_Pagos.toString()) > 0) {
            this.cuota = parseFloat(
                (
                    (parseFloat(this.prestamo.pres_Monto.toString()) +
                        parseFloat(this.interes.toString())) /
                    parseFloat(this.prestamo.pres_Pagos.toString())
                ).toFixed(2)
            );
        }
    }
    //Lógica cuando deja los campos numéricos enteros
    // soloNumerosEnterosChange($event: any, prop: string) {
    //     const regex = /^\d+$/;
    //     const input = $event.target.value;
    //     if (!regex.test(input)) {
    //         $event.target.value = '';
    //         this.prestamo[prop] = '';
    //     } else {
    //         if (prop === 'empl_DNI') {
    //             this.prestamo.empl_DNI = input;
    //             this.buscando = true;
    //             this.empleadoService.getEmpleado(input).subscribe(
    //                 (data: Empleado) => {
    //                     // console.log(data);
    //                     if (data) {
    //                         this.prestamo.empleado =
    //                             data.empl_Nombre + ' ' + data.empl_Apellido;
    //                         this.prestamo.empl_Id = data.empl_Id;
    //                         this.buscando = false;
    //                     }
    //                 },
    //                 (error) => {
    //                     // console.log(error);
    //                     this.toastService.toast(
    //                         Gravedades.error,
    //                         'Algo salió mal. Comuníquese con un Administrador.'
    //                     );
    //                     this.buscando = false;
    //                 }
    //             );
    //         } else if (prop === 'pres_Pagos') {
    //             //CALCULO DE PAGO FRECUENCIAL
    //             if (
    //                 parseFloat(this.prestamo[prop].toString()) >
    //                 parseFloat(this.prestamo.pres_Monto.toString())
    //             ) {
    //                 $event.target.value = 0;
    //                 this.prestamo[prop] = 0;
    //             } else {
    //                 this.prestamo[prop] = input;
    //                 this.cuota = parseFloat(
    //                     (
    //                         this.prestamo.pres_Monto / this.prestamo.pres_Pagos
    //                     ).toFixed(2)
    //                 );
    //             }
    //         } else {
    //             this.prestamo[prop] = input;
    //         }
    //     }
    // }

    // //Solo deja ingresar letras, números y espacios Y guiones
    // dniKeypress($event: any) {
    //     const regex = /^[a-zA-Z0-9\s-]+$/;
    //     const input = $event.target.value + $event.key;
    //     if (!regex.test(input)) {
    //         $event.preventDefault();
    //     }
    // }

    handleInput(event: Event, prop?: string) {
        const inputElement = event.target as HTMLInputElement;
        const texto = inputElement.value;

        // Solo permitir letras y un espacio después de cada letra
        if (!prop) {
            inputElement.value = texto
                .replace(
                    /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g,
                    ''
                )
                .replace(/\s{2,}/g, ' ')
                .replace(/^\s/, '');
            this.prestamo.pres_Descripcion = inputElement.value;
        }
        if (prop === 'empl_DNI') {
            // Solo permitir letras y un espacio después de cada letra
            inputElement.value = texto
                .replace(
                    /[^a-zñA-Z0-9ÑáéíóúÁÉÍÓÚ\s\-]|(?<=\s)[^a-zñA-Z0-9ÑáéíóúÁÉÍÓÚ\s\-]/g,
                    ''
                )
                .replace(/\s{2,}/g, ' ')
                .replace(/^\s/, '');
            if (!texto) this.prestamo.empl_Id = 0;
        }
        if (prop === 'monto') {
            // Solo permitir letras y un espacio después de cada letra
            inputElement.value = texto
                .replace(/[^0-9]|(?<=\s)[^0-9]/g, '')
                .replace(/\s{2,}/g, ' ')
                .replace(/^\s/, '');
        }
    }

    //No deja pegar caracteres diferentes a los válidos según una regex
    validarPegar(event: ClipboardEvent, prop?: string) {
        const clipboardData = event.clipboardData?.getData('text') || '';
        let allowedTextPattern = /^[a-zñA-Z0-9ÑáéíóúÁÉÍÓÚ\s]*$/;
        if (prop === 'pres_Pagos') {
            allowedTextPattern = /^[0-9]*$/;
        }
        if (prop === 'monto') {
            allowedTextPattern = /^[0-9.,]*$/;
        }
        if (prop === 'empl_DNI') {
            allowedTextPattern = /^[a-zñA-Z0-9ÑáéíóúÁÉÍÓÚ\s\-]*$/;
        }

        const filteredText = clipboardData
            .split('')
            .filter((char) => allowedTextPattern.test(char))
            .join('');

        const cleanedText = filteredText.trimStart();

        if (clipboardData !== cleanedText) {
            event.preventDefault();
            document.execCommand('insertText', false, cleanedText);
        }
    }

    // //Solo deja ingresar letras, números y espacios
    // soloLetrasYnumerosEspaciosKeypress($event: any) {
    //     const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/;
    //     const input = $event.target.value + $event.key;
    //     if (!regex.test(input)) {
    //         $event.preventDefault();
    //     }
    // }

    // Cargar deducciones por empleado con Promesa
    cargardeduccionesDelEmpleado(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.empleadoService
                .getdeduccionesDelEmpleado(this.prestamo.empl_Id)
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
                        this.deducciones = [
                            ...data.map((dedu) => {
                                return {
                                    dedu_Id: dedu.dedu_Id,
                                    dedu_Descripcion: dedu.dedu_Descripcion,
                                    dedu_Porcentaje: dedu.dedu_Porcentaje,
                                    dedu_EsMontoFijo: dedu.dedu_EsMontoFijo,
                                    usua_Creacion: 3,
                                    dedu_FechaCreacion:
                                        new Date().toISOString(),
                                    usua_Modificacion: this.usua_Id,
                                    dedu_FechaModificacion:
                                        new Date().toISOString(),
                                    dedu_Estado: true,
                                    numDeducciones: 0,
                                    codigo: null,
                                    usuaCreacion: null,
                                    fechaCreacion: null,
                                    usuaModificacion: null,
                                    fechaModificacion: null,
                                    _checked: null,
                                };
                            }),
                        ];

                        resolve();
                    },
                    (error) => {
                        this.toastService.toast(
                            Gravedades.error,
                            'Algo salió mal. Comuníquese con un Administrador.'
                        );
                        reject(error); // Rechazando en caso de error
                    }
                );
        });
    }

    // Obtener suma de deducciones
    obtenerSumaDeDeducciones(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.cargardeduccionesDelEmpleado()
                .then(() => {
                    resolve(this.calcularSumaDeDeducciones());
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    // Calcular la suma de las deducciones
    calcularSumaDeDeducciones(): number {
        // console.log(this.empl_Id, 'this.empl_Id');
        // console.log(this.empl_Salario, 'this.empl_Salario');

        return this.deducciones.reduce(
            (total: number, deduccion: Deduccion) => {
                let porcentaje = deduccion.dedu_Porcentaje;

                if (!deduccion.dedu_EsMontoFijo) {
                    return (
                        total +
                        porcentaje *
                            ((!this.empl_Id
                                ? this.empl_Salario
                                : this.empleadoService.empleado
                                      .salarioPromedio) /
                                100)
                    );
                } else {
                    return total + porcentaje;
                }
            },
            0
        );
    }

    calcularSumaDeCuotasDePrestamosPendientes(): number {
        const sumaCuotas = this.prestamoService.prestamos
            .filter(
                (pres) =>
                    pres.empl_Id === this.prestamo.empl_Id &&
                    pres.pres_Id !== this.prestamo.pres_Id
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

    obtenerCapacidadDePagoPorCuota(): Promise<number> {
        return this.obtenerSumaDeDeducciones()
            .then((sumaDeducciones) => {
                const capacidadDePago =
                    (!this.empl_Id
                        ? this.empl_Salario
                        : this.empleadoService.empleado.salarioPromedio) -
                    sumaDeducciones -
                    this.calcularSumaDeCuotasDePrestamosPendientes();

                // Retorna la capacidad de pago
                return capacidadDePago > 0 ? capacidadDePago : 0;
            })
            .catch((error) => {
                // console.log('obtenerCapacidadDePagoPorCuota', error);

                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
                return 0; // En caso de error, retornar 0 o un valor predeterminado
            });
    }

    //Lógica para guardar un préstamo
    async guardar() {
        this.submitted = true;
        //VALIDACIONES

        let todosLosCamposLlenos = true;
        this.prestamo.frec_Id = this.frec_Id;
        if (this.prestamo.pres_Id) {
            this.prestamo.usua_Modificacion = this.usua_Id;
            this.prestamo.pres_FechaModificacion = new Date();
            for (const prop in this.prestamo) {
                if (prop === 'pres_TasaInteres' && !this.tieneInteres) {
                    continue;
                }
                if (
                    prop === 'codigo' ||
                    prop === 'empl' ||
                    prop === 'frec' ||
                    prop === 'pres_Abonado' ||
                    prop === 'cuota' ||
                    prop === 'total' ||
                    prop === 'interes' ||
                    prop === 'pagosRestantes' ||
                    prop === 'pres_PagosRestantes' ||
                    prop === 'fechaUltimoPago' ||
                    prop === 'tasaInteres' ||
                    prop === 'estadoPrestamo' ||
                    prop === 'usuaCreacion' ||
                    prop === 'ciud_Descripcion' ||
                    prop === 'esta_Nombre' ||
                    prop === 'pres_PagosRestantes' ||
                    prop === 'pais_Nombre' ||
                    prop === 'fechaModificacion' ||
                    prop === 'pres_UltimaFechaPago' ||
                    prop === 'usua_CreacionNavigation' ||
                    prop === 'usua_ModificacionNavigation' ||
                    prop === 'usuaModificacion'
                ) {
                    continue;
                }
                if (!this.prestamo[prop]) {
                    todosLosCamposLlenos = false;
                    // console.log(prop);
                    break;
                }
            }
        } else {
            for (const prop in this.prestamo) {
                if (prop === 'pres_TasaInteres' && !this.tieneInteres) {
                    continue;
                }
                if (
                    prop === 'pres_Id' ||
                    prop === 'usua_Modificacion' ||
                    prop === 'pres_FechaModificacion' ||
                    prop === 'fechaModificacion' ||
                    prop === 'pres_Abonado' ||
                    prop === 'cuota' ||
                    prop === 'total' ||
                    prop === 'pagosRestantes' ||
                    prop === 'empl' ||
                    prop === 'pres_PagosRestantes' ||
                    prop === 'fechaUltimoPago' ||
                    prop === 'tasaInteres' ||
                    prop === 'estadoPrestamo' ||
                    prop === 'usuaCreacion' ||
                    prop === 'usua_CreacionNavigation' ||
                    prop === 'usua_ModificacionNavigation' ||
                    prop === 'pres_EstadoPago'
                ) {
                    continue;
                }
                if (!this.prestamo[prop]) {
                    todosLosCamposLlenos = false;
                    // console.log(prop);
                    break;
                }
            }
        }

        // console.log(this.prestamo);
        // console.log(todosLosCamposLlenos);

        if (
            todosLosCamposLlenos &&
            this.validarDescripcion() &&
            this.validarMonto() &&
            this.validarNumPagos()
        ) {
            this.prestamo.pres_Descripcion = this.removerEspaciosInnecesarios(
                this.prestamo.pres_Descripcion
            );
            if (!this.prestamo.pres_Id && !this.empl_Estado) {
                this.toastService.toast(
                    Gravedades.warning,
                    'No se le pueden agregar préstamos a un colaborador inactivo.'
                );
                return;
            }
            const capacidadDePagoPorCuota =
                await this.obtenerCapacidadDePagoPorCuota();
            this.capacidadDePagoPorCuota = capacidadDePagoPorCuota;

            // Obtenemos el numero de dias de la frecuencia
            let frec_NumeroDias = this.frecuencias_de_pago.find(
                (frec) => frec.frec_Id === this.prestamo.frec_Id
            ).frec_NumeroDias;

            // Multiplicamos el número días de la frecuencia por el numero de días restantes
            let diasAsumar = frec_NumeroDias * this.prestamo.pres_Pagos;

            // Obtenemos la ultima fecha de pago con los días a sumar a la fecha del primer pago
            let fechaUltimoPago = new Date(this.prestamo.pres_FechaPrimerPago);
            fechaUltimoPago.setDate(fechaUltimoPago.getDate() + diasAsumar); // Sumamos los días
            // console.log(fechaUltimoPago, 'fechaUltimoPago');

            //Mostramos un toast que diga que la fecha es inválida.
            if (fechaUltimoPago.toString() === 'Invalid Date') {
                this.toastService.toast(
                    Gravedades.warning,
                    `La fecha del último pago estimada supera los 5 años`
                );
                return;
            }

            const diffEnAnhios = moment(
                this.prestamo.pres_FechaPrimerPago
            ).diff(moment(fechaUltimoPago), 'years');
            // console.log(diffEnAnhios, 'diffEnAnhios');

            if (Math.abs(diffEnAnhios) >= 6) {
                this.toastService.toast(
                    Gravedades.warning,
                    `La fecha del último pago estimada supera los 5 años`
                );
                return;
            }

            // console.log(capacidadDePagoPorCuota, 'capacidadDePagoPorCuota');
            // console.log(typeof this.cuota, 'typeof cuota');
            // console.log(capacidadDePagoPorCuota, 'capacidadDePagoPorCuota');
            // console.log(this.cuota, 'cuota');

            if (capacidadDePagoPorCuota < this.cuota) {
                this.mostrarMsjLimite = true;
                return;
            }
            if (this.prestamo.pres_Id) {
                this.mostrarModalEditar = true;
            } else {
                this.insertarEditar();
            }
        }
    }

    //Inserta o edita un prestamo
    insertarEditar() {
        this.mostrarModalEditar = false;
        this.prestamoService[this.prestamo.pres_Id ? 'Editar' : 'Insertar'](
            this.tieneInteres
                ? this.prestamo
                : { ...this.prestamo, pres_TasaInteres: 0 }
        ).subscribe(
            (exito: boolean) => {
                if (exito) {
                    this.submitted = false;
                    this.habilitadoParaEditar = true;
                    this.toastService.toast(
                        Gravedades.success,
                        this.prestamo.pres_Id
                            ? 'Actualizado con Éxito.'
                            : 'Insertado con Éxito.'
                    );
                    if (!this.prestamo.pres_Id) {
                        this.GuardarEnviarAlertas(
                            `Se ha extendido un préstamo al colaborador ${this.empl_NombreCompleto} con DNI ${this.empl_DNI}.`
                        );
                    }
                    this.prestamoService.cargarData(this.empl_Id);
                    if (!this.empl_Id) {
                        this.prestamoService.mostrarPantallaForm = false;
                        this.prestamoService.mostrarPantalla('Index');
                    }
                    this.limpiar();
                } else {
                    this.toastService.toast(
                        Gravedades.error,
                        'Algo salió mal. Comuníquese con un Administrador.'
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

    guardarAbono() {
        this.submittedAbono = true;
        //VALIDACIONES
        let todosLosCamposLlenos = true;
        if (this.abono.abpr_Id) {
            this.abono.usua_Modificacion = this.usua_Id;
            this.abono.abpr_FechaModificacion = new Date();
            for (const prop in this.abono) {
                if (
                    prop === 'codigo' ||
                    prop === 'pres' ||
                    prop === 'usua_CreacionNavigation' ||
                    prop === 'usua_ModificacionNavigation' ||
                    prop === 'fechaModificacion' ||
                    prop === 'abpr_DeducidoEnPlanilla' ||
                    prop === 'usua_Modificacion' ||
                    prop === 'usuaModificacion'
                ) {
                    continue;
                }
                if (!this.abono[prop]) {
                    todosLosCamposLlenos = false;
                    // console.log(prop);
                    break;
                }
            }
        } else {
            for (const prop in this.abono) {
                if (
                    prop === 'abpr_Id' ||
                    prop === 'codigo' ||
                    prop === 'abpr_DeducidoEnPlanilla' ||
                    prop === 'fechaModificacion' ||
                    prop === 'usua_Modificacion' ||
                    prop === 'usuaModificacion'
                ) {
                    continue;
                }
                if (!this.abono[prop]) {
                    todosLosCamposLlenos = false;
                    // console.log(prop);
                    break;
                }
            }
        }

        // console.log(this.prestamo);
        // console.log(todosLosCamposLlenos);

        if (todosLosCamposLlenos && this.validarMontoAbonado()) {
            this.mostrarModalAbono = false;
            this.mostrarModalConfirmacion = true;
        }
    }
    //Validación del monto
    validarNumPagos() {
        const regex = /^\d*\.?\d*$/;
        //Si no ha ingresado nada
        if (!this.prestamo.pres_Pagos) {
            return false;
        }
        //Si solo es un punto es inválido
        if (this.prestamo.pres_Pagos.toString() === '.') {
            return false;
        }
        //Si no es un número es inválido
        if (!regex.test(this.prestamo.pres_Pagos.toString())) {
            return false;
        }
        this.calcularCuota();
        return true;
    }
    //Validación del monto
    validarMonto() {
        const regex = /^\d*\.?\d*$/;
        //Si no ha ingresado nada
        if (!this.prestamo.pres_Monto) {
            return false;
        }
        //Si solo es un punto es inválido
        if (this.prestamo.pres_Monto.toString() === '.') {
            return false;
        }
        //Si no es un número es inválido
        if (!regex.test(this.prestamo.pres_Monto.toString())) {
            return false;
        }
        this.calcularCuota();
        return true;
    }

    //Validación del monto
    validarMontoAbonado() {
        const regex = /^\d*\.?\d*$/;
        //Si no ha ingresado nada
        if (!this.abono.abpr_MontoAbonado) {
            this.montoMaximoAabonar = 0;
            return false;
        }
        //Si solo es un punto es inválido
        if (this.abono.abpr_MontoAbonado.toString() === '.') {
            this.montoMaximoAabonar = 0;
            return false;
        }
        //Si no es un número es inválido
        if (!regex.test(this.abono.abpr_MontoAbonado.toString())) {
            this.montoMaximoAabonar = 0;
            return false;
        } else {
            //Si el monto a abonar es mayor al saldo pendiente es inválido
            if (this.abono.abpr_Id) {
                const montoAbonado =
                    this.prestamoService.prestamos
                        .find((p) => p.pres_Id === this.abono.pres_Id)
                        .abonos.find((a) => a.abpr_Id === this.abono.abpr_Id)
                        .abpr_MontoAbonado ?? 0;
                if (
                    parseFloat(this.abono.abpr_MontoAbonado.toString()) >
                    this.prestamoTemp.total -
                        this.prestamoTemp.pres_Abonado +
                        montoAbonado
                ) {
                    this.montoMaximoAabonar =
                        this.prestamoTemp.total -
                        this.prestamoTemp.pres_Abonado +
                        montoAbonado;
                    return false;
                }
            } else {
                if (
                    parseFloat(this.abono.abpr_MontoAbonado.toString()) >
                    this.prestamoTemp.total - this.prestamoTemp.pres_Abonado
                ) {
                    this.montoMaximoAabonar =
                        this.prestamoTemp.total -
                        this.prestamoTemp.pres_Abonado;
                    return false;
                }
            }
        }
        return true;
    }

    insertarEditarAbono() {
        this.mostrarModalAbono = false;
        this.mostrarModalConfirmacion = false;
        this.prestamoService[
            this.abono.abpr_Id ? 'EditarAbono' : 'InsertarAbono'
        ](this.abono).subscribe(
            (exito: boolean) => {
                /*Si la petición salió bien reinicia el formulario, 
                    se muestra un toast y se vuelven a cargar los préstamos*/
                if (exito) {
                    this.submittedAbono = false;
                    this.toastService.toast(
                        Gravedades.success,
                        this.abono.abpr_Id
                            ? 'Actualizado con Éxito.'
                            : 'Insertado con Éxito.'
                    );
                    //Como se recargan los prestamos, se vuelve a seteat el prestamo previamente seleccionado, sino al editar de nuevo truena
                    const prestamoTemp = this.prestamoTemp;
                    this.prestamoService.cargarData(this.empl_Id);
                    this.prestamoTemp = prestamoTemp;
                } else {
                    this.toastService.toast(
                        Gravedades.error,
                        'Algo salió mal. Comuníquese con un Administrador.'
                    );
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

    //Limpia los campos del formulario
    limpiar() {
        this.habilitadoParaEditar = true;
        this.submitted = false;
        const empl_Id = this.empl_Id ?? 0;
        this.prestamoService.prestamo = new Prestamo(this.usua_Id, new Date());
        this.prestamoService.prestamo.empl_Id = empl_Id;
        this.prestamo = { ...this.prestamoService.prestamo };
        this.prestamoTemp = { ...this.prestamoService.prestamo };
        // console.log(this.prestamo);
        this.cuota = 0;
        this.interes = 0;
        this.mostrarMsjLimite = false;
    }

    //Elimina un préstamo
    eliminar() {
        if (this.prestamoTemp.pres_Abonado === this.prestamoTemp.pres_Monto) {
            this.toastService.toast(
                Gravedades.warning,
                'El préstamo ya está cancelado.'
            );
            return;
        }
        if (this.prestamoTemp.pres_Abonado > 0) {
            this.toastService.toast(
                Gravedades.warning,
                'El préstamo ya cuenta con Abonos.'
            );
            this.mostrarModalEliminar = false;
            return;
        }
        this.prestamoService.Eliminar(this.prestamoTemp.pres_Id).subscribe(
            (exito: boolean) => {
                if (exito) {
                    this.prestamoService.cargarData(this.empl_Id);
                    if (this.prestamoTemp.pres_Id === this.prestamo.pres_Id) {
                        this.limpiar();
                    }
                    this.toastService.toast(
                        Gravedades.success,
                        'Eliminado con Éxito.'
                    );
                    this.mostrarModalEliminar = false;
                } else {
                    this.toastService.toast(
                        Gravedades.error,
                        'El préstamo ya está cancelado.'
                    );
                    this.mostrarModalEliminar = false;
                }
            },
            (error) => {
                // console.log(error);
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
                this.mostrarModalEliminar = false;
            }
        );
    }

    private addHeader(doc: jsPDF, prestamo?: Prestamo) {
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();

        const logo = '/assets/demo/images/encabezado_footer_horizontal4k.png';
        doc.addImage(logo, 'PNG', 0, -18, 370, 50);

        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text(
            prestamo
                ? `Historial del préstamo de ${this.empleadoService.empleado.empl_Nombre} ${this.empleadoService.empleado.empl_Apellido}`
                : `Historial de préstamos de ${this.empleadoService.empleado.empl_Nombre} ${this.empleadoService.empleado.empl_Apellido}`,
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

    private addTabContentToDoc(doc: jsPDF, prestamo?: Prestamo): void {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        // Configure the table headers
        const tableHeaders = [
            'No.',
            'Estado Préstamo',
            'Descripción',
            'Monto',
            'Interés a Pagar',
            'Tasa Interés',
            'Total a Pagar',
            'Abonado',
        ];

        // Configura las columnas del subheader
        const childSubHeader = [
            '',
            'No.',
            { content: 'Monto', colSpan: 2 },
            { content: 'Método de Pago', colSpan: 2 },
            { content: 'Fecha', colSpan: 2 },
        ];
        let tableBody;
        //Si se pasa un préstamo por parámetro se imprime el historial sólo de ese préstamo, sino el de todos
        if (prestamo) {
            //Cuerpo de la tabla
            // console.log(prestamo, 'prestamo');

            tableBody = [
                [
                    prestamo.codigo,
                    prestamo.estadoPrestamo || '',
                    prestamo.pres_Descripcion || '',
                    `${
                        this.globalMoneda.getState().mone_Abreviatura
                    } ${new Intl.NumberFormat('en-EN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(prestamo.pres_Monto)}` || '0.00',
                    `${
                        this.globalMoneda.getState().mone_Abreviatura
                    } ${new Intl.NumberFormat('en-EN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(prestamo.interes)}` || '0.00',
                    prestamo.tasaInteres || '',
                    `${
                        this.globalMoneda.getState().mone_Abreviatura
                    } ${new Intl.NumberFormat('en-EN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(prestamo.total)}` || '0.00',
                    `${
                        this.globalMoneda.getState().mone_Abreviatura
                    } ${new Intl.NumberFormat('en-EN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(prestamo.pres_Abonado)}` || '0.00',
                ],
            ];
            if (prestamo.abonos && prestamo.abonos.length > 0) {
                // Encabezado de los abonos
                const subHeaderRow = childSubHeader;

                // Filas de los abonos
                const childRows = prestamo.abonos.map((abpr: Abono) => [
                    '',
                    abpr.codigo,
                    {
                        content:
                            `${
                                this.globalMoneda.getState().mone_Abreviatura
                            } ${new Intl.NumberFormat('en-EN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }).format(abpr.abpr_MontoAbonado)}` || '',
                        colSpan: 2,
                    },
                    {
                        content: abpr.abpr_DeducidoEnPlanilla
                            ? 'Planilla'
                            : 'Abono' || '',
                        colSpan: 2,
                    },
                    { content: abpr.fecha || '', colSpan: 2 },
                ]);

                // Se combinan las filas de los prestamos con las filas de los abonos
                tableBody = [tableBody[0], subHeaderRow, ...childRows];
            }
        } else {
            tableBody = this.prestamoService.prestamos.flatMap(
                (pres: Prestamo, index) => {
                    const mainRow = [
                        pres.codigo,
                        pres.estadoPrestamo || '',
                        pres.pres_Descripcion || '',
                        `${
                            this.globalMoneda.getState().mone_Abreviatura
                        } ${new Intl.NumberFormat('en-EN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(pres.pres_Monto)}` || '0.00',
                        `${
                            this.globalMoneda.getState().mone_Abreviatura
                        } ${new Intl.NumberFormat('en-EN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(pres.interes)}` || '0.00',
                        pres.tasaInteres || '',
                        `${
                            this.globalMoneda.getState().mone_Abreviatura
                        } ${new Intl.NumberFormat('en-EN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(pres.total)}` || '0.00',
                        `${
                            this.globalMoneda.getState().mone_Abreviatura
                        } ${new Intl.NumberFormat('en-EN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(pres.pres_Abonado)}` || '0.00',
                    ];

                    if (pres.abonos && pres.abonos.length > 0) {
                        const subHeaderRow = childSubHeader;

                        // Filas de los abonos
                        const childRows = pres.abonos.map((abpr: Abono) => [
                            '',
                            abpr.codigo,
                            {
                                content:
                                    `${
                                        this.globalMoneda.getState()
                                            .mone_Abreviatura
                                    } ${new Intl.NumberFormat('en-EN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format(abpr.abpr_MontoAbonado)}` || '',
                                colSpan: 2,
                            },
                            {
                                content: abpr.abpr_DeducidoEnPlanilla
                                    ? 'Planilla'
                                    : 'Abono' || '',
                                colSpan: 2,
                            },
                            { content: abpr.fecha || '', colSpan: 2 },
                        ]);

                        return [mainRow, subHeaderRow, ...childRows];
                    } else {
                        // Si no hay abonos solo se retornan los prestamos
                        return [mainRow];
                    }
                }
            );
        }

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

        doc.setFontSize(10);
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

    mostrarPrevisualizacion(prestamo?: Prestamo) {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [216, 356],
        });

        this.addHeader(doc, prestamo);
        this.addTabContentToDoc(doc, prestamo);
        this.addFooter(doc, 1);

        const pageCount = doc.internal.pages.length;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            this.addHeader(doc, prestamo);
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

    cancelarImpresion() {
        document.getElementById('pdfContainer').innerHTML = '';
        this.isRegresarVisible = false;
        this.isPdfVisible = false;
    }
    public GuardarEnviarAlertas(descripcion: string): void {
        this.notificacionesService.ListarUsuarios().subscribe(
            (data: Usuario[]) => {
                // Filtra los usuarios que tienen un ID válido (no null ni undefined)
                const usuariosSeleccionados = data.filter(
                    (item) => item.usua_EsAdministrador === true
                );
                // Verifica si hay usuarios cargados
                if (usuariosSeleccionados.length === 0) {
                    this.toastService.toast(
                        Gravedades.warning,
                        'No hay usuarios disponibles.'
                    );
                    return;
                }
                // Construye la ruta de notificación
                const notiRuta = '/planilla/prestamo';

                // Crea un array de detalles de notificación para cada usuario
                const detalles = usuariosSeleccionados.map((usuario) => ({
                    aler_Descripcion: descripcion, // Descripción de la notificación
                    aler_Ruta: notiRuta, // Ruta de la notificación
                    aler_Fecha: new Date().toISOString(), // Fecha actual en formato ISO
                    usua_Id: usuario.usua_Id, // ID del usuario destinatario
                    usua_Creacion: this.usua_Id, // ID del usuario que crea la notificación
                    napu_Ruta: notiRuta, // Ruta de pantalla opcional
                }));

                // Llama al servicio para insertar y enviar las notificaciones, pasando los detalles creados
                this.notificationManagerService
                    .insertarYEnviarNotificaciones(detalles, notiRuta)
                    .subscribe(
                        // Maneja la respuesta exitosa de la inserción y envío de notificaciones
                        (resultados) => {
                            // Filtra los resultados para obtener los que fueron exitosos y los que fallaron
                            const exitosos = resultados.filter(
                                (res: any) => res.success
                            );
                            const fallidos = resultados.filter(
                                (res: any) => !res.success
                            );

                            // Si hay inserciones exitosas, muestra un mensaje de éxito
                            if (exitosos.length > 0) {
                                this.toastService.toast(
                                    Gravedades.success,
                                    'Insertado con éxito.'
                                );
                            }

                            // Llama al servicio para actualizar las notificaciones
                            this.notificacionUpdateService.notificacionesActualizadasEmit();
                        },
                        // Maneja cualquier error ocurrido durante la inserción o envío de notificaciones
                        (error) => {
                            this.toastService.toast(
                                Gravedades.error,
                                'Error al procesar la solicitud.'
                            );
                            // console.error('Error en GuardarEnviarAlertas:', error);
                        }
                    );
            },
            (error) => {
                this.toastService.toast(
                    Gravedades.error,
                    'Error al cargar los usuarios.'
                );
                //   console.error('Error al cargar usuarios', error);
            }
        );
    }
}