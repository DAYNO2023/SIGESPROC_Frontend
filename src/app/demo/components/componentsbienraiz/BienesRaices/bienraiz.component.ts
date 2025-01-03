import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { BienRaizService } from 'src/app/demo/services/servicesbienraiz/bienRaiz.service';
import { DocumentoBienRaizService } from 'src/app/demo/services/servicesbienraiz/documentoBienRaiz.service';
import { BienRaiz, ProyectoContruccionBienRaiz, ddldoc } from 'src/app/demo/models/modelsbienraiz/bienraizviewmodel';
import { DocumentoBienRaiz } from 'src/app/demo/models/modelsbienraiz/documentobienraizviewmodel';
import { FileUpload } from 'primeng/fileupload';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TablaMaestra } from 'src/app/demo/models/modelsbienraiz/bienraizviewmodel';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';

/**
 * `BienesRaicesComponent` gestiona la visualización y edición de los datos de bienes raíces.
 * Permite la selección, creación, edición, y eliminación de bienes raíces, así como la gestión de sus documentos.
 */
@Component({
  selector: 'app-bienes-raices',
  templateUrl: './bienraiz.component.html',
  styleUrls: ['./bienraiz.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class BienesRaicesComponent implements OnInit {
  @ViewChild('fileUploader') fileUploader: FileUpload;
  @ViewChild('docUploader') docUploader: FileUpload;
  // Propiedades del componente para gestionar el estado y los datos del formulario
  nombreImagen: string;
  bienRaizForm: FormGroup;
  documentoForm: FormGroup;
  submitted: boolean = false;   // Indicador de si el formulario ha sido enviado
  apiimagenKey = '200fe8447d77c936db33a6d227daf243';
  bienesRaices: BienRaiz[] = [];  // Lista de bienes raíces
  items: MenuItem[] = []; // Opciones del menú contextual
  Index: boolean = true;  // Controla la vista del índice de bienes raíces
  Create: boolean = false; // Controla la vista para la creación de un nuevo bien raíz
  Detail: boolean = false; // Controla la vista de detalles de un bien raíz
  Delete: boolean = false;// Controla la vista para la eliminación de un bien raíz
  currentStep: number = 0; // Controla el paso actual en un flujo de pasos
  identity: string = "Crear";  // Define si se está creando o editando un bien raíz
  id: number = 0;// Id del bien raíz actual
  precio :number=0; // Precio del bien raíz actual
  idpro: number = 0;  // Id del proyecto de construcción asociado
  isEditingProject: boolean = false; // Indica si se está editando un proyecto asociado
  titulo: string = "Nuevo";  // Título del formulario (Nuevo/Editar)
  // Propiedades adicionales para manejar detalles del bien raíz
  detalle_bien_Id: string = "";
  detalle_bien_Desripcion: string = "";
  bien_Imagen: string = "";
  detalle_bien_Imagen: string = "";
  detalle_usuaCreacion: string = "";
  detalle_usuaModificacion: string = "";
  detalle_bien_FechaCreacion: string = "";
  detalle_bien_FechaModificacion: string = "";
  detalle_bien_Estado: string = "";
  displayModal: boolean = false; // Controla la visibilidad de un modal
  detalle_codigo: string="";
  proyectosConstruccion: ProyectoContruccionBienRaiz[] = [];  // Lista de proyectos de construcción asociados
  selectedProject: ProyectoContruccionBienRaiz | null = null;  // Proyecto de construcción seleccionado
  isEditMode:boolean = false; // Indica si se está en modo de edición
  pro: ProyectoContruccionBienRaiz | null = null;
  // Propiedades para manejar la carga y visualización de documentos
  nombreDoc: string;
  tiposDocumento: any[] = []; //obtiene la lista para los tipos de documentos
  ImagenSubida: any[] = [];//obtiene la lista para la imagen subida
  PDFSubida: any[] = [];//obtiene la lista para la pf subida
  ExcelSubida: any[] = [];//obtiene la lista para la Excel subida
  WordSubida: any[] = [];//obtiene la lista para la Word subida
  OtrosSubida: any[] = [];//obtiene la lista para la otros subida
  selectedExcel: any; //selecion de excel
  selectedPDF: any;//selecion de Pdf
  selectedImage: any;//selecion de imagen
  selectedWord: any;//selecion de word
  selectedOtros: any; //selecion de otros
  worldImagen = "https://i.pinimg.com/originals/c3/e4/bb/c3e4bb7464bb8d8f57243b4a1dfebfec.png"; //imagen para cuando se sube un archivo word
  excelImagen = "https://i.pinimg.com/originals/b6/0c/44/b60c442e6dd69356b90b9e5bec23cc99.png";//imagen para cuando se sube un archivo excel
  OtrosImagenes = "https://cdn-icons-png.flaticon.com/512/3516/3516096.png";//imagen para cuando se sube un archivo diferente
  TablaMaestra: TablaMaestra[] = [];
  expandedRows: any = {}; // Controla las filas expandidas en la tabla
  Tidoc: { label: string, value: number }[] = []; // Lista de tipos de documentos para un dropdown
  Tipodocumento: ddldoc[] | undefined;
  filtradoDocumento: ddldoc[] = [];
  detalle_Documento: string = "";
  confirmBienRaizDialog: boolean = false;  // Controla la visibilidad del diálogo de confirmación para acciones de Bien Raíz
  deleteEmpresaDialog: boolean = false;  // Controla la visibilidad del diálogo de eliminación
  selectedBienRaiz: any;  // Bien raíz seleccionado para operaciones
  loading : boolean= false;  // Controla la visualización de un spinner de carga
  isLoading = false; // Controla el estado de carga de datos
  IdUsuario: number = parseInt(this.cookieService.get('usua_Id')); // ID del usuario logueado
// Variables para manejar los errores
Error_TipoDocumento: string = "El campo es requerido.";
ModalEliminarImagen: boolean = false
selectedDocumento: any; // Documento seleccionado para eliminación
deleteDocumentoDialog: boolean = false;
  // Para la previsualización de archivos (imágenes, PDF, etc.)
  previewImage: string | ArrayBuffer | null = null;
  previewPDF: SafeResourceUrl | null = null;
  previewFile: string | null = null;
  finalizarbien = false;
  itemsfinalizado: MenuItem[] = [];
  mostrarDetallesConstruccion: boolean = false; // Para controlar la visibilidad de los detalles
  submittedTab1: boolean = false;  // Para el primer tab 
  submittedTab2: boolean = false;  // Para el segundo tab 
  documentosCargados: boolean=false;  // Indica si se han cargado documentos
  Datos = [{}];
  
  steps: MenuItem[] = [
    { label: 'Datos Generales' },
    { label: 'Documentación del Bien Raíz' }
  ]; // Pasos en el flujo de creación/edición de un bien raíz
  Descripcion: any;
  checkboxStates: { [key: number]: boolean } = {};
/**
     * Constructor para `Bien Raíz componente`.
     */
  constructor(
    private messageService: MessageService, // Servicio para mostrar mensajes
    private bienRaizService: BienRaizService, // Servicio para gestionar Bien Raíz
    private documentoService: DocumentoBienRaizService,  // Servicio para gestionar Documentos
    private router: Router, //Router para navegación
    private fb: FormBuilder,
    private http: HttpClient,
    private sanitizer: DomSanitizer,//sanitizar las urls
    private confirmationService: ConfirmationService,
    public globalMoneda: globalmonedaService,
    public cookieService: CookieService,
    private cd: ChangeDetectorRef
  ) {
     /**
        // Inicialización de el formulario de Bien Raíz
     */
    this.bienRaizForm = this.fb.group({
      bien_Desripcion: ['', Validators.required],
      pcon_Id: ['', Validators.required],
      bien_Imagen: ['', Validators.required],
      bien_precio:['']
    });
   /**
        // Inicialización de el formulario de documentos
     */
    this.documentoForm = this.fb.group({
      dobt_DescipcionDocumento: ['', Validators.required],
      tido_Descripcion: ['',],
      dobt_Imagen: ['', Validators.required],
      selectedImage: [''],
      selectedPDF: [''],
      selectedExcel: [''],
      selectedWord: [''],
      selectedOtros: ['']
    });
  }


  recargarDatos() {
    this.Listado(); // Método que recarga los bienes raíces
    this.cd.detectChanges(); // Forzar la detección de cambios
  }
    /**
     * Inicializa el componente, suscribiéndose a eventos y cargando los datos iniciales.
     */
    ngOnInit(): void {
   // Carga inicial de Bienes raices
   this.onRouteChange();

   const token =  this.cookieService.get('Token');
   if(token == 'false'){
     this.router.navigate(['/auth/login'])
   }
   this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe((event: NavigationEnd) => {
    if (event.urlAfterRedirects.includes('/sigesproc/bienraiz/bienesraices')) {
      this.onRouteChange();
    }
  });
      // Si estás editando un bien raíz y ya tiene una construcción seleccionada
      if (this.isEditMode && this.bienRaizForm.get('pcon_Id').value) {
        this.mostrarDetallesConstruccion = true; // Mostrar detalles si ya tiene construcción
        this.loadProjects();
        this.selectedProject = this.proyectosConstruccion.find(project => project.pcon_Id === this.selectedBienRaiz.pcon_Id) || null;
        this.checkboxStates[this.selectedBienRaiz.pcon_Id] = true;  // Marca la construcción asignada

      // Cargar los detalles del proyecto seleccionado
      }
      
     this.Listado();
     
    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EdicionBienRaiz() },
      { label: 'Finalizar', icon: 'pi pi-lock', command: () => this.ConfirmFinalizar() },
      { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleBienRaiz() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.eliminarBienRaiz() }
    ];
    this.itemsfinalizado = [
      { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleBienRaiz() },
    ];
    this.ListarDocumento();
    if (!this.globalMoneda.getState()) {
      this.globalMoneda.setState()
    }


  }
  onRouteChange() {
    // Reiniciar la vista al index y desactivar otras vistas
    this.Index = true;
    this.Create = false;
    this.Detail = false;
    // Resetear otros estados del componente
    this.selectedProject = null;
    this.isEditMode = false;
    this.currentStep = 0;
    this.resetForms(); // Método para limpiar formularios si es necesario
  }
   /**
   * Lista los tipos de documentos disponibles.
   */
  ListarDocumento() {
    this.bienRaizService.tipodocuemnto().subscribe(
      (Documento: ddldoc[]) => {
        this.Tipodocumento = Documento.sort((a, b) => a.tido_Descripcion.localeCompare(b.tido_Descripcion));
      },
      error => {

      }
    );
  }

  ConfirmFinalizar(){
    this.finalizarbien = true;
  }
  async Finalizarbieneraice() {
    try {
      const response = await this.bienRaizService.finalizar(this.selectedBienRaiz.bien_Id);
  
      const { code, data, message } = response;
  
      let severity = 'error';
      let summary = 'Error';
      let detail = data?.messageStatus || message;
  
      if (code === 200) {
        severity = data.codeStatus > 0 ? 'success' : 'warn';
        summary = data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
      } else if (code === 500) {
        severity = 'error';
        summary = 'Error Interno';
      }
  
      this.messageService.add({
        severity,
        summary,
        detail,
        life: 3000,
        styleClass: 'iziToast-custom'
      });
  
      this.ngOnInit();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error Externo',
        detail: error.message || error,
        life: 3000,
        styleClass: 'iziToast-custom'
      });
    }
  }
  
  
  
