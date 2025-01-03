import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { Gravedades } from 'src/app/demo/models/GravedadIzitoastEnum';
import { Banco } from 'src/app/demo/models/modelsgeneral/bancoviewmodel';
import { Cargo } from 'src/app/demo/models/modelsgeneral/cargoviewmodel';
import { ciudad } from 'src/app/demo/models/modelsgeneral/ciudadviewmodel';
import { Empleado } from 'src/app/demo/models/modelsgeneral/empleadoviewmodel';
import { EstadoCivil } from 'src/app/demo/models/modelsgeneral/estadoCivilviewmodel';
import { Estado } from 'src/app/demo/models/modelsgeneral/estadoviewmodel ';
import {
    Frecuencia,
    FrecuenciaDDL,
} from 'src/app/demo/models/modelsplanilla/frecuenciaviewmodel';
import { Titulos } from 'src/app/demo/models/TitulosIzitoastEnum';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { BancoService } from 'src/app/demo/services/servicesgeneral/banco.service';
import { CargoService } from 'src/app/demo/services/servicesgeneral/cargo.service';
import { ciudadService } from 'src/app/demo/services/servicesgeneral/ciudad.service';
import { EmpleadoService } from 'src/app/demo/services/servicesgeneral/empleado.service';
import { EstadoService } from 'src/app/demo/services/servicesgeneral/estado.service';
import { EstadoCivilService } from 'src/app/demo/services/servicesgeneral/estadoCivil.service';
import { FrecuenciaService } from 'src/app/demo/services/servicesplanilla/frecuencia.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ToastService } from 'src/app/demo/services/toast.service';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'app-empleado-info',
    standalone: true,
    imports: [
        CommonModule,
        InputTextModule,
        InputNumberModule,
        FormsModule,
        CalendarModule,
        RadioButtonModule,
        DropdownModule,
        ToastModule,
        ReactiveFormsModule,
        AutoCompleteModule,
        DialogModule,
        FileUploadModule,
    ],
    providers: [MessageService],
    templateUrl: './info.component.html',
    styleUrl: './info.component.scss',
})
export class InfoComponent implements OnInit {
    @ViewChild('emplDNIInput') empl_DNIInput!: ElementRef;
    @ViewChild('emplNombreInput') empl_NombreInput!: ElementRef;
    @ViewChild('emplApellidoInput') empl_ApellidoInput!: ElementRef;
    //Declaramos el fileUploader para subir la foto del empleado
    @ViewChild('fileUploader') fileUploader: FileUpload;
    //Declaramos la variable del empleado para su posterior edición
    empleado: Empleado;
    //Variable que indica si el usuario ya intentó subir el formulario
    submitted: boolean = false;
    //Declaramos la variable de máxima fecha de nacimiento
    maxDate: Date;
    //Declaramos la variable de mínima fecha de nacimiento
    minDate: Date;
    //Declaramos la variable de bancos para cargarlo en el onInit
    bancos: Banco[];
    //Declaramos la variable de cargos para cargarlo en el onInit
    cargos: Cargo[];
    frecuencias: FrecuenciaDDL[];
    ciudades: ciudad[];
    //Declaramos la variable de estados para cargarlo en el onInit
    estados: Estado[];
    //Declaramos la variable de estados civiles para cargarlo en el onInit
    estadosCiviles: EstadoCivil[];
    //Declaramos la variable de filtrado estados civiles para el p-autocomplete
    filtradoEstadosCiviles: EstadoCivil[] = [];
    //Declaramos la variable de filtrado estados para el p-autocomplete
    filtradoEstados: Estado[];
    //Declaramos la variable de filtrado ciudades para el p-autocomplete
    filtradoCiudades: ciudad[];
    //Declaramos la variable de filtrado frecuencias para el p-autocomplete
    filtradoFrecuencias: FrecuenciaDDL[];
    //Declaramos la variable de filtrado cargos para el p-autocomplete
    filtradoCargos: Cargo[];
    //Declaramos la variable de filtrado bancos para el p-autocomplete
    filtradoBancos: Banco[];
    //Variable que indica si el modal de confirmación es visible
    mostrarModalConfirmacion: boolean = false;
    //Declaramos la variable de la url de la imagen
    urlImagen: string;
    //Declaramos una url por defecto
    defaultImageUrl =
        'https://www.google.com/url?sa=i&url=https%3A%2F%2Fblog.century21colombia.com%2Fterrenos-en-venta-conoce-las-4-ventajas&psig=AOvVaw3dHjpRtwlXrhpz2U9KFOOe&ust=1721747577888000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCPDaxbL3uocDFQAAAAAdAAAAABAE';
    //Declaramos la url donde se subirán las imágenes
    apimagenUrl = 'https://api.imgbb.com/1/upload';
    //Declaramos la apiKey donde se subirán las imágenes
    apiimagenKey = '200fe8447d77c936db33a6d227daf243';
    //Declaramos el botón para remover la foto
    botonQuitarFoto: HTMLElement;
    //Declaramos la variable que almacenará el id del usuario utilizando el sistema
    usua_Id: number;
    //Declaramos la variable que almacenará la imagen del formulario
    imagen: any;

