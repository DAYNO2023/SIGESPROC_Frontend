import { ChangeDetectorRef, Component, ElementRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { Table } from "primeng/table";
import { Empleado } from "src/app/demo/models/modelsgeneral/empleadoviewmodel";
import { UnidadMedida } from "src/app/demo/models/modelsgeneral/unidadmedidaviewmodel";
import { Actividad } from "src/app/demo/models/modelsproyecto/actividadviewmodel";
import { Etapa } from "src/app/demo/models/modelsproyecto/etapaviewmodel";
import { ActividadPorEtapa, EtapaPorProyecto, Proyecto } from "src/app/demo/models/modelsproyecto/proyectoviewmodel";
import { NavigationStateService } from "src/app/demo/services/navigationstate.service";
import { EmpleadoService } from "src/app/demo/services/servicesgeneral/empleado.service";
import { unidadMedidaService } from "src/app/demo/services/servicesgeneral/unidadmedida.service";
import { ActividadService } from "src/app/demo/services/servicesproyecto/actividad.service";
import { ActividadPorEtapaService } from "src/app/demo/services/servicesproyecto/actividadporetapa.service";
import { EtapaService } from "src/app/demo/services/servicesproyecto/etapa.service";
import { EtapaPorProyectoService } from "src/app/demo/services/servicesproyecto/etapaporproyecto.service";
import _ from 'lodash';
import { SharedService } from "src/app/demo/services/shared.service";
import { InsumoPorActividad } from "src/app/demo/models/modelsproyecto/insumoporactividadviewmodel";
import { RentaMaquinariaPorActividad } from "src/app/demo/models/modelsproyecto/rentamaquinariaporactividadviewmodel";
import { EquipoSeguridadPorActividad } from "src/app/demo/models/modelsproyecto/equiposeguridadporactividadviewmodel";
import { Checkbox } from "primeng/checkbox";
import { PickListMoveToTargetEvent } from "primeng/picklist";
import { CookieService } from "ngx-cookie-service";
import { log } from "mathjs";
import { TabMenu } from "primeng/tabmenu";

@Component({
    templateUrl: './proyectochild-etapas.component.html',
    styleUrl: './proyectochild-etapas.component.scss',
})
export class ProyectoChildEtapasComponent{
    @ViewChild('guardarButton') guardarButton!: ElementRef<HTMLButtonElement>;
    @ViewChild("selectAllCheckBox") selectAllCheckBox: Checkbox;
    // Propiedades
    /** Estado de carga de la tabla */
    isTableEtapaLoading: boolean = false;

    isTableActividadLoading: boolean = false;

    /** Mensaje a mostrar cuando no hay proyectos cargados */
    loadedTableEtapaMessage: string = "No existen actividades para esta etapa aún.";

    loadedTableActividadMessage: string = "No existen actividades para esta etapa aún.";

    submittedEtapaPorProyecto: boolean = false;

    submittedActividadesPorEtapa: boolean[] = [];

    title: string = "";

    etapaSeleccionada: string = "";

    detalleActividadPorEtapa: boolean = false;

    detalleEtapaPorProyecto: boolean = false;

    dialogEtapaPorProyecto: boolean = false;

    dialogActividadPorEtapa: boolean = false;

    editarEtapaPorProyectoDialog: boolean = false;

    dialogTable: boolean = false;

    dialogCostosActividad: boolean = false;

    dialogConfirmacionCostoActividad: boolean = false;

    dialogConfirmacionConfrimacion: boolean = false;

    formActividad: boolean = false;

    proyecto: Proyecto = {};

    etapas: Etapa[] = [];

    etapa: Etapa = {};

    filteredEtapas: any[] = [];

    etapasPorProyecto: EtapaPorProyecto[] = [];

    etapaPorProyecto: EtapaPorProyecto = {};

    selectedEtapaPorProyecto: EtapaPorProyecto[] = [];

    actividades: Actividad[] = [];

    actividad: Actividad = {};

    filteredActividades: Actividad[] = [];

    actividadesPorEtapas: ActividadPorEtapa[] = [];

    actividadesPorEtapasModel: any[] = [];
    
    actividadPorEtapa: ActividadPorEtapa = {};

    selectedActividadPorEtapa: ActividadPorEtapa[] = [];

    unidadesMedida: UnidadMedida[] = [];

    unidadMedida: UnidadMedida = {};

    filteredUnidadesMedida: any[] = [];

    empleados: Empleado[] = [];

    filteredEmpleados: Empleado[] = [];

    insumosPorActividad: InsumoPorActividad[] = [];

    insumosPorActividadModel: InsumoPorActividad[] = [];

    insumosPorProveedores: InsumoPorActividad[] = [];

    insumosPorProveedoresGrouped: InsumoPorActividad[] = [];

    compraList: any[] = [];

    compraGrouped: any[] = [];

    fleteList: any[] = [];

    fleteGrouped: any[] = []

    checkedInsumosPorActividad: InsumoPorActividad[] = [];

    rentaMaquinariasPorActividad: RentaMaquinariaPorActividad[] = [];

    maquinariasPorProveedores: RentaMaquinariaPorActividad[] = [];

    equiposSeguridadPorActividad: EquipoSeguridadPorActividad[] = [];

    equiposSeguridadPorProveedores: EquipoSeguridadPorActividad[] = [];

    equiposSeguridadPorProveedoresGrouped: EquipoSeguridadPorActividad[] = [];

    selectedTab1: boolean = false;
    selectedTab2: boolean = false;

    private actionEtapaPorProyectoItemsCache = new Map();

    table: Table | null;

    rowIndex: number | null;

    usua_Id: string = "";
    isOptionUnidadMedidaNotFound: boolean;
    isOptionEmpleadoActividadNotFound: boolean;
    isOptionEmpleadoEtapaNotFound: boolean;
    isOptionActividadNotFound: boolean;
    isOptionEtapaNotFound: boolean;

    // Constructor
    constructor(
        private etapaService: EtapaService,
        private etapaPorProyectoService: EtapaPorProyectoService,
        private actividadService: ActividadService,
        private actividadPorEtapaService: ActividadPorEtapaService,
        private unidadMedidadService: unidadMedidaService,
        private empleadoService: EmpleadoService,
        private sharedService: SharedService,
        private navigationStateService: NavigationStateService,

        private messageService: MessageService,
        private router: Router,
        private cookieService: CookieService,
        private cdr: ChangeDetectorRef,
    ){}

    // Primera Carga
    async ngOnInit(){
        this.isTableEtapaLoading = true;
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
        // Inicia el spinner de carga de la tabla

        const navigationState = this.navigationStateService.getState();
        
        this.etapaSeleccionada = ""; 

        if (navigationState && navigationState.proyecto) {            
            this.proyecto = navigationState.proyecto;
            
            await this.etapaService.Listar2()
            .then((data) => { this.etapas = data});

            this.actividadService.Listar()
                .subscribe((data) => { this.actividades = data; });

            this.empleadoService.getData()
                .subscribe((data) => { this.empleados = data; });

            this.unidadMedidadService.Listar()
                .subscribe((data) => { this.unidadesMedida = data; });
            
            if(!this.etapaPorProyecto?.etpr_Id){
                this.title = "Nueva Etapa";

                this.etapaPorProyecto = {usua_Creacion: parseInt(this.usua_Id), proy_Id: this.proyecto.proy_Id, etpr_Estado: true};
            }

            await this.etapaPorProyectoService.Listar(this.proyecto.proy_Id)
                .then((data) => {
                    this.etapasPorProyecto = data;

                    if(this.etapasPorProyecto.length === 0){
                        this.loadedTableEtapaMessage = "No existen etapas para este proyecto aún.";
                    }
                })
                .catch((error) => {
                    this.loadedTableEtapaMessage = error.message;
                })
                .finally(() => {
                    this.isTableEtapaLoading = false;

                    if(navigationState && (navigationState.fleteGrouped || navigationState.compraGrouped)){
                        this.etapaPorProyecto = navigationState.fleteGrouped[0].etapaPorProyecto;
                        this.actividadPorEtapa = navigationState.fleteGrouped[0].actividadPorEtapa;
            
                        this.openActividadCostos(this.actividadPorEtapa, 0);
            
                        this.compraGrouped = navigationState.compraGrouped;
                        this.fleteGrouped = navigationState.fleteGrouped;
            
                        this.dialogConfirmacionCostoActividad = true;
                    }
                });
        }else{
            this.router.navigate(['./sigesproc/proyecto/proyecto']);
        }            
    }

    //Accion Editar Etapa Por Proyecto
    editarEtapaPorProyecto(etapaPorProyecto: EtapaPorProyecto){
        this.etapaPorProyecto = {... etapaPorProyecto, usua_Modificacion: parseInt(this.usua_Id), proy_Id: this.proyecto.proy_Id};
        this.setDateProperties(this.etapaPorProyecto);
        this.etapaSeleccionada = `${this.etapaPorProyecto.etap_Descripcion}`;
        this.title = `Editar Etapa`;
    }

    //Accion Detalle Etapa Por Proyecto
    async abrirDetalleEtapaPorProyecto(etapaPorProyecto: EtapaPorProyecto){
        this.etapaPorProyecto = {... etapaPorProyecto};
        await this.etapaPorProyectoService.Buscar(this.etapaPorProyecto.etpr_Id)
            .then((data) => this.selectedEtapaPorProyecto.push(data));
            
        this.title = `Etapa`;
        this.detalleEtapaPorProyecto = true;
    }

    //Accion Eliminar Etapa Por Proyecto
    eliminarEtapaPorProyecto(etapaPorProyecto: EtapaPorProyecto){
        this.etapaPorProyecto = {... etapaPorProyecto};
        this.dialogEtapaPorProyecto = true;
    }

    async confirmarEliminarEtapaPorProyecto() {
        this.dialogEtapaPorProyecto = false;

        try {
            let response = await this.etapaPorProyectoService.Eliminar(this.etapaPorProyecto.etpr_Id);

            this.messageService.add({
                severity: response.code == 200 ? 'success' : 'warn',
                summary: response.code == 200 ? 'Éxito' : 'Advertencia',
                styleClass: 'iziToast-custom',
                detail: response.data?.messageStatus || response.message,
                life: 3000
            });

            if (response.code == 200) {
                this.etapaPorProyecto = {usua_Creacion: parseInt(this.usua_Id)};
                this.ngOnInit();
            }

        } catch (error) {
                // this.messageService.add({
                //     severity: 'error',
                //     summary: 'Error',
                //     detail: error.message || error,
                //     life: 3000
                // });
        }
    }

    // Boton Regresar en Detalle Etapa Por Proyecto
    cerrarDetalleEtapaPorProyecto(){
        this.title = "";
        this.detalleEtapaPorProyecto = false;

        this.selectedEtapaPorProyecto = [];
    }

    // Boton Cerrar en formulario
    cancelarEtapaPorProyecto() {        
        this.title = "Nueva Etapa";
        this.etapaSeleccionada = "";
        this.etapaPorProyecto = {usua_Creacion: parseInt(this.usua_Id), proy_Id: this.proyecto.proy_Id};
        this.formActividad = false;
        this.submittedEtapaPorProyecto = false;
    }

    // Boton Guardar Formulario
    async guardarEtapaPorProyecto() {
        this.submittedEtapaPorProyecto = true;
        
        if (this.etapaPorProyecto.etap_Descripcion?.trim() && this.etapaPorProyecto.empl_NombreCompleto?.trim()) {
            try {
                let response;

                const foundEtapa = this.etapas.find(etapa => etapa.etap_Descripcion === this.etapaPorProyecto.etap_Descripcion);

                if (foundEtapa) {
                    this.etapaPorProyecto.etap_Id = foundEtapa.etap_Id;
                } else {
                    this.etapa = { etap_Descripcion: this.etapaPorProyecto.etap_Descripcion, usua_Creacion: parseInt(this.usua_Id) };
                    
                    await this.etapaService.Insertar2(this.etapa)
                        .then((response) => {
                            if (response && response.data && response.data.codeStatus) {
                                this.etapaPorProyecto.etap_Id = response.data.codeStatus;                                                              
                            }                            
                        });
                }

                const foundEmpleado = this.empleados.find(empleado => empleado.empleado === this.etapaPorProyecto.empl_NombreCompleto);

                if (foundEmpleado) {
                    this.etapaPorProyecto.empl_Id = foundEmpleado.empl_Id;
                }
                                
                if (this.etapaPorProyecto.etpr_Id) {
                    if(this.editarEtapaPorProyectoDialog){
                        this.editarEtapaPorProyectoDialog = false;

                        response = await this.etapaPorProyectoService.Actualizar(this.etapaPorProyecto);

                        this.messageService.add({
                            severity: response?.code == 200 ? 'success' : 'warn',
                            summary: response?.code == 200 ? 'Éxito' : 'Advertencia',
                            styleClass: 'iziToast-custom',
                            detail: response?.data?.messageStatus || response?.message,
                            life: 3000
                        });
                    }else{
                        this.editarEtapaPorProyectoDialog = true;
                    }
                } else {
                    response = await this.etapaPorProyectoService.Insertar(this.etapaPorProyecto);

                    this.messageService.add({
                        severity: response?.code == 200 ? 'success' : 'warn',
                        summary: response?.code == 200 ? 'Éxito' : 'Advertencia',
                        styleClass: 'iziToast-custom',
                        detail: response?.data?.messageStatus || response?.message,
                        life: 3000
                    });

                    this.etapaPorProyecto = {...this.etapaPorProyecto, proy_FechaInicio: this.proyecto.proy_FechaInicio, usua_Creacion: parseInt(this.usua_Id), etpr_Id: response.data.codeStatus};

                    response = await this.actividadPorEtapaService.Replicar(this.etapaPorProyecto);

                    this.messageService.add({
                        severity: response?.code == 200 ? 'success' : 'warn',
                        summary: response?.code == 200 ? 'Éxito' : 'Advertencia',
                        styleClass: 'iziToast-custom',
                        detail: response?.data?.messageStatus || response?.message,
                        life: 3000
                    });
                }

                if (response?.code == 200) {
                    this.etapaPorProyecto = {usua_Creacion: parseInt(this.usua_Id)};
                    this.submittedEtapaPorProyecto = false;
                    this.ngOnInit();
                }

            } catch (error) {
                // this.messageService.add({
                //     severity: 'error',
                //     summary: 'Error',
                //     detail: error.message || error,
                //     life: 3000
                // });
            }
        }
    }

    addRow(table: Table, rowIndex?: number) {
        this.actividadPorEtapa = {usua_Creacion: parseInt(this.usua_Id), etpr_Id: this.etapaPorProyecto.etpr_Id, acet_Estado: true};
        
        if(rowIndex !== undefined){
            this.actividadesPorEtapas.splice(rowIndex + 1, 0, this.actividadPorEtapa);

        }else{
            this.actividadesPorEtapas.unshift(this.actividadPorEtapa);
        }
        
        this.actividadesPorEtapas.forEach((item, index) => {
            item.row = index + 1;
        });

        table.reset();

        // Calculate the new page index after adding a row
        const rowsPerPage = table.rows;  // Number of rows per page
        const newRowIndex = rowIndex !== undefined ? rowIndex + 1 : 0;

        const newPageIndex = Math.floor(newRowIndex / rowsPerPage);

        // Set the table to the correct page
        table.first = newPageIndex * rowsPerPage;
    }

    buttonLimpiar(){
        this.etapaPorProyecto = {usua_Creacion: parseInt(this.usua_Id), proy_Id: this.proyecto.proy_Id};
        this.etapaSeleccionada = null;
        this.submittedEtapaPorProyecto = false;
    }

    //Accion Eliminar Etapa Por Proyecto
    async eliminarActividadPorEtapa(rowIndex: number, table: Table){
        if(!this.actividadesPorEtapas[rowIndex].acet_Id){
            this.actividadesPorEtapas.splice(rowIndex, 1);

            this.actividadesPorEtapas.forEach((item, index) => {
                item.row = index + 1;
            });

            table.reset();

            const rowsPerPage = table.rows;  
            const deletedRowIndex = rowIndex !== undefined ? rowIndex : 0;

            const newPageIndex = Math.floor(deletedRowIndex / rowsPerPage);

            table.first = newPageIndex * rowsPerPage;
        }else{
            this.actividadPorEtapa = {... this.actividadesPorEtapas[rowIndex]};
            this.table = table;
            this.rowIndex = rowIndex;
            this.dialogActividadPorEtapa = true;
        }
        
    }

    async confirmarEliminarActividadPorEtapa() {
        this.dialogActividadPorEtapa = false;

        try {
            let response = await this.actividadPorEtapaService.Eliminar(this.actividadPorEtapa.acet_Id);

            this.messageService.add({
                severity: response.code == 200 ? 'success' : 'warn',
                summary: response.code == 200 ? 'Éxito' : 'Advertencia',
                styleClass: 'iziToast-custom',
                detail: response.data?.messageStatus || response.message,
                life: 3000
            });

            if (response.code == 200) {
                this.actividadPorEtapa = {usua_Creacion: parseInt(this.usua_Id)};

                this.actividadesPorEtapas.splice(this.rowIndex, 1);

                this.actividadesPorEtapas.forEach((item, index) => {
                    item.row = index + 1;
                });
    
                this.table.reset();
    
                const rowsPerPage = this.table.rows;  
                const deletedRowIndex = this.rowIndex !== undefined ? this.rowIndex : 0;
    
                const newPageIndex = Math.floor(deletedRowIndex / rowsPerPage);
    
                this.table.first = newPageIndex * rowsPerPage;
                
                this.ngOnInit()
            }

            this.table = null;
            this.rowIndex = null;

        } catch (error) {
                // this.messageService.add({
                //     severity: 'error',
                //     summary: 'Error',
                //     detail: error.message || error,
                //     life: 3000
                // });
        }
    }

    // Boton Guardar Formulario
    async guardarActividadPorEtapa(rowIndex: number, table: Table) {
        this.isTableActividadLoading = true;
        this.submittedActividadesPorEtapa[rowIndex] = true;
        this.actividadPorEtapa = {... this.actividadesPorEtapas[rowIndex]};

        console.log(this.actividadPorEtapa);
        console.log(this.actividadPorEtapa.acti_Descripcion?.trim());
        
        

        if (this.actividadPorEtapa.acti_Descripcion?.trim() !== undefined || this.actividadPorEtapa.acti_Descripcion?.trim() !== '') {
            try {
                let response;

                const foundActividad = this.actividades.find(actividad => actividad.acti_Descripcion === this.actividadPorEtapa.acti_Descripcion);

                if (foundActividad) {
                    this.actividadPorEtapa.acti_Id = foundActividad.acti_Id;
                } else {
                    this.actividad = { acti_Descripcion: this.actividadPorEtapa.acti_Descripcion, usua_Creacion: parseInt(this.usua_Id) };
                    
                    await this.actividadService.Insertar2(this.actividad)
                        .then((response) => {
                            if (response && response.data && response.data.codeStatus) {
                                this.actividadPorEtapa.acti_Id = response.data.codeStatus;                                                              
                            }                            
                        });
                }
               
                this.actividadPorEtapa.unme_Id = this.unidadesMedida.find(unidadMedida => unidadMedida.unme_Nombre === this.actividadPorEtapa.unme_Nombre).unme_Id;

                const foundEmpleado = this.empleados.find(empleado => empleado.empl_NombreCompleto === this.actividadPorEtapa.empl_NombreCompleto)
                    || this.empleados.find(empleado => empleado.empl_DNI === this.actividadPorEtapa.empl_NombreCompleto);

                if (foundEmpleado) {
                    this.actividadPorEtapa.empl_Id = foundEmpleado.empl_Id;
                }
                
                if (this.actividadPorEtapa?.acet_Id) {
                    response = await this.actividadPorEtapaService.Actualizar(this.actividadPorEtapa);
                } else {
                    response = await this.actividadPorEtapaService.Insertar(this.actividadPorEtapa);
                }

                this.messageService.add({
                    severity: response.code == 200 ? 'success' : 'warn',
                    summary: response.code == 200 ? 'Éxito' : 'Advertencia',
                    styleClass: 'iziToast-custom',
                    detail: response.data?.messageStatus || response.message,
                    life: 3000
                });

                if (response.code == 200) { 
                    this.submittedActividadesPorEtapa[rowIndex] = false;

                    this.actividadesPorEtapas[rowIndex].acet_Id = response.data?.codeStatus;

                    this.actividadesPorEtapasModel.push(_.cloneDeep(this.actividadesPorEtapas[rowIndex]));

                    const newItem = this.actividadesPorEtapas[rowIndex];
                    let insertIndex = this.actividadesPorEtapas.length;
                    
                    
                    for (let i = 0; i < this.actividadesPorEtapas.length; i++) {
                        const item = this.actividadesPorEtapas[i];
                        
                        if(i < rowIndex && (item.acet_FechaInicio && new Date(newItem.acet_FechaInicio.getTime() + 6 * 60 * 60 * 1000) <= item.acet_FechaInicio)){

                            insertIndex = i;
                        
                            this.actividadesPorEtapas.splice(rowIndex, 1);

                            this.actividadesPorEtapas.splice(newItem.acet_FechaInicio < item.acet_FechaInicio ? 
                                insertIndex : insertIndex + 1, 0, newItem);

                            this.actividadesPorEtapas.forEach((item, index) => {
                                item.row = index + 1;
                            });

                            const rowsPerPage = table.rows;  

                            const newPageIndex = Math.floor(insertIndex / rowsPerPage);

                            table.first = newPageIndex * rowsPerPage;

                            break;      
                        }else if(i > rowIndex && (item.acet_FechaInicio && new Date(newItem.acet_FechaInicio.getTime() + 6 * 60 * 60 * 1000) >= item.acet_FechaInicio)){

                            insertIndex = i;
                            
                            this.actividadesPorEtapas.splice(rowIndex, 1);

                            this.actividadesPorEtapas.splice(insertIndex + 1, 0, newItem);

                            this.actividadesPorEtapas.forEach((item, index) => {
                                item.row = index + 1;
                            });

                            rowIndex = insertIndex + 1;

                            const rowsPerPage = table.rows;  

                            const newPageIndex = Math.floor(insertIndex / rowsPerPage);

                            table.first = newPageIndex * rowsPerPage;
                        }
                    }

                    this.ngOnInit()
                    // table.reset();
                    // this.openDialogTable(this.etapaPorProyecto);
                }

            } catch (error) {
                // this.messageService.add({
                //     severity: 'error',
                //     summary: 'Error',
                //     detail: error.message || error,
                //     life: 3000
                // });
            }

            this.isTableActividadLoading = false;
        }
    }

    compareModels(rowIndex: number): boolean{
        const currentItem = _.cloneDeep(this.actividadesPorEtapas[rowIndex]);
        let originalItem;
        if(currentItem.acet_Id){
            originalItem = this.actividadesPorEtapasModel.find(item => item.acet_Id === currentItem?.acet_Id);
        }
        if (!originalItem) {
            return true;
        }
        
       // Create a shallow copy of the originalItem to avoid mutating the original array
       originalItem = _.cloneDeep(originalItem);

        // Remove the 'row' property from both objects before comparison
        delete currentItem.row;
        delete originalItem.row;
        
        return !_.isEqual(originalItem, currentItem);
    }

    async openDialogTable(etapaPorProyecto: EtapaPorProyecto){        
        this.isTableActividadLoading = true;
        
        this.etapaPorProyecto = {...etapaPorProyecto};

        await this.actividadPorEtapaService.Listar( this.etapaPorProyecto.etpr_Id)
            .then((data) => {                
                this.actividadesPorEtapas = data;

                this.actividadesPorEtapas.forEach(element => {
                    this.setDateProperties(element);

                    element.usua_Modificacion = 3;

                    this.submittedActividadesPorEtapa.push(false);
                });
            
                this.actividadesPorEtapasModel = _.cloneDeep(this.actividadesPorEtapas);

                if(this.actividadesPorEtapas.length === 0){
                    this.loadedTableActividadMessage = "No existen actividades para esta etapa aún."
                }
            })
            .catch((error) => {
                this.loadedTableActividadMessage = error.message;
            })
            .finally(() => {
                this.isTableActividadLoading = false;
                this.dialogTable = true;
            });            
    }

    async openActividadCostos(actividadPorEtapa: ActividadPorEtapa, tab: number){
        this.dialogTable = false;

        this.isTableActividadLoading = true;

        this.actividadPorEtapa = {... actividadPorEtapa};  
        
        await this.actividadPorEtapaService.ListarInsumos(this.actividadPorEtapa.acet_Id)
            .then(async (data) => {
                
                this.insumosPorProveedores = data;

                this.insumosPorProveedoresGrouped = this.groupByInpp(this.insumosPorProveedores).sort((a, b) => a.insu_Descripcion.localeCompare(b.insu_Descripcion));

                this.cdr.markForCheck();

                await this.actividadPorEtapaService.ListarInsumosPorActividad(this.actividadPorEtapa.acet_Id)
                    .then(async (data) => {
                        this.insumosPorActividad = data;

                        this.insumosPorActividadModel = _.cloneDeep(this.insumosPorActividad);
                    });

                await this.actividadPorEtapaService.ListarMaquinarias(this.actividadPorEtapa.acet_Id)
                    .then(async (data) => {
                        this.maquinariasPorProveedores = data;

                        await this.actividadPorEtapaService.ListarRentaMaquinariasPorActividad(this.actividadPorEtapa.acet_Id)
                            .then((data) => {
                                this.rentaMaquinariasPorActividad = data;
                            })
                    });
                
                await this.actividadPorEtapaService.ListarEquiposSeguridad()
                    .then(async (data) => {
                        this.equiposSeguridadPorProveedores = data;

                        this.equiposSeguridadPorProveedoresGrouped = this.equiposSeguridadPorProveedores;

                        await this.actividadPorEtapaService.ListarEquiposSeguridadPorActividad(this.actividadPorEtapa.acet_Id)
                            .then((data) => {
                                this.equiposSeguridadPorActividad = data;
                            })
                    });
            })
            .finally(async () => {
                switch (tab) {
                    case 1: 
                        this.selectedTab1 = true;
                        this.selectedTab2 = false;
                        break;
                    case 2: 
                        this.selectedTab2 = true;
                        this.selectedTab1 = false;
                        break;
                    default:
                        this.selectedTab1 = false;
                        this.selectedTab2 = false;
                        break;
                }

                this.dialogCostosActividad = true;

                this.isTableActividadLoading = false;
            });
    }

    groupByInpp(data: InsumoPorActividad[]): InsumoPorActividad[] {
        const grouped = data.reduce((acc, item) => {
            const key = item.inpp_Id;

            if (!acc[key]) {
              acc[key] = {
                inpp_Id: item.inpp_Id,
                insu_Descripcion: item.insu_Descripcion,
                unme_Nombre: item.unme_Nombre,
                unme_Nomenclatura: item.unme_Nomenclatura,
                inpp_Preciocompra: item.inpp_Preciocompra,
                mate_Descripcion: item.mate_Descripcion,
                prov_Id: item.prov_Id,
                prov_Descripcion: item.prov_Descripcion,
                suca_Descripcion: item.suca_Descripcion,
                cate_Descripcion: item.cate_Descripcion,
                inpp_Observacion: item.inpp_Observacion,
                inpa_Recomendado: item.inpa_Recomendado,
                inpa_stock: 0,
                bopi_Stock: 0
              };
            }
        
            // Accumulate stock quantities
            acc[key].bopi_Stock += item.bopi_Stock;
        
            return acc;
        }, {} as { [key: number]: InsumoPorActividad });
        
        return Object.values(grouped);
    }

    guardarSuministro(){
        this.isTableEtapaLoading = true;

        if (this.selectedTab1) {
            this.rentaMaquinariasPorActividad.forEach(item => {
                if (item.rmac_Estado === false || !item.rmac_PrecioRenta || item.rmac_Recomendado ) {
                    this.compraList.push({
                        ...item,
                        tipoSuministro: 'M',
                    });
                }
            });

        }else if(this.selectedTab2){
            this.equiposSeguridadPorActividad.forEach(item => {
                this.compraList.push({
                    ...item,
                    tipoSuministro: 'E',
                });
                // if (!item.eqac_Costo) {
                //     if (item.eqac_Cantidad > item.eqbo_Stock) {
                //         this.compraList.push({
                //             ...item,
                //             tipoSuministro: 'E',
                //         });
                //     }else{
                //         this.fleteList.push({
                //             ...item,
                //             tipoSuministro: 'E',
                //         });
                //     }
                // }
            });

        }else{
            this.insumosPorActividad.forEach(item => {
                if (item.inpa_Estado === false || !item.inpa_PrecioCompra || item.inpa_Recomendado ) {
                    this.compraList.push({
                        ...item,
                        tipoSuministro: 'I',
                    });
                }
                // if (item.inpa_Estado === false || !item.inpa_PrecioCompra || item.inpa_Recomendado ) {
                    
                //     if (item.inpa_stock > item.bopi_Stock) {
                //         this.compraList.push({
                //             ...item,
                //             tipoSuministro: 'I',
                //         });
                //     }else{
                //         this.fleteList.push({
                //             ...item,
                //             tipoSuministro: 'I',
                //         })
                //     }
                // }
            });
            
        }

        

        const compraGroupedByProveedor = this.compraList.reduce((acc, item) => {
            const proveedorId = item.prov_Id; 
            if (!acc[proveedorId]) {
                acc[proveedorId] = [];
            }
            acc[proveedorId].push(item);
            return acc;
        }, {});

        this.compraGrouped = [];

        for (const proveedorId in compraGroupedByProveedor) {
            this.compraGrouped.push({
                prov_Id: proveedorId,
                prov_Descripcion: compraGroupedByProveedor[proveedorId][0].prov_Descripcion, 
                actividadPorEtapa: this.actividadPorEtapa,
                etapaPorProyecto: this.etapaPorProyecto,
                proyecto: this.proyecto,
                done: false,
                detalle: compraGroupedByProveedor[proveedorId] 
            });
        }

        // const fleteGroupedByBodega = this.fleteList.reduce((acc, item) => {
        //     const bodegaId = item.bode_Id; 
        //     if (!acc[bodegaId]) {
        //         acc[bodegaId] = [];
        //     }
        //     acc[bodegaId].push(item);
        //     return acc;
        // }, {});

        // for (const bodegaId in fleteGroupedByBodega) {
        //     this.fleteGrouped.push({
        //         bode_Id: bodegaId,
        //         bode_Descripcion: fleteGroupedByBodega[bodegaId][0].bode_Descripcion,

        //         fleteType: fleteGroupedByBodega[bodegaId][0].fleteType,
        //         actividadPorEtapa: this.actividadPorEtapa,
        //         etapaPorProyecto: this.etapaPorProyecto,
        //         proyecto: this.proyecto,
        //         done: false,
        //         detalle: fleteGroupedByBodega[bodegaId] 
        //     });
        // }

        this.navigationStateService.setState('compraGrouped', this.compraGrouped);
        // this.navigationStateService.setState('fleteGrouped', this.fleteGrouped);
        this.isTableEtapaLoading = false;
        this.dialogConfirmacionCostoActividad = true;
    }

    generarCompra(compra: any){
        this.navigationStateService.setState('compra', compra);

        this.router.navigate(['./sigesproc/insumo/compra']);
    }

    generarFlete(flete: any){
        this.navigationStateService.setState('flete', flete);

        this.router.navigate(['./sigesproc/Fletes/Fletes']);
    }

    // onHeaderCheckboxToggle() {
    //     const enabledRows = this.getEnabledRows();

    //     const isChecked = this.selectAllCheckBox.checked();        

    //     if (!isChecked) {
    //         this.checkedInsumosPorActividad = this.checkedInsumosPorActividad.filter(row =>
    //             !enabledRows.includes(row)
    //         );
    //     } else {
    //         this.checkedInsumosPorActividad = [
    //             ...this.checkedInsumosPorActividad.filter(row => row.inpa_Estado),
    //             ...enabledRows
    //         ];
    //     }
    // }
    
    // getEnabledRows() {
    //     return this.insumosPorActividad.filter(insumo => !insumo.inpa_Estado);
    // }
    onMoveToTarget(event: any){
        event.items.forEach(item => {
            // Get the corresponding stock in insumosPorProveedoresGrouped
            // const availableBodegas = this.insumosPorProveedores.filter(prov => prov.inpp_Id === item.inpp_Id);
            // let remainingStock = item.inpa_stock;

            // if ((item.inpa_Estado === false || item.inpa_Recomendado) || (availableBodegas.length && remainingStock > availableBodegas.reduce((acc, curr) => acc + curr.bopi_Stock, 0))) {
                this.compraList.push({
                    ...item,
                    compraType: 'Compra' // Additional details if needed
                });
            // }
            // else{
                // availableBodegas.forEach(bodega => {
                //     if (remainingStock <= 0) return; // If required stock is fulfilled, stop
    
                //     // Check if current bodega can fulfill the remaining stock
                //     let stockToTake = Math.min(bodega.bopi_Stock, remainingStock);

                //     this.fleteList.push({
                //         ...item,
                //         bode_Id: bodega.bode_Id,
                //         bode_Descripcion: bodega.bode_Descripcion,
                //         fleteType: 1,
                //         cantidad: stockToTake
                //     });
    
                //     remainingStock -= stockToTake; // Decrease remaining stock to be fulfilled
                // });
    
                // // If there's still remaining stock after all bodegas are checked, push it to compra
                // if (remainingStock > 0) {
                //     this.compraList.push({
                //         ...item,
                //         compraType: 'Compra (partial)', // Indicating partial fulfillment by bodegas, rest to be purchased
                //         remainingToCompra: remainingStock
                //     });
                // }
            // }
        });
    }

    onMoveToSource(event: any){
        // Case 3: If moving a supply from 'En Actividad' to another bodega, put in flete (without bodega)
        this.insumosPorActividadModel.forEach(item => {
            if (item.inpa_Estado && !this.insumosPorActividadModel.includes(item)) {
                this.fleteList.push({
                    ...item,
                    bodega: null, // No specific bodega since it's being moved
                    fleteType: 3
                });
            }
        });
    }

    cerrarDialogActividadCostos(){        
        this.dialogCostosActividad = false;
        this.dialogTable = true;
    }

    setDefaultDate(rowIndex: number): Date{
        for (let i = rowIndex; i >= 0; i--) {
            if (this.actividadesPorEtapas[i]?.acet_FechaInicio) {
                return this.actividadesPorEtapas[i].acet_FechaInicio;
            }
        }

        return this.proyecto.proy_FechaInicio;
    }
 
    // AutoComplete Etapas
    filterEtapas(event: any) {
        const filtered: any[] = [];
        const query = event.query;
        for (let i = 0; i < this.etapas.length; i++) {
            const etapa = this.etapas[i];
            if (etapa.etap_Descripcion.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(etapa.etap_Descripcion);
            }
        } 
        
        this.filteredEtapas = filtered.sort((a, b) => a.localeCompare(b));
    }

    onSelectEtapa(){
        const foundoption = this.etapas.some(x => x.etap_Descripcion === this.etapaPorProyecto.etap_Descripcion);
        this.isOptionEtapaNotFound = !foundoption;
    }

    // AutoComplete Actividades
    filterActividades(event: any) {
        const filtered: any[] = [];
        const query = event.query;
        for (let i = 0; i < this.actividades.length; i++) {
            const actividad = this.actividades[i];
            if (actividad.acti_Descripcion.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(actividad.acti_Descripcion);
            }
        }

        this.filteredActividades = filtered.sort((a, b) => a.localeCompare(b));
    }

    onSelectActividad(){
        const foundoption = this.actividades.some(x => x.acti_Descripcion === this.actividadPorEtapa.acti_Descripcion);
        this.isOptionActividadNotFound = !foundoption;
    }

    // AutoComplete Empleados
    filterEmpleados(event: any) {
        const filtered: any[] = [];
        const query = event.query;
        
        for (let i = 0; i < this.empleados.filter((e) => e.carg_Id === 1).length; i++) {
            const empleado = this.empleados.filter((e) => e.carg_Id === 1)[i];
            if (empleado.empleado.toLowerCase().indexOf(query.toLowerCase()) == 0 ) {
                filtered.push(empleado.empleado);
            }
        }
        
        
        
        this.filteredEmpleados = filtered.sort((a, b) => a.localeCompare(b));
    }

    onSelectEmpleado(){
        const foundoption = this.empleados.some(x => x.empleado === this.actividadPorEtapa.empl_NombreCompleto);
        this.isOptionEmpleadoActividadNotFound = !foundoption;

        const foundoption2 = this.empleados.some(x => x.empleado === this.etapaPorProyecto.empl_NombreCompleto);
        this.isOptionEmpleadoEtapaNotFound = !foundoption2;
    }

    // AutoComplete Unidad Medida
    filterUnidadMedida(event: any) {
        const filtered: any[] = [];
        const query = event.query;
        for (let i = 0; i < this.unidadesMedida.length; i++) {
            const unidadMedidad = this.unidadesMedida[i];
            if (unidadMedidad.unme_Nombre.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(unidadMedidad.unme_Nombre);
            }
        }

        

        this.filteredUnidadesMedida = filtered.sort((a, b) => a.localeCompare(b));
    }

    generarEtapaPorProyectoActionSplitButton(etapaPorProyecto: EtapaPorProyecto){        
        if (!this.actionEtapaPorProyectoItemsCache.has(etapaPorProyecto)) {
            const items = [
                {label: 'Gestionar Actividades', icon: 'pi pi-list', command: () => this.openDialogTable(etapaPorProyecto)},
                { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.editarEtapaPorProyecto(etapaPorProyecto) },
                // { label: 'Detalle', icon: 'pi pi-eye', command: () => this.abrirDetalleEtapaPorProyecto(etapaPorProyecto) },
                { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.eliminarEtapaPorProyecto(etapaPorProyecto) },
            ];
            this.actionEtapaPorProyectoItemsCache.set(etapaPorProyecto, items);
        }
        return this.actionEtapaPorProyectoItemsCache.get(etapaPorProyecto);
    }
    //Setear Fechas
    setDateProperties(obj: any) {
        const isDateString = (value: any): boolean => {
          return typeof value === 'string' && !isNaN(Date.parse(value));
        };
      
        for (const key in obj) {
          if (obj.hasOwnProperty(key) && isDateString(obj[key])) {
            obj[key] = new Date(obj[key]);
          }
        }
    }

    // Onchange DDL Unidad Medida
    setearUnidades(rowIndex: number){
        this.actividadesPorEtapas[rowIndex].unme_Nomenclatura = this.unidadesMedida.find(unidadMedida => unidadMedida.unme_Nombre === this.actividadesPorEtapas[rowIndex].unme_Nombre).unme_Nomenclatura;
        
        const foundoption = this.unidadesMedida.some(x => x.unme_Nombre === this.actividadPorEtapa.unme_Nombre);
        this.isOptionUnidadMedidaNotFound = !foundoption;
    }

    // Filtro Search en Datatable
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