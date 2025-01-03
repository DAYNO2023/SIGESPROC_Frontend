import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { TerrenoService } from 'src/app/demo/services/servicesbienraiz/terreno.service';
import { DocumentoBienRaizService } from 'src/app/demo/services/servicesbienraiz/documentoBienRaiz.service';
import { Terreno,ddldoc,TablaMaestra,ddlproyecto } from 'src/app/demo/models/modelsbienraiz/terrenoviewmodel';
import { FileUpload } from 'primeng/fileupload';
import * as mapboxgl from 'mapbox-gl'
import { ApiMapaService } from 'src/app/demo/services/servicesgeneral/apiMapa.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {environment} from '../../../../../environment/environment';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Tree } from 'primeng/tree';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { GoogleMap } from '@angular/google-maps';
import { CookieService } from 'ngx-cookie-service';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'app-bienes-raices',
  templateUrl: './terreno.component.html',
  styleUrls: ['./terreno.component.scss'],
  providers: [MessageService]
})
export class TerrenoComponent implements OnInit,AfterViewInit {

  nombreImagen: string;
  terrenoForm: FormGroup;
  documentoForm: FormGroup;
  proyectoForm: FormGroup;
  submitted: boolean = false;
  submitted2: boolean = false;
  Terreno : Terreno[] = [];
  terreno: Terreno;
  Datos = [{}];
  items: MenuItem[] = [];
  itemssinConstruccion : MenuItem[] = [];
  itemsConstruccion: MenuItem[] = [];
  //DDL Y autollenado
  ciudad: { label: string, value: number }[] = [];
  Tidoc: { label: string, value: number }[] = [];
  proyecto: ddlproyecto[] | undefined;
  filtradoproyecto: ddlproyecto[] = [];
  Tipodocumento: ddldoc[] | undefined;
  filtradoDocumento: ddldoc[] = [];
  //Para visualizar las imagenes,pdf etc....
  previewImage: string | ArrayBuffer | null = null;
  previewPDF: SafeResourceUrl | null = null;
  previewFile: string[]; 
  worldImagen = "https://freebiehive.com/wp-content/uploads/2022/02/Microsoft-Word-Icon-PNG.jpg"; //cargo una imagenes por defecto
  excelImagen = "https://i.pinimg.com/originals/b6/0c/44/b60c442e6dd69356b90b9e5bec23cc99.png";//cargo una imagenes por defecto
  OtrosImagenes = "https://cdn-icons-png.flaticon.com/512/3516/3516096.png";//cargo una imagenes por defecto
  //
 //en este espacio cargo todas mis variables de Encendido/Apagado si/no
  Index: boolean = true;
  Create: boolean = false;
  Editar: boolean = false;
  Detail: boolean = false;
  Delete: boolean = false;
  confirm: boolean = true;
  isEditMode: boolean = false;
  isLoading = false;
  deleteDocumentoDialog: boolean = false;
  confirmInsumoDialog: boolean = false;
  ConfirmarEditar: boolean = false;
  MandarterrenoAProyecto: boolean = false;
  isVisible: boolean = false;
  ModalFinalTerreno: boolean = false;
  ////
  Error_TipoDocumento: string = "El campo es requerido.";
  currentStep: number = 0; //Este es un valor para iniciarlizar el tab o la pestaña
  activeStep: any = this.items[0];
  identity: string = "Crear"; //es un tipo identificador con el cual manejo la accion que deseo hacer.
  selectedTerreno: any;
  selectedDocumento: any;
  selectedProyecto: any;
  id: number = 0; //Variable donde almaceno un valor
  displayMapModal: boolean = false; //Este se encarga de mostrar el mapa
  fileUrl: string | ArrayBuffer | null = null; //En este guardo la url de todas las Imagenes/Docuemntos para almacernarlas
  fileType: string | null = null; //Aqui almaceno el tipo de documento o Imagenes que es.
  //parte del mapa
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 2;
  selectedMarkerContent: string;
  searchBox: google.maps.places.SearchBox;
  @ViewChild('searchBox', { static: false }) searchBoxRef: ElementRef;
  @ViewChild(GoogleMap, { static: false }) mapComponent: GoogleMap; // Cambia el nombre para evitar conflictos
  map: google.maps.Map;
  marker: google.maps.Marker;
  infoWindow: google.maps.InfoWindow;
    lat = 0; // Latitud inicial
    lng = 0; // Longitud inicial

  //
  loading: boolean = false; //Variable que utilizo para cargar
  loadingtow: boolean = false; //Variable que utilizo para cargar
  //docuemnto
  images: any[] = []; // Lista para las imágenes
  galleriaResponsiveOptions: any[];

  @ViewChild('fileUpload') fileUploader: FileUpload; //en esta variable almaceno todo aquello que el fileUpload cargue para asi mostrar la imgaen
  @ViewChild('docUploader') docUploader: FileUpload; //Con esta varianle hago lo mismo y su funcion es para manejo de los documentos
  //
  //tabla maestra
  expandedRows: any = {};
  TablaMaestra: TablaMaestra[] = [];
  //
 //Tabla de documentos
 documentosCargados: boolean = false;
 ImagenSubida: any[] = [];
 PDFSubida: any[] = [];
 ExcelSubida: any[] = [];
 WordSubida: any[] = [];
 OtrosSubida: any[] = [];
 selectedExcel: any;
 selectedPDF: any;
 selectedImage: any;
 selectedWord: any;
 selectedOtros: any;
 //
 isCopied: boolean = false; //para el copiar el link de ubicacion
  titulo: string = "Nuevo Bien Raíz"; //Una varible que la utilizo para el titulo
  //Detalle
  detalle_bien_Id: string = "";
  detalle_bien_Desripcion: string = "";
  detalle_bien_Imagen: string = "";
  detalle_bien_Area: string = "";
  detalle_bien_PecioCompra: string = "";
  detalle_bien_PrecioVenta: string = "";
  detalle_bien_Latitud: string = "";
  detalle_bien_Longitud: string = "";
  detalle_bien_LinkUbicacion: string = "";
  detalle_usuaCreacion: string = "";
  detalle_usuaModificacion: string = "";
  detalle_bien_FechaCreacion: string = "";
  detalle_bien_FechaModificacion: string = "";
  detalle_bien_Estado: string = "";
  detalle_Documento: string = "";
  detalle_Proyecto: string = "";
  detalle_identificador : boolean = false;
  displayModal: boolean = false;
  ModalConfirmar :boolean = false;
  proyectoNombre: string = '';
  steps: MenuItem[] = [
    { label: 'Paso 1: Registro del Terreno', styleClass: 'step-label registration-step' },
    { label: 'Paso 2: Documentación del Terreno', styleClass: 'step-label documentation-step' }
  ];

  /**
     * Constructor para `TerrenoComponent`.
     *  @param   messageService - //Servicio para mostrar Mensajes
   *   @param bienRaizService - //servicio para gestionar el Terreno
  *  @param documentoService - //servicio para gestionar el Documento
  *  @param apiService - //Servicio para gestionar El mapa
   *  @param cdr - //Servicio para manejar los cambios en el mapa
  *   @param router - //Router para la navegacion
  *  @param  fb - //servicio que ayuda para el manejo del formulario
  *  @param http - //Servicio para las solicitudes HTTp
   *  @param sanitizer - //Servicio que ayuda a Manejar url y hacerlas seguras
     */

