import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { filter } from "rxjs";
import { ciudad } from "src/app/demo/models/modelsgeneral/ciudadviewmodel";
import { Cliente } from "src/app/demo/models/modelsgeneral/clienteviewmodel";
import { Estado } from "src/app/demo/models/modelsgeneral/estadoviewmodel";
import { Pais } from "src/app/demo/models/modelsgeneral/paisviewmodel";
import { TipoProyecto } from "src/app/demo/models/modelsgeneral/tipoproyectoviewmodel";
import { Proyecto } from "src/app/demo/models/modelsproyecto/proyectoviewmodel";
import { NavigationStateService } from "src/app/demo/services/navigationstate.service";
import { ciudadService } from "src/app/demo/services/servicesgeneral/ciudad.service";
import { ClienteService } from "src/app/demo/services/servicesgeneral/cliente.service";
import { EstadoService } from "src/app/demo/services/servicesgeneral/estado.service";
import { PaisService } from "src/app/demo/services/servicesgeneral/pais.service";
import { TipoProyectoService } from "src/app/demo/services/servicesgeneral/tipoproyecto.service";
import { ProyectoService } from "src/app/demo/services/servicesproyecto/proyecto.service";
import { SharedService } from "src/app/demo/services/shared.service";
import { CookieService } from "ngx-cookie-service";
import { Frecuencia, FrecuenciaDDL } from "src/app/demo/models/modelsplanilla/frecuenciaviewmodel";
import { FrecuenciaService } from "src/app/demo/services/servicesplanilla/frecuencia.service";

/**
 * `ProyectoChildDatosGeneralesComponent` gestiona la visualización y edición de los datos generales de un proyecto.
 * Permite la selección de países, estados, ciudades y clientes, así como la actualización o creación de un proyecto.
 */
@Component({
    templateUrl: './proyectochild-datosgenerales.component.html',
})
export class ProyectoChildDatosGeneralesComponent implements OnInit {
    @ViewChild('guardarButton') guardarButton!: ElementRef<HTMLButtonElement>;

    // Propiedades del componente
    isLoading: boolean = false; /** Estado de carga del componente */

    submitted: boolean = false;  // Indicador de si el formulario ha sido enviado

    /** Estado del diálogo de edición de proyecto */
    editarProyectoDialog: boolean = false;

    blinkIntervalId!: any;  // Identificador del intervalo para el parpadeo del botón de guardar

    proyecto: Proyecto = {};  // Objeto del proyecto actual

    proyectos: Proyecto[] = [];

    exists: boolean = false;

    tiposProyecto: TipoProyecto[] = [];

    filteredTiposProyecto: any[] = []; // Lista filtrada de tipos de proyectos para autocompletar

    ciudades: ciudad[] = [];  // Lista de ciudades
    filteredCiudades: any[] = [];  // Lista filtrada de ciudades para autocompletar

    estados: Estado[] = [];  // Lista de estados
    filteredEstados: any[] = [];  // Lista filtrada de estados para autocompletar

    paises: Pais[] = [];  // Lista de países

    clientes: Cliente[] = [];  // Lista de clientes
    filteredClientes: any[] = [];  // Lista filtrada de clientes para autocompletar

    frecuencias: FrecuenciaDDL[] = [];
    filteredFrecuencias: any[] = [];

    usua_Id: string = "";

    defaultDatabaseDate = new Date('1920-01-01')
    isOptionEstadoNotFound: boolean;
    isOptionCiudadNotFound: boolean;
    isOptionFrecuenciaNotFound: boolean;
    isOptionClienteNotFound: boolean;
    isOptionTipoProyectoNotFound: boolean;

