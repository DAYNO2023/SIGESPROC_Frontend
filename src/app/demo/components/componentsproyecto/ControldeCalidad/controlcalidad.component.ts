
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, ValidationErrors, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { ControlCalidadService } from 'src/app/demo/services/servicesproyecto/controlcalidad.service';
import { ControlCalidad,ProyectoControl, ControlCalidadImagen } from 'src/app/demo/models/modelsproyecto/controlcalidadviewmodel';
import { CompraService } from 'src/app/demo/services/servicesinsumo/compra.service';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { Proyecto } from 'src/app/demo/models/modelsproyecto/proyectoviewmodel';
import { Table, TableModule } from 'primeng/table';
import { Etapa } from 'src/app/demo/models/modelsproyecto/etapaviewmodel';
import { ActividadPorEtapa } from 'src/app/demo/models/modelsproyecto/proyectoviewmodel';
import { FileUpload } from 'primeng/fileupload';
import { DocumentoBienRaizService } from 'src/app/demo/services/servicesbienraiz/documentoBienRaiz.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { actividadmodule } from '../actividad/actividad.module';
import { ventabienraizservice } from 'src/app/demo/services/servicesbienraiz/ventabienraiz.service';
import { ProyectoService } from 'src/app/demo/services/servicesproyecto/proyecto.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, NavigationEnd  } from '@angular/router';
import { filter } from 'rxjs/operators';

export function roleIdValidator(control: AbstractControl): ValidationErrors | null {
  if (control.value && control.value.trim() !== '') {
    return { 'invalidRoleId': true }; // El campo tiene texto, lo consideramos inválido
  }
  return null; // Si el campo está vacío, es válido
}

@Component({
  selector: 'app-controlcalidad',
  templateUrl: './controlcalidad.component.html',
  styleUrl: './controlcalidad.component.scss'
})
export class ControlcalidadComponent {
  @ViewChild('fileUploader') fileUploader: FileUpload;

//#region  Variables
  form: FormGroup;//variable de tipo formgroup que almacena los datos de los formularios
  formimg: FormGroup;//variable de tipo formgroup que almacena los datos de los formularios
  formAimg: FormArray = new FormArray([]) ;//vatiable de tipo formArray que usare para guardar las imagenes
  items: MenuItem[] = [];//variable que almacena los items de la lista de acciones por
  itemsNoEdit: MenuItem[] = [];//variable que almacena los items de la lista de acciones por
  itemsAdmin: MenuItem[] = [];//variable que almacena los items de la lista de acciones de los usuarios admin
  itemsAdminNoEdit: MenuItem[] = [];//variable que almacena los items de la lista de acciones de los usuarios admin
  isTableLoading: boolean = false;//variable para mostrar el spinner
  isMasterLoading: boolean = false;//variable para mostrar el spinner
  loadedImageMessage: string = "";//variable para almacenar el mensaje de carga
  loadedTableMessage: string = "";//variable para almacenar el mensaje de carga
  controlcalidad: ControlCalidad[] = [];//variable de tipo Actividades-viewmodel, que almacena el listado de actividades.
  proyectosControl: ProyectoControl[] = [];//variable de tipo Actividades-viewmodel, que almacena el listado de actividades.
  Create: boolean = false;//variable que sirve para mostrar el formulario de crear-editar
  Index: boolean = true;//variable que sirve para mostrar el listado principal
  Detail: boolean = false;//variable que sirve para mostrar el apartado de detalles
  identity = 'Crear';//variable para identificar si se crea o de edita con el formulario
  titulo = 'Nuevo';//variable que almacena el titulo del formulario crear-editar
  submitted: boolean = false;//variable que muestra un error en rojo cuando los campos del formulario estan vacios
  id: number = 0;//variable que almacena el id
  Proyectos: Proyecto[] = [];//variable que almacena los Proyectos
  Proyectofill: Proyecto[] | undefined //variable que filtra los Proyectos
  Etapa: Etapa[] = [];//variable que almacena las Etapa
  Etapafill: Etapa[] | undefined //variable que filtra las Etapa
  Actividad: ActividadPorEtapa[] = [];//variable que almacena las Actividades
  Actividadfill : ActividadPorEtapa[] | undefined //variable que filtra las Actividades
  cantidad: any = 0;
  selectedControlcalidad: ControlCalidad | undefined;
  selectedControlcalidadimagen:number = 0;
  expandedRows: any = {};//variable que expante la tabla maestra
  TablaMaestra: ControlCalidadImagen[] = []; //variable que almacena los datos de la tabla imagenes control de calidad
  filesArray: File[] = [];//array que almacena los archivos insertados
  Delete: boolean = false//varible para mostrar el modal eliminar
  Aprobe: boolean = false;//variable que sirve para mostrar el apartado de detalles
  Deleteimg: boolean = false//varible para mostrar el modal eliminar imagen
  Edit: boolean = false//varible para mostrar el modal Editar
  tablaimg: boolean = false//varible para mostrar el modal Editar
  Descripcion: string = "";
  formEditar : any;
  ControlCalidadAny : any[];
  minDate: Date | undefined;
    startIndex: number = 0;
    selectedImage: string | null = null;
    selectedImageIndex: number | null = null;
  visibleImages: string[] = [];
  images: string[] = [];
  visibleCount: number = 4;
  ErrorProyecto: string = "El campo es requerido." //mesaje de error en el ddl de proyectos
  ErrorEtapa: string = "El campo es requerido." //mensaje de error en el ddl de etapas
  ErrorActividad: string //mensaje de error en el ddl de actividades
  acti_Id : number = 0
  //#region Detalles
  Datos = [{}];
  detallecodigo ?: number;
  detallecoca_Descripcion ?: string;
  detallecoca_Fecha ?: string;
  detalleusuaCreacion ?: string;
  detallecoca_FechaCreacion ?: string;
  detalleusuaModificacion ?: string;
  detallecoca_FechaModificacion ?: string;
  detallecoca_MetrosTrabajados ?: string;
  detalleacti_Descripcion ?: string;
  detalleetap_Descripcion ?: string;
  detalleproy_Descripcion ?: string;
  //#endregion

