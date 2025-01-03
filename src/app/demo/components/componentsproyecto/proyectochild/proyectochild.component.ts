import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { MessageService, ConfirmationService, MenuItem } from "primeng/api";
import { Table } from "primeng/table";
import { Proyecto } from "src/app/demo/models/modelsproyecto/proyectoviewmodel";
import { NavigationStateService } from "src/app/demo/services/navigationstate.service";
import { ProyectoService } from "src/app/demo/services/servicesproyecto/proyecto.service";
import { SharedService } from "src/app/demo/services/shared.service";
import { CookieService } from "ngx-cookie-service";
import { i, log } from "mathjs";
import { TabMenu } from "primeng/tabmenu";
import { Pago } from "src/app/demo/models/modelsproyecto/pagoviewmodel";
import { PagoService } from "src/app/demo/services/servicesproyecto/pago.service";
import { filter } from "rxjs";
/**
 * Componente que maneja la vista y operaciones relacionadas con proyectos.
 * Permite crear, editar, visualizar detalles y eliminar proyectos.
 */
@Component({
    templateUrl: './proyectochild.component.html',
    providers: [MessageService, ConfirmationService, DatePipe, CookieService],
    styleUrls: ['./proyectochild.component.scss']
})
export class ProyectoChildComponent implements OnInit {
    @ViewChild('tabMenu') tabMenu: TabMenu;

    // Propiedades
    expandedRows = {};
    /** Estado de carga de la tabla */
    isTableLoading: boolean = false;

    /** Mensaje a mostrar cuando no hay proyectos cargados */
    loadedTableMessage: string = "";

    /** Nombre del proyecto actualmente seleccionado */
    proyectoSeleccionado: string = "";

    /** Estado que indica si se muestra el formulario del proyecto */
    proyectoFormulario: boolean = false;

    /** Estado que indica si se muestra la vista de índice de proyectos */
    indexProyecto: boolean = true;

    /** Estado que indica si se muestra el detalle del proyecto */
    detalleProyecto: boolean = false;

    /** Estado del diálogo de eliminación de proyecto */
    deleteProyectoDialog: boolean = false;

    abonoDialog: boolean = false;

    /** Lista de proyectos cargados */
    proyectos: Proyecto[] = [];

    pagos: Pago[] = [];

    /** Proyecto(s) seleccionado(s) en la tabla */
    selectedProyecto: Proyecto[] = [];

    /** Proyecto actualmente en edición o visualización */
    proyecto: Proyecto = {usua_Creacion: 3};

    pago: Pago = {};

    /** Indica si el formulario ha sido enviado */
    submitted: boolean = false;

    usua_Id: number = null;

    /** Columnas a mostrar en la tabla de proyectos */
    cols: any[] = [];

    /** Título de la vista actual */
    title: string = "";

    /** Elementos del menú de navegación */
    menuItems: MenuItem[] = [];

    defaultDatabaseDate = new Date('1920-01-01')

    /** Caché de elementos de acción para proyectos */
    private actionItemsCache = new Map<Proyecto, MenuItem[]>();