    constructor(
        //Inyectamos el servicio de los empleados
        public empleadoService: EmpleadoService,
        //Inyectamos el servicio de los bancos
        private bancoService: BancoService,
        //Inyectamos el servicio de las frecuencias
        private frecuenciaService: FrecuenciaService,
        //Inyectamos el servicio de los estados
        private estadoService: EstadoService,
        //Inyectamos el servicio de las ciudades
        private ciudadService: ciudadService,
        //Inyectamos el servicio para peticiones http
        private http: HttpClient,
        //Inyectamos el servicio de los cargos
        private cargoService: CargoService,
        //Inyectamos el servicio de los estados civiles
        private estadoCivilService: EstadoCivilService,
        //Inyectamos el servicio de los toasts
        private toastService: ToastService,
        //Inyectamos el servicio para mostrar sanitizar elementos del DOM
        private sanitizer: DomSanitizer,
        //Inyectamos al servicio de global para traer la nomenclatura de moneda
        public globalMoneda: globalmonedaService,
        //Inyectamos el servicio para manejar el router
        public router: Router,
        //Inyectamos el servicio para utilizar las cookies del navegardor
        public cookieService: CookieService
    ) {}
    ngOnInit() {
        const token = this.cookieService.get('Token');
        if (token === 'false') {
            this.router.navigate(['/auth/login']);
        }
        //Seteamos el Id del usuario loggeado
        this.usua_Id = parseInt(this.cookieService.get('usua_Id'));
        //Llamamos a la nomenclatura de la moneda para setearla en el HTML
        if (!this.globalMoneda.getState()) {
            this.globalMoneda.setState();
        }
        //Establece la fecha de hoy menos 18 años atrás
        this.maxDate = new Date();
        this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
        //Establece la fecha mínima que puede seleccionar a 1924
        this.minDate = new Date();
        this.minDate.setFullYear(1924);
        //Si el objeto empledo del empleadoService tiene un id significa que estamos editando
        if (this.empleadoService.empleado.empl_Id) {
            //Si estamos editando el empleado, que utilice el empleado que está en el servicio
            this.empleado = this.empleadoService.empleado;
            //Cargamos las ciudades
            this.cargarCiudades();
            //Utilizamos la imagen del empleado a editar
            this.urlImagen = this.empleado.empl_Imagen
                ? this.empleadoService.BaseUrl + this.empleado.empl_Imagen
                : '';
        } else {
            //Sino instanciamos un nuevo empleado
            this.empleado = new Empleado(this.usua_Id, new Date());
        }

        //CARGA LOS DATOS DE LOS AUTOCOMPLETES
        //Cargamos los bancos para el autocomplete
        this.bancoService.getData().subscribe(
            (data: Banco[]) => {
                this.bancos = data.sort((a, b) =>
                    a.banc_Descripcion.localeCompare(b.banc_Descripcion)
                );
            },
            (error) => {
                //Si es un error del sistema que se comunique con un administrador
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
            }
        );
        //Cargamos los cargos para el autocomplete
        this.cargoService.Listar().subscribe(
            (data: Cargo[]) => {
                this.cargos = data.sort((a, b) =>
                    a.carg_Descripcion.localeCompare(b.carg_Descripcion)
                );
            },
            (error) => {
                //Si es un error del sistema que se comunique con un administrador
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
            }
        );
        //Cargamos las frecuencias para el autocomplete
        this.frecuenciaService.ddl().subscribe(
            (data: FrecuenciaDDL[]) => {
                this.frecuencias = data.sort((a, b) =>
                    a.frec_Descripcion.localeCompare(b.frec_Descripcion)
                );
            },
            (error) => {
                //Si es un error del sistema que se comunique con un administrador
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
            }
        );
        //Cargamos los estadosCiviles para el autocomplete
        this.estadoCivilService.Listar().subscribe(
            (data: EstadoCivil[]) => {
                this.estadosCiviles = data.sort((a, b) =>
                    a.civi_Descripcion.localeCompare(b.civi_Descripcion)
                );
            },
            (error) => {
                //Si es un error del sistema que se comunique con un administrador
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
            }
        );
        //Cargamos los estados(departamentos) para el autocomplete
        this.estadoService.Listar().subscribe(
            (data: Estado[]) => {
                this.estados = data.sort((a, b) =>
                    a.esta_Nombre.localeCompare(b.esta_Nombre)
                );
            },
            (error) => {
                //Si es un error del sistema que se comunique con un administrador
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
            }
        );
    }

