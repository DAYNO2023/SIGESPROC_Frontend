import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, Form } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { CompraService } from 'src/app/demo/services/servicesinsumo/compra.service';
import { CompraEncabezado, autocompleteEmpleado, CompraDetalleEnvio } from 'src/app/demo/models/modelsinsumo/compraviewmodel';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { filter } from 'rxjs/operators';
//importar estos 3 service para las alertas
import { NotificationManagerService } from 'src/app/demo/services/notificacionservice/NotificacionGlobal.service';
import { NotificacionUpdateService } from 'src/app/demo/services/servicesproyecto/Notificacionactualizar.service';
import { NotificacionesService } from 'src/app/demo/services/servicesproyecto/notificacion.service';

import { BodegaService } from 'src/app/demo/services/servicesinsumo/bodega.service';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { CompraDetalle } from 'src/app/demo/models/modelsinsumo/compraviewmodel';
import { RentaMaquinariaPorActividadService } from 'src/app/demo/services/servicesinsumo/rentamaquinariaporactividad.service';
import { ProyectoService } from 'src/app/demo/services/servicesproyecto/proyecto.service';
import { CotizacionTabla } from 'src/app/demo/models/modelsinsumo/cotizacionviewmodel';
import { UnidadesPorInsumo, UnidadMedida } from 'src/app/demo/models/modelsgeneral/unidadmedidaviewmodel';
import { Proveedor } from 'src/app/demo/models/modelsinsumo/proveedorviewmodel';
import { Material } from 'src/app/demo/models/modelsinsumo/materialviewmodel';
import { ddlCategorias, ddlSubcategoria } from 'src/app/demo/models/modelsinsumo/insumosviewmodel';
import { Insumo, InsumoPorMedida } from 'src/app/demo/models/modelsinsumo/insumoviewmodel';
import { Maquinaria, MaquinariabBuscar, Nivel } from 'src/app/demo/models/modelsinsumo/maquinariaviewmodel';
import { ciudad } from 'src/app/demo/models/modelsgeneral/ciudadviewmodel';
import { Estado } from 'src/app/demo/models/modelsgeneral/estadoviewmodel ';
import { Pais } from 'src/app/demo/models/modelsgeneral/paisviewmodel';
import { CotizacionService } from 'src/app/demo/services/servicesinsumo/cotizacion.service';
import { MaterialService } from 'src/app/demo/services/servicesinsumo/material.service';
import { ProveedorService } from 'src/app/demo/services/servicesinsumo/proveedor.service';
import { ciudadService } from 'src/app/demo/services/servicesgeneral/ciudad.service';
import { EstadoService } from 'src/app/demo/services/servicesgeneral/estado.service';
import { PaisService } from 'src/app/demo/services/servicesgeneral/pais.service';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { isThisSecond } from 'date-fns';
import { CookieService } from 'ngx-cookie-service';
import { Router, NavigationEnd  } from '@angular/router';
import { NavigationStateService } from 'src/app/demo/services/navigationstate.service';
import { InsumoPorActividadService } from 'src/app/demo/services/servicesproyecto/insumoporactividad.service';

interface ProveedorRepetido {
  prov_Id: number;
  prov_Descripcion: string;
  cotizaciones: any[]; // o string[], según el tipo de coti_Id
  repeticiones: number;
}
interface Cotizacion {
  id: any; // o string, según sea el caso
  checked: any;
}

@Component({
  selector: 'app-compra',
  providers: [MessageService],
  templateUrl: './compra.component.html',
  styleUrls: ['./compra.component.scss'],
})

export class CompraComponent implements OnInit {
  fechaInicio: Date | undefined;
  fechaFin: Date | undefined;
  compraencabezado: CompraEncabezado[] = [];
  compradetalle: CompraDetalle[] = [];
  destinos: CompraDetalleEnvio[] = []
  maquinarias: CompraDetalleEnvio[] = []
  equiposSeguridad: CompraDetalleEnvio[] = []
  destinos1: CompraDetalleEnvio[] = []
  arr: any[];
  filtradasCotizaciones: any[] = [];
  //Errores
  Error_Pais: string = "El campo es requerido."
  Error_Estado: string = "El campo es requerido."
  Error_Ciudad: string = "El campo es requerido."
  Error_Nivel: string = "El campo es requerido."
  // Arreglo global para almacenar las selecciones
  selecciones: any[] = [];
  proveedoresRepetidos = [];
  items: MenuItem[] = [];
  Usuario : string = (this.cookieService.get('usua_Usuario'));
  isPdfVisible: boolean = false;
  detailItems: MenuItem[] = [];
  sino: SelectItem[] = [];
  originalDetalles: any[] = [];
  hasInsumos: boolean = false;
  hasMaquinariaaa: boolean = false;
  proveedorRepetido: string = "";
  hasEquipoSeguridadd: boolean = false;
  estadoCotizacion: { hasInsumos: boolean, hasMaquinariaaa: boolean, hasEquipoSeguridad: boolean }[] = [];
  empleados: autocompleteEmpleado[] = [];
  filtradoEmpleado: autocompleteEmpleado[] = [];
  metodosPago: SelectItem[] = [];
  confirmEditarDialog: boolean = false;
  Bodegas: SelectItem[] = [];
  BodegasUni: SelectItem[] = [];
  expandedRows: any = {};
  confirmEmitDialog: boolean = false;
  confirmEmitDialogIndex: boolean = false;
  Proyectos: SelectItem[] = [];
  EtapasPorProyectos: SelectItem[] = [];
  ActividadesPorEtapa: SelectItem[] = [];
  ProveedoresCotizaciones: any = [];
  mostrarInsumo: boolean = false;
  mostrarMaquinaria: boolean = false;
  mostrarEquipoSeguridad: boolean = false;
  proyectoobodegageneraldif: boolean = false;
  proyectoobodegageneralid: number = 0;
  displayNewCompraDialog: boolean = false;
  isRegresarVisible: boolean = false;
  loading: boolean = true;
  isLoading: boolean = false;
  isTableLoading: boolean = false;//variable para mostrar el spinner
  loadedTableMessage: string = "";//variable para almacenar el mensaje de carga
  tabPanels: { header: string, index: number, proveedor?: string, detalles: any[], detallesFiltrados: any[], subtotal: number, total: number, isv: number, formNumero: FormGroup }[] = [];
  detalle: any = null;
  isAnySelected: boolean = false;
  mostrarModalOrdenCompra: boolean = false;
  mostrarModalOrdenCompra2: boolean = false;
  numeroCompra: string='';
  bodegaOproycto: string = 'Bodega';
  bodegaOproyctoIndi: string = 'Bodega';
  selectedDetalles: any[] = []; // Arreglo para almacenar todos los detalles seleccionados
  iddetalledestino: number = 0;
  iddetalledestinomaquinaria: number = 0;
  iddetallecompra: number = 0;
  detallecantidad: number = 0;
  selectedcompradetalle: any;//selector de compra detalle
  iddetalle: number = 0; //id compra detalle
  totalingresados: number = 0;
  minDate: Date;
  maxDate: Date;
  selectedCompraId: number | null = null;
  ModalListaProveedores: boolean = false;
  cotizaciones: SelectItem[] = [];
  id: number = 0;
  currentTipo: number = 1;
  cotizaciondetalleId: number = 0;
  preciototal: number = 0;
  fechacontratacion: string;
  idmaquinaria: number;
  usua_Id: number;
  idequiposeguridad: number;
  detalleauditoria: any[] = [];
  idactividad: number = 0;
  idHorasrenta: string;
  actualizarpordefecto: boolean = false;
  check: boolean = false;
  maquinariaono: any;
  form: FormGroup; //formgroup total
  formde: FormGroup; //formgrup de destinos
  formdeex: FormGroup; //formgrup de destinos
  permitirEliminar: boolean = true;

  formEnvio: FormGroup;

  formMaquinaria: FormGroup;
  formPaises: FormGroup;
  viewState = {
    create: false,
    detail: false,
    delete: false,
    maqui: false,
    index: true,
    ordenes: false,
    ordenesEditar: false,
    Detalles: false,
    variableCambiada: false,
    createdirect: false,
    Seguridad: false
  };

  submitted: boolean = false;
  valRadio: string = '';
  detalles: { [key: number]: any[] } = {};
  unicoDestino: any = null; // Variable para almacenar el único registro

  destino: { [key: number]: any[] } = {};
  maquinaria: { [key: number]: any[] } = {};


   //Variables de fechas
   dateDay = new Date();
   conversion: string;

   //Almacenamiento de datos

   CotizacionesTabla: CotizacionTabla[] = [];


   UnidadesMedida: UnidadesPorInsumo[] = [];

   //Filtro
   filteredCotizacionesTabla: any[] = [];

   //Collaps
   Index: boolean = true;
   Create: boolean = false;
   Detail: boolean = false;
   Delete: boolean = false;

   //Formularios
   formCompra: FormGroup;
   formInsumo: FormGroup;
   formNumero: FormGroup;
   formMaquinariaCompra: FormGroup;
   formUnidad: FormGroup;
   formEquipo: FormGroup;
   //Validador de campos vacios
   submittedCompra: boolean = false;

   //Si es crear o editar
   identity: string  = "Crear";
   titulo: string = "Nueva Rol"
   //Seleccion de fila de tablas
   selectedRol: any;
   selectedCotizacion: any;
   //Guardar IDS
   idCompra: number = 0;
   idInsumo: number = 0;
   idEquipo: number = 0;
   idProveedor: number = 0;
   idcotizaciondetalle: number = 0;

   idMaquinaria: number = 0;

   ModalInsumo: boolean = false;
   ModalMaquinaria: boolean = false;
  MensaejeConIds: string = "";
   //DropDowns y Autocompletdos
   proveedor: Proveedor[] | undefined;
   material: Material[] | undefined;
   categoria: ddlCategorias[] | undefined;
   subCategoria: ddlSubcategoria[] | undefined;
   insumos: Insumo[] | undefined;
   insumosPorMedidas: Insumo[] | undefined;
   unidad: UnidadMedida[] | any;
   maquinariaCompra: Maquinaria[] = [];
   EquiposSeguridad: any[] = [];
   maquinariaPorProveedor: MaquinariabBuscar[] = [];
   EquiposSeguridadPorProveedor: any[] = [];
   nivel: Nivel[] = [];

   //Filtros
   filtradoInsumo: Insumo[] = [];
   filtradoMaquinaria: Maquinaria[] = [];
   Filtradonivel: Nivel[] = [];
   filteredProveedores: any[] = [];
   filteredEquiposSeguridad: any[] = [];
   //Modal
   ModalImpuesto: boolean = false;
   ModalFinalizars: boolean = false;
   //Label
   LabelIncluido: string = "";
   //Impuesto
   ValorImpuesto: any;
   IncluidoImpuesto: boolean = false;
   subtotal: number = 0.00;
   tax: number = 0.00;
   total: number = 0.00;

   //Tabs
   activeIndex: number = 0;
   dhTab: boolean = true;
   tabInsumo: boolean = false;
   tabMaquinaria: boolean = false;
   tabEquiposSeguridad: boolean = false;

   //Almacenar los checbox
   selectCheckbox: any[] = [];

   //CheckBox Padre
   selectAll: any = false

   //ID para finalizar
   coti_Id: number = 0;

   prov_Id: number = 0;

   //Create Proveedor
   proveedorFormulario: boolean = false;
   //Formulario proveedor
   proveedorForm: Proveedor = {usua_Creacion: 3};

   //Dropdowns
   ciudades: ciudad[] = [];
   estados: Estado[] = [];
   paises: Pais[] = [];
   ventas = [
     { label: 'Maquinaria', value: 0 },
     { label: 'Insumo', value: 1 },
     { label: 'Ambas', value: 2 }
   ];

   //Autocomplete Proveedores
   filteredCiudades: any[];
   filteredEstados: any[];
   filteredPaises: any[];

   //Autocomplete Insumos
   filteredCategorias: any[] = [];
   filteredSubCategorias: any[] = [];
   filteredMateriales: any[] = [];
   filteredUnidades: any[] = [];

   //Bloquear boton de crear
   botonCrear: boolean = false;

   //Manejamiento de la eleccion de tabla
   filtroboton: boolean = false;
   radioButton: number = 1;

   //Encabezados del th
   EncabezadoMedida: string = ""
   EncabezadoCantidad: string = ""


   //Editar
   confirmar :boolean = false;
   confirmarCotizacion :boolean =  false;
   ConfirmarInsumo: boolean = false;
   ConfirmarInsumoBoton: boolean = false;



   //Crear insumos
   deta_Insumo: string = "";
   deta_Categoria: string = "";
   deta_SubCategoria: string = "";
   deta_Material : string = "";
   deta_Unidad: string = "";
   deta_Modal: boolean = false;

   //Modal Maquinaria Eliminar y Crear Nuevo
   ModalMaquinariaEliminar: boolean = false;
   Deta_MaquinariaDescripcion: string = "";
   ModalMaquinariaCrear: boolean = false;
   ConfirmarCrearMaquinaria: boolean = false;

   //Modal Insumo de ELIMIANR Y CREAR
   ModalInsumoEliminar: boolean = false;
   idUnidad: string = "";
   ModalEquipoCrear: boolean = false;
   ConfirmarCrearEquipo: boolean = false;
   ModalMismoProveedor: boolean = false;
   identificador: number = 0;
   //Modal Equipo
   ModalEquipoEliminar: boolean = false;
   Deta_Equipo: string = "";
   //Modal Proveedor
   ModalProveedor:boolean = false;

   Enviado: boolean = false;

   compraList: any[] = [];

  constructor(
    private messageService: MessageService,
    private service: CompraService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private sbode: BodegaService,
    private renservice: RentaMaquinariaPorActividadService,
    private proyservice: ProyectoService,
    private CotiService: CotizacionService,
    private materialService: MaterialService,
    private proveedorService: ProveedorService,
    private ciudadService: ciudadService,

    //importaciones para las alertas
    private notificacionesService: NotificacionesService,
    private notificacionUpdateService: NotificacionUpdateService,
    private notificationManagerService: NotificationManagerService,
    private estadoService: EstadoService,
    private paisService: PaisService,
    private navigationStateService: NavigationStateService,
    private insumoPorActividadService: InsumoPorActividadService,
    //LLamamos al servicio de global para traer la nomenclatura de moneda
        public globalMoneda: globalmonedaService,
        public cookieService: CookieService,
        private router: Router,

  ) {

    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/insumo/compra')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });

  // Inicialización del formulario principal para gestionar compras
  this.form = this.fb.group({
    empleado: ['', Validators.required],            // Campo obligatorio para seleccionar un empleado
    meto_Id: ['', Validators.required],             // Campo obligatorio para seleccionar un método de pago
    cotizaciones: this.fb.array([this.createCotizacionFormGroup()]), // Arreglo de formularios para gestionar cotizaciones
    fechaInicio: [null, Validators.required],       // Campo obligatorio para la fecha de inicio de la compra
    fechaFin: [null, Validators.required],          // Campo obligatorio para la fecha de finalización de la compra
  });

  this.destinos = [];
  this.formPaises = this.fb.group({
    pais: [''],
    estado: [''],
    ciudad: [''],
  });

  // Inicialización del formulario para gestionar los detalles de compra específicos
  this.formdeex = this.fb.group({
    codt_Id: ['', Validators.required],             // Campo obligatorio para el ID del detalle de compra
    codd_Cantidad: ['', Validators.required],       // Campo obligatorio para la cantidad del detalle de compra
    codd_ProyectoOBodega: ['', Validators.required],// Campo obligatorio para definir si es un proyecto o una bodega
    codd_Boat_Id: ['', Validators.required]         // Campo obligatorio para el ID del proyecto o bodega
  });

  // Inicialización del formulario para gestionar el destino de los productos (bodega o proyecto)
  this.formde = this.fb.group({
    destino: [false],                               // Campo booleano para determinar si el destino es un proyecto o una bodega
    maquinaria: [false],                            // Campo booleano para indicar si se trata de maquinaria
    bodega: [''],                                   // Campo opcional para seleccionar la bodega
    etapa: [null],                                  // Campo opcional para seleccionar la etapa del proyecto
    actividad: [null],                              // Campo opcional para seleccionar la actividad del proyecto
    acet_Id: [null],                                // Campo opcional para el ID de la actividad seleccionada
    proy_Id: [null],                                // Campo opcional para el ID del proyecto seleccionado
    etpr_Id: [null],                                // Campo opcional para el ID de la etapa seleccionada
  });

  // Suscripción a los cambios en los valores del formulario principal para actualizar los datos de los paneles de tab
  this.form.valueChanges.subscribe(() => {
    this.cotizacionesArray.controls.forEach((_, index) => this.updateTabPanelData(index));
  });

  // Inicialización del formulario para el envío de insumos o maquinaria
  this.formEnvio = this.fb.group({
    codt_Id: [''],                                  // Campo opcional para el ID del detalle de compra
    codd_Cantidad: [''],                            // Campo opcional para la cantidad a enviar
    codd_ProyectoOBodega: [false],                  // Campo booleano para definir si es un proyecto o una bodega
    codd_Boat_Id: [''],                             // Campo opcional para el ID del proyecto o bodega
    etapa: [''],                                    // Campo opcional para seleccionar la etapa del proyecto
    acet_Id: ['']                                   // Campo opcional para el ID de la actividad seleccionada
  });

  // Suscripción a los cambios en el valor del destino para reflejarlo en el formulario de envío
  this.formde.get('destino').valueChanges.subscribe(value => {
    if (value) {
      this.formEnvio.get('codd_ProyectoOBodega').setValue(value);
    }
  });

  // Inicialización del formulario para gestionar maquinaria
  this.formMaquinaria = this.fb.group({
    codm_HorasRenta: ['', Validators.required],     // Campo obligatorio para las horas de renta de la maquinaria
    acet_Id: ['', Validators.required],             // Campo obligatorio para el ID de la actividad
    proy_Id: ['', Validators.required],             // Campo obligatorio para el ID del proyecto
    etpr_Id: ['', Validators.required],             // Campo obligatorio para el ID de la etapa del proyecto
    codm_Cantidad: ['', Validators.required],       // Campo obligatorio para la cantidad de maquinaria
  });

  // Inicialización del formulario para gestionar la compra
  this.formCompra = this.fb.group({
    prov_Descripcion: ['', Validators.required],    // Campo obligatorio para la descripción del proveedor
    coti_Fecha: ['', Validators.required]           // Campo obligatorio para la fecha de la cotización
  });

  // Inicialización del formulario para gestionar los insumos
  this.formInsumo = this.fb.group({
    insu_Descripcion: ['', Validators.required],    // Campo obligatorio para la descripción del insumo
    cate_Descripcion: ['', Validators.required],    // Campo obligatorio para la descripción de la categoría
    mate_Descripcion: ['', Validators.required],    // Campo obligatorio para la descripción del material
    suca_Descripcion: ['', Validators.required]     // Campo obligatorio para la descripción del subcategoría
  });

  // Inicialización del formulario para gestionar la compra de maquinaria
  this.formMaquinariaCompra = this.fb.group({
    maqu_Descripcion: ['', Validators.required],    // Campo obligatorio para la descripción de la maquinaria
    nive_Descripcion: [''],             // Campo obligatorio para el ID del nivel
    maqu_UltimoPrecioUnitario: ['', Validators.required], // Campo obligatorio para el último precio unitario de la maquinaria
    mapr_DiaHora: [null, Validators.required],      // Campo obligatorio para el día y la hora de la maquinaria
  });

  // Inicialización del formulario para gestionar la unidad de medida
  this.formUnidad = this.fb.group({
    inpp_Preciocompra: ['', Validators.required],   // Campo obligatorio para el precio de compra de la unidad
    unme_Nombre: ['', Validators.required],         // Campo obligatorio para el nombre de la unidad de medida
    inpp_Observacion: [''],                         // Campo opcional para observaciones
  });

  // Inicialización del formulario para gestionar el equipo de seguridad
  this.formEquipo = this.fb.group({
    equs_Nombre: ['', Validators.required],         // Campo obligatorio para el nombre del equipo de seguridad
    eqpp_PrecioCompra: ['', Validators.required]    // Campo obligatorio para el precio de compra del equipo de seguridad
  });
}
onRouteChange(): void {
  // Aquí puedes llamar cualquier método que desees reejecutar

  this.ngOnInit();
}

  async ngOnInit(): Promise<void> {

    this.viewState = {
      create: false,
      detail: false,
      delete: false,
      maqui: false,
      index: true,
      ordenes: false,
      ordenesEditar: false,
      Detalles: false,
      variableCambiada: false,
      createdirect: false,
      Seguridad: false
    };
    // Mostrar el spinner de carga para la tabla
    this.isTableLoading = true;

   // Llamamos a la nomenclatura de la moneda para setearla en el HTML
   let simboloMoneda = this.globalMoneda.getState();
   if (!simboloMoneda) {
     this.globalMoneda.setState();
     simboloMoneda = this.globalMoneda.getState();
   }

  // Agregar un listener al evento beforeunload
  window.addEventListener('beforeunload', this.eliminarCompraAntesDeSalir.bind(this));

   this.minDate = new Date();
   this.minDate.setFullYear(1920, 0, 1); // Año 1920, mes 0 (enero), día 1

   // Configuramos la fecha máxima como el 31 de diciembre de 2050
   this.maxDate = new Date();
   this.maxDate.setFullYear(3000, 11, 31); // Año 3000, mes 11 (diciembre), día 31

    // Llamadas iniciales a métodos para cargar datos necesarios
    this.Listado();             // Listar datos de compras
    this.ListarEmpleados();     // Listar empleados disponibles
    this.ListadoPagos();        // Listar métodos de pago
    this.ListarProyectos();     // Listar proyectos disponibles
    this.ListarBodegas();       // Listar bodegas disponibles

    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
      //console.log('Me mando el login pq el token me dio false')
    }
    this.usua_Id = parseInt(this.cookieService.get('usua_Id'));
    this.Usuario = (this.cookieService.get('usua_Usuario'));
//console.log('ssssss'+ this.Usuario)

    // Guardar el estado original de los detalles (esto se utiliza para detectar cambios posteriormente)
    this.originalDetalles = JSON.parse(JSON.stringify(this.detalles));

    // Configuración de los elementos del menú con comandos asociados
  

    this.items = [
      { 
        label: 'Editar', 
        icon: 'pi pi-user-edit', 
        command: () => {
          this.permitirEliminar = false;  // Desactivar eliminación
          this.onEditar(this.selectedCompraId);
        } 
      },
      { 
        label: 'Detalle', 
        icon: 'pi pi-eye', 
        command: () => {
          this.permitirEliminar = false;  // Desactivar eliminación
          this.onDetalles(this.selectedCompraId);
        } 
      },
      { 
        label: 'Emitir Orden', 
        icon: 'pi pi-check', 
        command: () => {
          this.permitirEliminar = false;  // Desactivar eliminación
          this.onEmitidaIndex(this.selectedCompraId);
        } 
      },
    ];
    
    this.detailItems = [
      { 
        label: 'Detalle', 
        icon: 'pi pi-eye', 
        command: () => {
          this.permitirEliminar = false;  // Desactivar eliminación
          this.onDetalles(this.selectedCompraId);
        } 
      }
    ];

    // Inicializar paneles de tabs para cotizaciones
    this.tabPanels.push({
        header: 'Cotización 1',
        index: 0,
        detalles: [],
        detallesFiltrados: [],
        subtotal: 0,
        total: 0,
        isv: 0,
        formNumero: this.fb.group({
          coen_NumeroOrden: ['', Validators.required]
        })
    });

    // Listar bodegas iniciales y asignarlas a la lista desplegable
    this.sbode.Listar().subscribe(
      (data: any[]) => {
        if (Array.isArray(data)) {
          this.Bodegas = data.map(item => ({ label: item.bode_Descripcion, value: item.bode_Id }));
          // Configurar el control de formularios para las bodegas después de cargarlas
          this.form.setControl('bodega', this.fb.array([this.createCotizacionFormGroup()]));
          this.cd.detectChanges(); // Forzar detección de cambios
        } else {
          //console.error('La respuesta no es un arreglo:', data);
        }
      },
      error => {
        //this.handleError('Error al listar bodegas', error);
      }
    );

    // Listar proyectos y asignarlos a la lista desplegable
    this.service.ListarProyectos().subscribe(
      (data: any[]) => {
        this.Proyectos = data.map(item => ({ label: item.proy_Nombre, value: item.proy_Id }))
      }
    );

    // Segunda llamada para listar bodegas
    this.sbode.Listar().subscribe(
      (data: any[]) => {
        if (Array.isArray(data)) {
          this.Bodegas = data.map(item => ({ label: item.bode_Descripcion, value: item.bode_Id }));
          // Añadir el primer formulario después de que las bodegas han sido cargadas
        } else {
          //console.error('La respuesta no es un arreglo:', data);
        }
      },
      error => {
        //console.error('Error al listar bodegas', error);
      }
    );

    const navigationState = this.navigationStateService.getState();
    //console.log(navigationState, 'navigationState');

    if (navigationState && navigationState.compra) {
      //console.log('entra navigation if');

      this.crearOrdenSimple();
      //console.log('pasaordensimple');

      this.ConImpuesto('Si');

      this.formCompra.patchValue({
        prov_Descripcion: {prov_Descripcion: navigationState.compra.prov_Descripcion, prov_Id: navigationState.compra.prov_Id},
      });

      //console.log('hola');
      await this.ListarProveedores();
      await this.HabilitarProveedores();

      //console.log('pasa habilitar proveedores');
      let event = Event;

      await navigationState.compra.detalle.forEach(element => {
        const insumoEncontrado = this.filteredCotizacionesTabla.find((x) => x.idP === element.inpp_Id);
        //console.log(this.filteredCotizacionesTabla, 'this.filteredCotizacionesTabla');

        if(insumoEncontrado){
          //console.log('entra insumo encontrado');

          this.filteredCotizacionesTabla.find((x) => x.idP === insumoEncontrado.idP).agregadoACotizacion = true;
          this.filteredCotizacionesTabla.find((x) => x.idP === insumoEncontrado.idP).cantidad = element.inpa_stock;

          this.CheckboxChange(
            event,
            element.inpa_stock,
            element.inpp_Preciocompra,
            element.inpp_Id,
            'Insumo',
            element.unme_Id,
            'no',
          );
        }
      });
    }
}

ngOnDestroy(): void {
  // Quitar el listener para evitar fugas de memoria
  window.removeEventListener('beforeunload', this.eliminarCompraAntesDeSalir.bind(this));
}

eliminarCompraAntesDeSalir(event: any): void {
  if (this.selectedCompraId && this.permitirEliminar) {
    this.service.EliminarCompra(this.selectedCompraId).subscribe(
      response => {
        //console.log('Compra eliminada al salir de la página');
      },
      error => {
        //console.error('Error al eliminar la compra al salir', error);
      }
    );
  }
}


// Método para insertar todas las Maquinarias seleccionadas
insertarTodasMaquinarias() {
  // Preparar el formulario de maquinaria antes de la inserción
  this.prepararFormularioMaquinaria();
  //console.log("Formulario de maquinaria preparado:", this.formMaquinaria);

  // Validar el formulario de maquinaria
  this.formMaquinaria.get('codm_HorasRenta').updateValueAndValidity();

  if (this.formMaquinaria.valid) {
      // Extraer los valores seleccionados del formulario
      const selectedProyectoId = this.formMaquinaria.value.proy_Id;
      const selectedEtapaId = this.formMaquinaria.value.etpr_Id;
      const selectedActividadId = this.formMaquinaria.value.acet_Id;
      const horasRenta = this.formMaquinaria.value.codm_HorasRenta.toString();

      // Crear una lista de maquinarias a insertar basadas en los detalles filtrados donde `codt_InsumoOMaquinariaOEquipoSeguridad = 0`
      const maquinariasAInsertar = this.tabPanels.flatMap(panel =>
          panel.detallesFiltrados
              .filter(detalle => detalle.codt_InsumoOMaquinariaOEquipoSeguridad === 0)  // Filtrar solo maquinarias
              .map(detalle => ({
                  codt_Id: detalle.codt_Id,
                  codm_HorasRenta: horasRenta,
                  acet_Id: selectedActividadId,
                  proy_Id: selectedProyectoId,
                  etpr_Id: selectedEtapaId,
                  codm_Cantidad: detalle.codt_cantidad,
                  usua_Creacion: this.usua_Id,
              }))
      );

      let exitos = 0;  // Contador de inserciones exitosas
      let errores = 0; // Contador de errores

      // Iterar sobre cada maquinaria a insertar y realizar la inserción
      maquinariasAInsertar.forEach(maquinaria => {
          this.service.InsertarCompraDetalleDestinoPorProyectoExacto(maquinaria).subscribe(
              (respuesta: Respuesta) => {
                  //console.log('Respuesta de inserción:', respuesta);
                  if (respuesta.data.codeStatus === 1) {
                      exitos++;

                      // Actualizar la lista de maquinarias después de una inserción exitosa
                      this.service.ListarCompraDetalleDestinoMaquinaria(maquinaria.codt_Id).subscribe(
                          (data: any) => {
                              this.maquinarias = data;
                              this.totalingresados = this.maquinarias.reduce((acc, item) => acc + item.codm_Cantidad, 0);

                              // Buscar y actualizar la cantidad verificada en el detalle correspondiente solo para maquinarias (codt_InsumoOMaquinariaOEquipoSeguridad = 0)
                              let detalleEncontrado: any = null;
                for (const tabPanel of this.tabPanels) {
                  const detallesArray = tabPanel.detallesFiltrados;
                  detalleEncontrado = detallesArray.find(d => d.codt_Id === maquinaria.codt_Id && d.codt_InsumoOMaquinariaOEquipoSeguridad === 0);
                  if (detalleEncontrado) {
                    detalleEncontrado.cantidadVerificada = this.totalingresados === detalleEncontrado.codt_cantidad ? 1 : 0;

                    // Deshabilitar el input si la cantidad está verificada
                    if (detalleEncontrado.cantidadVerificada === 1) {
                      detalleEncontrado.cantidadParcialEnviada = 1;
                    }

                    break;
                  }
                }

                if (!detalleEncontrado) {
                  //console.error('No se encontró el detalle con codt_Id:', maquinaria.codt_Id);
                }

                this.cd.detectChanges(); // Forzar la detección de cambios
              },
                          error => {
                              //console.error('Error al listar destinos de maquinaria', error);
                              errores++;
                          }
                      );
                  } else {
                      errores++;
                      //console.log('Inserción fallida:', respuesta.success);
                  }

                  // Verificar si se han completado todas las inserciones (exitosas o fallidas)
                  if (exitos + errores === maquinariasAInsertar.length) {
                      if (exitos > 0) {
                          this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
                      }
                      if (errores > 0) {
                        this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No puede ingresar más de la cantidad definida a la ubicación.', life: 3000 });
                    }
                      // Resetea el formulario para restablecer los valores iniciales
                      this.formde.reset();
                      this.formde.reset({
                          proy_Id: null,
                          etpr_Id: null,
                          acet_Id: null,
                      });
                      this.mostrarMaquinaria = false;
                  }
              },
              error => {
                  errores++;
                  //console.error('Error al insertar maquinaria', error);

                  // Verificar si se han completado todas las inserciones (exitosas o fallidas)
                  if (exitos + errores === maquinariasAInsertar.length) {
                      if (exitos > 0) {
                          this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass:'iziToast-custom',detail: 'Insertado con Éxito.', life: 3000 });
                      }
                      if (errores > 0) {
                        this.messageService.add({ severity: 'warn', summary: 'Advertencia',  styleClass:'iziToast-custom',detail: 'No puede ingresar más de la cantidad definida a la ubicación.', life: 3000 });
                    }
                      // Resetea el formulario para restablecer los valores iniciales
                      this.formde.reset();
                      this.formde.reset({
                          proy_Id: null,
                          etpr_Id: null,
                          acet_Id: null,
                      });
                      this.mostrarMaquinaria = false;
                  }
              }
          );
      });
  } else {
      this.submitted = true;  // Marcar el formulario como enviado para activar las validaciones
  }
}




