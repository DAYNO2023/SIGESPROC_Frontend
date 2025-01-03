import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { UnidadMedida } from 'src/app/demo/models/modelsgeneral/unidadmedidaviewmodel';
import { unidadMedidaService } from 'src/app/demo/services/servicesgeneral/unidadmedida.service';
import { CookieService } from 'ngx-cookie-service';
import { empty, filter } from 'rxjs';

@Component({
  selector: 'app-unidadmedida',
  templateUrl: './unidadmedida.component.html',
  styleUrl: './unidadmedida.component.scss',
  providers: [MessageService]
})
export class UnidadMedidaComponent implements OnInit {
  UnidadesDeMedida: UnidadMedida[] = [];
  items: MenuItem[] = [];
  Index: boolean = true;
  Create: boolean = false;
  Detail: boolean = false;
  Editt: boolean = false;
  Delete: boolean = false;
  form: FormGroup;
  submitted: boolean = false;
  identity: string = "Crear";
  selectedUnidadMedida: any;
  id: number = 0;
  titulo: string = "Nueva";
  loading: boolean = false;
  // Detalles
  Datos = [{}];
  detalle_unme_Id: string = "";
  detalle_unme_Nombre: string = "";
  detalle_unme_Nomenclatura: string = "";
  detalle_usuaCreacion: string = "";
  detalle_usuaModificacion: string = "";
  detalle_FechausuaCreacion: string = "";
  detalle_FechausuaModificacion: string = "";
  usua_Id: number;

  // DropDowns de unidades de medida
  identificadores: any[] = [
    { label: 'Unidades de capacidad', value: 'Unidades de capacidad' },
    { label: 'Unidades de densidad', value: 'Unidades de densidad' },
    { label: 'Unidades de energía', value: 'Unidades de energía' },
    { label: 'Unidades de fuerza', value: 'Unidades de fuerza' },
    { label: 'Unidades de longitud', value: 'Unidades de longitud' },
    { label: 'Unidades de masa', value: 'Unidades de masa' },
    { label: 'Unidades de peso específico', value: 'Unidades de peso específico' },
    { label: 'Unidades de potencia', value: 'Unidades de potencia' }
  ];

