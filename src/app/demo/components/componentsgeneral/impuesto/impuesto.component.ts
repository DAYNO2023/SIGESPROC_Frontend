import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { ImpuestoService } from 'src/app/demo/services/servicesgeneral/impuesto.service';
import { Impuesto } from 'src/app/demo/models/modelsgeneral/impuestoviewmodel';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-impuesto',
  providers: [MessageService],
  templateUrl: './impuesto.component.html',
  styleUrls: ['./impuesto.component.scss']
})
export class ImpuestoComponent {
  impuesto: Impuesto[] = []; // Array para almacenar los impuestos
  items: MenuItem[] = []; // Elementos del menú
  Index: boolean = true; // Estado para mostrar/ocultar componentes
  Create: boolean = false; // Estado para mostrar/ocultar componentes
  Detail: boolean = false; // Estado para mostrar/ocultar componentes
  Delete: boolean = false; // Estado para mostrar/ocultar componentes
  form: FormGroup; // Formulario reactivo
  submitted: boolean = false; // Estado para saber si el formulario ha sido enviado
  identity: string = "Crear"; // Identidad para mostrar en el formulario
  selectedImpuesto: any; // Impuesto seleccionado
  id: number = 0; // ID del impuesto
  titulo: string = "Nuevo Estado Civil"; // Título del formulario
  impuestoeditar: boolean = false; // Estado para editar el impuesto
  rowactual: Impuesto | null;
  isLoading = false;
  loading: boolean = true;
  usua_Id: number;

  // Detalles del impuesto
  Datos = [{}];
  detalle_impu_Id: string = ""; // ID del impuesto en detalle
  detalle_impu_Porcentaje: string = ""; // Porcentaje del impuesto en detalle
  detalle_usuaCreacion: string = ""; // Usuario que creó el impuesto
  detalle_usuaModificacion: string = ""; // Usuario que modificó el impuesto
  detalle_FechausuaCreacion: string = ""; // Fecha de creación del impuesto
  detalle_FechausuaModificacion: string = ""; // Fecha de modificación del impuesto

  constructor(
    private messageService: MessageService,
    private service: ImpuestoService,
    private router: Router,
    private fb: FormBuilder,
    public cookieService: CookieService,
  ) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/general/impuesto')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
    
    // Inicializa el formulario reactivo con validaciones
    this.form = this.fb.group({
      impu_Porcentaje: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s0-9\.]*$/)]], // Campo porcentaje obligatorio
    });
  }

  onRouteChange(): void {
    this.ngOnInit();
  }
  
  ngOnInit(): void {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.impuestoeditar = false;
    
    // Inicializa el componente cargando la lista de impuestos
    this.Listado();
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
    this.usua_Id = parseInt(this.cookieService.get('usua_Id'));
    // Configura los elementos del menú
    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarImpuesto() },
      { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleImpuesto() },
    ];
  }

  // Obtiene el listado de impuestos desde el servicio
  Listado() {
    this.loading = true; // Mostrar el spinner
    this.service.Listar().subscribe(
      (data: any) => {
        // Formatea las fechas de creación y modificación
        this.impuesto = data.map((Impuesto: any) => ({
          ...Impuesto,
          impu_FechaCreacion: new Date(Impuesto.impu_FechaCreacion).toLocaleDateString(),
          impu_FechaModificacion: new Date(Impuesto.impu_FechaModificacion).toLocaleDateString()
        }));
        this.loading = false;
      },
      error => {
        this.loading = false;
      }
    );
  }

  // Aplica un filtro global a la tabla
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Selecciona un impuesto en la tabla
  selectImpuesto(Impuesto: any) {
    this.selectedImpuesto = Impuesto;
  }

  // Cierra el componente y vuelve al estado inicial
  CerrarImpuesto() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.impuestoeditar = false;
  }

  // Prepara el formulario para editar un impuesto
  EditarImpuesto() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.titulo = "Editar Impuesto";
    this.detalle_impu_Porcentaje = this.selectedImpuesto.impu_Porcentaje;
    this.form.patchValue({
      impu_Porcentaje: this.selectedImpuesto.impu_Porcentaje,
    });
    this.id = this.selectedImpuesto.impu_Id;
  }

  // Muestra los detalles de un impuesto
  DetalleImpuesto() {
    this.Index = false;
    this.Create = false;
    this.Detail = true;
    this.detalle_impu_Id = this.selectedImpuesto.impu_Id;
    this.detalle_impu_Porcentaje = this.selectedImpuesto.impu_Porcentaje;

    this.detalle_usuaCreacion = this.selectedImpuesto.usuaCreacion;
    if (this.selectedImpuesto.usuaModificacion != null) {
      this.detalle_usuaModificacion = this.selectedImpuesto.usuaModificacion;
      this.detalle_FechausuaModificacion = this.selectedImpuesto.impu_FechaModificacion;
    } else {
      this.detalle_usuaModificacion = "";
      this.detalle_FechausuaModificacion = "";
    }

    this.detalle_FechausuaCreacion = this.selectedImpuesto.impu_FechaCreacion;
  }

  // Valida el texto ingresado en el campo de porcentaje
  ValidarTexto(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    // Permite solo números y caracteres específicos
    if (!/^[0-9.\s ]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
    }
    // No permite espacios al inicio
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  ModalGuardar() {
    // Actualizamos el valor del detalle con el valor del formulario antes de abrir el diálogo
    this.detalle_impu_Porcentaje = this.form.value.impu_Porcentaje;
    
    if (this.form.valid) {
    
    this.impuestoeditar = true;
    }
}


  // Guarda los cambios realizados en el impuesto
  Guardar() {
    if (this.form.valid) {
      const Impuesto: any = {
        impu_Id: this.id,
        impu_Porcentaje: this.form.value.impu_Porcentaje,
        usua_Modificacion: this.usua_Id// ID del usuario que realiza la modificación
      };

      this.service.Actualizar(Impuesto).subscribe(
        (respuesta: Respuesta) => {
          if (respuesta.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass:'iziToast-custom',detail: 'Actualizado con Éxito.', life: 3000 });
            this.Listado(); // Actualiza la lista de impuestos
            this.CerrarImpuesto(); // Cierra el formulario
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'Actualización fallida, comuníquese con un Administrador', life: 3000 });
          }
        }
      );
    } else {
      this.form.markAllAsTouched();

      this.submitted = true; // Marca el formulario como enviado si es inválido
            this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'Actualización fallida, el valor no es valido', life: 3000 });
            return;
          }
  }

  allowOnlyAlphanumeric(event: any) {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, )
    .replace(/^\s/, );
  }
  
  // Valida la entrada de números en el campo de porcentaje
  ValidarNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    // Permite solo números y caracteres específicos
    if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
      event.preventDefault();
    }
    // No permite espacios al inicio
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
    // Limita la longitud del valor ingresado
    if (inputElement.value.length >= 2 && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }
  }

  handleInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    inputElement.value = texto
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');

    this.form.controls['impu_Porcentaje'].setValue(inputElement.value);
  }

}
