import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { Frecuencia } from 'src/app/demo/models/modelsplanilla/frecuenciaviewmodel';
import { FrecuenciaService } from 'src/app/demo/services/servicesplanilla/frecuencia.service';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-frecuencia',
  templateUrl: './frecuencia.component.html',
  styleUrls: ['./frecuencia.component.scss'],
  providers: [MessageService]
})
export class FrecuenciaComponent implements OnInit {
  frecuencias: Frecuencia[] = [];  // Lista de frecuencias
  items: MenuItem[] = [];  // Opciones de menú para acciones
  Index: boolean = true;  // Indicador para mostrar la lista principal
  Create: boolean = false;  // Indicador para mostrar el formulario de creación
  Detail: boolean = false;  // Indicador para mostrar los detalles
  Delete: boolean = false;  // Indicador para mostrar el diálogo de confirmación de eliminación
  Edit: boolean = false;  // Indicador para mostrar el diálogo de confirmación de edición


  //spinner
  loading = false; 
  form: FormGroup;  // Formulario reactivo para crear o editar frecuencias
  submitted: boolean = false;  // Indicador de envío del formulario
  identity: string = "Crear";  // Identidad de la acción actual (crear o editar)
  selectedFrecuencia: any;  // Frecuencia seleccionada
  selectedProduct: any;  // Producto seleccionado (no utilizado)
  Datos = [{}];  // Datos para la auditoría (no utilizados)
  
  id: number = 0;  // ID de la frecuencia actual
  titulo: string = "Nueva";  // Título del formulario
  // Detalles de la frecuencia
  detalle_frec_Id: string = "";
  detalle_frec_Descripcion: string = "";
  detalle_frec_NumeroDias: string = "";
  detalle_usuaCreacion: string = "";
  detalle_usuaModificacion: string = "";
  detalle_frec_FechaCreacion: string = "";
  detalle_frec_FechaModificacion: string = "";
  detalle_frec_Estado: string = "";

  constructor(
    private messageService: MessageService,
    private service: FrecuenciaService,
    private router: Router,
    private fb: FormBuilder,
    public cookieService: CookieService,
  ) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/planilla/frecuencia')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
    // Inicialización del formulario con validaciones
    this.form = this.fb.group({
      frec_Descripcion: ['', Validators.required],
      frec_NumeroDias: ['', Validators.required]
    });
  }
  onRouteChange(): void {
    this.ngOnInit();
  }
  // Validación para permitir solo texto
  ValidarTexto(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z\s]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
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
  this.form.controls['frec_Descripcion'].setValue(inputElement.value);
}

handleInputNumero(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  const texto = inputElement.value;

  // Only allow numbers
  inputElement.value = texto
    .replace(/[^0-9]/g, '')  // Remove any non-numeric characters
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space (if spaces were allowed)
    .replace(/^\s/, '');     // Trim leading whitespace (if spaces were allowed)

  // Update the value in the form
  this.form.controls['frec_NumeroDias'].setValue(inputElement.value);
}
  
  // Validación para permitir texto y números
  ValidarTextoNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z\s0-9]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }
  allowObservacion(event: any) {
    event.target.value = event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');
  }
  ValidarNumeros(event: any) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
  }
  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.Index = true;  // Indicador para mostrar la lista principal
    this.Create = false;  // Indicador para mostrar el formulario de creación
    this.Detail = false;  // Indicador para mostrar los detalles
    this.Delete = false;  // Indicador para mostrar el diálogo de confirmación de eliminación
    this.Edit = false;  // Indicador para mostrar el diálogo de confirmación de edición
    this.id = 0;  // ID de la frecuencia actual
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
    this.Listado();  // Cargar la lista de frecuencias
    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarFrecuencia() },
      { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleFrecuencia() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.EliminarFrecuencia() },
    ];
  }

  // Método para listar frecuencias
  Listado() {
    this.loading = true; // Mostrar el spinner
    this.service.Listar()
    .subscribe((data: any) => {
      //Formateamos las fecha creacion y la de modificacion
      this.frecuencias = data.map((frecuencia: any) => ({
        ...frecuencia,
        frec_FechaCreacion: new Date(frecuencia.frec_FechaCreacion).toLocaleDateString(),
        frec_FechaModificacion: new Date(frecuencia.frec_FechaModificacion).toLocaleDateString()
      }));    
      this.loading = false;  
    }),()=>{
      this.loading = false;
    }
  }
  // Método para mostrar el formulario de creación
  CrearFrecuencia() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.form.reset();
    this.identity = "crear";
    this.titulo = "Nueva"
    this.submitted = false;
  }

  // Método para mostrar el formulario de edición
  EditarFrecuencia() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.id = this.selectedFrecuencia.frec_Id;
    this.identity = "editar";
    this.titulo = "Editar";

    // Cargar valores del formulario con la frecuencia seleccionada
    this.form.patchValue({
      frec_Descripcion: this.selectedFrecuencia.frec_Descripcion,
      frec_NumeroDias: this.selectedFrecuencia.frec_NumeroDias
    });
    this.id = this.selectedFrecuencia.frec_Id;
  }

  // Método para seleccionar una frecuencia
  selectFrecuencia(frecuencia: any) {
    this.selectedFrecuencia = frecuencia;
  }

  // Filtro global para la tabla
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Método para mostrar los detalles de una frecuencia
  DetalleFrecuencia() {
    this.Index = false;
    this.Create = false;
    this.Detail = true;

    this.detalle_frec_Id = this.selectedFrecuencia.codigo;
    this.detalle_frec_Descripcion = this.selectedFrecuencia.frec_Descripcion;
    this.detalle_frec_NumeroDias = this.selectedFrecuencia.frec_NumeroDias;
    this.detalle_usuaCreacion = this.selectedFrecuencia.usuaCreacion;
    this.detalle_frec_FechaCreacion = this.selectedFrecuencia.frec_FechaCreacion;

    if (this.selectedFrecuencia.usuaModificacion != null) {
      this.detalle_usuaModificacion = this.selectedFrecuencia.usuaModificacion;
      this.detalle_frec_FechaModificacion = this.selectedFrecuencia.frec_FechaModificacion;
    } else {
      this.detalle_usuaModificacion = "";
      this.detalle_frec_FechaModificacion = "";
    }
  }

  // Método para mostrar el diálogo de confirmación de eliminación
  EliminarFrecuencia() {
    this.id = this.selectedFrecuencia.frec_Id;
    this.Delete = true;
  }

  // Método para mostrar el diálogo de confirmación de edición
  EditarrFrecuencia() {
    this.id = this.selectedFrecuencia.frec_Id;
    this.Edit = true;
  }

  // Método para guardar la edición de una frecuencia