/**
   * Lista todos los bienes raices.
   */
  Listado() {
    this.loading = true;
    this.bienRaizService.Listar().subscribe(
      (data: any) => {
        this.bienesRaices = data.map((bienRaiz: any) => ({
          ...bienRaiz,
          bien_Identificador: bienRaiz.bien_Identificador === "True", 
          bien_FechaCreacion: new Date(bienRaiz.bien_FechaCreacion).toLocaleDateString(),
          bien_FechaModificacion: new Date(bienRaiz.bien_FechaModificacion).toLocaleDateString()
        }));
      },
      error => {
      
      },
      () => {
        this.loading = false;
    }
    );
  }
   /**
   * Lista los datos de una tabla maestra especifica para un Bien Raíz.
   * @param Bien - Identificador del Bien Raíz.
   */
  ListarTablaMaestra(Bien: any) {
    this.bienRaizService.BuscarTablaMaestra(Bien).subscribe(
      (Terr: TablaMaestra[]) => {
        this.TablaMaestra = Terr;
        this.expandedRows[Bien] = true;
        this.loading = false; 
      },
      error => {
        this.loading = false;

      }
    );
  }

  /**
   * Filtro global para la tabla de bienes raíces.
   * @param table - Componente de tabla.
   * @param event - Evento de entrada para el filtro.
   */
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

 /**
   * Selecciona un bien raíz para operaciones futuras.
   * @param bienRaiz - El bien raíz seleccionado.
   */
    selectBienRaiz(bienRaiz: any) {
    this.selectedBienRaiz = bienRaiz;
  }
  // Método para limpiar el formulario de documentos
  limpiarDocumento() {
    this.previewImage = null;
    this.previewPDF = null;
    this.documentoForm.reset();
    if (this.docUploader) {
      this.docUploader.clear();
    }
  }
  /**
   * Muestra los detalles del bien raíz seleccionado.
   */
 DetalleBienRaiz() {
  this.Index = false;
  this.Create = false;
  this.Detail = true;
  this.detalle_bien_Id = this.selectedBienRaiz.codigo;
    this.detalle_bien_Desripcion = this.selectedBienRaiz.bien_Desripcion;
    this.detalle_bien_Imagen = this.selectedBienRaiz.bien_Imagen;
  this.detalle_usuaCreacion = this.selectedBienRaiz.usuaCreacion;
  if (this.selectedBienRaiz.usuaModificacion != null) {
    this.detalle_usuaModificacion = this.selectedBienRaiz.usuaModificacion;
    this.detalle_bien_FechaModificacion = this.selectedBienRaiz.bien_FechaModificacion;
  } else {
    this.detalle_usuaModificacion = "";
    this.detalle_bien_FechaModificacion = "";
  }
  this.detalle_bien_FechaCreacion = this.selectedBienRaiz.bien_FechaCreacion;
}

  // Obtener URL segura para la imagen
  getSafeUrl(base64: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(base64);
  }


  /**
   * Inicia la creación de un nuevo bien raíz.
   */
  CrearBienRaiz() {
    this.Detail = false;
    this.Index = false;
    this.isEditingProject = false;
    this.Create = true;
    this.isEditMode = false;
    this.currentStep = 0;
    this.bienRaizForm.reset();
    this.documentoForm.reset();
    this.identity = "crear";
    this.titulo = "Nuevo";
  }
  nuevoDescripcionBienRaiz: string = '';
  accionConfirmacion: 'guardar' | 'siguiente' | null = null;
 /**
   * Abre el diálogo de confirmación para guardar o avanzar al siguiente paso.
   * @param accion - Acción seleccionada ('guardar' o 'siguiente').
   */
  abrirConfirmacionEdicion(accion: 'guardar' | 'siguiente') {
    this.accionConfirmacion = accion;
    this.confirmBienRaizDialog = true;
    this.nuevoDescripcionBienRaiz = this.bienRaizForm.get('bien_Desripcion').value;

}

