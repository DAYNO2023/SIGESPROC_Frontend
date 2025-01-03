import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { TipoProyectoService } from 'src/app/demo/services/servicesgeneral/tipoproyecto.service';
import { CookieService } from 'ngx-cookie-service';
import { fi } from 'date-fns/locale';
import { fakeAsync } from '@angular/core/testing';
import { parse } from 'date-fns';
import { filter } from 'rxjs';

@Component({
  selector: 'app-tipoproyecto',
  templateUrl: './tipoproyecto.component.html',
  styleUrl: './tipoproyecto.component.scss'
})
export class TipoproyectoComponent implements OnInit {

  tipoproyecto: any[] = []; // Lista de tipos de proyectos obtenida del servicio
  items: MenuItem[] = []; // Opciones del menú contextual
  Index: boolean = true; // Control de visualización de la vista principal
  Create: boolean = false; // Control de visualización de la vista de creación
  Detail: boolean = false; // Control de visualización de la vista de detalle
  modalEliminar: boolean = false; //Muestra el modal para confirmar la eliminación
  modalEditar: boolean = false; //Muestra el modal para confirmar la actualización
  cargando: boolean = false; // Indicador de carga de datos
  form: FormGroup; // Formulario para la creación y edición de cargos
  submitted: boolean = false; // Indicador de si el formulario ha sido enviado
  id: number = 0; // Identificador del cargo seleccionado
  titulo: string = "Nuevo"; // Título de la vista
  llenadoFila: any; //Información de la fila seleccionada
  // Detalles
  Datos = [{}]; // Datos de detalle
  detalle_tipr_Id: string = ""; // Identificador del cargo en detalle
  detalle_tipr_Descripcion: string = ""; // Descripción del cargo en detalle
  detalle_usuaCreacion: string = ""; // Usuario que creó el tipo de proyecto
  detalle_usuaModificacion: string = ""; // Usuario que modificó el tipo de proyecto
  detalle_FechausuaCreacion: string = ""; // Fecha de creación del tipo de proyecto
  detalle_FechausuaModificacion: string = ""; // Fecha de modificación del tipo de proyecto
  descripcion: string = ""; // Descripción del tipo de proyecto seleccionado
  
  constructor(
    private messageService: MessageService,
    private service: TipoProyectoService,
    private router: Router,
    private fb: FormBuilder,
    private cookieService: CookieService

  )
   {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/general/tiposdeproyecto')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
    
    this.form = this.fb.group({
      tipr_Descripcion: ['', Validators.required] // Inicialización del formulario
    });
  }

  onRouteChange(): void {
    this.Index = false;
    this.cargando = true;
    this.Create = false;
    this.Detail = false;
    this.ngOnInit();
    this.Index = true;
    this.cargando = false;
  }

  ngOnInit(): void {

    this.Listado(); //Llamada a la función para cargar el listado cuando se carga la página
    const token = this.cookieService.get('Token');
    if (token === 'false') {
        this.router.navigate(['/auth/login']);
    }

    //Cargamos las opciones que tendra el menu de acciones en la tabla principal
    this.items = [
      {
          label: 'Editar',
          icon: 'pi pi-user-edit',
          command: () => (this.Editar())
      },
      {
          label: 'Detalle',
          icon: 'pi pi-eye',
          command: () => (this.Detalle())
      },
      {
          label: 'Eliminar',
          icon: 'pi pi-trash',
          command: (event) => (this.MostrarEliminar()),
      },
  ];
  }
  
  //Hace la petición al servicio para listar todos los tipos de proyecto
  async Listado(){
    this.cargando = true;
    await this.service.Listar().then(
      (data: any) =>{
        //Obtiene todo el listado
        this.tipoproyecto = data;
        this.cargando = false;
      }
      
    )

  }

  //Función para crear un nuevo tipo de proyecto
  async Crear(){
    this.Index = false; //Ocultamos la tabla principal
    this.Create = true; //Mostramos el formulario para crear un nuevo tipo de proyecto
    this.form.reset(); //Limpiamos el formulario
    this.submitted = false; //Ocultamos el mensajes 'El campo es requerido.'
    this.titulo = 'Nuevo'; //Especificamos que se va a crear un nuevo tipo de proyecto
  }

  //Función para editar un tipo de proyecto
  Editar(){
    this.titulo = 'Editar'; //Especificamos que se va a editar un tipo de proyecto
    this.Index = false; //Ocultamos la tabla principal
    this.Create = true; //Mostramos el formulario
    this.submitted = false; //Ocultamos el mensaje de 'El campo es requerido'
    this.form.patchValue({tipr_Descripcion: this.llenadoFila.tipr_Descripcion}) //Llenamos la informacion del formulario
  }

  //Función para cerrar el formulario
  Cerrar(){
    this.Index = true; //Mostramos la tabla principal
    this.Create = false; //Ocultamos el formulario
    this.Detail = false; //Ocultamos el detalle
    this.submitted = false; //Ocultamos el mensajes 'El campo es requerido.'
  }

