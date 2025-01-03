import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { incidentes } from 'src/app/demo/models/modelsproyecto/incidentesviewmodel';
import { incidentesService } from 'src/app/demo/services/servicesproyecto/incidentes.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';


@Component({
  selector: 'app-incidentes',
  templateUrl: './incidentes.component.html',
  styleUrls: ['./incidentes.component.scss'],
  providers: [MessageService, CookieService]
})
export class IncidentesComponent implements OnInit {
  //Declariacion de las variables usadas en el codigo
  incidentes: incidentes[] = [];
  items: MenuItem[] = [];
  Index: boolean = true;
  Create: boolean = false;
  Detail: boolean = false;
  Delete: boolean = false;
  Descripcion: string = "";
  form: FormGroup;
  submitted: boolean = false;
  modalConfirmacion: boolean = false;
  confirm: boolean = false;
  modalEliminar: boolean = false;
  identity = 'Crear';
  selectedincidentes: incidentes | undefined;
  id: number = 0;
  titulo = 'Nuevo';
  loading: boolean = false;
  actividad: any;
  minDate: Date;
  maxDate: Date;

  // Detalles
  Datos = [];
  detalle_inci_Id: string = '';
  detalle_Inci_Descripcion: string = '';
  detalle_Inci_Costo: string = '';
  detalle_imin_imagen: string = '';
  detalle_usuaCreacion: string = '';
  detalle_usuaModificacion: string = '';
  detalle_FechausuaCreacion: string = '';
  detalle_FechausuaModificacion: string = '';


  constructor(
    private messageService: MessageService,
    private service: incidentesService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private Router: Router,
    private CookieService: CookieService,
    public globalmonedaService: globalmonedaService

  ) {
    this.minDate = new Date(1920, 0, 1);
    this.maxDate = new Date(9999, 0, 1);
    this.form = this.fb.group({
      inci_Id: [''],
      inci_Descripcion: ['', Validators.required], //Campo para la Descripcion de la incidencia
      inci_Fecha: ['', Validators.required], //Campo para la fecha de la incidencia
      inci_Costo: ['', Validators.required], //Campo para el costo de la incidencia
      imin_Imagen: ['',], //Campo para la URL de la imagen
      inci_FechaCreacion: [null], // Campo para la fecha de creación
      inci_FechaModificacion: [null], // Campo para la fecha de modificación
      imin_FechaCreacion: [null], // Campo para la fecha de creación de imagen
      imin_FechaModificacion: [null] // Campo para la fecha de modificacion de la imagen

    });
  }

  @ViewChild('fileUpload') fileUploader: any;

