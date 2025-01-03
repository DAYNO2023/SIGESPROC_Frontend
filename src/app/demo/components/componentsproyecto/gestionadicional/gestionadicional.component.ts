import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { GestionAdicionalService } from 'src/app/demo/services/servicesproyecto/gestionadicional.service';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { GestionAdicional, GestionAdicionalImagen } from 'src/app/demo/models/modelsproyecto/gestionadicionalviewmodel';
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
import { CookieService } from 'ngx-cookie-service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-gestionadicional',
  templateUrl: './gestionadicional.component.html',
  styleUrl: './gestionadicional.component.scss'
})
export class GestionAdicionalComponent {
  @ViewChild('fileUploader') fileUploader: FileUpload;

//#region  Variables
  form: FormGroup;//variable de tipo formgroup que almacena los datos de los formularios
  formimg: FormGroup;//variable de tipo formgroup que almacena los datos de los formularios
  formAimg: FormArray;//vatiable de tipo formArray que usare para guardar las imagenes
  items: MenuItem[] = [];//variable que almacena los items de la lista de acciones por
  isTableLoading: boolean = false;//variable para mostrar el spinner
  loadedTableMessage: string = "";//variable para almacenar el mensaje de carga
  gestionadicional: GestionAdicional[] = [];//variable de tipo Actividades-viewmodel, que almacena el listado de actividades.
  Create: boolean = false;//variable que sirve para mostrar el formulario de crear-editar
  Index: boolean = true;//variable que sirve para mostrar el listado principal
  Detail: boolean = false;//variable que sirve para mostrar el apartado de detalles
  identity = 'Crear';//variable para identificar si se crea o de edita con el formulario
  titulo = 'Nueva Gestión Adicional';//variable que almacena el titulo del formulario crear-editar
  submitted: boolean = false;//variable que muestra un error en rojo cuando los campos del formulario estan vacios
  id : number = parseInt(this.cookieService.get('usua_Id'));
  id2: number = 0;
  idGestion: number = 0;
  ;//variable que almacena el id
  Proyectos: Proyecto[] = [];
  Proyectofill: Proyecto[] | undefined
  Etapa: Etapa[] = [];
  visibleImages: string[] = [];
  selectedImageIndex: number | null = null;
  Etapafill: Etapa[] | undefined
  Actividad: ActividadPorEtapa[] = [];
  Actividadfill : ActividadPorEtapa[] | undefined
  cantidad: any;
  selectedGestionAdicional: GestionAdicional | undefined;
  selectedGestionAdicionalimagen:number = 0;
  expandedRows: any = {};
  TablaMaestra: GestionAdicionalImagen[] = [];
  filesArray: File[] = [];
  filemaneunique: any;
  minDate: Date;
  Delete: boolean = false//varible para mostrar el modal eliminar
  Edit: boolean = false//varible para mostrar el modal Editar
  tablaimg: boolean = false//varible para mostrar el modal Editar
  Descripcion: string = "";
  formEditar : any;
  loading : boolean = true;
notFound : boolean = false;
notFound1 : boolean = false;
notFound2 : boolean = false;
startIndex: number = 0;
    selectedImage: string | null = null;
    visibleCount: number = 4;
    loadedImageMessage: string = "";
  //#region Detalles
  Datos = [{}];
  detallecodigo ?: number;
  detalleadic_Descripcion ?: string;
  detalleadic_Fecha ?: string;
  detalleusuaCreacion ?: string;
  detalleadic_FechaCreacion ?: string;
  detalleusuaModificacion ?: string;
  detalleadic_FechaModificacion ?: string;
  detalleadic_PresupuestoAdicional ?: number;
  detalleacti_Descripcion ?: string;
  detalleetap_Descripcion ?: string;
  detalleproy_Nombre ?: string;
  images: string[] = [];
  //#endregion

  //#endregion

