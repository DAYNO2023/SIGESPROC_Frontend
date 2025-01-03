import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { BodegaService } from 'src/app/demo/services/servicesinsumo/bodega.service';
import { Bodega, BodegaInsumosEquipoSeguridad } from 'src/app/demo/models/modelsinsumo/bodegaviewmodel';
import { ApiMapaService } from 'src/app/demo/services/servicesgeneral/apiMapa.service';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { ProveedorService } from 'src/app/demo/services/servicesinsumo/proveedor.service';
import { Proveedor } from 'src/app/demo/models/modelsinsumo/proveedorviewmodel';
import { Estado } from 'src/app/demo/models/modelsgeneral/estadoviewmodel ';
import { Pais } from 'src/app/demo/models/modelsgeneral/paisviewmodel';
import { ciudad } from 'src/app/demo/models/modelsgeneral/ciudadviewmodel';
import { DatePipe } from '@angular/common';
import { MaterialService } from 'src/app/demo/services/servicesinsumo/material.service';
import { EstadoService } from 'src/app/demo/services/servicesgeneral/estado.service';
import { PaisService } from 'src/app/demo/services/servicesgeneral/pais.service';
import { ciudadService } from 'src/app/demo/services/servicesgeneral/ciudad.service';
import { CotizacionService } from 'src/app/demo/services/servicesinsumo/cotizacion.service';
import { UnidadesPorInsumo, UnidadMedida } from 'src/app/demo/models/modelsgeneral/unidadmedidaviewmodel';
import { Cotizacion, CotizacionTabla, TablaMaestra } from 'src/app/demo/models/modelsinsumo/cotizacionviewmodel';
import { ddlCategorias, ddlSubcategoria } from 'src/app/demo/models/modelsinsumo/insumosviewmodel';
import { Insumo } from 'src/app/demo/models/modelsinsumo/insumoviewmodel';
import { Maquinaria, Nivel } from 'src/app/demo/models/modelsinsumo/maquinariaviewmodel';
import { Material } from 'src/app/demo/models/modelsinsumo/materialviewmodel';
import { BodegaPorInsumoService } from 'src/app/demo/services/servicesinsumo/bodegaporinsumo.service';
import { GoogleMap } from '@angular/google-maps';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';

// Componente Angular que maneja las operaciones relacionadas con la gestión de bodegas, incluyendo la manipulación de mapas
// y la integración con servicios externos para la manipulación de datos de bodegas y proveedores.
@Component({
  selector: 'app-bodega',
  templateUrl: './bodega.component.html',
  providers: [MessageService, DatePipe],
  styleUrl: './bodega.component.scss'
})
export class BodegaComponent implements OnInit, AfterViewInit {

  // Propiedades de la clase
  bodegas: Bodega[] = []; // Lista de bodegas
  ddlProveedores: Proveedor[] | undefined; // Lista desplegable de proveedores
  bodegaTablaMaestra: BodegaInsumosEquipoSeguridad[] = []; // Datos de la tabla maestra para la bodega

  filtradoProveedor: Proveedor[] = []; // Lista filtrada de proveedores
  editarBodega: boolean = false; // Indicador de modo de edición
  items: MenuItem[] = []; // Items del menú contextual
  limpiar: boolean = true; // Indicador para limpiar campos
  mapa: boolean = false; // Indicador para mostrar el mapa
  Index: boolean = true; // Indicador para mostrar la vista principal
  Create: boolean = false; // Indicador para mostrar la vista de creación
  Detail: boolean = false; // Indicador para mostrar la vista de detalles
  Delete: boolean = false; // Indicador para mostrar la vista de eliminación
  form: FormGroup; // Formulario principal para la creación/edición de bodegas
  identity: string = "Crear"; // Identificador del modo de operación (crear/editar)
  selectedBodega: any; // Bodega seleccionada en la vista
  id1: number = 0; // Identificador de la bodega seleccionada
  submitted: boolean = false; // Indicador de envío de formulario
  Datos = [{}]; // Datos genéricos
  detalle_bode_Id: string = ""; // Detalle del ID de la bodega
  detalle_bode_Descripcion: string = ""; // Detalle de la descripción de la bodega
  detalle_bode_Latitud: string = ""; // Detalle de la latitud de la bodega
  detalle_bode_Longitud: string = ""; // Detalle de la longitud de la bodega
  detalle_bode_LinkUbicacion: string = ""; // Detalle del enlace de ubicación de la bodega
  ciudad: string = ""; // Ciudad de la bodega
  pais: string = ""; // País de la bodega
  titulo: string = "Nueva"; // Título de la vista
  linkText: string = "borrar"; // Texto del enlace de ubicación
  lngLink: string = ""; // Longitud extraída del enlace
  latLink: string = ""; // Latitud extraída del enlace
  detalle_usuaCreacion: string = ""; // Detalle del usuario de creación
  detalle_usuaModificacion: string = ""; // Detalle del usuario de modificación
  detalle_FechausuaCreacion: string = ""; // Fecha de creación del usuario
  detalle_FechausuaModificacion: string = ""; // Fecha de modificación del usuario

  // Identificador del usuario logueado
  IdUsuario: number = parseInt(this.cookieService.get('usua_Id'));

  // Variables relacionadas con bodegas por insumo
  siguienteGuardado: boolean = false; // Indicador para habilitar el botón de siguiente sin guardar nuevamente

  // Variables de fechas
  dateDay = new Date(); // Fecha actual
  conversion: string; // Almacenamiento de la fecha convertida