  ngOnInit(): void {
    if(this.CookieService.get('Token') == 'false') this.Router.navigate(['/auth/login'])
      this.Index = true;
    this.actividad = JSON.parse(this.CookieService.get('IncidenteActividad'));
    this.Listado(); //Carga el listado de las incidencias.
    if(!this.globalmonedaService.getState()) this.globalmonedaService.setState()
    //Acciones que se podran realizar en la pantalla
    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.Editarincidentes() },
      { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleIncidente() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.AbrirEliminar() }
    ];
  }

  //Hace la peticion a la API para el listado de incidencias
  Listado() {
    this.loading = true; //Pone true el spinner mientras cargan los registros
    this.service.Listar(this.actividad.acet_Id).subscribe(
      (response: incidentes[]) => {
        this.incidentes = response;


      },
      error => {
        console.error('Error al obtener datos:', error);
      }, () => {
        this.loading = false; //Pone false el spinner una vez cargados los registros
      }
    );
  }

  //se encarga de validar la entrada en un campo de texto, permitiendo solo letras y espacios, y manejando ciertos caracteres de control
  validarTexto(event: KeyboardEvent) {
    const texto = (event.target as HTMLInputElement).value;
    const cursorPosition = (event.target as HTMLInputElement).selectionStart;
    if (!/^[a-zñA-ZÑ0-9\s]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.keyCode !== 13) {
      event.preventDefault();
    } else if (event.key === ' ' && (texto.trim() === '' || cursorPosition === 0)) {
      event.preventDefault();
    }
    if (event.keyCode === 13) {
      this.Guardar();
    }
  }



  //es útil para validar la entrada de datos en un campo de texto, asegurando que solo se ingresen números, puntos y comas,
  //y manejando casos especiales como espacios y valores de solo ceros.
  ValidarNumeros(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const texto = input.value;
    const isValidKey = /^\d$/.test(event.key) ||
      event.key === 'Backspace' ||
      event.key === 'Tab' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === '.' ||
      event.key === ',';
    if (!isValidKey) {
      event.preventDefault();
      return;
    }
    if (event.key === ' ' && (texto.trim() === '' || texto.trim().length === input.selectionEnd)) {
      event.preventDefault();
      return;
    }
    setTimeout(() => {
      const newTexto = input.value;
      const isOnlyZeros = /^0+$/.test(newTexto);
      if (isOnlyZeros) {
        input.value = '';
        event.preventDefault();
      }
    }, 0);
  }


  // convierte una cadena Base64 en una URL segura
  getSafeUrl(base64: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(base64);
  }


  //esto lo que es simplifica los nombres de archivos largos para que sean más manejables y visibles, especialmente en interfaces donde el espacio es limitado.
  truncateFileName(fileName: string): string {
    if (fileName.length > 30) {
      return fileName.substring(0, 30) + '...';
    }
    return fileName;
  }


  //simplemente abre el cuadro de diálogo para que el usuario pueda seleccionar un archivo
  triggerFileUpload(): void {
    this.fileUploader.advancedFileInput.nativeElement.click();
  }

  //Agarra la imagen subida al y le setea el valor de la URL convertida
  onImageSelect(event: any): void {
    const file: File = event.files[0];
    if (file) {
      if (file.name.length > 260) {
        this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'El nombre del archivo excede el límite de 260 caracteres.', life: 3000 });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageUrl = e.target.result;
        //Obtiene el valor del campo o sea la imagen
        this.form.get('imin_Imagen').setValue(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  }


  // esto se encarga de gestionar la subida de una imagen al servidor, maneja el éxito y los errores de la carga, y actualiza el formulario con la URL de la imagen si la carga es exitosa.
  uploadImage(file: File): void {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const uniqueFileName = uniqueSuffix + '-' + file.name;

    const formData: FormData = new FormData();
    formData.append('file', file, uniqueFileName);

    this.service.EnviarImagen(formData).subscribe(
      (response: any) => {

        if (response.message === 'Exito') {
          this.form.get('imin_Imagen').setValue(response.data.imageUrl);
          this.Guardar(); // Ahora que la imagen está subida, proceder a guardar el incidente
        } else {
          console.error('Invalid response from server:', response);
          this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass: 'iziToast-custom', detail: 'El archivo no es válido.', life: 3000 });
        }
      },
      (error) => {
        console.error('Error uploading file', error);
        this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'Hubo un error al subir el archivo', life: 3000 });
      }
    );
  }

  onRowSelect(incidentes: incidentes) {  //Selecciona los datos de la Columna.
    this.selectedincidentes = incidentes;
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  //Abre el collapse para crear un nuevo registro
  Crearincidentes() {
    this.Index = false;
    this.Create = true;
    this.Detail = false;
    this.form.reset();
    this.identity = 'crear';
    this.titulo = 'Nuevo';
    this.submitted = false
  }

  //Cierra el collapse
  CerrarIncidente() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false
    this.form.reset();
  }

  Editarincidentes() { //Cargar la incidencia para editarla.
    this.loading = true;
    this.form.reset();
    this.identity = 'editar';
    this.titulo = 'Editar';
    this.submitted = false

    //Asigna los datos seleccionados en los campos del formulario
    this.form.patchValue({
      inci_Id: this.selectedincidentes.inci_Id,
      inci_Descripcion: this.selectedincidentes.inci_Descripcion,
      inci_Fecha: new Date(this.selectedincidentes.inci_Fecha),
      inci_Costo: this.selectedincidentes.inci_Costo,
      imin_Imagen: this.selectedincidentes.imin_Imagen,
    });
    //Recupero el nombre la incidencia y lo asigno a una variable
    this.Descripcion = this.selectedincidentes.inci_Descripcion;
    //Recupero el ID la incidencia y lo asigno a una variable
    this.id = this.selectedincidentes.inci_Id;

    () => {this.loading = false;}
  }

  //Abre el modal para la confirmacion de eliminar un registro
  AbrirEliminar() {
    this.Descripcion = this.selectedincidentes.inci_Descripcion;
    this.id = this.selectedincidentes.inci_Id;
    this.Delete = true;
  }

  CerrarEliminar() {
    this.Delete = false;
  }



  async Eliminarincidentes() {
    this.Delete = false;
    this.titulo = 'Nuevo';
    try {
      // Llama al servicio para eliminar la incidencia y espera la respuesta
      const response = await this.service.Eliminar2(this.id);

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
        detail = 'Eliminado con Éxito';
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
        life: 30000
      });
    }
  }

  //Metodo para guardar el registro en la BD
  Guardar() {
    this.submitted = true;

    //Compara el identity para saber si levantar el modal de confirmar la edicion
    if (this.identity == 'editar' && !this.modalConfirmacion) {
      this.modalConfirmacion = true;
    } else if (this.identity == 'editar' && this.modalConfirmacion) {
      this.confirm = true;
    }else{
      this.confirm = true;
    }

    if (this.form.valid && this.confirm) {
      // Si hay una imagen seleccionada y no se ha subido aún
      const fileUploadControl = this.fileUploader.files?.[0];
      if (fileUploadControl && !this.form.get('imin_Imagen').value) {
        this.uploadImage(fileUploadControl);
        return; // Esperar a que la imagen se suba antes de proceder
      }

      //Se asignan los datos del formulario en una constante para enviarlos a la DB
      const datos: any = {
        inci_Id: this.id,
        inci_Descripcion: this.form.value.inci_Descripcion,
        inci_Fecha: this.form.value.inci_Fecha,
        inci_Costo: this.form.value.inci_Costo,
        imin_Imagen: this.form.value.imin_Imagen,
        acet_Id: this.actividad.acet_Id, //Aqui ira el  ID de la actividad por etapa seleccionada en el Diagrama
        usua_Creacion: parseInt(this.CookieService.get('usua_Id')),
        usua_Modificacion: parseInt(this.CookieService.get('usua_Id'))
      };

      if (this.titulo === 'Nuevo') {
        datos.inci_FechaCreacion = new Date(); // Fecha de creación
        datos.imin_FechaCreacion = new Date(); // Fecha de creación de imagen

        //LLama el servicio y se usa el metodo donde se llama el EndPoint para insertar los datos
        //Solo si el titulo es 'Nuevo'
        this.service.Insertar(datos).subscribe({
          next: () => {
            //Muestra el mensaje de exito si se inserto bien
            this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Insertado con Éxito.' });
            this.Listado();
            this.CerrarIncidente();
            this.modalConfirmacion = false

          },
          error: (error) => {
            //Muestra el mensaje de advertencia si el registro ya existe
            this.messageService.add({ severity: 'warn', summary: 'Error', styleClass: 'iziToast-custom', detail: 'El registro ya existe' });
          }
        });
        //LLama el servicio y se usa el metodo donde se llama el EndPoint para editar los datos
        //Solo si el identity es 'editar'
      } else if (this.confirm && this.identity === 'editar') {
        datos.inci_FechaModificacion = new Date(); // Fecha de modificación
        datos.imin_FechaModificacion = new Date(); // Fecha de modificación de imagen
        this.service.Actualizar(datos).subscribe(
          () => {
            //Muestra el mensaje de exito si se inserto bien
            this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Editado con Éxito.' });
            this.Listado();
            this.CerrarIncidente();
            this.modalConfirmacion = false
            this.titulo = 'Nuevo';
          },
          () => {
            //Muestra el mensaje de advertencia si el registro ya existe

            this.messageService.add({ severity: 'warn', summary: 'Error', styleClass: 'iziToast-custom', detail: 'Ocurrió un error al editar el incidente.' });
          }
        );
      }
    }
    this.confirm = false;
  }//end of Guardar()

  CerrarCliente(){
    this.Router.navigate(['/sigesproc/proyecto/seguimientoproyecto']);
  }


  DetalleIncidente(){
    this.loading = true;
    this.Datos.push(this.selectedincidentes)
    this.Index = false;
    this.Detail = true;
    this.loading = false;
  }

  Regresar(){
    if(this.Index){
      this.Router.navigate(['/sigesproc/proyecto/seguimientoproyecto']);
    }else if(!this.Index){
      this.Detail = false;
      this.Index = true;
      this.Datos = [];
      this.CerrarIncidente()
    }
  }

}
