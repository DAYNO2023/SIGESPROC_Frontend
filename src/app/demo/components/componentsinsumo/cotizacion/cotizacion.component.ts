import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { aW, co } from '@fullcalendar/core/internal-common';
import { isThisSecond } from 'date-fns';
import { ca, tr } from 'date-fns/locale';
import { FLAGS } from 'html2canvas/dist/types/dom/element-container';
import { CookieService } from 'ngx-cookie-service';
import { MenuItem, MessageService } from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';
import { FileUpload } from 'primeng/fileupload';
import { Table } from 'primeng/table';
import { filter } from 'rxjs';
import { ciudad } from 'src/app/demo/models/modelsgeneral/ciudadviewmodel';
import { Estado } from 'src/app/demo/models/modelsgeneral/estadoviewmodel ';
import { Pais } from 'src/app/demo/models/modelsgeneral/paisviewmodel';
import { UnidadesPorInsumo, UnidadMedida } from 'src/app/demo/models/modelsgeneral/unidadmedidaviewmodel';
import { Cotizacion, CotizacionImpuesto, CotizacionTabla, TablaMaestra } from 'src/app/demo/models/modelsinsumo/cotizacionviewmodel';
import { ddlCategorias, ddlMaterial, ddlSubcategoria } from 'src/app/demo/models/modelsinsumo/insumosviewmodel';
import { Insumo, InsumoPorMedida } from 'src/app/demo/models/modelsinsumo/insumoviewmodel';
import { Maquinaria, MaquinariabBuscar, Nivel } from 'src/app/demo/models/modelsinsumo/maquinariaviewmodel';
import { Material } from 'src/app/demo/models/modelsinsumo/materialviewmodel';
import { Proveedor } from 'src/app/demo/models/modelsinsumo/proveedorviewmodel';
import { Categoria } from 'src/app/demo/models/modelsproyecto/categoriaviewmodel';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { ciudadService } from 'src/app/demo/services/servicesgeneral/ciudad.service';
import { EstadoService } from 'src/app/demo/services/servicesgeneral/estado.service';
import { PaisService } from 'src/app/demo/services/servicesgeneral/pais.service';
import { CotizacionService } from 'src/app/demo/services/servicesinsumo/cotizacion.service';
import { MaterialService } from 'src/app/demo/services/servicesinsumo/material.service';
import { ProveedorService } from 'src/app/demo/services/servicesinsumo/proveedor.service';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'insu-cotizacion',
  templateUrl: './cotizacion.component.html',
  styleUrl: './cotizacion.component.scss',
  providers: [MessageService,DatePipe]
})
export class cotizacionComponent implements OnInit {
  private apiKey: string = environment.apiKey;
  @ViewChild('docUploader') docUploader: FileUpload;
  //Propiedades
  dateDay = new Date();

  conversion: string;

  Cotizaciones: Cotizacion[] = [];

  CotizacionesTabla: CotizacionTabla[] = [];

  file: File | null = null

  expandedRows: any = {};

  TablaMaestra: TablaMaestra[] = [];

  UnidadesMedida: UnidadesPorInsumo[] = [];

  filteredCotizacionesTabla: any[] = [];

  items: MenuItem[] = [];
  ModalEliminarImagen: boolean = false
  subirItem:  MenuItem[] = [];
  itemsDocumentos:  MenuItem[] = [];

  Index: boolean = true;

  Create: boolean = false;

  Detail: boolean = false;

  Delete: boolean = false;

  form: FormGroup;

  formInsumo: FormGroup;

  formMaquinaria: FormGroup;

  formUnidad: FormGroup;

  formDocumento: FormGroup;

  formEquipo: FormGroup;

  formPaises: FormGroup;

  submitted: boolean = false;

  identity: string  = "Crear";

  titulo: string = "Nueva Rol"

  selectedRol: any;

  selectedCotizacion: any;

  id: number = 0;

  idInsumo: number = 0;

  idEquipo: number = 0;

  idProveedor: number = 0;

  idMaquinaria: number = 0;

  ModalInsumo: boolean = false;

  ModalMaquinaria: boolean = false;

  proveedor: Proveedor[] | undefined;

  material: Material[] | undefined;

  categoria: ddlCategorias[] | undefined;

  subCategoria: ddlSubcategoria[] | undefined;

  insumos: Insumo[] | undefined;

  insumosPorMedidas: Insumo[] | undefined;

  unidad: UnidadMedida[] | any;

  maquinaria: Maquinaria[] = [];

  EquiposSeguridad: any[] = [];

  maquinariaPorProveedor: MaquinariabBuscar[] = [];

  EquiposSeguridadPorProveedor: any[] = [];

  nivel: Nivel[] = [];

  Filtradonivel: Nivel[] = [];

  filtradoInsumo: Insumo[] = [];

  filtradoMaquinaria: Maquinaria[] = [];

  filteredProveedores: any[] = [];

  filteredEquiposSeguridad: any[] = [];

  detalle_codp_Descripcion = "";
  detalle_codp_Documento = "";
  detalle_codp_Id = 0;
  ModalImpuesto: boolean = false;

  ModalFinalizars: boolean = false;

  LabelIncluido: string = "";

  ValorImpuesto: any = 0.00;

  IncluidoImpuesto: boolean = false;

  subtotal: number = 0.00;

  tax: number = 0.00;

  total: number = 0.00;

  activeIndex: number = 0;

  dhTab: boolean = true;

  tabInsumo: boolean = false;

  tabMaquinaria: boolean = false;

  tabEquiposSeguridad: boolean = false;

  selectCheckbox: any[] = [];

  selectAll: any = false

  coti_Id: number = 0;

  detailItems: MenuItem[] = [];

  proveedorFormulario: boolean = false;

  proveedorForm: Proveedor = {usua_Creacion: parseInt(this.cookieService.get('usua_Id'))};

  ciudades: ciudad[] = [];

  estados: Estado[] = [];

  paises: Pais[] = [];

  fecha: Date;

  ventas = [
    { label: 'Maquinaria', value: 0 },
    { label: 'Insumo', value: 1 },
    { label: 'Ambas', value: 2 }
  ];

  //Errores
  Error_Pais: string = "El campo es requerido."
  Error_Estado: string = "El campo es requerido."
  Error_Ciudad: string = "El campo es requerido."
  Error_Nivel: string  = "El campo es requerido."

  filteredCiudades: any[];

  filteredEstados: any[];

  filteredPaises: any[];

  filteredCategorias: any[] = [];

  filteredSubCategorias: any[] = [];

  filteredMateriales: any[] = [];

  filteredUnidades: any[] = [];

  botonCrear: boolean = false;

  filtroboton: boolean = false;

  radioButton: number = 1;

  EncabezadoMedida: string = ""

  EncabezadoCantidad: string = ""

  confirmar :boolean = false;

  confirmarCotizacion :boolean =  false;

  ConfirmarInsumo: boolean = false;

  ConfirmarInsumoBoton: boolean = false;

  isLoading = false;

  deta_Insumo: string = "";

  deta_Categoria: string = "";

  deta_SubCategoria: string = "";

  deta_Material : string = "";

  deta_Unidad: string = "";

  deta_Modal: boolean = false;

  ModalMaquinariaEliminar: boolean = false;

  Deta_MaquinariaDescripcion: string = "";

  ModalMaquinariaCrear: boolean = false;

  ConfirmarCrearMaquinaria: boolean = false;

  ModalInsumoEliminar: boolean = false;

  idUnidad: string = "";

  ModalEquipoCrear: boolean = false;

  ConfirmarCrearEquipo: boolean = false;

  ModalEquipoEliminar: boolean = false;

  Deta_Equipo: string = "";

  ModalProveedor:boolean = false;

  Enviado: boolean = false;

  IndexDocumentos: boolean = false;

  previewImage: string | ArrayBuffer | null = null;

  previewPDF: SafeResourceUrl | null = null;
  
  previewFile: string | null = null;
  minDate: Date;
  worldImagen = "https://i.pinimg.com/originals/c3/e4/bb/c3e4bb7464bb8d8f57243b4a1dfebfec.png";

  ImagenSubida: any[] = [];
  PDFSubida: any[] = [];//obtiene la lista para la pf subida
  WordSubida: any[] = [];
  //Constructor

  constructor(
    private messageService: MessageService,
    private service: CotizacionService,
    private fb: FormBuilder,
    private materialService: MaterialService,
    private proveedorService: ProveedorService,
    private ciudadService: ciudadService,
    private router: Router,
    public cookieService: CookieService,
    private estadoService: EstadoService,
    private paisService: PaisService,
    private sanitizer: DomSanitizer,

    //LLamamos al servicio de global para traer la nomenclatura de moneda
    public globalMoneda: globalmonedaService
  ) { 
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/insumo/cotizacion')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
    this.minDate = new Date(1920, 0, 1);
    //Iniciar Formularios
    this.form = this.fb.group({
      prov_Descripcion: ['', Validators.required],
      coti_Fecha: ['', Validators.required]
    });
    this.formInsumo = this.fb.group({
      insu_Descripcion: ['', Validators.required],
      cate_Descripcion: ['', Validators.required],
      mate_Descripcion: ['', Validators.required],
      suca_Descripcion: ['', Validators.required]
    });
    this.formMaquinaria = this.fb.group({
      maqu_Descripcion: ['', Validators.required],
      nive_Descripcion: [''],
      maqu_UltimoPrecioUnitario: ['', Validators.required],
      mapr_DiaHora: [null, Validators.required],
    });
    this.formUnidad = this.fb.group({
      inpp_Preciocompra: ['', Validators.required],
      unme_Nombre: ['', Validators.required],
      inpp_Observacion: [''],

    });
    this.formEquipo = this.fb.group({
      equs_Nombre: ['', Validators.required],
      eqpp_PrecioCompra: ['', Validators.required]
    });
    this.formDocumento = this.fb.group({
      copd_Descripcion: ['', Validators.required],
      copd_Documento: ['', Validators.required]
    });
    this.formPaises = this.fb.group({
      pais: [''],
      estado: [''],
      ciudad: [''],
    });
  }

  private apiUrl: string = environment.apiUrl;
  private uploads = `${this.apiUrl}/uploads/`;
  private uploads2 = `${this.apiUrl}/`;
  //Primer carga
  onRouteChange(): void {
    this.ngOnInit();
  }
  handleInputInsumo(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;
  
    // Solo permitir letras y un espacio después de cada letra
    inputElement.value = texto
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');
  
    // Actualizar el valor en el formulario
    this.formInsumo.controls['insu_Descripcion'].setValue(inputElement.value);
  }

  handleInputCategoria(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;
  
    // Solo permitir letras y un espacio después de cada letra
    inputElement.value = texto
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');
  
    // Actualizar el valor en el formulario
    this.formInsumo.controls['cate_Descripcion'].setValue(inputElement.value);
  }

  handleInputSuca(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;
  
    // Solo permitir letras y un espacio después de cada letra
    inputElement.value = texto
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');
  
    // Actualizar el valor en el formulario
    this.formInsumo.controls['suca_Descripcion'].setValue(inputElement.value);
  }

  handleInputMaterial(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;
  
    // Solo permitir letras y un espacio después de cada letra
    inputElement.value = texto
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');
  
    // Actualizar el valor en el formulario
    this.formInsumo.controls['mate_Descripcion'].setValue(inputElement.value);
  }

  
  handleInputUnidad(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;
  
    // Solo permitir letras y un espacio después de cada letra
    inputElement.value = texto
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');
  
    // Actualizar el valor en el formulario
    this.formUnidad.controls['unme_Nombre'].setValue(inputElement.value);
  }

  
handleInputNumeroPrecio(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  const texto = inputElement.value;

  // Only allow numbers
  inputElement.value = texto
    .replace(/[^0-9]/g, '')  // Remove any non-numeric characters
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space (if spaces were allowed)
    .replace(/^\s/, '');     // Trim leading whitespace (if spaces were allowed)

  // Update the value in the form
  this.formUnidad.controls['inpp_Preciocompra'].setValue(inputElement.value);
}

  
handleMaquinaria(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  const texto = inputElement.value;

  // Solo permitir letras y un espacio después de cada letra
  inputElement.value = texto
  .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  .replace(/\s{2,}/g, ' ')
  .replace(/^\s/, '');

  // Actualizar el valor en el formulario
  this.formMaquinaria.controls['maqu_Descripcion'].setValue(inputElement.value);
}


handleInputNumeroPrecioMaquinaria(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  const texto = inputElement.value;

  // Only allow numbers
  inputElement.value = texto
    .replace(/[^0-9]/g, '')  // Remove any non-numeric characters
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space (if spaces were allowed)
    .replace(/^\s/, '');     // Trim leading whitespace (if spaces were allowed)

  // Update the value in the form
  this.formMaquinaria.controls['maqu_UltimoPrecioUnitario'].setValue(inputElement.value);
}


  
handleEquipo(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  const texto = inputElement.value;

  // Solo permitir letras y un espacio después de cada letra
  inputElement.value = texto
  .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  .replace(/\s{2,}/g, ' ')
  .replace(/^\s/, '');

  // Actualizar el valor en el formulario
  this.formEquipo.controls['equs_Nombre'].setValue(inputElement.value);
}
  
