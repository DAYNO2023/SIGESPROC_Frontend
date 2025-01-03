import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { ventabienraizservice } from 'src/app/demo/services/servicesbienraiz/ventabienraiz.service';
import {
    ImagenViewModel,
    Mantenimiento,
    ventabienraiz,
} from 'src/app/demo/models/modelsbienraiz/ventabienraizviewmodel';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
    AgenteBienRaiz,
    AgenteBienRaiz2,
} from 'src/app/demo/models/modelsbienraiz/agentebienraizviewmodel';
import { agenteBienRaizService } from 'src/app/demo/services/servicesbienraiz/agenteBienRaiz.service';
import { EmpresaBienRaizService } from 'src/app/demo/services/servicesbienraiz/empresaBienRaiz.service';
import { DatePipe } from '@angular/common';
import { DocumentoBienRaizService } from 'src/app/demo/services/servicesbienraiz/documentoBienRaiz.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { EmpresaBienRaiz } from 'src/app/demo/models/modelsbienraiz/empresabienraizviewmodel';
import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';
import { th } from 'date-fns/locale';

import { ciudad } from 'src/app/demo/models/modelsgeneral/ciudadviewmodel';
import { Estado } from 'src/app/demo/models/modelsgeneral/estadoviewmodel ';
import { Pais } from 'src/app/demo/models/modelsgeneral/paisviewmodel';
import { DropDownEstadoCivil } from 'src/app/demo/models/modelsgeneral/estadoCivilviewmodel';
import { Cliente } from 'src/app/demo/models/modelsgeneral/clienteviewmodel';
import { ClienteService } from 'src/app/demo/services/servicesgeneral/cliente.service';
import { EstadoService } from 'src/app/demo/services/servicesgeneral/estado.service';
import { PaisService } from 'src/app/demo/services/servicesgeneral/pais.service';
import { EstadoCivilService } from 'src/app/demo/services/servicesgeneral/estadoCivil.service';
import { ciudadService } from 'src/app/demo/services/servicesgeneral/ciudad.service';

import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'app-ventabienraiz',
    templateUrl: './VentadeBienesRaíces.component.html',
    styleUrls: ['./VentadeBienesRaíces.component.scss'],
    providers: [MessageService, DatePipe],
})
export class VentabienraizComponent implements OnInit {
    // Propiedades
    proceso: any[] = [];// Lista filtrada de Proceso en venta al momento de editar

    documents: any[] = [];// Lista filtrada de los Documentos para porder visualizar el 3 tab

    agente: any = {}; // lista el agente en el autocompletado

    bienRaiz: any = {};//Lista Los proceso de venta en el Index

    selectedProcesoVenta: any; // lo utilo para tomar los campos al momento de editar

    ventabienraiz: ventabienraiz[] = []; // Lista los ventabienraiz en un areglo lo utilizo para detalle

    filtradoInsumo: any[] = []; // listo la lista de Agentes se que dice Insumo pero es Agente

    //son los From que utilizo para manejar el Inserta, Actualizar y listas al momento de Actualizar
    form: FormGroup;
    forms: FormGroup;
    formInsumo: FormGroup;
    formProceso: FormGroup;
    formDatosGenerales: FormGroup;
    formImagenes: FormGroup;
    formInicioVenta: FormGroup;
    prueba: FormGroup;
    form2: FormGroup;
    formDNI: FormGroup;
    formAgente: FormGroup;
    formCliente: FormGroup;

    /* Lo Utilizo para hacer visible o invisble los botones de carga cuando levanto el modal
        Donde se visualiza los Bienes Raices o Terreno
    */
    isButtonVisible = false;

    submitted: boolean = false;// Se encarga de activar la alvertencia de campos requeridos


    loading: boolean = false; // se encarga de activar o desactivar el spinner

    CreateAgente: boolean = false; // se encarga de activar o desactivar el collapse

    venderprocesoventa: boolean = false;

    empresas: { value: number; label: string }[] = []; // lista la empresa en el autocompletado

    // filtradoAgente: AgenteBienRaiz[] = [];

    // agente2: AgenteBienRaiz[] | undefined;

    // idagente: number = 0;

    // AgenteBienesRaices: AgenteBienRaiz[] = [];

    // selectedImages: string[] = [];

    selectedImageIndex: number | null = null; // realiza el limpiar la imagen o eliminarla  en el segudo tab

    visibleImages: string[] = []; // realiza la vvisualizacion de la imagen al pasar al segundo tab

    startIndex: number = 0; // realiza el funcionamiento de mostrar la imagen que seleciona el usuario

    visibleCount: number = 4; // realiza la funcion de visualizar 4 cuadro iniciales en el segundo tab en la garleria de imagen

    selectedImage: string | null = null; // realiza la funcion de tomar esa imagen y visualizar en el contenedor principal en el segundo tab

    itemsVenta: MenuItem[] = []; // realisa el manejo dinamico de los botones al momento de que el Bien Raíz o terreno se pone en venta

    itemsVendido: MenuItem[] = [];// realiza el manejo dinamico de los botones al momento de que ese Bien Raíz o terreno se haiga vendido

    // son propiedades que activa o desactiva los Form Correspondientes
    Index = true;
    Create = false;
    Detail = false;
    Delete = false;
    actualizar = false;
    actualizar2 = false;
    vendido = false;
    editar = false;
    propiedades = false;

    //manejo de titulo al momento de editar o crear
    identity = 'Crear';
    titulo = 'Nueva';

    //lista el proceso de venta al editar dependiendo si es 1 o 0
    //cuando es 1 es para Terreno y cuando es 0 es para Bienes Raices
    id2: number = 0;
    id: number = 0;
    idtipo: number = 0;
    /////////////////

    isInserting: boolean;


    filtroSeleccionado: string = 'Todos';// realiza  el filtrado de los bienes raices o terreno

    productosFiltrados: any[] = []; //lista Lo Bienes Raices o terreno

    selectedProduct: any = { tipo: 0, id: null }; //realiza la funcion de tomar los id y tipo dependiendo de cual selecione en el modal

    selectedAgenteBienRaiz: any;// lista los Agentes

    selectedProductsa: any;//realiza la funcion de capturar el Tipo al selecinar un Bien Raíz o Terreno



    imagenes: any[] = [];// lista las imagenes en un areglo para visualizar o tomar al momento de Insertar la imagen
    documentos: any[] = []; // lista los documentos corespondiente al tio y Id del Bien Raíz o terreno en tercer tab
    filtroOptions: any[]; // realiza la funcion de hacer el filtrado dependiendo si es terreno, bein raiz o todos

    images: string[] = [];// realiza la funcio de cargar la imagenes que esta al lateral en el segundo tab

    activeIndex: number = 0;// realiza la funcion de identificar que tab sigue antes o despues een total son 3 tab

    isEditing: boolean = false;

    idbtrp2: number;
    selectedProcesoVenta2: ventabienraiz = {};
    tipo2: boolean;
    procesox: any = {};

    imageIds: number[] = [];

    bloqueado: boolean = true;



    // Detallle
    Datos = [{}];
    detalle_btrp_Id = 0;
    detalle_agen_codigo = '';
    detalle_btrp_Identificador = '';
    detalle_btrp_PrecioVenta_Inicio = '';
    detalle_btrp_PrecioVenta_Final = '';
    detalle_btrp_FechaPuestaVenta = '';
    detalle_btrp_FechaVendida = '';
    detalle_agen_NombreCompleto = '';
    detalle_btrp_Terreno_O_BienRaizId = '';
    detalle_mant_DNI = '';
    detalle_mant_NombreCompleto = '';
    detalle_mant_Telefono = '';
    detalle_usuaCreacion = '';
    detalle_usuaModificacion = '';
    detalle_FechausuaCreacion = '';
    detalle_FechausuaModificacion = '';

    tipo: number;



    ///------esto es lo del cliente
  clientes: Cliente[] = [];
  items: MenuItem[] = [];
  modaleliminar: boolean = false;
  modalConfirmacion: boolean = false;
  confirm: boolean = false;

  selectedCliente: Cliente;
  selectedEstado: any;
  selectedCiudad: any;

//   id: number = 0;

  estadosCiviles: DropDownEstadoCivil[] = [];
  detalle: any = {};
  civiles: DropDownEstadoCivil[] = [];

  cliente: Cliente;

  ciudades: ciudad[] = [];

  estados: Estado[] = [];

  paises: Pais[] = [];

  Loading2 = false;
//   Datos = [{}];

filtradoClientes: Cliente[] = []; // Inicializar el arreglo filtradoClientes
// cliente: Mantenimiento; // Declarar la propiedad cliente

minDate: Date;


    ///-------



    /**
     * Constructor para `ProyectoChildRiesgosComponent`.
     * @param service - Servicio para el Proceso de venta de bienes raices o terreno
     * @param serviceA - Servicio para el Agente
     * @param serviceEmpresa - Servicio para el Empresesa
     * @param navigationStateService - Servicio para gestionar el estado de navegación
     * @param messageService - Servicio para mostrar mensajes
     * @param router - Router para navegación
     * @param sanitizer - DomSanitizer: realiza la funcion de validar la URL de los documentos o imagenes traidas desde la API
     */
    constructor(
        private messageService: MessageService,
        private service: ventabienraizservice,
        private serviceA: agenteBienRaizService,
        private serviceEmpresa: EmpresaBienRaizService,
        private router: Router,
        // private documentoService: DocumentoBienRaizService,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        // private datePipe: DatePipe,
        private sanitizer: DomSanitizer,
        private clienteService: ClienteService,
        private ciudadService: ciudadService,
        private estadoService: EstadoService,
        private paisService: PaisService,
        private estadoCivilService: EstadoCivilService,
        public globalMoneda: globalmonedaService,
        public cookieService: CookieService
    ) {

        this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/bienraiz/ventadebienesraices')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
    
        this.form = this.fb.group({
            btrp_Id: [null],
            clie_Id: [null],
            clie_DNI: [''],
            clie_NombreCompleto: [{value: '', disabled: true}],
            clie_Telefono: [{value: '' , disabled: true}],
            btrp_PrecioVenta_Inicio: [null],
            btrp_FechaPuestaVenta: [null,{ value: '', disabled: true }],
            btrp_PrecioVenta_Final: ['', Validators.required],
            btrp_FechaVendida: ['', Validators.required],

        });

        this.minDate = new Date(2000, 0, 1);

        this.forms = this.fb.group({
            agen_DNI: ['', Validators.required],
        });

        this.form2 = this.fb.group({
            agen_DNI: ['', Validators.required],
            agen_Nombre: ['', Validators.required],
            agen_Apellido: ['', Validators.required],
            agen_Telefono: ['', Validators.required],
            agen_Correo: ['', Validators.required],
            embr_Id: ['', Validators.required],
        });

        this.formDNI = this.fb.group({
            agen_DNI: ['', Validators.required],
        });

        this.formInsumo = this.fb.group({
            agen_DNI: [''],
        });
        this.formDatosGenerales = this.fb.group({
            descripcion: [{ value: '', disabled: true }, Validators.required],
            direccion: [{ value: '', disabled: true }, Validators.required],
            area: [{ value: '', disabled: true }, Validators.required],
            imagen: [{ value: '', disabled: true }, Validators.required],
            precio: [{ value: '', disabled: false }, Validators.required],
            agen_DNI: [''],
            agenteId: [{ value: '', disabled: true }, Validators.required],
            agenteNombre: [{ value: '', disabled: true }, Validators.required],
            agenteCorreo: [{ value: '', disabled: true }, Validators.required],
            telefono: [{ value: '', disabled: true }, Validators.required],
            fechaVentaInicial: ['', Validators.required],
            precioInicial: ['', Validators.required],
            tipo: [''],
            id: [''],
            agente: [''],
        });
        this.filtroOptions = [
            { label: 'Todos', value: 'Todos' },
            { label: 'Bienes Raíces', value: 'Bienes Raíces' },
            { label: 'Terrenos', value: 'Terrenos' }
        ];
        this.formImagenes = this.fb.group({
            btrp_Id: [''],
            impr_Imagen: [''],
        });

        this.formInicioVenta = this.fb.group({
            descripcion: [''],
            direccion: [''],
            agenteNombre: [''],
            position: [''],
            showIndicatorsOnItem: [false],
        });

        this.formCliente  = this.fb.group({
            clie_Id: [null],
            clie_DNI: ['', Validators.required],
            clie_Nombre: ['', Validators.required],
            clie_Apellido: ['', Validators.required],
            clie_CorreoElectronico: ['', [Validators.required, Validators.email]],
            clie_Telefono: ['', Validators.required],
            esta_Nombre: ['', Validators.required],
            pais_Nombre: ['', Validators.required],
            ciud_Descripcion: ['', Validators.required],
            esta_Id: [''], // Cambiado a 'esta_Id'
            pais_Id: [''],
            clie_FechaNacimiento: ['', Validators.required],
            clie_Sexo: ['', Validators.required],
            clie_DireccionExacta: ['', Validators.required],
            ciud_Id: [''],
            civi_Id: ['', Validators.required],
            clie_Tipo:['',Validators.required]
          });

          this.estados = [];
          this.paises = [];
          this.ciudades = [];
          this.estadosCiviles = [];
          this.civiles = [];

        // this.prueba = this.fb.group({

        // });
    }

