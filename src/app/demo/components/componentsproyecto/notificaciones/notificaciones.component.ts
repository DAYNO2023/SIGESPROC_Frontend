import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, MenuItem } from 'primeng/api';
import { NotificacionesService } from 'src/app/demo/services/servicesproyecto/notificacion.service';
import { Notificaciones } from 'src/app/demo/models/modelsproyecto/notificacionesviewmodel';
import { Pantalla } from 'src/app/demo/models/modelsacceso/pantallaviewmodel';
import { NotificationFlutterPushService, NotificacionFlutterPush } from 'src/app/demo/services/notificacionservice/notificacionflutter.service';
import { Usuario } from 'src/app/demo/models/modelsacceso/usuarioviewmodel';
import { Table } from 'primeng/table';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { DatePipe } from '@angular/common';
import { NotificacionUpdateService } from 'src/app/demo/services/servicesproyecto/Notificacionactualizar.service'; // Ajusta la ruta según tu proyecto
import { NotificationManagerService } from 'src/app/demo/services/notificacionservice/NotificacionGlobal.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, NavigationEnd  } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})
export class NotificacionesComponent {
  //#region variables
   // Formulario reactivo para gestionar los datos de la notificación
   form: FormGroup;

   // Indica si el formulario ha sido enviado para activar validaciones
   submitted: boolean = false;

   // Controla el estado del interruptor para redirigir a una pantalla específica
   redirigirPantalla: boolean = false;

   // Lista filtrada de tipos de notificación disponibles
   TipoNotiFill: any[] | undefined;

   // Lista de notificaciones obtenidas del servicio
   Notificacion: Notificaciones[] = [];

   // Lista completa de pantallas disponibles para redirigir
   Pantalla: Pantalla[] = [];

   // Controla si todos los usuarios están seleccionados en la tabla
   allSelected: boolean = false;

   // Lista de usuarios disponibles para enviar notificaciones
   usuario: Usuario[] = [];

   // Mensaje mostrado cuando la tabla ha cargado pero no hay datos disponibles
   loadedTableMessage: string = "";

   // Lista filtrada de pantallas basada en la búsqueda del usuario
   PantallasFill: any[] | undefined;

   // Indica si los datos están en proceso de carga para mostrar un spinner
   loading: boolean = true;

   // Controla la visualización de la sección de detalles de una notificación
   detalles: boolean = false;

   // Controla la visualización de la vista principal (lista de notificaciones)
   Index: boolean = true;

   // Controla la visualización del formulario para crear una nueva notificación
   create: boolean = false;

   // Controla la visualización del diálogo de confirmación para eliminar una notificación
   confirmacionVisible: boolean = false;

   // Controla la visualización del diálogo de confirmación para notificaciones específicas
   confirmNotiDialog: boolean = false;

   // Opciones del menú contextual para acciones en cada notificación
   items: MenuItem[] = [];

   // Datos de auditoría (posiblemente para seguimiento de cambios)
   auditoria = [{}];

   // ID de la notificación seleccionada en la tabla
   SelectNotificacion: number | null = null;

   // Objeto que almacena las notificaciones seleccionadas para eliminar
   selectedNotifiacionesEliminar: any;

   // ID del usuario actualmente autenticado, obtenido de la sesión
   usua_Id: number;
   rowsPerPage = 10;
   // Propiedades para mostrar detalles específicos de una notificación
   detalle_codigo: number | undefined;
   detalle_Descripcion: string | undefined;
   detalle_Ruta: string | undefined;
   detalle_usuaModificacion: string | undefined;
   detalle_noti_FechaCreacion: string | undefined;
   detalle_noti_FechaModificacion: string | undefined;
   detalle_usuaCreacion: string | undefined;

   // ID genérico utilizado para diversas operaciones
   id: number = 0;

   // Lista de notificaciones detalladas asociadas a una notificación específica
   detalle_Notificaciones: Notificaciones[] = [];

   Error_Pantalla: string | null = null;
//#endregion