  constructor(
    //Aqui se encuentra todo mis constructores
    private messageService: MessageService,//Servicio para mostrar Mensajes
    private bienRaizService: TerrenoService, //servicio para gestionar el Terreno
    private documentoService: DocumentoBienRaizService, //servicio para gestionar el Documento
    private apiService: ApiMapaService, //Servicio para gestionar El mapa
    private cdr: ChangeDetectorRef, //Servicio para manejar los cambios en el mapa
    private router: Router, //Router para la navegacion
    private fb: FormBuilder, //servicio que ayuda para el manejo del formulario
    private http: HttpClient, //Servicio para las solicitudes HTTp
    private sanitizer: DomSanitizer, //Servicio que ayuda a Manejar url y hacerlas seguras
    public globalMoneda: globalmonedaService,
    public cookieService: CookieService,
  ) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/bienraiz/terreno')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
    //En este form inicializamos los campos que vamos a manejar en el formulario
    this.terrenoForm = this.fb.group({
      terr_Descripcion: ['', Validators.required],
      terr_Area: ['', Validators.required],
      terr_PecioCompra: ['', [Validators.required, Validators.pattern(/^\d*\.?\d*$/)]],
    //   terr_PrecioVenta: ['', Validators.required],
      terr_Latitud: ['',Validators.required],
      terr_Longitud: ['', Validators.required],
      terr_LinkUbicacion: ['', Validators.required],
      terr_Imagen: ['', Validators.required],

    });
    //En este form inicializamos los campos que vamos a manejar en el formulario
    this.documentoForm = this.fb.group({
      dobt_DescipcionDocumento: ['', Validators.required],
      tido_Descripcion: ['',],
      dobt_Imagen: ['',Validators.required],
      selectedImage: [''],
      selectedPDF: [''],
      selectedExcel: [''],
      selectedWord: [''],
      selectedOtros: ['']
    });
        //En este form inicializamos los campos que vamos a manejar en el formulario
    this.proyectoForm = this.fb.group({
      proy_Id: ['', Validators.required],
      proy_Nombre: [''],
      terr_Id: ['', Validators.required],
    });
    //Este se encarga de manejar los datos que el mapa nos pide como una Key
    (mapboxgl as any).accessToken = environment.mapBoxToken;
  }
  onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar
  
    this.ngOnInit();
  }

  ngOnInit(): void { //Aqui se hace la primera carga
    this.isCopied = false;
    this.linkText = "";
    this.limpiar = true;
    this.Detail = false;
    this.Index = true;
    this.Create = false;
    this.isCopied = false;
    this.Editar = false;
    this.currentStep = 0;
    this.isEditMode = false;
    this.Listado(); //Este metodo carga el listado de los terrrenos
    this.ListarProyecto(); //Este metodo cargar el listado de los proyectos
    this.ListarDocumento(); //Este metodo carga el listado de los Tipo de documentos
    // console.log(this.globalMoneda.getState(), 'this.globalMoneda.getState()');
      const token =  this.cookieService.get('Token');
  if(token == 'false'){
    this.router.navigate(['/auth/login'])
  }

    if (!this.globalMoneda.getState()) {
      // console.log('hola');
      this.globalMoneda.setState()
    }
  

    this.itemssinConstruccion = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarTerreno() },
      { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleBienRaiz() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.EliminarBienRaiz() },
    ];
    this.itemsConstruccion = [
        { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleBienRaiz() }
      ];
  }
  //Este metodo se encargaba de hacer la carga del endpoint para el terreno para cargar con un spinner
  cargarDatos() {
    this.isLoading = true; //Aqui muestro el spinner
    // console.log('Cargando datos...'); //Para asegurarme que este haciendo la funcion
    this.bienRaizService.Listar().subscribe(
      (data: any) => {
        //seteo el objeto terreno con los datos del listar
        this.Terreno = data.map((terreno: any) => ({
          ...terreno,
          //aqui cargos los datos de la tabla con la fecha que tomo de la maquina
          terr_FechaCreacion: new Date(terreno.terr_FechaCreacion).toLocaleDateString(),
          terr_FechaModificacion: new Date(terreno.terr_FechaModificacion).toLocaleDateString()
        }));
        console.error('Datos cargados:', this.Terreno);
        this.isLoading = false; //aqui el spinner se esconde porque significa que ya cargo los datos
      },
      (error) => {
        console.error('Error cargando datos', error);
        this.isLoading = false; //De igualmanera el spinner se va a ocular si hubo algun errro al momento de cargar los datos
      }
    );
  }
  //Esta funcion hace que el cuadro de texto(Input) solo acepte letras lo cual va a negar si intenta ingresar algun numero
  validarTexto(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const texto = input.value;
    const cursorPosition = input.selectionStart;
    const allowedKeys = /^[a-zñA-ZÑ\s]+$/;
    const isAllowedKey = allowedKeys.test(event.key) || 
                          event.key === 'Backspace' || 
                          event.key === 'Tab' || 
                          event.key === 'ArrowLeft' || 
                          event.key === 'ArrowRight' || 
                          event.key === 'Enter' || 
                          event.key === 'Delete';
    if (event.altKey || !isAllowedKey) {
      event.preventDefault();
      return;
    }
  
    if (event.key === ' ' && (texto.trim() === '' || cursorPosition === 0)) {
      event.preventDefault();
      return;
    }
    if (event.key === 'Enter') {
      this.GuardarDocumento();
    }
  }
  
  
  validarPegar(event: ClipboardEvent) {
    const clipboardData = event.clipboardData?.getData('text') || '';
    const allowedTextPattern = /^[a-zñA-ZÑ\s]*$/;
    
    const filteredText = clipboardData.split('')
      .filter(char => allowedTextPattern.test(char))
      .join('');
    
    const cleanedText = filteredText.trimStart();
  
    if (clipboardData !== cleanedText) {
      event.preventDefault();
      document.execCommand('insertText', false, cleanedText);
    }
  }
  
  
//Se encarga de negar el ingreso de letras a la caja de texto(Input) donde solo aceptara numeros
validarArea(event: KeyboardEvent) {
  const input = event.key;
  const inputElement = event.target as HTMLInputElement;
  const value = inputElement.value;
  if (!/^\d$/.test(input) && input !== '.' && input !== 'Backspace' && input !== 'Tab' &&
      input !== 'ArrowLeft' && input !== 'ArrowRight' && event.keyCode !== 13) {
    event.preventDefault();
  }
  if (input === '.' && value.includes('.')) {
    event.preventDefault();
  }
  if (event.keyCode === 13) {
    this.GuardarDocumento();
  }
}

handleBlur(event: FocusEvent) {
  const inputElement = event.target as HTMLInputElement;
  let value = parseFloat(inputElement.value);

  // console.log(`Valor recibido en blur: ${inputElement.value}`);

  if (isNaN(value) || value === 0) {
    value = 50;
  }

  // console.log(`Valor ajustado a: ${value}`);

  inputElement.value = value.toFixed(2);
  this.terrenoForm.controls['terr_Area'].setValue(value, { emitEvent: false });

  // console.log(`Valor en el formulario: ${this.terrenoForm.controls['terr_Area'].value}`);
}



