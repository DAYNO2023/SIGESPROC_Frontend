import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { EmpresaBienRaiz } from 'src/app/demo/models/modelsbienraiz/empresabienraizviewmodel';
import { EmpresaBienRaizService } from 'src/app/demo/services/servicesbienraiz/empresaBienRaiz.service';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';

/**
 * `EmpresaBienRaizComponent` gestiona la administración de empresas de bienes raíces, incluyendo la creación,
 * edición, visualización de detalles y eliminación de registros.
 */
@Component({
  selector: 'app-empresabienraiz',
  templateUrl: './empresabienraiz.component.html',
  styleUrls: ['./empresabienraiz.component.scss'],
  providers: [MessageService, ConfirmationService]
})
  // Propiedades del componente
export class EmpresaBienRaizComponent implements OnInit {
  EmpresaBienesRaices: EmpresaBienRaiz[] = [];// Lista de empresas de bienes raíces
  items: MenuItem[] = [];// Opciones del menú contextual
  Index: boolean = true;// Indicador de vista principal
  Create: boolean = false;// Indicador de vista de creación
  Detail: boolean = false;// Indicador de vista de detalles
  Delete: boolean = false;// Indicador de eliminación
  form: FormGroup;// Formulario reactivo
  submitted: boolean = false; // Indicador de envío de formulario
  identity: string = "Crear";// Identificador de acción (crear o editar)
  selectedEmpresaBienRaiz: any;// Empresa de bienes raíces seleccionada
  id: number = 0;// Id del registro
  titulo: string = "Nueva";//titulo de ls formularios
  confirmEditDialog: boolean = false;// Diálogo de confirmación de edición
  deleteEmpresaDialog: boolean = false;// Diálogo de confirmación de eliminación
  Descripcion: string = "";// Descripción del registro a eliminar
  isLoading: boolean = false; // Variable para controlar el spinner
  loading: boolean= true; // Indicador de carga inicial
  // Detalles
  Datos = [{}];
  detalle_embr_Id: string = "";
  detalle_embr_Nombre: string = "";
  detalle_ContactoA: string = "";
  detalle_ContactoB: string = "";
  detalle_TelefonoA: string = "";
  detalle_TelefonoB: string = "";
  detalle_usuaCreacion: string = "";
  detalle_usuaModificacion: string = "";
  detalle_usua_Creacion: string = "";
  detalle_embr_FechaCreacion: string = "";
  detalle_usua_Modificacion: string = "";
  detalle_embr_FechaModificacion: string = "";
  detalle_embr_Estado: string = "";
 /**
   * Constructor para `EmpresaBienRaizComponent`.
   * @param messageService - Servicio para mostrar mensajes
   * @param service - Servicio para gestionar empresas de bienes raíces
   * @param router - Router para navegación
   * @param fb - Constructor de formularios
   */
  constructor(
    private messageService: MessageService,
    private service: EmpresaBienRaizService,
    private router: Router,
    private fb: FormBuilder,
    public cookieService: CookieService,
  ) 
  // Inicializa el formulario validaciones
  {
    this.form = this.fb.group({
      embr_Nombre: ['', Validators.required],
      embr_ContactoA: ['', Validators.required]
,      embr_ContactoB: ['']
 ,     embr_TelefonoA: ['', Validators.required]
  ,    embr_TelefonoB: ['']
    });
  }



  
  handleInput(event: Event, controlName: string) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    // Limpieza del texto según las reglas de validación
    inputElement.value = texto
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '') // Permitir solo letras, números y espacios
        .replace(/\s{2,}/g, ' ') // Reemplazar múltiples espacios con un solo espacio
        .replace(/^\s/, ''); // Eliminar espacios al inicio

    // Actualizar solo el control específico que está siendo modificado
    this.form.controls[controlName].setValue(inputElement.value);
}



 /**
   * Inicializa el componente, cargando la lista de empresas de bienes raices y configurando el menu.
   */
  ngOnInit(): void {
    const token = this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.urlAfterRedirects.includes('/sigesproc/bienraiz/empresabienraiz')) {
        this.onRouteChange();
      }
    });
    this.Listado();
    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarEmpresaBienRaiz() },
      { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleEmpresaBienRaiz() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.eliminarEmpresaBienRaiz() },
    ];
  }

 /**
   * Lista las empresas de bienes raices
   */
  Listado() {
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
    //inicializador del spinner
    this.loading = true;
    this.service.Listar().subscribe(
      (data: any) => {
        this.EmpresaBienesRaices = data.map((EmpresaBienesRaices: any) => ({
          ...EmpresaBienesRaices,
          embr_FechaCreacion: new Date(EmpresaBienesRaices.embr_FechaCreacion).toLocaleDateString(),
          embr_FechaModificacion: new Date(EmpresaBienesRaices.embr_FechaModificacion).toLocaleDateString()
        }));
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      },
      () => {
        //oculta el spinner una vez cargados los datos
        this.loading = false; 
    }
    );
  }
  onRouteChange() {
    // Reinicializar la vista al índice
    this.Index = true;
    this.Create = false;
    this.Detail = false;
  
    // Limpiar cualquier otro estado o formulario
    this.selectedEmpresaBienRaiz = null;
    this.form.reset();
    this.submitted = false;
  }