  async ngOnInit() {



  
    this.Cotizaciones = [];
  
    this.CotizacionesTabla = [];
  
    this.file = null
  
    this.expandedRows = {};
  
    this.TablaMaestra = [];
  
    this.UnidadesMedida = [];
  
    this.filteredCotizacionesTabla = [];
  
    this.ModalEliminarImagen = false
    this.subirItem= [];
    this.itemsDocumentos = [];
  
    this.Index = true;
  
    this.Create = false;
  
    this.Detail = false;
  
    this.Delete = false;
  
  


  

  
    this.id = 0;
  
    this.idInsumo = 0;
  
    this.idEquipo = 0;
  
    this.idProveedor = 0;
  
    this.idMaquinaria = 0;
  
    this.ModalInsumo = false;
  
    this.ModalMaquinaria = false;
  



  


 
    this.ModalImpuesto= false;
  
    this.ModalFinalizars = false;
  

  
    this.ValorImpuesto = 0.00;
  
    this.IncluidoImpuesto = false;
  
    this.subtotal = 0.00;
  
    this.tax = 0.00;
  
    this.total = 0.00;
  
    this.activeIndex = 0;
  
    this.dhTab = true;
  
    this.tabInsumo = false;
  
    this.tabMaquinaria = false;
  
    this.tabEquiposSeguridad = false;
  
    this.selectCheckbox = [];
  
    this.selectAll = false
  
    this.coti_Id = 0;
  
    this.detailItems = [];
  
    this.proveedorFormulario = false;
  
    
 


  
   
  
    this.botonCrear = false;
  
    this.filtroboton = false;
  
    this.radioButton = 1;
  
    this.EncabezadoMedida = ""
  
    this.EncabezadoCantidad= ""
  
    this.confirmar  = false;
  
    this.confirmarCotizacion =  false;
  
    this.ConfirmarInsumo = false;
  
    this.ConfirmarInsumoBoton = false;
  

  
    this.ModalMaquinariaEliminar = false;
  
   
  
    this.ModalMaquinariaCrear= false;
  
    this.ConfirmarCrearMaquinaria= false;
  
    this.ModalInsumoEliminar= false;
  
    this.idUnidad = "";
  
    this.ModalEquipoCrear = false;
  
    this.ConfirmarCrearEquipo = false;
  
   this. ModalEquipoEliminar= false;
  

  
    this.ModalProveedor = false;
  
    this.Enviado= false;
  
    this.IndexDocumentos = false;
  
    this.previewImage = null;
  
    this.previewPDF = null;
    
    this.previewFile= null;
   
  
    this.ImagenSubida = [];
    this.PDFSubida = [];//obtiene la lista para la pf subida
    this.WordSubida = [];

    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
     //Llamamos a la nomenclatura de la moneda para setearla en el HTML
     if (!this.globalMoneda.getState()) {
      this.globalMoneda.setState()
    }
    if (this.cookieService.get("Compra") != "0") {
      // this.service.Eliminar(parseInt(this.cookieService.get("Compra"))).subscribe(
      //   (respuesta: Respuesta) => {
      //   }
      // );
      this.cookieService.set("Compra","0");
      await this.Listado();
    }else{
      this.Listado();
    }
   
    

    //Seteamos los datos en la tabla y tambien llenamo el listado de los autocompletes
    
    this.ListarProveedores();
    this.ListarInsumos();
    this.ListarCategorias();
    this.ListarMateriales();
    this.ListarUnidadesDeMedida();
    this.ListarMaquinaria();
    this.ListarNiveles();
    this.ListarEquiposSeguridad();


    
   




    //Menu de opciones
    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit' , command: (event) => this.EditarCoti() },
      { label: 'Finalizar', icon: 'pi pi-check',   command: (event) => this.ModalFinalizar() },
      { label: 'Documentos', icon: 'pi pi-upload', command: (event) => this.AbrirDocumentos() } // Trigger file uploader
    ];

    this.itemsDocumentos = [
      { label: 'Documentos', icon: 'pi pi-eye',   command: (event) => this.AbrirDocumentos() },
    ];


  }


  //Listado de la tabla principal
  async Listado() {
    //Mostramos el cargando
    this.isLoading = true;
    //Subscripcion para traer los datos para seteearlos en la tabla
    this.service.Listar().subscribe(
      (data: any) => {

        //Mapeamos y parseamos las fechas
        this.Cotizaciones = data.map((Cotizaciones: any) => ({
          ...Cotizaciones,
          coti_FechaCreacion: new Date(Cotizaciones.coti_FechaCreacion).toLocaleDateString(),
          coti_FechaModificiacion: new Date(Cotizaciones.coti_FechaModificiacion).toLocaleDateString()

        }));
        this.expandedRows ={}
        //Si es mayor a 0 ocultara el cargando, de lo contrario no
        if (this.Cotizaciones.length > 0) {
          this.isLoading = false
        }else{
          this.isLoading = true
        }
      }
    );
  }
  //Seteamos en el autocomplete una lista de proveedores
  async ListarProveedores() {
    this.proveedor = await this.proveedorService.Listar();
    this.proveedor = this.proveedor.sort((a, b) => a.prov_Descripcion.localeCompare(b.prov_Descripcion))
  }
  //Seteamos en el autocomplete una lista de insumos
  async ListarInsumos() {
    this.insumos = await this.service.ListarInsumos();
    this.insumos = this.insumos.sort((a, b) => a.insumos.localeCompare(b.insumos))
  }

  //Seteamos en el autocomplete una lista de categorias
  async ListarCategorias() {
    this.categoria =  await this.service.ListarCategorias();
    console.log(this.categoria, 'En el sistema')
    this.categoria = this.categoria.sort((a, b) => a.cate_Descripcion.localeCompare(b.cate_Descripcion))
 }
  //Seteamos en el autocomplete una lista de materiales
  async ListarMateriales() {
      this.material = await this.materialService.Listar();
      this.material = this.material.sort((a, b) => a.mate_Descripcion.localeCompare(b.mate_Descripcion))
  }
  //Seteamos en el autocomplete una lista de unidades de medida
 async ListarUnidadesDeMedida() {
    this.unidad = await this.service.listarUnidadesDeMedida();
    this.unidad =  this.unidad.sort((a, b) => a.unme_Nombre.localeCompare(b.unme_Nombre))
  }