//Este metodo solo va a permitir  letras, números, espacios, y la letra ñ.
ValidarTextoNumeros(event: KeyboardEvent) {
  const inputElement = event.target as HTMLInputElement;
  const key = event.key;
  if (!/^[a-zA-Z\s 0-9 Ññ]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
  }
  if (key === ' ' && inputElement.selectionStart === 0) {
    event.preventDefault();
  }
}

  //Metodo para regrear de un tab a otro(De una pestaña a otra en el formulario)
    Regresartap() {


        this.previousStep();


    }
    /*
-es útil para validar la entrada de datos en un campo de texto, asegurando que solo se ingresen números, puntos y comas,
-y manejando casos especiales como espacios y valores de solo ceros.*/
ValidarNumeros(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement;
  const texto = input.value;
  const isValidKey = /^\d$/.test(event.key) ||
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
  if (event.key === ' ' && (texto.trim() === '' || texto.trim().length === input.selectionEnd)) {
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
    /**
     * Este es un metodo para la url base64
     * @param base64 - La manera en como guardamos la url de las imagenes a la base de datos
     */

getSafeUrl(base64: string): SafeUrl {
  return this.sanitizer.bypassSecurityTrustUrl(base64);
}

onImageError(event: Event): void {
  const element = event.target as HTMLImageElement;
  element.src = 'assets/images/no-image.png';
}
    //No en uso pero puede ser relevante mas adelante.
  // Este método lo usé para formatear el número cuando se muestra en el input
  formatNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value;
    valor = valor.replace(/,/g, '');  // Elimino las comas del valor actual

    // Divido el valor en partes antes y después del punto decimal
    const partes = valor.split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');  // Agrego comas para el formato

    input.value = partes.join('.');  // Actualizo el valor del input
    this.terrenoForm.get('terr_PecioCompra')?.setValue(valor);  // Actualizo el valor en el formulario
  }

  // Este método lo escribí para permitir solo números en el input
  ValidarNumeros2(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab', 'Enter', 'Shift'];
    if (allowedKeys.indexOf(event.key) === -1 && !/[\d.,]/.test(event.key)) {
      event.preventDefault();  // Prevenir la entrada de caracteres no permitidos
    }
  }
// Expande una fila, limpia las filas expandidas previas y carga datos adicionales para la fila expandida
onRowExpand(event: any): void {
  console.log("Expanding row:", event.data);
  const Coti = event.data;
  this.expandedRows = {};
  this.loadingtow = true;
  console.log("Loading started:", this.loadingtow);
  this.ListarTablaMaestra(Coti.terr_Id);
}



// Colapsa una fila y elimina su entrada de expandedRows
onRowCollapse(event) {
  delete this.expandedRows[event.terr_Id];
}

/**
* Listado para la tabla maestra.
* @param terrId - Obtiene y muestra datos adicionales para una fila expandida y maneja la respuesta del servicio
*/
ListarTablaMaestra(terrId: any) {
  this.loadingtow = true; // Indicar que se está cargando
  this.bienRaizService.BuscarTablaMaestra(terrId).pipe(
    tap(() => {
   
    })
  ).subscribe(
    (Terr: TablaMaestra[]) => {
      this.TablaMaestra = Terr; // Asignar datos a la tabla
      this.expandedRows[terrId] = true; // Expande la fila si es necesario
    },
    error => {
      console.error(error);
    },
    () => {
      this.loadingtow = false; // Detener el indicador de carga
    }
  );
}

    /**
     *  Selecciona un terreno y lo guarda para su uso posterior
     * @param bienRaiz - De aqui es donde se maneja la informacion seleccionada para el terreno
     */
selectedTerrenos(bienRaiz: any) {
  this.selectedTerreno = bienRaiz;
  this.linkText = this.selectedTerreno.terr_LinkUbicacion;
  if (bienRaiz.terr_Identificador) {
    this.itemssinConstruccion = [
        { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.EditarTerreno() },
        { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleBienRaiz() },
        { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.EliminarBienRaiz() },
      ];
  } else {
    this.itemsConstruccion = [
        { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleBienRaiz() }
      ];
  }
  // console.log(this.selectedTerreno)
}


//Este metodo es para filtrar el endpoint de proyecto
ListarProyecto() {
  this.bienRaizService.ListarProyectoContruccionBienRaiz().subscribe(
    (proyectos: ddlproyecto[]) => {
      if (proyectos && Array.isArray(proyectos)) {
        // Ordenar alfabéticamente por 'proyecto_Descripcion' (ajusta el nombre del campo según tu modelo)
        this.proyecto = proyectos
          .sort((a, b) => a.proy_Nombre.localeCompare(b.proy_Nombre));
      } else {
        console.error('La respuesta de listar proyectos no es un array:', proyectos);
      }
    },
    error => {
      console.error(error);
    }
  );
}

//accion que permite el selecionar un proyecto por el nombre, donde en el input lo tomara como su id
onProyectoSelect(event: any) {
  const proyectoSeleccionado = event.value;
  // console.log(proyectoSeleccionado.proy_Id);
  this.proyectoForm.patchValue({
    proy_Id: proyectoSeleccionado.proy_Id,
    proy_Descripcion: proyectoSeleccionado.proy_Nombre
  });
  this.proyectoNombre = proyectoSeleccionado.proy_Nombre;
}
//Aqui va a filtra por medio del nombre del proyecto
filterProyecto(event: any) {
  const query = event.query.toLowerCase();
  this.filtradoproyecto = this.proyecto.filter(proyecto =>
    proyecto.proy_Nombre.toLowerCase().includes(query)
  );
}
ListarDocumento() {
  this.bienRaizService.tipodocuemnto().subscribe(
    (Documento: ddldoc[]) => {
      if (Documento && Array.isArray(Documento)) {
        this.Tipodocumento = Documento
          .sort((a, b) => a.tido_Descripcion.localeCompare(b.tido_Descripcion));
      } else {
        console.error('La respuesta de listar tipo de documento no es un array:', Documento);
      }
    },
    error => {
      console.error(error);
    }
  );
}

onDocumentoSelect(event: any) {
  const documentoSeleccionado = event;

 
     this.documentoForm.patchValue({
       tido_Descripcion: documentoSeleccionado.value.tido_Descripcion
      
     });
   
 }
 filterDocumento(event: any) {
  const query = event.query.toLowerCase();
  this.filtradoDocumento = this.Tipodocumento.filter(documento =>
    documento.tido_Descripcion.toLowerCase().includes(query)
  );
}


  /////////////////////////////////////////////
  //Endpoint de listar Terrenos
  Listado() {
    this.loading = true; //Muestra el spinner

    this.bienRaizService.Listar().subscribe(
      (data: any) => {
        this.Terreno = data.map((terreno: any) => ({
          ...terreno,
          terr_FechaCreacion: new Date(terreno.terr_FechaCreacion).toLocaleDateString(),
          terr_FechaModificacion: new Date(terreno.terr_FechaModificacion).toLocaleDateString()
        }));

        this.loading = false; //esconde el spinner
      },
      error => {
        console.error('Error al obtener la lista de terrenos:', error);
        this.loading = false; //esconde el spinner si hubo problemas
      }
    );
  }
  //Metodo para ddl que carga endpoint de listar
  loadDropdowns() {
    this.bienRaizService.tipodocuemnto().subscribe(
      (response: any) => {
        if (response && Array.isArray(response)) {
          this.Tidoc = response
            .map((item: ddldoc) => ({
              label: item.tido_Descripcion,
              value: item.tido_Id
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
        } else {
          console.error('La respuesta de listar tipo de documento no es un array:', response);
        }
      },
      error => {
        console.error(error);
      }
    );
  }
  
  //Funcion para el boton de nuevo
  CrearBienRaiz() {
    // Paso 1: Guarda el valor que deseas conservar
    // const usuaId = sessionStorage.getItem('usua_Id');
  
    // Paso 2: Limpia el sessionStorage
    sessionStorage.removeItem('dobt_Id');
    sessionStorage.removeItem('terrenoId');
    sessionStorage.removeItem('id');
  
    // // Paso 3: Restaura el valor que conservaste
    // if (usuaId !== null) {
    //   sessionStorage.setItem('usua_Id', usuaId);
    // }
    // Resto de la lógica de tu función
    this.Detail = false; // Esconde el detalle
    this.Index = false; // Esconde la tabla del inicio
    this.Create = true; // Muestra el formulario de crear
    this.detalle_identificador = false; // Variable que almacena el identificador (Terr_Identificador)
    this.isCopied = false;
    this.linkText = "";
    this.limpiar = true;
    this.isEditMode = false; // Desactiva el modo de edición
    this.currentStep = 0; // Inicializa el tab en su punto inicial
    this.terrenoForm.reset(); // Resetea los campos del formulario de terreno
    this.documentoForm.reset(); // Resetea los campos del formulario de documentos
    // console.log('sessionStorage después de clear():', sessionStorage);
    this.identity = "crear"; // Identificador para manejar al momento de crear
    this.titulo = "Nuevo"; // Título del crear
  }
  limpiar: boolean = true;
//Funcion para el boton de editar
EditarTerreno() {
  this.Detail = false;
  this.Index = false;
  this.Create = true;
  this.isCopied = false;
  this.Editar = true;
  this.currentStep = 0;
  this.isEditMode = true;
  this.identity = "editar";
  this.titulo = "Editar";

    //Lleno el formulario de terreno al momento de editar
  this.terrenoForm.patchValue({
    terr_Id: this.selectedTerreno.terr_Id,
    terr_Descripcion: this.selectedTerreno.terr_Descripcion,
    terr_Longitud: this.selectedTerreno.terr_Longitud,
    terr_Latitud: this.selectedTerreno.terr_Latitud,
    terr_Area: this.selectedTerreno.terr_Area,
    terr_PecioCompra: this.selectedTerreno.terr_PecioCompra,
    terr_PrecioVenta: this.selectedTerreno.terr_PrecioVenta,
    terr_LinkUbicacion: this.selectedTerreno.terr_LinkUbicacion || "Sin Ubicación",
    terr_Imagen: this.selectedTerreno.terr_Imagen,
    usua_Modificacion: this.selectedTerreno.usua_Modificacion,
  });
  this.detalle_identificador = this.selectedTerreno.terr_Identificador;
  // console.log(this.detalle_identificador,'aqui esta el identificador')
  this.detalle_bien_Desripcion = this.selectedTerreno.terr_Descripcion;
  this.id = this.selectedTerreno.terr_Id; //Tomo el id del terreno que estoy editando/usando
  const usuaId = sessionStorage.getItem('usua_Id');
  // console.log('el id del usario con local',usuaId)
  // if (usuaId !== null) {
  //   sessionStorage.setItem('usua_Id', usuaId);
  // }
  sessionStorage.setItem('id', this.selectedTerreno.terr_Id.toString()); //El id del terreno a editar lo seteo en una session
 //Muestro los datos de la loongitud y latitud por medio del mapa
 this.linkText = this.selectedTerreno.bode_LinkUbicacion;
 this.lat = this.selectedTerreno.bode_Latitud;
 this.lng = this.selectedTerreno.bode_Longitud;
 if (this.lat != 0 && this.lat != null) {
  this.limpiar = false;
}

// Añade un marcador en el mapa basado en la latitud y longitud de la bodega seleccionada.
this.addGoogleMapsMarker(this.lat, this.lng);
  this.loadDocumentacion();

  // console.log(this.terrenoForm);
  // console.log(sessionStorage.getItem("id"), "id para el editar");
}
//Endpoint para cargar los documentos por medio de un identificador (Le id del terreno asociado)
cargarDocumento(terrenoId: string) {
    //ENDPIONT
  this.documentoService.obtenerDocumentoPorTerrenoId(terrenoId).subscribe(
    (selectedDocumento: any) => { //Seteo los datos que traigo a la variable selecDocumento donde tomo todo los datos.
      // console.log('Documento cargado:', selectedDocumento);
      if (this.selectedDocumento) {
        //LLEno los datos del formulario de docuemntos con los datos que extraigo del enpoint
        this.documentoForm.patchValue({
            dobt_Id: selectedDocumento.dobt_Id = sessionStorage.setItem("dobt_Id", selectedDocumento.dobt_Id),
          dobt_DescipcionDocumento: selectedDocumento.dobt_DescipcionDocumento,
          tido_Id: selectedDocumento.tido_Id,
          dobt_Imagen: selectedDocumento.dobt_Imagen,
        });
        // console.log("informacion que se llena a traves del terreno",selectedDocumento);

      } else {
        console.warn('No se encontró ningún documento para el terreno con ID:', terrenoId);
      }
    },
    (error) => {
      console.error('Error al cargar el documento:', error);
    }
  );
}
    //Funcion para el filtrado de la tabla
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

    /**
     * Metodo que hace la funcion de descargar documentos .
     *  @param url - esta seria la url del documento/imagen a cargar
     * @param fileName - este seria el nombre del documento/imagen a cargar
     * -En este metodo creo un enlace temporal para poder descargar un documento/Imagen por medio de la url
       -con la cual manejo tanto la url como el nombre de dicho documento/Imagen
     */

  downloadDocument(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  pais: string = "";
  //Funcion del boton de detalle
  DetalleBienRaiz() {

    if (!this.Detail) {
      this.Index = false;
      this.Create = false;
      this.Detail = true;
        //aca nosotros llenamos los campos de terreno que referenciamos por el id del terreno
      this.detalle_bien_Id = this.selectedTerreno.codigo;
      this.detalle_bien_Desripcion = this.selectedTerreno.terr_Descripcion;
      this.detalle_bien_Imagen = this.selectedTerreno.terr_Imagen;
      this.detalle_bien_Area = this.selectedTerreno.terr_Area;
      this.detalle_bien_PecioCompra = this.selectedTerreno.terr_PecioCompra;
      this.detalle_bien_PrecioVenta = this.selectedTerreno.terr_PrecioVenta;
      this.detalle_bien_Latitud = this.selectedTerreno.terr_Latitud;
      this.detalle_bien_Longitud = this.selectedTerreno.terr_Longitud;
      this.detalle_bien_LinkUbicacion = this.selectedTerreno.terr_LinkUbicacion;
      this.detalle_usuaCreacion = this.selectedTerreno.usuaCreacion;
      this.detalle_bien_FechaCreacion = this.selectedTerreno.terr_FechaCreacion ? (this.selectedTerreno.terr_FechaCreacion) : '';

      if (this.selectedTerreno.usuaModificacion) {
        this.detalle_usuaModificacion = this.selectedTerreno.usuaModificacion;
        this.detalle_bien_FechaModificacion = this.selectedTerreno.terr_FechaModificacion ? (this.selectedTerreno.terr_FechaModificacion) : '';
      } else {
        this.detalle_usuaModificacion = "";
        this.detalle_bien_FechaModificacion = "";
      }

    //   this.cargarDocumento(this.detalle_bien_Id = this.selectedTerreno.terr_Id);
    //   this.detalle_Documento = this.selectedDocumento.dobt_DescipcionDocumento;


      // Llamada a servicio para obtener datos de geocodificación
      this.apiService.getReverseGeocode(this.selectedTerreno.terr_Latitud, this.selectedTerreno.terr_Longitud).subscribe(
        (geoData: any) => {
          const place = geoData.address;
          this.ciudad = place.city || 'Desconocido';
          this.pais = place.country || 'Desconocido';
        },
        error => {
          console.error(`Error al obtener geocode para Bodega ID: ${this.selectedTerreno.terr_Id}`, error);
        }
      );
    }
  }

//Funcion para copiar el link de ubicacion 
copyLink(): void {
  const link = this.terrenoForm.controls['terr_LinkUbicacion'].value;
  if (link) {
      navigator.clipboard.writeText(link).then(() => {
          this.isCopied = true;

          
          setTimeout(() => {
              this.isCopied = false;
          }, 5000); 
      }).catch(err => {
          console.error('Error al copiar el enlace: ', err);
      });
  }
}


    
  //configura la información necesaria para eliminar un terreno y marca que la eliminación está en proceso
  EliminarBienRaiz() {
    this.detalle_bien_Desripcion = this.selectedTerreno.terr_Descripcion;
    this.id = this.selectedTerreno.terr_Id;
    this.Delete = true;
  }
    //maneja la seleccion de imagenes


 onImageSelect(event: any): void {
  const file: File = event.files[0]; // Get the selected file

  if (!file) {
      return; 
  }

  // Check if the file is an image
  if (!file.type.startsWith('image/')) {
      this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Solo se permiten archivos de imagen.',
          life: 3000,
      });
      event.files = []; // Clear the file input to prevent selection
      return;
  }

  // Validate file name length
  if (file.name.length > 260) {
      this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'El nombre del archivo excede el límite de 260 caracteres.',
          life: 3000,
          styleClass: 'iziToast-custom'
      });
      event.files = []; // Clear the file input
      return;
  }

  const originalSize = file.size;
  
  const reader = new FileReader();
  reader.onload = (e: any) => {
      const imageUrl = e.target.result;
      
      this.resizeImage(imageUrl, file.type, (resizedImageUrl) => {
          this.dataUrlToBlob(resizedImageUrl, (blob) => {
              const resizedSize = blob.size;
              // console.log('Original size:', originalSize, 'bytes');
              // console.log('Resized size:', resizedSize, 'bytes');
              
              if (resizedSize < originalSize) {
                  console.log('La imagen redimensionada es más pequeña que la original.');
              } else {
                  console.log('La imagen redimensionada no es más pequeña que la original.');
              }
              
              this.terrenoForm.get('terr_Imagen').setValue(resizedImageUrl);
              // console.log('Resized Image preview URL:', resizedImageUrl);
          });
      });
  };
  
  reader.readAsDataURL(file);
}

resizeImage(imageUrl: string, mimeType: string, callback: (resizedImageUrl: string) => void) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const MAX_WIDTH = 620;
      const scale = MAX_WIDTH / img.width;
      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
      const resizedImageUrl = canvas.toDataURL(mimeType, 0.6);
      callback(resizedImageUrl);
    }
  };
  img.src = imageUrl;
}