    //Sanitiza la url de la imagen
    sanitizarUrl(base64: string): SafeUrl {
        return this.sanitizer.bypassSecurityTrustUrl(base64);
    }

    QuitarFoto(event: Event): void {
        this.empleado.empl_Imagen = null;
        this.urlImagen = '';
        event.stopPropagation();
    }

    //Lo que sucede cuando seleccionamos una imagen
    seleccionarImagen(event: any): void {
        //Leemos el archivo para su posterior carga
        this.imagen = event.files[0];
        //Instanciamos un lector de archivos
        const lector = new FileReader();
        lector.onload = (e: any) => {
            this.urlImagen = e.target.result;
        };
        lector.readAsDataURL(this.imagen);
    }

    //Abre el explorador de archivos de la computadora del usuario
    abrirExploradorDeArchivos(): void {
        this.empleado.empl_Imagen = '';
        this.fileUploader.advancedFileInput.nativeElement.click();
    }

    //LÓGICA DE LOS AUTOCOMPLETES
    filterEstadosCiviles(event: any) {
        const query = event.query
            ? event.query.toLowerCase()
            : this.empleado.estadoCivil
            ? this.empleado.estadoCivil.toLowerCase()
            : '';

        //Filtramos los elementos que concuerden con el texto ingresado
        this.filtradoEstadosCiviles = this.estadosCiviles.filter((civi) =>
            civi.civi_Descripcion.toLowerCase().includes(query)
        );
        if (this.filtradoEstadosCiviles.length === 1) {
            const opcionEncontrada = this.estadosCiviles.find(
                (item) => item.civi_Descripcion.toLocaleLowerCase() === query
            );
            if (opcionEncontrada) {
                this.empleado.civi_Id = opcionEncontrada.civi_Id;
                this.empleado.estadoCivil = opcionEncontrada.civi_Descripcion;
            }
        } else {
            this.empleado.civi_Id = 0;
        }
    }
    onEstadoCivilSelect(event: any) {
        const estadoCivilSeleccionado = event;
        this.empleado.civi_Id = estadoCivilSeleccionado.value.civi_Id;
        this.empleado.estadoCivil =
            estadoCivilSeleccionado.value.civi_Descripcion;
    }

    filterEstados(event: any) {
        const query = event.query
            ? event.query.toLowerCase()
            : this.empleado.estado
            ? this.empleado.estado.toLowerCase()
            : '';
        //Filtramos los elementos que concuerden con el texto ingresado
        this.filtradoEstados = this.estados.filter((esta) =>
            esta.esta_Nombre.toLowerCase().includes(query)
        );
        if (this.filtradoEstados.length === 1) {
            const opcionEncontrada = this.estados.find(
                (item) => item.esta_Nombre.toLocaleLowerCase() === query
            );
            if (opcionEncontrada) {
                this.empleado.esta_Id = opcionEncontrada.esta_Id;
                this.empleado.estado = opcionEncontrada.esta_Nombre;
                this.cargarCiudades();
            }
        } else {
            this.empleado.esta_Id = 0;
            if (this.empleado.ciudad) this.empleado.ciudad = '';
            if (this.empleado.ciud_Id) this.empleado.ciud_Id = 0;
        }
    }
    onEstadoSelect(event: any) {
        const estadoSeleccionado = event;
        // console.log(estadoCivilSeleccionado.value.civi_Id);
        this.empleado.esta_Id = estadoSeleccionado.value.esta_Id;
        this.empleado.estado = estadoSeleccionado.value.esta_Nombre;
        if (this.empleado.ciudad) this.empleado.ciudad = '';
        if (this.empleado.ciud_Id) this.empleado.ciud_Id = 0;
        this.cargarCiudades();
    }