    onRouteChange(): void {
        // Aquí puedes llamar cualquier método que desees reejecutar
      
        this.ngOnInit();
      }

    /**
     * Inicializa el componente cargando el proyecto y sus riesgos asociados.
     * Obtiene los riesgos si hay un proyecto disponible en el estado de navegación.
     */

    ngOnInit(): void {
        this.Index = true;
        this.Create = false;
        this.editar = false;
        this.detalle = false;
        this.venderprocesoventa = false;

        const token = this.cookieService.get('Token');
        if(token == 'false'){
          this.router.navigate(['/auth/login'])
        }
        this.cargarDatos2();
        this.cargarEmpresas();
        this.filtrarProductos();
        this.submitted = false;

        // console.log(this.globalMoneda.getState(), 'this.globalMoneda.getState()');


        if (!this.globalMoneda.getState()) {
        //   console.log('hola');
          this.globalMoneda.setState()
        }
        this.itemsVenta = [
            {
                label: 'Vender',
                icon: 'pi pi-bookmark',
                command: () => this.venderProcesoVenta(),
            },
            {
                label: 'Editar',
                icon: 'pi pi-user-edit',
                command: () => this.editarProcesoVenta(),
            },
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: () => this.verDetallesProcesoVenta(),
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: () => this.eliminarProcesoVenta(),
            },
        ];