//Seteamos en el autocomplete una lista de maquinaria
  ListarMaquinaria() {
    this.service.ListarMaquinaria()
    .then((data) => this.maquinaria = data.sort((a, b) => a.maqu_Descripcion.localeCompare(b.maqu_Descripcion)))
  }

  //Seteamos en el autocomplete una lista de niveles
  ListarNiveles() {
    this.service.ListarNiveles().subscribe(
      (nivel: Nivel[]) => {
        this.nivel = nivel.sort((a, b) => a.nive_Descripcion.localeCompare(b.nive_Descripcion));
      }
    );
  }


  //Funcion que al tocar un row mostrar los detalles de esa parte en principal
  onRowExpand(event: any): void {
    const coti = event.data;
    this.expandedRows = {};
    //Llamos a la funcion para seteear los detalles.
    this.ListarTablaMaestra(coti.coti_Id);
  }

  //Cargamos la tabla maestra al momento de tocar el onRowExpand
  ListarTablaMaestra(Coti : any) {
    //Subscripcion para traer los detalles de una fila
    this.service.BuscarTablaMaestra(Coti).subscribe(
      (insu: TablaMaestra[]) => {
        //Seteamos los datos en un variable
        this.TablaMaestra = insu;
        //Expandimos la fila para ver los detalles
        this.expandedRows[Coti] = true;
      }
    );
  }

  //Cierra los detalles de la fila
  onRowCollapse(event) {
    delete this.expandedRows[event.coti_Id];
  }

  //Filtro en las tablas
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  //Ocultamos y mostramos
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


  //Resetear formulario
  reseteoFormularios(){
    this.form.reset();
    this.formInsumo.reset();
    this.formMaquinaria.reset();
    this.formEquipo.reset();
    this.submitted = false;
  }

  //Resetear valores id
  reseteoIDS(){
    this.idInsumo= 0;
    this.idProveedor = 0;
    this.id = 0;
    this.idMaquinaria = 0;
    this.idEquipo = 0;
  }

  //Crear Cotizacion
  CrearCotizacion() {
    //Se cierran los collaps
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.Enviado = false;
    //Reseto de formularios
    this.reseteoFormularios();

    //Indicamos la accion y el titulo sera nuevo
    this.identity = "crear";
    this.titulo= "Nueva"

    this.EncabezadoCantidad = "Cantidad";
    this.EncabezadoMedida = "Medida";

    //Id en inicio de 0
    this.reseteoIDS();


    //Asignar la fecha de hoy
    const today = new Date();
    this.form.patchValue({
      coti_Fecha: today
    });

    //Cargar tabla de cotizacion
    this.ListarTablaCotizacion(this.idProveedor,0)
    //Abrir modal y traer el impuesto para la inserccion
    this.ModalImpuesto = true;
    this.ListadoImpuesto()
    this.selectCheckbox = [];
    //Habililtar proveedores y fecha
    this.form.get('prov_Descripcion').enable();
    this.form.get('coti_Fecha').enable();
    //Ocultamos tab y el filtrado de boton
    this.botonCrear = false;
    this.filtroboton = false;
    this.tabEquiposSeguridad = false;
    this.tabInsumo = false;
    this.tabEquiposSeguridad = false;
    this.selectAll = false;
    this.dhTab = true;
    this.confirmar = false;
  }

    //Cargar impuesto
    ListadoImpuesto() {
      this.service.ListarImpuesto().subscribe(
        (data: any) => {
          this.ValorImpuesto = data[0].impu_Porcentaje
        }
      );
    }

  //La eleccion para saber si esta incluida el impuesto
  ConImpuesto(event){
    this.ModalImpuesto = false;
    if (event == "Si") {
      this.IncluidoImpuesto = true;
      this.LabelIncluido = "Sí"
    }else {
      this.IncluidoImpuesto = false;
       this.LabelIncluido = "No"
    }
  }

  //Cargar tabla
  async ListarTablaCotizacion(Prov: any, Coti: any) {
    this.isLoading = true
    //Seteamos los datos en la tabla de cotizaciones, y respectivamente hace el filtrado de cotizaciones y luego una funcion para sacar el total
    await this.service.BuscarTablaCotizacion(Prov, Coti).then(
      async (insu: CotizacionTabla[]) => {
        this.CotizacionesTabla = insu;
        const RaddioButton = true;
        //Una vez seteamos iniciamos el filtrado
        await this.filterCotizaciones(RaddioButton);
        this.isLoading = false
        //Una vez seteamos los datos sacamos el total para mostarlo
        this.TotalsEdit();

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
      
      this.updateTotals();
    } else {
      this.updateTotals();
    }
    coti.total = coti.cantidad * coti.precio;
  }

   //Actualiza el label del total.
   updateUnidad(coti: any) {
    //Actualizamos el total de la fila a la cual estemos cambiando la cantidad o el precio
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

  }

  //Filtrado de proveedores
  filterProveedores(event) {
    let query = event.query.toLowerCase();
    this.filteredProveedores = this.proveedor.filter(prov =>
        prov.prov_Descripcion.toLowerCase().includes(query));
}

  //Cuando selecciona un proveedor actualiza la tabla
  async SelectProveedores(event: any){

    this.form.patchValue({
      prov_Descripcion: event.value.prov_Descripcion
    });
    //Una funcion para traer los articulos, o si crea un proveedor si no exista
    await this.HabilitarProveedores();
  }
  //HabilitadoProveedores
  async HabilitarProveedores() {
    const RaddioButton = true;
    //Iniciamos con el id en 0 que esto se usara para el crear
    this.id = 0;

    //Sacamos el id del proveedor mediante un LinQ
    this.idProveedor = this.proveedor.find(proveedor => proveedor.prov_Descripcion == this.form.value.prov_Descripcion)?.prov_Id ?? 0;

    //Si el proveedor existe entrara a este if
    if (this.idProveedor != 0) {
      //Si el proveedor es diferente a 0 llamaos a su listado
      const tabs = this.proveedor.find(proveedor => proveedor.prov_Descripcion == this.form.value.prov_Descripcion).venta;



      //Ahora procedemos a traer los tabs que tiene ese proveedor

      //Cerramos todos los tabs y bloqueamos
      this.dhTab = true;
      this.tabMaquinaria = false;
      this.tabInsumo = false;
      this.tabEquiposSeguridad = false;
      this.filtroboton = false;
      //Iniciamos la busqueda

      if (tabs == "Insumos") {

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

      //Si no existe el proveedor creamos uno nuevo
      this.dhTab = true;
      this.tabMaquinaria = false;
      this.tabInsumo = false;
      this.tabEquiposSeguridad = false;
      this.proveedorFormulario = true;
      this.proveedorForm.prov_Descripcion = this.form.value.prov_Descripcion;
      this.ciudades = [];
      this.estados = [];
      this.paisService.Listar().subscribe((data: any) => { this.paises = data.data.sort((a, b) => a.pais_Nombre.localeCompare(b.pais_Nombre))});
      this.submitted = false;
      this.Create = false;
    }
  }
  //Crear proveedor si le da al boton de guardar
  async CreateProveedor(){
    this.HabilitarProveedores();
  }
  //Vuelve a la pantalla de crear cotizacion
  async cerrarProveedor(){
    this.proveedorFormulario = false;
    this.Create = true;
    this.submitted = false;
  }

  //Filtro del autocompleatdo para ciudades
  searchCiudades(event) {
    this.filteredCiudades = this.ciudades.filter(ciudad =>
      ciudad.ciud_Descripcion.toLowerCase().includes(event.query.toLowerCase())
    );
  }
    //Filtro del autocompleatdo para estados
  searchEstados(event) {
    this.filteredEstados = this.estados.filter(estado =>
      estado.esta_Nombre.toLowerCase().includes(event.query.toLowerCase())
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
          .then(data => this.estados = data.sort((a, b) => a.esta_Nombre.localeCompare(b.esta_Nombre)));
    }
    // Onchange Estados  y aqui agarramos el id de estados
    async filtrarCiudades(event){
      this.formPaises.patchValue({ estado:event.value.esta_Nombre});
      let id = this.estados.find(estado => estado.esta_Nombre === event.value.esta_Nombre).esta_Id;
      await this.ciudadService.DropDownByState2(event.value.esta_Id)
          .then(data => this.ciudades = data.sort((a, b) => a.ciud_Descripcion.localeCompare(b.ciud_Descripcion)));
    }

  //   onchange Ciudades y aqui agarramos el id de ciudades
  async ciudadOnchange(event){
      this.formPaises.patchValue({ ciudad:event.value.ciud_Descripcion});
      this.proveedorForm.ciud_Id = event.value.ciud_Id
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

//Le preguntamos al usuario si esta seguro de crear el proveedor
ModalCrearProveedor(){
  this.submitted = true;
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

  
  //Verificamos si no tiene campos vacios, de lo contrario pedira que sean llenados
  if (this.submitted && this.proveedorForm.prov_Descripcion?.trim() && this.formPaises.valid && this.proveedorForm.prov_InsumoOMaquinariaOEquipoSeguridad != null && this.validarCorreo()) {
  this.ModalProveedor = true;
  }
}

//Guardamos al proveedor y traemos el registro que aparezca seleccionado en el autocomplete
  async guardarProveedor() {
      //Verificamos si no tiene campos vacios, de lo contrario pedira que sean llenados
      
     

      if (this.submitted && this.proveedorForm.prov_Descripcion?.trim() && this.formPaises.valid && this.proveedorForm.prov_InsumoOMaquinariaOEquipoSeguridad != null) {
          try {
              let response;

              this.proveedorForm.ciud_Id = this.ciudades.find(ciudad => ciudad.ciud_Descripcion === this.formPaises.value.ciudad).ciud_Id;


              //Enviamos el formulario a un endopoint esperando un menssaje de respuesta si se inserto con exito
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
                detail,
                life: 3000,styleClass:'iziToast-custom'
              });



              //Si es exitosa la respuesta se creara el usuario
              if (response.code == 200 && response.data.codeStatus > 0) {
                //Seteamos a los proveedores en el autocomplete para traer ese registro ya creado
                await this.ListarProveedores()
                //Se lo cargamos para que venga cargado
                this.form.patchValue({
                  prov_Descripcion: this.proveedorForm.prov_Descripcion
                })
                //Reiniciamos el formulario
                  this.submitted = false;
                  this.proveedorForm = {usua_Creacion: parseInt(this.cookieService.get('usua_Id'))};
                  //Usamos la funcion para cargar los tabs que tiene y sus opciones
                  await this.HabilitarProveedores()
                  //Cerramos el formulario y mostramos el crear
                  
                  this.proveedorFormulario = false;
                  this.Create = true
                 
              }
              this.ModalProveedor = false;

          } catch (error) {
            //De lo contrario se mostrara un error de que no se creo.
              this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: error.message || error,
                  life: 3000,styleClass:'iziToast-custom'
              });
          }
      }else{
       
      }

  }




  //Cuando el le da check envia la informacion para guardarlo
  onCheckboxChange(event: any, cantidad: any, precio: any, Id: any, categoria: any, unidad: any, esMaquinaria: any) {
    //Tomamos lo que trae bit, si es 0 es maquinaria, si es 1 Insumo y si es 2 es equipo
    let bit = 0
    if (categoria == "Maquinaria" ) {
      bit = 0
    }else  if (categoria == "Insumo" ){
      bit = 1
    }else  if (categoria == "Equipo" ){
      bit = 2
    }

    // Buscar y actualiza ese registro con los nuevos datos
    this.selectCheckbox = this.selectCheckbox.filter(item => !(item.cime_Id === Id && item.cime_InsumoOMaquinariaOEquipoSeguridad === bit));
    let horasODias = 1;
    if (esMaquinaria == "Días" || esMaquinaria == "Horas" || esMaquinaria == "Viajes") {
      horasODias = unidad
    }
    //Si el evento esta marcado entrara
    if (event.checked != false) {
      if (this.idProveedor != 0) {
        //Llenamos el formulario con los datos respectivos para ser enviados
        const CotizacionesViewModel: any = {
          coti_Id: this.id, //Id del encabezado
          prov_Id: this.idProveedor, //Id del proveedor
          coti_Fecha: this.form.value.coti_Fecha, //Fecha
          empl_Id: 2, //Empleado
          coti_Incluido: this.IncluidoImpuesto, //Impuesto incluido
          code_Cantidad: cantidad, //Cantidad
          code_PrecioCompra: precio, //Precio
          cime_Id: Id, //Id ya sea insumo, maquinaria o equipo de seguridad
          cime_InsumoOMaquinariaOEquipoSeguridad: bit, //Si es Maquinaria, Insumo o Equipo de seguridad
          usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
          usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
          code_Renta:horasODias, //Si es hora, dias, viaje entonces enviara eso
          check: true, //Le decimos que si es true es por que va insertar
          coti_CompraDirecta: false
        };
        //Desactivamos el proveedor para que no pueda cambiarlo
        this.form.get('prov_Descripcion').disable();
        this.form.get('coti_Fecha').disable();
        //Se desactiva el boton del proveedor
        this.botonCrear = true;

        //Se guardar el registro en un arreglo posteriormente para ser enviado
        this.selectCheckbox.push(CotizacionesViewModel);
      } else {
        //De lo contrario va mostrar que faltan datos por ingresar
        this.submitted = true;
      }
    } else {
      //Si es false se le va indicar que ese registro esta siendo eliminado
      const CotizacionesViewModel: any = {
        coti_Id: this.id,
        prov_Id: this.idProveedor,
        coti_Fecha: this.form.value.coti_Fecha,
        empl_Id: 2,
        coti_Incluido: this.IncluidoImpuesto,
        code_Cantidad: cantidad,
        code_PrecioCompra: precio,
        cime_Id: Id,
        cime_InsumoOMaquinariaOEquipoSeguridad: bit,
        usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
        check: false,
        coti_CompraDirecta: false
      };
      this.selectCheckbox.push(CotizacionesViewModel);
    }
    //Actualizamos el total, subtototal, e impuestp
    this.updateTotals();
    //Verificamos si se marco todo
    this.TotalCheck();
  }

  onSelectAllChange(event: any, coti: any) {
    //Desabilita el boton de crear proveedores
    this.botonCrear = true;
    //Si esta marcado entrara.
    if (event.checked) {
      // Seleccionar todos los elementos y agregarlos a this.selectCheckbox
        this.filteredCotizacionesTabla.forEach(coti => {
        let bit = 0
        //dependiendo la categoria guardara el identificador.
        if (coti.categoria == "Maquinaria" ) {
          bit = 0
        }else  if (coti.categoria == "Insumo" ){
          bit = 1
        }else  if (coti.categoria == "Equipo" ){
          bit = 2
        }


        // Buscar y actualizar el elemento existente
        this.selectCheckbox = this.selectCheckbox.filter(item => !(item.cime_Id === coti.idP && item.cime_InsumoOMaquinariaOEquipoSeguridad === bit));
        let horasODias = 1;
        if (coti.medidaORenta == "Días" || coti.medidaORenta == "Horas"  || coti.medidaORenta == "Viajes") {
          horasODias = coti.unidad
        }
        //Creamos el formulario para guardarlo en un arreglo
        const CotizacionesViewModel: any = {
          coti_Id: this.id,
          prov_Id: this.idProveedor,
          coti_Fecha: this.form.value.coti_Fecha,
          empl_Id: 2,
          coti_Incluido: this.IncluidoImpuesto,
          code_Cantidad: coti.cantidad,
          code_PrecioCompra: coti.precio,
          cime_Id: coti.idP,
          cime_InsumoOMaquinariaOEquipoSeguridad: bit,
          usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
          usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
          code_Renta:horasODias,
          check: true,
          coti_CompraDirecta: false
        };
        //Guardamos el arreglo
        this.selectCheckbox.push(CotizacionesViewModel);
        coti.agregadoACotizacion = true;
      });
    } else {
      //Si esta marcado pero quita esa marca entonces entra
      this.filteredCotizacionesTabla.forEach(coti => {
        let bit = 0
           //dependiendo la categoria guardara el identificador.
        if (coti.categoria == "Maquinaria" ) {
          bit = 0
        }else  if (coti.categoria == "Insumo" ){
          bit = 1
        }else  if (coti.categoria == "Equipo" ){
          bit = 2
        }
        coti.agregadoACotizacion = false;
        // Actualiza los elementos del arreglo
        this.selectCheckbox = this.selectCheckbox.filter(item => !(item.cime_Id === coti.idP && item.cime_InsumoOMaquinariaOEquipoSeguridad === bit));
        //Crea o actualiza el formulario
        const CotizacionesViewModel: any = {
          coti_Id: this.id,
          prov_Id: this.idProveedor,
          coti_Fecha: this.form.value.coti_Fecha,
          empl_Id: 2,
          coti_Incluido: this.IncluidoImpuesto,
          code_Cantidad:  coti.cantidad,
          code_PrecioCompra: coti.precio,
          cime_Id: coti.idP,
          cime_InsumoOMaquinariaOEquipoSeguridad: bit,
          usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
          usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
          check: false,
          coti_CompraDirecta: false
        };
        this.selectCheckbox.push(CotizacionesViewModel);
      });
    }
    //Desactiva los campos de fecha y proveedores
    this.form.get('prov_Descripcion').disable();
    this.form.get('coti_Fecha').disable();
    //Actualiza el Total, Subtotal e impuesto
    this.updateTotals();
  }
  verificarInputCantidad(coti: any){
    
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
        
        this.updateTotals();
      } else {
        this.updateTotals();
      }

      coti.total = coti.precio = coti.cantidad
    }
  }

  verificarUnidad(coti: any){
   
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
        
        this.updateTotals();
      } else {
        this.updateTotals();
      }

      coti.total = coti.precio = coti.cantidad
    }
  }
  verificarInputPrecio(coti: any){
 
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
        
        this.updateTotals();
      } else {
        this.updateTotals();
      }

      coti.total = coti.precio = coti.cantidad
    }
  }
    //Guarda la cotizacion con sus detalles
    Guardar() {
     //Si el arreglo es mayor a 0 significa que selecciono. 
      if (this.selectCheckbox.length > 0) {
        //Si es false se abrira insertara la cotizacion
      if (this.confirmar == false) {
        this.service.Insertar(this.selectCheckbox).subscribe(
          (respuesta: Respuesta) => {
            //Si el id es diferente a 0 es por que esta creado
            if (this.id != 0 ) {
              //Y va a un tab que no sea el principal entonces no nostrar nada
              if (this.activeIndex == 1 ||  this.activeIndex == 2 ||  this.activeIndex == 3) {

              }else {
                //De lo contrario si le da guardar y esta en el index 0, mostrar en caso sea editar el mensaje de editado o guardado
                if (this.identity == 'editar') {
                  this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
                }
               else{
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
               }
               //Reiniciamos el listado y cerramos la cotizacion
                this.Listado();
                this.confirmarCotizacion = false;
                this.Index = true;
                this.Detail = false;
                this.Create = false;
                this.IndexDocumentos = false;
              }

            }else{
              //Guardar el id que trae la respuesta
              this.id = respuesta.data.codeStatus
              this.cookieService.set("Compra",this.id.toString());
              //E implementarla en todos los arreglos
              this.selectCheckbox.forEach(item => {
                item.coti_Id = this.id;
              });
              //Y va a un tab que no sea el principal entonces no nostrar nada
              if (this.activeIndex == 1 ||  this.activeIndex == 2 ||  this.activeIndex == 3 ) {

              }else {
                 //De lo contrario si le da guardar y esta en el index 0, mostrar en caso sea editar el mensaje de  guardado
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 ,styleClass:'iziToast-custom'});
                //Reiniciamos el listado y cerramos la cotizacion
                this.Listado();
                this.Index = true;
                this.Detail = false;
                this.Create = false;
                this.IndexDocumentos = false;
                this.confirmarCotizacion = false;
              }
            }


          }
        ); }else if (this.Enviado == true){
          //Si es true abrira el modal y pondra en false el confirmar para que se inserte la cotizacion
          this.confirmar = false
          this.confirmarCotizacion = true;
        }
      } else {
        //De lo contrario si esta moviendose para el tab1, tab 2 o tab 3 se omitira la validacion de que tiene que insertar algo
        if (this.activeIndex == 1 ||  this.activeIndex == 2 ||  this.activeIndex == 3 ) {
        //De lo contrario si le da guardar le pedira que seleccione un articulo
        }else {
          if (!this.form.valid) {
            this.submitted = true
          }else{
            if (this.idProveedor == 0) {
              this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'No existe el proveedor.', life: 3000,styleClass:'iziToast-custom' });
              return;
            }else{
              this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Seleccione un Insumo.', life: 3000,styleClass:'iziToast-custom' });
            }
          
          }
        
         
        }
      }
    }

    GuardarArreglosEditado() {
      //Si el arreglo es mayor a 0 significa que selecciono. 
      
         //Si es false se abrira insertara la cotizacion
         this.service.Insertar(this.selectCheckbox).subscribe(
           (respuesta: Respuesta) => {
             //Si el id es diferente a 0 es por que esta creado
             if (this.id != 0 ) {
               //Y va a un tab que no sea el principal entonces no nostrar nada
               if (this.activeIndex == 1 ||  this.activeIndex == 2 ||  this.activeIndex == 3) {
 
               }else {
                 //De lo contrario si le da guardar y esta en el index 0, mostrar en caso sea editar el mensaje de editado o guardado
                 if (this.identity == 'editar') {
                   this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
                 }
                else{
                 this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
                }
                //Reiniciamos el listado y cerramos la cotizacion
                 
               }
 
             }
 
 
           }
         );
       
     }
    GuardarEditado() {
      //Si el arreglo es mayor a 0 significa que selecciono. 
       
         //Si es false se abrira insertara la cotizacion
         const CotizacionesViewModel: any = {
          coti_Id: this.id,
          prov_Id: this.idProveedor,
          coti_Fecha: this.fecha,
          empl_Id: 2,
          coti_Incluido: this.IncluidoImpuesto,
          code_Cantidad:  0,
          code_PrecioCompra: 0,
          cime_Id: 0,
          cime_InsumoOMaquinariaOEquipoSeguridad: 0,
          usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
          usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
          check: false,
          coti_CompraDirecta: false
        };
        this.selectCheckbox.push(CotizacionesViewModel);
         this.service.Insertar(this.selectCheckbox).subscribe(
           (respuesta: Respuesta) => {
                 this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
                 this.Listado();
                 this.confirmarCotizacion = false;
                 this.Index = true;
                 this.Detail = false;
                 this.Create = false;
                 this.IndexDocumentos = false; 
           }
         ); 
        
       
     }



    //Abre el modal de confirmar guardar
    confirmarCoti(){
      this.cookieService.set("Compra","0");
      if (this.identity != 'editar') {
        this.Guardar();
      }else{ 
        this.confirmarCotizacion = true;
      }
     
     
    }

    //Actualiza los totales,subtotales y impuestos.
    updateTotals(): void {
      // Sumamos el subtotal de todos los ítems que han sido agregados a la cotización
      this.subtotal = this.CotizacionesTabla
      // Filtramos los ítems que han sido marcados como agregados a la cotización
      .filter(item => item.agregadoACotizacion)
      // Usamos reduce para sumar la cantidad multiplicada por el precio de cada ítem
      .reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
      //Si el impuesto esta incluido se realizara una formula para quitarselo
      if (this.IncluidoImpuesto == true) {

        const impuestoIncluido = (parseFloat(this.ValorImpuesto) / 100) + 1
        const impuesto = parseFloat(this.ValorImpuesto) / 100
        this.subtotal = this.subtotal / impuestoIncluido;
        this.tax = this.subtotal * impuesto;
        this.total = this.subtotal + this.tax;
      }else {
        //Si el impuesto no esta incluido se realizara una formula para implementarlo
     
        const impuesto = parseFloat(this.ValorImpuesto) / 100

        this.tax = this.subtotal * impuesto;

        this.total = this.subtotal + this.tax;
      }
    }
    //Cambiamos de tab para si es insumo o maquinaria
    async onTabChange(event: any) {
      //El tab principal siempre sera 0
      if (event.index === 0) {
        this.activeIndex = 0;
        //Validacion para moverse entre tabs sin que el modal de confirmacion
        this.Enviado = false
        //Cambiar el titulo si es editar
         if (this.identity == 'editar') {
            this.titulo = "Editar"
            }
        //Seteamos el listado en la tabla
      await this.ListarTablaCotizacion(this.idProveedor,this.id)

      this.CotizacionesTabla.forEach(coti => {
        let bit = 0
        //dependiendo la categoria guardara el identificador.
        if (coti.categoria == "Maquinaria" ) {
          bit = 0
        }else  if (coti.categoria == "Insumo" ){
          bit = 1
        }else  if (coti.categoria == "Equipo" ){
          bit = 2
        }
  
  
        // Buscar y actualizar el elemento existente
        if (coti.agregadoACotizacion == true) {
          this.selectCheckbox = this.selectCheckbox.filter(item => !(item.cime_Id === coti.idP && item.cime_InsumoOMaquinariaOEquipoSeguridad === bit));
        let horasODias = 1;
        if (coti.medidaORenta == "Días" || coti.medidaORenta == "Horas"  || coti.medidaORenta == "Viajes") {
          horasODias = coti.unidad
        }
        //Creamos el formulario para guardarlo en un arreglo
        const CotizacionesViewModel: any = {
          coti_Id: this.id,
          prov_Id: this.idProveedor,
          coti_Fecha: this.form.value.coti_Fecha,
          empl_Id: 2,
          coti_Incluido: this.IncluidoImpuesto,
          code_Cantidad: coti.cantidad,
          code_PrecioCompra: coti.precio,
          cime_Id: coti.idP,
          cime_InsumoOMaquinariaOEquipoSeguridad: bit,
          usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
          usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
          code_Renta:horasODias,
          check: true,
          coti_CompraDirecta: false
        };
        //Guardamos el arreglo
        this.selectCheckbox.push(CotizacionesViewModel);
        }
        
      });
      }
      if (event.index === 1) {
        //Este puede ser insumo o maquinaria
        this.activeIndex = 1;
        //Si el id es 0 y o el enviado es falso, guardar el registro por si agrega mas insumos, maquinarias o equipos
        if (this.id == 0 || this.Enviado == false) {
          this.Guardar()
        }

        //Validacion en si
        this.Enviado = true;
        this.ListarCategorias()
        this.ListarInsumos()
        this.ListarMateriales()
        //Reseteamos los formularios y seteamos los listados para los autocompletados
        this.formMaquinaria.reset();
        this.ListarMaquinariaPorProveedores(this.idProveedor)

        this.formEquipo.reset();
        this.ListarEquiposPorProveedores(this.idProveedor)

        this.formInsumo.reset();
        this.formUnidad.reset();

        //Titulo sera nuevo por la creacion de insumos
        this.idInsumo = 0;
        this.titulo = "Nueva"
        this.submitted = false;
        this.ListarTablaDeMedidas(this.idProveedor,this.idInsumo)
      }
      if (event.index === 2) {
        //Este tab puede ser maquinaria o equipo seguridad
        this.activeIndex = 2;
         //Si el id es 0 y o el enviado es falso, guardar el registro por si agrega mas insumos, maquinarias o equipos
        if (this.id == 0 || this.Enviado == false) {
          this.Guardar()
        }
        //Validacion en si
        this.Enviado = true;
        //Titulo sera nuevo por la creacion de insumos
        this.titulo = "Nueva"
        //Reseteamos los formularios y seteamos los listados para los autocompletados
        this.formMaquinaria.reset();
        this.ListarMaquinariaPorProveedores(this.idProveedor)
        this.formEquipo.reset();
        this.ListarEquiposPorProveedores(this.idProveedor)
        this.submitted = false;

      }

      if (event.index === 3) {
        //Este tab sera equipo de seguridad
        this.activeIndex = 3;
         //Si el id es 0 y o el enviado es falso, guardar el registro por si agrega mas insumos, maquinarias o equipos
        if (this.id == 0 || this.Enviado == false) {
          this.Guardar()
        }
        //Validacion en si
        this.Enviado = true;
        //Titulo sera nuevo por la creacion de insumos
        this.titulo = "Nueva"
        //Reseteamos los formularios y seteamos los listados para los autocompletados
        this.formEquipo.reset();
        this.ListarEquiposPorProveedores(this.idProveedor)
        this.submitted = false;

      }
      if (event.index != 0) {
        if (this.identity == 'editar') {
          this.GuardarArreglosEditado()
          }
      }
    


    }


 //Cargamos las tablas de medidas
 ListarTablaDeMedidas(Prov : any, Id : any) {
  //Proe para setear las medidas que tiene un insumo
  this.service.BuscarMedidasPorInsumo(Prov,Id).subscribe(
    (insu: UnidadesPorInsumo[]) => {
      this.UnidadesMedida = insu;
    }
  );
}

  //Cargamos las SubCategorias en el dropdown
  async ListarSubCategorias(event : any) {
  //Subscripcion para setear las categorias en un autocomplete
    await this.service.ListarSubCategorias(event).then(
      (sub: ddlSubcategoria[]) => {
        this.subCategoria = sub.sort((a, b) => a.suca_Descripcion.localeCompare(b.suca_Descripcion));
      },
      error => {
      }
    );
  }
   //Filtrar por insumo para los autocomplete
   filterInsumo(event: any) {
    const query = event.query.toLowerCase();
    this.filtradoInsumo = this.insumos.filter(empleado =>
      empleado.insumos.toLowerCase().includes(query)
    );
  }

  //FilterCategoria para los autocomplete
  filterCategoria(event: any) {
    const query = event.query.toLowerCase();
    this.filteredCategorias = this.categoria.filter(empleado =>
      empleado.cate_Descripcion.toLowerCase().includes(query)
    );
  }

  //Filtrado de subCategoria para los autocomplete
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

  //Filtrado de materiales para los autocomplete
  filterMateriales(event: any) {
    const query = event.query.toLowerCase();
    this.filteredMateriales = this.material.filter(empleado =>
      empleado.mate_Descripcion.toLowerCase().includes(query)
    );
  }

  //Filtrado de unidades para los autocomplete
  filterUnidades(event: any) {
    const query = event.query.toLowerCase();
    this.filteredUnidades = this.unidad.filter(empleado =>
      empleado.unme_Nombre.toLowerCase().includes(query)
    );
  }


  //Funcion al seleccionar un insumo
  onInsumoSelect(event: any) {
    //Guardamos el evento en una constante
    const insumoSeleccionado = event;

    //Seteamos el id del insumo
    this.idInsumo =insumoSeleccionado.value.insu_Id

    //Si existe ese insumo, setearemos categoria, subCategoria y el Material de ese insumo
    this.formInsumo.patchValue({ cate_Descripcion: insumoSeleccionado.value.cate_Descripcion, mate_Descripcion: insumoSeleccionado.value.mate_Descripcion, insu_Descripcion : insumoSeleccionado.value.insu_Descripcion });
    //Setearemos el id de la categoria para poder filtar con subCategoria
    let CategoriaID = this.categoria.find(cate => cate.cate_Descripcion === this.formInsumo.value.cate_Descripcion)?.cate_Id ?? 0;

    //Setearemos el listado de la subCategoria filtrado por Categoria
    this.ListarSubCategorias(CategoriaID)

    //Seteremos el valor de esa subCategoria
    this.formInsumo.patchValue({ suca_Descripcion: insumoSeleccionado.value.suca_Descripcion});

    //Llamaos a la unidades de medida que le pertenecen a insumo
    this.ListarTablaDeMedidas(this.idProveedor,insumoSeleccionado.value.insu_Id)
  }

    //Funcion al seleccionar una categoria
  onCategoriaSelect(event: any) {
    //Guardamos el evento en una constante
    const insumoSeleccionado = event;

    //En el formulario seteamos la descripcion de la categoria
    this.formInsumo.patchValue({ cate_Descripcion: insumoSeleccionado.value.cate_Descripcion});

    //Encontramos el id de la categoria para poder filtrar por subCategoria
    let CategoriaID = this.categoria.find(cate => cate.cate_Descripcion === this.formInsumo.value.cate_Descripcion)?.cate_Id ?? 0;

    //Setearemos el listado de la subCategoria filtrado por Categoria
    this.ListarSubCategorias(CategoriaID)
  }

  //Funcion al seleccionar un insumo
  onSubCategoriaSelect(event: any) {
    //Guardamos el evento en una constante
    const insumoSeleccionado = event;
    //En el formulario seteamos la descripcion de la SubCategoria
    this.formInsumo.patchValue({ suca_Descripcion: insumoSeleccionado.value.suca_Descripcion});
  }

    //Funcion al seleccionar un material
  onMaterialSelect(event: any) {
    //Guardamos el evento en una constante
    const insumoSeleccionado = event;
     //En el formulario seteamos la descripcion del material
    this.formInsumo.patchValue({ mate_Descripcion: insumoSeleccionado.value.mate_Descripcion});
  }

   //Funcion al seleccionar una unidad
  onUnidadSelect(event: any) {
    //Guardamos el evento en una constante
    const insumoSeleccionado = event;

    //En el formulario seteamos la descripcion de la unidad
    this.formUnidad.patchValue({ unme_Nombre: insumoSeleccionado.value.unme_Nombre});
  }


