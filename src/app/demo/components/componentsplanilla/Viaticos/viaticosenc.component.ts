import { Component, OnInit,ViewChild,ChangeDetectorRef,  ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators,AbstractControl  } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ViaticoService } from 'src/app/demo/services/servicesplanilla/viaticos.service';
import { autocompleteEmpleado } from 'src/app/demo/models/modelsacceso/usuarioviewmodel';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FileUpload } from 'primeng/fileupload';
import { ViaticosEncDet } from '../../../models/modelsplanilla/viaticoencdetviewmodel';
import { ProyectoService } from 'src/app/demo/services/servicesproyecto/proyecto.service';
import { MenuItem } from 'primeng/api';
import { vi } from 'date-fns/locale';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { set } from 'lodash';
import { CurrencyPipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';
import { Router, NavigationEnd  } from '@angular/router';

@Component({
  selector: 'app-viaticosenc',
  templateUrl: './viaticosenc.component.html',
  styleUrls: ['./viaticosenc.component.scss'],
  providers: [MessageService]
})
export class ViaticosencComponent implements OnInit {
  @ViewChild('descripcionInput') descripcionInput!: ElementRef;
  @ViewChild('fileUploader') fileUploader: FileUpload;
  form: FormGroup;
  form2: FormGroup;
  submitted = false;
  defaultImageUrl = 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fblog.century21colombia.com%2Fterrenos-en-venta-conoce-las-4-ventajas&psig=AOvVaw3dHjpRtwlXrhpz2U9KFOOe&ust=1721747577888000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCPDaxbL3uocDFQAAAAAdAAAAABAE';
  apimagenUrl = 'https://api.imgbb.com/1/upload';
  apiimagenKey = '200fe8447d77c936db33a6d227daf243';
  viaticoDetalles: ViaticosEncDet[] = [];
  Index = true;
  Editt = false;
  codigoVE="";
  loading = false;
  facturaEnEdicion: any = null;
  facturaSeleccionada: ViaticosEncDet;
  CreateEdit = false;
  viat = false;
  viatico: ViaticosEncDet ;
  Delete = false;
  Delete2 = false;
  usua_Id: number;
  facturas2: any[] = [];
  valor:number = null;
  empleados: autocompleteEmpleado[] = [];
  filtradoEmpleado: autocompleteEmpleado[] = [];
  Edit = false;
  finalizar = false;
  confirmardetalleModal=false;
  nombreImagen: string;
  filtradoProyectos: any[] = [];
  proyectos: any[] = [];
  identity: string = "Crear";
  empleado: string;
  categorias = {
    cavi_Id: "",
  };

  selectedCategoria: any;
  viaticos = [];
  filtradoCategoriasViaticos: any[] = [];
  facturas: any[] = [];
  items1= [
    { label: 'Detalle', icon: 'pi pi-eye', command: () => this.confirmdetEncDetalle() },
  ];
  viaticos2 = [
    { label: 'Viático 1', value: 20 },
    { label: 'Viático 2', value: 21 },
    { label: 'Viático 3', value: 19 }
  ];
  categoriasViaticos = [
  ];
  CreateEditD = false;

  items = [
    { label: 'Editar Viático', icon: 'pi pi-user-edit', command: () => this.loadViatico() },
    { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.confirmDelete() },
    { label: 'Agregar Facturas', icon: 'pi pi-plus', command: () => this.confirmdet() },
    { label: 'Finalizar', icon: 'pi pi-lock', command: () => this.ConfirmFinalizar() },

    { label: 'Detalle', icon: 'pi pi-eye', command: () => this.confirmdetEncDetalle() },

  ];
  selectedViatico: any;
  noResultsFound: boolean = false;
  noResultsFound2: boolean = false;
  noResultsFound3: boolean = false;


  constructor(
    private fb: FormBuilder,
    private viaticoService: ViaticoService,
    private messageService: MessageService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef, //Servicio para manejar los cambios en el mapa
    public cookieService: CookieService,
    private router: Router,
    public globalMoneda: globalmonedaService,
    private proyectoService: ProyectoService
  ) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/planilla/viaticos')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });

  }

  ngOnInit(): void {
    this.facturas = this.facturas || [];
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }

    this.usua_Id = parseInt(this.cookieService.get('usua_Id'));

    this.form = this.fb.group({
      empl_Id: ['', Validators.required],
      // vien_SaberProyeto: [false],
      proy_Descripcion: ['', Validators.required],
      empleado: ['', Validators.required],
      vien_MontoEstimado: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    });
   this.form2 = this.fb.group({
    // vide_Descripcion: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s0-9\.]*$/)]],
    vide_Descripcion: ['', [
      Validators.required, 
      Validators.pattern(/^(?!\s)[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s0-9\.]*(?<!\s)$/), 
      Validators.maxLength(100)
  ]],
    vide_ImagenFactura: ['', Validators.required],
    vide_MontoGastado:[null,  [Validators.required, Validators.pattern(/^\d*\.?\d*$/)]],
    // vien_Id: ['', Validators.required],
    cavi_Descripcion: ['', Validators.required],
    cavi_Id: ['', Validators.required],
    vide_MontoReconocido: [null,  [Validators.required, Validators.pattern(/^\d*\.?\d*$/)]],
  },{ validator: this.montoReconocidoValidator });
    this.loadCategoriasViaticos();
    this.loadproyectos();
    this.loadViaticos();
    this.loadEmpleados();
    if (!this.globalMoneda.getState()) {
      this.globalMoneda.setState()
    }
  }
  onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar
    this.Index = true;
    this.CreateEdit = false;
    this.CreateEditD = false;
    this.viat = false;
    this.Delete = false;
    this.Delete2 = false;
    this.confirmardetalleModal = false;
    this.Editt = false;
    this.finalizar = false;
    this.ngOnInit();
  }
  
  ConfirmFinalizar(){
    this.finalizar = true;
  }
  onMontoChange(value: number) {
    if (value === 0) {
      this.valor = value;
      this.form.controls['vien_MontoEstimado'].setValue(null); // Clear the value if it's zero
    }
  }
  
  
  Finalizar(): void {
    // this.getViaticoDetalles();
    if (this.selectedViatico.vien_TotalReconocido != 0) {
    this.viaticoService.Finalizar(this.selectedViatico.vien_Id).subscribe(
      (respuesta: any) => {
        if (respuesta.success) {
          this.messageService.add({ severity: 'success', styleClass: 'iziToast-custom', summary: 'Éxito', detail: 'Cerrado con éxito.', life: 3000 });
          this.loadViaticos();
          this.finalizar = false;
        } else {
          this.messageService.add({ severity: 'error', styleClass: 'iziToast-custom', summary: 'Error', detail: 'Accion fallida.', life: 3000 });
        }
        this.Delete = false;
      }
    );
  } else {
    this.finalizar = false;

    this.messageService.add({ severity: 'error', styleClass: 'iziToast-custom', summary: 'Error', detail: 'Debe de tener Facturas ingresadas para poder Finalizar el Viático' , life: 3000 });

  }
  }


  handleClick() {
    if (this.identity === 'Crear') {
      this.Guardar();
    } else if (this.identity === 'Editar') {
      this.Editt = true;
    }
  }
  confirmEdit() {
    this.Guardar();
    this.Editt = false;
  }

  // eliminarFactura(factura: any): void {
  //   const index = this.facturas.indexOf(factura);
  //   if (index !== -1) {
  //     this.facturas.splice(index, 1);
  //     this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000 });
  //   } else {
  //     this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Eliminación fallida.', life: 3000 });
  //   }
  // }

  editarFactura(factura: any): void {
    // Marcar la factura actual que se está editando
    this.facturaSeleccionada = factura;

    // Parchear los valores del formulario con los datos de la factura seleccionada
    this.form2.patchValue({
      vide_Descripcion: factura.vide_Descripcion,
      vide_MontoGastado: factura.vide_MontoGastado,
      vide_MontoReconocido: factura.vide_MontoReconocido,
      cavi_Descripcion: factura.cavi_Descripcion,
      vide_ImagenFactura: factura.vide_ImagenFactura,
      cavi_Id: factura.cavi_Id,
      vide_Id: factura.vide_Id,
      // Aquí puedes añadir cualquier otro campo de la factura que necesites editar
    });
      this.nombreImagen = factura.vide_ImagenFactura;
      setTimeout(() => {
        this.descripcionInput.nativeElement.focus();
      }, 0);
      // console.log(this.facturaSeleccionada);
    // Abrir el modal o mostrar el formulario de edición si está oculto
    this.CreateEditD = true;  // Esto asume que el modal se muestra con esta variable
  }

  handleEliminarD(factura: any): void{
    this.Delete2 = true;
    this.facturas2 = factura;
  }

  eliminarFactura(factura: any): void {
    // Comprobar si la factura tiene un ID, lo que indica que ya está en la base de datos
    if (factura.vide_Id !== 0) {
        // Llamar al servicio para eliminar la factura en la base de datos
        this.viaticoService.EliminarDetalle(factura.vide_Id).subscribe(
            (response) => {
                // Suponiendo que la respuesta indica un éxito en la eliminación
                this.removerFacturaDeLista(factura); // Eliminar de la lista local también
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',  styleClass: 'iziToast-custom',
                    detail: 'Factura eliminada con éxito de la base de datos.',
                    life: 3000
                });
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',  styleClass: 'iziToast-custom',
                    detail: 'Error al eliminar la factura de la base de datos.',
                    life: 3000
                });
                // console.error('Error al eliminar la factura:', error);
            }
        );
    } else {
        // Si no tiene ID, significa que es una factura agregada localmente
        this.removerFacturaDeLista(factura);
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',  styleClass: 'iziToast-custom',
            detail: 'Factura eliminada localmente.',
            life: 3000
        });
    }
}