        this.itemsVendido = [
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: () => this.verDetallesProcesoVenta(),
            },
        ];

        this.formInicioVenta.patchValue({
            descripcion: this.formDatosGenerales.value.descripcion,
            direccion: this.formDatosGenerales.value.direccion,
            agenteNombre: this.formDatosGenerales.value.agenteNombre,
        });

        this.formDatosGenerales = this.fb.group({
            agen_DNI: [''],
            tipo: [''],
            id: [''],
            agente: [''],
            descripcion: [''],
            direccion: [''],
            area: [''],
            precio: ['1234567.89'],
            agenteId: [''],
            agenteNombre: [''],
            agenteCorreo: [''],
            fechaVentaInicial: [''],
            precioInicial: [''],
        });

        this.formDatosGenerales = this.fb.group({
            descripcion: [{ value: '', disabled: false }, Validators.required],
            direccion: [{ value: '', disabled: false }, Validators.required],
            area: [{ value: '', disabled: false }, Validators.required],
            precio: [{ value: '', disabled: false }, Validators.required],
            imagen: [''],
            agen_DNI: ['', Validators.required],
            agenteId: [{ value: '', disabled: false }, Validators.required],
            agenteNombre: [{ value: '', disabled: false }, Validators.required],
            agenteCorreo: [{ value: '', disabled: false }, Validators.required],
            telefono: [{ value: '', disabled: false }, Validators.required],
            fechaVentaInicial: ['', Validators.required],
            precioInicial: ['', Validators.required],
            tipo: [''],
            id: [''],
            agente: [''],
        });


        const idbtrp2 = this.route.snapshot.paramMap.get('idbtrp2');
        const tipo = this.route.snapshot.paramMap.get('tipo');
        const id2 = this.route.snapshot.paramMap.get('id2');

        // console.log('Parametros de ruta:', { idbtrp2, tipo, id2 });

        if (idbtrp2 && tipo && id2) {
            this.cargarproceso(+idbtrp2, +tipo, +id2);
        }

        this.service.ListarBienesRaicesYTerrenos().subscribe(
            (data) => {
                this.productosFiltrados = data;
                // console.log('Bienes Raíces y Terrenos:', this.productosFiltrados);
            },
            // (error) => console.error('Error al listar bienes raíces y terrenos:', error)
        );

        /// esto es de cliente
        this.loadCountries();

        this.ciudades = []; //Carga las ciudades

        this.estados = []; //Carga los estados

        this.paisService.Listar() //Carga la lista de estados
        .subscribe((data: any) => { this.paises = data.data })

       this.estadoCivilService.DropDown().subscribe((data: DropDownEstadoCivil[]) => {
        this.civiles = data; //Carga la lista de estados civiles
        // console.log(data);
     });

    }

    // Desabilitarprecio() {
    //     const condition = true; // Reemplaza esto con tu condición real
    //     if (condition) {
    //       this.formDatosGenerales.get('precio')?.disable();
    //     } else {
    //       this.formDatosGenerales.get('precio')?.enable();
    //     }
    //   }

    // @ViewChild('bienRaizRadioButton') bienRaizRadioButton: ElementRef;

    // ngAfterViewInit(): void {
    //     this.bienRaizRadioButton.nativeElement.focus();
    //   }

    /**
     * Prepara un objeto de riesgo para su edición.
     * @param url - realiza la seguridad de la URL traida de la API
     */

    sanitizeUrl(url: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    /**
     * Guarda el Proceso de venta del primer Tab, ya sea creando un nuevo riesgo o actualizando uno existente.
     * Muestra un mensaje de éxito o error basado en la respuesta.
    */

    procesoGuardado = false; // Nueva variable para controlar si ya se guardó el proceso

siguienteTab() {
    this.submitted = true;

    // Si ya se guardó previamente, solo avanzar al siguiente tab
    if (this.procesoGuardado) {
        if (this.activeIndex < 2) {
            this.activeIndex++;
        }
        return;
    }

    if (this.formDatosGenerales.invalid) {
        // Mostrar advertencia si el formulario es inválido
        return;
    }

    // Validar si el precio es 0
    const precioInicial = this.formDatosGenerales.value.precioInicial;
    if (precioInicial <= 0) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'El precio en venta no puede ser 0.'
        });
        return;
    }

    // Validar si se ha seleccionado un Bien Raíz o Terreno en el modo de creación
    if (!this.isEditing &&
        (!this.selectedProductsa ||
         typeof this.selectedProductsa.tipo === 'undefined' ||
         typeof this.selectedProductsa.id === 'undefined')
    ) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Por favor seleccione un Bien Raíz o Terreno',
        });
        return;
    }

    const fechaVentaInicial = new Date(this.formDatosGenerales.value.fechaVentaInicial);
    if (isNaN(fechaVentaInicial.getTime())) {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Fecha de Venta Inicial no válida',
        });
        return;
    }

    const procesoVenta: ventabienraiz = {
        btrp_Id: this.idbtrp2 || 0,
        btrp_PrecioVenta_Inicio: this.formDatosGenerales.value.precioInicial,
        btrp_FechaPuestaVenta: fechaVentaInicial,
        agen_Id: this.formDatosGenerales.value.agen_DNI?.agen_Id || this.formDatosGenerales.value.agente,
        btrp_Terreno_O_BienRaizId: this.selectedProductsa ? this.selectedProductsa.tipo === 1 : undefined,
        btrp_BienoterrenoId: this.selectedProductsa ? this.selectedProductsa.id : undefined,
        usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
        btrp_FechaCreacion: new Date(),
        usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
        btrp_FechaModificacion: new Date(),
    };

    // Modo de actualización
    if (this.isEditing) {
        this.service.Actualizar(procesoVenta).subscribe(
            (response) => {
                if (response.success) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Actualizado con Éxito.',
                    });
                    this.form2.reset();
                    this.procesoGuardado = true; // Marcar como guardado
                    if (this.activeIndex < 2) {
                        this.activeIndex++;
                    }
                    this.cargarImagenes(this.idbtrp2);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al Vender el Bien Raíz',
                    });
                }
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'El campos son incorrectos',
                });
            }
        );
    } else {
        // Modo de creación
        this.service.Insertar(procesoVenta).subscribe(
            (response) => {
                if (response.success) {
                    this.idbtrp2 = response.data.codeStatus;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Insertado con Éxito.',
                    });
                    this.form2.reset();
                    this.procesoGuardado = true; // Marcar como guardado
                    if (this.activeIndex < 2) {
                        this.activeIndex++;
                    }
                    this.clear();
                    this.cargarImagenes(this.idbtrp2);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al insertar el proceso de venta.',
                    });
                }
            },
            (error) => {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'Seleccione o Crear un agente',
                });
            }
        );
    }
}
    


    siguienteTab2() {
        this.Loading2 = true;
        // creo 3 cosntantes las cual las utilizo para filtrar los documentos y visualizalos en el tercer tab
        const isInsertMode = this.isInsertMode();
        // esta const idProceso realiza el proceso de verificar caundo se esta creando el proceso de venta o editando
        //porque manejo 2 variables id2 es para crear y id que lo tomo del formDatosGenerales que es para editar
        const idProceso = isInsertMode ? this.id2 : this.formDatosGenerales.get('id').value;
        const tipoProceso = this.formDatosGenerales.get('tipo').value;

        // console.log('Tipo:', tipoProceso, 'ID:', idProceso);

        // realiza la validacion cuado el idProceso es en modo insertar o actualizar
        if (isNaN(idProceso) || idProceso === 0) {
            // console.error('ID no válido:', idProceso);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'ID no válido',
            });
            return;
        }

        // valido si el tipo me lo esta tomando al momento de actualizar
        if (isNaN(tipoProceso)) {
            // console.error('Tipo no válido:', tipoProceso);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Tipo no válido',
            });
            return;
        }

        // realiza la funcion de cargar los documentos correspondiente al ID del Proceso que seria Bien Raíz o terreno
        // y tambien cuando tipoProceso es 1 para terreno o 0 para Bien Raíz
        this.service.getDocumentos(tipoProceso, idProceso).subscribe(
            (response) => {
                if (response && response.data) {
                    this.documents = response.data.map((doc: any) => {
                        /*creo la constante la me captura la url de la imagen en la base de datos.
                        y en base a eso visualizo la imagen la url va atada a la URL donde se
                        almacena la imagen en la API.
                        La imagenes se guardan en la API*/
                        const docUrl = doc.dobt_Imagen || '';
                        const fullUrl =
                            docUrl.startsWith('data:image/') ||
                                docUrl.startsWith('data:application/')
                                ? docUrl
                                : `${this.service.getApiUrl()}/${docUrl}`;
                        // console.log('Processed URL:', fullUrl);
                        return {
                            ...doc,
                            url: fullUrl,
                        };
                    });
                    this.Loading2 = false;
                    // console.log('Documents:', this.documents);

                    if (this.documents.length > 0) {
                        if (this.activeIndex < 2) {
                            this.activeIndex++;
                        }
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Advertencia',
                            detail: 'No se encontraron documentos',
                        });
                    }
                } else {
                    // console.error(
                    //     'No documents found for tipo:',
                    //     tipoProceso,
                    //     'id:',
                    //     idProceso
                    // );
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'No se encontraron documentos',
                    });
                }
            },
            (error) => {
                // console.error('Error loading documents:', error);
                // this.messageService.add({
                //     severity: 'error',
                //     summary: 'Error',
                //     detail: 'Error al cargar documentos',
                // });
            }
        );
    }

    //realiza la funcion el proceso esta en modo Insertar o Actualizar
    isInsertMode(): boolean {
        return this.isInserting;
    }


    /**
     * Genera los documentos la cuales cuando avanzo al tercer tab me visualiza
     * todo documento guardado ya sea PDF, DOCS, DOCX, JPG, PNG Y GIF que esta en la API
     * @param isPdf - trae su URL correspondiente data:application/pdf
     * @param isDoc - trae su URL correspondiente data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64
     * @param isImage - trae su URL correspondiente data:image/
     *
     */

    isPdf(url: string): boolean {
        return url.endsWith('.pdf') || url.startsWith('data:application/pdf');
    }

    text(url: string): boolean {
        return url.endsWith('.txt') || url.startsWith('data:text/plain');
    }

    generatePDF() {
        const data = document.getElementById('pdfContent');
        if (data) {
            html2canvas(data).then((canvas) => {
                const imgWidth = 208;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save('document.pdf');
            });
        }
    }

    isDoc(url: string): boolean {
        return (
            url.endsWith('.doc') ||
            url.endsWith('.docx') ||
            url.startsWith(
                'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64'
            )
        );
    }

    isImage(url: string): boolean {
        return (
            url.startsWith('data:image/') ||
            url.endsWith('.jpg') ||
            url.endsWith('.jpeg') ||
            url.endsWith('.png') ||
            url.endsWith('.gif')
        );
    }
    cargarEmpresas() {
        this.serviceEmpresa.Listar().subscribe((data: EmpresaBienRaiz[]) => {
            this.empresas = data.map((empresa) => ({
                value: empresa.embr_Id,
                label: empresa.embr_Nombre,
            }));
            this.empresas.forEach((empresa) => {
                // console.log(
                //     `Empresa ID: ${empresa.value}, Nombre: ${empresa.label}`
                // );
            });
        });
    }

    /**
     * Genera lo que el filtado del agente y se autocompleta en el input
     * @param filtradoInsumo - toma como para parametros para realizar la buquedad del agente
     */


    filterInsumo(event: any) {
        const query = event.query.toLowerCase();
        this.serviceA.ListarAgentes().subscribe(
            (data: AgenteBienRaiz[]) => {
                this.filtradoInsumo = data
                    .filter((agent) =>
                        agent.agen_DNI?.toLowerCase().includes(query) ||
                        agent.agen_Nombre?.toLowerCase().includes(query) ||
                        agent.agen_Apellido?.toLowerCase().includes(query)
                    )
                    .map(agent => ({
                        ...agent,
                        display: `${agent.agen_DNI} -- ${agent.agen_Nombre} ${agent.agen_Apellido}`
                    }));
            },
            (error) => {
                // console.error(error);
            }
        );
    }


    // realiza la funcion de auto llenar los campos correspondiente al agente que se busco
    onInsumoSelect(event: any) {
        const selectedAgent = event.value;
        if (selectedAgent && selectedAgent.agen_DNI) {
            this.serviceA.BuscarAgente(selectedAgent.agen_DNI).subscribe(
                (agent: AgenteBienRaiz) => {
                    if (agent && agent.agen_DNI) {
                        this.agente = {
                            agente: agent.agen_Id,
                            agenteId: agent.agen_DNI,
                            agenteNombre:
                                agent.agen_Nombre + ' ' + agent.agen_Apellido,
                            agenteCorreo: agent.agen_Correo,
                            telefono: agent.agen_Telefono,
                        };
                        this.formDatosGenerales.patchValue({
                            agente: this.agente.agente,
                            agenteId: this.agente.agenteId,
                            agenteNombre: this.agente.agenteNombre,
                            agenteCorreo: this.agente.agenteCorreo,
                            telefono: this.agente.telefono,
                        });

                        this.formInicioVenta.patchValue({
                            agenteNombre: this.agente.agenteNombre,
                        });
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'El agente seleccionado no tiene un DNI válido',
                            life: 3000,
                        });
                    }
                },
                (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error en la búsqueda del agente',
                        life: 3000,
                    });
                }
            );
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'El agente seleccionado no tiene un DNI válido',
                life: 3000,
            });
        }
    }

    // EditarAgenteBienRaiz() {
    //     this.Detail = false;
    //     this.Index = false;
    //     this.Create = true;
    //     this.identity = 'editar';
    //     this.titulo = 'Editar Agente Bien Raíz';

    //     console.log('Agente seleccionado:', this.selectedAgenteBienRaiz);
    //     this.form2.patchValue({
    //         agen_DNI: this.selectedAgenteBienRaiz.agen_DNI,
    //         agen_Nombre: this.selectedAgenteBienRaiz.agen_Nombre,
    //         agen_Apellido: this.selectedAgenteBienRaiz.agen_Apellido,
    //         agen_Telefono: this.selectedAgenteBienRaiz.agen_Telefono,
    //         agen_Correo: this.selectedAgenteBienRaiz.agen_Correo,
    //         embr_Id: this.selectedAgenteBienRaiz.embr_Id,
    //     });
    //     this.agente = this.selectedAgenteBienRaiz.agen_Id;
    //     console.log(
    //         `ID de la empresa seleccionada: ${this.selectedAgenteBienRaiz.embr_Id}`
    //     );
    //     console.log('Formulario actualizado:', this.form2.value);
    // }


    // realiza la funcion de visualizar el agente traido de la busquedad realizada
    selectAgenteBienRaiz(agenteBienRaiz: any) {
        this.selectedAgenteBienRaiz = agenteBienRaiz;
    }

    //realiza la funcion de poder crear un nuevo agente para el proceso de venta de bienes y raices o terreno
    CrearAgenteBienRaiz() {
        this.Detail = false;
        this.Index = false;
        this.Create = true;
        this.activeIndex = 0;
        this.form2.reset();
        this.identity = 'crear';
        this.titulo = 'Nuevo Agente de Bienes Raíces';
    }

    /**
     * Genera el proceso de guardar el nuevo agente para el proceso de venta de bienes raices
     */

    GuardarAgente() {
        this.submitted = true;

        if (this.form2.valid) {
            const agenteBienRaiz: AgenteBienRaiz = this.form2.value;
            agenteBienRaiz.usua_Creacion = parseInt(this.cookieService.get('usua_Id'));

            this.serviceA.Insertar(agenteBienRaiz).subscribe(
                (respuesta: any) => {
                    if (respuesta.success) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Insertado con Éxito.',
                            life: 3000,
                        });
                        this.CreateAgente = false;

                        agenteBienRaiz.agen_Id = respuesta.data.agen_Id;
                        this.filtradoInsumo.push(agenteBienRaiz);

                        this.formDatosGenerales.patchValue({
                            agen_DNI: agenteBienRaiz.agen_DNI,
                            agenteId: agenteBienRaiz.agen_Id,
                            agenteNombre: `${agenteBienRaiz.agen_Nombre} ${agenteBienRaiz.agen_Apellido}`,
                            agenteCorreo: agenteBienRaiz.agen_Correo,
                            telefono: agenteBienRaiz.agen_Telefono
                        });

                        this.onInsumoSelect({ value: agenteBienRaiz });

                        this.CerrarAgenteBienRaiz();
                    } else {
                        this.messageService.add({
                            severity: 'Warn',
                            summary: 'Advertencia',
                            detail: 'El agente ya existe.',
                            life: 3000,
                        });
                    }
                },
                (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error en el servidor: ' + error.message,
                        life: 3000,
                    });
                    // console.error(error);
                }
            );
        }
    }

    //realiza la funcion de cerrar el proceso de crear Agente y lo retorna a la ventana del proceso de venta
    // del Bien Raíz o terreno
    CerrarAgenteBienRaiz() {
        this.submitted = false;
        this.Detail = false;
        this.agente = false;
        this.Create = true;
        this.CreateAgente = false;
        this.form2.reset();
    }


    //aqui tomo el value correspondiente y valido que filtrado es dependiendo
    // del evento onclick del html
    onFiltroChange(event: any) {
        this.filtroSeleccionado = event.value;
        this.filtrarProductos();
    }


    /**
     * Genera el proceso de realizar ya sea Todos, Bienes Raices o Terreno
     * el filtrado esta en base al evento onclick del radio button que esta en el HTML
     * tomando haci el Value para que realice el filtrado
     */
    filtrarProductos() {
        if (this.filtroSeleccionado === 'Todos') {
            this.service.ListarBienesRaices().subscribe(
                (bienesRaices) => {
                    this.service.ListarTerrenos().subscribe(
                        (terrenos) => {
                            this.productosFiltrados = [...bienesRaices, ...terrenos];
                            // console.log('Productos filtrados:', this.productosFiltrados);
                        },
                        // (error) => console.error('Error al listar terrenos:', error)
                    );
                },
                // (error) => console.error('Error al listar bienes raíces:', error)
            );
        } else if (this.filtroSeleccionado === 'Bienes Raices') {
            this.service.ListarBienesRaices().subscribe(
                (data) => {
                    this.productosFiltrados = data;
                    // console.log('Bienes Raices filtrados:', this.productosFiltrados);
                },
                // (error) => console.error('Error al listar bienes raíces:', error)
            );
        } else if (this.filtroSeleccionado === 'Terrenos') {
            this.service.ListarTerrenos().subscribe(
                (data) => {
                    this.productosFiltrados = data;
                    // console.log('Terrenos filtrados:', this.productosFiltrados);
                },
                // (error) => console.error('Error al listar terrenos:', error)
            );
        }
    }

    //Abre el modal de Propiedades la cual contiene Bienes Raices o Terreno
    // dependiendo el filtrado que se realice
    openPropiedadesModal() {
        this.loading = true;
        this.loading = false;
        this.propiedades = true;
        this.cargarDatos();
        // setTimeout(() => {
        //     this.cargarDatos();
        // }, 0);
    }

    //abre el collapse de agente y oculta el proceso de venta de bienes raices o terreno
    openagenteModal() {
        this.form2.reset();
        this.CreateAgente = true;
        this.Create = false;
        this.Index = false;
        this.submitted = false;
    }


    // realia la funcion de validar que los input que contennga este metodo solo acetara nada mas
    //numeros y con maximo de 13 numeros
    ValidarDNI(event: KeyboardEvent) {
        const inputElement = event.target as HTMLInputElement;
        const key = event.key;
        if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
            event.preventDefault();
        }
        if (key === ' ' && inputElement.selectionStart === 0) {
            event.preventDefault();
        }
        if (inputElement.value.length >= 13 && key !== 'Backspace' && key !== 'Tab') {
            event.preventDefault();
        }
    }

    //realiza la funcion de filtara en la tabla del index dependiendo las colunnas que tenga la tabla
    onGlobalFilter(table: any, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    //realiza la funcion de crear el nuevo proceso y haci conmenzar el proceso de venta

    CrearProcesoVenta() {

        this.titulo = 'Nueva';
        this.isEditing = false;
        this.Index = false;
        this.Detail = false;
        this.Create = true;
        this.activeIndex = 0;
        this.bienRaiz = {};
        this.submitted = false;
        this.selectedProductsa = null;
        // console.log(
        //     'Proceso de venta iniciado, datos del bien raíz inicializados'
        // );

        this.updateVisibleImages();

        this.clear();
        this.formDatosGenerales.reset();
        this.form.reset();
        this.forms.reset();
        this.formImagenes.reset();
        this.formInicioVenta.reset();
        this.prueba.reset();
    }

    /**
     * Genera el autocompletado una vez selecionado lo que es el terreno o Bien Raíz
     */
    Guardar() {
        if (this.selectedProduct) {
            this.bienRaiz = {

                //estos son los campos que se autocompleta una vez selecionado en Bien Raíz o terreno
                //en el modal de propiedades y se envia a en el form formDatosGenerales
                descripcion:
                    this.selectedProduct.bien_Desripcion ||
                    this.selectedProduct.terr_Descripcion,
                direccion:
                    this.selectedProduct.terr_LinkUbicacion ||
                    this.selectedProduct.terr_LinkUbicacion,
                area: this.selectedProduct.terr_Area,

                precio: this.selectedProduct.terr_PecioCompra ||
                    this.selectedProduct.bien_Precio,

                imagen:
                    this.selectedProduct.bien_Imagen ||
                    this.selectedProduct.terr_Imagen,
                linkUbicacion:
                    this.selectedProduct.terr_LinkUbicacion ||
                    this.selectedProduct.terr_LinkUbicacion,
                tipo: this.selectedProductsa
                    ? this.selectedProductsa.tipo
                    : undefined,
                idtipo: this.selectedProductsa
                    ? this.selectedProductsa.id
                    : undefined,
            };

            // console.log('Identificador de jafet');

            // console.log('selectedProduct:', this.selectedProduct);
            // console.log('selectedProductsa:', this.selectedProductsa);
            // console.log('bienRaiz:', this.bienRaiz);

            this.formDatosGenerales.patchValue({
                descripcion: this.bienRaiz.descripcion,
                direccion: this.bienRaiz.direccion,
                area: this.bienRaiz.area,
                precio: this.bienRaiz.precio,
                imagen: this.bienRaiz.imagen,
                tipo: this.bienRaiz.tipo,
                id: this.bienRaiz.idtipo,
            });

            // console.log('precio compra', this.formDatosGenerales);

            this.formInicioVenta.patchValue({
                descripcion: this.bienRaiz.descripcion,
                direccion: this.bienRaiz.direccion,
            });

            this.tipo = this.bienRaiz.tipo;
            this.idtipo = this.bienRaiz.idtipo;
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Alvertencia',
                detail: 'Debe seleccionar un Bien Raíz o Terreno',
            });
        }
        this.propiedades = false;
    }

    //realiza la funcion de regresa al anterior tab dependiendo de que tab este  2 o 3
    anteriorTab() {
        if (this.activeIndex > 0) {
            this.activeIndex--;
        }
    }


    /**
     * Genera el auutocompletado de los input al momento de darle editarprocesoventa
     * tomando en cuenta el idbtrp2 que seria el id del proceso de venta
     * tipo que seria 1 o 0 dependiento si es terreno = 1 o bienes raices = 0
     * y el id que en este caso seria el id dependiendo del tipo
     */

    /**
     *
     * @param idbtrp2 - es el id del proceso de venta
     * @param tipo - es el id del idetificar 1 para terreno y 0 para bienes raices
     * @param id - es el id del terreno o del Bien Raíz dependiendo del identificador
     */
    cargarproceso(idbtrp2: number, tipo: number, id: number) {
        this.service.Buscar(idbtrp2, tipo, id).subscribe(
            (data: any) => {
                if (data && data.length > 0) {
                    const proceso = data[0];
                    const fechaVentaInicial = proceso.btrp_FechaPuestaVenta
                        ? new Date(proceso.btrp_FechaPuestaVenta)
                        : null;
                    // console.log('Proceso recibido:', proceso);

                    this.formDatosGenerales.patchValue({
                        descripcion: proceso.descripcion,
                        direccion: proceso.linkUbicacion,
                        area: proceso.area,
                        imagen: proceso.imagen,
                        precio: proceso.precioCompra,
                        agen_DNI: proceso.agen_DNI,
                        agenteId: proceso.agen_DNI,
                        agenteNombre: proceso.agen_NombreCompleto,
                        agenteCorreo: proceso.agen_Correo,
                        telefono: proceso.agen_Telefono,
                        fechaVentaInicial: fechaVentaInicial,
                        precioInicial: proceso.btrp_PrecioVenta_Inicio,
                        tipo: proceso.btrp_Terreno_O_BienRaizId ? 1 : 0,
                        id: proceso.btrp_BienoterrenoId,
                        agente: proceso.agen_Id,
                    });
                    this.formInicioVenta.patchValue({
                        descripcion: proceso.descripcion,
                        direccion: proceso.linkUbicacion,
                        agenteNombre: proceso.agen_NombreCompleto,
                    });

                    // console.log('Tipo asignado:', this.formDatosGenerales.get('tipo').value);
                    // console.log('ID asignado:', this.formDatosGenerales.get('id').value);
                } else {
                    // console.error('No se recibieron datos del proceso');
                }
            },
            (error) => {
                // console.log('Error fetching data:', error);
            }
        );
    }


    /**
     * realiza la funcion de poder editar el proceso de venta tomando los id de
     * idbtrp2, tipo y id2 lo cual visualiza los campos llenados
     *
    */
    editarProcesoVenta() {

        this.activeIndex = 0;
        this.titulo = 'Editar';
        this.isEditing = true;
        this.Detail = false;
        this.Index = false;
        this.Create = true;
        this.editar = true;
        this.submitted = false;
        this.idbtrp2 = this.selectedProcesoVenta.btrp_Id;
        this.tipo = this.selectedProcesoVenta.btrp_Terreno_O_BienRaizId ? 1 : 0;
        this.id2 = this.selectedProcesoVenta.btrp_BienoterrenoId;

        this.updateVisibleImages();

        this.cargarproceso(this.idbtrp2, this.tipo, this.id2);
        this.cargarImagenes(this.idbtrp2);

        this.clear();
        this.formDatosGenerales.reset();
        this.form.reset();
        this.forms.reset();
        this.formImagenes.reset();
        this.formInicioVenta.reset();
        this.prueba.reset();

        this.resetActiveIndex();

        // console.log('proceso', this.idbtrp2);
        // console.log('tipo', this.tipo);
        // console.log('idTB', this.id2);
    }

    /**
     * Genera lo que una descarga inmediata una vez le de al boton de descargar
     * @param tipo es el id del tipo de identificador ya sea para terreno = 1 o bienes raices = 0
     * @param id es el id del terreno o Bien Raíz dependiendo del identificador
     */
    descargarDocumento(tipo: number, id: number) {
        this.service.getDocumentos(tipo, id).subscribe(
            (response) => {
                if (response && response.data) {
                    const documentos = response.data;
                    documentos.forEach((doc: any) => {
                        //el dobt_Imagen es el columna que esta en la base la cual guarda la URL
                        //donde se almacena el Documento en la API
                        const base64Data = doc.dobt_Imagen || '';
                        const fileName = doc.descripcionDocumento || 'documentos';

                        //realiza la validacion y proteccion de la URL
                        const fileType = this.detectFileType(base64Data);

                        //una ves tomado los campos entra en el mmetodo de downloadDocument
                        // lo cual hace el proceso de descarga
                        if (fileType) {
                            this.downloadDocument(base64Data, fileName, fileType);
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Tipo de archivo no soportado o no detectado.',
                            });
                        }
                    });
                } else {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'No se encontraron documentos',
                    });
                }
            },
            (error) => {
                // console.error('Error loading documents:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar documentos',
                });
            }
        );
    }

    /**
     *
     * @param base64Data -- es la validacion y proteccionde la URL
     * @returns -retorna el formato el cual se va a descarga y verifica la url de
     * almenaceja que esta en la API
     */


    detectFileType(base64Data: string): string | null {
        const mimeMatch = base64Data.match(/^data:(.*);base64,/);
        if (mimeMatch) {
            return mimeMatch[1];
        }

        // Si no tiene el prefijo, detecta por contenido
        if (base64Data.includes('JVBER')) { // Detectar PDF
            return 'application/pdf';
        } else if (base64Data.includes('UEsDB')) { // Detectar DOCX
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else if (base64Data.includes('0M8R4')) { // Detectar DOC antiguo
            return 'application/msword';
        } else if (base64Data.includes('iVBORw0KGgo')) { // Detectar PNG
            return 'image/png';
        } else if (base64Data.includes('/9j/')) { // Detectar JPEG
            return 'image/jpeg';
        } else if (base64Data.includes('R0lGOD')) { // Detectar GIF
            return 'image/gif';
        } else {
            return null;
        }
    }



    /**
     * realiza el proceso de descarga directa traendo todos los documentos
     * @param base64Data - la validacion y proteccion de la url porque se maneja en base64
     * @param fileName - ell nombre del archivo
     * @param fileType - el formato al cual se va a descargar
     */
    downloadDocument(base64Data: string, fileName: string, fileType: string): void {
        const linkSource = base64Data.startsWith('data:')
            ? base64Data
            : `data:${fileType};base64,${base64Data}`;
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    // resetea el index activo
    resetActiveIndex() {
        this.activeIndex = 0;
    }

    /**
     * realiza el proceso de vendido para el Bien Raíz o terreno que esta en proceso de venta
     * pero solamente le pide dos parammetros lo cuales son btrp_PrecioVenta_Final y btrp_FechaVendida
     * dependiendo del id del proceso de venta
     */
    editarvendido() {
        this.Detail = false;
        this.Index = false;
        this.Create = false;
        this.vendido = true;
        this.form.patchValue({
            btrp_PrecioVenta_Final:
                this.selectedProcesoVenta.btrp_PrecioVenta_Final,
            btrp_FechaVendida: this.selectedProcesoVenta.btrp_FechaVendida,
        });
        this.id = this.selectedProcesoVenta.btrp_Id;
    }

    /**
     * lo que realiza este metodo es poder cargar los detalle del proceso de venda que alla vendido o no
     * mostrando haci los datos correspondiente
     */
    verDetallesProcesoVenta() {
        this.Index = false;
        this.Create = false;
        this.Detail = true;

        if (this.selectedProcesoVenta) {
            this.detalle_btrp_Id = this.selectedProcesoVenta.btrp_Id;
            this.detalle_btrp_Identificador = this.selectedProcesoVenta.btrp_Identificador;
            this.detalle_btrp_PrecioVenta_Inicio = this.selectedProcesoVenta.btrp_PrecioVenta_Inicio;
            this.detalle_btrp_PrecioVenta_Final = this.selectedProcesoVenta.btrp_PrecioVenta_Final;

            this.detalle_mant_DNI = this.selectedProcesoVenta.clie_DNI;

            // Asegurar que haya un espacio en el nombre completo
            this.detalle_mant_NombreCompleto = this.formatearNombreCompleto(this.selectedProcesoVenta.clie_NombreCompleto);

            this.detalle_mant_Telefono = this.selectedProcesoVenta.clie_Telefono;

            this.detalle_btrp_FechaPuestaVenta = new Date(
                this.selectedProcesoVenta.btrp_FechaPuestaVenta
            ).toLocaleDateString();
            this.detalle_btrp_FechaVendida = this.selectedProcesoVenta.btrp_FechaVendida
                ? new Date(this.selectedProcesoVenta.btrp_FechaVendida).toLocaleDateString()
                : '';

            this.detalle_agen_NombreCompleto = this.selectedProcesoVenta.agen_NombreCompleto;
            this.detalle_btrp_Terreno_O_BienRaizId = this.selectedProcesoVenta.btrp_Terreno_O_BienRaizId;

            this.detalle_agen_codigo = this.selectedProcesoVenta.codigo;

            this.detalle_usuaCreacion = this.selectedProcesoVenta.usuaCreacion;

            if (this.selectedProcesoVenta.usuaModificacion) {
                this.detalle_usuaModificacion = this.selectedProcesoVenta.usuaModificacion;
                this.detalle_FechausuaModificacion = new Date(
                    this.selectedProcesoVenta.btrp_FechaModificacion
                ).toLocaleDateString();
            } else {
                this.detalle_usuaModificacion = '';
                this.detalle_FechausuaModificacion = '';
            }

            this.detalle_FechausuaCreacion = new Date(
                this.selectedProcesoVenta.btrp_FechaCreacion
            ).toLocaleDateString();
        } else {
            // console.error('No se ha seleccionado un proceso de venta.');
        }
    }

    formatearNombreCompleto(nombreCompleto: string): string {
        // Agregar un espacio si no existe entre el nombre y el apellido
        return nombreCompleto.replace(/([a-z])([A-Z])/g, '$1 $2');
    }



    /**
     * lo que realiza este metodo es poder cambiar el estado de En venta a Vendido
     * dependiendo el id del proceso de venta
     */
    venderProcesoVenta() {
        if (this.selectedProcesoVenta) {
            this.id = this.selectedProcesoVenta.btrp_Id;
            this.venderprocesoventa = true;
            this.Index = false;

            // No resetear el formulario aquí, ya que estamos por cargar los valores
            // this.form.reset(); // Lo comentamos para evitar interferencias

            // Llamamos al servicio para obtener los datos del cliente con el idbtrp2
            this.service.Buscarcliente(this.id).subscribe(
                (data: any) => {
                    if (data && data.length > 0) {
                        const proceso = data[0];

                        // Convertimos las fechas si es necesario
                        const fechaPuestaVenta = proceso.btrp_FechaPuestaVenta
                            ? new Date(proceso.btrp_FechaPuestaVenta)
                            : null;

                        const fechaVendida = proceso.btrp_FechaVendida
                            ? new Date(proceso.btrp_FechaVendida)
                            : null;

                        // Cargar los valores de proceso en el formulario, incluidos precio inicial y fecha de puesta en venta
                        this.form.patchValue({
                            btrp_Id: this.id,
                            btrp_PrecioVenta_Inicio: proceso.btrp_PrecioVenta_Inicio,
                            // btrp_PrecioVenta_Final: proceso.btrp_PrecioVenta_Final, // También cargamos el precio final si existe
                            btrp_FechaPuestaVenta: fechaPuestaVenta,
                            // btrp_FechaVendida: fechaVendida,
                        });
                    } else {
                        // console.error('No se recibieron datos del proceso.');
                    }
                },
                // (error) => {
                //     console.error('Error al cargar los datos del cliente:', error);
                // }
            );
        } else {
            // console.error('No se ha seleccionado un proceso de venta.');
        }
    }




    /**
     * este eliminado es un elimnado logico la cual cuando uno elimina un roceso
     * actualiza el estado referente dependiendo del identificados sea 1 o 0
     * 1 para terreno regresa el estado del terreno a 1
     * 0 para bienes raices regresa el estado del terreno a 1
     */

    eliminarProcesoVenta() {
        if (this.selectedProcesoVenta) {
            this.detalle_agen_NombreCompleto =
                this.selectedProcesoVenta.agen_NombreCompleto;
            this.detalle_btrp_Identificador =
                this.selectedProcesoVenta.btrp_Identificador;
            this.Delete = true;
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Por favor seleccione un proceso de venta para eliminar',
                life: 3000,
            });
        }
    }

    onRowSelect(product: any) {
        this.selectedProduct = product;
        if (product) {
            if ('bien_Id' in product && product.bien_Id !== null) {
                this.selectedProductsa = { id: product.bien_Id, tipo: 0 };
            } else if ('terr_Id' in product && product.terr_Id !== null) {
                this.selectedProductsa = { id: product.terr_Id, tipo: 1 };
            } else {
                this.selectedProductsa = null;
            }
        } else {
            this.selectedProductsa = null;
        }
        // console.log('selectedProductsa:', this.selectedProductsa);
    }

    Eliminar() {
        if (this.selectedProcesoVenta) {
            this.service.Eliminar(this.selectedProcesoVenta.btrp_Id).subscribe(
                (response: Respuesta) => {
                    if (response && response.success) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail:'Eliminado con Éxito.',
                            life: 3000,
                        });
                        this.cargarDatos2();
                        this.Delete = false;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail:'Eliminación fallida',
                            life: 3000,
                        });
                        this.Delete = false;
                    }
                },
                (error: any) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error en la eliminación',
                        life: 3000,
                    });
                    this.Delete = false;
                }
            );
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Por favor seleccione un proceso de venta para eliminar',
                life: 3000,
            });
            this.Delete = false;
        }
    }

    vender() {
        this.submitted = true;

        // console.log('Formulario antes de la venta:', this.form.value);

        if (this.form.valid) {
            // Verificar que los valores existan y convertir a número o fecha según corresponda
            const precioInicial = this.form.value.btrp_PrecioVenta_Inicio ? Number(this.form.value.btrp_PrecioVenta_Inicio) : null;
            const precioFinal = this.form.value.btrp_PrecioVenta_Final ? Number(this.form.value.btrp_PrecioVenta_Final) : null;
            const fechaInicial = this.form.value.btrp_FechaPuestaVenta ? new Date(this.form.value.btrp_FechaPuestaVenta) : null;
            const fechaFinal = this.form.value.btrp_FechaVendida ? new Date(this.form.value.btrp_FechaVendida) : null;

            // Validación de precios
            if (precioInicial === null || precioFinal === null) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Precio inicial o final no definidos.',
                    life: 3000
                });
                return;
            }

            if (precioFinal < precioInicial) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'El Precio de Venta Final no puede ser menor al Precio Inicial.',
                    life: 3000
                });
                return;
            }

            // Validación de fechas
            if (fechaInicial === null || fechaFinal === null) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Fechas no válidas o no definidas.',
                    life: 3000
                });
                return;
            }

            if (fechaFinal < fechaInicial) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'La Fecha de Venta Final no puede ser anterior a la Fecha de Puesta en Venta.',
                    life: 3000
                });
                return;
            }

            // Si las validaciones pasan, proceder con la creación del objeto de venta
            const venta: any = {
                btrp_Id: Number(this.form.value.btrp_Id) || Number(this.id),
                btrp_PrecioVenta_Final: precioFinal,
                btrp_FechaVendida: fechaFinal
            };

            if (this.form.value.clie_Id) {
                venta.clie_Id = String(this.form.value.clie_Id);
            }

            // console.log('Datos de venta:', venta);

            // Llamar al servicio para realizar la venta
            this.service.Vender(venta).subscribe(
                (respuestaVender: Respuesta) => {
                    if (respuestaVender.success) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Vendido con Éxito.',
                            life: 3000,
                        });
                        this.cargarDatos2();
                        this.venderprocesoventa = false;
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Advertencia',
                            detail: 'La propiedad ya cumple con el proceso de venta',
                            life: 3000,
                        });
                        this.vendido = false;
                    }
                },
                (errorVender) => {
                    // console.error('Error en Vender:', errorVender);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Campos vacíos o inválidos',
                        life: 3000,
                    });
                }
            );
        } else {
            // console.error('Formulario inválido:', this.form.controls);
        }
    }