/**
   * Carga los datos iniciales de las empresas de bienes raices.
   */
  cargarDatos() {
    this.isLoading = true;
    this.Listado();
  }

 /**
   * Filtra la tabla globalmente
   * @param table - Tabla a filtrar
   * @param event - Evento que contiene el valor de filtro
   */
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

 /**
   * Selecciona una empresa de bienes raices 
   * @param empresaBienRaiz - Empresa seleccionada
   */
  selectEmpresaBienRaiz(empresaBienRaiz: any) {
    this.selectedEmpresaBienRaiz = empresaBienRaiz;
  }


  /**
   * Muestra el formulario para crear una nueva empresa de bienes raices.
   */
  CrearEmpresaBienRaiz() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.form.reset();
    this.identity = "crear";
    this.submitted = false;
    this.titulo = "Nueva";
  }

  /**
   * Muestra el formulario para editar una empresa de bienes raices existente.
   */
  EditarEmpresaBienRaiz() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.submitted = false;
    this.identity = "editar";
    this.titulo = "Editar";
    this.form.patchValue({
      embr_Nombre: this.selectedEmpresaBienRaiz.embr_Nombre,
      embr_ContactoA: this.selectedEmpresaBienRaiz.embr_ContactoA,
      embr_ContactoB: this.selectedEmpresaBienRaiz.embr_ContactoB,
      embr_TelefonoA: this.selectedEmpresaBienRaiz.embr_TelefonoA,
      embr_TelefonoB: this.selectedEmpresaBienRaiz.embr_TelefonoB,
      embr_Id: this.selectedEmpresaBienRaiz.embr_Id
    });
    this.id = this.selectedEmpresaBienRaiz.embr_Id;
  }

  /**
   * Muestra los detalles de la empresa de bienes raices seleccionada.
   */
    DetalleEmpresaBienRaiz() {
    this.Index = false;
    this.Create = false;
    this.Detail = true;
    this.detalle_embr_Id = this.selectedEmpresaBienRaiz.codigo;
    this.detalle_embr_Nombre = this.selectedEmpresaBienRaiz.embr_Nombre;
    this.detalle_ContactoA = this.selectedEmpresaBienRaiz.embr_ContactoA;
    this.detalle_ContactoB = this.selectedEmpresaBienRaiz.embr_ContactoB;
    this.detalle_TelefonoA = this.selectedEmpresaBienRaiz.embr_TelefonoA;
    this.detalle_TelefonoB = this.selectedEmpresaBienRaiz.embr_TelefonoB;
    this.detalle_usuaCreacion = this.selectedEmpresaBienRaiz.usuaCreacion;
    this.detalle_usuaModificacion = this.selectedEmpresaBienRaiz.usuaModificacion;
    this.detalle_usua_Creacion = this.selectedEmpresaBienRaiz.usua_Creacion;
    this.detalle_embr_FechaCreacion = this.selectedEmpresaBienRaiz.embr_FechaCreacion;
    this.detalle_usua_Modificacion = this.selectedEmpresaBienRaiz.usua_Modificacion;
    this.detalle_embr_FechaModificacion = this.selectedEmpresaBienRaiz.embr_FechaModificacion;
    this.detalle_embr_Estado = this.selectedEmpresaBienRaiz.embr_Estado;

    if (this.selectedEmpresaBienRaiz.usuaModificacion != null) {
      this.detalle_usuaModificacion = this.selectedEmpresaBienRaiz.usuaModificacion;
      this.detalle_embr_FechaModificacion = this.selectedEmpresaBienRaiz.embr_FechaModificacion;
    } else {
      this.detalle_usuaModificacion = "";
      this.detalle_embr_FechaModificacion = "";
    }
  }

 /**
   * Muestra el dialogo de confirmacion para eliminar una empresa de bienes raiz.
   */
    eliminarEmpresaBienRaiz() {
    this.Descripcion = this.selectedEmpresaBienRaiz.embr_Nombre;
    this.deleteEmpresaDialog = true;
  }

  /**
   * Confirma la eliminacion de una empresa de bienes raiz.
   */
    async confirmarEliminar() {
    this.deleteEmpresaDialog = false;
    this.id = this.selectedEmpresaBienRaiz.embr_Id;

    try {
      const response = await this.service.Eliminar(this.id);
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
        life: 3000,
        styleClass:'iziToast-custom'
      });

      this.ngOnInit();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error Externo',
        detail: error.message || error,
        life: 3000,
        styleClass:'iziToast-custom'
      });
    }
  }

 /**
   * Guarda los cambios realizados en el formulario.
   */
  Guardar() {
    if (this.form.valid) {
      if (this.identity === "editar") {
        this.confirmEditDialog = true;
      } else {
        const empresaBienRaiz: EmpresaBienRaiz = {
          embr_Id: this.id,
          embr_Nombre: this.form.value.embr_Nombre,
          embr_ContactoA: this.form.value.embr_ContactoA,
          embr_ContactoB: this.form.value.embr_ContactoB,
          embr_TelefonoA: this.form.value.embr_TelefonoA,
          embr_TelefonoB: this.form.value.embr_TelefonoB,
          usua_Creacion:parseInt(this.cookieService.get('usua_Id')),
          usua_Modificacion:parseInt(this.cookieService.get('usua_Id')) ,
          embr_FechaModificacion: new Date().toISOString()
        };

        this.service.Insertar(empresaBienRaiz).subscribe(
          (respuesta: Respuesta) => {
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
              this.Listado();
              this.CerrarEmpresaBienRaiz();
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La empresa ya existe.', life: 3000,styleClass:'iziToast-custom' });
            }
          }
        );
      }
    } else {
      this.submitted = true;
    }
  }


  /**
   * Confirma la edicion de una empresa de bienes raiz.
   */
    confirmarEdicion() {
    const empresaBienRaiz: EmpresaBienRaiz = {
      embr_Id: this.id,
      embr_Nombre: this.form.value.embr_Nombre,
      embr_ContactoA: this.form.value.embr_ContactoA,
      embr_ContactoB: this.form.value.embr_ContactoB,
      embr_TelefonoA: this.form.value.embr_TelefonoA,
      embr_TelefonoB: this.form.value.embr_TelefonoB,
      usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
      usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
      embr_FechaModificacion: new Date().toISOString()
    };

    this.service.Actualizar(empresaBienRaiz).subscribe(
      (respuesta: Respuesta) => {
        if (respuesta.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000,styleClass:'iziToast-custom'});
          this.Listado();
          this.CerrarEmpresaBienRaiz();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La empresa ya existe.', life: 3000,styleClass:'iziToast-custom' });
        }
      }
    );
    this.confirmEditDialog = false;
  }

 /**
   * Cierra el formulario y vuelve a la vista principal.
   */
  CerrarEmpresaBienRaiz() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
  }

 /**
   * Validación de input para permitir solo numeros.
   * @param event - Evento del teclado
   */

  ValidarNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
      event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
    if (inputElement.value.length >= 8 && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }
    if (inputElement.value.length < 8) {
      inputElement.setCustomValidity('Debes ingresar al menos 8 números.');
    } else {
      inputElement.setCustomValidity(''); // Reiniciar el mensaje de error
    }
  }
   /**
   * Valida el formato de un numero de teléfono.
   */
  validarTelefono() {
    const regex = /^\+?(\d[\d-. ]+)?(\([\d-. ]+\))?[\d-. ]+\d$/;
}


 /**
   * Validación de input para permitir solo texto.
   * @param event - Evento del teclado
   */
 ValidarTexto($event: KeyboardEvent | ClipboardEvent | InputEvent) {
  const inputElement = $event.target as HTMLInputElement;

  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

  if ($event instanceof KeyboardEvent) {
    const key = $event.key;

    // Permitir teclas de navegación y edición
    if (
      key === 'Backspace' ||
      key === 'Delete' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'Tab'
    ) {
      return;
    }

    // Evitar espacios al inicio
    if (inputElement.value.length === 0 && key === ' ') {
      $event.preventDefault();
      return;
    }

    // Validar que el caracter sea una letra o espacio (incluyendo acentos) y que no sea un emoji
    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]$/.test(key) || emojiRegex.test(key)) {
      $event.preventDefault();
    }
  }

  if ($event instanceof ClipboardEvent) {
    const clipboardData = $event.clipboardData;
    const pastedData = clipboardData.getData('text');

    // Evitar emojis y caracteres no permitidos en el texto pegado
    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]*$/.test(pastedData) || emojiRegex.test(pastedData)) {
      $event.preventDefault();
    }

    // Evitar que el texto pegado comience con un espacio
    if (inputElement.value.length === 0 && pastedData.startsWith(' ')) {
      $event.preventDefault();
    }
  }

  if ($event instanceof InputEvent) {
    // Reemplazar cualquier caracter que no sea permitido y quitar emojis
    inputElement.value = inputElement.value.replace(/[^a-zA-Z\sáéíóúÁÉÍÓÚñÑ]/g, '').replace(emojiRegex, '');

    // Eliminar espacios al inicio
    if (inputElement.value.startsWith(' ')) {
      inputElement.value = inputElement.value.trimStart();
    }
  }
}
allowOnlyAlphanumeric(event: any) {
  event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  .replace(/\s{2,}/g, ' ')
  .replace(/^\s/, '');
}


  /**
   * Validación de input para permitir texto y numeros.
   * @param event - Evento del teclado
   */
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
}