//Funcion blur
async blur(){
  this.idInsumo = this.insumos.find(insu => insu.insumos === this.formInsumo.value.insu_Descripcion)?.insu_Id ?? 0;
  if (this.idInsumo == 0) {
    this.ListarTablaDeMedidas(this.idProveedor,this.idInsumo)
  }else{

    //Si existe ese insumo, setearemos categoria, subCategoria y el Material de ese insumo

    //Setearemos el id de la categoria para poder filtar con subCategoria
    let CategoriaID = this.insumos.find(cate => cate.insumos === this.formInsumo.value.insu_Descripcion)?.cate_Id ?? 0;


    let CategoriaDesc = this.categoria.find(cate => cate.cate_Id === CategoriaID)?.cate_Descripcion ?? 0;

    await this.ListarSubCategorias(CategoriaID)
    let SubCategoriaID = this.insumos.find(cate => cate.insumos == this.formInsumo.value.insu_Descripcion)?.suca_Id ?? 0;

    let SubCategoriaDesc = this.subCategoria.find(cate => cate.suca_Id == SubCategoriaID)?.suca_Descripcion ?? 0;
    let MaterialID = this.insumos.find(cate => cate.insumos == this.formInsumo.value.insu_Descripcion)?.mate_Id ?? 0;
    let MaterialDesc = this.material.find(cate => cate.mate_Id == MaterialID)?.mate_Descripcion ?? 0;
    //Setearemos el listado de la subCategoria filtrado por Categoria


    //Seteremos el valor de esa subCategoria
    this.formInsumo.patchValue({ cate_Descripcion:CategoriaDesc , mate_Descripcion: MaterialDesc, insu_Descripcion : this.formInsumo.value.insu_Descripcion, suca_Descripcion:SubCategoriaDesc });
    //this.formInsumo.patchValue({ cate_Descripcion: CategoriaDesc, mate_Descripcion: insumoSeleccionado.value.mate_Descripcion, insu_Descripcion : SubCategoriaDesc });
    //Llamaos a la unidades de medida que le pertenecen a insumo
    this.ListarTablaDeMedidas(this.idProveedor,this.idInsumo)
  }
}
  //Guardamos el insumo en el boton de guardar principal
 async GuardarInsumo() {
    //Valdida si el formulario esta vacio para marcarselo en rojo
    if (this.formInsumo.valid && this.formUnidad.valid) {
      //Seteamos los detalles por si llega a existir un articulo que no existe, abrir el modal y enseñarselo
      this.deta_Insumo = "";
      this.deta_Categoria = "";
      this.deta_SubCategoria = "";
      this.deta_Material= "";
      this.deta_Unidad= "";
      let abrirModal = false;
       // Asignamos el ID del insumo buscando en la lista de insumos por la descripción
       this.idInsumo = this.insumos.find(insu => insu.insumos === this.formInsumo.value.insu_Descripcion)?.insu_Id ?? 0;

       // Si el ID del insumo es 0 (no encontrado) y el modal no está abierto, almacenamos la descripción del insumo y marcamos abrir el modal
       if (this.idInsumo == 0 && this.deta_Modal == false) {
         this.deta_Insumo = this.formInsumo.value.insu_Descripcion;
         abrirModal = true;
       }

       // Asignamos el ID de la categoría buscando en la lista de categorías por la descripción
       let CategoriaID = this.categoria.find(cate => cate.cate_Descripcion === this.formInsumo.value.cate_Descripcion)?.cate_Id ?? 0;

       // Si el ID de la categoría es 0 (no encontrado) y el modal no está abierto, almacenamos la descripción de la categoría y marcamos abrir el modal
       if (CategoriaID == 0 && this.deta_Modal == false) {
         this.deta_Categoria = this.formInsumo.value.cate_Descripcion;
         abrirModal = true;
       }

       // Asignamos el ID del material buscando en la lista de materiales por la descripción
       let MaterialId = this.material.find(mate => mate.mate_Descripcion === this.formInsumo.value.mate_Descripcion)?.mate_Id ?? 0;

       // Si el ID del material es 0 (no encontrado) y el modal no está abierto, almacenamos la descripción del material y marcamos abrir el modal
       if (MaterialId == 0 && this.deta_Modal == false) {
         this.deta_Material = this.formInsumo.value.mate_Descripcion;
         abrirModal = true;
       }

       // Inicializamos el ID de la subcategoría en 0
       let SucaId = 0;

       // Si la subcategoría existe y tiene elementos, buscamos el ID de la subcategoría por la descripción
       if (this.subCategoria && this.subCategoria.length > 0) {
         SucaId = this.subCategoria.find(suca => suca.suca_Descripcion === this.formInsumo.value.suca_Descripcion)?.suca_Id ?? 0;
       } else {
         // Si no hay subcategorías, el ID permanece en 0
         SucaId = 0;
       }

       // Si el ID de la subcategoría es 0 (no encontrado) y el modal no está abierto, almacenamos la descripción de la subcategoría y marcamos abrir el modal
       if (SucaId == 0 && this.deta_Modal == false) {
         this.deta_SubCategoria = this.formInsumo.value.suca_Descripcion;
         abrirModal = true;
       }

       // Asignamos el ID de la unidad buscando en la lista de unidades por el nombre
       let UnidadId = this.unidad.find(unida => unida.unme_Nombre === this.formUnidad.value.unme_Nombre)?.unme_Id ?? 0;

       // Si el ID de la unidad es 0 (no encontrado) y el modal no está abierto, almacenamos el nombre de la unidad y marcamos abrir el modal
       if (UnidadId == 0 && this.deta_Modal == false) {
         this.deta_Unidad = this.formUnidad.value.unme_Nombre;
         abrirModal = true;
       }

       // Si cualquier ID no fue encontrado y el modal no está abierto, se abre el modal para crear un nuevo insumo
       if (abrirModal == true) {
         this.ModalCrearNuevoInsumo();
         return;
       }
      //Cerramos el modal
      this.ConfirmarInsumo = false
      //Creamos el formulario a enviar
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
        coti_Id: this.id,
        empl_Id:2,
        coti_Fecha: this.form.value.coti_Fecha,
        coti_Incluido: this.IncluidoImpuesto,
        unme_Id: UnidadId,
        inpp_Preciocompra: this.formUnidad.value.inpp_Preciocompra,
        prov_Id:this.idProveedor,
        usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion:parseInt(this.cookieService.get('usua_Id')),
        coti_CompraDirecta: false
        };
        //Subscripcion para enviar el formulario e insertar el insumo
        this.service.InsertarInsumo(InsumoViewModel).subscribe(
          (respuesta: Respuesta) => {
            //Si es exitoso mostrar un mensaje de exito
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
             //Si no existe el insumo, setearlo con el id que creamos que lo retorna el mensaje
              if (this.idInsumo == 0) {
                this.idInsumo = respuesta.data.codeStatus
              }
              if (this.id == 0) {
                this.id =parseInt(respuesta.data.messageStatus)
              }
              this.radioButton = 1
              //Cargamos nuevamente los listados para los autocompletes

              this.ListarCategorias()
              this.ListarInsumos()
              this.ListarSubCategorias(CategoriaID)
              this.ListarUnidadesDeMedida()
              this.ConfirmarInsumoBoton = false;
              this.deta_Modal = false;
              this.ConfirmarInsumo = false
              //Reseteamos el formulario
              this.formUnidad.reset()
              //Seteamos la tabla con las unidades de medida de ese insumo
              this.ListarTablaDeMedidas(this.idProveedor,this.idInsumo)
              this.submitted = false;
            } else {
            //Mensaje de error
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000,styleClass:'iziToast-custom' });
            }
          }
        );

    } else {

     this.submitted = true;
    }

  }


  //Se abrira si no existe al menos uno, Insumo, Categoria, SubCategoria, Material
  ModalCrearNuevoInsumo(){
    this.ConfirmarInsumo = true;
    this.deta_Modal = true
  }

  //En el caso de guardar en el mismo boton de guardar y nos deberia de redirigir al index 0
  async GuardarInsumoBoton() {
  
    //Valdida si el formulario esta vacio para marcarselo en rojo
    if (this.formInsumo.valid && this.formUnidad.valid) {
        //Seteamos los detalles por si llega a existir un articulo que no existe, abrir el modal y enseñarselo
      this.deta_Insumo = "";
      this.deta_Categoria = "";
      this.deta_SubCategoria = "";
      this.deta_Material= "";
      this.deta_Unidad= "";
      let abrirModal = false;
           // Buscamos el ID del insumo según la descripción ingresada en el formulario
           this.idInsumo = this.insumos.find(insu => insu.insumos === this.formInsumo.value.insu_Descripcion)?.insu_Id ?? 0;

           // Si no se encuentra el ID del insumo (idInsumo es 0) y el modal no está abierto (deta_Modal es false)
           if (this.idInsumo == 0 && this.deta_Modal == false) {
             // Guardamos la descripción del insumo y marcamos abrir el modal
             this.deta_Insumo = this.formInsumo.value.insu_Descripcion;
             abrirModal = true;
           }

           // Buscamos el ID de la categoría según la descripción ingresada en el formulario
           let CategoriaID = this.categoria.find(cate => cate.cate_Descripcion === this.formInsumo.value.cate_Descripcion)?.cate_Id ?? 0;

           // Si no se encuentra el ID de la categoría (CategoriaID es 0) y el modal no está abierto (deta_Modal es false)
           if (CategoriaID == 0 && this.deta_Modal == false) {
             // Guardamos la descripción de la categoría y marcamos abrir el modal
             this.deta_Categoria = this.formInsumo.value.cate_Descripcion;
             abrirModal = true;
           }

           // Buscamos el ID del material según la descripción ingresada en el formulario
           let MaterialId = this.material.find(mate => mate.mate_Descripcion === this.formInsumo.value.mate_Descripcion)?.mate_Id ?? 0;

           // Si no se encuentra el ID del material (MaterialId es 0) y el modal no está abierto (deta_Modal es false)
           if (MaterialId == 0 && this.deta_Modal == false) {
             // Guardamos la descripción del material y marcamos abrir el modal
             this.deta_Material = this.formInsumo.value.mate_Descripcion;
             abrirModal = true;
           }

           // Inicializamos el ID de la subcategoría en 0
           let SucaId = 0;
        
           // Si hay subcategorías y la lista tiene elementos, buscamos el ID de la subcategoría según la descripción ingresada en el formulario
           if (this.subCategoria && this.subCategoria.length > 0) {
      
             SucaId = this.subCategoria.find(suca => suca.suca_Descripcion === this.formInsumo.value.suca_Descripcion)?.suca_Id ?? 0;
           } else {
             // Si no hay subcategorías, mantenemos el ID en 0
             SucaId = 0;
           }

           // Si no se encuentra el ID de la subcategoría (SucaId es 0) y el modal no está abierto (deta_Modal es false)
           if (SucaId == 0 && this.deta_Modal == false) {
             // Guardamos la descripción de la subcategoría y marcamos abrir el modal
             this.deta_SubCategoria = this.formInsumo.value.suca_Descripcion;
             abrirModal = true;
           }

           // Buscamos el ID de la unidad según el nombre ingresado en el formulario
           let UnidadId = this.unidad.find(unida => unida.unme_Nombre === this.formUnidad.value.unme_Nombre)?.unme_Id ?? 0;

           // Si no se encuentra el ID de la unidad (UnidadId es 0) y el modal no está abierto (deta_Modal es false)
           if (UnidadId == 0 && this.deta_Modal == false) {
             // Guardamos el nombre de la unidad y marcamos abrir el modal
             this.deta_Unidad = this.formUnidad.value.unme_Nombre;
             abrirModal = true;
           }

           // Si cualquier condición anterior activó abrirModal (es true), se abre el modal para crear un nuevo insumo
           if (abrirModal == true) {
             this.ModalCrearNuevoInsumo();
             return;
           }

      //Cerramos  el modal
      this.ConfirmarInsumo = false
      //Creamos el formulario a enviar del insumo
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
        empl_Id:2,
        coti_Fecha: this.form.value.coti_Fecha,
        coti_Incluido: this.IncluidoImpuesto,
        coti_Id: this.id,
        inpp_Preciocompra: this.formUnidad.value.inpp_Preciocompra,
        prov_Id:this.idProveedor,
        usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
        coti_CompraDirecta: false
        };


        this.service.InsertarInsumo2(InsumoViewModel)
          .then(async (respuesta) => {
          
              if (respuesta.success) {
                //Si es exitoso mostrar el mensaje de exito
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 ,styleClass:'iziToast-custom'});
               //Si el id del insumo es 0, llenarlo con el id creado
                if (this.idInsumo == 0) {
                  this.idInsumo = respuesta.data.codeStatus
                }
                if (this.id == 0) {
                  this.id =parseInt(respuesta.data.messageStatus)
                }
                this.radioButton = 1
                
               
                  //Cargamos nuevamente los listado si se crearon o no, materiales, categorias, subcategorias para que vengan cargados
              
               await this.ListarCategorias();
                console.log(this.categoria, 'listar despuesde insertar insumo')
                
  
                this.ListarMateriales()
                this.ListarInsumos()
                if (CategoriaID == 0) {
                  CategoriaID = this.categoria.find(cate => cate.cate_Descripcion === this.formInsumo.value.cate_Descripcion)?.cate_Id ?? 0;
                }
                this.ListarSubCategorias(CategoriaID)
                this.ListarUnidadesDeMedida()
               
                this.deta_Modal = false;
                this.ConfirmarInsumo = false
                //Reseteamos el formulario de unidades de medida
                this.formUnidad.reset()
                //Seteamos el listado de esas unidades de medida de ese insumo
                this.ListarTablaDeMedidas(this.idProveedor,this.idInsumo)
                this.submitted = false;
  
              } else {
                //Mensaje de error
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000,styleClass:'iziToast-custom' });
  
                this.ConfirmarInsumo = false
              }
          });

        console.log(this.subCategoria)
    } else
    {
      this.submitted = true;
    }

  }


  GuardarInsumoBlur() {
     //Valdida si el formulario esta vacio para marcarselo en rojo
    if (this.formInsumo.valid && this.formUnidad.valid) {
        //Seteamos los detalles por si llega a existir un articulo que no existe, abrir el modal y enseñarselo
      this.deta_Insumo = "";
      this.deta_Categoria = "";
      this.deta_SubCategoria = "";
      this.deta_Material= "";
      this.deta_Unidad= "";
      let abrirModal = false;
     // Buscamos el ID del insumo según la descripción ingresada en el formulario
      this.idInsumo = this.insumos.find(insu => insu.insumos === this.formInsumo.value.insu_Descripcion)?.insu_Id ?? 0;

      // Si no se encuentra el ID del insumo (idInsumo es 0) y el modal no está abierto (deta_Modal es false)
      if (this.idInsumo == 0 && this.deta_Modal == false) {
        // Guardamos la descripción del insumo y marcamos abrir el modal
        this.deta_Insumo = this.formInsumo.value.insu_Descripcion;
        abrirModal = true;
      }

      // Buscamos el ID de la categoría según la descripción ingresada en el formulario
      let CategoriaID = this.categoria.find(cate => cate.cate_Descripcion === this.formInsumo.value.cate_Descripcion)?.cate_Id ?? 0;

      // Si no se encuentra el ID de la categoría (CategoriaID es 0) y el modal no está abierto (deta_Modal es false)
      if (CategoriaID == 0 && this.deta_Modal == false) {
        // Guardamos la descripción de la categoría y marcamos abrir el modal
        this.deta_Categoria = this.formInsumo.value.cate_Descripcion;
        abrirModal = true;
      }

      // Buscamos el ID del material según la descripción ingresada en el formulario
      let MaterialId = this.material.find(mate => mate.mate_Descripcion === this.formInsumo.value.mate_Descripcion)?.mate_Id ?? 0;

      // Si no se encuentra el ID del material (MaterialId es 0) y el modal no está abierto (deta_Modal es false)
      if (MaterialId == 0 && this.deta_Modal == false) {
        // Guardamos la descripción del material y marcamos abrir el modal
        this.deta_Material = this.formInsumo.value.mate_Descripcion;
        abrirModal = true;
      }

      // Inicializamos el ID de la subcategoría en 0
      let SucaId = 0;

      // Si hay subcategorías y la lista tiene elementos, buscamos el ID de la subcategoría según la descripción ingresada en el formulario
      if (this.subCategoria && this.subCategoria.length > 0) {
    
        SucaId = this.subCategoria.find(suca => suca.suca_Descripcion === this.formInsumo.value.suca_Descripcion)?.suca_Id ?? 0;
      } else {
        // Si no hay subcategorías, mantenemos el ID en 0
        SucaId = 0;
      }

      // Si no se encuentra el ID de la subcategoría (SucaId es 0) y el modal no está abierto (deta_Modal es false)
      if (SucaId == 0 && this.deta_Modal == false) {
        // Guardamos la descripción de la subcategoría y marcamos abrir el modal
        this.deta_SubCategoria = this.formInsumo.value.suca_Descripcion;
        abrirModal = true;
      }

      // Buscamos el ID de la unidad según el nombre ingresado en el formulario
      let UnidadId = this.unidad.find(unida => unida.unme_Nombre === this.formUnidad.value.unme_Nombre)?.unme_Id ?? 0;

      // Si no se encuentra el ID de la unidad (UnidadId es 0) y el modal no está abierto (deta_Modal es false)
      if (UnidadId == 0 && this.deta_Modal == false) {
        // Guardamos el nombre de la unidad y marcamos abrir el modal
        this.deta_Unidad = this.formUnidad.value.unme_Nombre;
        abrirModal = true;
      }

      // Si cualquier condición anterior activó abrirModal (es true), se abre el modal para crear un nuevo insumo
      if (abrirModal == true) {
        this.ModalCrearNuevoInsumo();
        return;
      }

      //Creamos el formulario a enviar del insumo
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
        inpp_Preciocompra: this.formUnidad.value.inpp_Preciocompra,
        prov_Id:this.idProveedor,
        usua_Creacion:parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
        coti_CompraDirecta: false
        };
        //Cerramos  el modal
        this.ConfirmarInsumo = false
        //Subscripcion para crear el insumo
        this.service.InsertarInsumo(InsumoViewModel).subscribe(
          (respuesta: Respuesta) => {
            if (respuesta.success) {
              //Si es exitoso mostrar volver a poner el modal en false y cerrar el moda
              this.deta_Modal = false;
              this.ConfirmarInsumo = false
              this.radioButton = 1
              //Mostrar el mensaje exitoso
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
              //Si el id del insumo es 0, llenarlo con el id creado
              if (this.idInsumo == 0) {
                this.idInsumo = respuesta.data.codeStatus
              }
              //Cargamos nuevamente los listado si se crearon o no, materiales, categorias, subcategorias para que vengan cargados
              this.ListarCategorias()
              this.ListarInsumos()
              this.ListarSubCategorias(CategoriaID)
              this.ListarUnidadesDeMedida()

              //Reseteamos la unidad de medida
              this.formUnidad.reset()
              //Seteamos la tabla de medidas de ese insumo
              this.ListarTablaDeMedidas(this.idProveedor,this.idInsumo)
              this.submitted = false;

            } else {
              //Cierra el modal y muestra el mensaje de error
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000,styleClass:'iziToast-custom' });
              this.ConfirmarInsumo = false
            }
          }
        );

    }
  }


  //Funcion para abrir un modal con el mensaje de confirmacion si desea eliminar tal unidad
  ModalEliminarInsumo(id, detalle){
    this.ModalInsumoEliminar = true;
    this.idUnidad =id;
    this.deta_Unidad =detalle
  }
  //En la tabla de unidades de medida esta el boton de eliminar
  async EliminarInsumo(){
    try {
      // Llama al servicio para eliminar el proveedor y espera la respuesta
      const response = await this.service.EliminarInsumo(parseFloat(this.idUnidad));
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
          detail,
          life: 3000,styleClass:'iziToast-custom'
      });

      // Reinicia el componente
      this.ListarTablaDeMedidas(this.idProveedor,this.idInsumo)
      this.ModalInsumoEliminar = false;
  } catch (error) {
      // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
      this.messageService.add({
          severity: 'error',
          summary: 'Error Externo',
          detail: error.message || error,
          life: 3000,styleClass:'iziToast-custom'
      });
  }

  }

  //Filtro para el autocompletado de maquinaria
  filterMaquinaria(event: any) {
    const query = event.query.toLowerCase();
    this.filtradoMaquinaria = this.maquinaria.filter(maquinaria =>
      maquinaria.maqu_Descripcion.toLowerCase().includes(query)
    );
  }

   //Filtro para el autocompletado de maquinaria

  //Si seleccionamos algo en el autocompletado de maquinaria
  onMaquinariaSelect(event: any) {
    //Guardamos el evento en una constante
    const maquinariaseleccionado = event;

    //Seteamos la descripcion el formulario, el nivel al que pertenece, su ultimo precio.
    this.formMaquinaria.patchValue({ nive_Descripcion: maquinariaseleccionado.value.nive_Descripcion, maqu_UltimoPrecioUnitario : maquinariaseleccionado.value.maqu_UltimoPrecioUnitario, maqu_Descripcion : maquinariaseleccionado.value.maqu_Descripcion });
    //Encontramos el id de la maquinaria
    this.idMaquinaria = this.maquinaria.find(maqui => maqui.maqu_Descripcion === this.formMaquinaria.value.maqu_Descripcion)?.maqu_Id ?? 0;
  }

  filterNivel(event: any) {
    
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

  //Subscripcion para setear en la tabla la maquinaria que le pertenece a tal proveedor
  ListarMaquinariaPorProveedores(Prov : any) {
    this.service.BuscarMaquinariaPorProveedores(Prov).subscribe(
      (maqui: MaquinariabBuscar[]) => {
        this.maquinariaPorProveedor = maqui;
      }
    );
  }


  //Si no existe la maquinaria se le abrira un modal con el mensaje que si desea crear
  ModalCrearNuevoMaquinaria(){
    this.ModalMaquinariaCrear = true;
    //Se pasa la variable true para que no entre al if de validacion modal
    this.ConfirmarCrearMaquinaria = true
  }
  //Guardamos y nos deberia de redirigir al index 0
  async GuardarMaquinaria() {

    //Traer el id del rol y validar si existe. 
  let idNivel = this.nivel.find(rol => rol.nive_Descripcion === 
  this.formMaquinaria.value.nive_Descripcion)?.nive_Id ?? 0; 

  if (idNivel !== 0) { 
  this.formMaquinaria.get('nive_Descripcion')?.setErrors(null); 
  //De lo contrario le decimos si esta vacio para ver decirle que el campo es 

  } else if(this.formMaquinaria.value.nive_Descripcion == ""  || 
  this.formMaquinaria.value.nive_Descripcion == null){ 
  //Puede ser cualquier texto el invalidRoleId 
  this.Error_Nivel = "El campo es requerido." 
  this.formMaquinaria.get('nive_Descripcion')?.setErrors({ 'invalidRoleId': true }); 
  //Si no es ninguna de las dos es por que tiene texto, pero no existe la opcion 
  }else { 
  //Puede ser cualquier texto el invalidRoleId 
  this.Error_Nivel = "Opción no encontrada." 
  this.formMaquinaria.get('nive_Descripcion')?.setErrors({ 'invalidRoleId': true }); 
  }
    //Si el formulario es valido entrara
    if (this.formMaquinaria.valid ) {
      let abrirModal = false;


      //Busca el id de la maquinaria
      this.idMaquinaria = this.maquinaria.find(maqui =>
        maqui.maqu_Descripcion === this.formMaquinaria.value.maqu_Descripcion)?.maqu_Id ?? 0;


      //Si es igual a 0 seteara en la variable para la validacion de abrir modal
      if (this.idMaquinaria == 0) {
        abrirModal = true;
      }

     //Si es true y el confirmar es false se abrira el modal y retornara
      if (abrirModal && this.ConfirmarCrearMaquinaria == false) {
        this.ModalCrearNuevoMaquinaria();
        return;
      }

      //Se crea el formulario a enviar
      const MaquinariaViewModel: any = {
        maqu_Id: this.idMaquinaria,
        nive_Id: idNivel,
        maqu_Descripcion: this.formMaquinaria.value.maqu_Descripcion,
        maqu_UltimoPrecioUnitario: this.formMaquinaria.value.maqu_UltimoPrecioUnitario,
        prov_Id:this.idProveedor,
        coti_Id: this.id,
        empl_Id:2,
        coti_Fecha: this.form.value.coti_Fecha,
        coti_Incluido: this.IncluidoImpuesto,
        mapr_DiaHora:this.formMaquinaria.value.mapr_DiaHora,
        usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
        coti_CompraDirecta: false
        };
        //Subscripcion para enviar los datos
        this.service.InsertarMaquinaria(MaquinariaViewModel).subscribe(
          async (respuesta: Respuesta) => {
            //Si es existosa la respuesta mostrar el mensaje de exito
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 ,styleClass:'iziToast-custom'});
              if (this.id == 0) {
                this.id =parseInt(respuesta.data.messageStatus)
              }
              //Reiniciamos el formulario
              this.formMaquinaria.reset();
              this.idMaquinaria= 0;

              this.submitted = false;
              this.radioButton = 0;

              //Cargamos nuevamente la maquinaria de proveedor donde se vera guardado
              this.ListarMaquinariaPorProveedores(this.idProveedor)
              //Recargamos el autocomplete
              this.ListarMaquinaria()
              //Seteamos por si vuelve a insertar funcione la valiaicion
              this.ModalMaquinariaCrear = false;
              this.ConfirmarCrearMaquinaria = false;


            } else {
              //Mostrar un mensaje de error
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000,styleClass:'iziToast-custom' });


            }
          }
        );

    } else {
      //De lo contrario se le marcaran en rojo los input por llenar
     this.submitted = true;
    }
  }

  //Preguntar si esta seguro de eliminar la maquinaria
  eliminarMaquinariaModal(id, descripcion){
    this.Deta_MaquinariaDescripcion = descripcion
    this.idMaquinaria = id;
    this.ModalMaquinariaEliminar = true;
  }

  async EliminarMaquinaria(){

    try {
      // Llama al servicio para eliminar el proveedor y espera la respuesta
      const response = await this.service.EliminarMaquinaria(this.idMaquinaria);
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
          detail,
          life: 3000,styleClass:'iziToast-custom'
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
          detail: error.message || error,
          life: 3000,
          styleClass:'iziToast-custom'
      });
  }

  }


  //Setear el equipo de para el autocompletado
  ListarEquiposSeguridad() {
    this.service.ListarEquipos()
    .then((data) => this.EquiposSeguridad = data.sort((a, b) => a.equs_Nombre.localeCompare(b.equs_Nombre)))

  }

  //Setear los equipos de seguridades de ese proveedor
  ListarEquiposPorProveedores(Prov : any) {
    this.service.BuscarEquiposPorProveedores(Prov).subscribe(
      (maqui: any[]) => {
        this.EquiposSeguridadPorProveedor = maqui;
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

  //Funcion para seleccionar un equipo
  onEquipoSelect(event: any) {
    //Guardamos en una variable
    const insumoSeleccionado = event;

    //Setea el valor del id de equipos de seguridad
    this.idEquipo =insumoSeleccionado.value.equs_Id

    //Setea el precio de compra y la descripcion al formulario de equipo
    this.formEquipo.patchValue({ equs_Nombre: insumoSeleccionado.value.equs_Nombre,eqpp_PrecioCompra: insumoSeleccionado.value.equs_UltimoPrecio });
  }


  //Abrir modal de confirmacion
  ModalCrearNuevoEquipo(){
    this.ModalEquipoCrear = true;
  //Para que no entre al validacion de crear modal
    this.ConfirmarCrearEquipo = true
  }

  async GuardarEquipo() {
    //Si estan los campos llenos entrara
    if (this.formEquipo.valid ) {
      let abrirModal = false;

      //Busca el id equipos de seguridad
      this.idEquipo = this.EquiposSeguridad.find(equi =>
        equi.equs_Nombre === this.formEquipo.value.equs_Nombre)?.equs_Id ?? 0;

        //Si no lo encuentra entonces cambia la variable para la validacion
      if (this.idEquipo == 0) {
        abrirModal = true;
      }

     //Si es true AbrirModal y el confirmar es False entonces se retornara y se abrira el modal
      if (abrirModal && this.ConfirmarCrearEquipo == false) {
        this.ModalCrearNuevoEquipo();
        return;
      }

      //Se crea el formulario a enviar
      const EquipoViewModel: any = {
        equs_Id: this.idEquipo,
        equs_Nombre:  this.formEquipo.value.equs_Nombre,
        eqpp_PrecioCompra: this.formEquipo.value.eqpp_PrecioCompra,
        prov_Id:this.idProveedor,
        coti_Id: this.id,
        empl_Id:2,
        coti_Fecha: this.form.value.coti_Fecha,
        coti_Incluido: this.IncluidoImpuesto,
        usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
        coti_CompraDirecta: false
        };
        //Subscripcion para enviar el formulario
        this.service.InsertarEquipoProveedor(EquipoViewModel).subscribe(
          async (respuesta: Respuesta) => {
            //Si es exitoso se mostrara un mensaje de insertado con exito
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
              if (this.id == 0) {
                this.id =parseInt(respuesta.data.messageStatus)
              }
              //Recargamos el listado ya con ese equipo de seguridad
              this.ListarEquiposPorProveedores(this.idProveedor)

              this.radioButton = 2
              //Se reinicia el formulario
              this.formEquipo.reset()
              this.ListarEquiposSeguridad()
              this.submitted = false;
              this.ConfirmarCrearEquipo = false;
              this.ModalEquipoCrear = false;
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000,styleClass:'iziToast-custom' });
         

            }
          }
        );

    } else {
      //Si no estan los campos lleno se marcaran en rojo
     this.submitted = true;
    }
  }

    //Se abre el modal de confirmacion para eliminar
  eliminarEquipoModal(id, descripcion){
    this.Deta_Equipo = descripcion
    this.idEquipo = id;
    this.ModalEquipoEliminar = true;
  }

  async EliminarEquipo(){

    try {
      // Llama al servicio para eliminar el proveedor y espera la respuesta
      const response = await this.service.EliminarEquipo(this.idEquipo);
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
          detail,
          life: 3000,styleClass:'iziToast-custom'
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
          detail: error.message || error,
          life: 3000,styleClass:'iziToast-custom'
      });
  }

  }