prepararFormularioMaquinaria() {
  // Asignar valores predeterminados si no se han especificado
  this.formMaquinaria.patchValue({
      codm_HorasRenta: this.formMaquinaria.value.codm_HorasRenta || '1',  // Valor predeterminado para las horas de renta
      acet_Id: this.formMaquinaria.value.acet_Id || 81,  // ID predeterminado de la actividad
      proy_Id: this.formMaquinaria.value.proy_Id || 26,  // ID predeterminado del proyecto
      etpr_Id: this.formMaquinaria.value.etpr_Id || 36,  // ID predeterminado de la etapa
      codm_Cantidad: this.formMaquinaria.value.codm_Cantidad || '1',  // Valor predeterminado para la cantidad
  });

  this.formMaquinaria.updateValueAndValidity();  // Actualizar el estado de validez del formulario
}




actualizarListadoDestinosMaquinaria(codt_Id: number) {
  // Listar los destinos de maquinaria basados en el ID de la compra de destino
  this.service.ListarCompraDetalleDestinoMaquinaria(codt_Id).subscribe(
    (data: any) => {
      this.maquinarias = data;
      this.totalingresados = this.maquinarias.reduce((acc, item) => acc + item.codm_Cantidad, 0);  // Calcular el total ingresado
    },
    error => {
      //console.error('Error al listar destinos de maquinaria', error);
    }
  );
}



EnviarDireccionMaquinaria() {
  //console.log("Formulario de dirección de maquinaria:", this.formMaquinaria);

  // Validar el formulario antes de continuar
  this.formMaquinaria.get('codm_HorasRenta').updateValueAndValidity();

  if (this.formMaquinaria.valid) {
      // Crear el modelo de vista para enviar la información
      const EnvioViewModel: any = {
          codt_Id: this.iddetallecompra,
          codm_HorasRenta: this.formMaquinaria.value.codm_HorasRenta.toString(),
          acet_Id: this.formMaquinaria.value.acet_Id,
          proy_Id: this.formMaquinaria.value.proy_Id,
          etpr_Id: this.formMaquinaria.value.etpr_Id,
          codm_Cantidad: this.formMaquinaria.value.codm_Cantidad,
          usua_Creacion: this.usua_Id,
      };

      //console.log('EnvioViewModel:', EnvioViewModel);

      // Enviar los datos de maquinaria al servicio de inserción
      this.service.InsertarCompraDetalleDestinoPorProyectoExacto(EnvioViewModel).subscribe(
          (respuesta: Respuesta) => {
              //console.log('Respuesta de inserción:', respuesta);
              if (respuesta.data.codeStatus == 1) {
                  this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });

                  // Actualizar la lista de destinos de maquinaria después de una inserción exitosa
                  this.service.ListarCompraDetalleDestinoMaquinaria(this.iddetallecompra).subscribe(
                      (data: any) => {
                          this.maquinarias = data;
                          this.totalingresados = this.maquinarias.reduce((acc, item) => acc + item.codm_Cantidad, 0);

                           // Buscar y actualizar la cantidad verificada en el detalle correspondiente
                          let detalleEncontrado: any = null;
                          for (const tabPanel of this.tabPanels) {
                            const detallesArray = tabPanel.detallesFiltrados;
                            detalleEncontrado = detallesArray.find(d => d.codt_Id === this.iddetallecompra);
                            if (detalleEncontrado) {
                              detalleEncontrado.cantidadVerificada = this.totalingresados === detalleEncontrado.codt_cantidad ? 1 : 0;

                              // Deshabilitar el input si la cantidad está verificada o si se insertó con éxito al menos una maquinaria
                              if (detalleEncontrado.cantidadVerificada === 1 || this.totalingresados > 0) {
                                detalleEncontrado.cantidadParcialEnviada = 1;
                              }

                              break;
                            }
                          }

                          if (!detalleEncontrado) {
                            //console.error('No se encontró el detalle con codt_Id:', this.iddetallecompra);
                          }

                          this.cd.detectChanges(); // Forzar la detección de cambios
                      },
                      error => {
                          //console.error('Error al listar destinos de maquinaria', error);
                          // Mostrar un mensaje de advertencia en caso de que la cantidad ingresada supere la cantidad permitida
                          this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No puede ingresar más de la cantidad definida.', life: 3000 });
                      }

                  );
                  const navigationState = this.navigationStateService.getState();
                  if( navigationState && navigationState.compra ){

                  }
              } else {
                  // Mostrar un mensaje de advertencia en caso de fallo
                  this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No puede ingresar más de la cantidad definida.', life: 3000 });
                  //console.log('Inserción fallida:', respuesta.success);
              }
          },
          error => {
              //console.error('Error al insertar destino de maquinaria', error);
              // Mostrar un mensaje de advertencia en caso de error de inserción
              this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No puede ingresar más de la cantidad definida.', life: 3000 });
          }
      );
  } else {
      this.submitted = true;  // Marcar el formulario como enviado para activar las validaciones
  }
}


 // Método para listar todos los proyectos disponibles
ListarProyectos() {
  this.service.ListarProyectos().subscribe(
    (data: any[]) => {
      data.sort((a, b) => a.proy_Nombre.localeCompare(b.proy_Nombre));
      // Asignar los proyectos a la lista desplegable de proyectos
      this.Proyectos = data.map(item => ({ label: item.proy_Nombre, value: item.proy_Id }));
    }
  );
}

// Método para listar todas las bodegas disponibles
ListarBodegas() {
  this.sbode.Listar().subscribe(
    (data: any[]) => {
      if (Array.isArray(data)) {
        // Asignar las bodegas a la lista desplegable de bodegas
        this.Bodegas = data.map(item => ({ label: item.bode_Descripcion, value: item.bode_Id }));
        this.cd.detectChanges(); // Forzar la detección de cambios en la UI
      } else {
        //console.error('La respuesta no es un arreglo:', data);
      }
    },
    error => {
      //console.error('Error al listar bodegas', error);
    }
  );
}

// Método para mostrar los campos de insumos en el formulario
mostrarCamposInsumo() {
  this.mostrarInsumo = true;            // Mostrar los campos de insumos
  this.mostrarMaquinaria = false;       // Ocultar los campos de maquinaria
  this.mostrarEquipoSeguridad = false;  // Ocultar los campos de equipo de seguridad

  this.formde.reset();
  this.formEnvio.reset();
  this.bodegaOproycto = 'Bodega';
  this.check = false;
  this.EtapasPorProyectos = [];
  this.ActividadesPorEtapa = [];
}

// Método para mostrar los campos de maquinaria en el formulario
mostrarCamposMaquinaria() {
  this.mostrarInsumo = false;           // Ocultar los campos de insumos
  this.mostrarMaquinaria = true;        // Mostrar los campos de maquinaria
  this.mostrarEquipoSeguridad = false;  // Ocultar los campos de equipo de seguridad
}

// Método para mostrar los campos de equipo de seguridad en el formulario
mostrarCamposEquipoSeguridad() {
  this.mostrarInsumo = false;           // Ocultar los campos de insumos
  this.mostrarMaquinaria = false;       // Ocultar los campos de maquinaria
  this.mostrarEquipoSeguridad = true;   // Mostrar los campos de equipo de seguridad
}

// Método para enviar la dirección del insumo o maquinaria seleccionada
EnviarDireccion() {
  //console.log("Enviando dirección de insumo/maquinaria:", this.formEnvio);

  if (this.formEnvio.valid) {
      // Determinar si es un proyecto o una bodega
      const isProyecto = this.formEnvio.value.codd_ProyectoOBodega;

      // Crear el modelo de datos para enviar la información
      const EnvioViewModel: any = {
          codt_Id: this.formEnvio.value.codt_Id,
          codd_ProyectoOBodega: isProyecto,
          codd_Boat_Id: isProyecto ? this.formEnvio.value.acet_Id : this.formEnvio.value.codd_Boat_Id,
          codd_Cantidad: this.formEnvio.value.codd_Cantidad,
          usua_Creacion: this.usua_Id,
      };

      //console.log('EnvioViewModel:', EnvioViewModel);

      // Enviar los datos al servicio para insertar el destino
      this.service.InsertarCompraDetalleDestinoExacto(EnvioViewModel).subscribe(
          (respuesta: Respuesta) => {
              //console.log('Respuesta del servicio:', respuesta);
              if (respuesta.success) {
                  // Mostrar un mensaje de éxito
                  this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });

                  // Actualizar la lista de destinos después de la inserción
                  this.service.ListarCompraDetalleDestino(EnvioViewModel.codt_Id).subscribe(
                      (data: any) => {
                          this.destinos = data;
                          this.totalingresados = this.destinos.reduce((acc, item) => acc + item.codd_Cantidad, 0);

                          // Actualizar `cantidadVerificada` en el detalle correspondiente
                          let detalleEncontrado: any = null;
                          for (const tabPanel of this.tabPanels) {
                            const detallesArray = tabPanel.detallesFiltrados;
                            detalleEncontrado = detallesArray.find(d => d.codt_Id === EnvioViewModel.codt_Id);
                            if (detalleEncontrado) {
                              // Actualizar cantidadVerificada
                              detalleEncontrado.cantidadVerificada = this.totalingresados === detalleEncontrado.codt_cantidad ? 1 : 0;

                              // Deshabilitar el input si el detalle fue verificado o si se insertó con éxito al menos uno
                              if (detalleEncontrado.cantidadVerificada === 1 || this.totalingresados > 0) {
                                detalleEncontrado.cantidadParcialEnviada = 1;
                              }
                              break;
                            }
                          }

                          this.cd.detectChanges();  // Forzar la detección de cambios
                        },
                      error => {
                          //console.error('Error al listar destinos de insumo/maquinaria', error);
                          // Mostrar un mensaje de advertencia en caso de que la cantidad ingresada supere la cantidad permitida
                          this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No puede ingresar más de la cantidad definida.', life: 3000 });
                      }
                  );


                  //console.log(this.todosLosDetalles);

              } else {
                  // Mostrar un mensaje de advertencia en caso de fallo
                  this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No puede ingresar más de la cantidad definida.', life: 3000 });
                  //console.log('Inserción fallida:', respuesta.success);
              }
          },
          error => {
              //console.error('Error al insertar insumo/maquinaria', error);
              // Mostrar un mensaje de advertencia en caso de error de inserción
              this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No puede ingresar más de la cantidad definida.', life: 3000 });
          }
      );
  } else {
      this.submitted = true;  // Marcar el formulario como enviado para activar las validaciones
  }
}

// Método para insertar todos los insumos seleccionados
insertarTodosInsumos() {
  //console.log("Valores del formulario de destino:", this.formde.value);

  if (this.formde.valid) {
      // Determinar si es un proyecto o una bodega
      const isProyecto = this.formde.value.destino;

      // Filtrar y crear una lista de insumos a insertar basados en los detalles filtrados y en el valor de `codt_InsumoOMaquinariaOEquipoSeguridad`
      const insumosAInsertar = this.tabPanels.flatMap(panel =>
          panel.detallesFiltrados
              .filter(detalle => detalle.codt_InsumoOMaquinariaOEquipoSeguridad === 1)  // Filtrar los insumos que son del tipo 1
              .map(detalle => {
                  const insumo = {
                      codt_Id: detalle.codt_Id,
                      codd_ProyectoOBodega: isProyecto,
                      codd_Boat_Id: isProyecto ? this.formde.value.acet_Id : this.formde.value.bodega,
                      codd_Cantidad: detalle.codt_cantidad,
                      usua_Creacion: this.usua_Id,
                  };
                  //console.log("Insumo a insertar:", insumo);
                  return insumo;
              })
      );

      let exitos = 0;  // Contador de inserciones exitosas
      let errores = 0; // Contador de errores

      // Iterar sobre cada insumo a insertar y realizar la inserción
      insumosAInsertar.forEach(insumo => {
          //console.log("Enviando insumo:", insumo);

          this.service.InsertarCompraDetalleDestinoExacto(insumo).subscribe(
              (respuesta: Respuesta) => {
                  //console.log('Respuesta del servicio:', respuesta);
                  if (respuesta.success) {
                      // Actualizar la lista de destinos después de una inserción exitosa
                      this.service.ListarCompraDetalleDestino(insumo.codt_Id).subscribe(
                          (data: any) => {
                              this.destinos = data;
                              this.totalingresados = this.destinos.reduce((acc, item) => acc + item.codd_Cantidad, 0);

                              // Actualizar `cantidadVerificada` en el detalle correspondiente
                              let detalleEncontrado: any = null;
                              for (const tabPanel of this.tabPanels) {
                                const detallesArray = tabPanel.detallesFiltrados;
                                detalleEncontrado = detallesArray.find(d => d.codt_Id === insumo.codt_Id && d.codt_InsumoOMaquinariaOEquipoSeguridad === 1);
                                if (detalleEncontrado) {
                                  detalleEncontrado.cantidadVerificada = this.totalingresados === detalleEncontrado.codt_cantidad ? 1 : 0;

                                  // Deshabilitar el input si la cantidad está verificada
                                  if (detalleEncontrado.cantidadVerificada === 1) {
                                    detalleEncontrado.cantidadParcialEnviada = 1;
                                  }

                                  break;
                                }
                              }

                              if (!detalleEncontrado) {
                                //console.error('No se encontró el detalle con codt_Id:', insumo.codt_Id);
                              }

                              this.cd.detectChanges(); // Forzar la detección de cambios
                            },
                          error => {
                              //console.error('Error al listar destinos de insumo', error);
                              errores++;
                          }
                      );

                      exitos++;
                  } else {
                      //console.log('Inserción fallida:', respuesta.success);
                      errores++;
                  }

                  // Verificar si se han completado todas las inserciones (exitosas o fallidas)
                  if (exitos + errores === insumosAInsertar.length) {
                      if (exitos > 0) {
                          // Mostrar un mensaje de éxito si hubo al menos un éxito
                          this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
                      }
                      if (errores > 0) {
                        this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No puede ingresar más de la cantidad definida a la ubicación.', life: 3000 });
                    }
                  }
              },
              error => {
                  //console.error('Error al insertar insumo', error);
                  errores++;

                  // Verificar si se han completado todas las inserciones (exitosas o fallidas)
                  if (exitos + errores === insumosAInsertar.length) {
                      if (exitos > 0) {
                          this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
                      }
                      if (errores > 0) {
                        this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No puede ingresar más de la cantidad definida a la ubicación.', life: 3000 });
                    }
                  }
              }
          );
      });
  } else {
      this.submitted = true;  // Marcar el formulario como enviado para activar las validaciones
  }
}


// Método para insertar todos los equipos de seguridad seleccionados
insertarTodosequiposdeSeguridad() {
  //console.log("Valores del formulario de destino:", this.formde.value);

  if (this.formde.valid) {
      // Determinar si es un proyecto o una bodega
      const isProyecto = this.formde.value.destino;

      // Filtrar y crear una lista de equipos de seguridad a insertar basados en los detalles filtrados y en el valor de `codt_InsumoOMaquinariaOEquipoSeguridad`
      const equiposAInsertar = this.tabPanels.flatMap(panel =>
          panel.detallesFiltrados
              .filter(detalle => detalle.codt_InsumoOMaquinariaOEquipoSeguridad === 2)  // Filtrar los equipos que son del tipo 2
              .map(detalle => {
                  const equipo = {
                      codt_Id: detalle.codt_Id,
                      codd_ProyectoOBodega: isProyecto,
                      codd_Boat_Id: isProyecto ? this.formde.value.acet_Id : this.formde.value.bodega,
                      codd_Cantidad: detalle.codt_cantidad,
                      usua_Creacion: this.usua_Id,
                  };
                  //console.log("Equipo a insertar:", equipo);
                  return equipo;
              })
      );

      let exitos = 0;  // Contador de inserciones exitosas
      let errores = 0; // Contador de errores

      // Iterar sobre cada equipo de seguridad a insertar y realizar la inserción
      equiposAInsertar.forEach(equipo => {
          //console.log("Enviando equipo:", equipo);

          this.service.InsertarCompraDetalleDestinoExacto(equipo).subscribe(
              (respuesta: Respuesta) => {
                  //console.log('Respuesta del servicio:', respuesta);
                  if (respuesta.success) {
                      // Actualizar la lista de destinos después de una inserción exitosa
                      this.service.ListarCompraDetalleDestino(equipo.codt_Id).subscribe(
                          (data: any) => {
                              this.destinos = data;
                              this.totalingresados = this.destinos.reduce((acc, item) => acc + item.codd_Cantidad, 0);

                              // Actualizar `cantidadVerificada` en el detalle correspondiente solo para equipos de seguridad (codt_InsumoOMaquinariaOEquipoSeguridad = 2)
                              let detalleEncontrado: any = null;
                for (const tabPanel of this.tabPanels) {
                  const detallesArray = tabPanel.detallesFiltrados;
                  detalleEncontrado = detallesArray.find(d => d.codt_Id === equipo.codt_Id && d.codt_InsumoOMaquinariaOEquipoSeguridad === 2);
                  if (detalleEncontrado) {
                    detalleEncontrado.cantidadVerificada = this.totalingresados === detalleEncontrado.codt_cantidad ? 1 : 0;

                    // Deshabilitar el input si la cantidad está verificada
                    if (detalleEncontrado.cantidadVerificada === 1) {
                      detalleEncontrado.cantidadParcialEnviada = 1;
                    }

                    break;
                  }
                }

                if (!detalleEncontrado) {
                  //console.error('No se encontró el detalle con codt_Id:', equipo.codt_Id);
                }

                this.cd.detectChanges(); // Forzar la detección de cambios
              },
                          error => {
                              //console.error('Error al listar destinos de equipo de seguridad', error);
                              errores++;
                          }
                      );

                      exitos++;
                  } else {
                      //console.log('Inserción fallida:', respuesta.success);
                      errores++;
                  }

                  // Verificar si se han completado todas las inserciones (exitosas o fallidas)
                  if (exitos + errores === equiposAInsertar.length) {
                      if (exitos > 0) {
                          // Mostrar un mensaje de éxito si hubo al menos un éxito
                          this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
                      }
                      if (errores > 0) {
                        this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No puede ingresar más de la cantidad definida a la ubicación.', life: 3000 });
                    }
                  }
              },
              error => {
                  //console.error('Error al insertar equipo de seguridad', error);
                  errores++;

                  // Verificar si se han completado todas las inserciones (exitosas o fallidas)
                  if (exitos + errores === equiposAInsertar.length) {
                      if (exitos > 0) {
                          this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
                      }
                      if (errores > 0) {
                        this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No puede ingresar más de la cantidad definida a la ubicación.', life: 3000 });
                    }
                  }
              }
          );
      });
  } else {
      this.submitted = true;  // Marcar el formulario como enviado para activar las validaciones
  }
}

// Método para actualizar la lista de destinos de un insumo específico
actualizarListadoDestinos(codt_Id: number) {
  this.service.ListarCompraDetalleDestino(codt_Id).subscribe(
      (data: any) => {
          this.destinos = data;
          this.totalingresados = this.destinos.reduce((acc, item) => acc + item.codd_Cantidad, 0);  // Calcular el total ingresado
      },
      error => {
          //console.error('Error al listar destinos', error);
      }
  );
}

// Métodos para verificar si un tab tiene insumos, maquinaria, equipo de seguridad o una combinación de ellos
hasInsumo(tab: any): boolean {
  return tab.detallesFiltrados.some((detalle: any) => detalle.codt_InsumoOMaquinariaOEquipoSeguridad === 1); // Verifica si el tab tiene insumos
}

hasMaquinaria(tab: any): boolean {
  return tab.detallesFiltrados.some((detalle: any) => detalle.codt_InsumoOMaquinariaOEquipoSeguridad === 0); // Verifica si el tab tiene maquinaria
}

hasEquipoSeguridaaad(tab: any): boolean {
  return tab.detallesFiltrados.some((detalle: any) => detalle.codt_InsumoOMaquinariaOEquipoSeguridad === 2); // Verifica si el tab tiene equipo de seguridad
}

hasBoth(tab: any): boolean {
  return this.hasInsumo(tab) && this.hasMaquinaria(tab) && this.hasEquipoSeguridaaad(tab); // Verifica si el tab tiene insumos, maquinaria y equipo de seguridad
}

// Método para seleccionar un detalle de compra y actualizar los formularios y listas correspondientes
selectCompraDetalle(detalle: any) {
  //console.log("Seleccionando detalle de compra:", detalle);
  this.iddetallecompra = detalle.codt_Id;  // Guardar el ID del detalle seleccionado
  this.detallecantidad = detalle.codt_cantidad;  // Guardar la cantidad del detalle seleccionado
  this.maquinariaono = detalle.codt_InsumoOMaquinariaOEquipoSeguridad;  // Guardar el tipo de insumo/maquinaria/equipo de seguridad
  this.cotizaciondetalleId = detalle.code_Id;  // Guardar el ID del detalle de cotización
  this.preciototal = detalle.codt_preciocompra;  // Guardar el precio total del detalle
  this.fechacontratacion = detalle.codt_FechaCreacion;  // Guardar la fecha de creación del detalle

  // Actualizar el formulario de envío con los valores del detalle seleccionado
  this.formEnvio.patchValue({
      codt_Id: detalle.codt_Id,
      codd_Cantidad: detalle.codt_cantidad
  });

  if (this.maquinariaono === 0) {
      // Si es Maquinaria, buscar más detalles de la cotización y actualizar el formulario de maquinaria
      this.service.BuscarCotizacionDetalle(this.cotizaciondetalleId).subscribe(
          (data: any) => {
              this.idmaquinaria = data.cime_Id;
              //console.log("ID de maquinaria encontrado:", this.idmaquinaria);
          }
      );

      this.formMaquinaria.patchValue({
          codm_Cantidad: detalle.codt_cantidad,
          rmac_PrecioTotal: this.preciototal,
          rmac_FechaContratacion: this.fechacontratacion,
          mapr_Id: this.idmaquinaria,
          codm_HorasRenta: detalle.codt_Renta
      });
  } else if (this.maquinariaono === 2) {
      // Si es Equipo de Seguridad, buscar más detalles de la cotización y actualizar el formulario de envío
      this.service.BuscarCotizacionDetalle(this.cotizaciondetalleId).subscribe(
          (data: any) => {
              this.idequiposeguridad = data.cime_Id;
              //console.log("ID de equipo de seguridad encontrado:", this.idequiposeguridad);
          }
      );

      this.formEnvio.patchValue({
          codt_Id: detalle.codt_Id,
          codd_Cantidad: detalle.codt_cantidad
      });
  }

  // Listar los destinos asociados al detalle de compra seleccionado
  this.service.ListarCompraDetalleDestino(detalle.codt_Id).subscribe(
      (data: any) => {
          this.destinos = data;
          this.totalingresados = this.destinos.reduce((acc, item) => acc + item.codd_Cantidad, 0);  // Calcular el total ingresado
      },
      error => {
          //console.error('Error al listar destinos', error);
      }
  );

  // Decidir si el destino es un Proyecto o una Bodega y cargar los datos correspondientes
  if (this.formEnvio.value.codd_ProyectoOBodega === true) {
      this.bodegaOproycto = 'Proyecto';  // Cambiar el estado para indicar que es un proyecto
      this.check = true;

      this.service.ListarProyectos().subscribe(
          (data: any[]) => {
              if (Array.isArray(data)) {
                data.sort((a, b) => a.proy_Nombre.localeCompare(b.proy_Nombre));
                  this.BodegasUni = data.map(item => ({ label: item.proy_Nombre, value: item.proy_Id }));  // Cargar los proyectos en la lista desplegable
              } else {
                  //console.error('La respuesta no es un arreglo:', data);
              }
          },
          error => {
              //this.handleError('Error al listar proyectos', error);
          }
      );
  } else {
      this.sbode.Listar().subscribe(
          (data: any[]) => {
              if (Array.isArray(data)) {
                data.sort((a, b) => a.bode_Descripcion.localeCompare(b.bode_Descripcion));
                  this.BodegasUni = data.map(item => ({ label: item.bode_Descripcion, value: item.bode_Id }));  // Cargar las bodegas en la lista desplegable
              } else {
                  //console.error('La respuesta no es un arreglo:', data);
              }
          },
          error => {
              //this.handleError('Error al listar bodegas', error);
          }
      );
  }
}



  // Método para manejar la selección de una fila en la tabla
onRowSelect(event: any): void {
  this.permitirEliminar = false;
  const selectedCompra = event.data;
  this.id = selectedCompra.coen_Id; // Asignar el ID de la compra seleccionada
  //console.log("ID encabezado: " + this.id);

  // Validar si la compra seleccionada tiene un ID válido
  if (!selectedCompra || selectedCompra.coen_Id === null || selectedCompra.coen_Id === undefined) {
    this.id = selectedCompra.coen_Id;
    //console.error('Error: coen_Id es null o undefined para el elemento seleccionado:', event.data);
    this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'ID de la compra no es válido.' });
    return;
  }

  this.selectedCompraId = selectedCompra.coen_Id; // Asignar el ID de la compra seleccionada
  this.cargarDetallesCompra(this.selectedCompraId); // Cargar los detalles de la compra seleccionada
  //console.log('Selected Compra ID:', this.selectedCompraId);
}

// Método para cargar los detalles de la compra seleccionada
cargarDetallesCompra(detalles: any): void {
  //console.log(this.detalles);
  this.service.BuscarPorEncabezadoId(detalles).subscribe(
    (data: CompraEncabezado[]) => {
      //console.log('Datos recibidos del servicio:', data);

      // Agrupar los detalles por coti_Id
      const groupedDetalles = data.reduce((acc, detalle) => {
        if (!acc[detalle.coen_Id]) {
          acc[detalle.coen_Id] = [];
        }
        acc[detalle.coen_Id].push(detalle);
        return acc;
      }, {});

      //console.log('Detalles agrupados por coti_Id:', groupedDetalles);

      // Limpiar tabPanels
      this.tabPanels = [];

      let numero = 1;
      // Crear un TabPanel por cada coti_Id
      Object.keys(groupedDetalles).forEach((coen_Id, index) => {
        const detalles = groupedDetalles[coen_Id];
        //console.log("El COTI ID es:", coen_Id);
        //console.log(detalles);

        this.tabPanels.push({
          header: `Factura #${numero}`,
          index: index,
          proveedor: detalles[0]?.cotizacionProveedor, // Establecer el proveedor aquí
          detalles: detalles,
          detallesFiltrados: detalles.filter(d => d.agregadoACotizacion !== false),  // Filtra correctamente
          subtotal: 0,
          total: 0,
          isv: 0,
          formNumero: this.fb.group({
            coen_NumeroOrden: ['']
          })
        });
        numero++;
      });

      // Verificar que los detalles tengan codt_Id
      this.tabPanels.forEach(panel => {
        //console.log(`Detalles del panel ${panel.header}:`, panel.detalles);
        panel.detalles.forEach(detalle => {
          if (!detalle.codt_Id) {
            console.warn(`Detalle sin codt_Id en ${panel.header}:`, detalle);
          }
        });
      });

      //console.log("Llega hasta aquí");

      // Actualizar totales y detectar cambios
      //console.log("Los length de paneles son: " + this.tabPanels.length)
      this.tabPanels.forEach(panel => {
        this.updateTotals(panel); // Actualizar totales en el TabPanel

        panel.detalles.forEach(detalle => {
          if (detalle.codt_InsumoOMaquinariaOEquipoSeguridad === 0) {
            this.viewState.variableCambiada = true; // Marcar que la variable ha cambiado si el detalle es maquinaria
          }
        });
      });

      //console.log(this.tabPanels);
      //this.cd.detectChanges(); // Forzar detección de cambios si es necesario
    },
    error => {
      //this.handleError('Error al cargar detalles de la compra', error); // Manejar errores en la carga de detalles
    }
  );
}

// Método para expandir una fila en la tabla
onRowExpand(event: any) {
  this.expandedRows = { ...this.expandedRows, [event.data.coen_Id]: true }; // Marcar la fila como expandida
}

// Método para colapsar una fila en la tabla
onRowCollapse(event: any) {
  const { [event.data.coen_Id]: removed, ...rest } = this.expandedRows;
  this.expandedRows = rest; // Remover la fila de las filas expandidas
}

// Método para manejar cambios en los inputs dentro de los detalles de cotización
onInputChange(detalle: any, cotizacionIndex: number, detalleIndex: number): void {
  //console.log(detalle)
  //console.log(detalleIndex)
  //console.log(cotizacionIndex)
  const cotizacionFormGroup = this.cotizacionesArray.controls[cotizacionIndex] as FormGroup;
  //console.log(cotizacionFormGroup)
  const cantidadControl = cotizacionFormGroup.get(`code_Cantidad_${detalleIndex}`);
  const precioControl = cotizacionFormGroup.get(`code_PrecioCompra_${detalleIndex}`);
  const unidadControl = cotizacionFormGroup.get(`unidadmedidaorenta_${detalleIndex}`);
  const agregadoACotizacionControl = cotizacionFormGroup.get(`agregadoACotizacion_${detalleIndex}`);
  //console.log(detalle.codt_preciocompra)

  let IndexArreglo = this.todosLosDetalles[cotizacionIndex].findIndex(coti => coti.code_Id === detalle.code_Id);
  this.todosLosDetalles[cotizacionIndex][IndexArreglo].code_PrecioCompra = detalle.codt_preciocompra
  this.todosLosDetalles[cotizacionIndex][IndexArreglo].code_Cantidad = detalle.codt_cantidad
  this.todosLosDetalles[cotizacionIndex][IndexArreglo].unidadMedidaoRenta = unidadControl?.value;



  if (cantidadControl && precioControl && agregadoACotizacionControl.value) {
    // Solo actualizar si el checkbox está seleccionado
    detalle.codt_cantidad = cantidadControl.value;  // Actualizar cantidad en el detalle
    detalle.codt_preciocompra = precioControl.value;  // Actualizar precio de compra en el detalle

    // Asegurarse de actualizar el detalle con la unidadMedidaoRenta si existe
    if (unidadControl) {
      detalle.unidadMedidaoRenta = unidadControl.value;
    }

    // Actualizar lista de detalles seleccionados si el checkbox está marcado
    const indexInSelected = this.selectedDetalles.findIndex(d => d.code_Id === detalle.code_Id);
    if (indexInSelected > -1) {
      this.selectedDetalles[indexInSelected] = detalle;  // Actualizar el detalle en la lista seleccionada
    }
  }

  this.updateTabPanelData(cotizacionIndex);  // Actualizar los datos del TabPanel
  this.cd.detectChanges();  // Forzar la actualización del template
}



// Método para añadir un detalle de destino
addDetalleDestino(detalle: any) {
  const detalleForm = this.fb.group({
    codd_Cantidad: [detalle.codd_Cantidad, Validators.required],
    codd_Boat_Id: [detalle.codd_Boat_Id, Validators.required],
    codd_ProyectoOBodega: [detalle.codd_ProyectoOBodega, Validators.required],
  });
  this.DestinosArray.push(detalleForm); // Añadir el formulario de destino a la lista
}

// Método para obtener el array de destinos del formulario
get DestinosArray(): FormArray {
  return this.formdeex.get('DestinosArray') as FormArray; // Obtener el FormArray de destinos
}

// Método para crear un FormGroup para un destino
destinoFormGroup(): FormGroup {
  return this.fb.group({
    codd_Id: ['', Validators.required],
    codd_Cantidad: ['', Validators.required],
    codd_ProyectoOBodega: ['', Validators.required],
    codd_Boat_Id: ['', Validators.required],
    bodegas: [this.Bodegas] // Asignar las bodegas al FormGroup
  });
}

shouldDisplayMedidaColumn(tab: any): boolean {
  return tab.detalles.some((detalle: any) => detalle.codt_InsumoOMaquinariaOEquipoSeguridad !== 2);
}

shouldDisplayMedidaCelda(detalle: any): boolean {
  return detalle.codt_InsumoOMaquinariaOEquipoSeguridad !== 2;
}

