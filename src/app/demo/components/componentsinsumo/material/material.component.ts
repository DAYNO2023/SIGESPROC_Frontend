import { Component } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { filter, flatMap } from 'rxjs';
import { Material } from 'src/app/demo/models/modelsinsumo/materialviewmodel';
import { MaterialService } from 'src/app/demo/services/servicesinsumo/material.service';
import { CookieService } from 'ngx-cookie-service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  templateUrl: './material.component.html',
  providers: [MessageService, ConfirmationService],
  styleUrl: './material.component.scss'
})
export class MaterialComponent {
    // Bandera para mostrar el formulario de material
    materialFormulario: boolean = false;

    // Bandera para mostrar la vista principal de materiales
    indexMaterial: boolean = true;

    // Bandera para mostrar el detalle del material
    detalleMaterial: boolean = false;

    // Bandera para mostrar el diálogo de eliminación de material
    deleteMaterialDialog: boolean = false;

    // Bandera para indicar si se está editando un material
    editarMaterialBool: boolean = false;

    // Lista de materiales
    materiales: Material[] = [];

    usua_Id: string = "";

    // Materiales seleccionados
    selectedMaterial: Material[] = [];

    // Objeto de material inicializado con el usuario de creación
    material: Material = { usua_Creacion: parseInt(this.usua_Id) };

    // Bandera para indicar si el formulario ha sido enviado
    submitted: boolean = false;

    // Columnas para la tabla de materiales
    cols: any[] = [];

    // Título de la vista actual
    title: string = "";

    // Opciones de acciones para el menú contextual
    acciones: MenuItem[] = [];