/**
   * Confirma la acción seleccionada en el diálogo de confirmación.
   */
//   confirmarBienRaiz() {
//     this.confirmBienRaizDialog = false;

//     if (this.accionConfirmacion === 'guardar') {
//         this.finalizarEdicion(() => {
//           this.Listado();
//             this.CerrarBienRaiz();
//         });
//     } else if (this.accionConfirmacion === 'siguiente') {
//         this.finalizarEdicion(() => {
//             this.currentStep++; // Avanzar al siguiente tab
            
//         });
//     }

//     this.accionConfirmacion = null;
// }

confirmarBienRaiz() {
  this.confirmBienRaizDialog = false;

  if (this.accionConfirmacion === 'guardar') {
      this.finalizarEdicion(() => {
        this.router.events.pipe(
          filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
          if (event.urlAfterRedirects.includes('/sigesproc/bienraiz/bienesraices')) {
            this.onRouteChange();
          }
        });
      });
  } else if (this.accionConfirmacion === 'siguiente') {
      this.finalizarEdicion(() => {
          this.currentStep++; // Avanzar al siguiente tab

          // Asegúrate de actualizar los detalles visuales de la construcción
           const projectId = this.bienRaizForm.get('pcon_Id').value;
          this.buscarProyectoPorId(projectId);  // Llamada al método para actualizar la construcción seleccionada

          this.mostrarDetallesConstruccion = !!this.selectedProject;  
      });
  }

  this.accionConfirmacion = null;
}



  /**
   * Inicia el proceso de edición de un bien raíz existente.
   */
  editarBienRaiz() {
    if (this.identity === "editar") {
        this.abrirConfirmacionEdicion('guardar');
    } else {
        this.EdicionBienRaiz();
    }
}

  /**
   * Carga los datos del Bien Raíz para ser editado.
   */
  // EdicionBienRaiz() {
  //   this.Detail = false;
  //   this.Index = false;
  //   this.Create = true;
  //   this.currentStep = 0;
  //   this.identity = "editar";
  //   this.titulo = "Editar";
  //   this.isEditMode = true;

  //   this.loadProjects();
  //   this.selectedProject = this.proyectosConstruccion.find(project => project.pcon_Id === this.selectedBienRaiz.pcon_Id) || null;

 
  //   this.bienRaizForm.patchValue({
  //     bien_Desripcion: this.selectedBienRaiz.bien_Desripcion,
  //     pcon_Id: this.selectedBienRaiz.pcon_Id,
  //     bien_Imagen: this.selectedBienRaiz.bien_Imagen,
  //   });
  //   this.detalle_bien_Desripcion = this.selectedBienRaiz.bien_Desripcion;

  //   this.idpro = this.selectedBienRaiz.pcon_Id;

  //   this.id = this.selectedBienRaiz.bien_Id;

  //   this.CargarDocumentos();
  // }

  EdicionBienRaiz() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.currentStep = 0;
    this.identity = "editar";
    this.titulo = "Editar";
    this.isEditMode = true;
    this.idpro = this.selectedBienRaiz.pcon_Id;  // Guardamos el id de la construcción

    this.bienRaizForm.patchValue({
        bien_Desripcion: this.selectedBienRaiz.bien_Desripcion,
        pcon_Id: this.selectedBienRaiz.pcon_Id,
        bien_Imagen: this.selectedBienRaiz.bien_Imagen,
        // bien_Precio: this.selectedBienRaiz.bien_Precio,

    });

    this.detalle_bien_Desripcion = this.selectedBienRaiz.bien_Desripcion;
    this.id = this.selectedBienRaiz.bien_Id;

    // Asegúrate de cargar los proyectos
    this.loadProjects();

    // Si el proyecto no está en la lista general, búscalo por id
    this.buscarProyectoPorId(this.idpro);
}

 /**
   * Confirma la eliminación del bien raíz.
   */
 async confirmarEliminar() {
  this.deleteEmpresaDialog = false;
  this.ngOnInit();
this.Listado();
  try {
    const response = await this.bienRaizService.Eliminar(this.selectedBienRaiz.bien_Id);
    const { code, data, message } = response;

    let severity = 'error';
    let summary = 'Error';
    let detail = data?.messageStatus || message;

    if (code === 200) {
      severity = data.codeStatus > 0 ? 'success' : 'warn';
      summary = data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
    } else if (code === 500) {
      severity = 'error';
      summary = 'Error Interno';
    }

    this.messageService.add({
      severity,
      summary,
      detail,
      life: 3000,styleClass:'iziToast-custom'
    });

    this.ngOnInit();
  } catch (error) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error Externo',
      detail: error.message || error,
      life: 3000,styleClass:'iziToast-custom'
    });
  }

}

  /**
   * Elimina el bien raíz seleccionado.
   */
  eliminarBienRaiz() {
    this.Descripcion = this.selectedBienRaiz.bien_Desripcion;
    this.deleteEmpresaDialog = true;
  }



  /**
   * Maneja el cambio de selección de proyectos.
   * @param isChecked - Estado del checkbox.
   * @param project - Proyecto seleccionado.
   */
  handleProjectChange(isChecked: boolean, project: ProyectoContruccionBienRaiz) {
    if (isChecked) {
      // Desmarcar cualquier otro proyecto seleccionado
      Object.keys(this.checkboxStates).forEach(key => {
        this.checkboxStates[key] = false;
      });
      this.checkboxStates[project.pcon_Id] = true;  // Marcar el proyecto actual
      this.selectedProject = project;  // Guardar el proyecto seleccionado
      this.precio = project.precio;  // Actualizar el precio
  
    } else {
      this.selectedProject = null;  // Si deselecciona, limpiar la selección
    }
  }
  
  


