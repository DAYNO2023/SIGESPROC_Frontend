import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { EstadoCivilService } from 'src/app/demo/services/servicesgeneral/estadoCivil.service';
import { EstadoCivil } from 'src/app/demo/models/modelsgeneral/estadoCivilviewmodel';
import { ChangeDetectorRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs';

@Component({
    selector: 'app-EstadoCivil',
    templateUrl: './estadoCivil.component.html',
    styleUrl: './estadoCivil.component.scss',
    providers: [MessageService],
})
export class EstadoCivilComponent implements OnInit {
    //#region  Variables
    estadosCiviles: EstadoCivil[] = [];//variable de tipo EstadoCivil-ViewModel, que almacena el listado de los campos de la tabla
    items: MenuItem[] = [];//variable que almacena las acciones que se mostraran en la lista desplegable de acciones por campo
    Index: boolean = true;//variable que sirve para mostrar el listado principal
    Create: boolean = false;//variable que sirve para mostrar el formulario de crear-editar
    Detail: boolean = false;//variable que sirve para mostrar los detalles
    Delete: boolean = false;//variable para abrir el modal de eliminar
    Edit: boolean = false;//variable para abrir el modal de editar
    form: FormGroup;//formgroup de envio de datos
    envioeditar: any;//envio del formgroup al modal de editar
    submitted: boolean = false;//mustra error si el campo esta vacio
    identity: string = 'Crear';//identificador de si es crear o editar en el formulario
    selectedEstadoCivil: any;//varibale que almacena los valores del campo seleccionado
    id: number = 0; //variable que almacena el id del campo
    titulo: string = 'Nuevo';//variable que almacena el titulo de el formulario crear-editar
    isTableLoading: boolean = false;//variable que muestra el mensaje de cargado
    isLoading = false; // Variable para controlar el spinner
    usua_Id: number;
    loadedTableMessage: string = "";//variable que almacena el mensaje de cargado

    //#region Detalles
    Datos = [{}];
    detalle_civi_Id: string = '';
    detalle_civi_Descripcion: string = '';
    detalle_usuaCreacion: string = '';
    detalle_usuaModificacion: string = '';
    detalle_FechausuaCreacion: string = '';
    detalle_FechausuaModificacion: string = '';
    //#endregion
    loading: boolean= true;

    //#endregion
    constructor(
        private messageService: MessageService,
        private service: EstadoCivilService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        public cookieService: CookieService,
    ) {

        this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          // Si la URL coincide con la de este componente, forzamos la ejecución
          if (event.urlAfterRedirects.includes('/sigesproc/general/estadosciviles')) {
            // Aquí puedes volver a ejecutar ngOnInit o un método específico
            this.onRouteChange();
          }
        });

        this.form = this.fb.group({
            civi_Descripcion: ['', Validators.required],
        });
    }

    //accion que se realiza al comenzar la ejecucion
    ngOnInit(): void {
        // this.isTableLoading = true;
        this.Listado();
        this.cargarDatos()
        this.Index = true;
        this.Create = false;
        this.Detail = false;
        this.Delete = false;
        const token =  this.cookieService.get('Token');
        if(token == 'false'){
          this.router.navigate(['/auth/login'])

        }
        this.usua_Id = parseInt(this.cookieService.get('usua_Id'));
        this.items = [
            {
                label: 'Editar',
                icon: 'pi pi-user-edit',
                command: (event) => this.EditarEstadoCivil(),
            },
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: (event) => this.DetalleEstadoCivil(),
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: (event) => this.EliminarEstadoCivil(),
            },
        ];
    }

    onRouteChange(): void {
        // Aquí puedes llamar cualquier método que desees reejecutar
        this.ngOnInit();
    }

    handleInput(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const texto = inputElement.value;

        // Solo permitir letras y un espacio después de cada letra
        inputElement.value = texto
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/^\s/, '');

        // Actualizar el valor en el formulario
        this.form.controls['civi_Descripcion'].setValue(inputElement.value);
      }

    cargarDatos() {
        this.isLoading = true; // Mostrar el spinner

        this.service.Listar().subscribe(
          (data: any) => {
            this.estadosCiviles = data.map((bienRaiz: any) => ({
              ...bienRaiz,
              civi_FechaCreacion: new Date(bienRaiz.civi_FechaCreacion).toLocaleDateString(),
              civi_FechaModificacion: new Date(bienRaiz.civi_FechaModificacion).toLocaleDateString()
            }));

            this.isLoading = false; // Ocultar el spinner cuando los datos se han cargado
          },
          (error) => {

            this.isLoading = false; // Ocultar el spinner si hay un error
            // Aquí puedes agregar lógica para mostrar un mensaje de error al usuario
          }
        );
      }

    //accion que llena el listado de los campos de la tabla
    Listado() {
        this.loading = true;

        this.service.Listar().subscribe(
            (data: any) => {

                this.estadosCiviles = data.map((EstadosCiviles: any) => ({
                    ...EstadosCiviles,
                    codigo: parseInt(EstadosCiviles.codigo),

                    civi_FechaCreacion: new Date(
                        EstadosCiviles.civi_FechaCreacion
                    ).toLocaleDateString(),

                    civi_FechaModificacion: new Date(
                        EstadosCiviles.civi_FechaModificacion
                    ).toLocaleDateString(),
                }));
                if(this.estadosCiviles.length === 0){
                    this.loadedTableMessage = "No hay estados civiles existentes aún.";//mensaje que se muestra si no hay registros en la tabla

                }else{
                    this.isTableLoading = false;//oculta el spinner cuando se cargan los datos y no son 0
                    this.Index = true;
                  }
                },
                error => {
                    this.isTableLoading = false;//oculta el spinner cuando se cargan los datos y no son 0
                    // this.loadedTableMessage = "Error al cargar datos.";//mensaje que se muestra si no hay registros en la tabla
                },
                () => {
                  this.loading = true; // Oculta el loader cuando se completa la carga
              }
              );
            }

    //filtro global, que sirve para el filtrado de la barra de busqueda
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }
    //accion que llena la variable con los datos de el campo seleccionado
    selectEstadoCivil(EstadoCivil: any) {
        this.selectedEstadoCivil = EstadoCivil;
    }


    allowCaracteresEspacio(event: any) {
        // Detectar si el evento es de tipo 'paste' (pegado)
        if (event.type === 'paste') {
            // Obtener el contenido del portapapeles
            const clipboardData = event.clipboardData;
            const pastedData = clipboardData.getData('text');

            // Expresión regular para bloquear los números
            if (/\d/.test(pastedData)) {
                // Si contiene números, prevenir el pegado
                event.preventDefault();
                return;
            }
        }

        // Expresión regular ajustada para permitir paréntesis además de los caracteres permitidos
        event.target.value = event.target.value
            // Agregamos los paréntesis a la lista de caracteres permitidos
            .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ._\-\s()]/g, '')
            // Reemplazar múltiples espacios consecutivos por un solo espacio
            .replace(/\s{2,}/g, ' ');
    }

    //accion que despliega el formulario de creacion
    CrearEstadoCivil() {
        this.Detail = false;
        this.Index = false;
        this.Create = true;
        this.form.reset();
        this.submitted = false;
        this.identity = 'crear';
        this.titulo = 'Nuevo';
    }

    //accion que mustra el listado principal y pliega las demas acciones
    CerrarEstadoCivil() {
        this.Index = true;
        this.Detail = false;
        this.Create = false;
    }

    //accion que despliega el formulario de edicion y setea los campos del formulario
    EditarEstadoCivil() {
        this.Detail = false;
        this.Index = false;
        this.Create = true;
        this.identity = 'editar';
        this.titulo = 'Editar';
        this.form.patchValue({
            civi_Descripcion: this.selectedEstadoCivil.civi_Descripcion,
        });
        this.id = this.selectedEstadoCivil.civi_Id;
        this.detalle_civi_Descripcion =
        this.selectedEstadoCivil.civi_Descripcion;
    }

    //accion que despliega y setea los detalles del campo en especifico
    DetalleEstadoCivil() {
        this.Index = false;
        this.Create = false;
        this.Detail = true;
        this.detalle_civi_Id = this.selectedEstadoCivil.codigo;
        this.detalle_civi_Descripcion =
            this.selectedEstadoCivil.civi_Descripcion;

        this.detalle_usuaCreacion = this.selectedEstadoCivil.usuaCreacion;
        if (this.selectedEstadoCivil.usuaModificacion != null) {
            this.detalle_usuaModificacion =
                this.selectedEstadoCivil.usuaModificacion;
            this.detalle_FechausuaModificacion =
                this.selectedEstadoCivil.civi_FechaModificacion;
        } else {
            this.detalle_usuaModificacion = '';
            this.detalle_FechausuaModificacion = '';
        }

        this.detalle_FechausuaCreacion =
            this.selectedEstadoCivil.civi_FechaCreacion;

    }

    //accion que abre el modal de eliminar y setea la variable id
    EliminarEstadoCivil() {
        this.detalle_civi_Descripcion =
        this.selectedEstadoCivil.civi_Descripcion;
        this.id = this.selectedEstadoCivil.civi_Id;
        this.Delete = true;
    }

    //accion que valida que solo se pueda ingresar texto en los inputs
    ValidarTexto(event: KeyboardEvent) {
        const inputElement = event.target as HTMLInputElement;
        const key = event.key;
        if (
            !/^[a-zA-Z\s()]+$/.test(event.key) &&
            event.key !== 'Backspace' &&
            event.key !== 'Tab' &&
            event.key !== 'ArrowLeft' &&
            event.key !== 'ArrowRight'
        ) {
            event.preventDefault();
        }
        if (key === ' ' && inputElement.selectionStart === 0) {
            event.preventDefault();
        }
    }

    //accion que envia los datos del formulario al backend o a la accion de editar (tambien abre el modal de confirmar editar)
    Guardar() {
        if (this.form.valid) {

            const civi_Descripcion = this.form.value.civi_Descripcion;

            // Expresión regular: permite letras, paréntesis y un solo espacio entre palabras
            const regex = /^[a-zA-Z()]+(?: [a-zA-Z()]+)*$/;

            if (!regex.test(civi_Descripcion.trim())) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'El nombre del estado civil es inválido.',
                    life: 3000,
                    styleClass: 'iziToast-custom',
                });
                return;
            }

            const EstadoCivil: any = {
                civi_Id: this.id,
                civi_Descripcion: this.form.value.civi_Descripcion.trim(),
                usua_Creacion: this.usua_Id,
                usua_Modificacion: this.usua_Id,
            };

            if (this.identity !== 'editar') {
                this.service.Insertar(EstadoCivil).subscribe((respuesta: Respuesta) => {

                    if (respuesta.success) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            styleClass:'iziToast-custom',
                            detail: 'Insertado con Éxito.',
                            life: 3000,
                        });
                        this.Listado();
                        this.CerrarEstadoCivil();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            styleClass:'iziToast-custom',
                            detail: 'El registro ya existe.',
                            life: 3000,
                        });

                    }
                });
            } else {
                this.Edit = true;
                // Actualizamos el valor del detalle para mostrar el valor nuevo en el diálogo de confirmación
                this.detalle_civi_Descripcion = EstadoCivil.civi_Descripcion;
                this.envioeditar = EstadoCivil;
            }
        } else {
            this.submitted = true;
        }
    }


    //Accion que envia los datos enviados por el guardar al backend si se confirma en el modal
    EditarG(){
        this.service.Actualizar(this.envioeditar)
        .subscribe((respuesta: Respuesta) => {

            if (respuesta.success) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    styleClass:'iziToast-custom',
                    detail: 'Actualizado con Éxito.',
                    life: 3000,
                });
                this.CerrarEstadoCivil();
                this.Listado();
                this.Edit = false;

            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    styleClass:'iziToast-custom',
                    detail: 'El registro ya existe.',
                    life: 3000,
                });

            }
        });
    }

    //accion que envia el id del registro al backend para eliminar el registro
    Eliminar() {
        // Inicializa variables para el mensaje del servicio
        let severity = 'error';
        let summary = 'Error';

        try {
            this.service.Eliminar(this.id).subscribe((respuesta: Respuesta) => {
                let detail = respuesta.data?.messageStatus || 'Operación completada';


                // Verifica el código de respuesta
                if (respuesta.code === 200) {
                    // Ajusta la severidad y resumen basado en el código de estado
                    severity = respuesta.data.codeStatus > 0 ? 'success' : 'warn';
                    summary = respuesta.data.codeStatus > 0 ? 'Éxito' : 'Advertencia';

                    // Si la eliminación fue exitosa, elimina el elemento de la lista sin recargar toda la tabla
                    if (respuesta.data.codeStatus > 0) {
                        const index = this.estadosCiviles.findIndex(item => item.civi_Id === this.id); // Ajusta el array local
                        if (index !== -1) {
                            this.estadosCiviles.splice(index, 1); // Elimina el registro localmente
                        }
                    }
                } else if (respuesta.code === 500) {
                    // Manejo del error interno
                    severity = 'error';
                    summary = 'Error Interno';
                }

                // Muestra el mensaje de notificación
                this.messageService.add({
                    severity,
                    summary,
                    detail,
                    life: 3000
                });
            });
        } catch (error) {
            // Captura cualquier error externo y muestra un mensaje de error
            this.messageService.add({
                severity: 'error',
                summary: 'Error Externo',
                styleClass:'iziToast-custom',
                detail: error.message || 'Error inesperado',
                life: 3000
            });
        }

        // Reinicia el estado del componente
        this.Delete = false; // Restablece el estado de eliminación
    }

}