//Nos redirigee al index 1 es decir donde esta la principal
SiguienteTab(){

}
//Cierra la cotizacion
CerrarCotizacion() {
  //Si esta en un tab diferente regresarlo al tab principal
  if (this.activeIndex > 0) {
    this.onTabChange({ index: 0 });
  } else {
  //De lo contrario mostrar el listadoç
    if (this.identity == "crear") {
      this.service.Eliminar(this.id).subscribe(
        (respuesta: Respuesta) => {
        }
      );
    }
    this.cookieService.set("Compra","0");
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.IndexDocumentos = false;
    this.clearDocForm();
  }
}

//Seleciona la cotizacion
selectCoti(coti: any) {
  this.selectedCotizacion = coti;

}


//Editar una cotizacion
async EditarCoti() {
  //Para que cambie de radio button sin problemas
  const RaddioButton = true
  //Se cierran los collapses
  this.Detail = false;
  this.Index = false;
  this.Create = true;
  //Se identifica que va ser editar
  this.identity = "editar";
  this.titulo= "Editar"
  this.confirmar = true;

  //Parseamos la fecha
  const selectedDate = new Date(this.selectedCotizacion.coti_Fecha);
  //QUe aparezca en el formulario
  this.form.patchValue({
    prov_Descripcion: this.selectedCotizacion.prov_Descripcion,
    coti_Fecha: selectedDate
  });
  this.fecha = selectedDate;
  //Setear el listado de la tabla con los detalles
  this.ValorImpuesto = this.selectedCotizacion.coti_Impuesto
  this.idProveedor = this.selectedCotizacion.prov_Id
  this.id = this.selectedCotizacion.coti_Id;

  //Se cierran los tabs
  this.tabEquiposSeguridad = false
  this.tabInsumo = false;
  this.tabMaquinaria = false;
  //Si es insumos
  if (this.selectedCotizacion.venta == "Insumos") {

    //Si es tab Insumos se habilita y se apagar el disabled
    this.tabInsumo = true;
    this.dhTab = false;
    this.activeIndex = 0;
    this.radioButton = 1
    this.filtroboton = false;
    this.filtroboton = true;
    this.tabEquiposSeguridad = true;
    await this.ListarTablaCotizacion(this.selectedCotizacion.prov_Id,this.selectedCotizacion.coti_Id)
      //Si es Maquinaria
  } else if (this.selectedCotizacion.venta == "Maquinarias") {
    this.tabMaquinaria = true;
    this.dhTab = false;
    this.filtroboton = false;
    this.activeIndex = 0;
    this.radioButton = 0
    this.filtroboton = true;
    this.tabEquiposSeguridad = true;
    await this.ListarTablaCotizacion(this.selectedCotizacion.prov_Id,this.selectedCotizacion.coti_Id)
      //Si es Todos
  } else if (this.selectedCotizacion.venta == "Todos"){
    //Si es todos habilitamos todos tabs
    this.dhTab = false;
    this.tabMaquinaria = true;
    this.tabInsumo = true;
    this.tabEquiposSeguridad = true;
    this.activeIndex = 0;
    this.radioButton = 1
    this.filtroboton = true;
    await this.ListarTablaCotizacion(this.selectedCotizacion.prov_Id,this.selectedCotizacion.coti_Id)
  }
  else  {
    //Si no es niguno selecciara Equipos
    this.dhTab = false;
    this.tabInsumo = false;
    this.tabMaquinaria = false;
    this.tabEquiposSeguridad = true;
    this.activeIndex = 0;
    this.radioButton = 2

    await this.ListarTablaCotizacion(this.selectedCotizacion.prov_Id,this.selectedCotizacion.coti_Id)
  }
    this.form.get('prov_Descripcion').disable();
    this.form.get('coti_Fecha').disable();
    this.botonCrear = true;
    this.CotizacionesTabla.forEach(coti => {
      let bit = 0
      //dependiendo la categoria guardara el identificador.
      if (coti.categoria == "Maquinaria" ) {
        bit = 0
      }else  if (coti.categoria == "Insumo" ){
        bit = 1
      }else  if (coti.categoria == "Equipo" ){
        bit = 2
      }


      // Buscar y actualizar el elemento existente
      if (coti.agregadoACotizacion == true) {
        this.selectCheckbox = this.selectCheckbox.filter(item => !(item.cime_Id === coti.idP && item.cime_InsumoOMaquinariaOEquipoSeguridad === bit));
      let horasODias = 1;
      if (coti.medidaORenta == "Días" || coti.medidaORenta == "Horas"  || coti.medidaORenta == "Viajes") {
        horasODias = coti.unidad
      }
      //Creamos el formulario para guardarlo en un arreglo
      const CotizacionesViewModel: any = {
        coti_Id: this.id,
        prov_Id: this.idProveedor,
        coti_Fecha: this.form.value.coti_Fecha,
        empl_Id: 2,
        coti_Incluido: this.IncluidoImpuesto,
        code_Cantidad: coti.cantidad,
        code_PrecioCompra: coti.precio,
        cime_Id: coti.idP,
        cime_InsumoOMaquinariaOEquipoSeguridad: bit,
        usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion:parseInt(this.cookieService.get('usua_Id')),
        code_Renta:horasODias,
        check: true,
        coti_CompraDirecta: false
      };
      //Guardamos el arreglo
      this.selectCheckbox.push(CotizacionesViewModel);
      }
      
    });
  this.TotalsEdit();
}


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