  //#endregion

  constructor(
    private messageService: MessageService,
    private service: ControlCalidadService,
    private compraservice: CompraService,
    private documentoService: DocumentoBienRaizService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private vbien: ventabienraizservice,
    public cookieService: CookieService,
    private router: Router,
    private prservice: ProyectoService,
  ) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/proyecto/controldecalidad')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });

    //formulario de control de calidad
    this.form = this.fb.group({
      coca_Descripcion: ['', Validators.required],
      coca_Fecha: ['', Validators.required],
      proy_Nombre: [''],
      etap_Descripcion: [''],
      acti_Descripcion: [''],
      imagen: [''],
      coca_CantidadTrabajada: ['', Validators.required],
    });
    //formulario de imagenes
    this.formimg = new FormGroup({
      coca_Id: new FormControl(''),
      icca_Imagen : new FormControl(''),
      usua_Creacion: new FormControl(''),
    });
  }

  onRouteChange(): void {
    this.ngOnInit();
  }


  //accion que se realiza al inicializar el componente
  ngOnInit(): void {

    this.Index = true; //muestra la tabla principal
    this.Detail = false;//oculta los detalles
    this.Create = false;//oculta el formulario
    this.tablaimg = false;//oculta la tabla de imagenes
    this.submitted = false//setea el submitted como falso
    this.filesArray = [];//setea el arreglo de archivos como vacio
    //remueve los datos del formArray recorriendolo
    this.identity = "Nuevo";
    this.formAimg = new FormArray([])

    const token = this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
    const admin = this.cookieService.get('usua_Admin');
    let prevMonth = 12;
    let prevYear = 2000;
    this.minDate = new Date();
    this.minDate.setMonth(prevMonth);
    this.minDate.setFullYear(prevYear);

    this.Listado();
    //setea el formulario de imagenes como un nuevo formArray
    this.formAimg = new FormArray([]);
    if(admin == 'true'){
      this.items = [
        { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.EditarControlCalidad() },
        { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleControlCalidad()},
        { label: 'Aprobar', icon: 'pi pi-check', command: () => this.ArpobarControlCalidad()},
        { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.EliminarControlCalidad() }
      ];
       //setea la variable de items y sus acciones
       this.itemsNoEdit = [
        { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleControlCalidad()},
      ];
    }
    else{
       //setea la variable de items y sus acciones
       this.items = [
        { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.EditarControlCalidad() },
        { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleControlCalidad()},
        { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.EliminarControlCalidad() }
      ];
       //setea la variable de items y sus acciones
       this.itemsNoEdit = [
        { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleControlCalidad()},
      ];
    }

  }


  //accion que entra al backend y devuelve el listado de la tabla
  Listado() {
    //setea la variable de mostrar spinner
    this.isTableLoading = true;
    //entra al servicio de listar servicios
    this.service.ListarProyectosConControl().subscribe(
      (data: any) => {
      //mapea los campos del resultado del servicio de control de calidad
        this.proyectosControl = data.map(( proyectosControl: any) => ({
          ... proyectosControl
        }));;

        // this.controlcalidad.coca_Fecha = new Date(actividad.acti_FechaCreacion).toLocaleDateString();
        // if(this.controlcalidad.length === 0){
        //   this.isTableLoading = false;//oculta el spinner cuando se cargan los datos y no son 0
        //   this.loadedTableMessage = "No hay Controles existentes aún.";//mensaje que se muestra si no hay registros en la tabla
        // }else{
        //   this.Index = true;
        // }
        this.isTableLoading = false;
      }),()=> {
        this.isTableLoading = false;//oculta el spinner cuando se cargan los datos y no son 0
      };

    //llama el servicio de listar proyectos
    this.compraservice.ListarProyectos().subscribe((data: any[]) => {
        this.Proyectos = data.sort((a, b) => a.proy_Nombre.localeCompare(b.proy_Nombre)); //setea la variable con los registos de la tabla proyectos
      }
    );

  }

    //accion para la barra de busqueda
    onGlobalFilter(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }


   //accion que selecciona un campo de la tabla y llena sus valores en una variable
   onRowSelect(controlcalidad: ControlCalidad) {
    this.selectedControlcalidad = controlcalidad;
  }

  //accion que setea el id de la imagen
  onimagenSelect(imagen: ControlCalidadImagen) {
    this.selectedControlcalidadimagen = imagen.icca_Id;
    }

   // Desencadenar la carga de archivos
   triggerFileUpload(): void {
    this.fileUploader.advancedFileInput.nativeElement.click();
  }

  //#region Cambios Subir Imagenes

  triggerFileInput(): void {
    const fileInput = document.getElementById(
        'fileInput'
    ) as HTMLInputElement;
    fileInput.click();
  }

  // Manejar selección de imagen
  onImageSelect(event: any): void {

    this.selectedImageIndex = event;
    this.selectedImage = this.visibleImages[event];
  }


  updateVisibleImages(): void {
    this.visibleImages = this.images.slice(this.startIndex, this.startIndex + this.visibleCount);
}

    //el metodo que realiza es delizar hacia arriba
    scrollUp(): void {
      if (this.startIndex > 0) {
          this.startIndex = Math.max(this.startIndex - this.visibleCount, 0);
          this.updateVisibleImages();
      }
  }

      //el metodo que realiza es delizar hacia abajo
      scrollDown(): void {
        if (this.startIndex < this.images.length - this.visibleCount) {
            this.startIndex = Math.min(
                this.startIndex + this.visibleCount,
                this.images.length - this.visibleCount
            );
            this.updateVisibleImages();
        }
    }

  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files.length) {
        const filePromises = Array.from(files).map((file) => {
            return new Promise<string>((resolve, reject) => {
              if (!file.type.startsWith('image/')) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'Solo se permiten archivos de imagen.',
                    life: 3000,
                });
                return;
            }
                if (file.name.length > 260) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'El nombre del archivo excede el límite de 260 caracteres.',
                        life: 3000,
                    });
                    return;
                }

                this.filesArray.push(file);

                const reader = new FileReader();
                reader.onload = (e: any) => {
                    const imageUrl = e.target.result;
                    this.images.push(imageUrl);
                    resolve(imageUrl);

                  //inserta la url de la imagen al formgroup de imagen y el usuario que creo ese insert de imagen
                  const fomrimg = this.fb.group({
                    icca_Imagen: [imageUrl],
                    usua_Creacion: parseInt(this.cookieService.get('usua_Id')),

                  })
                  //inserta el valor del forgroup de imagen al formArray
                  this.formAimg.push(fomrimg);
                };
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(filePromises)
            .then(() => this.updateVisibleImages())
            .catch((error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al leer archivos',
                    life: 3000,
                });
            });
    }
}

