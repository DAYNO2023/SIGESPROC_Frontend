import { Component, ElementRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { Table } from "primeng/table";
import { Proyecto, Riesgo } from "src/app/demo/models/modelsproyecto/proyectoviewmodel";
import { NavigationStateService } from "src/app/demo/services/navigationstate.service";
import { RiesgoService } from "src/app/demo/services/servicesproyecto/riesgo.service";
import { SharedService } from "src/app/demo/services/shared.service";
import { CookieService } from "ngx-cookie-service";

/**
 * `ProyectoChildRiesgosComponent` gestiona la visualización e interacción de los riesgos asociados con un proyecto.
 * Proporciona funcionalidades para ver, editar, eliminar y filtrar riesgos dentro de un proyecto.
 */
@Component({
    templateUrl: './proyectochild-riesgos.component.html',
    styleUrl: './proyectochild-riesgos.component.scss',
})
export class ProyectoChildRiesgosComponent {
    @ViewChild('guardarButton') guardarButton!: ElementRef<HTMLButtonElement>;

    // Propiedades
    /** Estado de carga de la tabla */
    isTableLoading: boolean = false;

    /** Mensaje a mostrar cuando no hay proyectos cargados */
    loadedTableMessage: string = "";

    submitted: boolean = false;  // Indicador de si el formulario ha sido enviado
    deleteRiesgoDialog: boolean = false;  // Indicador para mostrar el diálogo de confirmación de eliminación
    detalleRiesgo: boolean = false;  // Indicador para mostrar la vista de detalles del riesgo
    editarRiesgoDialog: boolean = false;  // Indicador para mostrar la vista de del dialogo de confirmación de edición

    riesgos: Riesgo[] = [];  // Lista de riesgos asociados con el proyecto
    riesgo: Riesgo = {};  // Objeto de riesgo actual siendo editado o visualizado
    riesgoDescripcion: string = "";  // Descripción del riesgo a eliminar
    selectedRiesgo: Riesgo[] = [];  // Array de riesgos seleccionados para la vista de detalles
    proyecto: Proyecto = {};  // Objeto del proyecto actual

    private actionItemsCache = new Map();  // Caché para almacenar elementos de acción para los riesgos

    usua_Id: string = "";
    
    /**
     * Constructor para `ProyectoChildRiesgosComponent`.
     * @param riesgoService - Servicio para gestionar riesgos
     * @param navigationStateService - Servicio para gestionar el estado de navegación
     * @param sharedService - Servicio para vincular acciones del speed dial
     * @param messageService - Servicio para mostrar mensajes
     * @param router - Router para navegación
     */
    constructor(
        private riesgoService: RiesgoService,
        private navigationStateService: NavigationStateService,
        private sharedService: SharedService,
        private messageService: MessageService,
        private router: Router,
        private cookieService: CookieService,
    ){}

    /**
     * Inicializa el componente cargando el proyecto y sus riesgos asociados.
     * Obtiene los riesgos si hay un proyecto disponible en el estado de navegación.
     */
    async ngOnInit() {
        this.isTableLoading = true;
        if(this.cookieService.get("Token") == 'false'){
            this.router.navigate(['/auth/login']);
        }

        const navigationState = this.navigationStateService.getState();

        if (navigationState && navigationState.proyecto) {
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

            this.proyecto = navigationState.proyecto;
            this.riesgo = { usua_Creacion: parseInt(this.usua_Id), proy_Id: this.proyecto.proy_Id };

            await this.riesgoService.Listar(this.proyecto.proy_Id)
                .then((data) => {
                    this.riesgos = data;
                    // Muestra un mensaje si no hay proyectos
                    if (this.riesgos.length === 0) {
                        this.loadedTableMessage = "No existen riegos para este proyecto aún.";
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
     * Prepara un objeto de riesgo para su edición.
     * @param riesgo - El riesgo a editar
     *  @param riesgo - El riesgo a editar
     */
    editarRiesgo(riesgo: Riesgo) {
        this.riesgo = { ...riesgo, usua_Modificacion: parseInt(this.usua_Id), proy_Id: this.proyecto.proy_Id, geri_Probabilidad: riesgo.geri_Probabilidad };
    }

    /**
     * Muestra los detalles de un riesgo seleccionado.
     * @param riesgo - El riesgo a mostrar en detalle
     */
    verDetalle(riesgo: Riesgo) {
        this.riesgo = { ...riesgo, proy_Id: this.proyecto.proy_Id };
        this.selectedRiesgo.push(riesgo);
        this.detalleRiesgo = true;
    }

    /**
     * Prepara un objeto de riesgo para su eliminación y abre el diálogo de confirmación de eliminación.
     * @param riesgo - El riesgo a eliminar
     */
    eliminarRiesgo(riesgo: Riesgo) {
        this.deleteRiesgoDialog = true;
        this.riesgo = { geri_Id: riesgo.geri_Id };
        this.riesgoDescripcion = riesgo.geri_Descripcion;
    }

    /**
     * Confirma la eliminación de un riesgo.
     * Envía una solicitud para eliminar el riesgo y muestra un mensaje adecuado basado en la respuesta.
     */
    async confirmarEliminar() {
        this.deleteRiesgoDialog = false;
        try {
            let response = await this.riesgoService.Eliminar(this.riesgo.geri_Id);
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
                styleClass: 'iziToast-custom',
                detail,
                life: 3000
            });

            this.ngOnInit();
        } catch (error) {
            // this.messageService.add({
            //     severity: 'error',
            //     summary: 'Error Externo',
            //     detail: error.message || error,
            //     life: 3000
            // });
        }
    }

    /**
     * Cierra la vista de detalles del riesgo y reinicia el riesgo seleccionado.
     */
    cerrarDetalle() {
        this.detalleRiesgo = false;
        this.riesgo = { usua_Creacion: parseInt(this.usua_Id), proy_Id: this.proyecto.proy_Id };
        this.selectedRiesgo = [];
    }

    /**
     * Cancela la operación actual y reinicia el objeto de riesgo.
     */
    buttonLimpiar() {
        this.riesgo = { usua_Creacion: parseInt(this.usua_Id), proy_Id: this.proyecto.proy_Id };
        this.submitted = false;
    }

    /**
     * Guarda el objeto de riesgo actual, ya sea creando un nuevo riesgo o actualizando uno existente.
     * Muestra un mensaje de éxito o error basado en la respuesta.
     */
    async guardarRiesgo() {
        this.submitted = true;

        if (this.riesgo.geri_Descripcion?.trim()) {
            try {
                let response;

                if (this.riesgo.geri_Id) {
                    if(this.editarRiesgoDialog){
                        this.editarRiesgoDialog = false;
                        response = await this.riesgoService.Actualizar(this.riesgo);
                    }else{
                        this.editarRiesgoDialog = true;
                    }
                } else {
                    response = await this.riesgoService.Insertar(this.riesgo);
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
                // this.messageService.add({
                //     severity: 'error',
                //     summary: 'Error Externo',
                //     detail: error.message || error,
                //     life: 3000
                // });
            }
        }
    }

    /**
     * Genera elementos de acción para un riesgo dado, almacenándolos en caché para mejorar el rendimiento.
     * @param riesgo - El riesgo para el cual se generan los elementos de acción
     * @returns Un array de elementos de acción para el riesgo dado
     */
    generarActionSplitButton(riesgo: Riesgo) {
        if (!this.actionItemsCache.has(riesgo)) {
            const items = [
                { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.editarRiesgo(riesgo) },
                // { label: 'Detalle', icon: 'pi pi-eye', command: () => this.verDetalle(riesgo) },
                { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.eliminarRiesgo(riesgo) },
            ];
            this.actionItemsCache.set(riesgo, items);
        }
        return this.actionItemsCache.get(riesgo);
    }

    /**
     * Devuelve un array filtrado de propiedades del riesgo, excluyendo ciertos términos.
     * @returns Un array de pares clave-valor que representan las propiedades filtradas
     */
    getFilteredPropertyArray(): { key: string, value: Riesgo }[] {
        const excludedKeywords = ['Creacion', 'Modificacion', 'Estado', 'tb'];

        return Object.keys(this.riesgo)
            .filter(key => !excludedKeywords.some(keyword => key.includes(keyword)))
            .map(key => ({
                key: key.replace(/^(geri_|usua_)/, ''),
                value: this.riesgo[key]
            }));
    }

    /**
     * Filtra la búsqueda global en la tabla basada en el valor ingresado.
     * @param table - La tabla a filtrar
     * @param event - El evento de entrada del usuario
     */
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    /**
     * Resetea la tabla `Riesgo` después de realizar una acción de búsqueda o filtrado.
     * @param dt - La tabla de PrimeNG a resetear
     */
    resetTable(dt: Table) {
        dt.reset();
    }
}