shouldDisplayRentaColumn(tab: any): boolean {
  return !tab.detalles.some((detalle: any) => detalle.codt_InsumoOMaquinariaOEquipoSeguridad === 1 || detalle.codt_InsumoOMaquinariaOEquipoSeguridad === 2);
}

shouldDisplayRentaCelda(detalle: any): boolean {
  return detalle.codt_InsumoOMaquinariaOEquipoSeguridad !== 1 && detalle.codt_InsumoOMaquinariaOEquipoSeguridad !== 2;
}

// Método para manejar la selección de un detalle de destino
onSelectDestinoDetalle(destino: any) {
  if (!destino || !destino.codd_Id) {
    //console.error('El destino seleccionado no es válido', destino); // Validar la selección
    return;
  }
  this.iddetalledestino = destino.codd_Id; // Asignar el ID del destino seleccionado
  //console.log(destino.codd_Id);
}

// Método para manejar la selección de un destino de maquinaria
onSelectDestinoDetalleMaquinaria(maquinaria: any) {
  if (!maquinaria || !maquinaria.codm_Id) {
    //console.error('El destino seleccionado no es válido', maquinaria); // Validar la selección
    return;
  }
  this.iddetalledestinomaquinaria = maquinaria.codm_Id; // Asignar el ID de la maquinaria seleccionada
  //console.log(maquinaria.codm_Id);

  // Actualizar formulario de maquinaria con los datos seleccionados
  this.formMaquinaria.patchValue({
    codm_HorasRenta: maquinaria.codm_HorasRenta,
    acet_Id: maquinaria.acet_Id,
    proy_Id: maquinaria.proy_Id,
    etpr_Id: maquinaria.etpr_Id
  });
}

// Método para crear un destino específico
onCrearDestinoEspecifico() {
  const DestinoEnviar: any = {
      codd_Id: this.unicoDestino.codd_Id,  // Asigna el ID del destino
      codt_Id: this.unicoDestino.codt_Id,  // Asigna el ID del detalle de la compra
  };

  if (this.unicoDestino) {
      // Llama al servicio para buscar el destino del detalle de la compra
      this.service.BuscarCompraDetalleDestino(this.iddetalledestino).subscribe(
          (respuesta: Respuesta) => {
              //console.log(respuesta);  // Log de la respuesta
              if (respuesta.success) {
                  this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Actualizado con Éxito.', life: 3000 });

                  // Actualiza la lista de destinos después de la creación
                  this.service.ListarCompraDetalleDestino(this.iddetallecompra).subscribe(
                      (data: any) => {
                          this.destinos = data;

                          this.destinos.forEach((destino: any) => {
                              this.addDetalleDestino(destino);  // Añadir los destinos al array
                          });
                      },
                      error => {
                          //console.error('Error al obtener datos del formulario', error);  // Maneja el error en caso de fallo
                      }
                  );
              } else {
                  this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'Actualizado fallido', life: 3000 });
                  //console.log('RESPONSE:' + respuesta.success);  // Log de la respuesta fallida
              }
          }
      );
  } else {
      //console.error('Error: único destino no definido');  // Manejar el caso donde único destino no está definido
  }
}

// Método para eliminar un destino específico
onElimnarDestinoEspecifico() {
  // Llama al servicio para eliminar el destino del detalle de la compra
  this.service.EliminarCompraDetalleDestino(this.iddetalledestino).subscribe(
      (respuesta: Respuesta) => {
          //console.log(respuesta);  // Log de la respuesta
          if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass:'iziToast-custom',detail: 'Eliminado con Éxito.', life: 3000 });

              // Actualiza la lista de destinos después de la eliminación
              this.service.ListarCompraDetalleDestino(this.iddetallecompra).subscribe(
                  (data: any) => {
                      this.destinos = data;
                      this.totalingresados = this.destinos.reduce((acc, item) => acc + item.codd_Cantidad, 0);  // Calcula la cantidad total ingresada

                      // Actualiza `cantidadVerificada` en el detalle correspondiente
                      let detalleEncontrado: any = null;

                      for (const tabPanel of this.tabPanels) {
                          const detallesArray = tabPanel.detallesFiltrados;
                          detalleEncontrado = detallesArray.find(d => d.codt_Id === this.iddetallecompra);
                          if (detalleEncontrado) {
                              detalleEncontrado.cantidadVerificada = this.totalingresados === detalleEncontrado.codt_cantidad ? 1 : 0;

                              // Desbloquear el campo p-inputNumber si no hay más destinos para este ítem
                              detalleEncontrado.cantidadParcialEnviada = this.destinos.length === 0 ? 0 : 1;

                              break;
                          }
                      }

                      if (!detalleEncontrado) {
                          //console.error('No se encontró el detalle con codt_Id:', this.iddetallecompra);  // Maneja el caso donde no se encuentra el detalle
                      }

                      this.cd.detectChanges();  // Forzar la detección de cambios
                  },
                  error => {
                      //console.error('Error al obtener datos del formulario', error);  // Maneja el error en caso de fallo
                  }
              );
          } else {
              this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'Actualizado fallido', life: 3000 });
              //console.log('RESPONSE:' + respuesta.success);  // Log de la respuesta fallida
          }
      }
  );
}


// Método para eliminar una maquinaria específica
// Método para eliminar una maquinaria específica
onEliminarMaquinariaEspecifica() {
  // Llama al servicio para eliminar el destino de maquinaria del detalle de la compra
  this.service.EliminarCompraDetalleDestinoMaquinaria(this.iddetalledestinomaquinaria).subscribe(
      (respuesta: Respuesta) => {
          //console.log(respuesta);  // Log de la respuesta
          if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass:'iziToast-custom',detail: 'Eliminado con Éxito.', life: 3000 });

              // Actualiza la lista de maquinarias después de la eliminación
              this.service.ListarCompraDetalleDestinoMaquinaria(this.iddetallecompra).subscribe(
                  (data: any) => {
                      this.maquinarias = data;
                      this.totalingresados = this.maquinarias.reduce((acc, item) => acc + item.codm_Cantidad, 0);  // Calcula la cantidad total ingresada

                      // Actualiza `cantidadVerificada` en el detalle correspondiente
                      let detalleEncontrado: any = null;

                      for (const tabPanel of this.tabPanels) {
                          const detallesArray = tabPanel.detallesFiltrados;
                          detalleEncontrado = detallesArray.find(d => d.codt_Id === this.iddetallecompra);
                          if (detalleEncontrado) {
                              detalleEncontrado.cantidadVerificada = this.totalingresados === detalleEncontrado.codt_cantidad ? 1 : 0;

                              // Desbloquear el campo p-inputNumber si no hay más ubicaciones para esta maquinaria
                              detalleEncontrado.cantidadParcialEnviada = this.maquinarias.length === 0 ? 0 : 1;

                              break;
                          }
                      }

                      if (!detalleEncontrado) {
                          //console.error('No se encontró el detalle con codt_Id:', this.iddetallecompra);  // Maneja el caso donde no se encuentra el detalle
                      }

                      this.cd.detectChanges();  // Forzar la detección de cambios
                  },
                  error => {
                      //console.error('Error al listar destinos de maquinaria', error);  // Maneja el error en caso de fallo
                  }
              );
          } else {
              this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'Actualizado fallido.', life: 3000 });
              //console.log('RESPONSE:' + respuesta.success);  // Log de la respuesta fallida
          }
      }
  );
}


// Método para abrir el modal de destino de insumos o maquinaria
Destinoinsumo() {
  if (this.maquinariaono === 0) {
      this.viewState.maqui = true;
      // Llama al servicio para listar destinos de maquinaria
      this.service.ListarCompraDetalleDestinoMaquinaria(this.iddetallecompra).subscribe(
          (data: any) => {
              this.maquinarias = data;
              this.totalingresados = this.maquinarias.reduce((acc, item) => acc + item.codm_Cantidad, 0);  // Actualiza la cantidad ingresada
              //console.log(this.maquinarias);  // Log de las maquinarias
              this.mostrarInsumo = false;
              this.mostrarMaquinaria = false;
              this.mostrarEquipoSeguridad = false;
          },
          error => {
              //console.error('Error al listar destinos de maquinaria', error);  // Maneja el error en caso de fallo
          }
      );
  } else if (this.maquinariaono === 2) {
      this.viewState.Seguridad = true;
      // Llama al servicio para listar destinos de equipos de seguridad
      this.service.ListarCompraDetalleDestino(this.iddetallecompra).subscribe(
          (data: any) => {
              this.equiposSeguridad = data;
              this.totalingresados = this.equiposSeguridad.reduce((acc, item) => acc + item.codd_Cantidad, 0);  // Actualiza la cantidad ingresada
              //console.log(this.equiposSeguridad);  // Log de los equipos de seguridad
              this.mostrarInsumo = false;
              this.mostrarMaquinaria = false;
              this.mostrarEquipoSeguridad = false;
          },
          error => {
              //console.error('Error al listar destinos de equipos de seguridad', error);  // Maneja el error en caso de fallo
          }
      );
  } else {
      this.mostrarInsumo = false;
      this.mostrarMaquinaria = false;
      this.mostrarEquipoSeguridad = false;
      this.viewState.delete = true;
  }
  this.cd.detectChanges();  // Forzar la detección de cambios
}


// Método privado para actualizar los totales en un panel de cotización
private updateTotals(panel: any) {
  let total = 0;
  let totalISV = 0;
  let subtotal = 0;

  // Calcula el subtotal, ISV y total basado en los detalles filtrados
  panel.detallesFiltrados.forEach((detalle: any) => {
      const detalleTotal = detalle.codt_cantidad * detalle.codt_preciocompra;
      let impuesto = detalle.coti_Impuesto / 100;
      let detalleISV = detalleTotal * impuesto;

      if (detalle.coti_Incluido === 1) {
          totalISV += detalleISV;
          subtotal += detalleTotal - detalleISV;
      } else {
          subtotal += detalleTotal;
          totalISV += detalleISV; // Calcula correctamente el ISV
      }

      total += detalleTotal; // Sumar el total siempre, para ambos casos
  });

  // Asigna los valores calculados a los respectivos campos del panel
  panel.subtotal = subtotal;
  panel.isv = totalISV;
  panel.total = subtotal + totalISV;
}

// Método para crear un FormGroup para una cotización
createCotizacionFormGroup(): FormGroup {
  return this.fb.group({
    coti_Id: ['', Validators.required],
    code_Cantidad: [0, Validators.required],
    code_PrecioCompra: [0, Validators.required],
    agregadoACotizacion: [false],
    tipo: [1, Validators.required],
  });
}

// Método para crear un FormGroup para un destino
destinoGroup(): FormGroup {
  return this.fb.group({
    destino: ['', Validators.required]
  });
}

// Método para obtener el array de cotizaciones del formulario
get cotizacionesArray(): FormArray {
  return this.form.get('cotizaciones') as FormArray; // Obtener el FormArray de cotizaciones
}

filterCotizacioness(event: any) {
  const query = event.query.toLowerCase();
  this.filtradasCotizaciones = this.cotizaciones
    .filter(cotizacion => 
      !this.selectedCotizaciones.includes(cotizacion.value) && 
      cotizacion.label.toLowerCase().includes(query)
    );
}

 // Método para manejar la acción de emitir una orden
onEmitida(id: number | null): void {
  this.submitted = true;
  let isValid = true;
  let valores = "";
  this.tabPanels.forEach(panel => {
    if (panel.formNumero.invalid) {
      isValid = false;
      //console.log('Formulario en la pestaña ' + panel.header + ' no es válido.');
    } else {
       valores += panel.formNumero.value.coen_NumeroOrden + ','
       //console.log('Valores del formulario en la pestaña ' + panel.header + ':', panel.formNumero.value);
    }
  });

  if (isValid) {

    if (id === null) {
      this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'ID de la compra no puede ser null.' });
      //console.error('Error: ID de la compra es null');
      return;
  }
  this.selectedCompraId = id; // Guarda el ID de la compra seleccionada
  this.confirmEmitDialog = true;



  }

 // Muestra el modal de confirmación para emitir la orden
}

 // Método para manejar la acción de emitir una orden
 onEmitidaIndex(id: number | null): void {
  this.permitirEliminar = false; // Desactivar eliminación
  this.selectedCompraId = id;

    this.submitted = true;
    let isValid = true;
    let valores = "";
    this.tabPanels.forEach(panel => {
      if (panel.formNumero.invalid) {
        isValid = false;
        //console.log('Formulario en la pestaña ' + panel.header + ' no es válido.');
      } else {
         valores += panel.formNumero.value.coen_NumeroOrden + ','
         //console.log('Valores del formulario en la pestaña ' + panel.header + ':', panel.formNumero.value);
      }
    });

    if (isValid) {

      if (id === null) {
        this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'ID de la compra no puede ser null.' });
        //console.error('Error: ID de la compra es null');
        return;
    }
    this.selectedCompraId = id; // Guarda el ID de la compra seleccionada
    this.confirmEmitDialogIndex = true;



    }

   // Muestra el modal de confirmación para emitir la orden
  }


// Método para confirmar la emisión de la orden
confirmarEmitir() {
  let valores = "";
  this.tabPanels.forEach(panel => {
    if (panel.formNumero.invalid) {
      //console.log('Formulario en la pestaña ' + panel.header + ' no es válido.');
    } else {
       valores += panel.formNumero.value.coen_NumeroOrden + ','
       //console.log('Valores del formulario en la pestaña ' + panel.header + ':', panel.formNumero.value);
    }
  });

  if (this.selectedCompraId === null) {
      return;
  }

  // Verificar si todos los detalles están en verde (cantidadVerificada === 1)
  const algunDetalleNoVerificado = this.tabPanels.some(panel =>
      panel.detallesFiltrados.some(detalle => detalle.cantidadVerificada === 0)
  );

  if (algunDetalleNoVerificado) {
      this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          styleClass:'iziToast-custom',
          detail: 'Debe asignar todas las ubicaciones antes de emitir la orden de compra.',
          life: 5000
      });
      return;
  }

  //console.log('Emitir Orden ID:', this.selectedCompraId);

  const viewajasimon: any = {
      coen_Id: this.selectedCompraId,
      codd_Boat_Id: this.proyectoobodegageneralid,
      codd_ProyectoOBodega: this.proyectoobodegageneraldif,
      usua_Creacion: this.usua_Id
  };

  const viewproyecto: any = {
      coen_Id: this.selectedCompraId,
      codm_HorasRenta: this.idHorasrenta,
      acet_Id: this.idactividad,
      usua_Creacion: this.usua_Id
  };

  // Insertar insumos por defecto si se han proporcionado las condiciones necesarias
  if (viewajasimon.codd_Boat_Id && viewajasimon.codd_ProyectoOBodega) {
      this.service.InsertarCompraDetalleDestino(viewajasimon).subscribe(
          response => {
              if (response && response.someExpectedField) {
                  this.messageService.add({ severity: 'success', summary: 'Insumos por defecto Insertados', styleClass:'iziToast-custom', detail: 'Los insumos se insertaron correctamente.' });
              }
          },
          error => {
              //this.handleError('Error al insertar insumos por defecto', error);
          }
      );
  }

  // Insertar detalles del proyecto si se han proporcionado las condiciones necesarias
  if (viewproyecto.codm_HorasRenta && viewproyecto.acet_Id) {
      this.service.InsertarCompraDetalleDestinoPorProyecto(viewproyecto).subscribe(
          response => {
              if (response && response.someExpectedField) {
                  this.messageService.add({ severity: 'success', summary: 'Detalles del proyecto Insertados', styleClass:'iziToast-custom', detail: 'Los detalles del proyecto se insertaron correctamente.' });
              }
          },
          error => {
              //this.handleError('Error al insertar detalles del proyecto', error);
          }
      );
  }



  const detallesActualizados = ({
    coen_Id_numeroCompra:this.selectedCompraId.toString(),
    coen_numeroCompra: valores

  });
this.service.ActualizarCompraNumero(detallesActualizados).subscribe(
  response => {
  },
  error => {

  });






  // Eliminar la orden después de emitirla
  this.service.Eliminar(this.selectedCompraId).subscribe(
      response => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Orden emitida con Éxito.' });

          this.cotizacionesArray.controls.forEach((_, index) => this.updateTabPanelData(index));

          // Restablecer el estado de la vista después de emitir la orden
          this.viewState = {
              create: false,
              Seguridad: false,
              variableCambiada: false,
              detail: false,
              delete: false,
              index: true,
              maqui: false,
              ordenes: false,
              ordenesEditar: false,
              Detalles: false,
              createdirect: false
          };
          this.submitted = false;
          this.Listado(); // Actualizar el listado después de la emisión
          this.cd.detectChanges();
          this.GuardarEnviarAlertas(`Se acaba de emitir una orden de compra.`)
      },
      error => {
          //this.handleError('Error al emitir la orden', error);
      }
  );

  this.confirmEmitDialog = false; // Cierra el modal de confirmación
}


// Método para confirmar la emisión de la orden
confirmarEmitirIndex() {
    let valores = "";
    this.tabPanels.forEach(panel => {
      if (panel.formNumero.invalid) {
        //console.log('Formulario en la pestaña ' + panel.header + ' no es válido.');
      } else {
         valores += panel.formNumero.value.coen_NumeroOrden + ','
         //console.log('Valores del formulario en la pestaña ' + panel.header + ':', panel.formNumero.value);
      }
    });

    if (this.selectedCompraId === null) {
        return;
    }

    // Verificar si todos los detalles están en verde (cantidadVerificada === 1)
    const algunDetalleNoVerificado = this.tabPanels.some(panel =>
        panel.detallesFiltrados.some(detalle => detalle.cantidadVerificada === 0)
    );

    if (algunDetalleNoVerificado) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            styleClass:'iziToast-custom',
            detail: 'Debe asignar todas las ubicaciones antes de emitir la orden de compra.',
            life: 5000
        });
        return;
    }

    //console.log('Emitir Orden ID:', this.selectedCompraId);

    const viewajasimon: any = {
        coen_Id: this.selectedCompraId,
        codd_Boat_Id: this.proyectoobodegageneralid,
        codd_ProyectoOBodega: this.proyectoobodegageneraldif,
        usua_Creacion: this.usua_Id
    };

    const viewproyecto: any = {
        coen_Id: this.selectedCompraId,
        codm_HorasRenta: this.idHorasrenta,
        acet_Id: this.idactividad,
        usua_Creacion: this.usua_Id
    };

    // Insertar insumos por defecto si se han proporcionado las condiciones necesarias
    if (viewajasimon.codd_Boat_Id && viewajasimon.codd_ProyectoOBodega) {
        this.service.InsertarCompraDetalleDestino(viewajasimon).subscribe(
            response => {
                if (response && response.someExpectedField) {
                    this.messageService.add({ severity: 'success', summary: 'Insumos por defecto Insertados', styleClass:'iziToast-custom', detail: 'Los insumos se insertaron correctamente.' });
                }
            },
            error => {
                //this.handleError('Error al insertar insumos por defecto', error);
            }
        );
    }

    // Insertar detalles del proyecto si se han proporcionado las condiciones necesarias
    if (viewproyecto.codm_HorasRenta && viewproyecto.acet_Id) {
        this.service.InsertarCompraDetalleDestinoPorProyecto(viewproyecto).subscribe(
            response => {
                if (response && response.someExpectedField) {
                    this.messageService.add({ severity: 'success', summary: 'Detalles del proyecto Insertados', styleClass:'iziToast-custom', detail: 'Los detalles del proyecto se insertaron correctamente.' });
                }
            },
            error => {
                //this.handleError('Error al insertar detalles del proyecto', error);
            }
        );
    }



    const detallesActualizados = ({
      coen_Id_numeroCompra:this.selectedCompraId.toString(),
      coen_numeroCompra: valores

    });


    // Eliminar la orden después de emitirla
    this.service.Eliminar(this.selectedCompraId).subscribe(
        response => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Orden emitida con Éxito.' });

            this.cotizacionesArray.controls.forEach((_, index) => this.updateTabPanelData(index));

            // Restablecer el estado de la vista después de emitir la orden
            this.viewState = {
                create: false,
                Seguridad: false,
                variableCambiada: false,
                detail: false,
                delete: false,
                index: true,
                maqui: false,
                ordenes: false,
                ordenesEditar: false,
                Detalles: false,
                createdirect: false
            };
            this.submitted = false;
            this.Listado(); // Actualizar el listado después de la emisión
            this.cd.detectChanges();
            this.GuardarEnviarAlertas(`Se acaba de emitir una orden de compra.`)
        },
        error => {
            //this.handleError('Error al emitir la orden', error);
        }
    );

    this.confirmEmitDialogIndex = false; // Cierra el modal de confirmación
  }

  public GuardarEnviarAlertas(descripcion: string): void  {
    this.notificacionesService.ListarUsuarios().subscribe(
        (data: any[]) => {
            const usuariosSeleccionados = data.filter(item => item.usua_EsAdministrador === true);

            if (usuariosSeleccionados.length === 0) {
                this.messageService.add({ severity: 'success', summary: 'Error', styleClass:'iziToast-custom', detail: 'no hay usuarios elegidos.' });
                return;
            }

            const notiRuta = '/insumo/compra';

            const detalles = usuariosSeleccionados.map(usuario => ({
                aler_Descripcion: descripcion,
                aler_Ruta: notiRuta,
                aler_Fecha: new Date().toISOString(),
                usua_Id: usuario.usua_Id,
                usua_Creacion: this.usua_Id,
                napu_Ruta: notiRuta
            }));

            // Aquí pasas la ruta 'notiRuta' al servicio
            this.notificationManagerService.insertarYEnviarNotificaciones(detalles, notiRuta).subscribe(
                resultados => {
                    const exitosos = resultados.filter((res: any) => res.success);
                    const fallidos = resultados.filter((res: any) => !res.success);

                    if (exitosos.length > 0) {
                        // Mensaje de éxito
                    }

                    this.notificacionUpdateService.notificacionesActualizadasEmit();
                },
                error => {
                    //console.error('Error en GuardarEnviarAlertas:', error);
                }
            );
        },
        error => {
            //console.error('Error al cargar usuarios', error);
        }
    );
}


// Método para obtener el nombre de un proyecto o bodega basado en su ID
getNombreProyectoOBodega(id: number): string {
  const proyecto = this.Proyectos.find(proy => proy.value === id);
  const bodega = this.Bodegas.find(bod => bod.value === id);

  if (proyecto) {
      return proyecto.label; // Retorna el nombre del proyecto si coincide el ID
  } else if (bodega) {
      return bodega.label; // Retorna el nombre de la bodega si coincide el ID
  } else {
      return 'Desconocido'; // Retorna 'Desconocido' si no encuentra coincidencias
  }
}

// Método para editar una compra basada en su ID
onEditar(id: number | null): void {

  this.permitirEliminar = false; // Desactivar eliminación
  this.selectedCompraId = id;
  if (id === null) {
      this.messageService.add({ severity: 'error', summary: 'Error',  styleClass:'iziToast-custom',detail: 'ID de la compra no puede ser null.' });
      return;
  }

  this.service.BuscarPorEncabezadoId(id).subscribe(
      (data: CompraEncabezado[]) => {
          //console.log('Datos recibidos del servicio:', data);

  // Asignar el detalle de la orden de compra
  this.detalle = data[0];

          // Agrupar detalles por coti_Id
          const groupedDetalles = data.reduce((acc, detalle) => {
              if (!acc[detalle.coti_Id]) {
                  acc[detalle.coti_Id] = [];
              }
              acc[detalle.coti_Id].push(detalle);
              return acc;
          }, {});

          //console.log('Detalles agrupados por coti_Id:', groupedDetalles);

          // Limpiar tabPanels
          this.tabPanels = [];

          // Crear un TabPanel por cada coti_Id
          Object.keys(groupedDetalles).forEach((coti_Id, index) => {
              const detalles = groupedDetalles[coti_Id];
              this.tabPanels.push({
                  header: `Factura #${detalles[0]?.coen_numeroCompra}`,
                  index: index,
                  proveedor: detalles[0]?.cotizacionProveedor, // Establecer el proveedor aquí
                  detalles: detalles,
                  detallesFiltrados: detalles.filter(d => d.agregadoACotizacion !== false),  // Filtra correctamente
                  subtotal: 0,
                  total: 0,
                  isv: 0,
                  formNumero: this.fb.group({
                    coen_NumeroOrden: [detalles[0]?.coen_numeroCompra, Validators.required]
                  })
              });
          });

          // Actualizar totales y detectar cambios
          this.tabPanels.forEach(panel => this.updateTotalseditar(panel));
          this.cd.detectChanges();

          // Cambiar la vista al modo edición
          this.viewState = {
              create: false,
              Seguridad: false,
              variableCambiada: false,
              detail: false,
              delete: false,
              index: false,
              maqui: false,
              ordenes: false,
              ordenesEditar: true,
              Detalles: false,
              createdirect: false
          };
          this.cd.detectChanges();
      },
      error => {
          //this.handleError('Error al cargar detalles de la compra', error);
      }
  );
}

// Método para ver los detalles de una compra basada en su ID
onDetalles(id: number | null): void {
  this.permitirEliminar = false; // Desactivar eliminación
  this.selectedCompraId = id;

  if (id === null) {
      this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'ID de la compra no puede ser null.' });
      return;
  }

  this.service.BuscarPorEncabezadoId(id).subscribe(
      (data: CompraEncabezado[]) => {
          //console.log('Datos recibidos del servicio:', data);

          // Agrupar detalles por coti_Id
          const groupedDetalles = data.reduce((acc, detalle) => {
              if (!acc[detalle.coti_Id]) {
                  acc[detalle.coti_Id] = [];
              }
              acc[detalle.coti_Id].push(detalle);
              return acc;
          }, {});

          //console.log('Detalles agrupados por coti_Id:', groupedDetalles);

          // Limpiar tabPanels
          this.tabPanels = [];

          // Crear un TabPanel por cada coti_Id
          Object.keys(groupedDetalles).forEach((coti_Id, index) => {
              const detalles = groupedDetalles[coti_Id];
              this.tabPanels.push({
                  header: `Factura #${detalles[0]?.coen_numeroCompra}`,
                  index: index,
                  proveedor: detalles[0]?.cotizacionProveedor, // Establecer el proveedor aquí
                  detalles: detalles,
                  detallesFiltrados: detalles.filter(d => d.agregadoACotizacion !== false),  // Filtra correctamente
                  subtotal: 0,
                  total: 0,
                  isv: 0,
                  formNumero: this.fb.group({
                    coen_NumeroOrden: ['', Validators.required]
                  })
              });
          });

          // Actualizar totales y detectar cambios
          this.tabPanels.forEach(panel => this.updateTotalseditar(panel));

          // Asignar detalles de auditoría
          this.detalleauditoria = data.map(detalle => ({
            usuarioCreacion: detalle.usuarioCreacion,
            UsuarioModifica: detalle.usuarioModifica,
            coen_FechaCreacion: detalle.coen_FechaCreacion,
            coen_FechaModificacion: detalle.codt_FechaModificacion
        }));

          this.cd.detectChanges();

          // Cambiar la vista al modo detalles
          this.viewState = {
              create: false,
              Seguridad: false,
              variableCambiada: false,
              detail: false,
              delete: false,
              index: false,
              maqui: false,
              ordenes: false,
              ordenesEditar: false,
              Detalles: true,
              createdirect: false
          };
          this.cd.detectChanges();
      },
      error => {
          //this.handleError('Error al cargar detalles de la compra', error);
      }
  );
}


// Método para eliminar una cotización basada en su índice
removeCotizacion(index: number): void {
  if (this.cotizacionesArray.length > 1) {
    // Obtener los detalles relacionados a esta cotización antes de eliminarla
    const detallesParaEliminar = this.detalles[index];

    // Filtrar y eliminar los detalles de selectedDetalles que pertenecen a esta cotización
    this.selectedDetalles = this.selectedDetalles.filter(detalleSeleccionado => {
      return !detallesParaEliminar.some(detalle => detalle.code_Id === detalleSeleccionado.code_Id);
    });

    // Eliminar la cotización del array y los detalles
    this.cotizacionesArray.removeAt(index); // Remueve la cotización del array
    this.tabPanels = this.tabPanels.filter(panel => panel.index !== index); // Filtra el TabPanel correspondiente
    delete this.detalles[index]; // Elimina los detalles correspondientes

    // Actualiza si hay alguna selección restante
    this.updateIsAnySelected();

    // Forzar la detección de cambios en la vista
    this.cd.detectChanges();
  }
}

// Método para aplicar un filtro global en la tabla
onGlobalFilter(table: Table, event: Event) {
  table.filterGlobal(
      (event.target as HTMLInputElement).value,
      'contains' // Aplica el filtro global a la tabla
  );
}

// Método para listar las compras y actualizar la tabla
Listado() {
  this.loading = true; // Muestra el spinner de carga
  this.isTableLoading = true;

  this.service.Listar().subscribe(
      (data: CompraEncabezado[]) => {
          this.compraencabezado = data.filter(item => item.coen_Id !== null && item.coen_Id !== undefined);

          if (this.compraencabezado.length === 0) {
              this.loadedTableMessage = "No hay maquinarias existentes aún."; // Mensaje si no hay registros
          }

          this.loading = false;
          this.isTableLoading = false; // Oculta el spinner cuando se cargan los datos
      },
      error => {
          this.loading = false;
          this.isTableLoading = false; // Oculta el spinner en caso de error

      }
  );
}

// Método para listar los métodos de pago disponibles
ListadoPagos() {
  this.service.ListarMetodosPago().subscribe(
      (data: any[]) => {
          this.metodosPago = data.map(item => ({ label: item.meto_Descripcion, value: item.meto_Id }));
          this.cd.detectChanges();
      },
      error => {

      }
  );
}

// Método para listar los empleados disponibles
ListarEmpleados() {
  this.service.ListarEmpleados().subscribe(
      (Empleado: autocompleteEmpleado[]) => {
          this.empleados = Empleado;
          this.cd.detectChanges();
      },
      error => {
          //console.error('Error al listar empleados', error);
      }
  );
}

// Método para manejar el cambio de fecha en los filtros de cotización
onDateChange() {
  if (this.form.controls['fechaInicio'].value && this.form.controls['fechaFin'].value) {
      const fechaInicio = this.form.controls['fechaInicio'].value;
      const fechaFin = this.form.controls['fechaFin'].value;

      this.service.ListarFechas(fechaInicio, fechaFin).subscribe(
          (data: any[]) => {
              //console.log(data);
              this.cotizaciones = data.map(item => ({
                  label: item.cotizacionProveedor,
                  value: item.coti_Id
              }));
              this.form.setControl('cotizaciones', this.fb.array([this.createCotizacionFormGroup()]));
              this.cd.detectChanges();
          },
          error => {
              //this.handleError('Error al listar cotizaciones', error);
          }
      );
  }
}

// Método para manejar el cambio de opción entre proyecto y bodega (en el caso general)
dropdownDisabled: boolean = false;