ValidarPrecios($event: KeyboardEvent | ClipboardEvent | InputEvent) {
  const inputElement = $event.target as HTMLInputElement;


  const maxDigits = 8;


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


    if (!/^\d$/.test(key) || inputElement.value.length >= maxDigits) {
      $event.preventDefault();
    }
  }

  if ($event instanceof ClipboardEvent) {
    const clipboardData = $event.clipboardData;
    const pastedData = clipboardData.getData('text');

    if (!/^\d+$/.test(pastedData) || pastedData.length > maxDigits) {
      $event.preventDefault();
    }
  }


  if ($event instanceof InputEvent) {
    if (!/^\d*$/.test(inputElement.value)) {
      inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
    }


    if (inputElement.value.length > maxDigits) {
      inputElement.value = inputElement.value.slice(0, maxDigits);
    }
  }
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


    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]$/.test(key)) {
      $event.preventDefault();
    }
  }


  if ($event instanceof ClipboardEvent) {
    const clipboardData = $event.clipboardData;
    const pastedData = clipboardData.getData('text');


    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]*$/.test(pastedData)) {
      $event.preventDefault();
    }


    if (inputElement.value.length === 0 && pastedData.startsWith(' ')) {
      $event.preventDefault();
    }
  }


  if ($event instanceof InputEvent) {
    inputElement.value = inputElement.value.replace(/[^a-zA-Z\sáéíóúÁÉÍÓÚñÑ]/g, '');

    if (inputElement.value.startsWith(' ')) {
      inputElement.value = inputElement.value.trimStart();
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


    if (!/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]$/.test(key)) {
      $event.preventDefault();
    }
  }


  if ($event instanceof ClipboardEvent) {
    const clipboardData = $event.clipboardData;
    const pastedData = clipboardData.getData('text');


    if (!/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]*$/.test(pastedData)) {
      $event.preventDefault();
    }


    if (inputElement.value.length === 0 && pastedData.startsWith(' ')) {
      $event.preventDefault();
    }
  }


  if ($event instanceof InputEvent) {
    inputElement.value = inputElement.value.replace(/[^a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]/g, '');

    if (inputElement.value.startsWith(' ')) {
      inputElement.value = inputElement.value.trimStart();
    }
  }
}

