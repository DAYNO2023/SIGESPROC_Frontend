import { Component, Directive } from '@angular/core';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { Pantalla } from 'src/app/demo/models/modelsacceso/pantallaviewmodel';
import { PantallaService } from 'src/app/demo/services/servicesacceso/pantalla.service';

@Component({
  templateUrl: './pantalla.component.html',
  providers: [MessageService, ConfirmationService],
})

export class PantallaComponent {
    // Propiedades
    pantallaFormulario: boolean = false;

    indexPantalla: boolean = true;

    detallePantalla: boolean = false;

    deletePantallaDialog: boolean = false;

    pantallas: Pantalla[] = [];

    selectedPantalla: Pantalla[] = [];

    pantalla: Pantalla = {usua_Creacion: 3};

    submitted: boolean = false;

    cols: any[] = [];

    title: string = "";

    private actionItemsCache = new Map();

    // Constructor
    constructor(
      private pantallaService: PantallaService,
      private messageService: MessageService)
      {}

    //   Primera carga
    async ngOnInit() {
        this.title = "";

        await this.pantallaService.Listar()
          .then(data => this.pantallas = data);

        this.cols = [
            { field: 'descripcion', header: 'Pantalla' },
        ];

        this.indexPantalla = true;
    }

    // Return Acciones
    generarActionSplitButton(pantalla: Pantalla){
        if (!this.actionItemsCache.has(pantalla)) {
            const items = [
              { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.editarPantalla() },
              { label: 'Detalle', icon: 'pi pi-eye', command: () => this.abrirDetalle() },
              { label: pantalla.pant_Estado ? 'Desactivar' : 'Activar', icon: pantalla.pant_Estado ? 'pi pi-lock-open' : 'pi pi-lock', command: () => this.eliminarPantalla() },
            ];
            this.actionItemsCache.set(pantalla, items);
          }
          return this.actionItemsCache.get(pantalla);
    }


    selectPantalla(pantalla: Pantalla) {
        this.pantalla = { ...pantalla, usua_Modificacion: 3};
    }

    // Boton Nuevo
    abrirNuevo() {
        this.pantalla = {usua_Creacion: 3};
        this.submitted = false;
        this.title = "Nueva Pantalla"
        this.indexPantalla = false;
        this.pantallaFormulario = true;
    }

    // Accion editar
    editarPantalla() {
        this.title = "Editar Pantalla";
        this.indexPantalla = false;
        this.pantallaFormulario = true;
    }

    // Accion Detalle
    async abrirDetalle(){
        await this.pantallaService.Buscar(this.pantalla.pant_Id)
            .then((data) => this.selectedPantalla.push(data));

        this.title = "Detalle Pantalla";
        this.indexPantalla = false;
        this.detallePantalla = true;
    }

    // Accion Eliminar
    eliminarPantalla() {
        this.deletePantallaDialog = true;
    }

    // Confirmar Eliminar
    async confirmarEliminar() {
        this.deletePantallaDialog = false;
        try {
            let response = await this.pantallaService.Eliminar(this.pantalla.pant_Id);

            this.messageService.add({
                severity: response.code == 200 ? 'success' : 'warn',
                summary: response.code == 200 ? 'Éxito' : 'Advertencia',
                detail: response.data?.messageStatus || response.message,
                life: 3000
            });

            if (response.code == 200) {
                this.pantalla = {usua_Creacion: 3};
                this.ngOnInit();
            }

        } catch (error) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || error,
                    life: 3000
                });
        }
    }

    // Cerrar Detalle
    cerrarDetalle(){
        this.title = "";
        this.detallePantalla = false;
        this.indexPantalla = true;
        this.selectedPantalla = [];
    }

    // Cerrar Formulario
    cerrarFormulario() {
        this.title = "";
        this.pantallaFormulario = false;
        this.indexPantalla = true;
        this.submitted = false;
    }

    // Guardar Formulario
    async guardarPantalla() {
        this.submitted = true;

        if (this.pantalla.pant_Descripcion?.trim()) {
            try {
                let response;

                if (this.pantalla.pant_Id) {
                    response = await this.pantallaService.Actualizar(this.pantalla);
                } else {
                    response = await this.pantallaService.Insertar(this.pantalla);
                }

                this.messageService.add({
                    severity: response.code == 200 ? 'success' : 'warn',
                    summary: response.code == 200 ? 'Éxito' : 'Advertencia',
                    detail: response.data?.messageStatus || response.message,
                    life: 3000
                });

                if (response.code == 200) {
                    this.pantallaFormulario = false;
                    this.pantalla = {usua_Creacion: 3};
                    this.ngOnInit();
                }

            } catch (error) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || error,
                    life: 3000
                });
            }
        }
    }

    // Buscar (no utilizado)
    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.pantallas.length; i++) {
            if (this.pantallas[i].pant_Id === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    // Filter Search en Tabla
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    // Return Campos Detalle
    getFilteredPropertyArray(): { key: string, value: any }[] {
        const excludedKeywords = ['Creacion', 'Modificacion', 'Estado', 'tb'];

        return Object.keys(this.pantalla)
        .filter(key => !excludedKeywords.some(keyword => key.includes(keyword)))
        .map(key => ({
            key: key.replace(/^(pant_|usua_)/, ''),
            value: this.pantalla[key]
        }));
      }
}
