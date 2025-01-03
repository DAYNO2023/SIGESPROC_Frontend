import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { CargoService } from 'src/app/demo/services/servicesgeneral/cargo.service';
import { Cargo } from 'src/app/demo/models/modelsgeneral/cargoviewmodel';
import { CookieService } from 'ngx-cookie-service';
import { tr } from 'date-fns/locale';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-cargo',
  templateUrl: './cargo.component.html',
  styleUrl: './cargo.component.scss',
  providers: [MessageService]
})
export class CargoComponent implements OnInit {

  cargos: Cargo[] = []; // Lista de cargos obtenida del servicio
  items: MenuItem[] = []; // Opciones del menú contextual
  Index: boolean = true; // Control de visualización de la vista principal
  Create: boolean = false; // Control de visualización de la vista de creación
  Detail: boolean = false; // Control de visualización de la vista de detalle
  Delete: boolean = false; // Control de visualización de la vista de eliminación
  modalConfirmacion: boolean = false; // Control de visualización del modal de confirmación
  confirm: boolean = false; // Indicador de confirmación de acción
  loading: boolean = false; // Indicador de carga de datos
  form: FormGroup; // Formulario para la creación y edición de cargos
  submitted: boolean = false; // Indicador de si el formulario ha sido enviado
  identity: string = "Crear"; // Identificador de la acción actual (crear/editar)
  selectedCargo: any; // Cargo seleccionado en la tabla
  id: number = 0; // Identificador del cargo seleccionado
  titulo: string = "Nuevo"; // Título de la vista
  // Detalles
  Datos = [{}]; // Datos de detalle
  detalle_carg_Id: string = ""; // Identificador del cargo en detalle
  detalle_carg_Descripcion: string = ""; // Descripción del cargo en detalle
  detalle_usuaCreacion: string = ""; // Usuario que creó el cargo
  detalle_usuaModificacion: string = ""; // Usuario que modificó el cargo
  detalle_FechausuaCreacion: string = ""; // Fecha de creación del cargo
  detalle_FechausuaModificacion: string = ""; // Fecha de modificación del cargo
  selectedCargoDescripcion: string = ""; // Descripción del cargo seleccionado

  // USUARIO
  IdUsuario: number = parseInt(this.cookieService.get('usua_Id'));  // ID del usuario logueado