    // Constructor con servicios inyectados
    constructor(
      private materialService: MaterialService,
      private messageService: MessageService,
      private cookieService: CookieService,
      private router: Router,
    ) {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (event.urlAfterRedirects.includes('/sigesproc/insumo/material')
                ) {
                    this.ngOnInit();
                    this.cerrarFormulario();
                    this.cerrarDetalle();
                }
            });
    }

    // Método de inicialización del componente
    async ngOnInit() {
        if(this.cookieService.get("Token") == 'false'){
            this.router.navigate(['/auth/login']);
        }
        this.usua_Id = this.cookieService.get('usua_Id');
        this.title = "";

        // Cargar lista de materiales
        this.cargarDatos();

        // Configurar columnas para la tabla
        this.cols = [
            { field: 'descripcion', header: 'Material' },
        ];

        // Configurar acciones del menú contextual
        this.acciones = [
            { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.editarMaterial() },
            { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.abrirDetalle() },
            { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.eliminarMaterial() },
        ];

        // Configurar la vista inicial
        this.indexMaterial = true;
        this.editarMaterialBool = false;
    }

    loading = false;


        // Subscripcion para traer los datos y setear la tabla del index
        async cargarDatos() {
            this.loading = true;

            try {
                const data = await this.materialService.Listar();
                this.materiales = data.map((material: any) => ({
                    ...material,
                       //Formateamos las fecha creacion y la de modificacion

                    // fechaCreacion: new Date(material.fechaCreacion).toLocaleDateString(),
                    // fechaModificacion: new Date(material.fechaModificacion).toLocaleDateString()
                }));

            } catch (error) {
                console.error('Error al obtener datos:', error);
                this.loading = false; // Oculta el loader cuando se completa la carga

            } finally {
                this.loading = false; // Oculta el loader cuando se completa la carga

            }
        }


    // Método para seleccionar un material
    selectMaterial(material: Material) {
        this.material = { ...material, usua_Modificacion: parseInt(this.usua_Id) };
    }

    // Método para abrir el formulario de nuevo material
    abrirNuevo() {
        this.material = { usua_Creacion: parseInt(this.usua_Id) };
        this.submitted = false;
        this.title = "Nuevo";
        this.indexMaterial = false;
        this.materialFormulario = true;
    }

    // Método para editar un material
    editarMaterial() {
        this.title = "Editar";
        this.indexMaterial = false;
        this.materialFormulario = true;
    }

    // Método para abrir el detalle de un material
    async abrirDetalle() {
        await this.materialService.Buscar(this.material.mate_Id)
            .then((data) => this.selectedMaterial.push(data));

        this.title = "";
        this.indexMaterial = false;
        this.detalleMaterial = true;
    }

    // Método para mostrar el diálogo de eliminación de material
    eliminarMaterial() {
        this.deleteMaterialDialog = true;
    }

    // Método para confirmar la eliminación de un material
    async confirmarEliminar() {
        this.deleteMaterialDialog = false;
        try {
            let response = await this.materialService.Eliminar(this.material.mate_Id);
            const { code, data, message } = response; // Desestructura la respuesta

            // Inicializa variables para el mensaje del servicio
            let severity = 'error';
            let summary = 'Error';
            let detail = data?.messageStatus + "." || message + ".";

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
            this.ngOnInit();
        } catch (error) {
            // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
            this.messageService.add({
                severity: 'error',
                summary: 'Error Externo',
                styleClass: 'iziToast-custom',
                detail: error.message + "." || error + ".",
                life: 3000
            });
        }
    }

    // Método para cerrar la vista de detalle
    cerrarDetalle() {
        this.title = "";
        this.detalleMaterial = false;
        this.indexMaterial = true;
        this.selectedMaterial = [];
    }

    // Método para cerrar el formulario de material
    cerrarFormulario() {
        this.title = "";
        this.materialFormulario = false;
        this.indexMaterial = true;
        this.submitted = false;
    }

    // Método para guardar un material (nuevo o editado)
    async guardarMaterial() {
        this.submitted = true;

        if (this.material.mate_Descripcion?.trim()) {
            try {
                let response;

                if (this.material.mate_Id) {
                    this.editarMaterialBool = true;
                } else {
                    response = await this.materialService.Insertar(this.material);

                    this.messageService.add({
                        severity: response.code == 200 ? 'success' : 'warn',
                        summary: response.code == 200 ? 'Éxito' : 'Advertencia',
                        styleClass: 'iziToast-custom',
                        detail: response.data?.messageStatus + "." || response.message + ".",
                        life: 3000
                    });

                    if (response.code == 200) {
                        this.materialFormulario = false;
                        this.material = { usua_Creacion: parseInt(this.usua_Id) };
                        this.ngOnInit();
                    }
                }
            } catch (error) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    styleClass: 'iziToast-custom',
                    detail: error.message + "." || error + ".",
                    life: 3000
                });
            }
        }
    }

    // Método para confirmar la edición de un material
    async confirmarEditar() {
        this.submitted = true;

        if (this.material.mate_Descripcion?.trim()) {
            try {
                let response = await this.materialService.Actualizar(this.material);

                this.messageService.add({
                    severity: response.code == 200 ? 'success' : 'warn',
                    summary: response.code == 200 ? 'Éxito' : 'Advertencia',
                    styleClass: 'iziToast-custom',
                    detail: response.data?.messageStatus + "." || response.message ,
                    life: 3000
                });

                if (response.code == 200) {
                    this.materialFormulario = false;
                    this.material = { usua_Creacion: parseInt(this.usua_Id) };
                    this.ngOnInit();
                }
            } catch (error) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    styleClass: 'iziToast-custom',
                    detail: error.message + "." || error + ".",
                    life: 3000
                });
            }
        }
    }

    // Método de búsqueda (no utilizada)
    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.materiales.length; i++) {
            if (this.materiales[i].mate_Id === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    // Filtro global para la tabla
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    // Método para retornar campos filtrados del detalle
    getFilteredPropertyArray(): { key: string, value: any }[] {
        const excludedKeywords = ['Creacion', 'Modificacion', 'Estado', 'tb'];

        return Object.keys(this.material)
            .filter(key => !excludedKeywords.some(keyword => key.includes(keyword)))
            .map(key => ({
                key: key.replace(/^(mate_|usua_)/, ''),
                value: this.material[key]
            }));
    }

    allowOnlyAlphanumeric(event: any) {
        event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/^\s/, '');
      }
      
    // Validación de entrada de texto
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

    // Función para validar texto y números
    ValidarTextoNumeros(event: KeyboardEvent) {
        const inputElement = event.target as HTMLInputElement;
        const key = event.key;
    
        if (key === ' ' && inputElement.selectionStart === 0) {
        event.preventDefault();
        }
    }
}
