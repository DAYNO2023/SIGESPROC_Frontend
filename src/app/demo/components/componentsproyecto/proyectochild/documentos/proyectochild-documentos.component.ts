import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { FileUpload } from "primeng/fileupload";
import { Table } from "primeng/table";
import { Empleado } from "src/app/demo/models/modelsgeneral/empleadoviewmodel";
import { Documento, Proyecto } from "src/app/demo/models/modelsproyecto/proyectoviewmodel";
import { NavigationStateService } from "src/app/demo/services/navigationstate.service";
import { EmpleadoService } from "src/app/demo/services/servicesgeneral/empleado.service";
import { DocumentoService } from "src/app/demo/services/servicesproyecto/documento.service";
import { SharedService } from "src/app/demo/services/shared.service";
import { UtilitariosService } from "src/app/demo/services/utilitarios.service";
import { environment } from "src/environment/environment";
import { CookieService } from "ngx-cookie-service";

/**
 * `ProyectoChildDocumentosComponent` gestiona la visualización y manipulación de los documentos asociados a un proyecto.
 * Permite la carga, visualización, edición, eliminación y gestión de documentos.
 */
@Component({
    templateUrl: './proyectochild-documentos.component.html',
    styleUrl: './proyectochild-documentos.component.scss'
})
export class ProyectoChildDocumentosComponent implements OnInit {
    @ViewChild('fileUploader') fileUploader: FileUpload; // Referencia al componente de carga de archivos
    @ViewChild('guardarButton') guardarButton!: ElementRef<HTMLButtonElement>;

    // Propiedades del componente
    private apiUrl: string = environment.apiUrl; // URL base de la API

    /** Estado de carga de la tabla */
    isTableLoading: boolean = false;

    /** Mensaje a mostrar cuando no hay proyectos cargados */
    loadedTableMessage: string = "";

    submitted: boolean = false; // Indicador de si el formulario ha sido enviado

    deleteDocumentoDialog: boolean = false; // Indicador de si el diálogo de eliminación está visible

    editarDocumentoDialog: boolean = false; // Indicador de si el diálogo de edición está visible

    detalleDocumento: boolean = false; // Indicador de si el detalle del documento está visible

    documentos: Documento[] = []; // Lista de documentos asociados al proyecto

    documento: Documento = {}; // Documento actualmente seleccionado o editado

    selectedDocumento: Documento[] = []; // Documento seleccionado para ver detalles

    file: File | null = null; // Archivo seleccionado para carga

    filePreview: any | null = null; // Vista previa del archivo cargado

    fileType: string | null = null;

    fileSize: number | null = null;

    acceptedFiles: any[] = [];

    totalSize: number = 0; // Tamaño total de los documentos

    totalSizePercent: number = 0; // Porcentaje del tamaño total

    tiposDocumento: any[] = [ // Tipos de documentos disponibles
        { id: 'R', label: 'Requisito de Proyecto' },
        { id: 'C', label: 'Contrato de Proyecto' },
        { id: 'E', label: 'Contrato de Empleado' },
        { id: 'O', label: 'Otro' },
    ];

    tipoDocumento: any; // Tipo de documento seleccionado

    filteredTiposDocumento: any[] = []; // Lista filtrada de tipos de documentos para autocompletar

    proyecto: Proyecto = {}; // Proyecto asociado al componente

    empleados: Empleado[] = []; // Lista de empleados para asociar documentos

    filteredEmpleados: Empleado[] = []; // Lista filtrada de empleados para autocompletar

    private actionItemsCache = new Map(); // Caché de elementos de acción para documentos

    usua_Id: string = "";

    defaultDatabaseDate = new Date('2000-01-01');
    isOptionEmpleadoNotFound: boolean;
    isOptionTipoDocumentoNotFound: boolean;