  // Almacenamiento de datos
  Cotizaciones: Cotizacion[] = []; // Lista de cotizaciones
  BodegasTabla: Bodega[] = []; // Lista de bodegas en la tabla
  expandedRows: any = {}; // Filas expandidas en la tabla
  TablaMaestra: TablaMaestra[] = []; // Datos de la tabla maestra
  UnidadesMedida: UnidadesPorInsumo[] = []; // Lista de unidades de medida

  form1: FormGroup; // Formulario para el proveedor
  formInsumo: FormGroup; // Formulario para el insumo
  formUnidad: FormGroup; // Formulario para la unidad de medida

  // Selección de filas en las tablas
  selectedRol: any; // Rol seleccionado
  selectedCotizacion: any; // Cotización seleccionada
  id: number = 0; // Identificador genérico
  idInsumo: number = 0; // Identificador del insumo
  idProveedor: number = 0; // Identificador del proveedor
  idMaquinaria: number = 0; // Identificador de la maquinaria
  idScope: number = 0; // Identificador del alcance

  ModalInsumo: boolean = false; // Indicador para mostrar el modal de insumo
  ModalMaquinaria: boolean = false; // Indicador para mostrar el modal de maquinaria

  // Listas desplegables y autocompletados
  proveedor: Proveedor[] | undefined; // Lista de proveedores
  material: Material[] | undefined; // Lista de materiales
  categoria: ddlCategorias[] | undefined; // Lista de categorías
  subCategoria: ddlSubcategoria[] | undefined; // Lista de subcategorías
  insumos: Insumo[] | undefined; // Lista de insumos
  insumosPorMedidas: Insumo[] | undefined; // Lista de insumos por medidas
  unidad: UnidadMedida[] | any; // Lista de unidades de medida
  maquinaria: Maquinaria[] = []; // Lista de maquinarias
  nivel: Nivel[] = []; // Lista de niveles

  // Filtros
  filtradoInsumo: Insumo[] = []; // Lista filtrada de insumos
  filtradoMaquinaria: Maquinaria[] = []; // Lista filtrada de maquinaria

  // Modales
  ModalImpuesto: boolean = false; // Indicador para mostrar el modal de impuesto
  ModalFinalizars: boolean = false; // Indicador para mostrar el modal de finalización

  // Etiquetas
  LabelIncluido: string = ""; // Etiqueta de inclusión

  // Impuesto
  ValorImpuesto: any; // Valor del impuesto
  IncluidoImpuesto: boolean = false; // Indicador de inclusión de impuesto
  subtotal: number = 0.00; // Subtotal
  tax: number = 0.00; // Impuesto
  total: number = 0.00; // Total

  // Pestañas
  activeIndex: number = 0; // Índice de la pestaña activa
  dhTab: boolean = true; // Indicador para habilitar pestañas

  // Almacenamiento de los checkboxes seleccionados
  selectCheckbox: any[] = []; // Lista de checkboxes seleccionados

  // Checkbox padre
  selectAll: any = false; // Indicador de selección de todos los checkboxes

  // Identificador para finalizar
  coti_Id: number = 0; // Identificador de la cotización

  // Detalles
  detailItems: MenuItem[] = []; // Items del menú de detalles

  // Indicador para mostrar el formulario de creación de proveedor
  proveedorFormulario: boolean = false;
  proveedorForm: Proveedor = { usua_Creacion: this.IdUsuario }; // Inicialización del formulario de proveedor

  // Listas desplegables
  ciudades: ciudad[] = []; // Lista de ciudades
  estados: Estado[] = []; // Lista de estados
  paises: Pais[] = []; // Lista de países

  //PROPIEDADES PARA EL MAPA
//   @ViewChild(GoogleMap, { static: false }) map: GoogleMap;

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


  ventas = [
    { label: 'Maquinaria', value: 0 },
    { label: 'Insumo', value: 1 },
    { label: 'Ambas', value: 2 }
  ]; // Opciones de ventas

  // Constructor con inyección de dependencias
  constructor(
    private messageService: MessageService,
    private proveedorService: ProveedorService,
    private service: BodegaService,
    private apiService: ApiMapaService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private service1: CotizacionService,
    private serviceBodegaInsumo: BodegaPorInsumoService,
    private materialService: MaterialService,
    private ciudadService: ciudadService,
    private estadoService: EstadoService,
    private paisService: PaisService,
    private cookieService: CookieService
  ) {
    (mapboxgl as any).accessToken = environment.mapBoxToken;
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/insumo/bodegas')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
    
    // Inicialización del formulario principal
    this.form = this.fb.group({
      bode_Descripcion: ['', Validators.required],
      bode_Latitud: ['', Validators.required],
      bode_Longitud: ['', Validators.required],
      bode_LinkUbicacion: ['', Validators.required],
    });

    // Inicialización de formularios adicionales
    this.form1 = this.fb.group({
      prov_Id: ['', Validators.required],
    });

    this.formInsumo = this.fb.group({
      insu_Descripcion: ['', Validators.required],
      cate_Id: ['', Validators.required],
      mate_Id: ['', Validators.required],
      suca_Id: ['', Validators.required]
    });

    this.formUnidad = this.fb.group({
      inpp_Preciocompra: ['', Validators.required],
      unme_Id: ['', Validators.required],
      inpp_Observacion: ['', Validators.required],
    });
  }