onRadioChange(event: any): void {
  const isChecked = event.checked;
  this.bodegaOproycto = isChecked ? 'Proyecto' : 'Bodega';
  this.check = isChecked;

  // Bloquea los dropdowns por 3 segundos
  this.dropdownDisabled = true;
  setTimeout(() => {
    this.dropdownDisabled = false;
  }, 3000);

  // Obtener las referencias a los controles del formulario
  const acetIdControl = this.formde.get('acet_Id');
  const bodegaControl = this.formde.get('bodega');

  if (isChecked) {
    // Si es un proyecto, ajusta las validaciones y carga los proyectos
    acetIdControl.setValidators([Validators.required]);
    bodegaControl.clearValidators();

    this.service.ListarProyectos().subscribe(
      (data: any[]) => {
        if (Array.isArray(data)) {
          data.sort((a, b) => a.proy_Nombre.localeCompare(b.proy_Nombre));
          this.Bodegas = data.map(item => ({ label: item.proy_Nombre, value: item.proy_Id }));
          this.formde.get('bodega').setValue(null); // Reinicia el valor de bodega
          this.cd.detectChanges();
        } else {
          //console.error('La respuesta no es un arreglo:', data);
        }
      },
      error => {
        //this.handleError('Error al listar proyectos', error);
      }
    );
  } else {
    // Si es una bodega, ajusta las validaciones y carga las bodegas
    acetIdControl.clearValidators();
    bodegaControl.setValidators([Validators.required]);

    this.sbode.Listar().subscribe(
      (data: any[]) => {
        if (Array.isArray(data)) {
          data.sort((a, b) => a.bode_Descripcion.localeCompare(b.bode_Descripcion));
          this.Bodegas = data.map(item => ({ label: item.bode_Descripcion, value: item.bode_Id }));
          this.formde.get('bodega').setValue(null); // Reinicia el valor de bodega
          this.cd.detectChanges();
        } else {
          //console.error('La respuesta no es un arreglo:', data);
        }
      },
      error => {
        //this.handleError('Error al listar bodegas', error);
      }
    );
  }

  // Actualiza la validez de los controles después de cambiar las validaciones
  acetIdControl.updateValueAndValidity();
  bodegaControl.updateValueAndValidity();
}


// Método para manejar el cambio de opción entre proyecto y bodega (en caso individual)
onRadioChangeindi(event: any): void {
  const isChecked = event.checked; // Verifica si la opción seleccionada es "Proyecto"
  this.formde.get('destino')?.setValue(isChecked); // Actualiza el valor del control 'destino' en el formulario
  this.bodegaOproycto = isChecked ? 'Proyecto' : 'Bodega'; // Establece la variable 'bodegaOproycto' según la selección
  this.check = isChecked; // Actualiza la variable 'check' con el estado del radio button

  // Bloquea los dropdowns por 3 segundos
  this.dropdownDisabled = true;
  setTimeout(() => {
    this.dropdownDisabled = false;
  }, 5000);

  if (isChecked) {
      // Carga la lista de proyectos desde el servicio si es "Proyecto"
      this.service.ListarProyectos().subscribe(
          (data: any[]) => {
              if (Array.isArray(data)) {
                  data.sort((a, b) => a.proy_Nombre.localeCompare(b.proy_Nombre));
                  this.BodegasUni = data.map(item => ({ label: item.proy_Nombre, value: item.proy_Id }));
                  this.formde.get('bodega')?.setValue(null);
                  this.cd.detectChanges();
              }
          },
          error => {
              //this.handleError('Error al listar proyectos', error);
          }
      );
  } else {
      // Carga la lista de bodegas desde el servicio si es "Bodega"
      this.sbode.Listar().subscribe(
          (data: any[]) => {
              if (Array.isArray(data)) {
                  data.sort((a, b) => a.bode_Descripcion.localeCompare(b.bode_Descripcion));
                  this.BodegasUni = data.map(item => ({ label: item.bode_Descripcion, value: item.bode_Id }));
                  this.formde.get('bodega')?.setValue(null);
                  this.cd.detectChanges();
              }
          },
          error => {
              //this.handleError('Error al listar bodegas', error);
          }
      );
  }
}



// Método para manejar la acción cuando se presiona la tecla Tab en un formulario de destino
onTabKey(index: number): void {
  // Obtiene el formulario en la posición específica del array 'DestinosArray'
  const formGroup = this.DestinosArray.at(index);

  // Verifica si el formulario es válido
  if (formGroup.valid) {
      // Si es válido, imprime el valor del formulario en la consola
      //console.log('Formulario enviado:', formGroup.value);
  }
}

shouldShowRentaColumn(detalle: any): boolean {
  // Devuelve 'true' si el detalle es de tipo insumo (cime_InsumoOMaquinariaOEquipoSeguridad === 0)
  return detalle.cime_InsumoOMaquinariaOEquipoSeguridad === 0;
}

shouldShowRentaColumn2(detalle: any): boolean {

  return detalle.cime_InsumoOMaquinariaOEquipoSeguridad !== 2;
}

// onCotizacionSelect(event: any, index: number) {
//   const coti_Id = event.value;
//   //console.log(coti_Id)
//   this.service.BuscarPorCotizacion(coti_Id).subscribe(
//     (data: any[]) => {
//       //console.log(data);
//       this.detalles[index] = data.map(item => ({
//         ...item,
//         code_Cantidad: item.code_Cantidad || 0,
//         code_PrecioCompra: item.code_PrecioCompra || 0,
//         code_Renta: item.code_Renta || 0,
//         agregadoACotizacion: false,
//         code_Id: item.code_Id // Asegúrate de que code_Id se asigne correctamente aquí
//       }));

//       const cotizacionFormGroup = this.cotizacionesArray.controls[index] as FormGroup;

//       // Clear previous controls for the current index
//       Object.keys(cotizacionFormGroup.controls).forEach(control => {
//         if (control.startsWith('code_Cantidad_')||control.startsWith('unidadmedidaorenta_')  ||control.startsWith('code_Renta_') || control.startsWith('code_PrecioCompra_') || control.startsWith('agregadoACotizacion_')) {
//           cotizacionFormGroup.removeControl(control);
//         }
//       });

//       data.forEach((detalle, idx) => {
//         cotizacionFormGroup.addControl(code_Renta_${idx}, this.fb.control(detalle.code_Renta, Validators.required));
//         cotizacionFormGroup.addControl(unidadmedidaorenta_${idx}, this.fb.control(detalle.unidadMedidaoRenta, Validators.required));
//         cotizacionFormGroup.addControl(code_Cantidad_${idx}, this.fb.control(detalle.code_Cantidad, Validators.required));
//         cotizacionFormGroup.addControl(code_PrecioCompra_${idx}, this.fb.control(detalle.code_PrecioCompra, Validators.required));
//         cotizacionFormGroup.addControl(agregadoACotizacion_${idx}, this.fb.control(detalle.agregadoACotizacion));
//       });

//       this.updateTabPanelData(index);
//       this.updateIsAnySelected();
//       this.cd.detectChanges();
//     },
//     error => {
//       //this.handleError('Error al buscar cotización', error);
//     }
//   );
// }

// // Método para manejar el cambio de un checkbox en los detalles de la cotización
// onCheckboxChange(event: any, detalle: any, cotizacionIndex: number, detalleIndex: number) {
//   const cotizacionFormGroup = this.cotizacionesArray.controls[cotizacionIndex] as FormGroup;
//   const agregadoACotizacionControl = cotizacionFormGroup.get(agregadoACotizacion_${detalleIndex});

//   if (agregadoACotizacionControl) {
//       agregadoACotizacionControl.setValue(event.checked); // Actualiza el valor del checkbox
//       this.detalles[cotizacionIndex][detalleIndex].agregadoACotizacion = event.checked; // Actualiza el valor en los detalles
//       this.updateTabPanelData(cotizacionIndex); // Actualiza los datos del TabPanel
//       this.updateIsAnySelected(); // Actualiza el estado del botón
//   }
// }

// En tu componente TypeScript
private todosLosDetalles: any[] = []; // Esta es la copia de los detalles originales
selectedCotizaciones: number[] = []; // Almacena los IDs de cotizaciones seleccionadas

onCotizacionSelect(event: any, index: number) {
  const coti_Id = event.value?.value;

  // Añadir el ID de la cotización seleccionada a la lista de seleccionados
  if (coti_Id && !this.selectedCotizaciones.includes(coti_Id)) {
    this.selectedCotizaciones.push(coti_Id);
  }

  this.service.BuscarPorCotizacion(coti_Id).subscribe((data: any[]) => {
    this.todosLosDetalles[index] = [...data]; // Guardar todos los detalles originales

    // Inicializar el FormGroup de la cotización si no existe
    const cotizacionFormGroup = this.cotizacionesArray.controls[index] as FormGroup;

    // Limpiar los controles existentes
    Object.keys(cotizacionFormGroup.controls).forEach(control => {
      if (control.startsWith('code_Cantidad_') || control.startsWith('unidadmedidaorenta_') || control.startsWith('code_Renta_') || control.startsWith('code_PrecioCompra_') || control.startsWith('agregadoACotizacion_')) {
        cotizacionFormGroup.removeControl(control);
      }
    });

    // Añadir controles dinámicamente para cada detalle
    data.forEach((detalle, idx) => {
      cotizacionFormGroup.addControl(`code_Cantidad_${idx}`, this.fb.control(detalle.code_Cantidad || 0, Validators.required));
      cotizacionFormGroup.addControl(`unidadmedidaorenta_${idx}`, this.fb.control(detalle.unidadMedidaoRenta || '', Validators.required));
      cotizacionFormGroup.addControl(`code_Renta_${idx}`, this.fb.control(detalle.code_Renta || '', Validators.required));
      cotizacionFormGroup.addControl(`code_PrecioCompra_${idx}`, this.fb.control(detalle.code_PrecioCompra || 0, Validators.required));
      cotizacionFormGroup.addControl(`agregadoACotizacion_${idx}`, this.fb.control(detalle.agregadoACotizacion || false));
    });

    // Verificar si hay insumos, maquinaria o equipos de seguridad
    this.estadoCotizacion[index] = {
      hasInsumos: data.some(detalle => detalle.cime_InsumoOMaquinariaOEquipoSeguridad === 1),
      hasMaquinariaaa: data.some(detalle => detalle.cime_InsumoOMaquinariaOEquipoSeguridad === 0),
      hasEquipoSeguridad: data.some(detalle => detalle.cime_InsumoOMaquinariaOEquipoSeguridad === 2)
    };

    // Aplicar filtro por defecto dependiendo de la disponibilidad de insumos, maquinaria o equipos de seguridad
    if (this.estadoCotizacion[index].hasInsumos) {
      this.filterDetalles(index, 1); // Mostrar insumos (cime_InsumoOMaquinariaOEquipoSeguridad === 1)
    } else if (this.estadoCotizacion[index].hasMaquinariaaa) {
      this.filterDetalles(index, 0); // Mostrar maquinaria (cime_InsumoOMaquinariaOEquipoSeguridad === 0)
    } else if (this.estadoCotizacion[index].hasEquipoSeguridad) {
      this.filterDetalles(index, 2); // Mostrar equipos de seguridad (cime_InsumoOMaquinariaOEquipoSeguridad === 2)
    } else {
      this.detalles[index] = []; // En caso de que no haya ningún tipo de detalle disponible
    }

    this.updateIsAnySelected(); // Actualiza el estado del botón
    this.cd.detectChanges(); // Forzar la actualización del template si es necesario
  }, error => {
    //this.handleError('Error al buscar cotización', error);
  });
}


// Mapa para almacenar los valores por categoría (1: Insumos, 0: Maquinaria, 2: Equipo Seguridad)
private formValuesByCategory: { [key: number]: any } = {};

// Al seleccionar una opción de tipo
filterDetalles(cotizacionIndex: number, tipo: number) {
  // Guarda los valores actuales de los inputs en el mapa, incluyendo el estado del checkbox select-all

  const cotizacionFormGroup = this.cotizacionesArray.controls[cotizacionIndex] as FormGroup;
  this.formValuesByCategory[this.currentTipo] = {
    ...cotizacionFormGroup.value,
    selectAllCheckbox: cotizacionFormGroup.get('selectAllCheckbox')?.value || false
  };

  //console.log(this.cotizacionesArray.controls[cotizacionIndex])

  // Filtra a partir de los detalles originales según el tipo
  const detallesFiltrados = this.todosLosDetalles[cotizacionIndex].filter(detalle => detalle.cime_InsumoOMaquinariaOEquipoSeguridad === tipo);

  // Actualiza los detalles que se muestran
  this.detalles[cotizacionIndex] = [...detallesFiltrados];

  // Limpia los controles previos
  Object.keys(cotizacionFormGroup.controls).forEach(control => {
    if (control.startsWith('code_Cantidad_') || control.startsWith('unidadmedidaorenta_') || control.startsWith('code_Renta_') || control.startsWith('code_PrecioCompra_') || control.startsWith('agregadoACotizacion_')) {
      cotizacionFormGroup.removeControl(control);
    }
  });

  // Vuelve a agregar los controles para los detalles filtrados
  detallesFiltrados.forEach((detalle, idx) => {
    cotizacionFormGroup.addControl(`code_Renta_${idx}`, this.fb.control(detalle.code_Renta, Validators.required));
    cotizacionFormGroup.addControl(`unidadmedidaorenta_${idx}`, this.fb.control(detalle.unidadMedidaoRenta, Validators.required));
    cotizacionFormGroup.addControl(`code_Cantidad_${idx}`, this.fb.control(detalle.code_Cantidad, Validators.required));
    cotizacionFormGroup.addControl(`code_PrecioCompra_${idx}`, this.fb.control(detalle.code_PrecioCompra, Validators.required));
    cotizacionFormGroup.addControl(`agregadoACotizacion_${idx}`, this.fb.control(detalle.agregadoACotizacion));
  });

  // Asegúrate de agregar el control select-all si no existe
  if (!cotizacionFormGroup.contains('selectAllCheckbox')) {
    cotizacionFormGroup.addControl('selectAllCheckbox', this.fb.control(false)); // Agregar el checkbox si no existe
  }

  // Restaura el valor guardado del select-all para esta categoría
  const selectAllValue = this.formValuesByCategory[tipo]?.selectAllCheckbox || false;
  cotizacionFormGroup.get('selectAllCheckbox')?.setValue(selectAllValue);

  // Actualiza el valor del radio button para que refleje la categoría seleccionada
 this.form.get('tipo').setValue(tipo);

  // Restaura los valores guardados para la categoría seleccionada si existen
  if (this.formValuesByCategory[tipo]) {
    cotizacionFormGroup.patchValue(this.formValuesByCategory[tipo]);
  }

  // Actualiza el tipo actual
  this.currentTipo = tipo;

  this.updateIsAnySelected(); // Asegúrate de que el botón de acción se actualice correctamente
  this.cd.detectChanges(); // Forzar la actualización del template
}


// Método para agregar una nueva cotización
addCotizacion(): void {
  this.cotizacionesArray.push(this.createCotizacionFormGroup()); // Añade un nuevo FormGroup para la cotización
  const newIndex = this.cotizacionesArray.length - 1; // Obtiene el índice del nuevo FormGroup

  // Añade un nuevo panel de pestañas con valores predeterminados
  this.tabPanels.push({
      header: `Cotización ${this.tabPanels.length + 1}`,
      index: newIndex,
      detalles: [],
      detallesFiltrados: [],
      subtotal: 0,
      total: 0,
      isv: 0,
      formNumero: this.fb.group({
        coen_NumeroOrden: ['', Validators.required]
      })
  });

  // Si quieres seleccionar automáticamente una Cotización al agregarla
 // const event = { value: this.cotizaciones[0]?.value };  // Suponiendo que `cotizaciones` es un array de opciones
 // this.onCotizacionSelect(event, newIndex);

  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
}


// Método para seleccionar o deseleccionar todos los checkboxes de una cotización
selectAllCheckboxes(event: any, cotizacionIndex: number) {
  const cotizacionFormGroup = this.cotizacionesArray.controls[cotizacionIndex] as FormGroup;
  const detalles = this.detalles[cotizacionIndex]; // Obtiene los detalles de la cotización actual

  detalles.forEach((detalle, idx) => {
    const agregadoACotizacionControl = cotizacionFormGroup.get(`agregadoACotizacion_${idx}`);

    if (agregadoACotizacionControl) {
      agregadoACotizacionControl.setValue(event.checked); // Establece el valor de todos los checkboxes
      detalle.agregadoACotizacion = event.checked; // Actualiza el valor en el objeto detalle

      if (event.checked) {
        // Añadir a la lista de seleccionados si no está ya presente
        if (!this.selectedDetalles.some(d => d.code_Id === detalle.code_Id)) {
          this.selectedDetalles.push(detalle);
        }
      } else {
        // Si se deselecciona, eliminamos de la lista
        this.selectedDetalles = this.selectedDetalles.filter(d => d.code_Id !== detalle.code_Id);
      }
    }
  });

  this.updateIsAnySelected(); // Actualiza el estado del botón
  this.cd.detectChanges(); // Asegura que los cambios se reflejen en la vista
}

// Método para manejar el cambio de un checkbox en los detalles de la cotización
onCheckboxChange(event: any, detalle: any, cotizacionIndex: number, detalleIndex: number) {
  const cotizacionFormGroup = this.cotizacionesArray.controls[cotizacionIndex] as FormGroup;
  const agregadoACotizacionControl = cotizacionFormGroup.get(`agregadoACotizacion_${detalleIndex}`);

  if (agregadoACotizacionControl) {
    agregadoACotizacionControl.setValue(event.checked);
    detalle.agregadoACotizacion = event.checked;

    if (event.checked) {
      this.selectedDetalles.push(detalle);
    } else {
      this.selectedDetalles = this.selectedDetalles.filter(d => d.code_Id !== detalle.code_Id);
    }

    // Llama a la función para verificar si todos los checkboxes están seleccionados
    const allSelected = this.checkIfAllSelected(cotizacionIndex);

    // Actualiza el checkbox superior si todos están seleccionados
    const selectAllControl = cotizacionFormGroup.get('selectAllCheckbox');
    if (selectAllControl) {
      selectAllControl.setValue(allSelected);
    }

    this.updateIsAnySelected();
  }
}


// Verifica si todos los checkboxes están seleccionados
checkIfAllSelected(cotizacionIndex: number) {
  const cotizacionFormGroup = this.cotizacionesArray.controls[cotizacionIndex] as FormGroup;
  const detalles = this.detalles[cotizacionIndex];

  // Comprueba si todos los checkboxes están seleccionados
  const allSelected = detalles.every((detalle, idx) => {
    const agregadoACotizacionControl = cotizacionFormGroup.get(`agregadoACotizacion_${idx}`);
    return agregadoACotizacionControl?.value === true;
  });

  return allSelected;
}



// Método para manejar la selección de una actividad
onEtapaActividadSelect(event: any) {
  this.idactividad = event.value; // Guarda el ID de la actividad seleccionada
  this.formMaquinaria.patchValue({
      acet_Id: event.value, // Parchea el valor en el formulario
  });
  //console.log("Actividad seleccionada: " + this.idactividad);
}

// Método para manejar el ingreso de horas de renta
onHoras(event: Event): void {
  this.idHorasrenta = (event.target as HTMLInputElement).value; // Obtiene el valor de las horas de renta ingresadas
  this.formMaquinaria.patchValue({
      codm_HorasRenta: this.idHorasrenta, // Parchea el valor en el formulario
  });
  //console.log("Horas de renta ingresadas: " + this.idHorasrenta);
}

// Método para manejar la selección de una etapa de proyecto
onEtapaProyectoSelect(event: any) {
  const selectedEtapaId = event.value; // Obtiene el ID de la etapa seleccionada

  // Llama al servicio para listar las actividades por etapa
  this.service.ListarActividadesPorEtapa(selectedEtapaId).subscribe(
      (data: any[]) => {
          if (Array.isArray(data)) {

            data.sort((a, b) => a.acti_Descripcion.localeCompare(b.acti_Descripcion));
              // Mapea las actividades para crear elementos de selección
              this.ActividadesPorEtapa = data.map(item => ({
                  label: item.acti_Descripcion,
                  value: item.acet_Id
              }));
              //console.log(data);
          } else {
              //console.error('La respuesta no es un arreglo:', data); // Muestra un error si la respuesta no es un arreglo
          }
      },
      error => {
          //this.handleError('Error al listar actividades por etapa', error); // Maneja los errores que puedan surgir
      }
  );

  // Parchea el ID de la etapa seleccionada en el formulario
  this.formMaquinaria.patchValue({
      etpr_Id: selectedEtapaId,
  });
}

// Método para manejar la selección de un proyecto
onProyectoSelect(event: any) {
  const selectedProyectoId = event.value; // Obtiene el ID del proyecto seleccionado

  // Llama al servicio para listar las etapas por proyecto
  this.service.ListarProyectosPorEtapa(selectedProyectoId).subscribe(
      (data: any[]) => {
          if (Array.isArray(data)) {
              // Mapea las etapas para crear elementos de selección
              data.sort((a, b) => a.etap_Descripcion.localeCompare(b.etap_Descripcion));
              this.EtapasPorProyectos = data.map(item => ({
                  label: item.etap_Descripcion,
                  value: item.etpr_Id
              }));
          } else {
              //console.error('La respuesta no es un arreglo:', data); // Muestra un error si la respuesta no es un arreglo
          }
      },
      error => {
          //this.handleError('Error al listar etapas por proyecto', error); // Maneja los errores que puedan surgir
      }
  );

  // Parchea el ID del proyecto seleccionado en el formulario
  this.formMaquinaria.patchValue({
      proy_Id: selectedProyectoId,
  });
}


 // Método para manejar la selección de un destino (bodega o proyecto)
onDestinoSelect(event: any) {
  const selectedBodegaId = event.value; // Obtiene el ID de la bodega seleccionada
  const isCheckboxChecked = this.formde.get('destino')?.value; // Verifica si el checkbox de destino está marcado
  this.formEnvio.patchValue({
      codd_Boat_Id: selectedBodegaId, // Parchea el ID de la bodega en el formulario de envío
  });
  //console.log(isCheckboxChecked + 'check'); // Log para verificar el estado del checkbox
  //console.log(this.id); // Log para verificar el ID actual
  this.proyectoobodegageneralid = selectedBodegaId; // Actualiza el ID general del proyecto o bodega

  // Crea un objeto para la bodega por insumo
  const BodegaPorInsumo: any = {
      coen_Id: this.id,
      codd_Boat_Id: selectedBodegaId,
      codd_ProyectoOBodega: this.check,
      usua_Creacion: this.usua_Id
  };
  //console.log(BodegaPorInsumo); // Log del objeto BodegaPorInsumo

  // Si el destino seleccionado es un proyecto, lista las etapas por proyecto
  if (this.bodegaOproycto === 'Proyecto') {
      this.service.ListarProyectosPorEtapa(selectedBodegaId).subscribe(
          (data: any[]) => {
              if (Array.isArray(data)) {
                data.sort((a, b) => a.etap_Descripcion.localeCompare(b.etap_Descripcion));
                  // Mapea las etapas del proyecto para la selección
                  this.EtapasPorProyectos = data.map(item => ({
                      label: item.etap_Descripcion,
                      value: item.etpr_Id
                  }));
              } else {
                  //console.error('La respuesta no es un arreglo:', data); // Maneja errores si la respuesta no es un arreglo
              }
          },
          error => {
              //this.handleError('Error al listar etapas por proyecto', error); // Maneja errores en la carga de etapas
          }
      );
  }
}

// onEtapaProyectoSelectInsumo(event: any) {
//   const selectedEtapaId = event.value; // Obtiene el ID de la etapa seleccionada
//   //console.log('Selected Etapa ID:', selectedEtapaId); // Log para verificar el ID de la etapa seleccionada

//   // Llama al servicio para listar las actividades por etapa
//   this.service.ListarActividadesPorEtapa(selectedEtapaId).subscribe(
//       (data: any[]) => {
//           if (Array.isArray(data)) {
//             data.sort((a, b) => a.acti_Descripcion.localeCompare(b.acti_Descripcion));
//               // Mapea las actividades de la etapa para la selección
//               this.ActividadesPorEtapa = data.map(item => ({
//                   label: item.acti_Descripcion,
//                   value: item.acet_Id
//               }));
//               // Parchea el formulario con la etapa seleccionada
//               this.formEnvio.patchValue({
//                   etapa: selectedEtapaId,
//               });
//           } else {
//               //console.error('La respuesta no es un arreglo:', data); // Maneja errores si la respuesta no es un arreglo
//           }
//       },
//       error => {
//           //this.handleError('Error al listar actividades por etapa', error); // Maneja errores en la carga de actividades
//       }
//   );
// }

// Método para manejar la selección de una etapa del proyecto para insumos
onEtapaProyectoSelectInsumo(event: any) {
  const selectedEtapaId = event.value;

  // Preserva el valor actual del proyecto (bodegaOproycto)
  const proyectoActual = this.formde.get('bodega')?.value;

  this.service.ListarActividadesPorEtapa(selectedEtapaId).subscribe(
    (data: any[]) => {
      if (Array.isArray(data)) {
        data.sort((a, b) => a.acti_Descripcion.localeCompare(b.acti_Descripcion));

        this.ActividadesPorEtapa = data.map(item => ({
          label: item.acti_Descripcion,
          value: item.acet_Id
        }));

        // Mantiene el valor de la etapa y proyecto seleccionados
        this.formde.patchValue({
          etapa: selectedEtapaId,
          bodega: proyectoActual // Mantén el proyecto seleccionado
        });
      }
    },
    error => {
      //this.handleError('Error al listar actividades por etapa', error);
    }
  );
}


// Método para manejar la selección de una actividad dentro de una etapa de insumos
onEtapaActividadSelectInsumo(event: any) {
  const selectedActividadId = event.value; // Obtiene el ID de la actividad seleccionada
  //console.log("Actividad seleccionada:", selectedActividadId); // Log para verificar la actividad seleccionada
  this.formEnvio.patchValue({
      acet_Id: selectedActividadId, // Parchea el ID de la actividad en el formulario de envío
  });

  this.formde.patchValue({
      acet_Id: selectedActividadId, // Parchea el ID de la actividad en otro formulario relacionado
  });
}






// Método para actualizar el estado del botón basado en si algún checkbox está seleccionado
updateIsAnySelected() {
  // Verifica si algún checkbox está seleccionado en cualquier detalle
  this.isAnySelected = Object.values(this.detalles).some(detalleArray => detalleArray.some(detalle => detalle.agregadoACotizacion));
  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
}

// Método para filtrar empleados según la consulta del usuario
filterEmpleado(event: any) {
  const query = event.query.toLowerCase(); // Convierte la consulta a minúsculas
  // Filtra la lista de empleados según la consulta
  this.filtradoEmpleado = this.empleados.filter(empleado =>
      empleado.empleado?.toLowerCase().includes(query)
  );
  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
}

// Método para manejar la selección de un empleado de la lista filtrada
onEmpleadoSelect(event: any) {
  const empleadoSeleccionado = event; // Obtiene el empleado seleccionado
  // Parchea los valores del empleado en el formulario
  this.form.patchValue({ empl_Id: empleadoSeleccionado.value.empl_Id, empleado: empleadoSeleccionado.value.empleado });
  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
}

// Método para cerrar el modal de destino de maquinaria
CerrarDestinoMaquinaria() {
  this.viewState.maqui = false; // Cambia el estado de la vista para cerrar el modal
  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
}

// Método para cerrar el modal de destino de insumos
CerrarDestinoInsumo() {
  this.viewState.delete = false; // Cambia el estado de la vista para cerrar el modal
  // Elimina todos los elementos del array de destinos
  while (this.DestinosArray.length) {
      this.DestinosArray.removeAt(0);
  }
  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
}

// Método para crear un destino para maquinaria
CrearDestinoMaquinaria() {
  this.viewState.maqui = false; // Cambia el estado de la vista
  // Elimina todos los elementos del array de destinos
  while (this.DestinosArray.length) {
      this.DestinosArray.removeAt(0);
  }
  // Muestra un mensaje de éxito
  this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Destino por maquinaria ingresado con éxito', life: 3000 });
  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  this.viewState.maqui = false; // Cambia nuevamente el estado de la vista
  const pdfContainer = document.getElementById('pdfContainer');
  if (pdfContainer) {
      pdfContainer.innerHTML = ''; // Limpia el contenido del contenedor PDF
      this.isPdfVisible = false; // Oculta el PDF
      this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  }
}

// Método para crear un destino para insumos
CrearDestinoInsumo() {
  this.viewState.delete = false; // Cambia el estado de la vista
  // Elimina todos los elementos del array de destinos
  while (this.DestinosArray.length) {
      this.DestinosArray.removeAt(0);
  }
  // Muestra un mensaje de éxito
  this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Destino por defecto ingresado con éxito', life: 3000 });
  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  const pdfContainer = document.getElementById('pdfContainer');
  if (pdfContainer) {
      pdfContainer.innerHTML = ''; // Limpia el contenido del contenedor PDF
      this.isPdfVisible = false; // Oculta el PDF
      this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  }
}

// Método para crear una compra nueva
CrearCompra() {

  this.displayNewCompraDialog = false; // Cierra el diálogo de nueva compra
  this.viewState = {
      create: true, Seguridad: false,
      variableCambiada: false, detail: false, delete: false, index: false, ordenes: false, maqui: false, ordenesEditar: false, Detalles: false, createdirect: false
  };
  //console.log('Estado de la vista al crear compra:', this.viewState); // Log del estado de la vista
  this.resetForm(); // Resetea el formulario
  this.selectedDetalles = [];
  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  const pdfContainer = document.getElementById('pdfContainer');
  if (pdfContainer) {
      pdfContainer.innerHTML = ''; // Limpia el contenido del contenedor PDF
      this.isPdfVisible = false; // Oculta el PDF
      this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  }
}

// Método para crear una orden simple
crearOrdenSimple() {
  this.displayNewCompraDialog = false; // Cierra el diálogo de nueva compra
  this.viewState = {
      create: false, Seguridad: false,
      variableCambiada: false, detail: false, delete: false, index: false, ordenes: false, maqui: false, ordenesEditar: false, Detalles: false, createdirect: true
  };
  //console.log('Estado de la vista al crear compra:', this.viewState); // Log del estado de la vista
  this.ListarProveedores(); // Lista los proveedores disponibles
  this.reseteoFormularios(); // Resetea los formularios
  this.ListadoImpuesto(); // Lista los impuestos disponibles
  this.titulo = "Nueva"; // Establece el título
  this.EncabezadoCantidad = "Cantidad"; // Establece el encabezado para cantidad
  this.EncabezadoMedida = "Medida"; // Establece el encabezado para medida
  this.reseteoIDS(); // Resetea los IDs

  // Asigna la fecha de hoy al formulario de compra
  const today = new Date();
  this.formCompra.patchValue({
      coti_Fecha: today
  });
  // Cargar la tabla de cotización
  this.ListarTablaCotizacion(this.idProveedor, 0);
  // Abrir el modal de impuestos para la inserción
  const navigationState = this.navigationStateService.getState();

  if(navigationState && navigationState.compra){

  }else{
    this.ModalImpuesto = true;
  }
  //console.log('pasa modalimpuesto');

  this.selectCheckbox = []; // Inicializa el array de checkboxes seleccionados
  // Habilita los campos de proveedores y fecha en el formulario de compra
  this.formCompra.get('prov_Descripcion').enable();
  this.formCompra.get('coti_Fecha').enable();
  this.botonCrear = false;
  this.tabEquiposSeguridad = false;
  this.tabInsumo = false;
  this.filtroboton = false;
  this.Enviado = false;
  this.tabEquiposSeguridad = false;
  this.selectAll = false;
  this.dhTab = true;
  this.confirmar = false;

  //console.log('pasa seteo de form');

  // Lista los insumos, categorías, maquinaria, materiales, niveles y unidades de medida
  this.ListarInsumos();
  this.ListarCategorias();
  this.ListarMaquinaria();
  this.ListarMateriales();
  this.ListarNiveles();
  this.ListarUnidadesDeMedida();

  //console.log('pasa listados');

  this.resetForm(); // Resetea el formulario

  //console.log('pasa reset form');

  // this.cd.detectChanges(); // Detecta y aplica los cambios en la vista

  //console.log('papsa detect changes');


  const pdfContainer = document.getElementById('pdfContainer');

  //console.log('pasa pdfcontainer');


  if (pdfContainer) {
      pdfContainer.innerHTML = ''; // Limpia el contenido del contenedor PDF
      this.isPdfVisible = false; // Oculta el PDF
      this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  }
}


 // Método para reiniciar los IDs utilizados en el formulario
reseteoIDS() {
  this.idInsumo = 0;        // Reinicia el ID de insumo
  this.idProveedor = 0;     // Reinicia el ID de proveedor
  this.id = 0;              // Reinicia el ID general
  this.idMaquinaria = 0;    // Reinicia el ID de maquinaria
  this.idEquipo = 0;        // Reinicia el ID de equipo
  this.idCompra = 0;        // Reinicia el ID de compra
}

