import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    NgZone,
    OnInit,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { PresupuestoService } from 'src/app/demo/services/servicesproyecto/presupuesto.service';
import { Presupuesto } from 'src/app/demo/models/modelsproyecto/presupuestoviewmodel';
import { MenuItem, SelectItem } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { PresupuestotasacambioService } from 'src/app/demo/services/servicesproyecto/presupuestotasacambio.service';
import { PresupuestodetalleService } from 'src/app/demo/services/servicesproyecto/presupuestodetalle.service';
import { MessageService } from 'primeng/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CookieService } from 'ngx-cookie-service';
import { Proyecto } from 'src/app/demo/models/modelsproyecto/proyectoviewmodel';
import { ciudad } from 'src/app/demo/models/modelsgeneral/ciudadviewmodel';
import { Cliente } from 'src/app/demo/models/modelsgeneral/clienteviewmodel';
import { Estado } from 'src/app/demo/models/modelsgeneral/estadoviewmodel ';
import { Pais } from 'src/app/demo/models/modelsgeneral/paisviewmodel';
import { ciudadService } from 'src/app/demo/services/servicesgeneral/ciudad.service';
import { ClienteService } from 'src/app/demo/services/servicesgeneral/cliente.service';
import { EstadoService } from 'src/app/demo/services/servicesgeneral/estado.service';
import { PaisService } from 'src/app/demo/services/servicesgeneral/pais.service';
import { ProyectoService } from 'src/app/demo/services/servicesproyecto/proyecto.service';
import { ActividadPorEtapaService } from 'src/app/demo/services/servicesproyecto/actividadporetapa.service';
import { EtapaPorProyectoService } from 'src/app/demo/services/servicesproyecto/etapaporproyecto.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { evaluate, index } from 'mathjs';
import { TipoProyectoService } from 'src/app/demo/services/servicesgeneral/tipoproyecto.service';
import { AutoComplete } from 'primeng/autocomplete';
import { ProveedorService } from 'src/app/demo/services/servicesinsumo/proveedor.service';
import { Referencia } from 'src/app/demo/models/modelsproyecto/referenciaceldaviewmodel';
import { ReferenciaService } from 'src/app/demo/services/servicesproyecto/referencia-celda.service';
import { filter } from 'rxjs';
import { ThisReceiver } from '@angular/compiler';

interface Conversion {
    pptc_Id: number;
    selectt: boolean;
    taca_Id: number;
    monedaDe: string;
    valorDe: number;
    monedaA: string;
    valorA: number;
    listaConversiones: SelectItem[];
}
interface InsumosPresupuesto {
    codigo?: any; // Generar un número secuencial
    inpp_Id: any;
    select: boolean;
    id: any;
    estado: any;
    inpa_Id: any;
    costo?: any;
    unme_Nombre: any;
    unme_Nomenclatura: any;
    costoFormula?: any;
    inpa_ActividadLlenado: any;
    acet_Id: any;
    cantidad?: any;
    desperdicio: any;
    costoUnitario: any;
    cantidadFormula?: any;
    rendimiento?: any;
    rendimientoFormula?: any;
    insumo?: any;
    proveedor?: any;
    material?: any;
    categoria?: any;
    rendimientoReferencias: any[];
    cantidadReferencias: any[];
    costoReferencias: any[];
}
interface MaquinariasAgregadas {
    codigo?: any; // Generar un número secuencial
    rmac_Id: any;
    mapr_Id: any;
    select: boolean;
    id: any;
    estado: any;
    renta: any;
    subtotal: any;
    rmac_ActividadLlenado: any;
    prov_Descripcion: any;
    nive_Descripcion: any;
    maqu_Descripcion: any;
    rmac_CantidadRenta: any;
    rmac_CantidadRentaFormula: any;
    rmac_PrecioRentaFormula: any;
    rmac_CantidadMaquinasFormula: any;
    rmac_PrecioRenta: any;
    rmac_CantidadMaquinas: any;
    acet_Id: any;
    rmac_PrecioRentaReferencias: any[];
    rmac_CantidadMaquinasReferencias: any[];
    rmac_CantidadRentaReferencias: any[];
}
interface InsumoOptions {
    codigo?: any;
    estado: any;
    id: any;
    inpp_Id: any;
    inpa_Id: any;
    prov_Id: any;
    unme_Nombre: any;
    unme_Nomenclatura: any;
    selected: boolean;
    inpp_Preciocompra?: any;
    insu_Descripcion?: any;
    prov_Descripcion?: any;
    mate_Descripcion?: any;
    cate_Descripcion?: any;
}
interface MaquinariaOptions {
    codigo?: any;
    estado: any;
    renta: any;
    id: any;
    mapr_Id: any;
    maqu_Descripcion: any;
    prov_Id: any;
    nive_Descripcion: any;
    prov_Descripcion: any;
    mapr_PrecioCompra: number;
    selected: boolean;
    mapr_DiaHora: any;
}
interface expandedRows {
    [key: string]: boolean;
}
@Component({
    selector: 'app-presupuesto',
    templateUrl: './presupuesto.component.html',
    styleUrl: './presupuesto.component.scss',
    providers: [MessageService, CookieService],
})
export class PresupuestoComponent implements OnInit {
    //#region Presupuesto
    private originalMaterialMap = new Map<number, number>();
    @ViewChildren('cantidadInput') cantidadInputs: QueryList<ElementRef>;
    @ViewChildren('materialInput') materialInputs: QueryList<ElementRef>;
    @ViewChildren('manoDeObraInput') manoDeObraInputs: QueryList<ElementRef>;
    @ViewChildren('maquinariaInput') maquinariaInputs: QueryList<ElementRef>;
    @ViewChildren('descripcionAutoComplete')descripcionAutoCompletes: QueryList<AutoComplete>;
    @ViewChildren('etapaAutoComplete')etapaAutoCompletes: QueryList<AutoComplete>;
    @ViewChildren('unidadAutoComplete')unidadAutoCompletes: QueryList<AutoComplete>;
    @ViewChildren('proyectoAutocomplete') proyectoAutocomplete: QueryList<AutoComplete>;
    @ViewChildren('clienteAutocomplete') clienteAutocomplete: QueryList<AutoComplete>;
    @ViewChildren('empleadoAutocomplete') empleadoAutocomplete: QueryList<AutoComplete>;
    @ViewChildren('titulo') tituloInput: QueryList<ElementRef>;
    @ViewChildren('descripcion') descripcionInput: QueryList<ElementRef>;
    @ViewChildren('ganancia') gananciaInput: QueryList<ElementRef>;
    actualizarMaterial: boolean = false;
    actualizarMaquinaria: boolean = false;
    imprimirConte: boolean = false;
    disabledArticulos: boolean = false;
    prov_Descripcion: string = '';
    tabInsumo: boolean = false;
    tabMaquinaria: boolean = false;
    expandedRows: expandedRows = {};
    presupuestos: Presupuesto[] = [];
    btnAgregar: boolean = false;
    filaExpandida: any = null;
    items: MenuItem[] = [];
    detailItems: MenuItem[] = [];
    isEtapaSelected = false;
    isActividadSelected = false;
    
    isUnidadSelected = false;
    rechazadoItems: MenuItem[] = [];
    Index: boolean = true;
    Create: boolean = false;
    ValorImpuesto: any;
    Detalle: boolean = false;
    Editar: boolean = false;
    isPdfVisible: boolean = false;
    isRegresarVisible: boolean = false;
    Detail: boolean = false;
    actividadInsumo: string = '';
    etapaInsumo: string = '';
    proyectoInsumo: string = '';
    unidadInsumo: string = '';
    materialInsumo: string = '0';
    maquinariaInsumo: string = '0';
    subtotalInsumo: number = 0;
    totalActividad: number = 0;

    minDate: Date;
    checked: boolean = false;
    checked2: boolean = false;
    checked3: boolean = false;
    maquinariaCalculo: boolean = false;
    actividadLlenado: boolean = false;

    form: FormGroup;
    formUnidadMedida: FormGroup;
    formRechazado: FormGroup;
    paginator: boolean = false;
    submitted: boolean = false;
    submittedEmpleado: boolean = false;
    submittedCliente: boolean = false;
    submittedProyecto: boolean = false;
    Titulo: string = 'Nuevo Presupuesto';
    opcion: string = 'Guardar';
    valSwitch: boolean = false;
    nombreSupervisor: string = '';
    nombreElaborador: string = '';
    nombreCliente: string = '';
    btnAgregarActivo: boolean = false;
    btnEliminarActivo: boolean = false;
    empl_Id: string = '';
    clie_Id: string = '';
    taca_Id: number = 0;
    pptc_Id: number = 0;
    etpr_Id: number = 0;
    unme_Id: string = '0';
    esLlenado: boolean = false;
    insertUnidad: boolean = false;
    etap_Descripcion: string = '';
    etap_Id: number = 0;
    etapaInsertada: boolean = false;
    valoresOriginales: { [key: string]: number } = {};
    valoresOriginalesSubtotal: { [key: string]: number } = {};
    valueFilterEtapa: string = '';
    valueFilterActividad: string = '';
    valueFilterUnidad: string = '';
    PrecioManoObraExiste: boolean = false;
    mone_Id: number = 0;
    monedas: SelectItem[] = [];
    SubtotalSinIsv: string = '0';

    Datos = [{}];
    DeletePresupuesto: boolean = false;
    detalle_pren_Id: string = '';
    detalle_pren_Titulo: string = '';
    detalle_pren_Estado: string = '';
    detalle_pren_Descripcion: string = '';
    detalle_cliente: string = '';
    detalle_empleado: string = '';
    detalle_pren_Observacion: string = '';
    detalle_pren_Fecha: Date;
    detalle_proyecto: string = '';
    detalle_pren_Porcentaje: number = 0;
    detalle_usuaCreacion: string = '';
    detalle_usuaModificacion: string = '';
    detalle_FechausuaCreacion: string = '';
    detalle_FechausuaModificacion: string = '';
    selectedCargoDescripcion: string = '';
    detallesOptions: any[] = [];


    opcionImprimir: boolean = false;
    tipoImpresion: string;

    conversiones: Conversion[] = [];
    selectedPresupuesto: any;
    etapaOptions: any[] = [];
    selectEliminarConversion: boolean = false;
    opcionEliminarConversion: boolean = false;
    nombreMonedaDe: string = '';
    nombreMonedaA: string = '';
    actividadOptions: any[] = [];
    presupuestoOptions: any[] = [];
    presupuestoOptionsSort: any[] = [];
    insumosOptions: InsumoOptions[] = [];
    maquinariaOptions: MaquinariaOptions[] = [];
    maquinariasAgregadas: MaquinariasAgregadas[] = [];
    maquinariasAgregadasLlenado: MaquinariasAgregadas[] = [];
    insumosOptionsFiltrados: InsumoOptions[] = [];
    proyectoOptions: any[] = [];
    etapaArticuloOptions: any[] = [];
    actividadArticuloOptions: any[] = [];
    proveedorOptions: any[] = [];
    proyectoOptions2: any[] = [];
    filteredPresupuesto: any[] = [];
    filteredUndiad: any[] = [];
    filteredProyecto: any[] = [];
    filteredEtapaArticulo: any[] = [];
    filteredActividadArticulo: any[] = [];
    filteredProyecto2: any[] = [];
    filteredProveedor: any[] = [];

    selectedCountryAdvanced: any[] = [];
    selectedProjectAdvanced: any[] = [];
    selectpresupuesto: SelectItem[] = [];
    listunidades: any[] = [];
    listconversion: any[] = [];
    selectconversiones: SelectItem[] = [];
    selectedConversion: number | null = null;
    abreviaturaMoneda: string = '';
    abreviaturaMonedaConversion: string = '';
    valorMonedaConversion: number = 0;
    filteredEtapas: any[] = [];
    empleados: any[] = [];
    clientes: any[] = [];
    impuesto: any[] = [];

    actividades: any[] = [];
    lisarpresupuestoXconverison: any[] = [];
    ModalImpuesto: boolean = false;
    ocultarActividades: boolean = false;
    selectedEtapaAdvanced: any[] = [];
    presupuestoNombre: string = '';
    presupuestoOpcion: string = '';
    filteredActividades: any[] = [];
    filtradoEmpleado: any[] = [];
    filtradoCliente: any[] = [];
    selectedActividadAdvanced: any[] = [];
    empl_DNI: string = '';
    copc_Id: number = 0;
    pren_Id: number = 0;
    Delete: boolean = false;
    modalGuardarInfo: boolean = false;
    infoGuardad: boolean = false;
    llenadoPresupuesto: any;
    modalUnidadMedida: boolean = false;
    modalUnidad: boolean = false;
    modalEditar: boolean = false;
    selectedInsumos: any[] = [];
    defaultPorcentaje: string = '';
    prueba4: boolean = false;
    insumos: InsumosPresupuesto[] = [];
    insumosLlenado: InsumosPresupuesto[] = [];
    insumosFiltrados: any[] = [];
    maquinariasFiltrados: any[] = [];
    presupuestoPlantilla: string = '';
    prueba = [
        {
            item: '1.00',
            descripcion: '',
            cant: '0.00',
            unidad: '',
            manoDeObra: '0.00',
            material: '0.00',
            maquinaria: '0.00',
            esEtapa: true,
            invalid: false,
            pu: '0.00',
            subtotal: '0.00',
            puUSD: '0.00',
            etap_Id: 0,
            subtotalUSD: '0.00',
            manoDeObraUtili: '0.00',
            materialUtili: '0.00',
            subtotalUtil: '0.00',
            Isv: '0.00',
            puUtili: '0.00',
            puUSDUtili: '0.00',
            subtotalUSDUtili: '0.00',
            etpr_Id: 0,
            subtotalConIsv: '0.00',
        },
        {
            item: '1.01',
            descripcion: '',
            cant: '0.00',
            esIsv: false,
            empl_Id: 0,
            unidad: '',
            manoDeObra: '0.00',
            acetId: 0,
            copc_Id: 0,
            acetIdLlenado: 0,
            actiId: 0,
            material: '0.00',
            maquinaria: '0.00',
            maquinariaTotal: '0.00',
            maquinariaFormula: '',
            manoObraTotal: '0.00',
            materialTotal: '0.00',
            esEtapa: false,
            invalid: false,
            isSwitchDisabled: false,
            expanded: false,
            id: 0,
            porcen: this.defaultPorcentaje,
            verification: false,
            pu: '0.00',
            subtotal: '0.00',
            puUSD: '0.00',
            subtotalUSD: '0.00',
            Isv: '0.00',
            manoDeObraUtili: '0.00',
            materialUtili: '0.00',
            manoObraTotalUtili: '0.00',
            materialTotalUtili: '0.00',
            puUtili: '0.00',
            subtotalUtil: '0.00',
            puUSDUtili: '0.00',
            subtotalUSDUtili: '0.00',
            unme_Id: 0,
            etpr_Id: 0,
            cantFormula: '',
            manoDeObraFormula: '',
            materialFormula: '',
            subtotalConIsv: '0.00',
            maquinariaReferencias: [],
            cantReferencias: [],
            manoDeObraReferencias: [],
            materialReferencias: []
        },
    ];
    activeIndex = 0; // Indice del tab activo, inicialmente el primer tab
    activeIndexArticulos = 0; // Indice del tab activo, inicialmente el primer tab

    isTab2Disabled = true; // Estado del segundo tab, inicialmente deshabilitado
    isCtrlPressed = false;
    selectedInputValue: string | null = null;
    percentage: number = 0;
    indexToDelete: number | null = null; // Add this property
    originalValues: {
        [key: string]: { manoDeObra: number; material: number };
    } = {};
    fecha: string = '';
    btnEliminar: boolean = false;
    modalEtapa: boolean = false;
    modalActividad: boolean = false;

    Subtotal: number = 0;
    TotalManoObra: number = 0;
    TotalMaterial: number = 0;
    TotalMaquinaria: number = 0;
    TotalManoObraUSD: string = '0';
    TotalManoObraUtili: string = '0';
    TotalMaterialUtili: string = '0';
    TotalMaquinariaUtili: string = '0';

    subtotalUtil: number = 0;
    TotalUtili: number = 0;

    Imprimir: boolean = false;

    TotalManoObraUtiliUSD: string = '0';
    TotalMaterialUtiliUSD: string = '0';
    TotalMaquinariaUSD: string = '0';
    subtotalUtilUSD: string = '0';
    TotalUtiliUSD: string = '0';
    Ganancia: number = 0;
    GananciaUSD: string = '0';

    TotalMaterialUSD: string = '0';
    ISV: number = 0;
    Total: number = 0;
    SubtotalUSD: string = '0';
    unme_Nombre: string = '';
    unme_Nomenclatura: string = '';
    ISVUSD: string = '0';
    TotalUSD: string = '0';
    esEdit: boolean = false;
    LabelAactividad: string = 'Ocultar Actividades';
    iconActividad: string = 'pi pi-eye-slash';
    proyectoNoExiste: boolean = false;
    classActividad: string = 'p-button-primary';

    LabelTabla: string = 'Ocultar Tabla';
    iconTabla: string = 'pi pi-eye-slash';
    ocultarTabla: boolean = false;
    classTabla: string = 'p-button-primary';

    agregarInsumos: boolean = false;

    proyectoValue: string = '';

    acti_Id: number;

    acet_Id: number;

    prov_Id: number;

    rowIndex: number;

    proy_Id: number;

    proy_IdLlenado: number;

    estadosPresupuesto: SelectItem[] = [];

    showObservacion: boolean = false;

    modalEstado: boolean = false;

    modalRechazado: boolean = false;

    mensajePorcen: boolean = false;

    //#endregion

    //#region Proyecto DatosGenrales

    submitted2: boolean = false;
    proyecto: Proyecto = {};

    filteredClientes: any[] = [];

    tiposProyecto: any[] = [];

    tipoProyecto: any; // Tipo de proyecto seleccionado
    filteredTiposProyecto: any[] = []; // Lista filtrada de tipos de proyectos para autocompletar

    ciudades: ciudad[] = []; // Lista de ciudades
    filteredCiudades: any[] = []; // Lista filtrada de ciudades para autocompletar

    estados: Estado[] = []; // Lista de estados
    filteredEstados: any[] = []; // Lista filtrada de estados para autocompletar

    paises: Pais[] = []; // Lista de países

    clientes2: Cliente[] = []; // Lista de clientes
    filteredClientes2: any[] = []; // Lista filtrada de clientes para autocompletar

    isLoading = false;
    loading: boolean = true;
    loadingProyecto: boolean = true;
    proyectoPlantilla: string = '';
    loadedTableMessage: string = '';
    isTableLoading: boolean = false;

    lastSelectedInput: HTMLInputElement | null = null;
    lastSelectedInputRendimiento: HTMLInputElement | null = null;
    lastSelectedInputMaquinaria: HTMLInputElement | null = null;
    insertado: boolean = false;
    usua_Id: number = 0;

    empleadoDNI: string = '';
    empleado: string = '';

    listaReferencias: Referencia[] = []


    defaultDatabaseDate = new Date('1920-01-01');
    isOptionTipoProyectoNotFound: boolean;
    isOptionClienteNotFound: boolean;
    isOptionEstadoNotFound: boolean;
    isOptionCiudadNotFound: boolean;
    //#endregion

    constructor(
        private service: PresupuestoService,
        private presupuestotasaservice: PresupuestotasacambioService,
        private presupuestodetalleservice: PresupuestodetalleService,
        private router: Router,
        private messageService: MessageService,
        private tiposProyectoService: TipoProyectoService,
        private cookieService: CookieService,
        private cd: ChangeDetectorRef,
        private fb: FormBuilder,
        private ciudadService: ciudadService,
        private estadoService: EstadoService,
        private paisService: PaisService,
        private proyectoService: ProyectoService,
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone,
        private clienteService: ClienteService,
        private etapaporproyectoService: EtapaPorProyectoService,
        private actividadPorEtapaService: ActividadPorEtapaService,
        private proveedorService: ProveedorService,
        private referenciaService: ReferenciaService
    ) {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (event.urlAfterRedirects.includes('/sigesproc/proyecto/presupuesto')
                ) {
                    this.ngOnInit();
                    this.cerrarFormulario();
                    this.cerrarFormularioPdf();
                }
            });

        this.minDate = new Date(1920, 0, 1);
        this.form = this.fb.group({
            pren_Titulo: ['', Validators.required],
            pren_Descripcion: ['', Validators.required],
            pren_Fecha: [{value: '',disabled: true}, Validators.required],
            pren_PorcentajeGanancia: [
                { value: '', disabled: true },
                Validators.required,
            ],
            proy_Id: ['', Validators.required],
            proyecto: ['', Validators.required],
            empleado: ['', Validators.required],
            empl_Id: ['', Validators.required],
            cliente: ['', Validators.required],
            clie_Id: ['', Validators.required],
            pren_Observacion: [''],
            pren_Estado: [''],
        });

        this.formUnidadMedida = this.fb.group({
            unme_Nombre: ['', Validators.required],
            unme_Nomenclatura: ['', Validators.required],
        });

        this.formRechazado = this.fb.group({
            pren_Observacion: ['', Validators.required],
        });
    }
    ngAfterViewInit() {
        // Después de que la vista se ha inicializado, forzamos la detección de cambios
        this.cdr.detectChanges();
    }

    ngOnInit(): void {
        const token = this.cookieService.get('Token');
        if (token == 'false') {
            this.router.navigate(['/auth/login']);
        }
        this.usua_Id = parseInt(this.cookieService.get('usua_Id'));
        this.empleadoDNI = this.cookieService.get('empleadoDNI');
        this.empleado = this.cookieService.get('empleado');

        // this.listarProyectos2();
        this.Listado();
        this.listarPresupuesto();
        this.listarPresupuestoSort();
        this.cargarMonedas();
        this.ListarEtapas();
        this.listarActividades();
        this.listarProyectos();
        this.items = [
            {
                label: 'Editar',
                icon: 'pi pi-user-edit',
                command: (event) => this.EditarPresupuesto(),
            },
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: (event) => this.DetallePresupuesto(),
            },
            {
                label: 'Aprobado',
                icon: 'pi pi-check',
                command: (event) => this.PresupuestoEstado('Aprobado'),
            },
            {
                label: 'Rechazado',
                icon: 'pi pi-times',
                command: (event) => this.PresupuestoEstado('Rechazado'),
            },
            {
                label: 'Imprimir',
                icon: 'pi pi-print',
                command: (event) => this.ImprimirIndex(),
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: (event) => this.EliminarPresupuesto(),
            },
        ];
        this.rechazadoItems = [
            {
                label: 'Editar',
                icon: 'pi pi-user-edit',
                command: (event) => this.EditarPresupuesto(),
            },
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: (event) => this.DetallePresupuesto(),
            },
            {
                label: 'Aprobado',
                icon: 'pi pi-check',
                command: (event) => this.PresupuestoEstado('Aprobado'),
            },
            {
                label: 'Imprimir',
                icon: 'pi pi-print',
                command: (event) => this.ImprimirIndex(),
            },
        ];

        this.detailItems = [
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: (event) => this.DetallePresupuesto(),
            },
            {
                label: 'Imprimir',
                icon: 'pi pi-print',
                command: (event) => this.ImprimirIndex(),
            },
        ];

        this.form.get('pren_Estado').valueChanges.subscribe((value) => {
            this.showObservacion = value === 'R';
            if (value !== 'R') {
                this.form.get('pren_Observacion').setValue('');
            }
        });
    }

    //#region Impresion
    // Método privado para agregar un encabezado al documento PDF
    private addHeader(doc: jsPDF) {
        const date = new Date().toLocaleDateString(); // Obtiene la fecha actual
        const time = new Date().toLocaleTimeString(); // Obtiene la hora actual

        const logo = '/assets/demo/images/disenoactualizado2.png'; // Ruta del logo
        doc.addImage(logo, 'PNG', 0, -18, 432, 50); // Agrega el logo al PDF

        doc.setTextColor(0, 0, 0); // Configura el color del texto
        const titulo = this.form.value.pren_Titulo;
        const elaborado = this.nombreSupervisor;
        const fecha = this.fecha;
        doc.setFontSize(15); // Configura el tamaño de la fuente
        doc.text(
            `Elaborado Por:${elaborado}`,
            doc.internal.pageSize.width / 20,
            45,
            {}
        ); // Agrega el nombre del proveedor centrado
        doc.setFontSize(15); // Configura el tamaño de la fuente
        doc.text(`Fecha Elaborado: ${fecha}`, 320, 45, {
            align: 'left',
        }); // Agrega el nombre del proveedor centrado
        doc.setFontSize(25); // Configura el tamaño de la fuente
        doc.text(`${titulo}`, doc.internal.pageSize.width / 2, 45, {
            align: 'center',
        }); // Agrega el nombre del proveedor centrado

        doc.setFontSize(15); // Configura el tamaño de la fuente para la fecha y hora
        doc.setTextColor(255, 255, 255); // Configura el color del texto para la fecha y hora
        doc.text(
            `Fecha de emisión: ${date} ${time}`,
            doc.internal.pageSize.width - 10,
            10,
            { align: 'right' }
        ); // Agrega la fecha y hora en la esquina superior derecha

        doc.setFontSize(15); // Configura el tamaño de la fuente para el nombre del generador
        doc.setTextColor(255, 255, 255); // Configura el color del texto para el nombre del generador
        const generado = this.empleado;
        doc.text(
            `Generado por: ${generado}`,
            doc.internal.pageSize.width - 10,
            20,
            { align: 'right' }
        ); // Agrega el nombre del generador en la esquina superior derecha
    }
    private addHeaderArticulo(doc: jsPDF) {
        const date = new Date().toLocaleDateString(); // Obtiene la fecha actual
        const time = new Date().toLocaleTimeString(); // Obtiene la hora actual

        const logo = '/assets/demo/images/disenoactualizado2.png'; // Ruta del logo
        doc.addImage(logo, 'PNG', 0, -18, 432, 50); // Agrega el logo al PDF

        doc.setTextColor(0, 0, 0); // Configura el color del texto
        const actividad = this.actividadInsumo;
        doc.setFontSize(25); // Configura el tamaño de la fuente
        doc.text(`${actividad}`, doc.internal.pageSize.width / 2, 45, {
            align: 'center',
        }); // Agrega el nombre del proveedor centrado

        doc.setFontSize(15); // Configura el tamaño de la fuente para la fecha y hora
        doc.setTextColor(255, 255, 255); // Configura el color del texto para la fecha y hora
        doc.text(
            `Fecha de emisión: ${date} ${time}`,
            doc.internal.pageSize.width - 10,
            10,
            { align: 'right' }
        ); // Agrega la fecha y hora en la esquina superior derecha

        doc.setFontSize(15); // Configura el tamaño de la fuente para el nombre del generador
        doc.setTextColor(255, 255, 255); // Configura el color del texto para el nombre del generador
        const generado = this.empleado;
        doc.text(
            `Generado por: ${generado}`,
            doc.internal.pageSize.width - 10,
            20,
            { align: 'right' }
        ); // Agrega el nombre del generador en la esquina superior derecha
    }



    // Método privado para agregar un pie de página al documento PDF
    private addFooter(doc: jsPDF, pageNumber: number) {
        doc.setDrawColor(255, 215, 0); // Configura el color de la línea del pie de página
        doc.setLineWidth(1); // Configura el grosor de la línea del pie de página
        doc.line(10, 287, doc.internal.pageSize.width - 10, 287); // Dibuja la línea del pie de página

        const footerLogo = '/assets/demo/images/disenoactualizado2.png'; // Ruta del logo del pie de página
        doc.addImage(footerLogo, 'PNG', 0, 262, 436, 50); // Agrega el logo al pie de página

        doc.setFontSize(16); // Configura el tamaño de la fuente para el número de página
        doc.setTextColor(0, 0, 0); // Configura el color del texto para el número de página
        doc.text(
            `Página ${pageNumber}`,
            doc.internal.pageSize.width - 200,
            274,
            { align: 'right' }
        ); // Agrega el número de página en la esquina inferior derecha
    }

    private addTabContentToDoc(doc: jsPDF, columns: any[], body: any[]): void {
        doc.setFontSize(16); // Configura el tamaño de la fuente para el contenido de la tabla
        doc.setTextColor(0, 0, 0); // Configura el color del texto para el contenido de la tabla

        // Identifica las filas y aplica estilos condicionales
        const bodyWithStyles = body.map((row) => {
            const isSpecialRow = row[0].endsWith('.00'); // Verifica si el 'item' termina en '00'
            return {
                data: row,
                styles: isSpecialRow
                    ? { fillColor: [220, 220, 220] } // Gris claro para filas especiales
                    : { fillColor: [255, 255, 255] }, // Blanco para las demás filas
            };
        });

        // Configuración de la tabla para los detalles de la cotización
        const tableConfig = {
            startY: 50, // Espacio desde el inicio de la página (después del encabezado)
            head: [columns], // Encabezados de la tabla
            body: bodyWithStyles.map((item) => item.data), // Datos de la tabla
            theme: 'striped',
            styles: {
                halign: 'center',
                font: 'helvetica',
                lineWidth: 0.1,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [255, 237, 58], // Color del encabezado
                textColor: [0, 0, 0],
                fontSize: 13,
                fontStyle: 'bold',
                halign: 'center',
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                fontSize: 11,
                halign: 'center',
            },
            alternateRowStyles: {
                fillColor: [220, 220, 220],
            },
            margin: { top: 60 }, // Margen superior para evitar superposición con el encabezado

            // Aquí aplicamos los estilos condicionales a las filas de datos (sin afectar el encabezado)
            didParseCell: (data) => {
                // Aplica estilos solo a las filas de datos (index > 0)
                if (data.section === 'body' && bodyWithStyles[data.row.index]) {
                    const rowStyles = bodyWithStyles[data.row.index].styles;
                    // Aplica el color de fondo solo si existe algún estilo definido para esa fila
                    if (rowStyles) {
                        data.cell.styles.fillColor = rowStyles.fillColor;
                    }
                }
            },
        };

        doc.autoTable(tableConfig); // Genera la tabla en el documento PDF
    }
    private addTabContentToDocArticulo(doc: jsPDF, columns: any[], body: any[]): void {
        doc.setFontSize(16); // Configura el tamaño de la fuente para el contenido de la tabla
        doc.setTextColor(0, 0, 0); // Configura el color del texto para el contenido de la tabla


        // Configuración de la tabla para los detalles de la cotización
        const tableConfig = {
            startY: 50, // Espacio desde el inicio de la página (después del encabezado)
            head: [columns], // Encabezados de la tabla
            body: body, // Datos de la tabla
            theme: 'striped',
            styles: {
                halign: 'center',
                font: 'helvetica',
                lineWidth: 0.1,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [255, 237, 58], // Color del encabezado
                textColor: [0, 0, 0],
                fontSize: 13,
                fontStyle: 'bold',
                halign: 'center',
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                fontSize: 11,
                halign: 'center',
            },
            alternateRowStyles: {
                fillColor: [220, 220, 220],
            },
            margin: { top: 60 }, // Margen superior para evitar superposición con el encabezado
        };

        doc.autoTable(tableConfig); // Genera la tabla en el documento PDF
    }

    // Método privado para abrir el PDF en un contenedor HTML
    private openPdfInDiv(doc: jsPDF) {
        this.isPdfVisible = true; // Cambia la visibilidad del card a true
        this.Create = false;
        this.agregarInsumos = false;
        // Esperar un breve momento para que el card sea visible antes de cargar el PDF
        setTimeout(() => {
            const string = doc.output('datauristring'); // Convierte el PDF a un URI de datos
            const iframe = `<iframe width='100%' height='900px' src='${string}'></iframe>`; // Crea un iframe para mostrar el PDF
            const pdfContainer = document.getElementById('pdfContainer');

            if (pdfContainer) {
                pdfContainer.innerHTML = iframe; // Inserta el iframe en el contenedor del PDF
                this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
            }
            console.log('Termine');
        }, 500); // Espera 500ms antes de cargar el PDF en el contenedor
    }

    private printInsumos(articulo: string) {
        const doc = new jsPDF('landscape', 'mm', [279.4, 431.8]);

        let columns = this.getColumnsInsumos(this.abreviaturaMoneda); // Columnas de la tabla HTML

        let body = this.getBodyInsumos(this.abreviaturaMoneda); // Filas de la tabla HTML

        if(articulo == 'Maquinaria'){
            columns = this.getColumnsMaquinaria(this.abreviaturaMoneda);
            body = this.getBodyMaquinaria(this.abreviaturaMoneda);
        }
        // Limita el número de filas por página a 15
        const rowsPerPage = 9;
        let currentPage = 1;

        // Divide las filas en grupos de 15
        for (let i = 0; i < body.length; i += rowsPerPage) {
            const rowsForPage = body.slice(i, i + rowsPerPage); // Selecciona las filas para la página actual

            // Si no es la primera página, agrega una nueva página
            if (i !== 0) {
                doc.addPage();
                currentPage++;
            }

            // Agrega el encabezado
            this.addHeaderArticulo(doc);

            // Genera la tabla con las filas limitadas a la página actual
            this.addTabContentToDocArticulo(doc, columns, rowsForPage);

            // Agrega el pie de página con el número de página actual
            this.addFooter(doc, currentPage);
        }

        // Solo agregamos los totales después de generar todas las páginas
        const finalY = (doc as any).lastAutoTable.finalY; // Obtiene la posición final de la tabla
        const pageWidth = doc.internal.pageSize.width;
        const marginRight = 20;


        // Muestra los totales solo en la última página
        doc.setPage(currentPage); // Nos aseguramos de estar en la última página
        // Configuración de los totales
        let totalsConfig = [
            {
                label: 'TOTAL',
                value: `  ${this.abreviaturaMoneda} ${Number(this.materialInsumo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
        ];
        if(articulo == 'Maquinaria'){
            totalsConfig = [
                {
                    label: 'TOTAL',
                    value: `  ${this.abreviaturaMoneda} ${Number(this.maquinariaInsumo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                },
            ];
        }
        doc.setFontSize(15); // Configura el tamaño de la fuente para los totales
        totalsConfig.forEach((total, index) => {
            doc.text(
                `${total.label}: ${total.value}`,
                pageWidth - marginRight,
                finalY + 13 + index * 10,
                { align: 'right' }
            ); // Agrega los totales al PDF
        });


        this.openPdfInDiv(doc); // Abre el PDF en un contenedor HTML
        this.isRegresarVisible = true; // Muestra el botón de regresar

        //  this.Create = false;
    }

    private printTab() {
        const doc = new jsPDF('landscape', 'mm', [279.4, 431.8]);

        const columns = this.getColumnsFromHtml(this.abreviaturaMonedaConversion); // Columnas de la tabla HTML
        let body = this.getBodyFromData(); // Filas de la tabla HTML
        if (this.valSwitch) {
            body = this.getBodyFromData2();
        }
        if(!this.maquinariaCalculo){
            body = this.getBodyFromDataSinMaquinaria();
        }
        if(!this.maquinariaCalculo && this.valSwitch){
            body = this.getBodyFromDataSinMaquinariaYGanancia();
        }
        // Limita el número de filas por página a 15
        const rowsPerPage = 9;
        let currentPage = 1;

        // Divide las filas en grupos de 15
        for (let i = 0; i < body.length; i += rowsPerPage) {
            const rowsForPage = body.slice(i, i + rowsPerPage); // Selecciona las filas para la página actual

            // Si no es la primera página, agrega una nueva página
            if (i !== 0) {
                doc.addPage();
                currentPage++;
            }

            // Agrega el encabezado
            this.addHeader(doc);

            // Genera la tabla con las filas limitadas a la página actual
            this.addTabContentToDoc(doc, columns, rowsForPage);

            // Agrega el pie de página con el número de página actual
            this.addFooter(doc, currentPage);
        }

        // Solo agregamos los totales después de generar todas las páginas
        let finalY = (doc as any).lastAutoTable.finalY; // Obtiene la posición final de la tabla
        const pageWidth = doc.internal.pageSize.width;
        const marginRight = 20;
        let marginRight2 = 110;

        if(!this.checked){
            marginRight2 = 20;
        }
        const impuesto = parseInt(this.ValorImpuesto); // Obtiene el valor del impuesto

        // Muestra los totales solo en la última página
        doc.setPage(currentPage); // Nos aseguramos de estar en la última página
        // Configuración de los totales
        let totalsConfig = [
            {
                label: 'MANO OBRA',
                value: `  ${this.abreviaturaMoneda} ${Number(this.TotalManoObra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
            {
                label: 'MAQUINARIA',
                value: ` ${this.abreviaturaMoneda} ${Number(this.TotalMaquinaria).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
            {
                label: 'MATERIAL',
                value: `   ${this.abreviaturaMoneda} ${Number(this.TotalMaterial).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
            {
                label: 'SUBTOTAL',
                value: `   ${this.abreviaturaMoneda} ${Number(this.Subtotal + this.TotalMaquinaria).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
            ...(this.checked2 ? [{
                label: `ISV (${impuesto}%)`,
                value: `  ${this.abreviaturaMoneda} ${(Number(this.Subtotal + this.TotalMaquinaria) * 0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            }] : []),
            {
                label: 'TOTAL',
                value: `  ${this.abreviaturaMoneda} ${Number((this.Subtotal + this.TotalMaquinaria) * 1.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
        ];

        let totalsConfig2 = [
            {
                label: 'MANO OBRA',
                value: `  ${this.abreviaturaMonedaConversion} ${Number(this.TotalManoObraUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
            {
                label: 'MAQUINARIA',
                value: ` ${this.abreviaturaMonedaConversion} ${Number(this.TotalMaquinariaUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
            {
                label: 'MATERIAL',
                value: `   ${this.abreviaturaMonedaConversion} ${Number(this.TotalMaterialUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
            {
                label: 'SUBTOTAL',
                value: `   ${this.abreviaturaMonedaConversion} ${(Number(this.SubtotalUSD) + Number(this.TotalMaquinariaUSD)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
            ...(this.checked2 ? [{
                label: `ISV (${impuesto}%)`,
                value: `  ${this.abreviaturaMonedaConversion} ${((Number(this.SubtotalUSD)+Number(this.TotalMaquinariaUSD))*0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            }] : []), 
            {
                label: 'TOTAL',
                value: `  ${this.abreviaturaMonedaConversion} ${((Number(this.TotalMaquinariaUSD)+Number(this.SubtotalUSD))* 1.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
        ];
        this.calculateAveragePercentage();

         if (this.valSwitch) {
             totalsConfig = [
                 {
                     label: 'MANO OBRA',
                     value: `  ${this.abreviaturaMoneda} ${Number(this.TotalManoObra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                 },
                 {
                     label: 'MAQUINARIA',
                     value: `  ${this.abreviaturaMoneda} ${Number(this.TotalMaquinaria).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                 },
                 {
                     label: 'MATERIAL',
                     value: `  ${this.abreviaturaMoneda} ${Number(this.TotalMaterial).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                 },
               
                 {
                     label: `GANANCIA (${this.defaultPorcentaje}%)`,
                     value: `  ${this.abreviaturaMoneda} ${Number(this.Ganancia).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                 },
                 {
                     label: 'SUBTOTAL',
                     value: `  ${this.abreviaturaMoneda} ${Number(this.subtotalUtil+ this.TotalMaquinaria).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                 },
                 ...(this.checked2 ? [{
                    label: `ISV (${impuesto}%)`,
                    value: `  ${this.abreviaturaMoneda} ${(Number(this.subtotalUtil + this.TotalMaquinaria) * 0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                }] : []), 
                 {
                     label: 'TOTAL',
                     value: `  ${this.abreviaturaMoneda} ${Number((this.subtotalUtil + this.TotalMaquinaria) * 1.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                 },
             ]
             totalsConfig2 = [
                 {
                     label: 'MANO OBRA',
                     value: `  ${this.abreviaturaMonedaConversion} ${Number(this.TotalManoObraUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                 },
                 {
                     label: 'MAQUINARIA',
                     value: `  ${this.abreviaturaMonedaConversion} ${Number(this.TotalMaquinariaUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                 },
                 {
                     label: 'MATERIAL',
                     value: `  ${this.abreviaturaMonedaConversion} ${Number(this.TotalMaterialUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                 },
             
                 {
                     label: `GANANCIA (${this.defaultPorcentaje}%)`,
                     value: `  ${this.abreviaturaMonedaConversion} ${Number(this.GananciaUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                 },
                 {
                     label: 'SUBTOTAL',
                     value: `  ${this.abreviaturaMonedaConversion} ${(Number(this.subtotalUtilUSD)+ Number(this.TotalMaquinariaUSD)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                 },
                 ...(this.checked2 ? [{
                    label: `ISV (${impuesto}%)`,
                    value: `  ${this.abreviaturaMonedaConversion} ${((Number(this.subtotalUtilUSD)+ Number(this.TotalMaquinariaUSD))*0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                }] : []), 
                 {
                     label: 'TOTAL',
                     value: `  ${this.abreviaturaMonedaConversion} ${((Number(this.subtotalUtilUSD)+ Number(this.TotalMaquinariaUSD))*1.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                 },
             ];
         }

        //  doc.setFontSize(15); // Configura el tamaño de la fuente para los totales
        //  totalsConfig.forEach((total, index) => {
        //      doc.text(
        //          `${total.label}: ${total.value}`,
        //          pageWidth - marginRight2,
        //          finalY + 13 + index * 10,
        //          { align: 'right' }
        //      ); // Agrega los totales al PDF
        //  });
        //  if(this.checked){
        //      totalsConfig2.forEach((total, index) => {
        //          doc.text(
        //              `${total.label}: ${total.value}`,
        //              pageWidth - marginRight,
        //              finalY + 13 + index * 10,
        //              { align: 'right' }
        //          ); // Agrega los totales al PDF
        //      });
        //  }
        const labelX = 20; // Posición para las etiquetas, cerca del margen izquierdo
        const valueX = 100; // Posición para los valores, ajustado para alinearse correctamente
        const lineHeight = 10;finalY += 20; 
        const labelX2 = pageWidth / 2 + 30; // Posición para las etiquetas de moneda de conversión a la derecha
        const valueX2 = pageWidth - 80; 
         doc.setFontSize(12); // Tamaño de fuente para los totales
         totalsConfig.forEach((total, index) => {
             doc.text(total.label, labelX, finalY + index * lineHeight); // Imprimir la etiqueta en labelX
             doc.text(total.value, valueX, finalY + index * lineHeight); // Imprimir el valor en valueX
         });
         if (this.checked) {
             totalsConfig2.forEach((total, index) => {
                 doc.text(total.label, labelX2, finalY + index * lineHeight); // Imprimir la etiqueta en labelX2 (derecha)
                 doc.text(total.value, valueX2, finalY + index * lineHeight); // Imprimir el valor en valueX2 (derecha)
             });
         }
        
         // Ajustar el espaciado vertical si es necesario
         finalY += totalsConfig.length * lineHeight;
        this.openPdfInDiv(doc); // Abre el PDF en un contenedor HTML
        this.isRegresarVisible = true; // Muestra el botón de regresar

        //  this.Create = false;
    }

    private getColumnsInsumos(abreviatura: string): string[]{
        let columns = [
            'No.',
            'Descripción',
            'Unidad Medida',
            'Proveedor',
            'Rendimiento',
            'Desperdicio',
            'Cantidad',
            `Precio`,
            `Costo Unitario`
            ];
        return columns;
    }
    private getColumnsMaquinaria(abreviatura: string): string[]{
        let columns = [
            'No.',
            'Descripción',
            'Tipo Renta',
            'Nivel',
            'Proveedor',
            'Cantidad Renta',
            'Cantidad Maquina',
             `Precio`,
            `Subtotal`
            ];
        return columns;
    }
    private getBodyMaquinaria(abreviatura: string): string[][] {
        return this.maquinariasAgregadas.map((item) => {
            return [
                item.codigo,
                item.maqu_Descripcion,
                item.renta,
                item.nive_Descripcion,
                item.prov_Descripcion,
                item.rmac_CantidadRenta,
                item.rmac_CantidadMaquinas,
                `${abreviatura} ${Number(item.rmac_PrecioRenta).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // Formatear rmac_PrecioRenta
                `${abreviatura} ${Number(item.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` // Formatear subtotal
            ];
        });
    }

    private getBodyInsumos(abreviatura: string): string[][] {
        return this.insumos.map((item) => {
            return [
                item.codigo,
                item.insumo,
                item.unme_Nombre,
                item.proveedor,
                item.rendimiento,
                `${item.desperdicio} (%)`,
                item.cantidad,
                `${abreviatura} ${Number(item.costo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // Formatear costo
                `${abreviatura} ${Number(item.costoUnitario).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` // Formatear costoUnitario
            ];
        });
    }




    private getColumnsFromHtml(abreviatura: string): string[] {
        // Define manualmente los encabezados que quieres
        let customHeaders = [
            'Item',
            'Descripcion',
            'Cantidad',
            'Unidad Medida',
            'Mano Obra',
            'Maquinaria',
            'Material',
            `P.U. (${this.abreviaturaMoneda})`,
            `Subtotal (${this.abreviaturaMoneda})`
        ];
        if(this.checked){
            customHeaders = [
                'Item',
                'Descripcion',
                'Cantidad',
                'Unidad Medida',
                'Mano Obra',
                'Maquinaria',
                'Material',
                `P.U. (${this.abreviaturaMoneda})`,
                `Subtotal (${this.abreviaturaMoneda})`,
                `P.U. (${abreviatura})`,
                `Subtotal (${abreviatura})`
            ];

            if(this.valSwitch){
                customHeaders = [
                    'Item',
                    'Descripcion',
                    'Cantidad',
                    'Unidad Medida',
                    'Mano Obra',
                    'Maquinaria',
                    'Material',
                    `P.U. (${this.abreviaturaMoneda})`,
                    `Subtotal (${this.abreviaturaMoneda})`,
                    `P.U. (${abreviatura})`,
                    `Subtotal (${abreviatura})`
                ];
            }
            if(!this.maquinariaCalculo){
                customHeaders = [
                    'Item',
                    'Descripcion',
                    'Cantidad',
                    'Unidad Medida',
                    'Mano Obra',
                    'Material',
                    `P.U. (${this.abreviaturaMoneda})`,
                    `Subtotal (${this.abreviaturaMoneda})`,
                    `P.U. (${abreviatura})`,
                    `Subtotal (${abreviatura})`
                ];
            }
            if(!this.maquinariaCalculo && this.valSwitch){
                customHeaders = [
                    'Item',
                    'Descripcion',
                    'Cantidad',
                    'Unidad Medida',
                    'Mano Obra',
                    'Material',
                    `P.U. (${this.abreviaturaMoneda})`,
                    `Subtotal (${this.abreviaturaMoneda})`,
                    `P.U. (${abreviatura})`,
                    `Subtotal (${abreviatura})`
                ];
            }
            if(this.checked3){
                customHeaders = [
                    'Item',
                    'Descripcion',
                    'Cantidad',
                    'Unidad Medida',
                    
                ];
            }
        }
      else{
        if(this.valSwitch){
            customHeaders = [
                'Item',
                'Descripcion',
                'Cantidad',
                'Unidad Medida',
                'Mano Obra',
                'Maquinaria',
                'Material',
                `P.U. (${this.abreviaturaMoneda})`,
                `Subtotal (${this.abreviaturaMoneda})`,
            ];
        }
        if(!this.maquinariaCalculo){
            customHeaders = [
                'Item',
                'Descripcion',
                'Cantidad',
                'Unidad Medida',
                'Mano Obra',
                'Material',
                `P.U. (${this.abreviaturaMoneda})`,
                `Subtotal (${this.abreviaturaMoneda})`,
            ];
        }
        if(!this.maquinariaCalculo && this.valSwitch){
            customHeaders = [
                'Item',
                'Descripcion',
                'Cantidad',
                'Unidad Medida',
                'Mano Obra',
                'Material',
                `P.U. (${this.abreviaturaMoneda})`,
                `Subtotal (${this.abreviaturaMoneda})`,
            ];
        }
        if(this.checked3){
            customHeaders = [
                'Item',
                'Descripcion',
                'Cantidad',
                'Unidad Medida',
                
            ];
        }
      }



        // Retorna los encabezados especificados
        return customHeaders;
    }

    private getBodyFromData(): string[][] {
        // Mapeo de datos para la tabla
        if (this.checked) {
            return this.prueba.map((row) => {
                return [
                    row.item, // Suponiendo que la columna 'item' es la primera
                    row.descripcion, // 'descripcion'
                    `${Number(row.cant).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'cantidad'
                    row.unidad, // 'unidad'
                    `${this.abreviaturaMoneda} ${Number(row.manoDeObra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'maquinaria'

                    `${this.abreviaturaMoneda} ${Number(row.material).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'material'
                    `${this.abreviaturaMoneda} ${Number(row.pu).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'pu'
                    `${this.abreviaturaMoneda} ${Number(row.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'subtotal'
                    // `${this.abreviaturaMoneda} ${Number(row.maquinaria).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'maquinaria'

                    `${this.abreviaturaMonedaConversion} ${Number(row.puUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'puUSD'
                    `${this.abreviaturaMonedaConversion} ${Number(row.subtotalUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'subtotalUSD'
                    // Agrega más campos según sea necesario
                ];
            });
        } else {
            return this.prueba.map((row) => {
                return [
                    row.item, // Suponiendo que la columna 'item' es la primera
                    row.descripcion, // 'descripcion'
                    `${Number(row.cant).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'cantidad'
                    row.unidad, // 'unidad'
                    `${this.abreviaturaMoneda} ${Number(row.manoDeObra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'manoDeObra'
                    `${this.abreviaturaMoneda} ${Number(row.material).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'material'
                    `${this.abreviaturaMoneda} ${Number(row.pu).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'pu'
                    `${this.abreviaturaMoneda} ${Number(row.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'subtotal'
                    `${this.abreviaturaMoneda} ${Number(row.maquinaria).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'maquinaria'

                    // Agrega más campos según sea necesario
                ];
            });
        }
    }

    private getBodyFromData2(): any[][] {
        // Mapeo de datos para la tabla
        if (this.checked) {
            return this.prueba.map((row) => {
                return [
                    row.item, // Suponiendo que la columna 'item' es la primera
                    row.descripcion, // 'descripcion'
                    `${Number(row.cant).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'cantidad'
                    row.unidad, // 'unidad'
                    `${this.abreviaturaMoneda} ${Number(row.manoDeObra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'manoDeObra'
                    `${this.abreviaturaMoneda} ${Number(row.material).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'material'
                    `${this.abreviaturaMoneda} ${Number(row.pu).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'pu'
                    `${this.abreviaturaMoneda} ${Number(row.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'subtotal'
                    // `${this.abreviaturaMoneda} ${Number(row.maquinaria).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'maquinaria'
                    `${this.abreviaturaMonedaConversion} ${Number(row.puUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'puUSD'
                    `${this.abreviaturaMonedaConversion} ${Number(row.subtotalUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'subtotalUSD'
                    // Agrega más campos según sea necesario
                ];
            });
        } else {
            return this.prueba.map((row) => {
                return [
                    row.item, // Suponiendo que la columna 'item' es la primera
                    row.descripcion, // 'descripcion'
                    `${Number(row.cant).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'cantidad'
                    row.unidad, // 'unidad'
                    `${this.abreviaturaMoneda} ${Number(row.manoDeObra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'manoDeObra'
                    `${this.abreviaturaMoneda} ${Number(row.material).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'material'
                    `${this.abreviaturaMoneda} ${Number(row.pu).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'pu'
                    `${this.abreviaturaMoneda} ${Number(row.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'subtotal'
                    `${this.abreviaturaMoneda} ${Number(row.maquinaria).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'maquinaria'

                    // Agrega más campos según sea necesario
                ];
            });
        }
    }


    private getBodyFromDataSinMaquinaria(): any[][] {
        // Mapeo de datos para la tabla
        if (this.checked) {
            return this.prueba.map((row) => {
                return [
                    row.item, // Suponiendo que la columna 'item' es la primera
                    row.descripcion, // 'descripcion'
                    `${Number(row.cant).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'cantidad'
                    row.unidad, // 'unidad'
                    `${this.abreviaturaMoneda} ${Number(row.manoDeObra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'manoDeObra'
                    `${this.abreviaturaMoneda} ${Number(row.material).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'material'
                    `${this.abreviaturaMoneda} ${Number(row.pu).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'pu'
                    `${this.abreviaturaMoneda} ${Number(row.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'subtotal'
                    `${this.abreviaturaMonedaConversion} ${Number(row.puUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'puUSD'
                    `${this.abreviaturaMonedaConversion} ${Number(row.subtotalUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'subtotalUSD'
                    // Agrega más campos según sea necesario
                ];
            });
        } else {
            return this.prueba.map((row) => {
                return [
                    row.item, // Suponiendo que la columna 'item' es la primera
                    row.descripcion, // 'descripcion'
                    `${Number(row.cant).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'cantidad'
                    row.unidad, // 'unidad'
                    `${this.abreviaturaMoneda} ${Number(row.manoDeObra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'manoDeObra'
                    `${this.abreviaturaMoneda} ${Number(row.material).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'material'
                    `${this.abreviaturaMoneda} ${Number(row.pu).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'pu'
                    `${this.abreviaturaMoneda} ${Number(row.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'subtotal'
                    // Agrega más campos según sea necesario
                ];
            });
        }
    }

    private getBodyFromDataSinMaquinariaYGanancia(): any[][] {
        // Mapeo de datos para la tabla
        if (this.checked) {
            return this.prueba.map((row) => {
                return [
                    row.item, // Suponiendo que la columna 'item' es la primera
                    row.descripcion, // 'descripcion'
                    `${Number(row.cant).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'cantidad'
                    row.unidad, // 'unidad'
                    `${this.abreviaturaMoneda} ${Number(row.manoDeObra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'manoDeObra'
                    `${this.abreviaturaMoneda} ${Number(row.material).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'material'
                    `${this.abreviaturaMoneda} ${Number(row.pu).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'pu'
                    `${this.abreviaturaMoneda} ${Number(row.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'subtotal'
                    `${this.abreviaturaMonedaConversion} ${Number(row.puUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'puUSD'
                    `${this.abreviaturaMonedaConversion} ${Number(row.subtotalUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'subtotalUSD'
                    // Agrega más campos según sea necesario
                ];
            });
        } else {
            return this.prueba.map((row) => {
                return [
                    row.item, // Suponiendo que la columna 'item' es la primera
                    row.descripcion, // 'descripcion'
                    `${Number(row.cant).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'cantidad'
                    row.unidad, // 'unidad'
                    `${this.abreviaturaMoneda} ${Number(row.manoDeObra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'manoDeObra'
                    `${this.abreviaturaMoneda} ${Number(row.material).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'material'
                    `${this.abreviaturaMoneda} ${Number(row.pu).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'pu'
                    `${this.abreviaturaMoneda} ${Number(row.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // 'subtotal'
                    // Agrega más campos según sea necesario
                ];
            });
        }
    }

    //#endregion

    //#region Presupuesto
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }
    onGlobalFilterPrueba(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    async listarActividades() {
        await this.service.ListarActividades().then((data: any) => {
            this.actividadOptions = data.sort((a, b) =>
                a.acti_Descripcion.localeCompare(b.acti_Descripcion)
            );
        });
    }

    async onBlurInsumos(rowIndex: number, rowData: any) {
        console.log(rowData);
        if (
            this.validateRow(rowData.cantidad) || // Verifica si 'cant' está vacío o contiene caracteres no numéricos
            this.validateRow(rowData.costo) || // Verifica si 'manoDeObra' está vacío o contiene caracteres no numéricos
            this.validateRow(rowData.rendimiento) // Verifica si 'material' contiene caracteres no numéricos o es solo ceros
        ) {
            console.log(
                'Hay campos vacíos, con caracteres no numéricos, o con valor de solo ceros.'
            );
            return;
        }
        const registrosFiltrados = this.prueba.filter(
            (item) => item.acetId === this.acet_Id
        );

        if (rowData.inpa_Id && rowData.estado == 'Guardado') {
            console.log('Tengo Id');
            const Modelo = {
                inpa_Id: rowData.inpa_Id,
                inpa_stock: parseFloat(rowData.cantidad),
                inpa_PrecioCompra: parseFloat(rowData.costo),
                inpa_Rendimiento: parseFloat(rowData.rendimiento),
                inpa_Desperdicio: parseFloat(rowData.desperdicio),
                inpa_FormulaRendimiento: rowData.rendimientoFormula,
                inpa_PrecioCompraFormula: rowData.costoFormula,
                inpa_StockFormula: rowData.cantidadFormula,
                usua_Modificacion: this.usua_Id,
            };
            console.log('Modelo', Modelo);

            this.service.ActualizarInsumoPorActividad(Modelo).then(
                (response) => {
                    console.log(response);
                    if (response.code == 200) {
                        console.log('Actualizado con exito');
                        this.ActualizarDetalle(registrosFiltrados[0]);
                    }
                },
                (error) => {
                    console.log('Error', error);
                }
            );
        } else {
            console.log('No tengo Id');
            const Modelo = {
                inpp_Id: rowData.inpp_Id,
                inpa_stock: parseFloat(rowData.cantidad),
                inpa_PrecioCompra: parseFloat(rowData.costo),
                acet_Id: rowData.acet_Id,
                inpa_Estado: false,
                inpa_FormulaRendimiento: rowData.rendimientoFormula,
                inpa_Desperdicio: parseFloat(rowData.desperdicio),
                inpa_ActividadLlenado: rowData.inpa_ActividadLlenado,
                inpa_PrecioCompraFormula: rowData.costoFormula,
                inpa_StockFormula: rowData.cantidadFormula,
                inpa_Rendimiento: parseFloat(rowData.rendimiento),
                usua_Creacion: this.usua_Id,
            };
            await this.service.InsertarInsumoPorActividad(Modelo).then(
                (response) => {
                    console.log(response);
                    if (response.code == 200) {
                        rowData.estado = 'Guardado';
                        rowData.inpa_Id = response.data.codeStatus;
                        this.ActualizarDetalle(registrosFiltrados[0]);
                        this.actualizarMaterialInsumo();
                    }
                },
                (error) => {
                    console.log('Error', error);
                }
            );

        }
    }
    async onBlurMaquinaria(rowIndex: number, rowData: any) {
        console.log(rowData);
        if (
            this.validateRow(rowData.rmac_CantidadMaquinas) || // Verifica si 'cant' está vacío o contiene caracteres no numéricos
            this.validateRow(rowData.rmac_CantidadRenta) || // Verifica si 'manoDeObra' está vacío o contiene caracteres no numéricos
            this.validateRow(rowData.rmac_PrecioRenta) // Verifica si 'material' contiene caracteres no numéricos o es solo ceros
        ) {
            console.log(
                'Hay campos vacíos, con caracteres no numéricos, o con valor de solo ceros.'
            );
            return;
        }

        const registrosFiltrados = this.prueba.filter(
            (item) => item.acetId === this.acet_Id
        );

        if (rowData.rmac_Id && rowData.estado == 'Guardado') {
            console.log('Tengo Id');

            const Modelo = {
                rmac_Id: rowData.rmac_Id,
                mapr_Id: rowData.mapr_Id,
                rmac_CantidadRenta: parseFloat(rowData.rmac_CantidadRenta),
                rmac_PrecioRenta: parseFloat(rowData.rmac_PrecioRenta),
                rmac_CantidadRentaFormula: rowData.rmac_CantidadRentaFormula,
                rmac_PrecioRentaFormula: rowData.rmac_PrecioRentaFormula,
                rmac_CantidadMaquinaFormula:
                    rowData.rmac_CantidadMaquinasFormula,
                rmac_CantidadMaquinas: parseFloat(
                    rowData.rmac_CantidadMaquinas
                ),
                usua_Modificacion: this.usua_Id,
            };
            console.log('Modelo Maquinaria', Modelo);

            this.service.ActualizarMaquinariaPorActividad(Modelo).then(
                (response) => {
                    console.log(response);
                    if (response.code == 200) {
                        console.log('Actualizado con exito');
                        this.actualizarMaquinariaInsumo();
                        this.ActualizarDetalle(registrosFiltrados[0]);
                    }
                },
                (error) => {
                    console.log('Error', error);
                }
            );
        } else {
            console.log('No tengo Id');
            const Modelo = {
                mapr_Id: rowData.mapr_Id,
                rmac_Rentapor: 0,
                rmac_CantidadRenta: parseFloat(rowData.rmac_CantidadRenta),
                rmac_PrecioRenta: parseFloat(rowData.rmac_PrecioRenta),
                rmac_CantidadMaquinas: parseFloat(
                    rowData.rmac_CantidadMaquinas
                ),
                rmac_CantidadRentaFormula: rowData.rmac_CantidadRentaFormula,
                rmac_ActividadLlenado: parseInt(rowData.rmac_ActividadLlenado),
                rmac_PrecioRentaFormula: rowData.rmac_PrecioRentaFormula,
                rmac_CantidadMaquinaFormula:
                    rowData.rmac_CantidadMaquinasFormula,
                acet_Id: this.acet_Id,
                rmac_Estado: false,
                usua_Creacion: this.usua_Id,
            };
            console.log(Modelo);
            await this.service.InsertarMaquinariaPorActividad(Modelo).then(
                (response) => {
                    console.log(response);
                    if (response.code == 200) {
                        rowData.estado = 'Guardado';
                        rowData.rmac_Id = response.data.codeStatus;
                        this.actualizarMaquinariaInsumo();
                        this.ActualizarDetalle(registrosFiltrados[0]);

                    }
                },
                (error) => {
                    console.log('Error', error);
                }
            );

        }
    }
    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    allowOnlyAlphanumeric(event: any) {
        event.target.value = event.target.value
            .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ.\s]/g, '')  // Remueve caracteres no permitidos
            .replace(/\s{2,}/g, ' ')  // Reemplaza múltiples espacios por uno solo
            .trimStart();  // Elimina espacios al principio
        // event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s=+$\.]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
        //   .replace(/\s{2,}/g, ' ')
        //   .replace(/^\s/, '');
    }      
    async listarUnidades() {
        await this.service.ListarUnidades().then(
            (data: any) => {
                this.listunidades = data.sort((a, b) =>
                    a.unme_Nomenclatura.localeCompare(b.unme_Nomenclatura)
                );
            },
            (error) => {
                console.log(error);
            }
        );
    }
    async listarProyectos() {
        this.loadingProyecto = true;
        await this.service.ListarProyectos()
            .then((data: any) => {
                this.proyectoOptions = data.sort((a, b) =>
                    a.proy_Nombre.localeCompare(b.proy_Nombre)
                );

                this.proyectoOptions2 = this.proyectoOptions;
            }) 
            .finally(() => {
                this.loadingProyecto = false;
                this.loading = false;
            })
            .catch((error) => {
                console.log(error);
            });
    }

    // async listarProyectos2() {
    //     this.loading = true;
    //     await this.service.ListarProyectos()
    //         .then((data: any) => {
    //             this.proyectoOptions2 = data.sort((a, b) =>
    //                 a.proy_Nombre.localeCompare(b.proy_Nombre)
    //             );
    //             console.log(this.proyectoOptions); // Imprime solo los proyectos filtrados
    //         })
    //         .finally(() => {
    //             this.loading = false;
    //         })
    //         .catch((error) => {
    //             console.log(error);
    //         });
    // }

    async Listado() {
        this.listarUnidades();
        this.listarProyectos();
        await this.service.ListarEmpleados().then((data: any[]) => {
            this.empleados = data.sort((a, b) =>
                a.empl_Nombre.localeCompare(b.empl_Nombre)
            );
        });
        await this.service.ListarClientes().then((data: any[]) => {
            this.clientes = data.sort((a, b) =>
                a.clie_Nombre.localeCompare(b.clie_Nombre)
            );
        });
        await this.service.ListarImpuesto().then((data: any) => {
            this.impuesto = data[0].impu_Porcentaje;
        });
    }

    obtenerValoresInput(rowIndex: number) {
        // Obtener el valor del input de cantidad, mano de obra y material
        const cantidadInput = (
            document.getElementById(`cantidad${rowIndex}`) as HTMLInputElement
        )?.value;
        const manoObraInput = (
            document.getElementById(`manoObra${rowIndex}`) as HTMLInputElement
        )?.value;
        const materialInput = (
            document.getElementById(`material${rowIndex}`) as HTMLInputElement
        )?.value;

        console.log(
            `Fila ${rowIndex} - Cantidad: ${cantidadInput}, Mano de Obra: ${manoObraInput}, Material: ${materialInput}`
        );
    }

    onRowSelect(event: any) {
        // La fila seleccionada se agrega automáticamente a `selectedInsumos`
        console.log('Fila seleccionada:', event.data);
    }

    onRowUnselect(event: any) {
        // La fila deseleccionada se elimina automáticamente de `selectedInsumos`
        console.log('Fila deseleccionada:', event.data);
    }

    async EliminarInsumo(rowData: any, index: number) {
        if (rowData.inpa_Id && rowData.estado == 'Guardado') {
            await this.service.EliminarInsumoPorActividad(rowData.inpa_Id).then(
                (response) => {
                    console.log(response);
                    if (response.code === 200) {
                        console.log('ELIMINADO CON ÉXITO');
                    }
                },
                (error) => {
                    console.log('Error', error);
                }
            );
        }
        console.log('Eliminar Insumo Row Data:', rowData.id);
        console.log('Insumo Array Antes de Eliminar:', this.insumos);

        const insumoOptions = this.insumosOptions.filter(
            (item) => item.inpp_Id === rowData.inpp_Id
        );
        if (insumoOptions.length > 0) {
            console.log('MaquinariaOptions', insumoOptions);
            insumoOptions[0].selected = false;
        }
        const insumosLlenados = this.insumosLlenado.filter(
            (item) =>
                item.inpa_ActividadLlenado === rowData.inpa_ActividadLlenado
        );
        if (insumosLlenados.length > 0) {
            insumosLlenados[0].select = false;
        }

        console.log('INDEX', index);
        const index2 = index - 1;
        this.insumos.splice(index2, 1);
        // Reordenar los códigos secuenciales después de eliminar
        this.insumos.forEach((item, index) => {
            item.codigo = index + 1; // Reasigna el código secuencialmente
        });

        console.log('Insumo Array Después de Eliminar:', this.insumos);

        this.actualizarMaterialInsumo();
        // Actualizar la lista de insumos disponibles después de la eliminación
    }
    async EliminarMaquinaria(rowData: any, index: number) {
        if (rowData.rmac_Id) {
            await this.service
                .EliminarMaquinariaPorActividad(rowData.rmac_Id)
                .then(
                    (response) => {
                        console.log(response);
                        if (response.code === 200) {
                            console.log('ELIMINADO CON ÉXITO');
                        }
                    },
                    (error) => {
                        console.log('Error', error);
                    }
                );
        }

        const maquinariaOptions = this.maquinariaOptions.filter(
            (item) => item.mapr_Id === rowData.mapr_Id
        );
        if (maquinariaOptions.length > 0) {
            console.log('MaquinariaOptions', maquinariaOptions);
            maquinariaOptions[0].selected = false;
        }
        const maquinariaLlenados = this.maquinariasAgregadasLlenado.filter(
            (item) =>
                item.rmac_ActividadLlenado === rowData.rmac_ActividadLlenado
        );
        if (maquinariaLlenados.length > 0) {
            maquinariaLlenados[0].select = false;
        }

        console.log('INDEX', index);
        const index2 = index - 1;
        this.maquinariasAgregadas.splice(index2, 1);

        // Reordenar los códigos secuenciales después de eliminar
        this.maquinariasAgregadas.forEach((item, index) => {
            item.codigo = index + 1; // Reasigna el código secuencialmente
        });

        console.log('Insumo Array Después de Eliminar:', this.insumos);

        // Actualizar la lista de insumos disponibles después de la eliminación
        this.actualizarMaquinariaInsumo();
    }

    async AddInsumoLlenado(insumo: any, event: any) {
        console.log('Insu', insumo);
        if (event.checked) {
            // Solo agregar el insumo si el checkbox está marcado
            const newCode = this.insumosLlenado.length + 1; // Generar un número secuencial basado en la longitud actual
            const AddRow = {
                codigo: newCode, // Asignar el número secuencial
                costo: insumo.costo,
                inpp_Id: insumo.inpp_Id,
                select: true,
                inpa_Id: insumo.inpa_Id,
                id: insumo.codigo,
                estado: 'Sin Guardar',
                costoFormula: '',
                unme_Nombre: insumo.unme_Nombre,
                unme_Nomenclatura: insumo.unme_Nomenclatura,
                inpa_ActividadLlenado: insumo.inpa_Id,
                desperdicio: insumo.desperdicio,
                costoUnitario: insumo.costoUnitario,
                cantidad: 1,
                acet_Id: this.acet_Id,
                cantidadFormula: '',
                rendimiento: insumo.rendimiento,
                rendimientoFormula: '',
                insumo: insumo.insumo,
                proveedor: insumo.proveedor,
                material: insumo.material,
                categoria: insumo.categoria,
                rendimientoReferencias: [],
                cantidadReferencias: [],
                costoReferencias: [],
            };
            console.log('AddRow', AddRow);
            this.insumos.push(AddRow);
            this.actualizarMaterialInsumo();
        } else {
            const found = this.insumos.find(
                (item) => item.inpp_Id === insumo.inpp_Id
            );
            console.log(found);
            if (found.inpa_Id && found.inpa_Id != found.inpa_ActividadLlenado) {
                console.log('SIEMPRE ENTRO', found.inpa_Id);
                await this.service
                    .EliminarInsumoPorActividad(found.inpa_Id)
                    .then(
                        (response) => {
                            if (response.code == 200) {
                                console.log('Eliminado con exito');
                            }
                        },
                        (error) => {}
                    );
            }
            this.insumos = this.insumos.filter(
                (item) => item.inpa_ActividadLlenado !== insumo.inpa_Id
            );
        }

        // Reasignar los códigos secuenciales después de agregar o eliminar
        this.insumos.forEach((item, index) => {
            item.codigo = index + 1; // Reasigna el código secuencialmente
        });

        // Recalcular el valor de materialInsumo
        this.actualizarMaterialInsumo();
        console.log(this.insumos);
    }

    async AddInsumo(insumo: any, event: any) {
        if (event.checked) {
            // Solo agregar el insumo si el checkbox está marcado
            const newCode = this.insumos.length + 1; // Generar un número secuencial basado en la longitud actual
            const AddRow = {
                codigo: newCode, // Asignar el número secuencial
                costo: insumo.inpp_Preciocompra,
                inpp_Id: insumo.inpp_Id,
                select: true,
                inpa_Id: 0,
                id: insumo.codigo,
                estado: 'Sin Guardar',
                costoFormula: '',
                unme_Nombre: insumo.unme_Nombre,
                unme_Nomenclatura: insumo.unme_Nomenclatura,
                desperdicio: '',
                costoUnitario: '0.00',
                cantidad: 1,
                acet_Id: this.acet_Id,
                inpa_ActividadLlenado: 0,
                cantidadFormula: '',
                rendimiento: '',
                rendimientoFormula: '',
                insumo: insumo.insu_Descripcion,
                proveedor: insumo.prov_Descripcion,
                material: insumo.mate_Descripcion,
                categoria: insumo.cate_Descripcion,
                rendimientoReferencias: [],
                cantidadReferencias: [],
                costoReferencias: [],
            };
            console.log('AddRow', AddRow);
            this.insumos.push(AddRow);
            this.actualizarMaterialInsumo();
        } else {
            // Si el checkbox se desmarca, elimina el insumo de la lista
            console.log('InsumoSS', insumo);
            const found = this.insumos.find(
                (item) => item.inpp_Id === insumo.inpp_Id
            );
            if (found.inpa_Id) {
                console.log('Traigo Id');
                await this.service
                    .EliminarInsumoPorActividad(found.inpa_Id)
                    .then(
                        (response) => {
                            if (response.code == 200) {
                                console.log('Eliminado con exito');
                            }
                        },
                        (error) => {}
                    );
            }
            this.insumos = this.insumos.filter(
                (item) => item.inpp_Id !== insumo.inpp_Id
            );
            console.log('Id Eliminado', found);
        }

        // Reasignar los códigos secuenciales después de agregar o eliminar
        this.insumos.forEach((item, index) => {
            item.codigo = index + 1; // Reasigna el código secuencialmente
        });

        // Recalcular el valor de materialInsumo
        this.actualizarMaterialInsumo();
        console.log(this.insumos);
    }

    async AddMaquinaria(maquinaria: any, event: any) {
        if (event.checked) {
            // Solo agregar el insumo si el checkbox está marcado
            const newCode = this.maquinariasAgregadas.length + 1; // Generar un número secuencial basado en la longitud actual
            const AddRow = {
                codigo: newCode, // Asignar el número secuencial
                rmac_PrecioRenta: maquinaria.mapr_PrecioCompra,
                rmac_Id: 0,
                mapr_Id: maquinaria.mapr_Id,
                renta: maquinaria.renta,
                select: false,
                id: maquinaria.codigo,
                rmac_ActividadLlenado: 0,
                estado: 'Sin Guardar',
                rmac_CantidadRenta: 1,
                rmac_CantidadMaquinas: 1,
                rmac_CantidadRentaFormula: '',
                rmac_PrecioRentaFormula: '',
                rmac_CantidadMaquinasFormula: '',
                acet_Id: this.acet_Id,
                subtotal: '0.00',
                prov_Descripcion: maquinaria.prov_Descripcion,
                maqu_Descripcion: maquinaria.maqu_Descripcion,
                nive_Descripcion: maquinaria.nive_Descripcion,
                rmac_PrecioRentaReferencias: [],
                rmac_CantidadMaquinasReferencias: [],
                rmac_CantidadRentaReferencias: [],
            };
            console.log('AddRow', AddRow);
            this.maquinariasAgregadas.push(AddRow);
            this.actualizarMaquinariaInsumo();
        } else {
            // Si el checkbox se desmarca, elimina el insumo de la lista
            const found = this.maquinariasAgregadas.find(
                (item) => item.mapr_Id === maquinaria.mapr_Id
            );
            if (found.rmac_Id) {
                console.log('Traigo Id');
                await this.service
                    .EliminarMaquinariaPorActividad(found.rmac_Id)
                    .then(
                        (response) => {
                            if (response.code == 200) {
                                console.log('Eliminado con exito');
                            }
                        },
                        (error) => {}
                    );
            }
            this.maquinariasAgregadas = this.maquinariasAgregadas.filter(
                (item) => item.mapr_Id !== maquinaria.mapr_Id
            );
            console.log('Id Eliminado', found);
        }

        // Reasignar los códigos secuenciales después de agregar o eliminar
        this.maquinariasAgregadas.forEach((item, index) => {
            item.codigo = index + 1; // Reasigna el código secuencialmente
        });

        // Recalcular el valor de materialInsumo
        this.actualizarMaquinariaInsumo();
        // console.log(this.insumos);
    }

    async AddMaquinariaLlenado(maquinaria: any, event: any) {
        if (event.checked) {
            // Solo agregar el insumo si el checkbox está marcado
            const newCode = this.maquinariasAgregadas.length + 1; // Generar un número secuencial basado en la longitud actual
            const AddRow = {
                codigo: newCode, // Asignar el número secuencial
                rmac_PrecioRenta: maquinaria.rmac_PrecioRenta,
                rmac_Id: maquinaria.rmac_Id,
                mapr_Id: maquinaria.mapr_Id,
                renta: maquinaria.renta,
                select: false,
                id: maquinaria.codigo,
                rmac_ActividadLlenado: maquinaria.rmac_Id,
                estado: 'Sin Guardar',
                rmac_CantidadRenta: 1,
                rmac_CantidadMaquinas: 1,
                subtotal: '0.00',
                rmac_CantidadRentaFormula: '',
                rmac_PrecioRentaFormula: '',
                rmac_CantidadMaquinasFormula: '',
                acet_Id: this.acet_Id,
                prov_Descripcion: maquinaria.prov_Descripcion,
                maqu_Descripcion: maquinaria.maqu_Descripcion,
                nive_Descripcion: maquinaria.nive_Descripcion,
                rmac_PrecioRentaReferencias: [],
                rmac_CantidadMaquinasReferencias: [],
                rmac_CantidadRentaReferencias: [],
            };
            console.log('AddRow', AddRow);
            this.maquinariasAgregadas.push(AddRow);
            this.actualizarMaquinariaInsumo();
        } else {
            // Si el checkbox se desmarca, elimina el insumo de la lista
            const found = this.maquinariasAgregadas.find(
                (item) => item.mapr_Id === maquinaria.mapr_Id
            );
            if (found.rmac_Id && found.rmac_Id != found.rmac_ActividadLlenado) {
                console.log('Traigo Id');
                await this.service
                    .EliminarMaquinariaPorActividad(found.rmac_Id)
                    .then(
                        (response) => {
                            if (response.code == 200) {
                                console.log('Eliminado con exito');
                            }
                        },
                        (error) => {}
                    );
            }
            this.maquinariasAgregadas = this.maquinariasAgregadas.filter(
                (item) => item.rmac_ActividadLlenado !== maquinaria.rmac_Id
            );
            console.log('Id Eliminado', found);
        }

        // Reasignar los códigos secuenciales después de agregar o eliminar
        this.maquinariasAgregadas.forEach((item, index) => {
            item.codigo = index + 1; // Reasigna el código secuencialmente
        });

        // Recalcular el valor de materialInsumo
        this.actualizarMaquinariaInsumo();
        // console.log(this.insumos);
    }

    onInsumoChange(rowData: any,field?: string) {
        let value = rowData[field]
        if(!isNaN(value)){
            if(value > 999)
                rowData[field] = 999
            else if(value < 0)
                rowData[field] = 0
        }
        if(!isNaN(rowData[field])){
            console.log('Entro INusmo',field)
            this.actualizarMaterial = true;
            if(field != 'desperdicio'){
                this.evaluarPropagarInsumo(rowData,field);
            }
            this.actualizarCostoUnitario(rowData);

        }
    }
    actualizarCostoUnitario(rowData: any) {
        const porcentaje = parseFloat(rowData.desperdicio) / 100;
        if (!isNaN(porcentaje)) {
            const prueba = rowData.costo * rowData.rendimiento;
            rowData.costoUnitario = (prueba * (1 + porcentaje) * rowData.cantidad).toFixed(2);
            this.actualizarMaterialInsumo();
        }
    }
    actualizarSubtotalMaquinaria(rowData: any) {
        rowData.subtotal =
            rowData.rmac_CantidadRenta *
            rowData.rmac_PrecioRenta *
            rowData.rmac_CantidadMaquinas;
        this.actualizarMaquinariaInsumo();
    }
    onMaquinariaChange(rowData: any,field?: string) {
        let value = rowData[field]
        if(!isNaN(value)){
            if(value > 999)
                rowData[field] = 999
            else if(value < 0)
                rowData[field] = 0
        }
        if(!isNaN(rowData[field])){
            this.actualizarMaquinaria = true;
            this.evaluarPropagarMaquinaria(rowData,field);
            this.actualizarSubtotalMaquinaria(rowData);
        }
    }
toggleExpand(rowData: any) {
    // Cerrar todas las filas antes de expandir la nueva fila
    this.prueba.forEach(row => {
        if (row !== rowData) {
            row.expanded = false;  // Cierra cualquier fila que no sea la actual
            this.expandedRows = {};
        }
    });

    this.expandedRows[rowData.acetId] = true;
    // Si la fila no estaba expandida, procedemos a expandirla
        this.MostrarInsumosDetalle(rowData.acetId); // Solo muestra los insumos si se va a expandir

    // Cambiar el estado de la fila actual
    rowData.expanded = !rowData.expanded;

       // Forzar la detección de cambios
    this.cdr.detectChanges();
}

MostrarInsumosDetalle(acetId: any) {
    // Filtrar insumos por `acet_Id`
    this.insumosFiltrados = this.insumos.filter(
        (item) => item.acet_Id === acetId
    );
   // Filtrar maquinarias por `acet_Id`
     this.maquinariasFiltrados = this.maquinariasAgregadas.filter(
         (item) => item.acet_Id === acetId
     );
    // Reasignar los códigos secuenciales en maquinarias
     this.maquinariasFiltrados.forEach((item, index) => {
         item.codigo = index + 1; // Reasigna el código secuencialmente
     });
    //  Reasignar los códigos secuenciales en insumos
    this.insumosFiltrados.forEach((item, index) => {
        item.codigo = index + 1; // Reasigna el código secuencialmente
    });
}




    actualizarMaterialInsumo() {
        // Inicializar los totales
        let totalMaterialGeneral = 0;
        let totalMaterialGuardado = 0;

        // Iterar sobre cada insumo para calcular los totales
        this.insumos.forEach((item) => {
            // Asegurarse de que el costoUnitario no sea NaN o indefinido
            const costoUnitario = parseFloat(item.costoUnitario) || 0;

            // Sumar al total general
            totalMaterialGeneral += costoUnitario;

            // Sumar al total solo si el estado es 'Guardado'
            if (item.estado === 'Guardado') {
                totalMaterialGuardado += costoUnitario;
            }
        });

        // Asignar el total general a materialInsumo, redondeado a dos decimales
        this.materialInsumo = totalMaterialGeneral.toFixed(2);

        // Filtrar el arreglo `prueba` por `acet_Id`
        const registrosFiltrados = this.prueba.filter(
            (item) => item.acetId === this.acet_Id
        );

        // Asegurarse de que hay al menos un registro filtrado
        if (registrosFiltrados.length > 0) {
            // Asignar el total material solo para los insumos con estado 'Guardado'
            if(this.actualizarMaterial){
                registrosFiltrados[0].material = totalMaterialGuardado.toFixed(2);
            }
            // Calcular PU y actualizar el material en la interfaz
             this.calcularPU(registrosFiltrados[0], this.rowIndex);

            // Actualizar el subtotal de la actividad
            // this.totalActividad = parseFloat(registrosFiltrados[0].subtotal);

            // Actualizar el material en la interfaz
            this.onMaterialChange(registrosFiltrados[0], this.rowIndex);

            // Mostrar los registros filtrados en la consola
            console.log('Registros Filtrados:', registrosFiltrados[0]);
        }

        // Actualizar el subtotal del insumo
        this.actualizarSubtotalInsumo();
    }

    actualizarMaquinariaInsumo() {
        // Inicializar los totales
        let totalMaquinariaGeneral = 0;
        let totalMaquinariaGuardado = 0;

        // Iterar sobre cada insumo para calcular los totales
        this.maquinariasAgregadas.forEach((item) => {
            const maquinariaValue =
                item.rmac_CantidadRenta *
                item.rmac_PrecioRenta *
                item.rmac_CantidadMaquinas;

            // Sumar al total general
            totalMaquinariaGeneral += maquinariaValue;

            // Sumar al total solo si el estado es 'Guardado'
            if (item.estado === 'Guardado') {
                totalMaquinariaGuardado += maquinariaValue;
            }
        });

        // Asignar el total general a materialInsumo, redondeado a dos decimales
        this.maquinariaInsumo = totalMaquinariaGeneral.toFixed(2);
        // Filtrar el arreglo `prueba` por `acet_Id`
        const registrosFiltrados = this.prueba.filter(
            (item) => item.acetId === this.acet_Id
        );

        // Asegurarse de que hay al menos un registro filtrado
        if (registrosFiltrados.length > 0) {
            // Asignar el total material solo para los insumos con estado 'Guardado'
            if(this.actualizarMaquinaria){
                registrosFiltrados[0].maquinaria =
                totalMaquinariaGuardado.toFixed(2);
            }

            // Calcular PU y actualizar el material en la interfaz
            this.calcularPU(registrosFiltrados[0], this.rowIndex);
            // this.subtotalInsumo = registrosFiltrados[0].subtotal;
            // this.totalActividad = parseFloat(registrosFiltrados[0].subtotal);

            // Mostrar los registros filtrados en la consola
            console.log('Registros Filtrados:', registrosFiltrados[0]);
        }
        this.actualizarSubtotalInsumo();
    }

    actualizarSubtotalInsumo() {
        if (!isNaN(parseFloat(this.materialInsumo)) && !isNaN(parseFloat(this.maquinariaInsumo))) {
            const registrosFiltrados = this.prueba.filter(
                (item) => item.acetId === this.acet_Id
            );
            this.subtotalInsumo = parseFloat(this.materialInsumo) + parseFloat(this.maquinariaInsumo);
            let total = 0;
            total = (parseFloat(this.materialInsumo) + parseFloat(registrosFiltrados[0].manoDeObra)) * parseInt(registrosFiltrados[0].cant) + parseFloat(this.maquinariaInsumo)
            console.log('Total Acti',total)
            this.totalActividad = total;
            // console.log('Total Mano',registrosFiltrados[0].manoDeObra)
        } else {
            console.log('IS NAN');
        }
    }

    formateoVariables() {
        this.pren_Id = 0;
        this.nombreSupervisor = '';
        this.presupuestoPlantilla = '';
        this.proyectoPlantilla = '';
        this.defaultPorcentaje = '';
        this.valSwitch = false;
        this.maquinariaCalculo = false;
        this.insumos = [];
        this.checked = true;
        this.insumosOptionsFiltrados = [];
        this.submittedCliente = false;
        this.submittedEmpleado = false;
        this.submittedProyecto = false;
        this.insumosLlenado = [];
        this.maquinariaOptions = [];
        this.maquinariasAgregadas = [];
        this.selectEliminarConversion = false;
        this.mone_Id = 1;
        this.fecha = '';
        this.Subtotal = 0;
        this.ISV = 0;
        this.ISVUSD = '0';
        this.Total = 0;
        this.TotalUSD = '0';
        this.SubtotalUSD = '0';
        this.SubtotalSinIsv = '0';
        this.prueba = [
            {
                etpr_Id: 0,
                item: '1.00',
                descripcion: '',
                manoDeObraUtili: '0.00',
                materialUtili: '0.00',
                subtotalUtil: '0.00',
                puUtili: '0.00',
                etap_Id: 0,
                puUSDUtili: '0.00',
                subtotalConIsv: '0.00',
                subtotalUSDUtili: '0.00',
                cant: '0.00',
                unidad: '',
                manoDeObra: '0.00',
                material: '0.00',
                maquinaria: '0.00',
                esEtapa: true,
                invalid: false,
                pu: '0.00',
                subtotal: '0.00',
                puUSD: '0.00',
                subtotalUSD: '0.00',
                Isv: '0.00',
            },
            {
                item: '1.01',
                descripcion: '',
                etpr_Id: 0,
                empl_Id: 0,
                isSwitchDisabled: false,
                copc_Id: 0,
                manoDeObraUtili: '0.00',
                materialUtili: '0.00',
                manoObraTotalUtili: '0.00',
                materialTotalUtili: '0.00',
                puUtili: '0.00',
                subtotalUtil: '0.00',
                unme_Id: 0,
                acetIdLlenado: 0,
                puUSDUtili: '0.00',
                subtotalUSDUtili: '0.00',
                manoObraTotal: '0.00',
                materialTotal: '0.00',
                porcen: this.defaultPorcentaje,
                expanded: false,
                esIsv: false,
                cant: '0.00',
                unidad: '',
                acetId: 0,
                actiId: 0,
                manoDeObra: '0.00',
                material: '0.00',
                maquinaria: '0.00',
                maquinariaFormula: '',
                esEtapa: false,
                subtotalConIsv: '0.00',
                invalid: false,
                id: 0,
                maquinariaTotal: '0.00',
                cantFormula: '',
                manoDeObraFormula: '',
                materialFormula: '',
                verification: false,
                Isv: '0.00',
                pu: '0.00',
                subtotal: '0.00',
                puUSD: '0.00',
                subtotalUSD: '0.00',
                maquinariaReferencias: [],
                cantReferencias: [],
                manoDeObraReferencias: [],
                materialReferencias: []
            },
        ];

        this.conversiones = [
            {
                pptc_Id: 0,
                taca_Id: 0,
                selectt: false,
                monedaDe: this.monedas[0].value,
                valorDe: 0,
                monedaA: '',
                valorA: 0,
                listaConversiones: [],
            },
        ];
        this.onMonedaChange(1, 0);
        console.log('ListaCOnve', this.conversiones);
    }
    async listarPresupuesto() {
        this.loading = true;
        try {
            await this.service.Listar().then(
                (data: any[]) => {
                    this.presupuestoOptions = data.map((presupuesto: any) => ({
                        ...presupuesto,

                    }));
                    console.log("listar: "+ data);

                },
                (error) => {
                    console.log(error);
                }
            );

            //Quitamos el cargando
            this.loading = false;
        } catch (error) {
            this.loading = false;
            this.loadedTableMessage = 'No existen presupuestos existentes aún.';
        }
    }

    async listarPresupuestoSort() {
        this.loading = true;
        try {
            await this.service.Listar().then(
                (data: any[]) => {
                    this.presupuestoOptionsSort = data.sort((a, b) =>
                        a.pren_Titulo.localeCompare(b.pren_Titulo)
                    );
                },
                (error) => {
                    console.log(error);
                }
            );

            //Quitamos el cargando
            this.loading = false;
        } catch (error) {
            this.loading = false;
            this.loadedTableMessage = 'No existen proveedores existentes aún.';
        }
        console.log("sort: "+this.presupuestoOptionsSort);

    }

    async listarMaquinariasPorProveedor(id: number) {
        await this.service.BuscarMaquinariaPorProveedores(id).then(
            (data: any) => {
                if (data.length > 0) {
                    let id = 1;
                    // Inicializa la variable insumosOptions con los datos
                    this.maquinariaOptions = data.map((item) => ({
                        ...item,
                        selected: false, // Inicializa como no seleccionado
                        id: id++,
                    }));
                    console.log('InsumoOptions', this.maquinariaOptions);

                    // Marcar los checkboxes correspondientes basados en el inpp_Id
                    this.maquinariasAgregadas.forEach((maquinaria) => {
                        console.log('Insumo', maquinaria);
                        const index = this.maquinariaOptions.findIndex(
                            (option) => option.mapr_Id === maquinaria.mapr_Id
                        );
                        if (index !== -1) {
                            console.log('Si Entro', index);
                            this.maquinariaOptions[index].selected = true;
                        }
                    });

                    // Ordenar insumosOptions para que los seleccionados estén al principio
                    const seleccionados = this.maquinariaOptions.filter(
                        (option) => option.selected
                    );
                    const noSeleccionados = this.maquinariaOptions.filter(
                        (option) => !option.selected
                    );

                    // Combinar seleccionados y no seleccionados, asegurando que los seleccionados estén primero
                    this.maquinariaOptions = [
                        ...seleccionados,
                        ...noSeleccionados,
                    ];

                    // Reasignar los códigos después de ordenar
                    let codigoCounter = 1; // Reinicia el contador de código en 1
                    this.maquinariaOptions.forEach((option) => {
                        option.codigo = codigoCounter++; // Asigna el valor del contador y luego lo incrementa
                    });
                }
            },
            (error) => {}
        );
    }

    async listarInsumos(id: number) {
        await this.service.ListarInsumosPorProveedor(id).then(
            (data: any) => {
                if (data.length > 0) {
                    let id = 1;
                    // Inicializa la variable insumosOptions con los datos
                    this.insumosOptions = data.map((item) => ({
                        ...item,
                        selected: false, // Inicializa como no seleccionado
                        id: id++,
                    }));
                    console.log('InsumoOptions', this.insumosOptions);

                    // Marcar los checkboxes correspondientes basados en el inpp_Id
                    this.insumos.forEach((insumo) => {
                        console.log('Insumo', insumo);
                        const index = this.insumosOptions.findIndex(
                            (option) => option.inpp_Id === insumo.inpp_Id
                        );
                        if (index !== -1) {
                            console.log('Si Entro', index);
                            this.insumosOptions[index].selected = true;
                        }
                    });

                    // Ordenar insumosOptions para que los seleccionados estén al principio
                    const seleccionados = this.insumosOptions.filter(
                        (option) => option.selected
                    );
                    const noSeleccionados = this.insumosOptions.filter(
                        (option) => !option.selected
                    );

                    // Combinar seleccionados y no seleccionados, asegurando que los seleccionados estén primero
                    this.insumosOptions = [
                        ...seleccionados,
                        ...noSeleccionados,
                    ];

                    this.insumosOptionsFiltrados = this.insumosOptions.filter(
                        (item) => item.prov_Id === this.prov_Id
                    );
                    console.log(this.insumosOptionsFiltrados);
                    // Reasignar los códigos después de ordenar
                    let codigoCounter = 1; // Reinicia el contador de código en 1
                    this.insumosOptions.forEach((option) => {
                        option.codigo = codigoCounter++; // Asigna el valor del contador y luego lo incrementa
                    });
                }
            },
            (error) => {}
        );
    }

    filterUnidad(event: any, rowData: any) {
        const filtered: any[] = [];
        this.isUnidadSelected = false;
        const query = event.query;
        this.valueFilterUnidad = rowData.unidad;
        this.formUnidadMedida.patchValue({ unme_Nomenclatura: query });
        for (let i = 0; i < this.listunidades.length; i++) {
            const country = this.listunidades[i];
            if (
                country.unme_Nomenclatura
                    .toLowerCase()
                    .indexOf(query.toLowerCase()) == 0
            ) {
                filtered.push(country);
            }
        }

        this.filteredUndiad = filtered;
    }

    filterPresupuesto(event: any) {
        const filtered: any[] = [];
        const query = event.query;
        for (let i = 0; i < this.presupuestoOptionsSort.length; i++) {
            const country = this.presupuestoOptionsSort[i];
            if (
                country.pren_Titulo
                    .toLowerCase()
                    .indexOf(query.toLowerCase()) == 0
            ) {
                filtered.push(country);
            }
        }

        this.filteredPresupuesto = filtered;
    }

    filterProjecto2(event: any, opcion: string) {
        const filtered: any[] = [];
        const query = event.query;


        for (let i = 0; i < this.proyectoOptions2.length; i++) {
            const country = this.proyectoOptions2[i];
            if (
                country.proyecto.toLowerCase().indexOf(query.toLowerCase()) == 0
            ) {
                filtered.push(country);
            }
        }

        this.filteredProyecto2 = filtered;
    }
    filterProveedor(event: any) {
        const filtered: any[] = [];
        const query = event.query;

        for (let i = 0; i < this.proveedorOptions.length; i++) {
            const country = this.proveedorOptions[i];
            if (
                country.prov_Descripcion
                    .toLowerCase()
                    .indexOf(query.toLowerCase()) == 0
            ) {
                filtered.push(country);
            }
        }

        this.filteredProveedor = filtered;
    }
    onProveedorSelect(event: any) {
        const proveedor = event.value;
        this.insumosOptionsFiltrados = [];
        this.prov_Descripcion = proveedor.prov_Descripcion;
        this.maquinariaOptions = [];
        this.prov_Id = proveedor.prov_Id;
        if (proveedor.prov_InsumoOMaquinariaOEquipoSeguridad == 1) {
            this.tabInsumo = true;
            console.log('TRUE');
        } else {
            this.tabInsumo = false;
            console.log('FALSE');
        }
        if (proveedor.prov_InsumoOMaquinariaOEquipoSeguridad == 0) {
            this.tabMaquinaria = true;
        } else {
            this.tabMaquinaria = false;
        }
        this.listarInsumos(proveedor.prov_Id);
        this.listarMaquinariasPorProveedor(proveedor.prov_Id);
    }
    async onProyectoSeletArticulo(event: any) {
        const proyecto = event.value;
        this.actividadArticuloOptions = [];
        this.etapaArticuloOptions = [];
        console.log('Id Proy', proyecto.proy_Id);
        await this.service.ListarEtapaPorProyecto(proyecto.proy_Id).then(
            (data: any) => {
                console.log('Data etapapor', data);
                this.etapaArticuloOptions = data.sort((a, b) =>
                    a.etap_Descripcion.localeCompare(b.etap_Descripcion)
                );
            },
            (error) => {}
        );
    }

    async onEtapaSelectArticulo(event: any) {
        const etapa = event.value;
        console.log('Etpr Id', etapa.etpr_Id);
        await this.actividadPorEtapaService.Listar(etapa.etpr_Id).then(
            (data: any) => {
                console.log('Data Etpr', data);
                this.actividadArticuloOptions = data.sort((a, b) =>
                    a.acti_Descripcion.localeCompare(b.acti_Descripcion)
                );
            },
            (error) => {}
        );
    }

    onActividadSelectArticulo(event: any) {
        const actividad = event.value;
        console.log('Etpr Id', actividad);
        this.maquinariasAgregadasLlenado = [];
        this.listarInsumosPorActividadLlenado(actividad.acet_Id);
        this.listarMaquinariasPorActividadLlenado(actividad.acet_Id);
    }

    filterActividadArticulo(event: any) {
        const filtered: any[] = [];
        const query = event.query;
        for (let i = 0; i < this.actividadArticuloOptions.length; i++) {
            const country = this.actividadArticuloOptions[i];
            if (
                country.acti_Descripcion
                    .toLowerCase()
                    .indexOf(query.toLowerCase()) == 0
            ) {
                filtered.push(country);
            }
        }

        this.filteredActividadArticulo = filtered;
    }

    filterEtapaArticulo(event: any) {
        const filtered: any[] = [];
        const query = event.query;
        for (let i = 0; i < this.etapaArticuloOptions.length; i++) {
            const country = this.etapaArticuloOptions[i];
            if (
                country.etap_Descripcion
                    .toLowerCase()
                    .indexOf(query.toLowerCase()) == 0
            ) {
                filtered.push(country);
            }
        }

        this.filteredEtapaArticulo = filtered;
    }

    filterProjecto(event: any, opcion: string) {
        const filtered: any[] = [];
        const query = event.query;
        this.submittedProyecto = false;
            console.log(this.form.controls['proy_Id'].invalid);
            console.log(this.submittedProyecto);
        for (let i = 0; i < this.proyectoOptions.length; i++) {
            const country = this.proyectoOptions[i];
            if (
                country.proyecto.toLowerCase().indexOf(query.toLowerCase()) == 0
            ) {
                filtered.push(country);
            }
        }

        this.filteredProyecto = filtered;
    }

    handleMaterialChange(rowData: any, rowIndex: number) {
        const key = `${rowIndex}_material`;
        this.valoresOriginales[key] = parseFloat(rowData.material);
    }

    isDeleteEtapaDisabled(): boolean {
        // Contar las etapas en el arreglo 'prueba'
        const etapasCount = this.prueba.filter((row) => row.esEtapa).length;
        // Deshabilitar si solo hay una etapa
        return etapasCount <= 1;
    }

    deleteEtapa() {
        if (this.isDeleteEtapaDisabled()) {
            return;
        }
        if (this.btnEliminar == false) {
            this.btnEliminar = true;
            this.btnAgregar = false;
        } else {
            this.btnEliminar = false;
            this.btnAgregar = false;
        }
    }

    ConfirmarEliminar(rowData: any, index: number) {
        this.valueFilterEtapa = rowData.descripcion;
        this.indexToDelete = index; // Almacenar el índice de la etapa a eliminar
        this.Delete = true;
    }

    async listarPresupuestoDetalle(id: number) {
        await this.presupuestodetalleservice.Listar(id).then(
            (data: any) => {
                if (data.length > 0) {
                    this.detallesOptions = data;
                }
            },
            (error) => {}
        );
    }
    async EliminarEtapa() {
        if (this.indexToDelete !== null) {
            let estadoPresupuesto = 'No';
            const foundProyecto = this.proyectoOptions.find(
                (proyecto) => proyecto.proy_Id === this.form.value.proy_Id
            );
            if (foundProyecto.espr_Id == 1) {
                estadoPresupuesto = 'Si';
            }
            const etapaToDelete = this.prueba[this.indexToDelete];
            const etapaItemPrefix = etapaToDelete.item.split('.')[0];

            const pdetIds = this.prueba
                .filter(
                    (row) =>
                        row.item.split('.')[0] === etapaItemPrefix &&
                        !row.esEtapa &&
                        row.id != 0 &&
                        row.id != null
                )
                .map((row) => row.id);

            console.log(pdetIds);
            if (pdetIds.length > 0) {
                for (const pdetId of pdetIds) {
                    await this.presupuestodetalleservice.Eliminar(pdetId).then(
                        (response) => {
                            if (response.code == 200) {
                                console.log(
                                    `Detalle con pdetId ${pdetId} eliminada.`
                                );
                            }
                        },
                        (error) => {
                            console.error(
                                'Error al eliminar detalle: ' + error
                            );
                        }
                    );
                }
            }

            console.log(etapaToDelete);

            const etpr_Id = etapaToDelete.etpr_Id;
            console.log(etpr_Id);

            if (estadoPresupuesto === 'Si') {
                // Eliminar la etapa
                await this.etapaporproyectoService.Eliminar(etpr_Id).then(
                    (data: any) => {
                        console.log(`Etapa con etpr_Id ${etpr_Id} eliminada.`);
                    },
                    (error) => {
                        console.error('Error al eliminar etapa: ' + error);
                    }
                );
            }

            // Filtrar la etapa y las actividades asociadas de la lista
            this.prueba = this.prueba.filter((row) => {
                const rowItemPrefix = row.item.split('.')[0];
                return rowItemPrefix !== etapaItemPrefix;
            });

            // Reordenar los ítems después de la eliminación
            this.reorderItems();
            this.actualizarTotalesGenerales();
            // Restablecer el estado
            this.Delete = false;
            this.indexToDelete = null; // Restablecer el índice
            this.btnEliminar = false; // Restablecer el estado del botón
        }
    }

    Siguiente(){
        if(this.Titulo == 'Nuevo Presupuesto'){
            this.Guardar();
        }else{this.activeIndex = 1}
    }

    handleBlurUnidad(event: any, rowData: any, rowIndex: number) {
        this.modalUnidad = false;
        
        setTimeout(() => {
            if (!this.isUnidadSelected) {
                const currentRow = this.prueba[rowIndex];

                const foundUnidad = this.listunidades.find(
                    (unidad) =>
                        unidad.unme_Nomenclatura.toLowerCase().trim() ===
                        currentRow.unidad.toLowerCase().trim()
                );
                if (!foundUnidad && this.valueFilterUnidad) {
                    this.modalUnidad = true;
                }
            }
            this.isUnidadSelected = false;
        }, 200); // Espera de 200ms para que onSelect pueda ejecutarse primero
    }

    reorderItems() {
        let etapaCount = 0;
        let actividadCount = 1;
        let previousEtapaPrefix = '';

        this.prueba.forEach((row) => {
            if (row.esEtapa) {
                etapaCount++;
                actividadCount = 1; // Reset activity count for new etapa
                row.item = `${etapaCount}.00`;
                previousEtapaPrefix = `${etapaCount}`;
            } else {
                row.item = `${previousEtapaPrefix}.${
                    actividadCount < 10 ? '0' + actividadCount : actividadCount
                }`;
                actividadCount++;
            }
        });
    }

    filterActividad(event: any, rowData: any) {
        const query = event.query;
        this.isActividadSelected = false;
        this.valueFilterActividad = rowData.descripcion;
        if (this.actividadOptions && this.actividadOptions.length > 0) {
            const filtered: any[] = this.actividadOptions.filter(
                (actividad: any) =>
                    actividad.acti_Descripcion
                        .toLowerCase()
                        .indexOf(query.toLowerCase()) === 0
            );
            this.filteredActividades = filtered;
        } else {
            this.filteredActividades = []; // Limpiar filteredActividades si no hay opciones disponibles
        }
    }

    filterEmpleado(event: any) {
        const query = event.query.toLowerCase();
        this.submittedEmpleado = false;
        this.filtradoEmpleado = this.empleados.filter((empleado) =>
            empleado.empleado.toLowerCase().includes(query)
        );
    }

    filterCliente(event: any) {
        const query = event.query.toLowerCase();
        console.log('Event',event.originalEvent)
        if(event.originalEvent === InputEvent){
            console.log('Input Event')
        }
        this.submittedCliente = false;
        this.filtradoCliente = this.clientes.filter((cliente) =>
            cliente.cliente.toLowerCase().includes(query)
        );
    }

    onEmpleadoSelect(event: any) {
        const empleadoSeleccionado = event;
        const nombre = empleadoSeleccionado.value.empl_Nombre;
        const apellido = empleadoSeleccionado.value.empl_Apellido;
        this.nombreSupervisor = nombre + ' ' + apellido;
        this.submittedEmpleado = false;
        console.log(this.nombreSupervisor);
        // this.nombreSupervisor = supervisor;
        console.log(empleadoSeleccionado.value.empl_Id);
        this.form.patchValue({
            empl_Id: empleadoSeleccionado.value.empl_Id,
            empleado: empleadoSeleccionado.value.empleado,
        });
    }
    onProyectoSelect(event: any, opcion: string) {
        if (opcion == '0') {
            const proyetoSeleccionado = event;
            console.log(proyetoSeleccionado.value.proy_Id);
            console.log(proyetoSeleccionado.value.proy_Nombre);
            console.log('ProyectoPlantilla', this.proyectoPlantilla);
            this.proyectoValue = proyetoSeleccionado.value.proy_Nombre;
            this.form.patchValue({
                proy_Id: proyetoSeleccionado.value.proy_Id,
                proyecto: proyetoSeleccionado.value.proy_Nombre,
            });
            this.submittedProyecto = false;

            // this.listarActividadesDeProyecto(event.value.proy_Id);
        } else {
            this.proy_IdLlenado = event.value.proy_Id;
            this.proyectoPlantilla = event.value.proy_Nombre;

            console.log(this.proy_IdLlenado);
             this.submittedProyecto = false;

            this.listarActividadesDeProyecto(event.value.proy_Id);
        }
    }

    onClienteSelect(event: any) {
        const clienteSeleccionado = event;
        console.log(clienteSeleccionado);

        console.log(clienteSeleccionado.value.clie_Id);
        this.form.patchValue({
            clie_Id: clienteSeleccionado.value.clie_Id,
            cliente: clienteSeleccionado.value.cliente,
        });
        this.submittedCliente = false;
    }

    async cargarMonedas() {
        await this.presupuestotasaservice.ListarMonedas().then(
            (data: any[]) => {
                // Filtra las monedas para obtener solo las que tienen mone_Id === 1
                const monedasFiltradas = data.filter(
                    (moneda) => moneda.mone_Id === 1
                );

                // Si hay monedas filtradas, usa la primera para establecer la abreviatura
                if (monedasFiltradas.length > 0) {
                    const monedaSeleccionada = monedasFiltradas[0];
                    this.abreviaturaMoneda =
                        monedaSeleccionada.mone_Abreviatura;
                    console.log('Abrevi', this.abreviaturaMoneda);
                } else {
                    this.abreviaturaMoneda = null; // O algún valor predeterminado
                    console.log('No se encontró moneda con mone_Id 1');
                }

                // Mapear solo las monedas filtradas
                this.monedas = monedasFiltradas.map((item) => ({
                    label: item.mone_Nombre,
                    value: item.mone_Id,
                }));
                console.log(this.monedas);
            },
            (error) => {
                console.log(error);
            }
        );
    }

    async onMonedaChange(event: any, index: number) {
        let id = event.value;
        if (!id) {
            id = event;
        }
        this.mone_Id = id;
        console.log(id);
        if (id) {
            await this.presupuestotasaservice.ListarConversiones(id).then(
                (data: any[]) => {
                    // Mapear las conversiones disponibles
                    data.sort((a, b) => a.moneda_B.localeCompare(b.moneda_B));
                    this.conversiones[index].listaConversiones = data.map(
                        (item) => ({
                            label: item.moneda_B,
                            value: item.taca_Id,
                        })
                    );

                    console.log(this.conversiones[index]);

                    if (data.length > 0 && this.Titulo == 'Nuevo Presupuesto') {
                        // Asignar el primer taca_Id disponible
                        this.conversiones[index].taca_Id = data[0].taca_Id;

                        // Establecer la primera opción de la lista como MonedaA predeterminada
                        this.conversiones[index].monedaA =
                            this.conversiones[index].listaConversiones[0].value;

                        // Actualizar los valores de moneda correspondientes
                        this.onChange({ value: this.conversiones[index].monedaA },index);
                    }
                },
                (error) => {
                    console.error('Error fetching conversiones:', error);
                }
            );
        } else {
            this.conversiones[index].listaConversiones = [];
        }
    }

    async listarInsumosPorActividadDetalle(id: number) {
        await this.service.ListarInsumosPorAcitividad(id).then(
            (data: any[]) => {
                if (data && data.length > 0) {
                    let codigoCounter = 1; // Inicializa el contador de código en 1
                    let idIncrementable = 1;

                    // Iterar sobre los datos recibidos y agregarlos al arreglo insumos

                    data.forEach((item) => {
                        const porcentaje = parseFloat(item.inpa_Desperdicio) / 100;

                            const prueba = item.inpa_PrecioCompra * item.inpa_Rendimiento;
                            const costoUnitario = (prueba * (1 + porcentaje) * item.inpa_stock).toFixed(2);
                        this.insumos.push({
                            codigo: codigoCounter++, // Asigna el valor actual y luego incrementa
                            costo: item.inpa_PrecioCompra,
                            inpp_Id: item.inpp_Id,
                            acet_Id: id,
                            select: true,
                            id: idIncrementable++,
                            inpa_Id: item.inpa_Id,
                            unme_Nombre: item.unme_Nombre,
                            unme_Nomenclatura: item.unme_Nomenclatura,
                            estado: 'Guardado',
                            inpa_ActividadLlenado: 0,
                            desperdicio: item.inpa_Desperdicio,
                            costoUnitario: costoUnitario,
                            costoFormula: item.inpa_PrecioCompraFormula,
                            cantidad: item.inpa_stock,
                            cantidadFormula: item.inpa_StockFormula,
                            rendimiento: item.inpa_Rendimiento,
                            rendimientoFormula: item.inpa_FormulaRendimiento,
                            insumo: item.insu_Descripcion,
                            proveedor: item.prov_Descripcion,
                            material: item.mate_Descripcion,
                            categoria: item.cate_Descripcion,
                            rendimientoReferencias: [],
                            cantidadReferencias: [],
                            costoReferencias: [],
                        });
                    });
                    // Asignar el valor calculado a materialInsumo, redondeado a dos decimales
                }
            },
            (error) => {
                console.error('Error al listar insumos por actividad:', error);
            }
        );
    }
    async listarInsumosPorActividadLlenado(id: number) {
        await this.service.ListarInsumosPorAcitividad(id).then(
            (data: any[]) => {
                this.insumosLlenado = [];

                if (data && data.length > 0) {
                    let codigoCounter = 1; // Inicializa el contador de código en 1
                    let idIncrementable = 1;

                    // Iterar sobre los datos recibidos y agregarlos al arreglo insumos

                    data.forEach((item) => {
                        const porcentaje =
                            parseFloat(item.inpa_Desperdicio) / 100;
                        let costoUnitario = '0';
                        if (!isNaN(porcentaje)) {
                            const prueba =
                                item.inpa_PrecioCompra * item.inpa_Rendimiento;
                            costoUnitario = (
                                prueba *
                                (1 + porcentaje) *
                                item.inpa_stock
                            ).toFixed(2);
                        }

                        this.insumosLlenado.push({
                            codigo: codigoCounter++, // Asigna el valor actual y luego incrementa
                            costo: item.inpa_PrecioCompra,
                            inpp_Id: item.inpp_Id,
                            acet_Id: id,
                            id: idIncrementable++,
                            inpa_Id: item.inpa_Id,
                            select: false,
                            inpa_ActividadLlenado: item.inpa_Id,
                            desperdicio: item.inpa_Desperdicio,
                            costoUnitario: costoUnitario,
                            estado: 'Sin Guardar',
                            costoFormula: item.inpa_PrecioCompraFormula,
                            unme_Nombre: item.unme_Nombre,
                            unme_Nomenclatura: item.unme_Nomenclatura,
                            cantidad: item.inpa_stock,
                            cantidadFormula: item.inpa_StockFormula,
                            rendimiento: item.inpa_Rendimiento,
                            rendimientoFormula: item.inpa_FormulaRendimiento,
                            insumo: item.insu_Descripcion,
                            proveedor: item.prov_Descripcion,
                            material: item.mate_Descripcion,
                            categoria: item.cate_Descripcion,
                            rendimientoReferencias: [],
                            cantidadReferencias: [],
                            costoReferencias: [],
                        });
                    });

                    // Marcar los checkboxes correspondientes basados en el inpp_Id
                    this.insumos.forEach((insumo) => {
                        const index = this.insumosLlenado.findIndex(
                            (option) =>
                                option.inpa_Id === insumo.inpa_ActividadLlenado
                        );
                        if (index !== -1) {
                            this.insumosLlenado[index].select = true;
                        }
                    });
                    console.log('AcetId', this.acet_Id);
                    console.log('Id Ing', id);
                    if (id === this.acet_Id) {
                        console.log('acetid IGUALESE');
                        this.insumosLlenado.forEach((item) => {
                            item.select = true;
                        });
                    }

                    // Ordenar insumosOptions para que los seleccionados estén al principio
                    const seleccionados = this.insumosLlenado.filter(
                        (option) => option.select
                    );
                    const noSeleccionados = this.insumosLlenado.filter(
                        (option) => !option.select
                    );

                    // Combinar seleccionados y no seleccionados, asegurando que los seleccionados estén primero
                    this.insumosLlenado = [
                        ...seleccionados,
                        ...noSeleccionados,
                    ];

                    // Reasignar los códigos después de ordenar
                    let codigoCounter2 = 1; // Reinicia el contador de código en 1
                    this.insumosLlenado.forEach((option) => {
                        option.codigo = codigoCounter2++; // Asigna el valor del contador y luego lo incrementa
                    });

                    // Asignar el valor calculado a materialInsumo, redondeado a dos decimales
                } else {
                    this.insumosLlenado = [];
                }
            },
            (error) => {
                console.error('Error al listar insumos por actividad:', error);
            }
        );
    }

    async listarMaquinariasPorActividadLlenado(id: number) {
        await this.service.ListarMaquinariasPorAcitividad(id).then(
            (data: any[]) => {
                console.log('Data', data);
                if (data && data.length > 0) {
                    console.log('No entro ');
                    let codigoCounter = 1; // Inicializa el contador de código en 1
                    let idIncrementable = 1;

                    // Iterar sobre los datos recibidos y agregarlos al arreglo insumos

                    data.forEach((item) => {
                        this.maquinariasAgregadasLlenado.push({
                            codigo: codigoCounter++, // Asigna el valor actual y luego incrementa
                            rmac_Id: item.rmac_Id,
                            mapr_Id: item.mapr_Id,
                            renta: item.renta,
                            acet_Id: id,
                            rmac_ActividadLlenado: item.rmac_Id,
                            id: idIncrementable++,
                            estado: 'Guardado',
                            subtotal: (
                                item.rmac_CantidadRenta *
                                item.rmac_PrecioRenta *
                                item.rmac_CantidadMaquinas
                            ).toFixed(2),
                            rmac_CantidadRentaFormula:
                                item.rmac_CantidadRentaFormula,
                            rmac_PrecioRentaFormula:
                                item.rmac_PrecioRentaFormula,
                            rmac_CantidadMaquinasFormula:
                                item.rmac_CantidadMaquinaFormula,
                            select: false,
                            prov_Descripcion: item.prov_Descripcion,
                            nive_Descripcion: item.nive_Descripcion,
                            maqu_Descripcion: item.maqu_Descripcion,
                            rmac_CantidadMaquinas: item.rmac_CantidadMaquinas,
                            rmac_CantidadRenta: item.rmac_CantidadRenta,
                            rmac_PrecioRenta: item.rmac_PrecioRenta,
                            rmac_PrecioRentaReferencias: [],
                            rmac_CantidadMaquinasReferencias: [],
                            rmac_CantidadRentaReferencias: [],
                        });
                    });
                    // Marcar los checkboxes correspondientes basados en el inpp_Id
                    this.maquinariasAgregadas.forEach((maquinaria) => {
                        console.log('Maquinaria Enderson', maquinaria);
                        const index =
                            this.maquinariasAgregadasLlenado.findIndex(
                                (option) =>
                                    option.rmac_Id ===
                                    maquinaria.rmac_ActividadLlenado
                            );
                        if (index !== -1) {
                            console.log('Si Entro', index);
                            this.maquinariasAgregadasLlenado[index].select =
                                true;
                            console.log(
                                'Maquinarias Select',
                                this.maquinariasAgregadasLlenado
                            );
                        }
                    });
                    if (id === this.acet_Id) {
                        console.log('acetid IGUALESE');
                        this.maquinariasAgregadasLlenado.forEach((item) => {
                            item.select = true;
                        });
                    }

                    // Ordenar insumosOptions para que los seleccionados estén al principio
                    const seleccionados =
                        this.maquinariasAgregadasLlenado.filter(
                            (option) => option.select
                        );
                    const noSeleccionados =
                        this.maquinariasAgregadasLlenado.filter(
                            (option) => !option.select
                        );

                    // Combinar seleccionados y no seleccionados, asegurando que los seleccionados estén primero
                    this.maquinariasAgregadasLlenado = [
                        ...seleccionados,
                        ...noSeleccionados,
                    ];

                    // Reasignar los códigos después de ordenar
                    let codigoCounter2 = 1; // Reinicia el contador de código en 1
                    this.maquinariasAgregadasLlenado.forEach((option) => {
                        option.codigo = codigoCounter2++; // Asigna el valor del contador y luego lo incrementa
                    });

                    // Asignar el valor calculado a materialInsumo, redondeado a dos decimales
                } else {
                    this.maquinariasAgregadasLlenado = [];
                }
            },
            (error) => {
                console.error('Error al listar insumos por actividad:', error);
            }
        );
    }

    async listarInsumosPorActividad(id: number) {
        await this.service.ListarInsumosPorAcitividad(id).then(
            async (data: any[]) => {
                if (data && data.length > 0) {
                    let codigoCounter = 1; // Inicializa el contador de código en 1
                    let idIncrementable = 1;
                    // Iterar sobre los datos recibidos y agregarlos al arreglo insumos
                    let listadoReferencias;
                    await this.listarReferencias().then( data =>{
                        listadoReferencias = data
                        console.log("🚀 ~ dentro del then:", listadoReferencias)
                    })
                    console.log("🚀 ~ despues del then:", listadoReferencias)

                    data.forEach((item) => {
                        const porcentaje =
                            parseFloat(item.inpa_Desperdicio) / 100;
                        let costoUnitario = '0';
                        if (!isNaN(porcentaje)) {
                            const prueba =
                                item.inpa_PrecioCompra * item.inpa_Rendimiento;
                            costoUnitario = (
                                prueba *
                                (1 + porcentaje) *
                                item.inpa_stock
                            ).toFixed(2);
                        }

                        this.insumos.push({
                            codigo: codigoCounter++, // Asigna el valor actual y luego incrementa
                            costo: item.inpa_PrecioCompra,
                            inpp_Id: item.inpp_Id,
                            acet_Id: id,
                            id: idIncrementable++,
                            inpa_Id: item.inpa_Id,
                            desperdicio: item.inpa_Desperdicio,
                            costoUnitario: costoUnitario,
                            select: true,
                            estado: 'Guardado',
                            costoFormula: item.inpa_PrecioCompraFormula,
                            inpa_ActividadLlenado: item.inpa_ActividadLlenado,
                            unme_Nombre: item.unme_Nombre,
                            unme_Nomenclatura: item.unme_Nomenclatura,
                            cantidad: item.inpa_stock,
                            cantidadFormula: item.inpa_StockFormula,
                            rendimiento: item.inpa_Rendimiento,
                            rendimientoFormula: item.inpa_FormulaRendimiento,
                            insumo: item.insu_Descripcion,
                            proveedor: item.prov_Descripcion,
                            material: item.mate_Descripcion,
                            categoria: item.cate_Descripcion,
                            rendimientoReferencias: listadoReferencias.filter(lista => lista.acet_Id == id && lista.rece_Tipo.replace(/[\d]/g,'') == 'rendimiento'  && lista.rece_Tipo.replace(/[a-zA-Z_]/g, '') == codigoCounter-1 ? lista.rece_Referencia : '').map(obj => obj.rece_Referencia),
                            cantidadReferencias: listadoReferencias.filter(lista => lista.acet_Id == id && lista.rece_Tipo.replace(/[\d]/g,'') == 'cantidad' && lista.rece_Tipo.replace(/[a-zA-Z_]/g, '') == codigoCounter-1 ? lista.rece_Referencia : '').map(obj => obj.rece_Referencia),
                            costoReferencias:  listadoReferencias.filter(lista => lista.acet_Id == id && lista.rece_Tipo.replace(/[\d]/g,'') == 'costo'  && lista.rece_Tipo.replace(/[a-zA-Z_]/g, '') == codigoCounter-1 ? lista.rece_Referencia : '').map(obj => obj.rece_Referencia),

                        });
                        console.log(codigoCounter)
                    });
                    console.log('listado de referenicas', listadoReferencias.map(lista => lista.rece_Tipo.replace(/[\d]/g,'')))
                    console.log('listado de referenicas', listadoReferencias.map(lista => lista.rece_Tipo.replace(/[a-zA-Z_]/g, '')))
                    console.log('😒😒 dentro del listar',this.insumos);
                    this.actualizarMaterialInsumo();
                    // Asignar el valor calculado a materialInsumo, redondeado a dos decimales
                } else {
                    this.insumos = [];
                    this.materialInsumo = '0.00'; // Resetear materialInsumo si no hay datos
                }
            },
            (error) => {
                console.error('Error al listar insumos por actividad:', error);
            }
        );
    }

    async listarMaquinariasPorActividad(id: number) {
        console.log('No entro detalle');
        await this.service.ListarMaquinariasPorAcitividad(id).then(
            async (data: any[]) => {
                console.log('Data', data);
                let listadoReferencias;
                await this.listarReferencias().then( data =>{
                    listadoReferencias = data
                    console.log("🚀 ~ dentro del then:", listadoReferencias)
                })
                if (data && data.length > 0) {
                    console.log('No entro ');
                    let codigoCounter = 1; // Inicializa el contador de código en 1
                    let idIncrementable = 1;
                    let totalMaquinaria = 0;
                    // Iterar sobre los datos recibidos y agregarlos al arreglo insumos

                    data.forEach((item) => {
                        const costo = item.rmac_PrecioRenta;
                        const cantidad = item.rmac_CantidadRenta;
                        const cantidadMaquina = item.rmac_CantidadMaquinas;
                        const materialValue =
                            costo * cantidad * cantidadMaquina;

                        // Actualizar el totalMaterial acumulando el materialValue
                        totalMaquinaria += materialValue;
                        this.maquinariasAgregadas.push({
                            codigo: codigoCounter++, // Asigna el valor actual y luego incrementa
                            rmac_Id: item.rmac_Id,
                            mapr_Id: item.mapr_Id,
                            renta: item.renta,
                            subtotal: (
                                item.rmac_CantidadRenta *
                                item.rmac_PrecioRenta *
                                item.rmac_CantidadMaquinas
                            ).toFixed(2),
                            acet_Id: id,
                            id: idIncrementable++,
                            rmac_ActividadLlenado: item.rmac_ActividadLlenado,
                            estado: 'Guardado',
                            select: false,
                            rmac_CantidadRentaFormula:
                                item.rmac_CantidadRentaFormula,
                            rmac_PrecioRentaFormula:
                                item.rmac_PrecioRentaFormula,
                            rmac_CantidadMaquinasFormula:
                                item.rmac_CantidadMaquinaFormula,
                            prov_Descripcion: item.prov_Descripcion,
                            nive_Descripcion: item.nive_Descripcion,
                            maqu_Descripcion: item.maqu_Descripcion,
                            rmac_CantidadMaquinas: item.rmac_CantidadMaquinas,
                            rmac_CantidadRenta: item.rmac_CantidadRenta,
                            rmac_PrecioRenta: item.rmac_PrecioRenta,
                            rmac_PrecioRentaReferencias: listadoReferencias.filter(lista => lista.acet_Id == item.acet_Id && lista.rece_Tipo.replace(/[\d]/g,'') == 'rmac_PrecioRenta' && lista.rece_Tipo.replace(/[a-zA-Z_]/g, '') == codigoCounter-1 ? lista.rece_Referencia : '').map(obj => obj.rece_Referencia),
                            rmac_CantidadMaquinasReferencias:  listadoReferencias.filter(lista => lista.acet_Id == item.acet_Id && lista.rece_Tipo.replace(/[\d]/g,'') == 'rmac_CantidadMaquinas' && lista.rece_Tipo.replace(/[a-zA-Z_]/g, '') == codigoCounter-1 ? lista.rece_Referencia : '').map(obj => obj.rece_Referencia),
                            rmac_CantidadRentaReferencias:  listadoReferencias.filter(lista => lista.acet_Id == item.acet_Id && lista.rece_Tipo.replace(/[\d]/g,'') == 'rmac_CantidadRenta' && lista.rece_Tipo.replace(/[a-zA-Z_]/g, '') == codigoCounter-1 ? lista.rece_Referencia : '').map(obj => obj.rece_Referencia),
                        });
                    });
                    console.log('🚀🚀', this.maquinariasAgregadas)
                    console.log('Maquinarias Costo', totalMaquinaria);
                    this.maquinariaInsumo = totalMaquinaria.toFixed(2);
                    this.actualizarMaquinariaInsumo();
                    // Asignar el valor calculado a materialInsumo, redondeado a dos decimales
                } else {
                    this.maquinariasAgregadas = [];
                }
            },
            (error) => {
                console.error('Error al listar insumos por actividad:', error);
            }
        );
    }

    async listarMaquinariasPorActividadDetalle(id: number) {
        console.log('No entro detalle');
        await this.service.ListarMaquinariasPorAcitividad(id).then(
            (data: any[]) => {
                console.log('Data', data);

                if (data && data.length > 0) {
                    console.log('No entro ');
                    let codigoCounter = 1; // Inicializa el contador de código en 1
                    let idIncrementable = 1;
                    let totalMaquinaria = 0;
                    // Iterar sobre los datos recibidos y agregarlos al arreglo insumos

                    data.forEach((item) => {
                        const costo = item.rmac_PrecioRenta;
                        const cantidad = item.rmac_CantidadRenta;
                        const cantidadMaquina = item.rmac_CantidadMaquinas;
                        const materialValue =
                            costo * cantidad * cantidadMaquina;

                        // Actualizar el totalMaterial acumulando el materialValue
                        totalMaquinaria += materialValue;
                        this.maquinariasAgregadas.push({
                            codigo: codigoCounter++, // Asigna el valor actual y luego incrementa
                            rmac_Id: item.rmac_Id,
                            mapr_Id: item.mapr_Id,
                            renta: item.renta,
                            acet_Id: id,
                            id: idIncrementable++,
                            subtotal: (
                                item.rmac_CantidadRenta *
                                item.rmac_PrecioRenta *
                                item.rmac_CantidadMaquinas
                            ).toFixed(2),
                            estado: 'Guardado',
                            rmac_ActividadLlenado: 0,
                            select: false,
                            rmac_CantidadRentaFormula:
                                item.rmac_CantidadRentaFormula,
                            rmac_PrecioRentaFormula:
                                item.rmac_PrecioRentaFormula,
                            rmac_CantidadMaquinasFormula:
                                item.rmac_CantidadMaquinaFormula,
                            prov_Descripcion: item.prov_Descripcion,
                            nive_Descripcion: item.nive_Descripcion,
                            maqu_Descripcion: item.maqu_Descripcion,
                            rmac_CantidadMaquinas: item.rmac_CantidadMaquinas,
                            rmac_CantidadRenta: item.rmac_CantidadRenta,
                            rmac_PrecioRenta: item.rmac_PrecioRenta,
                            rmac_PrecioRentaReferencias: [],
                            rmac_CantidadMaquinasReferencias: [],
                            rmac_CantidadRentaReferencias: [],
                        });
                    });
                }
            },
            (error) => {
                console.error('Error al listar insumos por actividad:', error);
            }
        );
    }

    async listarProveedores() {
        await this.proveedorService.Listar().then(
            (data: any) => {
                this.proveedorOptions = data.sort((a, b) =>
                    a.prov_Descripcion.localeCompare(b.prov_Descripcion)
                );
            },
            (error) => {}
        );
    }

    InsumosProyecto(event: any) {
        if (event.checked) {
            this.disabledArticulos = true;
        } else {
            this.disabledArticulos = false;
            this.etapaArticuloOptions = [];
            this.actividadArticuloOptions = [];
        }
    }
   async GestionarInsumos(rowData: any, rowIndex: number, field: string) {
        this.loading = true;
        const etapaItemPrefix = rowData.item.split('.')[0];
        const etapaRow = this.prueba.find(
            (row) => row.item === `${etapaItemPrefix}.00`
        );
        this.activeIndexArticulos = 0;
        if (field == 'maquinaria') {
            this.activeIndexArticulos = 1;
        }

        this.actividadLlenado = false;
        if (rowData.id) {
            this.actividadLlenado = true;
        }
        this.disabledArticulos = false;
        this.prov_Descripcion = '';
        this.etapaInsumo = etapaRow.descripcion;
        this.actividadInsumo = rowData.descripcion;
        this.totalActividad = rowData.subtotal;
        (this.unidadInsumo = rowData.unidad),
        (this.proyectoInsumo = this.form.value.proyecto);
        this.totalActividad = rowData.subtotal;
        this.actualizarMaterial = false;
        this.actualizarMaquinaria = false;
        this.acet_Id = rowData.acetId;
        this.rowIndex = rowIndex;
        this.insumos = [];
        this.maquinariasAgregadas = [];
        this.insumosOptionsFiltrados = [];
        this.maquinariaOptions = [];
        this.insumosLlenado = [];
        this.maquinariasAgregadasLlenado = [];
        await this.listarInsumosPorActividad(rowData.acetId);
        await this.listarMaquinariasPorActividad(rowData.acetId);
        this.listarProveedores();
         this.actualizarSubtotalInsumo();
         this.loading = false;
        this.agregarInsumos = true;
        this.Create = false;

    }
    Regresar() {
        this.activeIndex = 0;
    }

    async onChange(event: any, index: number) {
        const selectedTacaId = event.value;
        this.conversiones[index].taca_Id = selectedTacaId; // Asegúrate de actualizar el taca_Id correcto
        console.log('ID TACA', this.conversiones[index].taca_Id);
        console.log('ID Moneda', this.mone_Id);

        await this.presupuestotasaservice
            .ListarValoresMoneda(this.mone_Id, this.conversiones[index].taca_Id)
            .then(
                (data: any) => {
                    console.log('Data Aqui', data);
                    this.conversiones[index].valorDe = data.taca_ValorA;
                    this.conversiones[index].valorA = data.taca_ValorB;
                },
                (error) => {
                    console.log('Error al listar valores de moneda:', error);
                }
            );
        if (this.conversiones[index].pptc_Id !== 0) {
            console.log('SI TRAE ID CONVERSION');
            const conversion = this.conversiones[index];
            const Modelo = {
                pptc_Id: conversion.pptc_Id,
                pren_Id: this.pren_Id,
                taca_Id: conversion.taca_Id,
                usua_Modificacion: this.usua_Id,
            };

            await this.presupuestotasaservice.Actualizar(Modelo).then(
                (response) => {
                    console.log(response);
                    if (response.code == 200) {
                        console.log('Éxito');
                    }
                },
                (error) => {}
            );
        }
    }
    AgregarEtapa() {
        if (this.btnAgregar == false) {
            this.btnAgregar = true;
            this.btnEliminar = false;
        } else {
            this.btnAgregar = false;
            this.btnEliminar = false;
        }
    }

    validateNumberInput(event: KeyboardEvent, rowData: any) {
        const charCode = event.which ? event.which : event.keyCode;

        // Permitir solo números (charCode 48-57)
        console.log(charCode)
        if ((charCode < 48 && charCode != 46) || charCode > 57 ) {
            event.preventDefault();
        }
    }

    preventDeleteZero(event: KeyboardEvent, rowData: any) {
        const currentValue = rowData.porcen;

        // Evitar borrar si el valor es '0'
        if (currentValue === '0') {
            // 8 = Backspace, 46 = Delete
            if (event.key === 'Backspace' || event.key === 'Delete') {
                event.preventDefault();
            }
        }
    }
    OcultarActividad() {
        this.ocultarActividades = !this.ocultarActividades;
        if (this.LabelAactividad == 'Ocultar Actividades') {
            this.LabelAactividad = 'Mostrar Actividades';
            this.iconActividad = 'pi pi-eye';
            this.classActividad = 'p-button-secondary';
        } else {
            this.LabelAactividad = 'Ocultar Actividades';
            this.iconActividad = 'pi pi-eye-slash';
            this.classActividad = 'p-button-primary';
        }
    }

    OcultarTabla() {
        if (this.LabelTabla == 'Ocultar Tabla') {
            this.ocultarTabla = true;
            this.LabelTabla = 'Mostrar Tabla';
            this.iconTabla = 'pi pi-eye';
            this.classTabla = 'p-button-secondary';
        } else {
            this.LabelTabla = 'Ocultar Tabla';
            this.iconTabla = 'pi pi-eye-slash';
            this.classTabla = 'p-button-primary';
            this.ocultarTabla = false;
        }
    }
    EliminarPresupuesto() {
        this.detalle_pren_Titulo = this.llenadoPresupuesto.pren_Titulo;
        this.pren_Id = this.llenadoPresupuesto.pren_Id;
        this.DeletePresupuesto = true;
    }

    async Eliminar() {
        await this.service.Eliminar(this.pren_Id).then(
            (response) => {
                if (response.code == 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Eliminado con Éxito.',
                        life: 3000,
                    });
                    this.listarPresupuesto();
                    this.listarPresupuestoSort();
                    this.DeletePresupuesto = false;
                }
                this.pren_Id = 0;
            },
            (error) => {}
        );
    }
    async onPlantillaPresupuesto(event: any) {
        const id = event.value.pren_Id;
        console.log('Id seleccionado ' + id);
        this.loading = true;
        await this.presupuestodetalleservice.Listar(id).then(
            async (data: any) => {
                if (data.length > 0) {
                    console.log('SI ENTRO');
                    await this.populateTable(data);
                } else {
                    this.prueba = [
                        {
                            etpr_Id: 0,

                            item: '1.00',
                            descripcion: '',
                            manoDeObraUtili: '0.00',
                            materialUtili: '0.00',
                            subtotalUtil: '0.00',

                            puUtili: '0.00',
                            etap_Id: 0,
                            subtotalConIsv: '0.00',
                            puUSDUtili: '0.00',
                            subtotalUSDUtili: '0.00',
                            Isv: '0.00',
                            cant: '0.00',
                            unidad: '',
                            manoDeObra: '0.00',
                            material: '0.00',
                            esEtapa: true,
                            invalid: false,
                            pu: '0.00',
                            subtotal: '0.00',
                            puUSD: '0.00',
                            subtotalUSD: '0.00',
                            maquinaria: '0.00',
                        },
                        {
                            item: '1.01',
                            descripcion: '',
                            empl_Id: 0,
                            subtotalConIsv: '0.00',
                            copc_Id: 0,
                            cantFormula: '',
                            manoDeObraFormula: '',
                            materialFormula: '',
                            manoDeObraUtili: '0.00',
                            acetIdLlenado: 0,
                            materialUtili: '0.00',
                            manoObraTotalUtili: '0.00',
                            materialTotalUtili: '0.00',
                            puUtili: '0.00',
                            maquinariaTotal: '0.00',
                            subtotalUtil: '0.00',
                            isSwitchDisabled: false,
                            etpr_Id: 0,
                            unme_Id: 0,
                            puUSDUtili: '0.00',
                            maquinaria: '0.00',
                            maquinariaFormula: '',
                            subtotalUSDUtili: '0.00',
                            manoObraTotal: '0.00',
                            materialTotal: '0.00',
                            porcen: this.defaultPorcentaje,
                            Isv: '0.00',
                            esIsv: false,
                            cant: '0.00',
                            unidad: '',
                            expanded: false,
                            acetId: 0,
                            actiId: 0,
                            manoDeObra: '0.00',
                            material: '0.00',
                            esEtapa: false,
                            invalid: false,
                            id: 0,
                            verification: false,
                            pu: '0.00',
                            subtotal: '0.00',
                            puUSD: '0.00',
                            subtotalUSD: '0.00',
                            maquinariaReferencias: [],
                            cantReferencias: [],
                            manoDeObraReferencias: [],
                            materialReferencias: []
                        },
                    ];
                }
            },
            (error) => {
                console.log('Error' + error);
            }
        );
        this.loading = false;
    }

    GuardarEtapa() {
        const Modelo = {
            etap_Descripcion: this.valueFilterEtapa,
            usua_Creacion: this.usua_Id,
        };
        this.service.InsertarEtapa2(Modelo).then(
            (response) => {
                if (response.code == 200) {
                    this.etap_Id = response.data.codeStatus;
                    this.modalEtapa = false;
                    this.ListarEtapas();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Insertado con Éxito.',
                    });
                }
            },
            (error) => {
                console.error('Error ' + error);
            }
        );
    }
    GuardarActividad() {
        const Modelo = {
            acti_Descripcion: this.valueFilterActividad,
            usua_Creacion: this.usua_Id,
        };
        this.service.InsertarActividad(Modelo).then(
            (response) => {
                if (response.code == 200) {
                    this.modalActividad = false;
                    this.listarActividades();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Insertado con Éxito.',
                    });
                }
            },
            (error) => {
                console.error('Error ' + error);
            }
        );
    }

    onActividadBlur(event: any, rowIndex: number, rowData: any) {
        this.modalActividad = false;

        setTimeout(() => {
            if (!this.isActividadSelected) {
                const foundActividad = this.actividadOptions.find(
                    (actividad) =>
                        actividad.acti_Descripcion.toLowerCase().trim() ===
                        rowData.descripcion.toLowerCase().trim()
                );
                if (!foundActividad && rowData.descripcion !== '') {
                    console.log('1 sd');
                    this.modalActividad = true;
                }
            }
            this.isActividadSelected = false;
        }, 200); // Espera de 200ms para que onSelect pueda ejecutarse primero
    }

    //Funcion que al tocar un row mostrar los detalles de esa parte en principal
    onRowExpand(event: any): void {
        const id = event.data;
        this.expandedRows = {};
        console.log('Id', id);
        this.listarInsumosPorActividad(id);
    }

    //Cierra los detalles de la fila
    onRowCollapse(event) {
        console.log(event);
        // delete this.expandedRows[event.coti_Id];
    }

    onEtapaBlur(event: any, rowIndex: number) {
        console.log(this.modalEtapa, 'this.modalEtapa');
        console.log('entra on Etapa Blur');
        
        this.modalEtapa = false;

        setTimeout(() => {
            if (!this.isEtapaSelected) {
                console.log('entra if Etapa Blur');

                const etapaRow = this.prueba[rowIndex];
                const foundEtapa = this.etapaOptions.find(
                    (etapa) =>
                        etapa.etap_Descripcion.toLowerCase().trim() ===
                        etapaRow.descripcion.toLowerCase().trim()
                );
                if (!foundEtapa && etapaRow.descripcion !== '') {
                    this.modalEtapa = true;
                }
            }
            this.isEtapaSelected = false;
        }, 200); // Espera de 200ms para que onSelect pueda ejecutarse primero
    }

    async onEtapaChange(event: any, rowIndex: number) {
        console.log('Event',event)
        this.isEtapaSelected = true;
        const etapaRow = this.prueba[rowIndex];
        console.log(etapaRow);
        this.etap_Id = event.value.etap_Id;
        const etapId = event.value.etap_Id;
        etapaRow.etap_Id = etapId;
        etapaRow.descripcion = event.value.etap_Descripcion;
        this.etap_Descripcion = event.value.etap_Descripcion;
        this.valueFilterEtapa = event.value.etap_Descripcion;
        this.etapaInsertada = false;
        console.log('ETAPA ' + this.valueFilterEtapa);
        console.log('ID ETAPA ' + this.etap_Id);
        console.log(this.proyectoPlantilla);
        if (this.proyectoPlantilla) {
            const foundProyecto = this.proyectoOptions.find(
                (proyecto) =>
                    proyecto.proy_Nombre.toLowerCase().trim() ===
                    this.proyectoPlantilla.toLowerCase().trim()
            );
            console.log(foundProyecto);
            if (foundProyecto) {
                this.loading = true;
                await this.ListarActividadesPorEtapa(
                    etapId,
                    foundProyecto.proy_Id,
                    rowIndex
                );
                this.loading = false;
            }
        }
    }

    async ListarActividadesPorEtapa(
        etap_Id: number,
        proy_Id: number,
        rowIndex: any
    ) {
        await this.service.LlenarActividadesPorEtapa(etap_Id, proy_Id).then(
            (data: any) => {
                if (data && data.length > 0) {
                    this.populateActivitiesByEtapa(data, rowIndex); // Llamar a la función para llenar solo las actividades
                } else {
                    console.log('No hay actividades para esta etapa.');
                }
            },
            (error) => {
                console.log('Error ' + error);
            }
        );
    }

    populateActivitiesByEtapa(data: any[], rowIndex: any) {
        const currentEtapaNumber = parseInt(
            this.prueba[rowIndex].item.split('.')[0],
            10
        );
        let activityCounter = 1;

        console.log(data)
        data.forEach(async (item) => {

            const activityRow = {
                item: `${currentEtapaNumber}.${activityCounter
                    .toString()
                    .padStart(2, '0')}`,
                descripcion: item.acti_Descripcion,
                cant: item.acet_Cantidad.toString(),
                unidad: item.unme_Nomenclatura,
                manoDeObra: item.acet_PrecioManoObraEstimado.toFixed(2),
                material: item.inpa_CostoInsumos.toFixed(2),
                esEtapa: false,
                invalid: false,
                id: 0,
                acetId: item.acet_Id,
                actiId: item.acti_Id,
                verification: false,
                etpr_Id: item.etpr_Id,
                unme_Id: item.unme_Id,
                copc_Id: item.copc_Id,
                empl_Id: item.empl_Id,
                esIsv: false,
                pu: '0.00',
                manoObraTotal: '0.00',
                materialTotal: '0.00',
                subtotal: '0.00',
                porcen: this.defaultPorcentaje,
                maquinaria: '0.00',
                maquinariaFormula: '',
                cantFormula: '',
                manoDeObraFormula: '',
                materialFormula: '',
                Isv: '0.00',
                expanded: false,
                puUSD: '0.00',
                subtotalUSD: '0.00',
                manoDeObraUtili: '0.00',
                materialUtili: item.inpa_CostoInsumos.toFixed(2),
                maquinariaTotal: '0.00',
                acetIdLlenado: 0,
                isSwitchDisabled: false,
                subtotalConIsv: '0.00',
                manoObraTotalUtili: '0.00',
                materialTotalUtili: '0.00',
                puUtili: '0.00',
                subtotalUtil: '0.00',
                puUSDUtili: '0.00',
                subtotalUSDUtili: '0.00',
                maquinariaReferencias: [],
                cantReferencias: [],
                manoDeObraReferencias: [],
                materialReferencias: []
            };

            this.prueba.splice(rowIndex + activityCounter, 0, activityRow); // Insertar la actividad en la posición correcta
            this.onValueChange(activityRow, parseInt(activityRow.item));
            this.recalcularGanancia();
            activityCounter++;
        });
        this.actualizarTotalesGenerales();
        this.onValSwitchChange();
        this.reorderItems(); // Reordenar los items después de insertar las actividades
    }

    filterEtapa(event: any, rowData: any) {
        const filtered: any[] = [];
        const query = event.query;
        this.isEtapaSelected = false;
        this.valueFilterEtapa = rowData.descripcion;
        console.log('EtapaEscribr ' + this.valueFilterEtapa);
        for (let i = 0; i < this.etapaOptions.length; i++) {
            const country = this.etapaOptions[i];
            if (
                country.etap_Descripcion
                    .toLowerCase()
                    .indexOf(query.toLowerCase()) == 0
            ) {
                filtered.push(country);
            }
        }

        this.filteredEtapas = filtered;
    }

    getNextActividadNumber(etapaItem: string): string {
        const actividades = this.prueba.filter(
            (row) => !row.esEtapa && row.item.startsWith(`${etapaItem}.`)
        );
        return (actividades.length + 1).toString().padStart(2, '0');
    }

    async handleUnidadChange(event: any, rowData: any, rowIndex: number) {
        // Obtén el ID de la unidad seleccionada
        this.isUnidadSelected = true;
        const currentRowIndex = this.prueba.indexOf(rowData);
        // Encuentra la fila actual
        const currentRow = this.prueba[currentRowIndex];
        currentRow.unidad = event.value.unme_Nomenclatura;
        console.log(currentRow.unidad);
        let unidad;
        const foundUnidad = this.listunidades.find(
            (unidad) =>
                unidad.unme_Nomenclatura.toLowerCase().trim() ===
                currentRow.unidad.toLowerCase().trim()
        );
        if (foundUnidad) {
            unidad = foundUnidad.unme_Id;
        }
        console.log(unidad);

        let acti_Id;
        const foundActividad = this.actividadOptions.find(
            (actividad) =>
                actividad.acti_Descripcion.toLowerCase().trim() ===
                currentRow.descripcion.toLowerCase().trim()
        );
        if (foundActividad) {
            acti_Id = foundActividad.acti_Id;
        }
        console.log(acti_Id);

        // Llama al servicio para listar los costos de la actividad
        if (acti_Id != undefined) {
            await this.service.ListarCostosActividad(acti_Id, unidad).then(
                (data: any) => {
                    // Actualiza el valor de manoDeObra con el valor devuelto
                    if (data && data.copc_Valor !== undefined) {
                        this.prueba[currentRowIndex].manoDeObra =
                            data.copc_Valor.toFixed(2); // O usa toString() si prefieres
                        this.PrecioManoObraExiste = true;
                        console.log('Datos obtenidos:', data.copc_Valor);
                        rowData.copc_Id = data.copc_Id;
                        this.actualizarTotales(
                            this.prueba[currentRowIndex],
                            currentRowIndex
                        );
                        this.calcularPU(
                            this.prueba[currentRowIndex],
                            currentRowIndex
                        );
                    } else {
                        this.PrecioManoObraExiste = false;
                        rowData.copc_Id = 0;
                        this.prueba[currentRowIndex].manoDeObra = '0.00';
                        console.log(
                            'El valor de costeo no está definido en la respuesta.'
                        );
                    }
                },
                (error) => {
                    console.error(
                        'Error al obtener costos de actividad:',
                        error
                    );
                }
            );
            this.handleBlur('No', rowData, rowIndex);
        } else {
            console.log('Actividad no seleccionada');
        }
    }
    //validacion para poder insertar letras con o sin tildes y numeros
    ValidarTextoNumeros(event: KeyboardEvent) {
        const inputElement = event.target as HTMLInputElement;
        const key = event.key;

        if (key === ' ' && inputElement.selectionStart === 0) {
        event.preventDefault();
        }
    }

    calcularPU(row: any, rowIndex: number) {
        const impuestoNumerico = parseFloat(this.ValorImpuesto) / 100;
        const impuestoFormateado = parseFloat(impuestoNumerico.toFixed(2));
        if (row.esEtapa) {
            // Calcula PU y subtotal para la fila de etapa sumando los subtotales de todas las actividades
            const etapaItem = row.item.split('.')[0];
            const actividades = this.prueba.filter(
                (row) => row.item.startsWith(`${etapaItem}.`) && !row.esEtapa
            );

            const manoDeObra = actividades.reduce(
                (sum, actividad) =>
                    sum + (parseFloat(actividad.manoDeObra) || 0),
                0
            );
            const material = actividades.reduce(
                (sum, actividad) => sum + (parseFloat(actividad.material) || 0),
                0
            );
            const maquinaria = actividades.reduce(
                (sum, actividad) =>
                    sum + (parseFloat(actividad.maquinaria) || 0),
                0
            );

            const subtotal = actividades.reduce(
                (sum, actividad) => sum + (parseFloat(actividad.subtotal) || 0),
                0
            );

            const subtotalConIsV = actividades.reduce(
                (sum, actividad) =>
                    sum + (parseFloat(actividad.subtotalConIsv) || 0),
                0
            );

            // const manoDeObraUtili
            row.manoDeObra = manoDeObra.toFixed(2);
            row.material = material.toFixed(2);
            row.maquinaria = maquinaria.toFixed(2);
            row.pu = (manoDeObra + material).toFixed(2);

            row.subtotal = subtotal.toFixed(2);
            row.subtotalConIsV = subtotalConIsV.toFixed(2);

            // Calcula el PU en USD y lo formatea con un solo decimal
            row.puUSD = (
                parseFloat(row.pu) / this.valorMonedaConversion
            ).toFixed(1);
            row.subtotalUSD = (
                parseFloat(row.subtotal) / this.valorMonedaConversion
            ).toFixed(1);
        } else {
            const cantidad = String(row.cant);
            // Verifica si row.cant contiene un '='
            if (cantidad.includes('=')) {
                // No calcular subtotal si contiene '='
                row.pu = (
                    parseFloat(row.manoDeObra) ||
                    0 + parseFloat(row.material) ||
                    0 + parseFloat(row.maquinaria) ||
                    0
                ).toFixed(2);
                row.subtotal = row.subtotal || '0.00'; // Puedes asignar un valor predeterminado si deseas
            } else {
                // Calcula PU y subtotal para las filas de actividades
                const manoDeObra = parseFloat(row.manoDeObra) || 0;
                const material = parseFloat(row.material) || 0;
                const maquinaria = parseFloat(row.maquinaria) || 0;
                const materialUtili = parseFloat(row.materialUtili) || 0;
                const cantidad = parseFloat(row.cant) || 0;
                row.manoObraTotal = (manoDeObra * cantidad).toFixed(2);
                row.materialTotal = (material * cantidad).toFixed(2);
                row.maquinariaTotal = maquinaria.toFixed(2);
                row.pu = (manoDeObra + material).toFixed(2);
                const pu2 = (manoDeObra + materialUtili).toFixed(2);
                row.subtotal = (
                    parseFloat(row.pu) * parseFloat(row.cant) || 0
                ).toFixed(2);
                row.subtotalConIsv = (
                    parseFloat(row.pu) * parseFloat(row.cant) || 0
                ).toFixed(2);
                row.subtotalUtil = (
                    parseFloat(pu2) * parseFloat(row.cant)  || 0
                ).toFixed(2);

                if(this.maquinariaCalculo){
                    row.subtotal = (
                        parseFloat(row.pu) * parseFloat(row.cant) + maquinaria || 0
                    ).toFixed(2);

                    row.subtotalConIsv = (
                        parseFloat(row.pu) * parseFloat(row.cant) + maquinaria || 0
                    ).toFixed(2);
                    row.subtotalUtil = (
                        parseFloat(pu2) * parseFloat(row.cant) + maquinaria || 0
                    ).toFixed(2);
                }


                if (this.valSwitch) {
                    const porcentaje = parseFloat(row.porcen) / 100;
                    if(!isNaN(porcentaje)){
                        row.manoObraTotal = (
                            row.manoObraTotal *
                            (1 + porcentaje)
                        ).toFixed(2);
                        row.maquinariaTotal = (
                            row.maquinariaTotal *
                            (1 + porcentaje)
                        ).toFixed(2);
                        row.materialTotal = (
                            row.materialTotal *
                            (1 + porcentaje)
                        ).toFixed(2);
                        row.subtotal = row.subtotal;
                        row.subtotalUtil = (
                            row.subtotalUtil *
                            (1 + porcentaje)
                        ).toFixed(2);
                    }

                }


                const subtotalBase = (parseFloat(row.pu) * cantidad).toFixed(2);
                const subtotalUtil = (parseFloat(pu2) * cantidad).toFixed(2);
                this.valoresOriginales[`subtotal_${rowIndex}`] =
                    parseFloat(subtotalBase);
                this.valoresOriginales[`subtotalUtil_${rowIndex}`] =
                    parseFloat(subtotalUtil);

                // Calcula el PU en USD y lo formatea con un solo decimal
                row.puUSD = (
                    parseFloat(row.pu) / this.valorMonedaConversion
                ).toFixed(1);
                row.subtotalUSD = (
                    parseFloat(row.subtotal) / this.valorMonedaConversion
                ).toFixed(1);
                console.log("🚀 ~ calcularPU ~ row.subtotalUtil:", row.subtotalUtil)
            }
        }
        // Actualiza la etapa correspondiente
        this.actualizarTotales(row, rowIndex);
        // Actualiza los totales generales
        this.actualizarTotalesGenerales();
        this.recalcularGanancia();
        // this.handlePorcentajeChange(row, rowIndex);
    }

    calcularSubtotal(rowData: any, rowIndex: number) {
        const manoDeObra = parseFloat(rowData.manoDeObra) || 0;
        const material = parseFloat(rowData.material) || 0;
        const materialUtili = parseFloat(rowData.materialUtili) || 0;
        const cantidad = parseFloat(rowData.cant) || 0;

        // Calcular valores base
        rowData.manoObraTotal = (manoDeObra * cantidad).toFixed(2);
        rowData.materialTotal = (material * cantidad).toFixed(2);
        rowData.pu = (manoDeObra + materialUtili).toFixed(2);
        const pu2 = (manoDeObra + materialUtili).toFixed(2);
        // Calcular subtotal base
        const subtotalBase = (parseFloat(rowData.pu) * cantidad).toFixed(2);
        const subtotalUtil = (parseFloat(pu2) * cantidad).toFixed(2);
        // Guardar el subtotal base en la variable original
        this.valoresOriginales[`subtotal_${rowIndex}`] =
            parseFloat(subtotalBase);
        this.valoresOriginales[`subtotalUtil_${rowIndex}`] =
            parseFloat(subtotalUtil);
        let gananciaFila = 0;

        // Aplicar el porcentaje si existe
        if (rowData.porcen && !isNaN(parseInt(rowData.porcen))) {
            console.log('EL NANA AQUI')
            const porcentaje = parseFloat(rowData.porcen) / 100;
            rowData.subtotal = this.valoresOriginales[`subtotal_${rowIndex}`].toFixed(2);
            rowData.subtotalUtil = (
                this.valoresOriginales[`subtotalUtil_${rowIndex}`] *
                (1 + porcentaje)
            ).toFixed(2);
            console.log('SubUtili ' + rowData.subtotalUtil);
            // Calcular la ganancia generada por el porcentaje
            // Calcular la ganancia generada por el porcentaje
            gananciaFila = parseFloat(subtotalBase) * porcentaje;
        } else {
            rowData.subtotal = subtotalBase;
            rowData.subtotalUtil = subtotalUtil;
        }

        // Recalcular la ganancia total
        this.recalcularGanancia();
        this.onValueChange(rowData, rowIndex);
        this.actualizarTotales(rowData, rowIndex); // Si tienes una función para actualizar los totales, la puedes llamar aquí
    }
    recalcularGanancia() {
        // Reiniciar la ganancia total
        this.Ganancia = 0;

        // Iterar sobre todas las filas y recalcular la ganancia total
        this.prueba.forEach((rowData, rowIndex) => {
            if (!rowData.esEtapa && rowData.porcen) {
                const subtotalBase =
                    this.valoresOriginales[`subtotal_${rowIndex}`];
                const porcentaje = parseFloat(rowData.porcen) / 100;

                // Sumar la ganancia de la fila a la ganancia total
                this.Ganancia += subtotalBase * porcentaje;
            }
        });
    }
    async DetallePresupuesto() {
        this.loading = true;

        this.formateoVariables();
        const selectedDate = new Date(this.llenadoPresupuesto.pren_Fecha);
        this.ValorImpuesto = this.llenadoPresupuesto.pren_Impuesto;
        this.ISV = this.ValorImpuesto;

        this.Titulo = 'Detalle Presupuesto';
        this.Index = false;
        this.Create = false;
        this.Detail = true;
        this.detalle_pren_Id = this.llenadoPresupuesto.codigo;
        this.detalle_pren_Titulo = this.llenadoPresupuesto.pren_Titulo;
        this.detalle_pren_Descripcion =
            this.llenadoPresupuesto.pren_Descripcion;
        this.detalle_pren_Fecha = this.llenadoPresupuesto.formattedPren_Fecha;
        this.ValorImpuesto = this.llenadoPresupuesto.pren_Impuesto;
        this.detalle_pren_Porcentaje =
            this.llenadoPresupuesto.pren_PorcentajeGanancia;
        this.detalle_cliente = this.llenadoPresupuesto.cliente;
        this.detalle_proyecto = this.llenadoPresupuesto.proyecto;
        this.detalle_cliente = this.llenadoPresupuesto.cliente;
        this.detalle_empleado = this.llenadoPresupuesto.empleado;
        this.detalle_pren_Estado = this.llenadoPresupuesto.pren_Estado;
        this.detalle_pren_Observacion = this.llenadoPresupuesto.pren_Observacion;
        this.detalle_usuaCreacion = this.llenadoPresupuesto.usuaCreacion;
        this.maquinariaCalculo = this.llenadoPresupuesto.pren_Maquinaria;
        this.detalle_usuaModificacion =
            this.llenadoPresupuesto.usuaModificacion;
        this.detalle_FechausuaModificacion =
            this.llenadoPresupuesto.pren_FechaModificacion != null
                ? new Date(
                      this.llenadoPresupuesto.pren_FechaModificacion
                  ).toLocaleDateString()
                : '';
        this.detalle_FechausuaCreacion = new Date(
            this.llenadoPresupuesto.pren_FechaCreacion
        ).toLocaleDateString();
        await this.ListarDetalle(this.llenadoPresupuesto.pren_Id);
        this.loading = false;
    }

    verificarPorcentaje() {
        const porcentaje = parseFloat(this.defaultPorcentaje);

        if (porcentaje < 15) {
            if (!this.mensajePorcen) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'El porcentaje de ganancia global es menor al 15%.',
                    life: 3000,
                });
                this.mensajePorcen = true;
            }
        } else {
            this.mensajePorcen = false;
        }
    }

    // Función que maneja el cambio en el porcentaje
    handlePorcentajeChange(rowData: any, rowIndex: number) {
        this.calcularSubtotal(rowData, rowIndex);
        this.calculateAveragePercentage();
        this.verificarPorcentaje();
    }
    actualizarTotalesGenerales() {
        console.log("🚀 ~ actualizarTotalesGenerales ~ actualizarTotalesGenerales:🕹️")
        // Calcula el subtotal sumando los subtotales de todas las etapas
        this.TotalManoObra = this.prueba
            .filter((row) => !row.esEtapa)
            .reduce(
                (sum, row) => sum + (parseFloat(row.manoObraTotal) || 0),
                0
            );

        this.TotalMaterial = this.prueba
            .filter((row) => !row.esEtapa)
            .reduce(
                (sum, row) => sum + (parseFloat(row.materialTotal) || 0),
                0
            );

        this.TotalMaquinaria = this.prueba
            .filter((row) => !row.esEtapa)
            .reduce(
                (sum, row) => sum + (parseFloat(row.maquinariaTotal) || 0),
                0
            );

        this.Subtotal = this.prueba
        .filter((row) => row.esEtapa)
        .reduce((sum, row) => sum + (parseFloat(row.subtotal) || 0), 0);
        console.log("🚀 ~ actualizarTotalesGenerales ~ this.Subtotal:", this.Subtotal)

        // this.subtotalUtil = this.prueba.filter((r) => r.esEtapa).reduce((sum, row) => sum + (parseFloat(row.subtotal) || 0), 0) + this.Ganancia;
        this.subtotalUtil = this.prueba
        .filter((row) => row.esEtapa)
        .reduce((sum, row) => sum + (parseFloat(row.subtotalUtil) || 0), 0);

        // const impuesto = 0.20
        // this.ISV = subtotalMateriales * impuesto;
        this.Total = (this.Subtotal * (1 + (this.ISV/100)));
            
        this.TotalUtili = (this.subtotalUtil * (1 + (this.ISV/100)));
        // Calcula el total (subtotal + ISV)
            console.log('ISV',this.ISV);
        // Calcula los valores en USD
        this.TotalMaterialUSD = (
            this.TotalMaterial / this.valorMonedaConversion
        ).toFixed(2);
        this.TotalManoObraUSD = (
            this.TotalManoObra / this.valorMonedaConversion
        ).toFixed(2);
        this.TotalMaquinariaUSD = (
            this.TotalMaquinaria / this.valorMonedaConversion
        ).toFixed(2);
        this.GananciaUSD = (this.Ganancia / this.valorMonedaConversion).toFixed(
            2
        );
        this.SubtotalUSD = (this.Subtotal / this.valorMonedaConversion).toFixed(
            2
        );

        this.subtotalUtilUSD = (this.subtotalUtil / this.valorMonedaConversion).toFixed(2);

        this.ISVUSD = (this.ISV / this.valorMonedaConversion).toFixed(2);

        this.TotalUSD = (this.Total / this.valorMonedaConversion).toFixed(2);

        this.TotalUtiliUSD = (this.TotalUtili / this.valorMonedaConversion).toFixed(2);
    }
    actualizarTotalesGenerales2() {
         // Calcula el subtotal sumando los subtotales de todas las etapas
         this.TotalManoObra = this.prueba
         .filter((row) => !row.esEtapa)
         .reduce(
             (sum, row) => sum + (parseFloat(row.manoObraTotal) || 0),
             0
         );
     this.TotalMaterial = this.prueba
         .filter((row) => !row.esEtapa)
         .reduce(
             (sum, row) => sum + (parseFloat(row.materialTotal) || 0),
             0
         );

     this.TotalMaquinaria = this.prueba
         .filter((row) => !row.esEtapa)
         .reduce(
             (sum, row) => sum + (parseFloat(row.maquinariaTotal) || 0),
             0
         );

     this.Subtotal = this.prueba
         .filter((row) => row.esEtapa)
         .reduce((sum, row) => sum + (parseFloat(row.subtotal) || 0), 0);
     
     if (this.checked2) {
         this.ISV = this.Subtotal * 0.15;
     }
     else{this.ISV=0;}
    this.subtotalUtil = this.prueba.filter((r) => r.esEtapa).reduce((sum, row) => sum + (parseFloat(row.subtotal) || 0), 0) + this.Ganancia;
     
     // const impuesto = 0.20
     // this.ISV = subtotalMateriales * impuesto;
     console.log(this.subtotalUtil, 'this.subtotalUtil');
     
     this.Total = this.subtotalUtil ;
     if (this.checked2) {
         this.Total = this.Subtotal *1.15;
     }
     // Calcula el total (subtotal + ISV)

     // Calcula los valores en USD
     this.TotalMaterialUSD = (
         this.TotalMaterial / this.valorMonedaConversion
     ).toFixed(2);
     this.TotalManoObraUSD = (
         this.TotalManoObra / this.valorMonedaConversion
     ).toFixed(2);
     this.TotalMaquinariaUSD = (
         this.TotalMaquinaria / this.valorMonedaConversion
     ).toFixed(2);
     this.GananciaUSD = (this.Ganancia / this.valorMonedaConversion).toFixed(
         2
     );
     this.SubtotalUSD = (this.Subtotal / this.valorMonedaConversion).toFixed(
         2
     );
     this.ISVUSD = (this.Subtotal / 1.15).toFixed(2);
     this.TotalUSD = (this.Total / this.valorMonedaConversion).toFixed(2);

    }

    async quitarFila(index: number) {
        // Obtener la fila actual
        const currentRow = this.prueba[index];

        // Verificar si la fila a eliminar es una actividad
        if (!currentRow.esEtapa) {
            // Obtener el número de la etapa de la fila actual
            const etapaItem = currentRow.item.split('.')[0];
            const etapaNumber = parseInt(etapaItem, 10);

            // Filtrar las actividades que pertenecen a la misma etapa
            const actividades = this.prueba.filter(
                (row) => !row.esEtapa && row.item.startsWith(`${etapaNumber}.`)
            );

            // Verificar si solo queda una actividad
            if (actividades.length === 1) {
                console.warn(
                    'No se puede eliminar la única actividad en la etapa.'
                );
                return; // Salir sin eliminar
            }

            console.log('ID DETA ' + currentRow.id);
            if (currentRow.id) {
                let estadoPresupuesto = 'No';
                const foundProyecto = this.proyectoOptions.find(
                    (proyecto) => proyecto.proy_Id === this.form.value.proy_Id
                );
                if (foundProyecto.espr_Id == 1) {
                    estadoPresupuesto = 'Si';
                }
                this.presupuestodetalleservice
                    .Eliminar(currentRow.id)
                    .then((response) => {
                        console.log(response);
                    });
                if (estadoPresupuesto == 'Si') {
                    this.actividadPorEtapaService
                        .Eliminar(currentRow.acetId)
                        .then(
                            (response) => {
                                console.log(response);
                            },
                            (error) => {
                                console.log(error);
                            }
                        );
                }
            }

            // Eliminar la fila actual
            this.prueba.splice(index, 1);

            this.actualizarTotales(currentRow, index);
            // Renumerar las actividades de la etapa correspondiente
            let counter = 1;
            for (let i = 0; i < this.prueba.length; i++) {
                if (
                    this.prueba[i].item.startsWith(`${etapaNumber}.`) &&
                    !this.prueba[i].esEtapa
                ) {
                    this.prueba[i].item = `${etapaNumber}.${counter
                        .toString()
                        .padStart(2, '0')}`;
                    counter++;
                }
            }
        } else {
            console.error(
                'No se puede eliminar una etapa. Debe eliminar actividades dentro de la etapa.'
            );
        }
    }

    isRemoveButtonDisabled(rowData: any, index: number): boolean {
        if (!rowData.esEtapa) {
            // Obtener el número de la etapa de la fila actual
            const etapaItem = rowData.item.split('.')[0];
            const etapaNumber = parseInt(etapaItem, 10);

            // Filtrar las actividades que pertenecen a la misma etapa
            const actividades = this.prueba.filter(
                (row) => !row.esEtapa && row.item.startsWith(`${etapaNumber}.`)
            );

            // Verificar si solo queda una actividad
            return actividades.length === 1;
        }
        return false;
    }
    onValSwitchChange() {
        console.log("🚀 ~ onValSwitchChange ~ onValSwitchChange: 💩💩")
        this.Ganancia = 0; // Reiniciar la ganancia total antes de calcularla de nuevo
        this.GananciaUSD = '0.00'; // Inicializa GananciaUSD para evitar mostrar valores incorrectos

        this.prueba.forEach((rowData, rowIndex) => {
            // Verifica si es una actividad y no una etapa
            if (!rowData.esEtapa) {
                // Verifica si el campo de cantidad es numérico
                const cantidad = parseFloat(rowData.cant);
                const esCantidadValida = !isNaN(cantidad) && cantidad >= 0;

                // Si la cantidad es válida, calcula y actualiza
                if (esCantidadValida) {
                    this.calcularPU(rowData, rowIndex);
                    this.actualizarTotales(rowData, rowIndex);

                    // Restaurar el valor original del material
                    // rowData.material = rowData.materialUtili;

                    const porcentaje = parseFloat(rowData.porcen) / 100;
                    const subtotalOriginal =
                        this.valoresOriginales[`subtotal_${rowIndex}`];

                    if (!isNaN(subtotalOriginal) && !isNaN(porcentaje)) {
                        let gananciaFila = 0;

                        if (!this.valSwitch) {
                            // Si valSwitch es falso, restaurar el subtotal original
                            rowData.subtotal = subtotalOriginal.toFixed(2);
                            
                        } else {
                            // Si valSwitch es verdadero, aplicar el porcentaje al subtotal
                            rowData.subtotal = subtotalOriginal.toFixed(2);

                            // Calcular la ganancia para la fila actual
                            gananciaFila = subtotalOriginal * porcentaje;
                        }
                        console.log("🚀 ~ this.prueba.forEach ~ rowData.subtotal:", rowData.subtotal)

                        // Acumular la ganancia de todas las filas
                        this.Ganancia += gananciaFila;
                        this.GananciaUSD = (this.Ganancia / this.valorMonedaConversion).toFixed(2);
                    }
                } else {
                    // Si la cantidad no es válida, asignar subtotal 0 y mostrar mensaje
                    rowData.subtotal = '0.00';
                    console.log(
                        `Fila ${rowIndex + 1} tiene una cantidad no numérica.`
                    );
                }
                if (rowData.esIsv && this.valSwitch) {
                    // this.toggleISV(rowData, rowIndex,'0');
                }
                this.calcularPU(rowData, rowIndex);
            }
        });

        // Asegúrate de que los totales generales se actualicen después del bucle
        this.actualizarTotalesGenerales();
    }
    onValSwitchChange2() {
        this.Ganancia = 0; // Reiniciar la ganancia total antes de calcularla de nuevo
        this.GananciaUSD = '0.00'; // Inicializa GananciaUSD para evitar mostrar valores incorrectos

        this.prueba.forEach((rowData, rowIndex) => {
            // Verifica si es una actividad y no una etapa
            if (!rowData.esEtapa) {
                // Verifica si el campo de cantidad es numérico
                const cantidad = parseFloat(rowData.cant);
                const esCantidadValida = !isNaN(cantidad) && cantidad >= 0;

                // Si la cantidad es válida, calcula y actualiza
                if (esCantidadValida) {
                    this.calcularPU(rowData, rowIndex);
                    this.actualizarTotales(rowData, rowIndex);

                    // Restaurar el valor original del material
                    rowData.material = rowData.materialUtili;

                    const porcentaje = parseFloat(rowData.porcen) / 100;
                    const subtotalOriginal =
                        this.valoresOriginales[`subtotal_${rowIndex}`];

                    if (!isNaN(subtotalOriginal) && !isNaN(porcentaje)) {
                        let gananciaFila = 0;

                        if (this.valSwitch || this.valSwitch === false) {
                            // Si valSwitch es falso, restaurar el subtotal original
                            rowData.subtotal = subtotalOriginal.toFixed(2);
                        } else {
                            // Si valSwitch es verdadero, aplicar el porcentaje al subtotal
                            rowData.subtotal = (
                                subtotalOriginal *
                                (1 + porcentaje)
                            ).toFixed(2);
                            // Calcular la ganancia para la fila actual
                            gananciaFila = subtotalOriginal * porcentaje;
                        }

                        // Acumular la ganancia de todas las filas
                        this.Ganancia += gananciaFila;
                        this.GananciaUSD = (this.Ganancia / this.valorMonedaConversion).toFixed(2);
                    }
                } else {
                    // Si la cantidad no es válida, asignar subtotal 0 y mostrar mensaje
                    rowData.subtotal = '0.00';
                    console.log(
                        `Fila ${rowIndex + 1} tiene una cantidad no numérica.`
                    );
                }
                // if ( this.valSwitch) {
                //     this.toggleISV(rowData, rowIndex,'0');
                // }
                this.calcularPU(rowData, rowIndex);
            }
        });


        // Asegúrate de que los totales generales se actualicen después del bucle
        this.actualizarTotalesGenerales2();
    }

    // handleTab(event: KeyboardEvent, rowIndex: number, field: string) {
    //     if (event.key === 'Tab' && !event.shiftKey) {
    //         const currentRow = this.prueba[rowIndex];

    //         if (
    //             !currentRow.esEtapa &&
    //             (!currentRow.descripcion ||
    //                 !currentRow.cant ||
    //                 !currentRow.unidad ||
    //                 !currentRow.manoDeObra ||
    //                 !currentRow.material)
    //         ) {
    //             currentRow.invalid = true;
    //             return;
    //         }

    //         if (field === 'material' && !currentRow.esEtapa) {
    //             event.preventDefault();
    //             console.log('Se presionó Tab en el campo de material');
    //         }
    //     }
    // }

    async handleBlur(tipo: string, row: any, rowIndex: number, field?: string) {
        if (row[field] && !row[field].toString().startsWith('=') && !isNaN(row[field])) {
            // Si es un número, formatearlo con toFixed(2)
            row[field] = parseFloat(row[field]).toFixed(2);
        }
        const impuesto = 0.2;
        console.log('Copci', row.copc_Id);
        if (row.esIsv && this.valSwitch) {
            row.material = (
                parseFloat(row.materialUtili) *
                (1 - impuesto)
            ).toFixed(2);
            //    this.calcularPU(row, rowIndex);
            this.toggleISV(row, rowIndex,'0');
        }

        // if (nextRowIndex < this.prueba.length && !this.prueba[nextRowIndex].esEtapa) {
        this.updateOriginalValues(row);
        // this.handleMaterialChange(row, rowIndex);
        console.log('ID  ' + row.id);

        let acti_Id;
        const foundActividad = this.actividadOptions.find(
            (actividad) =>
                actividad.acti_Descripcion.toLowerCase().trim() ===
                row.descripcion.toLowerCase().trim()
        );
        if (foundActividad) {
            acti_Id = foundActividad.acti_Id;
        }
        console.log(acti_Id);
        let unidad;
        const foundUnidad = this.listunidades.find(
            (unidad) =>
                unidad.unme_Nomenclatura.toLowerCase().trim() ===
                row.unidad.toLowerCase().trim()
        );
        if (foundUnidad) {
            unidad = foundUnidad.unme_Id;
        }
        console.log(unidad);
        if (tipo === 'Si') {
            console.log('Blur input mano obra');
            if (
                row.manoDeObra !== this.originalValues[row.item].manoDeObra &&
                unidad &&
                acti_Id
            ) {
                await this.service.ListarCostosActividad(acti_Id, unidad).then(
                    (data: any) => {
                        // Actualiza el valor de manoDeObra con el valor devuelto
                        if (data && data.copc_Valor !== undefined) {
                            this.PrecioManoObraExiste = true;
                            row.copc_Id = data.copc_Id;
                            this.actualizarTotales(row, rowIndex);
                            this.calcularPU(row, rowIndex);
                        } else {
                            this.PrecioManoObraExiste = false;
                            (row.copc_Id = 0),
                                // row.manoDeObra = '0.00';
                                console.log(
                                    'El valor de costeo no está definido en la respuesta.'
                                );
                        }
                    },
                    (error) => {
                        console.error(
                            'Error al obtener costos de actividad:',
                            error
                        );
                    }
                );
                if (row.copc_Id != 0) {
                    const ModeloActualizar = {
                        copc_Id: row.copc_Id,
                        unme_Id: unidad,
                        copc_Valor: parseFloat(row.manoDeObra) || 0,
                        acti_Id: acti_Id,
                        usua_Modificacion: this.usua_Id,
                    };

                    console.log(
                        'Actualizando costo por actividad:',
                        ModeloActualizar
                    );

                    await this.service
                        .ActualizarCostoPorActividad(ModeloActualizar)
                        .then(
                            (response) => {
                                console.log(
                                    'Actualización de costo por actividad exitosa:',
                                    response
                                );
                            },
                            (error) => {
                                console.error(
                                    'Error al actualizar el costo por actividad:',
                                    error
                                );
                            }
                        );
                }

                // this.applyPercentageChange();
            }
        }

        const currentRow = this.prueba[rowIndex];
        const etapaItemPrefix = currentRow.item.split('.')[0];
        const etapaRow = this.prueba.find(
            (row) => row.item === `${etapaItemPrefix}.00`
        );
        console.log(this.prueba, 'detalles de presupuesto en HANDLE BLUR.');
        
        console.log(currentRow, 'row en la que se esta trabajando en HANDLE BLUR.');

        if (row.id) {
            console.log('ID  ' + row.id);
            const nonNumericPattern = /[^0-9]/;

            const foundEtapa = this.etapaOptions.find(
                (etapa) =>
                    etapa.etap_Descripcion.toLowerCase().trim() ===
                    etapaRow.descripcion.toLowerCase().trim()
            );
            if (foundEtapa) {
                etapaRow.etap_Id = foundEtapa.etap_Id;
            } else {
                etapaRow.etap_Id = 0;
            }
            //     // Validar si hay campos vacíos o si alguno de los campos contiene caracteres no numéricos
            // Validar si el campo descripción o el etap_Id están vacíos
            if (!etapaRow.descripcion || etapaRow.etap_Id === 0) {
                console.log('Entro');
                return;
            }
            if (
                !currentRow.esEtapa &&
                (!currentRow.descripcion || // Verifica si 'descripcion' está vacío
                    this.validateRow(currentRow.cant) || // Verifica si 'cant' está vacío o contiene caracteres no numéricos
                    !currentRow.unidad || // Verifica si 'unidad' está vacío o contiene caracteres no numéricos
                    this.validateRow(currentRow.manoDeObra) || // Verifica si 'manoDeObra' está vacío o contiene caracteres no numéricos
                    currentRow.material === '0.00' || // Verifica si 'material' es igual a '0.00'
                    this.validateRow(currentRow.material) || // Verifica si 'material' contiene caracteres no numéricos o es solo ceros
                    parseFloat(currentRow.material) === 0) // Verifica si 'material' es solo ceros
            ) {
                currentRow.invalid = true;
                console.log(
                    'Hay campos vacíos, con caracteres no numéricos, o con valor de solo ceros.'
                );
                return;
            }

            const Modelo = {
                pdet_Id: row.id,
                acti_Id: acti_Id,
                acet_Id: currentRow.acetId,
                pdet_Cantidad: parseFloat(row.cant) || 0,
                unme_Id: unidad,
                pren_Id: this.pren_Id,
                pdet_Incluido: row.esIsv,
                pdet_Impuesto: this.ValorImpuesto,
                pdet_ManoObraFormula: currentRow.manoDeObraFormula,
                pdet_MaterialFormula: currentRow.materialFormula,
                pdet_MaquinariaFormula: currentRow.maquinariaFormula,
                pdet_CantidadFormula: currentRow.cantFormula,
                pdet_Ganancia: row.porcen,
                pdet_PrecioManoObra: parseFloat(row.manoDeObra) || 0,
                pdet_PrecioMateriales: parseFloat(row.materialUtili) || 0,
                pdet_PrecioMaquinaria: parseFloat(row.maquinaria) || 0,
                usua_Modificacion: this.usua_Id,
            };

            console.log('Actualizando detalle:', Modelo);
            await this.presupuestodetalleservice.Actualizar(Modelo).then(
                (response) => {
                    if (response.code == 200) {
                        console.log('Actualización exitosa:', response);
                        this.ActualizarPresupuesto(1);
                    }
                },
                (error) => {
                    console.error('Error al actualizar la fila:', error);
                }
            );
            this.calcularPU(row, rowIndex);
        } else {
            const foundEtapa = this.etapaOptions.find(
                (etapa) =>
                    etapa.etap_Descripcion.toLowerCase().trim() ===
                    etapaRow.descripcion.toLowerCase().trim()
            );
            if (foundEtapa) {
                etapaRow.etap_Id = foundEtapa.etap_Id;
            } else {
                etapaRow.etap_Id = 0;
            }
            //     // Validar si hay campos vacíos o si alguno de los campos contiene caracteres no numéricos
            // Validar si el campo descripción o el etap_Id están vacíos
            if (!etapaRow.descripcion || etapaRow.etap_Id === 0) {
                console.log('Entro');
                return;
            }

            if (
                !currentRow.esEtapa &&
                (!currentRow.descripcion || // Verifica si 'descripcion' está vacío
                    this.validateRow(currentRow.cant) || // Verifica si 'cant' está vacío o contiene caracteres no numéricos
                    !currentRow.unidad || // Verifica si 'unidad' está vacío o contiene caracteres no numéricos
                    this.validateRow(currentRow.manoDeObra) || // Verifica si 'manoDeObra' está vacío o contiene caracteres no numéricos
                    currentRow.material === '0.00' || // Verifica si 'material' es igual a '0.00'
                    this.validateRow(currentRow.material) || // Verifica si 'material' contiene caracteres no numéricos o es solo ceros
                    parseFloat(currentRow.material) === 0) // Verifica si 'material' es solo ceros
            ) {
                // currentRow.invalid = true;
                console.log(
                    'Hay campos vacíos, con caracteres no numéricos, o con valor de solo ceros.'
                );
                return;
            }
            const proy_Id = this.form.value.proy_Id;

            const foundProyecto = this.proyectoOptions.find(
                (proyecto) => proyecto.proy_Id === proy_Id
            );
            console.log(foundProyecto);
            if (!currentRow.acetId) {
                if (!etapaRow.etpr_Id) {
                    console.log('Etpr_Id Vacio' + etapaRow.etpr_Id);
                    const foundEtapa = this.etapaOptions.find(
                        (etapa) =>
                            etapa.etap_Descripcion.toLowerCase().trim() ===
                            etapaRow.descripcion.toLowerCase().trim()
                    );
                    if (foundEtapa) {
                        etapaRow.etap_Id = foundEtapa.etap_Id;
                    }
                    let etpr_Estado = true;
                    if (foundProyecto.espr_Id != 1) {
                        etpr_Estado = false;
                    }
                    const ModeloEtapaPorProyecto = {
                        etap_Id: etapaRow.etap_Id,
                        proy_Id: this.form.value.proy_Id,
                        empl_Id: 2,
                        //  proy_Id: 51,
                        etpr_Estado: etpr_Estado,
                        usua_Creacion: this.usua_Id,
                    };
                    console.log(ModeloEtapaPorProyecto);
                    await this.service
                        .InsertarEtapaPorProyecto2(ModeloEtapaPorProyecto)
                        .then(
                            (response) => {
                                console.log(response);
                                this.etpr_Id = response.data.codeStatus;
                                currentRow.etpr_Id = this.etpr_Id;
                                etapaRow.etpr_Id = this.etpr_Id;
                                console.log('Nuevo Id 2' + this.etpr_Id);
                            },
                            (error) => {}
                        );
                } else {
                    this.etpr_Id = currentRow.etpr_Id;
                }

                console.log('Etpr_IdHHH ' + this.etpr_Id);

                let acet_Estado = false;
                if (foundProyecto.espr_Id === 1) {
                    acet_Estado = true;
                }
                let acet_FechaFin = new Date();
                        acet_FechaFin.setDate(acet_FechaFin.getDate() + 1);

                const ModeloActividadPorEtapa = {
                    acet_Cantidad: parseFloat(currentRow.cant) || 0,
                    acet_PrecioManoObraEstimado:
                        parseFloat(currentRow.manoDeObra) || 0,
                    empl_Id: 2,
                    acet_Observacion: 'N/A',
                    acti_Id: acti_Id,
                    acet_FechaInicio: new Date(),
                    acet_FechaFin: acet_FechaFin,
                    unme_Id: unidad,
                    etpr_Id: etapaRow.etpr_Id,
                    usua_Creacion: this.usua_Id,
                    acet_Estado: acet_Estado,
                };
                await this.actividadPorEtapaService
                    .Insertar(ModeloActividadPorEtapa)
                    .then(
                        (response) => {
                            console.log(response);
                            if (response.code == 200) {
                                currentRow.acetId = response.data.codeStatus;
                            }
                        },
                        (error) => {
                            console.log('Error ' + error);
                        }
                    );
            } else {
            }

            const Modelo = {
                pren_Id: this.pren_Id,
                pdet_Cantidad: parseFloat(currentRow.cant) || 0,
                pdet_PrecioManoObra: parseFloat(currentRow.manoDeObra) || 0,
                pdet_PrecioMateriales: parseFloat(currentRow.material) || 0,
                pdet_PrecioMaquinaria: parseFloat(currentRow.maquinaria) || 0,
                unme_Id: unidad,
                pdet_ManoObraFormula: currentRow.manoDeObraFormula,
                pdet_MaterialFormula: currentRow.materialFormula,
                pdet_MaquinariaFormula: currentRow.maquinariaFormula,
                pdet_CantidadFormula: currentRow.cantFormula,
                acet_Id: currentRow.acetId,
                pdet_Incluido: currentRow.esIsv,
                pdet_Ganancia: currentRow.porcen,
                usua_Creacion: this.usua_Id,
            };
            await this.presupuestodetalleservice.Insertar(Modelo).then(
                async (response) => {
                    if (response.code == 200) {
                        currentRow.id = response.data.codeStatus;
                        currentRow.verification = true;
                        this.ActualizarPresupuesto(1);
                        if (currentRow.copc_Id) {
                            const ModeloActualizar = {
                                copc_Id: currentRow.copc_Id,
                                unme_Id: unidad,
                                copc_Valor:
                                    parseFloat(currentRow.manoDeObra) || 0,
                                acti_Id: acti_Id,
                                usua_Modificacion: this.usua_Id,
                            };
                            await this.service
                                .ActualizarCostoPorActividad(ModeloActualizar)
                                .then(
                                    (response) => {},
                                    (error) => {}
                                );
                        } else {
                            const ModeloInsertar = {
                                acti_Id: acti_Id,
                                unme_Id: unidad,
                                copc_Valor:
                                    parseFloat(currentRow.manoDeObra) || 0,
                                usua_Creacion: this.usua_Id,
                            };
                            await this.service
                                .InsertarCostoPorActividad(ModeloInsertar)
                                .then(
                                    (response) => {
                                        if (response.code == 200) {
                                            currentRow.copc_Id =
                                                response.data.codeStatus;
                                        }
                                    },
                                    (error) => {}
                                );
                        }
                    }
                },
                (error) => {}
            );
            // Asignar el etpr_Id a todas las actividades de la misma etapa
            this.prueba.forEach((row) => {
                if (
                    row.item.startsWith(currentRow.item.split('.')[0]) &&
                    !row.esEtapa
                ) {
                    row.etpr_Id = etapaRow.etpr_Id;
                }
            });
        }
    }

    NoInsertarUnidad() {
        this.modalUnidad = false;
    }
    onActividadChange(event: any, rowData: any, rowIndex: number) {
        console.log(event.value.acti_Descripcion);
        rowData.actiId = event.value.acti_Id;
        this.isActividadSelected = true;
        rowData.descripcion = event.value.acti_Descripcion;
    }
    validateRow(material: string): boolean {
        console.log('entra validateRow function');
        
        const nonNumericPattern = /[^0-9.]/; // Incluye también el punto decimal
        return (
            nonNumericPattern.test(material) ||
            material === '' ||
            parseFloat(material) === 0
        );
    }

    validateEmptyOrNonNumeric(value: string): boolean {
        const nonNumericPattern = /[^0-9.]/;
        return !value || nonNumericPattern.test(value);
    }
    validateAndFocus(rowData, rowIndex): boolean {
        console.log('entra validateAndFocus function');
        
        let focusElement: any = null;
        let unidad;
        let acti_Id;
        const foundUnidad = this.listunidades.find(
            (unidad) =>
                unidad.unme_Nomenclatura.toLowerCase().trim() ===
                rowData.unidad.toLowerCase().trim()
        );
        if (foundUnidad) {
            unidad = foundUnidad.unme_Id;
            rowData.unme_Id = unidad;
        } else {
            unidad = 0;
            rowData.unme_Id = unidad;
        }
        const foundActividad = this.actividadOptions.find(
            (actividad) =>
                actividad.acti_Descripcion.toLowerCase().trim() ===
                rowData.descripcion.toLowerCase().trim()
        );
        if (foundActividad) {
            acti_Id = foundActividad.acti_Id;
            rowData.actiId = acti_Id;
        } else {
            acti_Id = 0;
            rowData.actiId = acti_Id;
        }
        // Verificar las condiciones de validación
        const hasInvalidFields =
            !rowData.esEtapa &&
            (!rowData.descripcion ||
                this.validateRow(rowData.cant) ||
                !unidad ||
                !acti_Id ||
                this.validateRow(rowData.manoDeObra) ||
                rowData.material === '0.00' ||
                this.validateRow(rowData.material) ||
                // this.validateRow(rowData.maquinaria) ||
                parseFloat(rowData.material) === 0);

        if (hasInvalidFields) {
            rowData.invalid = true;
            console.log(
                'Hay campos vacíos, con caracteres no numéricos, o con valor de solo ceros.'
            );

            // Detectar cambios manualmente
            this.cd.detectChanges();

            // Determinar qué campo necesita el foco
            if (!rowData.descripcion) {
                focusElement = this.descripcionAutoCompletes
                    .toArray()
                    .find((comp) => comp.id === `actividad${rowIndex}`);
                console.log(this.descripcionAutoCompletes);
                console.log(rowIndex);
                console.log('FocusDes', focusElement);
            } else if (this.validateRow(rowData.cant)) {
                focusElement = this.cantidadInputs
                    .toArray()
                    .find(
                        (comp) =>
                            comp.nativeElement.id === `cant${rowData.item}`
                    );
                console.log('Focuscan', focusElement);
            } else if (!unidad) {
                // focusElement = this.unidadAutoCompletes
                //     .toArray()
                //     .find((comp) => comp.id === `unidad${rowIndex}`);
                console.log('Focusunid', focusElement);
            } else if (this.validateRow(rowData.manoDeObra)) {
                focusElement = this.manoDeObraInputs
                    .toArray()
                    .find(
                        (comp) =>
                            comp.nativeElement.id === `manoDeObra${rowData.item}`
                    );
                console.log('Focusmano', focusElement);
            } else if (this.validateRow(rowData.maquinaria)) {
                focusElement = this.maquinariaInputs
                    .toArray()
                    .find(
                        (comp) =>
                            comp.nativeElement.id === `maquinaria${rowData.item}`
                    );
                console.log('Focusmano', focusElement);
            }else if (
                rowData.material === '0.00' ||
                this.validateRow(rowData.material) ||
                parseFloat(rowData.material) === 0
            ) {
                focusElement = this.materialInputs
                    .toArray()
                    .find(
                        (comp) =>
                            comp.nativeElement.id === `material${rowData.item}`
                    );
                console.log('Focusmate', focusElement);
            }

            // Focalizar el campo correspondiente automáticamente si es inválido
            if (focusElement) {
                setTimeout(() => {
                    if (focusElement.inputEL) {
                        // Para AutoComplete de PrimeNG
                        focusElement.inputEL.nativeElement.focus();
                    } else if (focusElement.nativeElement) {
                        focusElement.nativeElement.focus();
                    }
                }, 0);
            }

            return true; // Retorna true si hay campos inválidos
        } else {
            rowData.invalid = false;
            return false; // Retorna false si todas las validaciones se cumplieron correctamente
        }
    }

    validateAndFocusEtapa(rowData, rowIndex): boolean {
        let focusElement: any = null;

        // Verificar las condiciones de validación
        const hasInvalidFields =
            rowData.esEtapa && (!rowData.descripcion || rowData.etap_Id === 0);

        if (hasInvalidFields) {
            rowData.invalid = true;
            console.log(
                'Hay campos vacíos, con caracteres no numéricos, o con valor de solo ceros.'
            );

            // Detectar cambios manualmente
            this.cd.detectChanges();

            // Determinar qué campo necesita el foco
            if (!rowData.descripcion || rowData.etap_Id === 0) {
                focusElement = this.etapaAutoCompletes
                    .toArray()
                    .find((comp) => comp.id === `etapa${rowIndex}`);
                console.log(this.etapaAutoCompletes);
                console.log(rowIndex);
                console.log('FocusDes', focusElement);
            }

            // Focalizar el campo correspondiente automáticamente si es inválido
            if (focusElement) {
                console.log('AQUI2', focusElement.nativeElement);
                setTimeout(() => {
                    if (focusElement.inputEL) {
                        // Para AutoComplete de PrimeNG
                        focusElement.inputEL.nativeElement.focus();
                    }
                }, 0);
            }

            return true; // Retorna true si hay campos inválidos
        } else {
            rowData.invalid = false;
            return false; // Retorna false si todas las validaciones se cumplieron correctamente
        }
    }
     InsertarInsumosLlenado(acetId: number, listInsumos: any[]) {
        // Iterar sobre cada insumo en la lista
        if (listInsumos.length > 0) {
            for (const insumo of listInsumos) {
                const Modelo = {
                    inpp_Id: insumo.inpp_Id,
                    inpa_stock: parseFloat(insumo.inpa_stock),
                    inpa_PrecioCompra: parseFloat(insumo.inpa_PrecioCompra),
                    inpa_Desperdicio: insumo.inpa_Desperdicio,
                    acet_Id: acetId,
                    inpa_Estado: false,
                    inpa_FormulaRendimiento: '',
                    inpa_ActividadLlenado: insumo.inpa_Id,
                    inpa_PrecioCompraFormula: '',
                    inpa_StockFormula: '',
                    inpa_Rendimiento: parseFloat(insumo.inpa_Rendimiento),
                    usua_Creacion: this.usua_Id,
                };

                try {
                    const response =
                         this.service.InsertarInsumoPorActividad(Modelo);
                    console.log('Inserción exitosa:', response);
                } catch (error) {
                    console.error('Error al insertar insumo:', error);
                }
            }
            return true;
        }
        else{
            return false;
        }
    }

     InsertarMaquinariasLlenado(acetId: number, listMaquinarias: any[]) {
        // Iterar sobre cada insumo en la lista
        if (listMaquinarias.length > 0) {
            for (const maquinaria of listMaquinarias) {
                const Modelo = {
                    mapr_Id: maquinaria.mapr_Id,
                    rmac_Rentapor: 0,
                    rmac_CantidadRenta: parseFloat(
                        maquinaria.rmac_CantidadRenta
                    ),
                    rmac_PrecioRenta: parseFloat(maquinaria.rmac_PrecioRenta),
                    rmac_CantidadMaquinas: parseFloat(
                        maquinaria.rmac_CantidadMaquinas
                    ),
                    rmac_CantidadRentaFormula: '',
                    rmac_ActividadLlenado: parseInt(
                        maquinaria.rmac_ActividadLlenado
                    ),
                    rmac_PrecioRentaFormula: '',
                    rmac_CantidadMaquinaFormula:'',
                    acet_Id: acetId,
                    rmac_Estado: false,
                    usua_Creacion: this.usua_Id,
                };

                try {
                    const response =
                         this.service.InsertarMaquinariaPorActividad(
                            Modelo
                        );
                    console.log('Inserción exitosa:', response);
                } catch (error) {
                    console.error('Error al insertar insumo:', error);
                }
            }
            return true;
        }
        else{
            return false;
        }
    }

    async agregarFila(tipo: string, index: number) {
        // this.indexToDelete = index;
        // const etapaRow = this.prueba[this.indexToDelete];
        // this.handleBlur('No', rowData, index);

        // console.log(currentRow);
        console.log('entra agregarFila function');
        
        if (tipo === 'actividad' && index !== undefined) {
            console.log('entra if actividad');
            
            const currentRow = this.prueba[index];
            console.log('Index', index);
            console.log('CurrentRow', currentRow);

            const etapaItemPrefix = currentRow.item.split('.')[0];
            const etapaRow = this.prueba.find(
                (row) => row.item === `${etapaItemPrefix}.00`
            );
            // Verificar si hay inputs vacíos en la fila actual
            // Expresión regular para detectar caracteres no numéricos
            if (currentRow.verification == false) {
                const nonNumericPattern = /[^0-9]/;
                const foundEtapa = this.etapaOptions.find(
                    (etapa) =>
                        etapa.etap_Descripcion.toLowerCase().trim() ===
                        etapaRow.descripcion.toLowerCase().trim()
                );
                if (foundEtapa) {
                    etapaRow.etap_Id = foundEtapa.etap_Id;
                } else {
                    etapaRow.etap_Id = 0;
                }
                let acti_Id;
                const foundActividad = this.actividadOptions.find(
                    (actividad) =>
                        actividad.acti_Descripcion.toLowerCase().trim() ===
                        currentRow.descripcion.toLowerCase().trim()
                );
                if (foundActividad) {
                    acti_Id = foundActividad.acti_Id;
                } else {
                    acti_Id = 0;
                }
                console.log(acti_Id);
                let unidad;
                const foundUnidad = this.listunidades.find(
                    (unidad) =>
                        unidad.unme_Nomenclatura.toLowerCase().trim() ===
                        currentRow.unidad.toLowerCase().trim()
                );
                if (foundUnidad) {
                    unidad = foundUnidad.unme_Id;
                } else {
                    unidad = 0;
                }
                //     // Validar si hay campos vacíos o si alguno de los campos contiene caracteres no numéricos
                // Validar si el campo descripción o el etap_Id están vacíos
                if (this.validateAndFocusEtapa(etapaRow, index)) {
                    console.log('VALIDACIONES  2');
                    return;
                }

                if (!etapaRow.descripcion || etapaRow.etap_Id === 0) {
                    etapaRow.invalid = true;
                    console.log('Entro');
                    return;
                }
                if (this.validateAndFocus(currentRow, index)) {
                    console.log('VALIDACIONES');
                    return;
                }

                console.log('SI PASO');
                console.log('Etpr_Id ' + etapaRow.etpr_Id);

                const proy_Id = this.form.value.proy_Id;
                const foundProyecto = this.proyectoOptions.find(
                    (proyecto) => proyecto.proy_Id === proy_Id
                );
                console.log(foundProyecto);
                if (!currentRow.id) {
                    let insumosAgregados = [];
                    await this.service
                        .ListarInsumosPorAcitividad(currentRow.acetId)
                        .then((data: any) => {
                            insumosAgregados = data;
                        });
                    console.log('InsumosAgregados', insumosAgregados);
                    let maquinariasAgregadas = [];
                    await this.service
                        .ListarMaquinariasPorAcitividad(currentRow.acetId)
                        .then((data: any) => {
                            maquinariasAgregadas = data;
                        });
                    console.log('Maquinarias Agregadas', maquinariasAgregadas);
                    if (!etapaRow.etpr_Id) {
                        console.log('Etpr_Id Vacio' + currentRow.etpr_Id);

                        const foundEtapa = this.etapaOptions.find(
                            (etapa) =>
                                etapa.etap_Descripcion.toLowerCase().trim() ===
                                etapaRow.descripcion.toLowerCase().trim()
                        );
                        if (foundEtapa) {
                            etapaRow.etap_Id = foundEtapa.etap_Id;
                        }
                        let etpr_Estado = true;
                        if (foundProyecto.espr_Id != 1) {
                            etpr_Estado = false;
                        }
                        const ModeloEtapaPorProyecto = {
                            etap_Id: etapaRow.etap_Id,
                            proy_Id: this.form.value.proy_Id,
                            empl_Id: 2,
                            // proy_Id: this.proy_Id,
                            etpr_Estado: etpr_Estado,
                            usua_Creacion: this.usua_Id,
                        };
                        await this.service
                            .InsertarEtapaPorProyecto2(ModeloEtapaPorProyecto)
                            .then(
                                (response) => {
                                    console.log(response);
                                    this.etpr_Id = response.data.codeStatus;
                                    currentRow.etpr_Id =
                                        response.data.codeStatus;
                                    if (etapaRow.esEtapa) {
                                        etapaRow.etpr_Id = this.etpr_Id;
                                        console.log(
                                            'EEtsps row ' + etapaRow.etpr_Id
                                        );
                                    }
                                    console.log('Nuevo Id 2' + this.etpr_Id);
                                },
                                (error) => {}
                            );
                    } else {
                        this.etpr_Id = etapaRow.etpr_Id;
                    }

                    console.log('Etpr_IdHHH ' + this.etpr_Id);

                    let acet_Estado = false;
                    if (foundProyecto.espr_Id === 1) {
                        acet_Estado = true;
                    }

                    let acet_FechaFin = new Date();
                        acet_FechaFin.setDate(acet_FechaFin.getDate() + 1);

                    const ModeloActividadPorEtapa = {
                        acet_Cantidad: parseFloat(currentRow.cant) || 0,
                        acet_PrecioManoObraEstimado:
                            parseFloat(currentRow.manoDeObra) || 0,
                        acti_Id: acti_Id,
                        empl_Id: 2,
                        acet_Observacion: 'N/A',
                        acet_FechaInicio: new Date(),
                        acet_FechaFin: acet_FechaFin,
                        unme_Id: unidad,
                        etpr_Id: etapaRow.etpr_Id,
                        usua_Creacion: this.usua_Id,
                        acet_Estado: acet_Estado,
                    };
                    await this.actividadPorEtapaService
                        .Insertar(ModeloActividadPorEtapa)
                        .then(
                            (response) => {
                                console.log(response);
                                if (response.code == 200) {
                                    currentRow.acetId =
                                        response.data.codeStatus;
                                    this.InsertarInsumosLlenado(
                                        currentRow.acetId,
                                        insumosAgregados
                                    );
                                    this.InsertarMaquinariasLlenado(
                                        currentRow.acetId,
                                        maquinariasAgregadas
                                    );
                                }
                            },
                            (error) => {
                                console.log('Error ' + error);
                            }
                        );
                } else {
                }
                const Modelo = {
                    pren_Id: this.pren_Id,
                    pdet_Cantidad: parseFloat(currentRow.cant) || 0,
                    pdet_PrecioManoObra: parseFloat(currentRow.manoDeObra) || 0,
                    pdet_PrecioMateriales:
                        parseFloat(currentRow.materialUtili) || 0,
                    pdet_PrecioMaquinaria:
                        parseFloat(currentRow.maquinaria) || 0,
                    unme_Id: unidad,
                    pdet_ManoObraFormula: currentRow.manoDeObraFormula,
                    pdet_MaterialFormula: currentRow.materialFormula,
                    pdet_MaquinariaFormula: currentRow.maquinariaFormula,
                    pdet_CantidadFormula: currentRow.cantFormula,
                    acet_Id: currentRow.acetId,
                    pdet_Incluido: currentRow.esIsv,
                    pdet_Ganancia: currentRow.porcen,
                    usua_Creacion: this.usua_Id,
                };
                await this.presupuestodetalleservice.Insertar(Modelo).then(
                    async (response) => {
                        if (response.code == 200) {
                            currentRow.id = response.message;
                            currentRow.verification = true;
                            this.ActualizarPresupuesto(1);
                            if (currentRow.copc_Id) {
                                const ModeloActualizar = {
                                    copc_Id: currentRow.copc_Id,
                                    unme_Id: unidad,
                                    copc_Valor:
                                        parseFloat(currentRow.manoDeObra) || 0,
                                    acti_Id: acti_Id,
                                    usua_Modificacion: this.usua_Id,
                                };
                                await this.service
                                    .ActualizarCostoPorActividad(
                                        ModeloActualizar
                                    )
                                    .then(
                                        (response) => {},
                                        (error) => {}
                                    );
                            } else {
                                const ModeloInsertar = {
                                    acti_Id: acti_Id,
                                    unme_Id: unidad,
                                    copc_Valor:
                                        parseFloat(currentRow.manoDeObra) || 0,
                                    usua_Creacion: this.usua_Id,
                                };
                                await this.service
                                    .InsertarCostoPorActividad(ModeloInsertar)
                                    .then(
                                        (response) => {
                                            if (response.code == 200) {
                                                currentRow.copc_Id =
                                                    response.data.codeStatus;
                                            }
                                        },
                                        (error) => {}
                                    );
                            }
                        }
                    },
                    (error) => {}
                );
            }
            // // Asignar el etpr_Id a todas las actividades de la misma etapa
            this.prueba.forEach((row) => {
                if (
                    row.item.startsWith(currentRow.item.split('.')[0]) &&
                    !row.esEtapa
                ) {
                    row.etpr_Id = etapaRow.etpr_Id;
                }
            });
            currentRow.invalid = false;
            this.listarPresupuesto();
            const etapaItem = currentRow.item.split('.')[0];
            const etapaNumber = parseInt(etapaItem, 10);

            // Crear la nueva actividad
            const nextActividadNumber =
                parseInt(currentRow.item.split('.')[1], 10) + 1;
            const newActividad = {
                item: `${etapaNumber}.${nextActividadNumber
                    .toString()
                    .padStart(2, '0')}`,
                descripcion: '',
                cant: '0.00',
                unidad: '',
                manoDeObra: '0.00',
                material: '0.00',
                esEtapa: false,
                invalid: false,
                id: 0,
                acetId: 0,
                porcen: this.defaultPorcentaje,
                actiId: 0,
                verification: false,
                etpr_Id: etapaRow.etpr_Id,
                esIsv: false,
                empl_Id: 0,
                pu: '0.00',
                unme_Id: 0,
                subtotal: '0.00',
                cantFormula: '',
                manoDeObraFormula: '',
                materialFormula: '',
                expanded: false,
                manoObraTotal: '0.00',
                copc_Id: 0,
                materialTotal: '0.00',
                Isv: '0.00',
                subtotalConIsv: '0.00',
                puUSD: '0.00',
                subtotalUSD: '0.00',
                manoDeObraUtili: '0.00',
                materialUtili: '0.00',
                acetIdLlenado: 0,
                manoObraTotalUtili: '0.00',
                maquinaria: '0.00',
                maquinariaFormula: '',
                isSwitchDisabled: false,
                materialTotalUtili: '0.00',
                maquinariaTotal: '0.00',
                puUtili: '0.00',
                subtotalUtil: '0.00',
                puUSDUtili: '0.00',
                subtotalUSDUtili: '0.00',
                maquinariaReferencias: [],
                cantReferencias: [],
                manoDeObraReferencias: [],
                materialReferencias: []
            };

            // Verificar si hay una fila debajo de la actual
            if (index + 1 < this.prueba.length) {
                console.log('Etapa anterior');
                // Insertar la nueva actividad justo debajo de la fila actual
                this.prueba.splice(index + 1, 0, newActividad);
            } else {
                console.log('Etapa actual');
                // Agregar la nueva actividad al final
                this.prueba.push(newActividad);
            }

            // Renumerar las actividades de la etapa correspondiente
            let counter = 1;
            for (let i = 0; i < this.prueba.length; i++) {
                if (
                    this.prueba[i].item.startsWith(`${etapaNumber}.`) &&
                    !this.prueba[i].esEtapa
                ) {
                    this.prueba[i].item = `${etapaNumber}.${counter
                        .toString()
                        .padStart(2, '0')}`;
                    counter++;
                }
            }
        } else if (tipo === 'etapa' && index !== undefined) {
            console.log('entra if etapa');
            
            // Obtener el número de la etapa donde se presionó el botón
            const currentEtapaNumber = parseInt(
                this.prueba[index].item.split('.')[0],
                10
            );
            console.log('Agrego etapa')
            // Encontrar la última actividad de la etapa actual
            let insertIndex = index + 1;
            for (let i = index + 1; i < this.prueba.length; i++) {
                const rowItemNumber = parseInt(
                    this.prueba[i].item.split('.')[0],
                    10
                );
                if (rowItemNumber > currentEtapaNumber) {
                    insertIndex = i;
                    break;
                } else if (i === this.prueba.length - 1) {
                    insertIndex = i + 1;
                }
            }

            // Crear la nueva etapa y actividad
            const newEtapaNumber = currentEtapaNumber + 1;
            const newEtapa = {
                item: `${newEtapaNumber}.00`,
                descripcion: '',
                cant: '0.00',
                unidad: '',
                manoDeObra: '0.00',
                material: '',
                esEtapa: true,
                invalid: false,
                pu: '0.00',
                manoDeObraUtili: '0.00',
                materialUtili: '0.00',
                subtotalUtil: '0.00',
                etap_Id: 0,
                maquinaria: '0.00',
                etpr_Id: 0,
                subtotalConIsv: '0.00',
                puUtili: '0.00',
                puUSDUtili: '0.00',
                subtotalUSDUtili: '0.00',
                Isv: '0.00',
                subtotal: '0.00',
                puUSD: '0.00',
                subtotalUSD: '0.00',
            };
            const newActividad = {
                item: `${newEtapaNumber}.01`,
                descripcion: '',
                cant: '0.00',
                unidad: '',
                manoDeObra: '0.00',
                material: '0.00',
                esEtapa: false,
                invalid: false,
                id: 0,
                acetId: 0,
                acetIdLlenado: 0,
                actiId: 0,
                verification: false,
                porcen: this.defaultPorcentaje,
                esIsv: false,
                maquinaria: '0.00',
                maquinariaFormula: '',
                cantFormula: '',
                manoDeObraFormula: '',
                materialFormula: '',
                etpr_Id: 0,
                maquinariaTotal: '0.00',
                expanded: false,
                manoObraTotal: '0.00',
                materialTotal: '0.00',
                pu: '0.00',
                unme_Id: 0,
                isSwitchDisabled: false,
                empl_Id: 0,
                subtotal: '0.00',
                puUSD: '0.00',
                Isv: '0.00',
                subtotalUSD: '0.00',
                subtotalConIsv: '0.00',
                copc_Id: 0,
                manoDeObraUtili: '0.00',
                materialUtili: '0.00',
                manoObraTotalUtili: '0.00',
                materialTotalUtili: '0.00',
                puUtili: '0.00',
                subtotalUtil: '0.00',
                puUSDUtili: '0.00',
                subtotalUSDUtili: '0.00',
                maquinariaReferencias: [],
                cantReferencias: [],
                manoDeObraReferencias: [],
                materialReferencias: []
            };

            // Insertar la nueva etapa y actividad en la posición correcta
            this.prueba.splice(insertIndex, 0, newEtapa, newActividad);

            // Renumerar los items de las etapas y actividades siguientes
            for (let i = insertIndex + 2; i < this.prueba.length; i++) {
                const itemParts = this.prueba[i].item.split('.');
                const etapaNumber = parseInt(itemParts[0], 10);
                if (etapaNumber >= newEtapaNumber) {
                    const newEtapaIndex = etapaNumber + 1;
                    this.prueba[i].item = `${newEtapaIndex}.${itemParts[1]}`;
                }
            }

            // Actualizar las propiedades de botón
            this.btnAgregar = false;
            this.btnEliminar = false;
        }
        this.calculateAveragePercentage();
    }
    toggleISV(rowData: any, rowIndex: number, option: string) {
        const impuesto = parseInt(this.ValorImpuesto) / 100; // Definir el impuesto que deseas aplicar (20% en este caso)
        const materialValue = parseFloat(rowData.materialUtili);

        // Verificar si el valor de materialUtili es un número válido
        if (isNaN(materialValue)) {
            console.error('El valor del material no es un número válido:', rowData.materialUtili);
            return; // Salir de la función si el valor no es numérico
        }

        // Inicializar la propiedad isvAplicado si no existe
        if (typeof rowData.Isv === 'undefined') {
            rowData.Isv = 0;
        }

        if(option === '1'){
            // Deshabilitar el interruptor por 3 segundos
            rowData.isSwitchDisabled = true;
            setTimeout(() => {
                rowData.isSwitchDisabled = false; // Habilitar el interruptor después de 3 segundos
            }, 3000); // 3000 ms = 3 segundos
        }


        if (rowData.esIsv) {
            // Aplica el ISV y actualiza el valor de material
            const isvAplicado = materialValue * impuesto;

            // Si hay un ISV previamente aplicado, primero restarlo de this.ISV
            this.ISV -= rowData.Isv;
    
            // rowData.material = (materialValue * (1 + impuesto)).toFixed(2);
            rowData.subtotalConIsv += isvAplicado;
            const isvSub = isvAplicado * rowData.cant;

            // Actualizar el ISV total y almacenar el nuevo valor aplicado
            this.ISV += isvSub;
            rowData.Isv = isvSub; // Guardar el ISV aplicado para poder restarlo más tarde
        } else {
            // Restaurar el valor original del material
            // rowData.material = rowData.materialUtili;
    
            // Restar el ISV previamente aplicado
            this.ISV -= rowData.Isv;
            rowData.subtotalConIsv -= rowData.Isv;

            // Resetear el ISV aplicado ya que el interruptor está apagado
            rowData.Isv = 0;
        }

        // Actualizar los valores después de aplicar o remover el ISV
        if(option === '1'){
            this.ActualizarDetalle(rowData);
        }
        this.calcularPU(rowData, rowIndex);
        this.actualizarTotales(rowData, rowIndex);
        this.actualizarTotalesGenerales();
    }


    calculateAveragePercentage() {
        let totalPorcentaje = 0;
        let count = 0;
        console.log('Calculate Aavarege');
        this.prueba.forEach((rowData) => {
            if(!rowData.porcen){
                rowData.porcen = '0';
            }
            if (!rowData.esEtapa && rowData.porcen) {
                // Solo aplicar a filas que no sean etapas y que tengan un porcentaje
                console.log(rowData.porcen);
                totalPorcentaje += parseFloat(rowData.porcen);
                count++;
            }
        });

        if (count > 0) {
            console.log('Entro Porcent');
            this.defaultPorcentaje = (totalPorcentaje / count).toFixed(0); // Promedio con dos decimales
            this.form.patchValue({
                pren_PorcentajeGanancia: this.defaultPorcentaje,
            });
        } else {
            this.defaultPorcentaje = '0.00'; // Valor por defecto si no hay porcentajes
        }
    }

    onMaterialChange(rowData: any, rowIndex: number, field?: string) {
        // Siempre actualizar el valor original al cambiar el material, sin aplicar el impuesto
        rowData.materialUtili = rowData.material;
        this.onValueChange(rowData, rowIndex, field);
    }

    handleFormulaInput(event: KeyboardEvent, rowIndex: number, field: string) {
        const inputElement = event.target as HTMLInputElement;

        // Detectar Ctrl + Espacio para restaurar la fórmula
        if (event.ctrlKey && event.key === ' ') {
            this.restoreFormula(rowIndex, field, inputElement);
            event.preventDefault(); // Evita cualquier acción predeterminada para Ctrl + Espacio
            return;
        }

        if (event.key === 'Enter') {
            let inputValue = inputElement.value;

            if (inputValue.startsWith('=')) {
                const result = this.evaluateFormula(inputValue);
                console.log(result);
                if (result !== null) {
                    this.prueba[rowIndex][field] = result;
                    const pr = this.prueba[rowIndex][field+'Formula'] ? this.prueba[rowIndex][field+'Formula'] : '';
                    if(inputValue && pr) {
                        const referenciasPrevias = this.separarID(pr, field);
                        const referenciasNuevas = this.separarID(inputValue, field);
                        const id = inputElement.getAttribute('id');
                        this.eliminarReferencias(referenciasPrevias, referenciasNuevas, id);
                        console.log(`🚀referencias:`,this.prueba);
                    }
                    console.log('lista de id de la formula', this.separarID(pr, field))
                    this.storeFormula(rowIndex, field, inputValue); // Almacena la fórmula
                    this.actualizarTotales(this.prueba[rowIndex], rowIndex); // Actualiza los totales después de aplicar la fórmula
                    this.calcularPU(this.prueba[rowIndex], rowIndex);
                    this.onMaterialChange(this.prueba[rowIndex], rowIndex);
                    this.actualizarTotalesGenerales();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'La fórmula es inválida.',
                    });
                }
            }
        }
    }
    handleFormulaInputRendimiento(
        event: KeyboardEvent,
        rowIndex: number,
        field: string
    ) {
        const inputElement = event.target as HTMLInputElement;
        const index = rowIndex - 1;
        // Detectar Ctrl + Espacio para restaurar la fórmula
        if (event.ctrlKey && event.key === ' ') {
            this.restoreFormulaRendimiento(index, field, inputElement);
            event.preventDefault(); // Evita cualquier acción predeterminada para Ctrl + Espacio
            return;
        }

        if (event.key === 'Enter') {
            let inputValue = inputElement.value;

            if (inputValue.startsWith('=')) {
                const result = this.evaluateFormula(inputValue);
                console.log(result);
                if (result !== null) {
                    console.log('Input', this.insumos[index]);
                    console.log('rowIndex', index);
                    this.insumos[index][field] = result;
                    const pr = this.insumos[index][field+'Formula'] ? this.insumos[index][field+'Formula'] : '';
                    if(inputValue && pr) {
                         const referenciasPrevias = this.separarIDInsumo(pr, field);
                         const referenciasNuevas = this.separarIDInsumo(inputValue, field);
                         const id = inputElement.getAttribute('id');
                         this.eliminarReferenciasInsumo(referenciasPrevias, referenciasNuevas, id);
                        console.log(`🚀referencias:`,this.insumos);
                    }
                    console.log('lista de id de la formula', this.separarIDInsumo(pr, field));
                    console.log('Field',field)
                    this.storeFormulaRendimiento(index, field, inputValue); // Almacena la fórmula
                    this.actualizarCostoUnitario(this.insumos[index]);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'La fórmula es inválida.',
                    });
                }
            }
        }
    }

    handleFormulaInputMaquinaria(
        event: KeyboardEvent,
        rowIndex: number,
        field: string
    ) {
        const inputElement = event.target as HTMLInputElement;
        const index = rowIndex - 1;
        // Detectar Ctrl + Espacio para restaurar la fórmula
        if (event.ctrlKey && event.key === ' ') {
            this.restoreFormulaMaquinaria(index, field, inputElement);
            event.preventDefault(); // Evita cualquier acción predeterminada para Ctrl + Espacio
            return;
        }

        if (event.key === 'Enter') {
            let inputValue = inputElement.value;

            if (inputValue.startsWith('=')) {
                const result = this.evaluateFormula(inputValue);
                console.log(result);
                if (result !== null) {
                    console.log('Input', this.maquinariasAgregadas[index]);
                    console.log('rowIndex', index);
                    this.maquinariasAgregadas[index][field] = result;
                    const pr = this.maquinariasAgregadas[index][field+'Formula'] ? this.maquinariasAgregadas[index][field+'Formula'] : '';
                    if(inputValue && pr) {
                         const referenciasPrevias = this.separarIDMaquinaria(pr, field);
                         const referenciasNuevas = this.separarIDMaquinaria(inputValue, field);
                         const id = inputElement.getAttribute('id');
                         this.eliminarReferenciasMaquinaria(referenciasPrevias, referenciasNuevas, id);
                        console.log(`🚀referencias:`,this.insumos);
                    }
                    console.log('lista de id de la formula', this.separarIDInsumo(pr, field));
                    console.log('Field',field)
                    this.storeFormulaMaquinaria(index, field, inputValue); // Almacena la fórmula
                    this.actualizarSubtotalMaquinaria(this.maquinariasAgregadas[index]);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'La fórmula  es inválida.',
                    });
                }
            }
        }
    }

    // Función para almacenar la fórmula
    storeFormulaRendimiento(rowIndex: number, field: string, formula: string) {
        const formulaField = `${field}Formula`; // Nombre del campo para almacenar la fórmula
        this.insumos[rowIndex][formulaField] = formula;
    }
    // Función para almacenar la fórmula
    storeFormulaMaquinaria(rowIndex: number, field: string, formula: string) {
        const formulaField = `${field}Formula`; // Nombre del campo para almacenar la fórmula
        this.maquinariasAgregadas[rowIndex][formulaField] = formula;
    }

    onCtrlClickRendimiento(event: MouseEvent, rowIndex: number, field: string) {
        const currentInput = event.target as HTMLInputElement;
        const index = rowIndex - 1;
        // Verifica si la tecla Shift está presionada durante el clic
        if (event.ctrlKey && this.lastSelectedInputRendimiento) {
            // Si el input actual es el mismo que el último seleccionado, no hacer nada
            if (currentInput === this.lastSelectedInputRendimiento) {
                return; // Salir de la función sin hacer nada
            }

            const valueToInsert = String(this.insumos[index][field]); // Asegúrate de que sea una cadena
            let currentValue = this.lastSelectedInputRendimiento.value;

            if (currentValue.startsWith('=')) {
                // Si valueToInsert comienza con '=', evalúa la fórmula
                if (valueToInsert.startsWith('=')) {
                    const result = this.evaluateFormula(valueToInsert);
                    if (result !== null) {
                        this.ngZone.run(() => {
                            this.lastSelectedInputRendimiento!.value = currentValue + result;

                            this.updateReferencesInsumo(this.lastSelectedInputRendimiento, currentInput, field);

                            this.lastSelectedInputRendimiento.focus();
                            this.lastSelectedInputRendimiento.dispatchEvent(
                                new Event('input', { bubbles: true })
                            );
                            this.cdr.detectChanges();

                            setTimeout(() => {
                                this.lastSelectedInputRendimiento!.focus();
                            }, 0);
                        });
                    } else {
                        // Manejo de error o valor nulo
                        console.error('Error al evaluar la fórmula.');
                    }
                } else {
                    // Si valueToInsert no comienza con '=', concatena el valor directamente
                    this.ngZone.run(() => {
                        this.lastSelectedInputRendimiento!.value = currentValue +'$'+ currentInput.getAttribute('id')+'$';
                        // this.lastSelectedInputRendimiento!.value = currentValue + valueToInsert;
                        this.updateReferencesInsumo(this.lastSelectedInputRendimiento, currentInput, field);
                        this.lastSelectedInputRendimiento.focus();
                        this.lastSelectedInputRendimiento.dispatchEvent(
                            new Event('input', { bubbles: true })
                        );
                        this.cdr.detectChanges();

                        setTimeout(() => {
                            this.lastSelectedInputRendimiento!.focus();
                        }, 0);
                    });
                }
            }
        } else {
            // Actualiza el último input seleccionado
            this.lastSelectedInputRendimiento = currentInput;
        }
    }

    eliminarReferenciasInsumo(referenciasPrevias: string[], referenciasActuales: string[], inputID: string){
        referenciasPrevias.forEach(id => {
            if(!referenciasActuales.includes(id)){
                const {rowIndex, formField} = this.getFromIDInsumo(id);

                const referenciasField = this.insumos[rowIndex][formField + 'Referencias'];
                const index = referenciasField.indexOf(inputID);

                if (index > -1) {
                    const modelo: Referencia = {
                        rece_Referencia: inputID,
                        rece_Tipo: id,
                        acet_Id: this.acet_Id
                    }
                    this.eliminarReferencia(modelo).then(res =>{
                        console.log('dentro del eliminar referenicaaaaaaaa😒',res)
                        if(res.data.codeStatus > 0){
                            referenciasField.splice(index, 1);

                        }
                    })
                }
            }
        });
    }

    separarIDInsumo(formula: string, field: string){
        console.log('Form',formula)
        const partes = formula.split('$');
        let traduccion = [];
        partes.forEach(part => { part.includes(field) ? traduccion.push(part) : '';
        });
        return traduccion;
    }

    traducirFormulaInsumo(formulaWithIds: string): string {
        const partes = formulaWithIds.split('$');
        let traduccion = '';

        partes.forEach(part => {
            const element = document.getElementById(part) as HTMLInputElement;
            if (element) {
                // Si existe el input en el DOM, obtiene su valor
                traduccion += element.value;
            } else {
                // Si no es un input (es un operador o número), lo concatena
                traduccion += part;
            }
        });

        return traduccion;
    }

    getFromIDInsumo(id: string){
        const item = id.replace(/[^\d.]/g, '');
        // const formField = id.replace(/\d./g, '');
        const formField = id.replace(/\d+/g, ''); // Cambiamos la expresión regular
        console.log('Id',id);
        console.log('Item',item);
        console.log('FormfILED',formField)
        const rowIndex = this.insumos.findIndex( obj => obj.codigo == item)

        return {rowIndex: rowIndex, formField: formField}
    }

    updateReferencesInsumo(referencingInput: HTMLInputElement, referencedInput: HTMLInputElement, field: string) {
        const referencingId = referencingInput.getAttribute('id');
        console.log("🚀 ~ updateReferencesInsumo ~ referencingId:", referencingId)
        const referencedId = referencedInput.getAttribute('id');
        console.log("🚀 ~ updateReferencesInsumo ~ referencedId:", referencedId)
        const {rowIndex, formField} = this.getFromIDInsumo(referencedId)
        console.log('Prueba',rowIndex, formField);
        console.log(`🚀 referencias de ${formField} en indice ${rowIndex}:`, this.insumos[rowIndex][formField+'Referencias'])

        if (referencingId && referencedId) {
            if (!this.insumos[rowIndex][formField+'Referencias']) {
                this.insumos[rowIndex][formField+'Referencias'] = []
            }

            // Añadir el input que referencia al array de referencias
            if (!this.insumos[rowIndex][formField+'Referencias'].includes(referencingId)) {
                if(this.acet_Id){
                    const modelo: Referencia = {
                        rece_Referencia: referencingId,
                        rece_Tipo: referencedId,
                        acet_Id: this.acet_Id,
                        usua_Creacion: parseInt(this.cookieService.get('usua_Id'))
                    }
                    console.log("🚀 ~ updateReferencesInsumo ~ antes de enviar la referencia:", modelo)

                    this.insertarReferencia(modelo).then(data =>{
                        console.log('data',data)
                        if(data.data.codeStatus > 0){
                            this.insumos[rowIndex][formField+'Referencias'].push(referencingId)
                            console.log("🚀 ~ this.insertarReferencia ~ this.insumos[rowIndex][formField+'Referencias']:", this.insumos[rowIndex][formField+'Referencias'])
                        }
                    })
                }
            }
        }
    }

    // Función para evaluar la fórmula y actualizar los inputs referenciados
    evaluarPropagarInsumo(row: any, field: string) {
        // Aquí llamamos a una función que evalúa la fórmula
        const ref = row[field+'Referencias']
        console.log('resultado evaluar propagar', ref)
        console.log('Field', field + row.codigo)
        const idActual =  field + row.codigo;
        console.log('Primer Insumos', this.insumos)
        console.log(`😒😒referencias del ${idActual}`, ref)

            this.ngZone.run(() => {
                // No necesitamos reasignar manualmente el valor del input
                    ref.forEach(referencingId => {
                        const referencingInput = document.getElementById(referencingId) as HTMLInputElement;
                        const {rowIndex, formField} = this.getFromIDInsumo(referencingId)
                         const formula = this.insumos[rowIndex][formField+'Formula'];

                        // const formula = row[field + 'Referencias'];
                        console.log('formula',formula)
                        const result = this.evaluateFormula(formula);
                        if(result != null){
                            // Actualizamos el valor de los inputs que dependen del resultado
                            referencingInput.value = result.toString();
                            this.evaluarPropagarInsumo(this.insumos[rowIndex],formField);
                            this.insumos[rowIndex][formField] = referencingInput.value;
                            this.actualizarCostoUnitario(this.insumos[rowIndex]);
                        }
                    });

                // Detecta los cambios en la vista para que Angular los refleje
                this.cdr.detectChanges();
            });

    }

    onCtrlClickMaquinaria(event: MouseEvent, rowIndex: number, field: string) {
        const currentInput = event.target as HTMLInputElement;
        const index = rowIndex - 1;
        // Verifica si la tecla Shift está presionada durante el clic
        if (event.ctrlKey && this.lastSelectedInputMaquinaria) {
            // Si el input actual es el mismo que el último seleccionado, no hacer nada
            if (currentInput === this.lastSelectedInputMaquinaria) {
                return; // Salir de la función sin hacer nada
            }

            const valueToInsert = String(
                this.maquinariasAgregadas[index][field]
            ); // Asegúrate de que sea una cadena
            let currentValue = this.lastSelectedInputMaquinaria.value;

            if (currentValue.startsWith('=')) {
                // Si valueToInsert comienza con '=', evalúa la fórmula
                if (valueToInsert.startsWith('=')) {
                    const result =
                        this.evaluateFormula(valueToInsert).toFixed(2);
                    if (result !== null) {
                        this.ngZone.run(() => {
                            this.lastSelectedInputMaquinaria!.value = currentValue + result;
                            this.updateReferencesMaquinaria(this.lastSelectedInputMaquinaria, currentInput, field);
                            this.lastSelectedInputMaquinaria.focus();
                            this.lastSelectedInputMaquinaria.dispatchEvent(
                                new Event('input', { bubbles: true })
                            );
                            this.cdr.detectChanges();

                            setTimeout(() => {
                                this.lastSelectedInputMaquinaria!.focus();
                            }, 0);
                        });
                    } else {
                        // Manejo de error o valor nulo
                        console.error('Error al evaluar la fórmula.');
                    }
                } else {
                    // Si valueToInsert no comienza con '=', concatena el valor directamente
                    this.ngZone.run(() => {
                        this.lastSelectedInputMaquinaria!.value = currentValue +'$'+ currentInput.getAttribute('id')+'$';
                        // this.lastSelectedInputMaquinaria!.value = currentValue + valueToInsert;
                        this.updateReferencesMaquinaria(this.lastSelectedInputMaquinaria, currentInput, field);
                        this.lastSelectedInputMaquinaria.focus();
                        this.lastSelectedInputMaquinaria.dispatchEvent(
                            new Event('input', { bubbles: true })
                        );
                        this.cdr.detectChanges();

                        setTimeout(() => {
                            this.lastSelectedInputMaquinaria!.focus();
                        }, 0);
                    });
                }
            }
        } else {
            // Actualiza el último input seleccionado
            this.lastSelectedInputMaquinaria = currentInput;
        }
    }
    eliminarReferenciasMaquinaria(referenciasPrevias: string[], referenciasActuales: string[], inputID: string){
        referenciasPrevias.forEach(id => {
            if(!referenciasActuales.includes(id)){
                const {rowIndex, formField} = this.getFromIDMaquinaria(id);

                const referenciasField = this.maquinariasAgregadas[rowIndex][formField + 'Referencias'];
                const index = referenciasField.indexOf(inputID);

                if (index > -1) {
                    const modelo: Referencia = {
                        rece_Referencia: inputID,
                        rece_Tipo: id,
                        acet_Id: this.acet_Id
                    }
                    this.eliminarReferencia(modelo).then(res =>{
                        console.log('dentro del eliminar referenicaaaaaaaa😒',res)
                        if(res.data.codeStatus > 0){
                            referenciasField.splice(index, 1);

                        }
                    })
                }
            }
        });
    }


    separarIDMaquinaria(formula: string, field: string){
        console.log('Form',formula)
        const partes = formula.split('$');
        let traduccion = [];
        partes.forEach(part => { part.includes(field) ? traduccion.push(part) : '';
        });
        return traduccion;
    }

    traducirFormulaMaquinaria(formulaWithIds: string): string {
        const partes = formulaWithIds.split('$');
        let traduccion = '';

        partes.forEach(part => {
            const element = document.getElementById(part) as HTMLInputElement;
            if (element) {
                // Si existe el input en el DOM, obtiene su valor
                traduccion += element.value;
            } else {
                // Si no es un input (es un operador o número), lo concatena
                traduccion += part;
            }
        });

        return traduccion;
    }

    getFromIDMaquinaria(id: string){
        const item = id.replace(/[^\d.]/g, '');
        // const formField = id.replace(/\d./g, '');
        const formField = id.replace(/\d+/g, ''); // Cambiamos la expresión regular
        console.log('Id',id);
        console.log('Item',item);
        console.log('FormfILED',formField)
        const rowIndex = this.maquinariasAgregadas.findIndex( obj => obj.codigo == item)

        return {rowIndex: rowIndex, formField: formField}
    }

    updateReferencesMaquinaria(referencingInput: HTMLInputElement, referencedInput: HTMLInputElement, field: string) {
        const referencingId = referencingInput.getAttribute('id');
        const referencedId = referencedInput.getAttribute('id');
        const {rowIndex, formField} = this.getFromIDMaquinaria(referencedId)
        console.log('Prueba',rowIndex, formField);
        console.log(`🚀 referencias de ${formField} en indice ${rowIndex}:`, this.maquinariasAgregadas[rowIndex][formField+'Referencias'])

        if (referencingId && referencedId) {
            if (!this.maquinariasAgregadas[rowIndex][formField+'Referencias']) {
                this.maquinariasAgregadas[rowIndex][formField+'Referencias'] = []
            }

            // Añadir el input que referencia al array de referencias
            if (!this.maquinariasAgregadas[rowIndex][formField+'Referencias'].includes(referencingId)) {
                if(this.acet_Id){
                    const modelo: Referencia = {
                        rece_Referencia: referencingId,
                        rece_Tipo: referencedId,
                        acet_Id: this.acet_Id,
                        usua_Creacion: parseInt(this.cookieService.get('usua_Id'))
                    }
                    this.insertarReferencia(modelo).then(data =>{
                        console.log('data',data)
                        if(data.data.codeStatus > 0){
                            this.maquinariasAgregadas[rowIndex][formField+'Referencias'].push(referencingId)
                        }
                    })
                }
            }
        }
    }

    // Función para evaluar la fórmula y actualizar los inputs referenciados
    evaluarPropagarMaquinaria(row: any, field: string) {
        // Aquí llamamos a una función que evalúa la fórmula
        const ref = row[field+'Referencias']
        console.log('resultado evaluar propagar', ref)

            this.ngZone.run(() => {
                // No necesitamos reasignar manualmente el valor del input
                    ref.forEach(referencingId => {
                        const referencingInput = document.getElementById(referencingId) as HTMLInputElement;
                        const {rowIndex, formField} = this.getFromIDMaquinaria(referencingId)
                        console.log('Insumos', this.maquinariasAgregadas);
                        console.log('Index',rowIndex)
                         const formula = this.maquinariasAgregadas[rowIndex][formField+'Formula'];
                        console.log('row',row);
                        console.log('field',field);
                        console.log('Formu1', row[field + 'Formula'])
                        // const formula = row[field + 'Referencias'];
                        console.log('formula',formula)
                        const result = this.evaluateFormula(formula);

                        console.log('maquinarias',this.maquinariasAgregadas[rowIndex])
                        if(result != null){
                            // Actualizamos el valor de los inputs que dependen del resultado
                            referencingInput.value = result.toString();
                            // Propaga cambios recursivamente en los inputs que dependen del actual
                        this.evaluarPropagarMaquinaria(this.maquinariasAgregadas[rowIndex],formField);
                        this.maquinariasAgregadas[rowIndex][formField] = referencingInput.value;
                        this.actualizarSubtotalMaquinaria(this.maquinariasAgregadas[rowIndex]);
                        }
                    });

                // Detecta los cambios en la vista para que Angular los refleje
                this.cdr.detectChanges();
            });

    }


    // Nueva función para restaurar la fórmula en el input
    restoreFormulaRendimiento(
        rowIndex: number,
        field: string,
        inputElement: HTMLInputElement
    ) {
        const formulaField = `${field}Formula`; // Campo de fórmula correspondiente, p.ej. 'cantFormula'
        const formula = this.insumos[rowIndex][formulaField];

        if (formula) {
            inputElement.value = formula; // Restaura la fórmula en el input
            inputElement.setSelectionRange(formula.length, formula.length); // Coloca el cursor al final de la fórmula restaurada

            // Fuerza una actualización para que el input procese el valor restaurado
            const event = new Event('input', { bubbles: true });
            inputElement.dispatchEvent(event);
        }
    }

    restoreFormulaMaquinaria(
        rowIndex: number,
        field: string,
        inputElement: HTMLInputElement
    ) {
        const formulaField = `${field}Formula`; // Campo de fórmula correspondiente, p.ej. 'cantFormula'
        const formula = this.maquinariasAgregadas[rowIndex][formulaField];

        if (formula) {
            inputElement.value = formula; // Restaura la fórmula en el input
            inputElement.setSelectionRange(formula.length, formula.length); // Coloca el cursor al final de la fórmula restaurada

            // Fuerza una actualización para que el input procese el valor restaurado
            const event = new Event('input', { bubbles: true });
            inputElement.dispatchEvent(event);
        }
    }

    // Nueva función para restaurar la fórmula en el input
    restoreFormula(
        rowIndex: number,
        field: string,
        inputElement: HTMLInputElement
    ) {
        const formulaField = `${field}Formula`; // Campo de fórmula correspondiente, p.ej. 'cantFormula'
        const formula = this.prueba[rowIndex][formulaField];

        if (formula) {
            inputElement.value = formula; // Restaura la fórmula en el input
            inputElement.setSelectionRange(formula.length, formula.length); // Coloca el cursor al final de la fórmula restaurada

            // Fuerza una actualización para que el input procese el valor restaurado
            const event = new Event('input', { bubbles: true });
            inputElement.dispatchEvent(event);
        }
    }

    onShiftClick(event: MouseEvent, rowIndex: number, field: string) {
        const currentInput = event.target as HTMLInputElement; // Obtiene el input actual en el que se hizo clic.

        // Verifica si la tecla Ctrl está presionada durante el clic y si hay un input previamente seleccionado.
        if (event.ctrlKey && this.lastSelectedInput) {
            // Si el input actual es el mismo que el último seleccionado, no hacer nada.
            if (currentInput === this.lastSelectedInput) {
                return; // Salir de la función sin hacer cambios.
            }

            // Obtiene el valor del campo especificado (field) de la fila correspondiente (rowIndex).
            const valueToInsert = String(this.prueba[rowIndex][field]); // Convierte el valor a una cadena para asegurar compatibilidad.
            let currentValue = this.lastSelectedInput.value; // Obtiene el valor del último input seleccionado.

            // Verifica si el valor del input actual empieza con '=' y termina en un operador matemático.
            if (currentValue.startsWith('=')) {
                // Si el valor a insertar también comienza con '=', se evalúa como fórmula.
                if (valueToInsert.startsWith('=')) {
                    // Llama a la función que evalúa la fórmula.
                    const result = this.evaluateFormula(valueToInsert);

                    // Si el resultado de la evaluación es válido (no es nulo).
                    if (result !== null) {
                        this.ngZone.run(() => {
                            // Concatena el resultado de la fórmula al valor del input y lo actualiza.
                            this.lastSelectedInput!.value = currentValue + result;
                            this.updateReferences(this.lastSelectedInput, currentInput, field);

                            console.log('enderson')

                            // Refuerza que el foco regrese al input actualizado.
                            this.lastSelectedInput.focus();

                            // Dispara manualmente el evento 'input' para notificar el cambio.
                            this.lastSelectedInput.dispatchEvent(
                                new Event('input', { bubbles: true })
                            );

                            // Detecta cambios en la vista para asegurar que el valor actualizado se refleje.
                            this.cdr.detectChanges();

                            // Asegura que el foco se mantenga en el input luego de un breve delay.
                            setTimeout(() => {
                                this.lastSelectedInput!.focus();
                            }, 0);
                        });
                    } else {
                        // Si ocurre un error en la evaluación de la fórmula, lo registra en la consola.
                        console.error('Error al evaluar la fórmula.');
                    }
                } else {
                    // Si el valor a insertar no es una fórmula, simplemente lo concatena al valor actual.
                    this.ngZone.run(() => {
                        this.lastSelectedInput!.value = currentValue +'$'+ currentInput.getAttribute('id')+'$';

                        //actualizo las referencias
                        this.updateReferences(this.lastSelectedInput, currentInput, field);

                        this.lastSelectedInput.focus();

                        // Dispara el evento 'input' y detecta cambios en la vista.
                        this.lastSelectedInput.dispatchEvent(
                            new Event('input', { bubbles: true })
                        );
                        this.cdr.detectChanges();

                        // Asegura que el foco se mantenga en el input.
                        setTimeout(() => {
                            this.lastSelectedInput!.focus();
                        }, 0);
                    });
                }
            }
        } else {
            // Si no se presionó Ctrl o no hay un input previamente seleccionado,
            // actualiza el último input seleccionado al actual.
            this.lastSelectedInput = currentInput;
            // this.ultimoInput = currentInput.value;
        }
    }

    eliminarReferencias(referenciasPrevias: string[], referenciasActuales: string[], inputID: string){
        referenciasPrevias.forEach(id => {
            if(!referenciasActuales.includes(id)){
                const {rowIndex, formField} = this.getFromID(id);

                const referenciasField = this.prueba[rowIndex][formField + 'Referencias'];
                const index = referenciasField.indexOf(inputID);

                if (index > -1) {
                    const modelo: Referencia = {
                        rece_Referencia: inputID,
                        rece_Tipo: formField,
                        acet_Id: this.prueba[rowIndex]['acetId']
                    }
                    this.eliminarReferencia(modelo).then(res =>{
                        console.log('dentro del eliminar referenicaaaaaaaa😒',res)
                        if(res.data.codeStatus > 0){
                            referenciasField.splice(index, 1);

                        }
                    })
                }
            }
        });
    }

    separarID(formula: string, field: string){
        console.log('Form',formula)
        const partes = formula.split('$');
        let traduccion = [];
        partes.forEach(part => { part.includes(field) ? traduccion.push(part) : '';
        });
        return traduccion;
    }

    traducirFormula(formulaWithIds: string): string {
        const partes = formulaWithIds.split('$');
        let traduccion = '';

        partes.forEach(part => {
            const element = document.getElementById(part) as HTMLInputElement;
            if (element) {
                // Si existe el input en el DOM, obtiene su valor
                traduccion += element.value;
            } else {
                // Si no es un input (es un operador o número), lo concatena
                traduccion += part;
            }
        });

        return traduccion;
    }

    getFromID(id: string){
        const item = id.replace(/[^\d.]/g, '');
        const formField = id.replace(/\d./g, '');

        const rowIndex = this.prueba.findIndex( obj => obj.item == item)

        return {rowIndex: rowIndex, formField: formField}
    }

    updateReferences(referencingInput: HTMLInputElement, referencedInput: HTMLInputElement, field: string) {
        const referencingId = referencingInput.getAttribute('id');
        const referencedId = referencedInput.getAttribute('id');
        const {rowIndex, formField} = this.getFromID(referencedId)
        console.log(`🚀 referencias de ${formField} en indice ${rowIndex}:`, this.prueba[rowIndex][formField+'Referencias'])

        if (referencingId && referencedId) {
            if (!this.prueba[rowIndex][formField+'Referencias']) {
                this.prueba[rowIndex][formField+'Referencias'] = []
            }

            // Añadir el input que referencia al array de referencias
            if (!this.prueba[rowIndex][formField+'Referencias'].includes(referencingId)) {
                if(this.prueba[rowIndex]['acetId']){
                    const modelo: Referencia = {
                        rece_Referencia: referencingId,
                        rece_Tipo: field,
                        acet_Id: this.prueba[rowIndex]['acetId'],
                        usua_Creacion: parseInt(this.cookieService.get('usua_Id'))
                    }
                    this.insertarReferencia(modelo).then(data =>{
                        console.log('data',data)
                        if(data.data.codeStatus > 0){
                            this.prueba[rowIndex][formField+'Referencias'].push(referencingId)
                        }
                    })
                }
            }
        }
    }

    // Función para evaluar la fórmula y actualizar los inputs referenciados
    evaluarPropagar(row: any, field: string) {
        // Aquí llamamos a una función que evalúa la fórmula
        const idActual = field + row.item;
        const ref = row[field+'Referencias']
        // console.log('la fila', row)
        // console.log('el campo', field)
        // console.log(`😒😒referencias del ${idActual}`, ref)

            this.ngZone.run(() => {
                    ref.forEach(referencingId => {
                        const referencingInput = document.getElementById(referencingId) as HTMLInputElement;
                        const {rowIndex, formField} = this.getFromID(referencingId)
                         const formula = this.prueba[rowIndex][formField+'Formula'];
                        // const formula = row[field + 'Referencias'];
                        // console.log('formula',formula)
                        // console.log('dentro del foreach row', this.prueba[rowIndex])
                        const result = this.evaluateFormula(formula);
                        console.log('Referencia Input Inicio',referencingInput.value);
                        console.log('FormFiled',formField);
                        console.log('Material', this.prueba[rowIndex].material);


                        // Actualizamos el valor de los inputs que dependen del resultado
                        if(result != null){
                            referencingInput.value = result.toFixed(2).toString();
                            console.log('RESULTADO',result.toFixed(2).toString());
                            // this.prueba[rowIndex].materialUtili = this.prueba[rowIndex].material;
                            // Propaga cambios recursivamente en los inputs que dependen del actual
                            this.prueba[rowIndex][formField] = referencingInput.value;
                            this.prueba[rowIndex].materialUtili = this.prueba[rowIndex].material
                            this.onValueChange(this.prueba[rowIndex], rowIndex);
                            if(referencingInput.id.startsWith('material')){
                                console.log('El input actualizando es material')
                                this.prueba[rowIndex].materialUtili = this.prueba[rowIndex].material
                            }
                            console.log('Referencia Input',referencingInput);
                            this.evaluarPropagar(this.prueba[rowIndex],formField);
                        }

                        console.log('MaterialFinal', this.prueba[rowIndex].material);
                        console.log('MaterialUtiliFinal', this.prueba[rowIndex].materialUtili);
                    });

                // Detecta los cambios en la vista para que Angular los refleje
                this.cdr.detectChanges();
            });

    }


    // Función para evaluar la fórmula
    evaluateFormula(formula: string): number | null {
        try {
            //  return eval(formula.substring(1)); // Ejecuta la fórmula quitando el '='

            return evaluate(this.traducirFormula(formula).substring(1)).toFixed(2); // Ejecuta la fórmula quitando el '='
        } catch {
            return null;
        }
    }

    // Función para almacenar la fórmula
    storeFormula(rowIndex: number, field: string, formula: string) {
        const formulaField = `${field}Formula`; // Nombre del campo para almacenar la fórmula
        this.prueba[rowIndex][formulaField] = formula;
    }

    // Método en tu componente
    async GuardarDeta() {
        try {
            this.loading = true;
            // 1. Insertar todas las etapas
            const filasAInsertarEtapa = this.prueba
                .filter((row) => row.esEtapa)
                // .filter((row) => row.esEtapa && !row.etpr_Id)
                .sort((a, b) => parseFloat(a.item) - parseFloat(b.item)); // Ordenar por item para asegurar el orden correcto

            const foundProyecto = this.proyectoOptions.find(
                (proyecto) => proyecto.proy_Id === this.form.value.proy_Id
            );
            let etpr_Estado = false;
            if (foundProyecto.espr_Id == 1) {
                etpr_Estado = true;
            }
            console.log(foundProyecto, 'foundProyecto');
            console.log(this.prueba, 'this.prueba');
            console.log(filasAInsertarEtapa, 'filasAInsertarEtapa');

            if(filasAInsertarEtapa.length > 0){
                for (const etapaRow of filasAInsertarEtapa) {
                    const ModeloEtapa = {
                        etap_Id: etapaRow.etap_Id,
                        empl_Id: 2,
                        proy_Id: foundProyecto.proy_Id,
                        etpr_Estado: etpr_Estado,
                        usua_Creacion: this.usua_Id,
                    };
                    console.log('Modelo',ModeloEtapa)
                    if(ModeloEtapa.etap_Id){
                        const response = await this.etapaporproyectoService.Insertar(
                            ModeloEtapa
                        );
                        if (response.code === 200) {
                            etapaRow.etpr_Id = response.data.codeStatus; // Asignar el ID devuelto a la etapa
                            console.log(
                                `Etapa ${etapaRow.item} asignada con etpr_Id: ${etapaRow.etpr_Id}`
                            );

                            // Asignar el etpr_Id a todas las actividades de la misma etapa
                            this.prueba.forEach((row) => {
                                if (
                                    row.item.startsWith(etapaRow.item.split('.')[0]) &&
                                    !row.esEtapa
                                ) {
                                    row.etpr_Id = etapaRow.etpr_Id;
                                }
                            });
                        }
                    }

                }
            }
            console.log('PÁSA INSERTAR ETAPAS');
            

            // 2. Insertar todas las actividades
            await this.insertarActividades();

            console.log('PASA INSERTAR ACTIVIDADES');

            // 3. Insertar los detalles del presupuesto
            const prueba = await this.insertarPresupuestoDetalle();
            
            console.log('Respuesta prueba', prueba)
            
            await this.listarPresupuesto(); // Actualizar la lista de presupuesto

            console.log('PASA LISTAR PRESUPUESTOS');
            

            this.loading = false;
            this.Create = false;
            this.Index = true;

            if(prueba){
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Insertado con Éxito.',
                });
            }

        } catch (error) {
            // this.messageService.add({
            //     severity: 'error',
            //     summary: 'Error',
            //     detail: 'Ocurrió un error al guardar los datos: ' + error,
            // });
        }
    }

    async insertarActividades() {
        const filasAInsertar = this.prueba.filter(
            (row) => !row.esEtapa && !row.id
        );

        if (filasAInsertar.length > 0) {
            for (const currentRow of filasAInsertar) {
                let acti_Id;
                const foundActividad = this.actividadOptions.find(
                    (actividad) =>
                        actividad.acti_Descripcion.toLowerCase().trim() ===
                        currentRow.descripcion.toLowerCase().trim()
                );
                if (foundActividad) {
                    acti_Id = foundActividad.acti_Id;
                }
                let unidad;
                const foundUnidad = this.listunidades.find(
                    (unidad) =>
                        unidad.unme_Nomenclatura.toLowerCase().trim() ===
                        currentRow.unidad.toLowerCase().trim()
                );
                if (foundUnidad) {
                    unidad = foundUnidad.unme_Id;
                }
                const foundProyecto = this.proyectoOptions.find(
                    (proyecto) => proyecto.proy_Id === this.form.value.proy_Id
                );
                console.log(foundProyecto, 'foundProyecto en insertar ACtividades');
            
                let acet_Estado = foundProyecto.espr_Id == 1;
                let acet_FechaFin = new Date();
                acet_FechaFin.setDate(acet_FechaFin.getDate() + 1);

                const ModeloActividadPorEtapa = {
                    acet_Cantidad: parseFloat(currentRow.cant) || 0,
                    acet_PrecioManoObraEstimado:
                        parseFloat(currentRow.manoDeObra) || 0,
                    acti_Id: acti_Id,
                    empl_Id: 2,
                    acet_Observacion: 'N/A',
                    acet_FechaInicio: new Date(),
                    acet_FechaFin: acet_FechaFin,
                    unme_Id: unidad,
                    etpr_Id: currentRow.etpr_Id,
                    usua_Creacion: this.usua_Id,
                    acet_Estado: acet_Estado,
                };
                let insumosAgregados = [];
                await this.service
                    .ListarInsumosPorAcitividad(currentRow.acetId)
                    .then((data: any) => {
                        insumosAgregados = data;
                    });
                let maquinariasAgregadas = [];
                await this.service
                    .ListarMaquinariasPorAcitividad(currentRow.acetId)
                    .then((data: any) => {
                        maquinariasAgregadas = data;
                    });
                console.log(ModeloActividadPorEtapa)
                const response = await this.actividadPorEtapaService.Insertar(
                    ModeloActividadPorEtapa
                );
                if (response.code == 200) {
                    currentRow.acetId = response.data.codeStatus; // Actualizar el ID de la actividad
                    this.InsertarInsumosLlenado(
                        currentRow.acetId,
                        insumosAgregados
                    );
                    this.InsertarMaquinariasLlenado(
                        currentRow.acetId,
                        maquinariasAgregadas
                    );
                    currentRow.verification = true;
                    console.log(
                        `Actividad insertada con acet_Id: ${currentRow.acetId}`
                    );
                }
            }

            console.log(
                'Todas las actividades han sido insertadas correctamente.'
            );
        }
    }

    getParsedNumber(number: any): number {
        return parseFloat(number);
    }

    async insertarPresupuestoDetalle() {
        const filasAInsertar = this.prueba.filter(
            (row) => !row.esEtapa && !row.id
        );

        console.log(filasAInsertar, 'filas a insertar');
        
        const filasActualizar = this.prueba.filter(
            (row) => !row.esEtapa && row.id
        );

        console.log(filasActualizar, 'filas a actualizar');

        if(filasActualizar.length > 0){
            for (const row of filasActualizar) {
                let acti_Id;
                const foundActividad = this.actividadOptions.find(
                    (actividad) =>
                        actividad.acti_Descripcion.toLowerCase().trim() ===
                        row.descripcion.toLowerCase().trim()
                );
                if (foundActividad) {
                    acti_Id = foundActividad.acti_Id;
                }
                let unidad;
                const foundUnidad = this.listunidades.find(
                    (unidad) =>
                        unidad.unme_Nomenclatura.toLowerCase().trim() ===
                        row.unidad.toLowerCase().trim()
                );
                if (foundUnidad) {
                    unidad = foundUnidad.unme_Id;
                }
                // const materialUtilidad = row.material;
                // console.log('MaterialUtilidad', materialUtilidad)
                const Modelo = {
                    pdet_Id: row.id,
                    pdet_Cantidad: parseFloat(row.cant) || 0,
                    pdet_PrecioManoObra: parseFloat(row.manoDeObra) || 0,
                    pdet_PrecioMateriales: parseFloat(row.materialUtili) || 0,
                    pdet_PrecioMaquinaria: parseFloat(row.maquinaria) || 0,
                    unme_Id: unidad,
                    pren_Id: this.pren_Id,
                    pdet_ManoObraFormula: row.manoDeObraFormula,
                    pdet_MaterialFormula: row.materialFormula,
                    pdet_MaquinariaFormula: row.maquinariaFormula,
                    pdet_CantidadFormula: row.cantFormula,
                    acet_Id: row.acetId,
                    pdet_Incluido: row.esIsv,
                    pdet_Ganancia: row.porcen,
                    usua_Modificacion: this.usua_Id,
                };
                console.log('Modelo',Modelo)
                    const response = await this.presupuestodetalleservice.Actualizar(
                        Modelo
                    );
                    if (response.code == 200) {
                       console.log('Actualizado con exito', response);
                    }
            }
            return true;
        }
        if (filasAInsertar.length > 0) {
            for (const row of filasAInsertar) {
                let acti_Id;
                const foundActividad = this.actividadOptions.find(
                    (actividad) =>
                        actividad.acti_Descripcion.toLowerCase().trim() ===
                        row.descripcion.toLowerCase().trim()
                );
                if (foundActividad) {
                    acti_Id = foundActividad.acti_Id;
                }
                let unidad;
                const foundUnidad = this.listunidades.find(
                    (unidad) =>
                        unidad.unme_Nomenclatura.toLowerCase().trim() ===
                        row.unidad.toLowerCase().trim()
                );
                if (foundUnidad) {
                    unidad = foundUnidad.unme_Id;
                }
                const Modelo = {
                    pren_Id: this.pren_Id,
                    pdet_Cantidad: parseFloat(row.cant) || 0,
                    pdet_PrecioManoObra: parseFloat(row.manoDeObra) || 0,
                    pdet_PrecioMateriales: parseFloat(row.materialUtili) || 0,
                    pdet_PrecioMaquinaria: parseFloat(row.maquinaria) || 0,
                    unme_Id: unidad,
                    pdet_ManoObraFormula: row.manoDeObraFormula,
                    pdet_MaterialFormula: row.materialFormula,
                    pdet_MaquinariaFormula: row.maquinariaFormula,
                    pdet_CantidadFormula: row.cantFormula,
                    acet_Id: row.acetId,
                    pdet_Incluido: row.esIsv,
                    pdet_Ganancia: row.porcen,
                    usua_Creacion: this.usua_Id,
                };
                console.log('Modelo',Modelo)
                if(Modelo.acet_Id){
                    const response = await this.presupuestodetalleservice.Insertar(
                        Modelo
                    );
                    if (response.code == 200) {
                        row.id = response.message;
                        row.verification = true;
                    }
                }

            }

            console.log(
                'Todos los detalles del presupuesto han sido insertados correctamente.'
            );
            return true;
        }
        else{
            return false;
        }
    }

    updateOriginalValues(row: any) {
        if (!this.originalValues[row.item]) {
            this.originalValues[row.item] = {
                manoDeObra: parseFloat(row.manoDeObra) || 0,
                material: parseFloat(row.material) || 0,
            };
        } else {
            this.originalValues[row.item].manoDeObra =
                parseFloat(row.manoDeObra) || 0;
            this.originalValues[row.item].material =
                parseFloat(row.material) || 0;
        }
    }
    resetToOriginalValues() {
        this.prueba.forEach((row) => {
            if (!row.esEtapa) {
                if (this.originalValues[row.item]) {
                    row.manoDeObra =
                        this.originalValues[row.item].manoDeObra.toFixed(2);
                    row.material =
                        this.originalValues[row.item].material.toFixed(2);
                }
            }
        });
    }

    onValueChange(row: any, rowIndex: number, field?: string) {
        let value = row[field]
        if(!isNaN(value)){
            if(value > 999)
                row[field] = 999
            else if(value < 0)
                row[field] = 1
        }
        if (!isNaN(value)) {
            this.evaluarPropagar(row, field);
        }
        this.updateOriginalValues(row);
        this.actualizarTotales(row, rowIndex);
        this.calcularPU(row, rowIndex);
    }

    actualizarTotales(rowData: any, rowIndex: number) {
        if (!rowData.esEtapa) {
            const etapaItem = rowData.item.split('.')[0];
            const etapa = this.prueba.find(
                (row) => row.item === `${etapaItem}.00`
            );
            if (etapa) {
                etapa.manoDeObra = this.prueba
                    .filter(
                        (row) =>
                            row.item.startsWith(`${etapaItem}.`) && !row.esEtapa
                    )
                    .reduce(
                        (sum, actividad) =>
                            sum + (parseFloat(actividad.manoDeObra) || 0),
                        0
                    )
                    .toFixed(2);

                etapa.maquinaria = this.prueba
                    .filter(
                        (row) =>
                            row.item.startsWith(`${etapaItem}.`) && !row.esEtapa
                    )
                    .reduce(
                        (sum, actividad) =>
                            sum + (parseFloat(actividad.maquinaria) || 0),
                        0
                    )
                    .toFixed(2);

                etapa.material = this.prueba
                    .filter(
                        (row) =>
                            row.item.startsWith(`${etapaItem}.`) && !row.esEtapa
                    )
                    .reduce(
                        (sum, actividad) =>
                            sum + (parseFloat(actividad.material) || 0),
                        0
                    )
                    .toFixed(2);

                etapa.subtotalConIsv = this.prueba
                    .filter(
                        (row) =>
                            row.item.startsWith(`${etapaItem}.`) && !row.esEtapa
                    )
                    .reduce(
                        (sum, actividad) =>
                            sum + (parseFloat(actividad.subtotalConIsv) || 0),
                        0
                    )
                    .toFixed(2);

                etapa.subtotalUtil = this.prueba
                    .filter(
                        (row) =>
                            row.item.startsWith(`${etapaItem}.`) && !row.esEtapa
                    )
                    .reduce(
                        (sum, actividad) =>
                            sum + (parseFloat(actividad.subtotalUtil) || 0),
                        0
                    )
                    .toFixed(2);

                etapa.cant = this.prueba
                    .filter(
                        (row) =>
                            row.item.startsWith(`${etapaItem}.`) && !row.esEtapa
                    )
                    .reduce(
                        (sum, actividad) =>
                            sum + (parseFloat(actividad.cant) || 0),
                        0
                    )
                    .toFixed(1);

                this.calcularPU(etapa, rowIndex);
            }
        }
    }

    async agregarConversion() {
        // Crear una nueva conversión con los valores iniciales
        const nuevaConversion = {
            pptc_Id: 0,
            taca_Id: 0,
            selectt: false,
            monedaDe: this.monedas[0].value, // Seleccionamos la primera moneda por defecto
            valorDe: 0,
            monedaA: '',
            valorA: 0,
            listaConversiones: [], // Inicialmente vacío
        };

        // Llamada al servicio para obtener las conversiones disponibles para la moneda seleccionada
        await this.presupuestotasaservice.ListarConversiones(nuevaConversion.monedaDe).then(
            (conversionesData: any[]) => {
                // Ordenar la lista de conversiones disponibles
                conversionesData.sort((a, b) => a.moneda_B.localeCompare(b.moneda_B));

                // Obtener las monedas ya seleccionadas en conversiones existentes
                const monedasSeleccionadas = this.conversiones.map(conv => conv.monedaA);

                // Filtrar la lista de conversiones para excluir las ya seleccionadas
                nuevaConversion.listaConversiones = conversionesData
                    .filter(convItem => !monedasSeleccionadas.includes(convItem.taca_Id)) // Excluir monedas ya seleccionadas
                    .map(convItem => ({
                        label: convItem.moneda_B,
                        value: convItem.taca_Id,
                    }));
                    console.log(nuevaConversion.listaConversiones);
                    if(!nuevaConversion.listaConversiones.length){
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Advertencia',
                            detail: 'No hay conversiones disponibles.',
                            life: 3000,
                        });
                        return
                    }
                     const foundConversion = conversionesData.find(
                         (conv) => conv.taca_Id == nuevaConversion.listaConversiones[0].value
                     );

                // Preseleccionar la primera opción disponible en monedaA
                if (nuevaConversion.listaConversiones.length > 0) {
                    nuevaConversion.monedaA = nuevaConversion.listaConversiones[0].value;
                    nuevaConversion.valorDe = foundConversion.taca_ValorA;
                    nuevaConversion.valorA = foundConversion.taca_ValorB;
                    nuevaConversion.taca_Id = foundConversion.taca_Id;
                    console.log('NuevaConversión', nuevaConversion);
                }

                // Agregar la nueva conversión a la lista principal
                this.conversiones.push(nuevaConversion);
                // this.onChange({ value: nuevaConversion.monedaA },0);
                this.actualizarListasDeConversiones();
            },
            (error) => {
                console.error('Error fetching conversiones:', error);
            }
        );
    }


    async GuardarInsumos() {
        const registrosFiltrados = this.prueba.filter(
            (item) => item.acetId === this.acet_Id
        );
        const insumosSinGuardar = this.insumos.filter(
            (row) => row.estado === 'Sin Guardar');

        if (registrosFiltrados[0].id) {

            console.log(insumosSinGuardar)
            const response = this.InsertarInsumosLlenado(this.acet_Id,insumosSinGuardar);
          console.log(response)
          registrosFiltrados[0].material = this.materialInsumo;
            this.ActualizarDetalle(registrosFiltrados[0]);
            this.Create = true;
            this.agregarInsumos = false;
            if(response){
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Insertado con Éxito.',
                    life: 3000,
                });
            }
        }
    }

    async GuardarMaquinarias() {
        const registrosFiltrados = this.prueba.filter(
            (item) => item.acetId === this.acet_Id
        );
        const maquinariasSinGuardar = this.maquinariasAgregadas.filter(
            (row) => row.estado === 'Sin Guardar');

        if (registrosFiltrados[0].id) {

           const response = this.InsertarMaquinariasLlenado(this.acet_Id,maquinariasSinGuardar);

           await this.ActualizarDetalle(registrosFiltrados[0]);
           registrosFiltrados[0].maquinaria = this.maquinariaInsumo;
            this.Create = true;
            this.agregarInsumos = false;

            if(response){
                if(response){
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Insertado con Éxito.',
                        life: 3000,
                    });
                }

                // this.maquinariaCalculo = true;

                // this.calcularSubtotal
            }
        }
    }

    async ActualizarDetalle(rowData: any) {
        let acti_Id;
        const foundActividad = this.actividadOptions.find(
            (actividad) =>
                actividad.acti_Descripcion.toLowerCase().trim() ===
                rowData.descripcion.toLowerCase().trim()
        );
        if (foundActividad) {
            acti_Id = foundActividad.acti_Id;
        }
        console.log(acti_Id);
        let unidad;
        const foundUnidad = this.listunidades.find(
            (unidad) =>
                unidad.unme_Nomenclatura.toLowerCase().trim() ===
                rowData.unidad.toLowerCase().trim()
        );
        if (foundUnidad) {
            unidad = foundUnidad.unme_Id;
        }
        let acetId = rowData.acetId;
        if (!acetId) {
            acetId = rowData.acetIdLlenado;
        }
        const Modelo = {
            pdet_Id: rowData.id || 0,
            acti_Id: acti_Id,
            acet_Id: acetId,
            pdet_Cantidad: parseFloat(rowData.cant) || 0,
            unme_Id: unidad,
            pren_Id: this.pren_Id,
            pdet_Incluido: rowData.esIsv,
            pdet_Ganancia: rowData.porcen,
            pdet_PrecioManoObra: parseFloat(rowData.manoDeObra) || 0,
            pdet_PrecioMateriales: parseFloat(rowData.materialUtili) || 0,
            pdet_PrecioMaquinaria: parseFloat(rowData.maquinaria) || 0,
            usua_Modificacion: this.usua_Id,
        };
        await this.presupuestodetalleservice.Actualizar(Modelo).then(
            (response) => {
                if (response.code == 200) {
                    console.log('Detalle actualizado con exito');
                }
            },
            (error) => {}
        );
    }

    quitarFilaConversion() {
        this.selectEliminarConversion = true;
    }

    //   Cerrar Form
    async cerrarFormulario() {
        this.Titulo = '';
        this.Create = false;
        this.Index = true;
        this.checked = false;
        this.checked3 = false;
        this.checked2 = false;
        this.tipoImpresion = '';
        this.agregarInsumos = false;
        this.imprimirConte = false;
        this.Detail = false;
        this.proyectoInsumo = '';
        this.submitted = false;
        this.proyectoInsumo = '';
        this.listarPresupuesto();
    }
    //   Cerrar Form
    cerrarFormularioPdf() {
        if(this.proyectoInsumo){
            this.agregarInsumos = true;
        }
        else if(this.Titulo){
            this.Create = true;
            this.Index = false;
            this.agregarInsumos = false;
            this.imprimirConte = false;
            this.Detail = false;
            this.proyectoInsumo = '';
            this.submitted = false;
        }
        else{
            this.Index = true;
        }

        // Limpia el contenedor del PDF y oculta el PDF
        const pdfContainer = document.getElementById('pdfContainer');
        if (pdfContainer) {
            pdfContainer.innerHTML = '';
            this.isPdfVisible = false;
            this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
        }
    }

    CrearPresupuesto() {
        this.form.reset();
        this.submitted = false;
        const today = new Date();
        this.form.patchValue({
            pren_Fecha: today,
        });
        this.isTab2Disabled = true;
        this.Titulo = 'Nuevo Presupuesto';
        this.opcion = 'Guardar';
        this.Index = false;
        this.ModalImpuesto = true;
        this.Create = true;
        // this.listarProyectos();
        this.agregarInsumos = false;
        this.activeIndex = 0;
        this.insertado = false;
        // this.listarActividadesDeProyecto(51);
        this.formateoVariables();
        this.form.patchValue({ empleado: this.empleadoDNI });
        this.form.get('pren_PorcentajeGanancia')?.enable();
        this.ValorImpuesto = this.impuesto;

        if(this.proyectoOptions.length <= 0 && this.loadingProyecto){
            this.loading = true;
        }
    }

    selectUnidadMedida(unidadMedida: any) {
        this.llenadoPresupuesto = unidadMedida;
    }
    PresupuestoEstado(opcion: string) {
        this.presupuestoNombre = this.llenadoPresupuesto.pren_Titulo;
        this.pren_Id = this.llenadoPresupuesto.pren_Id;
        this.proy_Id = this.llenadoPresupuesto.proy_Id;
        if (opcion === 'Aprobado') {
            this.presupuestoOpcion = 'aprobado';
        } else {
            this.presupuestoOpcion = 'rechazado';
        }
        this.modalEstado = true;
    }

    async PresupuestoAprobadoORechazado() {
        if (this.presupuestoOpcion === 'aprobado') {
            console.log(this.presupuestoOptions, 'this.presupuestos despues de if aprobado');
            
            if (
                this.presupuestoOptions.filter
            ) {
                await this.service
                .PresupuestoAprobado(this.pren_Id, this.proy_Id)
                .then(
                    (response) => {
                        if (response.code == 200) {
                            this.modalEstado = false;
                            this.pren_Id = 0;
                            this.proy_Id = 0;
                            this.listarPresupuesto();
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: 'Aprobado con Éxito.',
                                life: 3000,
                            });
                        }
                    },
                    (error) => {
                        console.log(error);
                    }
                );
            }
        } else {
            this.modalRechazado = true;
            this.modalEstado = false;
        }
    }
    async PresupuestoRechazado() {
        if (this.formRechazado.valid) {
            const pren_Id = this.pren_Id;
            const pren_Observacion = this.formRechazado.value.pren_Observacion;
            const Modelo = {
                pren_Id: pren_Id,
                pren_Observacion: pren_Observacion,
            };
            await this.service.PresupuestoRechazado(Modelo).then(
                (response) => {
                    if (response.code == 200) {
                        this.pren_Id = 0;
                        this.modalRechazado = false;
                        this.listarPresupuesto();
                        this.formRechazado.reset();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Rechazado con Éxito.',
                            life: 3000,
                        });
                    }
                },
                (error) => {
                    console.error('Error ' + error);
                }
            );
        } else {
            this.submitted = true;
        }
    }

    async clickOpcion() {
        console.log('Opción seleccionada:', this.tipoImpresion);

        // Costo Utiliario activa el valSwitch
        if (this.tipoImpresion === 'Utiliario') {
            this.valSwitch = true;
        } else if (this.tipoImpresion === 'Original') {
            this.valSwitch = false;
        } else if (this.tipoImpresion === 'Ambas') {
            // "Ambas" no modifica el switch, lo haremos manualmente en la impresión
            this.valSwitch = false; // Empezamos con el Costo Original
        }
    }
    disableRadioButtons: boolean = false;
    clienteseleccion() {
        if (this.checked3) { 
          // Si se selecciona "Imprimir para cliente"
          this.tipoImpresion = 'Ambas'; // Selecciona automáticamente "Costo Utilitario"
          this.disableRadioButtons = true; // Deshabilita los radio buttons
        } else {
          // Si se deselecciona "Imprimir para cliente"
          this.disableRadioButtons = false; // Habilita los radio buttons
        }
      }
    selectConversion(){
        // console.log('Select',this.checked);
    }  
    selectConversion2(){
        // console.log('Select2',this.checked2);
    }
    
    selectMaquinaria(){
        // console.log('Select',this.maquinariaCalculo);
    }

     async ImprimirIndex() {
        await this.listarConversiones(this.llenadoPresupuesto.pren_Id);
        this.tipoImpresion = '';
        this.ValorImpuesto = this.llenadoPresupuesto.pren_Impuesto;
        this.Titulo = '';
        this.ISV = 0;
        this.Subtotal = 0;
        this.Total = 0;
        this.TotalManoObra = 0;
        this.TotalMaquinaria = 0;
        this.TotalMaterial = 0;
        this.checked = false;
        this.checked2 = false;
        this.checked3 = false;
        this.opcionImprimir = true;   
    }

    async ImprimirIndex2() {
        const formattedDate = format(
            new Date(this.llenadoPresupuesto.pren_Fecha),
            'MMMM yyyy',
            {
                locale: es,
            }
        );
        this.opcionImprimir = false;
        this.fecha = this.capitalizeFirstLetter(formattedDate);
        this.maquinariaCalculo = this.llenadoPresupuesto.pren_Maquinaria;
        this.nombreSupervisor = this.llenadoPresupuesto.empleado;
        this.presupuestoNombre = this.llenadoPresupuesto.pren_Titulo;
        this.form.patchValue({pren_Titulo: this.llenadoPresupuesto.pren_Titulo});

        await this.ListarImprimir(this.llenadoPresupuesto.pren_Id);

        // Imprimir dependiendo de la opción seleccionada
        if (this.tipoImpresion === 'Ambas') {
            await this.printAmbas(); // Nueva función para manejar la impresión de ambas opciones
        } else {
            if (this.valSwitch) {
                await this.onValSwitchChange2(); // Si está activado el switch de utilitario
            }
                await this.printTab(); // Imprimir solo una de las opciones
            
        }

        this.Index = false;
    }

    private async printAmbas() {
        const doc = new jsPDF('landscape', 'mm', [279.4, 431.8]);

        if (this.checked3) {
            this.valSwitch = false; // Costo Original
            const columnsOriginal = this.getColumnsFromHtml(this.abreviaturaMonedaConversion);
            let bodyOriginal = this.getBodyFromData();

            await this.addPagesToDoc(doc, columnsOriginal, bodyOriginal, 'Costo');
        }
        else{
            // Imprimir el "Costo Original"
            this.valSwitch = false; // Costo Original
            const columnsOriginal = this.getColumnsFromHtml(this.abreviaturaMonedaConversion);
            let bodyOriginal = this.getBodyFromData();

            await this.addPagesToDoc(doc, columnsOriginal, bodyOriginal, 'Costo Original');

            // Añadir una nueva página para "Costo Utiliario"
            doc.addPage(); // Agregar nueva página
            this.valSwitch = true; // Costo Utiliario
            await this.onValSwitchChange2();
            const columnsUtiliario = this.getColumnsFromHtml(this.abreviaturaMonedaConversion);
            let bodyUtiliario = this.getBodyFromData2();
            await this.addPagesToDoc(doc, columnsUtiliario, bodyUtiliario, 'Costo Utiliario');
        }
        // Abre el PDF en el contenedor HTML
        this.openPdfInDiv(doc);
    }

    private async addPagesToDoc(doc: jsPDF, columns: string[], body: string[][], headerTitle: string) {
        const rowsPerPage = 9;
        let currentPage = 1;

        for (let i = 0; i < body.length; i += rowsPerPage) {
            const rowsForPage = body.slice(i, i + rowsPerPage);

            // Si no es la primera página, añade una nueva página
            if (i !== 0) {
                doc.addPage();
                currentPage++;
            }

            // Agrega el encabezado específico para cada costo
            this.addHeader(doc);

            // Genera la tabla con las filas para la página actual
            this.addTabContentToDoc(doc, columns, rowsForPage);

            // Pie de página con número de página
            this.addFooter(doc, currentPage);
        }

        // Añadir totales si estamos en la última página
        const finalY = (doc as any).lastAutoTable.finalY;
         this.addTotalsToDoc(doc, finalY, currentPage);
    }

    // private addTotalsToDoc(doc: jsPDF, finalY: number, currentPage: number) {
    //     const pageWidth = doc.internal.pageSize.getWidth(); // Obtén el ancho de la página
    //     const marginRight = 20; // Margen derecho para el Costo Original
    //     let marginRight2 = 110; // Margen derecho para el Costo Utiliario
    //     const impuesto = parseInt(this.ValorImpuesto); // Obtiene el valor del impuesto
    //     if(!this.checked){
    //         marginRight2 = 20;
    //     }
    //     let totalsConfig = [
    //         {
    //             label: 'MANO OBRA',
    //             value: `  ${this.abreviaturaMoneda} ${Number(this.TotalManoObra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //         },
    //         {
    //             label: 'MAQUINARIA',
    //             value: ` ${this.abreviaturaMoneda} ${Number(this.TotalMaquinaria).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //         },
    //         {
    //             label: 'MATERIAL',
    //             value: `   ${this.abreviaturaMoneda} ${Number(this.TotalMaterial).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //         },
    //         {
    //             label: 'SUBTOTAL',
    //             value: `   ${this.abreviaturaMoneda} ${Number(this.Subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //         },
    //         {
    //             label: 'TOTAL',
    //             value: `  ${this.abreviaturaMoneda} ${Number(this.Total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //         },
    //     ];

    //     let totalsConfig2 = [
    //         {
    //             label: 'MANO OBRA',
    //             value: `  ${this.abreviaturaMonedaConversion} ${Number(this.TotalManoObraUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //         },
    //         {
    //             label: 'MAQUINARIA',
    //             value: ` ${this.abreviaturaMonedaConversion} ${Number(this.TotalMaquinariaUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //         },
    //         {
    //             label: 'MATERIAL',
    //             value: `   ${this.abreviaturaMonedaConversion} ${Number(this.TotalMaterialUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //         },
    //         {
    //             label: 'SUBTOTAL',
    //             value: `   ${this.abreviaturaMonedaConversion} ${Number(this.SubtotalUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //         },
    //         {
    //             label: 'TOTAL',
    //             value: `  ${this.abreviaturaMonedaConversion} ${Number(this.TotalUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //         },
    //     ];
    //     if (this.valSwitch) {
    //         totalsConfig = [
    //             {
    //                 label: 'MANO OBRA',
    //                 value: `  ${this.abreviaturaMoneda} ${Number(this.TotalManoObra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //             },
    //             {
    //                 label: 'MAQUINARIA',
    //                 value: `  ${this.abreviaturaMoneda} ${Number(this.TotalMaquinaria).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //             },
    //             {
    //                 label: 'MATERIAL',
    //                 value: `  ${this.abreviaturaMoneda} ${Number(this.TotalMaterial).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //             },
    //             {
    //                 label: `ISV (${impuesto}%)`,
    //                 value: `  ${this.abreviaturaMoneda} ${Number(this.ISV).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //             },
    //             {
    //                 label: `GANANCIA (${this.defaultPorcentaje}%)`,
    //                 value: `  ${this.abreviaturaMoneda} ${Number(this.Ganancia).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //             },
    //             {
    //                 label: 'SUBTOTAL',
    //                 value: `  ${this.abreviaturaMoneda} ${Number(this.Subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //             },
    //             {
    //                 label: 'TOTAL',
    //                 value: `  ${this.abreviaturaMoneda} ${Number(this.Total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //             },
    //         ];

    //         totalsConfig2 = [
    //             {
    //                 label: 'MANO OBRA',
    //                 value: `  ${this.abreviaturaMonedaConversion} ${Number(this.TotalManoObraUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //             },
    //             {
    //                 label: 'MAQUINARIA',
    //                 value: `  ${this.abreviaturaMonedaConversion} ${Number(this.TotalMaquinariaUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //             },
    //             {
    //                 label: 'MATERIAL',
    //                 value: `  ${this.abreviaturaMonedaConversion} ${Number(this.TotalMaterialUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //             },
    //             {
    //                 label: `ISV (${impuesto}%)`,
    //                 value: `  ${this.abreviaturaMonedaConversion} ${Number(this.ISVUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //             },
    //             {
    //                 label: `GANANCIA (${this.defaultPorcentaje}%)`,
    //                 value: `  ${this.abreviaturaMonedaConversion} ${Number(this.GananciaUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //             },
    //             {
    //                 label: 'SUBTOTAL',
    //                 value: `  ${this.abreviaturaMonedaConversion} ${Number(this.SubtotalUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //             },
    //             {
    //                 label: 'TOTAL',
    //                 value: `  ${this.abreviaturaMonedaConversion} ${Number(this.TotalUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //             },
    //         ];
    //     }
    private addTotalsToDoc(doc: jsPDF, finalY: number, currentPage: number) {
        const pageWidth = doc.internal.pageSize.getWidth(); // Obtén el ancho de la página
        const labelX = 20; // Posición para las etiquetas, cerca del margen izquierdo
        const valueX = 100; // Posición para los valores, ajustado para alinearse correctamente
        const lineHeight = 10;finalY += 20; 
        const labelX2 = pageWidth / 2 + 30; // Posición para las etiquetas de moneda de conversión a la derecha
        const valueX2 = pageWidth - 80; 
        const column1X = 20// Ajusta según necesites
        const column2X = pageWidth / 2 + 10; 
        const marginRight = 20; // Margen derecho para el Costo Original
        let marginRight2 = 110; // Margen derecho para el Costo Utiliario
        const impuesto = parseInt(this.ValorImpuesto); // Obtiene el valor del impuesto
        // if(!this.checked){
        //     marginRight2 = 20;
        // }
    
        const applyCheck2Multiplier = (value: number): number => {
            return this.checked2 ? value * 1.15 : value; 
        };
        const applyCheck2Multiplier2 = (value: number): number => {
            return this.checked2 ? value * 0.15 : value; 
        };
    
        let totalsConfig = [
            ...(!this.checked3 ? [
                {
                    label: 'MANO OBRA :',
                    value: `  ${this.abreviaturaMoneda} ${Number(this.TotalManoObra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                },
                {
                    label: 'MAQUINARIA :',
                    value: ` ${this.abreviaturaMoneda} ${Number(this.TotalMaquinaria).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                },
                {
                    label: 'MATERIAL :',
                    value: `   ${this.abreviaturaMoneda} ${Number(this.TotalMaterial).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                }
            ] : []),
            {
                label: 'SUBTOTAL :',
                value: `   ${this.abreviaturaMoneda} ${Number(this.Subtotal + this.TotalMaquinaria).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
            ...(this.checked2 ? [{
                label: `ISV (${impuesto}%) :`,
                value: `  ${this.abreviaturaMoneda} ${(Number(this.Subtotal)* 0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            }] : []),
            {
                label: 'TOTAL :',
                value: `  ${this.abreviaturaMoneda} ${(Number((this.Subtotal + this.TotalMaquinaria) * 1.15)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
        ];
       
        let totalsConfig2 = [
            ...(!this.checked3 ? [
                {
                    label: 'MANO OBRA :',
                    value: `  ${this.abreviaturaMonedaConversion} ${Number(this.TotalManoObraUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                },
                {
                    label: 'MAQUINARIA :',
                    value: ` ${this.abreviaturaMonedaConversion} ${Number(this.TotalMaquinariaUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                },
                {
                    label: 'MATERIAL :',
                    value: `   ${this.abreviaturaMonedaConversion} ${Number(this.TotalMaterialUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                }
            ] : []),
            {
                label: 'SUBTOTAL :',
                value: `   ${this.abreviaturaMonedaConversion} ${(Number(this.SubtotalUSD)+Number(this.TotalMaquinariaUSD)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
            ...(this.checked2 ? [{
                label: `ISV (${impuesto}%) :`,
                value: `  ${this.abreviaturaMonedaConversion} ${((Number(this.SubtotalUSD)+Number(this.TotalMaquinariaUSD))* 0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            }] : []),
            {
                label: 'TOTAL :',
                value: `  ${this.abreviaturaMonedaConversion} ${(((Number(this.SubtotalUSD)+Number(this.TotalMaquinariaUSD))* 0.15)+(Number(this.SubtotalUSD)+Number(this.TotalMaquinariaUSD))).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
        ];
    
        if (this.valSwitch) {
            totalsConfig = [
                ...(!this.checked3 ? [
                    {
                        label: 'MANO OBRA :',
                        value: `  ${this.abreviaturaMoneda} ${Number(this.TotalManoObra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    },
                    {
                        label: 'MAQUINARIA :',
                        value: ` ${this.abreviaturaMoneda} ${Number(this.TotalMaquinaria).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    },
                    {
                        label: 'MATERIAL :',
                        value: `   ${this.abreviaturaMoneda} ${Number(this.TotalMaterial).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    },
                    {
                        label: `GANANCIA (${this.defaultPorcentaje}%) :`,
                        value: `  ${this.abreviaturaMoneda} ${Number(this.Ganancia).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    },
                ] : []),
              
                
                {
                    label: 'SUBTOTAL :',
                    value: `  ${this.abreviaturaMoneda} ${Number(this.subtotalUtil+ this.TotalMaquinaria).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                },
                ...(this.checked2 ? [{
                    label: `ISV (${impuesto}%) :`,
                    value: `  ${this.abreviaturaMoneda} ${(Number(this.subtotalUtil+ this.TotalMaquinaria)* 0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                }] : []),
                {
                    label: 'TOTAL :',
                    value: `  ${this.abreviaturaMoneda} ${(((this.subtotalUtil + this.TotalMaquinaria)  * 1.15)+ this.Ganancia).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                },
            ];
    
            totalsConfig2 = [
                ...(!this.checked3 ? [
                    {
                        label: 'MANO OBRA :',
                        value: `  ${this.abreviaturaMonedaConversion} ${Number(this.TotalManoObraUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    },
                    {
                        label: 'MAQUINARIA :',
                        value: ` ${this.abreviaturaMonedaConversion} ${Number(this.TotalMaquinariaUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    },
                    {
                        label: 'MATERIAL :',
                        value: `   ${this.abreviaturaMonedaConversion} ${Number(this.TotalMaterialUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    },
                    {
                        label: `GANANCIA (${this.defaultPorcentaje}%) :`,
                        value: `  ${this.abreviaturaMonedaConversion} ${Number(this.GananciaUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    }
                ] : []),
               
               
                {
                    label: 'SUBTOTAL :',
                    value: `  ${this.abreviaturaMonedaConversion} ${(Number(this.TotalManoObraUSD)+Number(this.TotalMaquinariaUSD)+Number(this.TotalMaterialUSD)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                },
                ...(this.checked2 ? [{
                    label: `ISV (${impuesto}%) :`,
                    value: `  ${this.abreviaturaMonedaConversion} ${((Number(this.TotalManoObraUSD)+Number(this.TotalMaquinariaUSD)+Number(this.TotalMaterialUSD))* 0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                }] : []),
                {
                    label: 'TOTAL :',
                    value: `  ${this.abreviaturaMonedaConversion} ${(((Number(this.TotalManoObraUSD)+Number(this.TotalMaquinariaUSD)+Number(this.TotalMaterialUSD))* 1.15)+Number(this.GananciaUSD)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                },
            ];
        }

        doc.setFontSize(12); // Tamaño de fuente para los totales
        totalsConfig.forEach((total, index) => {
            doc.text(total.label, labelX, finalY + index * lineHeight); // Imprimir la etiqueta en labelX
            doc.text(total.value, valueX, finalY + index * lineHeight); // Imprimir el valor en valueX
        });
        if (this.checked) {
            totalsConfig2.forEach((total, index) => {
                doc.text(total.label, labelX2, finalY + index * lineHeight); // Imprimir la etiqueta en labelX2 (derecha)
                doc.text(total.value, valueX2, finalY + index * lineHeight); // Imprimir el valor en valueX2 (derecha)
            });
        }
       
        // Ajustar el espaciado vertical si es necesario
        finalY += totalsConfig.length * lineHeight;
       
        // Imprimir los totales para Costo Original
        // doc.setFontSize(15); // Tamaño de fuente para los totales
        // totalsConfig.forEach((total, index) => {
        //     doc.text(
        //         `${total.label}: ${total.value}`,
        //         pageWidth - marginRight2,
        //         finalY + 13 + index * 10,
        //         { align: 'right' }
        //     ); // Dibuja los totales en el PDF
        // });

        // // Imprimir los totales para Costo Utiliario si está seleccionada la opción
        // if (this.checked) {
        //     totalsConfig2.forEach((total, index) => {
        //         doc.text(
        //             `${total.label}: ${total.value}`,
        //             pageWidth - marginRight,
        //             finalY + 13 + index * 10,
        //             { align: 'right' }
        //         ); // Dibuja los totales en el PDF
        //     });
        // }
    }



    async EditarPresupuesto() {
        this.formateoVariables();
        this.Titulo = 'Editar Presupuesto';
        this.opcion = 'Actualizar';
        this.Create = true;
        this.loading = true;
        this.valSwitch = false;
        this.isTab2Disabled = false;
        await this.listarActividades();
        this.Index = false;
        this.activeIndex = 0;
        const selectedDate = new Date(this.llenadoPresupuesto.pren_Fecha);
        const formattedDate = format(
            new Date(this.llenadoPresupuesto.pren_Fecha),
            'MMMM yyyy',
            {
                locale: es,
            }
        );
        this.fecha = this.capitalizeFirstLetter(formattedDate);
        console.log(this.llenadoPresupuesto.pren_Fecha);

        console.log('Presupuesto', this.llenadoPresupuesto);

        this.form.patchValue({
            pren_Titulo: this.llenadoPresupuesto.pren_Titulo,
            pren_Descripcion: this.llenadoPresupuesto.pren_Descripcion,
            pren_Fecha: selectedDate,
            empl_Id: this.empl_Id,
            clie_Id: this.clie_Id,
            empleado:
                this.llenadoPresupuesto.empleado +
                ' - ' +
                this.llenadoPresupuesto.empl_DNI,
            cliente:
                this.llenadoPresupuesto.cliente +
                ' - ' +
                this.llenadoPresupuesto.clie_DNI,
            proy_Id: this.llenadoPresupuesto.proy_Id,
            proyecto: this.llenadoPresupuesto.proyecto,
            pren_PorcentajeGanancia:
                this.llenadoPresupuesto.pren_PorcentajeGanancia,
        });
        this.pren_Id = this.llenadoPresupuesto.pren_Id;
        this.ValorImpuesto = this.llenadoPresupuesto.pren_Impuesto;
        this.ISV = this.ValorImpuesto;
        this.defaultPorcentaje =
            this.llenadoPresupuesto.pren_PorcentajeGanancia;
        this.maquinariaCalculo = this.llenadoPresupuesto.pren_Maquinaria;
        this.nombreSupervisor = this.llenadoPresupuesto.empleado;
        this.calculateAveragePercentage();

        await this.ListarPresuXConver(this.llenadoPresupuesto.pren_Id);
        await this.listarConversiones(this.pren_Id);
        await this.ListarDetalle(this.llenadoPresupuesto.pren_Id);
        this.form.get('pren_PorcentajeGanancia')?.disable();
        this.presupuestoNombre = this.llenadoPresupuesto.pren_Titulo;
        this.loading = false;
    }

    async ListarImprimir(id: number) {
        await this.presupuestodetalleservice.Listar(id).then(
            async (data: any) => {
                if (data.length > 0) {
                    console.log('SI ENTRO');
                    this.prueba = [];
                    this.populateTableImprimir(data);
                } else {
                    this.prueba = [
                        {
                            item: '1.00',
                            descripcion: '',
                            manoDeObraUtili: '0.00',
                            materialUtili: '0.00',
                            etpr_Id: 0,
                            subtotalUtil: '0.00',
                            puUtili: '0.00',
                            subtotalConIsv: '0.00',
                            puUSDUtili: '0.00',
                            etap_Id: 0,
                            maquinaria: '0.00',
                            subtotalUSDUtili: '0.00',
                            cant: '0.00',
                            Isv: '0.00',
                            unidad: '',
                            manoDeObra: '0.00',
                            material: '0.00',
                            esEtapa: true,
                            invalid: false,
                            pu: '0.00',
                            subtotal: '0.00',
                            puUSD: '0.00',
                            subtotalUSD: '0.00',
                        },
                        {
                            item: '1.01',
                            descripcion: '',
                            empl_Id: 0,
                            subtotalConIsv: '0.00',
                            unme_Id: 0,
                            cantFormula: '',
                            manoDeObraFormula: '',
                            acetIdLlenado: 0,
                            materialFormula: '',
                            manoDeObraUtili: '0.00',
                            maquinaria: '0.00',
                            isSwitchDisabled: false,
                            maquinariaFormula: '',
                            copc_Id: 0,
                            materialUtili: '0.00',
                            manoObraTotalUtili: '0.00',
                            materialTotalUtili: '0.00',
                            puUtili: '0.00',
                            subtotalUtil: '0.00',
                            etpr_Id: 0,
                            puUSDUtili: '0.00',
                            subtotalUSDUtili: '0.00',
                            manoObraTotal: '0.00',
                            materialTotal: '0.00',
                            cant: '0.00',
                            porcen: this.defaultPorcentaje,
                            Isv: '0.00',
                            esIsv: false,
                            unidad: '',
                            acetId: 0,
                            actiId: 0,
                            manoDeObra: '0.00',
                            material: '0.00',
                            maquinariaTotal: '0.00',
                            esEtapa: false,
                            expanded: false,
                            invalid: false,
                            id: 0,
                            verification: false,
                            pu: '0.00',
                            subtotal: '0.00',
                            puUSD: '0.00',
                            subtotalUSD: '0.00',
                            maquinariaReferencias: [],
                            cantReferencias: [],
                            manoDeObraReferencias: [],
                            materialReferencias: []
                        },
                    ];
                }
            },
            (error) => {
                console.error('Error' + error);
            }
        );
    }

    async ListarDetalle(id: number) {
        await this.presupuestodetalleservice.Listar(id).then(
            async (data: any) => {
                if (data.length > 0) {
                    console.log('SI ENTRO');
                    this.prueba = [];
                    this.populateTableEditar(data);
                } else {
                    this.prueba = [
                        {
                            item: '1.00',
                            descripcion: '',
                            manoDeObraUtili: '0.00',
                            materialUtili: '0.00',
                            etpr_Id: 0,
                            subtotalUtil: '0.00',
                            puUtili: '0.00',
                            subtotalConIsv: '0.00',
                            puUSDUtili: '0.00',
                            etap_Id: 0,
                            maquinaria: '0.00',
                            subtotalUSDUtili: '0.00',
                            cant: '0.00',
                            Isv: '0.00',
                            unidad: '',
                            manoDeObra: '0.00',
                            material: '0.00',
                            esEtapa: true,
                            invalid: false,
                            pu: '0.00',
                            subtotal: '0.00',
                            puUSD: '0.00',
                            subtotalUSD: '0.00',
                        },
                        {
                            item: '1.01',
                            descripcion: '',
                            empl_Id: 0,
                            subtotalConIsv: '0.00',
                            unme_Id: 0,
                            cantFormula: '',
                            manoDeObraFormula: '',
                            acetIdLlenado: 0,
                            materialFormula: '',
                            manoDeObraUtili: '0.00',
                            maquinaria: '0.00',
                            isSwitchDisabled: false,
                            maquinariaFormula: '',
                            copc_Id: 0,
                            materialUtili: '0.00',
                            manoObraTotalUtili: '0.00',
                            materialTotalUtili: '0.00',
                            puUtili: '0.00',
                            subtotalUtil: '0.00',
                            etpr_Id: 0,
                            puUSDUtili: '0.00',
                            subtotalUSDUtili: '0.00',
                            manoObraTotal: '0.00',
                            materialTotal: '0.00',
                            cant: '0.00',
                            porcen: this.defaultPorcentaje,
                            Isv: '0.00',
                            esIsv: false,
                            unidad: '',
                            acetId: 0,
                            actiId: 0,
                            manoDeObra: '0.00',
                            material: '0.00',
                            maquinariaTotal: '0.00',
                            esEtapa: false,
                            expanded: false,
                            invalid: false,
                            id: 0,
                            verification: false,
                            pu: '0.00',
                            subtotal: '0.00',
                            puUSD: '0.00',
                            subtotalUSD: '0.00',
                            maquinariaReferencias: [],
                            cantReferencias: [],
                            manoDeObraReferencias: [],
                            materialReferencias: []
                        },
                    ];
                }
            },
            (error) => {
                console.error('Error' + error);
            }
        );
    }

    async listarActividadesDeProyecto(id: number) {
        console.log('entra listar actividades de proyecto');
        
        await this.service.ListarActividadesProyecto(id).then(
            (data: any) => {
                if (data.length > 0) {
                    console.log('entra if de listar service');
                    console.log(data, 'data de if de listar service');
                    
                    this.populateTableProyecto(data);
                } else {
                    console.log('entra else de listar service');

                    this.prueba = [
                        {
                            item: '1.00',
                            descripcion: '',
                            manoDeObraUtili: '0.00',
                            materialUtili: '0.00',
                            etpr_Id: 0,
                            subtotalUtil: '0.00',
                            puUtili: '0.00',
                            subtotalConIsv: '0.00',
                            maquinaria: '0.00',
                            puUSDUtili: '0.00',
                            etap_Id: 0,
                            subtotalUSDUtili: '0.00',
                            cant: '0.00',
                            Isv: '0.00',
                            unidad: '',
                            manoDeObra: '0.00',
                            material: '0.00',
                            esEtapa: true,
                            invalid: false,
                            pu: '0.00',
                            subtotal: '0.00',
                            puUSD: '0.00',
                            subtotalUSD: '0.00',
                        },
                        {
                            item: '1.01',
                            descripcion: '',
                            empl_Id: 0,
                            subtotalConIsv: '0.00',
                            unme_Id: 0,
                            cantFormula: '',
                            expanded: false,
                            maquinaria: '0.00',
                            isSwitchDisabled: false,
                            maquinariaFormula: '',
                            copc_Id: 0,
                            manoDeObraFormula: '',
                            materialFormula: '',
                            manoDeObraUtili: '0.00',
                            materialUtili: '0.00',
                            manoObraTotalUtili: '0.00',
                            materialTotalUtili: '0.00',
                            puUtili: '0.00',
                            subtotalUtil: '0.00',
                            acetIdLlenado: 0,
                            etpr_Id: 0,
                            maquinariaTotal: '0.00',
                            puUSDUtili: '0.00',
                            subtotalUSDUtili: '0.00',
                            manoObraTotal: '0.00',
                            materialTotal: '0.00',
                            cant: '0.00',
                            porcen: this.defaultPorcentaje,
                            Isv: '0.00',
                            esIsv: false,
                            unidad: '',
                            acetId: 0,
                            actiId: 0,
                            manoDeObra: '0.00',
                            material: '0.00',
                            esEtapa: false,
                            invalid: false,
                            id: 0,
                            verification: false,
                            pu: '0.00',
                            subtotal: '0.00',
                            puUSD: '0.00',
                            subtotalUSD: '0.00',
                            maquinariaReferencias: [],
                            cantReferencias: [],
                            manoDeObraReferencias: [],
                            materialReferencias: []
                        },
                    ];
                }
            },
            (error) => {
                console.error('Error ' + error);
            }
        );
    }

    populateTable(data: any[]) {
        this.prueba = [];
        let etapaCounter = 1;
        let currentEtapaId = null;
        let activityCounter = 1;

        data.forEach(async (item) => {
            console.log(item.pdet_Id);
            console.log('ID Actividad', item.acti_Id, item.unme_Id);

            // Check if etapa already exists in the map
            if (item.etpr_Id !== currentEtapaId) {
                // If not, add the etapa row first
                currentEtapaId = item.etpr_Id;
                let etpr_Id = 0;
                if (this.pren_Id == item.pren_Id) {
                    etpr_Id = item.etpr_Id;
                }
                activityCounter = 1;
                const etapaRow = {
                    item: `${etapaCounter}.00`,
                    descripcion: item.etap_Descripcion,
                    cant: '0.00',
                    unidad: '',
                    manoDeObra: '0.00',
                    material: '0.00',
                    esEtapa: true,
                    invalid: false,
                    Isv: '0.00',
                    pu: '0.00',
                    manoDeObraUtili: '0.00',
                    maquinaria: '0.00',
                    materialUtili: '0.00',
                    subtotalUtil: '0.00',
                    etap_Id: item.etap_Id,
                    etpr_Id: etpr_Id,
                    puUtili: '0.00',
                    puUSDUtili: '0.00',
                    subtotalUSDUtili: '0.00',
                    subtotal: '0.00',
                    subtotalConIsv: '0.00',
                    puUSD: '0.00',
                    subtotalUSD: '0.00',
                };
                this.prueba.push(etapaRow);

                this.onValueChange(etapaRow, parseInt(etapaRow.item));
                etapaCounter++;
            }

            if (this.pren_Id == item.pren_Id) {
                console.log('Id Encabezado Iguales');
                const activityRow = {
                    item: `${etapaCounter - 1}.${activityCounter
                        .toString()
                        .padStart(2, '0')}`,
                    descripcion: item.acti_Descripcion,
                    cant: item.pdet_Cantidad.toFixed(2).toString(),
                    unidad: item.unme_Nomenclatura,
                    manoDeObra: item.pdet_PrecioManoObra.toFixed(2),
                    material: item.pdet_PrecioMateriales.toFixed(2),
                    esEtapa: false,
                    invalid: false,
                    id: item.pdet_Id,
                    acetId: item.acet_Id,
                    actiId: item.acti_Id,
                    verification: true,
                    unme_Id: item.unme_Id,
                    esIsv: item.pdet_Incluido,
                    etpr_Id: 0,
                    expanded: false,
                    empl_Id: 0,
                    pu: '0.00',
                    cantFormula: '',
                    manoDeObraFormula: '',
                    maquinariaTotal: '0.00',
                    materialFormula: '',
                    subtotal: '0.00',
                    manoObraTotal: '0.00',
                    maquinaria: item.pdet_PrecioMaquinaria.toFixed(2),
                    copc_Id: item.copc_Id,
                    maquinariaFormula: '',
                    materialTotal: '0.00',
                    porcen: item.pdet_Ganancia,
                    isSwitchDisabled: false,
                    Isv: '0.00',
                    puUSD: '0.00',
                    subtotalConIsv: '0.00',
                    subtotalUSD: '0.00',
                    manoDeObraUtili: '0.00',
                    materialUtili: item.pdet_PrecioMateriales,
                    manoObraTotalUtili: '0.00',
                    materialTotalUtili: '0.00',
                    acetIdLlenado: 0,
                    puUtili: '0.00',
                    subtotalUtil: '0.00',
                    puUSDUtili: '0.00',
                    subtotalUSDUtili: '0.00',
                    maquinariaReferencias: [],
                    cantReferencias: [],
                    manoDeObraReferencias: [],
                    materialReferencias: []
                };
                this.prueba.push(activityRow);
                this.onValueChange(activityRow, parseInt(activityRow.item));
                activityCounter++;
            } else {
                const activityRow = {
                    item: `${etapaCounter - 1}.${activityCounter
                        .toString()
                        .padStart(2, '0')}`,
                    descripcion: item.acti_Descripcion,
                    cant: item.pdet_Cantidad.toString(),
                    unidad: item.unme_Nomenclatura,
                    manoDeObra: item.pdet_PrecioManoObra,
                    material: item.pdet_PrecioMateriales,
                    esEtapa: false,
                    invalid: false,
                    id: 0,
                    acetId: item.acet_Id,
                    acetIdLlenado: item.acet_Id,
                    maquinaria: item.pdet_PrecioMaquinaria,
                    maquinariaFormula: '',
                    actiId: item.acti_Id,
                    verification: false,
                    pu: '0.00',
                    subtotal: '0.00',
                    unme_Id: item.unme_Id,
                    porcen: item.pdet_Ganancia,
                    etpr_Id: 0,
                    esIsv: item.pdet_Incluido,
                    copc_Id: item.copc_Id,
                    puUSD: '0.00',
                    empl_Id: 0,
                    cantFormula: '',
                    manoDeObraFormula: '',
                    expanded: false,
                    materialFormula: '',
                    manoObraTotal: '0.00',
                    materialTotal: '0.00',
                    Isv: '0.00',
                    subtotalConIsv: '0.00',
                    subtotalUSD: '0.00',
                    maquinariaTotal: '0.00',
                    isSwitchDisabled: false,
                    manoDeObraUtili: '0.00',
                    materialUtili: item.pdet_PrecioMateriales,
                    manoObraTotalUtili: '0.00',
                    materialTotalUtili: '0.00',
                    puUtili: '0.00',
                    subtotalUtil: '0.00',
                    puUSDUtili: '0.00',
                    subtotalUSDUtili: '0.00',
                    maquinariaReferencias: [],
                    cantReferencias: [],
                    manoDeObraReferencias: [],
                    materialReferencias: []
                };
                this.prueba.push(activityRow);
                this.onValueChange(activityRow, parseInt(activityRow.item));
                activityCounter++;
            }
        });
        this.reorderItems();
    }

    async populateTableEditar(data: any[]) {
        let etapaCounter = 1;
        let currentEtapaId = null;
        let activityCounter = 1;
        let listadoReferencias;
        await this.listarReferencias().then( data =>{
            listadoReferencias = data
            console.log("🚀 ~ dentro del then:", listadoReferencias)
        })
        console.log("🚀 ~ despues del then:", listadoReferencias)

        data.forEach(async (item) => {
            console.log(item.pdet_Id);
            console.log('ID Actividad', item.acti_Id, item.unme_Id);

            // Check if etapa already exists in the map
            if (item.etpr_Id !== currentEtapaId) {
                // If not, add the etapa row first
                currentEtapaId = item.etpr_Id;
                let etpr_Id = 0;
                if (this.pren_Id == item.pren_Id) {
                    etpr_Id = item.etpr_Id;
                }
                activityCounter = 1;
                const etapaRow = {
                    item: `${etapaCounter}.00`,
                    descripcion: item.etap_Descripcion,
                    cant: '0.00',
                    unidad: '',
                    manoDeObra: '0.00',
                    material: '0.00',
                    esEtapa: true,
                    invalid: false,
                    Isv: '0.00',
                    pu: '0.00',
                    manoDeObraUtili: '0.00',
                    maquinaria: '0.00',
                    materialUtili: '0.00',
                    subtotalUtil: '0.00',
                    etap_Id: item.etap_Id,
                    etpr_Id: etpr_Id,
                    puUtili: '0.00',
                    puUSDUtili: '0.00',
                    subtotalUSDUtili: '0.00',
                    subtotal: '0.00',
                    subtotalConIsv: '0.00',
                    puUSD: '0.00',
                    subtotalUSD: '0.00',
                };
                this.prueba.push(etapaRow);

                this.onValueChange(etapaRow, parseInt(etapaRow.item));
                etapaCounter++;
            }
            const activityRow = {
                item: `${etapaCounter - 1}.${activityCounter
                    .toString()
                    .padStart(2, '0')}`,
                descripcion: item.acti_Descripcion,
                cant: item.pdet_Cantidad.toFixed(2).toString(),
                unidad: item.unme_Nomenclatura,
                manoDeObra: item.pdet_PrecioManoObra.toFixed(2),
                material: item.pdet_PrecioMateriales.toFixed(2),
                esEtapa: false,
                invalid: false,
                id: item.pdet_Id,
                acetId: item.acet_Id,
                actiId: item.acti_Id,
                etpr_Id: item.etpr_Id,
                verification: true,
                maquinaria: item.pdet_PrecioMaquinaria.toFixed(2),
                maquinariaFormula: item.pdet_MaquinariaFormula,
                esIsv: item.pdet_Incluido,
                acetIdLlenado: 0,
                empl_Id: 0,
                unme_Id: item.unme_Id,
                copc_Id: item.copc_Id,
                pu: '0.00',
                manoObraTotal: '0.00',
                materialTotal: '0.00',
                subtotal: '0.00',
                porcen: item.pdet_Ganancia,
                Isv: '0.00',
                cantFormula: item.pdet_CantidadFormula,
                manoDeObraFormula: item.pdet_ManoObraFormula,
                materialFormula: item.pdet_MaterialFormula,
                expanded: false,
                puUSD: '0.00',
                subtotalUSD: '0.00',
                isSwitchDisabled: false,
                subtotalConIsv: '0.00',
                manoDeObraUtili: '0.00',
                maquinariaTotal: '0.00',
                materialUtili: item.pdet_PrecioMateriales,
                manoObraTotalUtili: '0.00',
                materialTotalUtili: '0.00',
                puUtili: '0.00',
                subtotalUtil: '0.00',
                puUSDUtili: '0.00',
                subtotalUSDUtili: '0.00',
                maquinariaReferencias: listadoReferencias.filter(lista => lista.acet_Id == item.acet_Id && lista.rece_Tipo == 'maquinaria' ? lista.rece_Referencia : '').map(obj => obj.rece_Referencia),
                cantReferencias: listadoReferencias.filter(lista => lista.acet_Id == item.acet_Id && lista.rece_Tipo == 'cant' ? lista.rece_Referencia : '').map(obj => obj.rece_Referencia),
                manoDeObraReferencias: listadoReferencias.filter(lista => lista.acet_Id == item.acet_Id && lista.rece_Tipo == 'manoDeObra' ? lista.rece_Referencia : '').map(obj => obj.rece_Referencia),
                materialReferencias: listadoReferencias.filter(lista => lista.acet_Id == item.acet_Id && lista.rece_Tipo == 'material' ? lista.rece_Referencia : '').map(obj => obj.rece_Referencia)
            };

            this.prueba.push(activityRow);
            this.onValueChange(activityRow, parseInt(activityRow.item));
            activityCounter++;
            this.recalcularGanancia();
            this.actualizarTotalesGenerales();
            if (this.Titulo == 'Detalle Presupuesto') {
                this.listarMaquinariasPorActividadDetalle(activityRow.acetId);

                this.listarInsumosPorActividadDetalle(activityRow.acetId);
            }
        });
        // this.reorderItems();
        this.calculateAveragePercentage();
        console.log('DESPUES DE LLENAR LISTAR', this.prueba)
    }

    async populateTableImprimir(data: any[]) {
        let etapaCounter = 1;
        let currentEtapaId = null;
        let activityCounter = 1;
        data.forEach(async (item) => {
            // Check if etapa already exists in the map
            if (item.etpr_Id !== currentEtapaId) {
                // If not, add the etapa row first
                currentEtapaId = item.etpr_Id;
                let etpr_Id = 0;
                if (this.pren_Id == item.pren_Id) {
                    etpr_Id = item.etpr_Id;
                }
                activityCounter = 1;
                const etapaRow = {
                    item: `${etapaCounter}.00`,
                    descripcion: item.etap_Descripcion,
                    cant: '0.00',
                    unidad: '',
                    manoDeObra: '0.00',
                    material: '0.00',
                    esEtapa: true,
                    invalid: false,
                    Isv: '0.00',
                    pu: '0.00',
                    manoDeObraUtili: '0.00',
                    maquinaria: '0.00',
                    materialUtili: '0.00',
                    subtotalUtil: '0.00',
                    etap_Id: item.etap_Id,
                    etpr_Id: etpr_Id,
                    puUtili: '0.00',
                    puUSDUtili: '0.00',
                    subtotalUSDUtili: '0.00',
                    subtotal: '0.00',
                    subtotalConIsv: '0.00',
                    puUSD: '0.00',
                    subtotalUSD: '0.00',
                };
                this.prueba.push(etapaRow);

                this.onValueChange(etapaRow, parseInt(etapaRow.item));
                etapaCounter++;
            }
            const activityRow = {
                item: `${etapaCounter - 1}.${activityCounter
                    .toString()
                    .padStart(2, '0')}`,
                descripcion: item.acti_Descripcion,
                cant: item.pdet_Cantidad.toString(),
                unidad: item.unme_Nomenclatura,
                manoDeObra: item.pdet_PrecioManoObra,
                material: item.pdet_PrecioMateriales,
                esEtapa: false,
                invalid: false,
                id: item.pdet_Id,
                acetId: item.acet_Id,
                actiId: item.acti_Id,
                etpr_Id: item.etpr_Id,
                verification: true,
                maquinaria: item.pdet_PrecioMaquinaria,
                maquinariaFormula: item.pdet_MaquinariaFormula,
                esIsv: item.pdet_Incluido,
                acetIdLlenado: 0,
                empl_Id: 0,
                unme_Id: item.unme_Id,
                copc_Id: item.copc_Id,
                pu: '0.00',
                manoObraTotal: '0.00',
                materialTotal: '0.00',
                subtotal: '0.00',
                porcen: item.pdet_Ganancia,
                Isv: '0.00',
                cantFormula: item.pdet_CantidadFormula,
                manoDeObraFormula: item.pdet_ManoObraFormula,
                materialFormula: item.pdet_MaterialFormula,
                expanded: false,
                puUSD: '0.00',
                subtotalUSD: '0.00',
                isSwitchDisabled: false,
                subtotalConIsv: '0.00',
                manoDeObraUtili: '0.00',
                maquinariaTotal: '0.00',
                materialUtili: item.pdet_PrecioMateriales,
                manoObraTotalUtili: '0.00',
                materialTotalUtili: '0.00',
                puUtili: '0.00',
                subtotalUtil: '0.00',
                puUSDUtili: '0.00',
                subtotalUSDUtili: '0.00',
                maquinariaReferencias:[],
                cantReferencias: [],
                manoDeObraReferencias: [],
                materialReferencias: []
            };

            this.prueba.push(activityRow);
            this.onValueChange(activityRow, parseInt(activityRow.item));
            activityCounter++;
            this.recalcularGanancia();
            this.actualizarTotalesGenerales();
        });
        // this.reorderItems();
        this.calculateAveragePercentage();
        console.log('DESPUES DE LLENAR LISTAR', this.prueba)
    }

    populateTableProyecto(data: any[]) {
        this.prueba = [];
        let etapaCounter = 1;
        let currentEtapaId = null;
        let activityCounter = 1;

        console.log(this.prueba, 'this.prueba en POPULATE TABLE PROYECTOO');
        

        data.forEach(async (item) => {
            console.log(item.pdet_Id);
            console.log('ID Actividad', item.acti_Id, item.unme_Id);

            if (item.etpr_Id !== currentEtapaId) {
                // Nueva etapa encontrada
                currentEtapaId = item.etpr_Id;
                activityCounter = 1; // Reinicia el contador de actividades para la nueva etapa

                const etapaRow = {
                    item: `${etapaCounter}.00`,
                    descripcion: item.etap_Descripcion,
                    cant: '0.00',
                    unidad: '',
                    manoDeObra: '0.00',
                    material: '0.00',
                    esEtapa: true,
                    invalid: false,
                    pu: '0.00',
                    manoDeObraUtili: '0.00',
                    materialUtili: '0.00',
                    etap_Id: item.etap_Id,
                    etpr_Id: 0,
                    subtotalUtil: '0.00',
                    maquinaria: '0.00',
                    puUtili: '0.00',
                    puUSDUtili: '0.00',
                    subtotalUSDUtili: '0.00',
                    subtotalConIsv: '0.00',
                    subtotal: '0.00',
                    Isv: '0.00',
                    puUSD: '0.00',
                    subtotalUSD: '0.00',
                    acet_FechaInicio: item.acet_FechaInicio, // Agregamos la fecha de inicio a la fila de etapa
                };

                this.prueba.push(etapaRow);
                this.onValueChange(etapaRow, parseInt(etapaRow.item));
                etapaCounter++;
            }

            // Ahora agregar la actividad correspondiente a la etapa actual
            const activityRow = {
                item: `${etapaCounter - 1}.${activityCounter
                    .toString()
                    .padStart(2, '0')}`,
                descripcion: item.acti_Descripcion,
                cant: item.acet_Cantidad.toString(),
                unidad: item.unme_Nomenclatura,
                manoDeObra: item.acet_PrecioManoObraEstimado,
                material: item.inpa_CostoInsumos,
                esEtapa: false,
                invalid: false,
                id: 0,
                acetId: 0,
                isSwitchDisabled: false,
                actiId: item.acti_Id,
                verification: false,
                etpr_Id: item.etpr_Id,
                unme_Id: item.unme_Id,
                empl_Id: 0,
                esIsv: false,
                pu: '0.00',
                manoObraTotal: '0.00',
                materialTotal: '0.00',
                subtotal: '0.00',
                maquinaria: '0.00',
                maquinariaFormula: '',
                porcen: this.defaultPorcentaje,
                Isv: '24.00',
                puUSD: '0.00',
                subtotalUSD: '0.00',
                manoDeObraUtili: '0.00',
                materialUtili: '0.00',
                manoObraTotalUtili: '0.00',
                subtotalConIsv: '0.00',
                expanded: false,
                materialTotalUtili: '0.00',
                puUtili: '0.00',
                subtotalUtil: '0.00',
                maquinariaTotal: '0.00',
                puUSDUtili: '0.00',
                acetIdLlenado: 0,
                cantFormula: '',
                copc_Id: item.copc_Id,
                manoDeObraFormula: '',
                materialFormula: '',
                subtotalUSDUtili: '0.00',
                maquinariaReferencias: [],
                cantReferencias: [],
                manoDeObraReferencias: [],
                materialReferencias: []
            };

            this.prueba.push(activityRow);
            this.onValueChange(activityRow, parseInt(activityRow.item));
            activityCounter++;
        });

        this.reorderItems();
    }

    GuardarInfo() {
        this.Index = true;
        this.Create = false;
        this.modalGuardarInfo = false;
        this.infoGuardad = true;
        this.listarPresupuesto();
    }
    NoGuardarInfo() {
        this.Index = true;
        this.Create = false;
        this.modalGuardarInfo = false;
        this.infoGuardad = false;
        this.listarPresupuesto();
    }
    Cancelar() {
        if (this.Titulo == 'Nuevo Presupuesto') {
            this.modalGuardarInfo = true;
        } else {
            this.Index = true;
            this.Create = false;
            this.infoGuardad = false;
            this.listarPresupuesto();
        }
    }
    CancelarEliminarConversion() {
        // this.conversiones.forEach()
        // Reordenar los códigos secuenciales después de eliminar
        this.conversiones.forEach((item) => {
            item.selectt = false; // Reasigna el código secuencialmente
        });
        this.opcionEliminarConversion = false;
    }

    ConfirmarEliminarConversion(conversion: any, event: any) {
        // this.nombreMonedaDe = conversion.
        // Filtra las monedas para obtener solo las que tienen mone_Id === 1
        if (event.checked) {
            const foundMoneda = this.monedas.find(
                (moneda) => moneda.value === 1
            );
            this.pptc_Id = conversion.pptc_Id;
            console.log('ID', this.pptc_Id);
            this.nombreMonedaDe = foundMoneda.label;
            console.log(foundMoneda);
            this.opcionEliminarConversion = true;
            const conversionesList = conversion.listaConversiones;
            const foundConversion = conversionesList.find(
                (item) => item.value === conversion.monedaA
            );
            console.log(foundConversion);
            this.nombreMonedaA = foundConversion.label;
            console.log(conversion.listaConversiones);
        }
    }
    async EliminarConversion() {
        await this.presupuestotasaservice.Eliminar(this.pptc_Id).then(
            (response) => {
                if (response.code == 200) {
                    if (this.conversiones.length > 1) {
                        this.opcionEliminarConversion = false;
                        this.selectEliminarConversion = false;
                        this.conversiones.pop();
                        this.actualizarListasDeConversiones();
                    } else {
                        alert('No se puede eliminar la última fila.');
                    }
                }
            },
            (error) => {}
        );
    }

    async ListarPresuXConver(id: number) {
        await this.service.ListarPresupuestoXTasa(id).then(
            async (data: any[]) => {
                console.log('Data Conversion', data);
                if (data.length > 0) {
                    this.conversiones = [];

                    // Recorremos los datos y añadimos la conversión a la lista
                    for (const item of data) {
                        const conversion = {
                            pptc_Id: item.pptc_Id,
                            taca_Id: item.taca_Id,
                            selectt: false,
                            monedaDe: item.moneId_A,
                            valorDe: parseFloat(item.taca_ValorA),
                            monedaA: item.taca_Id,
                            valorA: parseFloat(item.taca_ValorB),
                            listaConversiones: [], // Inicialmente vacío
                        };

                        // Llamada al servicio para obtener todas las conversiones de moneda
                        await this.presupuestotasaservice.ListarConversiones(conversion.monedaDe).then(
                            (conversionesData: any[]) => {
                                conversionesData.sort((a, b) => a.moneda_B.localeCompare(b.moneda_B));

                                // Guardamos todas las monedas seleccionadas en el array `conversiones`
                                const monedasSeleccionadas = this.conversiones.map(conv => conv.monedaA);

                                // Filtrar conversiones para excluir las monedas ya seleccionadas
                                conversion.listaConversiones = conversionesData
                                    .filter(convItem => !monedasSeleccionadas.includes(convItem.taca_Id))
                                    .map(convItem => ({
                                        label: convItem.moneda_B,
                                        value: convItem.taca_Id,
                                    }));

                                // Establecer monedaA según lo que ya viene en la data
                                const seleccionada = conversion.listaConversiones.find(
                                    (conv) => conv.value === conversion.monedaA
                                );
                                if (seleccionada) {
                                    conversion.monedaA = seleccionada.value;
                                }

                                // Agregar la conversión a la lista principal
                                this.conversiones.push(conversion);
                            },
                            (error) => {
                                console.error('Error fetching conversiones:', error);
                            }
                        );
                    }

                    // Actualizamos las listas de conversiones en todas las filas para asegurar que no se repitan monedas
                    this.actualizarListasDeConversiones();
                } else {
                    console.log('AQUI ES EL VACIO');
                    this.conversiones = [
                        {
                            pptc_Id: 0,
                            taca_Id: 0,
                            selectt: false,
                            monedaDe: '',
                            valorDe: 0,
                            monedaA: '',
                            valorA: 0,
                            listaConversiones: [],
                        },
                    ];
                }
            },
            (error) => {
                console.error('Error fetching conversiones:', error);
            }
        );
    }
    actualizarListasDeConversiones() {
        // Obtenemos todas las monedas seleccionadas actualmente
        const monedasSeleccionadas = this.conversiones.map(conv => conv.monedaA);

        // Actualizamos las listas de conversiones en cada fila, excluyendo las monedas ya seleccionadas
        this.conversiones.forEach((conversion) => {
            this.presupuestotasaservice.ListarConversiones(parseInt(conversion.monedaDe)).then(
                (conversionesData: any[]) => {
                    conversionesData.sort((a, b) => a.moneda_B.localeCompare(b.moneda_B));

                    conversion.listaConversiones = conversionesData
                        .filter(convItem => !monedasSeleccionadas.includes(convItem.taca_Id) || convItem.taca_Id === conversion.monedaA)
                        .map(convItem => ({
                            label: convItem.moneda_B,
                            value: convItem.taca_Id,
                        }));

                },
                (error) => {
                    console.error('Error fetching conversiones:', error);
                }
            );
        });

    }


    ModalEditar(){
        const empleado = this.form.value.empleado;
        const cliente = this.form.value.cliente;
        const proyecto = this.form.value.proyecto;
        let focusElement: any = null;

        if (proyecto) {
            const foundProyecto = this.proyectoOptions.find(
                (proyecto) =>
                    proyecto.proy_Nombre.toLowerCase().trim() ===
                    this.form.value.proyecto.toLowerCase().trim()
            );
            if (foundProyecto) {
                this.form.patchValue({ proy_Id: foundProyecto.proy_Id });
                this.submittedProyecto = false;

            } else {
                this.form.patchValue({ proy_Id: '' });
                this.submittedProyecto = true;
                focusElement = this.proyectoAutocomplete.toArray()
                .find((comp) => comp.id === `proyecto`);
                console.log('Auto',this.proyectoAutocomplete);
                console.log('Focus',focusElement);
            }
        }else{
            this.submittedProyecto = true;
            focusElement = this.proyectoAutocomplete.toArray()
            .find((comp) => comp.id === `proyecto`);
            console.log('Auto',this.proyectoAutocomplete);
            console.log('Focus',focusElement);
        }
        if(this.form.controls['pren_PorcentajeGanancia'].invalid){
            focusElement = this.gananciaInput.toArray()
            .find((comp) =>comp.nativeElement.id === `ganancia`);
        }
        if (cliente) {
            const foundCliente = this.clientes.find(
                (cliente) =>
                    cliente.cliente.toLowerCase().trim() ===
                    this.form.value.cliente.toLowerCase().trim()
            );

            if (foundCliente) {
                this.form.patchValue({ clie_Id: foundCliente.clie_Id });
                this.submittedCliente = false;

            } else {
                this.form.patchValue({ clie_Id: '' });
                this.submittedCliente = true;
                focusElement = this.clienteAutocomplete.toArray()
            .find((comp) => comp.id === `cliente`);
            }
        }else{
            this.submittedCliente = true;
            focusElement = this.clienteAutocomplete.toArray()
            .find((comp) => comp.id === `cliente`);
        }

        if (empleado) {
            const foundEmpleado = this.empleados.find(
                (empleado) =>
                    empleado.empleado.toLowerCase().trim() ===
                    this.form.value.empleado.toLowerCase().trim()
            );
            console.log(foundEmpleado);

            if (foundEmpleado) {
                console.log('Entro');
                this.form.patchValue({ empl_Id: foundEmpleado.empl_Id });
                this.submittedEmpleado = false;

            } else {
                this.form.patchValue({ empl_Id: '' });
                this.submittedEmpleado = true;
                focusElement = this.empleadoAutocomplete.toArray()
                .find((comp) => comp.id === `empleado`);

            }
        }else{
            this.submittedEmpleado = true;
            focusElement = this.empleadoAutocomplete.toArray()
            .find((comp) => comp.id === `empleado`);
        }
        if(this.form.controls['pren_Titulo'].invalid){
            focusElement = this.tituloInput.toArray()
            .find((comp) =>comp.nativeElement.id === `titulo`);
        }
        else if(this.form.controls['pren_Descripcion'].invalid){
            focusElement = this.descripcionInput.toArray()
            .find((comp) =>comp.nativeElement.id === `descripcion`);
        }
        // Focalizar el campo correspondiente automáticamente si es inválido
        if (focusElement) {
            setTimeout(() => {
                if (focusElement.inputEL) {
                    // Para AutoComplete de PrimeNG
                    focusElement.inputEL.nativeElement.focus();
                } else if (focusElement.nativeElement) {
                    focusElement.nativeElement.focus();
                }
            }, 0);
        }
        if (this.form.valid) {
            this.modalEditar = true;
        } else {
            this.submitted = true;
        }
    }

    async Guardar() {
        const empleado = this.form.value.empleado;
        const cliente = this.form.value.cliente;
        const proyecto = this.form.value.proyecto;
        let focusElement: any = null;

        if (proyecto) {
            const foundProyecto = this.proyectoOptions.find(
                (proyecto) =>
                    proyecto.proy_Nombre.toLowerCase().trim() ===
                    this.form.value.proyecto.toLowerCase().trim()
            );
            if (foundProyecto) {
                this.form.patchValue({ proy_Id: foundProyecto.proy_Id });
                this.submittedProyecto = false;

            } else {
                this.form.patchValue({ proy_Id: '' });
                this.submittedProyecto = true;
                focusElement = this.proyectoAutocomplete.toArray()
                .find((comp) => comp.id === `proyecto`);
                console.log('Auto',this.proyectoAutocomplete);
                console.log('Focus',focusElement);
            }
        }else{
            console.log('Enderso')
            this.submittedProyecto = true;
            focusElement = this.proyectoAutocomplete.toArray()
            .find((comp) => comp.id === `proyecto`);
            console.log('Auto',this.proyectoAutocomplete);
            console.log('Focus',focusElement);
        }
        console.log('Paso por aqui')
        // if(this.form.controls['pren_PorcentajeGanancia'].invalid){
        // console.log('Ganancia Vacia',this.gananciaInput.toArray())

        //     focusElement = this.gananciaInput.toArray()
        //     .find((comp) =>comp.nativeElement.id === `ganancia`);
        //     console.log('entro ganancia')
        // }
        if (cliente) {
        console.log('Paso por aqui Cliente')
            const foundCliente = this.clientes.find(
                (cliente) =>
                    cliente.cliente.toLowerCase().trim() ===
                    this.form.value.cliente.toLowerCase().trim()
            );

            if (foundCliente) {
                this.form.patchValue({ clie_Id: foundCliente.clie_Id });
                this.submittedCliente = false;

            } else {
                this.form.patchValue({ clie_Id: '' });
                this.submittedCliente = true;
                focusElement = this.clienteAutocomplete.toArray()
            .find((comp) => comp.id === `cliente`);
            }
        }else{
            this.submittedCliente = true;
            focusElement = this.clienteAutocomplete.toArray()
            .find((comp) => comp.id === `cliente`);
        }

        if (empleado) {
            const foundEmpleado = this.empleados.find(
                (empleado) =>
                    empleado.empleado.toLowerCase().trim() ===
                    this.form.value.empleado.toLowerCase().trim()
            );
            console.log(foundEmpleado);

            if (foundEmpleado) {
                console.log('Entro');
                this.form.patchValue({ empl_Id: foundEmpleado.empl_Id });
                this.submittedEmpleado = false;

            } else {
                this.form.patchValue({ empl_Id: '' });
                this.submittedEmpleado = true;
                focusElement = this.empleadoAutocomplete.toArray()
                .find((comp) => comp.id === `empleado`);

            }
        }else{
            this.submittedEmpleado = true;
            focusElement = this.empleadoAutocomplete.toArray()
            .find((comp) => comp.id === `empleado`);
        }
        if(this.form.controls['pren_Titulo'].invalid){
            focusElement = this.tituloInput.toArray()
            .find((comp) =>comp.nativeElement.id === `titulo`);
            console.log('entro titulo')
        }
        else if(this.form.controls['pren_Descripcion'].invalid){
            focusElement = this.descripcionInput.toArray()
            .find((comp) =>comp.nativeElement.id === `descripcion`);
            console.log('entro descripcion')
        }
        // Focalizar el campo correspondiente automáticamente si es inválido
        if (focusElement) {
            setTimeout(() => {
                if (focusElement.inputEL) {
                    // Para AutoComplete de PrimeNG
                    focusElement.inputEL.nativeElement.focus();
                    console.log('If Uno')
                } else if (focusElement.nativeElement) {
                    focusElement.nativeElement.focus();
                    console.log('If Dos')
                }
            }, 0);
        }
        if (this.form.valid) {
            this.isTab2Disabled = false;

            if (this.Titulo == 'Nuevo Presupuesto') {
                console.log('ENTRE');
                this.NuevoPresupuesto();
            } else {
                this.ActualizarPresupuesto(0);
            }
        } else {
            this.submitted = true;

        }

    }
    async GuardarUnidad() {
        if (this.formUnidadMedida.valid) {
            const unme_Nombre = this.formUnidadMedida.value.unme_Nombre;
            const unme_Nomenclatura =
                this.formUnidadMedida.value.unme_Nomenclatura;
            const usua_Creacion = this.usua_Id;

            const Modelo = {
                unme_Nombre: unme_Nombre,
                unme_Nomenclatura: unme_Nomenclatura,
                usua_Creacion: usua_Creacion,
            };
            await this.service.InsertarUnidad(Modelo).then(
                (response) => {
                    if (response.code == 200) {
                        this.unme_Id = response.data.messageStatus;
                        this.insertUnidad = true;
                        this.modalUnidadMedida = false;
                        this.formUnidadMedida.reset();
                        this.listarUnidades();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Insertado con Éxito.',
                        });
                    }
                },
                (error) => {
                    console.error('Error ' + error);
                }
            );
        } else {
            this.submitted = true;
        }
    }
    CrearProyecto() {
        this.Create = false;
        this.proyectoNoExiste = true;
        this.submitted2 = false;
        this.ngOnInit2();
        this.proyecto = { usua_Creacion: this.usua_Id };
    }

    async NuevoPresupuesto() {
        this.isLoading = true;
        this.form.get('pren_Fecha')?.enable();
        const pren_Titulo = this.form.value.pren_Titulo;
        const pren_Descripcion = this.form.value.pren_Descripcion;
        const pren_Fecha = this.form.value.pren_Fecha;
        const pren_PorcentajeGanancia = this.form.value.pren_PorcentajeGanancia;
        const proyecto = this.form.value.proy_Id;
        const proy_Id = proyecto.proy_Id;
        const usua_Creacion = this.usua_Id;

        this.defaultPorcentaje = pren_PorcentajeGanancia;
        console.log('Fecha',pren_Fecha)
        const formattedDate = format(new Date(pren_Fecha), 'MMMM yyyy', {
            locale: es,
        });
        this.fecha = this.capitalizeFirstLetter(formattedDate);
        this.proy_Id = this.form.value.proy_Id;

        console.log(this.ValorImpuesto, 'valor impuesto en nuevo presupuesto');
        
        const Presupuesto: any = {
            pren_Titulo: pren_Titulo,
            pren_Descripcion: pren_Descripcion,
            pren_Fecha: pren_Fecha,
            pren_PorcentajeGanancia: pren_PorcentajeGanancia,
            empl_Id: this.form.value.empl_Id,
            pren_Observacion: 'N/A',
            pren_Impuesto: this.ValorImpuesto,
            pren_Maquinaria: this.maquinariaCalculo,
            clie_Id: this.form.value.clie_Id,
            proy_Id: this.form.value.proy_Id,
            usua_Creacion: usua_Creacion,
        };
        this.form.get('pren_Fecha')?.disable();
        if (this.insertado == false) {
            await this.service.Insertar(Presupuesto).then(
                async (response) => {
                    if (response.code == 200) {
                        this.pren_Id = parseInt(response.data.codeStatus);
                        this.proy_Id = this.form.value.proy_Id;
                        
                        this.ISV = this.ValorImpuesto;

                        await this.insertarConversiones(this.pren_Id);
                        await this.listarPresupuesto();
                        await this.listarActividadesDeProyecto(this.proy_Id);
                        await this.listarConversiones(this.pren_Id);
                        this.insertado = true;
                        this.activeIndex = 1;
                    } else {
                        console.log('RESPONSE:' + response.success);
                    }
                },
                (error) => {}
            );
        } else {
            this.activeIndex = 1;
        }
        this.isLoading = false;
    }

    async ListarEtapas() {
        this.service.ListarEtapa().then(
            (data: any) => {
                this.etapaOptions = data.sort((a, b) =>
                    a.etap_Descripcion.localeCompare(b.etap_Descripcion)
                );
            },
            (error) => {
                console.log('Error ' + error);
            }
        );
    }

    async ActualizarPresupuesto(opcion: number) {
        const empleado = this.form.value.empleado;
        const cliente = this.form.value.cliente;
        const proyecto = this.form.value.proyecto;
        if (proyecto) {
            const foundProyecto = this.proyectoOptions.find(
                (proyecto) =>
                    proyecto.proy_Nombre.toLowerCase().trim() ===
                    this.form.value.proyecto.toLowerCase().trim()
            );
            if (foundProyecto) {
                this.form.patchValue({ proy_Id: foundProyecto.proy_Id });
            } else {
                this.form.patchValue({ proy_Id: '' });
            }
        }
        if (cliente) {
            const foundCliente = this.clientes.find(
                (cliente) =>
                    cliente.cliente.toLowerCase().trim() ===
                    this.form.value.cliente.toLowerCase().trim()
            );

            if (foundCliente) {
                this.form.patchValue({ clie_Id: foundCliente.clie_Id });
            } else {
                this.form.patchValue({ clie_Id: '' });
            }
        }
        if (empleado) {
            const foundEmpleado = this.empleados.find(
                (empleado) =>
                    empleado.empleado.toLowerCase().trim() ===
                    this.form.value.empleado.toLowerCase().trim()
            );
            console.log(foundEmpleado);

            if (foundEmpleado) {
                console.log('Entro');
                this.form.patchValue({ empl_Id: foundEmpleado.empl_Id });
            } else {
                this.form.patchValue({ empl_Id: '' });
            }
        }
        this.isLoading = true;
        this.form.get('pren_Fecha')?.enable();
        this.form.get('pren_PorcentajeGanancia')?.enable();

        const pren_Titulo = this.form.value.pren_Titulo;
        const pren_Descripcion = this.form.value.pren_Descripcion;
        const pren_Fecha = this.form.value.pren_Fecha;
        const pren_PorcentajeGanancia = this.form.value.pren_PorcentajeGanancia;
        const usua_Modificacion = this.usua_Id;

        const formattedDate = format(new Date(pren_Fecha), 'MMMM yyyy', {
            locale: es,
        });
        this.fecha = this.capitalizeFirstLetter(formattedDate);

        const Presupuesto: any = {
            pren_Id: this.pren_Id,
            pren_Titulo: pren_Titulo,
            pren_Descripcion: pren_Descripcion,
            pren_Fecha: pren_Fecha,
            pren_PorcentajeGanancia: this.defaultPorcentaje,
            pren_Maquinaria: this.maquinariaCalculo,
            empl_Id: this.form.value.empl_Id,
            clie_Id: this.form.value.clie_Id,
            proy_Id: this.form.value.proy_Id,
            usua_Modificacion: usua_Modificacion,
        };
        console.log(Presupuesto)
        this.form.get('pren_Fecha')?.disable();
        this.form.get('pren_PorcentajeGanancia')?.disable();

        await this.service.Actualizar(Presupuesto).then(
            async (response) => {
                if (response.code == 200) {
                    if(opcion == 0){
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.' });
                    }
                    // this.activeIndex = 1;
                    await this.insertarConversiones(this.pren_Id);
                    await this.listarConversiones(this.pren_Id);
                    this.modalEditar = false;
                    this.isLoading = false;

                } else {
                    console.log('RESPONSE:' + response.success);
                }
            },
            (error) => {}
        );
    }

    capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    onChangeConversion(event: any) {
        let pptc_Id = event.value;
        console.log('Pptc_Id', pptc_Id);
        if (!pptc_Id) {
            pptc_Id = event;
        }
        let foundConversion = this.listconversion.find(
            (conversion) => conversion.pptc_Id === pptc_Id
        );
        this.valorMonedaConversion = foundConversion.taca_ValorA;
        this.abreviaturaMonedaConversion = foundConversion.moneAbreviaturaB;
        this.prueba.forEach((rowData, rowIndex) => {
            if (!rowData.esEtapa) {
                this.calcularPU(rowData, rowIndex);
            }
        });
        this.actualizarTotalesGenerales();
        console.log(
            this.valorMonedaConversion,
            this.abreviaturaMonedaConversion
        );
    }

    async listarConversiones(id: number) {
        await this.presupuestotasaservice.Listar(id).then(
            (data: any) => {
                // Mapear solo las monedas filtradas
                this.listconversion = data;
                this.selectconversiones = data.map((item) => ({
                    label:
                        item.moneAbreviaturaA + ' ➔ ' + item.moneAbreviaturaB,
                    value: item.pptc_Id,
                }));
                // Seleccionar automáticamente la primera opción
                if (this.selectconversiones.length > 0) {
                    this.selectedConversion = this.selectconversiones[0].value;
                    this.valorMonedaConversion =
                        this.listconversion[0].taca_ValorA;
                    this.abreviaturaMonedaConversion =
                        this.listconversion[0].moneAbreviaturaB;

                    // Llamar a onChangeConversion con la primera opción seleccionada
                    this.onChangeConversion(this.selectedConversion);
                }
            },
            (error) => {}
        );
    }

    // Método para insertar las conversiones
    async insertarConversiones(pren_Id: number) {
        const usua_Creacion = this.usua_Id;

        // Iterar sobre las conversiones
        for (const conversion of this.conversiones) {
            // Solo insertar si pptc_Id es 0
            if (conversion.pptc_Id === 0) {
                const PresupuestoPorTasaCabio: any = {
                    pren_Id: pren_Id,
                    taca_Id: conversion.taca_Id, // Utiliza el taca_Id asignado en cada conversión
                    usua_Creacion: usua_Creacion,
                };
                console.log(conversion.taca_Id);
                await this.presupuestotasaservice
                    .Insertar(PresupuestoPorTasaCabio)
                    .then(
                        (respuesta: Respuesta) => {
                            if (respuesta.success) {
                                console.log(
                                    'Conversión insertada correctamente:',
                                    respuesta.message
                                );
                            } else {
                                console.log(
                                    'Error al insertar la conversión:',
                                    respuesta.message
                                );
                            }
                        },
                        (error) => {
                            console.error(
                                'Error al insertar la conversión:',
                                error
                            );
                        }
                    );
            }
        }
    }

    //#endregion

    //#region Proyecto DatosGenerales
    // Primera carga

    /**
     * Inicializa el componente, suscribiéndose a eventos y cargando los datos iniciales.
     */
    async ngOnInit2() {
        // Carga inicial de países, estados y clientes
        await this.paisService.Listar2().then((data) => {
            this.paises = data;
        });

        await this.estadoService
            .DropDownEstadosByCountry2(
                this.paises.find((pais) => pais.pais_Nombre === 'Honduras')
                    .pais_Id
            )
            .then(
                (data) =>
                    (this.estados = data.sort((a, b) =>
                        a.esta_Nombre.localeCompare(b.esta_Nombre)
                    ))
            );

        await this.clienteService.Listar().subscribe((data) => {
            this.clientes = data.sort((a, b) =>
                a.clie_NombreCompleto.localeCompare(b.clie_NombreCompleto)
            );
        });

        // Carga inicial de países, estados y clientes
        await this.tiposProyectoService.Listar().then((data) => {
            this.tiposProyecto = data.sort((a, b) =>
                a.tipr_Descripcion.localeCompare(b.tipr_Descripcion)
            );
        });

        this.proyecto = {
            proy_Nombre: this.form.value.proyecto,
            proy_FechaInicio: this.form.value.pren_Fecha,
            proy_Descripcion: this.form.value.pren_Descripcion,
            clie_NombreCompleto: this.form.value.cliente,
            usua_Creacion: this.usua_Id,
        };
    }

    /**
     * Guarda los datos generales del proyecto.
     * Si el proyecto ya existe, lo actualiza; de lo contrario, lo crea.
     */
    async guardarDatosGenerales() {
        this.submitted2 = true;

        if (this.proyecto.tipr_Descripcion?.trim() && 
            this.proyecto.proy_Nombre?.trim() && 
            this.proyecto.proy_Descripcion?.trim() &&
            this.proyecto.proy_FechaInicio?.toString() && 
            this.proyecto.proy_FechaFin?.toString() &&
            this.proyecto.clie_NombreCompleto?.trim() &&
            this.proyecto.esta_Nombre?.trim() &&
            this.proyecto.ciud_Descripcion?.trim() &&
            this.proyecto.proy_DireccionExacta?.trim()) {
                
            try {
                let response;

                // Encuentra el tipo, la ciudad y el cliente correspondientes
                if (!this.proyecto.tipr_Id) {
                    this.proyecto.tipr_Id = this.tiposProyecto.find(
                        (tipoProyecto) =>
                            tipoProyecto.tipr_Descripcion ===
                            this.proyecto.tipr_Descripcion
                    )?.tipr_Id;
                }

                if (!this.proyecto.ciud_Id) {
                    this.proyecto.ciud_Id =
                        this.ciudades.find(
                            (ciudad) =>
                                ciudad.ciud_Descripcion ===
                                this.proyecto.ciud_Descripcion
                        )?.ciud_Id || null;
                }

                let foundCliente = this.clientes.find(
                    (cliente) =>
                        cliente.cliente === this.proyecto.clie_NombreCompleto
                );
                this.proyecto.clie_Id = foundCliente?.clie_Id || null;
                console.log(this.proyecto)
                // Actualiza o crea el proyecto
                if (this.proyecto.proy_Id) {
                } else {
                    response = await this.proyectoService.Insertar(
                        this.proyecto
                    );
                    if (response && response.data && response.data.codeStatus) {
                        this.proyecto.proy_Id = response.data.codeStatus;
                    }
                }

                // Muestra un mensaje de éxito o advertencia basado en la respuesta
                // if (response) {
                //     this.messageService.add({
                //         severity: response.code == 200 ? 'success' : 'warn',
                //         summary: response.code == 200 ? 'Éxito' : 'Advertencia',
                //         detail: response.data?.messageStatus || response.message,
                //         life: 3000
                //     });
                // }

                // Actualiza el estado de navegación si la respuesta fue exitosa
                if (response?.code == 200) {
                    this.proyecto = {
                        ...this.proyecto,
                        usua_Modificacion: this.usua_Id,
                    };
                    this.form.patchValue({
                        proy_Id: response.data.codeStatus,
                        proyecto: this.proyectoValue,
                    });
                    this.proyectoNoExiste = false;
                    this.Create = true;
                    this.submitted = false;

                    this.listarProyectos();
                    // this.listarProyectos2();
                    
                    this.form.patchValue({
                        proyecto: this.proyecto.proy_Nombre,
                    });
                }
            } catch (error) {
                // Muestra un mensaje de error en caso de excepción
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error Externo',
                    detail: error.message || error,
                    life: 3000,
                });
            }
        }
    }

    /**
     * Filtra la lista de ciudades basada en el estado seleccionado en el proyecto.
     */
    async filtrarCiudades() {
        const id = this.estados.find(estado => estado.esta_Nombre === this.proyecto.esta_Nombre)?.esta_Id || null;
        if(id){
            await this.ciudadService.DropDownByState2(id)
            .then(data => this.ciudades = data);
        }

        const foundoption = this.estados.some(x => x.esta_Nombre === this.proyecto.esta_Nombre);
        this.isOptionEstadoNotFound = !foundoption;
    }

    /**
     * Filtra la lista de tipos de proyectos para autocompletar.
     * @param event - Evento que contiene el texto de búsqueda
     */
    filterTipoProyecto(event: any) {
        const filtered: any[] = [];
        const query = event.query.toLowerCase();
        for (let i = 0; i < this.tiposProyecto.length; i++) {
            const tipoProyecto = this.tiposProyecto[i];
            if (tipoProyecto.tipr_Descripcion.toLowerCase().indexOf(query) == 0) {
                filtered.push(tipoProyecto.tipr_Descripcion);
            }
        }

        this.filteredTiposProyecto = filtered.sort((a, b) => a.localeCompare(b));
    }

    detectTipoProyecto(){
        const foundoption = this.tiposProyecto.some(x => x.tipr_Descripcion === this.proyecto.tipr_Descripcion);
        this.isOptionTipoProyectoNotFound = !foundoption;
    }

    cerrar() {
        this.Create = true;
        this.proyectoNoExiste = false;
        this.submittedEmpleado = false;
        this.submittedCliente = false;
        this.submittedProyecto = false;
        this.submitted = false;
    }

    /**
     * Filtra la lista de clientes basada en la consulta del usuario.
     * @param event - Evento que contiene la consulta para el filtro
     */
    ClienteSelect(event: any){
        const cliente = event.value;
        this.proyecto.clie_NombreCompleto = cliente.cliente;
    }
    filterClientes(event: any) {
        const filtered: any[] = [];
        const query = event.query.toLowerCase();
        for (let i = 0; i < this.clientes.length; i++) {
            const cliente = this.clientes[i];
            if (cliente.cliente.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(cliente.cliente);
            }
        }

        this.filteredClientes = filtered.sort((a, b) => a.localeCompare(b))
    }

    detectCliente(){
        const foundoption = this.clientes.some(x => x.cliente === this.proyecto.clie_NombreCompleto);
        this.isOptionClienteNotFound = !foundoption;
    }

    filterCliente2(event: any) {
        const query = event.query.toLowerCase();
        this.filteredClientes2 = this.clientes.filter((cliente) =>
            cliente.cliente.toLowerCase().includes(query)
        );
    }

    /**
     * Filtra la lista de estados basada en la consulta del usuario.
     * @param event - Evento que contiene la consulta para el filtro
     */
    filterEstados(event: any) {
        const filtered: any[] = [];

        const query = event.query.toLowerCase();
        for (let i = 0; i < this.estados.length; i++) {
            const estado = this.estados[i];
            if (estado.esta_Nombre.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(estado.esta_Nombre);
            }
        }

        const foundoption = this.estados.some(x => x.esta_Nombre === this.proyecto.esta_Nombre);
        this.isOptionEstadoNotFound = !foundoption;

        this.filteredEstados = filtered.sort((a, b) => a.localeCompare(b));
    }

    /**
     * Filtra la lista de ciudades basada en la consulta del usuario.
     * @param event - Evento que contiene la consulta para el filtro
     */
    filterCiudades(event: any) {
        const filtered: any[] = [];

        const query = event.query.toLowerCase();
        for (let i = 0; i < this.ciudades.length; i++) {
            const ciudad = this.ciudades[i];
            if (ciudad.ciud_Descripcion.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(ciudad.ciud_Descripcion);
            }
        }

        this.filteredCiudades = filtered.sort((a, b) => a.localeCompare(b));
    }

    detectCiudad(){
        const foundoption = this.ciudades.some(x => x.ciud_Descripcion === this.proyecto.ciud_Descripcion);
        this.isOptionCiudadNotFound = !foundoption;
    }


    //#endregion

    insertarReferencia(Modelo: Referencia){
         return this.referenciaService.Insertar(Modelo)
    }

    eliminarReferencia(Modelo: Referencia){
        return this.referenciaService.Eliminar(Modelo);
    }

    listarReferencias(){
        return this.referenciaService.Listar()
    }
}
