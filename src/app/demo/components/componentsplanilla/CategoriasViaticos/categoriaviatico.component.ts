import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { categoriaviaticoService } from 'src/app/demo/services/Servicesplanilla/categoriaviatico.service';
import { categoriaviatico } from 'src/app/demo/models/modelsplanilla/categoriaviaticoviewmodel';
import { MensajeViewModel } from 'src/app/demo/models/MessageViewModel';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-presupuesto',
  templateUrl: './categoriaviatico.component.html',
  styleUrl: './categoriaviatico.component.scss',
  providers: [ MessageService]
})
export class categoriaviaticoComponent implements OnInit {
  categoriaviatico: categoriaviatico[] = [];
  items: MenuItem[] = [];
  Index: boolean = true;
  Editt: boolean = false;
  Create: boolean = false;
  Detail: boolean = false;
  Delete: boolean = false;
  form: FormGroup;
  usua_Id: number;
  submitted: boolean = false;
  identity: string  = "Crear";
  selectedCategoriaViatico: any;
  id: number = 0;
  textoIngresado: string = '';
  filaCount: number = 1;
  titulo: string = "Nueva Categoría Viático";
  loading: boolean = false;
  // Detalles
  Datos = [{}];
  detalle_cavi_Id: string = "";
  detalle_caviDescripcion: string = "";
  detalle_usuaCreacion: string = "";
  detalle_usuaModificacion: string = "";
  detalle_FechausuaCreacion: string = "";
  detalle_FechausuaModificacion: string = "";
  