  constructor(
    private messageService: MessageService,
    private service: CargoService,
    private router: Router,
    private fb: FormBuilder,
    private cookieService: CookieService

  ) {





        this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          // Si la URL coincide con la de este componente, forzamos la ejecución
          if (event.urlAfterRedirects.includes('/sigesproc/general/cargo')) {
            // Aquí puedes volver a ejecutar ngOnInit o un método específico
            this.onRouteChange();
          }
        });




    this.form = this.fb.group({
      carg_Descripcion: ['', Validators.required] // Inicialización del formulario
    });
  }

  onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar
    this.ngOnInit();
  }
  // Método de inicialización del componente
  ngOnInit(): void {

    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;

    const token = this.cookieService.get('Token');
    if(token == 'false')
    {
        this.router.navigate(['/auth/login'])
    }

    this.Listado(); // Cargar la lista de cargos al inicializar el componente
  }

  // Método para obtener las opciones del menú contextual dependiendo del cargo
  getItems(cargo: Cargo): MenuItem[] {
    if (cargo.carg_Descripcion === 'Jefe de Obra') {
      return [
        { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleCargo() },
      ];
    } else {
      return [
        { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarCargo() },
        { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleCargo() },
        { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.EliminarCargo() },
      ];
    }
  }

  // Método para cargar la lista de cargos desde el servicio
  Listado() {
    this.loading = true; // Inicia la carga
    this.service.Listar().subscribe(
      (data: any) => {
        // Procesa los datos recibidos
        this.cargos = data.map((Cargos: any) => ({
          ...Cargos,
          carg_FechaCreacion: new Date(Cargos.carg_FechaCreacion).toLocaleDateString(), // Formatea la fecha de creación
          carg_FechaModificacion: new Date(Cargos.carg_FechaModificacion).toLocaleDateString(), // Formatea la fecha de modificación
          items: this.getItems(Cargos) // Asigna las opciones del menú contextual
        }));
      },
      error => {
      },
      () => {
        this.loading = false; // Finaliza la carga
      }
    );
  }

  // Método para filtrar globalmente en la tabla
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Método para seleccionar un cargo en la tabla
  selectCargo(Cargo: any) {
    this.selectedCargo = Cargo;
  }

  // Método para mostrar la vista de creación de un nuevo cargo
  CrearCargo() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.submitted = false;
    this.form.reset();
    this.identity = "crear";
    this.titulo = "Nuevo Cargo";
  }

  // Método para cerrar la vista actual y volver a la vista principal
  CerrarCargo() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
  }

  // Método para validar la entrada de solo texto
  ValidarTexto(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z\s]+$/.test(key) && key !== 'Backspace' && key !== 'Tab') {
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
    this.form.controls['carg_Descripcion'].setValue(inputElement.value);
  }

  allowOnlyAlphanumeric(event: any) {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');
  }
  // Método para mostrar la vista de edición de un cargo existente
  EditarCargo() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.identity = "editar";
    this.titulo = "Editar Cargo";
    this.form.patchValue({
      carg_Descripcion: this.selectedCargo.carg_Descripcion,
    });
    this.selectedCargoDescripcion = this.selectedCargo.carg_Descripcion;
    this.id = this.selectedCargo.carg_Id;
  }

  // Método para mostrar los detalles de un cargo seleccionado
  DetalleCargo() {
    this.titulo = "Detalle Cargo";
    this.Index = false;
    this.Create = false;
    this.Detail = true;
    this.detalle_carg_Id = this.selectedCargo.codigo;
    this.detalle_carg_Descripcion = this.selectedCargo.carg_Descripcion;
    this.detalle_usuaCreacion = this.selectedCargo.usuaCreacion;
    if (this.selectedCargo.usuaModificacion != null) {
      this.detalle_usuaModificacion = this.selectedCargo.usuaModificacion;
      this.detalle_FechausuaModificacion = this.selectedCargo.carg_FechaModificacion;
    } else {
      this.detalle_usuaModificacion = "";
      this.detalle_FechausuaModificacion = "";
    }
    this.detalle_FechausuaCreacion = this.selectedCargo.carg_FechaCreacion;
  }

  // Método para preparar la eliminación de un cargo seleccionado
  EliminarCargo() {
    this.detalle_carg_Descripcion = this.selectedCargo.carg_Descripcion;
    this.id = this.selectedCargo.carg_Id;
    this.Delete = true;
  }

  // Método para guardar un nuevo cargo o actualizar uno existente
  Guardar() {
 this.submitted = true;

      if (this.identity == 'editar' && !this.modalConfirmacion) {
        this.modalConfirmacion = true;
        return;
      } else if (this.identity == 'editar' && this.modalConfirmacion) {
        this.confirm = true;
      }

    if(this.identity !== 'editar'){

      const cargoExistente = this.cargos.some(c =>
        c.carg_Descripcion.toLowerCase() === this.form.value.carg_Descripcion.toLowerCase()
      );

      if (cargoExistente) {
        // Si ya existe, mostrar un mensaje de error
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'El cargo ya existe',
          styleClass: 'iziToast-custom'
        });
        return; // Detener la ejecución si ya existe
      } else{
        const cargoExistente = this.cargos.some(c =>
          c.carg_Descripcion.toLowerCase() === this.form.value.carg_Descripcion.toLowerCase() &&
          c.carg_Id !== this.id
        );

        if (cargoExistente) {
          // Si ya existe, mostrar un mensaje de error
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'El cargo ya existe',
            styleClass: 'iziToast-custom'
          });
          return;
      }
     }
    }
    // Si está en modo edición, muestra el modal de confirmación

    if (this.form.valid) {
      const Cargo: any = {
        carg_Id: this.id,
        carg_Descripcion: this.form.value.carg_Descripcion,
        usua_Creacion: this.IdUsuario,
        usua_Modificacion: this.IdUsuario
      };

      if (this.identity === "crear") {
        // Inserta un nuevo cargo
        this.service.Insertar(Cargo).subscribe(
          (respuesta: Respuesta) => {
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
              this.Listado();
              this.CerrarCargo();
              this.modalConfirmacion = false;
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'El cargo ya existe.', life: 3000 });
            }
          }
        );
      } else if (this.confirm && this.identity === 'editar') {
        // Actualiza un cargo existente
        this.service.Actualizar(Cargo).subscribe(
          (respuesta: Respuesta) => {
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Actualizado con Éxito.', life: 3000 });
              this.Listado();
              this.CerrarCargo();
              this.modalConfirmacion = false;
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'El cargo ya existe.', life: 3000 });
            }
          }
        );
      }
    } else {
      this.submitted = true;
    }
  }

  // Método para eliminar un cargo existente
  async Eliminar() {
    this.Delete = false;
    try {
      // Llama al servicio para eliminar el cargo y espera la respuesta
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
        life: 3000
      });
    }
  }
}