  //Función para boton de guardar
  Guardar(){
    //Verifica si el formulario es valido
    if(this.form.valid){
      //Verifica si estamos haciendo un nuevo tipo de proyecto
      if(this.titulo === 'Nuevo'){
        this.Insertar();
      }
      //Mostramos el mensaje de confirmación para editar el tipo de proyecto
      else{
        this.modalEditar = true;
      }
    }else{
      //Muestra el mensaje de 'El campo es requerido.'
      this.submitted = true;
    }
  }

  //Función para cargar la información de la fila seleccionada
  onRowSelect(fila: any){
    this.llenadoFila = fila;
  }

  //Función para hacer la petición al servicio para crear el nuevo tipo de proyecto
  async Insertar(){
    this.cargando = true;
    //Llenamos el objeto con la información que se enviara al servicio
    const Modelo = {
      tipr_Descripcion: this.form.value.tipr_Descripcion,
      usua_Creacion: parseInt(this.cookieService.get('usua_Id'))
    }
    await this.service.Insertar(Modelo).then(
      async response => {
        //Verificamos si la respuesta del servicio es correcta
        if(response.code == 200){
          //Mostramos el mensaje indicando que se guardo correctamente
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Insertado con Éxito.',
            life: 3000,
        });
        //Volvemos a cargar el listado de los tipos de proyectos para que se reflejen los cambios
        await this.Listado();

        //Mostramos la tabla principal y ocultamos el formulario
        this.Create = false;
        this.Index = true;

        this.cargando = false;
        }else{
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'El tipo de proyecto ya existe.',
            life: 3000,
        });
        this.cargando = false;

        }
      },error => {}
    )
  }

  //Función para hacer la petición al servicio para actualizar el tipo de proyecto
  async Actualizar(){
    this.cargando = true;

    //Llenamos el objeto con la información que se enviara al servicio
    const Modelo = {
      tipr_Id: this.llenadoFila.tipr_Id,
      tipr_Descripcion: this.form.value.tipr_Descripcion,
      usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
    }
    await this.service.Actualizar(Modelo).then(
      async response => {
        //Verificamos si la respuesta del servicio es correcta
        if(response.code == 200){
              //Mostramos el mensaje indicando que se actualizó correctamente
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Actualizado con Éxito.',
                life: 3000,
            });

            //Volvemos a cargar el listado de los tipos de proyectos para que se reflejen los cambios
            await this.Listado();

            //Mostramos la tabla principal, ocultamos el formulario y el modal de confirmar editar
            this.modalEditar = false;
            this.Create = false;
            this.Index = true;
            this.cargando = false;
        }else{
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'El tipo de proyecto ya existe.',
            life: 3000,
        });
        this.cargando = false;
        this.modalEditar = false;

        }
      },error => {}
    )
  }

   // Método para eliminar un tipo de proyecto existente
  async Eliminar() {
    this.cargando = true;
    try {
      // Llama al servicio para eliminar y espera la respuesta
      const response = await this.service.Eliminar(this.llenadoFila.tipr_Id);

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
        this.modalEliminar = false;
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
        detail: error.message || error,
        life: 3000
      });
    }
  }

  Detalle(){
    this.Index = false;
    this.Detail = true;
    this.titulo = 'Detalle';
    this.detalle_tipr_Id = this.llenadoFila.row;
    this.detalle_tipr_Descripcion = this.llenadoFila.tipr_Descripcion;
    this.detalle_usuaCreacion = this.llenadoFila.usuaCreacion;
    this.detalle_usuaModificacion = this.llenadoFila.usuaModificacion;
    this.detalle_FechausuaCreacion = new Date(this.llenadoFila.tipr_FechaCreacion).toLocaleDateString();
    this.detalle_FechausuaModificacion = this.llenadoFila.tipr_FechaModificacion ? new Date(this.llenadoFila.tipr_FechaModificacion).toLocaleDateString() : '';
  }

  //Función para mostrar la confirmación para eliminar
  MostrarEliminar(){
  //Muestra el modal de confirmación para eliminar un tipo de proyecto
    this.modalEliminar = true;
    this.form.patchValue({tipr_Descripcion: this.llenadoFila.tipr_Descripcion})
  }

    /**
   * Filtra los datos de la tabla globalmente.
   * @param table - Referencia a la tabla
   * @param event - Evento del filtro global
   */
    onGlobalFilter(table: any, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

  //validación para poder insertar letras con o sin tildes y numeros
  ValidarTextoNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
  
    if (key === ' ' && inputElement.selectionStart === 0) {
    event.preventDefault();
    }
  }
  allowObservacion(event: any) {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');
  }
  //Función para que no se perimita ingresar caracteres especiales
  handleInput1(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;
    if(texto == ''){
      this.form.patchValue({tipr_Descripcion: ''}); 
    }
    else{
      this.form.patchValue({tipr_Descripcion : inputElement.value})
    }
    inputElement.value = texto.replace(/[^a-zñA-ZÑáéíóúüÁÉÍÓÚÜ\s]/g, '');
  }
}