  onRouteChange(): void {
    this.ngOnInit();
  }
  
  
  // Método de inicialización del componente
  ngOnInit(): void {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
    this.dhTab = true;
    this.idProveedor = 0;
    this.form1.reset();
    this.BodegasTabla = null;
    this.idScope = 0;
    this.activeIndex = 0;
    this.selectCheckbox = []; // Limpiar selección
    this.form1.get('prov_Id').enable();
    this.selectAll = false;
    this.siguienteGuardado = false;
    
    const token = this.cookieService.get('Token');
    if(token == 'false')
    {
        this.router.navigate(['/auth/login'])
    }

    this.cargarDatos(); // Carga los datos iniciales
    this.ListarProveedores(); // Lista los proveedores
    this.ListarInsumos(); // Lista los insumos
    this.ListarMateriales(); // Lista los materiales

    // Inicia la tabla de cotización
    this.reeredigirAlTabCreacion();

    // Configuración del menú de acciones
    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarBodega() },
      { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleBodega() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.EliminarBodega() },
    ];
  }

  // Método para cambiar el texto del enlace
  onLinkTextChange(event: any): void {
    const element = event.target;
    this.linkText = element.innerText.trim();

    const selection = window.getSelection();
    if (selection !== null) {
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  // Carga los datos de las bodegas desde el servicio
  loading = false; // Indicador de carga

  // Subscripción para traer los datos y configurar la tabla del índice
  cargarDatos() {
    this.loading = true; // Muestra el loader

    this.service.Listar().toPromise()
      .then(data => {
        this.bodegas = data.map((Bodega: any) => ({
          ...Bodega,
          // Formateo de las fechas de creación y modificación
          bode_FechaCreacion: new Date(Bodega.bode_FechaCreacion).toLocaleDateString(),
          bode_FechaModificiacion: new Date(Bodega.bode_FechaModificiacion).toLocaleDateString(),
          ciudad: '',
          pais: ''
        }));
      })
      .catch(error => {
        this.loading = false; // Oculta el loader cuando se completa la carga
      })
      .finally(() => {
        this.loading = false; // Oculta el loader cuando se completa la carga
      });
  }

  allowOnlyAlphanumeric(event: any) {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s{2,}/g, ' ');
  }

  handleInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;
  
    // Solo permitir letras y un espacio después de cada letra
    inputElement.value = texto
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');

    this.form.controls['bode_Descripcion'].setValue(inputElement.value);

    
  }

  // Método para listar todos los proveedores
  ListarProveedores() {
    this.proveedorService.Listar() //Sort para ordenar el autocompletado de proveedores alfabéticamente
      .then((data) => this.ddlProveedores = data.sort((a, b) => a.prov_Descripcion.localeCompare(b.prov_Descripcion)))
      .catch((error) => {
      });
  }

  // Método para filtrar proveedores
  filterProveedor(event: any) {
    const query = event.query.toLowerCase();
    this.filtradoProveedor = this.ddlProveedores.filter((proveedor) =>
      proveedor.prov_Descripcion.toLowerCase().includes(query)
    );
  }

  // Método para agregar un retraso
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Filtro global para la tabla
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Método para seleccionar una bodega
  selectBodega(bodega: any) {
    this.selectedBodega = bodega;
    this.linkText = this.selectedBodega.bode_LinkUbicacion;
  }

  // Método para crear una nueva bodega
  CrearBodega() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.form.reset();
    this.form1.reset();
    this.BodegasTabla = null;
    this.identity = "crear";
    this.titulo = "Nueva";
    this.limpiar = true;
    this.linkText = "";
    this.idScope = 0;
    this.dhTab = true;
    this.activeIndex = 0;
    this.selectCheckbox = [];
  }

  // Método para cancelar la operación actual
  cancelar() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
    this.dhTab = true;
    this.idProveedor = 0;
    this.form1.reset();
    this.BodegasTabla = null;
    this.idScope = 0;
    this.activeIndex = 0;
    this.selectCheckbox = []; // Limpiar selección
    this.form1.get('prov_Id').enable();
    this.selectAll = false;
    this.siguienteGuardado = false;
  }

  // Método para mostrar el mapa
  // Este método se encarga de mostrar un mapa basado en coordenadas que se obtienen de diferentes fuentes,
  // ya sea del formulario, de un enlace abreviado de Google Maps, o utiliza coordenadas predeterminadas si no se encuentran.
  mostrarMapa() {
    // Verifica si las coordenadas están presentes en el formulario. Si están disponibles, se agrega un marcador en el mapa.
    if (this.form.get('bode_Latitud').value && this.form.get('bode_Longitud').value) {
      this.addGoogleMapsMarker(this.form.get('bode_Latitud').value, this.form.get('bode_Longitud').value);

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
      this.form.get('bode_Latitud').setValue(this.latLink);
      this.form.get('bode_Longitud').setValue(this.lngLink);
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

  // Método para obtener la URL completa desde un enlace de Google Maps abreviado
  // Este método se encarga de resolver la URL completa de un enlace abreviado de Google Maps,
  // lo que es necesario para extraer las coordenadas precisas del enlace.
  getFullUrl(linkTexto: string) {
    // Asegúrate de usar el parámetro 'linkTexto' pasado al método.

    // Realiza una petición HTTP GET para obtener la URL completa desde el enlace abreviado.
    this.http.get(linkTexto, { responseType: 'text' }).subscribe(
      (response: any) => {
        const redirectedUrl = response.url; // Obtiene la URL redirigida desde la respuesta.

        this.extraerCoordenadas(redirectedUrl); // Extrae las coordenadas de la URL completa.
      },
      error => {

        // Mostrar un iziToast con el error.
        this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'No se pudo obtener la URL completa.', life: 3000 });
      }
    );
  }

  // Método para extraer coordenadas de un enlace
  // Este método intenta extraer las coordenadas (latitud y longitud) de un enlace de Google Maps.
  // Si no puede extraer las coordenadas, muestra un mensaje de error al usuario.
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
        this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'Enlace no válido.', life: 3000 });
      }
    }

    return null; // Retorna null si no se pudieron extraer las coordenadas.
  }

  // Método para validar entrada de solo números
  ValidarNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
      event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  // Método para validar entrada de solo texto
  ValidarTexto(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z\s]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  // Método para validar entrada de texto y números
  ValidarTextoNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z\s0-9]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  // Método para ocultar el mapa
  ocultarMapa() {
    this.Detail = false;
    this.Create = true;
    this.mapa = false;

    if (this.limpiar && this.identity != "editar") {
      this.form.patchValue({
        bode_Latitud: '',
        bode_Longitud: '',
        bode_LinkUbicacion: '',
      });
      this.linkText = "";
    } else {
      this.form.patchValue({
        bode_Latitud: this.selectedBodega.bode_Latitud,
        bode_Longitud: this.selectedBodega.bode_Longitud,
        bode_LinkUbicacion: this.selectedBodega.bode_LinkUbicacion,
      });
      this.linkText = this.selectedBodega.bode_LinkUbicacion;
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
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass: 'iziToast-custom', detail: 'Seleccione una ubicación válida.', life: 3000 });
    } else {
      this.form.get('bode_LinkUbicacion').setValue(this.linkText);
      this.Detail = false;
      this.Create = true;
      this.mapa = false;
    }
  }

  // Método para editar una bodega
  /**
   * Este método se encarga de preparar el formulario para editar una bodega existente en el sistema.
   * Toma los datos de la bodega seleccionada, los carga en el formulario, y ajusta el estado de la interfaz de usuario
   * para mostrar la vista de edición, incluyendo la visualización de un mapa con la ubicación de la bodega.
   *
   * @function
   */
  EditarBodega() {
    // Asigna la descripción de la bodega seleccionada a una variable de detalle para su uso posterior.
    this.detalle_bode_Descripcion = this.selectedBodega.bode_Descripcion;

    // Ajusta el estado de la interfaz de usuario:
    // - Oculta la vista de detalle.
    // - Oculta la vista de índice (lista de bodegas).
    // - Muestra la vista de creación/edición (Create).
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.selectCheckbox = [];

    // Configura la acción actual como "editar".
    this.identity = "editar";

    // Establece el título de la vista como "Editar" para que se muestre en el encabezado.
    this.titulo = "Editar";

    // Desactiva cualquier pestaña adicional o específica que pudiera estar activa.
    this.dhTab = false;

    // Guarda el ID de la bodega seleccionada para su uso en futuras operaciones (por ejemplo, al guardar los cambios).
    this.idScope = this.selectedBodega.bode_Id;

    // Rellena el formulario con los datos de la bodega seleccionada.
    this.form.patchValue({
      bode_Descripcion: this.selectedBodega.bode_Descripcion,
      bode_Latitud: this.selectedBodega.bode_Latitud,
      bode_Longitud: this.selectedBodega.bode_Longitud,
      bode_LinkUbicacion: this.selectedBodega.bode_LinkUbicacion,
    });

    // Asigna la URL del enlace de ubicación, latitud y longitud de la bodega seleccionada a variables para su uso posterior.
    this.linkText = this.selectedBodega.bode_LinkUbicacion;
    this.lat = this.selectedBodega.bode_Latitud;
    this.lng = this.selectedBodega.bode_Longitud;

    // Verifica si la latitud es válida (no es 0 ni nula).
    // Si es válida, desactiva la opción de limpiar (es decir, se supone que ya hay una ubicación configurada).
    if (this.lat != 0 && this.lat != null) {
      this.limpiar = false;
    }

    // Añade un marcador en el mapa basado en la latitud y longitud de la bodega seleccionada.
    this.addGoogleMapsMarker(this.lat, this.lng);



    // Almacena el ID de la bodega seleccionada en una variable adicional, (para un uso específico en el flujo de trabajo).
    this.id1 = this.selectedBodega.bode_Id;
  }

  // Método para mostrar el detalle de una bodega
  DetalleBodega() {
    this.Index = false;
    this.Create = false;
    this.Detail = true;
    this.detalle_bode_Id = this.selectedBodega.bode_Id;
    this.detalle_bode_Descripcion = this.selectedBodega.bode_Descripcion;
    this.detalle_bode_Latitud = this.selectedBodega.bode_Latitud;
    this.detalle_bode_Longitud = this.selectedBodega.bode_Longitud;
    this.detalle_bode_LinkUbicacion = this.selectedBodega.bode_LinkUbicacion;

    this.detalle_usuaCreacion = this.selectedBodega.usuaCreacion;
    if (this.selectedBodega.usuaModificacion != null) {
      this.detalle_usuaModificacion = this.selectedBodega.usuaModificacion;
      this.detalle_FechausuaModificacion = this.selectedBodega.bode_FechaModificiacion;
    } else {
      this.detalle_usuaModificacion = "";
      this.detalle_FechausuaModificacion = "";
    }

    this.apiService.getReverseGeocode(this.selectedBodega.bode_Latitud, this.selectedBodega.bode_Longitud).subscribe(
      (geoData: any) => {
        const place = geoData.address;
        this.ciudad = place.city || 'Desconocido';
        this.pais = place.country || 'Desconocido';
      },
      error => {
      }
    );

    this.detalle_FechausuaCreacion = this.selectedBodega.bode_FechaCreacion;
  }

  // Método para eliminar una bodega
  EliminarBodega() {
    this.detalle_bode_Descripcion = this.selectedBodega.bode_Descripcion;
    this.id1 = this.selectedBodega.bode_Id;
    this.Delete = true;
  }

  // Método para guardar una nueva bodega