isImage(url: string): boolean {
  return (
      url.startsWith('data:image/') ||
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg') ||
      url.endsWith('.png') ||
      url.endsWith('.gif')
  );
}

GuardarImagenes(): void
{
  if (this.filesArray.length > 0) {
      this.filesArray.forEach((file) => {
          this.vbien.SubirImagen(file).subscribe(
              (respuesta) => {

                  if (respuesta.message === 'Éxito') {
                  } else {
                  }
              },
              (error) => {
                  this.messageService.add({
                      severity: 'error',
                      summary: 'Error',
                      styleClass: 'iziToast-custom',
                      detail: 'Error en la subida de la imagen',
                      life: 3000,
                  });
              }
          );
      });
  } else {
  }
}



limpiar(): void {
  // Si estamos en modo de edición
      // Verifica si hay una imagen seleccionada y si hay imágenes en la lista
      if (this.selectedImageIndex !== null && this.images.length > 0) {
          // Obtén el ID de la imagen guardada
          const imageId = this.imageIds[this.startIndex + this.selectedImageIndex];

              // Si la imagen no ha sido guardada (no tiene un ID), solo elimínala de la lista local
              this.images.splice(this.startIndex + this.selectedImageIndex, 1);
              this.formAimg.removeAt(this.startIndex + this.selectedImageIndex);//remueve el archivo por el indice
              this.filesArray.splice(this.startIndex + this.selectedImageIndex, 1);
              this.selectedImage = null;
              this.selectedImageIndex = null;
              this.updateVisibleImages();
      }
}

imageIds: number[] = [];


