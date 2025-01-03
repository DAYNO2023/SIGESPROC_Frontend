import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Pais } from 'src/app/demo/models/modelsgeneral/paisviewmodel';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { PaisService } from 'src/app/demo/services/servicesgeneral/pais.service';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';
import { Tree } from 'primeng/tree';

@Component({
  selector: 'app-pais',
  templateUrl: './pais.component.html',
  styleUrls: ['./pais.component.scss'],
  providers: [MessageService]
})
export class PaisComponent implements OnInit {
  pais: Pais[] = []; // Lista de países
  items: MenuItem[] = []; // Opciones del menú contextual
  Index: boolean = true; // Control de visualización de la vista principal
  Create: boolean = false; // Control de visualización de la vista de creación
  Detail = false; // Control de visualización de la vista de detalles
  Delete = false; // Control de visualización de la vista de eliminación
  form: FormGroup; // Formulario reactivo para la creación/edición de países
  submitted: boolean = false; // Indicador de envío del formulario
  identity = 'Crear'; // Identidad del formulario (Crear/Editar)
  selectedPais: Pais | undefined; // País seleccionado para edición/detalle
  id: number = 0; // ID del país seleccionado
  titulo = 'Nuevo'; // Título del formulario


      //USUARIO
      IdUsuario: number = parseInt(this.cookieService.get('usua_Id'));


  paiss: Pais = {usua_Creacion: this.IdUsuario}; // Objeto país para inicialización

  editarPaiss:boolean = false; // Control de visualización de edición de país


  // Detalles del país
  Datos = [{}];
  detalle_pais_Id: string = '';
  detalle_pais_Nombre: string = '';
  detalle_pais_Codigo: string = '';
  detalle_pais_Prefijo: string = '';
  detalle_usuaCreacion: string = '';
  detalle_usuaModificacion: string = '';
  detalle_FechausuaCreacion: string = '';
  detalle_FechausuaModificacion: string = '';

  constructor(
    private messageService: MessageService,
    private service: PaisService,
    private router: Router,
    private fb: FormBuilder,
    private cookieService: CookieService
  ) {

    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/general/pais')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
     
    // Inicializa el formulario reactivo con validaciones
    this.form = this.fb.group({
      pais_Nombre: ['', Validators.required],
      pais_Codigo: ['', Validators.required],
      pais_Prefijo: ['', Validators.required]
    });
  }

  onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar
  