/**
 * Este método se encarga de guardar una nueva bodega en el sistema.
 * Primero, valida que el formulario sea válido, luego crea un objeto `Bodega` con la información ingresada en el formulario.
 * Dependiendo del estado actual de la interfaz (si está en modo de creación o edición), el método:
 * - Inserta una nueva bodega en la base de datos.
 * - Muestra los mensajes correspondientes según el resultado de la operación.
 * - Gestiona la interfaz de usuario para reflejar los cambios y reiniciar el formulario.
 */
Guardar() {
    // Verifica si el formulario es válido antes de proceder
    if (this.form.valid) {
        // Crear un objeto `Bodega` con los datos del formulario
        const Bodega: any = {
            bode_Id: 0, // ID de la bodega (0 para una nueva bodega)
            bode_Descripcion: this.form.value.bode_Descripcion, // Descripción de la bodega
            bode_Latitud: this.form.value.bode_Latitud.toString(), // Latitud de la bodega convertida a string
            bode_Longitud: this.form.value.bode_Longitud.toString(), // Longitud de la bodega convertida a string
            bode_LinkUbicacion: this.form.value.bode_LinkUbicacion.toString(), // Enlace de ubicación convertido a string
            usua_Creacion: this.IdUsuario, // ID del usuario que crea la bodega
            usua_Modificacion: this.IdUsuario, // ID del usuario que modifica la bodega
            inpp_Id: 0, // ID del insumo (inicializado en 0)
            bopi_Stock: 0, // Stock inicializado en 0
            check: false // Estado de selección inicializado en false
        };

        // Si no se está en modo edición
        if (this.identity != "editar") {
            // Si el índice activo es la primera pestaña (índice 0)
            if (this.activeIndex == 0) {
                // Agregar la bodega a la lista `selectCheckbox`
                this.selectCheckbox.push(Bodega);

                // Iterar sobre `selectCheckbox` para actualizar los datos de la bodega
                this.selectCheckbox.forEach((item) => {
                    item.bode_Descripcion = this.form.value.bode_Descripcion;
                    item.bode_Latitud = this.form.value.bode_Latitud.toString();
                    item.bode_Longitud = this.form.value.bode_Longitud.toString();
                    item.bode_LinkUbicacion = this.form.value.bode_LinkUbicacion.toString();
                    item.usua_Creacion = this.IdUsuario;
                    item.usua_Modificacion = this.IdUsuario;
                });

              //verifica si el id de bodega es 0 y si es cierto ingresa una nueva
              if(this.idScope === 0){
                // Insertar la bodega en la base de datos llamando al servicio `Insertar`
                this.service.Insertar(this.selectCheckbox).subscribe(
                    (respuesta: Respuesta) => {
                        if (respuesta.success) {
                            // Mostrar mensaje de éxito si la inserción fue exitosa
                            this.messageService.add({ severity: 'success', styleClass: 'iziToast-custom', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });
                            this.cargarDatos(); // Recargar los datos
                            this.dhTab = false; // Deshabilitar la pestaña
                            this.idScope = respuesta.data.codeStatus; // Actualizar el ID de alcance
                            this.activeIndex = 1; // Cambiar a la siguiente pestaña
                            this.selectCheckbox = []; // Limpiar la selección
                            this.Create = false;
                            this.Index = true;
                        } else {
                            // Mostrar mensaje de error si la bodega ya existe
                            this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'La bodega ya existe.', life: 3000 });
                        }
                    }
                );
              }
              else{ //caso opuesto el id es distinto de 0 actualiza la bodega recien creada
                Bodega.bode_Id = this.idScope;
                // Actualiza la bodega en la base de datos llamando al servicio `Actualizar`
                this.service.Actualizar(this.selectCheckbox).subscribe(
                  (respuesta: Respuesta) => {
                    if (respuesta.success) {
                        // Mostrar mensaje de éxito si la inserción fue exitosa
                        this.messageService.add({ severity: 'success', styleClass: 'iziToast-custom', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });
                        this.cargarDatos(); // Recargar los datos
                        this.dhTab = false; // Deshabilitar la pestaña
                        this.activeIndex = 1; // Cambiar a la siguiente pestaña
                        this.selectCheckbox = []; // Limpiar la selección
                        this.siguienteGuardado = true; // Habilitar la opción de siguiente
                    } else {
                        // Mostrar mensaje de error si la bodega ya existe
                        this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'La bodega ya existe.', life: 3000 });
                    }
                  }
                );
              }
            } else {
                // Si el índice activo no es 0 y hay elementos en `selectCheckbox`
                if (this.selectCheckbox.length > 0) {
                    this.selectCheckbox.forEach((item) => {
                        item.bode_Descripcion = this.form.value.bode_Descripcion;
                        item.bode_Latitud = this.form.value.bode_Latitud.toString();
                        item.bode_Longitud = this.form.value.bode_Longitud.toString();
                        item.bode_LinkUbicacion = this.form.value.bode_LinkUbicacion.toString();
                        item.usua_Creacion = this.IdUsuario;
                        item.usua_Modificacion = this.IdUsuario;
                    });

                    // Insertar las bodegas en la base de datos llamando al servicio `Insertar`
                    this.service.Insertar(this.selectCheckbox).subscribe(
                        (respuesta: Respuesta) => {
                            if (respuesta.success) {
                                // Mostrar mensaje de éxito y recargar datos
                                this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
                                this.selectCheckbox = []; // Limpiar selección
                                this.cargarDatos();
                                this.cancelar(); // Reiniciar la interfaz
                            } else {
                                // Mostrar mensaje de error si la bodega ya existe
                                this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'El registro ya existe.', life: 3000 });
                            }
                        }
                    );
                } else {
                    // Si no hay elementos en `selectCheckbox`, mostrar mensaje de éxito por defecto
                    this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
                    this.cargarDatos(); // Recargar datos
                    this.selectCheckbox = []; // Limpiar selección
                    this.cancelar(); // Reiniciar la interfaz
                }
            }
        } else {
            // Si se está en modo edición, activar la edición de bodega
            this.editarBodega = true;
        }
    } else {
        // Si el formulario no es válido, marcarlo como enviado y mostrar en consola
        this.submitted = true;
    }
}


  // Método para confirmar la edición de una bodega