cargarImagenes(id: number) {
    this.vbien.getImagenes(id).subscribe(
        (imagenes) => {
            this.images = imagenes.map((img: any) => `${this.vbien.getApiUrl()}${img.impr_Imagen}`);
            // Cargar los IDs de las imágenes
            this.imageIds = imagenes.map((img: any) => img.impr_Id);
            this.updateVisibleImages();
        },
        (error) => {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                styleClass: 'iziToast-custom',
                detail: 'Error al cargar las imágenes del control de calidad.',
            });
        }
    );
}

  //#endregion
  //remueve una imagen del formArray al darle a la x



  // Obtener URL segura para la imagen
  getSafeUrl(base64: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(base64);
  }

  // Cargar imagen
  uploadImage(file: File): void {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const uniqueFileName = uniqueSuffix + '-' + file.name;

    const formData: FormData = new FormData();
    formData.append('file', file, uniqueFileName);

    this.documentoService.EnviarImagen(formData).subscribe(
      (response: any) => {
          if (response.message === "Éxito") {

        //   const fomrimg = this.fb.group({
        //     icca_Imagen: uniqueFileName,
        //     usua_Creacion: 3,
        //     coca_Id : this.id,
        //   })
        //   // this.formAimg.push(fomrimg);
        //   this.service.InsertarImangenes(fomrimg).subscribe(
        //     (respuesta: any) => {
        //       if (respuesta.success) {
        //     this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });

        //       }
        //       else{
        //         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al insertar la imagen', life: 3000 });

        //       }
        //     });

          // this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Imagen subida correctamente', life: 3000 });
        } else {
          // this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al subir la imagen', life: 3000 });
        }
      },
      (error: any) => {
        // this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador', life: 3000 });
      }
    );
  }

  //#region Filtrado Actividades
  //Seleccion de proyecto con autocompletado
  onProyectoSelect(event: any) {
    const proyectoSeleccionada = event;
    this.form.patchValue({ proy_Nombre:proyectoSeleccionada.value.proy_Nombre});
    let proye_Id = this.Proyectos.find(proy => proy.proy_Nombre === this.form.value.proy_Nombre)?.proy_Id ?? 0;

      this.compraservice.ListarProyectosPorEtapa(proye_Id).subscribe((data: any[]) => {
        this.Etapa = data.sort((a, b) => a.etap_Descripcion.localeCompare(b.etap_Descripcion));
      });



  }

  //filtro proyecto
  filterProyecto(event: any) {
    const query = event.query.toLowerCase();
    this.Proyectofill = this.Proyectos.filter(proy =>
      proy.proy_Nombre.toLowerCase().includes(query)
    );
  }

          //Seleccion de etapa
  onEtapaSelect(event: any) {
    const etapaSeleccionado = event;
    this.form.patchValue({ etap_Descripcion:etapaSeleccionado.value.etap_Descripcion});
    this.compraservice.ListarActividadesPorEtapa(etapaSeleccionado.value.etpr_Id).subscribe((data: any[]) => {
      this.Actividad = data.sort((a, b) => a.acti_Descripcion.localeCompare(b.acti_Descripcion));
    });
    this.service.Listar().subscribe((data : any[]) => {
      this.ControlCalidadAny = data;
    })
  }

  //filtro de Etapa
  filterEtapa(event: any) {
    const query = event.query.toLowerCase();
    this.Etapafill = this.Etapa.filter(proy =>
      proy.etap_Descripcion.toLowerCase().includes(query)
    );
  }

  ingresado : number = 0;

  //Seleccion de Actividad con autocompletado
  onActividadSelect(event: any) {
    const actividadSeleccionada = event;
    //setea los valores seleccionados en el formulario
    this.form.patchValue({ acti_Descripcion:actividadSeleccionada.value.acti_Descripcion});
    this.cantidad = actividadSeleccionada.value.acet_Cantidad

    if(this.identity != "editar"){
      for (let index = 0; index < this.ControlCalidadAny.length; index++) {

        if(this.ControlCalidadAny[index].acet_Id == actividadSeleccionada.value.acet_Id)
        {
          this.ingresado = this.ingresado + this.ControlCalidadAny[index].coca_CantidadTrabajada
        }
      }

    }
    else{
      for (let index = 0; index < this.ControlCalidadAny.length; index++) {

        if ((this.ControlCalidadAny[index].acet_Id == actividadSeleccionada.value.acet_Id)&&(this.ControlCalidadAny[index].coca_Id != this.id))
        {
          this.ingresado = this.ingresado + this.ControlCalidadAny[index].coca_CantidadTrabajada
        }
      }
    }
    
  }

  //filtro de actividad
  filterActividad(event: any) {
    const query = event.query.toLowerCase();
    this.Actividadfill = this.Actividad.filter(proy =>
      proy.acti_Descripcion.toLowerCase().includes(query)
    );
    this.cantidad = this.Actividad.filter(proy =>
      proy.acet_Cantidad
    );
    this.cantidad = 0
    this.ingresado = 0
  }
  //#endregion

  //despliega el formulario de crear
  CrearControlCalidad() {
    this.Index = false;//oculta la tabla principal
    this.Create = true;//mostrar formulario
    this.Detail = false;//ocultar detalles
    this.form.reset(); //resetea el formgrup
    this.identity = 'crear';//setea el identificador crear
    this.titulo = 'Nuevo';//setea el titulo Nuevo
    this.submitted = false;//setea el submitted como false
    this.tablaimg = false;//oculta la tabla de imagenes
  }

 //pliega la accion activa
  CerrarControlCalidad() {
    this.Index = true; //muestra la tabla principal
    this.Detail = false;//oculta los detalles
    this.Create = false;//oculta el formulario
    this.tablaimg = false;//oculta la tabla de imagenes
    this.submitted = false//setea el submitted como falso
    this.filesArray = [];//setea el arreglo de archivos como vacio
    //remueve los datos del formArray recorriendolo
    this.identity = "Nuevo";
    for (let index = 0; index <= this.formAimg.length; index++) {
    this.formAimg.removeAt(0);
    }
    delete this.expandedRows[this.id];//oculta la fila colapsada
    this.cantidad = 0
    this.ingresado = 0
    this.images = []
          this.formAimg = new FormArray([]);
          this.visibleImages = []
          this.TablaMaestra = []
  }

 //Valida que solo se puedan colocar letras en los inputs
  ValidarTexto(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    //valida que se inserten letras con o sin tildes
    if (!/^[a-zñA-ZÀ-ÿ\u00f1\u00d1 ]+$/.test(key) && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }
    //valida que el insert inicial no sea un espacio

    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

//   setDateProperties(obj: any) {
//     const isDateString = (value: any): boolean => {
//       return typeof value === 'string' && !isNaN(Date.parse(value));
//     };

//     for (const key in obj) {
//         if (!key.endsWith('DireccionExacta') &&
//             !key.endsWith('Nombre') &&
//             !key.endsWith('Descripcion')
//             && isDateString(obj[key])) {
//             obj[key] = new Date(obj[key]);
//         }
//         }
//     }

 //despliega el formulario de editar llenando los campos del formulario
 EditarControlCalidad() {
  this.Detail = false;
  this.Index = false;
  this.Create = true;
  this.identity = 'editar';
  this.titulo = 'Editar';
  this.tablaimg = true;
  this.id = this.selectedControlcalidad.coca_Id

  // this.setDateProperties(this.selectedControlcalidad);


  if (this.selectedControlcalidad) {
    this.form.patchValue({
      acti_Descripcion: this.selectedControlcalidad.acti_Descripcion,
      coca_Fecha: new Date(this.selectedControlcalidad.coca_Fecha),

      acet_Id: this.selectedControlcalidad.acet_Id,
      etpr_Id: this.selectedControlcalidad.etpr_Id,
      proy_Id: this.selectedControlcalidad.proy_Id,

      etap_Descripcion: this.selectedControlcalidad.etap_Descripcion,
      proy_Nombre: this.selectedControlcalidad.proy_Nombre,
      coca_CantidadTrabajada: this.selectedControlcalidad.coca_CantidadTrabajada,
      coca_Descripcion: this.selectedControlcalidad.coca_Descripcion,

    });
    this.service.Listar().subscribe((data : any[]) => {
      this.ControlCalidadAny = data;
    })

    this.compraservice.ListarProyectosPorEtapa(this.selectedControlcalidad.proy_Id).subscribe((data: any[]) => {
      this.Etapa = data;
    });
    
    this.compraservice.ListarActividadesPorEtapa(this.selectedControlcalidad.etpr_Id).subscribe((data: any[]) => {
      this.Actividad = data;
      
      for (let index = 0; index < data.length; index++) {
        if(data[index].acet_Id == this.selectedControlcalidad.acet_Id)
        {
          this.cantidad = data[index].acet_Cantidad
        }
      }
        
      
    });

      for (let index = 0; index < this.ControlCalidadAny.length; index++) {
        if((this.ControlCalidadAny[index].acet_Id == this.selectedControlcalidad.acet_Id) && (this.ControlCalidadAny[index].coca_Id != this.id))
        {
          this.ingresado = this.ingresado + this.ControlCalidadAny[index].coca_CantidadTrabajada
        }
      }


    this.ListarTablaMaestra(this.id)

  }
}

//accion para dar formato a la fecha del formulario
convertToISOFormat(date: Date | string): string {
    if (!date) return null;
    //constante para typear la fecha
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    //valida que el formato de la fecha sea invalido
    if (isNaN(parsedDate.getTime())) {
        return null;//si es invalido devuelve null
    }
    return parsedDate.toISOString();//retorna la fecha parseada
}


  //accion que envia los datos del formulario al insertar o los setean en una variable y lo envian al editar
  //tambien abre el modal de editar
  Guardar() {
    let proye_Id = this.Proyectos.find(proy => proy.proy_Nombre === this.form.value.proy_Nombre)?.proy_Id ?? 0;

    if(proye_Id !== 0){
      this.form.get('proy_Nombre')?.setErrors(null);
    } else if (this.form.value.proy_Nombre == "" || this.form.value.proy_Nombre == null){
        this.ErrorProyecto = "El campo es requerido."
        this.form.get('proy_Nombre')?.setErrors({ 'invalidRoleId': true });
    }else {
      this.ErrorProyecto = "Opción no encontrada."
      this.form.get('proy_Nombre')?.setErrors({ 'invalidRoleId': true });
    }

    let etap_Id = this.Etapa.find(proy => proy.etap_Descripcion === this.form.value.etap_Descripcion)?.etap_Id ?? 0;

    if(etap_Id !== 0){
      this.form.get('etap_Descripcion')?.setErrors(null);
    } else if (this.form.value.etap_Descripcion == "" || this.form.value.etap_Descripcion == null){
        this.ErrorEtapa = "El campo es requerido."
        this.form.get('etap_Descripcion')?.setErrors({ 'invalidRoleId': true });
    }else {
      this.ErrorEtapa = "Opción no encontrada."
      this.form.get('etap_Descripcion')?.setErrors({ 'invalidRoleId': true });
    }

    let acti_Id = this.Actividad.find(proy => proy.acti_Descripcion === this.form.value.acti_Descripcion)?.acet_Id ?? 0;

    if(acti_Id !== 0){
      this.form.get('acti_Descripcion')?.setErrors(null);
    } else if (this.form.value.acti_Descripcion == "" || this.form.value.acti_Descripcion == null){
        this.ErrorActividad = "El campo es requerido."
        this.form.get('acti_Descripcion')?.setErrors({ 'invalidRoleId': true });
    }else {
      this.ErrorActividad = "Opción no encontrada."
      this.form.get('acti_Descripcion')?.setErrors({ 'invalidRoleId': true });
    }

    //valida si el formulario a enviar es valido
    if (this.form.valid) {
      //crea una constante para enviar el fomulario al servicio
      const actividad: ControlCalidad = {
        coca_Id: this.id,
        coca_Descripcion: this.form.value.coca_Descripcion,
        coca_Fecha: this.convertToISOFormat(this.form.controls['coca_Fecha'].value) ?? this.convertToISOFormat(new Date()),
        acet_Id: acti_Id,
        coca_CantidadTrabajada: this.form.value.coca_CantidadTrabajada,
        usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
      };
      //valida que el indetificador del formulario no sea editar
      if (this.identity !== 'editar') {
        if(this.filesArray.length > 0){

        //envia la constante del formulario al servicio de insertar control de calidad
        this.service.Insertar(actividad).subscribe(
          (respuesta: any) => {
            if (respuesta.data.codeStatus > 0) {
            this.id = respuesta.data.codeStatus //setea la variable id con el id del registro insertado
              for (let index = 0; index < this.formAimg.length; index++) {
                // Obtenemos el grupo de formularios en la posición 'index' dentro del FormArray
                // Usamos 'as FormGroup' para asegurarnos de que estamos trabajando con un FormGroup
                const currentGroup = this.formAimg.at(index) as FormGroup;

                // Añadimos un nuevo control llamado 'coca_Id' al grupo de formularios actual
                // El valor de este nuevo control será 'this.id', que es un valor almacenado en el componente
                currentGroup.addControl('coca_Id', new FormControl(this.id));
              }

              for (let index = 0; index < this.filesArray.length; index++) {
                this.service.InsertarImangenes(this.formAimg.value[index]).subscribe(
                  (respuesta: any) => {
                  //   if (respuesta.success) {
                  //   this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });

                  //   }
                  //   else{
                  //     // this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al insertar la imagen', life: 3000 });

                  //   }
                  });
              }

              this.GuardarImagenes();
              //Toast o mensaje de exito
              this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass: 'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
              this.Listado();//vuelve a cargar el listado principal
              this.CerrarControlCalidad();//utiliza la accion de cerrar
              this.submitted = false;//setea la variable submitted a falso
              this.id = 0;//setea la variable id en 0
              this.ingresado = 0
              this.cantidad = 0
              this.formAimg = new FormArray([]);
              this.filesArray = []
              this.images = []
              this.ListarTablaControlesMaster(this.form.value.proy_Id)
              this.visibleImages = []
              this.TablaMaestra = []
              this.form.get('imagen')?.setErrors({ 'invalidRoleId': false });

            }
            else if (respuesta.data.codeStatus == 0){
              this.messageService.add({ severity: 'warn', summary: 'Advertencia',  styleClass: 'iziToast-custom', detail: 'La cantidad trabajada no puede ser 0.', life: 3000 });
            }
            else {
              let positivoCodeStatus = Math.abs(respuesta.data.codeStatus);
              this.messageService.add({ severity: 'warn', summary: 'Advertencia',  styleClass: 'iziToast-custom', detail: 'El Control de calidad se excede por ' +positivoCodeStatus + '.', life: 3000 });
            }
          },
          error => {
            this.messageService.add({ severity: 'error', summary: 'Error',  styleClass: 'iziToast-custom', detail: 'Comuniquese con un Administrador.', life: 3000 });
          }
        );
      }else{
        this.messageService.add({ severity: 'warn', summary: 'Advertencia',  styleClass: 'iziToast-custom', detail: 'El Control de calidad necesita imágenes.', life: 3000 });
        this.form.get('imagen')?.setErrors({ 'invalidRoleId': true });
      }

      }
      else{
        //setea la variable Edit en true para que muestre el modal de editar
        this.Edit = true;
        this.formEditar = actividad//setea la variable formeditar con la constante del formulario
        this.Descripcion =  this.form.value.coca_Descripcion;
      }
    } else {
        this.form.get('acti_Descripcion')?.setErrors({ 'invalidRoleId': true });
        this.submitted = true;//setea la variable submitted a verdadera
    }
  }

  //accion de confirmar editar donde envia los datos del formulario a la accion de editar en el backend
  EditarG(){
    //valida si el control de calidad tiene imagenes ya sea en la tabla o el el input
    if((this.TablaMaestra.length != 0)||(this.filesArray.length != 0)){


      if(( this.form.value.acti_Id != 0)&&(this.form.value.acti_Id != null)){
        this.form.get('acti_Descripcion')?.setErrors(null);
      } else if (this.form.value.acti_Descripcion == "" || this.form.value.acti_Descripcion == null){
          this.ErrorActividad = "El campo es requerido."
          this.form.get('acti_Descripcion')?.setErrors({ 'invalidRoleId': true });
      }else {
        this.ErrorActividad = "Opción no encontrada."
        this.form.get('acti_Descripcion')?.setErrors({ 'invalidRoleId': true });
      }

    //envia la variable formEditar al servicio de actualizar Control de Calidad
    this.service.Actualizar(this.formEditar).subscribe(
      (respuesta: any) => {
        //verifica si la respuesta del servicio es satisfactoria
        if (respuesta.data.codeStatus > 0) {
          this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass: 'iziToast-custom', detail: 'Actualizado con Éxito.', life: 3000 });

          for (let index = 0; index < this.formAimg.length; index++) {
            // Obtenemos el grupo de formularios en la posición 'index' dentro del FormArray
            // Usamos 'as FormGroup' para asegurarnos de que estamos trabajando con un FormGroup
            const currentGroup = this.formAimg.at(index) as FormGroup;

            // Añadimos un nuevo control llamado 'coca_Id' al grupo de formularios actual
            // El valor de este nuevo control será 'this.id', que es un valor almacenado en el componente
            currentGroup.addControl('coca_Id', new FormControl(this.id));
          }

          //recorre el arrreglo de archivos de imagenes
          for (let index = 0; index < this.filesArray.length; index++) {
            //envia la variable de tipo formarray al servicio de insercion de imagenes
            this.service.InsertarImangenes(this.formAimg.value[index]).subscribe(
              (respuesta: any) => {
                // if (respuesta.success) {
                //    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });
                // }
                // else{
                //    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al insertar la imagen', life: 3000 });
                // }
              });
          }
          this.GuardarImagenes();
          this.tablaimg = false;//declara que no se muestre la tabla de imagenes
          this.Listado();//vuelve a cargar el listado principal
          this. ListarTablaControlesMaster(this.proy_id)
          this.CerrarControlCalidad();//utiliza la accion de cerrar
          this.submitted = false;//setea la variable submitted a false
          this.id = 0;//setea la variable id en 0
          this.identity = "Nuevo"//setea la variable indetificadora del formulario como nuevo
          this.ingresado = 0//setea el total ingresado en ese control a 0
          this.formAimg = new FormArray([]);
          this.cantidad = 0
          this.images = []
          this.visibleImages = []
          this.TablaMaestra = []
          this.form.get('imagen')?.setErrors({ 'invalidRoleId': false });

        }
        else {
          //toast o mensaje de error si la respuesta no fue exitosa
          let positivoCodeStatus = Math.abs(respuesta.data.codeStatus);
          this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'El Control de calidad se excede por ' +positivoCodeStatus + '.', life: 3000 });
          this.tablaimg = true;//declara que no se muestre la tabla de imagenes

        }
      },
      error => {
        //mensaje de error si el servicio tuvo un error
        this.messageService.add({ severity: 'error', summary: 'Error',  styleClass: 'iziToast-custom', detail: 'Comuniquese con un Administrador.', life: 3000 });
        this.tablaimg = true;//declara que no se muestre la tabla de imagenes
      }
    );
    this.tablaimg = false;//setea la variable tablaimg en false para que se oculte la tabla de imagenes
  }
    else
  {
    this.form.get('imagen')?.setErrors({ 'invalidRoleId': true });
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'El control de calidad no puede quedar sin imágenes.', life: 3000 });

  }