// Método para mostrar el diálogo de confirmación para crear una nueva compra
CrearCompraConfirmar() {

  this.displayNewCompraDialog = true; // Muestra el diálogo de confirmación

}

// Método para cancelar el proceso de creación o edición y restablecer el estado inicial
cancelar() {
  this.resetForm(); // Resetea el formulario a su estado inicial
  this.viewState = {
      create: false, Seguridad: false,
      variableCambiada: false, detail: false, maqui: false, delete: false, index: true, ordenes: false, ordenesEditar: false, Detalles: false, createdirect: false
  };
  this.formde.reset();
  this.formEnvio.reset();
  this.bodegaOproycto = '';
  this.check = false;
  this.EtapasPorProyectos = [];
  this.ActividadesPorEtapa = [];
  this.submitted = false; // Marca el formulario como no enviado
  this.resetTabPanels(); // Reinicia los paneles de pestañas
  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  this.mostrarMaquinaria = false; // Oculta la sección de maquinaria
  this.mostrarInsumo = false; // Oculta la sección de insumo
  this.mostrarEquipoSeguridad = false; // Oculta la sección de equipo de seguridad

  // Limpia el contenedor del PDF y oculta el PDF
  const pdfContainer = document.getElementById('pdfContainer');
  if (pdfContainer) {
      pdfContainer.innerHTML = '';
      this.isPdfVisible = false;
      this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  }
}

// Método para cancelar el proceso y regresar al estado inicial
RegresarCancelar() {
  this.resetForm(); // Resetea el formulario a su estado inicial
  this.viewState = {
      create: false, Seguridad: false,
      variableCambiada: false, detail: false, maqui: false, delete: false, index: true, ordenes: false, ordenesEditar: false, Detalles: false, createdirect: false
  };
  this.submitted = false; // Marca el formulario como no enviado
  this.resetTabPanels(); // Reinicia los paneles de pestañas
  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  this.mostrarMaquinaria = false; // Oculta la sección de maquinaria
  this.mostrarInsumo = false; // Oculta la sección de insumo
  this.mostrarEquipoSeguridad = false; // Oculta la sección de equipo de seguridad

  this.formde.reset();
  this.formEnvio.reset();
  this.bodegaOproycto = '';
  this.check = false;
  this.EtapasPorProyectos = [];
  this.ActividadesPorEtapa = [];
  // Limpia el contenedor del PDF y oculta el PDF
  const pdfContainer = document.getElementById('pdfContainer');
  if (pdfContainer) {
      pdfContainer.innerHTML = '';
      this.isPdfVisible = false;
      this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  }

  this.isRegresarVisible = false; // Oculta el botón de regresar
}

// Método para cancelar el proceso y regresar al estado inicial
RegresarCancelarDetalles() {

    this.viewState = {
        create: false, Seguridad: false,
        variableCambiada: false, detail: false, maqui: false, delete: false, index: false, ordenes: false, ordenesEditar: false, Detalles: true, createdirect: false
    };
    this.submitted = false; // Marca el formulario como no enviado
    this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
    this.mostrarMaquinaria = false; // Oculta la sección de maquinaria
    this.mostrarInsumo = false; // Oculta la sección de insumo
    this.mostrarEquipoSeguridad = false; // Oculta la sección de equipo de seguridad


    // Limpia el contenedor del PDF y oculta el PDF
    const pdfContainer = document.getElementById('pdfContainer');
    if (pdfContainer) {
        pdfContainer.innerHTML = '';
        this.isPdfVisible = false;
        this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
    }

    this.isRegresarVisible = false; // Oculta el botón de regresar
  }

// Método para cancelar la eliminación de una compra y restablecer el estado inicial
cancelarEliminar() {
  if (this.selectedCompraId) {
      this.service.EliminarCompra(this.selectedCompraId).subscribe(
          response => {
              this.resetForm(); // Resetea el formulario a su estado inicial
              this.viewState = {
                  create: false, Seguridad: false,
                  variableCambiada: false, detail: false, maqui: false, delete: false, index: true, ordenes: false, ordenesEditar: false, Detalles: false, createdirect: false
              };
              this.formde.reset();
              this.formEnvio.reset();
              this.bodegaOproycto = '';
              this.check = false;
              this.EtapasPorProyectos = [];
              this.ActividadesPorEtapa = [];
              this.submitted = false; // Marca el formulario como no enviado
              this.resetTabPanels(); // Reinicia los paneles de pestañas
              this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
              this.reiniciarFormularioYEstado();

              this.cerrarModalOrdenCompra();
              // Limpia el contenedor del PDF y oculta el PDF
              const pdfContainer = document.getElementById('pdfContainer');
              if (pdfContainer) {
                  pdfContainer.innerHTML = '';
                  this.isPdfVisible = false;
                  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
              }
          },
          error => {
              // Maneja el error si es necesario
              this.cd.detectChanges();
          }
      );
  } else {
      this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  }
}

// Método para confirmar la eliminación y regresar al estado inicial
AtrasEliminar() {
  if (this.selectedCompraId) {
      this.service.EliminarCompra(this.selectedCompraId).subscribe(
          response => {
              this.viewState = {
                  create: true, Seguridad: false,
                  variableCambiada: false, detail: false, maqui: false, delete: false, index: false, ordenes: false, ordenesEditar: false, Detalles: false, createdirect: false
              };
              this.formde.reset();
              this.formEnvio.reset();
              this.bodegaOproycto = '';
              this.check = false;
              this.EtapasPorProyectos = [];
              this.ActividadesPorEtapa = [];
              this.submitted = false; // Marca el formulario como no enviado
              this.cd.detectChanges(); // Detecta y aplica los cambios en la vista

              // Limpia el contenedor del PDF y oculta el PDF
              const pdfContainer = document.getElementById('pdfContainer');
              if (pdfContainer) {
                  pdfContainer.innerHTML = '';
                  this.isPdfVisible = false;
                  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
              }
          },
          error => {
              // Maneja el error si es necesario
              this.cd.detectChanges();
          }
      );
  } else {
      this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  }
}

// Método para regresar al estado de creación después de una operación
Atras() {
  this.viewState = {
      create: true, Seguridad: false,
      variableCambiada: false, detail: false, maqui: false, delete: false, index: false, ordenes: false, ordenesEditar: false, Detalles: false, createdirect: false
  };
  this.formde.reset();
  this.formEnvio.reset();
  this.bodegaOproycto = '';
  this.check = false;
  this.EtapasPorProyectos = [];
  this.ActividadesPorEtapa = [];
  this.submitted = false; // Marca el formulario como no enviado
  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista

  // Limpia el contenedor del PDF y oculta el PDF
  const pdfContainer = document.getElementById('pdfContainer');
  if (pdfContainer) {
      pdfContainer.innerHTML = '';
      this.isPdfVisible = false;
      this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  }
}

// Método privado para reiniciar los formularios
private resetForm() {
  this.formde.reset({
      destino: false,
      bodega: '',
      acet_Id: null
  });

  // Configuraciones adicionales de reseteo
  this.form.reset({
      empleado: '',
      meto_Id: '',
      fechaInicio: null,
      fechaFin: null
  });
  this.form.setControl('cotizaciones', this.fb.array([this.createCotizacionFormGroup()]));
  this.formCompra.reset()
  // Reinicia otras propiedades
  this.id = 0;
  this.detalles = {};
  this.cotizaciones = [];
  // this.updateIsAnySelected();

  // Marca el formulario como limpio y no modificado
  this.formde.markAsPristine();
  this.formde.markAsUntouched();
  this.formde.updateValueAndValidity();
}

// Método privado para reiniciar los paneles de pestañas
private resetTabPanels() {
  this.tabPanels = [{ header: 'Cotización 1', index: 0, proveedor: '', detalles: [], detallesFiltrados: [], subtotal: 0, total: 0, isv: 0,    formNumero: this.fb.group({
    coen_NumeroOrden: ['', Validators.required]
  })}];
  this.updateIsAnySelected();
}

// Método privado para manejar errores y mostrar un mensaje de error
private handleError(summary: string, error: any) {
  //console.error(summary, error);
  this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: summary });
  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
}

// Método para confirmar y guardar los cambios en la compra
confirmarGuardar() {
  // Mapea los detalles actualizados para enviarlos al servicio de actualización
  const detallesActualizados = this.tabPanels.flatMap(panel => panel.detalles.map(detalle => ({
      codt_Id: detalle.codt_Id !== undefined ? detalle.codt_Id : null,
      coen_Id: detalle.coen_Id,
      code_Id: detalle.code_Id,
      codt_Renta: detalle.codt_InsumoOMaquinariaOEquipoSeguridad === 1 ? 1 : detalle.unidadMedidaoRenta,
      codt_cantidad: detalle.codt_cantidad,
      codt_preciocompra: detalle.codt_preciocompra,
      codt_InsumoOMaquinariaOEquipoSeguridad: detalle.codt_InsumoOMaquinariaOEquipoSeguridad,
      usua_Modificacion: this.usua_Id,
  })));

  let valores = "";
  this.tabPanels.forEach(panel => {
    if (panel.formNumero.invalid) {

      //console.log('Formulario en la pestaña ' + panel.header + ' no es válido.');
    } else {
       valores += panel.formNumero.value.coen_NumeroOrden
       //console.log('Valores del formulario en la pestaña ' + panel.header + ':', panel.formNumero.value);
    }
  });


    const detallesActualizadosCompra = ({
      coen_Id_numeroCompra:this.selectedCompraId.toString(),
      coen_numeroCompra: valores

  });
  //console.log("Los datos son")
    //console.log(detallesActualizadosCompra)
  this.service.ActualizarCompraNumero(detallesActualizadosCompra).subscribe(
    response => {
      //console.log("Alo ")
    },
    error => {

    }
);

  // Llama al servicio para actualizar los detalles de la compra
  this.service.ActualizarCompraDetalle(detallesActualizados).subscribe(
      response => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Actualizado con Éxito.' });
          this.viewState = {
              create: false, Seguridad: false,
              variableCambiada: false, detail: false, delete: false, index: true, maqui: false, ordenes: false, ordenesEditar: false, Detalles: false, createdirect: false
          };
          this.submitted = false;
          this.Listado(); // Llama a Listado para actualizar la tabla
          this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
          this.mostrarMaquinaria = false; // Oculta la sección de maquinaria
          this.mostrarInsumo = false; // Oculta la sección de insumo
          this.mostrarEquipoSeguridad = false; // Oculta la sección de equipo de seguridad
      },
      error => {
          //this.handleError('Error al guardar detalles de la compra', error); // Maneja el error al guardar los detalles
      }
  );
  this.confirmEditarDialog = false; // Cierra el diálogo de confirmación
}

  // Método para iniciar el proceso de guardar cambios
  GuardarEditar() {
    if (this.detalle && this.detalle.coen_numeroCompra) {
      this.confirmEditarDialog = true;  // Muestra el diálogo solo si el detalle tiene datos
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'No se puede editar, el número de compra no está disponible.' });
    }
  }



  handleInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    inputElement.value = texto.replace(/[^a-zñA-ZÑáéíóúüÁÉÍÓÚÜ\s\d]/g, '');
    this.form.controls['coen_NumeroOrden'].setValue(inputElement.value);
  }

// Método para guardar los cambios y mostrar un mensaje de éxito
guardarCambios() {

  this.permitirEliminar = false;
  this.submitted = true;
  let isValid = true;
  let valores = "";
  let prov_Id = this.selectedDetalles.length > 0 ? this.selectedDetalles[0].prov_Id : null; // Sacar el prov_Id
 // Verificar si prov_Id es nulo, entonces asignar idProveedor desde CheckboxChange
 if (!prov_Id && this.idProveedor) {
  prov_Id = this.idProveedor; // Asigna el idProveedor de CheckboxChange
}
  this.tabPanels.forEach(panel => {
    // Antes de validar, agregar 'Validators.required' si aún no está
    panel.formNumero.controls['coen_NumeroOrden'].setValidators([Validators.required]);
    panel.formNumero.controls['coen_NumeroOrden'].updateValueAndValidity(); // Asegurar que las validaciones se ejecuten

    // Si el formulario es inválido
    if (panel.formNumero.invalid) {
      isValid = false;
      //console.log('Formulario en la pestaña ' + panel.header + ' no es válido.');
    } else {
       valores += panel.formNumero.value.coen_NumeroOrden + ',';
       //console.log('Valores del formulario en la pestaña ' + panel.header + ':', panel.formNumero.value);
    }
  });

  if (isValid) {
    // Realizamos la verificación de número de compra único
    this.service.VerificarNumeroCompraUnico(valores, prov_Id).subscribe(response => {
      //console.log('Respuesta de VerificarNumeroCompraUnico:', response);
      if (response === 1) { // El número de compra es único, continuar con el guardado
        const detallesActualizados = ({
          coen_Id_numeroCompra: this.selectedCompraId,
          coen_numeroCompra: valores,
          prov_Id: prov_Id // Añadimos el coti_Id en los detalles actualizados
        });

        this.service.ActualizarCompraNumero(detallesActualizados).subscribe(
          response => {
            this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass:'iziToast-custom',detail: 'Insertado con Éxito.' });
            this.viewState = {
              create: false, Seguridad: false, variableCambiada: false, detail: false,
              delete: false, index: true, maqui: false, ordenes: false, ordenesEditar: false,
              Detalles: false, createdirect: false
            };
            this.submitted = false;
            this.Listado(); // Actualiza la lista
            this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
            this.reiniciarFormularioYEstado();
            this.cerrarModalOrdenCompra();
            this.mostrarMaquinaria = false;
            this.mostrarInsumo = false;
            this.mostrarEquipoSeguridad = false;
          },
          error => {
            //this.handleError('Error al guardar detalles de la compra', error); // Maneja el error al guardar los detalles
          }
        );
      } else { // El número de compra ya existe, mostrar advertencia
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'El número de compra ya existe. Por favor, ingrese un número diferente.' });
      }
    });
  }
}




// Método privado para actualizar los totales en la edición
// Método privado para actualizar los totales en la edición
private updateTotalseditar(panel: any) {
  let total = 0;
  let totalISV = 0;
  let subtotal = 0;

  // Calcula el subtotal, ISV y total basado en los detalles filtrados
  panel.detallesFiltrados.forEach((detalle: any) => {
      const detalleTotal = detalle.codt_cantidad * detalle.codt_preciocompra;
      let impuesto = detalle.coti_Impuesto / 100;
      let detalleISV = detalleTotal * impuesto;

      if (detalle.coti_Incluido === 1) {
          totalISV += detalleISV;
          subtotal += detalleTotal - detalleISV;
      } else {
          subtotal += detalleTotal;
          totalISV += detalleISV; // Calcula correctamente el ISV
      }

      total += detalleTotal; // Sumar el total siempre, para ambos casos
  });

  // Asigna los valores calculados a los respectivos campos del panel
  panel.subtotal = subtotal;
  panel.isv = totalISV;
  panel.total = subtotal + totalISV;
}



reiniciarFormularioYEstado() {
  // Reiniciar formulario y arrays de detalles
  this.cotizacionesArray.clear(); // Limpia todos los FormArray
  this.selectedDetalles = []; // Limpia los detalles seleccionados
  this.todosLosDetalles = []; // Limpia los detalles completos
  this.estadoCotizacion = []; // Reinicia el estado de la cotización

  // Reiniciar otros estados relevantes
  this.mostrarMaquinaria = false;
  this.mostrarInsumo = false;
  this.mostrarEquipoSeguridad = false;

  // Reiniciar el formulario principal si es necesario
  this.form.reset(); // Reinicia todo el formulario principal
}

// Método privado para actualizar los datos del TabPanel según los detalles
private updateTabPanelData(index: number) {
  const cotizacionFormGroup = this.cotizacionesArray.controls[index] as FormGroup;
  const detalles = this.detalles[index];
  if (detalles) {
      // Actualiza los valores de los detalles en el formulario de cotización
      detalles.forEach((detalle, idx) => {
          if (detalle.cime_InsumoOMaquinariaOEquipoSeguridad === 1) {
              detalle.codt_Renta = 1;
          } else {
              detalle.codt_Renta = cotizacionFormGroup.get(`unidadmedidaorenta_${idx}`)?.value;
          }
          detalle.codt_cantidad = cotizacionFormGroup.get(`code_Cantidad_${idx}`)?.value;
          detalle.codt_preciocompra = cotizacionFormGroup.get(`code_PrecioCompra_${idx}`)?.value;
      });

      // Encuentra el panel existente y actualiza los detalles
      const existingPanel = this.tabPanels.find(panel => panel.index === index);
      if (existingPanel) {
          existingPanel.detalles = detalles;
          existingPanel.detallesFiltrados = detalles.filter(d => d.agregadoACotizacion);
          this.updateTotals(existingPanel); // Actualiza los totales del panel
      }
  }
}


 // Método privado para agregar un encabezado al documento PDF