   /**
    * Constructor del componente donde se inyectan los servicios necesarios y se inicializa el formulario.
    * @param fb FormBuilder para crear formularios reactivos.
    * @param messageService Servicio para mostrar mensajes de éxito o error.
    * @param servicePush Servicio para enviar notificaciones push a dispositivos.
    * @param service Servicio personalizado para gestionar notificaciones.
    * @param notificacionUpdateService Servicio para emitir eventos cuando se actualizan notificaciones.
    */
   constructor(
     private fb: FormBuilder,
     private messageService: MessageService,
     private servicePush: NotificationFlutterPushService,
     private service: NotificacionesService,
     private notificacionUpdateService: NotificacionUpdateService,
     private notificationManagerService: NotificationManagerService,
     public cookieService: CookieService,
     private router: Router,
   ) {
     // Inicialización del formulario con sus campos y validaciones
     this.form = this.fb.group({
       noti_Descripcion: ['', Validators.required],
       pant_direccionURL: [''],
       noti_Ruta: [''],
       pant_Descripcion: [''],
     });

     this.router.events
     .pipe(filter(event => event instanceof NavigationEnd))
     .subscribe((event: NavigationEnd) => {
       // Si la URL coincide con la de este componente, forzamos la ejecución
       if (event.urlAfterRedirects.includes('/sigesproc/proyecto/notificaciones')) {
         // Aquí puedes volver a ejecutar ngOnInit o un método específico
         this.onRouteChange();
       }
     });
   }


   onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar
   
    this.ngOnInit();
  }
   /**
    * Método del ciclo de vida de Angular que se ejecuta al inicializar el componente.
    * Aquí se cargan datos iniciales necesarios para el funcionamiento del componente.
    */
   ngOnInit(): void {
     // Carga la lista de notificaciones existentes
     this.Listado();


  const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
     
    }
    this.usua_Id = parseInt(this.cookieService.get('usua_Id'));

     // Configura las opciones del menú contextual para cada notificación
     this.items = [
       {
         label: 'Detalle',
         icon: 'pi pi-eye',
         command: () => this.onDetalles(this.SelectNotificacion)
       },
       {
         label: 'Eliminar',
         icon: 'pi pi-trash',
         command: () => this.onEliminar(this.SelectNotificacion)
       }
     ];

     this.submitted = false;
     this.Index = true;
     this.create = false;
     this.detalles = false;

     // Carga la lista de pantallas disponibles desde el servicio
     this.service.ListarPantallas().subscribe(
       (response: any) => {
         if (response && Array.isArray(response.data)) {
           this.Pantalla = response.data;
           //console.log('Datos de Pantalla:', this.Pantalla);
         } else {
           //console.error('Los datos recibidos no son válidos:', response);
         }
       },
       error => {
         //console.error('Error al listar pantallas', error);
       }
     );

     // Carga la lista de usuarios disponibles
     this.ListadoUsuarios();
   }

   /**
    * Filtra la lista de pantallas disponibles según la entrada del usuario.
    * @param event Evento que contiene el valor de búsqueda ingresado por el usuario.
    */
   filterPantalla(event: any) {
     const query = event.query.toLowerCase();

     if (Array.isArray(this.Pantalla)) {
       this.PantallasFill = this.Pantalla.filter(pant =>
         pant.pant_Descripcion.toLowerCase().includes(query)
       );
       //console.log('Pantallas filtradas:', this.PantallasFill);
     } else {
       //console.error('La propiedad Pantalla no es un array:', this.Pantalla);
     }
   }

   /**
    * Maneja la selección de una fila en la tabla de notificaciones.
    * @param notificacion Objeto de notificación seleccionado.
    */
   onRowSelect(notificacion: Notificaciones) {
     this.SelectNotificacion = notificacion.noti_Id; // Asigna el ID de la notificación seleccionada
     //console.log('ID seleccionado:', this.SelectNotificacion);
   }

   /**
    * Maneja la selección de un tipo de pantalla y actualiza el formulario con los valores correspondientes.
    * @param event Evento que contiene la pantalla seleccionada.
    */


