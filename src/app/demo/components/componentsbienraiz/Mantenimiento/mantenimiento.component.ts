import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MantenimientoService } from 'src/app/demo/services/servicesbienraiz/mantenimiento.service';
import { mantenimiento } from 'src/app/demo/models/modelsbienraiz/mantenimientoViewModel';
import { MensajeViewModel } from 'src/app/demo/models/MessageViewModel';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-presupuesto',
  templateUrl: './mantenimiento.component.html',
  styleUrl: './mantenimiento.component.scss',
  providers: [ MessageService]
})
export class mantenimientoComponent implements OnInit {
  Mantenimiento: mantenimiento[] = [];
  items: MenuItem[] = [];
  Index: boolean = true;
  Editt: boolean = false;
  Create: boolean = false;
  Detail: boolean = false;
  Delete: boolean = false;
  form: FormGroup;
  submitted: boolean = false;
  identity: string  = "Crear";
  selectedMantenimiento: any;
  id: number = 0;
  textoIngresado: string = '';
  filaCount: number = 1;
  titulo: string = "Nueva Mantenimiento";
  loading : boolean = false;
  // Detalles
  Datos = [{}];
  detalle_mate_id: string = "";
  detalle_Dni: string = "";
  detalle_NombreCompleto: string = "";
  detalle_Telefono: string = "";
  detalle_usuaCreacion: string = "";
  detalle_usuaModificacion: string = "";
  detalle_FechausuaCreacion: string = "";
  detalle_FechausuaModificacion: string = "";

  constructor(
    private messageService: MessageService,
    private service: MantenimientoService,
    private router: Router,
    private fb: FormBuilder,
    public cookieService: CookieService,
  ) {
    this.form = this.fb.group({
      mant_DNI: ['', Validators.required],
      mant_NombreCompleto: ['', Validators.required],
      mant_Telefono: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const token = this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
    this.Listado();

    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarMantenimiento() },
      { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleMantenimiento() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.EliminarMantenimiento() },
    ];
  }

  // Método para listar los mantenimiento
  Listado() {
    this.loading = true;
    this.service.Listar().subscribe(
      (data: any) => {
        this.Mantenimiento = data.map((mantenimiento: any) => ({
          ...mantenimiento,
          unme_FechaCreacion: new Date(mantenimiento.mant_FechaCreacion).toLocaleDateString(),
          unme_FechaModificacion: new Date(mantenimiento.mant_FechaModificacion).toLocaleDateString()
        }));
        this.loading = false;
      },
      error => {
        console.log(error);
        this.loading = false;
      },
      () =>{
        this.loading = false;
      }
    );
  }

  // Método para regresar a la vista anterior
  regresar() {
    this.CerrarMantenimiento();
  }

  // Método para validar el texto ingresado en los campos
  validarTexto(event: KeyboardEvent) {
    const texto = (event.target as HTMLInputElement).value;
    const cursorPosition = (event.target as HTMLInputElement).selectionStart;

    if (!/^[a-zñA-ZÑ\s]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.keyCode !== 13 ) {
        event.preventDefault();
    } else if (event.key === ' ' && (texto.trim() === '' || cursorPosition === 0)) {
        event.preventDefault();
    }

    if (event.keyCode === 13) {
      this.Guardar();
    }
  }

  // Método para validar que solo se ingresen números
  ValidarNumeros(event: KeyboardEvent) {
    const texto = (event.target as HTMLInputElement).value;

    if (!/^\d+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        event.preventDefault();
    } else if (event.key === ' ' && (texto.trim() === '' || texto.trim().length === (event.target as HTMLInputElement).selectionEnd)) {
        event.preventDefault();
    }
  }
  ValidarDNI(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const textoActual = input.value;
    const teclaPresionada = event.key;
    const longitudTexto = textoActual.length;

    // Permitir teclas de control
    if (['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(teclaPresionada)) {
      return;
    }

    // Permitir solo dígitos y la letra final en la posición correcta
    if (longitudTexto < 13 && /^\d$/.test(teclaPresionada)) {
      return;
    } else if (longitudTexto === 13 && /^[A-Z]$/.test(teclaPresionada)) {
      return;
    }

    // Si no cumple con las reglas anteriores, prevenir la acción
    event.preventDefault();
  }


  // Método para aplicar un filtro global en la tabla
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Método para seleccionar un mantenimiento
  selectUnidadMedida(unidadeMedida: any) {
    this.selectedMantenimiento = unidadeMedida;
  }

  // Método para mostrar el formulario de creación de una nuevo mantenimiento
  CrearMantenimiento() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.form.reset();
    this.identity = "crear";
    this.titulo = "Nuevo";
    sessionStorage.clear();
  }