cargarventa(idbtrp2: number) {
    this.service.Buscarcliente(idbtrp2).subscribe(
        (data: any) => {
            if (data && data.length > 0) {
                const proceso = data[0];

                const btrp_FechaVendida = proceso.btrp_FechaVendida
                ? new Date(proceso.btrp_FechaVendida)
                : null;

                const btrp_FechaPuestaVenta = proceso.btrp_FechaPuestaVenta
                ? new Date(proceso.btrp_FechaPuestaVenta)
                : null;

                this.form.patchValue({
                    btrp_Id: idbtrp2, // Almacena el idbtrp2 en el formulario
                    clie_DNI: proceso.clie_DNI,
                    clie_NombreCompleto: proceso.clie_NombreCompleto,
                    clie_Telefono: proceso.clie_Telefono,
                    btrp_PrecioVenta_Inicio: proceso.btrp_PrecioVenta_Inicio,
                    btrp_PrecioVenta_Final: proceso.btrp_PrecioVenta_Final,
                    btrp_FechaPuestaVenta: btrp_FechaPuestaVenta,
                    btrp_FechaVendida: btrp_FechaVendida,
                });

            } else {
                // console.error('No se recibieron datos del proceso');
            }
        },
        (error) => {
            // console.log('Error fetching data:', error);
        }
    );
}