  constructor(
    private messageService: MessageService,
    private service: unidadMedidaService,
    private router: Router,
    private fb: FormBuilder,
    public cookieService: CookieService,
  ) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/general/unidadesdemedida')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
    this.form = this.fb.group({
      unme_Nombre: ['', Validators.required],
      unme_Nomenclatura: ['', Validators.required],
    });
  }
  onRouteChange(): void {
    this.ngOnInit();
  }
  ngOnInit(): void {
    this.UnidadesDeMedida = [];
    this.Index = true;
    this.Create = false;
    this.Detail = false;
    this.Editt = false;
    this.Delete = false;
    this.id = 0;
    this.Listado();
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
  
    this.usua_Id = parseInt(this.cookieService.get('usua_Id'));
    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarUnidadMedida() },
      { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleUnidadMedida() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.EliminarUnidadMedida() },
    ];
  }

  allowObservacion(event: any) {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');
  }
  // Método para listar todas las unidades de medida
  Listado() {
    this.loading = true;
    this.service.Listar().subscribe(
      (data: any) => {
        this.UnidadesDeMedida = data.map((UnidadesDeMedida: any) => ({
          ...UnidadesDeMedida,
          unme_FechaCreacion: new Date(UnidadesDeMedida.unme_FechaCreacion).toLocaleDateString(),
          unme_FechaModificacion: new Date(UnidadesDeMedida.unme_FechaModificacion).toLocaleDateString()
        }));
        this.loading = false;
      }
    );
  }

  // Método para aplicar filtro global en la tabla
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Método para seleccionar una unidad de medida
  selectUnidadMedida(unidadMedida: any) {
    this.selectedUnidadMedida = unidadMedida;
  }

  // Método para validar que solo se ingresen números
  ValidarNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
      event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  // Método para validar que solo se ingresen letras y espacios
  ValidarTexto(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  // Método para validar que solo se ingresen letras, números y espacios
  ValidarTextoNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z\s0-9áéíóúÁÉÍÓÚñÑ]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
    if (inputElement.value.length >= 3 && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }
  }

  // Método para iniciar la creación de una nueva unidad de medida
  CrearUnidadMedida() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.form.reset();
    this.identity = "crear";
    this.titulo = "Nueva";
  }

  // Método para cerrar el formulario de unidad de medida
  CerrarUnidadMedida() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
  }

  // Método para regresar al listado de unidades de medida
  regresar() {
    this.CerrarUnidadMedida();
  }

  // Método para editar una unidad de medida
  EditarUnidadMedida() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.identity = "editar";
    this.titulo = "Editar";
    this.form.patchValue({
      unme_Nombre: this.selectedUnidadMedida.unme_Nombre,
      unme_Nomenclatura: this.selectedUnidadMedida.unme_Nomenclatura,
    });
    this.id = this.selectedUnidadMedida.unme_Id;
  }

  // Método para ver los detalles de una unidad de medida
  DetalleUnidadMedida() {
    this.Index = false;
    this.Create = false;
    this.Detail = true;
    this.detalle_unme_Id = this.selectedUnidadMedida.codigo;
    this.detalle_unme_Nombre = this.selectedUnidadMedida.unme_Nombre;
    this.detalle_unme_Nomenclatura = this.selectedUnidadMedida.unme_Nomenclatura;
    this.detalle_usuaCreacion = this.selectedUnidadMedida.usuaCreacion;
    if (this.selectedUnidadMedida.usuaModificacion != null) {
      this.detalle_usuaModificacion = this.selectedUnidadMedida.usuaModificacion;
      this.detalle_FechausuaModificacion = this.selectedUnidadMedida.unme_FechaModificacion;
    } else {
      this.detalle_usuaModificacion = "";
      this.detalle_FechausuaModificacion = "";
    }
    this.detalle_FechausuaCreacion = this.selectedUnidadMedida.unme_FechaCreacion;
  }

  // Método para iniciar el proceso de eliminación de una unidad de medida
  EliminarUnidadMedida() {
    this.detalle_unme_Nombre = this.selectedUnidadMedida.unme_Nombre;
    this.id = this.selectedUnidadMedida.unme_Id;
    this.Delete = true;
  }

  // Método para manejar el clic del botón según el valor de identity


  handleClick() {
    if (this.identity === 'crear') {
      this.Guardar();
    } else if (this.identity === 'editar') {
      const unmeNombreValue = this.form.get("unme_Nombre").value.trim(); // Trim spaces from the input

      if (!unmeNombreValue) {
       this.form.patchValue({unme_Nombre : null})
        this.submitted = true;
      } else {
        // Proceed with editing since the input is valid
        this.Editt = true;
      }
    }
  }
  // Método para confirmar la edición de una unidad de medida
  confirmEdit() {
    this.Guardar();
    this.Editt = false;
  }

  // Método para guardar una unidad de medida (crear o actualizar)
  Guardar() {
    if (this.form.valid) {
      const UnidadMedida: any = {
        unme_Id: this.id,
        unme_Nombre: this.form.value.unme_Nombre,
        unme_Nomenclatura: this.form.value.unme_Nomenclatura,
        usua_Creacion: this.usua_Id,
        usua_Modificacion: this.usua_Id
      };

      if (this.identity != "editar") {
        this.service.Insertar(UnidadMedida).subscribe(
          (respuesta: Respuesta) => {
            if (respuesta.success) {
              this.messageService.add({ severity: 'success',styleClass: 'iziToast-custom', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });
              this.Listado();
              this.CerrarUnidadMedida();
              this.submitted = false;
            } else {
              this.messageService.add({ severity: 'error', styleClass: 'iziToast-custom',summary: 'Error', detail: 'La unidad de medida ya existe.', life: 3000 });
            }
          }
        );
      } else {
        this.service.Actualizar(UnidadMedida).subscribe(
          (respuesta: Respuesta) => {
            if (respuesta.success) {
              this.messageService.add({ severity: 'success',styleClass: 'iziToast-custom', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 });
              this.Listado();
              this.CerrarUnidadMedida();
              this.submitted = false;
            } else {
              this.messageService.add({ severity: 'error',styleClass: 'iziToast-custom', summary: 'Error', detail: 'La unidad de medida ya existe.', life: 3000 });
            }
          }
        );
      }
    } else {
      this.submitted = true;
    }
  }

  // Método para eliminar una unidad de medida
  Eliminar() {
    // Cierra el cuadro de diálogo de confirmación de eliminación
    this.Delete = false;

    this.service.Eliminar(this.id).subscribe(
        (response: any) => {
            // Desestructura la respuesta
            const { code, data, message } = response;

            // Inicializa variables para el mensaje del servicio
            let severity = 'error';
            let summary = 'Error';
            let detail = data?.messageStatus || message;

            // Verifica el código de respuesta
            if (code === 200) {
                // Si la eliminación fue exitosa o hay una advertencia
                severity = data.codeStatus > 0 ? 'success' : 'warn';
                summary = data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
            } else if (code === 500) {
                // Si hubo un error interno
                severity = 'error';
                summary = 'Error Interno';
            }

            // Añade el mensaje de estado al servicio de mensajes
            this.messageService.add({
                severity,
                summary,
                detail,styleClass: 'iziToast-custom',
                life: 3000
            });

            // Reinicia el componente si la eliminación fue exitosa
            if (data.codeStatus > 0) {
                this.Listado();
            }
        },
        (error) => {
            // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
            this.messageService.add({
                severity: 'error',
                summary: 'Error Externo',styleClass: 'iziToast-custom',
                detail: error.message || error,
                life: 3000
            });
        }
    );
}

}