// Método para eliminar la factura de la lista local
removerFacturaDeLista(factura: any): void {
    const index = this.facturas.indexOf(factura);
    if (index !== -1) {
        this.facturas.splice(index, 1);
    }
}
  onImageRemove(event: any): void {
    this.form2.get('vide_ImagenFactura').setValue(null);
    this.nombreImagen = null;
    const fileUpload = document.getElementById('p-fileupload') as any;
    if (fileUpload && fileUpload.clear) {
      fileUpload.clear();
    }
    this.cdr.detectChanges();
  }


  regresar(): void {
    this.Cancelar();
    this.CancelarD();
    this.viaticoDetalles = new Array<ViaticosEncDet>();
    this.valor= null;
      

  }

  getViaticoDetallesfacturas(): void {
    this.loading = true;
    if (this.selectedViatico.vien_Id ) {
        this.viaticoService.getViaticoDetalles(this.selectedViatico.vien_Id).subscribe(
            (response: ViaticosEncDet[]) => {
                if (response.length > 0) {
                    this.codigoVE = this.selectedViatico.codigo;
                    const viaticoData = response[0];
                    this.viatico = viaticoData;

                    // Mapeo de detalles de facturas relacionados
                    this.facturas = response.map((detalle: ViaticosEncDet) => ({
                        ...detalle,
                        vide_Id: detalle.vide_Id ?? 0,
                        cavi_Descripcion: detalle.cavi_Descripcion ?? '',
                        vide_Descripcion: detalle.vide_Descripcion ?? '',
                        vide_ImagenFactura: detalle.vide_ImagenFactura ?? '',
                        vide_MontoGastado: detalle.vide_MontoGastado ?? 0,
                        vide_MontoReconocido: detalle.vide_MontoReconocido ?? 0
                    }));
                    this.loading = false;


                }
                this.loading = false;
            },
            (error) => {
                // console.error('Error fetching viatico details', error);
            }
        );
    }

}


  getViaticoDetalles(): void {
    if (this.selectedViatico.vien_TotalGastado>0) {
      this.viat = true;
      this.Index = false;
      this.viaticoService.getViaticoDetalles(this.selectedViatico.vien_Id).subscribe(
        (response: ViaticosEncDet[]) => {
          if (response.length > 0) {
            this.codigoVE =this.selectedViatico.codigo
            const viaticoData = response[0];
            this.viatico = viaticoData;
            
            this.viaticoDetalles = response.map((detalle: ViaticosEncDet) => ({
              ...detalle,
              codigo: detalle.codigo ?? 0,
              vien_Id: detalle.vien_Id ?? 0,
              vien_SaberProyeto: detalle.vien_SaberProyeto ?? '',
              vien_MontoEstimado: detalle.vien_MontoEstimado ?? 0,
              vien_TotalGastado: detalle.vien_TotalGastado ?? 0,
              vien_FechaEmicion: detalle.vien_FechaEmicion ?? new Date(),
              empl_Id: detalle.empl_Id ?? 0,
              Empleado: detalle.Empleado ?? '',
              Proy_Id: detalle.Proy_Id ?? 0,
              Proyecto: detalle.Proyecto ?? '',
              usua_Creacion: detalle.usua_Creacion ?? 0,
              UsuarioCreacion: detalle.UsuarioCreacion ?? '',
              vien_FechaCreacion: detalle.vien_FechaCreacion ?? new Date(),
              usua_Modificacion: detalle.usua_Modificacion ?? 0,
              UsuarioModifica: detalle.UsuarioModifica ?? '',
              vien_FechaModificacion: detalle.vien_FechaModificacion ?? new Date(),
              vien_TotalReconocido: detalle.vien_TotalReconocido ?? 0,
              vien_EstadoFacturas: detalle.vien_EstadoFacturas ?? '',
              cavi_Descripcion: detalle.cavi_Descripcion ?? '',
            }));


          }
        },
        (error) => {
        }
      );
    }
    else{
      this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            styleClass: 'iziToast-custom',
            detail: 'No hay detalles para este viático.',
            life: 3000,
        });
    }
  }

  Regresar(): void {
    this.viat=false;
    this.Index=true;
  }
  montoReconocidoValidator(control: AbstractControl) {
    const montoGastado = control.get('vide_MontoGastado')?.value;
    const montoReconocido = control.get('vide_MontoReconocido')?.value;
    return montoReconocido > montoGastado ? { montoReconocidoInvalido: true } : null;
  }

  loadViaticos(): void {
    this.loading = true;
    this.viaticoService.Listar(this.usua_Id).subscribe(data => {
      this.viaticos = data;
      this.loading = false;
    });

  }

  loadproyectos(): void {
    this.viaticoService.ListarP().subscribe(data => {
      this.proyectos = data.map((item: any) => ({
        descripcion: item.proy_Nombre,
        codigo: item.proy_Id
      }));
    }, error => {
    });
    this.proyectos.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
  }

  triggerFileUpload(): void {
    this.fileUploader.advancedFileInput.nativeElement.click();
  }

  loadEmpleados(): void {
    this.viaticoService.ListarEmpleados().subscribe(data => {
      this.empleados = data;
    });
    this.empleados.sort((a, b) => a.empleado.localeCompare(b.empleado));
  }

  CrearViatico(): void {
    this.CreateEdit = true;
    this.Index = false;
    this.Edit = false;
    this.form.reset();
    this.identity = "Crear";
  }

  Editar(): void {
    this.CreateEdit = true;
    this.Index = false;
    this.Edit = true;
    this.identity = "Editar";

    const detalle = this.selectedViatico;
    this.form.patchValue({
      empl_Id: detalle.empl_Id,
      vien_SaberProyeto: detalle.vien_SaberProyeto,
      proy_Descripcion: detalle.proyecto,
      vien_MontoEstimado: detalle.vien_MontoEstimado,
    });
  }
  compressAndConvertToBase64(file: File, maxWidth: number, maxHeight: number, quality: number = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

          // Redimensionar imagen
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Dibujar imagen en el canvas redimensionado
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir a Base64 con compresión (formatos 'image/jpeg' o 'image/png')
          const dataUrl = canvas.toDataURL('image/jpeg', quality);  // Calidad entre 0 y 1
          resolve(dataUrl);
        };

        img.onerror = (err) => reject(err);
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);  // Leer archivo como DataURL
    });
  }

  onImageSelect(event: any): void {
    const file: File = event.files[0];
    const validTypes = ['image/jpeg', 'image/png'];

    if (validTypes.includes(file.type)) {
      // Validar si el nombre del archivo excede el límite de caracteres
      if (file.name.length > 260) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          styleClass: 'iziToast-custom',
          detail: 'El nombre del archivo excede el límite de 260 caracteres.',
          life: 3000
        });
        return;
      }

      // Comprimir la imagen y convertir a Base64
      this.compressAndConvertToBase64(file, 800, 600, 0.7).then((compressedBase64: string) => {
        this.nombreImagen = compressedBase64;

        // Parchear el formulario con la imagen en Base64
        this.form2.patchValue({ vide_ImagenFactura: compressedBase64 });
      }).catch((error) => {
        // console.error('Error al comprimir la imagen:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          styleClass: 'iziToast-custom',
          detail: 'No se pudo comprimir la imagen.',
          life: 3000
        });
      });
    }
    else{
      this.nombreImagen = null;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        styleClass: 'iziToast-custom',
        detail: 'No es posible agregar otro tipo archivo.',
        life: 3000
      });
    }
  }

  // onImageSelect(event: any): void {
  //   const file: File = event.files[0];

  //   if (file) {
  //     // Validar si el nombre del archivo excede el límite de caracteres
  //     if (file.name.length > 260) {
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: 'El nombre del archivo excede el límite de 260 caracteres.',
  //         life: 3000
  //       });
  //       return; // Salir si el archivo no es válido
  //     }

  //     // Crear una instancia de FileReader para obtener la vista previa de la imagen
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       const imageUrl = e.target.result;

  //       // Establecer la vista previa de la imagen
  //       this.nombreImagen = imageUrl;
  //       console.log('Image preview URL:', imageUrl);

  //       // Parchear el formulario con la URL de la imagen para que se guarde correctamente
  //       this.form2.patchValue({ vide_ImagenFactura: imageUrl });
  //       console.log('Image URL set in form:', imageUrl);
  //     };

  //     // Leer el archivo como DataURL
  //     reader.readAsDataURL(file);
  //   }
  // }

  // onImageSelect(event: any): void {
  //   console.log('onImageSelect called with event:', event);
  //   const file = event.files[0];
  //   console.log('Selected file:', file);
  //   const reader = new FileReader();
  //   reader.onload = (e: any) => {
  //     this.nombreImagen = e.target.result;
  //     console.log('Image preview URL:', this.nombreImagen);
  //   };
  //   reader.readAsDataURL(file);

  //   this.uploadImage(file).subscribe(
  //     (response: any) => {
  //       console.log('Upload successful', response);
  //       const imageUrl = response.data.display_url;
  //       this.form2.patchValue({ vide_ImagenFactura: imageUrl });
  //       console.log('Image URL set in form:', imageUrl);
  //     },
  //     (error) => {
  //       console.error('Upload failed', error);
  //       this.form2.patchValue({ vide_ImagenFactura: this.defaultImageUrl });
  //       console.log('Using default image URL:', this.defaultImageUrl);
  //     }
  //   );
  // }

  uploadImage(image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('key', this.apiimagenKey);

    return this.http.post(this.apimagenUrl, formData);
  }
  empleadoSeleccionado: boolean = true;
  
 