verificarProcesoVenta() {
    if (this.selectedProcesoVenta && this.selectedProcesoVenta.btrp_Id) {
        this.isEditing = true;
        this.Detail = false;
        this.Index = false;
        this.submitted = false;
        this.venderprocesoventa = true;
        this.idbtrp2 = this.selectedProcesoVenta.btrp_Id;

        // Almacena el btrp_Id en el formulario
        this.form.patchValue({
            btrp_Id: this.idbtrp2
        });

        this.cargarventa(this.idbtrp2);

        this.clear();
        this.formDatosGenerales.reset();
        this.forms.reset();
        this.formImagenes.reset();
        this.formInicioVenta.reset();
        this.prueba.reset();
        this.submitted = false;
    } else {
        // console.error("El btrp_Id no está definido correctamente en el proceso seleccionado.");
    }
}

    clienteSeleccionado: Cliente | null = null;



    filterClientes(event: any) {
        const query = event.query.toLowerCase();
        this.clienteService.Listar().subscribe(
          (data: Cliente[]) => {
            this.filtradoClientes = data.filter(cliente =>
              cliente.clie_DNI?.toLowerCase().includes(query) ||
              cliente.clie_NombreCompleto?.toLowerCase().includes(query)
            ).map(cliente => ({
              ...cliente,
              display: `${cliente.clie_DNI} -- ${cliente.clie_Nombre} ${cliente.clie_Apellido}`
            }));
          },
          error => {
            // console.error('Error al filtrar clientes:', error);
          }
        );
      }

      onClienteSelect(event: any) {
        const selectedCliente = event.value;
        // console.log('Cliente seleccionado:', selectedCliente);

        if (selectedCliente && selectedCliente.clie_DNI) {
            // console.log('Buscando cliente con DNI:', selectedCliente.clie_DNI);

            this.clienteService.BuscarClientePorDNI(selectedCliente.clie_DNI).subscribe(
                (cliente: Cliente) => {
                    // console.log('Cliente encontrado:', cliente);

                    if (cliente && cliente.clie_DNI) {
                        this.clienteId = cliente.clie_Id;  // Asigna el clie_Id a la nueva variable
                        // console.log('Cliente ID asignado:', this.clienteId);

                        this.form.patchValue({
                            clie_Id: cliente.clie_Id,
                            clie_DNI: cliente.clie_DNI,
                            clie_NombreCompleto: cliente.cliente,
                            clie_Telefono: cliente.clie_Telefono,
                        });
                    } else {
                        // console.warn('Cliente no encontrado');
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Advertencia',
                            detail: 'Cliente no encontrado. Puedes crear uno nuevo con los datos ingresados.',
                            life: 3000
                        });
                    }
                },
                error => {
                    // console.error('Error en la búsqueda del cliente:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error en la búsqueda del cliente',
                        life: 3000
                    });
                }
            );
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'El cliente seleccionado no tiene un DNI válido',
                life: 3000
            });
        }
    }









    cancelarventa() {
        this.Detail = false;
        this.Index = true;
        this.propiedades = false;
        this.Create = false;
        this.submitted = false;
        this.venderprocesoventa = false;
    }

    insertarProcesoVenta(procesoVenta: ventabienraiz) {
        // console.log('Datos enviados al servidor:', procesoVenta);
        this.service.Insertar(procesoVenta).subscribe(
            (response: Respuesta) => {
                if (response.success) {
                    this.id = response.data.codeStatus;

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Insertado con Éxito.',
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: `Error en la inserción: ${response.message}`,
                    });
                }
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la inserción del proceso de venta.',
                });
            }
        );
    }

    onSiguienteClick() {
        if (this.isEditing) {
            this.actualizar2 = true;
        } else {
            this.siguienteTab();
        }
    }



    confirmarGuardar2() {
        this.actualizar2 = false;
        this.siguienteTab();
    }


    mostrarModalGuardar() {
        if (this.isEditing) {
            this.actualizar = true;

        } else {
            this.iniciarVenta();
        }
    }

    confirmarGuardar() {
        this.actualizar = false;
        this.iniciarVenta();
    }


    iniciarVenta() {
        // Limpia todo el estado antes de realizar cualquier operación
        this.clear();

        if (this.isEditing) {
            this.submitted = false;
            this.Detail = false;
            this.Index = true;
            this.propiedades = false;
            this.Create = false;
            this.cargarDatos2();

            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Actualizado con Éxito.',
            });

            // Elimina cualquier dato almacenado en el sessionStorage
            sessionStorage.removeItem('ProcesoVentaId');

            // console.log('Datos destruido:', sessionStorage);
        } else {
            this.submitted = false;
            this.Detail = false;
            this.Index = true;
            this.propiedades = false;
            this.Create = false;
            this.cargarDatos2();

            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Insertado con Éxito.',
            });

            // Elimina cualquier dato almacenado en el sessionStorage
            sessionStorage.removeItem('ProcesoVentaId');

            // console.log('Datos destruido:', sessionStorage);
        }
    }





    /**
     *
     * @returns este metodo retorna el proceso de venta pero solamente cuando el proceso no pasa
     * del primer tab lo cual existe un boton de guardar y cuampre con la misam fucionalidad
     * del 'siguientetba'
     */

    GuardarTab() {
        if (this.formDatosGenerales.value.precioInicial == '.') {
            this.formDatosGenerales.patchValue({
                precioInicial: '0'  // Establecer el ID de la ciudad en el formulario
              });
        }
                this.submitted = true;

        // Validar los datos generales
        if (this.formDatosGenerales.invalid) {
            // this.messageService.add({
            //     severity: 'error',
            //     summary: 'Error',
            //     detail: 'Por favor complete los campos requeridos.',
            // });
            return;
        }

        // Validar si se ha seleccionado un Bien Raíz o Terreno en el modo de creación
        if (
            !this.isEditing &&
            (!this.selectedProductsa ||
                typeof this.selectedProductsa.tipo === 'undefined' ||
                typeof this.selectedProductsa.id === 'undefined')
        ) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Por favor seleccione un Bien Raíz o Terreno',
            });
            return;
        }

        const fechaVentaInicial = new Date(this.formDatosGenerales.value.fechaVentaInicial);
        if (isNaN(fechaVentaInicial.getTime())) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Fecha de Venta Inicial no válida',
            });
            return;
        }

        const procesoVenta: ventabienraiz = {
            btrp_Id: this.idbtrp2 || 0,
            btrp_PrecioVenta_Inicio: this.formDatosGenerales.value.precioInicial,
            btrp_FechaPuestaVenta: fechaVentaInicial,
            agen_Id: this.formDatosGenerales.value.agen_DNI?.agen_Id || this.formDatosGenerales.value.agente,
            btrp_Terreno_O_BienRaizId: this.selectedProductsa ? this.selectedProductsa.tipo === 1 : undefined,
            btrp_BienoterrenoId: this.selectedProductsa ? this.selectedProductsa.id : undefined,
            usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
            btrp_FechaCreacion: new Date(),
            usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
            btrp_FechaModificacion: new Date(),
        };

        if (this.isEditing) {
            this.service.Actualizar(procesoVenta).subscribe(
                (response) => {
                    if (response.success) {


                        this.mostrarModalGuardar();
                        this.form2.reset();



                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al Vender el Bien Raíz',
                        });
                    }
                },
                (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'El campos son incorrectos',
                    });
                }
            );
        } else {
            this.service.Insertar(procesoVenta).subscribe(
                (response) => {
                    if (response.success) {
                        // Actualizar el ID con el ID recién insertado
                        this.idbtrp2 = response.data.codeStatus;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Insertado con Éxito.',
                        });
                        this.form2.reset();
                        if (this.activeIndex < 2) {
                            this.activeIndex++;
                        }
                        this.cargarImagenes(this.idbtrp2);
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al insertar el proceso de venta.',
                        });
                    }
                },
                (error) => {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'Seleccione o Crear un agente',
                    });
                }
            );
        }
    }


    /**
     *
     * @param event lo que realiza es el proceso de validar de bloquear los tab una vez este
     * creando un nuevo proceso de venta
     * pero se active los todos los tab cuando este en modo acctualizar
     *
     */
    handleTabChange(event: any) {
        // Índice de la pestaña seleccionada
        const selectedIndex = event.index;

        if (selectedIndex === 1 && !this.isEditing) {
            // Si intenta acceder a la pestaña de imágenes y no está en modo edición, prevenir el cambio
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe estar en modo de edición para ver las imágenes',
            });
            // Revertir el cambio de pestaña
            // Mantiene al usuario en la primera tab
            this.activeIndex = 0;
        } else {
            // Si se permite el cambio de tab, realiza las acciones necesarias
            this.activeIndex = selectedIndex;

            if (selectedIndex === 1) {
                // Si el tab seleccionada es "Imágenes Terreno/Bien Raíz", ejecuta `siguienteTab` y carga las imágenes
                this.siguienteTab();
                this.cargarImagenes(this.idbtrp2);
            }
        }
    }


    /**
     *
     * @param id es el que se toma dependiendo de la imagen correspondiente a es id
     * que en este caso seria impr_Id
     */
    cargarImagenes(id: number) {
        this.service.getImagenes(id).subscribe(
            (imagenes) => {
                this.images = imagenes.map((img: any) => `${this.service.getApiUrl()}${img.impr_Imagen}`);
                this.imageIds = imagenes.map((img: any) => img.impr_Id);
                this.updateVisibleImages();
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar las imágenes del proceso de venta.',
                });
            }
        );
    }



    /**
     * este metodo hace posible visalizar las imagenes cargadas al sistema
     */
    updateVisibleImages(): void {
        this.visibleImages = this.images.slice(this.startIndex, this.startIndex + this.visibleCount);
        // console.log('Imágenes visibles:', this.visibleImages);
    }


    /**
     * este metodo ciera el proceso de venta cuando se esta insertando o actualizando
     */
    CerrarProcesoVenta() {
        this.Detail = false;
        this.Index = true;
        this.propiedades = false;
        this.Create = false;
        this.submitted = false;
        this.cargarDatos2();
    }

    /**
     * este metodo cierra el modal de propiedades que esta en el HTML
     */
    CerrarPropiedades() {
        this.Detail = false;
        this.Index = false;
        // this.propiedades = false;
        this.Create = true;

        // console.log('Cerrando propiedades modal...');
        this.propiedades = false;
        // Reiniciar el producto seleccionado al cerrar
        this.selectedProduct = null;
        setTimeout(() => {
            // Limpiar la lista de productos
            this.productosFiltrados = [];
            // Reiniciar el estado de carga
            this.loading = false;
            // console.log('Estado después de cerrar el modal:', {
            //     propiedades: this.propiedades,
            //     selectedProduct: this.selectedProduct,
            //     productosFiltrados: this.productosFiltrados,
            //     loading: this.loading,
            // });
        }, 0);
    }

    /**
     * cierra el collapse de detalle de proceso de venta
     */
    CerrarPais() {
        this.Detail = false;
        this.Index = true;
    }


    /**
     *
     * @param procesoVenta una vez finaliza el proceso de venta ya se el Bien Raíz o terreno
     * actualiza los botones de acciones
     */
    selectProcesoVenta(procesoVenta: any) {
        // console.log('ProcesoVenta seleccionado:', procesoVenta);

        const tipo = procesoVenta.btrp_Terreno_O_BienRaizId ? 1 : 0;
        const id = procesoVenta.btrp_BienoterrenoId;

        // console.log('Tipo:', tipo);
        // console.log('ID:', id);

        this.selectedProcesoVenta = procesoVenta;

        // Aquí almacenamos el `btrp_Id` en el formulario
        if (this.selectedProcesoVenta && this.selectedProcesoVenta.btrp_Id) {
            this.form.patchValue({
                btrp_Id: this.selectedProcesoVenta.btrp_Id
            });
            // console.log("btrp_Id almacenado en el formulario:", this.selectedProcesoVenta.btrp_Id);
        // } else {
        //     console.error("El btrp_Id no está definido correctamente en el proceso seleccionado.");
        }

        if (procesoVenta.btrp_Identificador) {
            this.itemsVenta = [
                {
                    label: 'Vender',
                    icon: 'pi pi-bookmark',
                    command: () => this.venderProcesoVenta(),
                },
                {
                    label: 'Editar',
                    icon: 'pi pi-user-edit',
                    command: () => this.editarProcesoVenta(),
                },
                {
                    label: 'Detalle',
                    icon: 'pi pi-eye',
                    command: () => this.verDetallesProcesoVenta(),
                },
                {
                    label: 'Eliminar',
                    icon: 'pi pi-trash',
                    command: () => this.eliminarProcesoVenta(),
                },
            ];
        } else {
            this.itemsVendido = [
                {
                    label: 'Actualizar Datos',
                    icon: 'pi pi-check',
                    command: () => this.verificarProcesoVenta(),
                },
                {
                    label: 'Detalle',
                    icon: 'pi pi-eye',
                    command: () => this.verDetallesProcesoVenta(),
                },
                {
                    label: 'Descargar',
                    icon: 'pi pi-download',
                    command: () => {
                        if (tipo !== undefined && id !== undefined) {
                            this.descargarDocumento(tipo, id);
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'No se puede descargar. Tipo e ID no válidos.',
                            });
                        }
                    },
                },
            ];
        }
    }


    /**
     * Este evento toma el archivo que selecciona del ordenado y la guarda en el cotenedor de imagenes
     * que esta en el segundo tab y realiza el proceso de guardado tomando haci la URL que almacena en la API
     * @param event
     */
    onFileSelected(event: any): void {
        const files: FileList = event.target.files;
        if (files.length) {
            Array.from(files).forEach((file) => {
                if (file.name.length > 260) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'El nombre del archivo excede el límite de 260 caracteres.',
                        life: 3000,
                    });
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e: any) => {
                    const imageUrl = e.target.result;
                    // console.log("Imagen cargada: ", imageUrl); // Verifica la URL de la imagen
                    this.images.push(imageUrl);
                    this.formImagenes.get('impr_Imagen').setValue(imageUrl);

                    // Actualiza las imágenes visibles
                    this.updateVisibleImages();
                };
                reader.readAsDataURL(file);
            });
        }
    }


    files: File[] = [];

    /**
     *
     * @param event --se encarga de guarda la imagen si subir todavia o almacenar la url en la base de datos
     * y subir la imagen a la API
     */

    onFilesSelected(event: any): void {

        const files: FileList = event.target.files;
        if (files.length) {
            const filePromises = Array.from(files).map((file) => {
                return new Promise<string>((resolve, reject) => {
                    if (!file.type.startsWith('image/')) {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Advertencia',
                            detail: 'Solo se permiten archivos de imagen.',
                            life: 3000,
                        });
                        return;
                    }
                    if (file.name.length > 260) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'El nombre del archivo excede el límite de 260 caracteres.',
                            life: 3000,
                        });
                        return;
                    }

                    this.files.push(file);

                    const reader = new FileReader();
                    reader.onload = (e: any) => {
                        const imageUrl = e.target.result;
                        this.images.push(imageUrl);
                        resolve(imageUrl);
                    };
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(filePromises)
                .then(() => this.updateVisibleImages())
                .catch((error) => {
                    // console.error('Error al leer archivos:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al leer archivos',
                        life: 3000,
                    });
                });
        }
    }


    // updateVisibleImages(): void {
    //     console.log('Actualizando imágenes visibles...', {
    //         startIndex: this.startIndex,
    //         visibleCount: this.visibleCount,
    //         totalImages: this.images.length,
    //     });
    //     this.visibleImages = this.images.slice(
    //         this.startIndex,
    //         this.startIndex + this.visibleCount
    //     );
    //     console.log('Imágenes visibles:', this.visibleImages);
    // }

    /**
     * realiza el carga de archivos es una funcionalida que levanta una ventana del ordenados para poder
     * seleccionar la imagena a subir
     */
    triggerFileInput(): void {
        const fileInput = document.getElementById(
            'fileInput'
        ) as HTMLInputElement;
        fileInput.click();
    }

    /**
     * genera el guardar las imagenes tomando siempre el id del proceso de venta que este caso seriaidbtrp2
     * @returns --- esto se enviea en un areglo la cual guarda X cantidades de imagenes
     */

    GuardarImagenes(): void {
        const procesoVentaId = this.idbtrp2;
        let successMessageShown = false; // Variable de control para mostrar el mensaje una sola vez

        if (procesoVentaId === 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'El ID del proceso de venta no está asignado',
                life: 3000,
            });
            return;
        }

        if (this.files.length > 0) {
            this.files.forEach((file) => {
                const imageUrl = `/uploads/${file.name}`;

                // Verifica si la imagen ya existe en el servidor comparando solo el nombre del archivo
                const imageAlreadyExists = this.images.some(image =>
                    image.split('/').pop() === file.name
                );

                if (this.isEditing && imageAlreadyExists) {
                    // console.log(`La imagen ${file.name} ya existe y no será insertada nuevamente.`);
                    return; // No insertes la imagen de nuevo si ya existe y estás en modo edición
                }

                this.service.SubirImagen(file).subscribe(
                    (respuesta) => {
                        if (respuesta.message === 'Éxito' || respuesta.success) {
                            const imageModel: ImagenViewModel = {
                                btrp_Id: procesoVentaId,
                                impr_Imagen: imageUrl,
                                usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
                            };

                            this.service.InsertarImagenes([imageModel]).subscribe(
                                (respuesta) => {
                                    if (respuesta.success) {
                                        if (!successMessageShown) { // Verifica si ya se mostró el mensaje
                                            this.messageService.add({
                                                severity: 'success',
                                                summary: 'Éxito',
                                                detail: 'Imágenes insertadas con Éxito.',
                                                life: 3000,
                                            });
                                            successMessageShown = true; // Marca el mensaje como mostrado
                                        }
                                        this.cargarImagenes(procesoVentaId);
                                    } else {
                                        this.messageService.add({
                                            severity: 'error',
                                            summary: 'Error',
                                            detail: 'Inserción de imagen fallida: ' + respuesta.message,
                                            life: 3000,
                                        });
                                    }

                                },
                                (error) => {
                                    this.messageService.add({
                                        severity: 'error',
                                        summary: 'Error',
                                        detail: 'Error en la inserción de la imagen.',
                                        life: 3000,
                                    });
                                }
                            );
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Subida de imagen fallida: ' + (respuesta.detail || 'Respuesta inesperada'),
                                life: 3000,
                            });
                        }
                    },
                    (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error en la subida de la imagen.',
                            life: 3000,
                        });
                    }
                );
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Debe seleccionar al menos una imagen.',
                life: 3000,
            });
        }
    }




    /**
     * Este metodo lo que reliaza es poder limpiar las imagenes una vez este en proceso de crear
     * pero cuando entra al momento de actualizar cumple dos funciones que seria Limpiar y eliminar
     * la imagen ya guardad o solamente limpiarla
     */
    limpiar(): void {
        // Si estamos en modo de edición
        if (this.isEditing) {
            // Verifica si hay una imagen seleccionada y si hay imágenes en la lista
            if (this.selectedImageIndex !== null && this.images.length > 0) {
                // Obtén el ID de la imagen guardada
                const imageId = this.imageIds[this.startIndex + this.selectedImageIndex];

                // Verifica si el ID de la imagen es válido (esto significa que ha sido guardada)
                if (imageId) {
                    // Intenta eliminar la imagen del servidor
                    this.service.EliminarImagen(imageId).subscribe(
                        (response) => {
                            if (response.success) {
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Éxito',
                                    detail: 'Eliminado con Éxito.',
                                });
                                // Elimina la imagen de las listas locales
                                this.images.splice(this.startIndex + this.selectedImageIndex, 1);
                                this.imageIds.splice(this.startIndex + this.selectedImageIndex, 1);
                                this.selectedImage = null;
                                this.selectedImageIndex = null;
                                this.updateVisibleImages();
                            } else {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Error',
                                    detail: response.message,
                                });
                            }
                        },
                        (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: `Error al eliminar la imagen: ${error.message}`,
                            });
                        }
                    );
                } else {
                    // Si la imagen no ha sido guardada (no tiene un ID), solo elimínala de la lista local
                    this.images.splice(this.startIndex + this.selectedImageIndex, 1);
                    this.files.splice(this.startIndex + this.selectedImageIndex, 1);
                    this.selectedImage = null;
                    this.selectedImageIndex = null;
                    this.updateVisibleImages();
                }
            }
        } else {
            // Si no estamos en modo de edición, solo limpia las imágenes no guardadas
            if (this.selectedImageIndex !== null && this.images.length > 0) {
                this.images.splice(this.startIndex + this.selectedImageIndex, 1);
                this.files.splice(this.startIndex + this.selectedImageIndex, 1);
                this.selectedImage = null;
                this.selectedImageIndex = null;
                this.updateVisibleImages();
            } else if (this.images.length > 0) {
                this.images.shift();
                this.files.shift();
                this.updateVisibleImages();
            }
        }
    }

    //el metodo que realiza es delizar hacia arriba
    scrollUp(): void {
        if (this.startIndex > 0) {
            this.startIndex = Math.max(this.startIndex - this.visibleCount, 0);
            this.updateVisibleImages();
        }
    }

    //el metodo que realiza es delizar hacia abajo
    scrollDown(): void {
        if (this.startIndex < this.images.length - this.visibleCount) {
            this.startIndex = Math.min(
                this.startIndex + this.visibleCount,
                this.images.length - this.visibleCount
            );
            this.updateVisibleImages();
        }
    }

    // este metodo cumple la funcion de poder selecionar una imagen que esta en el carrucel y pode
    // apreciarla en una vista previa dentro de la galeria que esta en el HTML
    onImageSelect(index: number): void {
        this.selectedImageIndex = index;
        this.selectedImage = this.visibleImages[index];
    }




    /**
     * este metodo es el encargado de cargar los bienes raices y terreno
     * cuenta con un spinner la cual se muestra primero antes de carguar los bienes raices y terreno
     * que esta en el modal dee propiedades
     */

    cargarDatos(): void {
        this.loading = true;  // Activar el spinner de carga
        this.propiedades = false;  // Ocultar el diálogo mientras los datos se cargan

        forkJoin({
            bienesRaices: this.service.ListarBienesRaices(),
            terrenos: this.service.ListarTerrenos()
        }).subscribe({
            next: (result) => {
                this.productosFiltrados = [...result.bienesRaices, ...result.terrenos];
                // console.log('Datos cargados:', this.productosFiltrados);
            },
            error: (error) => {
                console.error('Error cargando datos', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Hubo un problema al cargar los datos. Por favor, inténtelo de nuevo más tarde.',
                });
            },
            complete: () => {
                this.loading = false;  // Desactivar el spinner de carga cuando todas las solicitudes terminen
                this.propiedades = true;  // Mostrar el diálogo cuando los datos se hayan cargado
            }
        });
    }


    isLoading = false;

    /**
     * este metodo es el encargado de cargar la tabla en el index
     * pero biene con un spinner la cual se muestra antes y despues que
     * cargue la tabla se desaparece el spinner
     */
    cargarDatos2() {
        this.isLoading = true;
        // console.log('Cargando datos...');

        this.service.Listar().subscribe(
            (data: any[]) => {
                this.ventabienraiz = data;
                this.filtrarProductos();

                this.proceso = data.map((proceso) => ({
                    ...proceso,
                    btrp_FechaCreacion: new Date(
                        proceso.btrp_FechaCreacion
                    ).toLocaleDateString(),
                    btrp_FechaModificacion: new Date(
                        proceso.btrp_FechaModificacion
                    ).toLocaleDateString(),
                }));
                // console.log('Datos cargados:', this.ventabienraiz);
                this.isLoading = false;
                this.Index = true;


            },
            (error) => {
                console.error('Error cargando datos', error);
                this.isLoading = false;
            }
        );
    }


      //Esta funcion hace que el cuadro de texto(Input) solo acepte letras lo cual va a negar si intenta ingresar algun numero
  validarTexto(event: KeyboardEvent) {
    const texto = (event.target as HTMLInputElement).value;
    const cursorPosition = (event.target as HTMLInputElement).selectionStart;
    if (!/^[a-zñA-ZÑ\s]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.keyCode !== 13 ) {
        event.preventDefault();
    } else if (event.key === ' ' && (texto.trim() === '' || cursorPosition === 0)) {
        event.preventDefault();
    }
    // //aqui lo que le doy a entender que si hace algun funcion tipo Enter o tab va a llamar a la funcion de guardar
    // if (event.keyCode === 13 ) {
    //   this.GuardarDocumento();
    // }
  }

    //este metodo es el encargado de validar input que solo acepte numeros
    //la cual se aplica un evento en el input correspondiente con el evento  (keydown)
    ValidarNumeros(event: KeyboardEvent) {
        const input = event.target as HTMLInputElement;
        const texto = input.value;
        const isValidKey =
            /^\d$/.test(event.key) ||
            event.key === 'Backspace' ||
            event.key === 'Tab' ||
            event.key === 'ArrowLeft' ||
            event.key === 'ArrowRight' ||
            event.key === '.' ||
            event.key === ',';
        if (!isValidKey) {
            event.preventDefault();
            return;
        }
        if (
            event.key === ' ' &&
            (texto.trim() === '' || texto.trim().length === input.selectionEnd)
        ) {
            event.preventDefault();
            return;
        }
        setTimeout(() => {
            const newTexto = input.value;
            const isOnlyZeros = /^0+$/.test(newTexto);
            if (isOnlyZeros) {
                input.value = '';
                event.preventDefault();
            }
        }, 0);
    }



    //este metodo es el encargado de validar input que solo acepte numeros
    //la cual se aplica un evento en el input correspondiente con el evento  (keydown). pero con la diferencia que
    //hay un rango de numero que seria 8 numeros como maximo
    ValidarNumeros2(event: KeyboardEvent) {
        const inputElement = event.target as HTMLInputElement;
        const key = event.key;
        if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
          event.preventDefault();
        }
        if (key === ' ' && inputElement.selectionStart === 0) {
          event.preventDefault();
        }
        if (inputElement.value.length >= 8 && key !== 'Backspace' && key !== 'Tab') {
          event.preventDefault();
        }
      }

      soloNumerosEnterosKeypress($event: any) {
        const regex = /^\d+$/;
        const input = $event.target.value + $event.key;
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        if (!regex.test(input)) {
            $event.preventDefault();
        }
    }

    soloNumerosKeypress($event: any) {
        const regex = /^\d*\.?\d*$/;
        const input = $event.target.value + $event.key;
        if (!regex.test(input)) {
            $event.preventDefault();
        }
    }

    soloLetrasKeypress($event: any) {
        const regex = /^[a-zA-Z\s]+$/;
        const input = $event.target.value + $event.key;
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        if (!regex.test(input)) {
            $event.preventDefault();
        }
    }

    /**
     *
     * @param event  este evento reliza la divicion de nummero con un marge de 3 numero y se aplica una coma
     * pero este metodo no se esta utilizando porque me cuenta las comas al momento de guradar el proceso
     */
    formatearNumero(event: Event) {
        const input = event.target as HTMLInputElement;
        let valor = input.value;
        valor = valor.replace(/,/g, '');
        const partes = valor.split('.');
        partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        input.value = partes.join('.');
    }


    //este metodo es el encargado de limpiar lagaleria de imagenes que esta en el segundo tab
    //cuando entra en proceso de editar el proceso de venta
    clear() {
        // Limpiar las imágenes visibles
        this.visibleImages = [];
        this.selectedImage = null;
        this.selectedImageIndex = null;

        // Limpiar los arrays de imágenes y archivos
        this.images = [];
        this.files = [];

        // Limpiar la lista de documentos
        this.documents = [];
    }




    /// es la parte del cliente
    notFound: boolean = false;
    notFound1: boolean = false;
    notFound2: boolean = false;

    filterPais(event: any) {
        const query = event.query.toLowerCase();
        this.paisfill = this.paises
        .filter(pais =>pais.pais_Nombre.toLowerCase().includes(query))
        .sort((a,b)=>a.pais_Nombre.localeCompare(b.pais_Nombre));
      
        this.notFound = this.paisfill.length === 0;
      }

      // Filtrar Estados
      filterEstado(event: any) {
        const query = event.query.toLowerCase();
        this.estadofill = this.estados
        .filter(estado => estado.esta_Nombre.toLowerCase().includes(query))
        .sort((a,b)=>a.esta_Nombre.localeCompare(b.esta_Nombre));
      
        this.notFound1 = this.estadofill.length === 0;
      
      }

      // Filtrar Ciudades
      filterCiudad(event: any) {
        const query = event.query.toLowerCase();
        this.ciudadfill = this.ciudades
        .filter(ciudad =>ciudad.ciud_Descripcion.toLowerCase().includes(query))
        .sort((a,b)=>a.ciud_Descripcion.localeCompare(b.ciud_Descripcion));
      
        this.notFound2 = this.ciudadfill.length === 0;
      
      }


      onCitySelect(event: any) {
        const ciudadSeleccionada = event.value;  // El objeto seleccionado completo de la ciudad
        const ciudadId = ciudadSeleccionada?.ciud_Id;  // Extraer el ID de la ciudad seleccionada

        if (ciudadId) {
          this.formCliente.patchValue({
            ciud_Id: ciudadId  // Establecer el ID de la ciudad en el formulario
          });
        }
      }




    Createcliente = false;
    estadofill: Estado[] = [];
    ciudadfill: ciudad[] = [];
    paisfill: Pais[] = [];


    CrearCliente() { //Activa el collapse de Editar/Guardar
        this.venderprocesoventa = false;
        this.Detail = false;
        this.Index = false;
        this.Createcliente = true;
        this.formCliente.reset();
        this.submitted = false;
        this.identity = "crear";
        this.titulo = "Nuevo";

        this.formCliente = this.fb.group({
            clie_Id: [null],
            clie_DNI: ['', Validators.required],
            clie_Nombre: ['', Validators.required],
            clie_Apellido: ['', Validators.required],
            clie_CorreoElectronico: ['', [Validators.required, Validators.email]],
            clie_Telefono: ['', Validators.required],
            esta_Nombre: ['', Validators.required],
            pais_Nombre: ['', Validators.required],
            ciud_Descripcion: ['', Validators.required],
            esta_Id: [''], // Cambiado a 'esta_Id'
            pais_Id: [''],
            clie_FechaNacimiento: ['', Validators.required],
            clie_Sexo: ['M', Validators.required],
            clie_DireccionExacta: ['', Validators.required],
            ciud_Id: [''],
            civi_Id: ['', Validators.required],
            clie_Tipo: ['B', Validators.required]  // Valor predeterminado
        });

      }

      //Detalles
  detalle_clie_Id: number;
  detalle_clie_DNI: string = "";
  detalle_clie_Nombre: string = "";
  detalle_clie_Apellido: string = "";
  detalle_clie_CorreoElectronico: string = "";
  detalle_clie_Telefono: string = "";
  detalle_clie_FechaNacimiento: string = "";
  detalle_clie_Sexo: string = "";
  detalle_clie_Tipo: string = "";

  detalle_clie_DireccionExacta: string = "";
  detalle_ciud_Descripcion: string = "";
  detalle_usua_Creacion: string = "";
  detalle_usua_Modificacion: string = "";
  detalle_clie_FechaCreacion: string = "";
  detalle_clie_FechaModificacion: string = "";
  detalle_civi_Descripcion: string = "";
  selectedClienteNombre: string = "";


    async loadCountries() {
        try {
          const data = await this.paisService.Listar().toPromise(); // Convert Observable to Promise
          this.paises = data; // Assign the result directly to paises
        } catch (error) {
        //   console.error('Error fetching countries:', error);
        }
      }

      async onCountryChange(event: any) {
        const paisSeleccionado = event.value;
        const paisId = paisSeleccionado?.pais_Id;

        if (paisId) {
          try {
            const data = await this.estadoService.DropDownEstadosByCountry2(paisId); // Espera la promesa
            this.estados = data; // Asigna los estados a la variable
            this.form.get('esta_Id')?.setValue(null); // Restablece el valor del dropdown de estados
            this.ciudades = []; // Resetea las ciudades
          } catch (error) {
            // console.error('Error fetching states:', error); // Maneja los errores
          }
        }
      }

      async onStateChange(event: any) {
        const estadoSeleccionado = event.value;  // El objeto seleccionado completo
        const estadoId = estadoSeleccionado?.esta_Id;  // Extraer el ID del estado seleccionado

        if (estadoId) {
          try {
            const data = await this.ciudadService.DropDownByState2(estadoId);

            // Verificar si los datos son un array antes de asignar
            if (Array.isArray(data)) {
              this.ciudades = data; // Asignar las ciudades obtenidas
            } else {
              this.ciudades = []; // Si no es un array, inicializar vacío
            //   console.error('Error: las ciudades no se cargaron correctamente:', data);
            }

            this.form.get('ciud_Id')?.setValue(null); // Restablecer el valor del dropdown de ciudades
          } catch (error) {
            // console.error('Error fetching cities:', error); // Manejar el error
            this.ciudades = []; // Vaciar el array si hay un error
          }
        } else {
          this.ciudades = []; // Si no hay estado seleccionado, limpiar las ciudades
        }
      }

    //   onGlobalFilter(table: Table, event: Event) {
    //     table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    //   }

    //   selectCliente(cliente: Cliente) { //Carga el cliente seleccionado
    //     this.selectedCliente = cliente;
    //   }


    async loadPaisesEstadosYCiudades() {
        // Cargar los países
        this.paisService.Listar().subscribe(
          async (data: any) => {
            this.paises = data.data;
            if (this.selectedCliente && this.selectedCliente.pais_Id) {
              const selectedPais = this.paises.find(pais => pais.pais_Id === this.selectedCliente.pais_Id);
              if (selectedPais) {
                try {
                  const estadosData = await this.estadoService.DropDownEstadosByCountry2(selectedPais.pais_Id);
                  this.estados = estadosData;
                //   console.log(estadosData)
                  if (this.selectedCliente.esta_Id) {
                    const selectedEstado = this.estados.find(estado => estado.esta_Id === this.selectedCliente.esta_Id);
                    if (selectedEstado) {
                      try {
                        const ciudadesData = await this.ciudadService.DropDownByState2(selectedEstado.esta_Id);
                        this.ciudades = ciudadesData;
                    //   console.log(ciudadesData)
                      } catch (error) {
                        // console.error('Error fetching ciudades:', error);
                      }
                    }
                  }
                } catch (error) {
                //   console.error('Error fetching estados:', error);
                }
              }
            }
          },
          error => {
            // console.error('Error fetching paises:', error);
          }
        );
      }



    //   ValidarDNI(event: KeyboardEvent) { //Solo permite ingresar numeros
    //     const inputElement = event.target as HTMLInputElement;
    //     const key = event.key;

    //     if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
    //         event.preventDefault();
    //     }
    //     if (key === ' ' && inputElement.selectionStart === 0) {
    //       event.preventDefault();
    //     }
    //     if (inputElement.value.length >= 13 && key !== 'Backspace' && key !== 'Tab') {
    //       event.preventDefault();
    //     }
    //  }

     ValidarTexto(event: KeyboardEvent) { //Solo permite ingresar letras
      const inputElement = event.target as HTMLInputElement;
      const key = event.key;
      if (!/^[a-zA-Z\s]+$/.test(key) && key !== 'Backspace' && key !== 'Tab') {
        event.preventDefault();
      }
      if (key === ' ' && inputElement.selectionStart === 0) {
        event.preventDefault();
      }
    }
    ValidarTextoONumeros(event: KeyboardEvent, tipo: 'texto' | 'numeros') {
      const inputElement = event.target as HTMLInputElement;
      const key = event.key;

      if (tipo === 'texto') {
        if (!/^[a-zA-Z\s]+$/.test(key) && key !== 'Backspace' && key !== 'Tab') {
          event.preventDefault();
        }
        if (key === ' ' && inputElement.selectionStart === 0) {
          event.preventDefault();
        }
      } else if (tipo === 'numeros') {
        if (!/^[0-9]+$/.test(key) && key !== 'Backspace' && key !== 'Tab') {
          event.preventDefault();
        }
      }
    }

    // ValidarNumeros(event: KeyboardEvent) {
    //   const inputElement = event.target as HTMLInputElement;
    //   const key = event.key;
    //   if (!/^[0-9]+$/.test(key) && key !== 'Backspace' && key !== 'Tab') {
    //     event.preventDefault();
    //   }
    // }


     ValidarEmail(event: KeyboardEvent) {
      const inputElement = event.target as HTMLInputElement;
      const key = event.key;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (key === 'Backspace' || key === 'Tab') {
          return;
      }
      if (/^[a-zA-Z0-9._%+-@]$/.test(key)) {
          const newValue = inputElement.value + key;
          if (emailRegex.test(newValue)) {
              return;
          }
      }
      event.preventDefault();
    }

    telefonoKeypress($event) {
        const regex = /^[+0-9\s\-()]*$/;
        const input = $event.target.value + $event.key;
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        if (!regex.test(input)) {
            $event.preventDefault();
        }
    }


    clienteId: number | null = null; // Aquí almacenaremos el clie_Id

    // Método Guardarcliente con consola añadida
    Guardarcliente() {
        this.submitted = true;

        if (this.formCliente.valid) {
            const datos: any = {
                clie_Id: this.clienteId || undefined,  // Solo asigna si tiene un valor numérico válido
                clie_DNI: this.formCliente.value.clie_DNI,
                clie_Nombre: this.formCliente.value.clie_Nombre,
                clie_Apellido: this.formCliente.value.clie_Apellido,
                clie_CorreoElectronico: this.formCliente.value.clie_CorreoElectronico,
                clie_Telefono: this.formCliente.value.clie_Telefono,
                clie_FechaNacimiento: new Date(this.formCliente.value.clie_FechaNacimiento),
                clie_Sexo: this.formCliente.value.clie_Sexo,
                clie_DireccionExacta: this.formCliente.value.clie_DireccionExacta,
                ciud_Id: this.formCliente.value.ciud_Id,
                civi_Id: this.formCliente.value.civi_Id,
                clie_Tipo: this.formCliente.value.clie_Tipo,
                usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
                usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
            };


            if (this.identity === 'crear') {
                this.clienteService.Insertar(datos).subscribe(
                    (response: Respuesta) => {
                        if (response.success) {
                            // Después de crear, buscar el cliente por su DNI
                            this.clienteService.BuscarClientePorDNI(datos.clie_DNI).subscribe(
                                (cliente: Cliente) => {
                                    if (cliente && cliente.clie_DNI) {
                                        // Simula la selección del cliente llamando a onClienteSelect
                                        this.onClienteSelect({ value: cliente });

                                        this.messageService.add({
                                            severity: 'success',
                                            summary: 'Éxito',
                                            detail: 'Cliente creado y datos completados.',
                                        });
                                        this.CerrarCliente();
                                    } else {
                                        this.messageService.add({
                                            severity: 'error',
                                            summary: 'Error',
                                            detail: 'Cliente no encontrado después de la creación.',
                                        });
                                    }
                                },
                                (error) => {
                                    this.messageService.add({
                                        severity: 'error',
                                        summary: 'Error',
                                        detail: 'Error al buscar el cliente recién creado.',
                                    });
                                }
                            );
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Error al crear el cliente',
                            });
                        }
                    },
                    (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error en el servidor al crear el cliente',
                        });
                    }
                );
            } else if (this.identity === 'editar') {
                datos.clie_Id = this.clienteId;
                this.clienteService.Actualizar(datos).subscribe(
                    (response: Respuesta) => {
                        if (response.success) {
                            // Simula la selección del cliente llamando a onClienteSelect
                            this.onClienteSelect({ value: datos });

                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: 'Cliente actualizado y datos completados.',
                            });
                            this.CerrarCliente();
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Error al actualizar el cliente',
                            });
                        }
                    },
                    (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error en el servidor al actualizar el cliente',
                        });
                    }
                );
            }
        }
    }







    CerrarCliente() {
        this.Createcliente = false;
        this.formCliente.reset();
        this.submitted = false;
        this.venderprocesoventa = true; // Volver al formulario de venta
    }







}