    cargarCiudades() {
        this.ciudades = [];
        this.ciudadService.DropDownByState(this.empleado.esta_Id).subscribe(
            (data: ciudad[]) => {
                this.ciudades = data.sort((a, b) =>
                    a.ciud_Descripcion.localeCompare(b.ciud_Descripcion)
                );
                if (this.empleado.ciudad) {
                    const opcionEncontrada = this.ciudades.find(
                        (item) =>
                            item.ciud_Descripcion.toLocaleLowerCase() ===
                            this.empleado.ciudad.toLocaleLowerCase()
                    );
                    if (opcionEncontrada) {
                        this.empleado.ciud_Id = opcionEncontrada.ciud_Id;
                        this.empleado.ciudad =
                            opcionEncontrada.ciud_Descripcion;
                    }
                }
            },
            (error) => {
                console.error(error);
            }
        );
    }

    filterCiudades(event: any) {
        // console.log(this.ciudades);
        const query = event.query
            ? event.query.toLowerCase()
            : this.empleado.ciudad
            ? this.empleado.ciudad.toLowerCase()
            : '';
        //Filtramos los elementos que concuerden con el texto ingresado
        this.filtradoCiudades = this.ciudades.filter((ciud) =>
            ciud.ciud_Descripcion.toLowerCase().includes(query)
        );
        if (this.filtradoCiudades.length === 1) {
            const opcionEncontrada = this.ciudades.find(
                (item) => item.ciud_Descripcion.toLocaleLowerCase() === query
            );
            if (opcionEncontrada) {
                this.empleado.ciud_Id = opcionEncontrada.ciud_Id;
                // Actualiza el texto de la propiedad en el empleado
                this.empleado.ciudad = opcionEncontrada.ciud_Descripcion;
            }
        } else {
            this.empleado.ciud_Id = 0;
        }
    }
    onCiudadSelect(event: any) {
        const ciudadSeleccionada = event;
        this.empleado.ciud_Id = ciudadSeleccionada.value.ciud_Id;
        // Actualiza el texto de la propiedad en el empleado
        this.empleado.ciudad = ciudadSeleccionada.value.ciud_Descripcion;
    }

    filterBancos(event: any) {
        const query = event.query
            ? event.query.toLowerCase()
            : this.empleado.banco
            ? this.empleado.banco.toLowerCase()
            : '';
        // console.log(query, 'query');
        //Filtramos los elementos que concuerden con el texto ingresado
        this.filtradoBancos = this.bancos.filter((banc) =>
            banc.banc_Descripcion.toLowerCase().includes(query)
        );
        // console.log(this.filtradoBancos, 'this.filtradoBancos');
        if (this.filtradoBancos.length === 1) {
            const opcionEncontrada = this.bancos.find(
                (item) => item.banc_Descripcion.toLocaleLowerCase() === query
            );
            if (opcionEncontrada) {
                this.empleado.banc_Id = opcionEncontrada.banc_Id;
                // Actualiza el texto de la propiedad en el empleado
                this.empleado.banco = opcionEncontrada.banc_Descripcion;
            }
        } else {
            this.empleado.banc_Id = 0;
        }
    }
    onBancoSelect(event: any) {
        const bancoSeleccionado = event;
        this.empleado.banc_Id = bancoSeleccionado.value.banc_Id;
        // Actualiza el texto de la propiedad en el empleado
        this.empleado.banco = bancoSeleccionado.value.banc_Descripcion;
    }

    filterCargos(event: any) {
        // Convertir la consulta a minúsculas
        const query = event.query
            ? event.query.toLowerCase()
            : this.empleado.cargo
            ? this.empleado.cargo.toLowerCase()
            : '';
        // Filtrar las opciones que contienen la consulta en su descripción
        this.filtradoCargos = this.cargos.filter((carg) =>
            carg.carg_Descripcion.toLowerCase().includes(query)
        );
        // Si solo hay una coincidencia tras el filtrado
        if (this.filtradoCargos.length === 1) {
            // Buscar una coincidencia exacta en la lista original
            const opcionEncontrada = this.cargos.find(
                (item) => item.carg_Descripcion.toLocaleLowerCase() === query
            );
            // Si se encuentra una coincidencia exacta, actualizar el objeto empleado
            if (opcionEncontrada) {
                // Actualiza el Id de la propiedad en el empleado
                this.empleado.carg_Id = opcionEncontrada.carg_Id;
                // Actualiza el texto de la propiedad en el empleado
                this.empleado.cargo = opcionEncontrada.carg_Descripcion;
                this.asignarFrecuenciaSemanalSiEsJefeDeObra();
            }
        } else {
            this.empleado.carg_Id = 0;
        }
    }
    onCargoSelect(event: any) {
        const cargoSeleccionado = event;
        // Actualiza el Id de la propiedad en el empleado
        this.empleado.carg_Id = cargoSeleccionado.value.carg_Id;
        // Actualiza el texto de la propiedad en el empleado
        this.empleado.cargo = cargoSeleccionado.value.carg_Descripcion;
        this.asignarFrecuenciaSemanalSiEsJefeDeObra();
    }