filterEmpleado(event: any): void {
  this.empleadoSeleccionado = false;
  this.errorpr=true;
  const query = event.query.toLowerCase();
  this.filtradoEmpleado = this.empleados.filter((empleado) =>
    empleado.empleado.toLowerCase().includes(query)
  );
  this.noResultsFound = this.filtradoEmpleado.length === 0;
}
  
  // filterEmpleado(event: any): void {
  //   const query = event.query.toLowerCase();
  //   this.filtradoEmpleado = this.empleados.filter((empleado) =>
  //     empleado.empleado.toLowerCase().includes(query)
  //   );
  //   this.noResultsFound = this.filtradoEmpleado.length === 0;
  // }

  // filterProyectos(event: any): void {
  //   this.proyectoSeleccionado = false;
  //   const query = event.query.toLowerCase();
  //   this.filtradoProyectos = this.proyectos.filter(proyecto =>
  //     proyecto.descripcion.toLowerCase().includes(query)
  //   );
  //   this.noResultsFound2 = this.filtradoProyectos.length === 0;
  // }
  filterProyectos(event: any) {
    let query = event.query.toLowerCase();
    this.filtradoProyectos = this.proyectos.filter(proyecto => proyecto.descripcion.toLowerCase().includes(query));
    this.noResultsFound2 = this.filtradoProyectos.length === 0;

  }
 
