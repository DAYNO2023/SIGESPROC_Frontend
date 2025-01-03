import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { MonedaService } from 'src/app/demo/services/servicesgeneral/moneda.service';
import { Moneda } from 'src/app/demo/models/modelsgeneral/monedaviewmodel';
import { DropDownPaises } from 'src/app/demo/models/modelsgeneral/estadoviewmodel ';
import { EstadoService } from 'src/app/demo/services/servicesgeneral/estado.service';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { CookieService } from 'ngx-cookie-service';
import { Pais } from 'src/app/demo/models/modelsgeneral/paisviewmodel';
import { filter } from 'rxjs';

@Component({
    selector: 'app-moneda',
    templateUrl: './moneda.component.html',
    styleUrl: './moneda.component.scss',
    providers: [MessageService],
})
export class MonedaComponent implements OnInit {
    monedas: Moneda[] = []; //propiedad del viewModel
    paises: DropDownPaises[] = []; //propiedad para el ddl de pais
    items: MenuItem[] = []; //Propiedad para mostrar el Menu de acciones
    filtradoPaises: Pais[] = [];

    Index: boolean = true; //propiedad para mostrar el index
    Create: boolean = false; //propiedad para mostrar el crear
    Detail: boolean = false; //propiedad para mostrar el detalle
    Delete: boolean = false; //Propiedad para mostrar el eliminar


    isLoading = false; //propiedad para cargar el spinner
    confirmMonedaDialog: boolean = false; //propiedad para levantar el modal de editar
    confirm: boolean = true; //propiedad de confirmacion para el editar
    form: FormGroup; //Propiedad del formulario
    submitted: boolean = false; //Propiedad que hace la funcion de enviar el formulario
    identity: string = 'Crear'; //Propiedad que hace un identificador entre el crear/editar
    selectedMoneda: any; //Propiedad para seleccionar las valores de la moneda
    id: number = 0; //Propiedad para almacenar el id
    titulo: string = 'Nueva Moneda'; //propiedad para asignar un titulo
    //Detalles
    Datos = [{}];
    detalle_mone_Id: string = '';
    detalle_mone_Nombre: string = '';
    detalle_mone_Abreviatura: string = '';
    detalle_pais_Id: string = '';
    detalle_pais_Nombre: string = '';
    detalle_usuaCreacion: string = '';
    detalle_usuaModificacion: string = '';
    detalle_FechausuaCreacion: string = '';
    detalle_FechausuaModificacion: string = '';

    selectedPais: string = "";
    errorPais:String = "El campo es requerido.";


