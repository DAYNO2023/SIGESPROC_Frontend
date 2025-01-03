import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Actividad } from 'src/app/demo/models/modelsproyecto/actividadviewmodel';
import { ActividadService } from 'src/app/demo/services/servicesproyecto/actividad.service';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { CookieService } from 'ngx-cookie-service';
import { Router, NavigationEnd  } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-actividad',
  templateUrl: './actividad.component.html',
  styleUrls: ['./actividad.component.scss'],
  providers: [MessageService]
})
export class ActividadComponent implements OnInit {
  //#region Variables
  actividades: Actividad[] = [];//variable de tipo Actividades-viewmodel, que almacena el listado de actividades.
  items: MenuItem[] = [];//variable que almacena los items de la lista de acciones por
  Index: boolean = true;//variable que sirve para mostrar el listado principal
  Create: boolean = false;//variable que sirve para mostrar el formulario de crear-editar
  Detail: boolean = false;//variable que sirve para mostrar el apartado de detalles
  Delete: boolean = false;//variable para abrir el modal de editar
  Edit: boolean = false;//Variable para abrir el modal de editar
  Descripcion: string = "";//variable que almacena el nombre de la actividad para mostrarlo mas tarde
  form: FormGroup;//variable de tipo formgroup que almacena los datos de los formularios
  formeditar: any;//variable para enviar el formulario al editar
  submitted: boolean = false;//variable que muestra un error en rojo cuando los campos del formulario estan vacios
  identity = 'Crear';//variable para identificar si se crea o de edita con el formulario
  selectedActividad: Actividad | undefined;//variable que almacena los datos de un campo en especifico de una tabla
  id: number = 0;//variable que almacena el id
  titulo = 'Nueva';//variable que almacena el titulo del formulario crear-editar
  isTableLoading: boolean = false;//variable para mostrar el spinner
  loadedTableMessage: string = "";//variable para almacenar el mensaje de carga

  //#region Detalles
  Datos = [{}];
  detalle_acti_Id: number ;
  detalle_acti_Descripcion: string = '';
  detalle_usuaCreacion: string = '';
  detalle_usuaModificacion: string = '';
  detalle_FechausuaCreacion: string = '';
  detalle_FechausuaModificacion: string = '';
  //#endregion
  //#endregion
  loading: boolean= true;