onEncargadoSelect(event: any): void {
  const empleadosel = event;
  this.empleadoSeleccionado = true;
  this.form.patchValue({
    empl_Id: empleadosel.value.empl_Id,
    empleado: empleadosel.value.empleado
  });
}
  // onEncargadoSelect(event: any): void {
  //   const empleadosel = event;
  //   this.form.patchValue({
  //     empl_Id: empleadosel.value.empl_Id,
  //     empleado: empleadosel.value.empleado
  //   });
  // }
 
  // proyectoSeleccionado: boolean = true;
  // onProyectoSelect(event: any): void {
  //   const proyectoSel = event;
  //   this.proyectoSeleccionado = true;
  //   this.form.patchValue({
  //     proy_Descripcion: proyectoSel.value.descripcion
  //   });
  // }
  onProyectoSelect(event: any): void {
    const empleadosel = event;
    this.errorEmp=true;
    this.form.patchValue({
        proy_Descripcion: empleadosel.value.descripcion
      });

  }
  CancelarD(): void {
    this.CreateEditD = false;
    this.Index = true;
    this.form2.reset();
    this.submitted = false;
    this.facturas = [];
    this.loadViaticos();
    this.loadEmpleados();
    this.nombreImagen="";
    this.defaultImageUrl="";
    this.noResultsFound= false;
    this.noResultsFound2= false;
    this.noResultsFound3 = false;
    this.viatico= null;
    this.codigoVE=null;
    this.facturas = null; 
    this.valor= null;

  }


  loadCategoriasViaticos(): void {
    this.viaticoService.ListarCategorias().subscribe(data => {
      this.categoriasViaticos = data.map((item: any) => ({
        descripcion: item.cavi_Descripcion,
        cavi_Id: item.cavi_Id
      }));
    }, error => {
      // console.error('Error loading categorias viaticos:', error);
    });
    this.categoriasViaticos.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
  }

  filterCategoriasViaticos(event: any) {
    let query = event.query.toLowerCase();
    this.filtradoCategoriasViaticos = this.categoriasViaticos.filter(categoria => categoria.descripcion.toLowerCase().includes(query));
    this.noResultsFound3 = this.filtradoCategoriasViaticos.length === 0;

  }

  onCategoriaVSelect(event: any): void {
    this.form2.controls['cavi_Id'].setValue(event.value.cavi_Id);
    this.errorcat= true;
    this.form2.controls['cavi_Descripcion'].setValue(event.value.descripcion);
    console.log(event)
  }
 errorEmp: boolean=true;
 errorpr: boolean=true;
  Guardar(): void {
    this.submitted = true;
    let hasError = false;
    if (this.form.valid) {
        let idProy = this.proyectos.find(proy => proy.descripcion === this.form.value.proy_Descripcion)?.codigo ?? 0;
        if (idProy ===0) {
          this.messageService.add({ severity: 'error',  styleClass: 'iziToast-custom',summary: 'Error', detail: 'Se debe de seleccionar un proyecto.', life: 3000 });
          this.errorEmp = false;
          hasError =true;
          
        }
        let idemp = this.empleados.find(emp => emp.empleado === this.form.value.empleado)?.empl_Id ?? 0;
        if (idemp === 0) {
          this.messageService.add({ severity: 'error', styleClass: 'iziToast-custom', summary: 'Error', detail: 'Se debe de seleccionar un empleado.', life: 3000 });
          this.errorpr=false;
          hasError =true;
        }
        if (hasError) {
          return;
        }
      const ViaticoEncabezado: any = {
        empl_Id: this.form.value.empl_Id,
        vien_FechaEmicion: new Date(),
        // vien_SaberProyeto: this.form.value.vien_SaberProyeto,
        proy_Id: idProy,
        vien_MontoEstimado: this.form.value.vien_MontoEstimado,
        usua_Creacion: this.usua_Id,
        usua_Modificacion: this.usua_Id,
      };

      if (this.identity !== "Editar") {
        this.viaticoService.Insertar(ViaticoEncabezado).subscribe(
          (respuesta: any) => {
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', styleClass: 'iziToast-custom', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });
              this.loadViaticos();
              this.Cancelar();
            } else {
              this.messageService.add({ severity: 'error',  styleClass: 'iziToast-custom',summary: 'Error', detail: 'Inserción fallida.', life: 3000 });
            }
          }
        );
      }
       else {
        ViaticoEncabezado.vien_Id = this.selectedViatico.vien_Id;
        this.viaticoService.Actualizar(ViaticoEncabezado).subscribe(
          (respuesta: any) => {
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', styleClass: 'iziToast-custom', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 });
              this.loadViaticos();
              this.Cancelar();
            } else {
              this.messageService.add({ severity: 'error', styleClass: 'iziToast-custom', summary: 'Error', detail: 'Actualización fallida.', life: 3000 });
            }
          }
        );
      }
    }
  }

  // Guardar(): void {
  //   this.submitted = true;
  
  //   // Validar si se ha seleccionado un colaborador
  //   if (!this.empleadoSeleccionado) {
  //     return; // Detener la función si no se ha seleccionado un empleado
  //   }
  
  //   if (this.form.valid) {
  //     // let idProy = this.proyectos.find(proy => proy.descripcion === this.form.value.proy_Descripcion)?.codigo ?? 0;
  //     let idProy = this.proyectos.find(proy => proy.descripcion === this.form.value.proy_Descripcion)?.codigo ?? 0;
  //     const ViaticoEncabezado: any = {
  //       empl_Id: this.form.value.empl_Id,
  //       vien_FechaEmicion: new Date(),
  //       proy_Id: idProy,
  //       vien_MontoEstimado: this.form.value.vien_MontoEstimado,
  //       usua_Creacion: this.usua_Id,
  //       usua_Modificacion: this.usua_Id,
  //     };
  
  //     if (this.identity !== "Editar") {
  //       this.viaticoService.Insertar(ViaticoEncabezado).subscribe(
  //         (respuesta: any) => {
  //           if (respuesta.success) {
  //             this.messageService.add({ 
  //               severity: 'success', 
  //               styleClass: 'iziToast-custom', 
  //               summary: 'Éxito', 
  //               detail: 'Insertado con Éxito.', 
  //               life: 3000 
  //             });
  //             this.loadViaticos();
  //             this.Cancelar();
  //           } else {
  //             this.messageService.add({ 
  //               severity: 'error', 
  //               styleClass: 'iziToast-custom', 
  //               summary: 'Error', 
  //               detail: 'Inserción fallida.', 
  //               life: 3000 
  //             });
  //           }
  //         }
  //       );
  //     } else {
  //       ViaticoEncabezado.vien_Id = this.selectedViatico.vien_Id;
  //       this.viaticoService.Actualizar(ViaticoEncabezado).subscribe(
  //         (respuesta: any) => {
  //           if (respuesta.success) {
  //             this.messageService.add({ 
  //               severity: 'success', 
  //               styleClass: 'iziToast-custom', 
  //               summary: 'Éxito', 
  //               detail: 'Actualizado con Éxito.', 
  //               life: 3000 
  //             });
  //             this.loadViaticos();
  //             this.Cancelar();
  //           } else {
  //             this.messageService.add({ 
  //               severity: 'error', 
  //               styleClass: 'iziToast-custom', 
  //               summary: 'Error', 
  //               detail: 'Actualización fallida.', 
  //               life: 3000 
  //             });
  //           }
  //         }
  //       );
  //     }
  //   }
  // }


  loadViatico(): void {
    this.CreateEdit = true;
    this.Index = false;
    this.Edit = false;
    this.form.reset();
    this.identity = 'Editar';
    const  viatico = this.selectedViatico;
    this.form.patchValue({
        empl_Id: viatico.empl_Id,
        proy_Descripcion: viatico.proyecto,
        empleado: viatico.empleado,
        vien_MontoEstimado: viatico.vien_MontoEstimado,
    });
}