onTipoPantallaSelect(event: any) {
  const TipoSeleccionadopantalla = event;
  //console.log('URL de la pantalla seleccionada:', TipoSeleccionadopantalla.value.pant_direccionURL);

  // Actualiza el campo visible (pant_Descripcion) y el oculto (pant_direccionURL)
  this.form.patchValue({
    pant_Descripcion: TipoSeleccionadopantalla.value.pant_Descripcion, // Este es el campo visible para el autocompletar
    pant_direccionURL: TipoSeleccionadopantalla.value.pant_direccionURL // Este es el valor que se guardará
  });
}



   /**
    * Valida la entrada de texto en campos específicos, permitiendo solo ciertos caracteres.
    * @param event Evento de teclado que contiene la tecla presionada.
    */
   ValidarTexto(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;

    // Expresión regular que permite letras, números, espacios y ciertos signos de puntuación
    const regex = /^[a-zA-ZÀ-ÿ\u00f1\u00d10-9\s.,¿?¡!/*-+]+$/;

    // Previene la entrada si la tecla no coincide con la expresión regular y no es una tecla de control
    if (!regex.test(key) && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }

    // Evita que ciertos caracteres sean ingresados al inicio del campo
    if ((key === ' ' || key === ',' || key === '*'|| key === '-'|| key === '/'|| key === '+'|| key === '.' || key === '¿' || key === '?' || key === '¡' || key === '!') && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }


 /**
 * Carga la lista de usuarios desde el servidor y filtra aquellos que tengan un `usua_Id` válido.
 * Actualiza la tabla con los datos recibidos y muestra un mensaje si no hay usuarios disponibles.
 */
ListadoUsuarios() {
  this.loading = true; // Activa el spinner de carga
  this.service.ListarUsuarios().subscribe(
    (data: Usuario[]) => {
      // Filtra los usuarios que tienen un ID válido (no null ni undefined)
      this.usuario = data.filter(item => item.usua_Id !== null && item.usua_Id !== undefined);
      this.loading = false; // Desactiva el spinner de carga

      // Muestra un mensaje si no hay usuarios disponibles
      if (this.usuario.length === 0) {
        this.loadedTableMessage = "No hay Usuarios disponibles.";
      }
    },
    error => {
      this.loading = false; // Desactiva el spinner de carga en caso de error
      //console.error('Error al cargar usuarios', error);
    }
  );
  //console.log('Usuarios:', this.usuario);
}

/**
 * Filtra la tabla globalmente según la entrada proporcionada en el campo de búsqueda.
 * @param table Referencia a la tabla que se va a filtrar.
 * @param event Evento de entrada que contiene el valor del filtro.
 */
onGlobalFilter(table: Table, event: Event) {
  table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}

/**
 * Selecciona o deselecciona todos los checkboxes de la tabla de usuarios.
 * @param event Evento que contiene el estado del checkbox "Seleccionar Todos".
 */
selectAllCheckboxes(event: any) {
  const isChecked = event.checked; // Verifica si el checkbox "Seleccionar Todos" está marcado
  this.usuario.forEach(user => user.selected = isChecked); // Marca o desmarca todos los usuarios
}

/**
 * Cambia el estado del checkbox de un usuario específico cuando se selecciona o deselecciona.
 * Actualiza el estado del checkbox "Seleccionar Todos" basado en la selección actual.
 * @param event Evento que contiene el estado del checkbox.
 * @param usuario El usuario cuyo checkbox se está cambiando.
 * @param rowIndex El índice de la fila donde se encuentra el usuario en la tabla.
 */
onCheckboxChange(event: any, usuario: Usuario, rowIndex: number) {
  usuario.selected = event.checked; // Actualiza el estado 'selected' del usuario específico
  this.updateSelectAllCheckbox(); // Actualiza el estado del checkbox "Seleccionar Todos"
}

/**
 * Actualiza el estado del checkbox "Seleccionar Todos" basado en la selección de todos los usuarios.
 */
updateSelectAllCheckbox() {
  // Verifica si todos los usuarios están seleccionados y actualiza la variable 'allSelected'
  this.allSelected = this.usuario.every(user => user.selected);
}

/**
 * Carga y muestra los detalles de una notificación seleccionada.
 * Si no se encuentra la notificación, muestra un mensaje de error.
 * @param id El ID de la notificación seleccionada.
 */
onDetalles(id: number | null): void {
  if (id === null) {
      this.messageService.add({ severity: 'error', summary: 'Error',  styleClass:'iziToast-custom',detail: 'ID de la Notificacion no puede ser null.' });
      return;
  }

  this.service.Buscar(id).subscribe(
      (data: any[]) => {  // Cambia el tipo a una lista de objetos
          //console.log('Datos obtenidos:', data); // Aquí ves lo que obtuviste

          if (data && data.length > 0) {
              // Agrupamos los datos por noti_Descripcion
              this.detalle_codigo = data[0].codigo;
              this.detalle_Descripcion = data[0].noti_Descripcion;
              this.detalle_usuaCreacion = data[0].usuaCreacion;
              this.detalle_usuaModificacion = data[0].usuaModificacion;
              this.detalle_noti_FechaCreacion = data[0].noti_FechaCreacion ? new Date(data[0].noti_FechaCreacion).toLocaleDateString() : '';
              this.detalle_noti_FechaModificacion = data[0].noti_FechaModificacion ? new Date(data[0].noti_FechaCreacion).toLocaleDateString() : '';

              // Asignamos el array de notificaciones agrupadas
              this.detalle_Notificaciones = data.map(noti => ({
                ...noti,
                napu_Leida: noti.napu_Leida === 'True'
            }));

              // Mostramos la sección de detalles
              this.submitted = false;
              this.Index = false;
              this.create = false;
              this.detalles = true;
          } else {
              this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'No se encontraron detalles para esta notificación.' });
          }
      },
      error => {
          //console.error('Error al obtener los detalles', error);
      }
  );
}