confirmProjectSelection() {
  if (this.selectedProject) {
    this.bienRaizForm.patchValue({ pcon_Id: this.selectedProject.pcon_Id });
    
    // Forzar actualización de la card
    this.mostrarDetallesConstruccion = false;
    setTimeout(() => {
      this.mostrarDetallesConstruccion = true;
    }, 0);

    this.closeModal();
  }
}


trackByConstructionId(index: number, item: any) {
  return item.pcon_Id; 
}



  /**
   * Maneja la expansión de filas en la tabla.
   * @param event - Evento de expansión.
   */
    onRowExpand(event: any): void {
    const Bien = event.data;
    this.expandedRows = {};
    this.loading = true; // Show the loader

    this.ListarTablaMaestra(Bien.bien_Id);
    
  }

/**
   * Maneja la colapsación de filas en la tabla.
   * @param event - Evento de colapsación.
   */
    onRowCollapse(event: any) {
    delete this.expandedRows[event.bien_Id];
  }


/**
 *   Desencadenar la carga de archivos esto en el primer tap
*/
  triggerFileUpload(): void {
    this.fileUploader.advancedFileInput.nativeElement.click();
  }

  /**
  *Desencadenar la carga de documentos es el del segundo tap
*/
  triggerDocUpload(): void {
    this.docUploader.advancedFileInput.nativeElement.click();
  }