    filterFrecuencias(event: any) {
        // Convertir la consulta a minúsculas
        const query = event.query
            ? event.query.toLowerCase()
            : this.empleado.frecuencia
            ? this.empleado.frecuencia.toLowerCase()
            : '';

        // Filtrar las frecuencias que contienen la consulta en su descripción
        this.filtradoFrecuencias = this.frecuencias.filter((frec) =>
            frec.frec_Descripcion.toLowerCase().includes(query)
        );

        // Si solo hay una coincidencia tras el filtrado
        if (this.filtradoFrecuencias.length === 1) {
            // Buscar una coincidencia exacta en la lista original
            const opcionEncontrada = this.frecuencias.find(
                (item) => item.frec_Descripcion.toLowerCase() === query
            );

            // Si se encuentra una coincidencia exacta, actualizar el objeto empleado
            if (opcionEncontrada) {
                this.empleado.frec_Id = opcionEncontrada.frec_Id;
                this.empleado.frecuencia = opcionEncontrada.frec_Descripcion;
            }
        } else {
            this.empleado.frec_Id = 0;
        }
    }
    //Lógica cuando selecciona una opción del autocomplete
    onFrecuenciaSelect(event: any) {
        const frecuenciaSeleccionada = event;
        // Actualiza el Id de la propiedad en el empleado
        this.empleado.frec_Id = frecuenciaSeleccionada.value.frec_Id;
        // Actualiza el texto de la propiedad en el empleado
        this.empleado.frecuencia =
            frecuenciaSeleccionada.value.frec_Descripcion;
    }

    //Asigna la frecuencia a Semanal si es JefeDeObra
    asignarFrecuenciaSemanalSiEsJefeDeObra() {
        if (this.empleado.carg_Id === 1) {
            this.empleado.frec_Id = 1;
        } else {
            this.empleado.frec_Id = this.empleado.frec_Id
                ? this.empleado.frec_Id
                : 0;
        }
    }

    // //Solo deja ingresar numeros
    // soloNumerosKeypress($event: any) {
    //     const regex = /^\d*\.?\d*$/;
    //     const input = $event.target.value + $event.key;
    //     if (!regex.test(input)) {
    //         $event.preventDefault();
    //     }
    // }

    // //Solo deja ingresar caracteres válidos para números telefónicos
    // telefonoKeypress($event) {
    //     const regex = /^[+0-9\s\-()]*$/;
    //     const input = $event.target.value + $event.key;
    //     //Si no pasa el test de la regex que evite la actualización de la propiedad
    //     if (!regex.test(input)) {
    //         $event.preventDefault();
    //     }
    // }

    //Valida que el salario sea un número decimal y si el empleado es jefe de obra
    validarSalario(): boolean {
        const regex = /^\d*\.?\d*$/;
        //Si el Id del cargo es igual al del jefe de obra lo omitimos
        if (this.empleado.carg_Id === 1) {
            return true;
        }
        return regex.test(this.empleado.empl_Salario.toString());
    }

    // //Solo deja ingresar números letras
    // soloLetrasKeypress($event: any) {
    //     const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    //     const input = $event.target.value + $event.key;
    //     //Si no pasa el test de la regex que evite la actualización de la propiedad
    //     if (!regex.test(input)) {
    //         $event.preventDefault();
    //     }
    // }

    removerEspaciosInnecesarios(texto: string) {
        return texto.trim().replace(/\s{2,}/g, ' ');
    }

    //Valida que el nombre y el apellido solo contengan letras y espacios
    validarNombre() {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        const esValido = regex.test(this.empleado.empl_Nombre);
        if (!esValido) {
            this.empl_NombreInput.nativeElement.focus();
        }
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        return esValido;
    }

    //Valida que el nombre y el apellido solo contengan letras y espacios
    validarApellido() {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        const esValido = regex.test(this.empleado.empl_Apellido);
        if (!esValido) {
            this.empl_ApellidoInput.nativeElement.focus();
        }
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        return esValido;
    }