/**
 * Maneja la eliminación de una notificación seleccionada.
 * Si no se encuentra el ID de la notificación, muestra un mensaje de error.
 * @param id El ID de la notificación seleccionada para eliminar.
 */
onEliminar(id: number | null): void {
  if (id === null) {
      this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'ID de la compra no puede ser null.' });
      //console.error('Error: ID de la compra es null');
      return;
  }

  this.service.Buscar(id).subscribe(
      (data: any[]) => {
          ////console.log('Datos obtenidos:', data); // Aquí ves lo que obtuviste

          if (data && data.length > 0) {
              // Agrupamos los datos por noti_Descripcion
              const agrupadosPorDescripcion = data.reduce((acc, noti) => {
                  if (!acc[noti.noti_Descripcion]) {
                      acc[noti.noti_Descripcion] = [];
                  }
                  acc[noti.noti_Descripcion].push(noti);
                  return acc;
              }, {});

              // Asignamos el valor de detalle_Descripcion al primer grupo
              this.detalle_Descripcion = Object.keys(agrupadosPorDescripcion)[0];

              // Puedes realizar más acciones con los datos agrupados si es necesario
              ////console.log('Datos agrupados por Descripcion:', agrupadosPorDescripcion);

          } else {
              this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'No se encontraron detalles para esta notificación.' });
          }
      },
      error => {
          //console.error('Error al obtener los detalles', error);
      }
  );

  this.SelectNotificacion = id; // Guarda el ID de la compra seleccionada
  this.confirmacionVisible = true; // Muestra el modal de confirmación para emitir la orden
}

/**
 * Confirma la eliminación de la notificación seleccionada.
 * Si la eliminación es exitosa, actualiza la lista de notificaciones.
 */