    this.ngOnInit();
  }

  ngOnInit(): void {

    this.Index = true;
    this.Create = false;
    this.Detail = false;

    const token =  this.cookieService.get('Token');
    
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }

    this.cookieService.set('rutActual', '/sigesproc/general/pais')    

    // else{
    //   console.log('Este es la ruta del pais pq el token esta false');
    //   this.router.navigate(['/sigesproc/general/pais']);
    // }

    this.cargarDatos(); // Carga la lista de países al iniciar el componente

    // Opciones del menú contextual
    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.EditarPais() },
      { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetallePais() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.EliminarPais() }
    ];
  }

  /**
   * Obtiene la lista de países desde el servicio.
   */
        loading = false;


            // Subscripcion para traer los datos y setear la tabla del index
        async cargarDatos() {
            this.loading = true;

            try {
                const response: any = await this.service.Listar().toPromise();
                if (response.success && Array.isArray(response.data)) {
                    this.pais = response.data.map((paises: any) => ({
                        ...paises,
                        //Formateamos las fecha creacion y la de modificacion
                        pais_FechaCreacion: new Date(paises.pais_FechaCreacion!).toLocaleDateString(),
                        pais_FechaModificacion: new Date(paises.pais_FechaModificacion!).toLocaleDateString()
                    }));

                } else {
                    this.loading = false; // Oculta el loader cuando se completa la carga

                }
            } catch (error) {
                console.error('Error al obtener datos:', error);
                this.loading = false; // Oculta el loader cuando se completa la carga

            } finally {
                this.loading = false; // Oculta el loader cuando se completa la carga

            }
        }

  /**
   * Filtra los datos de la tabla globalmente.
   * @param table - Referencia a la tabla
   * @param event - Evento del filtro global
   */
  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  /**
   * Abre el formulario para crear un nuevo país.
   */
  CrearPais() {
    this.Index = false;
    this.Create = true;
    this.Detail = false;
    this.form.reset();
    this.identity = 'crear';
    this.titulo = 'Nuevo';
  }

  /**
   * Cierra el formulario de creación/edición y regresa a la vista principal.
   */
  CerrarPais() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
  }

  /**
   * Abre el formulario para editar un país existente.
   */
  EditarPais() {
    if (this.selectedPais) {
      this.detalle_pais_Nombre = this.selectedPais.pais_Nombre;
      this.Detail = false;
      this.Index = false;
      this.Create = true;
      this.identity = 'editar';
      this.titulo = 'Editar';
      this.form.patchValue({
        pais_Nombre: this.selectedPais.pais_Nombre,
        pais_Codigo: this.selectedPais.pais_Codigo,
        pais_Prefijo: this.selectedPais.pais_Prefijo
      });
      this.id = this.selectedPais.pais_Id!;
    }
  }

  /**
   * Valida que solo se ingresen números en el campo.
   * @param event - Evento del teclado
   */
  ValidarNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
        event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
    if (inputElement.value.length >= 3 && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }
  }

  /**
   * Valida que solo se ingresen letras en el campo.
   * @param event - Evento del teclado
   */
  ValidarTexto(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z\s ]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  /**
   * Valida que solo se ingresen letras y números en el campo.
   * @param event - Evento del teclado
   */
  ValidarTextoNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z\s 0-9]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  /**
   * Valida que solo se ingresen letras, números y un máximo de 3 caracteres en el campo de prefijo.
   * @param event - Evento del teclado
   */
  ValidarPrefijo(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;

    if (!/^[a-zA-Z\s 0-9]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
    }

    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }

    if (inputElement.value.length >= 3 && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }
  }

  /**
   * Muestra los detalles de un país seleccionado.
   */
  DetallePais() {
    if (this.selectedPais) {
      this.service.Buscar(this.selectedPais.pais_Id).subscribe(
        (pais: Pais) => {
          this.Index = false;
          this.Create = false;
          this.Detail = true;
          this.detalle_pais_Id = pais.pais_Id!.toString();
          this.detalle_pais_Nombre = pais.pais_Nombre;
          this.detalle_pais_Codigo = pais.pais_Codigo;
          this.detalle_pais_Prefijo = pais.pais_Prefijo;
          this.detalle_usuaCreacion = pais.usuarioCreacion;
          this.detalle_usuaModificacion = pais.usuarioModificacion;
          this.detalle_FechausuaCreacion = new Date(pais.pais_FechaCreacion).toLocaleDateString();
          this.detalle_FechausuaModificacion = pais.pais_FechaModificacion != null ? new Date(pais.pais_FechaModificacion).toLocaleDateString() : "";
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'Comunicarse con un administrador.', life: 3000 });
        }
      );
    }
  }

  /**
   * Abre el diálogo de confirmación para eliminar un país.
   */
  EliminarPais() {
    if (this.selectedPais) {
      this.detalle_pais_Nombre = this.selectedPais.pais_Nombre;
      this.id = this.selectedPais.pais_Id!;
      this.Delete = true;
    }
  }

  /**
   * Selecciona un país de la tabla.
   * @param pais - País seleccionado
   */
  onRowSelect(pais: Pais) {
    this.selectedPais = pais;
  }

  /**
   * Guarda un nuevo país o actualiza uno existente.
   */
  Guardar() {
    if (this.form.valid) {
        // Construimos el objeto que se enviará al backend
        const pais: Pais = {
            pais_Id: this.id,
            pais_Nombre: this.form.value.pais_Nombre,
            pais_Codigo: this.form.value.pais_Codigo,
            pais_Prefijo: this.form.value.pais_Prefijo,
            usua_Creacion: this.IdUsuario,
            usua_Modificacion: this.IdUsuario
        };


        // Si no estamos en modo edición, insertamos
        if (this.identity !== 'editar') {
            this.service.Insertar(pais).subscribe(
                (respuesta: Respuesta) => {

                    // Verificamos si la inserción fue exitosa según el 'success'
                    if (respuesta.success) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            styleClass: 'iziToast-custom',
                            detail: 'Insertado con Éxito.',
                            life: 3000
                        });
                        this.cargarDatos();
                        this.CerrarPais();
                        this.submitted = false;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            styleClass: 'iziToast-custom',
                            detail: respuesta.message || 'Error al insertar el país.',
                            life: 3000
                        });
                    }
                },
                (error) => {
                    // Si ocurre un error en la comunicación con el servidor
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        styleClass: 'iziToast-custom',
                        detail: 'Error al comunicarse con el servidor. Por favor, contacte al administrador.',
                        life: 3000
                    });
                    console.error('Error inesperado al insertar:', error);
                }
            );
        } else {
            // Si estamos en modo edición
            this.editarPaiss = true;
        }
    } else {
        // Si el formulario no es válido
        this.submitted = true;
    }
}



  /**
   * Confirma la edición de un país existente.
   */
  confirmarEditar() {
    // Construimos el objeto que se enviará al backend para la actualización
    const pais: Pais = {
        pais_Id: this.id,  // ID del país que se está editando
        pais_Nombre: this.form.value.pais_Nombre,
        pais_Codigo: this.form.value.pais_Codigo,
        pais_Prefijo: this.form.value.pais_Prefijo,
        usua_Creacion: this.IdUsuario,
        usua_Modificacion: this.IdUsuario  // Usuario que modifica el registro
    };

    // Llamamos al servicio para actualizar el país
    this.service.Actualizar(pais).subscribe(
        (respuesta: Respuesta) => {

            // Verificamos si la API ha devuelto data y codeStatus
            if (respuesta.success && respuesta.data && respuesta.data.codeStatus === 1) {
                // Si todo salió bien (codeStatus === 1), mostramos el mensaje de éxito
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    styleClass: 'iziToast-custom',
                    detail: 'Actualizado con Éxito.',
                    life: 3000
                });
                // Actualizamos los datos en la vista
                this.cargarDatos();
                // Cerramos el formulario
                this.CerrarPais();
                // Reseteamos el estado del formulario
                this.submitted = false;
                this.editarPaiss = false;  // Marcamos que la edición ha finalizado
            } else {
                // Si el codeStatus es -1, -2 o -3, mostramos mensajes específicos
                const codeStatus = respuesta.data?.codeStatus;
                let errorMessage = 'Error al actualizar el país.';

                if (codeStatus === -1) {
                    errorMessage = 'El nombre del país ya existe.';
                } else if (codeStatus === -2) {
                    errorMessage = ' El prefijo del país ya existe.';
                } else if (codeStatus === -3) {
                    errorMessage = 'El código del país ya existe.';
                }

                // Mostramos el mensaje de error correspondiente
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    styleClass: 'iziToast-custom',
                    detail: errorMessage,
                    life: 3000
                });
                console.error('Error al actualizar:', respuesta);
            }
        },
        (error) => {
            // Si ocurre un error en la comunicación con el servidor
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                styleClass: 'iziToast-custom',
                detail: 'Error al comunicarse con el servidor. Por favor, contacte al administrador.',
                life: 3000
            });
            console.error('Error inesperado al actualizar:', error);
        }
    );
}

  /**
   * Elimina un país seleccionado.
   */
  async Eliminar() {
    try {
      // Llama al servicio para eliminar el país y espera la respuesta
      const response = await this.service.Eliminar(this.id);

      const { code, data, message } = response; // Desestructura la respuesta

      // Inicializa variables para el mensaje del servicio
      let severity = 'error';
      let summary = 'Error';
      let detail = data?.messageStatus || message;

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
      this.cargarDatos();
      this.Delete = false;
    } catch (error) {
      // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
      this.messageService.add({
        severity: 'error',
        summary: 'Error Externo',
        styleClass: 'iziToast-custom',
        detail: error.message || error,
        life: 3000
      });

      this.cargarDatos();
      this.Delete = false;
    }
  }

  handleInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let texto = inputElement.value;
    texto = texto.replace(/[^a-zñA-ZÑáéíóúüÁÉÍÓÚÜ\s]/g, '');
    texto = texto.trimStart();
    inputElement.value = texto;
    this.form.controls['cavi_Descripcion'].setValue(texto);
  }
  ManejodeDesenfoque(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let texto = inputElement.value;
    
    if (texto) {
      texto = texto.trimEnd();
      inputElement.value = texto; 
      this.form.controls['pais_Prefijo'].setValue(texto); 
    }
  }

  ManejodeDesenfoque1(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let texto = inputElement.value;
    
    if (texto) {
      texto = texto.trimEnd();
      inputElement.value = texto; 
      this.form.controls['pais_Nombre'].setValue(texto); 
    }
  }


  handleInput1(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    inputElement.value = texto.replace(/[^a-zñA-ZÑáéíóúüÁÉÍÓÚÜ\s]/g, '');
    this.form.controls['pais_Nombre'].setValue(inputElement.value);
  }

  handleInput2(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    inputElement.value = texto.replace(/[^a-zñA-ZÑáéíóúüÁÉÍÓÚÜ\s]/g, '');
    this.form.controls['pais_Codigo'].setValue(inputElement.value);
  }

  handleInput3(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    inputElement.value = texto.replace(/[^a-zñA-ZÑáéíóúüÁÉÍÓÚÜ\s]/g, '');
    this.form.controls['pais_Prefijo'].setValue(inputElement.value);
  }

}