this.Edit = false;//setea la variable Edit en false para que se cierre el modal de editar
}

  // Expandir fila en la tabla
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

  // Listar tabla maestra pidiendo como parametro el id de control de calidad
  ListarTablaMaestra(control: number) {
    //setea la variable que muestra el spinner de la tabla maestra en verdadero
    this.isMasterLoading = true;
    //valida que el identificador del formulario no sea editar


    //envia el id solicitado al servicio de listar imagenes
    this.service.ListarImages(control).subscribe(
      (Terr: ControlCalidadImagen[]) => {
        //setea la variable de campos de la tabla maestra con el resultado del servicio
        this.TablaMaestra = Terr;

        //verifica si los datos del servicio son iguales a 0
          if(this.TablaMaestra.length === 0){
            //setea la variable que muestra el spinner a false para ocultarlo
            this.isMasterLoading = false;
            this.loadedImageMessage = "No hay imágenes existentes aún.";//mensaje que se muestra si no hay registros en la tabla
          }else{
            this.isMasterLoading = false;//oculta el spinner cuando se cargan los datos y no son 0
          }
      },
      error => {

            //setea la variable que muestra el spinner a false para ocultarlo
            this.isMasterLoading = false;
            this.loadedImageMessage = "A ocurrido un error.";//mensaje que se muestra si ocurrio un error en el servicio
      }
    );
  }

  allowOnlyAlphanumeric(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    inputElement.value = texto
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');
    this.form.controls['coca_Descripcion'].setValue(inputElement.value);

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
    (Terr: ControlCalidad[]) => {
      this.ControlCalidadAny = Terr;//variable any de listar para calculos

      //setea la variable de campos de la tabla maestra con el resultado del servicio
      this.controlcalidad = Terr;

      //verifica si los datos del servicio son iguales a 0
        if(this.controlcalidad.length === 0){
          //setea la variable que muestra el spinner a false para ocultarlo
          this.isMasterLoading = false;
          this.loadedTableMessage = "No se encontraron controles de calidad.";//mensaje que se muestra si no hay registros en la tabla
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


  //accion que abre el modal de eliminar y envia el id
  EliminarControlCalidad() {
    //verifica si la seleccion del campo no esta vacia
    if (this.selectedControlcalidad) {
      //setea el valor de la variable id con el valor del id de la variable selectedContorlCalidad
      this.id = this.selectedControlcalidad.coca_Id!;
      this.Descripcion = this.selectedControlcalidad.coca_Descripcion;

      this.Delete = true;//setea la variable Delete a true para que se muestre el modal de confirmacion
    }
  }

  //accion que abre el modal de eliminar y envia el id
  ArpobarControlCalidad() {
    //verifica si la seleccion del campo no esta vacia
    if (this.selectedControlcalidad) {
      //setea el valor de la variable id con el valor del id de la variable selectedContorlCalidad
      this.id = this.selectedControlcalidad.coca_Id!;

      this.Aprobe = true;//setea la variable Delete a true para que se muestre el modal de confirmacion
    }
  }

  Aprobar(){
   // Inicializa variables para el mensaje o toast de respuesta
   let severity = 'error';
   let summary = 'Error';
 //manejo de errores try-catch
 try{
   //envia la variable id al servicio de eliminar
   this.service.Aprobar(this.selectedControlcalidad.coca_Id)
       .subscribe((respuesta: any) => {
         //crea una variable y la setea con el mensajestatus que regresa el servicio
         let detail = respuesta.data.messageStatus;
           // valida si el codigo de respuesta del servicio es 200
           if (respuesta.code === 200) {
               // Si la eliminación fue exitosa o hay una advertencia setea las variables
               severity = respuesta.data.codeStatus > 0 ? 'success' : 'warn';
               summary = respuesta.data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
                this.Listado();
                this.ListarTablaControlesMaster( this.proy_id )

           } else if(respuesta.code === 500){
                 // Si hubo un error interno setea las variables del inicio de la accion
               severity = 'error';
               summary = 'Error Interno';
             this.Listado();
            }
           //setea el mensaje o toast con las variables de antes
           this.messageService.add({
             severity,
             summary,
             styleClass: 'iziToast-custom',
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
       styleClass: 'iziToast-custom',
       detail: error.message || error,
       life: 3000
   });

     }
     // Utiliza la accion de listado
     this.Listado();
     // this.ngOnInit();
     this.Aprobe = false; //setea la variable Delete en false y cierra el modal

  }

   //accion de eliminar, que envia el id al backend
   Eliminar() {
    // Inicializa variables para el mensaje o toast de respuesta
    let severity = 'error';
    let summary = 'Error';
  //manejo de errores try-catch
  try{
    //envia la variable id al servicio de eliminar
    this.service.Eliminar(this.id)
        .subscribe((respuesta: Respuesta) => {
          //crea una variable y la setea con el mensajestatus que regresa el servicio
          let detail = respuesta.data.messageStatus;
            // valida si el codigo de respuesta del servicio es 200
            if (respuesta.code === 200) {
                // Si la eliminación fue exitosa o hay una advertencia setea las variables
                severity = respuesta.data.codeStatus > 0 ? 'success' : 'warn';
                summary = respuesta.data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
                this.Listado();
                this.ListarTablaControlesMaster( this.proy_id )
            } else if(respuesta.code === 500){
                  // Si hubo un error interno setea las variables del inicio de la accion
                severity = 'error';
                summary = 'Error Interno';
                this.Listado();
            }
            //setea el mensaje o toast con las variables de antes
            this.messageService.add({
              severity,
              summary,
              styleClass: 'iziToast-custom',
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
        styleClass: 'iziToast-custom',
        detail: error.message || error,
        life: 3000
    });

      }
      // Utiliza la accion de listado
      this.Listado();
      // this.ngOnInit();
      this.Delete = false; //setea la variable Delete en false y cierra el modal
  }

  //accion de eliminar imagen
  EliminarImagen(imagen: ControlCalidadImagen) {

    this.selectedControlcalidadimagen = imagen.icca_Id;

    if(this.selectedControlcalidadimagen != 0){
      this.service.EliminarImagen(this.selectedControlcalidadimagen).subscribe(
        (control: any) => {
          if(control.data.codeStatus == 1){
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000 });
            this.ListarTablaMaestra(this.id);
          }
        }
      )
      this.ListarTablaMaestra(this.id);
    }
    else{
    }
  }


  //accion de detalles de Control de Calidad
  DetalleControlCalidad(){
    this.Index = false;//setea la variable Index para que se oculte la tabla principal
    this.Create = false;//setea la variable Create para que se oculte el formulario
    this.Detail = true;//setea la variable Detail para que se muestren los detalles
    //#region  seteo de variables de detalles
    this.detallecodigo = this.selectedControlcalidad.codigo;
    this.detallecoca_Descripcion = this.selectedControlcalidad.coca_Descripcion;
    this.detallecoca_Fecha = new Date(this.selectedControlcalidad.coca_Fecha).toLocaleDateString();
    this.detallecoca_MetrosTrabajados = this.selectedControlcalidad.coca_CantidadTrabajada;
    this.detalleacti_Descripcion = this.selectedControlcalidad.acti_Descripcion;
    this.detalleetap_Descripcion = this.selectedControlcalidad.etap_Descripcion;
    this.detalleproy_Descripcion = this.selectedControlcalidad.proy_Nombre;
    this.detalleusuaCreacion = this.selectedControlcalidad.usuaCreacion;
    if (this.selectedControlcalidad.usuaModificacion != null) {
      this.detalleusuaModificacion = this.selectedControlcalidad.usuaModificacion;
      this.detallecoca_FechaModificacion = new Date(this.selectedControlcalidad.coca_FechaModificacion).toLocaleDateString();

    }else{
      this.detalleusuaModificacion = "";
      this.detallecoca_FechaModificacion = "";
    }

    this.detallecoca_FechaCreacion = new Date(this.selectedControlcalidad.coca_FechaCreacion).toLocaleDateString();
    //#endregion
    this.id = this.selectedControlcalidad.coca_Id!;
    this.ListarTablaMaestra(this.id)
    }

}