dataUrlToBlob(dataUrl: string, callback: (blob: Blob) => void) {
  //header contiene la parte antes de la coma (que describe el tipo de datos), y base64 contiene la cadena base64 que representa los datos binarios.
  const [header, base64] = dataUrl.split(','); 
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  const blob = new Blob([new Uint8Array(array)], { type: mime });
  callback(blob);
}


  //Funcion para limpiar el contenedor imagen
  onImageRemove(event: any): void {
    this.terrenoForm.get('terr_Imagen').setValue(null);
    const fileUpload = document.getElementById('p-fileupload') as any;
    if (fileUpload && fileUpload.clear) {
      fileUpload.clear();
    }

    this.cdr.detectChanges();
  }
  onFileRemove(event: any): void {
    this.documentoForm.get('dobt_Imagen').setValue(null);
    const docUploader = document.getElementById('docUploader') as any;
    if (docUploader && docUploader.clear) {
      docUploader.clear();
    }
 
    this.previewImage = null;
    this.previewPDF = null;
    this.previewFile = null;
}
// variable tipo encendido/Apagado donde la utilizo para diferenciar al momento de darle algun boton en el editar
isSaveAction: boolean = false;
/*
-Esta accion va a estar en el guardar que se muestra en el editar para que asi la variable anterior se tome como encendida y poder hacer la funcion
-y aparte llamo mi metodo para guardar el terreno pues si ni modo que mande a llamar otra cosa.*/
guardar(): void {
  this.isSaveAction = true;
  this.GuardarDocumento();
}

/*
-Esta funcion se encargar de guardar los datos del formulario , asi mismo jajajaj se encargar de verificar si se inserto alguna imagen y pues si fue asi
-entonces procedera a llamar el metodo para insertar. ahhhh tambien aqui manejo si el usaurio esta editando o solo insertando por medio de mi variable
- de IsEditMode pues opara el que no sabe ingles significa que esModo de edición  y si aqui solo es un paso solo para analisar que hicimos con lo que
-acabamos de subir al formulario de terreno*/
GuardarDocumento(): void {
  this.submitted = true; // Indicador de si el formulario ha sido enviado
  // console.log('Formulario antes de subir la imagen:', this.terrenoForm.value);

  const imageUrl = this.terrenoForm.get('terr_Imagen').value;
  if (imageUrl) {
    // console.log('Imagen ya subida:', imageUrl);
    if (this.isEditMode) {
      this.confirmInsumoDialog = true;
    } else {
      this.saveterreno();
    }
  } else {
    // this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe de seleccionar una imagen.', life: 3000 });
  }
}

/*este funcion se activa cuando alguien (usuario) confirma que desea actualizar
-cierra el diagolo de confirmacion por cierto jajaja le deje el mismo nombre que le puse en la pantalla de insumo que cosas..
- bueno una vez cierra el modal de confirmar edicion lo que hace es que llama a otro metodo , si muchos metodos pero bueno es lo que hay
-bueno llamos al metodo donde por fin vamos a insertar el terreno*/
confirmarActualizar(): void {
  this.confirmInsumoDialog = false;
  this.saveterreno();
}