  constructor(
    private messageService: MessageService,
    private service: categoriaviaticoService,
    private router: Router,
    private fb: FormBuilder,
    public cookieService: CookieService,
  ) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/planilla/categoriasviaticos')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
    this.form = this.fb.group({
      cavi_Descripcion: ['', Validators.required]
    });
  }
  onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar
    // console.log('Ruta cambiada, reejecutando lógica...');
    this.ngOnInit();
  }
  ngOnInit(): void {
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
  
    this.usua_Id = parseInt(this.cookieService.get('usua_Id'));
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
    this.Listado();

    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarCatgeoriaViatico() },
      { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleCatgoriaViatico() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.EliminarCatgeoriaViatico() },
    ];
  }

  // Método para listar las categorías de viáticos
  Listado() {
    this.loading = true
    this.service.Listar().subscribe(
      (data: any) => {
        this.categoriaviatico = data.map((categoriaviatico: any) => ({
          ...categoriaviatico,
          unme_FechaCreacion: new Date(categoriaviatico.cavi_FechaCreacion).toLocaleDateString(),
          unme_FechaModificacion: new Date(categoriaviatico.cavi_FechaModificacion).toLocaleDateString()
        }));
        this.loading  = false
      },
      error => {
        console.error(error);
      }
    );
  }

  // Método para regresar a la vista anterior
  regresar() {
    this.CerrarCategoriaViatico();
  }

  // Método para validar el texto ingresado en los campos
  validarTexto(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;
    const cursorPosition = inputElement.selectionStart;
    const allowedKeys = /^[a-zñA-ZÑáéíóúüÁÉÍÓÚÜ\s]$/;
    if (!allowedKeys.test(event.key) &&
        !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(event.key) &&
        event.keyCode !== 13) {
      event.preventDefault();
    } else if (event.key === ' ' && (texto.trim() === '' || cursorPosition === 0)) {
      event.preventDefault();
    }
    if (event.keyCode === 13) {
      this.Guardar();
    }
  }

  handleInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let texto = inputElement.value;
    texto = texto.replace(/[^a-zñA-ZÑáéíóúüÁÉÍÓÚÜ\s]/g, '');
    texto = texto.trimStart();
    inputElement.value = texto;
    this.form.controls['cavi_Descripcion'].setValue(texto);
  }
  ManejodeDesenfoque(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let texto = inputElement.value;
    
    if (texto) {
      texto = texto.trimEnd();
      inputElement.value = texto; 
      this.form.controls['cavi_Descripcion'].setValue(texto); 
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

  // Método para aplicar un filtro global en la tabla
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Método para seleccionar una unidad de medida
  selectUnidadMedida(categoriaviatico: any) {
    this.selectedCategoriaViatico = categoriaviatico;
  }

  // Método para mostrar el formulario de creación de una nueva categoría de viático
  CrearCategoriaViatico() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.form.reset();
    this.identity = "crear";
    this.titulo = "Nueva";
  }

  // Método para cerrar el formulario de creación/edición de una categoría de viático
  CerrarCategoriaViatico() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
  }

  // Método para manejar el clic del botón según el valor de identity
  handleClick() {
    if (this.identity === 'crear') {
      this.Guardar();
    } else if (this.identity === 'editar') {
      this.submitted = true;
      if (this.form.controls['cavi_Descripcion'].value.trim() === '') {
        return; 
      }
      this.Editt = true;
    }
  }

  // Método para confirmar la edición de una unidad de medida
  confirmEdit() {
    
    this.Guardar();
    this.Editt = false;
  }

  // Método para editar una categoría de viático
  EditarCatgeoriaViatico() {
    // console.log('Selected Categoria Viatico:', this.selectedCategoriaViatico);
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.identity = "editar";
    this.titulo = "Editar";
    this.form.patchValue({
      cavi_Descripcion: this.selectedCategoriaViatico.cavi_Descripcion,
    });
    this.id = this.selectedCategoriaViatico.cavi_Id;
  }

  // Método para mostrar los detalles de una categoría de viático
  DetalleCatgoriaViatico() {
    this.Index = false;
    this.Create = false;
    this.Detail = true;
    this.detalle_cavi_Id = this.selectedCategoriaViatico.codigo;
    this.detalle_caviDescripcion = this.selectedCategoriaViatico.cavi_Descripcion;
    this.detalle_usuaCreacion = this.selectedCategoriaViatico.usuarioCreacion;
    if (this.selectedCategoriaViatico.usuarioModificacion != null) {
      this.detalle_usuaModificacion = this.selectedCategoriaViatico.usuarioModificacion;
      this.detalle_FechausuaModificacion = new Date(this.selectedCategoriaViatico.cavi_FechaModificacion).toLocaleDateString();
    } else {
      this.detalle_usuaModificacion = "";
      this.detalle_FechausuaModificacion = "";
    }
    this.detalle_FechausuaCreacion = new Date(this.selectedCategoriaViatico.cavi_FechaCreacion).toLocaleDateString();
    // console.log(this.selectedCategoriaViatico);
  }

  // Método para mostrar el cuadro de diálogo de confirmación de eliminación
  EliminarCatgeoriaViatico() {
    this.detalle_caviDescripcion = this.selectedCategoriaViatico.cavi_Descripcion;
    this.id = this.selectedCategoriaViatico.cavi_Id;
    // console.log(this.id);
    this.Delete = true;
  }

  // Método para guardar una categoría de viático
  Guardar() {
    if (this.form.valid && this.form.value.cavi_Descripcion.trim() !== '') {
      const Catgeoriaviatico: any = {
        cavi_Id: this.id,
        cavi_Descripcion: this.form.value.cavi_Descripcion.trim(),
        usua_Creacion: this.usua_Id,
        usua_Modificacion: this.usua_Id
      };

      if (this.identity !== "editar") {
        this.service.Insertar(Catgeoriaviatico).subscribe(
          (respuesta: Respuesta) => {
            // console.log(respuesta);
            if (respuesta.success) {
              this.messageService.add({ severity: 'success',styleClass: 'iziToast-custom', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });
              this.Listado();
              this.CerrarCategoriaViatico();
              this.submitted = false;
            } else {
              this.messageService.add({ severity: 'error',styleClass: 'iziToast-custom', summary: 'Error', detail: 'El registro ya existe.', life: 3000 });
              // console.log('RESPONSE:' + respuesta.success);
            }
          }
        );
      } else {
        this.service.Actualizar(Catgeoriaviatico).subscribe(
          (respuesta: Respuesta) => {
            // console.log(respuesta);
            if (respuesta.success) {
              this.messageService.add({ severity: 'success',styleClass: 'iziToast-custom', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 });
              this.Listado();
              this.CerrarCategoriaViatico();
              this.submitted = false;
            } else {
              this.messageService.add({ severity: 'error',styleClass: 'iziToast-custom', summary: 'Error', detail: 'El registro ya existe.', life: 3000 });
              // console.log('RESPONSE:' + respuesta.success);
            }
          }
        );
      }
    } else {
      this.submitted = true;
    }
  }

  // Método para eliminar una categoría de viático
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
          styleClass: 'iziToast-custom',
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
          styleClass: 'iziToast-custom',
          detail: error.message || error,
          life: 3000
        });
      }
    );
  }
}