confirmarEliminar() {
  if (this.SelectNotificacion === null) {
      return;
  }

  // Elimina la notificación seleccionada
  this.service.Eliminar(this.SelectNotificacion).subscribe(
      response => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Eliminado con Éxito.' });
          this.submitted = false;
          this.Listado(); // Actualiza el listado después de eliminar
      },
      error => {
          //console.error('Error al eliminar la notificación', error);
      }
  );

  this.confirmacionVisible = false; // Cierra el modal de confirmación
}


 /**
 * Maneja el proceso de envío del formulario para guardar y enviar una notificación.
 * Valida el formulario, selecciona los usuarios, y llama al servicio para insertar la notificación.
 * Si la inserción es exitosa, también envía una notificación push.
 */
 GuardarEnviar() {
  this.submitted = true;

    // Filtra los usuarios seleccionados
    const usuariosSeleccionados = this.usuario.filter(u => u.selected);
    if (usuariosSeleccionados.length === 0) { // Verifica si se ha seleccionado al menos un usuario
      this.messageService.add({ severity: 'warn', summary: 'Advertencia',  styleClass:'iziToast-custom',detail: 'Debe seleccionar al menos un usuario.', life: 3000 });
      return;
    }
// Traer el id de la pantalla y validar si existe
let idPantalla = this.Pantalla.find(pant => pant.pant_Descripcion === this.form.value.pant_Descripcion)?.pant_Id ?? 0;

// Si la pantalla no está vacía y no se encuentra en la lista
if (this.form.value.pant_Descripcion && idPantalla === 0) {
  // Mostrar mensaje si la opción no está en el listado
  this.Error_Pantalla = "Opción no encontrada.";
  this.form.get('pant_Descripcion')?.setErrors({ 'invalidPantallaId': true }); // Validar sobre pant_Descripcion
  return;  // Evitar continuar si no es válido
} else {
  // Remover errores previos si el campo está vacío o si la opción es válida
  this.form.get('pant_Descripcion')?.setErrors(null);
  this.Error_Pantalla = null;
}


  // Si todo es válido, continuar con la lógica de guardado
  if (this.form.valid) {
    const pantDireccionURL = this.form.value.pant_direccionURL || '';
    const notiRuta = pantDireccionURL ? `#/sigesproc${pantDireccionURL}` : '#/sigesproc/Paginaprincipal/Paginaprincipal';

    const usuariosSeleccionados = this.usuario.filter(u => u.selected);

    const detalles = usuariosSeleccionados.map(usuario => ({
      noti_Descripcion: this.form.value.noti_Descripcion,
      noti_Ruta: notiRuta,
      noti_Fecha: new Date().toISOString(),
      usua_Id: usuario.usua_Id,
      usua_Creacion: this.usua_Id,
      napu_Ruta: pantDireccionURL
    }));

    this.service.InsertarNotificacion(detalles).subscribe(
      respuesta => {
        if (respuesta.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
          this.sendNotification();
          this.notificacionUpdateService.notificacionesActualizadasEmit();
          this.usuario.forEach(user => user.selected = false);
          this.allSelected = false;
          this.redirigirPantalla = false;
          this.create = false;
          this.Index = true;
          this.form.reset();
          this.Listado();
          this.submitted = false;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'Inserción fallida', life: 3000 });
        }
      },
      error => {
        //console.error('Error al insertar notificación', error);
      }
    );
  }
}


 public GuardarEnviarAlertas(descripcion: string, ruta:string): void  {
  // Marca que el proceso ha sido iniciado
  this.submitted = true;

  // Usa todos los usuarios cargados en lugar de solo los seleccionados
  const usuariosSeleccionados = this.usuario;

  // Verifica si hay usuarios cargados
  if (usuariosSeleccionados.length === 0) {
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No hay usuarios disponibles.', life: 3000 });
    return;
  }

  // Define la URL de dirección
  const pantDireccionURL = ruta;

  // Construye la ruta de notificación
  const notiRuta = pantDireccionURL ? `#/sigesproc${pantDireccionURL}` : '#/sigesproc';

  // Crea un array de detalles de notificación para cada usuario
  const detalles = usuariosSeleccionados.map(usuario => ({
    aler_Descripcion: descripcion, // Descripción de la notificación
    aler_Ruta: notiRuta, // Ruta de la notificación
    aler_Fecha: new Date().toISOString(), // Fecha actual en formato ISO
    usua_Id: usuario.usua_Id, // ID del usuario destinatario
    usua_Creacion: this.usua_Id, // ID del usuario que crea la notificación
    napu_Ruta: pantDireccionURL // Ruta de pantalla opcional
  }));

  // Llama al servicio para insertar y enviar las notificaciones, pasando los detalles creados
  this.notificationManagerService.insertarYEnviarNotificaciones(detalles, notiRuta).subscribe(
    // Maneja la respuesta exitosa de la inserción y envío de notificaciones
    resultados => {
      // Filtra los resultados para obtener los que fueron exitosos y los que fallaron
      const exitosos = resultados.filter((res: any) => res.success);
      const fallidos = resultados.filter((res: any) => !res.success);

      // Si hay inserciones exitosas, muestra un mensaje de éxito
      if (exitosos.length > 0) {
        this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Insertado con éxito.', life: 3000 });
      }

      // Llama al servicio para actualizar las notificaciones
      this.notificacionUpdateService.notificacionesActualizadasEmit();
    },
    // Maneja cualquier error ocurrido durante la inserción o envío de notificaciones
    error => {
      this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'Error al procesar la solicitud.', life: 3000 });
      //console.error('Error en GuardarEnviarAlertas:', error);
    }
  );
}

/**
 * Carga la lista de notificaciones existentes desde el servidor y actualiza la tabla.
 * Muestra un mensaje si no hay notificaciones disponibles.
 */