/**
   * Maneja la selección de Imagenes para el primer tap.
   * @param event - Evento de selección de archivo.
   */
onImageSelect(event: any): void {
  const file: File = event.files[0];
  if (file) {
    if (file.name.length > 260) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre del archivo excede el límite de 260 caracteres.',
        life: 3000,
        styleClass: 'iziToast-custom'
      });
      return;
    }

    // Tamaño del archivo original
    const originalSize = file.size;

    // Determinar el tipo de imagen (MIME type)
    const mimeType = file.type;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const imageUrl = e.target.result;
      this.resizeImage(imageUrl, mimeType, (resizedImageUrl) => {
        this.dataUrlToBlob(resizedImageUrl, (blob) => {
          const resizedSize = blob.size;
        

          if (resizedSize < originalSize) {
          } else {
          }

          this.bienRaizForm.get('bien_Imagen').setValue(resizedImageUrl);
        });
      });
    };
    reader.readAsDataURL(file);
  }
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


onImageSelect2(event: any) {
  const file = event.files[0];

  if (file) {
    const maxSizeInMB = 30;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    const deniedTypes = [
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'video/mp4', 'video/x-msvideo', 'video/quicktime',
      'video/x-matroska', 'video/x-flv', 'video/x-ms-wmv'
    ];

    if (deniedTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Tipo de archivo no permitido. Asegúrese de seleccionar un archivo de un tipo permitido.',
        life: 3000,
        styleClass: 'iziToast-custom',
      });
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

   

      if (fileType === 'application/pdf') {
        this.previewPDF = this.sanitizer.bypassSecurityTrustResourceUrl(result);
        this.previewImage = null;
        this.previewFile = null;
      } else if (fileType === 'text/plain') {
        this.previewPDF = this.sanitizer.bypassSecurityTrustResourceUrl(result);
        this.previewImage = null;
        this.previewFile = null;
      } else if (fileType.startsWith('image/')) {
        this.previewImage = result;
        this.previewPDF = null;
        this.previewFile = null;
      } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.previewImage = this.worldImagen;
        this.previewPDF = null;
        this.previewFile = this.compressBase64(result, 500);
      } else if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        this.previewImage = this.excelImagen;
        this.previewPDF = null;
        this.previewFile = this.compressBase64(result, 500);
      } else {
        this.previewImage = this.OtrosImagenes;
        this.previewPDF = null;
        this.previewFile = this.compressBase64(result, 500);
      }

      this.documentoForm.patchValue({ dobt_Imagen: result });

      // Llamada a uploadImage2 para probar
      this.uploadImage2(file);
    };
    reader.readAsDataURL(file);
  }
}


uploadImage2(file: File): void {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const uniqueFileName = uniqueSuffix + '-' + file.name;

  const formData: FormData = new FormData();
  formData.append('file', file, uniqueFileName);

  this.documentoService.EnviarImagen(formData).subscribe(
    (response: any) => {
      if (response.message === 'Exito') {
        this.documentoForm.get('dobt_Imagen').setValue(response.data.imageUrl);
      } else {
      }
    },
    (error) => {
    }
  );
}