//     guardarClienteSiEsNuevo() {
//         if (!this.clienteSeleccionado && this.form.valid) {
//             const nuevoCliente: Mantenimiento = {
//                 mant_Id: this.form.value.mant_Id,
//                 mant_DNI: this.form.value.mant_DNI,
//                 mant_NombreCompleto: this.form.value.mant_NombreCompleto,
//                 mant_Telefono: this.form.value.mant_Telefono,
//                 usua_Creacion: 3,  // ID del usuario que está creando el cliente
//                 mant_FechaCreacion: new Date(),  // Fecha de creación
//             };

//             this.service.InsertarClienteprocesoventa(nuevoCliente).subscribe(
//                 (respuesta: Respuesta) => {
//                     if (respuesta.success) {
//                         const clienteId = respuesta.data.codeStatus;  // Captura el mant_Id del nuevo cliente
//                         this.form.patchValue({ mant_Id: clienteId });  // Almacena el mant_Id en el formulario
//                         this.clienteSeleccionado = nuevoCliente;  // Actualiza cliente seleccionado
//                         this.clienteSeleccionado.mant_Id = clienteId;
//                         this.messageService.add({
//                             severity: 'success',
//                             summary: 'Éxito',
//                             detail: 'Cliente creado con éxito',
//                             life: 3000,
//                         });
//                     } else {
//                         this.messageService.add({
//                             severity: 'error',
//                             summary: 'Error',
//                             detail: 'No se pudo crear el cliente',
//                             life: 3000,
//                         });
//                     }