/* Bueno este es el ultimo metodo que utlizo para insertar o actualizar el terreno y pues no tiene mucha ciencia
- bueno y por lo que ven estoy utilizano session, pues esa session la utilizo para el editar solo es para confirmar que si voy a editar
-y bueno tambien tengo un metodo donde le digo o evaluo que si el isEditMode esta en true que actualize si no pues va a insertar ahhh si
-yo el mensaje que me cae desde la api(es un puente entre servidores) donde por medio del codestatus yo mando el id del terreno que acabo de insertar*/
saveterreno() {
  this.submitted = true;
  const terrenoFormValue = this.terrenoForm.value;
  if (this.terrenoForm.invalid) {
    this.submitted = true; // Detiene el spinner si el formulario es inválido
    return;
}
  const id = sessionStorage.getItem('id');
  const IdOpcional = sessionStorage.getItem('terrenoId');
  const isEditMode = this.isEditMode;

  const usuaIdString = sessionStorage.getItem('usua_Id');
  const usuaIdNumber = usuaIdString && !isNaN(parseInt(usuaIdString, 10)) ? parseInt(usuaIdString, 10) : 0; 

  // console.info('Modo de operación:', isEditMode ? 'Edición' : 'Creación');

  const latitud = terrenoFormValue.terr_Latitud;
  const longitud = terrenoFormValue.terr_Longitud;

  const latRegex = /^[0-9.-]+$/;
  const longRegex = /^[0-9.-]+$/;

  if (!latRegex.test(latitud) || !longRegex.test(longitud)) {
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Latitud y longitud solo deben contener números.', life: 3000, styleClass: 'iziToast-custom' });
    return;  
  }

  // Validar y ajustar el valor de terr_Area
  let terr_Area = terrenoFormValue.terr_Area;
  if (terr_Area === 0) {
    terr_Area = 50;
  }

  if (!isEditMode) {
    const terreno = {
      terr_Descripcion: terrenoFormValue.terr_Descripcion,
      terr_Area: terr_Area.toString(),
      terr_PecioCompra: terrenoFormValue.terr_PecioCompra.toString(),
      terr_PrecioVenta: terrenoFormValue.terr_PrecioVenta,
      terr_LinkUbicacion: terrenoFormValue.terr_LinkUbicacion.toString(),
      terr_Imagen: terrenoFormValue.terr_Imagen,
      terr_Latitud: terrenoFormValue.terr_Latitud.toString(),
      terr_Longitud: terrenoFormValue.terr_Longitud.toString(),
      usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
      usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
    };

    // console.log('Nuevo terreno a insertar:', terreno);

    this.bienRaizService.Insertar(terreno).subscribe(
      (respuestaTerreno) => {
        // console.log('Respuesta de Insertar Terreno:', respuestaTerreno);

        if (respuestaTerreno.success) {
          sessionStorage.setItem('terrenoId', respuestaTerreno.data.codeStatus.toString());
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000, styleClass: 'iziToast-custom', });
          if (this.isSaveAction) {
            this.resetForms();
            this.isSaveAction = false;
            this.CerrarBienRaiz();
            this.isCopied = false;
          } else {
            this.nextStep();
            this.submitted = false;
            this.isCopied = false;
          }
          this.loadDocumentacion();
        } else {
          console.error('Inserción de terreno fallida:', respuestaTerreno.message);
        }
      },
      (error) => {
        console.error('Error en la inserción del Terreno:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error en la inserción del Terreno', life: 3000, styleClass: 'iziToast-custom', });
        if (error instanceof HttpErrorResponse) {
          console.error('Detalles del error:', error.error);
          if (error.error && error.error.errors) {
            const validationErrors = error.error.errors;
            Object.keys(validationErrors).forEach(field => {
              const errorMessage = validationErrors[field];
              console.error(`Error en campo ${field}: ${errorMessage}`);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error en campo ${field}: ${errorMessage}`, life: 3000, styleClass: 'iziToast-custom', });
            });
          }
        }
      }
    );
  } else if (isEditMode) {
    const terreno = {
      terr_Id: id || IdOpcional,
      terr_Descripcion: terrenoFormValue.terr_Descripcion,
      terr_Area: terr_Area.toString(),
      terr_PecioCompra: terrenoFormValue.terr_PecioCompra.toString(),
      terr_Imagen: terrenoFormValue.terr_Imagen,
      terr_Latitud: terrenoFormValue.terr_Latitud.toString(),
      terr_Longitud: terrenoFormValue.terr_Longitud.toString(),
      terr_LinkUbicacion: terrenoFormValue.terr_LinkUbicacion.toString(),
      usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
    };

    // console.log('Terreno a actualizar:', terreno);

    this.bienRaizService.Actualizar(terreno).subscribe(
      (respuestaTerreno) => {
        // console.log('Respuesta de Actualizar Terreno:', respuestaTerreno);

        if (respuestaTerreno.success) {
          sessionStorage.setItem('terrenoId', respuestaTerreno.data.codeStatus.toString());
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000, styleClass: 'iziToast-custom', });
          if (this.isSaveAction) {
            this.resetForms();
            this.isSaveAction = false;
            this.CerrarBienRaiz();
            this.isCopied = false;
          } else {
            this.nextStep();
            this.submitted = false;
            this.isCopied = false;
          }
          this.loadDocumentacion();
        } else {
          console.error('Actualización de terreno fallida:', respuestaTerreno.message);
          if (respuestaTerreno.message === 'Campo requerido') {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor complete todos los campos requeridos.', life: 3000, styleClass: 'iziToast-custom', });
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Actualización de terreno fallida', life: 3000, styleClass: 'iziToast-custom', });
          }
        }
      },
      error => {
        console.error('Error en la actualización del Terreno:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador', life: 3000, styleClass: 'iziToast-custom', });
      }
    );
  } else {
    console.warn('No se pudo determinar el modo de operación. Verifique el identificador.');
  }
}





/**
     * Metodo para transformar una url base64 a una URl segura .
     *  @param url - esta seria la url del documento/imagen a cargar
     * @param type - En el type refiera al tipo de url que se esta utilizando
     *
     * ESta funcion hace lo mismo que el getSafeUrl la diferencia es que este la utilizo esencialmete para mostrar un pdf
     */


  transform(url: string, type: string): SafeResourceUrl {
    switch (type) {
      case 'resourceUrl':
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
      default:
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }
}
//Lo que esto hace es limpiar el formulario de docuemnto
limpiarDocumento() {
  this.previewImage = null;
  this.previewPDF = null;
  this.previewFile = null;
  this.resetForms();
  this.documentoForm.patchValue({ dobt_Imagen: null });
  this.docUploader.clear(); 
  this.documentoForm.markAsPristine(); 
  this.documentoForm.markAsUntouched();
  this.submitted = false; 
  this.submitted2 = false; 
}


//Permite seleccionar un archivo y maneja que se pueda visualizar y tambien gestiona el almacenamiento en el formulario segun el tipo de archivo (en este caso Imagenes,PDF entre otros).
/**
 * Función para comprimir la URL base64 de cualquier tipo de archivo.
 * @param base64 - La cadena base64 del archivo.
 * @param maxSizeInKB - El tamaño máximo permitido en kilobytes.
 * @returns - La URL base64 comprimida o la original si no es necesario comprimir.
 * @blob - Los blob (Binary Large Object) es un objeto que representa datos binarios  de forma eficiente se utiliza para el manejo de archivos grandes
 */

compressBase64(base64: string, maxSizeInKB: number): string[] {
  if (!base64 || !base64.startsWith('data:')) {
    console.error('Cadena base64 inválida.');
    return [];
  }

  const base64Data = base64.split(',')[1];
  if (!base64Data) {
    console.error('No se encontraron datos base64.');
    return [];
  }

  let binaryString;
  try {
    binaryString = window.atob(base64Data); //esta es la cadena binaria para la base64
  } catch (error) {
    console.error('Error al decodificar base64:', error);
    return [];
  }

  const binaryLen = binaryString.length;
  const bytes = new Uint8Array(binaryLen);

  for (let i = 0; i < binaryLen; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }//Recordatorio : en este funcion lo que hace es que llena el arreglo de byte con los codigos de caracter de la cadeba binaria

  const chunkSize = maxSizeInKB * 1024; 
  const blobUrls: string[] = [];

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.slice(offset, offset + chunkSize);
    const blob = new Blob([chunk], { type: 'application/octet-stream' });
    const blobUrl = URL.createObjectURL(blob);
    blobUrls.push(blobUrl);
    console.log('Tamaño del blob (en bytes):', blob.size);
  }

  blobUrls.forEach((url, index) => {
    console.log(`Cantidad de caracteres en la URL del fragmento ${index + 1}:`, url.length);
  });

  return blobUrls; 
}


onImageSelect2(event: any) {
  // console.log('onImageSelect2 llamado con evento:', event);
  // console.log('Estructura del evento:', event.files);
  const file = event.files[0];
  // console.log('Archivo seleccionado:', file);

  if (file) {
    const maxSizeInMB = 30;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (file.name.endsWith('.exe')) {
      this.messageService.add({
        severity: 'warn', 
        summary: 'Advertencia',
        detail: 'Tipo de archivo no válido. Asegúrese de seleccionar un archivo de un tipo válido.',
        life: 3000,
        styleClass: 'iziToast-custom',
      });
      event.files = []; 
      return;
    }

    const deniedTypes = [
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'video/mp4', 'video/x-msvideo', 'video/quicktime',
      'video/x-matroska', 'video/x-flv', 'video/x-ms-wmv'
    ];

    if (deniedTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'warn', 
        summary: 'Advertencia',
        detail: 'Tipo de archivo no válido. Asegúrese de seleccionar un archivo de un tipo válido.',
        life: 3000,
        styleClass: 'iziToast-custom',
      });
      event.files = [];
      return;
    }

    if (file.size > maxSizeInBytes) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: `El archivo es demasiado pesado. El tamaño máximo permitido es ${maxSizeInMB} MB.`,
        life: 3000,
        styleClass: 'iziToast-custom',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const fileType = file.type;
      let result = e.target.result;
      
      // console.log('Original file type:', fileType);
      // console.log('Original file size (in bytes):', file.size);
      
      if (fileType === 'application/pdf') {
        this.previewPDF = this.sanitizer.bypassSecurityTrustResourceUrl(result);
        this.previewImage = null;
        this.previewFile = null;
        // console.log('Preview PDF URL:', this.previewPDF);
      } else if (fileType === 'text/plain') {
        this.previewPDF = this.sanitizer.bypassSecurityTrustResourceUrl(result);
        this.previewImage = null;
        this.previewFile = null;
        // console.log('Preview Text File URL:', this.previewFile);
      } else if (fileType.startsWith('image/')) {
        this.previewImage = result; 
        this.previewPDF = null;
        this.previewFile = null;
        // console.log('Preview Image URL:', this.previewImage);
      } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.previewImage = this.worldImagen;
        this.previewPDF = null;
        this.previewFile = this.compressBase64(result, 500);
        // console.log('Preview Word Document URL:', this.previewFile);
      } else if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        this.previewImage = this.excelImagen;
        this.previewPDF = null;
        this.previewFile = this.compressBase64(result, 500);
        // console.log('Preview Excel Document URL:', this.previewFile);
      } else {
        this.previewImage = this.OtrosImagenes;
        this.previewPDF = null;
        this.previewFile = this.compressBase64(result, 500);
        // console.log('Preview Other File URL:', this.previewFile);
      }

      this.documentoForm.patchValue({ dobt_Imagen: result });
      // console.log('Form Value dobt_Imagen:', this.documentoForm.get('dobt_Imagen').value);

      // Llamada a uploadImage2 para probar
      this.uploadImage2(file);
    };
    reader.readAsDataURL(file);
  }
}







 /**
     * Metodo donde gestion la subida de imagenes al servidor .
     *  @param file - Esta variable es donde poseo la informacion del documento/imagen
     * esto se encarga de gestionar la subida de una imagen al servidor, maneja el éxito y los errores de la carga, y actualiza el formulario con la URL de la imagen si la carga es exitosa.
     */
    
 uploadImage2(file: File): void {
  // console.log('Archivo recibido en uploadImage2:', file);
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const uniqueFileName = uniqueSuffix + '-' + file.name;

  const formData: FormData = new FormData();
  formData.append('file', file, uniqueFileName);

  this.documentoService.EnviarImagen(formData).subscribe(
    (response: any) => {
      // console.log('Upload successful', response);
      if (response.message === 'Exito') {
        this.documentoForm.get('dobt_Imagen').setValue(response.data.imageUrl);
      } else {
        // console.error('Invalid response from server:', response);
      }
    },
    (error) => {
      console.error('Error uploading file', error);
    }
  );
}

showWarning(message: string) {
  this.messageService.add({
    severity: 'warn', 
    summary: 'Advertencia',
    detail: message,
    life: 3000,
    styleClass: 'iziToast-custom',
  });
}



/**
     * Metodo que lo que hace es simplifica el nombre de los archivos.
     * @param fileName - este seria el nombre del documento/imagen a modificar el nombre
     * esto lo que es simplifica los nombres de archivos largos para que sean más manejables y visibles, especialmente en interfaces donde el espacio es limitado.
     */

    truncateFileName(fileName: string): string {
   if (fileName.length > 30) {
    return fileName.substring(0, 30) + '...';
   }
   return fileName;
    }


  //simplemente abre el cuadro de diálogo para que el usuario pueda seleccionar un archivo
  triggerFileUpload(): void {
       this.fileUploader.advancedFileInput.nativeElement.click();
  }
  cancelImage(): void {
    this.documentoForm.get('dobt_Imagen').setValue('');
    this.fileUploader.clear();
  }
  //aqui lo que hacemos es que se asegura de que todos los campos estén completos y que una imagen haya sido subida antes de intentar guardar el documento
  GuardarDocumento2(): void {
    this.submitted2 = true;
    this.isLoading = true; // Inicia el spinner
  
    // Resetear el error antes de validar nuevamente
    this.Error_TipoDocumento = '';

    // Validación para el tipo de documento
    let idTipoDocumento = this.Tipodocumento.find(doc => doc.tido_Descripcion === this.documentoForm.value.tido_Descripcion)?.tido_Id ?? 0;

    if (idTipoDocumento !== 0) {
        this.documentoForm.get('tido_Descripcion')?.setErrors(null);
    } else if (this.documentoForm.value.tido_Descripcion === "" || this.documentoForm.value.tido_Descripcion == null) {
        this.Error_TipoDocumento = "El campo es requerido.";
        this.documentoForm.get('tido_Descripcion')?.setErrors({ 'invalidTipoDocumentoId': true });
    } else {
        this.Error_TipoDocumento = "Opción no encontrada.";
        this.documentoForm.get('tido_Descripcion')?.setErrors({ 'invalidTipoDocumentoId': true });
    }

    const imageUrl = this.documentoForm.get('dobt_Imagen').value;

    if (imageUrl) {
        // console.log('Imagen ya subida:', imageUrl);

        // Si el formulario es inválido, no proceder
        if (this.documentoForm.invalid) {
            this.isLoading = false; // Detiene el spinner si el formulario es inválido
            return;
        }

        const documentoFormValue = this.documentoForm.value;
        const terrenoIdString = sessionStorage.getItem('terrenoId');
        const idopcional = sessionStorage.getItem('id');
        const terrenoId = parseInt(terrenoIdString, 10);
        const idOpcional = parseInt(idopcional, 10);

        // Lógica para decidir el ID a usar
        let idToUse = terrenoId;
        if (this.isEditMode) {
            idToUse = (idOpcional === terrenoId) ? terrenoId : idOpcional;
        }

        // console.log(`ID a usar para guardar los documentos: ${idToUse}`);

        const id = sessionStorage.getItem("dobt_Id");
        const iddocu = id ? parseInt(id, 10) : 0;

        const documento = {
            dobt_Id: iddocu,
            dobt_DescipcionDocumento: documentoFormValue.dobt_DescipcionDocumento,
            tido_Id: idTipoDocumento,
            dobt_Imagen: documentoFormValue.dobt_Imagen,
            dobt_Terreno_O_BienRaizId: idToUse,
            dobt_Terreno_O_BienRaizbit: true,
            usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
            usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
        };

        // console.log('Documento a insertar:', documento);

        // Llamada al servicio para insertar el documento
        this.documentoService.Insertar(documento).subscribe(
            (respuestaDocumento) => {
                this.isLoading = false; // Detiene el spinner
                if (respuestaDocumento.success) {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000, styleClass: 'iziToast-custom' });
                    this.resetForms();
                    this.loadDocumentacion();
                    this.submitted2 = false;
                    this.isCopied = false;
                    this.limpiarDocumento();
                    this.documentoForm.get('dobt_Imagen').setValue('');
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador', life: 3000, styleClass: 'iziToast-custom' });
                }
            },
            (error) => {
                this.isLoading = false; // Detiene el spinner
                if (error.status === 400 && error.error && error.error.errors) {
                    const validationErrors = error.error.errors;
                    console.error('Validation errors:', validationErrors);
                } else {
                    console.error('Error en la inserción del Documento:', error);
                }
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador', life: 3000, styleClass: 'iziToast-custom' });
            }
        );
    } else {
        this.isLoading = false; // Detiene el spinner si no hay imagen
    }
}

  
  
  //Esta funcion lo que hace es que carga los datos de los documentos actualmente solo tres Imagenes,PDF,y ecxel
  loadDocumentacion() {
    const terrenoIdString = sessionStorage.getItem('terrenoId');
    const idopcional = sessionStorage.getItem('id');
    const terrenoId = parseInt(terrenoIdString, 10);
    const idOpcional = parseInt(idopcional, 10);
    /*
    -Este funcion la cree para el manejo de id al momento de editar incluso ahi en la condicion sale que verifica si esta en modo edicion
    -y si lo esta enbtonces decido que id utilizar al momento de editar esto lo hize para prevenir algun tipo de error ,porque la verdad es que tuve
    -demasiado errores bueno voy a explicar la condicion (   idToUse = (idOpcional === terrenoId) ? terrenoId : idOpcional;) :
    -Lo primero que hago es que comparo el idOpcional con el terrenoId Si son iguales entonces priorizo el terrenoId y ese seria el valor de = idToUse
    -Y si sobn diferentes entonces priorizo el idOpcional y ese pasara hacer el datos de = idTouse
    */
    let idToUse = terrenoId;
    if (this.isEditMode) {
        idToUse = (idOpcional === terrenoId) ? terrenoId : idOpcional;
    }

    //Y pues aqui es solo para verificar si me trea algo y asi pues saber no.
    // console.log(`ID a usar para identificarlo en la consola recorda este es para cargar los datos del las carpetas: ${idToUse}`);

    //Inicializamos la variables de los documentos en vacio
    this.ImagenSubida = null;
    this.PDFSubida = null;
    this.ExcelSubida = null;
    this.WordSubida = null;
    this.OtrosSubida = null;

    // Carga las imágenes
    this.documentoService.ListarTerrenoImagen(idToUse).subscribe(
        (data: any) => {
            this.ImagenSubida = data; //Seteo la data de la imegen a la variable imagensubida
            // console.log(data, "datos de las imagenes");
            this.checkDocumentosCargados();
        }
    );

    // Carga los PDFs
    this.documentoService.ListarTerrenoPDF(idToUse).subscribe(
        (data: any) => {
            this.PDFSubida = data;
            // console.log(data, "datos de los PDF");
            this.checkDocumentosCargados();
        }
    );

    // Carga los documentos de Excel
    this.documentoService.ListarTerrenoExcel(idToUse).subscribe(
        (data: any) => {
            this.ExcelSubida = data;
            // console.log(data, "datos de las Excel");
            this.checkDocumentosCargados();
        }
    );

    // Carga los documentos de Word
    this.documentoService.ListarWord2(idToUse).subscribe(
        (data: any) => {
            this.WordSubida = data;
            this.checkDocumentosCargados();
        }
    );

    // Carga los otros documentos
    this.documentoService.ListarOtros2(idToUse).subscribe(
        (data: any) => {
            this.OtrosSubida = data;
            this.checkDocumentosCargados();
        }
    );
}

  checkDocumentosCargados() {
    //Verifico si se han cargado documentos en al menos una de las categorías.
    this.documentosCargados = (this.ImagenSubida?.length || 0) > 0 ||
                              (this.PDFSubida?.length || 0) > 0 ||
                              (this.ExcelSubida?.length || 0) > 0 ||
                              (this.WordSubida?.length || 0) > 0 ||
                              (this.OtrosSubida?.length || 0) > 0;
  }
  //Este finalizar es el verdadero ya que este borra todo lo anteorir y tambien muestra el index
  finalizar() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.Listado();
    this.proyectoForm.patchValue({
        proy_Id: '',
        proy_Nombre: ''
    })
    this.MandarterrenoAProyecto = false;
    sessionStorage.removeItem('dobt_Id');
    sessionStorage.removeItem('terrenoId');
    sessionStorage.removeItem('id');
    // console.log('sessionStorage después de clear():', sessionStorage);
    // console.log(sessionStorage.removeItem("id"),"el id del editar terreno fue removido")
    this.resetForms();
  }
  //Este pues es para finalizar
  finalizar2() {
    if (!this.documentosCargados) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe ingresar al menos un documento antes de guardar el proyecto.', life: 3000, styleClass: 'iziToast-custom', });
      return;
    }
    this.MandarterrenoAProyecto = true;
    this.submitted = false;
    this.submitted2 = false;
  }
  cancelar() {
    this.MandarterrenoAProyecto = false;
    this.proyectoForm.patchValue({
      proy_Id: '',
      proy_Nombre: ''
  })
  }
  cerrar(){
    this.confirmInsumoDialog = false;
    this.submitted = false;
    this.submitted2 = false;
  }
  salir() {
    if (!this.documentosCargados) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe ingresar al menos un documento antes de guardar el proyecto.', life: 3000, styleClass: 'iziToast-custom', });
      return;
    }
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.Listado();
    this.proyectoForm.patchValue({
        proy_Id: '',
        proy_Nombre: ''
    })
    this.MandarterrenoAProyecto = false;
    sessionStorage.removeItem('dobt_Id');
    sessionStorage.removeItem('terrenoId');
    sessionStorage.removeItem('id');

    this.resetForms();
  }
  //funcion para el boton de guardar
  GuardarProyecto(): void {
   // Indicador de si el formulario ha sido enviado
    //Aqui si algun campo de proyecto esta vacion no va a dejar pasar hasta que se llene todo los campos
    // console.log('entro aqui ya el final')
  


      this.submitted2 = true;
   
    const proyectoFormValue = this.proyectoForm.value;
    // console.log( this.proyectoForm.value,'sin nada que decir')
    const terrenoIdString = sessionStorage.getItem('terrenoId');
    const idOpcionalString = sessionStorage.getItem('id');
    const terrenoId = parseInt(terrenoIdString, 10);
    const idOpcional = parseInt(idOpcionalString, 10);
    /*
    -Este funcion la cree para el manejo de id al momento de editar incluso ahi en la condicion sale que verifica si esta en modo edicion
    -y si lo esta enbtonces decido que id utilizar al momento de editar esto lo hize para prevenir algun tipo de error ,porque la verdad es que tuve
    -demasiado errores bueno voy a explicar la condicion (   idToUse = (idOpcional === terrenoId) ? terrenoId : idOpcional;) :
    -Lo primero que hago es que comparo el idOpcional con el terrenoId Si son iguales entonces priorizo el terrenoId y ese seria el valor de = idToUse
    -Y si sobn diferentes entonces priorizo el idOpcional y ese pasara hacer el datos de = idTouse
    */
    let idToUse = terrenoId;
    if (this.isEditMode) {
        idToUse = (idOpcional === terrenoId) ? terrenoId : idOpcional;
    }

    const Proyecto = {
        proy_Id: proyectoFormValue.proy_Id,
        terr_Id: idToUse,
        usua_Creacion: parseInt(this.cookieService.get('usua_Id'))
    };
if(proyectoFormValue.proy_Id.Invalid){
  return;
}
    // console.log('Documento a insertar:', Proyecto);
        //Endpoint para insertar un terreno a un proyecto
    this.bienRaizService.insertarProyectoContruccionBienRaiz(Proyecto).subscribe(
        (respuestaDocumento) => {
            if (respuestaDocumento.success) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Insertado con Éxito.',
                    life: 3000,
                    styleClass: 'iziToast-custom',
                });
                this.finalizar();
                this.MandarterrenoAProyecto = false;
                sessionStorage.removeItem('dobt_Id');
    sessionStorage.removeItem('terrenoId');
    sessionStorage.removeItem('id');
                this.submitted2 = false;
                this.isVisible = false;
                this.isCopied = false;
                this.documentoForm.get('dobt_Imagen').setValue('');
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Comuníquese con un administrador.',
                    life: 3000,
                    styleClass: 'iziToast-custom',
                });
            }
        },
        (error) => {
            if (error.status === 500 ) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Comuníquese con un administrador.',
                    life: 3000,
                    styleClass: 'iziToast-custom',
                });
            } else {
               
            }
            console.error('Error en la inserción del documento:', error);
        }
    );
}



  abrirconfirmaciondeproyecto(): void {
    /*
    -Este metodo me lo pidieron para el de venta de bienes raices/terreno contexto: Cuando uno crea un terreno o registra un terreno este terreno si o si deberia de tener
    -Al menos un docuemnto no importa si es Imagen/PDF/Word etc.. la cuestion es que si o si necesito cargar un documento y pues esto eso es lo que hace
    -Si le damo al boton de guardar el terrenp en un proyecto pero este terreno no posee imagen entonces automaticamente se reflejara la advertencia.
    */
    if (!this.documentosCargados) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Debe ingresar al menos un documento antes de guardar el proyecto.',
            life: 3000,
            styleClass: 'iziToast-custom',
        });
        return;
    }

    // Obténgo los valores necesarios
    const proyectoFormValue = this.proyectoForm.value;
    const terrenoIdString = sessionStorage.getItem('terrenoId');
    const idopcional = sessionStorage.getItem('id');
    const terrenoId = parseInt(terrenoIdString, 10);
    const idOpcional = parseInt(idopcional, 10);
    /*
    -Este funcion la cree para el manejo de id al momento de editar incluso ahi en la condicion sale que verifica si esta en modo edicion
    -y si lo esta enbtonces decido que id utilizar al momento de editar esto lo hize para prevenir algun tipo de error ,porque la verdad es que tuve
    -demasiado errores bueno voy a explicar la condicion (   idToUse = (idOpcional === terrenoId) ? terrenoId : idOpcional;) :
    -Lo primero que hago es que comparo el idOpcional con el terrenoId Si son iguales entonces priorizo el terrenoId y ese seria el valor de = idToUse
    -Y si sobn diferentes entonces priorizo el idOpcional y ese pasara hacer el datos de = idTouse
    */
    let idToUse = terrenoId;
    if (this.isEditMode) {
        idToUse = (idOpcional === terrenoId) ? terrenoId : idOpcional;
    }

    this.detalle_Proyecto = proyectoFormValue.proy_Nombre; //aca ingreso el valor que traigo desde mi formulario a la varible detalle_proyecto
    // console.log(this.detalle_Proyecto,'el nombre del proyecto')
    this.detalle_bien_Desripcion = this.selectedTerreno.terr_Descripcion;

    // Muestra el modal de confirmación
    this.ModalConfirmar = true;
    this.MandarterrenoAProyecto = false;
}

  CancelarConfirmacion() {
    this.ModalConfirmar = false;
    this.MandarterrenoAProyecto = true;
    this.submitted = false;
    this.submitted2 = false;

}
    //Funcion para el boton de no
  IdentificadorDesactivar(): void {
    /*
    -Este metodo me lo pidieron para el de venta contexto: Cuando uno crea un terreno o registra un terreno este terreno si o si deberia de tener
    -Al menos un docuemnto no importa si es Imagen/PDF/Word etc.. la cuestion es que si o si necesito cargar un documento y pues esto eso es lo que hace
    -Si le damo al boton de 'no' entonces el terreno no se va a enviar a un proyecto pero igual si  este terreno no posee imagen entonces automaticamente se reflejara la advertencia.
    */
    if (!this.documentosCargados) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Debe ingresar al menos un documento    .',
            life: 3000,
            styleClass: 'iziToast-custom',
        });
        return;
    }

    const terrenoIdString = sessionStorage.getItem('terrenoId');
    const idopcional = sessionStorage.getItem('id');
    const terrenoId = parseInt(terrenoIdString, 10);
    const idOpcional = parseInt(idopcional, 10);
    /*
    -Este funcion la cree para el manejo de id al momento de editar incluso ahi en la condicion sale que verifica si esta en modo edicion
    -y si lo esta enbtonces decido que id utilizar al momento de editar esto lo hize para prevenir algun tipo de error ,porque la verdad es que tuve
    -demasiado errores bueno voy a explicar la condicion (   idToUse = (idOpcional === terrenoId) ? terrenoId : idOpcional;) :
    -Lo primero que hago es que comparo el idOpcional con el terrenoId Si son iguales entonces priorizo el terrenoId y ese seria el valor de = idToUse
    -Y si sobn diferentes entonces priorizo el idOpcional y ese pasara hacer el datos de = idTouse
    */
    let idToUse = terrenoId;
    if (this.isEditMode) {
        idToUse = (idOpcional === terrenoId) ? terrenoId : idOpcional;
    }

    //Agrego esto para ir viendo varios punto clave en el codigo en este caso para ver que id me taria el idToUse
    // console.log(`ID a usar para desactivar un terreno: ${idToUse}`);

    // Realizo el llamado al enpopoint
    this.bienRaizService.Desactivar(idToUse).subscribe(
        (respuestaDocumento) => {
            if (respuestaDocumento.success) {
            //   this.messageService.add({
            //     severity: 'info',
            //     summary: 'Información',
            //     detail: `El terreno "${this.detalle_bien_Desripcion}" no fue enviado a un proyecto.`,
            //     life: 3000
            // });
                this.salir();
                this.MandarterrenoAProyecto = false;
                this.isVisible = false;
                this.submitted = false;
                this.submitted2 = false;
                this.isCopied = false;
                sessionStorage.removeItem('dobt_Id');
                sessionStorage.removeItem('terrenoId');
                sessionStorage.removeItem('id');
                this.documentoForm.get('dobt_Imagen').setValue('');
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Hubo un error. Comuníquese con un administrador.',
                    life: 3000,
                    styleClass: 'iziToast-custom',
                });
            }
        },
        (error) => {
            if (error.status === 400 && error.error && error.error.errors) {
                const validationErrors: ValidationErrors = error.error.errors;
                console.error('Validation errors:', validationErrors);
                for (const [field, messages] of Object.entries(validationErrors)) {
                    if (Array.isArray(messages)) {
                        const errorMessage = `Error en el campo ${field}: ${messages.join(', ')}`;
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error de Validación',
                            detail: errorMessage,
                            life: 3000,
                            styleClass: 'iziToast-custom',
                        });
                    } else {
                        console.error(`Error inesperado en el campo ${field}:`, messages);
                    }
                }
            } else {
                console.error('Error en la desactivación del terreno:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo desactivar el terreno a proyecto. Comuníquese con un administrador.',
                    life: 3000,
                    styleClass: 'iziToast-custom',
                });
            }
        }
    );
}

    //Funcion para levantar un cuadro de dialogo de mandar un terreno a un proyecto
  Terrenoaproyecto(){
    this.MandarterrenoAProyecto = true;

  }
  //Funcion que levanta un cuadro de dialogo parar mostrar un mensaje
  Elmodalquelevantaunmnesajeparaelusaurio(){
    this.isVisible = true;
    this.submitted = false;
    this.submitted2 = false;
  }
  //Funcion que cierra el cuadro de dialogo de mandar terreno a un proyecto.
  Terrenoaproyectocerrar(){
    this.MandarterrenoAProyecto = true;
    sessionStorage.removeItem('terrenoId');
  }




  //Funcion que resetea todo los formularios
  resetForms(): void {
    this.documentoForm.reset();
    this.documentoForm.get('dobt_Imagen').setValue(null);

    this.documentoForm.patchValue({
        dobt_DescipcionDocumento: '',
        tido_Id: '',
        dobt_Imagen: '',
        selectedImage: '',
        selectedPDF: '',
        selectedExcel: ''
      });
    this.nombreImagen = '';
    if (this.fileUploader) {
      this.fileUploader.clear();
    }
  }
  //funcion que hace la accion para pasar de tabs
  nextStep() {
    this.currentStep++;
  }
//funcion que hace la accion para regresar de tabs
  previousStep() {
    this.currentStep--;
    this.isEditMode = true;
    sessionStorage.getItem('terrenoId');
  }
  /*
  - Aquí manejo el cambio de pestañas. Si intento cambiar a la pestaña con índice 1
  - y no estoy en modo de edición, evito que el cambio ocurra. Si estoy en otro índice
  - o estoy en modo de edición, actualizo el paso actual al índice de la pestaña seleccionada.
  */
  handleTabChange(event: any) {
    if (event.index === 1 && !this.isEditMode) {
      event.preventDefault();
    } else {
      this.currentStep = event.index;
    }
  }
  /*
  - Aquí alterno entre el modo de edición y el modo de vista.
  - Si estoy en modo de vista, lo cambio a modo de edición. Si estoy en modo de edición,
  - lo cambio a modo de vista.
 */
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }


  // Método para activar el modo de edición
  enableEditMode() {
    this.isEditMode = true;
  }

  // Método para desactivar el modo de edición
  disableEditMode() {
    this.isEditMode = false;
  }
  EliminarDocumento(documento: any) {
    this.selectedDocumento = documento;
    this.deleteDocumentoDialog = true; // Muestra el diálogo de confirmación
  }

  // Confirmar eliminación del documento
  confirmarEliminarDocumento() {
    this.loading = true;
    this.documentoService.EliminarDocumentoterreno(this.selectedDocumento.dobt_Id).subscribe(
      (respuesta: Respuesta) => {
              if (respuesta.success) {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
                this.loadDocumentacion();
                this.deleteDocumentoDialog=false;
                this.loading = false;

              } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Eliminación de documento fallida.', life: 3000,styleClass:'iziToast-custom' });
              }
            },
            error => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000,styleClass:'iziToast-custom' });
            }
          );
  }
  //funcion para cerrar las pestañas de crear/editar u que todo se resetee y que muestre de nuevo el index
  CerrarBienRaiz() {
    this.Index = true;
    this.Detail = false;
    this.submitted = false;
    this.submitted2 = false;
    this.isCopied = false;
    this.Create = false;
    this.Listado();
    this.terrenoForm.reset();
    sessionStorage.removeItem('dobt_Id');
    sessionStorage.removeItem('terrenoId');
    sessionStorage.removeItem('id');

 
    sessionStorage.removeItem('id');
 
  }
  //Funcion que hace la accion de eliminar un terreno ,funcion del Endpoint de eliminar terreno
  Eliminar() {
    this.bienRaizService.Eliminar(this.id).subscribe(
        (respuesta: Respuesta) => {
       
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000, styleClass: 'iziToast-custom', });
              this.Listado();
              this.Delete = false;
            } else {

                this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'No se puede eliminar porque está referenciado.', life: 3000, styleClass: 'iziToast-custom', });
            }
          },
          (error) => {
            console.error('Error al intentar eliminar:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al intentar eliminar. Comunicarse con un administrador.', life: 3000, styleClass: 'iziToast-custom', });
            this.Delete = false;
          }
    );
  }
  //Funcion para abrir el modal final
  openModalfinal() {
    this.ModalFinalTerreno = true;
  }
  //Funcion que hace la accion de cerrar modañ
  closeModal() {
    this.displayMapModal = false;
  }

  triggerDocUpload(): void {
    this.docUploader.advancedFileInput.nativeElement.click();
  }
  addGoogleMapsMarker(lat: number, lng: number) {
    if (this.marker) {
      this.marker.setMap(null);
    }

    const position = new google.maps.LatLng(lat, lng);

    this.marker = new google.maps.Marker({
      position: position,
      map: this.map,
      icon: {
        url: '../../../../../assets/layout/images/markerMaps.png',
        strokeColor: '#000',
        scaledSize: new google.maps.Size(20, 25)
      },
    });

        // Centrar el mapa en la nueva posición
        this.map.setCenter(position);

        this.getGooglePlaceDetails(lat, lng);
  }
  extraerCoordenadas(link: string): { success: boolean } | null {
    // Expresiones regulares para extraer coordenadas desde diferentes formatos de enlaces de Google Maps.
    const regex2 = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/, // Formato de coordenadas en la URL.
      /q=(-?\d+\.\d+),(-?\d+\.\d+)/  // Otro posible formato de coordenadas en la URL.
    ];

    // Recorre las expresiones regulares para intentar encontrar una coincidencia en el enlace.
    for (const regex of regex2) {
      const match = link.match(regex);
      if (match) {
        this.latLink = match[1]; // Asigna la latitud extraída.
        this.lngLink = match[2]; // Asigna la longitud extraída.
        return { success: true }; // Retorna éxito si se encontraron coordenadas.
      } else {
        // Si no se encontraron coordenadas, muestra un mensaje de error al usuario.
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Enlace no válido.', life: 3000, styleClass: 'iziToast-custom', });
      }
    }

    return null; // Retorna null si no se pudieron extraer las coordenadas.
  }
  getFullUrl(linkTexto: string) {
    // Asegúrate de usar el parámetro 'linkTexto' pasado al método.
    // console.log('URL incompleta:', linkTexto);

    // Realiza una petición HTTP GET para obtener la URL completa desde el enlace abreviado.
    this.http.get(linkTexto, { responseType: 'text' }).subscribe(
      (response: any) => {
        const redirectedUrl = response.url; // Obtiene la URL redirigida desde la respuesta.
        // console.log('URL completa:', redirectedUrl);

        this.extraerCoordenadas(redirectedUrl); // Extrae las coordenadas de la URL completa.
      },
      error => {
        // console.log('Error al obtener la URL completa:', error); // Log de error en la consola.

        // Mostrar un iziToast con el error.
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener la URL completa.', life: 3000 , styleClass: 'iziToast-custom',});
      }
    );
  }
  getGooglePlaceDetails(lat: number, lng: number) {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat: lat, lng: lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        const place = results[0].address_components.reduce((acc, component) => {
          if (component.types.includes('country')) acc.country = component.long_name;
          if (component.types.includes('locality')) acc.city = component.long_name;
          return acc;
        }, { country: '', city: '' });

        const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
        const details = `
          <div style="background-color: #FFF0C6; color: #000; padding: 10px; border-radius: 5px;">
            <strong>País:</strong> ${place.country}<br>
            <strong>Ciudad:</strong> ${place.city}<br>
            <strong>Coordenadas:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}<br>
            <strong>Url:</strong> <a href="${googleMapsLink}" target="_blank">Google Maps</a>
          </div>`;

        this.infoWindow.setContent(details);
        this.marker.addListener('click', () => {
          this.infoWindow.open(this.map, this.marker);
        });

        this.terrenoForm.patchValue({
          terr_Latitud: lat.toString(),
          terr_Longitud: lng.toString(),
          terr_LinkUbicacion: googleMapsLink.toString(),
        });
        this.linkText = googleMapsLink.toString();
      }
    });
  }
  linkText: string = "borrar";
  mapa: boolean = false;
  lngLink: string = ""; // Longitud extraída del enlace
  latLink: string = "";
  //Este metodo hace la funcion del mapa
  mostrarMapa() {
    // Verifica si las coordenadas están presentes en el formulario. Si están disponibles, se agrega un marcador en el mapa.
    if (this.terrenoForm.get('terr_Latitud').value && this.terrenoForm.get('terr_Longitud').value) {
      this.addGoogleMapsMarker(this.terrenoForm.get('terr_Latitud').value, this.terrenoForm.get('terr_Longitud').value);

    }
    // Si las coordenadas no están disponibles pero existe un enlace, intenta extraer las coordenadas del enlace.
    else if (this.linkText) {
      // Verifica si el enlace es un enlace abreviado de Google Maps.
      if (this.linkText.includes('goo.gl') || this.linkText.includes('maps.app.goo.gl')) {
        this.getFullUrl(this.linkText);  // Obtiene la URL completa si es un enlace abreviado.
      } else {
        this.extraerCoordenadas(this.linkText);  // Extrae las coordenadas si el enlace ya está completo.
      }

      // Actualiza los valores del formulario con las coordenadas obtenidas del enlace.
      this.terrenoForm.get('terr_Latitud').setValue(this.latLink);
      this.terrenoForm.get('terr_Longitud').setValue(this.lngLink);
      this.addGoogleMapsMarker(parseFloat(this.latLink), parseFloat(this.lngLink));

    }
    // // Si no hay coordenadas en el formulario ni un enlace, utiliza coordenadas predeterminadas para mostrar el mapa.
    // else {
    //   this.addMarker(new mapboxgl.LngLat(-87.205345, 14.105943)); // Coordenadas predeterminadas.

    // }

    // Oculta los detalles y la creación, y muestra la vista del mapa.
    this.Detail = false;
    this.Create = false;
    this.mapa = true;
  }

  ocultarMapa() {
    this.Detail = false;
    this.Create = true;
    this.mapa = false;

    if (this.limpiar && this.identity != "editar") {
      this.terrenoForm.patchValue({
        terr_Latitud: '',
        terr_Longitud: '',
        terr_LinkUbicacion: '',
      });
      this.linkText = "";
    } else {
      this.terrenoForm.patchValue({
        terr_Latitud: this.selectedTerreno.bode_Latitud,
        terr_Longitud: this.selectedTerreno.bode_Longitud,
        terr_LinkUbicacion: this.selectedTerreno.bode_LinkUbicacion,
      });
      this.linkText = this.selectedTerreno.bode_LinkUbicacion;
    }
    this.limpiar = true;
  }
   // Método para agregar el mapa
   agregarMapa() {
    if (this.identity != "editar") {
      this.limpiar = true;
    } else {
      this.limpiar = false;
    }

    if (this.linkText == "" || this.linkText == null) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Seleccione una ubicación válida.', life: 3000, styleClass: 'iziToast-custom', });
    } else {
      this.terrenoForm.get('terr_LinkUbicacion').setValue(this.linkText);
      this.Detail = false;
      this.Create = true;
      this.mapa = false;
    }
  }
  ngAfterViewInit(): void {
    this.initializeMap();  // Inicializa el mapa
    this.initializeSearchBox();  // Configura el SearchBox

    // Listener para el evento de clic en el mapa
    this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        this.addGoogleMapsMarker(lat, lng);
      }
    });
  }
  initializeMap() {
    const mapOptions: google.maps.MapOptions = {
      center: this.center,
      zoom: this.zoom
    };

    // Obtén la instancia nativa del mapa de Google Maps desde el componente de Angular
    this.map = new google.maps.Map(this.mapComponent.googleMap.getDiv(), mapOptions);
    this.infoWindow = new google.maps.InfoWindow();
  }
    //METODO PARA INICIALIZAR BARRA DE BUSQUEDA
    initializeSearchBox() {
      const input = this.searchBoxRef.nativeElement as HTMLInputElement;
      this.searchBox = new google.maps.places.SearchBox(input);
  
      // Coloca el input de búsqueda dentro del mapa
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  
      this.map.addListener('bounds_changed', () => {
          this.searchBox.setBounds(this.map.getBounds() as google.maps.LatLngBounds);
      });
  
      this.searchBox.addListener('places_changed', () => {
          const places = this.searchBox.getPlaces();
  
          if (places?.length === 0) {
              return;
          }
  
          const bounds = new google.maps.LatLngBounds();
  
          places.forEach(place => {
              if (!place.geometry || !place.geometry.location) {
                  return;
              }
  
              // Ubica el marcador en la primera ubicación encontrada
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              this.addGoogleMapsMarker(lat, lng);
  
              // Ajusta el centro del mapa y el zoom
              this.map.setCenter(place.geometry.location);
              this.map.setZoom(12);
  
              bounds.extend(place.geometry.location);
          });
  
          this.map.fitBounds(bounds);
      });
  }
  
}