compressBase64(base64: string, maxSizeInKB: number): string {
  const binaryString = window.atob(base64.split(',')[1]);
  const binaryLen = binaryString.length;
  const bytes = new Uint8Array(binaryLen);
  for (let i = 0; i < binaryLen; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'image/jpeg' });
  const blobUrl = URL.createObjectURL(blob);
  if (blob.size > maxSizeInKB * 1080) {
  }

  return blobUrl;
}
  //Funcion para limpiar el contenedor imagen
  onImageRemove(event: any): void {
    this.bienRaizForm.get('bien_Imagen').setValue(null);
    const fileUpload = document.getElementById('p-fileupload') as any;
    if (fileUpload && fileUpload.clear) {
      fileUpload.clear();
    }

  }

   //Funcion para limpiar el contenedor imagen
   onFileRemove(event: any): void {
    this.documentoForm.get('dobt_Imagen').setValue(null);
    const docUploader = document.getElementById('docUploader') as any;
    if (docUploader && docUploader.clear) {
      docUploader.clear();
    }

    this.previewImage = null;
    this.previewPDF = null;
}


  onDocumentoSelect(event: any) {
   const documentoSeleccionado = event;


      this.documentoForm.patchValue({
        tido_Descripcion: documentoSeleccionado.value.tido_Descripcion

      });

  }



  // Cargar imagen
  uploadImage(file: File): void {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const uniqueFileName = uniqueSuffix + '-' + file.name;

    const formData: FormData = new FormData();
    formData.append('file', file, uniqueFileName);

    this.documentoService.EnviarImagen(formData).subscribe(
      (response: any) => {
        if (response && response.success && response.data && response.data.imageUrl) {
          this.bienRaizForm.get('bien_Imagen').setValue(response.data.imageUrl);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Imagen subida correctamente.', life: 3000 , styleClass:'iziToast-custom'});
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al subir la imagen.', life: 3000 , styleClass:'iziToast-custom'});
        }
      },
      (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000, styleClass:'iziToast-custom' });
      }
    );
  }

 /**
   * Limpia los dos formularios.
   */
  clearForm() {
    this.bienRaizForm.reset();
    this.nombreImagen = '';
    this.fileUploader.clear();
  }

   /**
   * Limpia el formulario de documentos.
   */
  clearDocForm() {
    this.documentoForm.reset();
    this.nombreDoc = '';
    this.docUploader.clear();
    this.previewPDF = null;
    this.previewFile = null;
    this.resetDocumentForm();
    this.limpiarDocumento();
  }
  // Reiniciar formulario de documentos
  resetDocumentForm() {
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

  /**
   * Finaliza sea la creacion o edición de un bien raíz.
   */
  finalizar() {

    if (!this.documentosCargados) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe ingresar al menos un documento antes de guardar el Bien Raíz.', life: 3000, styleClass:'iziToast-custom' });
      return;
    }
    this.Listado();
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Finalizado con Éxito.', life: 3000, styleClass:'iziToast-custom' });
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.ngOnInit();
    this.selectedProject = null;
    this.checkboxStates = {}; 
    this.resetForms();
    this.submitted = false;
    this.submittedTab1 = false;


    this.isEditingProject = false;
    this.mostrarDetallesConstruccion = false; 
  }

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
/**
  *Validar texto  en input
   */

  ValidarTexto($event: KeyboardEvent | ClipboardEvent | InputEvent) {
    const inputElement = $event.target as HTMLInputElement;
  
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  
    if ($event instanceof KeyboardEvent) {
      const key = $event.key;
  
      // Permitir teclas de navegación y edición
      if (
        key === 'Backspace' ||
        key === 'Delete' ||
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        key === 'Tab'
      ) {
        return;
      }
  
      // Evitar espacios al inicio
      if (inputElement.value.length === 0 && key === ' ') {
        $event.preventDefault();
        return;
      }
  
      // Validar que el caracter sea una letra o espacio (incluyendo acentos) y que no sea un emoji
      if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]$/.test(key) || emojiRegex.test(key)) {
        $event.preventDefault();
      }
    }
  
    if ($event instanceof ClipboardEvent) {
      const clipboardData = $event.clipboardData;
      const pastedData = clipboardData.getData('text');
  
      // Evitar emojis y caracteres no permitidos en el texto pegado
      if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]*$/.test(pastedData) || emojiRegex.test(pastedData)) {
        $event.preventDefault();
      }
  
      // Evitar que el texto pegado comience con un espacio
      if (inputElement.value.length === 0 && pastedData.startsWith(' ')) {
        $event.preventDefault();
      }
    }
  
    if ($event instanceof InputEvent) {
      // Reemplazar cualquier caracter que no sea permitido y quitar emojis
      inputElement.value = inputElement.value.replace(/[^a-zA-Z\sáéíóúÁÉÍÓÚñÑ]/g, '').replace(emojiRegex, '');
  
      // Eliminar espacios al inicio
      if (inputElement.value.startsWith(' ')) {
        inputElement.value = inputElement.value.trimStart();
      }
    }
  } 
  handleInput(event: Event, controlName: string) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    // Limpieza del texto según las reglas de validación
    inputElement.value = texto
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '') // Permitir solo letras, números y espacios
        .replace(/\s{2,}/g, ' ') // Reemplazar múltiples espacios con un solo espacio
        .replace(/^\s/, ''); // Eliminar espacios al inicio

    // Actualizar solo el control específico que está siendo modificado
    this.bienRaizForm.controls[controlName].setValue(inputElement.value);
}

handleInput2(event: Event, controlName: string) {
  const inputElement = event.target as HTMLInputElement;
  const texto = inputElement.value;

  // Limpieza del texto según las reglas de validación
  inputElement.value = texto
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '') // Permitir solo letras, números y espacios
      .replace(/\s{2,}/g, ' ') // Reemplazar múltiples espacios con un solo espacio
      .replace(/^\s/, ''); // Eliminar espacios al inicio

  // Actualizar solo el control específico que está siendo modificado
  this.documentoForm.controls[controlName].setValue(inputElement.value);
}
/**
   * Navega al siguiente tap ya sea de creación o edición.
   */
  nextStep() {
    this.submittedTab1 = true;
    this.submitted = false;


    const bienraizformvalues = this.bienRaizForm.value;
    this.detalle_bien_Desripcion = bienraizformvalues.bien_Desripcion;

    if (this.bienRaizForm.invalid) {
      return;
    }


    const bienRaiz = {
      bien_Id: this.id || 0,
      bien_Desripcion: bienraizformvalues.bien_Desripcion,
      pcon_Id: bienraizformvalues.pcon_Id,
      bien_Imagen: bienraizformvalues.bien_Imagen,
      usua_Creacion: this.IdUsuario,
      usua_Modificacion: this.IdUsuario,
      bien_precio: this.precio  || 0
    };

    if (this.identity !== 'editar') {
      this.bienRaizService.Insertar(bienRaiz).subscribe(
        (respuestaBienRaiz) => {
          if (respuestaBienRaiz.success) {
            this.id = respuestaBienRaiz.data.codeStatus;
            this.CargarDocumentos();
            this.currentStep++;
            this.submittedTab1 = false;
          
        
        
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000, styleClass:'iziToast-custom' });
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al insertar el Bien Raíz.', life: 3000, styleClass:'iziToast-custom' });
          }
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador', life: 3000, styleClass:'iziToast-custom' });
        }
      );
    } else {
      this.abrirConfirmacionEdicion('siguiente');    }
  }