handleGuardarD(): void{
  this.confirmardetalleModal = true;
}

GuardarD(): void {
  let everythingOk = true;
  this.confirmardetalleModal = false;
  this.submitted = true;
  
  if (this.facturas.length > 0) {
    // console.log(this.facturas);
    const facturasNuevas = this.facturas.filter(factura => factura.vide_Id < 0); 
    const facturasExistentes = this.facturas.filter(factura => factura.vide_Id > 0); 
    if (facturasNuevas.length > 0) {
      // console.log("Nuevas:" );
      // console.log( facturasNuevas);
      // console.log("Existentes:" );
      // console.log( facturasExistentes);
      for (const factura of facturasNuevas) {
        // Inserta solo las facturas nuevas
        this.viaticoService.InsertarFactura(factura).subscribe(
          (respuesta: any) => {
            if (respuesta.success) {
              // this.messageService.add({ severity: 'success', styleClass: 'iziToast-custom', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });
            }
          },
          (error) => {
            // this.messageService.add({ severity: 'error',  styleClass: 'iziToast-custom',summary: 'Error', detail: 'Error de conexión al insertar factura.', life: 3000 });
            everythingOk = false;
          }
        );
      }
    }
    if (everythingOk) {
      this.messageService.add({ severity: 'success', styleClass: 'iziToast-custom', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });
      //izitoast
    } else {
      this.messageService.add({ severity: 'error',  styleClass: 'iziToast-custom',summary: 'Error', detail: 'Error de conexión al insertar factura.', life: 3000 });
    }
    // Después de insertar las facturas nuevas, limpiar y actualizar el estado
    this.CancelarD();
    this.facturas = []; // Limpiar la lista de facturas
    this.ngOnInit();    // Recargar datos o restablecer el formulario
  } else {
    this.messageService.add({ severity: 'error', styleClass: 'iziToast-custom', summary: 'Error', detail: 'Debe agregar al menos una factura.', life: 3000 });
  }
  // this.confirmardetalleModal = false;
  //   if (this.facturas.length > 0) {
  //     for (const factura of this.facturas) {

  //       factura.vien_Id = factura.vien_Id;
  //       this.viaticoService.InsertarFactura(factura).subscribe(
  //         (respuesta: any) => {
  //           if (!respuesta.success) {
  //             this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al insertar factura.', life: 3000 });
  //           }
  //         }
  //       );
  //     }

  //     // Limpiar el arreglo de facturas después de la inserción
  //     this.CancelarD();
  //     this.facturas = [];
  //     this.ngOnInit();
  //   }
  //   else {
  //     this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe agregar al menos una factura.', life: 3000 });

  //   }
  }
  allowOnlyNumbers(event: KeyboardEvent) {
    const pattern = /[0-9\.]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    } else {
      if (inputChar === '.' && (event.target as HTMLInputElement).value.includes('.')) {
        event.preventDefault();
      }
    }
  }

  allowOnlyAlphanumeric(event: any) {
    // Filtrar caracteres no permitidos
    const filteredValue = event.target.value
       .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')  // Remueve caracteres no permitidos
       .replace(/\s{2,}/g, ' ')  // Reemplaza múltiples espacios por uno solo
       .trimStart();  // Elimina espacios al inicio
 
    event.target.value = filteredValue;  // Establece el valor filtrado
 
    const control = this.form2.controls['vide_Descripcion'];
    control.setValue(filteredValue);
    // Si el campo está vacío después del filtrado, marcar como sucio y tocado
    if (!filteredValue) {
       control.setValue('');  // Establece el campo como vacío
       control.markAsTouched();  // Marcar como tocado
       control.markAsDirty();  // Marcar como sucio para activar la validación
    } else {
       // Si el campo tiene un valor válido, remover validaciones de sucio y tocado
       control.markAsPristine();
       control.markAsUntouched();
    }
 }
 

  // allowOnlyAlphanumeric(event: any) {
  //   event.target.value = event.target.value
  //     .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')  // Remueve caracteres no permitidos
  //     .replace(/\s{2,}/g, ' ')  // Reemplaza múltiples espacios por uno solo
  //     .trimStart();  // Elimina espacios al principio
  // }

  // allowOnlyAlphanumeric(event: any) {
  //   event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  //   .replace(/\s{2,}/g, ' ')
  //   .replace(/^\s/, '');
  // }

  // AgregarFactura(): void {
  //   this.form2.get('vide_MontoReconocido').updateValueAndValidity();
  //   this.form2.updateValueAndValidity();
  //   this.submitted = true;

  //   if (this.form2.valid) {
  //     const nuevaFactura = {
  //       vide_Descripcion: this.form2.value.vide_Descripcion,
  //       vide_ImagenFactura: this.form2.value.vide_ImagenFactura,
  //       vide_MontoGastado: typeof this.form2.value.vide_MontoGastado === 'number' || typeof this.form2.value.vide_MontoGastado === 'string'
  //       ? this.form2.value.vide_MontoGastado.toString()
  //       : '',
  //       vien_Id: this.selectedViatico.vien_Id,
  //       cavi_Id: this.form2.value.cavi_Id,
  //       cavi_Descripcion: this.form2.value.cavi_Descripcion,
  //       vide_MontoReconocido: this.form2.value.vide_MontoReconocido,
  //       usua_Creacion: this.usua_Id
  //     };
  //     this.facturas.push(nuevaFactura);
  //     this.form2.reset();
  //     this.submitted = false;
  //     this.nombreImagen="";
  //     this.defaultImageUrl="";
  //     this.form2.reset();

  //     console.log(this.facturas);
  //   }
  //   else {
  //     console.log("Formulario no valido: ", this.form2.value);
  //   }
  // }