    /**
     * Constructor del componente.
     * @param documentoService - Servicio para gestionar documentos
     * @param empleadoService - Servicio para gestionar autoComplete empleados
     * @param sharedService -  Servicio para gestionar el speeddial
     * @param navigationStateService - Servicio para gestionar el estado de navegación
     * @param utilitariosService - Servicio utilitario para funcionalidades generales
     * @param sanitizer - Servicio de url seguras
     * @param messageService - Servicio para mostrar mensajes
     * @param router - Router para navegación
     */
    constructor(
        private documentoService: DocumentoService,
        private empleadoService: EmpleadoService,
        private navigationStateService: NavigationStateService,
        private utilitariosService: UtilitariosService,
        private sharedService: SharedService,
        private sanitizer: DomSanitizer,
        private messageService: MessageService,
        private router: Router,
        private cookieService: CookieService,
    ) {}

    /**
     * Inicializa el componente, cargando los documentos y configurando el estado inicial.
     */
    async ngOnInit() {
        this.isTableLoading = true;
        if(this.cookieService.get("Token") == 'false'){
            this.router.navigate(['/auth/login']);
        }
        this.usua_Id = this.cookieService.get("usua_Id");
         // Suscripción al evento para desplazar y enfocar el botón de guardar
         this.sharedService.buttonGuardar$.subscribe(() => {

            const buttonTop = this.guardarButton.nativeElement.offsetTop;

            setTimeout(() => {
                window.scrollTo({ top: buttonTop + 100, behavior: 'smooth' });
                this.guardarButton.nativeElement.focus();
                this.guardarButton.nativeElement.click();
            }, 100);
        });

        const navigationState = this.navigationStateService.getState();

        this.empleadoService.getData()
        .subscribe((data) => { this.empleados = data; });

        if (navigationState && navigationState.proyecto) {
            this.proyecto = navigationState.proyecto;
            this.documento = { usua_Creacion: parseInt(this.usua_Id), proy_Id: this.proyecto.proy_Id };

            this.removeFile(); // Limpia el archivo seleccionado y la vista previa

            await this.documentoService.Listar(this.proyecto.proy_Id)
                .then((data) => {
                    this.documentos = data;

                    // Muestra un mensaje si no hay proyectos
                    if (this.documentos.length === 0) {
                        this.loadedTableMessage = "No existen proyectos existentes aún.";
                    }
                })
                .catch((error) => {
                    this.loadedTableMessage = error.message;
                })
                .finally(() => {
                    this.isTableLoading = false;
                });
        }else{
            this.router.navigate(['./sigesproc/proyecto/proyecto']);
        }
    }