  constructor(
    private messageService: MessageService,
    private service: GestionAdicionalService,
    private compraservice: CompraService,
    private documentoService: DocumentoBienRaizService,
    private sanitizer: DomSanitizer,
    public cookieService: CookieService,
    public globalMoneda: globalmonedaService,
    private fb: FormBuilder,
    private Router : Router

  ) {




        this.Router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          // Si la URL coincide con la de este componente, forzamos la ejecución
          if (event.urlAfterRedirects.includes('/sigesproc/proyecto/gestionesadicionales')) {
            // Aquí puedes volver a ejecutar ngOnInit o un método específico
            this.onRouteChange();
          }
        });



    this.form = this.fb.group({
      adic_Descripcion: ['', Validators.required],
      adic_Fecha: ['', Validators.required],
      proy_Id: ['', Validators.required],
      proy_Nombre: ['', Validators.required],
      etpr_Id:['', Validators.required],
      etap_Descripcion: ['', Validators.required],
      acet_Id: ['', Validators.required],
      acti_Descripcion: ['', Validators.required],
      adic_PresupuestoAdicional: ['', Validators.required],
    });

    this.formimg = new FormGroup({
      adic_Id: new FormControl(''),
      Imge_Imagen : new FormControl(''),
      usua_Creacion: new FormControl(''),
    });
  }

  onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar
    this.ngOnInit();
  }

  //accion que se realiza al inicializar el componente
  ngOnInit(): void {

    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;

   this.minDate = new Date();
   this.minDate.setFullYear(2024, 0, 1);

    const token = this.cookieService.get('Token');
    if (token == 'false') {
      this.Router.navigate(['/auth/login'])
    }

    if (!this.globalMoneda.getState()) {
      this.globalMoneda.setState()
    }

    this.Listado();

    this.formAimg = new FormArray([]);

    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.EditarControlCalidad() },
      { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleUnidadMedida()},
      { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.EliminarActividad() }
    ];
  }

  //accion que entra al backend y devuelve el listado de la tabla
  Listado() {
    this.isTableLoading = true;
    this.service.Listar().subscribe(
      (data: any) => {
        this.gestionadicional = data.map(( gestion: any) => ({
          ... gestion,
         detalle_usuaCreacion: gestion.usuaCreacion,
         adic_FechaCreacion : new Date(gestion.adic_FechaCreacion).toLocaleDateString(),

         adic_FechaModificacion: new Date(gestion.adic_FechaModificacion).toLocaleDateString(),
        }));
        // this.gestionadicional.coca_Fecha = new Date(actividad.acti_FechaCreacion).toLocaleDateString();
        if(this.gestionadicional.length === 0){
          this.isTableLoading = false; //mensaje que se muestra si no hay registros en la tabla
        }else{
          this.isTableLoading = false;//oculta el spinner cuando se cargan los datos y no son 0
          this.Index = true;
        }
      },
      error => {
          this.isTableLoading = false;//oculta el spinner cuando se cargan los datos y no son 0
          // this.loadedTableMessage = "Error al cargar datos.";//mensaje que se muestra si no hay registros en la tabla
      }
    );

    this.compraservice.ListarProyectos().subscribe((data: any[]) => {
        this.Proyectos = data;
      }
    );
  }

    //accion para la barra de busqueda
    onGlobalFilter(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }


   //accion que selecciona un campo de la tabla y llena sus valores en una variable
   onRowSelect(gestionadicional: GestionAdicional) {
    this.selectedGestionAdicional = gestionadicional;
    this.Descripcion = gestionadicional.adic_Descripcion;
  }

  onimagenSelect(imagen: GestionAdicionalImagen) {
    this.selectedGestionAdicionalimagen = imagen.imge_Id;
    console.log('ID de imagen seleccionada:', this.selectedGestionAdicionalimagen);
    this.EliminarImagen();
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
                    imge_Imagen: [imageUrl],
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
          this.service.InsertarImangenes(file).subscribe(
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
  // Verifica si hay imágenes en la lista
  if (this.images.length > 0) {
    // Elimina todas las imágenes locales
    this.images = [];
    this.imageIds = []; // Si tienes IDs de imágenes asociadas
    this.formAimg.clear(); // Elimina todas las entradas del FormArray
    this.filesArray = []; // Elimina todos los archivos
    this.selectedImage = null; // Reinicia la imagen seleccionada
    this.selectedImageIndex = null; // Reinicia el índice de la imagen seleccionada
    this.startIndex = 0; // Reinicia el índice de inicio, si es necesario
  }

  // Actualiza las imágenes visibles después de limpiar
  this.updateVisibleImages();
}

imageIds: number[] = [];


cargarImagenes(idG: number = this.idGestion) {
    this.service.ListarImages(idG).subscribe(
        (imagenes) => {
            this.images = imagenes.map((img: any) => `${this.service.getApiUrl()}${img.imge_Imagen}`);
            // Cargar los IDs de las imágenes
            this.imageIds = imagenes.map((img: any) => img.Imge_Id);
            this.updateVisibleImages();
        },
        (error) => {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                styleClass: 'iziToast-custom',
                detail: 'Error al cargar las imágenes la gestión adicional.',
            });
        }
    );
}



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
        } 
      },
      (error: any) => {
      }
    );
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
      .sort((a, b) => a.proy_Nombre.localeCompare(b.proy_Nombre));

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
    .filter(proy => proy.etap_Descripcion.toLowerCase().includes(query))
    .sort((a,b) => a.etap_Descripcion.localeCompare(b.etap_Descripcion));

    this.notFound1 = this.Etapafill.length === 0;

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

    this.notFound2  = this.Actividadfill.length === 0;

  }

  //despliega el formulario de crear
  CrearControlCalidad() {
    this.Index = false;
    this.Create = true;
    this.Detail = false;
    this.form.reset();
    this.identity = 'crear';
    this.titulo = 'Nueva Gestión Adicional';
    this.submitted = false;
    this.tablaimg = false;
  }

 //pliega la accion activa
  CerrarControlCalidad() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.tablaimg = false;
    this.submitted = false
    this.visibleImages = []
    delete this.expandedRows[this.idGestion];
    this.images = []
    this.formAimg = new FormArray([]);
    this.TablaMaestra = []

  }


 //Valida que solo se puedan colocar letras en los inputs
  ValidarTexto(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zñA-ZÑ\s]+$/.test(key) && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  setDateProperties(obj: any) {
    const isDateString = (value: any): boolean => {
      return typeof value === 'string' && !isNaN(Date.parse(value));
    };

    for (const key in obj) {
        if (!key.endsWith('DireccionExacta') &&
            !key.endsWith('Nombre') &&
            !key.endsWith('Descripcion')
            && isDateString(obj[key])) {
            obj[key] = new Date(obj[key]);
        }
        }
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



 //despliega el formulario de editar llenando los campos del formulario
 EditarControlCalidad() {
  this.Detail = false;
  this.Index = false;
  this.Create = true;
  this.identity = 'editar';
  this.titulo = 'Editar Gestión Adicional';
  this.tablaimg = true;


  if (this.selectedGestionAdicional) {
    this.form.patchValue({
      adic_Descripcion: this.selectedGestionAdicional.adic_Descripcion,
      adic_Fecha: new Date(this.selectedGestionAdicional.adic_Fecha),
      adic_PresupuestoAdicional: this.selectedGestionAdicional.adic_PresupuestoAdicional,

      acet_Id: this.selectedGestionAdicional.acet_Id,
      etpr_Id: this.selectedGestionAdicional.etpr_Id,
      proy_Id: this.selectedGestionAdicional.proy_Id,

      etap_Descripcion: this.selectedGestionAdicional.etap_Descripcion,
      proy_Nombre: this.selectedGestionAdicional.proy_Nombre, //Cambiar a nombre
      acti_Descripcion: this.selectedGestionAdicional.acti_Descripcion
    });


    this.compraservice.ListarProyectosPorEtapa(this.selectedGestionAdicional.proy_Id).subscribe((data: any[]) => {
      this.Etapa = data;
    });
    this.compraservice.ListarActividadesPorEtapa(this.selectedGestionAdicional.etpr_Id).subscribe((data: any[]) => {
      this.Actividad = data;
    });

    this.idGestion = this.selectedGestionAdicional.adic_Id;
    this.ListarTablaMaestra(this.idGestion)
  }
}

convertToISOFormat(date: Date | string): string {
    if (!date) return null;
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) {
        console.error('Invalid date value:', date);
        return null;
    }
    return parsedDate.toISOString();
}


  //accion que envia los datos del formulario al insertar o los setean en una variable y lo envian al editar
  //tambien abre el modal de editar
  Guardar() {
    if (this.form.valid) {
      const actividad: any = {
        adic_Id: this.idGestion,
        adic_Descripcion: this.form.value.adic_Descripcion,
        adic_Fecha: this.form.value.adic_Fecha,
        acet_Id: this.form.value.acet_Id,
        adic_PresupuestoAdicional: this.form.value.adic_PresupuestoAdicional,
        usua_Creacion: this.id,
        usua_Modificacion: this.id
      };


      if (this.form.value.adic_PresupuestoAdicional < 0 || this.form.value.adic_PresupuestoAdicional == " " ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'El presupuesto no puede ser menor de 0.00 LPS',
          styleClass: 'iziToast-custom'
        });
        return;
      }

      if (this.identity !== 'editar') {
        actividad.adic_FechaCreacion = new Date();
        this.service.Insertar(actividad).subscribe(
          (respuesta: any) => {
            if (respuesta.success) {
            this.idGestion = respuesta.data.codeStatus
              for (let index = 0; index < this.formAimg.length; index++) {
                // Obtenemos el grupo de formularios en la posición 'index' dentro del FormArray
                // Usamos 'as FormGroup' para asegurarnos de que estamos trabajando con un FormGroup
                const currentGroup = this.formAimg.at(index) as FormGroup;

                // Añadimos un nuevo control llamado 'coca_Id' al grupo de formularios actual
                // El valor de este nuevo control será 'this.id', que es un valor almacenado en el componente
                currentGroup.addControl('adic_Id', new FormControl(this.idGestion));
              }

              for (let index = 0; index < this.filesArray.length; index++) {
                this.uploadImage(this.filesArray[index])

                this.service.InsertarImangenes(this.formAimg.value[index]).subscribe(
                  (respuesta: any) => {
                    if (respuesta.success) {
                  // this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });

                    }
                    else{
                      this.messageService.add({ severity: 'error',         styleClass: 'iziToast-custom' ,
                        summary: 'Error', detail: 'Hubo un problema al insertar la imagen', life: 3000 });

                    }
                  });
              }

              this.Listado();
                      this.CerrarControlCalidad();
                      this.submitted = false;
                      this.idGestion = 0;

            } else if (respuesta.success) {
              this.messageService.add({ severity: 'error',         styleClass: 'iziToast-custom' ,
                summary: 'Error', detail: 'El registro ya Existe. ' + respuesta.message, life: 3000 });
              console.error('Error al insertar:', respuesta);
            }
            else {
              this.messageService.add({ severity: 'error',         styleClass: 'iziToast-custom' ,
                summary: 'Error', detail: 'El registro ya Existe. ' + respuesta.message, life: 3000 });
              console.error('Error al insertar:', respuesta);
            }
          },
          error => {
            this.messageService.add({ severity: 'error',         styleClass: 'iziToast-custom' ,
              summary: 'Error', detail: 'Comuniquese con un Administrador.', life: 3000 });
            console.error('Error inesperado al insertar:', error);
          }
        );
      }
      else{
        this.Edit = true;
        this.formEditar = actividad
      }
    } else {
        this.submitted = true;
    }

    this.ListarTablaMaestra(this.idGestion)
    this.visibleImages = []
    this.TablaMaestra = []
  }

  //accion de confirmar editar donde envia los datos del formulario a la accion de editar en el backend
  EditarG(){
    const editar: any = {
      adic_Id: this.idGestion,
      adic_Descripcion: this.form.value.adic_Descripcion,
      adic_Fecha: this.form.value.adic_Fecha,
      acet_Id: this.form.value.acet_Id,
      adic_PresupuestoAdicional: this.form.value.adic_PresupuestoAdicional,
      usua_Modificacion: this.id
     };
    this.service.Actualizar(editar).subscribe(
      (respuesta: any) => {
        if (respuesta.success) {
          this.messageService.add({ severity: 'success',        styleClass: 'iziToast-custom' ,
            summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 });

          for (let index = 0; index < this.formAimg.length; index++) {
            // Obtenemos el grupo de formularios en la posición 'index' dentro del FormArray
            // Usamos 'as FormGroup' para asegurarnos de que estamos trabajando con un FormGroup
            const currentGroup = this.formAimg.at(index) as FormGroup;

            // Añadimos un nuevo control llamado 'coca_Id' al grupo de formularios actual
            // El valor de este nuevo control será 'this.id', que es un valor almacenado en el componente
            currentGroup.addControl('adic_Id', new FormControl(this.idGestion));
          }

          for (let index = 0; index < this.filesArray.length; index++) {
            this.uploadImage(this.filesArray[index])

            this.service.InsertarImangenes(this.formAimg.value[index]).subscribe(
              (respuesta: any) => {
                if (respuesta.success) {
                }
                else{
                  this.messageService.add({ severity: 'error',        styleClass: 'iziToast-custom' ,
                    summary: 'Error', detail: 'Hubo un problema al insertar la imagen', life: 3000 });
                }
              });
          }
          this.tablaimg = false;
          this.Listado();
          this.CerrarControlCalidad();
          this.idGestion  = 0;

        }
        else {
          this.messageService.add({ severity: 'error',        styleClass: 'iziToast-custom' ,
            summary: 'Error', detail: 'El registro ya Existe. ' + respuesta.message, life: 3000 });
          console.error('Error al insertar:', respuesta);
        }
      },
      error => {
        this.messageService.add({ severity: 'error',         styleClass: 'iziToast-custom' ,
          summary: 'Error', detail: 'Comuniquese con un Administrador.', life: 3000 });
        console.error('Error inesperado al insertar:', error);
      }
    );
    this.Edit = false;
    this.tablaimg = false;
  }

  // Expandir fila en la tabla
  onRowExpand(event: any): void {
    const con = event.data;
    this.expandedRows ={}; 
    this.ListarTablaMaestra(con.adic_Id);
}