    /**
     * Constructor para `ProyectoChildDatosGeneralesComponent`.
     * @param tiposProyectoService - Servicio para gestionar tipos de proyecto
     * @param ciudadService - Servicio para gestionar ciudades
     * @param estadoService - Servicio para gestionar estados
     * @param paisService - Servicio para gestionar países
     * @param proyectoService - Servicio para gestionar proyectos
     * @param clienteService - Servicio para gestionar clientes
     * @param navigationStateService - Servicio para gestionar el estado de navegación
     * @param sharedService - Servicio para vincular acciones del speed dial
     * @param messageService - Servicio para mostrar mensajes
     * @param router - Router para navegación
     */
    constructor(
        private tiposProyectoService: TipoProyectoService,
        private ciudadService: ciudadService,
        private estadoService: EstadoService,
        private paisService: PaisService,
        private proyectoService: ProyectoService,
        private clienteService: ClienteService,
        private navigationStateService: NavigationStateService,
        private sharedService: SharedService,
        private messageService: MessageService,
        private router: Router,
        private cookieService: CookieService,
        private frecuenciaService: FrecuenciaService,
        private cdr: ChangeDetectorRef,
    ){}

    /**
     * Inicializa el componente, suscribiéndose a eventos y cargando los datos iniciales.
     */
    async ngOnInit() {
        this.isLoading = true;
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

        // Carga inicial de países, estados y clientes
        await this.tiposProyectoService.Listar()
            .then((data) => { this.tiposProyecto = data; 
            });

        await this.paisService.Listar2()
          .then((data) => { this.paises = data;});

        await this.estadoService.DropDownEstadosByCountry2(this.paises.find(pais => pais.pais_Nombre === 'Honduras').pais_Id)
          .then(data => this.estados = data);

        await this.clienteService.Listar()
            .subscribe((data) => { this.clientes = data; });

            this.frecuenciaService.ddl().subscribe(
                (data: FrecuenciaDDL[]) => {
                    this.frecuencias = data.sort((a,b)=>a.frec_Descripcion.localeCompare(b.frec_Descripcion));
                },
                (error) => {
                    //Si es un error del sistema que se comunique con un administrador
                    // this.toastService.toast(
                    //     Gravedades.error,
                    //     'Algo salió mal. Comuníquese con un Administrador.'
                    // );
                }
            );    
        // Obtiene el estado de navegación y carga el proyecto si está disponible
        const navigationState = this.navigationStateService.getState();

        if (navigationState && navigationState.proyecto) {
            this.proyecto = navigationState.proyecto;

            // Filtra estados y ciudades si el proyecto tiene un usuario de modificación
            if (navigationState.proyecto?.usua_Modificacion) {
                await this.filtrarCiudades();
            }
        }

        if (navigationState && navigationState.proyectos) {
            this.proyectos = navigationState.proyectos;
        }

        this.isLoading = false;
    }