//                 },
//                 (error) => {
//                     this.messageService.add({
//                         severity: 'error',
//                         summary: 'Error',
//                         detail: 'Error al crear el cliente',
//                         life: 3000,
//                     });
//                 }
//             );
//         }
//         console.log('Datos', this.clienteSeleccionado)
//     }

//     realizarVenta(mant_Id: number) {
//         const venta: ventabienraiz = {
//             btrp_Id: this.form.value.btrp_Id,
//             btrp_PrecioVenta_Final: this.form.value.btrp_PrecioVenta_Final,
//             btrp_FechaVendida: this.form.value.btrp_FechaVendida,
//             mant_Id: mant_Id,  // Asegúrate de que este ID se incluya en la venta
//         };

//         this.service.Vender(venta).subscribe(
//             (respuestaVender: Respuesta) => {
//                 if (respuestaVender.success) {
//                     this.messageService.add({
//                         severity: 'success',
//                         summary: 'Éxito',
//                         detail: 'Vendido con Éxito',
//                         life: 3000,
//                     });
//                     this.cargarDatos2();
//                     this.venderprocesoventa = false;
//                 } else {
//                     this.messageService.add({
//                         severity: 'error',
//                         summary: 'Error',
//                         detail: 'Venta fallida',
//                         life: 3000,
//                     });
//                 }
//             },
//             (errorVender) => {
//                 this.messageService.add({
//                     severity: 'error',
//                     summary: 'Error',
//                     detail: 'Error en la venta',
//                     life: 3000,
//                 });
//             }
//         );
//     }