    /**
     * Abre el formulario para editar un documento existente.
     * @param documento - Documento a editar
     */
    editarDocumento(documento: Documento) {
        this.documento = { ...documento, usua_Modificacion: parseInt(this.usua_Id) };
        this.utilitariosService.setDateProperties(this.documento);

        this.documentoService.CargarDocumento(documento.docu_Ruta)
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    this.fileType = blob.type;
                    this.fileSize = blob.size;

                    if (this.fileType.startsWith('image/')) {
                        this.filePreview = reader.result;
                    } else if (this.fileType === 'application/pdf' || this.fileType === 'text/plain'){
                        const pdfUrl = URL.createObjectURL(blob);
                        this.filePreview = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
                    }
                };
                reader.readAsDataURL(blob);
            });
    }

    /**
     * Muestra los detalles de un documento.
     * @param documento - Documento para ver detalles
     */
    async verDocumentoDetalle(documento: Documento) {
        this.documento = { ...documento, usua_Modificacion: parseInt(this.usua_Id) };
        await this.documentoService.Buscar(this.documento.docu_Id)
            .then((data) => this.selectedDocumento.push(data));

        this.detalleDocumento = true;
    }

    /**
     * Abre el diálogo para confirmar la eliminación de un documento.
     * @param documento - Documento a eliminar
     */
    eliminarDocumento(documento: Documento) {
        this.documento = { ...documento };
        this.deleteDocumentoDialog = true;
    }

    /**
     * Confirma la eliminación del documento.
     */
    async confirmarEliminarDocumento() {
        this.deleteDocumentoDialog = false;
        try {
            let response = await this.documentoService.Eliminar(this.documento.docu_Id);

            const { code, data, message } = response; // Desestructura la respuesta

            // Inicializa variables para el mensaje del servicio
            let severity = 'error';
            let summary = 'Error';
            let detail = data?.messageStatus || message;

            // Verifica el código de respuesta
            if (code === 200) {
                severity = data.codeStatus > 0 ? 'success' : 'warn';
                summary = data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
            } else if (code === 500) {
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
            this.ngOnInit();

        } catch (error) {
            // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
            // this.messageService.add({
            //     severity: 'error',
            //     summary: 'Error Externo',
            //     detail: error.message || error,
            //     life: 3000
            // });
        }
    }

    /**
     * Guarda o actualiza el documento.
     */
    async guardarDocumento() {
        this.submitted = true;

        if (this.documento.docu_Descripcion?.trim() && (this.filePreview && this.filePreview != 'Archivo no aceptado.')) {
            try {
                let response;

                if(!this.documento.docu_Ruta){
                    await this.uploadFile(this.file);
                }

                if(!this.documento.docu_Tipo){
                    this.documento.docu_Tipo = this.tiposDocumento.find(tipoDocumento => tipoDocumento.label === this.documento.docu_TipoDescripcion)?.id;
                }

                if(!this.documento.empl_Id){
                    let foundEmpleado = this.empleados.find(empleado => empleado.empl_NombreCompleto === this.documento.empl_NombreCompleto)
                    || this.empleados.find(empleado => empleado.empl_DNI === this.documento.empl_NombreCompleto);

                    this.documento.empl_Id = foundEmpleado?.empl_Id || null;
                }

                if (this.documento.docu_Id) {
                    if (this.editarDocumentoDialog) {
                        this.editarDocumentoDialog = false;

                        response = await this.documentoService.Actualizar(this.documento);
                    } else {
                        this.editarDocumentoDialog = true;
                    }
                } else {
                    response = await this.documentoService.Insertar(this.documento);
                }

                if(response){
                    let severity = 'error';
                    let summary = 'Error';
                    let detail = response.data?.messageStatus || response.message;

                    if (response.code === 200) {
                        severity = response.data.codeStatus > 0 ? 'success' : 'warn';
                        summary = response.data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
                    } else if (response.code === 500) {
                        severity = 'error';
                        summary = 'Error Interno';
                    }

                    this.messageService.add({
                        severity,
                        summary,
                        styleClass: 'iziToast-custom',
                        detail,
                        life: 3000
                    });
                }

                if (response?.data?.codeStatus > 0) {
                    this.submitted = false;
                    this.ngOnInit();
                }

            } catch (error) {
                // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
                // this.messageService.add({
                //     severity: 'error',
                //     summary: 'Error Externo',
                //     detail: error.message || error,
                //     life: 3000
                // });
            }
        }
    }

    buttonLimpiar(){
        this.documento = {usua_Creacion: parseInt(this.usua_Id), proy_Id: this.proyecto.proy_Id};
        this.removeFile();

        this.submitted = false;
    }

    /**
     * Cierra el diálogo de detalle del documento.
     */
    cerrarDocumentoDetalle() {
        this.detalleDocumento = false;
        this.selectedDocumento = [];
    }

    /**
     * Maneja la selección de un archivo para carga y muestra una vista previa.
     * @param event - Evento que contiene el archivo seleccionado
     */
    onImageSelect(event: any) {
        const file = event.files[0];
        if (file) {
            this.file = file;

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.fileType = file.type;

                if (this.fileType.startsWith('image/')) {
                    this.filePreview = e.target.result;
                } else if (this.fileType === 'application/pdf' || this.fileType === 'text/plain'){
                    this.filePreview = this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result);
                } else if (this.fileType.startsWith('application/vnd.openxmlformats-officedocument')){
                    this.filePreview = 'https://i.pinimg.com/originals/c3/e4/bb/c3e4bb7464bb8d8f57243b4a1dfebfec.png'
                }else{
                    this.filePreview = 'Archivo no aceptado.';
                    
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'El formato del archivo no es el permitido. Trate PDF, Word, Texto plano o una Imágen.',
                        life: 5000
                    });
                }
            };

            reader.readAsDataURL(file);
        }
    }

    /**
     * Sube un archivo al servidor y establece la ruta del documento.
     * @param file - Archivo a subir
     */
    async uploadFile(file: File) {
        await this.documentoService.SubirDocumento(file)
            .then((filePath) => {
                this.documento.docu_Ruta = filePath;
            })
            .catch((error) => {
                console.error('Error al subir el archivo:', error);
            });
    }

    /**
     * Abre el selector de archivos.
     */
    chooseFile() {
        this.fileUploader.advancedFileInput.nativeElement.click();
    }

    /**
     * Elimina el archivo seleccionado y la vista previa.
     */
    removeFile() {
        this.file = null;
        this.filePreview = null;
    }

    /**
     * Abre un archivo en una nueva pestaña del navegador.
     * @param path - Ruta del archivo
     */
    openFile(path: string) {
        window.open(`${this.apiUrl}/${path}`, '_blank');
    }

    /**
     * Genera los elementos de acción para un documento en la tabla.
     * @param documento - Documento para generar acciones
     * @returns - Lista de acciones disponibles para el documento
     */
    generarDocumentoActionSplitButton(documento: Documento) {
        if (!this.actionItemsCache.has(documento)) {
            const items = [
                { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.editarDocumento(documento) },
                // { label: 'Detalle', icon: 'pi pi-eye', command: () => this.verDocumentoDetalle(documento) },
                { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.eliminarDocumento(documento) },
            ];
            this.actionItemsCache.set(documento, items);
        }
        return this.actionItemsCache.get(documento);
    }

    /**
     * Filtra la lista de empleados para autocompletar.
     * @param event - Evento que contiene el texto de búsqueda
     */
    filterEmpleados(event: any) {
        const filtered: any[] = [];
        const query = event.query;
        for (let i = 0; i < this.empleados.length; i++) {
            const empleado = this.empleados[i];
            if (empleado.empleado.toLowerCase().indexOf(query.toLowerCase()) == 0 ) {
                filtered.push(empleado.empleado);
            }
        }

        this.filteredEmpleados = filtered.sort((a, b) => a.localeCompare(b));
    }

    onSelectEmpleado(){
        const foundoption = this.empleados.some(x => x.empleado === this.documento.empl_NombreCompleto);
        this.isOptionEmpleadoNotFound = !foundoption;
    }

    /**
     * Filtra la lista de tipos de documentos para autocompletar.
     * @param event - Evento que contiene el texto de búsqueda
     */
    filterTipoDocumento(event: any) {
        const filtered: any[] = [];
        const query = event.query;

        for (let i = 0; i < this.tiposDocumento.length; i++) {
            const tipoDocumento = this.tiposDocumento[i];
            if (tipoDocumento.label.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(tipoDocumento.label);
            }
        }

        this.filteredTiposDocumento = filtered.sort((a, b) => a.localeCompare(b));
    }

    onSelectTipoDocumento(){
        const foundoption = this.tiposDocumento.some(x => x.label === this.documento.docu_TipoDescripcion);
        this.isOptionTipoDocumentoNotFound = !foundoption;
    }

    /**
     * Retorna una lista de propiedades filtradas del documento para mostrar en detalle.
     * @returns - Lista de pares clave-valor de las propiedades del documento
     */
    getFilteredPropertyArray(): { key: string, value: Documento }[] {
        const excludedKeywords = ['Creacion', 'Modificacion', 'Estado', 'tb'];

        return Object.keys(this.documento)
            .filter(key => !excludedKeywords.some(keyword => key.includes(keyword)))
            .map(key => ({
                key: key.replace(/^(docu_|cont_|coem_|usua_)/, ''),
                value: this.documento[key]
            }));
    }

    /**
     * Filtra globalmente los datos de la tabla en base al texto de búsqueda.
     * @param table - Tabla a filtrar
     * @param event - Evento que contiene el texto de búsqueda
     */
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    allowOnlyAlphanumeric(event: any) {
        event.target.value = event.target.value
            .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')  // Remueve caracteres no permitidos
            .replace(/\s{2,}/g, ' ')  // Reemplaza múltiples espacios por uno solo
            .trimStart();  // Elimina espacios al principio
        // event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s=+$\.]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
        //   .replace(/\s{2,}/g, ' ')
        //   .replace(/^\s/, '');
    }

    // Función para validar texto y números
    ValidarTextoNumeros(event: KeyboardEvent) {
        const inputElement = event.target as HTMLInputElement;
        const key = event.key;
    
        if (key === ' ' && inputElement.selectionStart === 0) {
        event.preventDefault();
        }
    }
}
