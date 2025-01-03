import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { Deduccion } from 'src/app/demo/models/modelsplanilla/deduccionviewmodel';
import { DeduccionService } from 'src/app/demo/services/servicesplanilla/deduccion.service';
import { Gravedades } from 'src/app/demo/models/GravedadIzitoastEnum';
import { ToastService } from 'src/app/demo/services/toast.service';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { NavigationEnd, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-deduccion',
    templateUrl: './deduccion.component.html',
    styleUrl: './deduccion.component.scss',
    providers: [MessageService],
})
export class DeduccionComponent implements OnInit {
    pantallas: Map<string, boolean> = new Map<string, boolean>();
    deducciones: Deduccion[] = [];
    items: MenuItem[] = [];
    deduccion: Deduccion = new Deduccion(
        parseInt(this.cookieService.get('usua_Id')),
        new Date().toISOString()
    );

    tablaVacia = [{}];

    cargando: boolean = true;

    submitted: boolean = false;

    mostrarModalConfirmacion: boolean = false;
    usua_Id: number;

    constructor(
        private deduccionService: DeduccionService,
        private toastService: ToastService,
        //LLamamos al servicio de global para traer la nomenclatura de moneda
        public globalMoneda: globalmonedaService,
        public router: Router,
        public cookieService: CookieService
    ) {
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                // Si la URL coincide con la de este componente, forzamos la ejecución
                if (
                    event.urlAfterRedirects.includes(
                        '/sigesproc/planilla/deduccion'
                    )
                ) {
                    // Aquí puedes volver a ejecutar ngOnInit o un método específico
                    this.ngOnInit();
                }
            });
    }

    columnas: { prop: string; titulo: string }[] = [];
    ngOnInit() {
        //Seteamos el Id del usuario loggeado
        this.usua_Id = parseInt(this.cookieService.get('usua_Id'));
        const token = this.cookieService.get('Token');
        if (token === 'false') {
            this.router.navigate(['/auth/login']);
        }
        //Llamamos a la nomenclatura de la moneda para setearla en el HTML
        if (!this.globalMoneda.getState()) {
            this.globalMoneda.setState();
        }

        this.pantallas.set('Index', true);
        this.pantallas.set('Detalle', false);

        //Establece las columnas del datatable
        const columnasMap = new Map<string, string>();
        columnasMap.set('dedu_Descripcion', 'Deducción');
        columnasMap.set('dedu_Porcentaje', 'Valor');
        this.columnas = Array.from(columnasMap, ([key, value]) => ({
            prop: key,
            titulo: value,
        }));

        this.cargarData();

        this.items = [
            {
                label: 'Editar',
                icon: 'pi pi-user-edit',
                command: (event) => {
                    this.mostrarForm(true);
                },
            },
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: (event) => this.mostrarPantalla('Detalle'),
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: (event) => (this.mostrarModalConfirmacion = true),
            },
        ];
    }

    //Regresa a la pantalla index
    botonRegresarClick() {
        this.mostrarPantalla('Index');
        this.submitted = false;
    }

    //Regresa a la pantalla index
    botonCancelarClick() {
        this.mostrarPantalla('Index');
        this.submitted = false;
    }

    botonNuevoClick() {
        this.mostrarForm(false);
        this.submitted = false;
    }

    //Carga la data
    cargarData() {
        this.deduccionService.deduccion = null;
        this.deduccionService.getData().subscribe(
            (data: Deduccion[]) => {
                this.deducciones = [...data];
                this.cargando = false;
            },
            (error) => {
                // console.log(error);
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
                this.cargando = false;
            }
        );
    }

    mostrarPantalla(_pantalla: string) {
        this.pantallas.forEach((valor, pantalla) =>
            this.pantallas.set(pantalla, false)
        );
        this.pantallas.set(_pantalla, true);
    }

    mostrarForm(editando: boolean) {
        this.mostrarPantalla('Form');
        if (!editando) {
            this.deduccion = new Deduccion(
                this.usua_Id,
                new Date().toISOString()
            );
        }
    }

    filtrar(tabla: Table, event: Event) {
        tabla.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    seleccionarDeduccion(deduccion: Deduccion) {
        // console.log(deduccion);

        this.deduccion = {
            ...deduccion,
            dedu_Porcentaje: parseFloat(
                deduccion.dedu_Porcentaje
                    .toString()
                    .replace('L.', '')
                    .replace('%', '')
                    .trim()
            ),
        };
    }
    handleInput(event: Event, prop?: string) {
        const inputElement = event.target as HTMLInputElement;
        const texto = inputElement.value;

        if (!prop) {
            // Solo permitir letras y un espacio después de cada letra
            inputElement.value = texto
                .replace(
                    /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                    ''
                )
                .replace(/\s{2,}/g, ' ')
                .replace(/^\s/, '');
            this.deduccion.dedu_Descripcion = inputElement.value;
        }

        if (prop === 'monto') {
            // Solo permitir letras y un espacio después de cada letra
            inputElement.value = texto
                .replace(/[^0-9]|(?<=\s)[^0-9]/g, '')
                .replace(/\s{2,}/g, ' ')
                .replace(/^\s/, '');
        }
    }

    //No deja pegar caracteres diferentes a los válidos según una regex
    validarPegar(event: ClipboardEvent, prop?: string) {
        const clipboardData = event.clipboardData?.getData('text') || '';
        let allowedTextPattern = /^[a-zñA-ZÑáéíóúÁÉÍÓÚ\s]*$/;
        if (prop === 'monto') {
            allowedTextPattern = /^[0-9.,]*$/;
        }

        const filteredText = clipboardData
            .split('')
            .filter((char) => allowedTextPattern.test(char))
            .join('');

        const cleanedText = filteredText.trimStart();

        if (clipboardData !== cleanedText) {
            event.preventDefault();
            document.execCommand('insertText', false, cleanedText);
        }
    }

    guardar() {
        this.submitted = true;
        let todosLosCamposLlenos = true;

        if (this.deduccion.dedu_Porcentaje) {
            if (this.deduccion.dedu_Porcentaje.toString() !== '.') {
                this.deduccion.dedu_Porcentaje =
                    typeof this.deduccion.dedu_Porcentaje === 'string'
                        ? parseFloat(this.deduccion.dedu_Porcentaje)
                        : this.deduccion.dedu_Porcentaje;
            }
        }
        if (this.deduccion.dedu_Id) {
            this.deduccion.usua_Modificacion = this.usua_Id;
            this.deduccion.dedu_FechaModificacion = new Date().toISOString();
            for (const prop in this.deduccion) {
                if (
                    prop === 'dedu_EsMontoFijo' ||
                    prop === 'usuaModificacion' ||
                    prop === 'fechaModificacion' ||
                    prop === 'codigo' ||
                    prop === 'numDeducciones' ||
                    prop === '_checked'
                ) {
                    continue;
                }
                if (!this.deduccion[prop]) {
                    todosLosCamposLlenos = false;
                    // console.log(prop);
                    break;
                }
            }
        } else {
            for (const prop in this.deduccion) {
                if (
                    prop === 'dedu_Id' ||
                    prop === 'dedu_EsMontoFijo' ||
                    prop === 'usua_Modificacion' ||
                    prop === 'codigo' ||
                    prop === 'fechaModificacion' ||
                    prop === 'numDeducciones' ||
                    prop === 'dedu_FechaModificacion' ||
                    prop === '_checked'
                ) {
                    continue;
                }
                if (!this.deduccion[prop]) {
                    todosLosCamposLlenos = false;
                    // console.log(prop);
                    break;
                }
            }
        }

        // console.log(this.deduccion);
        // console.log(todosLosCamposLlenos);

        if (
            todosLosCamposLlenos &&
            this.validarDescripcion() &&
            this.validarValor()
        ) {
            this.deduccion.dedu_Descripcion = this.removerEspaciosInnecesarios(
                this.deduccion.dedu_Descripcion
            );
            if (this.deduccion.dedu_Id) {
                this.mostrarModalConfirmacion = true;
            } else {
                this.insertarEditar();
            }
        }
    }

    //Valida la decripción de la deducción
    validarDescripcion() {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/;
        //Valida que la descripción no sea un número
        const regexNumeros = /^\d*\.?\d*$/;
        if (regexNumeros.test(this.deduccion.dedu_Descripcion)) {
            return false;
        }
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        return regex.test(this.deduccion.dedu_Descripcion);
    }

    validarValor() {
        const regex = /^\d*\.?\d*$/;
        //Si solo es un punto es inválido
        if (this.deduccion.dedu_Porcentaje.toString() === '.') {
            return false;
        }
        //Si no es un número es inválido
        if (!regex.test(this.deduccion.dedu_Porcentaje.toString())) {
            return false;
        }
        return true;
    }
    insertarEditar() {
        this.mostrarModalConfirmacion = false;
        this.deduccionService[this.deduccion.dedu_Id ? 'Editar' : 'Insertar'](
            this.deduccion
        ).subscribe(
            (respuesta: Respuesta) => {
                if (respuesta.code >= 200 && respuesta.code < 300) {
                    this.cargarData();
                    this.toastService.toast(
                        Gravedades.success,
                        this.deduccion.dedu_Id
                            ? 'Actualizado con Éxito.'
                            : 'Insertado con Éxito.'
                    );
                    this.mostrarPantalla('Index');
                    this.submitted = false;
                    this.deduccion = new Deduccion(
                        this.usua_Id,
                        new Date().toISOString()
                    );
                } else {
                    if (respuesta.data.codeStatus === -1) {
                        this.toastService.toast(
                            Gravedades.error,
                            'La deducción ya existe.'
                        );
                        return;
                    }
                    this.toastService.toast(
                        Gravedades.error,
                        'Algo salió mal. Comuníquese con un Administrador.'
                    );
                }
                this.cargando = false;
            },
            (error) => {
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
                this.cargando = false;
            }
        );
    }
    //Retorna la cadena de texto sin los espacios sobrantes
    removerEspaciosInnecesarios(texto: string) {
        return texto.trim().replace(/\s{2,}/g, ' ');
    }

    eliminar() {
        this.deduccionService
            .Eliminar(this.deduccion.dedu_Id)
            .subscribe((exito: boolean) => {
                if (exito) {
                    this.cargarData();
                    this.toastService.toast(
                        Gravedades.success,
                        'Eliminado con Éxito.'
                    );
                    this.mostrarModalConfirmacion = false;
                } else {
                    this.toastService.toast(
                        Gravedades.warning,
                        'El registro depende de Empleados activos.'
                    );
                    this.mostrarModalConfirmacion = false;
                }
            });
    }
}