private addHeader(doc: jsPDF, tab: any) {
  const date = new Date().toLocaleDateString();  // Obtiene la fecha actual
  const time = new Date().toLocaleTimeString();  // Obtiene la hora actual

  const logo = '/assets/demo/images/disenoactualizado.png';  // Ruta del logo
  doc.addImage(logo, 'PNG', 0, -18, 220, 50);  // Agrega el logo al PDF

  // Agrega el detalle `coen_Id` debajo del nombre del proveedor
  doc.setFontSize(10);  // Tamaño de fuente para el `coen_Id`
  doc.text(`No. De Orden: ${tab.detallesFiltrados[0]?.coen_numeroCompra || ''}`, doc.internal.pageSize.width / 1.1, 33, { align: 'right' });  // Agrega el `codt_Id` centrado debajo del proveedor

  doc.setFontSize(20);  // Configura el tamaño de la fuente
  doc.setTextColor(0, 0, 0);  // Configura el color del texto
  doc.text(`${tab.proveedor}`, doc.internal.pageSize.width / 2, 50, { align: 'center' });  // Agrega el nombre del proveedor centrado

  doc.setFontSize(8);  // Configura el tamaño de la fuente para la fecha y hora
  doc.setTextColor(255, 255, 255);  // Configura el color del texto para la fecha y hora
  doc.text(`Fecha de emisión: ${date} ${time}`, doc.internal.pageSize.width - 10, 10, { align: 'right' });  // Agrega la fecha y hora en la esquina superior derecha

  doc.setFontSize(9);  // Configura el tamaño de la fuente para el nombre del generador
  doc.setTextColor(255, 255, 255);  // Configura el color del texto para el nombre del generador
  doc.text(`Generado por: ${this.Usuario}`, doc.internal.pageSize.width - 10, 20, { align: 'right' });  // Agrega el nombre del generador en la esquina superior derecha
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

// Método para manejar la generación de tablas con manejo de paginación
private generateTableWithPagination(doc: jsPDF, tableData: any[], header: string[], startY: number, tab: any, spaceBetweenTables: number = 10): number {
  const pageHeight = doc.internal.pageSize.height;
  const bottomMargin = 40;
  let finalY = startY;

  const autoTableConfig = {
    startY: finalY,
    theme: 'striped',
    styles: { halign: 'center', font: 'helvetica', cellPadding: 3, lineWidth: 0.1 },
    headStyles: { fillColor: [255, 237, 58], textColor: [0, 0, 0], fontSize: 12, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { textColor: [0, 0, 0], fontSize: 10, halign: 'center' },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 60, bottom: 40 },  // Ajustamos un margen inferior adecuado
    didDrawPage: (data: any) => {
      this.addFooter(doc);  // Agregar pie de página en cada página
    }
  };

  // Generar la tabla
  doc.autoTable({
    ...autoTableConfig,
    head: [header],
    body: tableData,
    startY: finalY,
    didDrawPage: (data) => {
      const currentPage = doc.getCurrentPageInfo().pageNumber;
      if (currentPage > 1) {
        // Agregar encabezado y proveedor en cada nueva página
        this.addHeader(doc, tab);  // Repetir encabezado
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text(`${tab.proveedor}`, doc.internal.pageSize.width / 2, 50, { align: 'center' });  // Repetir el nombre del proveedor
      }
    }
  });

  // Actualiza finalY basándote en la posición final de la tabla y añade espacio entre tablas
  finalY = (doc as any).lastAutoTable.finalY + spaceBetweenTables;
  return finalY;
}

// Método para agregar el contenido del PDF
private addTabContentToDoc(doc: jsPDF, tab: any): void {
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  const topMargin = 60;
  let finalY = topMargin;

  const insumos = tab.detallesFiltrados.filter((detalle: any) => detalle.codt_InsumoOMaquinariaOEquipoSeguridad === 1);
  const maquinarias = tab.detallesFiltrados.filter((detalle: any) => detalle.codt_InsumoOMaquinariaOEquipoSeguridad === 0);
  const equiposSeguridad = tab.detallesFiltrados.filter((detalle: any) => detalle.codt_InsumoOMaquinariaOEquipoSeguridad === 2);
  let simboloMoneda = this.globalMoneda.getState();
  if (!simboloMoneda) {
    this.globalMoneda.setState();
    simboloMoneda = this.globalMoneda.getState();
  }
  // Espacio deseado entre las tablas (puedes ajustarlo a tu preferencia)
  const spaceBetweenTables = 25;

  // Generar las tablas con espacio entre ellas
  if (insumos.length > 0) {
    finalY = this.generateTableWithPagination(doc, insumos.map((detalle: any, index: number) => [
      index + 1,
      detalle.articulo || '',
      detalle.codt_cantidad || '0',
      simboloMoneda.mone_Abreviatura + ' ' + Number(detalle.codt_preciocompra || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

      detalle.ubicaciones || '',
    ]), ['No.', 'Insumo', 'Cantidad', 'Precio', 'Ubicación'], finalY, tab, spaceBetweenTables);
  }

  if (maquinarias.length > 0) {
    finalY = this.generateTableWithPagination(doc, maquinarias.map((detalle: any, index: number) => [
      index + 1,
      detalle.articulo || '',
      detalle.tipoRenta || '',
      detalle.unidadMedidaoRenta || '',
      detalle.codt_cantidad || '0',
      simboloMoneda.mone_Abreviatura + ' ' + Number(detalle.codt_preciocompra || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

      detalle.ubicaciones || '',
    ]), ['No.', 'Maquinaria', 'Renta', 'Cantidad', 'Cantidad Maquinarias', 'Precio', 'Ubicación'], finalY, tab, spaceBetweenTables);
  }

  if (equiposSeguridad.length > 0) {
    finalY = this.generateTableWithPagination(doc, equiposSeguridad.map((detalle: any, index: number) => [
      index + 1,
      detalle.articulo || '',
      detalle.codt_cantidad || '0',
      simboloMoneda.mone_Abreviatura + ' ' + Number(detalle.codt_preciocompra || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),


      detalle.ubicaciones || '',
    ]), ['No.', 'Equipo', 'Cantidad', 'Precio', 'Ubicación'], finalY, tab, spaceBetweenTables);
  }

  // Agregar los totales al final
// Agregar los totales al final
const pageWidth = doc.internal.pageSize.width;
const pageHeight = doc.internal.pageSize.height;
const bottomMargin = 40;  // El margen inferior de la página
const marginRight = 20;
const impuesto = tab.detallesFiltrados[0]?.coti_Impuesto || 0;

// Verificamos si queda espacio suficiente para los totales
if (finalY + 30 > pageHeight - bottomMargin) {
    doc.addPage();  // Si no hay espacio, agregamos una nueva página
    finalY = topMargin;  // Restablecer el valor de Y para comenzar al inicio de la nueva página
}

// Configuración de los totales
const totalsConfig = [
    {
        label: 'SUBTOTAL',
        value: simboloMoneda.mone_Abreviatura + ' ' + tab.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    {
        label: `ISV (${impuesto}%)`,
        value: simboloMoneda.mone_Abreviatura + ' ' + tab.isv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    {
        label: 'TOTAL',
        value: simboloMoneda.mone_Abreviatura + ' ' + tab.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
];

doc.setFontSize(10);
totalsConfig.forEach((total, index) => {
    doc.text(`${total.label}: ${total.value}`, pageWidth - marginRight, finalY + 15 + (index * 10), { align: 'right' });
});

}



// Método privado para abrir el PDF en un contenedor HTML
private openPdfInDiv(doc: jsPDF) {
  this.viewState = {
    create: false, Seguridad: false,
    variableCambiada: false, detail: false, maqui: false, delete: false, index: false, ordenes: false, ordenesEditar: false, Detalles: false, createdirect: false
  };

  this.isPdfVisible = true;  // Cambia la visibilidad del card a true

  // Esperar un breve momento para que el card sea visible antes de cargar el PDF
  setTimeout(() => {
    const string = doc.output('datauristring');  // Convierte el PDF a un URI de datos
    const iframe = `<iframe width='100%' height='900px' src='${string}'></iframe>`;  // Crea un iframe para mostrar el PDF
    const pdfContainer = document.getElementById('pdfContainer');

    if (pdfContainer) {
      pdfContainer.innerHTML = iframe;  // Inserta el iframe en el contenedor del PDF
      this.cd.detectChanges();  // Detecta y aplica los cambios en la vista
    }
  }, 500);  // Espera 500ms antes de cargar el PDF en el contenedor
}



// Método para imprimir una pestaña específica como PDF
printTab(tab: any) {
  const doc = new jsPDF({
    orientation: 'portrait',  // Orientación de la página
    unit: 'mm',               // Unidades en milímetros
    format: 'a4'              // Formato de la página en A4
  });
  this.addHeader(doc, tab);  // Agrega el encabezado al PDF
  this.addTabContentToDoc(doc, tab);  // Agrega el contenido de la pestaña al PDF
  this.addFooter(doc);  // Agrega el pie de página al PDF
  this.openPdfInDiv(doc);  // Abre el PDF en un contenedor HTML
  this.isRegresarVisible = true;  // Muestra el botón de regresar
}


// Método para imprimir todas las pestañas como un solo documento PDF
printAll() {
  const doc = new jsPDF({
    orientation: 'portrait',  // Orientación de la página
    unit: 'mm',               // Unidades en milímetros
    format: 'a4'              // Formato de la página en A4
  });
  this.tabPanels.forEach((tab, i) => {
    if (i > 0) {
      doc.addPage();  // Agrega una nueva página para cada pestaña
    }
    this.addHeader(doc, tab);  // Agrega el encabezado al PDF
    this.addTabContentToDoc(doc, tab);  // Agrega el contenido de la pestaña al PDF
    this.addFooter(doc);  // Agrega el pie de página al PDF
  });
  this.openPdfInDiv(doc);  // Abre el PDF en un contenedor HTML
  this.isRegresarVisible = true;  // Muestra el botón de regresar
}


// Método para descargar una pestaña específica como archivo PDF
downloadTab(tab: any) {
  const doc = new jsPDF({
    orientation: 'portrait',  // Orientación de la página
    unit: 'mm',               // Unidades en milímetros
    format: 'a4'              // Formato de la página en A4
  });
  this.addHeader(doc, tab);  // Agrega el encabezado al PDF
  this.addTabContentToDoc(doc, tab);  // Agrega el contenido de la pestaña al PDF
  this.addFooter(doc);  // Agrega el pie de página al PDF
  doc.save(`Cotizacion_${tab.index}.pdf`);  // Descarga el PDF con un nombre específico
}


// Método para descargar todas las pestañas como un solo archivo PDF
downloadAll() {
  const doc = new jsPDF({
    orientation: 'portrait',  // Orientación de la página
    unit: 'mm',               // Unidades en milímetros
    format: 'a4'              // Formato de la página en A4
  });
  this.tabPanels.forEach((tab, i) => {
    if (i > 0) {
      doc.addPage();  // Agrega una nueva página para cada pestaña
    }
    this.addHeader(doc, tab);  // Agrega el encabezado al PDF
    this.addTabContentToDoc(doc, tab);  // Agrega el contenido de la pestaña al PDF
    this.addFooter(doc);  // Agrega el pie de página al PDF
  });
  doc.save('Todas_las_Cotizaciones.pdf');  // Descarga el PDF con un nombre específico
}



// Métodos para cargar listas de datos para diferentes elementos

// Método para cargar la lista de proveedores para el dropdown
async ListarProveedores() {
  this.proveedor = await this.proveedorService.Listar();
  this.proveedor = this.proveedor.sort((a, b) => a.prov_Descripcion.localeCompare(b.prov_Descripcion))
}

//Seteamos en el autocomplete una lista de insumos
async ListarInsumos() {
  this.insumos = await this.CotiService.ListarInsumos();
  this.insumos = this.insumos.sort((a, b) => a.insumos.localeCompare(b.insumos))
}


//Seteamos en el autocomplete una lista de categorias
async ListarCategorias() {
  this.categoria = await this.CotiService.ListarCategorias();
  this.categoria = this.categoria.sort((a, b) => a.cate_Descripcion.localeCompare(b.cate_Descripcion))
}
//Seteamos en el autocomplete una lista de materiales
async ListarMateriales() {
    this.material = await this.materialService.Listar();
    this.material = this.material.sort((a, b) => a.mate_Descripcion.localeCompare(b.mate_Descripcion))
}

//Seteamos en el autocomplete una lista de unidades de medida
async ListarUnidadesDeMedida() {
  this.unidad = await this.CotiService.listarUnidadesDeMedida();
  this.unidad =  this.unidad.sort((a, b) => a.unme_Nombre.localeCompare(b.unme_Nombre))
}
//Seteamos en el autocomplete una lista de maquinaria
ListarMaquinaria() {
  this.CotiService.ListarMaquinaria()
  .then((data) => this.maquinariaCompra = data.sort((a, b) => a.maqu_Descripcion.localeCompare(b.maqu_Descripcion)))
  .catch((error) => {
    //console.log(error, 'error')
  });
}

//Seteamos en el autocomplete una lista de niveles
ListarNiveles() {
  this.CotiService.ListarNiveles().subscribe(
    (nivel: Nivel[]) => {
      this.nivel = nivel.sort((a, b) => a.nive_Descripcion.localeCompare(b.nive_Descripcion));
    },
    error => {
      //console.log(error);
    }
  );
}

// Método para filtrar cotizaciones según el tipo seleccionado
async filterCotizaciones(event) {
  //Si el radio button es igual a 0, filtra la tabla para que muestre los registros de Maquinaria
  if (this.radioButton == 0) {
    //Tambien cambia los th dependiendo el filtro
    this.EncabezadoCantidad = "Cantidad Maquinaria";
    this.EncabezadoMedida = "Cantidad";

    //Filtra y setea todos los registros que sean de Maquinaria
    this.filteredCotizacionesTabla = this.CotizacionesTabla.filter(coti => coti.categoria === 'Maquinaria');
    //Verifica si maquinaria tiene registros entonces si tiene el radio aparecera en maquinaria, si no tiene en equipos
    const Maquinaria =  this.CotizacionesTabla.filter(coti => coti.categoria === 'Maquinaria' && coti.agregadoACotizacion == true);
    const Insumo =  this.CotizacionesTabla.filter(coti => coti.categoria === 'Insumo'  && coti.agregadoACotizacion == true);
    const Equipo =  this.CotizacionesTabla.filter(coti => coti.categoria === 'Equipo'  && coti.agregadoACotizacion == true);
    if (event == true) {
      if (Maquinaria.length > 0) {
        this.radioButton = 0
      }else if(Equipo.length > 0){
        this.EncabezadoCantidad = "Cantidad";
        this.EncabezadoMedida = "Medida";
        this.filteredCotizacionesTabla = this.CotizacionesTabla.filter(coti => coti.categoria === 'Equipo');
        this.radioButton = 2
      }else if (Insumo.length > 0) {
        this.EncabezadoCantidad = "Cantidad";
        this.EncabezadoMedida = "Medida";
        this.filteredCotizacionesTabla = this.CotizacionesTabla.filter(coti => coti.categoria === 'Insumo');
        this.radioButton = 1
      }else  {
        this.EncabezadoCantidad = "Cantidad Maquinaria";
        this.EncabezadoMedida = "Cantidad";
        this.radioButton = 0
        this.filteredCotizacionesTabla = this.CotizacionesTabla.filter(coti => coti.categoria === 'Maquinaria');
      }
    }

  //Funcion para marcar al padre si ese filtro ya viene marcado
    await this.TotalCheck();
  //Si el radio button es igual a 1, filtra la tabla para que muestre los registros de Insumos
  }else if (this.radioButton == 1)  {
    //Tambien cambia los th dependiendo el filtro
    this.EncabezadoCantidad = "Cantidad";
    this.EncabezadoMedida = "Medida";
    //Filtra y setea todos los registros que sean de insumos
    this.filteredCotizacionesTabla = this.CotizacionesTabla.filter(coti => coti.categoria === 'Insumo');
      //Verifica si maquinaria tiene registros entonces si tiene el radio aparecera en Insumos, si no tiene en equipos
    const Insumo =  this.CotizacionesTabla.filter(coti => coti.categoria == 'Insumo' && coti.agregadoACotizacion == true);
    const Maquinaria =  this.CotizacionesTabla.filter(coti => coti.categoria == 'Maquinaria' && coti.agregadoACotizacion == true);
    const Equipo =  this.CotizacionesTabla.filter(coti => coti.categoria == 'Equipo' && coti.agregadoACotizacion == true);
    if (event == true) {
      if (Insumo.length > 0) {
        this.radioButton = 1
      }else if(Equipo.length > 0) {
        this.filteredCotizacionesTabla = this.CotizacionesTabla.filter(coti => coti.categoria === 'Equipo');
        this.radioButton = 2
      }else if(Maquinaria.length > 0){
          this.EncabezadoCantidad = "Cantidad Maquinaria";
          this.EncabezadoMedida = "Cantidad";
          this.filteredCotizacionesTabla = this.CotizacionesTabla.filter(coti => coti.categoria === 'Maquinaria');
          this.radioButton = 0
      }else{
          this.radioButton = 1
      }
    }

     //Funcion para marcar al padre si ese filtro ya viene marcado
    await this.TotalCheck();
    //Si el radio button es igual a 2, filtra la tabla para que muestre los registros de Equipos de seguridad
  }else if (this.radioButton == 2)  {
    //Tambien cambia los th dependiendo el filtro
    this.EncabezadoCantidad = "Cantidad";
    this.EncabezadoMedida = "Medida";
     //Filtra y setea todos los registros que sean de Equipos de seguridad
    this.filteredCotizacionesTabla = this.CotizacionesTabla.filter(coti => coti.categoria === 'Equipo');
    const Equipo =  this.CotizacionesTabla.filter(coti => coti.categoria === 'Equipo' && coti.agregadoACotizacion == true);
    const Insumo =  this.CotizacionesTabla.filter(coti => coti.categoria === 'Insumo'  && coti.agregadoACotizacion == true);
    const Maquinaria =  this.CotizacionesTabla.filter(coti => coti.categoria === 'Maquinaria'  && coti.agregadoACotizacion == true);
    if (event == true) {
      if (Equipo.length > 0) {
        this.radioButton = 2
      }else if (Insumo.length > 0) {
        this.radioButton = 1
        this.EncabezadoCantidad = "Cantidad";
        this.EncabezadoMedida = "Medida";
        this.filteredCotizacionesTabla = this.CotizacionesTabla.filter(coti => coti.categoria === 'Insumo');
      }else if (Maquinaria.length > 0){
        this.EncabezadoCantidad = "Cantidad Maquinaria";
        this.EncabezadoMedida = "Cantidad";
        this.radioButton = 0
        this.filteredCotizacionesTabla = this.CotizacionesTabla.filter(coti => coti.categoria === 'Maquinaria');
      }else {
        this.radioButton = 2
        this.filteredCotizacionesTabla = this.CotizacionesTabla.filter(coti => coti.categoria === 'Equipo');
      }
    }

    //Funcion para marcar al padre si ese filtro ya viene marcado
    await this.TotalCheck();
  }
}


  //Resetear formulario
  reseteoFormularios(){
    this.form.reset();
    this.formInsumo.reset();
    this.formMaquinaria.reset();
    this.formEquipo.reset();
    this.submittedCompra = false;
  }

  //Cierra la cotizacion
CerrarCotizacion() {
  if (this.activeIndex > 0) {
    this.onTabChange({ index: 0 });
  } else {
    this.viewState = {
      create: false,
      Seguridad:false,
      variableCambiada: false,
      detail: false,
      delete: false,
      index: true,
      maqui: false,
      ordenes: false,
      ordenesEditar: false,
      Detalles: false,
      createdirect: false
  };
  }
  this.resetForm(); // Resetea el formulario a su estado inicial

  this.submitted = false; // Marca el formulario como no enviado
  this.resetTabPanels(); // Reinicia los paneles de pestañas
  this.cd.detectChanges(); // Detecta y aplica los cambios en la vista
  this.mostrarMaquinaria = false; // Oculta la sección de maquinaria
  this.mostrarInsumo = false; // Oculta la sección de insumo
  this.mostrarEquipoSeguridad = false; // Oculta la sección de equipo de seguridad

}
CerrarCotizacionNuevo() {
  if (this.activeIndex > 0) {
    this.onTabChange({ index: 0 });
  } else {
    this.service.Eliminar(this.idCompra).subscribe(
      (respuesta: Respuesta) => {
      }
    );
    this.viewState = {
      create: false,
      Seguridad:false,
      variableCambiada: false,
      detail: false,
      delete: false,
      index: true,
      maqui: false,
      ordenes: false,
      ordenesEditar: false,
      Detalles: false,
      createdirect: false
  };
  }

  if (this.selectedCompraId != null) {
    this.service.EliminarCompra(this.selectedCompraId).subscribe(
        response => {

        },
        error => {
            // Maneja el error si es necesario
            this.cd.detectChanges();
        }
    );
} else {

}


}

  //La eleccion para saber si esta incluida el impuesto
  ConImpuesto(event){
    //console.log('entraconimpuesto');

    this.ModalImpuesto = false;
    if (event == "Si") {
      //console.log('impuesto incluido');

      this.IncluidoImpuesto = true;
      this.LabelIncluido = "Sí"
    }else {
      this.IncluidoImpuesto = false;
      this.LabelIncluido = "No"
    }

    const today = new Date();
    this.formCompra.patchValue({
      coti_Fecha: today
  });
  }

        //Cargar impuesto
        ListadoImpuesto() {
          this.CotiService.ListarImpuesto().subscribe(
            (data: any) => {
              this.ValorImpuesto = data[0].impu_Porcentaje
            }
          );
        }

  //Cargar tabla
  async ListarTablaCotizacion(Prov: any, Coti: any) {
    this.isLoading = true
    //Seteamos los datos en la tabla de cotizaciones, y respectivamente hace el filtrado de cotizaciones y luego una funcion para sacar el total
    await this.CotiService.BuscarTablaCotizacion(Prov, Coti).then(
      async (insu: CotizacionTabla[]) => {
        this.CotizacionesTabla = insu;
        const RaddioButton = true;
        //Una vez seteamos iniciamos el filtrado
        await this.filterCotizaciones(RaddioButton);
        this.isLoading = false
        //Una vez seteamos los datos sacamos el total para mostarlo
        this.TotalsEdit();

      },
      error => {
        //console.log(error);
      }
    );
  }

  //General el calculo de los totales,subtotales e impuesto
  TotalsEdit(): void {
    //Pregunta si en la tabla general sin filtrado tiene datos para realizar el calculo
    if (this.CotizacionesTabla.length > 0) {
     //Guardaremos en una variable el total de la cotizaciones
    this.subtotal = 0;
    //Sumamos la cantidad y el precio y si trae impuesto setearlo en la variable global
    this.CotizacionesTabla.forEach(item => {
      if (item.agregadoACotizacion) {
        if (item.coti_Impuesto != null) {
          this.ValorImpuesto = item.coti_Impuesto
          this.IncluidoImpuesto = item.coti_Incluido
        }

        this.subtotal += item.cantidad * item.precio;
      }
    });
    //Marcar al padre en caso de tener todo seleccionado
    this.TotalCheck();
    //Si el impuesto esta incluido realizar formula para extraerlo
    if (this.IncluidoImpuesto == true) {
      this.LabelIncluido= "Sí"
      const impuestoIncluido = (parseFloat(this.ValorImpuesto) / 100) + 1
      const impuesto = parseFloat(this.ValorImpuesto) / 100
      this.subtotal = this.subtotal / impuestoIncluido;
      this.tax = this.subtotal * impuesto;
      this.total = this.subtotal + this.tax;
      //De lo contrario setearle el impuesto
    }else {
      this.LabelIncluido= "No"
      const impuesto = parseFloat(this.ValorImpuesto) / 100
      this.tax = this.subtotal * impuesto;
      this.total = this.subtotal + this.tax;
    }
  }else
  {
    //Entonces mostramos en 0 todo
    //this.selectAll = false;
    this.subtotal = 0.00;
    this.tax = 0.00;
    this.total = 0.00;
  }
  //Preguntamos si esta vacio alguno para mostrar todo en 0
    if (Number.isNaN(this.tax) || Number.isNaN(this.total) || Number.isNaN(this.subtotal)  ) {
      this.subtotal = 0.00;
      this.tax = 0.00;
      this.total = 0.00;
    }
    //Al terminar parseamos todo y solo mostramos 2 decimales
    this.subtotal = parseFloat(this.subtotal.toFixed(2));
    this.tax = parseFloat(this.tax.toFixed(2));
    this.total = parseFloat(this.total.toFixed(2));
  }

     //Actualiza el label del total.
     updateTotal(coti: any) {
      //Actualizamos el total de la fila a la cual estemos cambiando la cantidad o el precio
      //console.log(coti)
      let bit = 0
      //dependiendo la categoria guardara el identificador.
      if (coti.categoria == "Maquinaria" ) {
        bit = 0
      }else  if (coti.categoria == "Insumo" ){
        bit = 1
      }else  if (coti.categoria == "Equipo" ){
        bit = 2
      }


      let index = this.selectCheckbox.findIndex(selec => selec.cime_Id === coti.idP && selec.cime_InsumoOMaquinariaOEquipoSeguridad === bit);

      if (index !== -1) {
        // Si el índice existe, modifica los valores directamente
        this.selectCheckbox[index].code_Cantidad = coti.cantidad;
        this.selectCheckbox[index].code_PrecioCompra = coti.precio;

        this.updateTotales();

      } else {
        this.updateTotales();

      }
      //console.log(this.selectCheckbox)
      coti.total = coti.cantidad * coti.precio;
    }


  //Verifica si estan chequeados todo para actualizar el check del padre
  async TotalCheck() {
    //Si es mayor a 0 significa que ese filtrado tiene datos
    if (this.filteredCotizacionesTabla.length >0 ) {

      //Chequeamos al padre
      this.selectAll = true;
      // Verifica cada item
    this.filteredCotizacionesTabla.forEach(item => {
      // Si algún item no está seleccionado, marca selectAll como false y termina la iteración
      if (!item.agregadoACotizacion) {
        this.selectAll = false;
        return; // Termina la iteración
      }
    });
    //De lo contrario no aparecera marcado el padre
    }else{
      this.selectAll = false;
    }
}

  //Filtrado de proveedores
  filterProveedores(event) {
    let query = event.query.toLowerCase();
    this.filteredProveedores = this.proveedor.filter(prov =>
        prov.prov_Descripcion.toLowerCase().includes(query));
}
//Cuando selecciona un proveedor actualiza la tabla
async SelectProveedores(event: any){
  this.formCompra.patchValue({
    prov_Descripcion: event.value.prov_Descripcion
  });
  await this.HabilitarProveedores();
}

   //Crear proveedor si le da al boton de guardar
   async CreateProveedor(){
    this.HabilitarProveedores();
  }
  async HabilitarProveedores() {
    const RaddioButton = true;
    //Iniciamos con el id en 0 que esto se usara para el crear
    this.idCompra = 0;
    //console.log(this.proveedor, 'this.proveedor');

    //console.log(this.idProveedor, 'this.idProveedor');

    //console.log(this.formCompra.value.prov_Descripcion, 'formcompra vlaue');

    //Sacamos el id del proveedor mediante un LinQ
    const navigationState = this.navigationStateService.getState();

    if(navigationState && navigationState.compra){
      this.idProveedor = this.proveedor.find(proveedor => proveedor.prov_Descripcion == this.formCompra.value.prov_Descripcion.prov_Descripcion)?.prov_Id ?? 0;
    }else{
      this.idProveedor = this.proveedor.find(proveedor => proveedor.prov_Descripcion == this.formCompra.value.prov_Descripcion)?.prov_Id ?? 0;
    }
    //console.log(this.idProveedor, 'this.idProveedor');

    //console.log('pasa idproveedor');


    //Si el proveedor existe entrara a este if
    if (this.idProveedor != 0) {
      //console.log('entra if idproveedor');

      let tabs;
      if(navigationState && navigationState.compra){
        tabs = this.proveedor.find(proveedor => proveedor.prov_Descripcion == this.formCompra.value.prov_Descripcion.prov_Descripcion).venta;
      }else{
        tabs = this.proveedor.find(proveedor => proveedor.prov_Descripcion == this.formCompra.value.prov_Descripcion).venta;
      }
      //Si el proveedor es diferente a 0 llamaos a su listado
      //Ahora procedemos a traer los tabs que tiene ese proveedor
      //console.log('pasa tabs');

      //Cerramos todos los tabs y bloqueamos
      this.dhTab = true;
      this.tabMaquinaria = false;
      this.tabInsumo = false;
      this.tabEquiposSeguridad = false;
      this.filtroboton = false;
      //Iniciamos la busqueda

      if (tabs == "Insumos") {
        //console.log('entra if tabs insumos');

        //Si es tab Insumos se habilita y se apagar el disabled
        this.tabInsumo = true;
        this.dhTab = false;
        this.activeIndex = 0;
        this.radioButton = 1
        this.tabEquiposSeguridad = true;
        this.filtroboton = true;
        //Se hace el filtrado con insumos
        await this.ListarTablaCotizacion(this.idProveedor, this.id);
      } else if (tabs == "Maquinarias") {
        this.tabMaquinaria = true;
        this.dhTab = false;
        this.activeIndex = 0;
        this.radioButton = 0
        this.tabEquiposSeguridad = true;
        this.filtroboton = true;
        //Se hace el filtrado con Maquinaria
        await this.ListarTablaCotizacion(this.idProveedor, this.id);
      } else if (tabs == "Todos"){
        //Si es todos habilitamos todos tabs
        this.dhTab = false;
        this.tabMaquinaria = true;
        this.tabInsumo = true;
        this.tabEquiposSeguridad = true;
        this.activeIndex = 0;
        this.radioButton = 1
        this.filtroboton = true;
        //Se hace el filtrado con insumo por defecto
        await this.ListarTablaCotizacion(this.idProveedor, this.id);
      }
      else  {
        //si no es ninguno es Equipo de seguridad
        this.dhTab = false;
        this.tabInsumo = false;
        this.tabMaquinaria = false;
        this.tabEquiposSeguridad = true;
        this.activeIndex = 0;
        this.radioButton = 2
        //Se fiiltra el equipo de seguridad
        await this.ListarTablaCotizacion(this.idProveedor, this.id);
      }

    } else {

      this.dhTab = true;
      this.tabMaquinaria = false;
      this.tabInsumo = false;
      this.proveedorFormulario = true;
      this.proveedorForm.prov_Descripcion = this.formCompra.value.prov_Descripcion;
      this.ciudades = [];
      this.estados = [];
      this.paisService.Listar().subscribe((data: any) => { this.paises = data.data });
      this.submittedCompra = false;
      this.viewState = {
        create: false,
        Seguridad:false,
        variableCambiada: false,
        detail: false,
        delete: false,
        index: false,
        maqui: false,
        ordenes: false,
        ordenesEditar: false,
        Detalles: false,
        createdirect: false
    };
    }
  }

  //Cambiamos de tab para si es insumo o maquinaria

     onTabChange(event: any) {

      if (event.index === 0) {
        this.activeIndex = 0;
      this.Enviado = false
       this.titulo = "Nueva"

      this.ListarTablaCotizacion(this.idProveedor,this.idCompra)
      }
      if (event.index === 1) {
        this.activeIndex = 1;

        if (this.idCompra == 0 || this.Enviado == false) {
          this.Guardar()
        }

        this.Enviado = true;
        this.ListarEquiposSeguridad()

        this.ListarCategorias()
        this.ListarInsumos()
        this.ListarMateriales()
        this.formMaquinariaCompra.reset();
        this.ListarMaquinariaPorProveedores(this.idProveedor)

        this.formEquipo.reset();
        this.ListarEquiposPorProveedores(this.idProveedor)

        this.formInsumo.reset();
        this.formUnidad.reset();

        this.idInsumo = 0;
        this.titulo = "Nueva"
        this.submittedCompra = false;
        this.ListarTablaDeMedidas(this.idProveedor,this.idInsumo)
      }


      if (event.index === 2) {
        this.activeIndex = 2;

        if (this.idCompra == 0 || this.Enviado == false) {
          this.Guardar()
        }

        this.Enviado = true;


        this.titulo = "Nueva"
        this.formMaquinariaCompra.reset();
        this.ListarMaquinariaPorProveedores(this.idProveedor)
        this.submittedCompra = false;

      }


      if (event.index === 3) {
        this.activeIndex = 3;

        if (this.idCompra == 0 || this.Enviado == false) {
          this.Guardar()
        }

        this.Enviado = true;

        this.ListarEquiposSeguridad()
        this.titulo = "Nueva"
        this.formEquipo.reset();
        this.ListarEquiposPorProveedores(this.idProveedor)
        this.submittedCompra = false;

      }


    }





     //Cuando el le da check envia la informacion para guardarlo
  //Cuando el le da check envia la informacion para guardarlo
  CheckboxChange(event: any, cantidad: any, precio: any, Id: any, categoria: any, unidad: any, esMaquinaria: any) {
    //console.log(cantidad, precio, Id, categoria, unidad, esMaquinaria);

    let bit = 0
    if (categoria == "Maquinaria" ) {
      bit = 0
    }else  if (categoria == "Insumo" ){
      bit = 1
    }else  if (categoria == "Equipo" ){
      bit = 2
    }

    // Buscar y eliminar el elemento existente en la lista si existe
    this.selectCheckbox = this.selectCheckbox.filter(item => !(item.cime_Id === Id && item.cime_InsumoOMaquinariaOEquipoSeguridad === bit));
    let horasODias = 1;
    if (esMaquinaria == "Días" || esMaquinaria == "Horas" || esMaquinaria == "Viajes") {
      horasODias = unidad
    }
    if (event.checked != false) {
      if (this.idProveedor != 0) {
        const CotizacionesViewModel: any = {
          coti_Id: this.idCompra,
          code_Id : this.idcotizaciondetalle,

          prov_Id: this.idProveedor,
          coti_Fecha: this.formCompra.value.coti_Fecha,
          empl_Id: 2,
          coti_Incluido: this.IncluidoImpuesto,
          code_Cantidad: cantidad,
          code_PrecioCompra: precio,
          cime_Id: Id,
          cime_InsumoOMaquinariaOEquipoSeguridad: bit,
          usua_Creacion: this.usua_Id,
          usua_Modificacion: this.usua_Id,
          code_Renta:horasODias,
          check: true,
          coti_CompraDirecta: true
        };
        //console.log('ID Cotización Detalle:', this.idcotizaciondetalle);

        this.formCompra.get('prov_Descripcion').disable();
        this.formCompra.get('coti_Fecha').disable();
        this.botonCrear = true;
        this.selectCheckbox.push(CotizacionesViewModel);
      } else {
        this.submittedCompra = true;
      }
    } else {
      const CotizacionesViewModel: any = {
        coti_Id: this.idCompra,
        prov_Id: this.idProveedor,
        coti_Fecha: this.formCompra.value.coti_Fecha,
        empl_Id: 2,
        coti_Incluido: this.IncluidoImpuesto,
        code_Cantidad: cantidad,
        code_PrecioCompra: precio,
        cime_Id: Id,
        cime_InsumoOMaquinariaOEquipoSeguridad: bit,
        usua_Creacion: this.usua_Id,
        usua_Modificacion: this.usua_Id,
        check: false,
        coti_CompraDirecta: true
      };
      this.selectCheckbox.push(CotizacionesViewModel);
    }

    this.updateTotales();
    this.TotalCheck();
  }

  onSelectAllChange(event: any, coti: any) {
    this.formCompra.get('prov_Descripcion').disable();
    this.formCompra.get('coti_Fecha').disable();
    this.botonCrear = true;
    if (event.checked) {
      // Seleccionar todos los elementos y agregarlos a this.selectCheckbox
        this.filteredCotizacionesTabla.forEach(coti => {
        let bit = 0
        if (coti.categoria == "Maquinaria" ) {
          bit = 0
        }else  if (coti.categoria == "Insumo" ){
          bit = 1
        }else  if (coti.categoria == "Equipo" ){
          bit = 2
        }


        // Buscar y eliminar el elemento existente en la lista si existe
        this.selectCheckbox = this.selectCheckbox.filter(item => !(item.cime_Id === coti.idP && item.cime_InsumoOMaquinariaOEquipoSeguridad === bit));
        let horasODias = 1;
        if (coti.medidaORenta == "Días" || coti.medidaORenta == "Horas") {
          horasODias = coti.unidad
        }
        const CotizacionesViewModel: any = {
          coti_Id: this.idCompra,
          prov_Id: this.idProveedor,
          coti_Fecha: this.formCompra.value.coti_Fecha,
          empl_Id: 2,
          coti_Incluido: this.IncluidoImpuesto,
          code_Cantidad: coti.cantidad,
          code_PrecioCompra: coti.precio,
          cime_Id: coti.idP,
          cime_InsumoOMaquinariaOEquipoSeguridad: bit,
          usua_Creacion: this.usua_Id,
          usua_Modificacion: this.usua_Id,
          code_Renta:horasODias,
          check: true,
          coti_CompraDirecta: true
        };
        this.selectCheckbox.push(CotizacionesViewModel);
        coti.agregadoACotizacion = true;
      });
    } else {

      this.filteredCotizacionesTabla.forEach(coti => {
        let bit = 0
        if (coti.categoria == "Maquinaria" ) {
          bit = 0
        }else  if (coti.categoria == "Insumo" ){
          bit = 1
        }else  if (coti.categoria == "Equipo" ){
          bit = 2
        }
        coti.agregadoACotizacion = false;
        // Eliminar todos los elementos de la lista
        this.selectCheckbox = this.selectCheckbox.filter(item => !(item.cime_Id === coti.idP && item.cime_InsumoOMaquinariaOEquipoSeguridad === bit));
        const CotizacionesViewModel: any = {
          coti_Id: this.idCompra,
          prov_Id: this.idProveedor,
          coti_Fecha: this.formCompra.value.coti_Fecha,
          empl_Id: 2,
          coti_Incluido: this.IncluidoImpuesto,
          code_Cantidad:  coti.cantidad,
          code_PrecioCompra: coti.precio,
          cime_Id: coti.idP,
          cime_InsumoOMaquinariaOEquipoSeguridad: bit,
          usua_Creacion: this.usua_Id,
          usua_Modificacion: this.usua_Id,
          check: false,
          coti_CompraDirecta: true
        };
        this.selectCheckbox.push(CotizacionesViewModel);
      });
    }
    this.updateTotales();
  }




  finalizar() {
  // Recorrer los detalles seleccionados para verificar si cantidad o precio están vacíos
  for (let detalle of this.selectedDetalles) {
    if (!detalle.codt_cantidad || detalle.codt_cantidad <= 0) {
      // Si la cantidad está vacía o es 0, muestra un mensaje de error
      this.messageService.add({severity: 'warn', summary: 'Advertencia', detail: 'La cantidad no puede estar vacía o ser 0'});
      return; // Evitar continuar si hay un error
    }
    if (!detalle.codt_preciocompra || detalle.codt_preciocompra <= 0) {
      // Si el precio está vacío o es 0, muestra un mensaje de error
      this.messageService.add({severity: 'warn', summary: 'Advertencia', detail: 'El precio no puede estar vacío o ser 0'});
      return; // Evitar continuar si hay un error
    }

    if (!detalle.codt_Renta || detalle.codt_Renta <= 0) {
        // Si el precio está vacío o es 0, muestra un mensaje de error
        this.messageService.add({severity: 'warn', summary: 'Advertencia', detail: 'La renta no puede estar vacía o ser 0'});
        return; // Evitar continuar si hay un error
      }
  }
    this.submitted = false;  // Asegúrate de que el estado de validación sea falso
    //console.log(this.selectedDetalles)
    const detallesUnicos = [];
    const registrosUnicos = new Set();

    this.selectedDetalles.forEach(detalle => {
        const claveUnica = `${detalle.coti_Id}-${detalle.prov_Id}`;

        if (!registrosUnicos.has(claveUnica)) {
            registrosUnicos.add(claveUnica);
            detallesUnicos.push({
                coti_Id: detalle.coti_Id,
                prov_Id: detalle.prov_Id,
                prov_Descripcion: detalle.prov_Descripcion
            });
        }


    });

    this.ProveedoresCotizaciones = detallesUnicos;
    const primerProvId = detallesUnicos.length > 0 ? detallesUnicos[0].prov_Id : null;

    let mismoProveedor = true; // Assume all are the same initially
    const proveedoresSet = new Set(); // Set to track unique provider IDs
    let proveedoresEncontrados = 1; // To count duplicates

    this.ProveedoresCotizaciones.forEach(detalle => {
        if (proveedoresSet.has(detalle.prov_Id)) {
            proveedoresEncontrados++;
            mismoProveedor = false; // If we find a duplicate, they are not the same
            //console.log(detalle.prov_Descripcion)
            this.proveedorRepetido = detalle.prov_Descripcion
        } else {

            proveedoresSet.add(detalle.prov_Id); // Add to set if not already present
        }
    });

    if (this.ProveedoresCotizaciones.length == 1) {
      this.selectedDetalles = this.selectedDetalles.map(detalle => {
        detalle.identificador = 0;
        return detalle;
      });
      this.guardarOrdenCompra();
      this.reiniciarFormulario();
    }else if(proveedoresEncontrados > 2){
      this.verificarProveedoresDuplicados();
      this.ModalListaProveedores = true;
    }else if (proveedoresEncontrados > 1) {
      this.ModalMismoProveedor = true;
    } else {
      let currentIdentificador = 0;
      const seenCombinations = new Map();

      this.selectedDetalles = this.selectedDetalles.map(detalle => {
        const claveUnica = `${detalle.coti_Id}-${detalle.prov_Id}`;

        if (!seenCombinations.has(claveUnica)) {

          currentIdentificador++;
          seenCombinations.set(claveUnica, currentIdentificador);
        }

        detalle.identificador = seenCombinations.get(claveUnica);

        return detalle;
      });
      this.guardarOrdenCompra();
      this.reiniciarFormulario();  // Mostrar modal para orden de compra

      this.formde.reset();
      this.formEnvio.reset();
      this.bodegaOproycto = '';
      this.check = false;
      this.EtapasPorProyectos = [];
      this.ActividadesPorEtapa = [];
    }
   // Reutiliza el método para reiniciar el formulario correctamente
  }
  verificarProveedoresDuplicados() {
    const proveedoresSet = new Set<number>();
    const proveedorContador: { [key: number]: ProveedorRepetido } = {};

    this.ProveedoresCotizaciones.forEach(detalle => {
      if (proveedoresSet.has(detalle.prov_Id)) {
        proveedorContador[detalle.prov_Id].cotizaciones.push({ id: detalle.coti_Id, checked: false });
        proveedorContador[detalle.prov_Id].repeticiones++;
      } else {
        proveedoresSet.add(detalle.prov_Id);
        proveedorContador[detalle.prov_Id] = {
          prov_Id: detalle.prov_Id,
          prov_Descripcion: detalle.prov_Descripcion,
          cotizaciones: [{ id: detalle.coti_Id, checked: false }],
          repeticiones: 1,

        };
      }
    });
    this.selecciones = [];
    this.proveedoresRepetidos = Object.values(proveedorContador).filter(proveedor => proveedor.repeticiones >= 3);

    if (this.proveedoresRepetidos.length > 0) {
      this.ModalListaProveedores = true;
    }
  }

toggleSeleccion(proveedorId: number, cotiId: number, checked: boolean) {
    const proveedor = this.proveedoresRepetidos.find(p => p.prov_Id === proveedorId);
    if (proveedor) {
        const cotizacion = proveedor.cotizaciones.find(c => c.id === cotiId);
        if (cotizacion) {
            cotizacion.checked = checked;
        }
    }

    if (checked) {
        this.selecciones.push({ prov_Id: proveedorId, coti_Id: cotiId });
    } else {
        this.selecciones = this.selecciones.filter(seleccion => !(seleccion.prov_Id === proveedorId && seleccion.coti_Id === cotiId));
    }
}

guardarSeleccionados() {
  //console.log(this.selecciones);

  let currentIdentificador = 0;
  const seenCombinations = new Map<string, number>();

  // Asignar identificadores únicos a las combinaciones en this.selecciones
  this.selecciones.forEach(seleccion => {
    const claveUnica = `${seleccion.prov_Id}`;

    // Si este proveedor no ha sido visto antes, asigna un nuevo identificador
    if (!seenCombinations.has(claveUnica)) {
      currentIdentificador++;
      seenCombinations.set(claveUnica, currentIdentificador);
    }

    // Asigna el identificador basado en el proveedor (sin importar el coti_Id)
    seleccion.identificador = seenCombinations.get(claveUnica);
  });

  // Aplicar los identificadores a selectedDetalles excluyendo los que están en selecciones
  this.selectedDetalles = this.selectedDetalles.map(detalle => {
    // Verificar si este detalle está en las selecciones
    const seleccion = this.selecciones.find(sel =>
      sel.prov_Id === detalle.prov_Id && sel.coti_Id === detalle.coti_Id
    );

    if (seleccion) {
      // Si está en selecciones, asignar el identificador correspondiente
      detalle.identificador = seleccion.identificador;
    } else {
      // Si no está en selecciones, asignar un nuevo identificador
      const claveUnica = `${detalle.coti_Id}-${detalle.prov_Id}`;

      if (!seenCombinations.has(claveUnica)) {
        currentIdentificador++;
        seenCombinations.set(claveUnica, currentIdentificador);
      }

      detalle.identificador = seenCombinations.get(claveUnica);
    }

    return detalle;
  });

  //console.log('Detalles con identificador:', this.selectedDetalles);
  this.ModalListaProveedores = false;
  this.guardarOrdenCompra();
  this.reiniciarFormulario();
}
toggleAllCheckboxes(event) {
    this.proveedoresRepetidos.forEach(proveedor => proveedor.checked = event.checked);
}
reiniciarFormulario() {
  this.numeroCompra = '';  // Limpia el valor del número de compra al abrir el modal
  this.submitted = false;  // Reinicia el estado de validación al abrir el modal
}

guardarOrdenCompraMostar() {
  this.submitted = false;  // Asegúrate de que el estado de validación sea falsot

  this.mostrarModalOrdenCompra2 = true;
  this.reiniciarFormulario();  // Reutiliza el método para reiniciar el formulario correctamente
}

GuardarMismoP(){
  let currentIdentificador = 0;
  const seenCombinations = new Map();

  this.selectedDetalles = this.selectedDetalles.map(detalle => {
    const claveUnica = `${detalle.prov_Id}`;

    if (!seenCombinations.has(claveUnica)) {

      currentIdentificador++;
      seenCombinations.set(claveUnica, currentIdentificador);
    }

    detalle.identificador = seenCombinations.get(claveUnica);

    return detalle;
  });
  this.ModalMismoProveedor = false;
  this.reiniciarFormulario();
  this.guardarOrdenCompra();
}


GuardarDiferenteP(){

  let currentIdentificador = 0;
  const seenCombinations = new Map();

  this.selectedDetalles = this.selectedDetalles.map(detalle => {
    const claveUnica = `${detalle.coti_Id}-${detalle.prov_Id}`;

    if (!seenCombinations.has(claveUnica)) {

      currentIdentificador++;
      seenCombinations.set(claveUnica, currentIdentificador);
    }

    detalle.identificador = seenCombinations.get(claveUnica);

    return detalle;
  });
  //console.log(this.selectedDetalles)
  this.ModalMismoProveedor = false;
  this.reiniciarFormulario();
  this.guardarOrdenCompra();
}
guardarOrdenCompra() {
  // this.submitted = true;  // Marca como enviado para activar la validación

  // Si el número de compra está vacío, muestra el borde rojo y el mensaje
  // if (!this.numeroCompra || this.numeroCompra.trim() === '') {
  //     //console.log('El número de orden de compra es requerido.');
  //     return;  // No procedemos con el guardado si el campo está vacío
  // }

  this.permitirEliminar = true;

  // Restante lógica de guardado
  const detallesActualizados = this.selectedDetalles
      .filter(detalle => detalle.agregadoACotizacion === true)
      .map(detalle => {
          const detalleActualizado: any = {
              codt_Id: detalle.codt_Id !== undefined ? detalle.codt_Id : null,
              coen_Id: this.id,
              code_Id: detalle.code_Id,
              codt_InsumoOMaquinariaOEquipoSeguridad: detalle.cime_InsumoOMaquinariaOEquipoSeguridad,
              empl_Id: 2,
              meto_Id: 4,
              coen_numeroCompra: '0000',
              usua_Creacion: this.usua_Id,
              usua_Modificacion: this.usua_Id,
              identificador: detalle.identificador
          };

          if (detalle.codt_Renta !== null) {
              detalleActualizado.codt_Renta = detalle.codt_Renta;
          }
          if (detalle.codt_cantidad !== null) {
              detalleActualizado.codt_cantidad = detalle.codt_cantidad;
          }
          if (detalle.codt_preciocompra !== null) {
              detalleActualizado.codt_preciocompra = detalle.codt_preciocompra;
          }

          return detalleActualizado;
      }).sort((a, b) => a.identificador - b.identificador);;

      //console.log(detallesActualizados)

  if (detallesActualizados.length > 0) {
      this.service.InsertarCompraDetalle(detallesActualizados).subscribe(
          response => {
              if (response && response.coen_Id) {
                  // Resetea el número de compra y el estado de submitted después de guardar
                  this.numeroCompra = '';  // Limpia el valor de numeroCompra después de guardar
                  this.submitted = false;  // Reinicia el estado de enviado a falso
                  this.selectedCompraId = response.coen_Id;
                  //console.log("LA COMPRA ID ES" + this.selectedCompraId)
                  this.identificador = 0;
                  this.viewState = {
                      create: false, Seguridad: false, variableCambiada: false, detail: false, delete: false, index: false, maqui: false, ordenes: true, ordenesEditar: false, Detalles: false, createdirect: false
                  };
                  this.cargarDetallesCompra(this.selectedCompraId);  // Cargar detalles de la compra insertada
                  this.cd.detectChanges();
                  this.formde.reset();
                  this.formEnvio.reset();
                  this.bodegaOproycto = '';
                  this.check = false;
                  this.EtapasPorProyectos = [];
                  this.ActividadesPorEtapa = [];
                  this.mostrarMaquinaria = false;
                  this.mostrarInsumo = false;
                  this.mostrarEquipoSeguridad = false;
              } else {
                  //this.handleError('Error al obtener el ID del encabezado de la compra', null);
              }
          },
          error => {
              //this.handleError('Error al guardar detalles de la compra', error);
          }
      );
  } else {
      //console.log("No hay detalles seleccionados para guardar.");
  }
  this.cerrarModalOrdenCompra();  // Limpia y cierra el modal
    // Después de guardar correctamente, resetea el formulario
    this.form.reset(); // Esto limpiará todos los campos del formulario

    // También asegúrate de limpiar el mapa de valores almacenados por categoría
    this.formValuesByCategory = {}; // Limpiar el mapa

    this.currentTipo = 1; // Restablecer al tipo por defecto
}


cerrarModalOrdenCompra() {
  this.mostrarModalOrdenCompra = false;
  this.mostrarModalOrdenCompra2 = false;
  this.submitted = true;
}

cerrarModalOrdenComprasi() {
  this.mostrarModalOrdenCompra = false;
  this.mostrarModalOrdenCompra2 = false;

}




  // finalizar() {
  //   // Filtra los detalles que tienen `agregadoACotizacion` en `true`
  //   const detallesActualizados = this.selectedDetalles
  //     .filter(detalle => detalle.agregadoACotizacion === true)
  //     .map(detalle => {
  //       const detalleActualizado: any = {
  //         codt_Id: detalle.codt_Id !== undefined ? detalle.codt_Id : null,
  //         coen_Id: this.id,
  //         code_Id: detalle.code_Id,
  //         codt_InsumoOMaquinariaOEquipoSeguridad: detalle.cime_InsumoOMaquinariaOEquipoSeguridad,
  //         empl_Id: 2,
  //         meto_Id: 4,
  //         usua_Creacion: 3,
  //         usua_Modificacion: 3,
  //       };

  //       // Solo agregar campos si no son `null`
  //       if (detalle.codt_Renta !== null) {
  //         detalleActualizado.codt_Renta = detalle.codt_Renta;
  //       }
  //       if (detalle.codt_cantidad !== null) {
  //         detalleActualizado.codt_cantidad = detalle.codt_cantidad;
  //       }
  //       if (detalle.codt_preciocompra !== null) {
  //         detalleActualizado.codt_preciocompra = detalle.codt_preciocompra;
  //       }

  //       return detalleActualizado;
  //     });

  //   //console.log('Detalles enviados al guardar:', detallesActualizados);

  //   // Asegúrate de enviar solo los detalles seleccionados
  //   if (detallesActualizados.length > 0) {
  //     this.service.InsertarCompraDetalle(detallesActualizados).subscribe(
  //       response => {
  //         //console.log('Respuesta del servicio InsertarCompraDetalle:', response);
  //         if (response && response.coen_Id) {
  //           this.selectedCompraId = response.coen_Id;
  //           this.viewState = {
  //             create: false, Seguridad: false,
  //             variableCambiada: false, detail: false, delete: false, index: false, maqui: false, ordenes: true, ordenesEditar: false, Detalles: false, createdirect: false
  //           };
  //           this.submitted = false;
  //           this.cargarDetallesCompra(this.selectedCompraId); // Cargar detalles de la compra insertada
  //           this.cd.detectChanges();
  //           this.mostrarMaquinaria = false;
  //           this.mostrarInsumo = false;
  //           this.mostrarEquipoSeguridad = false;
  //         } else {
  //           //this.handleError('Error al obtener el ID del encabezado de la compra', null);
  //         }
  //       },
  //       error => {
  //         //this.handleError('Error al guardar detalles de la compra', error);
  //       }
  //     );
  //   } else {
  //     //console.log("No hay detalles seleccionados para guardar.");
  //   }
  // }
  verificarUnidad(coti: any){
    //console.log(coti.unidad)
    if (coti.unidad == null || coti.unidad == 0) {
      coti.unidad = 1

      let bit = 0
      //dependiendo la categoria guardara el identificador.
      if (coti.categoria == "Maquinaria" ) {
      bit = 0
      }else  if (coti.categoria == "Insumo" ){
        bit = 1
      }else  if (coti.categoria == "Equipo" ){
        bit = 2
      }


      let index = this.selectCheckbox.findIndex(selec => selec.cime_Id === coti.idP && selec.cime_InsumoOMaquinariaOEquipoSeguridad === bit);

      if (index !== -1) {
        // Si el índice existe, modifica los valores directamente
        this.selectCheckbox[index].code_Renta = coti.unidad;

        this.updateTotales();
      } else {
        this.updateTotales();
      }

      coti.total = coti.precio = coti.cantidad
    }
  }

  verificarInputCantidad(coti: any){
    //console.log(coti.precio)
    if (coti.cantidad == null || coti.cantidad == 0) {
      coti.cantidad = 1

      let bit = 0
      //dependiendo la categoria guardara el identificador.
      if (coti.categoria == "Maquinaria" ) {
      bit = 0
      }else  if (coti.categoria == "Insumo" ){
        bit = 1
      }else  if (coti.categoria == "Equipo" ){
        bit = 2
      }


      let index = this.selectCheckbox.findIndex(selec => selec.cime_Id === coti.idP && selec.cime_InsumoOMaquinariaOEquipoSeguridad === bit);

      if (index !== -1) {
        // Si el índice existe, modifica los valores directamente
        this.selectCheckbox[index].code_Cantidad = coti.cantidad;

        this.updateTotales();
      } else {
        this.updateTotales();
      }

      coti.total = coti.precio = coti.cantidad
    }
  }
  verificarInputPrecio(coti: any){
    //console.log(coti.precio)
    if (coti.precio == null || coti.precio == 0) {
      coti.precio = 1

      let bit = 0
      //dependiendo la categoria guardara el identificador.
      if (coti.categoria == "Maquinaria" ) {
      bit = 0
      }else  if (coti.categoria == "Insumo" ){
        bit = 1
      }else  if (coti.categoria == "Equipo" ){
        bit = 2
      }


      let index = this.selectCheckbox.findIndex(selec => selec.cime_Id === coti.idP && selec.cime_InsumoOMaquinariaOEquipoSeguridad === bit);

      if (index !== -1) {
        // Si el índice existe, modifica los valores directamente
        this.selectCheckbox[index].code_PrecioCompra = coti.precio;

        this.updateTotales();
      } else {
        this.updateTotales();
      }

      coti.total = coti.precio = coti.cantidad
    }
  }



          GuardarBoton() {

            this.submitted = true;  // Marca como enviado para activar la validación

            if (this.selectCheckbox.length > 0) {

            this.CotiService.Insertar(this.selectCheckbox).subscribe(
              (respuesta: Respuesta) => {
                if (this.idCompra != 0 ) {
                  this.MensaejeConIds = respuesta.message
                  //console.log(this.MensaejeConIds)
                  if (this.activeIndex == 1 ||  this.activeIndex == 2 ||  this.activeIndex == 3) {
                  }else {
                    this.idCompra = respuesta.data.codeStatus
                    this.MensaejeConIds = respuesta.message
                    //console.log(this.MensaejeConIds)
                    this.selectCheckbox.forEach(item => {
                      item.coti_Id = this.idCompra;
                    });
                    this.guardarDetallesCompra();
                    this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass:'iziToast-custom',detail: 'Actualizado con Éxito.', life: 3000 });
                    this.confirmarCotizacion = false;
                  }
                }else{
                  this.idCompra = respuesta.data.codeStatus
                  this.MensaejeConIds = respuesta.message
                  //console.log(this.MensaejeConIds)
                  this.selectCheckbox.forEach(item => {
                    item.coti_Id = this.idCompra;
                  });
                  this.guardarDetallesCompra();
                  if (this.activeIndex == 1 ||  this.activeIndex == 2 ||  this.activeIndex == 3 ) {
                  }else {
                    this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass:'iziToast-custom',detail: 'Insertado con Éxito.', life: 3000 });
                    this.confirmarCotizacion = false;
                  }
                }


              }
            );

          } else {
            if (this.activeIndex == 1 ||  this.activeIndex == 2 ||  this.activeIndex == 3 ) {

            }else {
              if (this.idProveedor == 0) {
                this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'No existe el proveedor.', life: 3000,styleClass:'iziToast-custom' });
                return;
              }else{
                this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'Seleccione unos insumos.', life: 3000 });
              }
            }

          }
            // Después de guardar correctamente, resetea el formulario
  this.form.reset(); // Esto limpiará todos los campos del formulario

  // También asegúrate de limpiar el mapa de valores almacenados por categoría
  this.formValuesByCategory = {}; // Limpiar el mapa

  this.currentTipo = 1; // Restablecer al tipo por defecto
        }

        Guardar() {
          //console.log(this.selectCheckbox)
          if (this.selectCheckbox.length > 0) {



          this.CotiService.Insertar(this.selectCheckbox).subscribe(
            (respuesta: Respuesta) => {
              if (this.idCompra != 0 ) {
                this.MensaejeConIds = respuesta.message
                //console.log(this.MensaejeConIds)
                if (this.activeIndex == 1 ||  this.activeIndex == 2 ||  this.activeIndex == 3) {
                }else {
                  this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Actualizado con Éxito.', life: 3000 });

                  this.confirmarCotizacion = false;

                }

              }else{
                this.idCompra = respuesta.data.codeStatus
                this.MensaejeConIds = respuesta.message
                //console.log(this.MensaejeConIds)
                this.selectCheckbox.forEach(item => {
                  item.coti_Id = this.idCompra;
                });


                if (this.activeIndex == 1 ||  this.activeIndex == 2 ||  this.activeIndex == 3 ) {

                }else {
                  this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
                  this.confirmarCotizacion = false;
                }
              }


            }
          );

        } else {
          if (this.activeIndex == 1 ||  this.activeIndex == 2 ||  this.activeIndex == 3 ) {

          }else {

              this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'Seleccione unos insumos.', life: 3000 });
              this.submittedCompra = true;
              this.confirmarCotizacion = false;


          }

        }
      }

      guardarDetallesCompra() {




        // Convertir la cadena de IDs en un array de IDs
        const idsArray = this.MensaejeConIds.split(',').map(id => parseInt(id.trim()));

        // Crear un array temporal que almacene el mapeo de `cime_Id` con `code_Id`
        const mapeoIds = idsArray.map((id, index) => ({
          code_Id: id,
          cime_Id: this.selectCheckbox[index].cime_Id // Asocia `code_Id` con `cime_Id`
        }));


        // Mapear los detalles actualizados utilizando el `cime_Id` para asociar correctamente el `code_Id`
        const detallesActualizados = this.selectCheckbox.map((detalle) => {
          //console.log(this.selectCheckbox, 'this.selectCheckbox');


          // Encuentra el `code_Id` correcto basándote en el `cime_Id`
          const idCorrecto = mapeoIds.find(m => m.cime_Id === detalle.cime_Id)?.code_Id;

          return {
            codt_Id: 0, // Se generará automáticamente
            coen_Id: 0, // ID de la compra
            code_Id: idCorrecto, // Asigna el ID correcto basado en `cime_Id`
            codt_cantidad: parseInt(detalle.code_Cantidad, 10), // Cantidad seleccionada
            codt_preciocompra: detalle.code_PrecioCompra, // Precio seleccionado
            codt_InsumoOMaquinariaOEquipoSeguridad: detalle.cime_InsumoOMaquinariaOEquipoSeguridad, // Tipo de item (Insumo/Maquinaria/Equipo)
            codt_Renta: detalle.code_Renta, // Renta si aplica
            coen_numeroCompra: "0000",
            empl_Id: 2,
            meto_Id: 4,
            usua_Creacion: this.usua_Id,
            usua_Modificacion: this.usua_Id,
          };
        });

        //console.log('Detalles enviados al guardar:', detallesActualizados);

        // Llamar al servicio para insertar los detalles de compra
        this.service.InsertarCompraDetalle(detallesActualizados).subscribe(
          response => {
            //console.log('Respuesta del servicio InsertarCompraDetalle:', response);

            if (response && response.coen_Id) {
              this.selectedCompraId = response.coen_Id;

              // Actualizar el estado de la vista después de guardar
              this.viewState = {
                create: false, Seguridad: false,
                variableCambiada: false, detail: false, delete: false, index: false, maqui: false, ordenes: true, ordenesEditar: false, Detalles: false, createdirect: false
              };
              // this.formde.reset();
              // this.formEnvio.reset();
              this.bodegaOproycto = '';
              this.check = false;
              this.EtapasPorProyectos = [];
              this.ActividadesPorEtapa = [];
              // Limpiar el valor de numeroCompra después de guardar
              this.numeroCompra = '';
              this.submitted = false;

              // Cargar detalles de la compra insertada
              this.cargarDetallesCompra(this.selectedCompraId);
              this.cd.detectChanges();
            } else {
              //this.handleError('Error al obtener el ID del encabezado de la compra', null);
            }
          },
          error => {
            //this.handleError('Error al guardar detalles de la compra', error);
          }
        );

        // Cerrar el modal de orden de compra
        this.cerrarModalOrdenCompra();

        const navigationState = this.navigationStateService.getState();

        if(navigationState && navigationState.compra){
          console.log(navigationState, 'navigationState');
          
          this.onProyectoSelect({value: navigationState.compra.proyecto.proy_Id});
          this.onEtapaProyectoSelect({value: navigationState.compra.etapaPorProyecto.etpr_Id});

          this.formEnvio.patchValue({
            codd_ProyectoOBodega: true,
            codd_Boat_Id: navigationState.compra.proyecto.proy_Id,
            etapa: navigationState.compra.etapaPorProyecto.etpr_Id,
            acet_Id: navigationState.compra.actividadPorEtapa.acet_Id,
          });

          this.onRadioChangeindi({checked: true});
          
        }
      }


 //Actualiza los totales,subtotales y impuestos.
 updateTotales(): void {
  // Sumamos el subtotal de todos los ítems que han sido agregados a la cotización
  this.subtotal = this.CotizacionesTabla
  // Filtramos los ítems que han sido marcados como agregados a la cotización
  .filter(item => item.agregadoACotizacion)
  // Usamos reduce para sumar la cantidad multiplicada por el precio de cada ítem
  .reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
  //console.log("El subtotal es:" + this.subtotal)
  //Si el impuesto esta incluido se realizara una formula para quitarselo
  if (this.IncluidoImpuesto == true) {

    const impuestoIncluido = (parseFloat(this.ValorImpuesto) / 100) + 1
    const impuesto = parseFloat(this.ValorImpuesto) / 100
    this.subtotal = this.subtotal / impuestoIncluido;
    this.tax = this.subtotal * impuesto;
    this.total = this.subtotal + this.tax;
  }else {
    //Si el impuesto no esta incluido se realizara una formula para implementarlo
    //console.log("Entro aqui")
    const impuesto = parseFloat(this.ValorImpuesto) / 100
    //console.log("El valor del impuesto:" , this.ValorImpuesto)
    this.tax = this.subtotal * impuesto;
    //console.log("El valor del tax:",this.tax)
    this.total = this.subtotal + this.tax;
  }
}