  /**
     * Constructor para `TerrenoComponent`.
     *  @param   messageService - //Servicio para mostrar Mensajes
     *  @param service - //Servicio para gestionar la moneda
     *  @param servicePais - //Servicio para manejar el pais
     *   @param router - //Router para la navegacion
     *  @param  fb - //servicio que ayuda para el manejo del formulario
     */
    constructor(
        private messageService: MessageService,
        private service: MonedaService,
        private servicePais: EstadoService,
        private router: Router,
        private fb: FormBuilder,
        public globalMoneda: globalmonedaService,
        public cookieService: CookieService,
    ) {

        this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          // Si la URL coincide con la de este componente, forzamos la ejecución
          if (event.urlAfterRedirects.includes('/sigesproc/general/moneda')) {
            // Aquí puedes volver a ejecutar ngOnInit o un método específico
            this.onRouteChange();
          }
        });



        //En este form inicializamos los campos que vamos a utilizar en el formulario
        this.form = this.fb.group({
            mone_Nombre: ['', Validators.required],
            mone_Abreviatura: ['', Validators.required],
            pais_Nombre: ['']
        });
    }

    onPaisSelect(event: any) {
        const paisSeleccionado = event;
        this.form.patchValue({pais_Nombre: paisSeleccionado.value.pais_Nombre})
    }

    filterPais(event: any) {
        const query = event.query.toLowerCase();
        this.filtradoPaises = this.paises.filter((proveedor) =>
          proveedor.pais_Nombre.toLowerCase().includes(query)
        );
      }

      onRouteChange(): void {
        // Aquí puedes llamar cualquier método que desees reejecutar
        this.ngOnInit();
      }

    //Controla el input del prefijo de la moneda
    // prefijoKeypress($event: any) {
    //     const regex = /^[^0-9a-z+\-*/]+$/;
    //     const input = $event.target.value + $event.key;
    //     if (!regex.test(input)) {
    //         $event.preventDefault();
    //     }
    // }

    //No deja ingresar caracteres diferentes a los válidos según una regex
    soloLetrasEspaciosKeypress($event: any) {
        const regex = /^[a-zA-Z\s]+$/;
        const input = $event.target.value + $event.key;
        if (!regex.test(input)) {
            $event.preventDefault();
        }
    }
    //Funcion que valida que se pueda ingresar texto,simbolos y la ñ
    ValidarTextoNumeros(event: KeyboardEvent) {
        const inputElement = event.target as HTMLInputElement;
        const key = event.key;
        if (!/^[a-zA-Z\s Ññ $]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            event.preventDefault();
        }
        if (key === ' ' && inputElement.selectionStart === 0) {
          event.preventDefault();
        }
      }
      //Funcion para validar la longitud..
      validarLongitud(event: KeyboardEvent) {
        const inputElement = event.target as HTMLInputElement;
        if (
            inputElement.value.length >= 3 &&
            event.key !== 'Backspace' &&
            event.key !== 'Tab' &&
            event.key !== 'ArrowLeft' &&
            event.key !== 'ArrowRight'
        ) {
            event.preventDefault();
            return;
        }
        if (
            !/^[a-zA-Z\s]+$/.test(event.key) &&
            event.key !== 'Backspace' &&
            event.key !== 'Tab' &&
            event.key !== 'ArrowLeft' &&
            event.key !== 'ArrowRight'
        ) {
            event.preventDefault();
        }
    }


    ngOnInit(): void {//Hace la primera carga
        this.Listado(); //Carga los datos del listado de moneda
        this.ddlPais(); //Carga los datos del pais
        //Menu de acciones
        this.Index = true;
        this.Create = false;
        this.Detail = false;
        this.Delete = false;


        const token =  this.cookieService.get('Token');
        if(token == 'false'){
          this.router.navigate(['/auth/login'])
        }
        if (!this.globalMoneda.getState()) {

          this.globalMoneda.setState()
        }

        this.items = [
            {
                label: 'Editar',
                icon: 'pi pi-user-edit',
                command: (event) => this.EditarMoneda(),
            },
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: (event) => this.DetalleMoneda(),
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: (event) => this.EliminarMoneda(),
            },
        ];
    }
    //Funcion que carga los datos de la moneda
    Listado() {
        this.isLoading = true;
        this.service.Listar().subscribe(
            (data: any) => {
                this.monedas = data.map((Monedas: any) => ({
                    ...Monedas,
                    mone_FechaCreacion: new Date(
                        Monedas.mone_FechaCreacion
                    ).toLocaleDateString(),
                    mone_FechaModificacion: new Date(
                        Monedas.mone_FechaModificacion
                    ).toLocaleDateString(),
                }));
                this.isLoading = false;
            },
            (error) => {
                this.isLoading = false;
            },
            () => {
                this.isLoading = false;
            }
        );
        //Funcion que carga el drop de paises
        this.servicePais.DropDownPaises().subscribe((response: any) => {
            if (Array.isArray(response)) {
              this.paises = response
                .map((pais: any) => ({
                  ...pais
                }))
                .sort((a, b) => a.pais_Nombre.localeCompare(b.pais_Nombre));
            } else {
              this.paises = [];
            }
          });

    }
    //funcion que cargaba los datos de la moneda con un spinner
    cargarDatos() {
        this.isLoading = true; // Mostrar el spinner
        this.service.Listar().subscribe(
          (data: any) => {
            this.monedas = data.map((Monedas: any) => ({
                ...Monedas,
                mone_FechaCreacion: new Date(
                    Monedas.mone_FechaCreacion
                ).toLocaleDateString(),
                mone_FechaModificacion: new Date(
                    Monedas.mone_FechaModificacion
                ).toLocaleDateString(),
            }));
            this.isLoading = false; // Ocultar el spinner cuando los datos se han cargado
          },
          (error) => {
            this.isLoading = false; // Ocultar el spinner si hay un error
          }
        );

      }
      //Carga los datos del pais
      ddlPais (){
        this.servicePais.DropDownPaises().subscribe((response: any) => {
            this.paises = response.map((pais: any) => ({
                ...pais,
            }));
        });
      }
      //Funcion para el buscar de la tabla
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
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
        this.form.controls['mone_Nombre'].setValue(inputElement.value);
      }

      handleInput2(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const texto = inputElement.value;

        // Solo permitir números, eliminando cualquier espacio
        inputElement.value = texto.replace(/[^0-9]/g, '');

        // Actualizar el valor en el formulario
        this.form.controls['mone_Abreviatura'].setValue(inputElement.value);
      }


    //funcion para seleccionar
    selectMoneda(Moneda: any) {
        this.selectedMoneda = Moneda;
    }
    //Funcion del boton de nuevo
    CrearMoneda() {
        this.Detail = false;
        this.Index = false;
        this.Create = true;
        this.form.reset();
        this.confirm = false;
        this.identity = 'crear';
        this.titulo = 'Nueva';
    }
    //Funcion del boton de cancelar,regresar
    CerrarMoneda() {
        this.Index = true;
        this.Detail = false;
        this.Create = false;
        this.submitted = false;
    }
    //Funcion del boton de editar
    EditarMoneda() {
        this.Detail = false;
        this.Index = false;
        this.Create = true;
        this.confirm = true;
        this.identity = 'editar';
        this.titulo = 'Editar';
        this.form.patchValue({

            mone_Nombre: this.selectedMoneda.mone_Nombre,
            mone_Abreviatura: this.selectedMoneda.mone_Abreviatura,
            pais_Nombre: this.selectedMoneda.pais_Nombre,
        });

      this.detalle_mone_Nombre =  this.selectedMoneda.mone_Nombre;
        this.id = this.selectedMoneda.mone_Id;
    }
    //Funcion de boton de detalle
    DetalleMoneda() {
        this.Index = false;
        this.Create = false;
        this.Detail = true;
        this.detalle_mone_Id = this.selectedMoneda.codigo;
        this.detalle_mone_Nombre = this.selectedMoneda.mone_Nombre;
        this.detalle_mone_Abreviatura = this.selectedMoneda.mone_Abreviatura;
        this.detalle_pais_Id = this.selectedMoneda.pais_Id;
        this.detalle_pais_Nombre = this.selectedMoneda.pais_Nombre;

        this.detalle_usuaCreacion = this.selectedMoneda.usuaCreacion;
        if (this.selectedMoneda.usuaModificacion != null) {
            this.detalle_usuaModificacion =
                this.selectedMoneda.usuaModificacion;
            this.detalle_FechausuaModificacion =
                this.selectedMoneda.mone_FechaModificacion;
        } else {
            this.detalle_usuaModificacion = '';
            this.detalle_FechausuaModificacion = '';
        }

        this.detalle_FechausuaCreacion = this.selectedMoneda.mone_FechaCreacion;

    }
    //Funcion para el eliminar
    EliminarMoneda() {
        this.detalle_mone_Nombre = this.selectedMoneda.mone_Nombre;
        this.id = this.selectedMoneda.mone_Id;
        this.Delete = true;
    }
    //Funcion del guardar
    guardar() {
        this.submitted = true;

        //Traer el id del rol y validar si existe.
    let idPais = this.paises.find(rol => rol.pais_Nombre ===
    this.form.value.pais_Nombre)?.pais_Id ?? 0;
     //Si es diferente a 0 le declaramos que no tendra ninguna validacion

     if (idPais !== 0) {
     this.form.get('pais_Nombre')?.setErrors(null);
     //De lo contrario le decimos si esta vacio para ver decirle que el campo es
     } else if(this.form.value.pais_Nombre == "" ||
    this.form.value.pais_Nombre == null){
     //Puede ser cualquier texto el invalidRoleId
    this.errorPais = "El campo es requerido."
     this.form.get('pais_Nombre')?.setErrors({ 'invalidPaisId': true });
     //Si no es ninguna de las dos es por que tiene texto, pero no existe la opcion
     }else {
     //Puede ser cualquier texto el invalidRoleId
     this.errorPais = "Opción no encontrada."
     this.form.get('pais_Nombre')?.setErrors({ 'invalidPaisId': true });
    }
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        if (!this.confirm) {
            this.insertarMoneda();
        } else if (this.confirm == true) {
            this.confirmMonedaDialog = true;
        }
    }
    //Funcion que maneja la insercion de la moneda
    insertarMoneda() {
        const form2 = this.form.value;

        const moneNombre = form2.mone_Nombre;
        const moneAbreviatura = form2.mone_Abreviatura;


            // Expresión regular: solo permite letras y un solo espacio entre palabras
            const regex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;

            if (!regex.test(moneNombre.trim())) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'El nombre de la moneda es inválido.',
                    life: 3000,
                    styleClass: 'iziToast-custom',
                });
                return;
            }

            if (!regex.test(moneAbreviatura.trim())) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'El nombre de la abreviatura es inválido.',
                    life: 3000,
                    styleClass: 'iziToast-custom',
                });
                return;
            }



        let idPais = this.paises.find(rol => rol.pais_Nombre ===
            this.form.value.pais_Nombre)?.pais_Id ?? 0;
        const modelo: Moneda = {
            mone_Nombre : form2.mone_Nombre.trim(),
            mone_Abreviatura: form2.mone_Abreviatura.trim().toUpperCase(),
            pais_Id: idPais,
            usua_Creacion: parseInt(this.cookieService.get('usua_Id'))
          };


        this.service.Insertar(modelo).subscribe((respuesta: Respuesta) => {

            if (respuesta.success) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Insertado con Éxito.',
                    life: 3000,
                    styleClass: 'iziToast-custom',
                });
                this.Listado();
                this.CerrarMoneda();
                this.confirmMonedaDialog = false;
                this.submitted = false;
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'La moneda ya existe.',
                    life: 3000,
                    styleClass: 'iziToast-custom',
                });
            }
        });
    }
    //Funcion que maneja la actualizacion de la moneda
    editarMoneda() {
        if (!this.selectedMoneda) {
            return;
          }

          const form2 = this.form.value;

          const moneNombre = form2.mone_Nombre;
          const moneAbreviatura = form2.mone_Abreviatura;


            // Expresión regular: solo permite letras y un solo espacio entre palabras
            const regex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;

            if (!regex.test(moneNombre.trim())) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'El nombre de la moneda es inválido.',
                    life: 3000,
                    styleClass: 'iziToast-custom',
                });
                return;
            }

            if (!regex.test(moneAbreviatura.trim())) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'El nombre de la abreviatura es inválido.',
                    life: 3000,
                    styleClass: 'iziToast-custom',
                });
                return;
            }

          let idPais = this.paises.find(rol => rol.pais_Nombre ===
              this.form.value.pais_Nombre)?.pais_Id ?? 0;
          const modelo: Moneda = {
              mone_Id : this.id,
              mone_Nombre : form2.mone_Nombre.trim(),
              mone_Abreviatura: form2.mone_Abreviatura.trim() .toUpperCase(),
              pais_Id: idPais,
              usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
            };

        this.service.Actualizar(modelo).subscribe({
            next: (respuesta: Respuesta) => {

                if (respuesta.success) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Actualizado con Éxito.',
                        life: 3000,
                        styleClass: 'iziToast-custom',
                    });
                    this.Listado();
                    this.CerrarMoneda();
                    this.confirmMonedaDialog = false;
                    this.submitted = false;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'La moneda ya existe.',
                        life: 3000,
                        styleClass: 'iziToast-custom',
                    });

                }
            },
            error: (e) => {
                this.handleError(e);
            }
        });
    }

    handleError(error: any) {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Ocurrió un problema. Por favor, comuníquese con el administrador.',
            life: 3000,
            styleClass: 'iziToast-custom',
        });
    }

    // allowOnlyAlphanumeric(event: any) {
    //     event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    //     .replace(/\s{2,}/g, ' ')
    //     .replace(/^\s/, '');
    // }

    allowCaracteres(event: any) {
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

        // Expresión regular ajustada para bloquear los espacios y caracteres no permitidos
        event.target.value = event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ._-]/g, '');
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

        // Expresión regular ajustada para permitir solo un espacio entre palabras y bloquear caracteres no permitidos
        event.target.value = event.target.value
            // Reemplazar caracteres no permitidos excepto letras, acentos, ñ, guiones, puntos y un solo espacio
            .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ._\-\s]/g, '')
            // Reemplazar múltiples espacios consecutivos por un solo espacio
            .replace(/\s{2,}/g, ' ');
    }

    //Funcion que maneja la eliminacion de la moneda
    Eliminar (){
        // Inicializa variables para el mensaje del servicio
        let severity = 'error';
        let summary = 'Error';

       try{
         this.service.Eliminar(this.id).subscribe(
           (respuesta: Respuesta) => {
           let detail = respuesta.data.messageStatus;
             if (respuesta.code == 200) {
                // Si la eliminación fue exitosa o hay una advertencia
                severity = respuesta.data.codeStatus > 0 ? 'success' : 'warn';
                summary = respuesta.data.codeStatus > 0 ? 'Éxito' : 'Advertencia';

             } else if (respuesta.code == 500){
               // Si hubo un error interno
               severity = 'error';
               summary = 'Error Interno';
             }
             this.ngOnInit();
             this.messageService.add({
               severity,
               summary,
               detail,
               life: 3000
               });
           }
         );

         // Reinicia el componente
         this.ngOnInit();
       }
       catch (error){
         this.messageService.add({ severity: 'error', summary: 'Error Externo', detail: error.message || error, life: 3000, styleClass: 'iziToast-custom', });

       }

       this.Listado();
       this.Delete = false;
       }


}