  constructor(
    private messageService: MessageService,
    private service: ActividadService,
    private fb: FormBuilder,
    public cookieService: CookieService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      acti_Descripcion: ['', Validators.required]
    });

    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/proyecto/actividad')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
  }

  onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar
    this.ngOnInit();
  }

  //accion que se realiza al inicializar el componente
  ngOnInit(): void {

    this.Index = true;
    this.Create = false;
    this.Detail = false;
    this.form.reset();
    this.submitted = false

    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
    this.Listado();

    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.EditarActividad() },
      { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleActividad() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.EliminarActividad() }
    ];
  }

  //accion que entra al backend y devuelve el listado de la tabla
  Listado() {
    this.loading = true;
    this.service.Listar().subscribe(
      (response: Actividad[]) => {
        this.actividades = response;
        if(this.actividades.length === 0){
          this.loadedTableMessage = "No hay actividades existentes aún.";//mensaje que se muestra si no hay registros en la tabla
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
        this.loading = false; // Oculta el loader cuando se completa la carga
    }
    );
  }


  //filtro de barra de busqueda
  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  //despliega el formulario de crear
  CrearActividad() {
    this.Index = false;
    this.Create = true;
    this.Detail = false;
    this.form.reset();
    this.identity = 'crear';
    this.titulo = 'Nueva';
    this.submitted = false
  }

  //pliega la accion activa
  CerrarActividad() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false
  }

  //despliega el formulario de editar llenando los campos del formulario
  EditarActividad() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.identity = 'editar';
    this.titulo = 'Editar';

    if (this.selectedActividad) {
      this.form.patchValue({
        acti_Descripcion: this.selectedActividad.acti_Descripcion
      });
      this.id = this.selectedActividad.acti_Id!;
      this.Descripcion  = this.selectedActividad.acti_Descripcion

    }
  }

  //despliega y setea el detalle de actividad
  DetalleActividad() {
    this.service.Buscar(this.selectedActividad?.acti_Id!).subscribe(
      (actividad: Actividad) => {
        this.Index = false;
        this.Create = false;
        this.Detail = true;
        this.detalle_acti_Id = this.selectedActividad?.codigo;
        this.detalle_acti_Descripcion = actividad.acti_Descripcion;
        this.detalle_usuaCreacion = actividad.usuaCreacion;
        this.detalle_FechausuaCreacion = new Date(actividad.acti_FechaCreacion).toLocaleDateString();
        if (this.selectedActividad.usuaModificacion != null) {
        this.detalle_usuaModificacion = actividad.usuaModificacion;
        this.detalle_FechausuaModificacion = new Date(actividad.acti_FechaModificacion).toLocaleDateString();

        }else{
          this.detalle_usuaModificacion = "";
          this.detalle_FechausuaModificacion = "";
        }
      },
      error => {
   
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener detalles de la actividad.', life: 3000 });
      }
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
    this.form.controls['acti_Descripcion'].setValue(inputElement.value);
  }

// Valida que solo se puedan colocar letras, números y un solo espacio consecutivo en los inputs
ValidarTexto(event: KeyboardEvent) {
  const inputElement = event.target as HTMLInputElement;
  const key = event.key;

  // Limitar a 30 caracteres máximo
  if (inputElement.value.length >= 30 && key !== 'Backspace' && key !== 'Tab') {
    event.preventDefault();
  }

  // Expresión regular mejorada: permite letras, números y espacios, pero no emojis
  if (!/^[a-zñA-ZÑ0-9\s]+$/.test(key) && key !== 'Backspace' && key !== 'Tab') {
    event.preventDefault();
  }

  // Evita espacios al principio
  if (key === ' ' && inputElement.selectionStart === 0) {
    event.preventDefault();
  }

  // Evita múltiples espacios consecutivos
  if (key === ' ' && inputElement.value.endsWith(' ')) {
    event.preventDefault();
  }

  // Expresión regular para bloquear emojis
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
  if (emojiRegex.test(key)) {
    event.preventDefault();
  }
}



  //accion que abre el modal de eliminar y envia el id
  EliminarActividad() {
    if (this.selectedActividad) {
      this.id = this.selectedActividad.acti_Id!;
      this.service.Buscar(this.selectedActividad?.acti_Id!).subscribe(
        (actividad: Actividad) => {
          this.Descripcion = actividad.acti_Descripcion
        }
      )
      this.Delete = true;
    }
  }

  //accion que selecciona un campo de la tabla y llena sus valores en una variable
  onRowSelect(actividad: Actividad) {
    this.selectedActividad = actividad;
  }

  //accion que envia los datos del formulario al insertar o los setean en una variable y lo envian al editar
  //tambien abre el modal de editar
  Guardar() {
    if (this.form.valid) {
      const actividad: Actividad = {
        acti_Id: this.id,
        acti_Descripcion: this.form.value.acti_Descripcion,
        usua_Creacion:parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
      };

      if (this.identity !== 'editar') {

        this.service.Insertar(actividad).subscribe(
          (respuesta: any) => {
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });
              this.Listado();
              this.CerrarActividad();
              this.submitted = false
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: ' La actividad ya existe.', life: 3000 });
              //console.error('Error al insertar:', respuesta);
            }
          },
          error => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comuniquese con un Administrador.', life: 3000 });
            //console.error('Error inesperado al insertar:', error);
          }
        );
      } else {
        this.Edit = true;
        this.formeditar = actividad;

      }
    } else {
      this.submitted = true;
    }
  }

  //accion de confirmar editar donde envia los datos del formulario a la accion de editar en el backend
  EditarG(){
    this.service.Actualizar(this.formeditar).subscribe(
      (respuesta: any) => {
        if (respuesta.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 });
          this.Listado();
          this.CerrarActividad();
          this.submitted = false
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comuniquese con un Administracion.' + respuesta.message, life: 3000 });
          //console.error('Error al actualizar:', respuesta);
        }
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comuniquese con un Administracion.', life: 3000 });
        //console.error('Error inesperado al actualizar:', error);
      }
    );
    this.Edit = false;
  }

  //accion de eliminar, que envia el id al backend
  Eliminar() {
    // Inicializa variables para el mensaje del servicio
  let severity = 'error';
  let summary = 'Error';

  try{
    this.service
        .Eliminar(this.id)
        .subscribe((respuesta: Respuesta) => {
          let detail = respuesta.data.messageStatus;
    
            if (respuesta.code === 200) {
                // Si la eliminación fue exitosa o hay una advertencia
                severity = respuesta.data.codeStatus > 0 ? 'success' : 'warn';
                summary = respuesta.data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
            } else if(respuesta.code === 500){
                  // Si hubo un error interno
                severity = 'error';
                summary = 'Error Interno';
            }
            this.messageService.add({
              severity,
              summary,
              detail,
              life: 3000
              });
        });
      }
      catch (error){
      // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
      this.messageService.add({
        severity: 'error',
        summary: 'Error Externo',
        detail: error.message || error,
        life: 3000
    });

      }
      // Reinicia el componente
      this.Listado();
      this.ngOnInit();
      this.Delete = false;
  }
}