updateUnidad(coti: any) {
  //Actualizamos el total de la fila a la cual estemos cambiando la cantidad o el precio
  //console.log(coti)
  let bit = 0
  //dependiendo la categoria guardara el identificador.
  if (coti.categoria == "Maquinaria" ) {
    bit = 0
  }else  if (coti.categoria == "Insumo" ){
    bit = 1
  }else  if (coti.categoria == "Equipo" ){
    bit = 2
  }


  let index = this.selectCheckbox.findIndex(selec => selec.cime_Id === coti.idP && selec.cime_InsumoOMaquinariaOEquipoSeguridad === bit);

  if (index !== -1) {
    // Si el índice existe, modifica los valores directamente
    this.selectCheckbox[index].code_Renta = coti.unidad;
  } else {
  }

  //console.log(this.selectCheckbox)
}

  //Filtrar por insumo
  filterInsumo(event: any) {
    const query = event.query.toLowerCase();
    this.filtradoInsumo = this.insumos.filter(empleado =>
      empleado.insumos.toLowerCase().includes(query)
    );
  }

  //FilterCategoria
  filterCategoria(event: any) {
    const query = event.query.toLowerCase();
    this.filteredCategorias = this.categoria.filter(empleado =>
      empleado.cate_Descripcion.toLowerCase().includes(query)
    );
  }

  filterSubCategoria(event: any) {
    const query = event.query.toLowerCase();
    if (this.subCategoria) {
      this.filteredSubCategorias = this.subCategoria.filter(empleado =>
        empleado.suca_Descripcion.toLowerCase().includes(query)
      );
    } else {
      this.filteredSubCategorias = [];
    }
  }

  filterMateriales(event: any) {
    const query = event.query.toLowerCase();
    this.filteredMateriales = this.material.filter(empleado =>
      empleado.mate_Descripcion.toLowerCase().includes(query)
    );
  }

  filterUnidades(event: any) {
    const query = event.query.toLowerCase();
    this.filteredUnidades = this.unidad.filter(empleado =>
      empleado.unme_Nombre.toLowerCase().includes(query)
    );
  }
  //El autocompletado llena datos
  onInsumoSelect(event: any) {
    const insumoSeleccionado = event;
    this.idInsumo =insumoSeleccionado.value.insu_Id
    //console.log(insumoSeleccionado.value.cate_Descripcion)
    this.formInsumo.patchValue({ cate_Descripcion: insumoSeleccionado.value.cate_Descripcion, mate_Descripcion: insumoSeleccionado.value.mate_Descripcion, insu_Descripcion : insumoSeleccionado.value.insu_Descripcion });
    let CategoriaID = this.categoria.find(cate => cate.cate_Descripcion === this.formInsumo.value.cate_Descripcion)?.cate_Id ?? 0;
    //console.log(CategoriaID)
    this.ListarSubCategorias(CategoriaID)
    this.formInsumo.patchValue({ suca_Descripcion: insumoSeleccionado.value.suca_Descripcion});
    this.ListarTablaDeMedidas(this.idProveedor,insumoSeleccionado.value.insu_Id)
  }

  onCategoriaSelect(event: any) {
    const insumoSeleccionado = event;
    //console.log(this.categoria)
    //console.log(insumoSeleccionado)
    this.formInsumo.patchValue({ cate_Descripcion: insumoSeleccionado.value.cate_Descripcion});
    let CategoriaID = this.categoria.find(cate => cate.cate_Descripcion === this.formInsumo.value.cate_Descripcion)?.cate_Id ?? 0;
    this.ListarSubCategorias(CategoriaID)
  }


  onSubCategoriaSelect(event: any) {
    const insumoSeleccionado = event;
    this.formInsumo.patchValue({ suca_Descripcion: insumoSeleccionado.value.suca_Descripcion});
  }

  onMaterialSelect(event: any) {
    const insumoSeleccionado = event;
    this.formInsumo.patchValue({ mate_Descripcion: insumoSeleccionado.value.mate_Descripcion});
  }

  onUnidadSelect(event: any) {
    const insumoSeleccionado = event;

    this.formUnidad.patchValue({ unme_Nombre: insumoSeleccionado.value.unme_Nombre});
  }





 //Cuando seleccionamos algo del dropdown de unidadDeMedida
 onUnidadChange(event): void {
  const insumoSeleccionado = event;
  //console.log(insumoSeleccionado)
  this.formUnidad.patchValue({ unme_nombre: insumoSeleccionado.value.unme_nombre });
}