    // Constructor
    constructor(
      private proyectoService: ProyectoService,
      private sharedService: SharedService,
      public navigationStateService: NavigationStateService,
      private messageService: MessageService,
      private router: Router,
      private datePipe: DatePipe,
      private cookieService: CookieService,
      private pagoService: PagoService,
    )
      {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (event.urlAfterRedirects.includes('/sigesproc/proyecto/proyecto') && 
                    !event.urlAfterRedirects.includes('/sigesproc/proyecto/proyecto/datosgenerales') &&
                    !event.urlAfterRedirects.includes('/sigesproc/proyecto/proyecto/etapas') && 
                    !event.urlAfterRedirects.includes('/sigesproc/proyecto/proyecto/documentos') && 
                    !event.urlAfterRedirects.includes('/sigesproc/proyecto/proyecto/riesgos')
                ) {
                    this.ngOnInit();

                    this.indexProyecto = true;
                    this.proyectoFormulario = false;
                }
            });
      }

    /**
     * Inicializa el componente.
     * Carga la lista de proyectos y configura el menú de navegación.
     */
    async ngOnInit() {
        if(this.cookieService.get("Token") == 'false'){
            this.router.navigate(['/auth/login']);
        }

        this.usua_Id = parseInt(this.cookieService.get('usua_Id'));
        // Inicia el spinner de carga de la tabla
        this.isTableLoading = true;
        
        // Configura el menú de navegación según el estado del proyecto
        this.navigationStateService.getStateObservable().subscribe(state => {
            this.menuItems = [
                { label: 'Datos Generales', routerLink: ['datosgenerales'], },
                this.proyecto?.tipr_Id !== 4 ? { label: 'Etapas', routerLink: ['etapas'], disabled: !state.proyecto?.proy_Id } : null,
                { label: 'Documentos', routerLink: ['documentos'], disabled: state.proyecto?.proy_Id ? false : true},
                this.proyecto?.tipr_Id !== 4 ? { label: 'Riesgos', routerLink: ['riesgos'], disabled: !state.proyecto?.proy_Id } : null,
            ].filter(item => item !== null)
        });

        this.title = "Proyectos";

        // Carga la lista de proyectos desde el servicio
        await this.proyectoService.Listar()
            .then(async data => {
                // Actualiza la lista de proyectos
                this.proyectos = data;
            })
            .finally(async () => {
                if(this.proyectos !== null){
                    const navigationState = this.navigationStateService.getState();

                    if(navigationState && (navigationState.fleteGrouped || navigationState.compraGrouped)){
                        this.editarProyecto(navigationState.fleteGrouped[0].proyecto);
                    }
                    
                    // Muestra un mensaje si no hay proyectos
                    if (this.proyectos.length > 0) {
                        this.loadedTableMessage = "No existen proyectos existentes aún.";
                    }else{
                        await this.pagoService.Listar()
                            .then((data) => {
                                this.pagos = data;
                            })
                            .finally(() => {

                                // this.pagos = this.proyectos.map((pagos) =>({
                                //     ...pagos,
                                // }));    
                                if (this.pagos.length !> 0) {
                                    this.proyectos.forEach(element => {
                                        element.pagos = this.pagos.filter((x) => x.proy_Id === element.proy_Id);
                                        
                                        if(element.pagos.length !== 0){
                                            element.pagos.forEach((pago, index) => {
                                                pago.row = index + 1;  // Start row numbers from 1 within each project
                                            });
                                        }
                                    });
                                }
                            })
                            .catch((error) => {
                                this.loadedTableMessage = error.message;
                                this.isTableLoading = false;
                            });
                    }

                    this.isTableLoading = false;
                }else{
                    this.loadedTableMessage = 'Error en la api';
                    this.isTableLoading = false;
                }
            })
            .catch((error) => {
                this.loadedTableMessage = error.message;
                this.isTableLoading = false;
            });
    }

    /**
     * Genera los elementos de acción para un proyecto en la tabla.
     * @param proyecto - Proyecto para el que se generan los elementos de acción
     * @returns Elementos de acción para el proyecto
     */
    generarActionSplitButton(proyecto: Proyecto) {
        // Evita cargas innecesarias si el proyecto ya está en caché
        if (!this.actionItemsCache.has(proyecto)) {
            // Define los elementos de acción
            const items: MenuItem[] = [
              { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.editarProyecto(proyecto) },
              { label: 'Detalle', icon: 'pi pi-eye', command: () => this.abrirDetalle(proyecto) },
              { label: 'Seguimiento', icon: 'pi pi-chart-line', command: () => this.abrirSeguimiento(proyecto) },
              { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.eliminarProyecto(proyecto) },
              { label: 'Abonar', icon: 'pi pi-dollar', command: () => this.abrirAbonar(proyecto) },
            ];
            // Almacena los elementos de acción en caché
            this.actionItemsCache.set(proyecto, items);
        }
        // Retorna los elementos de acción almacenados en caché
        return this.actionItemsCache.get(proyecto);
    }

    /**
     * Abre un nuevo formulario para crear un proyecto.
     */
    abrirNuevo() {
        // Inicializa un nuevo proyecto
        this.proyecto = {usua_Creacion: this.usua_Id};

        this.navigationStateService.setState('proyectos', this.proyectos);
        // Configura el estado de navegación
        this.navigationStateService.setState('proyecto', this.proyecto );

        // Redirige a la vista de datos generales del nuevo proyecto
        this.router.navigate(['/sigesproc/proyecto/proyecto/datosgenerales']);

        this.submitted = false;
        this.title = "Nuevo Proyecto";
        this.indexProyecto = false;
        this.proyectoFormulario = true;
    }

    abrirAbonar(proyecto: Proyecto){
        this.abonoDialog = true;
        this.submitted = false;
        this.pago = {};
        this.proyecto = { ...proyecto };
    }

    async guardarPago(){
        this.submitted = true;

        if(this.proyecto.espr_Descripcion !== 'En Presupuesto' && this.pago.pago_Monto){
            try {
                this.pago = {...this.pago,
                    usua_Creacion: this.usua_Id,
                    proy_Id: this.proyecto.proy_Id,
                    clie_Id: this.proyecto.clie_Id,
                };

                let response = await this.pagoService.Insertar(this.pago);

                // Muestra un mensaje de éxito o advertencia según la respuesta
                this.messageService.add({
                    severity: response.code == 200 ? 'success' : 'warn',
                    summary: response.code == 200 ? 'Éxito' : 'Advertencia',
                    styleClass: 'iziToast-custom',
                    detail: response.data?.messageStatus || response.message,
                    life: 3000,
                });

                if (response.code == 200) {
                    this.pago = {usua_Creacion: this.usua_Id};
                    this.ngOnInit();
                }

            } catch (error) {
                // Muestra un mensaje de error si ocurrió una excepción
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    styleClass: 'iziToast-custom',
                    detail: error.message || error,
                    life: 3000
                });
            }
        }else{
            if(this.proyecto.espr_Descripcion === 'En Presupuesto' && this.pago.pago_Monto){
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    styleClass: 'iziToast-custom',
                    detail: 'No es posible abonar a un proyecto "En Presupuesto".',
                    life: 3000,
                });
            }
        }
    }

    cerrarDialogPago(){
        this.abonoDialog = false;
    }

    /**
     * Abre el formulario para editar un proyecto existente.
     * @param proyecto - Proyecto a editar
     */
    editarProyecto(proyecto: Proyecto) {
        // Inicializa el proyecto en modo edición
        this.proyecto = { ...proyecto, usua_Modificacion: this.usua_Id};

        // Configura las fechas del proyecto
        this.setDateProperties(this.proyecto);

        this.navigationStateService.setState('proyectos', this.proyectos);
        // Configura el estado de navegación
        this.navigationStateService.setState('proyecto', this.proyecto );

        // Redirige a la vista de datos generales del proyecto en edición
        const navigationState = this.navigationStateService.getState();

        this.title = "Editar Proyecto";
        this.proyectoSeleccionado = `${this.proyecto.proy_Nombre}`;
        this.indexProyecto = false;
        this.proyectoFormulario = true;

        if(navigationState && navigationState.fleteGrouped || navigationState.compraGrouped){
            this.router.navigate(['/sigesproc/proyecto/proyecto/etapas']);
        }else{
            this.router.navigate(['/sigesproc/proyecto/proyecto/datosgenerales']);
        }
    }

    /**
     * Abre la vista de detalles de un proyecto.
     * @param proyecto - Proyecto a detallar
     */
    async abrirDetalle(proyecto: Proyecto) {
        // Establece el proyecto a mostrar en detalle
        this.proyecto = { ...proyecto};

        // Obtiene información detallada del proyecto
        await this.proyectoService.Buscar(this.proyecto.proy_Id)
            .then((data) => this.selectedProyecto.push(data));

        // Configura las fechas del proyecto
        this.setDateProperties(this.proyecto);

        this.title = "Detalle Proyecto";
        this.indexProyecto = false;
        this.detalleProyecto = true;
    }

    /**
     * Abre el diálogo para confirmar la eliminación de un proyecto.
     * @param proyecto - Proyecto a eliminar
     */
    eliminarProyecto(proyecto: Proyecto) {
        // Establece el proyecto a eliminar
        this.proyecto = { ...proyecto, usua_Modificacion: this.usua_Id};
        this.deleteProyectoDialog = true;
    }

    // Accion Seguimiento
    async abrirSeguimiento(proyecto: Proyecto) {
        this.proyecto = { ...proyecto};
        this.setDateProperties(this.proyecto);

        // this.navigationStateService.setState({ proyecto: this.proyecto });
        this.cookieService.set('proyecto', JSON.stringify({proy_Id: proyecto.proy_Id, proy_Nombre: proyecto.proy_Nombre, proy_FechaInicio: proyecto.proy_FechaInicio, proy_FechaFin: proyecto.proy_FechaFin}));

        // this.navigationStateService.setState('proyecto', this.proyecto );
        // this.cookieService.set('proyecto', JSON.stringify(proyecto));
        this.router.navigate(['/sigesproc/proyecto/seguimientoproyecto']);
    }

    /**
     * Confirma y ejecuta la eliminación de un proyecto.
     */
    async confirmarEliminar() {
        this.deleteProyectoDialog = false;

        try {
            // Llama al servicio para eliminar el proyecto
            let response = await this.proyectoService.Eliminar(this.proyecto.proy_Id);

            // Muestra un mensaje de éxito o advertencia según la respuesta
            this.messageService.add({
                severity: response.code == 200 ? 'success' : 'warn',
                summary: response.code == 200 ? 'Éxito' : 'Advertencia',
                styleClass: 'iziToast-custom',
                detail: response.data?.messageStatus || response.message,
                life: 3000
            });

            // Reinicia el componente si la eliminación fue exitosa
            if (response.code == 200) {
                this.proyecto = {usua_Creacion: this.usua_Id};
                this.ngOnInit();
            }

        } catch (error) {
            // Muestra un mensaje de error si ocurrió una excepción
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                styleClass: 'iziToast-custom',
                detail: error.message || error,
                life: 3000
            });
        }

    }

     /**
     * Cierra el formulario del proyecto y vuelve al índice de proyectos.
     */
    cerrarFormulario() {
        // Limpiamos el Titul ode accion
        this.title = "";
        // Limpiamos en caso de que haya un proyecto seleccionado
        this.proyectoSeleccionado = "";

        // Limpiamos el objeto de navegacion
        this.navigationStateService.clearSpecificState('proyecto');
        this.navigationStateService.clearSpecificState('proyectos');

        // Nos salimos de la ruta child del menuTab
        this.router.navigate(['/sigesproc/proyecto/proyecto']);

        // Reiniciamos el componente
        this.ngOnInit();

        // Ocultamos el formulario
        this.proyectoFormulario = false;
        // Mostarmos el index
        this.indexProyecto = true;
        //cerramos detalle
        this.detalleProyecto = false;
        //vaciamos auditoria
        this.selectedProyecto = [];
        // Seteamos el formulario a no enviado
        this.submitted = false;
    }

    siguiente(){
        const navigationState = this.navigationStateService.getState();

        if (navigationState && navigationState.proyecto?.proy_Id) {
            const currentIndex = this.menuItems.findIndex(item => this.router.url.includes(item.routerLink[0]));
            if (currentIndex !== -1 && currentIndex < this.menuItems.length - 1) {
                const nextItem = this.menuItems[currentIndex + 1];
                this.router.navigate([`/sigesproc/proyecto/proyecto/${nextItem.routerLink[0]}`]);
            }
        } else {
            this.sharedService.triggerButtonClick();
        }
    }
    anterior(){
        const currentIndex = this.menuItems.findIndex(item => this.router.url.includes(item.routerLink[0]));
        if (currentIndex > 0) {
            const prevItem = this.menuItems[currentIndex - 1];
            this.router.navigate([`/sigesproc/proyecto/proyecto/${prevItem.routerLink[0]}`]);
        }
    }

    isFirstTab(): boolean {
        const currentIndex = this.menuItems.findIndex(item => this.router.url.includes(item.routerLink[0]));
        return currentIndex === 0;
    }

    isLastTab(): boolean {
        const currentIndex = this.menuItems.findIndex(item => this.router.url.includes(item.routerLink[0]));
        return currentIndex === this.menuItems.length - 1;
    }

    // Buscar (no utilizado)
    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.proyectos.length; i++) {
            if (this.proyectos[i].proy_Id === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    /**
     * Establece las propiedades de fecha en el proyecto.
     * @param proyecto - Proyecto con propiedades de fecha
     */
    setDateProperties(obj: any) {
        // Seteo de si la propiedad es parseable a Date
        const isDateString = (value: any): boolean => {
          return typeof value === 'string' && !isNaN(Date.parse(value));
        };

        // Iteramos las propiedades
        for (const key in obj) {
            // Omitimos algunos campos que segun su valor puede ser que los detecte como parseables cuando no lo deberian
            if (!key.endsWith('DireccionExacta') &&
                !key.endsWith('Nombre') &&
                !key.endsWith('Descripcion')
                && isDateString(obj[key])) {
                // Parseamos la propiedad a Date
                obj[key] = new Date(obj[key]);
            }
        }
    }

    /**
     * Filtro de search del DataTable.
     */
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    /**
     * Establece las propiedades de fecha en el proyecto.
     * @return array de propiedades del objeto Proyecto
     */
    getFilteredPropertyArray(): { key: string, value: Proyecto }[] {
        // Palabras clave a excluir
        const excludedKeywords = ['Creacion', 'Modificacion', 'Estado', 'tb', 'Id','ciud', 'proyecto','clie','acet','etpr','etap','unme', 'acti', 'inpa', 'espr', 'row', 'LinkUbicacion', 'estadoPresupuesto', 
            'frec_NumberDias', 'pais_Nombre', 'icca_Imagen', 'proy_CostoInsumos', 'proy_CostoMaquinaria', 'proy_CostoEquipoSeguridad', 'proy_PrecioManoObra', 'proy_CostoIncidencias', 'tipr', 'pagos'];

        // Retorna las propiedades a mostrar en el detalle
        return Object.keys(this.proyecto)
        // filtra segun las propiedades a excluir
        .filter(key => !excludedKeywords.some(keyword => {
            return keyword === 'ciud' || keyword === 'espr' ? key === keyword : key.includes(keyword);
        }))
        // Mapea las propiedades
        .map(key => {
            // quita el identificador de campo de la bd
            let newKey = key.replace(/^(proy_|usua_)/, '');
            // Si empieza con alguna de estas setea a un nombre especifico
            if (key.startsWith('ciud_')) {
                newKey = 'Ciudad';
            }
            
            if (key.startsWith('esta_')) {
                newKey = 'Estado';
            }
            if (key.startsWith('pais_')) {
                newKey = 'País';
            }
            if (key.endsWith('DireccionExacta')) {
                newKey = 'Dirección Exacta';
            }
            if (key.endsWith('FechaInicio')) {
                newKey = 'Fecha de Inicio';
            }
            if (key.endsWith('FechaFin')) {
                newKey = 'Fecha de Finalización';
            }
            if (key.endsWith('tipr_Descripcion')) {
                newKey = 'Tipo de Proyecto';
            }
            if (key.endsWith('espr_Descripcion')) {
                newKey = 'Estado del Proyecto';
            }
            if (key.endsWith('ciud_Descripcion')) {
                newKey = 'Ciudad';
            }
            if (key.endsWith('proy_Descripcion')) {
                newKey = 'Descripción';
            }
            if (key.endsWith('frecuencia')) {
                newKey = 'Frecuencia de Pago';
            }
            if (key.endsWith('tipr_Descripcion')) {
                newKey = 'Tipo de Proyecto';
            }

            // Asigna formato de fecha a las fechas
            let value = this.proyecto[key];
            if (value instanceof Date) {
                value = this.datePipe.transform(value, 'dd/MM/yy hh:mm:ss a');
            }

            // retorna la propiedad con su valor
            return {
                key: newKey,
                value: value
            };
        });
    }
}