//Abre el modal de finalizar
ModalFinalizar(){
  this.ModalFinalizars = true;
}

//Finaliza una cotizacion
Finalizar() {
  //Subscripcion para finalizar la cotizacion
  this.service.Finalizar(this.selectedCotizacion.coti_Id).subscribe(
    (respuesta: Respuesta) => {
      if (respuesta.success) {
        //Si es exitoso mostrara el mensaje
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Finalizado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
        //Recargamos el listado
        this.Listado();
        this.ModalFinalizars = false;
      } else {
        //Si tira error mostrara mensaje de error

        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000,styleClass:'iziToast-custom' });
        this.ModalFinalizars = false;
      }
    }
  );

}





downloadDocument(): void {

  const link = document.createElement('a');
  link.href = this.uploads + '/' + this.selectedCotizacion.coti_Documento;
  link.target = '_blank';
  link.download = this.selectedCotizacion.coti_Documento;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


  AbrirDocumentos(){
    this.IndexDocumentos = true;
    this.Create = false;
    this.Index = false;
    this.Detail = false;
    this.submitted = false;
    this.id = this.selectedCotizacion.coti_Id
    this.CargarDocumentos();
  }

  onImageSelect(event: any) {
    
    const file = event.files[0];
    if (file) {
      const fileType = file.type;
      if (
        fileType === 'application/pdf' || 
        fileType.startsWith('image/') || 
        fileType === 'application/msword' || 
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        this.file = file;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          
          if (fileType === 'application/pdf') {
            this.previewPDF = this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result);
            this.previewImage = null;
            this.previewFile = null;
            this.formDocumento.get('copd_Documento').setValue(file.name);

          } else if (fileType.startsWith('image/')) {
            this.previewImage = e.target.result;
            this.previewPDF = null;
            this.previewFile = null;
            this.formDocumento.get('copd_Documento').setValue(file.name);

          } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            this.previewImage = this.worldImagen;
            this.previewPDF = null;
            this.previewFile = null;
            this.formDocumento.get('copd_Documento').setValue(file.name);

          }
        };
        reader.readAsDataURL(file);

      }else{
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Tipo de archivo no válido. Asegúrese de seleccionar un archivo de un tipo válido.', life: 3000,styleClass:'iziToast-custom' });
        this.formDocumento.get('copd_Documento').setValue(null);
        const docUploader = document.getElementById('docUploader') as any;
        if (docUploader && docUploader.clear) {
          docUploader.clear();
        }
        this.previewImage = null;
        this.previewPDF = null;
        this.previewFile = null;
      }
     
    }
 
  }

  async uploadFile(file: File) {
    await this.service.SubirDocumento(file)
        .then((filePath) => {
          this.formDocumento.patchValue({ copd_Documento: filePath });
        })
        .catch((error) => {
            console.error('Error al subir el archivo:', error);
        });
}

     //Funcion para limpiar el contenedor imagen
     onFileRemove(event: any): void {
      this.formDocumento.get('copd_Documento').setValue(null);
      const docUploader = document.getElementById('docUploader') as any;
      if (docUploader && docUploader.clear) {
        docUploader.clear();
      }
  
      this.previewImage = null;
      this.previewPDF = null;
  }

 async GuardarDocumento() {
    this.submitted = true;
    console.log("ENTOROOOO AQUII")
    console.log(this.formDocumento.value.copd_Documento)
    if (this.formDocumento.invalid) {
      return;
    }   
     if(!this.formDocumento.value.copd_Documento.trim()){
      console.log("ENTOROOOO AQUII X222")
      await this.uploadFile(this.file);
    }

    const documento = {
      copd_Descripcion: this.formDocumento.value.copd_Descripcion,
      coti_Id: this.id,
      copd_Documento: this.formDocumento.value.copd_Documento,
      usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
      usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
    };

    console.log(documento)

     this.service.InsertarDocumento(documento).subscribe(
       (respuestaDocumento) => {
         if (respuestaDocumento.success) {
           this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
          this.CargarDocumentos();
           this.resetDocumentForm();
          //  this.limpiarDocumento();
           this.submitted = false;
         } else {
           this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Inserción de Documento fallida.', life: 3000 ,styleClass:'iziToast-custom'});
         }
       },
       error => {
         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador', life: 3000 ,styleClass:'iziToast-custom'});
       }
     );
  }

  clearDocForm() {
    this.formDocumento.reset();
    this.docUploader.clear();
    this.previewPDF = null;
    this.previewFile = null;
    this.resetDocumentForm();
    this.submitted = false
    // this.limpiarDocumento();
  }
 
  resetDocumentForm() {
    this.removeFile();
    this.formDocumento.reset();
    this.formDocumento.get('copd_Documento').setValue(null);

    this.formDocumento.patchValue({
      copd_Documento: '',
      coti_Id: '',
      copd_Decripcion: ''
    });
    // this.nombreImagen = '';
    // if (this.fileUploader) {
    //   this.fileUploader.clear();
    // }
  }
  removeFile() {
    this.file = null;
    this.previewPDF = null;
    this.previewImage = null;
}
    // Cargar documentación del bien raíz
    CargarDocumentos() {

      // Inicializa las propiedades
      this.ImagenSubida = null;
      this.PDFSubida = null;
      this.WordSubida = null;
  
      this.service.ListarImagenes(this.id).subscribe(
        (data: any) => {
          this.ImagenSubida = data;
          // this.checkDocumentosCargados();
        }
      );
  
      this.service.ListarPdf(this.id).subscribe(
        (data: any) => {
          this.PDFSubida = data;
        
          // this.checkDocumentosCargados();
        }
      );
  
      this.service.ListarWord(this.id).subscribe(
        (data: any) => {
          this.WordSubida = data;
          // this.checkDocumentosCargados();
        }
      );

    }
    descargarPDF(pdf: any) {
      const linkSource = this.uploads2 + pdf.copd_Documento;
      window.open(linkSource, '_blank');
    }

    EliminarImagen(codp){
      this.detalle_codp_Descripcion = codp.copd_Descripcion;
      this.detalle_codp_Documento = codp.copd_Documento
      this.detalle_codp_Id = codp.copd_Id
      this.ModalEliminarImagen = true;
    }
    EliminarImagenDocumento(){
      const documento = {
        copd_Id: this.detalle_codp_Id,
        copd_Documento: this.detalle_codp_Documento,
      };
      this.service.EliminarImagen(documento).then(
        (respuestaDocumento) => {
          if (respuestaDocumento.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
           this.CargarDocumentos();
           this.ModalEliminarImagen = false;
            this.submitted = false;
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000,styleClass:'iziToast-custom' });
          }
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador', life: 3000,styleClass:'iziToast-custom' });
        }
      );
    }
    allowObservacion(event: any) {
      event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/^\s/, '');
    }
}
