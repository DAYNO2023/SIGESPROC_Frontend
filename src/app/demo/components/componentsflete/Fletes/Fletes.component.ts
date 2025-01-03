import { Directive, ElementRef, HostListener, Input, Component, OnInit, NgModule, Inject, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { NotificationManagerService } from 'src/app/demo/services/notificacionservice/NotificacionGlobal.service';
import { NotificacionUpdateService } from 'src/app/demo/services/servicesproyecto/Notificacionactualizar.service';
import { NotificacionesService } from 'src/app/demo/services/servicesproyecto/notificacion.service';
import { HttpErrorResponse } from '@angular/common/http';
import { filter, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { Proyecto } from 'src/app/demo/models/modelsflete/fleteviewmodel';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActividadPorEtapa } from 'src/app/demo/models/modelsflete/fleteviewmodel';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Usuario } from '../../../models/modelsacceso/usuarioviewmodel';
import { UsuarioService } from 'src/app/demo/services/servicesacceso/usuario.service';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { fechaIncidenciaValida } from './fechavalidacion';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { FleteService } from 'src/app/demo/services/servicesflete/flete.service';
import { Flete, Bodega } from 'src/app/demo/models/modelsflete/fleteviewmodel';
import { MenuItem } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { autocompleteEmpleado } from 'src/app/demo/models/modelsacceso/usuarioviewmodel';
import { FleteDetalleService } from 'src/app/demo/services/servicesflete/fletedetalle.service';
import { InsumoPorProveedor, InsumoPorProveedorExtendido, EquipoPorProveedor, EquipoPorProveedorExtendido } from 'src/app/demo/models/modelsinsumo/insumoporproveedorviewmodel';
import { FleteDetalle, FleteDetalleExtendido } from 'src/app/demo/models/modelsflete/fletedetalleviewmodel';
import { FleteControlCalidadService } from 'src/app/demo/services/servicesflete/fleteControlYCalidad.service';
import { FormArray } from '@angular/forms';
import { FleteControlCalidad } from 'src/app/demo/models/modelsflete/fletecontrolycalidadviewmodel';
import { ImageService } from 'src/app/demo/services/image.service';
import { ddlCategorias } from 'src/app/demo/models/modelsinsumo/insumosviewmodel';
import { BodegaService } from 'src/app/demo/services/servicesinsumo/bodega.service';
import { CookieService } from 'ngx-cookie-service';
import { NavigationStateService } from 'src/app/demo/services/navigationstate.service';
import { InsumoPorActividadService } from 'src/app/demo/services/servicesproyecto/insumoporactividad.service';
import { InsumoPorActividad } from 'src/app/demo/models/modelsproyecto/insumoporactividadviewmodel';


@Component({
    selector: 'app-flete',
    templateUrl: './Fletes.component.html',
    styleUrls: ['./flete.component.scss'],
    providers: [MessageService]
})


export class FleteComponent implements OnInit {
    selectedEtapaId: number | null = null;
    minDate: Date;
    //variables para la funcionalidad de ddl de proyecto de salida
    valSwitchSalida: boolean = false;
    proyectosSalida: Proyecto[] = [];
    filtradoProyectosSalida: Proyecto[] = [];
    filtradoEtapasSalida: any[] = [];
    filtradoEtapasSalidaOriginal: any[] = [];
    etapasMessage: string = "";
    actividadesSalida: ActividadPorEtapa[] = [];
    filtradoActividadesOriginal: any[] = [];
    filtradoActividadesSalida: any[] = [];
    filtradoActividadesSalidaOriginal: any[] = [];
    bodegasSalida: Bodega[] = [];
    filtradoBodegasSalida: Bodega[] = [];
    filtradoEtapasOriginal: any[] = [];


    //validacion errores autocompletados
    Error_Encargado: string = "El campo es Requerido.";
    Error_SupervisorSalida: string = "El campo es Requerido.";
    Error_SupervisorLLegada: string = "El campo es Requerido.";
    Error_BodegaSalida: string = '';
    Error_BodegaLlegada: string = '';

    Error_Proyecto: string = "El campo es requerido.";
    Error_Etapa: string = "El campo es requerido.";
    Error_Actividad: string = "El campo es requerido.";
    Error_ProyectoSalida: string = "El campo es requerido.";
    Error_EtapaSalida: string = "El campo es requerido.";
    Error_ActividadSalida: string = "El campo es requerido.";

    //variables ddl actividades por etapa
    actividades: ActividadPorEtapa[] = [];
    filtradoEtapas: any[] = [];
    filtradoActividades: ActividadPorEtapa[] = [];

    //variable spara titulos de incidencias
    tituloGeneral: string = '';
    tituloDinamico: string = '';
    //collapse de verificacion
    Verificacion = false;
    Index = true;
    flete: Flete;
    verificarForm: FormGroup;
    pendientes: FleteDetalle[] = [];
    loading: boolean = true;

    // arrays separadores para mi vista de verificacion
    pendientesInsumos: FleteDetalle[] = [];
    verificadosInsumos: FleteDetalle[] = [];
    pendientesEquipos: FleteDetalle[] = [];
    verificadosEquipos: FleteDetalle[] = [];

    //propiedades spinner
    isTableLoading: boolean = false;
    loadedTableMessage: string = "";

    //variable para almacenar los detalles actuales que tiene un flete para luego usarlo en edicion y se guarden
    selectedDetalles: FleteDetalle[] = [];

    //MODAL EDITAR
    showEditConfirmDialog: boolean = false;

    //MODAR VERIFICAR
    showVerificarConfirmDialog: boolean = false;

    //dibujado segun el usuario
    usuario: Usuario;
    usuarioId = parseInt(this.cookieService.get('usua_Id'));
    puedeCrearFlete: boolean = false;

    //MANEJO DE TABS VERIFICACION
    IndexactivoVerificacion: number = 0;
    isFirstTab: boolean = true;
    isSecondTab: boolean = false;

    //SWITCH PARA VERIFICACION INSUMO/EQUIPOS DE SEGURIDAD
    verificacionSwitch: boolean = false;
    noVerificadosInsumos: FleteDetalle[] = [];
    noVerificadosEquipos: FleteDetalle[] = [];


    submitted: boolean = false;
    // eliminados generales y detalle
    DeleteFlete: boolean = false;
    selectedInsumo: any;
    idInsumo: number = 0;
    DeleteDetalle: boolean = false;
    proyectos: Proyecto[] = [];
    filtradoProyectos: Proyecto[] = [];
    itemsGroup1: InsumoPorProveedor[] = [];
    itemsGroup2: InsumoPorProveedor[] = [];

    //para el uso del drag an drop drag de equipos
    itemsGroupEquipos1: EquipoPorProveedor[] = [];
    itemsGroupEquipos2: EquipoPorProveedor[] = [];
    //pa filtrar insumos
    insumosFiltrados
    VeificarFlete: boolean = false;
modalEditar: boolean = false;
    fletes: Flete[] = [];
    items: MenuItem[] = [];
    DetalleFlete: boolean = false;
    fleteDetalles: FleteDetalle[] = [];
    noVerificados: FleteDetalle[] = [];
    verificados: FleteDetalle[] = [];
    incidencias: any[] = [];
    rowactual: Flete | null = null;
    Detail: boolean = false;

    incidenciasForm: FormGroup;
    CreateEdit: boolean = false;
    //VARIABLE PARA REPORTES SABER QUE TIPO SE NECESITARA
    reporteActual: string;
    showReporte: boolean = false;
    pdfSrc: SafeResourceUrl | null = null;

    //variable sipiner
    isLoading: boolean = false;
    isRegresarVisible: boolean = false;



    // Propiedades para el nuevo Drag-and-Drop de Insumos por Actividad por Etapa
    itemsGroupInsumosActividadEtapa1: InsumoPorProveedor[] = [];
    itemsGroupInsumosActividadEtapa2: InsumoPorProveedor[] = [];
    selectedItemsGroupInsumosActividadEtapa1: any[] = [];
    selectedItemsGroupInsumosActividadEtapa2: any[] = [];
    insumosDisponiblesActividadEtapa: InsumoPorProveedorExtendido[] = []; // Listado de insumos disponibles

    // Propiedades para manejo de cantidades
    cantidadesOriginalesActividadEtapa: { [inpp_Id: number]: number } = {};


    // Propiedades para el nuevo Drag-and-Drop de Equipos de seguridad por Actividad por Etapa
    mostrarEquiposSeguridadPorActividad: boolean = false;
    itemsGroupEquiposActividadEtapa1: EquipoPorProveedorExtendido[] = [];
    itemsGroupEquiposActividadEtapa2: EquipoPorProveedorExtendido[] = [];



    insumosDisponibles: InsumoPorProveedorExtendido[] = [];
    insumosSeleccionadosNuevo: InsumoPorProveedorExtendido[] = [];
    fleteId: number | null = null;
    headerId: number | null = null;

    mostrarVerificacionEquipos: boolean = false;

    mostrarEquiposSeguridad: boolean = false;


    verificarDialog: boolean = false;
    incidenciasDialog: boolean = false;
    insumosSeleccionados: any[] = [];
    insumosAgregados: number[] = []; insumos: InsumoPorProveedor[] = [];
    cantidadInsumo: number;
    placeholderLlegada: string = 'Seleccione una bodega';
    placeholderSalida: string = 'Seleccione una bodega';

    //variable para aparicion del pdf
    isPdfVisible: boolean = false;
    isPdfVisibleDetalle: boolean = false;



    //VARIABLES SUBIDA DE ARCHIVOS
    filePreviewUrl: string | null = null;
    comprobarteFile: File | null = null;
    file: File | null = null;
    previewImage: string | null = null;
    previewPDF: SafeResourceUrl | null = null;


    bodegas: Bodega[] = [];
    filtradoBodegas: Bodega[] = [];
    fletess: Flete[] = [];
    columnas: any[] = [];
    detalles: boolean = false;
    Edit: boolean = false;
    form: FormGroup;
    valSwitch: boolean = false;
    empleados: autocompleteEmpleado[] | undefined;
    filtradoEmpleado: autocompleteEmpleado[] = [];
    Indexactivo: number = 0;
    encabezadoId: number | null = null;
    IndexIncidencias: boolean = false;
    incidencia: FleteControlCalidad;
    itemsIncidencias: MenuItem[] = [];
    createIncidencia: boolean = false;
    fleteIncidenciaId: number = 0;
    formIncidencias: FormGroup;
    identity: string = "crear";
    idIncidencia: number = 0;
    submittedIncidencia: boolean = false;
    DetalleVerificacion: boolean = false;
    cantidadesOriginales: { [key: number]: number } = {};

    verificarFleteModal: boolean = false;

    titulo: string = "Nueva Incidencia";
    selectedIncidencia: any;
    deleteIncidencia: boolean = false;
    AuditoriaVisible: boolean = false;


    //VERIFICACION PARTICIONES
    showSelectAllPendientes: boolean = true;
    showSelectAllVerificados: boolean = false;


    //CAMBIOSFLETE
    identityFlete: string = "crear";
    tituloFlete: string = "Nuevo";
    selectedFlete: any;
    idFlete: number = 0;
    fleteDetalles1: FleteDetalle[] = [];