contador: number = -1;
errorcat: boolean = true;
  AgregarFactura(): void {
    this.submitted = true;

        let idcat = this.categoriasViaticos.find(cat => cat.descripcion === this.form2.value.cavi_Descripcion)?.cavi_Id ?? 0;
      if (idcat===0) {
          this.messageService.add({ severity: 'error',  styleClass: 'iziToast-custom',summary: 'Error', detail: 'Debe seleccionar una categoria de viatico.', life: 3000 });
          this.errorcat= false;
        return;
      }
    if (this.form2.valid) {
      const facturaEditada = {
        vide_Descripcion: this.form2.get('vide_Descripcion')?.value,
        vide_MontoGastado: this.form2.get('vide_MontoGastado')?.value,
        vide_MontoReconocido: this.form2.get('vide_MontoReconocido')?.value,
        cavi_Descripcion: this.form2.get('cavi_Descripcion')?.value,
        vide_ImagenFactura: this.nombreImagen, 
        vide_Id: this.facturaSeleccionada?.vide_Id || this.contador--,  
        vien_Id: this.facturaSeleccionada?.vien_Id? this.facturaSeleccionada?.vien_Id :this.selectedViatico.vien_Id ,
        cavi_Id: this.form2.get('cavi_Id')?.value,
        usua_Modificacion: this.usua_Id,
        usua_Creacion: this.usua_Id,
        vide_FechaModificacion: new Date(),
      };
      if (this.facturaSeleccionada ) {
        
        const index = this.facturas.findIndex(f => f.vide_Id === this.facturaSeleccionada.vide_Id);
        if (index !== -1) {
          if (this.facturaSeleccionada.vide_Id === 0) {
          this.messageService.add({ severity: 'success', styleClass: 'iziToast-custom', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 });
            
          }

          this.facturas[index] = facturaEditada;
          this.form2.reset();
          this.submitted = false;
          if (this.facturaSeleccionada.vide_Id != 0) {
            this.submitted = false;
            this.form2.reset();
            this.viaticoService.ActualizarFactura(facturaEditada).subscribe(
              (respuesta: any) => {
                this.submitted = false;
                this.form2.reset();
                if (respuesta.success) {
                  this.form2.reset();
                  this.submitted = false;

                  this.messageService.add({ severity: 'success', styleClass: 'iziToast-custom', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 });
                  // this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al insertar factura.', life: 3000 });
                }
              },
              (error) => {
                this.submitted = false;
                this.messageService.add({ severity: 'error', styleClass: 'iziToast-custom', summary: 'Error', detail: 'Error de conexión al Actualizado factura.', life: 3000 });
                // console.error('Error al Actualizado factura:', error);
              }
            );
          }

        }
      } else {
        // Agregar una nueva factura
      this.submitted = false;

      if (this.facturas) {
        this.facturas.push(facturaEditada);
        this.submitted = false;
      } else {
        this.facturas = [facturaEditada]; // Inicializa el arreglo si es null
      }
      }

      // Limpiar selección y formulario
      this.facturaSeleccionada = null;
      this.form2.reset();
      this.nombreImagen = null;  // Limpiar la imagen seleccionada
    } else {
      this.messageService.add({ severity: 'error', styleClass: 'iziToast-custom', summary: 'Error', detail: 'Por favor, complete los campos obligatorios.', life: 3000 });
    }
  }

  Cancelar(): void {
    this.CreateEdit = false;
    this.Index = true;
    this.form.reset();
    this.submitted = false;
    this.loadViaticos();
    this.loadEmpleados();
    this.nombreImagen="";
    this.identity = 'Crear';
    this.noResultsFound= false;
    this.noResultsFound2= false;
    this.noResultsFound3 = false;
    this.viatico= null;
    this.codigoVE=null;
    this.valor= null;
    this.facturas = null; 

  }

  onGlobalFilter(dt: any, event: Event): void {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  selectViatico(viatico: any): void {
    this.selectedViatico = viatico;
  }

  confirmDelete(): void {
    if (this.selectedViatico.vien_EstadoFacturas === true) {
    this.Delete = true;
    }
    else {
      this.messageService.add({ severity: 'error', styleClass: 'iziToast-custom', summary: 'Error', detail: 'No es posible eliminar.', life: 3000 });
    }
  }

  confirmdet(): void {
    if (this.selectedViatico.vien_EstadoFacturas === true) {
      this.CreateEditD = true;
      this.Index = false;
      this.getViaticoDetallesfacturas();
      this.Edit = false;
      this.form.reset();
    }
    else {
      this.messageService.add({ severity: 'error', styleClass: 'iziToast-custom', summary: 'Error', detail: 'No es posible agregar facturas.', life: 3000 });
    }

  }
  confirmdetEncDetalle(): void {
    // this.selectedViatico.vien_EstadoFacturas === true
    if (false) {
      this.messageService.add({ severity: 'error', styleClass: 'iziToast-custom', summary: 'Error', detail: 'Debe de tener facturas ingresadas.', life: 3000 });

    }
    else {
      // this.viat = true;
      // this.Index = false;
      this.getViaticoDetalles();
    }

  }
  Eliminar(): void {
    this.viaticoService.Eliminar(this.selectedViatico.vien_Id).subscribe(
      (respuesta: any) => {
        if (respuesta.success) {
          this.messageService.add({ severity: 'success', styleClass: 'iziToast-custom', summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000 });
          this.loadViaticos();
        } else {
          this.messageService.add({ severity: 'error', styleClass: 'iziToast-custom', summary: 'Error', detail: 'Eliminación fallida.', life: 3000 });
        }
        this.Delete = false;
      }
    );
  }
}
