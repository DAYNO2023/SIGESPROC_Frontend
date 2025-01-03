import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { Banco } from 'src/app/demo/models/modelsgeneral/bancoviewmodel';
import { BancoService } from 'src/app/demo/services/servicesgeneral/banco.service';
import { Titulos } from 'src/app/demo/models/TitulosIzitoastEnum';
import { Gravedades } from 'src/app/demo/models/GravedadIzitoastEnum';
import { ToastService } from 'src/app/demo/services/toast.service';
import { NavigationEnd, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-banco',
    templateUrl: './banco.component.html',
    styleUrl: './banco.component.scss',
    providers: [MessageService],
})
export class BancoComponent implements OnInit {
    pantallas: Map<string, boolean> = new Map<string, boolean>();
    bancos: Banco[] = [];
    //Del botón de acciones de la tabla de la pantalla index
    acciones: MenuItem[] = [];
    banco: Banco = new Banco(
        parseInt(this.cookieService.get('usua_Id')),
        new Date().toISOString()
    );

    //Para la pantalla de detalle
    tablaVacia = [{}];

    submitted: boolean = false;

    cargando: boolean = true;

    mostrarModalConfirmacion: boolean = false;

    columnas: { prop: string; titulo: string }[] = [];
    usua_Id: number;

    constructor(
        private bancoService: BancoService,
        private toastService: ToastService,
        public router: Router,
        public cookieService: CookieService
    ) {
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                // Si la URL coincide con la de este componente, forzamos la ejecución
                if (
                    event.urlAfterRedirects.includes('/sigesproc/general/banco')
                ) {
                    // Aquí puedes volver a ejecutar ngOnInit o un método específico
                    this.ngOnInit();
                }
            });
    }

    ngOnInit() {
        const token = this.cookieService.get('Token');
        if (token === 'false') {
            this.router.navigate(['/auth/login']);
        }
        //Seteamos el Id del usuario loggeado
        this.usua_Id = parseInt(this.cookieService.get('usua_Id'));
        this.mostrarPantalla('Index');
        //Inicializa el map de pantallas
        this.pantallas.set('Index', true);
        this.pantallas.set('Detalle', false);
        this.pantallas.set('Form', false);

        //Setea las columnas de la tabla
        const columnasMap = new Map<string, string>();
        columnasMap.set('codigo', 'No.');
        columnasMap.set('banc_Descripcion', 'Banco');
        this.columnas = Array.from(columnasMap, ([key, value]) => ({
            prop: key,
            titulo: value,
        }));

        this.cargarData();

        this.acciones = [
            {
                label: 'Editar',
                icon: 'pi pi-user-edit',
                command: (event) => this.mostrarForm(true),
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

    //Carga la tabla
    cargarData() {
        this.bancoService.banco = null;
        this.bancoService.getData().subscribe(
            (data: Banco[]) => {
                this.bancos = data;
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

    //Oculta todas las pantallas excepto la que se pasa por parámetro
    mostrarPantalla(_pantalla: string) {
        this.pantallas.forEach((valor, pantalla) =>
            this.pantallas.set(pantalla, false)
        );
        this.pantallas.set(_pantalla, true);
    }

    //Lógica para mostrar el formulario
    mostrarForm(editando: boolean) {
        this.mostrarPantalla('Form');
        if (!editando) {
            this.banco = new Banco(this.usua_Id, new Date().toISOString());
        }
    }

    //Filtra la tabla
    filtrar(tabla: Table, event: Event) {
        tabla.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    //Setea el banco para una lógica posterior
    seleccionarBanco(banco: Banco) {
        this.banco = { ...banco };
    }

    handleInput(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const texto = inputElement.value;

        // Solo permitir letras y un espacio después de cada letra
        inputElement.value = texto
            .replace(
                /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                ''
            )
            .replace(/\s{2,}/g, ' ')
            .replace(/^\s/, '');
        this.banco.banc_Descripcion = inputElement.value;
    }

    //No deja pegar caracteres diferentes a los válidos según una regex
    validarPegar(event: ClipboardEvent) {
        const clipboardData = event.clipboardData?.getData('text') || '';
        const allowedTextPattern = /^[a-zñA-ZÑáéíóúÁÉÍÓÚ\s]*$/;

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
    //Valida la decripción de la deducción
    validarDescripcion() {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        return regex.test(this.banco.banc_Descripcion);
    }
    //Retorna la cadena de texto sin los espacios sobrantes
    removerEspaciosInnecesarios(texto: string) {
        return texto.trim().replace(/\s{2,}/g, ' ');
    }
    //Lógica cuando se le da click al botón de guardar
    guardar() {
        this.submitted = true;
        let todosLosCamposLlenos = true;

        if (this.banco.banc_Id) {
            this.banco.usua_Modificacion = this.usua_Id;
            this.banco.banc_FechaModificacion = new Date().toISOString();
            if (!this.banco.banc_Descripcion) {
                todosLosCamposLlenos = false;
            }
        } else {
            for (const prop in this.banco) {
                if (
                    prop === 'banc_Id' ||
                    prop === 'codigo' ||
                    prop === 'usua_Modificacion' ||
                    prop === 'banc_FechaModificacion'
                ) {
                    continue;
                }
                if (!this.banco[prop]) {
                    todosLosCamposLlenos = false;
                    break;
                }
            }
        }

        // console.log(this.banco, 'this.banco');
        // console.log(todosLosCamposLlenos, 'todosLosCamposLlenos');

        if (todosLosCamposLlenos && this.validarDescripcion()) {
            this.banco.banc_Descripcion = this.removerEspaciosInnecesarios(
                this.banco.banc_Descripcion
            );
            if (this.banco.banc_Id) {
                this.mostrarModalConfirmacion = true;
            } else {
                this.insertarEditar();
            }
        }
    }

    insertarEditar() {
        this.mostrarModalConfirmacion = false;
        this.bancoService[this.banco.banc_Id ? 'Editar' : 'Insertar'](
            this.banco
        ).subscribe(
            (exito: boolean) => {
                if (exito) {
                    this.cargarData();
                    this.mostrarPantalla('Index');
                    this.toastService.toast(
                        Gravedades.success,
                        this.banco.banc_Id
                            ? 'Actualizado con Éxito.'
                            : 'Insertado con Éxito.'
                    );
                    this.banco = new Banco(
                        this.usua_Id,
                        new Date().toISOString()
                    );
                    this.submitted = false;
                } else {
                    this.toastService.toast(
                        Gravedades.error,
                        'El banco ya existe.'
                    );
                }
            },
            (error) => {
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
            }
        );
    }

    //Elimina un banco
    eliminar() {
        this.bancoService.Eliminar(this.banco.banc_Id).subscribe(
            (exito: boolean) => {
                if (exito) {
                    this.toastService.toast(
                        Gravedades.success,
                        'Eliminado con Éxito.'
                    );
                    this.cargarData();
                    this.mostrarModalConfirmacion = false;
                } else {
                    this.toastService.toast(
                        Gravedades.warning,
                        'El registro depende de Empleados activos.'
                    );
                    this.mostrarModalConfirmacion = false;
                }
            },
            (error) => {
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
            }
        );
    }

    //Lógica cuando se le dá clik al botón de cancelar
    cancelar() {
        this.mostrarPantalla('Index');
        this.submitted = false;
    }
}