    //Solo deja ingresar números enteros
    soloNumerosEnterosKeypress($event: any) {
        const regex = /^\d+$/;
        const input = $event.target.value + $event.key;
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        if (!regex.test(input)) {
            $event.preventDefault();
        }
    }

    handleInput(event: Event, prop?: string) {
        const inputElement = event.target as HTMLInputElement;
        const texto = inputElement.value;

        // Solo permitir letras y un espacio después de cada letra
        if (prop === 'empl_Nombre' || prop === 'empl_Apellido') {
            inputElement.value = texto
                .replace(
                    /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                    ''
                )
                .replace(/\s{2,}/g, ' ')
                .replace(/^\s/, '');
            this.empleado[prop] = inputElement.value;
        }
        if (
            prop === 'empl_DNI' ||
            prop === 'empl_NoBancario' ||
            prop === 'empl_Salario'
        ) {
            // Solo permitir letras y un espacio después de cada letra
            inputElement.value = texto
                .replace(/[^0-9]|(?<=\s)[^0-9]/g, '')
                .replace(/\s{2,}/g, ' ')
                .replace(/^\s/, '');
            if (prop === 'empl_Salario') {
                this.empleado[prop] = parseFloat(inputElement.value);
            } else {
                this.empleado[prop] = inputElement.value;
            }
        }
        if (prop === 'empl_Telefono') {
            // Solo permitir letras y un espacio después de cada letra
            inputElement.value = texto
                .replace(/[^+0-9\s\-()]|(?<=\s)[^+0-9\s\-()]/g, '')
                .replace(/\s{2,}/g, ' ')
                .replace(/^\s/, '');
            this.empleado[prop] = inputElement.value;
        }
        if (prop === 'empl_CorreoElectronico') {
            // Solo permitir letras y un espacio después de cada letra
            inputElement.value = texto
                .replace(/[^a-zA-Z0-9\s@.]|(?<=\s)[^a-zA-Z0-9\s@.]/g, '')
                .replace(/\s{2,}/g, ' ')
                .replace(/^\s/, '');
            this.empleado[prop] = inputElement.value;
        }
        if (prop) {
            if (prop.toLocaleLowerCase().includes('_id')) {
                if (!texto) {
                    this.empleado[prop] = 0;
                    if (prop === 'esta_Id') {
                        this.empleado.ciud_Id = 0;
                        this.empleado.ciudad = '';
                    }
                }
            }
        }
    }