onRowCollapse(event: any) {
    delete this.expandedRows[event.data.adic_Id]; // Asegúrate de acceder a `event.data`
}
 
adic_Id = 0;
  // Listar tabla maestra
  ListarTablaMaestra(gestion: number) {
    //setea la variable que muestra el spinner de la tabla maestra en verdadero
    this.loading = true;
    //valida que el identificador del formulario no sea editar
    this.expandedRows[gestion] = true;
  this.adic_Id = gestion
    //envia el id solicitado al servicio de listar imagenes
    this.service.ListarImages(gestion).subscribe(
      (Terr: GestionAdicionalImagen[]) => {
        //setea la variable de campos de la tabla maestra con el resultado del servicio
        this.TablaMaestra = Terr;

        //verifica si los datos del servicio son iguales a 0
          if(this.TablaMaestra.length === 0){
            //setea la variable que muestra el spinner a false para ocultarlo
            this.loading = false;
            this.loadedImageMessage = "No hay imágenes existentes aún.";//mensaje que se muestra si no hay registros en la tabla
          }else{
            this.loading = false;//oculta el spinner cuando se cargan los datos y no son 0
          }
      },
      error => {

            //setea la variable que muestra el spinner a false para ocultarlo
            this.loading = false;
            this.loadedImageMessage = "A ocurrido un error.";//mensaje que se muestra si ocurrio un error en el servicio
      }
    );
  }

  //accion que abre el modal de eliminar y envia el id
  EliminarActividad() {
    if (this.selectedGestionAdicional) {
      this.idGestion = this.selectedGestionAdicional.adic_Id;
      this.service.Eliminar(this.idGestion).subscribe(
        (control: GestionAdicional) => {
        }
      )
      this.Delete = true;
    }
  }

   //accion de eliminar, que envia el id al backend
   Eliminar() {
    // Inicializa variables para el mensaje del servicio


  try{
    this.service.Eliminar(this.idGestion)
        .subscribe((respuesta: Respuesta) => {
          let detail = respuesta.data.messageStatus;
            if (respuesta.code === 200) {
              this.messageService.add({ severity: 'success',        styleClass: 'iziToast-custom' ,
                summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000 });

            }
        });
      }
      catch (error){
      // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
      this.messageService.add({
        severity: 'error',
        summary: 'Error Externo',
        detail: error.message || error,
        styleClass: 'iziToast-custom' ,

        life: 3000
    });

      }
      // Reinicia el componente
      this.Listado();
      // this.ngOnInit();
      this.Delete = false;
  }


  EliminarImagen() {
      this.service.EliminarImagen(this.selectedGestionAdicionalimagen).subscribe(
        (control: GestionAdicionalImagen) => {
          this.messageService.add({ severity: 'success',         styleClass: 'iziToast-custom' ,
            summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000 });

          this.ListarTablaMaestra(this.idGestion);
        }
      )
  }


  DetalleUnidadMedida(){
    this.Index = false;
    this.Create = false;
    this.Detail = true;
    this.titulo = 'Detalle Gestión Adicional'
    this.detallecodigo = this.selectedGestionAdicional.codigo;
    this.detalleadic_Descripcion = this.selectedGestionAdicional.adic_Descripcion;
    this.detalleadic_Fecha = this.selectedGestionAdicional.adic_Fecha;
    this.detalleadic_PresupuestoAdicional = this.selectedGestionAdicional.adic_PresupuestoAdicional;
    this.detalleacti_Descripcion = this.selectedGestionAdicional.acti_Descripcion;
    this.detalleetap_Descripcion = this.selectedGestionAdicional.etap_Descripcion;
    this.detalleproy_Nombre = this.selectedGestionAdicional.proy_Nombre;
    this.detalleusuaCreacion = this.selectedGestionAdicional.adic_UsuarioCreacion;
    if (this.selectedGestionAdicional.adic_UsuarioModificacion != null) {
      this.detalleusuaModificacion = this.selectedGestionAdicional.adic_UsuarioModificacion;
      this.detalleadic_FechaModificacion = this.selectedGestionAdicional.adic_FechaModificacion;

    }else{
      this.detalleusuaModificacion = "";
      this.detalleadic_FechaModificacion = "";
    }

    this.detalleadic_FechaCreacion = this.selectedGestionAdicional.adic_FechaCreacion;

    }
}
