import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Imagenes, incidentes, ProyectoControl } from 'src/app/demo/models/modelsproyecto/incidentesviewmodel';
import { incidentesService } from 'src/app/demo/services/servicesproyecto/incidentes.service';
import { ControlCalidadService } from 'src/app/demo/services/servicesproyecto/controlcalidad.service';
import { ProyectoService } from 'src/app/demo/services/servicesproyecto/proyecto.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { CompraService } from 'src/app/demo/services/servicesinsumo/compra.service';
import { Proyecto } from 'src/app/demo/models/modelsproyecto/proyectoviewmodel';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { Etapa } from 'src/app/demo/models/modelsproyecto/etapaviewmodel';
import { ActividadPorEtapa } from 'src/app/demo/models/modelsproyecto/proyectoviewmodel';
import { Router,NavigationEnd } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { log } from 'mathjs';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-incidentes-completo',
  templateUrl: './incidentes-completo.component.html',
  styleUrls: ['./incidentes-completo.component.scss'],
  providers: [MessageService, CookieService]
})
export class incidentescompletoComponent implements OnInit {
  //Declariacion de las variables usadas en el codigo
  incidentes: incidentes[] = [];
  items: MenuItem[] = [];
  Index: boolean = true;
  Create: boolean = false;
  ControlCalidadAny : any;
  Proyectos: Proyecto[] = [];
  Detail: boolean = false;
  Delete: boolean = false;
  Descripcion: string = "";
  form: FormGroup;
  incidentesporactividad: incidentes [] = [];
  submitted: boolean = false;
  modalConfirmacion: boolean = false;
  confirm: boolean = false;
  modalEliminar: boolean = false;
  xpandedRows: any = {};//variable que expante la tabla maestra
  TablaMaestra: incidentes[] = [];
  proyectosControl: ProyectoControl[] = [];
  expandedRows: any = {};
  identity = 'Crear';
  minDate: Date;
  selectedincidentes: incidentes | undefined;
  id : number = parseInt(this.cookieService.get('usua_Id'));
  idInci: number = 0;
  isTableLoading: boolean = false;//variable para mostrar el spinner
  isMasterLoading: boolean = false;
  titulo = 'Nuevo Incidente';
  loading: boolean = false;
  actividad: any;
    loadedImageMessage: string = "";//variable para almacenar el mensaje de carga
  loadedTableMessage: string = ""
  Proyectofill: Proyecto[] | undefined
  Etapa: Etapa[] = [];
  Etapafill: Etapa[] | undefined
  Actividad: ActividadPorEtapa[] = [];
  Actividadfill : ActividadPorEtapa[] | undefined
  notFound: boolean = false;
  notFound1: boolean = false;
  notFound2: boolean = false;

  // Detalles
  Datos = [{}];
  detalle_inci_Id: number;
  detalle_Inci_Descripcion: string = '';
  detalle_Inci_Costo: string = '';
  detalle_imin_imagen: string = '';
  detalle_inci_Fecha: string = '';
  detalle_usuaCreacion: string = '';
  detalle_usuaModificacion: string = '';
  detalle_FechausuaCreacion: string = '';
  detalle_FechausuaModificacion: string = '';
  selectedImage: string | null = null;
  visibleImages: string[] = [];
  acet_Id : number = 0;

