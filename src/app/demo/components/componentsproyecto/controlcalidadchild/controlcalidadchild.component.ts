import { Component, ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import {
    DomSanitizer,
    SafeResourceUrl,
    SafeUrl,
} from '@angular/platform-browser';
import { ventabienraizservice } from 'src/app/demo/services/servicesbienraiz/ventabienraiz.service'
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { ControlCalidadService } from 'src/app/demo/services/servicesproyecto/controlcalidad.service';
import {
    ControlCalidad,
    ControlCalidadImagen,
} from 'src/app/demo/models/modelsproyecto/controlcalidadviewmodel';
import { CompraService } from 'src/app/demo/services/servicesinsumo/compra.service';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { Proyecto } from 'src/app/demo/models/modelsproyecto/proyectoviewmodel';
import { Table, TableModule } from 'primeng/table';
import { Etapa } from 'src/app/demo/models/modelsproyecto/etapaviewmodel';
import { ActividadPorEtapa } from 'src/app/demo/models/modelsproyecto/proyectoviewmodel';
import { FileUpload } from 'primeng/fileupload';
import { DocumentoBienRaizService } from 'src/app/demo/services/servicesbienraiz/documentoBienRaiz.service';
import { parse } from 'date-fns';

@Component({
    selector: 'app-controlcalidadchild',
    templateUrl: './controlcalidadchild.component.html',
    styleUrl: './controlcalidadchild.component.scss',
})
export class ControlcalidadchildComponent {
    @ViewChild('fileUploader') fileUploader: FileUpload;

    //region Variables
    startIndex = 0;
    visibleCount: number = 4;
    visibleImages: string[] = [];
    selectedImage: string | null = null;
    selectedImageIndex: number | null = null;
    images: string[] = [];
    imageIds: number[] = [];
    form: FormGroup;
    formimg: FormGroup;
    formAimg: FormArray;
    items: MenuItem[] = [];
    itemsNoEdit: MenuItem[] = [];
    isTableLoading: boolean = false;
    isMasterLoading: boolean = false;
    loadedTableMessage: string = '';
    controlcalidad: ControlCalidad[] = [];
    Create: boolean = false;
    Index: boolean = true;
    Detail: boolean = false;
    identity = 'Crear';
    titulo = 'Nuevo';
    submitted: boolean = false;
    id: number = 0;
    Proyectos: Proyecto[] = [];
    Proyectofill: Proyecto[] | undefined;
    Etapa: Etapa[] = [];
    Etapafill: Etapa[] | undefined;
    Actividad: ActividadPorEtapa[] = [];
    Actividadfill: ActividadPorEtapa[] | undefined;
    cantidad: any = 0;
    selectedControlcalidad: ControlCalidad | undefined;
    selectedControlcalidadimagen: number = 0;
    expandedRows: any = {};
    TablaMaestra: ControlCalidadImagen[] = [];
    filesArray: File[] = [];
    Delete: boolean = false;
    Aprobe: boolean = false;
    Deleteimg: boolean = false;
    Edit: boolean = false;
    tablaimg: boolean = false;
    Descripcion: string = '';
    formEditar: any;
    ControlCalidadAny: any;
    ingresado: number = 0;
    ckActividad: any;
    imagenesDeLaTabla: any[] = [];
    Datos = [];
    minDate: Date;
    maxDate: Date;
    //end variables

    //region Constructor
    constructor(
        private Router: Router,
        private CookieService: CookieService,
        private messageService: MessageService,
        private service: ControlCalidadService,
        private compraservice: CompraService,
        private documentoService: DocumentoBienRaizService,
        private sanitizer: DomSanitizer,
        private fb: FormBuilder,
        private vbien: ventabienraizservice,
    ) {
      this.minDate = new Date(1920, 0, 1);
      this.maxDate = new Date(9999, 0, 1);
        //formulario de control de calidad
        this.form = this.fb.group({
            coca_Descripcion: ['', Validators.required],
            coca_Fecha: ['', Validators.required],
            coca_CantidadTrabajada: ['', Validators.required],
        });
        //formulario de imagenes
        this.formimg = new FormGroup({
            coca_Id: new FormControl(''),
            icca_Imagen: new FormControl(''),
            usua_Creacion: new FormControl(''),
        });
    } //END Constructor

    //region OnInit
    ngOnInit() {
      this.Create = true;
      if(this.CookieService.get('Token') == 'false') this.Router.navigate(['/auth/login'])
      this.ckActividad = JSON.parse(this.CookieService.get('QAactividad'))
      this.Listado();
      this.cantidad = this.ckActividad.acet_Cantidad

      this.formAimg = new FormArray([]);

      if(this.CookieService.get('usua_Admin') === 'true'){
        this.items = [
          { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.EditarControlCalidad()},
          { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleControlCalidad()},
          { label: 'Aprobar', icon: 'pi pi-check', command: () => this.ArpobarControlCalidad()},
          { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.EliminarControlCalidad()}
        ];
      }else{
        this.items = [
          { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.EditarControlCalidad()},
          { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleControlCalidad()},
          // { label: 'Aprobar', icon: 'pi pi-check', command: () => this.ArpobarControlCalidad()},
          { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.EliminarControlCalidad()}
        ];
      }
      
       //setea la variable de items y sus acciones
       this.itemsNoEdit = [
        { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleControlCalidad()},
        { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.EliminarControlCalidad(), visible: true }
      ];

    } //END OnInit

    //region Metodos
    public Regresar() {
      if(this.Create){
        this.Router.navigate(['/sigesproc/proyecto/seguimientoproyecto']);
      }else if(!this.Create){
        this.Detail = false;
        this.Create = true;
        this.Datos = [];
        this.CerrarControlCalidad()
      }
    }

    scrollUp(): void {
        if (this.startIndex > 0) {
            this.startIndex = Math.max(this.startIndex - this.visibleCount, 0);
            this.updateVisibleImages();
        }
    }

    scrollDown(): void {
      if (this.startIndex < this.images.length - this.visibleCount) {
        this.startIndex = Math.min(
            this.startIndex + this.visibleCount,
            this.images.length - this.visibleCount
        );
        this.updateVisibleImages();
    }
    }

    updateVisibleImages(): void {
        this.visibleImages = this.images.slice(
            this.startIndex,
            this.startIndex + this.visibleCount
        );
    }

    ValidarTexto(event: KeyboardEvent) {
        const inputElement = event.target as HTMLInputElement;
        const key = event.key;
        //?valida que se inserten letras con o sin tildes
        if (
            !/^[a-zñA-ZÀ-ÿ0-9\u00f1\u00d1 ]+$/.test(key) &&
            key !== 'Backspace' &&
            key !== 'Tab'
        ) {
            event.preventDefault();
        }
        //?valida que el insert inicial no sea un espacio

        if (key === ' ' && inputElement.selectionStart === 0) {
            event.preventDefault();
        }
    }

    limpiar(): void {
        // Si estamos en modo de edición
        // Verifica si hay una imagen siseleccionada y  hay imágenes en la lista
        if (this.selectedImageIndex !== null && this.images.length > 0 && this.identity !== 'editar') {

            // Si la imagen no ha sido guardada (no tiene un ID), solo elimínala de la lista local
            this.images.splice(this.startIndex + this.selectedImageIndex, 1);
            this.formAimg.removeAt(this.startIndex + this.selectedImageIndex); //remueve el archivo por el indice
            this.filesArray.splice(
                this.startIndex + this.selectedImageIndex,
                1
            );
            this.selectedImage = null;
            this.selectedImageIndex = null;
            this.updateVisibleImages();
        }else if(this.identity == 'editar' && this.images.length > 0 && this.selectedImageIndex !== null){
                        // Obtén el ID de la imagen guardada
                        const imageId =
                        this.imageIds[this.startIndex + this.selectedImageIndex];
            this.EliminarImagen(imageId);
            this.images.splice(this.startIndex + this.selectedImageIndex, 1);
            this.formAimg.removeAt(this.startIndex + this.selectedImageIndex); //remueve el archivo por el indice
            this.filesArray.splice(
                this.startIndex + this.selectedImageIndex,
                1
            );
            this.selectedImage = null;
            this.selectedImageIndex = null;
            this.updateVisibleImages();
        }
    }

    Guardar() {
        //valida si el formulario a enviar es valido
        this.submitted = true
        if (this.form.valid && this.visibleImages.length > 0) {
            //crea una constante para enviar el fomulario al servicio
            const actividad: ControlCalidad = {
                acet_Id: this.ckActividad.acet_Id,
                coca_Id: this.id,
                coca_Descripcion: this.form.value.coca_Descripcion,
                coca_Fecha:
                    this.convertToISOFormat(
                        this.form.controls['coca_Fecha'].value
                    ) ?? this.convertToISOFormat(new Date()),
                coca_CantidadTrabajada: this.form.value.coca_CantidadTrabajada,
                usua_Creacion: parseInt(this.CookieService.get('usua_Id')),
                usua_Modificacion: parseInt(this.CookieService.get('usua_Id')),
            };
            //valida que el indetificador del formulario no sea editar
            if (this.identity !== 'editar') {
                //envia la constante del formulario al servicio de insertar control de calidad
                this.service.Insertar(actividad).subscribe(
                    (respuesta: any) => {
                        if (respuesta.data.codeStatus > 0) {
                            this.id = respuesta.data.codeStatus; //setea la variable id con el id del registro insertado
                            for (
                                let index = 0;
                                index < this.formAimg.length;
                                index++
                            ) {
                                // Obtenemos el grupo de formularios en la posición 'index' dentro del FormArray
                                // Usamos 'as FormGroup' para asegurarnos de que estamos trabajando con un FormGroup
                                const currentGroup = this.formAimg.at(
                                    index
                                ) as FormGroup;

                                // Añadimos un nuevo control llamado 'coca_Id' al grupo de formularios actual
                                // El valor de este nuevo control será 'this.id', que es un valor almacenado en el componente
                                currentGroup.addControl(
                                    'coca_Id',
                                    new FormControl(this.id)
                                );
                            }

                            for (
                                let index = 0;
                                index < this.filesArray.length;
                                index++
                            ) {
                                this.service
                                    .InsertarImangenes(
                                        this.formAimg.value[index]
                                    )
                                    .subscribe((respuesta: any) => {
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
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                styleClass: 'iziToast-custom',
                                detail: 'Insertado con Éxito.',
                                life: 3000,
                            });

                            this.ingresado = 0;
                            this.cantidad = 0;
                            this.Listado(); //vuelve a cargar el listado principal
                            this.CerrarControlCalidad(); //utiliza la accion de cerrar
                            this.submitted = false; //setea la variable submitted a falso
                            this.id = 0; //setea la variable id en 0
                            this.formAimg = new FormArray([]);
                            this.filesArray = [];
                            this.images = [];
                            this.visibleImages = [];
                        } else {
                            let positivoCodeStatus = Math.abs(
                                respuesta.data.codeStatus
                            );
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Advertencia',
                                styleClass: 'iziToast-custom',
                                detail:
                                    'El Control de calidad se excede por ' +
                                    positivoCodeStatus +
                                    '.',
                                life: 3000,
                            });
                            console.error('Error al insertar:', respuesta);
                        }
                    },
                    (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            styleClass: 'iziToast-custom',
                            detail: 'Comuniquese con un Administrador.',
                            life: 3000,
                        });
                        console.error('Error inesperado al insertar:', error);
                    }
                );
            } else {
              if (this.form.valid && this.visibleImages.length > 0){
                //setea la variable Edit en true para que muestre el modal de editar
                this.Edit = true;
                this.formEditar = actividad; //setea la variable formeditar con la constante del formulario
                this.Descripcion = this.form.value.coca_Descripcion;
              }
            }
        } else {
            this.submitted = true; //setea la variable submitted a verdadera
        }
    }

    convertToISOFormat(date: Date | string): string {
        if (!date) return null;
        //constante para typear la fecha
        const parsedDate = typeof date === 'string' ? new Date(date) : date;
        //valida que el formato de la fecha sea invalido
        if (isNaN(parsedDate.getTime())) {
            console.error('Invalid date value:', date); //imprime en consola la fecha invalida
            return null; //si es invalido devuelve null
        }
        return parsedDate.toISOString(); //retorna la fecha parseada
    }

    GuardarImagenes(): void {
        if (this.filesArray.length > 0) {
            this.filesArray.forEach((file) => {
                this.vbien.SubirImagen(file).subscribe(
                    (respuesta) => {
                    },
                    (error) => {
                        console.error(
                            'Error en la subida de la imagen:',
                            error
                        );
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

    Listado() {
      this.Create = true;
        //setea la variable de mostrar spinner
        this.isTableLoading = true;
        //entra al servicio de listar servicios
        this.service.ListarPorActividad(this.ckActividad.acet_Id).subscribe((data: any) => {
            // Filtra los controles de calidad donde acet_Id es 78
            const filteredData = data
            data.forEach((control: any) => {
                this.service.ListarImages(control.coca_Id).subscribe(
                    (imagenes) => {
                      this.imagenesDeLaTabla.push(imagenes[0])
                    }) 
            })
            this.ControlCalidadAny = filteredData; //variable any de listar para calculos
            
            //mapea los campos del resultado del servicio de control de calidad
            this.controlcalidad = filteredData.map((maquinaria: any) => ({
                ...maquinaria,
                //mapea las fechas
                coca_Fecha: new Date(maquinaria.coca_Fecha),
                coca_FechaCreacion: new Date(
                    maquinaria.coca_FechaCreacion
                ).toLocaleDateString(),
                coca_FechaModificacion: new Date(
                    maquinaria.coca_FechaModificacion
                ).toLocaleDateString(),
            }));

            this.controlcalidad.forEach(ctrl => {
                this.ingresado += parseInt(ctrl.coca_CantidadTrabajada)
            })
            
            this.isTableLoading = false;
        },
        () => {
            this.isTableLoading = false;
        });
    }
    

    CerrarControlCalidad() {
        this.Index = true; //muestra la tabla principal
        this.Detail = false; //oculta los detalles
        this.Create = true; //oculta el formulario
        this.tablaimg = false; //oculta la tabla de imagenes
        this.submitted = false; //setea el submitted como falso
        this.filesArray = []; //setea el arreglo de archivos como vacio
        //remueve los datos del formArray recorriendolo
        this.identity = 'Nuevo';
        for (let index = 0; index <= this.formAimg.length; index++) {
            this.formAimg.removeAt(0);
        }
        delete this.expandedRows[this.id]; //oculta la fila colapsada
        // this.cantidad = 0;
        // this.ingresado = 0;
        this.images = [];
        this.formAimg = new FormArray([]);
        this.visibleImages = [];
        this.form.reset();
    }

    EditarControlCalidad() {
        this.isTableLoading = true;
        this.submitted = false;
        this.Detail = false;
        this.Index = false;
        this.Create = true;
        this.identity = 'editar';
        this.titulo = 'Editar';
        this.tablaimg = true;
        
        
        // this.setDateProperties(this.selectedControlcalidad);
        
        if (this.selectedControlcalidad) {
          this.form.patchValue({
            coca_Descripcion: this.selectedControlcalidad.coca_Descripcion,
            coca_Fecha: new Date(this.selectedControlcalidad.coca_Fecha),
            coca_CantidadTrabajada: this.selectedControlcalidad.coca_CantidadTrabajada,
            
          });

            this.cargarImagenes(this.selectedControlcalidad.coca_Id);
          }()=>{
            
            this.isTableLoading = false;
        }

    }

      ListarTablaMaestra(control: number) {
        //setea la variable que muestra el spinner de la tabla maestra en verdadero
        this.isMasterLoading = true;
        //valida que el identificador del formulario no sea editar
        if (this.identity !== 'editar') {
          //seta el arreglo de expandedRows con el indice del id solicitado a true para que se despliegue la tabla maestra
          this.expandedRows[control] = true;
    
        }
        else{
    
          //seta el arreglo de expandedRows con el indice del id solicitado a false para que no se despliegue la tabla maestra
          this.expandedRows[control] = false;
        }
    
        //envia el id solicitado al servicio de listar imagenes
        this.service.ListarImages(control).subscribe(
          (Terr: ControlCalidadImagen[]) => {
            //setea la variable de campos de la tabla maestra con el resultado del servicio
            this.TablaMaestra = Terr;
    
            //verifica si los datos del servicio son iguales a 0
              if(this.TablaMaestra.length === 0){
                //setea la variable que muestra el spinner a false para ocultarlo
                this.isMasterLoading = false;
                this.loadedTableMessage = "No hay imagenes existentes aún.";//mensaje que se muestra si no hay registros en la tabla
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

        ArpobarControlCalidad() {
            //verifica si la seleccion del campo no esta vacia
            if (this.selectedControlcalidad) {
              //setea el valor de la variable id con el valor del id de la variable selectedContorlCalidad
              this.id = this.selectedControlcalidad.coca_Id!;
        
              this.Aprobe = true;//setea la variable Delete a true para que se muestre el modal de confirmacion
            }
          }

          EliminarControlCalidad() {
            //verifica si la seleccion del campo no esta vacia
            if (this.selectedControlcalidad) {
              //setea el valor de la variable id con el valor del id de la variable selectedContorlCalidad
              this.id = this.selectedControlcalidad.coca_Id!;
              this.Descripcion = this.selectedControlcalidad.coca_Descripcion;
        
              this.Delete = true;//setea la variable Delete a true para que se muestre el modal de confirmacion
            }
          }

          
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
      }

      triggerFileInput(): void {
        const fileInput = document.getElementById(
            'fileInput'
        ) as HTMLInputElement;
        fileInput.click();
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
                          styleClass: 'iziToast-custom',
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
                        usua_Creacion: parseInt(this.CookieService.get('usua_Id')),
                        
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
                    console.error('Error al leer archivos:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        styleClass: 'iziToast-custom',
                        detail: 'Error al leer archivos',
                        life: 3000,
                    });
                });
        }
    }

    onImageSelect(event: any): void {
  
        this.selectedImageIndex = event;
        this.selectedImage = this.visibleImages[event];
      }

      onRowSelect(controlcalidad: ControlCalidad) {
        this.selectedControlcalidad = controlcalidad;
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
                    this.ingresado = 0;
                    this.Listado();
                } else if(respuesta.code === 500){
                      // Si hubo un error interno setea las variables del inicio de la accion
                    severity = 'error';
                    summary = 'Error Interno';
                    this.ingresado = 0;
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
    EliminarImagen(imagen: number) {
      
        this.selectedControlcalidadimagen = imagen;
        
        if(this.selectedControlcalidadimagen){
          this.service.EliminarImagen(this.selectedControlcalidadimagen).subscribe(
            (control: any) => {
              if(control.data.codeStatus == 1){
                this.ListarTablaMaestra(this.id);
              }
            }
          )
          this.ListarTablaMaestra(this.id);
        }
    }

    getSafeUrl(base64: string): SafeUrl {
        return this.sanitizer.bypassSecurityTrustUrl(base64);
      }

    cargarImagenes(control: number) {
        this.service.ListarImages(control).subscribe({
            next: async(imagenes) => {
              //setea la variable de campos de la tabla maestra con el resultado del servicio
              this.images = await  imagenes.map( img => img.icca_Imagen);
              this.imageIds =  await imagenes.map( img => img.icca_Id);
              this.updateVisibleImages();
              this.isTableLoading = false;
            },
            complete: () => {
              this.isTableLoading = false;
            }
    })
    }

    EditarG(){
        //envia la variable formEditar al servicio de actualizar Control de Calidad
        this.formEditar ={
          coca_Id: this.selectedControlcalidad.coca_Id,
          coca_Descripcion: this.form.value.coca_Descripcion,
          coca_Fecha: this.form.value.coca_Fecha,
          coca_CantidadTrabajada: this.form.value.coca_CantidadTrabajada,
          acet_Id: this.ckActividad.acet_Id,
          coca_FechaModificacion: new Date(),
          usua_Modificacion: parseInt(this.CookieService.get('usua_Id'))
        }
        this.service.Actualizar(this.formEditar).subscribe(
          (respuesta: any) => {
            //verifica si la respuesta del servicio es satisfactoria
            if (respuesta.data.codeStatus > 0) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Actualizado con Éxito.', life: 3000 });
              
              for (let index = 0; index < this.formAimg.length; index++) {
                // Obtenemos el grupo de formularios en la posición 'index' dentro del FormArray
                // Usamos 'as FormGroup' para asegurarnos de que estamos trabajando con un FormGroup
                const currentGroup = this.formAimg.at(index) as FormGroup;
                
                // Añadimos un nuevo control llamado 'coca_Id' al grupo de formularios actual
                // El valor de este nuevo control será 'this.id', que es un valor almacenado en el componente
                currentGroup.addControl('coca_Id', new FormControl(this.selectedControlcalidad.coca_Id));
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
              this.CerrarControlCalidad();//utiliza la accion de cerrar
              this.submitted = false;//setea la variable submitted a false
              this.id = 0;//setea la variable id en 0
              this.identity = "Nuevo"//setea la variable indetificadora del formulario como nuevo
              this.ingresado = 0
              this.formAimg = new FormArray([]);
              this.cantidad = 0
              this.images = []
              this.visibleImages = []
            }
            else {
              //toast o mensaje de error si la respuesta no fue exitosa
              let positivoCodeStatus = Math.abs(respuesta.data.codeStatus);
              this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass: 'iziToast-custom', detail: 'El Control de calidad se excede por ' +positivoCodeStatus + '.', life: 3000 });
              
            }
            this.Create = true;
          },
          error => {
            //mensaje de error si el servicio tuvo un error
            this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'Comuniquese con un Administrador.', life: 3000 });
            console.error('Error inesperado al insertar:', error);
          }
        );
        this.Edit = false;//setea la variable Edit en false para que se cierre el modal de editar
        this.tablaimg = false;//setea la variable tablaimg en false para que se oculte la tabla de imagenes
      }  


      DetalleControlCalidad(){
        this.cargarImagenes(this.selectedControlcalidad.coca_Id)
        this.isTableLoading = true;
        this.Datos.push(this.selectedControlcalidad)
        this.Create = false;
        this.Detail = true;
      }

      onimagenSelect(imagen: ControlCalidadImagen) {
        this.selectedControlcalidadimagen = imagen.icca_Id;
        }

    //END Metodos
}