    /**
     * Guarda los datos generales del proyecto.
     * Si el proyecto ya existe, lo actualiza; de lo contrario, lo crea.
     */
    async guardarDatosGenerales() {
        this.submitted = true;
        clearInterval(this.blinkIntervalId);
        
        if ((this.proyecto.tipr_Descripcion?.trim() && 
            this.proyecto.proy_Nombre?.trim() && 
            this.proyecto.proy_Descripcion?.trim() &&
            this.proyecto.proy_FechaInicio?.toString() && 
            this.proyecto.proy_FechaFin?.toString() &&
            this.proyecto.clie_NombreCompleto?.trim() &&
            this.proyecto.esta_Nombre?.trim() &&
            this.proyecto.ciud_Descripcion?.trim() &&
            this.proyecto.proy_DireccionExacta?.trim()) 
                && 
            this.proyectos.find((p) => p.proy_Id !== this.proyecto.proy_Id && p.proy_Nombre === this.proyecto.proy_Nombre) === undefined) {
            
            try {
                let response;

                // Encuentra el tipo, la ciudad y el cliente correspondientes

                this.proyecto.tipr_Id = this.tiposProyecto.find(tipoProyecto => tipoProyecto.tipr_Descripcion === this.proyecto.tipr_Descripcion)?.tipr_Id;
                
                this.proyecto.frec_Id = this.frecuencias.find(frecuencia => frecuencia.frecuencia === this.proyecto.frecuencia)?.frec_Id || null;

                this.proyecto.ciud_Id = this.ciudades.find(ciudad => ciudad.ciud_Descripcion === this.proyecto.ciud_Descripcion)?.ciud_Id || null;

                let foundCliente = this.clientes.find(cliente => cliente.cliente === this.proyecto.clie_NombreCompleto)
                    this.proyecto.clie_Id = foundCliente?.clie_Id || null;

                // Actualiza o crea el proyecto
                if (this.proyecto.proy_Id) {
                    if(this.editarProyectoDialog){
                        this.editarProyectoDialog = false;

                        response = await this.proyectoService.Actualizar(this.proyecto);
                    }else{
                        this.editarProyectoDialog = true;
                    }
                } else {
                    response = await this.proyectoService.Insertar(this.proyecto);
                    if (response && response.data && response.data.codeStatus) {
                        this.proyecto.proy_Id = response.data.codeStatus;
                    }
                }
                
                // Muestra un mensaje de éxito o advertencia basado en la respuesta
                if(response){
                    this.messageService.add({
                        severity: response.code == 200 ? 'success' : 'warn',
                        summary: response.code == 200 ? 'Éxito' : 'Advertencia',
                        styleClass: 'iziToast-custom',
                        detail: response.data?.messageStatus || response.message,
                        life: 3000
                    });
                }

                // Actualiza el estado de navegación si la respuesta fue exitosa
                if (response?.code == 200) {
                    this.proyecto = { ...this.proyecto, usua_Modificacion: parseInt(this.usua_Id) };
                    
                    this.proyecto.frecuencia = this.frecuencias.find((x) => x.frec_Descripcion === 'Mensual')?.frecuencia || null;
                    this.navigationStateService.setState( 'proyecto', this.proyecto );
                }

            } catch (error) {
                // Muestra un mensaje de error en caso de excepción
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error Externo',
                    detail: error.message || error,
                    life: 3000
                });
            }
        }else if(this.proyectos.find((p) => p.proy_Nombre === this.proyecto.proy_Nombre) !== undefined){
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                styleClass: 'iziToast-custom',
                detail: 'El nombre de ese proyecto ya existe.',
                life: 3000
            });
        }
    }

    /**
     * Limpia el formulario y restablece el estado del proyecto.
     */
    buttonLimpiar() {
        if (this.proyecto.proy_Id) {
            this.proyecto = { proy_Id: this.proyecto.proy_Id, usua_Modificacion: parseInt(this.usua_Id) };
        } else {
            this.proyecto = { usua_Creacion: parseInt(this.usua_Id) };
        }
        this.ciudades = [];
        this.submitted = false;
    }

    /**
     * Navega a la siguiente sección del proyecto o muestra un efecto de parpadeo si el formulario fue enviado.
     */
    siguiente() {
        const navigationState = this.navigationStateService.getState();

        if (this.proyecto.proy_Id) {
            this.router.navigate(['/sigesproc/proyecto/proyecto/etapas']);
        } else if (this.submitted) {
            this.blinkIntervalId = setInterval(() => {
                this.guardarButton.nativeElement.focus();
                setTimeout(() => {
                    this.guardarButton.nativeElement.blur();
                }, 500);
            }, 1000);
        } else {
            this.submitted = true;
        }
    }

    // Método para cerrar el componente (comentado actualmente)
    // cerrar(){
    //     this.navigationStateService.clearState();
    //     this.router.navigate(['/sigesproc/proyecto/proyecto'], { queryParams: { reset: true } });
    // }

    /**
     * Filtra la lista de ciudades basada en el estado seleccionado en el proyecto.
     */
    async filtrarCiudades() {
        const id = this.estados.find(estado => estado.esta_Nombre === this.proyecto.esta_Nombre)?.esta_Id || null;
        if(id){
            await this.ciudadService.DropDownByState2(id)
            .then(data => this.ciudades = data);
        }

        const foundoption = this.estados.some(x => x.esta_Nombre === this.proyecto.esta_Nombre);
        this.isOptionEstadoNotFound = !foundoption;
    }

    /**
     * Filtra la lista de tipos de proyectos para autocompletar.
     * @param event - Evento que contiene el texto de búsqueda
     */
    filterTipoProyecto(event: any) {
        const filtered: any[] = [];
        const query = event.query.toLowerCase();
        for (let i = 0; i < this.tiposProyecto.length; i++) {
            const tipoProyecto = this.tiposProyecto[i];
            if (tipoProyecto.tipr_Descripcion.toLowerCase().indexOf(query) == 0) {
                filtered.push(tipoProyecto.tipr_Descripcion);
            }
        }

        this.filteredTiposProyecto = filtered.sort((a, b) => a.localeCompare(b));
    }

    detectTipoProyecto(){
        const foundoption = this.tiposProyecto.some(x => x.tipr_Descripcion === this.proyecto.tipr_Descripcion);
        this.isOptionTipoProyectoNotFound = !foundoption;
    }

    /**
     * Filtra la lista de clientes basada en la consulta del usuario.
     * @param event - Evento que contiene la consulta para el filtro
     */
    filterClientes(event: any) {
        const filtered: any[] = [];
        const query = event.query.toLowerCase();
        for (let i = 0; i < this.clientes.length; i++) {
            const cliente = this.clientes[i];
            if (cliente.cliente.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(cliente.cliente);
            }
        }

        this.filteredClientes = filtered.sort((a, b) => a.localeCompare(b))
    }

    detectCliente(){
        const foundoption = this.clientes.some(x => x.cliente === this.proyecto.clie_NombreCompleto);
        this.isOptionClienteNotFound = !foundoption;
    }

    /**
     * Filtra la lista de estados basada en la consulta del usuario.
     * @param event - Evento que contiene la consulta para el filtro
     */
    filterEstados(event: any) {
        const filtered: any[] = [];

        const query = event.query.toLowerCase();
        for (let i = 0; i < this.estados.length; i++) {
            const estado = this.estados[i];
            if (estado.esta_Nombre.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(estado.esta_Nombre);
            }
        }

        this.filteredEstados = filtered.sort((a, b) => a.localeCompare(b));
    }

    filterFrecuencias(event: any) {
        const filtered: any[] = [];
        const query = event.query.toLowerCase();

        for (let i = 0; i < this.frecuencias.length; i++) {
            const frecuencia = this.frecuencias[i];
            if (frecuencia.frecuencia.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(frecuencia.frecuencia);
            }
        }

        this.filteredFrecuencias = filtered.sort((a, b) => a.localeCompare(b));
    }

    detectFrecuencia(){
        const foundoption = this.frecuencias.some(x => x.frecuencia === this.proyecto.frecuencia);
        this.isOptionFrecuenciaNotFound = !foundoption;
    }

    /**
     * Filtra la lista de ciudades basada en la consulta del usuario.
     * @param event - Evento que contiene la consulta para el filtro
     */
    filterCiudades(event: any) {
        const filtered: any[] = [];

        const query = event.query.toLowerCase();
        for (let i = 0; i < this.ciudades.length; i++) {
            const ciudad = this.ciudades[i];
            if (ciudad.ciud_Descripcion.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(ciudad.ciud_Descripcion);
            }
        }

        this.filteredCiudades = filtered.sort((a, b) => a.localeCompare(b));
    }

    detectCiudad(){
        const foundoption = this.ciudades.some(x => x.ciud_Descripcion === this.proyecto.ciud_Descripcion);
        this.isOptionCiudadNotFound = !foundoption;
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

    existeNombre(){
        this.exists = false;

        if(this.proyectos.find((p) => p.proy_Id !== this.proyecto.proy_Id && p.proy_Nombre === this.proyecto.proy_Nombre) !== undefined){
            this.exists = true;
        }
    }
}