//     mostrarModalCrearCliente: boolean = false;
// nuevoCliente: Mantenimiento = {};  // Para almacenar los datos del nuevo cliente

// abrirModalCrearCliente() {
//     this.mostrarModalCrearCliente = true;
//     this.nuevoCliente = {};  // Resetea los datos del nuevo cliente
// }

// cerrarModalCrearCliente() {
//     this.mostrarModalCrearCliente = false;
// }

// guardarClienteDesdeModal() {
//     if (this.nuevoCliente.mant_DNI && this.nuevoCliente.mant_NombreCompleto && this.nuevoCliente.mant_Telefono) {
//         const clienteParaGuardar: Mantenimiento = {
//             ...this.nuevoCliente,
//             usua_Creacion: 3,  // ID del usuario que está creando el cliente
//             mant_FechaCreacion: new Date(),  // Fecha de creación
//         };

//         this.service.InsertarClienteprocesoventa(clienteParaGuardar).subscribe(
//             (respuesta: Respuesta) => {
//                 if (respuesta.success) {
//                     const clienteId = respuesta.data.codeStatus;  // Captura el mant_Id del nuevo cliente
//                     this.form.patchValue({
//                         mant_Id: clienteId,
//                         mant_DNI: this.nuevoCliente.mant_DNI,
//                         mant_NombreCompleto: this.nuevoCliente.mant_NombreCompleto,
//                         mant_Telefono: this.nuevoCliente.mant_Telefono
//                     });

//                     // Actualiza el cliente seleccionado
//                     this.clienteSeleccionado = { ...this.nuevoCliente, mant_Id: clienteId };

//                     // Mostrar mensaje de éxito
//                     this.messageService.add({
//                         severity: 'success',
//                         summary: 'Éxito',
//                         detail: 'Cliente creado con éxito',
//                         life: 3000,
//                     });

//                     // Cierra el modal
//                     this.cerrarModalCrearCliente();
//                 } else {
//                     // Mostrar mensaje de error si no se pudo crear el cliente
//                     this.messageService.add({
//                         severity: 'error',
//                         summary: 'Error',
//                         detail: 'No se pudo crear el cliente',
//                         life: 3000,
//                     });
//                 }
//             },
//             (error) => {
//                 // Mostrar mensaje de error si hay un error en la llamada al servicio
//                 this.messageService.add({
//                     severity: 'error',
//                     summary: 'Error',
//                     detail: 'Error al crear el cliente',
//                     life: 3000,
//                 });
//             }
//         );
//     } else {
//         // Mostrar mensaje de error si no se completaron todos los campos
//         // this.messageService.add({
//         //     severity: 'error',
//         //     summary: 'Error',
//         //     detail: 'Debe completar todos los campos del cliente',
//         //     life: 3000,
//         // });
//     }
// }