/**
   * Guarda los cambios en la edición de un bien raíz.
   */
guardar() {
    this.abrirConfirmacionEdicion('guardar');
}
 /**
   * Guarda los cambios en la edicion de un Bien Raíz.
   */
 actualizar() {
  this.submittedTab1 = true;
 

  const bienraizformvalues = this.bienRaizForm.value;
  this.detalle_bien_Desripcion = bienraizformvalues.bien_Desripcion;

  if (this.bienRaizForm.invalid) {
    return;
  }
  this.abrirConfirmacionEdicion('siguiente');

}
 /**
   * Finaliza la edicion de un bien raíz.
   * @param callback - Funcion a ejecutar después de finalizar.
   */
  finalizarEdicion(callback?: () => void) {
    const bienRaiz = {
        bien_Id: this.id || 0,
        bien_Desripcion: this.bienRaizForm.value.bien_Desripcion,
        pcon_Id: this.bienRaizForm.value.pcon_Id,
        bien_Imagen: this.bienRaizForm.value.bien_Imagen,
        usua_Creacion: this.IdUsuario,
        usua_Modificacion: this.IdUsuario
    };

    this.bienRaizService.Actualizar(bienRaiz).subscribe(
        (respuestaBienRaiz) => {
            if (respuestaBienRaiz.success) {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 , styleClass:'iziToast-custom'});
            
                this.ngOnInit;
                this.submittedTab1 = false;
          
            
            
              
            } 
            
            else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el Bien Raíz.', life: 3000, styleClass:'iziToast-custom' });
            }
        },
        error => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000, styleClass:'iziToast-custom' });
        }
    );
    this.ngOnInit;
   
    this.confirmBienRaizDialog = false;
}
  // Cargar documentación del bien raíz
  CargarDocumentos() {
    this.loading = true;

    // Inicializa las propiedades
    this.ImagenSubida = null;
    this.PDFSubida = null;
    this.ExcelSubida = null;
    this.WordSubida = null;
    this.OtrosSubida = null;

    this.documentoService.ListarImagen(this.id).subscribe(
      (data: any) => {
        this.ImagenSubida = data;
        this.checkDocumentosCargados();
      },
      error => {
      }
    );

    this.documentoService.ListarPDF(this.id).subscribe(
      (data: any) => {
        this.PDFSubida = data;
        this.checkDocumentosCargados();
      },
      error => {
      }
    );

    this.documentoService.ListarExcel(this.id).subscribe(
      (data: any) => {
        this.ExcelSubida = data;
        this.checkDocumentosCargados();
      },
      error => {
      }
    );

    this.documentoService.ListarWord(this.id).subscribe(
      (data: any) => {
        this.WordSubida = data;
        this.checkDocumentosCargados();
      },
      error => {
      }
    );

    this.documentoService.ListarOtros(this.id).subscribe(
      (data: any) => {
        this.OtrosSubida = data;
        this.checkDocumentosCargados();
      },
      error => {
      }
    );
    this.loading = false;

  }

  /**
   * Verifica si hay documentos cargados en alguna de las categorías.
   */
  checkDocumentosCargados() {
    this.documentosCargados = (this.ImagenSubida?.length || 0) > 0 ||
                              (this.PDFSubida?.length || 0) > 0 ||
                              (this.ExcelSubida?.length || 0) > 0 ||
                              (this.WordSubida?.length || 0) > 0 ||
                              (this.OtrosSubida?.length || 0) > 0;
  }
 /**
   * Guarda un nuevo documento asociado al bien raíz.
   */
 GuardarDocumento() {
  this.submitted = true;

  // Validación para el tipo de documento
  let idTipoDocumento = this.Tipodocumento.find(doc => doc.tido_Descripcion === this.documentoForm.value.tido_Descripcion)?.tido_Id ?? 0;

  // Si es diferente a 0 le declaramos que no tendrá ninguna validación
  if (idTipoDocumento !== 0) {
    this.documentoForm.get('tido_Descripcion')?.setErrors(null);
  }
  // Si el campo está vacío, mostramos el mensaje de "campo requerido"
  else if (this.documentoForm.value.tido_Descripcion === "" || this.documentoForm.value.tido_Descripcion == null) {
    this.Error_TipoDocumento = "El campo es requerido.";
    this.documentoForm.get('tido_Descripcion')?.setErrors({ 'invalidTipoDocumentoId': true });
  }
  // Si no es ninguna de las dos, mostramos el mensaje de "Opción no encontrada"
  else {
    this.Error_TipoDocumento = "Opción no encontrada.";
    this.documentoForm.get('tido_Descripcion')?.setErrors({ 'invalidTipoDocumentoId': true });
  }

  // Si el formulario es inválido, no proceder
  if (this.documentoForm.invalid) {
    return;
  }

  const documento = {
    dobt_DescipcionDocumento: this.documentoForm.value.dobt_DescipcionDocumento,
    tido_Id: idTipoDocumento,  // Asignamos el id del tipo de documento
    dobt_Imagen: this.documentoForm.value.dobt_Imagen,
    dobt_Terreno_O_BienRaizId: this.id,
    dobt_Terreno_O_BienRaizbit: false,
    usua_Creacion: this.IdUsuario,
    usua_Modificacion: this.IdUsuario
  };
  this.loading = true;

  // Inserción del documento
  this.documentoService.Insertar(documento).subscribe(
    (respuestaDocumento) => {
      if (respuestaDocumento.success) {
        this.loading = false;

        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
        this.CargarDocumentos();
        this.resetDocumentForm();
        this.limpiarDocumento();
        this.submitted = false;
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Inserción de Documento fallida.', life: 3000,styleClass:'iziToast-custom' });
      }
    },
    error => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador', life: 3000,styleClass:'iziToast-custom' });
    }
  );

}

 /**
   * Filtra la lista de documentos basada en la consulta del usuario.
   * @param event - Evento que contiene la consulta para el filtro.
   */

  filterDocumento(event: any) {
    const query = event.query.toLowerCase();
    this.filtradoDocumento = this.Tipodocumento.filter(documento =>
      documento.tido_Descripcion.toLowerCase().includes(query)
    );
  }



  /**
   * Cierra la vista de detalle o creación de bien raíz y regresa al índice.
   */
  CerrarBienRaiz() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submittedTab1  = false;

    this.submitted = false;
    this.isEditingProject = false;
    this.selectedProject = null;
    this.checkboxStates = {}; 
    this.mostrarDetallesConstruccion = false; 

  }