    constructor(
        private notificacionesService: NotificacionesService,
        private notificacionUpdateService: NotificacionUpdateService,
        private notificationManagerService: NotificationManagerService,
        private cdr: ChangeDetectorRef, private ngZone: NgZone,
        private ref: ChangeDetectorRef,
        private cd: ChangeDetectorRef,
        private usuarioService: UsuarioService,
        private cdRef: ChangeDetectorRef,
        private sanitizer: DomSanitizer
        , private imageService: ImageService,
        private service: FleteService,
        private detalleService: FleteDetalleService,
        private controlCalidadService: FleteControlCalidadService,
        private router: Router,
        private fb: FormBuilder,
        private messageService: MessageService,
        public cookieService: CookieService,
        private navigationStateService: NavigationStateService,
        private insumoPorActividadService: InsumoPorActividadService,
    ) {
        this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
            if(event.urlAfterRedirects.includes('/sigesproc/Fletes/Fletes'))
            {
                this.onRouteChange();
            }
        
        });
        this.minDate = new Date(1920, 0, 1);
        this.formIncidencias = this.fb.group({
            flcc_DescripcionIncidencia: ['', Validators.required],
            flcc_FechaHoraIncidencia: ['', Validators.required],
            flen_Id: ['', Validators.required]

        });

        this.form = this.fb.group({
            flen_FechaHoraSalida: ['', Validators.required],
            flen_FechaHoraEstablecidaDeLlegada: ['', Validators.required],
            encargado: ['', Validators.required],
            emtr_Id: ['', Validators.required],
            supervisorsalida: ['', Validators.required],
            emss_Id: ['', Validators.required],
            supervisorllegada: ['', Validators.required],
            emsl_Id: ['', Validators.required],
            boas_Id: ['',],
            salida: ['',],
            flen_DestinoProyecto: [false, Validators.required],
            flen_SalidaProyecto: [false, Validators.required],
            boat_Id: ['',],
            llegada: [''],
            etapa: [''],
            actividad: [''],
            etapaActividad: [''],
            etapaSalida: [''],
            actividadSalida: [''],
            bodegaSalida: [''],
            etapaActividadSalida: ['']
        }, {
            validator: [
                this.validarFechas('flen_FechaHoraSalida', 'flen_FechaHoraEstablecidaDeLlegada'),
                this.validarEmpleadosDistintos,
            ]
        });

        this.verificarForm = this.fb.group({
            flen_FechaHoraLlegada: ['', Validators.required],
            mostrarVerificacionEquipos: [false],
            detalles: this.fb.array([]),
        }, {
            validator: this.validarFechasSalidaLlegada.bind(this)
        });


        this.incidenciasForm = this.fb.group({
            incidencias: this.fb.array([])
        });
        this.cantidadesOriginales = {};
        this.Listado();




    }
    validarFechasSalidaLlegada(form: FormGroup): { [key: string]: any } | null {
        const fechaSalida = this.flete?.flen_FechaHoraSalida;
        const fechaLlegada = form.get('flen_FechaHoraLlegada')?.value;

        if (fechaSalida && fechaLlegada) {
            const fechaSalidaDate = new Date(fechaSalida);
            const fechaLlegadaDate = new Date(fechaLlegada);

            if (fechaLlegadaDate <= fechaSalidaDate) {
                return { fechaInvalida: true };  
            }
        }

        return null;  // Si las fechas son válidas, no hay error
    }


    public GuardarEnviarAlertas(descripcion: string): void {
        this.notificacionesService.ListarUsuarios().subscribe(
            (data: any[]) => {
                // Filtra los usuarios que tienen un ID válido (no null ni undefined)
                const usuariosSeleccionados = data.filter(item => item.usua_EsAdministrador === true);
                // Verifica si hay usuarios cargados
                if (usuariosSeleccionados.length === 0) {
                    this.messageService.add({ severity: 'success', summary: 'Error', styleClass: 'iziToast-custom', detail: 'no hay usuarios elegidos.' });
                    return;
                }

                // Construye la ruta de notificación
                const notiRuta = '/Fletes/Fletes';

                // Crea un array de detalles de notificación para cada usuario
                const detalles = usuariosSeleccionados.map(usuario => ({
                    aler_Descripcion: descripcion, // Descripción de la notificación
                    aler_Ruta: notiRuta, // Ruta de la notificación
                    aler_Fecha: new Date().toISOString(), // Fecha actual en formato ISO
                    usua_Id: usuario.usua_Id, // ID del usuario destinatario
                    usua_Creacion: this.usuarioId, // ID del usuario que crea la notificación
                    napu_Ruta: notiRuta // Ruta de pantalla opcional
                }));

                // Llama al servicio para insertar y enviar las notificaciones, pasando los detalles creados
                this.notificationManagerService.insertarYEnviarNotificaciones(detalles,notiRuta).subscribe(
                    // Maneja la respuesta exitosa de la inserción y envío de notificaciones
                    resultados => {
                        // Filtra los resultados para obtener los que fueron exitosos y los que fallaron
                        const exitosos = resultados.filter((res: any) => res.success);
                        const fallidos = resultados.filter((res: any) => !res.success);

                        // Si hay inserciones exitosas, muestra un mensaje de éxito
                        if (exitosos.length > 0) {

                        }

                        // Llama al servicio para actualizar las notificaciones
                        this.notificacionUpdateService.notificacionesActualizadasEmit();
                    },
                    // Maneja cualquier error ocurrido durante la inserción o envío de notificaciones
                    error => {


                    }
                );
            },
            error => {

                //   this.loading = false; // Desactiva el spinner de carga en caso de error

            }
        );
    }


    //ELIMINAR BUGGUEO DE CLIC AL ENTRAR A LA VERIFICACION
    triggerListadoInsumos() {
        this.ListadoInsumos();
    }

    async ListadoUsuario() {
        await this.usuarioService.Listar().then(
            (usuarios: Usuario[]) => {
                this.usuario = usuarios.find(u => u.usua_Id === this.usuarioId);
                this.verificarAccesoCrearFlete();
                this.Listado();
            },
            (error) => {
            }
        );
    }

    ngOnInit(): void {
        console.log("recarga")
        this.selectedFlete = null;
        this.CreateEdit = false;
        this.Edit = false;
        this.limpiarDragAndDrop();
        this.limpiarDragAndDropEquipos();
        this.limpiarDragAndDropEquiposActividadEtapa();
        this.limpiarDragAndDropInsumosActividadEtapa();
        this.mostrarEquiposSeguridad = false;
        this.form.reset();
        this.identityFlete = "crear";
        this.tituloFlete = "Nuevo";
        this.valSwitch = false; // Reiniciar el switch
        this.valSwitchSalida = false;
        this.form.patchValue({ flen_DestinoProyecto: false });
        this.insumosSeleccionados = []; // Reiniciar insumos seleccionados
        this.itemsGroup2 = []; // Reiniciar la lista de insumos seleccionados
        this.Indexactivo = 0; // Reiniciar la tab activa
        this.submitted = false;
        this.Verificacion = false;
        this.createIncidencia = false;
        this.IndexIncidencias = false;
        this.Index = true;
        this.isPdfVisible = false;
        this.isPdfVisibleDetalle = false;
        this.DetalleFlete = false;
        this.isRegresarVisible = false;
        this.DeleteFlete = false;
        this.verificarFleteModal = false;
        this.showEditConfirmDialog = false;
        this.showReporte = false;
        this.DetalleVerificacion = false;
        this.VeificarFlete = false;
        this.modalEditar = false;

     

       
        const token = this.cookieService.get('Token');
        if (token == 'false') {
            this.router.navigate(['/auth/login'])
        }
        this.applyValidations();

        this.ListadoProyectosSalida();
        this.ListadoBodegasSalida();
        this.detalleService.ListarActividadesPorEtapa().subscribe(
            (data: ActividadPorEtapa[]) => {
                this.actividadesSalida = data;

                // Verifica si hay una etapa seleccionada
                if (this.selectedEtapaId) {
                    // Simula la selección de la etapa para activar el filtrado
                    this.onEtapaSalidaSelect({ value: { etap_Id: this.selectedEtapaId } });
                } else {
                }
            },
            (error) => {
            }
        );


        this.isTableLoading = true;
        this.cargarActividades();

        this.service.Listar().subscribe(
            (data: Flete[]) => {
                this.proyectos = data;
                if (this.proyectos.length === 0) {
                    this.loadedTableMessage = "No existen proyectos existentes aún.";
                }
            },
            (error: any) => {
                this.loadedTableMessage = error.message;
            },
            () => {
                this.isTableLoading = false;
            }
        );




        this.ListadoUsuario()

        //busqueda de datos de usuario pa encontrar el rol

        this.ListadoInsumos();
//AQUI ESTOY CAMBIANDOOO
        this.ListadoActividadesPorEtapa();
        // this.ListadoActividadesPorEtapa().then(() => {
        //     if (this.selectedFlete) {
        //         this.EditarFlete();
        //     }
        // }).catch(error => {
        // });



        this.ListadoProyectos();
        this.Listado();
        this.ListadoEmpleados();
        this.ListadoBodegas();
        this.itemsIncidencias = this.getItemsIncidencias();
        this.pendientes.forEach(detalle => {
            this.cantidadesOriginales[detalle.flde_Id] = detalle.flde_Cantidad;
        });



        this.pendientes.forEach(detalle => {
            this.cantidadesOriginales[detalle.flde_Id] = detalle.flde_Cantidad;
        });

        const navigationState = this.navigationStateService.getState();

        if (navigationState && navigationState.flete) {
            this.CrearFlete();
        }
    }


    onRouteChange(): void {
        this.ngOnInit();
     }

    formatDate(date: Date | string): string {
        if (!date) return '';
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return '';
        }
        return parsedDate.toISOString();
    }



    mostrarErrores(errors: { [key: string]: string[] }) {
        for (const key in errors) {
            if (errors.hasOwnProperty(key)) {
                errors[key].forEach(error => {
                });
            }
        }
    }


    //Filtrado de el dropdownlist de etapas por el ID del proyecto de salida


    onEtapaActividadSelect() {
        const selectedEtapa = this.form.get('etapaSalida').value;
        const selectedActividad = this.form.get('actividadSalida').value;

        const actividadEtapa = this.actividadesSalida.find(
            act => act.etap_Id === selectedEtapa.etap_Id && act.acti_Id === selectedActividad.acti_Id
        );

        if (actividadEtapa) {
            this.form.patchValue({ boas_Id: actividadEtapa.acet_Id });
        } else {
            this.form.patchValue({ boas_Id: null });
        }
    }

    ListadoBodegasSalida() {
        this.service.ListarBodegas().subscribe(
            (data: Bodega[]) => {
                this.bodegasSalida = data.sort((a, b) => a.bode_Descripcion.localeCompare(b.bode_Descripcion));;
            },
            error => {
            }
        );
    }



    filterProyectosSalida(event: any) {
        const query = event.query.toLowerCase();
        this.filtradoProyectosSalida = this.proyectosSalida.filter(proyecto =>
            proyecto.proy_Nombre && proyecto.proy_Nombre.toLowerCase().includes(query)
        );
    }

    ListadoProyectosSalida() {
        this.service.ListarProyectos().subscribe(
            (data: Proyecto[]) => {
                this.proyectosSalida = data.sort((a, b) => a.proy_Nombre.localeCompare(b.proy_Nombre));;  // Guardamos los proyectos en la variable correspondiente
            },
            error => {
            }
        );
    }

    filterActividadesSalida(event: any) {
        const query = event.query.toLowerCase();

        // If the input is empty, reset to the original activities
        if (query.trim() === "") {
            this.resetActividadesSalida();
        } else {
            // Filter the activities based on user input
            this.filtradoActividadesSalida = this.filtradoActividadesSalidaOriginal.filter(actividad =>
                actividad.acti_Descripcion.toLowerCase().includes(query)
            );
        }

        // If no activities are found after filtering
        if (this.filtradoActividadesSalida.length === 0) {
        }
    }

    resetActividadesSalida() {
        this.filtradoActividadesSalida = [...this.filtradoActividadesSalidaOriginal];
    }

    ListadoEtapasPorProyectoSalida(proyectoId: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.detalleService.ListarActividadesPorEtapa().subscribe((data: ActividadPorEtapa[]) => {
                if (data) {
                    // Store the fetched etapas persistently for the selected project
                    this.filtradoEtapasSalidaOriginal = data
                        .filter(item => item.proy_Id === proyectoId)
                        .map(item => ({ etap_Id: item.etap_Id, etap_Descripcion: item.etap_Descripcion, etpr_Id: item.etpr_Id }))
                        .filter((value, index, self) =>
                            self.findIndex(v => v.etap_Id === value.etap_Id) === index)
                        .sort((a, b) => a.etap_Descripcion.localeCompare(b.etap_Descripcion));

                    // Set filtered etapas to the same value initially
                    this.filtradoEtapasSalida = [...this.filtradoEtapasSalidaOriginal];

                    resolve();
                } else {
                    reject('No se recibieron datos al listar etapas de salida.');
                }
            }, (error) => {
                reject(error);
            });
        });
    }

    resetEtapasSalida() {
        const proyectoSeleccionado = this.form.get('salida')?.value;

        // Check if a project is selected
        if (!proyectoSeleccionado) {
            this.filtradoEtapasSalida = [];
            this.etapasMessage = "No project selected";  // Display this message in the dropdown
            this.form.patchValue({ etapaSalida: null });  // Reset the form control for etapaSalida
        } else {
            // If a project is selected, ensure etapas are shown
            this.filtradoEtapasSalida = [...this.filtradoEtapasSalidaOriginal];
            this.etapasMessage = "";  // Clear any error message
        }
    }

    filterEtapasSalida(event: any) {
        const query = event.query.toLowerCase();

        // If the input is empty, reset to the original etapas
        if (query.trim() === "") {
            this.resetEtapasSalida();
        } else {
            // Filter the etapas based on user input
            this.filtradoEtapasSalida = this.filtradoEtapasSalidaOriginal.filter(etapa =>
                etapa.etap_Descripcion.toLowerCase().includes(query)
            );
        }

        // If no etapas are found after filtering
        if (this.filtradoEtapasSalida.length === 0) {
        }
    }

    ListadoActividadesPorEtapaSalida(etapaId: number) {
        this.detalleService.ListarActividadesPorEtapa().subscribe(
            (data: ActividadPorEtapa[]) => {
                // Filtra las actividades según el ID de la etapa seleccionada
                this.actividadesSalida = data.filter(actividad => actividad.etap_Id === etapaId).sort((a, b) => a.acti_Descripcion.localeCompare(b.acti_Descripcion));;

                // Verifica si se encontraron actividades
                if (this.actividadesSalida.length > 0) {
                } else {
                }

                // Aquí puedes actualizar tu DDL de actividades si es necesario
                this.form.controls['actividadSalida'].setValue(null); // Resetea el valor del DDL
                this.form.controls['actividadSalida'].markAsUntouched(); // Limpia el estado del control
            },
            error => {
            }
        );
    }

    obtenerEtapaActividadIdSalida(etapa: string, actividad: string): number | null {
        const registro = this.actividadesSalida.find(
            act => act.etap_Descripcion === etapa && act.acti_Descripcion === actividad
        );
        return registro ? registro.acet_Id : null;
    }

    logActividadesDisponibles(event: any) {
    }

    filterBodegasSalida(event: any) {
        const query = event.query.toLowerCase();
        this.filtradoBodegasSalida = this.bodegasSalida.filter(bodega =>
            bodega.bode_Descripcion.toLowerCase().includes(query)
        );

        if (this.filtradoBodegasSalida.length > 0) {
        } else {
        }
    }

    onEtapaSalidaSelect(event: any) {
        const etapaSeleccionada = event.value;
        if (etapaSeleccionada) {
            // Almacena solo el ID de la etapa seleccionada
            this.form.patchValue({
                etapaSalida: etapaSeleccionada.etap_Descripcion
            });

            // Filtrar las actividades basadas en el ID de la etapa seleccionada y almacenar el filtrado original
            this.filtradoActividadesSalidaOriginal = this.actividadesSalida.filter(actividad => actividad.etpr_Id === etapaSeleccionada.etpr_Id).sort((a, b) => a.acti_Descripcion.localeCompare(b.acti_Descripcion));

            // Asignar las actividades filtradas para la vista actual
            this.filtradoActividadesSalida = [...this.filtradoActividadesSalidaOriginal];

            if (this.filtradoActividadesSalida.length > 0) {
            } else {
            }
        } else {
        }
    }

    cargarActividades() {
        this.detalleService.ListarActividadesPorEtapa().subscribe((data: ActividadPorEtapa[]) => {
            this.actividadesSalida = data;
        });
    }

    onActividadEtapaSelect() {
        const boas_Id = this.form.get('boas_Id').value;
        if (boas_Id) {
            this.ListadoInsumosPorActividadEtapa(boas_Id);
        } else {
        }
    }

    onActividadSalidaSelect(event: any) {
        const actividadSeleccionada = event.value;

        if (actividadSeleccionada && actividadSeleccionada.acet_Id) {
            // Asignar los valores al formulario
            this.itemsGroupInsumosActividadEtapa2 = []; // Limpia insumos seleccionados por actividad y etapa
            this.itemsGroupEquiposActividadEtapa2 = [];
            this.form.patchValue({
                etapaActividadSalida: actividadSeleccionada.acet_Id,
                boas_Id: actividadSeleccionada.acet_Id
            });

            // Llamar a la búsqueda de insumos por etapa y actividad
            this.ListadoInsumosPorActividadEtapa(actividadSeleccionada.acet_Id);
            this.ListadoEquiposPorActividadEtapa(actividadSeleccionada.acet_Id);

        }
        else {
            this.form.patchValue({
                etapaActividadSalida: null,
                boas_Id: null
            });
        }
    }

    //Filtrado de el dropdownlist de etapas por el ID del proyecto
    ListadoEtapasPorProyecto(proyectoId: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.detalleService.ListarActividadesPorEtapa().subscribe((data: ActividadPorEtapa[]) => {
                if (data) {
                    this.filtradoEtapasOriginal = data
                        .filter(item => item.proy_Id === proyectoId)
                        .map(item => ({ etap_Id: item.etap_Id, etap_Descripcion: item.etap_Descripcion, etpr_Id: item.etpr_Id }))
                        .filter((value, index, self) =>
                            self.findIndex(v => v.etap_Id === value.etap_Id) === index)
                        .sort((a, b) => a.etap_Descripcion.localeCompare(b.etap_Descripcion));

                    this.filtradoEtapas = [...this.filtradoEtapasOriginal];

                    resolve();
                } else {
                    this.filtradoEtapas = [];
                    reject('No se recibieron datos al listar etapas.');
                }
            }, (error) => {
                this.filtradoEtapas = [];
                reject(error);
            });
        });
    }

    filterEtapas(event: any) {
        const query = event.query.toLowerCase();

        if (query.trim() === "") {
            this.resetEtapas(); 
        } else {
            this.filtradoEtapas = this.filtradoEtapasOriginal.filter(etapa =>
                etapa.etap_Descripcion.toLowerCase().includes(query)
            );
        }

        if (this.filtradoEtapas.length === 0) {
        }
    }

    resetEtapas() {
        const proyectoSeleccionado = this.form.get('llegada')?.value;

        // Check if a project is selected
        if (!proyectoSeleccionado) {
            this.filtradoEtapas = [];
            this.etapasMessage = "No project selected";  // Display this message in the dropdown
            this.form.patchValue({ etapa: null });  // Reset the form control for etapa
        } else {
            // If a project is selected, ensure etapas are shown
            this.filtradoEtapas = [...this.filtradoEtapasOriginal];
            this.etapasMessage = "";  // Clear any error message
        }
    }

    filterProyectos(event: any) {
        const query = event.query.toLowerCase();
        this.filtradoProyectos = this.proyectos.filter(proyecto =>
            proyecto.proy_Nombre && proyecto.proy_Nombre.toLowerCase().includes(query)
        );
    }

    ListadoActividadesPorEtapa(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.detalleService.ListarActividadesPorEtapa().subscribe((data: ActividadPorEtapa[]) => {
                this.actividades = data.map(item => ({
                    ...item,
                    etapaActividadConcatenado: `${item.etap_Descripcion} - ${item.acti_Descripcion}`
                }));

                resolve();
            }, (error) => {
                reject(error);
            });
        });
    }

    //PARA MOVIMIENTO DE VERIFICACION APARICION INSUMO O EQUIPO
    onVerificacionSwitchChange() {
        if (this.verificacionSwitch) {
            this.Verificar(this.flete); // Volver a cargar la verificación con equipos de seguridad
        } else {
            this.Verificar(this.flete); // Volver a cargar la verificación con insumos
        }
    }

    filterActividades(event: any) {
        const query = event.query.toLowerCase();

        // Si la búsqueda está vacía, restablece a las actividades originales
        if (query.trim() === "") {
            this.resetActividades();
        } else {
            // Filtrar las actividades basadas en el input del usuario
            this.filtradoActividades = this.filtradoActividadesOriginal.filter(actividad =>
                actividad.acti_Descripcion.toLowerCase().includes(query)
            );
        }

        // Si no se encuentran actividades después de filtrar
        if (this.filtradoActividades.length === 0) {
        }
    }

    resetActividades() {
        this.filtradoActividades = [...this.filtradoActividadesOriginal];
    }

    onActividadSelect(event: any) {
        const actividadSeleccionada = event.value;
        const etapaSeleccionada = this.form.get('etapa').value;

        if (actividadSeleccionada && etapaSeleccionada) {
            const etapaActividadId = this.obtenerEtapaActividadId(etapaSeleccionada, actividadSeleccionada.acti_Descripcion);

            this.form.patchValue({
                actividad: actividadSeleccionada.acti_Descripcion,
                etapaActividad: etapaActividadId,
                boat_Id: etapaActividadId
            });
        } else {
            this.form.patchValue({
                actividad: null,
                etapaActividad: null,
                boat_Id: null
            });
        }
    }

    obtenerEtapaActividadId(etapa: string, actividad: string): number | null {
        const registro = this.actividades.find(
            act => act.etap_Descripcion === etapa && act.acti_Descripcion === actividad
        );
        return registro ? registro.acet_Id : null;
    }

    obtenerEtapaActividadSalidaId(etapa: string, actividad: string): number | null {
        const registro = this.actividades.find(
            act => act.etap_Descripcion === etapa && act.acti_Descripcion === actividad
        );
        return registro ? registro.acet_Id : null;
    }

    limpiarCampos() {
        this.insumosSeleccionados = [];
        this.obtenerListadoInsumos();
        this.ListadoInsumos();
        this.form.reset();
        this.valSwitch = false;
        this.form.patchValue({ flen_DestinoProyecto: false });
        this.Indexactivo = 0;
        this.insumosSeleccionados = [];
    }

    // validacion bloqueo tab
    onTabChange(event: any) {
        this.submitted = true;

        this.actualizarValidaciones(['llegada', 'etapa', 'actividad', 'etapaActividad', 'bodega', 'salida', 'etapaSalida', 'actividadSalida', 'bodegaSalida']);

        if (event.index === 1 && this.form.valid) {
            if (this.valSwitchSalida) {
                const acet_Id = this.form.get('boas_Id').value;
                if (acet_Id) {
                    this.ListadoInsumosPorActividadEtapa(acet_Id);  // Cargar los insumos si salida es proyecto
                }
            }

            const bodegaId = this.form.get('boas_Id')?.value;
            if (!this.valSwitchSalida && bodegaId) {
                this.ListadoSuministrosPorBodega(bodegaId);
                this.ListadoEquiposPorBodega(bodegaId);
            }

            // Permitir cambio al siguiente tab si todo es válido
            this.Indexactivo = 1;

        } else if (event.index === 0) {
            // Reiniciar el índice al volver al primer tab
            this.Indexactivo = 0;
            this.form.updateValueAndValidity();
        } else {
            this.form.markAllAsTouched();
        }
    }

    actualizarValidaciones(fields: string[]) {
        fields.forEach(field => {
            const control = this.form.get(field);
            if (control) {
                control.updateValueAndValidity();
            }
        });
    }



    Guardar() {
        if (this.valSwitchSalida) {
            this.form.get('bodegaSalida')?.setErrors(null);
            this.form.get('salida')?.setErrors(null);
            
            let proyectoSalidaValue = this.form.value.salida;
            let proyectoSalidaId = this.proyectosSalida.find(proyecto => proyecto.proy_Nombre === proyectoSalidaValue)?.proy_Id ?? 0;
    
            // Validación de proyecto salida solo en modo 'crear'
            if (this.identityFlete === "crear") {
                if (typeof proyectoSalidaValue === 'string' && proyectoSalidaValue.trim() !== "") {
                    if (proyectoSalidaId !== 0) {
                        this.form.get('salida')?.setErrors(null);
                        this.Error_ProyectoSalida = "";
                    } else {
                        this.Error_ProyectoSalida = "Opción no encontrada.";
                        this.form.get('salida')?.setErrors({ 'invalidBodegaSalidaId': true });
                    }
                } else if (!proyectoSalidaValue || proyectoSalidaValue === "") {
                    this.Error_ProyectoSalida = "El campo es requerido.";
                    this.form.get('salida')?.setErrors({ 'invalidBodegaSalidaId': true });
                }
            }
    
            let etapaSalidaValue = this.form.value.etapaSalida;
            let etapaSalidaId = this.filtradoEtapasSalida.find(etapas => etapas.etap_Descripcion === etapaSalidaValue)?.etpr_Id ?? 0;
    
            // Validación de etapa salida solo en modo 'crear'
            if (this.identityFlete === "crear") {
                if (typeof etapaSalidaValue === 'string' && etapaSalidaValue.trim() !== "") {
                    if (etapaSalidaId !== 0) {
                        this.form.get('etapaSalida')?.setErrors(null);
                        this.Error_EtapaSalida = "";
                    } else {
                        this.Error_EtapaSalida = "Opción no encontrada.";
                        this.form.get('etapaSalida')?.setErrors({ 'invalidetapaSalidaidaId': true });
                    }
                } else if (!etapaSalidaValue || etapaSalidaValue === "") {
                    this.Error_EtapaSalida = "El campo es requerido.";
                    this.form.get('etapaSalida')?.setErrors({ 'invalidetapaSalidaidaId': true });
                }
            }
    
            let ActividadSalidaValue = this.form.value.actividadSalida;
            let actividadSalidaId = this.filtradoActividadesSalida.find(acti => acti.acti_Descripcion === ActividadSalidaValue)?.acet_Id ?? 0;
    
            // Validación de actividad salida solo en modo 'crear'
            if (this.identityFlete === "crear") {
                if (typeof ActividadSalidaValue === 'string' && ActividadSalidaValue.trim() !== "") {
                    if (actividadSalidaId !== 0) {
                        this.form.get('actividadSalida')?.setErrors(null);
                        this.Error_ActividadSalida = "";
                    } else {
                        this.Error_ActividadSalida = "Opción no encontrada.";
                        this.form.get('actividadSalida')?.setErrors({ 'invalidactiId': true });
                    }
                } else if (!ActividadSalidaValue || ActividadSalidaValue === "") {
                    this.Error_ActividadSalida = "El campo es requerido.";
                    this.form.get('actividadSalida')?.setErrors({ 'invalidactiId': true });
                }
            }
    
        } else {
            let bodegaSalidaValue = this.form.value.bodegaSalida;
            let bodegaSalidaId = this.bodegasSalida.find(bodega => bodega.bode_Descripcion === bodegaSalidaValue)?.bode_Id ?? 0;
    
            // Validación de bodega salida solo en modo 'crear'
            if (this.identityFlete === "crear") {
                if (typeof bodegaSalidaValue === 'string' && bodegaSalidaValue.trim() !== "") {
                    if (bodegaSalidaId !== 0) {
                        this.form.get('bodegaSalida')?.setErrors(null);
                        this.form.get('salida')?.setErrors(null);
                        this.Error_BodegaSalida = "";
                    } else {
                        this.Error_BodegaSalida = "Opción no encontrada.";
                        this.form.get('bodegaSalida')?.setErrors({ 'invalidBodegaSalidaId': true });
                        this.form.get('salida')?.setErrors({ 'invalidBodegaSalidaId': true });
                    }
                } else if (!bodegaSalidaValue || bodegaSalidaValue === "") {
                    this.Error_BodegaSalida = "El campo es requerido.";
                    this.form.get('bodegaSalida')?.setErrors({ 'invalidBodegaSalidaId': true });
                    this.form.get('salida')?.setErrors({ 'invalidBodegaSalidaId': true });
                }
            }
        }
    
        if (this.valSwitch) {
            let proyectoLlegadaValue = this.form.value.llegada;
            let proyectollegadaId = this.proyectos.find(bodega => bodega.proy_Nombre === proyectoLlegadaValue)?.proy_Id ?? 0;
    
            // Validación de proyecto llegada solo en modo 'crear'
            if (this.identityFlete === "crear") {
                if (typeof proyectoLlegadaValue === 'string' && proyectoLlegadaValue.trim() !== "") {
                    if (proyectollegadaId !== 0) {
                        this.form.get('llegada')?.setErrors(null);
                        this.Error_Proyecto = "";
                    } else {
                        this.Error_Proyecto = "Opción no encontrada.";
                        this.form.get('llegada')?.setErrors({ 'invalidBodegallegadaId': true });
                    }
                } else if (!proyectoLlegadaValue || proyectoLlegadaValue === "") {
                    this.Error_Proyecto = "El campo es requerido.";
                    this.form.get('llegada')?.setErrors({ 'invalidBodegallegadaId': true });
                }
            }
    
            let etapaLlegadaValue = this.form.value.etapa;
            let etapallegadaId = this.filtradoEtapas.find(etapa => etapa.etap_Descripcion === etapaLlegadaValue)?.etpr_Id ?? 0;
    
            // Validación de etapa llegada solo en modo 'crear'
            if (this.identityFlete === "crear") {
                if (typeof etapaLlegadaValue === 'string' && etapaLlegadaValue.trim() !== "") {
                    if (etapallegadaId !== 0) {
                        this.form.get('etapa')?.setErrors(null);
                        this.Error_Etapa = "";
                    } else {
                        this.Error_Etapa = "Opción no encontrada.";
                        this.form.get('etapa')?.setErrors({ 'invalidEtapallegadaId': true });
                    }
                } else if (!etapaLlegadaValue || etapaLlegadaValue === "") {
                    this.Error_Etapa = "El campo es requerido.";
                    this.form.get('etapa')?.setErrors({ 'invalidEtapallegadaId': true });
                }
            }
    
            let actividadLlegadaValue = this.form.value.actividad;
            let actividadllegadaId = this.filtradoActividades.find(acti => acti.acti_Descripcion === actividadLlegadaValue)?.acet_Id ?? 0;
    
            // Validación de actividad llegada solo en modo 'crear'
            if (this.identityFlete === "crear") {
                if (typeof actividadLlegadaValue === 'string' && actividadLlegadaValue.trim() !== "") {
                    if (actividadllegadaId !== 0) {
                        this.form.get('actividad')?.setErrors(null);
                        this.Error_Actividad = "";
                    } else {
                        this.Error_Actividad = "Opción no encontrada.";
                        this.form.get('actividad')?.setErrors({ 'invalidactividadllegadaId': true });
                    }
                } else if (!actividadLlegadaValue || actividadLlegadaValue === "") {
                    this.Error_Actividad = "El campo es requerido.";
                    this.form.get('actividad')?.setErrors({ 'invalidactividadllegadaId': true });
                }
            }
    
        } else {
            let bodegaLlegadaValue = this.form.value.llegada;
            let bodegallegadaId = this.bodegas.find(bodega => bodega.bode_Descripcion === bodegaLlegadaValue)?.bode_Id ?? 0;
    
            // Validación de bodega llegada solo en modo 'crear'
            if (this.identityFlete === "crear") {
                if (typeof bodegaLlegadaValue === 'string' && bodegaLlegadaValue.trim() !== "") {
                    if (bodegallegadaId !== 0) {
                        this.form.get('llegada')?.setErrors(null);
                        this.Error_BodegaLlegada = "";
                    } else {
                        this.Error_BodegaLlegada = "Opción no encontrada.";
                        this.form.get('llegada')?.setErrors({ 'invalidBodegallegadaId': true });
                    }
                } else if (!bodegaLlegadaValue || bodegaLlegadaValue === "") {
                    this.Error_BodegaLlegada = "El campo es requerido.";
                    this.form.get('llegada')?.setErrors({ 'invalidBodegallegadaId': true });
                }
            }
        }
    
        const etapa = this.form.get('etapa').value === 0 ? 'Compactación de terreno' : this.form.get('etapa').value;
        const actividad = this.form.get('actividad').value === 0 ? 'Colocación de ceramica' : this.form.get('actividad').value;
        const etapaActividad = this.form.get('etapaActividad').value === 0 ? 238 : this.form.get('etapaActividad').value;
    
        if (this.form.valid) {
            const modeloEncabezado = {
                flen_FechaHoraSalida: this.form.get('flen_FechaHoraSalida').value,
                flen_FechaHoraEstablecidaDeLlegada: this.form.get('flen_FechaHoraEstablecidaDeLlegada').value,
                encargado: this.form.get('encargado').value,
                emtr_Id: this.form.get('emtr_Id').value,
                supervisorsalida: this.form.get('supervisorsalida').value,
                emss_Id: this.form.get('emss_Id').value,
                supervisorllegada: this.form.get('supervisorllegada').value,
                emsl_Id: this.form.get('emsl_Id').value,
                boas_Id: this.form.get('boas_Id').value,
                salida: this.form.get('salida').value,
                flen_DestinoProyecto: this.form.get('flen_DestinoProyecto').value,
                flen_SalidaProyecto: this.form.get('flen_SalidaProyecto').value,
                boat_Id: this.form.get('boat_Id').value,
                llegada: this.form.get('llegada').value,
                etapa: etapa,
                actividad: actividad,
                etapaActividad: etapaActividad,
                etapaSalida: this.form.get('etapaSalida').value,
                actividadSalida: this.form.get('actividadSalida').value,
                bodegaSalida: this.form.get('bodegaSalida').value,
                etapaActividadSalida: this.form.get('etapaActividadSalida').value
            };
            this.submitted = false;
            this.Indexactivo = 1;
            if(this.identityFlete === "editar") {
                // Lógica específica para edición
            }
        } else {
            this.submitted = true;
        }
    
        const navigationState = this.navigationStateService.getState();
        if (navigationState && navigationState.flete) {
            this.mostrarEquiposSeguridad = false;
            this.itemsAdded(navigationState.flete.detalle, 0);
        }
    }
    

    // Guardar() {

    //     if (this.valSwitchSalida) {
    //         this.form.get('bodegaSalida')?.setErrors(null)
    //         this.form.get('salida')?.setErrors(null)
    //         let proyectoSalidaValue = this.form.value.salida;
    //         let proyectoSalidaId = this.proyectosSalida.find(proyecto => proyecto.proy_Nombre === proyectoSalidaValue)?.proy_Id ?? 0;

    //         if (typeof proyectoSalidaValue === 'string' && proyectoSalidaValue.trim() !== "") {
    //             if (proyectoSalidaId !== 0) {
    //                 this.form.get('salida')?.setErrors(null)
    //                 this.Error_ProyectoSalida = "";
    //             } else {
    //                 this.Error_ProyectoSalida = "Opción no encontrada.";
    //                 this.form.get('salida')?.setErrors({ 'invalidBodegaSalidaId': true });
    //             }
    //         } else if (!proyectoSalidaValue || proyectoSalidaValue === "") {
    //             this.Error_ProyectoSalida = "El campo es requerido.";
    //             this.form.get('salida')?.setErrors({ 'invalidBodegaSalidaId': true });
    //         }

    //         let etapaSalidaValue = this.form.value.etapaSalida;
    //         let etapaSalidaId = this.filtradoEtapasSalida.find(etapas => etapas.etap_Descripcion === etapaSalidaValue)?.etpr_Id ?? 0;

    //         if (typeof etapaSalidaValue === 'string' && etapaSalidaValue.trim() !== "") {
    //             if (etapaSalidaId !== 0) {
    //                 this.form.get('etapaSalida')?.setErrors(null)
    //                 this.Error_EtapaSalida = "";
    //             } else {
    //                 this.Error_EtapaSalida = "Opción no encontrada.";
    //                 this.form.get('etapaSalida')?.setErrors({ 'invalidetapaSalidaidaId': true });
    //             }
    //         } else if (!etapaSalidaValue || etapaSalidaValue === "") {
    //             this.Error_EtapaSalida = "El campo es requerido.";
    //             this.form.get('etapaSalida')?.setErrors({ 'invalidetapaSalidaidaId': true });
    //         }



    //         let ActividadSalidaValue = this.form.value.actividadSalida;
    //         let actividadSalidaId = this.filtradoActividadesSalida.find(acti => acti.acti_Descripcion === ActividadSalidaValue)?.acet_Id ?? 0;

    //         if (typeof ActividadSalidaValue === 'string' && ActividadSalidaValue.trim() !== "") {
    //             if (actividadSalidaId !== 0) {
    //                 this.form.get('actividadSalida')?.setErrors(null)
    //                 this.Error_ActividadSalida = "";
    //             } else {
    //                 this.Error_ActividadSalida = "Opción no encontrada.";
    //                 this.form.get('actividadSalida')?.setErrors({ 'invalidactiId': true });
    //             }
    //         } else if (!ActividadSalidaValue || ActividadSalidaValue === "") {
    //             this.Error_ActividadSalida = "El campo es requerido.";
    //             this.form.get('actividadSalida')?.setErrors({ 'invalidactiId': true });
    //         }


    //     } else {
    //         let bodegaSalidaValue = this.form.value.bodegaSalida;
    //         let bodegaSalidaId = this.bodegasSalida.find(bodega => bodega.bode_Descripcion === bodegaSalidaValue)?.bode_Id ?? 0;

    //         if (typeof bodegaSalidaValue === 'string' && bodegaSalidaValue.trim() !== "") {
    //             if (bodegaSalidaId !== 0) {
    //                 this.form.get('bodegaSalida')?.setErrors(null);
    //                 this.form.get('salida')?.setErrors(null)
    //                 this.Error_BodegaSalida = "";
    //             } else {
    //                 this.Error_BodegaSalida = "Opción no encontrada.";
    //                 this.form.get('bodegaSalida')?.setErrors({ 'invalidBodegaSalidaId': true });
    //                 this.form.get('salida')?.setErrors({ 'invalidBodegaSalidaId': true });
    //             }
    //         } else if (!bodegaSalidaValue || bodegaSalidaValue === "") {
    //             this.Error_BodegaSalida = "El campo es requerido.";
    //             this.form.get('bodegaSalida')?.setErrors({ 'invalidBodegaSalidaId': true });
    //             this.form.get('salida')?.setErrors({ 'invalidBodegaSalidaId': true });
    //         }
    //     }

    //     if (this.valSwitch) {
    //         let proyectoLlegadaValue = this.form.value.llegada;
    //         let proyectollegadaId = this.proyectos.find(bodega => bodega.proy_Nombre === proyectoLlegadaValue)?.proy_Id ?? 0;

    //         if (typeof proyectoLlegadaValue === 'string' && proyectoLlegadaValue.trim() !== "") {
    //             if (proyectollegadaId !== 0) {
    //                 this.form.get('llegada')?.setErrors(null);
    //                 this.Error_Proyecto = "";
    //             } else {
    //                 this.Error_Proyecto = "Opción no encontrada.";
    //                 this.form.get('llegada')?.setErrors({ 'invalidBodegallegadaId': true });

    //             }
    //         } else if (!proyectoLlegadaValue || proyectoLlegadaValue === "") {
    //             this.Error_Proyecto = "El campo es requerido.";
    //             this.form.get('llegada')?.setErrors({ 'invalidBodegallegadaId': true });
    //         }


    //         let etapaLlegadaValue = this.form.value.etapa;
    //         let etapallegadaId = this.filtradoEtapas.find(etapa => etapa.etap_Descripcion === etapaLlegadaValue)?.etpr_Id ?? 0;

    //         if (typeof etapaLlegadaValue === 'string' && etapaLlegadaValue.trim() !== "") {
    //             if (etapallegadaId !== 0) {
    //                 this.form.get('etapa')?.setErrors(null);
    //                 this.Error_Etapa = "";
    //             } else {
    //                 this.Error_Etapa = "Opción no encontrada.";
    //                 this.form.get('etapa')?.setErrors({ 'invalidEtapallegadaId': true });

    //             }
    //         } else if (!etapaLlegadaValue || etapaLlegadaValue === "") {
    //             this.Error_Etapa = "El campo es requerido.";
    //             this.form.get('etapa')?.setErrors({ 'invalidEtapallegadaId': true });
    //         }


    //         let actividadLlegadaValue = this.form.value.actividad;
    //         let actividadllegadaId = this.filtradoActividades.find(acti => acti.acti_Descripcion === actividadLlegadaValue)?.acet_Id ?? 0;

    //         if (typeof actividadLlegadaValue === 'string' && actividadLlegadaValue.trim() !== "") {
    //             if (actividadllegadaId !== 0) {
    //                 this.form.get('actividad')?.setErrors(null);
    //                 this.Error_Actividad = "";
    //             } else {
    //                 this.Error_Actividad = "Opción no encontrada.";
    //                 this.form.get('actividad')?.setErrors({ 'invalidactividadllegadaId': true });

    //             }
    //         } else if (!actividadLlegadaValue || actividadLlegadaValue === "") {
    //             this.Error_Actividad = "El campo es requerido.";
    //             this.form.get('actividad')?.setErrors({ 'invalidactividadllegadaId': true });
    //         }




    //     } else {
    //         let bodegaLlegadaValue = this.form.value.llegada;
    //         let bodegallegadaId = this.bodegas.find(bodega => bodega.bode_Descripcion === bodegaLlegadaValue)?.bode_Id ?? 0;

    //         if (typeof bodegaLlegadaValue === 'string' && bodegaLlegadaValue.trim() !== "") {
    //             if (bodegallegadaId !== 0) {
    //                 this.form.get('llegada')?.setErrors(null);
    //                 this.Error_BodegaLlegada = "";
    //             } else {
    //                 this.Error_BodegaLlegada = "Opción no encontrada.";
    //                 this.form.get('llegada')?.setErrors({ 'invalidBodegallegadaId': true });

    //             }
    //         } else if (!bodegaLlegadaValue || bodegaLlegadaValue === "") {
    //             this.Error_BodegaLlegada = "El campo es requerido.";
    //             this.form.get('llegada')?.setErrors({ 'invalidBodegallegadaId': true });
    //         }
    //     }

    //     const etapa = this.form.get('etapa').value === 0 ? 'Compactación de terreno' : this.form.get('etapa').value;
    //     const actividad = this.form.get('actividad').value === 0 ? 'Colocación de ceramica' : this.form.get('actividad').value;
    //     const etapaActividad = this.form.get('etapaActividad').value === 0 ? 238 : this.form.get('etapaActividad').value;

    //     if (this.form.valid) {
    //         const modeloEncabezado = {
    //             flen_FechaHoraSalida: this.form.get('flen_FechaHoraSalida').value,
    //             flen_FechaHoraEstablecidaDeLlegada: this.form.get('flen_FechaHoraEstablecidaDeLlegada').value,
    //             encargado: this.form.get('encargado').value,
    //             emtr_Id: this.form.get('emtr_Id').value,
    //             supervisorsalida: this.form.get('supervisorsalida').value,
    //             emss_Id: this.form.get('emss_Id').value,
    //             supervisorllegada: this.form.get('supervisorllegada').value,
    //             emsl_Id: this.form.get('emsl_Id').value,
    //             boas_Id: this.form.get('boas_Id').value,
    //             salida: this.form.get('salida').value,
    //             flen_DestinoProyecto: this.form.get('flen_DestinoProyecto').value,
    //             flen_SalidaProyecto: this.form.get('flen_SalidaProyecto').value,
    //             boat_Id: this.form.get('boat_Id').value,
    //             llegada: this.form.get('llegada').value,
    //             etapa: etapa,
    //             actividad: actividad,
    //             etapaActividad: etapaActividad,
    //             etapaSalida: this.form.get('etapaSalida').value,
    //             actividadSalida: this.form.get('actividadSalida').value,
    //             bodegaSalida: this.form.get('bodegaSalida').value,
    //             etapaActividadSalida: this.form.get('etapaActividadSalida').value
    //         };
    //         this.submitted = false;
    //         this.Indexactivo = 1;
    //         if(this.identityFlete === "editar"){

    //         }
    //     } else {
    //         // this.mostrarEstadoFormDetallado();
    //         // this.mostrarErroresFormulario();
    //         //this.form.markAllAsTouched();
    //         this.submitted = true;
    //     }

    //     const navigationState = this.navigationStateService.getState();
    //     if (navigationState && navigationState.flete) {
    //         this.mostrarEquiposSeguridad = false;

    //         this.itemsAdded(navigationState.flete.detalle, 0);
    //     }
    // }





    validarCamposNulos() {

        
        // Asigna null a los campos si están en null o 0
        this.form.patchValue({
            etapa: this.form.get('etapa').value === 0 || this.form.get('etapa').value === null ? null : this.form.get('etapa').value,
            actividad: this.form.get('actividad').value === 0 || this.form.get('actividad').value === null ? null : this.form.get('actividad').value,
            etapaActividad: this.form.get('etapaActividad').value === 0 || this.form.get('etapaActividad').value === null ? null : this.form.get('etapaActividad').value
        });



        // Continuar con la lógica existente...
        if (this.valSwitchSalida) {
            this.form.get('salida').setValidators(Validators.required);
            this.form.get('etapaSalida').setValidators(Validators.required);
            this.form.get('actividadSalida').setValidators(Validators.required);
        } else {
            this.form.get('salida').clearValidators();
            this.form.get('etapaSalida').clearValidators();
            this.form.get('actividadSalida').clearValidators();
        }

        this.form.get('salida').updateValueAndValidity();
        this.form.get('etapaSalida').updateValueAndValidity();
        this.form.get('actividadSalida').updateValueAndValidity();
    }

    limpiarVerificacion() {
        this.verificarForm.reset();
        this.pendientes = [];
        this.verificados = [];
        this.Verificacion = false;
        this.Index = true;

        this.verificarForm.reset();
        this.pendientesInsumos = [];
        this.verificadosInsumos = [];
        this.pendientesEquipos = [];
        this.verificadosEquipos = [];
        this.file = null;
        this.previewImage = null;
        this.previewPDF = null;
        this.IndexactivoVerificacion = 0;
        this.isFirstTab = true;
        this.isSecondTab = false;
    }

    convertToISOFormat(date: Date | string): string {
        if (!date) return null;
        const parsedDate = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(parsedDate.getTime())) {
            return null;
        }
        return parsedDate.toISOString();
    }

    CancelarVerificacion() {
        this.Verificacion = false;
        this.Index = true;
    }

    agregarIncidencia() {
        const incidencias = this.incidenciasForm.get('incidencias') as FormArray;
        incidencias.push(this.fb.control('', Validators.required));
    }

    submitIncidencias() {
        const incidencias = this.incidenciasForm.value.incidencias.map((descripcion: string) => ({
            flcc_DescripcionIncidencia: descripcion,
            flen_Id: this.flete.flen_Id,
            usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
            flcc_FechaHoraIncidencia: new Date()
        }));


        incidencias.forEach((incidencia: any) => {
            this.controlCalidadService.Insertar(incidencia).subscribe(
                (respuesta: Respuesta) => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000, styleClass: 'iziToast-custom' });
                },
                (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al reportar la incidencia.', life: 3000, styleClass: 'iziToast-custom' });
                }
            );
        });

        this.incidenciasDialog = false;
        this.Listado();
    }

    get detalless() {
        return this.verificarForm.get('detalles') as FormArray;
    }

    // DIBUJADOOOOOOOOO
    verificarAccesoCrearFlete() {
        const rolesConAccesoACrearFlete = [4, 3, 7, 6];
        this.puedeCrearFlete = rolesConAccesoACrearFlete.includes(this.usuario.role_Id) || this.usuario.usua_EsAdministrador;
    }

    Listado() {
        this.loading = true;
        this.service.Listar().subscribe(
            (data: any) => {
                if (!this.usuario.usua_EsAdministrador) {
                    data = data.filter((flete: any) =>
                        flete.emtr_Id === this.usuario.empl_Id ||
                        flete.emss_Id === this.usuario.empl_Id ||
                        flete.emsl_Id === this.usuario.empl_Id
                    );
                }

                // Si no hay fletes y el usuario no es administrador
                if (data.length === 0 && !this.usuario.usua_EsAdministrador) {
                    this.fletes = []; // No hay fletes
                    this.loadedTableMessage = "No tiene ningún flete relacionado a su persona.";
                } else {
                    this.fletes = data.map((flete: any) => ({
                        ...flete,
                        flen_FechaCreacion: new Date(flete.flen_FechaCreacion).toLocaleDateString(),
                        flen_FechaModificacion: new Date(flete.flen_FechaModificacion).toLocaleDateString(),
                        flen_FechaHoraEstablecidaDeLlegada: new Date(flete.flen_FechaHoraEstablecidaDeLlegada).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        items: this.getItems(flete)
                    }));
                }

            },
            (error) => {
                this.loading = false;
            },
            () => {
                this.loading = false; // Quitar el loader al finalizar
            }
        );
    }

    getItems(flete: Flete): MenuItem[] {
        const isAdmin = this.usuario.usua_EsAdministrador;
        const usuarioId = this.usuario.empl_Id;
       
        if (isAdmin) {
            return flete.estado === 'Recibido'
                ? this.getAdminActionsForReceivedFlete(flete)
                : this.getAdminActionsForNotReceivedFlete(flete);
        }

        let actions: MenuItem[] = [];

        if (flete.emtr_Id === usuarioId) {
            actions = this.getFullAccessActions(flete);
        } else if (flete.emss_Id === usuarioId) {
            actions = this.getSupervisorSalidaActions(flete);
        } else if (flete.emsl_Id === usuarioId) {
            actions = this.getSupervisorLlegadaActions(flete);
        }

        return actions;
    }

    getFullAccessActions(flete: Flete): MenuItem[] {
        return flete.estado === 'Recibido'
            ? this.getAdminActionsForReceivedFlete(flete)
            : this.getAdminActionsForNotReceivedFlete(flete);
    }

    getSupervisorSalidaActions(flete: Flete): MenuItem[] {
        return [
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: () => {
                    this.detalleFlete(flete);
                }
            },
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                command: () => {
                    this.EditarFlete();
                }
            },
            {
                label: 'Verificación',
                icon: 'pi pi-eye',
                command: () => {
                    this.VerVerificacion(flete);
                }
            }
        ];
    }

    getSupervisorLlegadaActions(flete: Flete): MenuItem[] {
        return [
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: () => {
                    this.detalleFlete(flete);
                }
            },
            {
                label: 'Verificación',
                icon: 'pi pi-eye',
                command: () => {
                    this.VerVerificacion(flete);
                }
            },
            {
                label: 'Verificar',
                icon: 'pi pi-check',
                command: () => {
                    this.Verificar(this.rowactual);
                }
            }
        ];
    }

    getAdminActionsForReceivedFlete(flete: Flete): MenuItem[] {
        return [
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: () => {
                    this.detalleFlete(flete);
                }
            },
            {
                label: 'Verificación',
                icon: 'pi pi-eye',
                command: () => {
                    this.VerVerificacion(flete);
                }
            },

        ];
    }

    getAdminActionsForNotReceivedFlete(flete: Flete): MenuItem[] {
        return [
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: () => {
                    this.detalleFlete(flete);
                }
            },
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                command: () => {
                    this.EditarFlete();
                }
            },
            {
                label: 'Verificar',
                icon: 'pi pi-check',
                command: () => {
                    this.Verificar(this.rowactual);
                }
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: () => {
                    this.EliminarFlete();
                }
            }
        ];
    }

    //FIN DE DIBUJADOOOOOOOOO


    ListadoEmpleados() {
        this.service.ListarEmpleados().subscribe(
            (Empleado: autocompleteEmpleado[]) => {
                this.empleados = Empleado.sort((a, b) => a.empleado.localeCompare(b.empleado));;
            },
            (error) => {
            }
        );
    }

    ListadoBodegas() {
        this.service.ListarBodegas().subscribe((data: Bodega[]) => {
            this.bodegas = data.sort((a, b) => a.bode_Descripcion.localeCompare(b.bode_Descripcion));;
        });
    }

    // ddl de bodega o proyecto y requerimiento ddl de actividad
    applyValidations() {
        // Validación para llegada (flen_DestinoProyecto)
        this.form.get('llegada').setValidators(this.valSwitch ? Validators.required : null);
        this.form.get('etapa').setValidators(this.valSwitch ? Validators.required : null);
        this.form.get('actividad').setValidators(this.valSwitch ? Validators.required : null);
        this.form.get('etapaActividad').setValidators(this.valSwitch ? Validators.required : null);

        // Validación para salida (flen_SalidaProyecto)
        if (this.valSwitchSalida) {
            this.form.get('salida').setValidators(Validators.required);
            this.form.get('etapaSalida').setValidators(Validators.required);
            this.form.get('actividadSalida').setValidators(Validators.required);
            this.form.get('bodegaSalida').clearValidators();
        } else {
            this.form.get('bodegaSalida').setValidators(Validators.required);
            this.form.get('salida').setValidators(Validators.required);
            // this.form.get('salida').clearValidators();
            this.form.get('etapaSalida').clearValidators();
            this.form.get('actividadSalida').clearValidators();
        }

        // Actualiza la validez de todos los campos
        this.form.updateValueAndValidity();
    }

    onSwitchChange(event: any) {
        this.valSwitch = event.checked;

        if (this.valSwitch) {

            this.form.patchValue({ llegada: "" , etapa: "",actividad : "" });
            this.form.get('llegada')?.clearValidators();
            this.form.get('llegada')?.setErrors(null)
            this.form.get('etapa')?.clearValidators();
            this.form.get('etapa')?.setErrors(null)
            this.form.get('actividad')?.clearValidators();
            this.form.get('actividad')?.setErrors(null)

        } else {  
            this.form.patchValue({ llegada: "" });
            this.form.get('llegada')?.clearValidators();
            this.form.get('llegada')?.setErrors(null)
            this.form.get('etapa')?.clearValidators();
            this.form.get('etapa')?.setErrors(null)
            this.form.get('actividad')?.clearValidators();
            this.form.get('actividad')?.setErrors(null)
        }

    }

    onSwitchSalidaChange(event: any) {
        this.valSwitchSalida = event.checked;
        this.onLimpiezaDrags();

        if (this.valSwitchSalida) {  // Salida es true

            this.form.patchValue({ salida: "", etapaSalida: "", actividadSalida: "" });
            this.form.get('salida')?.clearValidators();
            this.form.get('bodegaSalida')?.setErrors(null)
            this.form.get('salida')?.setErrors(null)
            this.form.get('etapaSalida')?.clearValidators();
            this.form.get('etapaSalida')?.setErrors(null)
            this.form.get('actividadSalida')?.clearValidators();
            this.form.get('actividadSalida')?.setErrors(null)
            // this.form.get('salida')?.setValidators(Validators.required);
            // this.form.get('etapaSalida')?.setValidators(Validators.required);
            // this.form.get('actividadSalida')?.setValidators(Validators.required);

            // if (!this.valSwitch) {  // Llegada es false
            //     this.form.get('bodegaSalida')?.clearValidators();
            // }
        } else {  // Salida es false
            // this.form.get('salida')?.clearValidators();
            // this.form.get('etapaSalida')?.clearValidators();
            // this.form.get('actividadSalida')?.clearValidators();
            this.form.patchValue({ salida: "", bodegaSalida: "" });
            this.form.get('bodegaSalida')?.clearValidators();
            this.form.get('bodegaSalida')?.setErrors(null)
            this.form.get('salida')?.clearValidators();
            this.form.get('salida')?.setErrors(null)
            this.form.get('etapaSalida')?.clearValidators();
            this.form.get('etapaSalida')?.setErrors(null);
            this.form.get('actividadSalida')?.clearValidators();
            this.form.get('actividadSalida')?.setErrors(null)
        }
    }

    mostrarEstadoForm() {
        let hayError = false;
        Object.keys(this.form.controls).forEach(key => {
            const control = this.form.get(key);
            const errores = control.errors;
            // Obtenemos los errores del campo
           

            // Verificar si el campo tiene errores
            if (control.invalid) {
                hayError = true;
            }
        });

        // Mensaje adicional si se detecta un error
        if (hayError) {
        } else {
        }
    }

    mostrarErroresFormulario() {
        Object.keys(this.form.controls).forEach(key => {
            const controlErrors = this.form.get(key).errors;
            if (controlErrors != null) {
                Object.keys(controlErrors).forEach(keyError => {
                });
            } else {
            }
        });
    }

    onBoasIdChange() {
        const boasId = this.form.get('boas_Id').value;
        if (boasId) {
            // Asegurar que actividadSalida tenga el mismo valor
            this.form.patchValue({ actividadSalida: boasId });
        }
    }

    ListadoProyectos() {
        this.service.ListarProyectos().subscribe(
            (data: Proyecto[]) => {
                this.proyectos = data.sort((a, b) => a.proy_Nombre.localeCompare(b.proy_Nombre));
            },
            error => {
            }
        );

    }
    //validaciones inputs y fechas
    validarFechas(from: string, to: string) {
        return (group: FormGroup): { [key: string]: any } | null => {
            const fromDate = group.controls[from].value;
            const toDate = group.controls[to].value;

            if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
                return { 'validarFechas': true };
            }
            return null;
        };
    }

    validarBoatId(flen_DestinoProyecto: string, llegada: string, etapaActividad: string, salida: string) {
        return (group: FormGroup): { [key: string]: any } | null => {
            const destinoProyecto = group.controls[flen_DestinoProyecto].value;
            const llegadaValue = group.controls[llegada].value;
            const etapaActividadValue = group.controls[etapaActividad].value;
            const salidaValue = group.controls[salida].value;

            if (destinoProyecto && !etapaActividadValue) {
                return { 'validarBoatId': true };
            } else if (!destinoProyecto && !salidaValue) {
                return { 'validarBoatId': true };
            }
            return null;
        };
    }

    validarEmpleadosDistintos = (group: FormGroup): { [key: string]: any } | null => {

        if (!this) {
            return null;
        }

        const encargado = group.get('encargado');
        const supervisorsalida = group.get('supervisorsalida');
        const supervisorllegada = group.get('supervisorllegada');

        let error = null;

        if (!this.empleados) {
            return null;
        }

        // Lista de empleados para validar
        const empleadosValidos = this.empleados.map(e => e.empleado);

        // Limpia los errores previos
        this.Error_Encargado = "";
        this.Error_SupervisorSalida = "";
        this.Error_SupervisorLLegada = "";

        // Validación de opciones seleccionadas
        if (encargado && encargado.value && !empleadosValidos.includes(encargado.value)) {
            encargado.setErrors({ ...encargado.errors, opcionNoEncontrada: true });
            this.Error_Encargado = "Opción no encontrada.";
            error = true;
        } else if (!encargado.value) {
            this.Error_Encargado = "El campo es requerido.";
            encargado.setErrors({ ...encargado.errors, required: true });
        }

        if (supervisorsalida && supervisorsalida.value && !empleadosValidos.includes(supervisorsalida.value)) {
            supervisorsalida.setErrors({ ...supervisorsalida.errors, opcionNoEncontrada: true });
            this.Error_SupervisorSalida = "Opción no encontrada.";
            error = true;
        } else if (!supervisorsalida.value) {
            this.Error_SupervisorSalida = "El campo es requerido.";
            supervisorsalida.setErrors({ ...supervisorsalida.errors, required: true });
        }

        if (supervisorllegada && supervisorllegada.value && !empleadosValidos.includes(supervisorllegada.value)) {
            supervisorllegada.setErrors({ ...supervisorllegada.errors, opcionNoEncontrada: true });
            this.Error_SupervisorLLegada = "Opción no encontrada.";
            error = true;
        } else if (!supervisorllegada.value) {
            this.Error_SupervisorLLegada = "El campo es requerido.";
            supervisorllegada.setErrors({ ...supervisorllegada.errors, required: true });
        }

        // Valida las igualdades si todos los campos están llenos y no hay errores
        if (!error && encargado.value && supervisorsalida.value && supervisorllegada.value) {
            if (encargado.value === supervisorsalida.value) {
                encargado.setErrors({ ...encargado.errors, encargadoSupervisorsalidaIguales: true });
                supervisorsalida.setErrors({ ...supervisorsalida.errors, encargadoSupervisorsalidaIguales: true });
                this.Error_Encargado = "El encargado no puede ser el mismo que el supervisor de salida.";
                this.Error_SupervisorSalida = "El supervisor de salida no puede ser el mismo que el encargado.";
                error = true;
            }

            if (encargado.value === supervisorllegada.value) {
                encargado.setErrors({ ...encargado.errors, encargadoSupervisorllegadaIguales: true });
                supervisorllegada.setErrors({ ...supervisorllegada.errors, encargadoSupervisorllegadaIguales: true });
                this.Error_Encargado = "El encargado no puede ser el mismo que el supervisor de llegada.";
                this.Error_SupervisorLLegada = "El supervisor de llegada no puede ser el mismo que el encargado.";
                error = true;
            }

            if (supervisorsalida.value === supervisorllegada.value) {
                supervisorsalida.setErrors({ ...supervisorsalida.errors, supervisorsalidaSupervisorllegadaIguales: true });
                supervisorllegada.setErrors({ ...supervisorllegada.errors, supervisorsalidaSupervisorllegadaIguales: true });
                this.Error_SupervisorSalida = "El supervisor de salida no puede ser el mismo que el supervisor de llegada.";
                this.Error_SupervisorLLegada = "El supervisor de llegada no puede ser el mismo que el supervisor de salida.";
                error = true;
            }
        }

        // Limpia los errores si no hay errores
        if (!error) {
            if (encargado && encargado.errors) {
                delete encargado.errors['encargadoSupervisorsalidaIguales'];
                delete encargado.errors['encargadoSupervisorllegadaIguales'];
                delete encargado.errors['opcionNoEncontrada'];
                if (Object.keys(encargado.errors).length === 0) encargado.setErrors(null);
            }

            if (supervisorsalida && supervisorsalida.errors) {
                delete supervisorsalida.errors['encargadoSupervisorsalidaIguales'];
                delete supervisorsalida.errors['supervisorsalidaSupervisorllegadaIguales'];
                delete supervisorsalida.errors['opcionNoEncontrada'];
                if (Object.keys(supervisorsalida.errors).length === 0) supervisorsalida.setErrors(null);
            }

            if (supervisorllegada && supervisorllegada.errors) {
                delete supervisorllegada.errors['encargadoSupervisorllegadaIguales'];
                delete supervisorllegada.errors['supervisorsalidaSupervisorllegadaIguales'];
                delete supervisorllegada.errors['opcionNoEncontrada'];
                if (Object.keys(supervisorllegada.errors).length === 0) supervisorllegada.setErrors(null);
            }
        }

        return error ? { empleadosIguales: true } : null;
    };

    onProyectoSalidaSelect(event: any) {
        const proyectoSeleccionado = this.form.get('salida')?.value;  // Use 'salida' as the control name
        const proyectoSeleccionadoID = proyectoSeleccionado?.proy_Id;

        if (!proyectoSeleccionadoID) {
            this.resetEtapasSalida();
            return;
        }
        this.form.patchValue({
            salida: proyectoSeleccionado.proy_Nombre
        });

        this.ListadoEtapasPorProyectoSalida(proyectoSeleccionadoID)
            .then(() => {
                if (this.filtradoEtapasSalida.length === 0) {
                    this.etapasMessage = "No hay etapas para el proyecto seleccionado";
                } else {
                    this.etapasMessage = "";
                }
            })
            .catch(error => {
                this.filtradoEtapasSalida = [];
                this.etapasMessage = "Error loading stages";
            });
    }

    onProyectoSelect(event: any) {
        const proyectoSeleccionado = this.form.get('llegada')?.value;
        const proyectoSeleccionadoID = proyectoSeleccionado?.proy_Id;

        if (!proyectoSeleccionadoID) {
            this.resetEtapas();
            return;
        }

        this.ListadoEtapasPorProyecto(proyectoSeleccionadoID)
            .then(() => {
                if (this.filtradoEtapas.length === 0) {
                    this.etapasMessage = "No stages available for the selected project";
                } else {
                    this.etapasMessage = "";
                }
            })
            .catch(error => {
                this.filtradoEtapas = [];
                this.etapasMessage = "Error loading stages";
            });
    }

    onEtapaSelect(event: any) {
        const etapaSeleccionada = event.value;

        if (etapaSeleccionada) {
            // Almacena solo el ID de la etapa seleccionada
            this.form.patchValue({
                etapa: etapaSeleccionada.etap_Descripcion
            });

            // Filtrar las actividades basadas en el ID de la etapa seleccionada y almacenar el filtrado original
            this.filtradoActividadesOriginal = this.actividades.filter(actividad => actividad.etpr_Id === etapaSeleccionada.etpr_Id)
                .sort((a, b) => a.acti_Descripcion.localeCompare(b.acti_Descripcion));

            // Asignar las actividades filtradas para la vista actual
            this.filtradoActividades = [...this.filtradoActividadesOriginal];

            if (this.filtradoActividades.length > 0) {
            } else {
            }
        } else {
        }
    }

    filterEmpleado(event: any) {
        const query = event.query.toLowerCase();
        this.filtradoEmpleado = this.empleados.filter((empleado) =>
            empleado.empleado.toLowerCase().includes(query)
        );
    }

    filterBodegas(event: any) {
        this.filtradoBodegas = this.bodegas.filter(bodega =>
            bodega.bode_Descripcion.toLowerCase().includes(event.query.toLowerCase())
        );
    }

    onBodegaLlegadaSelect(event: any) {
        if (this.form.get('flen_DestinoProyecto').value == 0) {
            const llegadaSeleccionada = event;
            this.form.patchValue({
                boat_Id: llegadaSeleccionada.value.bode_Id,
                llegada: llegadaSeleccionada.value.bode_Descripcion,
            });
        } else {
            const llegadaSeleccionada = event;
            this.form.patchValue({
                boat_Id: llegadaSeleccionada.value.proy_Id,
                llegada: llegadaSeleccionada.value.proy_Nombre,
            });
        }
    }
    //filtrado insumos por bodega
    onBodegaSalidaSelect(event: any) {
        const bodegaSeleccionada = event.value;

        if (bodegaSeleccionada && bodegaSeleccionada.bode_Id) {
            // this.itemsGroup2 = [];
            this.itemsGroupEquipos2 = [];
            this.form.patchValue({ boas_Id: bodegaSeleccionada.bode_Id, bodegaSalida: bodegaSeleccionada.bode_Descripcion, salida: bodegaSeleccionada.bode_Descripcion });


            // Filtrar insumos y equipos de seguridad de inmediato
            this.ListadoSuministrosPorBodega(bodegaSeleccionada.bode_Id);
            this.ListadoEquiposPorBodega(bodegaSeleccionada.bode_Id);
        }
    }

    onEncargadoSelect(event: any) {
        const encargadoSeleccionado = event;
        this.form.patchValue({
            emtr_Id: encargadoSeleccionado.value.empl_Id,
            encargado: encargadoSeleccionado.value.empleado,
        });
    }

    onSupervisorSalidaSelect(event: any) {
        const supervisorsalidaSeleccionado = event;
        this.form.patchValue({
            emss_Id: supervisorsalidaSeleccionado.value.empl_Id,
            supervisorsalida: supervisorsalidaSeleccionado.value.empleado,
        });
    }

    onSupervisorLlegadaSelect(event: any) {
        const supervisorllegadaSeleccionado = event;
        this.form.patchValue({
            emsl_Id: supervisorllegadaSeleccionado.value.empl_Id,
            supervisorllegada: supervisorllegadaSeleccionado.value.empleado,
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    CrearFlete() {
        this.Index = false;
        this.CreateEdit = true;
        this.identity = "crear";
        this.Edit = false;
        this.form.reset();
        this.form.patchValue({ flen_DestinoProyecto: false });
        this.form.patchValue({ flen_SalidaProyecto: false });

        this.insumosSeleccionados = []; // Reiniciar insumos seleccionados

        const navigationState = this.navigationStateService.getState();

        if(navigationState && navigationState.flete){

            if(navigationState.flete.fleteType === 1){
                this.valSwitch = true;

                this.form.patchValue({
                    flen_DestinoProyecto: true,

                    bodegaSalida: {bode_Descripcion: navigationState.flete.bode_Descripcion},
                    boas_Id:  navigationState.flete.bode_Id,

                    llegada: navigationState.flete.proyecto,

                    etapa: navigationState.flete.etapaPorProyecto.etap_Descripcion,

                    actividad: navigationState.flete.actividadPorEtapa.acti_Descripcion,
                    etapaActividad: navigationState.flete.actividadPorEtapa.acet_Id,
                    boat_Id: navigationState.flete.actividadPorEtapa.acet_Id,
                })

                this.ListadoSuministrosPorBodega(navigationState.flete.bode_Id);
                this.ListadoEquiposPorBodega(navigationState.flete.bode_Id);

                this.ListadoEtapasPorProyecto(navigationState.flete.proyecto.proy_Id)

                this.filtradoActividadesOriginal = this.actividades.filter(actividad => actividad.etap_Descripcion === navigationState.flete.etapaPorProyecto.etap_Descripcion)
                    .sort((a, b) => a.acti_Descripcion.localeCompare(b.acti_Descripcion));
                this.filtradoActividades = [...this.filtradoActividadesOriginal];
            }else{
                this.valSwitchSalida = true;

                this.form.patchValue({
                    flen_SalidaProyecto: true,
                    actividad: {acti_Descripcion: navigationState.flete.acti_Descripcion, acet_Id: navigationState.flete.acet_Id}
                })
            }
        }
    }

    Cancelar() {
        this.selectedFlete = null;
        this.ngOnInit();
        this.isPdfVisible = false;
        this.isPdfVisibleDetalle = false;
        this.modalEditar = false;
        this.limpiarDragAndDrop();
        this.limpiarDragAndDropEquipos();
        this.limpiarDragAndDropEquiposActividadEtapa();
        this.limpiarDragAndDropInsumosActividadEtapa();
        this.isRegresarVisible = false;
        this.mostrarEquiposSeguridad = false;
        this.CreateEdit = false;
        this.Index = true;
        this.form.reset();
        this.identityFlete = "crear";
        this.tituloFlete = "Nuevo";
        this.valSwitch = false; // Reiniciar el switch
        this.form.patchValue({ flen_DestinoProyecto: false });
        this.insumosSeleccionados = []; // Reiniciar insumos seleccionados
        this.itemsGroup2 = []; // Reiniciar la lista de insumos seleccionados
        this.Indexactivo = 0; // Reiniciar la tab activa
        this.submitted = false;
    }

    setIndexActivo(index: number) {
        this.Indexactivo = index;
    }

    isOutlined(index: number): boolean {
        return this.Indexactivo !== index;
    }

    updateInsumoCantidad(insumo: any) {
        const insumoDisponible = this.insumos.find(item => item.codigo === insumo.codigo);
        if (insumoDisponible) {
            const diferencia = insumo.cantidadSeleccionada - insumo.cantidadPrevia;
            insumoDisponible.bopi_Stock -= diferencia;
            insumo.cantidadPrevia = insumo.cantidadSeleccionada;
        }
    }

    onInsumoCantidadChange(event: any, insumo: any) {
        const nuevaCantidad = event.target.valueAsNumber || 0;
        if (nuevaCantidad >= 0 && nuevaCantidad <= (insumo.cantidadPrevia + insumo.bopi_Stock)) {
            insumo.cantidadSeleccionada = nuevaCantidad;
            this.updateInsumoCantidad(insumo);
        } else {
            event.preventDefault();
        }
    }

    onInsumoSelect(event: any) {
        const insumoSeleccionado = event;
        insumoSeleccionado.cantidadSeleccionada = 0;
        insumoSeleccionado.cantidadPrevia = 0;
        this.insumosSeleccionados.push(insumoSeleccionado);
    }

    insumoAgregado(codigo: string): boolean {
        return this.insumosSeleccionados.some(insumo => insumo.codigo === codigo);
    }

    regresarIndex() {
        this.selectedFlete = null;
        this.ngOnInit();
        const navigationState = this.navigationStateService.getState();

        if(navigationState && navigationState.flete){
            this.router.navigate(['./sigesproc/proyecto/proyecto/etapas'])
        }

        this.incidenciasDialog = false;
        this.DetalleFlete = false;
        this.DetalleVerificacion = false;
        this.Index = true;
        this.IndexIncidencias = false;
        this.showReporte = false;
        this.Verificacion = false;

    }
    // INCIDENCIAAAAAAAAA


    BuscarIncidencias(flete: Flete) {
        this.flete = flete;
        this.fleteIncidenciaId = flete.flen_Id;

        this.controlCalidadService.BuscarIncidencias(flete.flen_Id).subscribe(
            (data: any) => {

                this.incidencias = data.map((incidencia: any) => ({
                    ...incidencia,
                    flcc_FechaCreacion: new Date(incidencia.flcc_FechaCreacion).toLocaleDateString(),
                    flcc_FechaModificacion: new Date(incidencia.flcc_FechaModificacion).toLocaleDateString(),
                    flcc_FechaHoraIncidencia: new Date(incidencia.flcc_FechaHoraIncidencia).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    flen_FechaHoraEstablecidaDeLlegada: new Date(incidencia.flen_FechaHoraEstablecidaDeLlegada).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                }));
                this.IndexIncidencias = true;
                this.Index = false;

                this.actualizarTituloConFecha(flete.flen_FechaHoraSalida);
            },
            (error) => {
            }
        );
    }

    actualizarTituloConFecha(fechaSalida: string) {
        const fecha = new Date(fechaSalida).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        this.titulo = `Incidencias Flete - ${fecha}`;
    }

    getItemsIncidencias(): MenuItem[] {
        return [
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                command: (event: any) => {
                    this.EditarIncidencia();
                },
            },

            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: (event: any) => {
                    this.EliminarIncidencia()
                },
            },
        ];
    }

    CrearIncidencia1(flen_Id: number) {
        const mensajeAlerta = `Se registro una nueva incidencia para en flete N° ${flen_Id}`;
        this.GuardarEnviarAlertas(mensajeAlerta);
        this.Index = false;
        this.IndexIncidencias = false;
        this.createIncidencia = true;
        this.formIncidencias.reset();
        this.identity = "crear";
        this.titulo = `Nueva Incidencia Flete - ${this.formatearFecha(this.flete.flen_FechaHoraSalida)}`;
        this.formIncidencias.patchValue({
            flen_Id: flen_Id
        });
    }

    CrearIncidencia() {
        this.createIncidencia = true;
        this.IndexIncidencias = false;
        this.formIncidencias.reset();
        this.titulo = `Nueva Incidencia Flete - ${this.formatearFecha(this.flete.flen_FechaHoraSalida)}`;
        this.formIncidencias.patchValue({
            flen_Id: this.flete.flen_Id
        });

        // Aplicar la validación personalizada
        this.aplicarValidacionPersonalizada();
    }

    EditarIncidencia() {
        this.Index = false;
        this.IndexIncidencias = false;
        this.createIncidencia = true;
        this.formIncidencias.reset();
        this.identity = "editar";
        this.titulo = `Editar Incidencia ${this.selectedIncidencia.codigo} - ${this.formatearFecha(this.flete.flen_FechaHoraSalida)}`;

        const rawDate = this.selectedIncidencia.flcc_FechaHoraIncidencia;
        const parts = rawDate.split(', ');
        const dateParts = parts[0].split('/');
        const timeParts = parts[1].split(':');

        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timeParts[0]}:${timeParts[1]}:00`;
        const date = new Date(formattedDate);

        this.formIncidencias.patchValue({
            flcc_DescripcionIncidencia: this.selectedIncidencia.flcc_DescripcionIncidencia,
            flcc_FechaHoraIncidencia: date,
            flen_Id: this.selectedIncidencia.flen_Id
        });
        this.idIncidencia = this.selectedIncidencia.flcc_Id;
    }

    formatearFecha(fecha: string): string {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    }

    selectIncidencia(Incidencia: any) {
        this.selectedIncidencia = Incidencia;
    }

    EliminarIncidencia() {
        this.idIncidencia = this.selectedIncidencia.flcc_Id;
        this.deleteIncidencia = true;
    }

    GuardarIncidencia() {
        if (this.formIncidencias.valid) {
            const Incidencia: any = {
                flcc_Id: this.idIncidencia,
                flcc_DescripcionIncidencia: this.formIncidencias.value.flcc_DescripcionIncidencia,
                flcc_FechaHoraIncidencia: this.formIncidencias.value.flcc_FechaHoraIncidencia,
                flen_Id: this.formIncidencias.value.flen_Id,

                // flen_Id: this.fleteIncidenciaId,
                usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
                usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
            };

            if (this.identity != "editar") {
                this.controlCalidadService.Insertar(Incidencia).subscribe(
                    (respuesta: Respuesta) => {
                        if (respuesta.success) {
                            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000, styleClass: 'iziToast-custom' });
                            this.BuscarIncidencias(this.rowactual);
                            this.CerrarIncidencia();
                        } else {
                             this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000, styleClass: 'iziToast-custom' });
                            
                        }
                    }
                );
            } else {
                this.controlCalidadService.Actualizar(Incidencia).subscribe(
                    (respuesta: Respuesta) => {
                        if (respuesta.success) {
                            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000, styleClass: 'iziToast-custom' });

                            this.BuscarIncidencias(this.rowactual);
                            this.CerrarIncidencia();
                        } else {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000, styleClass: 'iziToast-custom' });
                        }
                    }
                );
            }

        } else {
            this.submittedIncidencia = true;
        }
    }

    private aplicarValidacionPersonalizada() {
        const fechaSalida = new Date(this.flete.flen_FechaHoraSalida);
        const fechaLlegada = new Date(this.flete.flen_FechaHoraLlegada);

        this.formIncidencias.controls['flcc_FechaHoraIncidencia'].setValidators([
            Validators.required,
            fechaIncidenciaValida(fechaSalida, fechaLlegada)
        ]);
        this.formIncidencias.controls['flcc_FechaHoraIncidencia'].updateValueAndValidity();
    }

    Eliminar1() {
        this.controlCalidadService.Eliminar(this.idIncidencia).subscribe(
            (respuesta: Respuesta) => {
                if (respuesta.success) {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000, styleClass: 'iziToast-custom' });
                    this.BuscarIncidencias(this.rowactual);
                    this.deleteIncidencia = false;
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000, styleClass: 'iziToast-custom' });
                    this.deleteIncidencia = false;
                }
            }
        );


    }

    ValidarTextoNumeros(event: KeyboardEvent) {
        const inputElement = event.target as HTMLInputElement;
        const key = event.key;
        if (!/^[a-zA-Z\s 0-9]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            event.preventDefault();
        }
        if (key === ' ' && inputElement.selectionStart === 0) {
            event.preventDefault();
        }
    }

    // INCIDENCIAAAAAAAAA

    CerrarIncidencia() {
        this.Index = false;
        this.IndexIncidencias = true;
        this.createIncidencia = false;
        this.incidenciasDialog = false;
        this.formIncidencias.reset();
    }

    ModalVerificarFlete() {
        this.verificarFleteModal = true;
    }

    // VERIFICACCION FLETE
    finalizarVerificacion() {
        if (this.verificarForm.valid) {

            this.verificarFleteModal = false;

            // Verificar si hay un archivo seleccionado antes de proceder
            if (this.file) {
                this.service.SubirDocumento(this.file).then(
                    (fileUrl) => {
                        if (fileUrl) {
                            this.actualizarFlete(fileUrl);  // Llama al método para actualizar el flete con la URL
                        } else {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al subir el archivo.', styleClass: 'iziToast-custom' });
                        }
                    },
                    (error) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al subir el archivo.', styleClass: 'iziToast-custom' });
                    }
                );
            } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar un archivo para continuar.', styleClass: 'iziToast-custom' });
            }
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Formulario no es válido.', styleClass: 'iziToast-custom' });
        }
    }

    // Método para manejar la actualización del flete
    actualizarFlete(comprobanteUrl: string) {
        const supervisorLlegada = this.flete.supervisorllegada ?? "Desconocido";
        const fleteId = this.flete.flen_Id ?? 0;

        const fleteActualizado = {
            flen_Id: this.flete.flen_Id ?? 0,
            flen_FechaHoraSalida: this.convertToISOFormat(this.flete.flen_FechaHoraSalida) ?? this.convertToISOFormat(new Date()),
            flen_FechaHoraEstablecidaDeLlegada: this.convertToISOFormat(this.flete.flen_FechaHoraEstablecidaDeLlegada) ?? this.convertToISOFormat(new Date()),
            flen_FechaHoraLlegada: this.convertToISOFormat(this.verificarForm.get('flen_FechaHoraLlegada').value) ?? this.convertToISOFormat(new Date()),
            flen_Estado: true,
            flen_DestinoProyecto: this.flete.flen_DestinoProyecto ?? false,
            boas_Id: this.flete.boas_Id ?? 0,
            boat_Id: this.flete.boat_Id ?? 0,
            emtr_Id: this.flete.emtr_Id ?? 0,
            emss_Id: this.flete.emss_Id ?? 0,
            emsl_Id: this.flete.emsl_Id ?? 0,
            usua_Creacion: this.flete.usua_Creacion ?? 0,
            flen_FechaCreacion: this.convertToISOFormat(this.flete.flen_FechaCreacion) ?? this.convertToISOFormat(new Date()),
            usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
            flen_FechaModificacion: this.convertToISOFormat(new Date()),
            flen_EstadoFlete: this.flete.flen_EstadoFlete ?? 0,
            flen_ComprobanteLLegada: comprobanteUrl // Asigna la URL del archivo subido
        };

        this.service.Actualizar(fleteActualizado).subscribe(
            (response) => {

                const mensajeAlerta = `Nueva verificacion de llegada: Flete (N°: ${fleteId}) se verificó. Supervisor de llegada: ${supervisorLlegada}`;
                this.GuardarEnviarAlertas(mensajeAlerta);

                this.encabezadoId = this.flete.flen_Id;

                const actualizaciones = [];
                const inserciones = [];
                let hayNoVerificados = false;

                // Procesar insumos verificados y no recibidos
                this.verificadosInsumos.forEach(detalle => {
                    detalle.flde_llegada = true;
                    detalle.usua_Modificacion = parseInt(this.cookieService.get('usua_Id'));
                    actualizaciones.push(this.detalleService.Actualizar(detalle));
                });

                this.pendientesInsumos.forEach(detalle => {
                    if (detalle.flde_Cantidad < this.cantidadesOriginales[detalle.flde_Id]) {
                        const detalleNuevo = { ...detalle, flde_llegada: false, usua_Modificacion: parseInt(this.cookieService.get('usua_Id')) };
                        inserciones.push(
                            this.detalleService.Insertar(detalleNuevo).pipe(
                                switchMap((resp) => {
                                    if (resp.success && resp.data && resp.data.codeStatus) {
                                        const detalleInsertado: FleteDetalle = {
                                            flde_Id: resp.data.codeStatus,
                                            flde_Cantidad: detalleNuevo.flde_Cantidad,
                                            flen_Id: detalleNuevo.flen_Id,
                                            inpp_Id: detalleNuevo.inpp_Id,
                                            usua_Creacion: detalleNuevo.usua_Creacion,
                                            flde_FechaCreacion: detalleNuevo.flde_FechaCreacion,
                                            usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
                                            flde_FechaModificacion: new Date(),
                                            flde_llegada: false,
                                            flde_TipodeCarga: detalleNuevo.flde_TipodeCarga
                                        };
                                        hayNoVerificados = true;
                                        return this.detalleService.Actualizar(detalleInsertado);
                                    } else {
                                        return of(null);
                                    }
                                })
                            )
                        );
                    } else {
                        detalle.flde_llegada = false;
                        detalle.usua_Modificacion = parseInt(this.cookieService.get('usua_Id'));
                        hayNoVerificados = true;
                        actualizaciones.push(this.detalleService.Actualizar(detalle));
                    }
                });

                // Procesar equipos de seguridad verificados y no recibidos
                this.verificadosEquipos.forEach(detalle => {
                    detalle.flde_llegada = true;
                    detalle.usua_Modificacion = parseInt(this.cookieService.get('usua_Id'));
                    actualizaciones.push(this.detalleService.Actualizar(detalle));
                });

                this.pendientesEquipos.forEach(detalle => {
                    if (detalle.flde_Cantidad < this.cantidadesOriginales[detalle.flde_Id]) {
                        const detalleNuevo = { ...detalle, flde_llegada: false, usua_Modificacion: parseInt(this.cookieService.get('usua_Id')) };
                        inserciones.push(
                            this.detalleService.Insertar(detalleNuevo).pipe(
                                switchMap((resp) => {
                                    if (resp.success && resp.data && resp.data.codeStatus) {
                                        const detalleInsertado: FleteDetalle = {
                                            flde_Id: resp.data.codeStatus,
                                            flde_Cantidad: detalleNuevo.flde_Cantidad,
                                            flen_Id: detalleNuevo.flen_Id,
                                            inpp_Id: detalleNuevo.inpp_Id,
                                            usua_Creacion: detalleNuevo.usua_Creacion,
                                            flde_FechaCreacion: detalleNuevo.flde_FechaCreacion,
                                            usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
                                            flde_FechaModificacion: new Date(),
                                            flde_llegada: false,
                                            flde_TipodeCarga: detalleNuevo.flde_TipodeCarga
                                        };
                                        hayNoVerificados = true;
                                        return this.detalleService.Actualizar(detalleInsertado);
                                    } else {
                                        return of(null);
                                    }
                                })
                            )
                        );
                    } else {
                        detalle.flde_llegada = false;
                        detalle.usua_Modificacion = parseInt(this.cookieService.get('usua_Id'));
                        hayNoVerificados = true;
                        actualizaciones.push(this.detalleService.Actualizar(detalle));
                    }
                });

                // Ejecutar todas las inserciones y actualizaciones
                forkJoin([...inserciones, ...actualizaciones]).subscribe(
                    responses => {
                        this.Listado();
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', styleClass: 'iziToast-custom' });
                        this.clearFileForm();
                        this.mostrarVerificacionEquipos = false;
                        this.limpiarVerificacion();
                        if (hayNoVerificados) {
                            this.CrearIncidencia1(this.encabezadoId);
                        }
                    },
                    error => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al insertar o actualizar detalles.', styleClass: 'iziToast-custom' });
                    }
                );
            },
            (error: HttpErrorResponse) => {
                if (error.error.errors) {
                } else {
                }
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el flete.', styleClass: 'iziToast-custom' });
            }
        );
    }

    Verificar(flete: Flete) {
        this.flete = flete;
        this.detalleService.Buscar(flete.flen_Id).subscribe(
            (data: FleteDetalle[]) => {
                // Filtrar y separar los insumos y equipos de seguridad
                this.pendientesInsumos = data.filter(det => det.flde_TipodeCarga === true && !det.verificado);
                this.verificadosInsumos = data.filter(det => det.flde_TipodeCarga === true && det.verificado);
                this.pendientesEquipos = data.filter(det => det.flde_TipodeCarga === false && !det.verificado);
                this.verificadosEquipos = data.filter(det => det.flde_TipodeCarga === false && det.verificado);

                // Mantener las cantidades originales
                data.forEach(detalle => {
                    this.cantidadesOriginales[detalle.flde_Id] = detalle.flde_Cantidad;
                });

                this.actualizarFormulario(); // Cargar los datos iniciales en el formulario
                this.Verificacion = true;
                this.Index = false;
            },
            (error) => {
            }
        );
    }

    toggleSelectAllPendientes(checked: boolean) {
        if (this.mostrarVerificacionEquipos) {
            if (checked) {
                this.pendientesEquipos.forEach((equipo, index) => {
                    equipo.verificado = true;
                    this.verificadosEquipos.push({ ...equipo, flde_Cantidad: this.cantidadesOriginales[equipo.flde_Id] });
                });
                this.pendientesEquipos = [];
            } else {
                this.verificadosEquipos.forEach(equipo => {
                    equipo.verificado = false;
                    const cantidadOriginal = this.cantidadesOriginales[equipo.flde_Id];
                    this.pendientesEquipos.push({ ...equipo, flde_Cantidad: cantidadOriginal });
                });
                this.verificadosEquipos = [];
            }
        } else {
            if (checked) {
                this.pendientesInsumos.forEach((insumo, index) => {
                    insumo.verificado = true;
                    this.verificadosInsumos.push({ ...insumo, flde_Cantidad: this.cantidadesOriginales[insumo.flde_Id] });
                });
                this.pendientesInsumos = [];
            } else {
                this.verificadosInsumos.forEach(insumo => {
                    insumo.verificado = false;
                    const cantidadOriginal = this.cantidadesOriginales[insumo.flde_Id];
                    this.pendientesInsumos.push({ ...insumo, flde_Cantidad: cantidadOriginal });
                });
                this.verificadosInsumos = [];
            }
        }

        this.actualizarFormulario(); // Refrescar el formulario sin recargar datos
        this.triggearActualizacion(); // Mantener la vista actualizada
    }

    onCheckboxClick(detalle: FleteDetalle, index: number, tipo: 'insumo' | 'equipo') {
        // Evitar que el checkbox cambie su estado visual
        event.preventDefault();
        
        if (tipo === 'insumo') {
            const existeInsumo = this.verificadosInsumos.some(insumo => insumo.flde_Id === detalle.flde_Id);
            if (!existeInsumo) {
                // Mover el insumo a la tabla de verificados con la cantidad completa
                this.verificadosInsumos.push({ 
                    ...detalle, 
                    flde_Cantidad: this.cantidadesOriginales[detalle.flde_Id] 
                });
                // Remover el insumo de la lista de pendientes
                this.pendientesInsumos.splice(index, 1);
            }
        } else if (tipo === 'equipo') {
            const existeEquipo = this.verificadosEquipos.some(equipo => equipo.flde_Id === detalle.flde_Id);
            if (!existeEquipo) {
                // Mover el equipo a la tabla de verificados con la cantidad completa
                this.verificadosEquipos.push({ 
                    ...detalle, 
                    flde_Cantidad: this.cantidadesOriginales[detalle.flde_Id] 
                });
                // Remover el equipo de la lista de pendientes
                this.pendientesEquipos.splice(index, 1);
            }
        }
    
        // Refrescar el formulario y la vista
        this.actualizarFormulario();
        this.triggearActualizacion();
    }
    

    onCheckboxChange(event: any, detalle: FleteDetalle, index: number) {
        detalle.verificado = event.checked;
    
        // Validar si el item ya existe en la lista de verificados
        if (detalle.verificado) {
            if (detalle.flde_TipodeCarga === true) {  // Insumos
                const existeInsumo = this.verificadosInsumos.some(insumo => insumo.flde_Id === detalle.flde_Id);
                if (!existeInsumo) {
                    this.verificadosInsumos.push({ ...detalle, flde_Cantidad: this.cantidadesOriginales[detalle.flde_Id] });
                    this.pendientesInsumos.splice(index, 1);
                }
            } else {  // Equipos de seguridad
                const existeEquipo = this.verificadosEquipos.some(equipo => equipo.flde_Id === detalle.flde_Id);
                if (!existeEquipo) {
                    this.verificadosEquipos.push({ ...detalle, flde_Cantidad: this.cantidadesOriginales[detalle.flde_Id] });
                    this.pendientesEquipos.splice(index, 1);
                }
            }
        } else {
            this.revertirInsumo(detalle, index);
        }
    
        this.actualizarFormulario(); // Refrescar el formulario sin recargar datos
        this.triggearActualizacion(); // Mantener la vista actualizada
    }
    

    actualizarFormulario() {
        const detallesInsumosArray = this.pendientesInsumos.map(det => this.fb.group({
            insu_Descripcion: [det.insu_Descripcion],
            unme_Nombre: [det.unme_Nombre],
            bode_Descripcion: [det.bode_Descripcion],
            flde_Cantidad: [det.flde_Cantidad, Validators.required],
            verificado: [det.verificado]
        }));

        const verificadosInsumosArray = this.verificadosInsumos.map(det => this.fb.group({
            insu_Descripcion: [det.insu_Descripcion],
            unme_Nombre: [det.unme_Nombre],
            bode_Descripcion: [det.bode_Descripcion],
            flde_Cantidad: [det.flde_Cantidad, Validators.required],
            verificado: [det.verificado]
        }));

        const detallesEquiposArray = this.pendientesEquipos.map(det => this.fb.group({
            equs_Descripcion: [det.equs_Descripcion],
            unme_Nombre: [det.unme_Nombre],
            bode_Descripcion: [det.bode_Descripcion],
            flde_Cantidad: [det.flde_Cantidad, Validators.required],
            verificado: [det.verificado]
        }));

        const verificadosEquiposArray = this.verificadosEquipos.map(det => this.fb.group({
            equs_Descripcion: [det.equs_Descripcion],
            unme_Nombre: [det.unme_Nombre],
            bode_Descripcion: [det.bode_Descripcion],
            flde_Cantidad: [det.flde_Cantidad, Validators.required],
            verificado: [det.verificado]
        }));

        this.updateFormArray('pendientesInsumos', this.pendientesInsumos);
        this.updateFormArray('verificadosInsumos', this.verificadosInsumos);
        this.updateFormArray('pendientesEquipos', this.pendientesEquipos);
        this.updateFormArray('verificadosEquipos', this.verificadosEquipos);
    }

    updateFormArray(controlName: string, data: FleteDetalle[]) {
        const formArray = this.fb.array(
            data.map(det => this.fb.group({
                insu_Descripcion: [det.insu_Descripcion],
                equs_Descripcion: [det.equs_Descripcion],
                unme_Nombre: [det.unme_Nombre],
                bode_Descripcion: [det.bode_Descripcion],
                flde_Cantidad: [det.flde_Cantidad, Validators.required],
                verificado: [det.verificado]
            }))
        );
        this.verificarForm.setControl(controlName, formArray);
    }

    triggearActualizacion() {
        this.verificadosInsumos = [...this.verificadosInsumos];
        this.pendientesInsumos = [...this.pendientesInsumos];
        this.verificadosEquipos = [...this.verificadosEquipos];
        this.pendientesEquipos = [...this.pendientesEquipos];
        this.actualizarFormulario();
        this.cdRef.detectChanges();
    }

    toggleSelectAllVerificados(checked: boolean) {
        if (this.mostrarVerificacionEquipos) {
            if (checked) {
                // No hacer nada, ya que todos están verificados.
            } else {
                this.verificadosEquipos.forEach(equipo => {
                    equipo.verificado = false;
                    const cantidadOriginal = this.cantidadesOriginales[equipo.flde_Id];
                    this.pendientesEquipos.push({ ...equipo, flde_Cantidad: cantidadOriginal });
                });
                this.verificadosEquipos = [];
                this.showSelectAllPendientes = true;
                this.showSelectAllVerificados = false;
            }
        } else {
            if (checked) {
                // No hacer nada, ya que todos están verificados.
            } else {
                this.verificadosInsumos.forEach(insumo => {
                    insumo.verificado = false;
                    const cantidadOriginal = this.cantidadesOriginales[insumo.flde_Id];
                    this.pendientesInsumos.push({ ...insumo, flde_Cantidad: cantidadOriginal });
                });
                this.verificadosInsumos = [];
                this.showSelectAllPendientes = true;
                this.showSelectAllVerificados = false;
            }
        }

        this.actualizarFormulario(); // Refrescar el formulario sin recargar datos
        this.triggearActualizacion(); // Mantener la vista actualizada
    }

    onToggleVerificacionView() {
        this.cdRef.detectChanges(); // Solo refrescar la vista sin recargar datos
    }

    selectAllPendientes() {
        // Recorre cada insumo en la lista de pendientes
        this.pendientes.forEach((insumo, index) => {
            insumo.verificado = true; // Marca como verificado

            // Mueve el insumo a la lista de verificados
            this.verificados.push({ ...insumo, flde_Cantidad: this.cantidadesOriginales[insumo.flde_Id] });
        });

        // Limpia la lista de pendientes
        this.pendientes = [];

        // Actualiza el formulario
        this.actualizarFormulario();
        this.triggearActualizacion(); // Si tienes una función para manejar cambios adicionales
    }

    //Regreso de isnumo a apartado de pendientes
    revertirInsumo(insumo: FleteDetalle, index: number) {
        const cantidadOriginal = this.cantidadesOriginales[insumo.flde_Id];
        this.verificadosInsumos = this.verificadosInsumos.filter(v => v.flde_Id !== insumo.flde_Id);

        let pendienteExistente = this.pendientesInsumos.find(p => p.flde_Id === insumo.flde_Id);
        if (pendienteExistente) {
            pendienteExistente.flde_Cantidad = cantidadOriginal;
        } else {
            const nuevoPendiente = { ...insumo, flde_Cantidad: cantidadOriginal, verificado: false };
            this.pendientesInsumos.push(nuevoPendiente);
        }

        this.actualizarFormulario();
        this.triggearActualizacion();
    }

    revertirEquipo(equipo: FleteDetalle, index: number) {
        const cantidadOriginal = this.cantidadesOriginales[equipo.flde_Id];
        this.verificadosEquipos = this.verificadosEquipos.filter(v => v.flde_Id !== equipo.flde_Id);

        let pendienteExistente = this.pendientesEquipos.find(p => p.flde_Id === equipo.flde_Id);
        if (pendienteExistente) {
            pendienteExistente.flde_Cantidad = cantidadOriginal;
        } else {
            const nuevoPendiente = { ...equipo, flde_Cantidad: cantidadOriginal, verificado: false };
            this.pendientesEquipos.push(nuevoPendiente);
        }

        this.actualizarFormulario();
        this.triggearActualizacion();
    }

    VerVerificacion(flete: Flete) {
        this.flete = flete;
        this.detalleService.Listar(flete.flen_Id).subscribe(
            (data: FleteDetalle[]) => {
                this.fleteDetalles = data;

                // Filtrar insumos y equipos de seguridad
                this.verificadosInsumos = data.filter(det => det.flde_TipodeCarga === true && det.flde_llegada);
                this.noVerificadosInsumos = data.filter(det => det.flde_TipodeCarga === true && !det.flde_llegada);
                this.verificadosEquipos = data.filter(det => det.flde_TipodeCarga === false && det.flde_llegada);
                this.noVerificadosEquipos = data.filter(det => det.flde_TipodeCarga === false && !det.flde_llegada);

                // Obtener incidencias
                this.controlCalidadService.BuscarIncidencias(flete.flen_Id).subscribe(
                    (respuesta: any) => {
                        this.incidencias = Array.isArray(respuesta) ? respuesta : [respuesta];
                        this.DetalleVerificacion = true;
                        this.Index = false;
                    },
                    (error) => {

                        this.DetalleVerificacion = true;
                        this.Index = false;
                    }
                );
            },
            (error) => {


            }
        );
    }

    onCantidadVerificacionChange(nuevaCantidad: number, detalle: FleteDetalle, index: number) {
        const cantidadOriginal = this.cantidadesOriginales[detalle.flde_Id];

        if (nuevaCantidad < 0 || nuevaCantidad > cantidadOriginal) {
            detalle.cantidadError = `Cantidad inválida. Debe ser entre 0 y ${cantidadOriginal}`;
        } else {
            detalle.cantidadError = '';
            detalle.flde_Cantidad = nuevaCantidad;
            this.actualizarPendientesVerificados(detalle, nuevaCantidad, cantidadOriginal);
            this.triggearActualizacion();
        }
    }

    actualizarPendientesVerificados(detalle: FleteDetalle, nuevaCantidad: number, cantidadOriginal: number) {
        if (detalle.flde_TipodeCarga === true) { // Insumo
            const pendienteIndex = this.pendientesInsumos.findIndex(p => p.flde_Id === detalle.flde_Id);
            if (pendienteIndex > -1) {
                if (nuevaCantidad < cantidadOriginal) {
                    this.pendientesInsumos[pendienteIndex].flde_Cantidad = cantidadOriginal - nuevaCantidad;
                } else {
                    this.pendientesInsumos.splice(pendienteIndex, 1);
                }
            } else {
                this.pendientesInsumos.push({ ...detalle, flde_Cantidad: cantidadOriginal - nuevaCantidad, verificado: false });
            }
            this.verificadosInsumos = this.verificadosInsumos.map(v => v.flde_Id === detalle.flde_Id ? detalle : v);
        } else { // Equipo de Seguridad
            const pendienteIndex = this.pendientesEquipos.findIndex(p => p.flde_Id === detalle.flde_Id);
            if (pendienteIndex > -1) {
                if (nuevaCantidad < cantidadOriginal) {
                    this.pendientesEquipos[pendienteIndex].flde_Cantidad = cantidadOriginal - nuevaCantidad;
                } else {
                    this.pendientesEquipos.splice(pendienteIndex, 1);
                }
            } else {
                this.pendientesEquipos.push({ ...detalle, flde_Cantidad: cantidadOriginal - nuevaCantidad, verificado: false });
            }
            this.verificadosEquipos = this.verificadosEquipos.map(v => v.flde_Id === detalle.flde_Id ? detalle : v);
        }

        this.actualizarFormulario();
    }

    syncCheckboxes() {
        // Si el checkbox de Insumos No Recibidos está marcado, marca también el de Insumos Verificados
        if (this.showSelectAllPendientes === false) {
            this.showSelectAllVerificados = true;
        }
    }

    // Función para editar un flete
    EditarFlete() {
        this.Index = false;
        this.CreateEdit = true;
        this.identityFlete = "editar";
        this.tituloFlete = "Editar";

        const rawDate3 = this.selectedFlete.flen_FechaHoraEstablecidaDeLlegada;
        const parts3 = rawDate3.split(', ');
        const dateParts3 = parts3[0].split('/');
        const timeParts3 = parts3[1].split(':');
        const formattedDate3 = `${dateParts3[2]}-${dateParts3[1]}-${dateParts3[0]}T${timeParts3[0]}:${timeParts3[1]}:00`;
        const date3 = new Date(formattedDate3);

        const date = new Date(this.selectedFlete.flen_FechaHoraSalida);
        this.form.patchValue({
            flen_FechaHoraSalida: date,
            flen_FechaHoraLlegada: this.selectedFlete.flen_FechaHoraLlegada,
            flen_FechaHoraEstablecidaDeLlegada: date3,
            encargado: this.selectedFlete.encargado, // We display the current value
            emtr_Id: this.selectedFlete.emtr_Id,
            supervisorsalida: this.selectedFlete.supervisorsalida,
            emss_Id: this.selectedFlete.emss_Id,
            supervisorllegada: this.selectedFlete.supervisorllegada,
            emsl_Id: this.selectedFlete.emsl_Id,
            boas_Id: this.selectedFlete.boas_Id,
            bodegaSalida: this.selectedFlete.salida,
            salida: this.selectedFlete.salida,
            boat_Id: this.selectedFlete.boat_Id,
            llegada: this.selectedFlete.destino,
            etapa: this.selectedFlete.etap_Descripcion,
            actividad: this.selectedFlete.acti_Descripcion,
            etapaActividad: this.obtenerEtapaActividadId(this.selectedFlete.etap_Descripcion, this.selectedFlete.acti_Descripcion),
            etapaSalida: this.selectedFlete.etap_Descripcion1,
            actividadSalida: this.selectedFlete.acti_Descripcion1,
            etapaActividadSalida: this.obtenerEtapaActividadSalidaId(this.selectedFlete.etap_Descripcion1, this.selectedFlete.acti_Descripcion1),


            //extrassss
        });



        
        this.form.patchValue({
            flen_DestinoProyecto: this.selectedFlete.flen_DestinoProyecto,
            boat_Id: this.selectedFlete.boat_Id
        });
        this.valSwitchSalida = this.selectedFlete.flen_SalidaProyecto;
        this.valSwitch = this.selectedFlete.flen_DestinoProyecto;

        this.idFlete = this.selectedFlete.flen_Id;

        if (this.selectedFlete.flen_SalidaProyecto) {
            // Si es un proyecto de destino
            const acet_Id = this.obtenerEtapaActividadSalidaId(this.selectedFlete.etap_Descripcion1, this.selectedFlete.acti_Descripcion1);
            this.ListadoInsumosPorActividadEtapa(acet_Id);
            this.ListadoEquiposPorActividadEtapa(acet_Id);

            this.detalleService.Buscar(this.idFlete).subscribe(
                (data: FleteDetalle[]) => {
                    // Filtrar IDs de insumos seleccionados por actividad y etapa
                    const selectedInsumosIds = data.filter(detalle => detalle.flde_TipodeCarga).map(detalle => detalle.inpp_Id);

                    // Asignar los insumos seleccionados al grupo 2 por actividad y etapa
                    this.itemsGroupInsumosActividadEtapa2 = data
                        .filter(detalle => detalle.flde_TipodeCarga)
                        .map(detalle => ({
                            flde_Id: detalle.flde_Id,
                            inpp_Id: detalle.inpp_Id,
                            insu_Descripcion: detalle.insu_Descripcion,
                            unme_Nombre: detalle.unme_Nombre,
                            mate_Descripcion: detalle.mate_Descripcion,
                            bopi_Stock: detalle.bopi_Stock,
                            cantidad: detalle.flde_Cantidad,
                            cantidadError: '',
                            inpp_FechaCreacion: new Date(),
                            stockRestante: detalle.flde_Cantidad,
                            usua_Creacion: detalle.usua_Creacion,
                            inputDisabled: false
                        })) as InsumoPorProveedorExtendido[];

                    // Filtrar los insumos disponibles para que no incluyan los seleccionados por actividad y etapa
                    this.itemsGroupInsumosActividadEtapa1 = this.itemsGroupInsumosActividadEtapa1.filter(insumo => !selectedInsumosIds.includes(insumo.inpp_Id));

                    // Filtrar IDs de equipos de seguridad seleccionados por actividad y etapa
                    const selectedEquiposIds = data.filter(detalle => !detalle.flde_TipodeCarga && detalle.eqpp_Id !== undefined).map(detalle => detalle.eqpp_Id);

                    // Asignar los equipos de seguridad seleccionados al grupo 2 por actividad y etapa
                    this.itemsGroupEquiposActividadEtapa2 = data
                        .filter(detalle => !detalle.flde_TipodeCarga)
                        .map(detalle => ({
                            flde_Id: detalle.flde_Id,
                            eqpp_Id: detalle.eqpp_Id,
                            equs_Descripcion: detalle.equs_Descripcion,
                            unme_Nombre: detalle.unme_Nombre,
                            mate_Descripcion: detalle.mate_Descripcion,
                            bopi_Stock: detalle.bopi_Stock,
                            cantidad: detalle.flde_Cantidad,
                            cantidadError: '',
                            eqpp_FechaCreacion: new Date(),
                            stockRestante: detalle.flde_Cantidad,
                            usua_Creacion: detalle.usua_Creacion,
                            inputDisabled: false
                        })) as EquipoPorProveedorExtendido[];

                    // Filtrar los equipos de seguridad disponibles para que no incluyan los seleccionados por actividad y etapa
                    this.itemsGroupEquiposActividadEtapa1 = this.itemsGroupEquiposActividadEtapa1.filter(equipo => !selectedEquiposIds.includes(equipo.eqpp_Id));

                    this.selectedDetalles = data;
                },
                (error) => {
                    console.error('', error);
                }
            );
        } else {
            // Si no es un proyecto de destino
            if (this.selectedFlete.boas_Id) {
                this.ListadoSuministrosPorBodega(this.selectedFlete.boas_Id);
                this.ListadoEquiposPorBodega(this.selectedFlete.boas_Id);

                this.detalleService.Buscar(this.idFlete).subscribe(
                    (data: FleteDetalle[]) => {
                        // Filtrar IDs de insumos seleccionados por bodega
                        const selectedInsumosIds = data.filter(detalle => detalle.flde_TipodeCarga).map(detalle => detalle.inpp_Id);

                        // Asignar los insumos seleccionados al grupo 2 por bodega
                        this.itemsGroup2 = data
                            .filter(detalle => detalle.flde_TipodeCarga)
                            .map(detalle => ({
                                flde_Id: detalle.flde_Id,
                                inpp_Id: detalle.inpp_Id,
                                insu_Descripcion: detalle.insu_Descripcion,
                                unme_Nombre: detalle.unme_Nombre,
                                mate_Descripcion: detalle.mate_Descripcion,
                                bopi_Stock: detalle.bopi_Stock,
                                cantidad: detalle.flde_Cantidad,
                                cantidadError: '',
                                inpp_FechaCreacion: new Date(),
                                stockRestante: detalle.flde_Cantidad,
                                stockRealInicial: detalle.bopi_Stock + detalle.flde_Cantidad,
                                usua_Creacion: detalle.usua_Creacion,
                                inputDisabled: false
                            })) as InsumoPorProveedorExtendido[];

                        // Filtrar los insumos disponibles para que no incluyan los seleccionados por bodega
                        this.itemsGroup1 = this.itemsGroup1.filter(insumo => !selectedInsumosIds.includes(insumo.inpp_Id));

                        // Filtrar IDs de equipos de seguridad seleccionados por bodega
                        const selectedEquiposIds = data.filter(detalle => !detalle.flde_TipodeCarga && detalle.eqpp_Id !== undefined).map(detalle => detalle.eqpp_Id);

                        // Asignar los equipos de seguridad seleccionados al grupo 2 por bodega
                        this.itemsGroupEquipos2 = data
                            .filter(detalle => !detalle.flde_TipodeCarga)
                            .map(detalle => ({
                                flde_Id: detalle.flde_Id,
                                eqpp_Id: detalle.eqpp_Id,
                                equs_Descripcion: detalle.equs_Descripcion,
                                unme_Nombre: detalle.unme_Nombre,
                                mate_Descripcion: detalle.mate_Descripcion,
                                bopi_Stock: detalle.bopi_Stock,
                                cantidad: detalle.flde_Cantidad,
                                cantidadError: '',
                                eqpp_FechaCreacion: new Date(),
                                stockRestante: detalle.flde_Cantidad,
                                stockRealInicial: detalle.bopi_Stock + detalle.flde_Cantidad,
                                usua_Creacion: detalle.usua_Creacion,
                                inputDisabled: false
                            })) as EquipoPorProveedorExtendido[];

                        // Filtrar los equipos de seguridad disponibles para que no incluyan los seleccionados por bodega
                        this.itemsGroupEquipos1 = this.itemsGroupEquipos1.filter(equipo => !selectedEquiposIds.includes(equipo.eqpp_Id));

                        this.selectedDetalles = data;
                    },
                    (error) => {
                        console.error('');
                    }
                );
            }
        }
    }

    llenarDragsActividadEtapa(data: FleteDetalle[]) {
        // Filtrar y llenar insumos por actividad y etapa
        const selectedInsumosIds = data.filter(detalle => detalle.flde_TipodeCarga).map(detalle => detalle.inpp_Id);
        this.itemsGroupInsumosActividadEtapa2 = data.filter(detalle => detalle.flde_TipodeCarga).map(detalle => ({
            flde_Id: detalle.flde_Id,
            inpp_Id: detalle.inpp_Id,
            insu_Descripcion: detalle.insu_Descripcion,
            unme_Nombre: detalle.unme_Nombre,
            mate_Descripcion: detalle.mate_Descripcion,
            bopi_Stock: detalle.bopi_Stock,
            cantidad: detalle.flde_Cantidad,
            cantidadError: '',
            inputDisabled: false,
            usua_Creacion: detalle.usua_Creacion,
            inpp_FechaCreacion: detalle.flde_FechaCreacion,
            stockRestante: detalle.bopi_Stock! - detalle.flde_Cantidad
        })) as InsumoPorProveedorExtendido[];

        this.itemsGroupInsumosActividadEtapa1 = this.itemsGroupInsumosActividadEtapa1.filter(insumo => !selectedInsumosIds.includes(insumo.inpp_Id));

        // Filtrar y llenar equipos de seguridad por actividad y etapa
        const selectedEquiposIds = data.filter(detalle => !detalle.flde_TipodeCarga && detalle.eqpp_Id !== undefined).map(detalle => detalle.eqpp_Id);
        this.itemsGroupEquiposActividadEtapa2 = data.filter(detalle => !detalle.flde_TipodeCarga).map(detalle => ({
            flde_Id: detalle.flde_Id,
            eqpp_Id: detalle.eqpp_Id,
            equs_Descripcion: detalle.equs_Descripcion,
            unme_Nombre: detalle.unme_Nombre,
            mate_Descripcion: detalle.mate_Descripcion,
            bopi_Stock: detalle.bopi_Stock,
            cantidad: detalle.flde_Cantidad,
            cantidadError: '',
            inputDisabled: false,
            usua_Creacion: detalle.usua_Creacion,
            eqpp_FechaCreacion: detalle.flde_FechaCreacion,
            stockRestante: detalle.bopi_Stock! - detalle.flde_Cantidad
        })) as EquipoPorProveedorExtendido[];

        this.itemsGroupEquiposActividadEtapa1 = this.itemsGroupEquiposActividadEtapa1.filter(equipo => !selectedEquiposIds.includes(equipo.eqpp_Id));
    }

    llenarDragsBodega(data: FleteDetalle[]) {
        // Filtrar y llenar insumos por bodega
        const selectedInsumosIds = data.filter(detalle => detalle.flde_TipodeCarga).map(detalle => detalle.inpp_Id);
        this.itemsGroup2 = data.filter(detalle => detalle.flde_TipodeCarga).map(detalle => ({
            flde_Id: detalle.flde_Id,
            inpp_Id: detalle.inpp_Id,
            insu_Descripcion: detalle.insu_Descripcion,
            unme_Nombre: detalle.unme_Nombre,
            mate_Descripcion: detalle.mate_Descripcion,
            bopi_Stock: detalle.bopi_Stock,
            cantidad: detalle.flde_Cantidad,
            cantidadError: '',
            inputDisabled: false,
            usua_Creacion: detalle.usua_Creacion,
            inpp_FechaCreacion: detalle.flde_FechaCreacion,
            stockRestante: detalle.bopi_Stock! - detalle.flde_Cantidad
        })) as InsumoPorProveedorExtendido[];

        this.itemsGroup1 = this.itemsGroup1.filter(insumo => !selectedInsumosIds.includes(insumo.inpp_Id));

        // Filtrar y llenar equipos de seguridad por bodega
        const selectedEquiposIds = data.filter(detalle => !detalle.flde_TipodeCarga && detalle.eqpp_Id !== undefined).map(detalle => detalle.eqpp_Id);
        this.itemsGroupEquipos2 = data.filter(detalle => !detalle.flde_TipodeCarga).map(detalle => ({
            flde_Id: detalle.flde_Id,
            eqpp_Id: detalle.eqpp_Id,
            equs_Descripcion: detalle.equs_Descripcion,
            unme_Nombre: detalle.unme_Nombre,
            mate_Descripcion: detalle.mate_Descripcion,
            bopi_Stock: detalle.bopi_Stock,
            cantidad: detalle.flde_Cantidad,
            cantidadError: '',
            inputDisabled: false,
            usua_Creacion: detalle.usua_Creacion,
            eqpp_FechaCreacion: detalle.flde_FechaCreacion,
            stockRestante: detalle.bopi_Stock! - detalle.flde_Cantidad
        })) as EquipoPorProveedorExtendido[];

        this.itemsGroupEquipos1 = this.itemsGroupEquipos1.filter(equipo => !selectedEquiposIds.includes(equipo.eqpp_Id));
    }

    finalizar() {
        this.submitted = true;

        let valid = true;

        this.itemsGroup2.forEach((item: InsumoPorProveedorExtendido) => {
            if (item.cantidadError) {
                valid = false;
            }
        });
    
        // Verificar errores en itemsGroupInsumosActividadEtapa2
        this.itemsGroupInsumosActividadEtapa2.forEach((item: InsumoPorProveedorExtendido) => {
            if (item.cantidadError) {
                valid = false;
            }
        });

        if (this.valSwitch) {
            this.form.get('etapaActividad').setValidators(Validators.required);
            this.form.get('llegada').setValidators(Validators.required);
        } else {
            this.form.get('etapaActividad').clearValidators();
            this.form.get('llegada').setValidators(Validators.required);
        }
        this.form.get('etapaActividad').updateValueAndValidity();
        this.form.get('llegada').updateValueAndValidity();

        this.itemsGroup2.forEach((insumo: InsumoPorProveedorExtendido) => {
            if (insumo.cantidad < 1 || insumo.cantidad > insumo.bopi_Stock && this.identityFlete === 'crear') {
                valid = false;
                insumo.cantidadError = 'Cantidad inválida. Debe ser mayor que 0 y menor o igual que el stock.';
            }
        });

        const noItemsSelected =
            this.itemsGroup2.length === 0 && // Insumos por bodega
            this.itemsGroupEquipos2.length === 0 && // Equipos de seguridad por bodega
            this.itemsGroupInsumosActividadEtapa2.length === 0 && // Insumos por actividad y etapa
            this.itemsGroupEquiposActividadEtapa2.length === 0; // Equipos de seguridad por actividad y etapa

        if (noItemsSelected) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Debe seleccionar al menos un insumo o equipo de seguridad para continuar.',
                life: 3000,
                styleClass: 'iziToast-custom'
            });
            return; // Detener el proceso si no hay nada seleccionado
        }

        if (!valid) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Corrige las cantidades inválidas antes de enviar el formulario.', styleClass: 'iziToast-custom' });
            return;
        }

        if (this.form.valid) {
            if (this.identityFlete === 'editar') {
                this.procesarGuardar();
                this.EliminarDetallesDeFlete(this.selectedFlete.flen_Id)
                    .then(() => this.insertarDetalles(this.selectedFlete.flen_Id))
                    .then(() => this.insertarEquipos(this.selectedFlete.flen_Id))
                    .then(() => this.insertarInsumosActividadEtapa(this.selectedFlete.flen_Id))
                    .then(() => this.insertarEquiposActividadEtapa(this.selectedFlete.flen_Id))
                    .then(() => {
                        this.onSuccessFinalizar(this.selectedFlete.flen_Id);
                    })
                    .catch(error => {


                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al actualizar los detalles.', life: 3000, styleClass: 'iziToast-custom' });
                    });
                    if (!valid) {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Corrige las cantidades inválidas antes de enviar el formulario.', styleClass: 'iziToast-custom' });
                        return;
                    }
            } else {
                this.procesarGuardar()
                    .then((encabezadoId: number) => {
                        return this.insertarEquipos(encabezadoId)
                            .then(() => {

                                this.itemsGroup2.forEach(async element => {
                                    element.usua_Creacion = this.usuarioId;

                                    await this.insumoPorActividadService.Insertar(element as InsumoPorActividad)
                                    .then((result) => {
                                        if(result.codeStatus > 0){
                                         
                                        }else{
                                
                                        }
                                    })
                                    .catch((error) => {


                                    });
                                });

                            })
                            .then(() => this.insertarInsumosActividadEtapa(encabezadoId))
                            .then(() => this.insertarEquiposActividadEtapa(encabezadoId))
                            .then(() => {
                                this.onSuccessFinalizar(encabezadoId);
                            });

                    })
                    .finally(() => {
                        const navigationState = this.navigationStateService.getState();

                        if(navigationState && navigationState.flete){
                            navigationState.fleteGrouped.find((x) => x.bode_Id === navigationState.flete.bode_Id).done = true;

                            this.router.navigate(['./sigesproc/proyecto/proyecto']);
                        }
                    })
                    .catch(error => {

                    });
            }
        } else {
            
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Corrige las cantidades inválidas antes de enviar el formulario.', styleClass: 'iziToast-custom' });
                return;
           
            this.form.markAllAsTouched();
        } 
        
    }

    // Método auxiliar que se ejecuta en caso de éxito en finalizar
    private onSuccessFinalizar(encabezadoId: number) {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000, styleClass: 'iziToast-custom' });
        this.CreateEdit = false;

        
        this.detalleService.Buscar(encabezadoId).subscribe(
            (data: FleteDetalle[]) => {
                const verificadosInsumos = data.filter(det => det.flde_llegada && det.flde_TipodeCarga); // Insumos verificados
                const verificadosEquipos = data.filter(det => det.flde_llegada && !det.flde_TipodeCarga); // Equipos de seguridad verificados


                this.Listado();
                // Generamos el PDF con los datos obtenidos
                this.generarActaDeCompromiso(encabezadoId);
                const encargadoNombre = this.form.get('encargado')?.value ?? 'Desconocido';
                const horaSalida = this.form.get('flen_FechaHoraSalida')?.value ?? 'N/A';
                const ubicacionSalida = this.form.get('flen_UbicacionSalida')?.value ?? 'N/A';
                const horaLlegada = this.form.get('flen_FechaHoraLlegada')?.value ?? 'N/A';
                const ubicacionLlegada = this.form.get('flen_UbicacionLlegada')?.value ?? 'N/A';

                const mensajeAlerta = `Nuevo flete enviado:\n
                Encargado: ${encargadoNombre}\n
                ID del Flete: ${encabezadoId}\n
                Hora de Salida: ${horaSalida}\n
                Ubicación de Salida: ${ubicacionSalida}\n
                Hora de Llegada: ${horaLlegada}\n
                Ubicación de Llegada: ${ubicacionLlegada}`;


                this.GuardarEnviarAlertas(mensajeAlerta);
                this.isPdfVisible = true;
            },
            error => {

                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al generar el PDF.', life: 3000, styleClass: 'iziToast-custom' });
            }
        );


    }

    //metodo de insercion de detalles (Insumos por Bodega)
    insertarDetalles(encabezadoId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const detalles: FleteDetalle[] = this.itemsGroup2.map((insumo: InsumoPorProveedorExtendido) => ({
                flde_Cantidad: insumo.cantidad,
                flen_Id: encabezadoId,
                inpp_Id: insumo.inpp_Id,
                usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
                flde_FechaCreacion: new Date(),
                flde_TipodeCarga: true  // Indicar que estos son insumos
            }));


            if (detalles.length === 0) {
                resolve();  // Si no hay detalles, resolver la promesa inmediatamente
            } else {
                const inserciones = detalles.map(detalle => {
                    return this.detalleService.Insertar(detalle)
                        .pipe(
                            catchError(error => {


                                return throwError(error);
                            })
                        );
                });

                // Ejecutar todas las inserciones
                forkJoin(inserciones).subscribe(
                    responses => {

                        // Limpiar la lista de insumos por bodega después de la inserción para evitar duplicaciones
                        this.itemsGroup2 = [];

                        resolve();
                    },
                    error => {

                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al guardar los detalles.', life: 3000, styleClass: 'iziToast-custom' });
                        reject(error);
                    }
                );
            }
        });
    }

    //metodo de insercion de detalles (Equipos de Seguridad por Bodega)
    insertarEquipos(encabezadoId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const detalles: FleteDetalle[] = this.itemsGroupEquipos2.map((equipo: EquipoPorProveedorExtendido) => ({
                flde_Cantidad: equipo.cantidad,
                flen_Id: encabezadoId,
                inpp_Id: equipo.eqpp_Id, // Aquí se usa eqpp_Id para equipos de seguridad
                usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
                flde_FechaCreacion: new Date(),
                flde_TipodeCarga: false  // Indicar que estos son equipos de seguridad
            }));


            if (detalles.length === 0) {
                resolve();  // Si no hay detalles, resolver la promesa inmediatamente
            } else {
                const inserciones = detalles.map(detalle => {
                    return this.detalleService.Insertar(detalle)
                        .pipe(
                            catchError(error => {

                                return throwError(error);
                            })
                        );
                });

                forkJoin(inserciones).subscribe(
                    responses => {
                        resolve();
                    },
                    error => {

                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al guardar los equipos de seguridad.', life: 3000, styleClass: 'iziToast-custom' });
                        reject(error);
                    }
                );
            }
        });
    }

    //Metodo de insercion de detalles (Equipos de Seguridad Por Actividad Por Etapa)
    insertarEquiposActividadEtapa(encabezadoId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const detalles: FleteDetalle[] = this.itemsGroupEquiposActividadEtapa2.map((equipo: EquipoPorProveedorExtendido) => ({
                flde_Cantidad: equipo.cantidad,
                flen_Id: encabezadoId,
                inpp_Id: equipo.eqpp_Id, // Se envia el id de equipo de seguridad por proveedor a el parametros de id de detalle de flete detalle
                usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
                flde_FechaCreacion: new Date(),
                flde_TipodeCarga: false  // Indica que este detalle es un equipo de seguridad
            }));


            if (detalles.length === 0) {
                resolve();  // Si no hay detalles, resolver la promesa de manera continua
            } else {
                const inserciones = detalles.map(detalle => {
                    return this.detalleService.Insertar(detalle)
                        .pipe(
                            catchError(error => {

                                return throwError(error);
                            })
                        );
                });

                forkJoin(inserciones).subscribe(
                    responses => {
                        resolve();
                    },
                    error => {

                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al guardar los equipos por actividad y etapa.', life: 3000, styleClass: 'iziToast-custom' });
                        reject(error);
                    }
                );
            }
        });
    }
    //Metodo de insercion de detalles (Insumos Por Actividad Por Etapa)

    insertarInsumosActividadEtapa(encabezadoId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const detalles: FleteDetalle[] = this.itemsGroupInsumosActividadEtapa2.map((insumo: InsumoPorProveedorExtendido) => ({
                flde_Cantidad: insumo.cantidad,
                flen_Id: encabezadoId,
                inpp_Id: insumo.inpp_Id, //Se envia el id de insumo por proveedor del insumo seleccionado a mi parametro de id de insumo/equipo de flete detalle
                usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
                flde_FechaCreacion: new Date(),
                flde_TipodeCarga: true  // Identificador para Insumo
            }));


            if (detalles.length === 0) {
                resolve();  // Si no hay detalles, resolver la promesa de manera continua
            } else {
                const inserciones = detalles.map(detalle => {
                    return this.detalleService.Insertar(detalle)
                        .pipe(
                            catchError(error => {

                                return throwError(error);
                            })
                        );
                });

                forkJoin(inserciones).subscribe(
                    responses => {
                        resolve();
                    },
                    error => {

                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al guardar los insumos por actividad y etapa.', life: 3000, styleClass: 'iziToast-custom' });
                        reject(error);
                    }
                );
            }
        });
    }

    //Metodo de eliminado general de mis detalles pertenecientes a un solo encabezadod e el flete
    EliminarDetallesDeFlete(flenId: number): Promise<any> {
        return new Promise((resolve, reject) => {
            const detalles = this.selectedDetalles; // Usar los detalles seleccionados guardados
            if (detalles.length > 0) {
                const eliminaciones = detalles.map(detalle => this.detalleService.Eliminar(detalle.flde_Id));
                forkJoin(eliminaciones).subscribe(
                    () => {
                        resolve(true);
                    },
                    error => {

                        reject(error);
                    }
                );
            } else {
                resolve(true);
            }
        });
    }

    filtrarActividadesPorProyecto(proyId: number): void {
        this.filtradoActividades = this.actividades.filter(actividad => actividad.proy_Id === proyId);
    }

    selectFlete(Flete: any) {
        this.selectedFlete = Flete;
    }
    //   PANTALLA DETALESSSSSSSSSSSS
    detalleFlete(flete: Flete) {
        if (!flete || !flete.flen_Id) {

            return;
        }
        this.flete = flete;

        // Búsqueda del flete encabezado según el ID del flete
        this.service.Buscar(this.flete.flen_Id).subscribe(
            (flete: Flete) => {
                flete = this.flete;

                if (flete) {
                    this.detalleService.Buscar(flete.flen_Id).subscribe(
                        (data: FleteDetalle[]) => {
                            // Dividir los detalles entre insumos y equipos de seguridad
                            this.verificadosInsumos = data.filter(det => det.flde_llegada && det.flde_TipodeCarga); // Insumos verificados
                            this.noVerificadosInsumos = data.filter(det => !det.flde_llegada && det.flde_TipodeCarga); // Insumos no verificados

                            this.verificadosEquipos = data.filter(det => det.flde_llegada && !det.flde_TipodeCarga); // Equipos de seguridad verificados
                            this.noVerificadosEquipos = data.filter(det => !det.flde_llegada && !det.flde_TipodeCarga); // Equipos de seguridad no verificados

                            this.controlCalidadService.BuscarIncidencias(flete.flen_Id).subscribe(
                                (respuesta: any) => {
                                    this.incidencias = Array.isArray(respuesta) ? respuesta : [respuesta];
                                    this.DetalleFlete = true;
                                    this.Index = false;
                                },
                                (error) => {

                                    this.DetalleFlete = true;
                                    this.Index = false;
                                }
                            );
                        },
                        (error) => {

                        }
                    );
                } else {


                }
            },
            (error) => {

            }
        );
    }
    //EDITADO FLETE
    confirmEdit() {
        this.showEditConfirmDialog = false;  
        this.procesarGuardar();  
    }




    soloEditar(): Promise<number> {

        return new Promise((resolve, reject) => {
           
            const formValue = this.form.value;
            const nuevoFlete = {
                ...formValue,
                flen_Id: this.selectedFlete ? this.selectedFlete.flen_Id : 0,
                flen_FechaHoraSalida: this.formatDate(formValue.flen_FechaHoraSalida),
                flen_FechaHoraEstablecidaDeLlegada: this.formatDate(formValue.flen_FechaHoraEstablecidaDeLlegada),
                flen_FechaHoraLlegada: formValue.flen_FechaHoraLlegada ? this.formatDate(formValue.flen_FechaHoraLlegada) : '1753-01-01T00:00:00.000Z',
                usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
                usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
                flen_Estado: false,
                boat_Id: this.valSwitch ? Number(this.form.get('boat_Id').value) : Number(this.form.get('boat_Id').value)
            };

            console.log("identidad"+this.identityFlete);
            let insertarEncabezado;
            if (this.identityFlete === "crear") {
                console.log('crearrrrrrrrrr');
                
                insertarEncabezado = this.service.Insertar(nuevoFlete);
            } else if (this.identityFlete === "editar"){
                console.log('editarrrrrrrr');

                insertarEncabezado = this.service.Actualizar(nuevoFlete);
            }

            insertarEncabezado.subscribe(
                (respuesta: Respuesta) => {
                    if (respuesta.success) {

                        // Obtener el ID del encabezado recién creado o actualizado
                        const encabezadoId = respuesta.data.codeStatus || this.selectedFlete.flen_Id;

                       
                    } else {

                        this.mostrarErrores(respuesta.errors);
                        // this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000, styleClass: 'iziToast-custom' });
                        reject(new Error('Hubo un problema al guardar el encabezado'));
                    }
                },
                (error) => {

                    // this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000, styleClass: 'iziToast-custom' });
                    this.form.markAllAsTouched();
                    reject(error);
                }
            );
        });
    }

    procesarGuardar(): Promise<number> {

        return new Promise((resolve, reject) => {
           
            const formValue = this.form.value;
            const nuevoFlete = {
                ...formValue,
                flen_Id: this.selectedFlete ? this.selectedFlete.flen_Id : 0,
                flen_FechaHoraSalida: this.formatDate(formValue.flen_FechaHoraSalida),
                flen_FechaHoraEstablecidaDeLlegada: this.formatDate(formValue.flen_FechaHoraEstablecidaDeLlegada),
                flen_FechaHoraLlegada: formValue.flen_FechaHoraLlegada ? this.formatDate(formValue.flen_FechaHoraLlegada) : '1753-01-01T00:00:00.000Z',
                usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
                usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
                flen_Estado: false,
                boat_Id: this.valSwitch ? Number(this.form.get('boat_Id').value) : Number(this.form.get('boat_Id').value)
            };

            console.log("identidad"+this.identityFlete);
            let insertarEncabezado;
            if (this.identityFlete === "crear") {
                console.log('crearrrrrrrrrr');
                
                insertarEncabezado = this.service.Insertar(nuevoFlete);
            } else if (this.identityFlete === "editar"){
                console.log('editarrrrrrrr');

                insertarEncabezado = this.service.Actualizar(nuevoFlete);
            }

            insertarEncabezado.subscribe(
                (respuesta: Respuesta) => {
                    if (respuesta.success) {

                        // Obtener el ID del encabezado recién creado o actualizado
                        const encabezadoId = respuesta.data.codeStatus || this.selectedFlete.flen_Id;

                        if (this.identityFlete === "crear") {
                            this.insertarDetalles(encabezadoId)
                                .then(() => resolve(encabezadoId)) // Resolver la promesa con el ID del encabezado
                                .catch(error => reject(error));
                        } else {
                            this.EliminarDetallesDeFlete(this.selectedFlete.flen_Id)
                                .then(() => this.insertarDetalles(encabezadoId))
                                .then(() => resolve(encabezadoId)) // Resolver la promesa con el ID del encabezado
                                .catch(error => reject(error));
                        }
                    } else {

                        this.mostrarErrores(respuesta.errors);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000, styleClass: 'iziToast-custom' });
                        reject(new Error('Hubo un problema al guardar el encabezado'));
                    }
                },
                (error) => {

                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000, styleClass: 'iziToast-custom' });
                    reject(error);
                }
            );
        });
    }

    EliminarFlete() {
        this.idFlete = this.selectedFlete.flen_Id;
        this.DeleteFlete = true;
    }

    ModalVeirficarFlete() {
        this.VeificarFlete = true;
    }

    ModalEditarFlete(){
this.modalEditar = true;
    }

    CerrarModalEditarFlete(){
        this.modalEditar = false;
           this.soloEditar();
           if(this.form.valid){
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000, styleClass: 'iziToast-custom' });
           }

         }
    ConfirmarEliminar() {
        const ID = this.idFlete;



        this.service.Eliminar(ID).subscribe(
            (respuesta: Respuesta) => {
                if (respuesta.success) {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000, styleClass: 'iziToast-custom' });
                    this.Listado();
                    this.DeleteFlete = false;
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000, styleClass: 'iziToast-custom' });
                    this.DeleteFlete = false;
                }
            }
        );
    }

    EliminarDetalle(id) {
        this.idInsumo = id;

        

        this.detalleService.Eliminar(this.idInsumo).subscribe(
            (respuesta: Respuesta) => {

                if (respuesta.success) {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000, styleClass: 'iziToast-custom' });
                    this.Listado();
                    this.DeleteDetalle = false;
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000, styleClass: 'iziToast-custom' });
                    this.DeleteDetalle = false;
                }
            }
        );


    }

    //Listado de Equipos de Seguridad Por Proveedor

    ListadoEquipos() {
        this.detalleService.ListadoEquiposPorProveedor().subscribe(
            (data: EquipoPorProveedorExtendido[]) => {
                this.itemsGroupEquipos1 = data
                    .filter(equipo => equipo.bopi_Stock > 0) // Filtrar equipos con stock > 0
                    .map(equipo => ({
                        ...equipo,
                        cantidad: equipo.bopi_Stock || 0,
                        cantidadError: '',
                        inputDisabled: false,
                        stockRestante: equipo.bopi_Stock || 0
                    }));

                },
            (error) => {

            }
        );
    }
    
    //Drag and Drop de Equipos de Seguridad Por Bodega

    ListadoEquiposPorBodega(bodegaId: number) {
        const equiposSeleccionados = this.itemsGroupEquipos2.map(item => item.eqpp_Id);
    
        this.detalleService.ListadoEquiposPorBodega(bodegaId).subscribe(
            (data: EquipoPorProveedorExtendido[]) => {
                this.itemsGroupEquipos1 = data
                    .filter(equipo => !equiposSeleccionados.includes(equipo.eqpp_Id) && equipo.bopi_Stock > 0) // Filtrar equipos con stock > 0
                    .map(equipo => ({
                        ...equipo,
                        cantidad: equipo.bopi_Stock,
                        cantidadError: '',
                        inputDisabled: false
                    }));

                },
            (error) => {

            }
        );
    }
    

    onCantidadChangeEquipo(equipo: EquipoPorProveedorExtendido) {
        const nuevaCantidad = equipo.cantidad || 0;

        if (this.identityFlete === 'crear') {
            // Lógica para la creación del flete
            if (nuevaCantidad > equipo.bopi_Stock) {
                equipo.cantidadError = 'La cantidad no puede ser mayor que el stock disponible.';
            } else if (nuevaCantidad < 1) {
                equipo.cantidadError = 'La cantidad no puede ser menor que 1.';
            } else {
                equipo.cantidadError = '';
                equipo.stockRestante = equipo.bopi_Stock - nuevaCantidad;
            }
        } else if (this.identityFlete === 'editar') {
            // Lógica para la edición del flete
            const stockReal = equipo.bopi_Stock + equipo.cantidad; // Stock en la base de datos más la cantidad en el detalle
            const maxCantidad = stockReal; // Stock original antes de la edición

            if (nuevaCantidad > maxCantidad) {
                equipo.cantidadError = `La cantidad no puede ser mayor que el stock disponible (${maxCantidad}).`;
            } else if (nuevaCantidad < 1) {
                equipo.cantidadError = 'La cantidad no puede ser menor que 1.';
            } else {
                equipo.cantidadError = '';
                equipo.stockRestante = stockReal - nuevaCantidad;
            }
        }

        // Detectar cambios para actualizar la vista
        this.cdRef.detectChanges();

    }

    onToggleDragView() {

    }

    itemsRemovedEquipo(ev: any[], list: number) {
        if (list === 1) {
            this.itemsGroupEquipos2.push(...ev.filter(item => !this.itemsGroupEquipos2.some(existing => existing.eqpp_Id === item.eqpp_Id)));
            this.itemsGroupEquipos1 = this.itemsGroupEquipos1.filter(item => !ev.some(removedItem => removedItem.eqpp_Id === item.eqpp_Id));
        } else {
            this.itemsGroupEquipos1.push(...ev.filter(item => !this.itemsGroupEquipos1.some(existing => existing.eqpp_Id === item.eqpp_Id)));
            this.itemsGroupEquipos2 = this.itemsGroupEquipos2.filter(item => !ev.some(removedItem => removedItem.eqpp_Id === item.eqpp_Id));
        }
        this.cdRef.detectChanges();

    }

    itemsAddedEquipo(ev: any[], list: number) {
        if (list === 1) {
            ev.forEach(item => {
                if (!this.itemsGroupEquipos1.some(existing => existing.eqpp_Id === item.eqpp_Id)) {
                    this.itemsGroupEquipos1.push(item);
                }
            });
        } else {
            ev.forEach(item => {
                if (!this.itemsGroupEquipos2.some(existing => existing.eqpp_Id === item.eqpp_Id)) {
                    this.itemsGroupEquipos2.push({
                        ...item,
                        cantidad: item.bopi_Stock || 0,
                        cantidadError: ''
                    });
                }
            });
        }

        if (list === 1) {
            this.itemsGroupEquipos2 = this.itemsGroupEquipos2.filter(item => !ev.some(addedItem => addedItem.eqpp_Id === item.eqpp_Id));
        } else {
            this.itemsGroupEquipos1 = this.itemsGroupEquipos1.filter(item => !ev.some(addedItem => addedItem.eqpp_Id === item.eqpp_Id));
        }
        this.cdRef.detectChanges();

    }
    //DRAG INSUMOS POR BODEGA

    limpiarDragAndDrop() {
        this.itemsGroup1 = [];
        this.itemsGroup2 = [];
        this.cdRef.detectChanges();
    }

    limpiarDragAndDropEquipos() {
        this.itemsGroupEquipos1 = [];
        this.itemsGroupEquipos2 = [];
        this.cdRef.detectChanges();
    }

    // Drag and Drop Insumos Por Bodega

    ListadoInsumos() {
        this.detalleService.ListarInsumosPorProveedor().subscribe(
            (data: InsumoPorProveedorExtendido[]) => {
                this.itemsGroup1 = data
                    .filter(insumo => insumo.bopi_Stock > 0) // Filtrar los insumos con stock > 0
                    .map(insumo => ({
                        ...insumo,
                        cantidad: insumo.bopi_Stock, // Por defecto, la cantidad es igual al stock
                        cantidadError: '',
                        inputDisabled: false
                    }));

                },
            (error) => {

            }
        );
    }
    
    
    //CAMBIO CANTIDAD DETALLES Y PARTICIONN

    

    onCantidadKeyPress2(event: KeyboardEvent, detalle: FleteDetalle) {
        const cantidadOriginal = this.cantidadesOriginales[detalle.flde_Id];
        const inputChar = String.fromCharCode(event.charCode);
        const inputValue = (event.target as HTMLInputElement).value + inputChar;

        const inputNumber = parseInt(inputValue, 10);

        if (isNaN(inputNumber) || inputNumber < 1 || inputNumber > cantidadOriginal) {
            event.preventDefault();
        }
    }

    //CAMBIO CANTIDAD VERIFICACION
    //bloqueo de cantidades invalidas en mi verificacion

    onCantidadKeyPress(event: KeyboardEvent, item: InsumoPorProveedorExtendido) {
        const charCode = event.which ? event.which : event.keyCode;
        const charStr = String.fromCharCode(charCode);

        // Permitir solo números
        if (!charStr.match(/^[0-9]+$/)) {
            event.preventDefault();
            return;
        }

        //     // Obtener el valor actual del input y la nueva cantidad
        const currentInputValue = (event.target as HTMLInputElement).value;
        const newQuantity = parseInt(currentInputValue + charStr, 10);

        //     // Verificar si la nueva cantidad es válida
        if (newQuantity > item.bopi_Stock || newQuantity < 1) {
            event.preventDefault();
        }
    }

    // CAMBIO DE STOCK
    onCantidadChange(item: InsumoPorProveedorExtendido) {
    const nuevaCantidad = item.cantidad || 0;

    if (this.identityFlete === 'crear') {
        if (nuevaCantidad > item.bopi_Stock) {
            item.cantidadError = 'La cantidad no puede ser mayor que el stock disponible.';
        } else if (nuevaCantidad < 1) {
            item.cantidadError = 'La cantidad no puede ser menor que 1.';
        } else {
            item.cantidadError = '';
            item.stockRestante = item.bopi_Stock - nuevaCantidad;
        }
    } else if (this.identityFlete === 'editar') {
        const maxCantidad = item.stockRealInicial;

        if (nuevaCantidad > maxCantidad) {
            item.cantidadError = `La cantidad no puede ser mayor que el stock disponible (${maxCantidad}).`;
        } else if (nuevaCantidad < 1) {
            item.cantidadError = 'La cantidad no puede ser menor que 1.';
        } else {
            item.cantidadError = '';
            item.stockRestante = maxCantidad - nuevaCantidad;
        }
    }
    this.cdRef.detectChanges();
}


    // FUNCIÓN PARA CALCULAR STOCK RESTANTE
    calculateStock(item: InsumoPorProveedorExtendido): number | string {
        let stockRestante: number;

        if (this.identityFlete === 'crear') {
            // creacion
            stockRestante = item.bopi_Stock - (item.cantidad || 0);
        } else if (this.identityFlete === 'editar') {
            // edicionn
            const stockReal = item.bopi_Stock + item.cantidad; // Stock en la base de datos más la cantidad en el detalle
            stockRestante = stockReal - (item.cantidad || 0);
        } else {
            // Por si  identityFlete no está establecido
            stockRestante = item.bopi_Stock - (item.cantidad || 0);
        }

        return stockRestante >= 0 ? stockRestante : 'Stock agotado';
    }



 

    calculateStockEquipo(equipo: EquipoPorProveedorExtendido): number | string {
        let stockRestante: number;

        if (this.identityFlete === 'crear') {
            // Lógica para la creación del flete
            stockRestante = equipo.bopi_Stock - (equipo.cantidad || 0);
        } else if (this.identityFlete === 'editar') {
            // Lógica para la edición del flete
            const stockReal = equipo.bopi_Stock + equipo.cantidad; // Stock en la base de datos más la cantidad en el detalle
            stockRestante = stockReal - (equipo.cantidad || 0);
        } else {
            // Por si acaso identityFlete no está establecido
            stockRestante = equipo.bopi_Stock - (equipo.cantidad || 0);
        }

        return stockRestante >= 0 ? stockRestante : 'Stock agotado';
    }

    itemsRemoved(ev: any[], list: number) {
        if (list === 1) {
            this.itemsGroup2.push(...ev.filter(item => !this.itemsGroup2.some(existing => existing.inpp_Id === item.inpp_Id)));
            this.itemsGroup1 = this.itemsGroup1.filter(item => !ev.some(removedItem => removedItem.inpp_Id === item.inpp_Id));
        } else {
            this.itemsGroup1.push(...ev.filter(item => !this.itemsGroup1.some(existing => existing.inpp_Id === item.inpp_Id)));
            this.itemsGroup2 = this.itemsGroup2.filter(item => !ev.some(removedItem => removedItem.inpp_Id === item.inpp_Id));
        }
        this.cdRef.detectChanges();

    }

    itemsAdded(ev: any[], list: number) {
        if (list === 1) {
            ev.forEach(item => {
                if (!this.itemsGroup1.some(existing => existing.inpp_Id === item.inpp_Id)) {
                    this.itemsGroup1.push(item);
                }
            });
        } else {
            ev.forEach(item => {
                if (!this.itemsGroup2.some(existing => existing.inpp_Id === item.inpp_Id)) {
                    this.itemsGroup2.push({
                        ...item,
                        cantidad: item.bopi_Stock,
                        cantidadError: ''
                    });
                }
            });
        }

        if (list === 1) {
            this.itemsGroup2 = this.itemsGroup2.filter(item => !ev.some(addedItem => addedItem.inpp_Id === item.inpp_Id));
        } else {
            this.itemsGroup1 = this.itemsGroup1.filter(item => !ev.some(addedItem => addedItem.inpp_Id === item.inpp_Id));
        }
        this.cdRef.detectChanges();

    }

    itemsUpdated(ev: any[], list: number) {

    }

    selectionChanged(ev: any[], list: number) {

    }

    ListadoSuministrosPorBodega(bodegaId: number) {
        const insumosSeleccionados = this.itemsGroup2.map(item => item.inpp_Id);
    
        this.detalleService.ListarInsumosPorBodega(bodegaId).subscribe(
            (data: InsumoPorProveedorExtendido[]) => {
                this.itemsGroup1 = data
                    .filter(insumo => !insumosSeleccionados.includes(insumo.inpp_Id) && insumo.bopi_Stock > 0) // Filtrar los insumos con stock > 0
                    .map(insumo => ({
                        ...insumo,
                        cantidad: insumo.bopi_Stock,
                        cantidadError: ''
                    }));

                },
            (error) => {

            }
        );
    }
    

    drop(event: CdkDragDrop<InsumoPorProveedor[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        }
        this.cdRef.detectChanges();
    }

    agregarInsumo(insumo: InsumoPorProveedor) {
        if (!this.insumosSeleccionados.includes(insumo)) {

            this.insumosSeleccionados.push(insumo);
        } else {


        }
    }

    eliminarInsumo(insumo: InsumoPorProveedor) {
        const index = this.insumosSeleccionados.indexOf(insumo);
        if (index > -1) {
            this.insumosSeleccionados.splice(index, 1);
        }
    }

    eliminarDetalle(id: number) {
        this.detalleService.Eliminar(id).subscribe(
            (respuesta: any) => {
                if (respuesta.success) {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Eliminado con Éxito.', styleClass: 'iziToast-custom' });
                }
            },
            (error) => {

            }
        );
    }

    obtenerListadoEquipos() {
        this.detalleService.ListadoEquiposPorProveedor().subscribe(
            (data: EquipoPorProveedorExtendido[]) => {
                this.itemsGroupEquipos1 = data
                    .filter(equipo => equipo.bopi_Stock > 0) // Filtrar equipos con stock > 0
                    .map(equipo => ({
                        ...equipo,
                        cantidad: equipo.bopi_Stock,
                        cantidadError: '',
                        inputDisabled: false,
                        stockRestante: equipo.bopi_Stock || 0
                    }));

                },
            (error) => {

            }
        );
    }
    

    obtenerListadoInsumos() {
        this.detalleService.ListarInsumosPorProveedor().subscribe(
            (data: InsumoPorProveedor[]) => {
                this.insumosDisponibles = data
                    .filter(insumo => insumo.bopi_Stock > 0) // Filtrar los insumos con stock > 0
                    .map(insumo => ({
                        ...insumo,
                        cantidad: 0,
                        cantidadError: ''
                    })) as InsumoPorProveedorExtendido[];

                },
            (error) => {

            }
        );
    }
    

    selectAllItemsEquipos() {
        // Mueve todos los items de itemsGroupEquipos1 a itemsGroupEquipos2
        this.itemsGroupEquipos2.push(...this.itemsGroupEquipos1.filter(item => !this.itemsGroupEquipos2.some(existing => existing.eqpp_Id === item.eqpp_Id)));
        this.itemsGroupEquipos1 = [];
        this.cdRef.detectChanges();
    }

    deselectAllItemsEquipos() {
        // Mueve todos los items de itemsGroupEquipos2 a itemsGroupEquipos1
        this.itemsGroupEquipos1.push(...this.itemsGroupEquipos2.filter(item => !this.itemsGroupEquipos1.some(existing => existing.eqpp_Id === item.eqpp_Id)));
        this.itemsGroupEquipos2 = [];
        this.cdRef.detectChanges();
    }

    selectAllItems() {
        // Mueve todos los items de itemsGroup1 a itemsGroup2
        this.itemsGroup2.push(...this.itemsGroup1.filter(item => !this.itemsGroup2.some(existing => existing.inpp_Id === item.inpp_Id)));
        this.itemsGroup1 = [];
        this.cdRef.detectChanges();
    }

    deselectAllItems() {
        // Mueve todos los items de itemsGroup2 a itemsGroup1
        this.itemsGroup1.push(...this.itemsGroup2.filter(item => !this.itemsGroup1.some(existing => existing.inpp_Id === item.inpp_Id)));
        this.itemsGroup2 = [];
        this.cdRef.detectChanges();
    }

    actualizarCantidad(insumo: InsumoPorProveedorExtendido) {
        const originalInsumo = this.insumosDisponibles.find(i => i.inpp_Id === insumo.inpp_Id);

        if (!originalInsumo) {

            return;
        }

        if (insumo.cantidad < 1) {
            insumo.cantidad = 1;
            insumo.cantidadError = 'La cantidad no puede ser menor que 1';
        } else if (insumo.cantidad > (originalInsumo.bopi_Stock || 0)) {
            insumo.cantidad = originalInsumo.bopi_Stock || 0;
            insumo.cantidadError = 'La cantidad no puede ser mayor que el stock';
        } else {
            insumo.cantidadError = '';
            originalInsumo.bopi_Stock = (originalInsumo.bopi_Stock || 0) - insumo.cantidad;
        }

    }

    eliminarInsumoSeleccionadoNuevo(insumo: InsumoPorProveedorExtendido) {
        const index = this.insumosSeleccionadosNuevo.indexOf(insumo);
        if (index > -1) {
            this.insumosSeleccionadosNuevo.splice(index, 1);
            this.insumosDisponibles.push(insumo);

        }
    }


    // DRAAAG DE ACTIVIDADES POR ETAPA
    // Llama al servicio cuando cargues la segunda pestaña
    ListadoInsumosPorActividadEtapa(acet_Id: number) {
        // Obtener los insumos seleccionados del drag de actividades por etapa
        const insumosSeleccionados = this.itemsGroupInsumosActividadEtapa2.map(item => item.inpp_Id);

        this.detalleService.ListadoInsumosPorActividadEtapafiltrado(acet_Id).subscribe(
            (data: InsumoPorProveedorExtendido[]) => {
                // Filtrar los insumos disponibles excluyendo los ya seleccionados
                this.itemsGroupInsumosActividadEtapa1 = data
                    .filter(insumo => !insumosSeleccionados.includes(insumo.inpp_Id) && insumo.bopi_Stock > 0)
                    .map(insumo => ({
                        ...insumo,
                        cantidad: insumo.bopi_Stock, // Inicializa con el stock por defecto
                        cantidadError: '', // Sin errores iniciales
                        inputDisabled: false // Campo habilitado
                    }));


                },
            (error) => {

            }
        );
    }

    itemsUpdatedActividadEtapa(event: CdkDragDrop<InsumoPorProveedorExtendido[]>) {
        if (!event || !event.container) {


            return;
        }

        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );

            const selectedItem = event.container.data[event.currentIndex];
            selectedItem.cantidad = selectedItem.bopi_Stock || 0;



        }

        this.cdRef.detectChanges();
    }

    onCantidadKeyPressActividadEtapa(event: KeyboardEvent, item: InsumoPorProveedorExtendido) {
        const charCode = event.which ? event.which : event.keyCode;
        const charStr = String.fromCharCode(charCode);

        // Permitir solo números
        if (!charStr.match(/^[0-9]+$/)) {
            event.preventDefault();
            return;
        }

        const currentInputValue = (event.target as HTMLInputElement).value;
        const newQuantity = parseInt(currentInputValue + charStr, 10);

        // Verificar si la nueva cantidad es válida
        if (newQuantity > item.bopi_Stock || newQuantity < 1) {
            event.preventDefault();
        }
    }

    onCantidadChangeActividadEtapa(item: InsumoPorProveedorExtendido) {
        const nuevaCantidad = item.cantidad || 0;

        if (this.identityFlete === 'crear') {
            // Lógica para la creación del flete
            if (nuevaCantidad > item.bopi_Stock) {
                item.cantidadError = 'La cantidad no puede ser mayor que el stock disponible.';
            } else if (nuevaCantidad < 1) {
                item.cantidadError = 'La cantidad no puede ser menor que 1.';
            } else {
                item.cantidadError = '';
                item.stockRestante = item.bopi_Stock - nuevaCantidad;
            }
        } else if (this.identityFlete === 'editar') {
            // Lógica para la edición del flete
            const stockReal = item.bopi_Stock + item.cantidad; // Stock en la base de datos más la cantidad en el detalle
            const maxCantidad = stockReal; // Stock original antes de la edición

            if (nuevaCantidad > maxCantidad) {
                item.cantidadError = `La cantidad no puede ser mayor que el stock disponible (${maxCantidad}).`;
            } else if (nuevaCantidad < 1) {
                item.cantidadError = 'La cantidad no puede ser menor que 1.';
            } else {
                item.cantidadError = '';
                item.stockRestante = stockReal - nuevaCantidad;
            }
        }

        // Detectar cambios para actualizar la vista
        this.cdRef.detectChanges();

    }

    // FUNCIÓN PARA CALCULAR STOCK RESTANTE PARA INSUMOS POR ACTIVIDAD Y ETAPA
    calculateStockActividadEtapa(item: InsumoPorProveedorExtendido): number | string {
        let stockRestante: number;

        if (this.identityFlete === 'crear') {
            // Lógica para la creación del flete
            stockRestante = item.bopi_Stock - (item.cantidad || 0);
        } else if (this.identityFlete === 'editar') {
            // Lógica para la edición del flete
            const stockReal = item.bopi_Stock + item.cantidad; // Stock en la base de datos más la cantidad en el detalle
            stockRestante = stockReal - (item.cantidad || 0);
        } else {
            // Por si acaso identityFlete no está establecido
            stockRestante = item.bopi_Stock - (item.cantidad || 0);
        }

        return stockRestante >= 0 ? stockRestante : 'Stock agotado';
    }

    //VALIDACION DE LIMPIEZA DE DRAGS CUANDO SE CAMBIA DE SALIDA
    onLimpiezaDrags() {
        // Limpia los elementos seleccionados en ambos grupos
        this.itemsGroup2 = []; // Limpia insumos seleccionados por bodega
        this.itemsGroupEquipos2 = []; // Limpia equipos seleccionados por bodega
        this.itemsGroupInsumosActividadEtapa2 = []; // Limpia insumos seleccionados por actividad y etapa
        this.itemsGroupEquiposActividadEtapa2 = []; // Limpia equipos seleccionados por actividad y etapa


        
        // Aquí ya tienes el código que cambia la visualización del switch
        this.mostrarEquiposSeguridad = !this.mostrarEquiposSeguridad;
    }

    onLimpiezaDragsActividadPorEtapa() {
        // Limpia los elementos seleccionados en los grupos de actividad y etapa
        this.itemsGroupInsumosActividadEtapa2 = []; // Limpia insumos seleccionados por actividad y etapa
        this.itemsGroupEquiposActividadEtapa2 = []; // Limpia equipos seleccionados por actividad y etapa


        
        // Aquí ya tienes el código que cambia la visualización del switch
        // this.mostrarEquiposSeguridadPorActividad = !this.mostrarEquiposSeguridadPorActividad;
    }

    limpiarDragAndDropInsumosActividadEtapa() {
        this.itemsGroupInsumosActividadEtapa1 = [];
        this.itemsGroupInsumosActividadEtapa2 = [];
        this.cdRef.detectChanges();
    }

    selectAllItemsInsumosActividadEtapa() {
        this.itemsGroupInsumosActividadEtapa2.push(...this.itemsGroupInsumosActividadEtapa1.filter(item => !this.itemsGroupInsumosActividadEtapa2.some(existing => existing.inpp_Id === item.inpp_Id)));
        this.itemsGroupInsumosActividadEtapa1 = [];
        this.cdRef.detectChanges();
    }

    deselectAllItemsInsumosActividadEtapa() {
        this.itemsGroupInsumosActividadEtapa1.push(...this.itemsGroupInsumosActividadEtapa2.filter(item => !this.itemsGroupInsumosActividadEtapa1.some(existing => existing.inpp_Id === item.inpp_Id)));
        this.itemsGroupInsumosActividadEtapa2 = [];
        this.cdRef.detectChanges();
    }

    itemsRemovedActividadEtapa(ev: any[], list: number) {
        if (list === 1) {
            this.itemsGroupInsumosActividadEtapa2.push(...ev.filter(item => !this.itemsGroupInsumosActividadEtapa2.some(existing => existing.inpp_Id === item.inpp_Id)));
            this.itemsGroupInsumosActividadEtapa1 = this.itemsGroupInsumosActividadEtapa1.filter(item => !ev.some(removedItem => removedItem.inpp_Id === item.inpp_Id));
        } else {
            this.itemsGroupInsumosActividadEtapa1.push(...ev.filter(item => !this.itemsGroupInsumosActividadEtapa1.some(existing => existing.inpp_Id === item.inpp_Id)));
            this.itemsGroupInsumosActividadEtapa2 = this.itemsGroupInsumosActividadEtapa2.filter(item => !ev.some(removedItem => removedItem.inpp_Id === item.inpp_Id));
        }
        this.cdRef.detectChanges();
    }

    itemsAddedActividadEtapa(ev: any[], list: number) {
        if (list === 1) {
            ev.forEach(item => {
                if (!this.itemsGroupInsumosActividadEtapa1.some(existing => existing.inpp_Id === item.inpp_Id)) {
                    this.itemsGroupInsumosActividadEtapa1.push(item);
                }
            });
        } else {
            ev.forEach(item => {
                if (!this.itemsGroupInsumosActividadEtapa2.some(existing => existing.inpp_Id === item.inpp_Id)) {
                    // Aquí inicializamos la cantidad con el stock disponible
                    this.itemsGroupInsumosActividadEtapa2.push({
                        ...item,
                        cantidad: item.bopi_Stock || 0,  // Aseguramos que la cantidad se inicialice con el stock
                        cantidadError: '',
                        inputDisabled: false
                    });
                }
            });
        }

        // Remover de la lista opuesta para evitar duplicados
        if (list === 1) {
            this.itemsGroupInsumosActividadEtapa2 = this.itemsGroupInsumosActividadEtapa2.filter(item => !ev.some(addedItem => addedItem.inpp_Id === item.inpp_Id));
        } else {
            this.itemsGroupInsumosActividadEtapa1 = this.itemsGroupInsumosActividadEtapa1.filter(item => !ev.some(addedItem => addedItem.inpp_Id === item.inpp_Id));
        }

        this.cdRef.detectChanges();  // Actualizar la vista para reflejar los cambios
    }

    // Drag-and-Drop de insumos por Actividad y Etapa
    dropInsumosActividadEtapa(event: CdkDragDrop<InsumoPorProveedorExtendido[]>) {
        if (!event || !event.previousContainer || !event.container) {


            return;
        }

        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );

            const selectedItem = event.container.data[event.currentIndex];
            selectedItem.cantidad = selectedItem.bopi_Stock || 0;

        }

        this.cdRef.detectChanges();
    }

    //DRAG DE EQUIPOS DE SEGURIDAD POR ACTIVIDAD POR ETAPA

    itemsUpdatedEquipoActividadEtapa(ev: any[], list: number) {

        this.cdRef.detectChanges();
    }

    onCantidadKeyPressEquipoActividadEtapa(event: KeyboardEvent, item: EquipoPorProveedorExtendido) {
        const charCode = event.which ? event.which : event.keyCode;
        const charStr = String.fromCharCode(charCode);

        // Permitir solo números
        if (!charStr.match(/^[0-9]+$/)) {
            event.preventDefault();
            return;
        }

        const currentInputValue = (event.target as HTMLInputElement).value;
        const newQuantity = parseInt(currentInputValue + charStr, 10);

        // Verificar si la nueva cantidad es válida
        if (newQuantity > item.bopi_Stock || newQuantity < 1) {
            event.preventDefault();
        }
    }

    onCantidadChangeEquipoActividadEtapa(equipo: EquipoPorProveedorExtendido) {
        const nuevaCantidad = equipo.cantidad || 0;

        if (this.identityFlete === 'crear') {
            // Lógica para la creación del flete
            if (nuevaCantidad > equipo.bopi_Stock) {
                equipo.cantidadError = 'La cantidad no puede ser mayor que el stock disponible.';
            } else if (nuevaCantidad < 1) {
                equipo.cantidadError = 'La cantidad no puede ser menor que 1.';
            } else {
                equipo.cantidadError = '';
                equipo.stockRestante = equipo.bopi_Stock - nuevaCantidad;
            }
        } else if (this.identityFlete === 'editar') {
            // Lógica para la edición del flete
            const stockReal = equipo.bopi_Stock + equipo.cantidad; // Stock en la base de datos más la cantidad en el detalle
            const maxCantidad = stockReal; // Stock original antes de la edición

            if (nuevaCantidad > maxCantidad) {
                equipo.cantidadError = `La cantidad no puede ser mayor que el stock disponible (${maxCantidad}).`;
            } else if (nuevaCantidad < 1) {
                equipo.cantidadError = 'La cantidad no puede ser menor que 1.';
            } else {
                equipo.cantidadError = '';
                equipo.stockRestante = stockReal - nuevaCantidad;
            }
        }

        // Detectar cambios para actualizar la vista
        this.cdRef.detectChanges();

    }

    // FUNCIÓN PARA CALCULAR STOCK RESTANTE PARA EQUIPOS DE SEGURIDAD POR ACTIVIDAD Y ETAPA
    calculateStockEquipoActividadEtapa(equipo: EquipoPorProveedorExtendido): number | string {
        let stockRestante: number;

        if (this.identityFlete === 'crear') {
            // Lógica para la creación del flete
            stockRestante = equipo.bopi_Stock - (equipo.cantidad || 0);
        } else if (this.identityFlete === 'editar') {
            // Lógica para la edición del flete
            const stockReal = equipo.bopi_Stock + equipo.cantidad; // Stock en la base de datos más la cantidad en el detalle
            stockRestante = stockReal - (equipo.cantidad || 0);
        } else {
            // Por si identityFlete no está establecido
            stockRestante = equipo.bopi_Stock - (equipo.cantidad || 0);
        }

        return stockRestante >= 0 ? stockRestante : 'Stock agotado';
    }

    itemsRemovedEquipoActividadEtapa(ev: any[], list: number) {
        if (list === 1) {
            this.itemsGroupEquiposActividadEtapa2.push(...ev.filter(item => !this.itemsGroupEquiposActividadEtapa2.some(existing => existing.eqpp_Id === item.eqpp_Id)));
            this.itemsGroupEquiposActividadEtapa1 = this.itemsGroupEquiposActividadEtapa1.filter(item => !ev.some(removedItem => removedItem.eqpp_Id === item.eqpp_Id));
        } else {
            this.itemsGroupEquiposActividadEtapa1.push(...ev.filter(item => !this.itemsGroupEquiposActividadEtapa1.some(existing => existing.eqpp_Id === item.eqpp_Id)));
            this.itemsGroupEquiposActividadEtapa2 = this.itemsGroupEquiposActividadEtapa2.filter(item => !ev.some(removedItem => removedItem.eqpp_Id === item.eqpp_Id));
        }
        this.cdRef.detectChanges();
    }

    onToggleDragViewActividadEtapa() {

        
        if (this.mostrarEquiposSeguridadPorActividad) {
            this.ListadoEquiposPorActividadEtapa(this.form.get('acet_Id').value);
        } else {
            this.ListadoInsumosPorActividadEtapa(this.form.get('acet_Id').value);
        }
    }

    ListadoEquiposPorActividadEtapa(acet_Id: number) {

        
        this.detalleService.ListadoEquiposPorActividadEtapafiltrado(acet_Id).subscribe(
            (data: EquipoPorProveedorExtendido[]) => {
                this.itemsGroupEquiposActividadEtapa1 = data
                    .filter(equipo => equipo.bopi_Stock > 0) // Filtrar equipos con stock > 0
                    .map(equipo => ({
                        ...equipo,
                        cantidad: equipo.bopi_Stock || 0,
                        cantidadError: '',
                        inputDisabled: false,
                        stockRestante: equipo.bopi_Stock || 0
                    }));

                },
            (error) => {


            }
        );
    }
    

    itemsAddedEquipoActividadEtapa(ev: any[], list: number) {
        if (list === 1) {
            ev.forEach(item => {
                if (!this.itemsGroupEquiposActividadEtapa1.some(existing => existing.eqpp_Id === item.eqpp_Id)) {
                    this.itemsGroupEquiposActividadEtapa1.push(item);
                }
            });
        } else {
            ev.forEach(item => {
                if (!this.itemsGroupEquiposActividadEtapa2.some(existing => existing.eqpp_Id === item.eqpp_Id)) {
                    this.itemsGroupEquiposActividadEtapa2.push({
                        ...item,
                        cantidad: item.bopi_Stock || 0,
                        cantidadError: ''
                    });
                }
            });
        }

        if (list === 1) {
            this.itemsGroupEquiposActividadEtapa2 = this.itemsGroupEquiposActividadEtapa2.filter(item => !ev.some(addedItem => addedItem.eqpp_Id === item.eqpp_Id));
        } else {
            this.itemsGroupEquiposActividadEtapa1 = this.itemsGroupEquiposActividadEtapa1.filter(item => !ev.some(addedItem => addedItem.eqpp_Id === item.eqpp_Id));
        }
        this.cdRef.detectChanges();
    }

    dropEquiposActividadEtapa(event: CdkDragDrop<EquipoPorProveedorExtendido[]>) {
        if (!event || !event.previousContainer || !event.container) {

            return;
        }

        // Verifica si el elemento fue soltado en el mismo contenedor o en un contenedor diferente
        if (event.previousContainer === event.container) {
            // Si fue soltado en el mismo contenedor, solo reordena los elementos
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            // Si fue soltado en un contenedor diferente, mueve el equipo al nuevo contenedor
            transferArrayItem(
                event.previousContainer.data,  // Lista de origen
                event.container.data,          // Lista de destino
                event.previousIndex,           // Índice en la lista de origen
                event.currentIndex             // Índice en la lista de destino
            );

            // Después de transferir el equipo al grupo seleccionado, se actualiza la cantidad seleccionada
            const selectedItem = event.container.data[event.currentIndex];
            selectedItem.cantidad = selectedItem.bopi_Stock;  // La cantidad seleccionada por defecto será igual al stock disponible



        }

        // Detecta los cambios en la vista
        this.cdRef.detectChanges();
    }

    limpiarDragAndDropEquiposActividadEtapa() {
        this.itemsGroupEquiposActividadEtapa1 = [];
        this.itemsGroupEquiposActividadEtapa2 = [];
        this.cdRef.detectChanges();
    }

    deselectAllItemsEquiposActividadEtapa() {
        this.itemsGroupEquiposActividadEtapa1.push(...this.itemsGroupEquiposActividadEtapa2.filter(item => !this.itemsGroupEquiposActividadEtapa1.some(existing => existing.eqpp_Id === item.eqpp_Id)));
        this.itemsGroupEquiposActividadEtapa2 = [];
        this.cdRef.detectChanges();
    }

    selectAllItemsEquiposActividadEtapa() {
        this.itemsGroupEquiposActividadEtapa2.push(...this.itemsGroupEquiposActividadEtapa1.filter(item => !this.itemsGroupEquiposActividadEtapa2.some(existing => existing.eqpp_Id === item.eqpp_Id)));
        this.itemsGroupEquiposActividadEtapa1 = [];
        this.cdRef.detectChanges();
    }

    verActaCompromisoDetalle(encabezadoId: number) {
        this.CreateEdit = false;
        this.DetalleFlete = false;

        this.detalleService.Buscar(encabezadoId).subscribe(
            (data: FleteDetalle[]) => {
                const verificadosInsumos = data.filter(det => det.flde_llegada && det.flde_TipodeCarga); // Insumos verificados
                const verificadosEquipos = data.filter(det => det.flde_llegada && !det.flde_TipodeCarga); // Equipos de seguridad verificados


                this.Listado();
                // Generamos el PDF con los datos obtenidos
                this.generarActaDeCompromisoDetalle(encabezadoId);
                const encargadoNombre = this.form.get('encargado')?.value ?? 'Desconocido';
                const horaSalida = this.form.get('flen_FechaHoraSalida')?.value ?? 'N/A';
                const ubicacionSalida = this.form.get('flen_UbicacionSalida')?.value ?? 'N/A';
                const horaLlegada = this.form.get('flen_FechaHoraLlegada')?.value ?? 'N/A';
                const ubicacionLlegada = this.form.get('flen_UbicacionLlegada')?.value ?? 'N/A';

                const mensajeAlerta = `Nuevo flete enviado:\n
                Encargado: ${encargadoNombre}\n
                ID del Flete: ${encabezadoId}\n
                Hora de Salida: ${horaSalida}\n
                Ubicación de Salida: ${ubicacionSalida}\n
                Hora de Llegada: ${horaLlegada}\n
                Ubicación de Llegada: ${ubicacionLlegada}`;


                this.GuardarEnviarAlertas(mensajeAlerta);
                this.isPdfVisibleDetalle = true;

            },
            error => {

                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al generar el PDF.', life: 3000, styleClass: 'iziToast-custom' });
            }
        );
    }

    verActaCompromiso(encabezadoId: number) {
        this.CreateEdit = false;
        this.DetalleFlete = false;

        this.detalleService.Buscar(encabezadoId).subscribe(
            (data: FleteDetalle[]) => {
                const verificadosInsumos = data.filter(det => det.flde_llegada && det.flde_TipodeCarga); // Insumos verificados
                const verificadosEquipos = data.filter(det => det.flde_llegada && !det.flde_TipodeCarga); // Equipos de seguridad verificados


                this.Listado();
                // Generamos el PDF con los datos obtenidos
                this.generarActaDeCompromisoDetalle(encabezadoId);
                const encargadoNombre = this.form.get('encargado')?.value ?? 'Desconocido';
                const horaSalida = this.form.get('flen_FechaHoraSalida')?.value ?? 'N/A';
                const ubicacionSalida = this.form.get('flen_UbicacionSalida')?.value ?? 'N/A';
                const horaLlegada = this.form.get('flen_FechaHoraLlegada')?.value ?? 'N/A';
                const ubicacionLlegada = this.form.get('flen_UbicacionLlegada')?.value ?? 'N/A';

                const mensajeAlerta = `Nuevo flete enviado:\n
                Encargado: ${encargadoNombre}\n
                ID del Flete: ${encabezadoId}\n
                Hora de Salida: ${horaSalida}\n
                Ubicación de Salida: ${ubicacionSalida}\n
                Hora de Llegada: ${horaLlegada}\n
                Ubicación de Llegada: ${ubicacionLlegada}`;


                this.GuardarEnviarAlertas(mensajeAlerta);
                this.isPdfVisible = true;

            },
            error => {

                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al generar el PDF.', life: 3000, styleClass: 'iziToast-custom' });
            }
        );
    }

    //REPORTESSSSSSSSSSSSSS
    abrirVistaReportes(flete: Flete) {
        this.flete = flete;
        this.detalleService.Buscar(flete.flen_Id).subscribe(
            (data: FleteDetalle[]) => {
                this.fleteDetalles = data;
                this.noVerificados = data.filter(det => !det.flde_llegada);
                this.verificados = data.filter(det => det.flde_llegada);

                this.controlCalidadService.BuscarIncidencias(flete.flen_Id).subscribe(
                    (respuesta: any) => {
                        this.incidencias = Array.isArray(respuesta) ? respuesta : [respuesta];
                        this.showReporte = true;
                        this.Index = false;
                    },
                    (error) => {

                        this.showReporte = true;
                        this.Index = false;
                    }
                );
            },
            (error) => {

            }
        );
    }

    viewPDF(reportType: string) {
        let pdfBlob: Blob;
        if (reportType === 'general') {
            pdfBlob = this.generateReporteGeneral();
        } else if (reportType === 'incidencias') {
            pdfBlob = this.generateReporteIncidencias();
        } else if (reportType === 'insumos') {
            pdfBlob = this.generateReporteInsumos();
        }
        const pdfURL = URL.createObjectURL(pdfBlob);
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(pdfURL);
    }

    generateReporteGeneral(): Blob {
        const doc = new jsPDF();

        // Añadir Logo y Encabezado
        // const logo = 'assets/demo/images/logo.png';
        // doc.addImage(logo, 'PNG', 10, 10, 50, 20);
        doc.setFontSize(18);
        doc.text(`Reporte General - Flete ${this.flete.codigo}`, 70, 20);

        // Añadir información del flete
        autoTable(doc, {
            head: [['Fecha de Salida', 'Fecha de Llegada', 'Destino', 'Destino Nombre', 'Supervisor']],
            body: [[this.flete.flen_FechaHoraSalida, this.flete.flen_FechaHoraLlegada,
            this.flete.flen_DestinoProyecto ? 'Proyecto' : 'Bodega',
            this.flete.flen_DestinoProyecto ? this.flete.proy_Nombre : this.flete.bode_Descripcion,
            this.flete.encargado]],
            startY: 40,
            headStyles: { fillColor: [243, 211, 44] },
            styles: { fillColor: [44, 44, 44] },
        });
        let finalY = (doc as any).lastAutoTable.finalY + 10;

        // Añadir tabla de Insumos Llegaron
        if (this.verificados.length > 0) {
            autoTable(doc, {
                head: [['Descripción', 'Unidad de Medida', 'Cantidad']],
                body: this.verificados.map(detalle => [detalle.insu_Descripcion, detalle.unme_Nombre, detalle.flde_Cantidad]),
                startY: finalY,
                theme: 'grid',
                headStyles: { fillColor: [243, 211, 44] },
                styles: { fillColor: [44, 44, 44] },
            });
            finalY = (doc as any).lastAutoTable.finalY + 10;
        }

        // Datos para la tabla de insumos no Verificados
        if (this.noVerificados.length > 0) {
            autoTable(doc, {
                head: [['Descripción', 'Unidad de Medida', 'Cantidad']],
                body: this.noVerificados.map(detalle => [detalle.insu_Descripcion, detalle.unme_Nombre, detalle.flde_Cantidad]),
                startY: finalY,
                theme: 'grid',
                headStyles: { fillColor: [243, 211, 44] },
                styles: { fillColor: [44, 44, 44] },
            });
            finalY = (doc as any).lastAutoTable.finalY + 10;
        }

        // Añadir tabla de Incidencias
        if (this.incidencias.length > 0) {
            autoTable(doc, {
                head: [['Descripción', 'Fecha y Hora']],
                body: this.incidencias.map(incidencia => [incidencia.flcc_DescripcionIncidencia, incidencia.flcc_FechaHoraIncidencia]),
                startY: finalY,
                theme: 'grid',
                headStyles: { fillColor: [243, 211, 44] },
                styles: { fillColor: [44, 44, 44] },
            });
        }

        return doc.output('blob');
    }

    generateReporteIncidencias(): Blob {
        const doc = new jsPDF();

        // Añadir Logo y Encabezado
        const logo = 'assets/demo/images/logo.png';
        doc.addImage(logo, 'PNG', 10, 10, 50, 20);
        doc.setFontSize(18);
        doc.text(`Reporte de Incidencias - Flete ${this.flete.codigo}`, 70, 20);

        // Añadir información del flete
        autoTable(doc, {
            head: [['Fecha de Salida', 'Fecha de Llegada', 'Destino', 'Destino Nombre', 'Supervisor']],
            body: [[this.flete.flen_FechaHoraSalida, this.flete.flen_FechaHoraLlegada,
            this.flete.flen_DestinoProyecto ? 'Proyecto' : 'Bodega',
            this.flete.flen_DestinoProyecto ? this.flete.proy_Nombre : this.flete.bode_Descripcion,
            this.flete.encargado]],
            startY: 40,
            headStyles: { fillColor: [243, 211, 44] },
            styles: { fillColor: [44, 44, 44] },
        });
        let finalY = (doc as any).lastAutoTable.finalY + 10;

        // Añadir tabla de Incidencias
        if (this.incidencias.length > 0) {
            autoTable(doc, {
                head: [['Descripción', 'Fecha y Hora']],
                body: this.incidencias.map(incidencia => [incidencia.flcc_DescripcionIncidencia, incidencia.flcc_FechaHoraIncidencia]),
                startY: finalY,
                theme: 'grid',
                headStyles: { fillColor: [243, 211, 44] },
                styles: { fillColor: [44, 44, 44] },
            });
        }

        return doc.output('blob');
    }

    generateReporteInsumos(): Blob {
        const doc = new jsPDF();

        // Añadir Logo y Encabezado
        const logo = 'assets/demo/images/logo.png';
        doc.addImage(logo, 'PNG', 10, 10, 50, 20);
        doc.setFontSize(18);
        doc.text(`Reporte de Insumos - Flete ${this.flete.codigo}`, 70, 20);

        // Añadir información del flete
        autoTable(doc, {
            head: [['Fecha de Salida', 'Fecha de Llegada', 'Destino', 'Destino Nombre', 'Supervisor']],
            body: [[this.flete.flen_FechaHoraSalida, this.flete.flen_FechaHoraLlegada,
            this.flete.flen_DestinoProyecto ? 'Proyecto' : 'Bodega',
            this.flete.flen_DestinoProyecto ? this.flete.proy_Nombre : this.flete.bode_Descripcion,
            this.flete.encargado]],
            startY: 40,
            headStyles: { fillColor: [243, 211, 44] },
            styles: { fillColor: [44, 44, 44] },
        });
        let finalY = (doc as any).lastAutoTable.finalY + 10;

        // Añadir tabla de Insumos Llegaron
        if (this.verificados.length > 0) {
            autoTable(doc, {
                head: [['Descripción', 'Unidad de Medida', 'Cantidad']],
                body: this.verificados.map(detalle => [detalle.insu_Descripcion, detalle.unme_Nombre, detalle.flde_Cantidad]),
                startY: finalY,
                theme: 'grid',
                headStyles: { fillColor: [243, 211, 44] },
                styles: { fillColor: [44, 44, 44] },
            });
            finalY = (doc as any).lastAutoTable.finalY + 10;
        }

        // Añadir tabla de Insumos No Llegaron
        if (this.noVerificados.length > 0) {
            autoTable(doc, {
                head: [['Descripción', 'Unidad de Medida', 'Cantidad']],
                body: this.noVerificados.map(detalle => [detalle.insu_Descripcion, detalle.unme_Nombre, detalle.flde_Cantidad]),
                startY: finalY,
                theme: 'grid',
                headStyles: { fillColor: [243, 211, 44] },
                styles: { fillColor: [44, 44, 44] },
            });
        }

        return doc.output('blob');
    }

    //   ACTA DE COMPROMISO
    private generarActaDeCompromiso(encabezadoId: number) {
        this.detalleService.Buscar(encabezadoId).subscribe(
            (data: FleteDetalle[]) => {
                // Dividir los detalles entre insumos y equipos de seguridad
                const verificadosInsumos = data.filter(det => det.flde_llegada && det.flde_TipodeCarga); // Insumos verificados
                const noVerificadosInsumos = data.filter(det => !det.flde_llegada && det.flde_TipodeCarga); // Insumos no verificados

                const verificadosEquipos = data.filter(det => det.flde_llegada && !det.flde_TipodeCarga); // Equipos de seguridad verificados
                const noVerificadosEquipos = data.filter(det => !det.flde_llegada && !det.flde_TipodeCarga); // Equipos de seguridad no verificados

                // Combinar los verificados y no verificados para el PDF
                const insumos = [...verificadosInsumos, ...noVerificadosInsumos];
                const equiposSeguridad = [...verificadosEquipos, ...noVerificadosEquipos];

                

                // Generar el PDF
                const doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                this.addHeaderActa(doc, encabezadoId);
                this.addContentActa(doc, insumos, equiposSeguridad);
                this.addFooter(doc);

                this.openPdfInDiv(doc);
            },
            (error) => {


            }
        );
    }

    private addContentActa(doc: jsPDF, insumos: any[], equiposSeguridad: any[]) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        let currentY = 90;

        // Ajusta el ancho del texto para que no se salga del margen derecho
        const textWidth = doc.internal.pageSize.width - 40;  // Margen de 20 a cada lado
        doc.text('Yo, mediante este documento, me hago responsable del manejo que se llevara acabo para los siguientes suministros:', 20, currentY, { maxWidth: textWidth });

        currentY += 10;

        // Generar la tabla de insumos
        if (insumos.length > 0) {
            doc.text('Insumos:', 20, currentY);
            currentY += 10;
            // Añadimos la columna "Observación" después de la columna de "Cantidad"
            this.generateTableWithPagination(doc, insumos.map(insumo => [insumo.insu_Descripcion, insumo.flde_Cantidad, '']), ['Insumo', 'Cantidad', 'Observación'], currentY);
            currentY += insumos.length * 10 + 10;
        }

        // Asegura un espacio adecuado entre las tablas
        if (equiposSeguridad.length > 0) {
            currentY += 10;  // Añade espacio adicional antes del título de "Equipos de Seguridad"
            doc.text('Equipos de Seguridad:', 20, currentY);
            currentY += 10;
            // Añadimos la columna "Observación" después de la columna de "Cantidad"
            this.generateTableWithPagination(doc, equiposSeguridad.map(equipo => [equipo.equs_Nombre, equipo.flde_Cantidad, '']), ['Equipo', 'Cantidad', 'Observación'], currentY);
            currentY += equiposSeguridad.length * 10 + 10;
        }

        // Espacio para firmas
        const signatureY = currentY + 30;
        doc.text('________________________', 20, signatureY);
        doc.text('Firma del Encargado', 20, signatureY + 10);

        doc.text('________________________', 80, signatureY);
        doc.text('Firma del Transportista', 80, signatureY + 10);

        doc.text('________________________', 140, signatureY);
        doc.text('Firma del Receptor', 140, signatureY + 10);
    }
    //PARA PDF DETALLE

    private openPdfInDivDetalle(doc: jsPDF) {
        this.isPdfVisibleDetalle = true;

        setTimeout(() => {
            const string = doc.output('datauristring');
            const iframe = `<iframe width='100%' height='900px' src='${string}'></iframe>`;
            const pdfContainer = document.getElementById('pdfContainerDetalle');

            if (pdfContainer) {
                pdfContainer.innerHTML = iframe;
                this.cd.detectChanges();
            }
        }, 500);
    }

    regresarDetalle() {
        this.isPdfVisibleDetalle = false;
        this.CreateEdit = false;
        this.DetalleFlete = true;
        this.Index = false;
    }

    private generarActaDeCompromisoDetalle(encabezadoId: number) {
        this.detalleService.Buscar(encabezadoId).subscribe(
            (data: FleteDetalle[]) => {
                // Dividir los detalles entre insumos y equipos de seguridad
                const verificadosInsumos = data.filter(det => det.flde_llegada && det.flde_TipodeCarga); // Insumos verificados
                const noVerificadosInsumos = data.filter(det => !det.flde_llegada && det.flde_TipodeCarga); // Insumos no verificados

                const verificadosEquipos = data.filter(det => det.flde_llegada && !det.flde_TipodeCarga); // Equipos de seguridad verificados
                const noVerificadosEquipos = data.filter(det => !det.flde_llegada && !det.flde_TipodeCarga); // Equipos de seguridad no verificados

                // Combinar los verificados y no verificados para el PDF
                const insumos = [...verificadosInsumos, ...noVerificadosInsumos];
                const equiposSeguridad = [...verificadosEquipos, ...noVerificadosEquipos];

                

                // Generar el PDF
                const doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                this.addHeaderActa(doc, encabezadoId);
                this.addContentActa(doc, insumos, equiposSeguridad);
                this.addFooter(doc);

                this.openPdfInDivDetalle(doc);
            },
            (error) => {


            }
        );
    }

    // Método privado para agregar encabezado del acta de compromiso
    private addHeaderActa(doc: jsPDF, encabezadoId: number) {
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();
        const logo = '/assets/demo/images/disenoactualizado.png';

        doc.addImage(logo, 'PNG', 0, -18, 220, 50);
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text(`Acta de Compromiso`, doc.internal.pageSize.width / 2, 50, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Fecha: ${date} Hora: ${time}`, 20, 70);
        doc.text(`Flete ID: ${encabezadoId}`, 20, 80);

        // Más contenido según tus necesidades
    }

    // Método privado para abrir el PDF en un contenedor HTML

    private openPdfInDiv(doc: jsPDF) {
        this.isPdfVisible = true;

        setTimeout(() => {
            const string = doc.output('datauristring');
            const iframe = `<iframe width='100%' height='900px' src='${string}'></iframe>`;
            const pdfContainer = document.getElementById('pdfContainer');

            if (pdfContainer) {
                pdfContainer.innerHTML = iframe;
                this.cd.detectChanges();
            }
        }, 500);
    }

    // Método para generar tablas con paginación

    private generateTableWithPagination(doc: jsPDF, data: any[], headers: string[], startY: number) {
        const autoTableConfig = {
            startY,
            head: [headers],
            body: data,
            theme: 'striped',
            styles: { halign: 'center', font: 'helvetica', cellPadding: 3, lineWidth: 0.1 },
            headStyles: { fillColor: [255, 237, 58], textColor: [0, 0, 0], fontSize: 12, fontStyle: 'bold', halign: 'center' },
            bodyStyles: { textColor: [0, 0, 0], fontSize: 10, halign: 'center' },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            margin: { top: 60, bottom: 40 },
            didDrawPage: () => {
                this.addFooter(doc);
            }
        };

        doc.autoTable(autoTableConfig);
    }

    // Método privado para agregar un pie de página al documento PDF
    private addFooter(doc: jsPDF) {
        const footerLogo = '/assets/demo/images/disenoactualizado.png';  // Ruta del logo del pie de página
        const totalPages = doc.getNumberOfPages(); // Obtén el número total de páginas

        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);  // Establece la página actual
            doc.addImage(footerLogo, 'PNG', 0, 280, 220, 50);  // Agrega el logo al pie de página
            doc.setFontSize(12);  // Configura el tamaño de la fuente para el número de página
            doc.setTextColor(0, 0, 0);  // Configura el color del texto para el número de página
            doc.text(`Página ${i}`, doc.internal.pageSize.width - 94, 292, { align: 'right' });  // Agrega el número de página
        }
    }

    //SUBIDA DE ARCHIVOS
    // Método para manejar la selección del archivo
    onFileSelected(event: any) {
        const selectedFile = event.files[0];
        if (selectedFile) {
            this.file = selectedFile;

            const fileReader = new FileReader();
            fileReader.onload = (e: any) => {
                const fileType = selectedFile.type;

                if (fileType.startsWith('image/')) {
                    this.previewImage = e.target.result;
                    this.previewPDF = null;
                } else if (fileType === 'application/pdf') {
                    const pdfBlob = new Blob([e.target.result], { type: 'application/pdf' });
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    this.previewPDF = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
                    this.previewImage = null;
                }
            };

            if (selectedFile.type === 'application/pdf') {
                fileReader.readAsArrayBuffer(selectedFile);
            } else {
                fileReader.readAsDataURL(selectedFile);
            }
        }
    }

    clearFile() {
        this.file = null;
        this.previewImage = null;
        this.previewPDF = null;
    }

    isImage(url: string): boolean {
        return url?.match(/\.(jpeg|jpg|gif|png)$/) != null;
    }
    // Método para manejar la subida del archivo
    onComprobanteUpload(callback: (url: string) => void) {
        if (this.comprobarteFile) {
            this.service.subirComprobante(this.comprobarteFile).subscribe(
                (response) => {


                    callback(response.fileUrl); // Ejecuta el callback con la URL del archivo
                },
                (error) => {

                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al subir el archivo.', styleClass: 'iziToast-custom' });
                    callback(null); // Ejecuta el callback con null en caso de error
                }
            );
        } else {
            callback(null); // Ejecuta el callback con null si no hay archivo seleccionado
        }
    }

    clearFileForm() {
        // Limpiar el formulario de verificación
        // this.verificarForm.reset();

        this.IndexactivoVerificacion = 1;

        // Limpiar las propiedades
        this.file = null;
        this.previewImage = null;
        this.previewPDF = null;


        // Reiniciar los campos
        this.verificarForm.patchValue({
            flen_ComprobanteLLegada: null,

        });

        // Si tienes algún campo adicional para limpiar, puedes hacerlo aquí
        this.limpiarDocumento();
    }

    // Método adicional para limpiar otros aspectos del formulario si es necesario
    limpiarDocumento() {
        // Limpia cualquier otra propiedad o estado que no esté cubierto por clearFileForm
        // Ejemplo: reiniciar contadores, flags, etc.
        this.filePreviewUrl = '';
        this.previewImage = null;
        this.file = null;
        this.previewImage = null;
        this.previewPDF = null;
    }

    onCambioTab(event: any) {

        this.IndexactivoVerificacion = event.index;
        this.updateTabState();
    }

    goToNextTab() {
        if (this.verificarForm.valid) {
            if (this.IndexactivoVerificacion < 1) {
                this.IndexactivoVerificacion++;
                this.updateTabState();
            }
        } else {
            Object.keys(this.verificarForm.controls).forEach(key => {
                const controlErrors = this.verificarForm.get(key)?.errors;
                if (controlErrors) {
                    this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'Ingrese una fecha válida.' });

                }
            });
        }
    }

    goToPreviousTab() {
        if (this.IndexactivoVerificacion > 0) {
            this.IndexactivoVerificacion--;
            this.updateTabState();
        }
    }

    // Método para actualizar el estado de los booleanos según el índice activo
    updateTabState() {
        this.isFirstTab = this.IndexactivoVerificacion === 0;
        this.isSecondTab = this.IndexactivoVerificacion === 1;
    }

}