  constructor(
    private messageService: MessageService,
    private service: incidentesService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private compraservice: CompraService,
    public cookieService: CookieService,
    private controlCalidadService: ControlCalidadService,
    private Router: Router,
    private CookieService: CookieService,
    public globalMoneda: globalmonedaService


  ) {




        this.Router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          // Si la URL coincide con la de este componente, forzamos la ejecución
          if (event.urlAfterRedirects.includes('/sigesproc/proyecto/incidentes')) {
            // Aquí puedes volver a ejecutar ngOnInit o un método específico
            this.onRouteChange();
          }
        });







    this.form = this.fb.group({
      inci_Id: [''],
      inci_Descripcion: ['', Validators.required], //Campo para la Descripcion de la incidencia
      inci_Fecha: ['', Validators.required], //Campo para la fecha de la incidencia
      inci_Costo: ['', Validators.required], //Campo para el costo de la incidencia
      imin_Imagen: [''], //Campo para la URL de la imagen
      inci_FechaCreacion: [null], // Campo para la fecha de creación
      inci_FechaModificacion: [null], // Campo para la fecha de modificación
      imin_FechaCreacion: [null], // Campo para la fecha de creación de imagen
      imin_FechaModificacion: [null],
      proy_Id: ['', Validators.required , null],
      proy_Nombre: ['', Validators.required,null],
      proy_Descripcion: ['', Validators.required,null],
      etpr_Id:['', Validators.required,null],
      etap_Descripcion: ['', Validators.required,null],
      acet_Id: ['', Validators.required],
      acti_Descripcion: ['', Validators.required,null],
      adic_PresupuestoAdicional: ['', Validators.required], // Campo para la fecha de modificacion de la imagen

    });
  }

  onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar
    this.ngOnInit();
  }

  @ViewChild('fileUpload') fileUploader: any;

  ngOnInit(): void {

    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;

    this.minDate = new Date();
    this.minDate.setFullYear(2024, 0, 1);

    this.incidentesporactividad = [];

    const token = this.cookieService.get('Token');
    if (token == 'false') {
      this.Router.navigate(['/auth/login'])
    }
    this.Listado();
     //Carga el listado de las incidencias.
    if (!this.globalMoneda.getState()) {
      this.globalMoneda.setState()
    }
    //Acciones que se podran realizar en la pantalla
    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.Editarincidentes() },
      { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleUnidadMedida() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.AbrirEliminar() }
    ];
  }

  //Hace la peticion a la API para el listado de incidencias
  Listado() {
    //setea la variable de mostrar spinner
    this.isTableLoading = true;
    //entra al servicio de listar servicios
    this.service.ListarProyectosConControl().subscribe(
      (data: any) => {
      //mapea los campos del resultado del servicio de control de calidad
        this.proyectosControl = data.map(( proyectosControl: any) => ({
          ... proyectosControl
        }));

        this.isTableLoading = false;
      }),()=> {
        this.isTableLoading = false;//oculta el spinner cuando se cargan los datos y no son 0
      };

    //llama el servicio de listar proyectos
    this.compraservice.ListarProyectos().subscribe((data: any[]) => {
        this.Proyectos = data; //setea la variable con los registos de la tabla proyectos
      }
    );

 
    
    if (this.acet_Id) {
      this.service.Listar(this.acet_Id).subscribe(
        (data: any[]) => {
          this.incidentes = data;
          console.log(data)
        }
      );
    }
    
  }

  onImageSelected(event: any): void {

    this.selectedImage = this.visibleImages[event];
  }


  //se encarga de validar la entrada en un campo de texto, permitiendo solo letras y espacios, y manejando ciertos caracteres de control
  validarTexto(event: KeyboardEvent) {
    const texto = (event.target as HTMLInputElement).value;
    const cursorPosition = (event.target as HTMLInputElement).selectionStart;
    if (!/^[a-zñA-ZÑ\s]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.keyCode !== 13) {
      event.preventDefault();
    } else if (event.key === ' ' && (texto.trim() === '' || cursorPosition === 0)) {
      event.preventDefault();
    }
    if (event.keyCode === 13) {
      this.Guardar();
    }
  }

    //Seleccion de proyecto con autocompletado
    onProyectoSelect(event: any) {
      const proyectoSeleccionada = event;
      this.form.patchValue({ proy_Id: proyectoSeleccionada.value.proy_Id, proy_Nombre:proyectoSeleccionada.value.proy_Nombre});
      this.compraservice.ListarProyectosPorEtapa(proyectoSeleccionada.value.proy_Id).subscribe((data: any[]) => {
        this.Etapa = data;
      });
    }

    //filtro proyecto
    filterProyecto(event: any) {
      const query = event.query.toLowerCase();
      this.Proyectofill = this.Proyectos
      .filter(proy => proy.proy_Nombre.toLowerCase().includes(query))
      .sort((a,b) => a.proy_Nombre.localeCompare(b.proy_Nombre));

      this.notFound = this.Proyectofill.length === 0;
    }

            //Seleccion de etapa
    onEtapaSelect(event: any) {
      const etapaSeleccionado = event;
      this.form.patchValue({ etpr_Id: etapaSeleccionado.value.etpr_Id, etap_Descripcion:etapaSeleccionado.value.etap_Descripcion});
      this.compraservice.ListarActividadesPorEtapa(etapaSeleccionado.value.etpr_Id).subscribe((data: any[]) => {
        this.Actividad = data;
      });
    }

    //filtro de Etapa
    filterEtapa(event: any) {
      const query = event.query.toLowerCase();
      this.Etapafill = this.Etapa
      .filter(proy =>proy.etap_Descripcion.toLowerCase().includes(query))
      .sort((a,b) => a.etap_Descripcion.localeCompare(b.etap_Descripcion));

      this.notFound1 = this.Etapafill.length === 0 ;
    }

    //Seleccion de Actividad con autocompletado
    onActividadSelect(event: any) {
      const actividadSeleccionada = event;
      this.form.patchValue({ acet_Id: actividadSeleccionada.value.acet_Id, acti_Descripcion:actividadSeleccionada.value.acti_Descripcion});

    }

    //filtro de actividad
    filterActividad(event: any) {
      const query = event.query.toLowerCase();
      this.Actividadfill = this.Actividad
      .filter(proy => proy.acti_Descripcion.toLowerCase().includes(query))
      .sort((a,b) => a.acti_Descripcion.localeCompare(b.acti_Descripcion));

      this.notFound2 = this.Actividadfill.length === 0;
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

  handleInput(event: Event,controlName: string) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    // Solo permitir letras y un espacio después de cada letra
    inputElement.value = texto
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');

    // Actualizar el valor en el formulario
    this.form.controls[controlName].setValue(inputElement.value);
  }

  handleInputnumber(event: Event , controlName: string) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    // Solo permitir letras y un espacio después de cada letra
    inputElement.value = texto
    .replace(/[^0-9.\s]|(?<=\s)[^\s0-9.\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');

    // Actualizar el valor en el formulario
    this.form.controls[controlName].setValue(inputElement.value);
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
        this.messageService.add({ severity: 'error',styleClass: 'iziToast-custom', summary: 'Error', detail: 'El nombre del archivo excede el límite de 260 caracteres.', life: 3000 });
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
          this.messageService.add({ severity: 'warn', styleClass: 'iziToast-custom' , summary: 'Advertencia', detail: 'El archivo no es válido.', life: 3000 });
        }
      },
      (error) => {
        console.error('Error uploading file', error);
        this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom' ,detail: 'Hubo un error al subir el archivo', life: 3000 });
      }
    );
  }



  onRowSelect(incidente: incidentes) {
    this.selectedincidentes = incidente;
    console.log(incidente);
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  //Abre el collapse para crear un nuevo registro
  Crearincidentes() {
    this.incidentes = []; 
    this.Index = false;
    this.Create = true;
    this.Detail = false;
    this.Create = true;
    this.identity = 'Crear';
    this.titulo = 'Nuevo Incidente';
    this.acet_Id = 0;
    this.submitted = false
     this.submitted = false;
  }

  //Cierra el collapse
  CerrarIncidente() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
    this.acet_Id = 0;
    this.form.reset();
  }

  Editarincidentes() { //Cargar la incidencia para editarla.
    this.Create = true
    this.identity = 'editar';
    this.Index = false;
    this.titulo = 'Editar Incidente';
    this.submitted = false
    this.Delete = false;
    //Asigna los datos seleccionados en los campos del formulario
    this.form.patchValue({
      inci_Id: this.selectedincidentes.inci_Id,
      inci_Descripcion: this.selectedincidentes.inci_Descripcion,
      inci_Fecha: new Date(this.selectedincidentes.inci_Fecha),
      inci_Costo: this.selectedincidentes.inci_Costo,
      imin_Imagen: this.selectedincidentes.imin_Imagen,


      acet_Id: this.selectedincidentes.acet_Id,
      etpr_Id: this.selectedincidentes.etpr_Id,
      proy_Id: this.selectedincidentes.proy_Id,
 

      proy_Nombre: this.selectedincidentes.proy_Nombre,
      etap_Descripcion: this.selectedincidentes.etap_Descripcion,
      // proy_Descripcion: this.selectedincidentes.proy_Descripcion,
      acti_Descripcion: this.selectedincidentes.acti_Descripcion

    });
    console.log(this.selectedincidentes.proy_Id , this.selectedincidentes.proy_Nombre)
    //Recupero el nombre la incidencia y lo asigno a una variable
    this.Descripcion = this.selectedincidentes.inci_Descripcion;
    //Recupero el ID la incidencia y lo asigno a una variable
    this.idInci = this.selectedincidentes.inci_Id;


  }

  //Abre el modal para la confirmacion de eliminar un registro
  AbrirEliminar() {
    this.Descripcion = this.selectedincidentes.inci_Descripcion;
    this.idInci = this.selectedincidentes.inci_Id;
    this.Delete = true;
  }

  CerrarEliminar() {
    this.Delete = false;
  }


  onRowExpand(event: any): void {
    const con = event.data; //constante que setea los datos del evento
    this.expandedRows = {};//setea la variable expandedRows a vacia
    //envia el id de la constante con los datos que seteamos antes a la accion de listar imagenes
    this.ListarTablaControlesMaster(con.proy_Id);
  }

  // Colapsar fila en la tabla
  onRowCollapse(event: any) {
    delete this.expandedRows[event.proy_Id];//oculta la fila colapsada
  }