/**
   * Descarga un documento seleccionados.
   * @param url - URL del documento.
   * @param fileName - Nombre del archivo.
   */
  downloadDocument(url: string,fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Trunca el nombre de un archivo si es muy largo.
   * @param fileName - Nombre del archivo.
   * @returns El nombre truncado si excede 30 caracteres.
   */
  truntruncateFileName(fileName: string): string {
  if (fileName.length > 30) {
    return fileName.substring(0, 30) + '...';
  }
  return fileName;
}

/**
   * Elimina un documento asociado al bien raíz.
   * @param id - Identificador del documento.
   */



    // Lógica para abrir el diálogo de eliminación de documento
    EliminarDocumento(documento: any) {
      this.selectedDocumento = documento;
      this.deleteDocumentoDialog = true; // Muestra el diálogo de confirmación
    }

    // Confirmar eliminación del documento
    confirmarEliminarDocumento() {
      this.loading = true;
      this.documentoService.Eliminar(this.selectedDocumento.dobt_Id).subscribe(
        (respuesta: Respuesta) => {
                if (respuesta.success) {
                  this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
                  this.CargarDocumentos();
                  this.deleteDocumentoDialog=false;
                  this.loading = false;

                } else {
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Eliminación de documento fallida.', life: 3000,styleClass:'iziToast-custom' });
                  this.loading = false;

                }
              },
              error => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000,styleClass:'iziToast-custom' });
                this.loading = false;

              }
            );
    }




   /**
   * Regresa al index .
   */
  handleRegresar() {
    this.CerrarBienRaiz();
    // if (this.currentStep === 0) {

    // }
    // else {
    //   this.previousStep();

    // }
  }

    /**
   * Regresa al tab anterior.
   */
    Regresartap() {


        this.previousStep();


    }

 /**
   * Navega al anterior tap.
   */
  previousStep() {
    this.currentStep = Math.max(this.currentStep - 1, 0);
    this.identity = "editar";
    this.id;
    const projectId = this.bienRaizForm.get('pcon_Id').value;
    this.selectedProject = this.proyectosConstruccion.find(project => project.pcon_Id === projectId);
    this.mostrarDetallesConstruccion = !!this.selectedProject;
  }

  /**
   * Abre un modal para seleccionar un proyecto de construcción.
   */
  openModal() {
    this.loadProjects();
    this.displayModal = true;
  }

 /**
   * Cierra el modal de selección de proyecto.
   */
  closeModal() {
    this.displayModal = false;
  }

 

  loadProjects() {
    this.bienRaizService.ListarProyectoContruccionBienRaiz().subscribe(
      (data: ProyectoContruccionBienRaiz[]) => {
        this.proyectosConstruccion = data;

        // Solo buscar el proyecto si estamos en modo edición y no está en la lista
        if (this.isEditMode && this.idpro) {
        
          // Si el proyecto no está en la lista, búscalo por ID
          if (!this.selectedProject) {
            this.buscarProyectoPorId(this.idpro);
          }
        }
      },
      error => {
      }
    );
}

  

onTabChange(event: any) {
  const newIndex = this.steps.indexOf(event.item);
  if (newIndex === 0) { 
    const projectId = this.bienRaizForm.get('pcon_Id').value;
    if (projectId) {
      this.buscarProyectoPorId(projectId);
    }
  }
}





  /**
   * Carga la documentación asociada al bien raíz.
   */
    cargarDatos() {
      this.isLoading = true;
      this.bienRaizService.Listar().subscribe(
        (data: any) => {
          this.bienesRaices = data.map((bienRaiz: any) => ({
            ...bienRaiz,
            bien_FechaCreacion: new Date(bienRaiz.bien_FechaCreacion).toLocaleDateString(),
            bien_FechaModificacion: new Date(bienRaiz.bien_FechaModificacion).toLocaleDateString()
          }));
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
        }
      );
    }

/**
   * Busca un proyecto de construcción por su id.
   * @param idpro - Identificador del proyecto.
   */
buscarProyectoPorId(idpro: number) {
  this.bienRaizService.BuscarProyecto(idpro).subscribe(
    (proyecto: ProyectoContruccionBienRaiz) => {
      this.selectedProject = proyecto;
      this.mostrarDetallesConstruccion = true;
    },
    (error) => {
    }
  );
}



}