blur(){
  this.idInsumo = this.insumos.find(insu => insu.insumos === this.formInsumo.value.insu_Descripcion)?.insu_Id ?? 0;
  if (this.idInsumo == 0) {
    this.ListarTablaDeMedidas(this.idProveedor,this.idInsumo)
  }
}
  //Guardamos el insumo en el boton de la misma tabla
 async GuardarInsumo() {
    if (this.formInsumo.valid && this.formUnidad.valid) {
      this.deta_Insumo = "";
      this.deta_Categoria = "";
      this.deta_SubCategoria = "";
      this.deta_Material= "";
      this.deta_Unidad= "";
      let abrirModal = false;
     this.idInsumo = this.insumos.find(insu => insu.insumos === this.formInsumo.value.insu_Descripcion)?.insu_Id ?? 0;
      if (this.idInsumo == 0 && this.deta_Modal == false) {
        this.deta_Insumo = this.formInsumo.value.insu_Descripcion
        abrirModal = true;
      }
      let CategoriaID = this.categoria.find(cate => cate.cate_Descripcion === this.formInsumo.value.cate_Descripcion)?.cate_Id ?? 0;
      if (CategoriaID == 0 && this.deta_Modal == false) {
        this.deta_Categoria = this.formInsumo.value.cate_Descripcion
        abrirModal = true;
      }
      let MaterialId = this.material.find(mate => mate.mate_Descripcion === this.formInsumo.value.mate_Descripcion)?.mate_Id ?? 0;
      if (MaterialId == 0 && this.deta_Modal == false) {
        this.deta_Material = this.formInsumo.value.mate_Descripcion
        abrirModal = true;
      }
      let SucaId = 0
      if (this.subCategoria && this.subCategoria.length > 0) {
        //console.log(this.subCategoria)
        SucaId = this.subCategoria.find(suca => suca.suca_Descripcion === this.formInsumo.value.suca_Descripcion)?.suca_Id ?? 0;
      } else {
        SucaId = 0;
      }
      if (SucaId == 0 && this.deta_Modal == false) {
        this.deta_SubCategoria = this.formInsumo.value.suca_Descripcion
        abrirModal = true;
      }
      let UnidadId = this.unidad.find(unida => unida.unme_Nombre === this.formUnidad.value.unme_Nombre)?.unme_Id ?? 0;
      if (UnidadId == 0 && this.deta_Modal == false) {
        this.deta_Unidad = this.formUnidad.value.unme_Nombre
        abrirModal = true;
      }

      if (abrirModal == true) {
        this.ModalCrearNuevoInsumo();
        return
      }

      this.ConfirmarInsumo = false
      const InsumoViewModel: any = {
        insu_Id: this.idInsumo,
        suca_Id: SucaId,
        cate_Id:CategoriaID,
        mate_Id: MaterialId,
        unme_nombre: this.formUnidad.value.unme_Nombre,
        mate_Descripcion: this.formInsumo.value.mate_Descripcion,
        cate_Descripcion: this.formInsumo.value.cate_Descripcion,
        suca_Descripcion: this.formInsumo.value.suca_Descripcion,
        insu_Descripcion: this.formInsumo.value.insu_Descripcion,
        insu_Observacion: this.formUnidad.value.inpp_Observacion,
        inpp_Observacion: this.formUnidad.value.inpp_Observacion,
        unme_Id: UnidadId,
        coti_Id: this.idCompra,
        empl_Id:2,
        coti_Fecha: this.formCompra.value.coti_Fecha,
        coti_Incluido: this.IncluidoImpuesto,
        inpp_Preciocompra: this.formUnidad.value.inpp_Preciocompra,
        prov_Id:this.idProveedor,
        usua_Creacion: this.usua_Id,
        usua_Modificacion: this.usua_Id,
        coti_CompraDirecta: true
        };
        this.CotiService.InsertarInsumo(InsumoViewModel).subscribe(
          (respuesta: Respuesta) => {
            //console.log(respuesta)
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
              if (this.idInsumo == 0) {
                this.idInsumo = respuesta.data.codeStatus
              }
              if (this.idCompra == 0) {
                this.idCompra =parseInt(respuesta.data.messageStatus)
              }
              this.ListarCategorias()
              this.ListarInsumos()
              this.ListarSubCategorias(CategoriaID)
              this.ListarUnidadesDeMedida()
              this.ConfirmarInsumoBoton = false;
              this.deta_Modal = false;
              this.ConfirmarInsumo = false
              this.formUnidad.reset()
              this.ListarTablaDeMedidas(this.idProveedor,this.idInsumo)
              this.submittedCompra = false;
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'Comunicarse con un administrador.', life: 3000 });
              //console.log('RESPONSE:' + respuesta.success)

            }
          }
        );

    } else {

     this.submittedCompra = true;
    }

  }

  CrearInsumo(){
    this.formInsumo.reset();
    this.formUnidad.reset();
    this.idInsumo = 0;
    this.deta_Modal = false;
    this.ListarTablaDeMedidas(this.idProveedor,this.idInsumo)
    this.submittedCompra = false;

  }

  ModalCrearNuevoInsumo(){
    this.ConfirmarInsumo = true;
    this.deta_Modal = true
  }

  //En el caso de guardar en el mismo boton de guardar y nos deberia de redirigir al index 0
  GuardarInsumoBoton() {

    if (this.formInsumo.valid && this.formUnidad.valid) {
      this.deta_Insumo = "";
      this.deta_Categoria = "";
      this.deta_SubCategoria = "";
      this.deta_Material= "";
      this.deta_Unidad= "";
      let abrirModal = false;
      this.idInsumo = this.insumos.find(insu => insu.insumos === this.formInsumo.value.insu_Descripcion)?.insu_Id ?? 0;
      if (this.idInsumo == 0 && this.deta_Modal == false) {
        this.deta_Insumo = this.formInsumo.value.insu_Descripcion
        abrirModal = true;
      }
      let CategoriaID = this.categoria.find(cate => cate.cate_Descripcion === this.formInsumo.value.cate_Descripcion)?.cate_Id ?? 0;
      if (CategoriaID == 0 && this.deta_Modal == false) {
        this.deta_Categoria = this.formInsumo.value.cate_Descripcion
        abrirModal = true;
      }

      let MaterialId = this.material.find(mate => mate.mate_Descripcion === this.formInsumo.value.mate_Descripcion)?.mate_Id ?? 0;
      if (MaterialId == 0 && this.deta_Modal == false) {
        this.deta_Material = this.formInsumo.value.mate_Descripcion
        abrirModal = true;
      }
      let SucaId = 0
      if (this.subCategoria && this.subCategoria.length > 0) {
        //console.log(this.subCategoria)
        SucaId = this.subCategoria.find(suca => suca.suca_Descripcion === this.formInsumo.value.suca_Descripcion)?.suca_Id ?? 0;
      } else {
        SucaId = 0;
      }
      if (SucaId == 0 && this.deta_Modal == false) {
        this.deta_SubCategoria = this.formInsumo.value.suca_Descripcion
        abrirModal = true;
      }
      let UnidadId = this.unidad.find(unida => unida.unme_Nombre === this.formUnidad.value.unme_Nombre)?.unme_Id ?? 0;
      if (UnidadId == 0 && this.deta_Modal == false) {
        this.deta_Unidad = this.formUnidad.value.unme_Nombre
        abrirModal = true;
      }

      if (abrirModal == true) {
        this.ModalCrearNuevoInsumo();
        return
      }

      this.ConfirmarInsumo = false
      const InsumoViewModel: any = {
        insu_Id: this.idInsumo,
        suca_Id: SucaId,
        cate_Id:CategoriaID,
        mate_Id: MaterialId,
        unme_nombre: this.formUnidad.value.unme_Nombre,
        mate_Descripcion: this.formInsumo.value.mate_Descripcion,
        cate_Descripcion: this.formInsumo.value.cate_Descripcion,
        suca_Descripcion: this.formInsumo.value.suca_Descripcion,
        insu_Descripcion: this.formInsumo.value.insu_Descripcion,
        insu_Observacion: this.formUnidad.value.inpp_Observacion,
        inpp_Observacion: this.formUnidad.value.inpp_Observacion,
        unme_Id: UnidadId,
        coti_Id: this.idCompra,
        empl_Id:2,
        coti_Fecha: this.formCompra.value.coti_Fecha,
        coti_Incluido: this.IncluidoImpuesto,
        inpp_Preciocompra: this.formUnidad.value.inpp_Preciocompra,
        prov_Id:this.idProveedor,
        usua_Creacion: this.usua_Id,
        usua_Modificacion: this.usua_Id,
        coti_CompraDirecta: true
        };


        this.CotiService.InsertarInsumo(InsumoViewModel).subscribe(
          (respuesta: Respuesta) => {
            //console.log(respuesta)
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
              //this.reeredigirAlTabCreacionInsumo();
              if (this.idInsumo == 0) {
                this.idInsumo = respuesta.data.codeStatus
              }
              if (this.idCompra == 0) {
                this.idCompra =parseInt(respuesta.data.messageStatus)
              }
              this.ListarCategorias()
              this.ListarInsumos()
              this.ListarSubCategorias(CategoriaID)
              this.ListarUnidadesDeMedida()
              this.deta_Modal = false;
              this.ConfirmarInsumo = false
              this.formUnidad.reset()
              this.ListarTablaDeMedidas(this.idProveedor,this.idInsumo)
              this.submittedCompra = false;

            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'Comunicarse con un administrador', life: 3000 });
              //console.log('RESPONSE:' + respuesta.success)
              this.ConfirmarInsumo = false
            }
          }
        );

    } else
    {
      this.submittedCompra = true;
    }

    //else {

    //if (this.UnidadesMedida.length > 0) {
     //   this.deta_Modal = false;
      //  this.reeredigirAlTabCreacionInsumo();
     // }else{
      //  this.deta_Modal = false;
      //  this.submitted = true;
     // }


    //}
  }


  GuardarInsumoBlur() {
    if (this.formInsumo.valid && this.formUnidad.valid) {
      this.deta_Insumo = "";
      this.deta_Categoria = "";
      this.deta_SubCategoria = "";
      this.deta_Material= "";
      this.deta_Unidad= "";
      let abrirModal = false;
      this.idInsumo = this.insumos.find(insu => insu.insumos === this.formInsumo.value.insu_Descripcion)?.insu_Id ?? 0;
      if (this.idInsumo == 0 && this.deta_Modal == false) {
        this.deta_Insumo = this.formInsumo.value.insu_Descripcion
        abrirModal = true;
      }
      let CategoriaID = this.categoria.find(cate => cate.cate_Descripcion === this.formInsumo.value.cate_Descripcion)?.cate_Id ?? 0;
      if (CategoriaID == 0 && this.deta_Modal == false) {
        this.deta_Categoria = this.formInsumo.value.cate_Descripcion
        abrirModal = true;
      }

      let MaterialId = this.material.find(mate => mate.mate_Descripcion === this.formInsumo.value.mate_Descripcion)?.mate_Id ?? 0;
      if (MaterialId == 0 && this.deta_Modal == false) {
        this.deta_Material = this.formInsumo.value.mate_Descripcion
        abrirModal = true;
      }
      let SucaId = 0
      if (this.subCategoria && this.subCategoria.length > 0) {
        //console.log(this.subCategoria)
        SucaId = this.subCategoria.find(suca => suca.suca_Descripcion === this.formInsumo.value.suca_Descripcion)?.suca_Id ?? 0;
      } else {
        SucaId = 0;
      }
      if (SucaId == 0 && this.deta_Modal == false) {
        this.deta_SubCategoria = this.formInsumo.value.suca_Descripcion
        abrirModal = true;
      }
      let UnidadId = this.unidad.find(unida => unida.unme_Nombre === this.formUnidad.value.unme_Nombre)?.unme_Id ?? 0;
      if (UnidadId == 0 && this.deta_Modal == false) {
        this.deta_Unidad = this.formUnidad.value.unme_Nombre
        abrirModal = true;
      }

      if (abrirModal == true) {
        this.ModalCrearNuevoInsumo();
        return
      }
      const InsumoViewModel: any = {
        insu_Id: this.idInsumo,
        suca_Id: SucaId,
        cate_Id:CategoriaID,
        mate_Id: MaterialId,
        unme_nombre: this.formUnidad.value.unme_Nombre,
        mate_Descripcion: this.formInsumo.value.mate_Descripcion,
        cate_Descripcion: this.formInsumo.value.cate_Descripcion,
        suca_Descripcion: this.formInsumo.value.suca_Descripcion,
        insu_Descripcion: this.formInsumo.value.insu_Descripcion,
        insu_Observacion: this.formUnidad.value.inpp_Observacion,
        inpp_Observacion: this.formUnidad.value.inpp_Observacion,
        unme_Id: UnidadId,
        coti_Id: this.idCompra,
        empl_Id:2,
        coti_Fecha: this.formCompra.value.coti_Fecha,
        coti_Incluido: this.IncluidoImpuesto,
        inpp_Preciocompra: this.formUnidad.value.inpp_Preciocompra,
        prov_Id:this.idProveedor,
        usua_Creacion: this.usua_Id,
        usua_Modificacion: this.usua_Id,
        coti_CompraDirecta: true
        };

        this.ConfirmarInsumo = false
        this.CotiService.InsertarInsumo(InsumoViewModel).subscribe(
          (respuesta: Respuesta) => {
            //console.log(respuesta)
            if (respuesta.success) {

              this.deta_Modal = false;
              this.ConfirmarInsumo = false
              this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
              if (this.idInsumo == 0) {
                this.idInsumo = respuesta.data.codeStatus
              }
              if (this.idCompra == 0) {
                this.idCompra =parseInt(respuesta.data.messageStatus)
              }
              //this.reeredigirAlTabCreacionInsumo();
              this.ListarCategorias()
              this.ListarInsumos()
              this.ListarSubCategorias(CategoriaID)
              this.ListarUnidadesDeMedida()

              this.formUnidad.reset()
              this.ListarTablaDeMedidas(this.idProveedor,this.idInsumo)
              this.submittedCompra = false;

            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'Comunicarse con un administrador.', life: 3000 });
              //console.log('RESPONSE:' + respuesta.success)
              this.ConfirmarInsumo = false
            }
          }
        );

    }

    //else {

    //if (this.UnidadesMedida.length > 0) {
     //   this.deta_Modal = false;
      //  this.reeredigirAlTabCreacionInsumo();
     // }else{
      //  this.deta_Modal = false;
      //  this.submitted = true;
     // }


    //}
  }


  ModalEliminarInsumo(id, detalle){
    this.ModalInsumoEliminar = true;
    this.idUnidad =id;
    this.deta_Unidad =detalle
    //console.log(this.idUnidad)
  }
  //En la tabla de unidades de medida esta el boton de eliminar
  async EliminarInsumo(){
    try {
      // Llama al servicio para eliminar el proveedor y espera la respuesta
      const response = await this.CotiService.EliminarInsumo(parseFloat(this.idUnidad));
      const { code, data, message } = response; // Desestructura la respuesta

      // Inicializa variables para el mensaje del servicio
      let severity = 'error';
      let summary = 'Error';
      let detail = data?.messageStatus || message;

      // Verifica el código de respuesta
      if (code === 200) {
          // Si la eliminación fue exitosa o hay una advertencia
          severity = data.codeStatus > 0 ? 'success' : 'warn';
          summary = data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
      } else if (code === 500) {
          // Si hubo un error interno
          severity = 'error';
          summary = 'Error Interno';
      }

      // Añade el mensaje de estado al servicio de mensajes
      this.messageService.add({
          severity,
          summary,
          styleClass:'iziToast-custom',
          detail,
          life: 3000
      });

      // Reinicia el componente
      this.ListarTablaDeMedidas(this.idProveedor,this.idInsumo)
      this.ModalInsumoEliminar = false;
  } catch (error) {
      // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
      this.messageService.add({
          severity: 'error',
          summary: 'Error Externo',
          styleClass:'iziToast-custom',
          detail: error.message || error,
          life: 3000
      });
  }

  }



    //Filtro para el autocompletado de maquinaria
    filterMaquinaria(event: any) {
      const query = event.query.toLowerCase();
      this.filtradoMaquinaria = this.maquinariaCompra.filter(maquinaria =>
        maquinaria.maqu_Descripcion.toLowerCase().includes(query)
      );
    }

      //Si seleccionamos algo en el autocompletado de maquinaria
  onMaquinariaSelect(event: any) {
    const maquinariaseleccionado = event;
    //console.log(maquinariaseleccionado)
    this.formMaquinariaCompra.patchValue({ nive_Descripcion: maquinariaseleccionado.value.nive_Descripcion, maqu_UltimoPrecioUnitario : maquinariaseleccionado.value.maqu_UltimoPrecioUnitario, maqu_Descripcion : maquinariaseleccionado.value.maqu_Descripcion });
    this.idMaquinaria = this.maquinariaCompra.find(maqui => maqui.maqu_Descripcion === this.formMaquinariaCompra.value.maqu_Descripcion)?.maqu_Id ?? 0;
  }

  filterNivel(event: any) {
    //console.log(this.nivel)
    const query = event.query.toLowerCase();
    this.Filtradonivel = this.nivel.filter(maquinaria =>
      maquinaria.nive_Descripcion.toLowerCase().includes(query)
    );
  }
    //Si seleccionamos algo en el autocompletado de maquinaria
    onNivelSelect(event: any) {
      //Guardamos el evento en una constante
      const maquinariaseleccionado = event;

      //Seteamos la descripcion el formulario, el nivel al que pertenece, su ultimo precio.
      this.formMaquinaria.patchValue({ nive_Descripcion: maquinariaseleccionado.value.nive_Descripcion});
      //Encontramos el id de la maquinaria

    }


  //Listado de Maquinaria por Proveedor
  ListarMaquinariaPorProveedores(Prov : any) {
    this.CotiService.BuscarMaquinariaPorProveedores(Prov).subscribe(
      (maqui: MaquinariabBuscar[]) => {
        this.maquinariaPorProveedor = maqui;
      },
      error => {
        //console.log(error);
      }
    );
  }

  ModalCrearNuevoMaquinaria(){
    this.ModalMaquinariaCrear = true;
    this.ConfirmarCrearMaquinaria = true
  }
  //Guardamos y nos deberia de redirigir al index 0
  //Guardamos y nos deberia de redirigir al index 0
  async GuardarMaquinaria() {
    let idNivel = this.nivel.find(rol => rol.nive_Descripcion ===
      this.formMaquinariaCompra.value.nive_Descripcion)?.nive_Id ?? 0;

      if (idNivel !== 0) {
      this.formMaquinariaCompra.get('nive_Descripcion')?.setErrors(null);
      //De lo contrario le decimos si esta vacio para ver decirle que el campo es

      } else if(this.formMaquinariaCompra.value.nive_Descripcion == ""  ||
      this.formMaquinariaCompra.value.nive_Descripcion == null){
      //Puede ser cualquier texto el invalidRoleId
      this.Error_Nivel = "El campo es requerido."
      this.formMaquinariaCompra.get('nive_Descripcion')?.setErrors({ 'invalidRoleId': true });
      //Si no es ninguna de las dos es por que tiene texto, pero no existe la opcion
      }else {
      //Puede ser cualquier texto el invalidRoleId
      this.Error_Nivel = "Opción no encontrada."
      this.formMaquinariaCompra.get('nive_Descripcion')?.setErrors({ 'invalidRoleId': true });
      }
    if (this.formMaquinariaCompra.valid ) {
      let abrirModal = false;


      this.idMaquinaria = this.maquinariaCompra.find(maqui =>
        maqui.maqu_Descripcion === this.formMaquinariaCompra.value.maqu_Descripcion)?.maqu_Id ?? 0;

      if (this.idMaquinaria == 0) {
        abrirModal = true;
      }


      if (abrirModal && this.ConfirmarCrearMaquinaria == false) {
        this.ModalCrearNuevoMaquinaria();
        return;
      }
      const MaquinariaViewModel: any = {
        maqu_Id: this.idMaquinaria,
        nive_Id: idNivel,
        maqu_Descripcion: this.formMaquinariaCompra.value.maqu_Descripcion,
        maqu_UltimoPrecioUnitario: this.formMaquinariaCompra.value.maqu_UltimoPrecioUnitario,
        prov_Id:this.idProveedor,
        mapr_DiaHora:this.formMaquinariaCompra.value.mapr_DiaHora,
        usua_Creacion: this.usua_Id,
        usua_Modificacion: this.usua_Id,
        coti_Id: this.idCompra,
        empl_Id:2,
        coti_Fecha: this.formCompra.value.coti_Fecha,
        coti_Incluido: this.IncluidoImpuesto,
        coti_CompraDirecta: true
        };
        this.CotiService.InsertarMaquinaria(MaquinariaViewModel).subscribe(
          async (respuesta: Respuesta) => {
            //console.log(respuesta)
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass:'iziToast-custom',detail: 'Insertado con Éxito.', life: 3000 });
              //this.formInsumo.reset();
              //this.formUnidad.reset();
              this.formMaquinariaCompra.reset();
              this.idMaquinaria= 0;
              //this.idInsumo = 0;
              if (this.idCompra == 0) {
                this.idCompra =parseInt(respuesta.data.messageStatus)
              }
              this.submittedCompra = false;
              //await this.ListarTablaCotizacion(this.idProveedor,this.id)
              //this.activeIndex = 0;
              //if (this.validacionMaquinaria == false) {
              //  this.filtroboton = true;
              //}else{
              //  this.filtroboton = false;
              //}
              //this.EncabezadoCantidad = "Cantidad Maquinaria";
              //this.EncabezadoMedida = "Cantidad";
              //this.isMaquinaria = true;
              //this.filterCotizaciones();
              this.ListarMaquinariaPorProveedores(this.idProveedor)
              this.ListarMaquinaria()
              this.ModalMaquinariaCrear = false;
              this.ConfirmarCrearMaquinaria = false;


            } else {
              this.messageService.add({ severity: 'error', summary: 'Error',  styleClass:'iziToast-custom',detail: 'Comunicarse con un administrador.', life: 3000 });
              //console.log('RESPONSE:' + respuesta.success)

            }
          }
        );

    } else {
     this.submittedCompra = true;
    }
  }

  //Preguntar si esta seguro de eliminar la maquinaria
  eliminarMaquinariaModal(id, descripcion){
    this.Deta_MaquinariaDescripcion = descripcion
    this.idMaquinaria = id;
    this.ModalMaquinariaEliminar = true;
  }
//Eliminar Maquinaria
  async EliminarMaquinaria(){

    try {
      // Llama al servicio para eliminar el proveedor y espera la respuesta
      const response = await this.CotiService.EliminarMaquinaria(this.idMaquinaria);
      const { code, data, message } = response; // Desestructura la respuesta

      // Inicializa variables para el mensaje del servicio
      let severity = 'error';
      let summary = 'Error';
      let detail = data?.messageStatus || message;

      // Verifica el código de respuesta
      if (code === 200) {
          // Si la eliminación fue exitosa o hay una advertencia
          severity = data.codeStatus > 0 ? 'success' : 'warn';
          summary = data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
      } else if (code === 500) {
          // Si hubo un error interno
          severity = 'error';
          summary = 'Error Interno';
      }

      // Añade el mensaje de estado al servicio de mensajes
      this.messageService.add({
          severity,
          summary,
          styleClass:'iziToast-custom',
          detail,
          life: 3000
      });

      // Reinicia el componente
      this.ListarMaquinariaPorProveedores(this.idProveedor)
      this.idMaquinaria = 0;
      this.ModalMaquinariaEliminar = false;

  } catch (error) {
      // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
      this.messageService.add({
          severity: 'error',
          summary: 'Error Externo',
          styleClass:'iziToast-custom',
          detail: error.message || error,
          life: 3000
      });
  }

  }

   //Cargamos las tablas de medidas
 ListarTablaDeMedidas(Prov : any, Id : any) {
  this.CotiService.BuscarMedidasPorInsumo(Prov,Id).subscribe(
    (insu: UnidadesPorInsumo[]) => {
      this.UnidadesMedida = insu;
      //console.log(this.UnidadesMedida)
    },
    error => {
      //console.log(error);
    }
  );
}








    //Cargamos las SubCategorias en el dropdown
  async ListarSubCategorias(event : any) {
  //Subscripcion para setear las categorias en un autocomplete
    await this.CotiService.ListarSubCategorias(event).then(
      (sub: ddlSubcategoria[]) => {
        this.subCategoria = sub.sort((a, b) => a.suca_Descripcion.localeCompare(b.suca_Descripcion));
        //console.log(this.subCategoria)
      },
      error => {
        //console.log(error);
      }
    );
  }





    //Filtro del autocompleatdo para  paises
    searchPaises(event) {
      this.filteredPaises = this.paises.filter(pais =>
        pais.pais_Nombre.toLowerCase().includes(event.query.toLowerCase())
      );
    }

      // Onchange Paises y aqui agarramos el id de paises
      async onEstadoCargar(event){
        this.formPaises.patchValue({ pais:event.value.pais_Nombre});
        let id = this.paises.find(pais => pais.pais_Nombre === event.value.pais_Nombre).pais_Id;
        await this.estadoService.DropDownEstadosByCountry2(id)
            .then(data => this.estados = data);
            //console.log(this.estados)
      }
    //Filtro del autocompleatdo para estados
    searchEstados(event) {
      this.filteredEstados = this.estados.filter(estado =>
        estado.esta_Nombre.toLowerCase().includes(event.query.toLowerCase())
      );
    }
      // Onchange Estados  y aqui agarramos el id de estados
      async filtrarCiudades(event){
        this.formPaises.patchValue({ estado:event.value.esta_Nombre});
        let id = this.estados.find(estado => estado.esta_Nombre === event.value.esta_Nombre).esta_Id;
        await this.ciudadService.DropDownByState2(event.value.esta_Id)
            .then(data => this.ciudades = data);
      }
  //Filtro del autocompleatdo para ciudades
  searchCiudades(event) {
    this.filteredCiudades = this.ciudades.filter(ciudad =>
      ciudad.ciud_Descripcion.toLowerCase().includes(event.query.toLowerCase())
    );
  }
    //   onchange Ciudades y aqui agarramos el id de ciudades
    async ciudadOnchange(event){
      this.formPaises.patchValue({ ciudad:event.value.ciud_Descripcion});
      this.proveedorForm.ciud_Id = event.value.ciud_Id
    }


  ModalCrearProveedor(){
    this.submittedCompra = true;
    this.proveedorForm.prov_Descripcion = this.proveedorForm.prov_Descripcion?.trim();
    this.proveedorForm.prov_Correo = this.proveedorForm.prov_Correo?.trim();
    let PaisId = this.paises.find(pais => pais.pais_Nombre === this.formPaises.value.pais)?.pais_Id ?? 0;
    //Si es diferente a 0 le declaramos que no tendra ninguna validacion
    if (PaisId !== 0) {
      this.formPaises.get('pais')?.setErrors(null);
      //De lo contrario establecemos que sera invalida aun si contiene texto, por que no existe el rol
    } else if(this.formPaises.value.pais == "" || this.formPaises.value.pais == null) {
      //Puede ser cualquier texto el invalidRoleId
      this.Error_Pais = "El campo es requerido."
      this.formPaises.get('pais')?.setErrors({ 'invalidPaisId': true });
    }else {
      //Puede ser cualquier texto el invalidRoleId
       this.Error_Pais = "Opción no encontrada."
      this.formPaises.get('pais')?.setErrors({ 'invalidPaisId': true });
    }

    let idEstado = this.estados.find(esta => esta.esta_Nombre === this.formPaises.value.estado)?.esta_Id ?? 0;
    //Si es diferente a 0 le declaramos que no tendra ninguna validacion
    if (idEstado !== 0) {
      this.formPaises.get('estado')?.setErrors(null);
      //De lo contrario establecemos que sera invalida aun si contiene texto, por que no existe el rol
    }else if(this.formPaises.value.estado == "" || this.formPaises.value.estado == null) {
      //Puede ser cualquier texto el invalidRoleId
      this.Error_Estado = "El campo es requerido."
      this.formPaises.get('estado')?.setErrors({ 'invalidEstadoId': true });
    } else {
      //Puede ser cualquier texto el invalidRoleId
      this.Error_Estado = "Opción no encontrada."
      this.formPaises.get('estado')?.setErrors({ 'invalidEstadoId': true });
    }

    let idCiudad = this.ciudades.find(ciud => ciud.ciud_Descripcion === this.formPaises.value.ciudad)?.ciud_Id ?? 0;
    //Si es diferente a 0 le declaramos que no tendra ninguna validacion
    if (idCiudad !== 0) {
      this.formPaises.get('ciudad')?.setErrors(null);
      //De lo contrario establecemos que sera invalida aun si contiene texto, por que no existe el rol
    }else if(this.formPaises.value.ciudad == "" || this.formPaises.value.ciudad == null) {
      //Puede ser cualquier texto el invalidRoleId
      this.Error_Ciudad = "El campo es requerido."
      this.formPaises.get('ciudad')?.setErrors({ 'invalidCiudadId': true });
    } else {
      //Puede ser cualquier texto el invalidRoleId
      this.Error_Ciudad = "Opción no encontrada."
      this.formPaises.get('ciudad')?.setErrors({ 'invalidCiudadId': true });
    }

    if (this.submittedCompra && this.proveedorForm.prov_Descripcion?.trim() && this.formPaises.valid && this.proveedorForm.prov_InsumoOMaquinariaOEquipoSeguridad != null && this.validarCorreo()) {
    this.ModalProveedor = true;
    }
  }

  //Guardamos al proveedor y traemos el registro que aparezca seleccionado en el autocomplete
    async guardarProveedor() {

        this.submittedCompra = true;


        if (this.submittedCompra && this.proveedorForm.prov_Descripcion?.trim() && this.formPaises.valid && this.proveedorForm.prov_InsumoOMaquinariaOEquipoSeguridad != null) {
            try {
                let response;

                this.proveedorForm.ciud_Id = this.ciudades.find(ciudad => ciudad.ciud_Descripcion === this.formPaises.value.ciudad).ciud_Id;



                response = await this.proveedorService.Insertar(this.proveedorForm);


                let severity = 'error';
                let summary = 'Error';
                let detail = response.data?.messageStatus;
                //Llamos un IziToast para mostrar si es exitoso o fallo
                severity = response.data.codeStatus > 0 ? 'success' : 'error';
                summary = response.data.codeStatus > 0 ? 'Éxito' : 'Error';
                this.messageService.add({
                  severity,
                  summary,
                  styleClass:'iziToast-custom',
                  detail,
                  life: 3000
                });


                if (response.code == 200) {
                    await this.ListarProveedores()
                    this.formCompra.patchValue({
                      prov_Descripcion: this.proveedorForm.prov_Descripcion
                    })
                    this.submittedCompra = false;
                    this.proveedorForm = {usua_Creacion: this.usua_Id};
                    await this.HabilitarProveedores()

                    this.proveedorFormulario = false;
                    //this.Create = true

                    this.viewState = {
                      create: false,
                      Seguridad:false,
                      variableCambiada: false,
                      detail: false,
                      delete: false,
                      index: false,
                      maqui: false,
                      ordenes: false,
                      ordenesEditar: false,
                      Detalles: false,
                      createdirect: true
                  };
                }
                this.ModalProveedor = false;

            } catch (error) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    styleClass:'iziToast-custom',
                    detail: error.message || error,
                    life: 3000
                });
            }
        }

    }

      //Vuelve a la pantalla de crear cotizacion
  async cerrarProveedor(){
    this.proveedorFormulario = false;
    this.viewState = {
      create: false,
      Seguridad:false,
      variableCambiada: false,
      detail: false,
      delete: false,
      index: false,
      maqui: false,
      ordenes: false,
      ordenesEditar: false,
      Detalles: false,
      createdirect: true
  };
    this.submittedCompra = false;
  }



 //Regex para que no pueda escribir caracteres muy especiales
 correoValidoKeypress($event: any) {
  const regex = /^[a-zA-Z0-9\s@._]+$/;
  const input = $event.target.value + $event.key;
  if (!regex.test(input)) {
      $event.preventDefault();
  }
}
  //Regex para validar el correo por ejemplo si no pone el @gmail.com
validarCorreo() {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(this.proveedorForm.prov_Correo);
}
  soloNumerosEnterosKeypress($event: any) {
    const regex = /^\d+$/;
    const input = $event.target.value + $event.key;
    if (!regex.test(input)) {
        $event.preventDefault();
    }
  }
  ValidarTexto($event: KeyboardEvent | ClipboardEvent | InputEvent) {
    const inputElement = $event.target as HTMLInputElement;


    if ($event instanceof KeyboardEvent) {
      const key = $event.key;


      if (
        key === 'Backspace' ||
        key === 'Delete' ||
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        key === 'Tab'
      ) {
        return;
      }


      if (inputElement.value.length === 0 && key === ' ') {
        $event.preventDefault();
        return;
      }


      if (!/^[a-zA-Z\s]$/.test(key)) {
        $event.preventDefault();
      }
    }


    if ($event instanceof ClipboardEvent) {
      const clipboardData = $event.clipboardData;
      const pastedData = clipboardData.getData('text');


      if (!/^[a-zA-Z\s]*$/.test(pastedData)) {
        $event.preventDefault();
      }


      if (inputElement.value.length === 0 && pastedData.startsWith(' ')) {
        $event.preventDefault();
      }
    }


    if ($event instanceof InputEvent) {
      inputElement.value = inputElement.value.replace(/[^a-zA-Z\s]/g, '');

      if (inputElement.value.startsWith(' ')) {
        inputElement.value = inputElement.value.trimStart();
      }
    }
  }

  // Valida que solo se puedan colocar letras, números y un solo espacio consecutivo en los inputs
ValidarTextonumeroorden(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;

    // Limitar a 30 caracteres máximo
    if (inputElement.value.length >= 30 && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }

    // Expresión regular mejorada: permite letras, números y espacios, pero no emojis
    if (!/^[a-zñA-ZÑ0-9\s]+$/.test(key) && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }

    // Evita espacios al principio
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }

    // Evita múltiples espacios consecutivos
    if (key === ' ' && inputElement.value.endsWith(' ')) {
      event.preventDefault();
    }

    // Expresión regular para bloquear emojis
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
    if (emojiRegex.test(key)) {
      event.preventDefault();
    }
  }


  //Listar maquinaria para el autocompletado
    ListarEquiposSeguridad() {
    this.CotiService.ListarEquipos()
    .then((data) => this.EquiposSeguridad = data.sort((a, b) => a.equs_Nombre.localeCompare(b.equs_Nombre)))
    .catch((error) => {
      //console.log(error, 'error')
    });

  }

  ListarEquiposPorProveedores(Prov : any) {
    this.CotiService.BuscarEquiposPorProveedores(Prov).subscribe(
      (maqui: any[]) => {
        this.EquiposSeguridadPorProveedor = maqui;
      },
      error => {
        //console.log(error);
      }
    );
  }

  //Equipos de seguridad
    //Filtrar por equipos de seguridad
    filterEquipoSeguridad(event: any) {
      const query = event.query.toLowerCase();
      this.filteredEquiposSeguridad = this.EquiposSeguridad.filter(empleado =>
        empleado.equs_Nombre.toLowerCase().includes(query)
      );
    }

     //El autocompletado llena datos
  onEquipoSelect(event: any) {
    const insumoSeleccionado = event;
    this.idEquipo =insumoSeleccionado.value.equs_Id
    this.formEquipo.patchValue({ equs_Nombre: insumoSeleccionado.value.equs_Nombre,eqpp_PrecioCompra: insumoSeleccionado.value.equs_UltimoPrecio });
  }

  ModalCrearNuevoEquipo(){
    this.ModalEquipoCrear = true;
    this.ConfirmarCrearEquipo = true
  }

  async GuardarEquipo() {
    if (this.formEquipo.valid ) {
      let abrirModal = false;


      this.idEquipo = this.EquiposSeguridad.find(equi =>
        equi.equs_Nombre === this.formEquipo.value.equs_Nombre)?.equs_Id ?? 0;

      if (this.idEquipo == 0) {
        abrirModal = true;
      }


      if (abrirModal && this.ConfirmarCrearEquipo == false) {
        this.ModalCrearNuevoEquipo();
        return;
      }
      const EquipoViewModel: any = {
        equs_Id: this.idEquipo,
        equs_Nombre:  this.formEquipo.value.equs_Nombre,
        eqpp_PrecioCompra: this.formEquipo.value.eqpp_PrecioCompra,
        prov_Id:this.idProveedor,
        usua_Creacion: this.usua_Id,
        usua_Modificacion: this.usua_Id,
        coti_Id: this.idCompra,
        empl_Id:2,
        coti_Fecha: this.formCompra.value.coti_Fecha,
        coti_Incluido: this.IncluidoImpuesto,
        coti_CompraDirecta: true
        };
        this.CotiService.InsertarEquipoProveedor(EquipoViewModel).subscribe(
          async (respuesta: Respuesta) => {
            //console.log(respuesta)
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass:'iziToast-custom',detail: 'Insertado con Éxito.', life: 3000 });
              this.ListarEquiposPorProveedores(this.idProveedor)
              this.formEquipo.reset()
              if (this.idCompra == 0) {
                this.idCompra =parseInt(respuesta.data.messageStatus)
              }
              this.ListarEquiposSeguridad()
              this.submittedCompra = false;
              this.ConfirmarCrearEquipo = false;
              this.ModalEquipoCrear = false;
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'Comunicarse con un administrador.', life: 3000 });
              //console.log('RESPONSE:' + respuesta.success)

            }
          }
        );

    } else {
     this.submittedCompra = true;
    }
  }


  eliminarEquipoModal(id, descripcion){
    this.Deta_Equipo = descripcion
    this.idEquipo = id;
    this.ModalEquipoEliminar = true;
  }

  async EliminarEquipo(){

    try {
      // Llama al servicio para eliminar el proveedor y espera la respuesta
      const response = await this.CotiService.EliminarEquipo(this.idEquipo);
      const { code, data, message } = response; // Desestructura la respuesta

      // Inicializa variables para el mensaje del servicio
      let severity = 'error';
      let summary = 'Error';
      let detail = data?.messageStatus || message;

      // Verifica el código de respuesta
      if (code === 200) {
          // Si la eliminación fue exitosa o hay una advertencia
          severity = data.codeStatus > 0 ? 'success' : 'warn';
          summary = data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
      } else if (code === 500) {
          // Si hubo un error interno
          severity = 'error';
          summary = 'Error Interno';
      }

      // Añade el mensaje de estado al servicio de mensajes
      this.messageService.add({
          severity,
          summary,
          styleClass:'iziToast-custom',
          detail,
          life: 3000
      });

      // Reinicia el componente
      this.ListarEquiposPorProveedores(this.idProveedor)
      this.idEquipo = 0;
      this.ModalEquipoEliminar = false;

  } catch (error) {
      // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
      this.messageService.add({
          severity: 'error',
          summary: 'Error Externo',
          styleClass:'iziToast-custom',
          detail: error.message || error,
          life: 3000
      });
  }

  }
//Nos redirigee al index 1 es decir donde esta la principal


//Validadores
ValidarNumeros($event: KeyboardEvent | ClipboardEvent | InputEvent) {
  const inputElement = $event.target as HTMLInputElement;

  // Handle keyboard events
  if ($event instanceof KeyboardEvent) {
    const key = $event.key;

    // Allow control keys (backspace, delete, arrow keys, etc.)
    if (
      key === 'Backspace' ||
      key === 'Delete' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'Tab'
    ) {
      return;
    }

    // Prevent any key that isn't a number
    if (!/^\d$/.test(key)) {
      $event.preventDefault();
    }
  }

  // Handle paste events
  if ($event instanceof ClipboardEvent) {
    const clipboardData = $event.clipboardData
    const pastedData = clipboardData.getData('text');

    // Prevent pasting non-numeric content
    if (!/^[0-9\s]*$/.test(pastedData)) {
      $event.preventDefault();
    }
  }

  // Handle input events (useful for checking after the input has changed, e.g., with paste or deletion)
  if ($event instanceof InputEvent) {
    if (!/^[0-9]*$/.test(inputElement.value)) {
      inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
    }
  }
}



ValidarTextoNumeros($event: KeyboardEvent | ClipboardEvent | InputEvent) {
  const inputElement = $event.target as HTMLInputElement;


  if ($event instanceof KeyboardEvent) {
    const key = $event.key;


    if (
      key === 'Backspace' ||
      key === 'Delete' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'Tab'
    ) {
      return;
    }


    if (inputElement.value.length === 0 && key === ' ') {
      $event.preventDefault();
      return;
    }


    if (!/^[a-zA-Z0-9\s]$/.test(key)) {
      $event.preventDefault();
    }
  }


  if ($event instanceof ClipboardEvent) {
    const clipboardData = $event.clipboardData;
    const pastedData = clipboardData.getData('text');


    if (!/^[a-zA-Z0-9\s]*$/.test(pastedData)) {
      $event.preventDefault();
    }


    if (inputElement.value.length === 0 && pastedData.startsWith(' ')) {
      $event.preventDefault();
    }
  }


  if ($event instanceof InputEvent) {
    inputElement.value = inputElement.value.replace(/[^a-zA-Z0-9\s]/g, '');

    if (inputElement.value.startsWith(' ')) {
      inputElement.value = inputElement.value.trimStart();
    }
  }
}

}