// Método para guardar la edición de una frecuencia
GuardarEdicion() {
  this.Edit = false;

  if (this.form.valid) {
    const newDescription = this.form.value.frec_Descripcion;
    const newNumeroDias = this.form.value.frec_NumeroDias;

    // Crear un objeto frecuencia con los valores del formulario
    const frecuencia: Frecuencia = {
      frec_Id: this.id,
      frec_Descripcion: newDescription,
      frec_NumeroDias: newNumeroDias,
      usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
      usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
    };

    // Verificar si el nombre ha cambiado
    if (this.selectedFrecuencia.frec_Descripcion.toLowerCase() !== newDescription.toLowerCase()) {
      // Verificar si la nueva descripción ya existe en el resto del listado
      const frecuenciaExiste = this.frecuencias.some(frec =>
        frec.frec_Descripcion.toLowerCase() === newDescription.toLowerCase() &&
        frec.frec_Id !== this.id
      );

      // Si la nueva descripción ya existe, mostrar un mensaje de error
      if (frecuenciaExiste) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La frecuencia ya existe.', life: 3000,styleClass:'iziToast-custom' });
        return; // Salir de la función si ya existe
      }
    }

    // Llamar al servicio para actualizar la frecuencia
    this.service.Actualizar(frecuencia).subscribe(
      (respuesta: Respuesta) => {

        if (respuesta.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
          this.Listado();
          this.CerrarFrecuencia();
          this.Edit = false;
          this.submitted = false;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000,styleClass:'iziToast-custom' });
          this.Edit = false;
        }
      },
      error => {
    
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000,styleClass:'iziToast-custom' });
      }
    );
  } else {
    this.submitted = true;
  }
}

// Metodo para guardar una nueva frecuencia o una edición
Guardar() {
  if (this.form.valid) {
    const frecuencia: Frecuencia = {
      frec_Id: this.id,
      frec_Descripcion: this.form.value.frec_Descripcion,
      frec_NumeroDias: this.form.value.frec_NumeroDias,
      usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
      usua_Modificacion:parseInt(this.cookieService.get('usua_Id'))
    };

    if (this.identity === "crear") {
      // Verificar si la frecuencia ya existe en la lista de frecuencias, verificación según descripción
      const frecuenciaExiste = this.frecuencias.some(f => f.frec_Descripcion.toLowerCase() === frecuencia.frec_Descripcion.toLowerCase());
      
      if (frecuenciaExiste) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La frecuencia ya existe.', life: 3000 ,styleClass:'iziToast-custom'});
        return; // Salir de la función si ya existe
      }

      // Insertar nueva frecuencia
      this.service.Insertar(frecuencia).subscribe(
        (respuesta: Respuesta) => {
    
          if (respuesta.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
            this.Listado();
            this.CerrarFrecuencia();
            this.submitted = false;
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Inserción fallida', life: 3000,styleClass:'iziToast-custom' });
        
          }
        }
      );
    } else {
      this.Edit = true; // Mostrar el modal de confirmación
    }
  } else {
    this.submitted = true;
  }
}



  // Método para cerrar el formulario de frecuencia
  CerrarFrecuencia() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
  }

  // Método para confirmar la eliminación de una frecuencia
  async confirmarEliminar() {
    this.Delete = false;

    try {
      const response = await this.service.Eliminar(this.selectedFrecuencia.frec_Id).toPromise();
      const { code, data, message } = response;

      let severity = 'error';
      let summary = 'Error';
      let detail = data?.messageStatus || message;

      if (code === 200) {
        severity = data.codeStatus > 0 ? 'success' : 'warn';
        summary = data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
      } else if (code === 500) {
        severity = 'error';
        summary = 'Error Interno';
      }

      this.messageService.add({
        severity,
        summary,
        detail,
        life: 3000
      });

      this.ngOnInit();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error Externo',
        detail: error.message || error,
        life: 3000,styleClass:'iziToast-custom'
      });
    }
  }

  // Método para eliminar una frecuencia
  Eliminar() {
    this.service.Eliminar(this.id).subscribe(
      (respuesta: any) => {
       
        if (respuesta.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
          this.Listado();
          this.Delete = false;
        } else {
          if (respuesta.CodeStatus == -1) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: `No se puede eliminar porque la frecuencia está referenciada en la tabla Empleados`, life: 5000,styleClass:'iziToast-custom' });
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Eliminación fallida', life: 3000,styleClass:'iziToast-custom' });
          }
          this.Delete = false;
        }
      }
    );
  }

  // Validación para permitir solo números

}