  // Método para cerrar el formulario de creación/edición del mantenimiento
  CerrarMantenimiento() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
    sessionStorage.clear();
  }

  // Método para manejar el clic del botón según el valor de identity
  handleClick() {
    if (this.identity === 'crear') {
      this.Guardar();
    } else if (this.identity === 'editar') {
      this.Editt = true;
    }
  }

  // Método para confirmar la edición del mantenimiento
  confirmEdit() {
    this.Guardar();
    this.Editt = false;
  }

  // Método para editar el mantenimiento
  EditarMantenimiento() {
    console.log('Selected Categoria Viatico:', this.selectedMantenimiento);
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.identity = "editar";
    this.titulo = "Editar";
    this.form.patchValue({
      mant_DNI: this.selectedMantenimiento.mant_DNI,
      mant_NombreCompleto: this.selectedMantenimiento.mant_NombreCompleto,
      mant_Telefono: this.selectedMantenimiento.mant_Telefono,
    });
    this.id = this.selectedMantenimiento.mant_Id;
    sessionStorage.setItem('id', this.selectedMantenimiento.mant_Id.toString());
  }

  // Método para mostrar los detalles del mantenimiento
  DetalleMantenimiento() {
    this.Index = false;
    this.Create = false;
    this.Detail = true;
    this.detalle_mate_id = this.selectedMantenimiento.codigo;
    this.detalle_Dni = this.selectedMantenimiento.mant_DNI;
    this.detalle_NombreCompleto = this.selectedMantenimiento.mant_NombreCompleto;
    this.detalle_Telefono = this.selectedMantenimiento.mant_Telefono;
    this.detalle_usuaCreacion = this.selectedMantenimiento.usuaCreacion;
    if (this.selectedMantenimiento.usua_Modificacion != null) {
      this.detalle_usuaModificacion = this.selectedMantenimiento.usua_Modificacion;
      this.detalle_FechausuaModificacion = new Date(this.selectedMantenimiento.mant_FechaModificacion).toLocaleDateString();
    } else {
      this.detalle_usuaModificacion = "";
      this.detalle_FechausuaModificacion = "";
    }
    this.detalle_FechausuaCreacion = new Date(this.selectedMantenimiento.mant_FechaCreacion).toLocaleDateString();
    console.log(this.selectedMantenimiento);
  }

  // Método para mostrar el cuadro de diálogo de confirmación de eliminación
  EliminarMantenimiento() {
    this.detalle_NombreCompleto = this.selectedMantenimiento.mant_NombreCompleto;
    this.id = this.selectedMantenimiento.mant_Id;
    console.log(this.id);
    this.Delete = true;
  }

  // Método para guardar un mantenimiento
  Guardar() {
    if (this.form.valid && this.form.value.mant_NombreCompleto.trim() !== '') {
        const form2 = this.form.value;
        const id = sessionStorage.getItem('id');
        console.log('id del mantenimiento',id);
      const mantenimiento: any = {
        mant_Id: id,
        mant_DNI: form2.mant_DNI,
        mant_NombreCompleto: form2.mant_NombreCompleto,
        mant_Telefono: form2.mant_Telefono,
        usua_Creacion: 3,
        usua_Modificacion: 3
      };

      if (this.identity !== "editar") {
        this.service.Insertar(mantenimiento).subscribe(
          (respuesta: Respuesta) => {
            console.log(respuesta);
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });
              this.Listado();
              this.CerrarMantenimiento();
              this.submitted = false;
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El registro ya existe', life: 3000 });
              console.log('RESPONSE:' + respuesta.success);
            }
          }
        );
      } else {
        this.service.Actualizar(mantenimiento).subscribe(
          (respuesta: Respuesta) => {
            console.log(respuesta);
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 });
              this.Listado();
              this.CerrarMantenimiento();
              this.submitted = false;
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El registro ya existe', life: 3000 });
              console.log('RESPONSE:' + respuesta.success);
            }
          }
        );
      }
    } else {
      this.submitted = true;
    }
  }

  // Método para eliminar un mantenimiento
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
          detail,
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
          summary: 'Error Externo',
          detail: error.message || error,
          life: 3000
        });
      }
    );
  }
}