proy_id : number = 0

 // Listar tabla maestra pidiendo como parametro el id de control de calidad
 ListarTablaControlesMaster(control: number) {
  //setea la variable que muestra el spinner de la tabla maestra en verdadero
  this.isMasterLoading = true;
  //valida que el identificador del formulario no sea editar
  this.proy_id = control
    //seta el arreglo de expandedRows con el indice del id solicitado a true para que se despliegue la tabla maestra
    this.expandedRows[control] = true;

  //envia el id solicitado al servicio de listar imagenes
  this.service.ListarControlCalidadPorProyectos(control).subscribe(
    (Terr: incidentes[]) => {
      this.ControlCalidadAny = Terr;//variable any de listar para calculos

      //setea la variable de campos de la tabla maestra con el resultado del servicio
      this.incidentes = Terr;

      //verifica si los datos del servicio son iguales a 0
        if(this.incidentes.length === 0){
          //setea la variable que muestra el spinner a false para ocultarlo
          this.isMasterLoading = false;
          this.loadedTableMessage = "No se encontraron incidentes.";//mensaje que se muestra si no hay registros en la tabla
        }else{
          this.isMasterLoading = false;//oculta el spinner cuando se cargan los datos y no son 0
        }
    },
    error => {

          //setea la variable que muestra el spinner a false para ocultarlo
          this.isMasterLoading = false;
          this.loadedTableMessage = "A ocurrido un error.";//mensaje que se muestra si ocurrio un error en el servicio
    }
  );
}


  async Eliminarincidentes() {
    this.Delete = false;
    try {
      // Llama al servicio para eliminar la incidencia y espera la respuesta
      const response = await this.service.Eliminar2(this.idInci);
      console.log(this.idInci)
      
      const { code, data, message } = response; // Desestructura la respuesta
      // Inicializa variables para el mensaje del servicio
      let severity = 'error';
      let summary = 'Error';
      let detail = data?.messageStatus || message;
      let styleClass = '';
      // Verifica el código de respuesta
      if (code === 200) {
        // Si la eliminación fue exitosa o hay una advertencia
        severity = data.codeStatus > 0 ? 'success' : 'warn';
        summary = data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
        styleClass = 'iziToast-custom';
      } else if (code === 500) {
        // Si hubo un error interno
        severity = 'error';
        summary = 'Error Interno';
        styleClass = 'iziToast-custom';
      }

      // Añade el mensaje de estado al servicio de mensajes
      this.messageService.add({
        severity,
        summary,
        detail,
        styleClass: 'iziToast-custom' ,
        life: 3000
      });
      // Reinicia el componente
      this.ngOnInit();
    } catch (error) {
      // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
      this.messageService.add({
        severity: 'error',
        styleClass: 'iziToast-custom' ,
        summary: 'Error Externo',
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
    }

    if (this.form.invalid) {
      // Si hay una imagen seleccionada y no se ha subido aún
      const fileUploadControl = this.fileUploader.files?.[0];
      if (fileUploadControl && !this.form.get('imin_Imagen').value) {
        this.uploadImage(fileUploadControl);
        return; // Esperar a que la imagen se suba antes de proceder
      }

      if (this.form.value.inci_Costo <= 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'El costo no puede ser menor de 0.00 LPS',
          styleClass: 'iziToast-custom'
        });
        return;
      }
      //Se asignan los datos del formulario en una constante para enviarlos a la DB
      const datos: any = {
        inci_Id: this.idInci,
        inci_Descripcion: this.form.value.inci_Descripcion,
        inci_Fecha: this.form.value.inci_Fecha,
        inci_Costo: this.form.value.inci_Costo,
        imin_Imagen: this.form.value.imin_Imagen,
        acet_Id: this.form.value.acet_Id,
        usua_Creacion: this.id,
        usua_Modificacion: this.id
      };



      if (this.titulo === 'Nuevo Incidente') {

        datos.inci_FechaCreacion = new Date(); // Fecha de creación
        datos.imin_FechaCreacion = new Date(); // Fecha de creación de imagen

        //LLama el servicio y se usa el metodo donde se llama el EndPoint para insertar los datos
        //Solo si el titulo es 'Nuevo'
        this.service.Insertar(datos).subscribe(
          () => {
            //Muestra el mensaje de exito si se inserto bien
            this.messageService.add({ severity: 'success',         styleClass: 'iziToast-custom' ,
              summary: 'Éxito', detail: 'Insertado con Éxito.' });
            this.Listado();
            this.CerrarIncidente();
            this.modalConfirmacion = false
          },
          () => {
            //Muestra el mensaje de advertencia si el registro ya existe
            this.messageService.add({ severity: 'warn',         styleClass: 'iziToast-custom' ,
              summary: 'Error', detail: 'El registro ya existe' });
          }
        );
        //LLama el servicio y se usa el metodo donde se llama el EndPoint para editar los datos
        //Solo si el identity es 'editar'
      } else if (this.confirm && this.identity === 'editar') {
        datos.inci_FechaModificacion = new Date(); // Fecha de modificación
        datos.imin_FechaModificacion = new Date(); // Fecha de modificación de imagen
        this.service.Actualizar(datos).subscribe(
          () => {
            //Muestra el mensaje de exito si se inserto bien
            this.messageService.add({ severity: 'success',         styleClass: 'iziToast-custom' ,
              summary: 'Éxito', detail: 'Incidente editado correctamente.' });
            this.Listado();
            this.CerrarIncidente();
            this.modalConfirmacion = false
          },
          () => {
            //Muestra el mensaje de advertencia si el registro ya existe

            this.messageService.add({ severity: 'warn',         styleClass: 'iziToast-custom' ,
              summary: 'Error', detail: 'Ocurrió un error al editar el incidente.' });
          }
        );
      }
    }  

  }//end of Guardar()

  DetalleUnidadMedida(){
    this.Detail = true;
    this.Index = false;
    this.Create = false;
    this.Delete = false;
    console.log('Detail state:', this.Detail);
    console.log(this.selectedincidentes); 
    this.titulo = 'Detalle Incidente'
    this.detalle_inci_Id = this.selectedincidentes.codigo;
    this.detalle_Inci_Descripcion = this.selectedincidentes.inci_Descripcion;
    this.detalle_Inci_Costo = this.selectedincidentes.inci_Costo;
    this.detalle_imin_imagen = this.selectedincidentes.imin_Imagen || "No disponible";
    this.detalle_inci_Fecha = this.selectedincidentes.inci_Fecha;
    this.detalle_usuaCreacion = this.selectedincidentes.usuario_Creacion;
      this.detalle_FechausuaModificacion = this.selectedincidentes.usuario_Modificacion;
      this.detalle_FechausuaModificacion = this.selectedincidentes.inci_FechaModificacion;
      this.detalle_usuaModificacion = "";
      this.detalle_FechausuaModificacion = "";
    this.detalle_FechausuaCreacion = this.selectedincidentes.inci_FechaCreacion;
    }
}