    //No deja pegar caracteres diferentes a los válidos según una regex
    validarPegar(event: ClipboardEvent, prop?: string) {
        const clipboardData = event.clipboardData?.getData('text') || '';
        let allowedTextPattern = /^[a-zñA-ZÑáéíóúÁÉÍÓÚ\s]*$/;
        if (prop === 'empl_DNI') {
            allowedTextPattern = /^[0-9]*$/;
        }
        if (prop === 'empl_Salario') {
            allowedTextPattern = /^[0-9.,]*$/;
        }
        if (prop === 'empl_Telefono') {
            allowedTextPattern = /^[+0-9\s\-()]*$/;
        }
        if (prop === 'empl_CorreoElectronico') {
            allowedTextPattern = /^[a-zA-Z0-9\s@.]*$/;
        }
        if (prop === 'frec_Descripcion') {
            allowedTextPattern = /^[a-zñA-Z0-9ÑáéíóúÁÉÍÓÚ\s\-]*$/;
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

    //Valida que el DNI, teléfono y el no. cuenta sean números
    validarDNI(): boolean {
        const regex = /^\d+$/;
        if (this.empleado.empl_DNI.length !== 13) {
            //Focus al input
            this.empl_DNIInput.nativeElement.focus();
            return false;
        }
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        const esValido = regex.test(this.empleado.empl_DNI);

        //Focus al input
        if (!esValido) {
            this.empl_DNIInput.nativeElement.focus();
        }
        return esValido;
    }

    //Valida que el DNI, teléfono y el no. cuenta sean números
    validarCuenta(): boolean {
        const regex = /^\d+$/;
        //Si no pasa el test de la regex que evite la actualización de la propiedad
        return regex.test(this.empleado.empl_NoBancario);
    }

    // //Sólo deja ingresar caracteres validos para un correo
    // correoValidoKeypress($event: any) {
    //     const regex = /^[a-zA-Z0-9\s@.]+$/;
    //     const input = $event.target.value + $event.key;
    //     //Si no pasa el test de la regex que evite la actualización de la propiedad
    //     if (!regex.test(input)) {
    //         $event.preventDefault();
    //     }
    // }

    //Retorna un booleano que indica si es un número de télefono válido
    validarTelefono(): boolean {
        if (this.empleado.empl_Telefono.startsWith('-')) {
            return false;
        }
        if (this.empleado.empl_Telefono.includes('+')) {
            // console.log(!/\-\d{2,3}/.test(this.empleado.empl_Telefono));
            if (!/\+\d{1,3}\s/.test(this.empleado.empl_Telefono)) {
                return false;
            }
        }
        const regex = /^\+?(\d[\d-. ]+)?(\([\d-. ]+\))?[\d-. ]+\d$/;
        if (this.empleado.empl_Telefono.length < 5) {
            return false;
        }
        return regex.test(this.empleado.empl_Telefono);
    }

    //Retorna un booleano que indica si es un correo válido
    validarCorreo(): boolean {
        if (
            this.empleado.empl_CorreoElectronico.split('@')[0].endsWith('.') ||
            this.empleado.empl_CorreoElectronico.split('@')[0].startsWith('.')
        ) {
            return false;
        }
        if (/\.{2,}/g.test(this.empleado.empl_CorreoElectronico)) {
            return false;
        }
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(this.empleado.empl_CorreoElectronico);
    }

    //Lógica del botón de cancelar
    botonCancelarClick() {
        //Que lo redirija al Index
        this.empleadoService.mostrarPantallaForm = false;
        this.empleadoService.mostrarPantalla('Index');
        //Reseteamos la variable del empleado
        this.empleadoService.empleado = new Empleado(this.usua_Id, new Date());
    }

    //Lógica para guardar un préstamo
    guardar(editar?: boolean) {
        this.submitted = true;
        //VALIDACIONES
        let todosLosCamposLlenos = true;
        if (this.empleado.empl_Id) {
            this.empleado.usua_Modificacion = this.usua_Id;
            this.empleado.empl_FechaModificacion = new Date();
            for (const prop in this.empleado) {
                //Si el cargo tiene el Id del cargo de jefe de obra y el salario está vació no hay problema
                if (prop === 'empl_Salario' && this.empleado.carg_Id === 1) {
                    continue;
                }
                //Omitimos los campos que no necesiten validación, estos se traen por respuesta de la API
                if (
                    prop === 'codigo' ||
                    prop === 'banc' ||
                    prop === 'salario' ||
                    prop === 'salarioPromedio' ||
                    prop === 'cargo' ||
                    prop === 'ciud' ||
                    prop === 'carg' ||
                    prop === 'civi' ||
                    prop === 'frec' ||
                    prop === 'empl_Imagen' ||
                    prop === 'deduccionesJSON' ||
                    prop === 'empl_Prestaciones' ||
                    prop === 'empl_OtrasRemuneraciones' ||
                    prop === 'usua_ModificacionNavigation' ||
                    prop === 'empl_ObservacionActivar' ||
                    prop === 'empl_ObservacionInactivar' ||
                    prop === 'usuaModificacion' ||
                    prop === 'fechaModificacion' ||
                    prop === 'deducciones_Ids' ||
                    prop === 'empl_Estado'
                ) {
                    continue;
                }
                //Si un campo está vacío
                if (!this.empleado[prop]) {
                    todosLosCamposLlenos = false;
                    if (prop === 'empl_DNI') {
                        this.empl_DNIInput.nativeElement.focus();
                    }
                    if (prop === 'empl_Nombre') {
                        this.empl_NombreInput.nativeElement.focus();
                    }
                    if (prop === 'empl_Apellido') {
                        this.empl_ApellidoInput.nativeElement.focus();
                    }
                    // console.log(prop);
                    break;
                }
            }
        } else {
            for (const prop in this.empleado) {
                //Si el cargo tiene el Id del cargo de jefe de obra y el salario está vació no hay problema
                if (prop === 'empl_Salario' && this.empleado.carg_Id === 1) {
                    continue;
                }
                //Omitimos los campos que no necesiten validación, estos se traen por respuesta de la API
                if (
                    prop === 'empl_Id' ||
                    prop === 'salario' ||
                    prop === 'salarioPromedio' ||
                    prop === 'empl_Imagen' ||
                    prop === 'ciud' ||
                    prop === 'frec' ||
                    prop === 'civi' ||
                    prop === 'deduccionesJSON' ||
                    prop === 'usua_ModificacionNavigation' ||
                    prop === 'empl_ObservacionActivar' ||
                    prop === 'empl_ObservacionInactivar' ||
                    prop === 'empl_Prestaciones' ||
                    prop === 'empl_OtrasRemuneraciones' ||
                    prop === 'usua_Modificacion' ||
                    prop === 'codigo'
                ) {
                    continue;
                }
                //Si un campo está vacío
                if (!this.empleado[prop]) {
                    todosLosCamposLlenos = false;
                    if (prop === 'empl_DNI') {
                        this.empl_DNIInput.nativeElement.focus();
                    }
                    if (prop === 'empl_Nombre') {
                        this.empl_NombreInput.nativeElement.focus();
                    }
                    if (prop === 'empl_Apellido') {
                        this.empl_ApellidoInput.nativeElement.focus();
                    }
                    // console.log(prop);
                    break;
                }
            }
        }
        //Verificamos si todos los campos están llenos y validados
        if (
            todosLosCamposLlenos &&
            this.validarDNI() &&
            this.validarNombre() &&
            this.validarApellido() &&
            this.validarTelefono() &&
            this.validarCorreo() &&
            this.validarCuenta() &&
            this.validarSalario()
        ) {
            this.empleado.empl_Nombre = this.removerEspaciosInnecesarios(
                this.empleado.empl_Nombre
            );
            this.empleado.empl_Apellido = this.removerEspaciosInnecesarios(
                this.empleado.empl_Apellido
            );
            this.empleado.empl_Telefono = this.removerEspaciosInnecesarios(
                this.empleado.empl_Telefono
            );
            if (editar) {
                //Ocultamos el modal de confirmación
                this.mostrarModalConfirmacion = true;
            } else {
                /* Asignamos el empleado del servicio igual al empleado del componente
                 para insertarlo luego de seleccionar sus deducciones*/
                this.empleadoService.empleado = { ...this.empleado };
                this.empleadoService.imagen = this.imagen;
                //Nos movemos al tab de deducciones
                this.empleadoService.tabActual = 1;
                //Desbloqueamos el tab de deducciones
                this.empleadoService.tabDeduccionesBloqueado = false;
            }
        }
    }

    // Inserta o edita un empleado
    editarEmpleado() {
        this.ocultarModalConfirmacion();

        this.empleadoService.Editar(this.empleado).subscribe(
            (respuesta: Respuesta) => {
                if (this.isSuccessful(respuesta)) {
                    if (!this.empleado.empl_Imagen || this.imagen) {
                        this.subirImagenYActualizarEmpleado();
                    } else {
                        this.actualizarEmpleadoLocal();
                    }
                } else {
                    this.manejarErrorInsercion(respuesta);
                }
            },
            (error) => this.mostrarErrorAdministrador()
        );
    }

    private ocultarModalConfirmacion() {
        this.mostrarModalConfirmacion = false;
    }

    private isSuccessful(respuesta: Respuesta): boolean {
        return respuesta.code >= 200 && respuesta.code < 300;
    }

    private subirImagenYActualizarEmpleado() {
        this.empleadoService
            .SubirImagen(this.imagen, this.empleado.empl_Id)
            .subscribe(
                (respuestaImagen: Respuesta) => {
                    if (this.isSuccessful(respuestaImagen)) {
                        this.actualizarEmpleadoLocal();
                    } else {
                        this.mostrarErrorAdministrador();
                    }
                },
                (errorImagen) => this.mostrarErrorAdministrador()
            );
    }

    private actualizarEmpleadoLocal() {
        this.submitted = false;
        this.mostrarToastExito('Actualizado con Éxito.');

        this.empleadoService.cargarData();
    }

    private manejarErrorInsercion(respuesta: Respuesta) {
        if (respuesta.data && respuesta.data.codeStatus < 0) {
            const mensajeError =
                respuesta.data.codeStatus === -2
                    ? 'Ya existe un empleado con ese correo.'
                    : 'Ya existe un empleado con esa identidad.';
            this.mostrarToastError(mensajeError);
        } else {
            this.mostrarErrorAdministrador();
        }
    }

    private mostrarToastExito(mensaje: string) {
        this.toastService.toast(Gravedades.success, mensaje);
    }

    private mostrarToastError(mensaje: string) {
        this.toastService.toast(Gravedades.error, mensaje);
    }

    private mostrarErrorAdministrador() {
        this.mostrarToastError(
            'Algo salió mal. Comuníquese con un Administrador.'
        );
    }
}