Listado() {
  this.loading = true; // Activa el spinner de carga
  this.service.ListarIndex().subscribe(
    (data: Notificaciones[]) => {
      this.Notificacion = data; // Almacena las notificaciones obtenidas
      if (this.Notificacion.length === 0) {
        this.loadedTableMessage = "No hay Notificaciones existentes aún."; // Mensaje si no hay notificaciones
      } else {
        this.loading = false; // Desactiva el spinner cuando se cargan los datos
        this.Index = true; // Muestra la vista principal
      }
    },
    error => {
      this.loading = false; // Desactiva el spinner en caso de error
      //console.error('Error al cargar notificaciones', error);
    },
    () => {
      this.loading = false; // Asegura que el spinner se desactiva al finalizar la carga
    }
  );
}

/**
 * Cambia la vista a la de creación de una nueva notificación.
 * Resetea el formulario y oculta las secciones de índice y detalles.
 */
Nuevo() {
  this.submitted = false;
  this.Index = false;
  this.create = true;
  this.detalles = false;
  this.form.reset(); // Reinicia el formulario
}

/**
 * Regresa a la vista principal desde la vista de creación o detalles.
 * Deselecciona todos los checkboxes y reinicia el switch.
 */
Regresar() {
  this.submitted = false;
  this.Index = true;
  this.create = false;
  this.detalles = false;

  // Deselecciona todos los checkboxes individuales
  this.usuario.forEach(user => user.selected = false);

  // Deselecciona el checkbox "Seleccionar Todos"
  this.allSelected = false;

  // Reinicia el valor del switch
  this.redirigirPantalla = false;
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
  this.form.controls['noti_Descripcion'].setValue(inputElement.value);
}

  handleInputauto(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    inputElement.value = texto.replace(/[^a-zñA-ZÑáéíóúüÁÉÍÓÚÜ\s\d]/g, '');
    this.form.controls['pant_Descripcion'].setValue(inputElement.value);
  }
/**
 * Cambia la vista a la de eliminación de una notificación.
 * Muestra un modal de confirmación.
 */
eliminar() {
  this.submitted = false;
  this.Index = false;
  this.create = false;
  this.detalles = false;
  this.confirmacionVisible = true; // Muestra el modal de confirmación
}

  /**
   * Envia las notificaciones push.
   */
  sendNotification() {

  //interfaz necesaria para el envio de la alerta-notificacion
    const payload: NotificacionFlutterPush = {
      data: {
        title: 'Tienes una notificación',
        body: this.form.value.noti_Descripcion,
        click_action: this.form.value.pant_direccionURL
      }
    };
////console.log('ruta de notificacion global '+payload.data.click_action)
    //La siguiente parte la tendran que cambiar dependiendo de a quien le va a caer la notificación: --

    //metodo que setea los usuarios seleccionados para el envio
    const usuariosSeleccionados = this.usuario.filter(u => u.selected);
      //bucle que se ejecuta en base a los usaurios
      usuariosSeleccionados.forEach(usuario => {

    //hasta aqui lo tendrian que cambiar --

    /**
     * Metodo del servicio de notificaciones para listar los tokens de un usuario en especifico
     * @param id del usuario
     */

      this.service.ListarTokensUsuario(usuario.usua_Id).subscribe(
        (data: any) => {
          //separa los token y los setea en un arreglo para recorrerlos despues
          const tokens = data.data.flatMap((item: any) => item.tokn_JsonToken.split(','));

          //verifica que el arreglo no venga vacio
          if (tokens.length > 0) {
            //envia la interfaz de arriba y los tokens de ese usuario, esto envia el mensaje a todas los sitios donde este iniciando sesion el usuario
            this.servicePush.createNotification(tokens, payload).subscribe(
              response => {
            //    //console.log('Notificación enviada con éxito', response);
              },
              error => {
                //console.error('Error al enviar la notificación', error);
              }
            );
          } else {
            // //console.log("No hay tokens disponibles para enviar la notificación.");
          }
        },
        //en caso de error
        error => {
          //console.error('Error al listar tokens', error);
        }
      );
    })
  }

  onRowsPerPageChange(event: any) {
    this.rowsPerPage = event.value; // Actualiza el valor de filas por página
  }
}