/**
 * Este método se encarga de confirmar y guardar los cambios realizados en una bodega existente.
 * Se construye un objeto `Bodega` con los valores actualizados del formulario, y dependiendo del estado de
 * la interfaz de usuario (pestaña activa), se añade a una lista de selección (`selectCheckbox`) o se actualiza directamente.
 *
 * El proceso incluye:
 * - Verificar en qué pestaña se encuentra el usuario (`activeIndex`).
 * - Agregar la bodega a la lista de selección.
 * - Realizar la actualización en la base de datos a través del servicio correspondiente.
 * - Manejar la respuesta del servidor para mostrar mensajes de éxito o error.
 *
 * Este método también asegura que, una vez confirmada la edición, la interfaz de usuario se actualice y
 * se reinicie para volver a un estado consistente.
 */
confirmarEditar() {
    // Crear un objeto `Bodega` con los valores actuales del formulario
    const Bodega: any = {
        bode_Id: this.idScope, // Identificador de la bodega (se usa `idScope` para diferenciar la bodega en edición)
        bode_Descripcion: this.form.value.bode_Descripcion, // Descripción de la bodega
        bode_Latitud: this.form.value.bode_Latitud.toString(), // Latitud de la bodega convertida a cadena de texto
        bode_Longitud: this.form.value.bode_Longitud.toString(), // Longitud de la bodega convertida a cadena de texto
        bode_LinkUbicacion: this.form.value.bode_LinkUbicacion.toString(), // Enlace de ubicación de la bodega convertido a cadena de texto
        usua_Creacion: this.IdUsuario, // Identificador del usuario que creó la bodega
        usua_Modificacion: this.IdUsuario, // Identificador del usuario que modificó la bodega
        inpp_Id: 0, // Inicialización del identificador de insumo (sin uso específico en este contexto)
        bopi_Stock: 0, // Inicialización del stock (sin uso específico en este contexto)
        check: false // Estado de selección (no utilizado en esta parte del proceso)
    };

    // Si el usuario está en la primera pestaña (`activeIndex == 0`)
    if (this.activeIndex == 0) {
        // Agregar la bodega al array `selectCheckbox` para posibles futuras operaciones
        this.selectCheckbox.push(Bodega);

        // Iterar sobre `selectCheckbox` para actualizar los valores de la bodega
        this.selectCheckbox.forEach((item) => {
            item.bode_Descripcion = this.form.value.bode_Descripcion;
            item.bode_Latitud = this.form.value.bode_Latitud.toString();
            item.bode_Longitud = this.form.value.bode_Longitud.toString();
            item.bode_LinkUbicacion = this.form.value.bode_LinkUbicacion.toString();
            item.usua_Creacion = this.IdUsuario;
            item.usua_Modificacion = this.IdUsuario;
        });

        // Llamar al servicio `Actualizar` para guardar los cambios en la base de datos
        this.service.Actualizar(this.selectCheckbox).subscribe(
            (respuesta: Respuesta) => {
                if (respuesta.success) {
                    // Si la actualización es exitosa, mostrar un mensaje de éxito
                    this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Actualizado con Éxito.', life: 3000 });
                    this.cargarDatos(); // Recargar los datos para reflejar los cambios
                    this.editarBodega = false; // Cambiar el estado de edición
                    this.selectCheckbox = []; // Limpiar la lista de selección
                    this.cancelar(); // Reiniciar la interfaz
                } else {
                    // Si hay un error, mostrar un mensaje de error
                    this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'La bodega ya existe.', life: 3000 });
                }
            }
        );
    } else {
        // Si hay elementos en `selectCheckbox` (segunda pestaña o subsecuente)
        if (this.selectCheckbox.length > 0) {
            this.selectCheckbox.forEach((item) => {
                item.bode_Descripcion = this.form.value.bode_Descripcion;
                item.bode_Latitud = this.form.value.bode_Latitud.toString();
                item.bode_Longitud = this.form.value.bode_Longitud.toString();
                item.bode_LinkUbicacion = this.form.value.bode_LinkUbicacion.toString();
                item.usua_Creacion = this.IdUsuario;
                item.usua_Modificacion = this.IdUsuario;
            });

            // Realizar la actualización en la base de datos
            this.service.Actualizar(this.selectCheckbox).subscribe(
                (respuesta: Respuesta) => {
                    if (respuesta.success) {
                        // Mostrar mensaje de éxito y reiniciar la interfaz
                        this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Actualizado con Éxito.', life: 3000 });
                        this.cargarDatos();
                        this.cancelar();
                        this.editarBodega = false;
                    } else {
                        // Mostrar mensaje de error si el registro ya existe
                        this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'El registro ya existe.', life: 3000 });
                    }
                }
            );
        } else {
            // Si `selectCheckbox` está vacío, agregar el objeto `Bodega` y realizar la actualización
            const Bodega: any = {
                bode_Id: this.idScope,
                bode_Descripcion: this.form.value.bode_Descripcion,
                bode_Latitud: this.form.value.bode_Latitud.toString(),
                bode_Longitud: this.form.value.bode_Longitud.toString(),
                bode_LinkUbicacion: this.form.value.bode_LinkUbicacion.toString(),
                usua_Creacion: this.IdUsuario,
                usua_Modificacion: this.IdUsuario,
                inpp_Id: 0,
                bopi_Stock: 0,
                check: false,
            };
            this.selectCheckbox.push(Bodega);

            // Llamar al servicio `Actualizar` para guardar los cambios en la base de datos
            this.service.Actualizar(this.selectCheckbox).subscribe(
                (respuesta: Respuesta) => {
                    if (respuesta.success) {
                        // Mostrar mensaje de éxito y reiniciar la interfaz
                        this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Actualizado con Éxito.', life: 3000 });
                        this.cargarDatos();
                        this.editarBodega = false;
                        this.selectCheckbox = [];
                        this.cancelar();
                    } else {
                        // Mostrar mensaje de error si la bodega ya existe
                        this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'La bodega ya existe.', life: 3000 });
                    }
                }
            );
        }
    }
}


  // Método para eliminar una bodega
  async Eliminar() {
    try {
      // Llama al servicio para eliminar la bodega y espera la respuesta
      const response = await this.service.Eliminar(this.id1);
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
        styleClass: 'iziToast-custom',
        detail,
        life: 3000
      });

      // Reinicia el componente
      this.cargarDatos();
      this.Delete = false;
    } catch (error) {
      // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
      this.messageService.add({
        severity: 'error',
        styleClass: 'iziToast-custom',
        summary: 'Error Externo.',
        detail: error.message || error,
        life: 3000
      });

      this.cargarDatos();
      this.Delete = false;
    }
  }


  //CODIGO PARA EL MAPA
  //
  // Método que se ejecuta después de que la vista ha sido inicializada
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


  //METODO PARA AGREGAR MARCADOR
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

        this.form.patchValue({
          bode_Latitud: lat.toString(),
          bode_Longitud: lng.toString(),
          bode_LinkUbicacion: googleMapsLink.toString(),
        });
        this.linkText = googleMapsLink.toString();
      }
    });
  }

  // Funciones relacionadas con bodegas por insumo

  // Cargar el autocompletado de listar insumos
  ListarInsumos() {
    this.service1.ListarInsumos().then(
      (insu: Insumo[]) => {
        this.insumos = insu;
      },
      error => {
      }
    );
  }

  // Listar categorías para llenar el dropdown de categorías
  ListarCategorias() {
    this.service1.ListarCategorias().then(
      (unidad: ddlCategorias[]) => {
        this.categoria = unidad;
      },
      error => {
      }
    );
  }

  // Cargar el dropdown de materiales
  ListarMateriales() {
    this.materialService.Listar()
      .then((data) => this.material = data)
      .catch((error) => {
      });
  }

  // Cargar lista de unidades de medida para el dropdown
  ListarUnidadesDeMedida() {
    this.service1.listarUnidadesDeMedida().then(
      (unidad: UnidadMedida[]) => {
        this.unidad = unidad;
      },
      error => {
      }
    );
  }

  // Listar maquinaria para el autocompletado
  ListarMaquinaria() {
    this.service1.ListarMaquinaria()
      .then((data) => this.maquinaria = data)
      .catch((error) => {
      });
  }

  // Cargar los niveles para el dropdown
  ListarNiveles() {
    this.service1.ListarNiveles().subscribe(
      (nivel: Nivel[]) => {
        this.nivel = nivel;
      },
      error => {
      }
    );
  }

  // Método para manejar la expansión de una fila en la tabla maestra
  onRowExpand(event: any): void {
    const coti = event.data;
    this.expandedRows = {};
    this.ListarTablaMaestra(coti.bode_Id);
  }

  // Cargar la tabla maestra al expandir una fila
  ListarTablaMaestra(Bode: any) {
    this.service.BuscarTablaMaestra(Bode).subscribe(
      (insu: BodegaInsumosEquipoSeguridad[]) => {
        this.bodegaTablaMaestra = insu;
        this.expandedRows[Bode] = true;
      },
      error => {
      }
    );
  }

  // Cerrar fila expandida
  onRowCollapse(event) {
    delete this.expandedRows[event.bode_Id];
  }

  // Filtro en las tablas

  // Resetear formulario
  reseteoFormularios() {
    this.form1.reset();
    this.formInsumo.reset();
    this.submitted = false;
  }

  // Resetear valores de IDs
  reseteoIDS() {
    this.idInsumo = 0;
    this.idProveedor = 0;
    this.id = 0;
    this.idMaquinaria = 0;
  }

  // Cargar la tabla de bodegas
  ListarTablaBodega(Prov: any, bode: any) {
    this.service.BuscarTablaBodega(Prov, bode).subscribe(
      (insu: Bodega[]) => {
        this.expandedRows = {};
        this.BodegasTabla = insu.map(item => ({
          ...item,
          stock: item.stock <= 0 || item.stock == null ? 1 : item.stock
        }));
      },
      error => {
      }
    );
  }

  // Verifica si están chequeados todos los checkboxes para actualizar el check del padre
  TotalCheck(): void {
    let allSelected = true;
    this.BodegasTabla.forEach(item => {
      if (item.agregadoABodega) {
      } else {
        allSelected = false;
      }
    });
    this.selectAll = allSelected;
  }

  // Método para crear un nuevo proveedor
  async CreateProveedor() {
    this.proveedorFormulario = true;
    this.ciudades = [];
    this.estados = [];

    this.paisService.Listar()
      .subscribe((data: any) => { this.paises = data.data })
    this.Create = false;
  }

  // Método para cerrar el formulario de creación de proveedor
  async cerrarProveedor() {
    this.proveedorFormulario = false;
    this.Create = true;
    this.submitted = false;
  }

  // Método para filtrar estados basado en el país seleccionado
  async filtrarEstados() {
    let id = this.paises.find(pais => pais.pais_Nombre === this.proveedorForm.pais_Nombre).pais_Id;

    await this.estadoService.DropDownEstadosByCountry2(id)
      .then(data => this.estados = data);
  }

  // Método para filtrar ciudades basado en el estado seleccionado
  async filtrarCiudades() {
    let id = this.estados.find(estado => estado.esta_Nombre === this.proveedorForm.esta_Nombre).esta_Id;

    await this.ciudadService.DropDownByState2(id)
      .then(data => this.ciudades = data);
  }

  // Validar entrada de correo electrónico
  correoValidoKeypress($event: any) {
    const regex = /^[a-zA-Z0-9\s@._]+$/;
    const input = $event.target.value + $event.key;
    if (!regex.test(input)) {
      $event.preventDefault();
    }
  }

  // Método para habilitar proveedores y actualizar la tabla
  HabilitarProveedores(event: any): void {
    if (this.identity == "editar") {
      this.id = this.selectedBodega.bode_Id;
    } else {
      this.id = 0;
    }
    this.idProveedor = event.value.prov_Id;
    this.ListarTablaBodega(this.idProveedor, this.id);
    this.dhTab = false;
  }

  // Método para manejar el cambio en los checkboxes
  onCheckboxChange(event: any, stock: any, bode_Id: any, inpp_Id: any) {
    this.selectCheckbox = this.selectCheckbox.filter(item => !(item.bopi_Stock === 0 || item.inpp_Id === inpp_Id));

    if (event.checked != false) {
      if (this.idProveedor != 0) {
        const BodegaPorInsumo: any = {
          bode_Id: this.idScope,
          bode_Descripcion: this.form.value.bode_Descripcion,
          bode_Latitud: this.form.value.bode_Latitud.toString(),
          bode_Longitud: this.form.value.bode_Longitud.toString(),
          bode_LinkUbicacion: this.form.value.bode_LinkUbicacion.toString(),
          inpp_Id: inpp_Id,
          bopi_Stock: stock,
          usua_Creacion: this.IdUsuario,
          usua_Modificacion: this.IdUsuario,
          check: true,
        };
        // this.form1.get('prov_Id').disable();
        this.selectCheckbox.push(BodegaPorInsumo);
      } else {
        this.submitted = true;
      }
    } else {
      const BodegaPorInsumo: any = {
        bode_Id: this.idScope,
        bode_Descripcion: this.form.value.bode_Descripcion,
        bode_Latitud: this.form.value.bode_Latitud.toString(),
        bode_Longitud: this.form.value.bode_Longitud.toString(),
        bode_LinkUbicacion: this.form.value.bode_LinkUbicacion.toString(),
        inpp_Id: inpp_Id,
        bopi_Stock: stock,
        usua_Creacion: this.IdUsuario,
        usua_Modificacion: this.IdUsuario,
        check: false,
      };
      this.selectCheckbox.push(BodegaPorInsumo);
    }
    this.TotalCheck();
  }

  // Método para manejar la selección de todos los checkboxes
  onSelectAllChange(event: any, coti: any) {
    if (event.checked) {
      this.BodegasTabla.forEach(coti => {
        this.selectCheckbox = this.selectCheckbox.filter(item => !(item.bopi_Stock === 0 || item.inpp_Id === coti.id));

        const BodegaPorInsumo: any = {
          bode_Id: this.idScope,
          bode_Descripcion: this.form.value.bode_Descripcion,
          bode_Latitud: this.form.value.bode_Latitud.toString(),
          bode_Longitud: this.form.value.bode_Longitud.toString(),
          bode_LinkUbicacion: this.form.value.bode_LinkUbicacion.toString(),
          inpp_Id: coti.id,
          bopi_Stock: coti.stock,
          usua_Creacion: this.IdUsuario,
          usua_Modificacion: this.IdUsuario,
          check: true,
        };
        this.selectCheckbox.push(BodegaPorInsumo);
        coti.agregadoABodega = true;
      });
    } else {
      this.BodegasTabla.forEach(coti => {
        coti.agregadoABodega = false;
        this.selectCheckbox = this.selectCheckbox.filter(item => !(item.bopi_Stock === 0 || item.inpp_Id === coti.id));

        const BodegaPorInsumo: any = {
          bode_Id: this.idScope,
          bode_Descripcion: this.form.value.bode_Descripcion,
          bode_Latitud: this.form.value.bode_Latitud.toString(),
          bode_Longitud: this.form.value.bode_Longitud.toString(),
          bode_LinkUbicacion: this.form.value.bode_LinkUbicacion.toString(),
          inpp_Id: coti.id,
          bopi_Stock: coti.stock,
          usua_Creacion: this.IdUsuario,
          usua_Modificacion: this.IdUsuario,
          check: false,
        };
        this.selectCheckbox.push(BodegaPorInsumo);
      });
    }
  }

  // Método para redirigir al tab de creación
  reeredigirAlTabCreacion() {
    this.ListarTablaBodega(this.idProveedor, this.id);
    this.activeIndex = 0;
  }

  // Método para validar solo números enteros en el evento keypress
  soloNumerosEnterosKeypress($event: any) {
    const regex = /^\d+$/;
    const input = $event.target.value + $event.key;
    if (!regex.test(input)) {
      $event.preventDefault();
    }
  }
}
