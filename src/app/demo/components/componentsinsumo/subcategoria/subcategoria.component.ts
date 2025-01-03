import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubCategoriaService } from 'src/app/demo/services/servicesgeneral/subcategoria.service';
import { drop, subcategoria } from 'src/app/demo/models/modelsgeneral/subcategoriaviewmodel';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-subcategoria',
  templateUrl: './subcategoria.component.html',
  styleUrls: ['./subcategoria.component.scss'],
  providers: [MessageService]
})
export class SubcategoriaComponent implements OnInit {
  categoria: drop[] = [];
  filteredCategories: drop[] = [];
  subcategoria: subcategoria[] = [];
  Error_SubCategoria: string = "El campo es requerido."
  items: MenuItem[] = [];
  Index = true;
  Create = false;
  Detail = false;
  Delete = false; // Propiedad para el modal de confirmación de eliminacion
  Edit = false; // Propiedad para el modal de confirmación de edición
  form: FormGroup;
  submitted = false;
  identity = 'Crear';
  selectedsubcategoria: any;
  id = 0;
  titulo = 'Nueva';
//SIPINNER
loading: boolean = true;
  // Detalles
  Datos = [{}];
  detalle_suca_Id = '';
  detalle_suca_Descripcion = '';
  detalle_cate_Id = '';
  detalle_cate_Descripcion = '';
  detalle_usuaCreacion = '';
  detalle_usuaModificacion = '';
  detalle_FechausuaCreacion = '';
  detalle_FechausuaModificacion = '';

  constructor(
    
    private messageService: MessageService,
    private service: SubCategoriaService,
    private router: Router,
    private fb: FormBuilder,
    public cookieService: CookieService,
  ) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/insumo/subcategoria')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
    // Inicialización del formulario con validaciones
    this.form = this.fb.group({
      suca_Id: [0],
      suca_Descripcion: [null, Validators.required],
      cate_Descripcion: [''],
      taca_FechaCreacion: [new Date().toISOString()],
      taca_FechaModificacion: [new Date().toISOString()]
    });
  }
  onRouteChange(): void {
    this.ngOnInit();
  }
  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.categoria = [];
    this.filteredCategories = [];
    this.subcategoria = [];
    this.Index = true;
    this.Create = false;
    this.Detail = false;
    this.Delete = false; // Propiedad para el modal de confirmación de eliminacion
    this.Edit = false; // Propiedad para el modal de confirmación de edición
    this.id = 0;

    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
    this.Listado();
    //items de menu desplegable de acciones que llama el id 
    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.EditarSubCategoria() },
      { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleSubCategoria() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.EliminarSubCategoria() }
    ];
  }

  // Método para listar todas las subcategorías
// Método para listar todas las subcategorías y categorías

Listado() {
  this.loading = true; // Mostrar el spinner
  // Llamada al servicio para listar subcategorías
  this.service.Listar()
  .subscribe((data: any) => {
    //Formateamos las fecha creacion y la de modificacion
    this.subcategoria = data.map((subcategoria: any) => ({
      ...subcategoria,
      suca_FechaCreacion: new Date(subcategoria.suca_FechaCreacion).toLocaleDateString(),
      suca_FechaModificacion: new Date(subcategoria.suca_FechaModificacion).toLocaleDateString()
    }));    
    this.loading = false;  
  }),()=>{
    this.loading = false;
  }


  // Llamada al servicio para obtener la lista de categorías
  this.service.DROP().subscribe(
    (data: drop[]) => {
      // Asignar los datos de las categorías a la propiedad 'categoria'
      this.categoria = data.sort((a, b) => a.cate_Descripcion.localeCompare(b.cate_Descripcion));
      // Log para verificar que las categorías se cargaron correctamente

    }
  );
}

  // Método para buscar categorías basadas en la entrada del usuario
  searchCategory(event: any) {
    let query = event.query;
    this.filteredCategories = this.categoria.filter(cate => cate.cate_Descripcion.toLowerCase().includes(query.toLowerCase()));
  }

   //Nivel seleccionado en el autocompletado
   onNivelSelect(event: any) {
    const nivelSeleccionado = event;
    this.form.patchValue({ cate_Descripcion: nivelSeleccionado.value.cate_Descripcion});
  }

  // Método para filtrar globalmente la tabla
  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Método para mostrar el formulario de creación
  CrearSubCategoria() {
    this.Index = false;
    this.Create = true;
    this.Detail = false;
    this.form.reset();
    this.submitted = false;
    this.identity = 'crear';
    this.titulo = 'Nueva';
  }

  // Método para cerrar el formulario de subcategoría
  CerrarSubCategoria() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.Edit = false;
  }

  // Método para mostrar el formulario de edición
  EditarSubCategoria() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.identity = 'editar';
    this.titulo = 'Editar';
    this.form.patchValue({
      suca_Descripcion: this.selectedsubcategoria.suca_Descripcion,
      cate_Descripcion: this.categoria.find(cate => cate.cate_Id === this.selectedsubcategoria.cate_Id).cate_Descripcion // Encontrar y establecer el objeto de categoría completo
    });
    this.id = this.selectedsubcategoria.suca_Id;
  

  }

  // Método para confirmar la eliminación de una subcategoría
  async confirmarEliminar() {
    // Cierra el cuadro de diálogo de confirmación de eliminación
    this.Delete = false;

    try {
        // Llama al servicio para eliminar la subcategoría y espera la respuesta
        const response = await this.service.Eliminar(this.selectedsubcategoria.suca_Id);
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
            detail,
            life: 3000,styleClass:'iziToast-custom'
        });

        // Reinicia el componente
        this.Listado();
    } catch (error) {
        // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Comunicarse con un administrador.',
            life: 3000,styleClass:'iziToast-custom'
        });
    }
  }

  // Método para mostrar los detalles de una subcategoría
  DetalleSubCategoria() {
    this.service.Buscar(this.selectedsubcategoria.suca_Id).subscribe(
      (subcategoria: subcategoria) => {
        this.Index = false;
        this.Create = false;
        this.Detail = true;
        this.detalle_suca_Id = this.selectedsubcategoria.codigo;
        this.detalle_suca_Descripcion = subcategoria.suca_Descripcion;
        this.detalle_cate_Descripcion = subcategoria.cate_Descripcion;
        this.detalle_usuaCreacion = subcategoria.usuaCreacion;
        this.detalle_usuaModificacion = subcategoria.usuaModificacion;
        this.detalle_FechausuaCreacion = new Date(subcategoria.suca_FechaCreacion).toLocaleDateString();
        this.detalle_FechausuaModificacion = subcategoria.suca_FechaModificacion 
          ? new Date(subcategoria.suca_FechaModificacion).toLocaleDateString()
          : ''; // Manejar caso donde la fecha de modificación pueda ser null o undefined
        
        // Asigna selectedsubcategoria para edición
        this.selectedsubcategoria = subcategoria;
     
      }
    );
  }

  // Validación para permitir solo números
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

  // Validación para permitir solo texto
  ValidarTexto($event: KeyboardEvent | ClipboardEvent | InputEvent) {
    const inputElement = $event.target as HTMLInputElement;
  
    // Handling keyboard input
    if ($event instanceof KeyboardEvent) {
      const key = $event.key;
  
      // Allowing control keys
      if (
        key === 'Backspace' ||
        key === 'Delete' ||
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        key === 'Tab'
      ) {
        return;
      }
  
      // Prevent space as the first character
      if (inputElement.value.length === 0 && key === ' ') {
        $event.preventDefault();
        return;
      }
  
      // Prevent consecutive spaces (space must follow a letter)
      if (key === ' ' && inputElement.value.endsWith(' ')) {
        $event.preventDefault();
        return;
      }
  
      // Allow only letters and spaces
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(key)) {
        $event.preventDefault();
      }
    }
  
    // Handling pasted content
    if ($event instanceof ClipboardEvent) {
      const clipboardData = $event.clipboardData;
      const pastedData = clipboardData.getData('text');
  
      // Prevent pasting invalid characters
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(pastedData)) {
        $event.preventDefault();
      }
  
      // Prevent pasting content that starts with a space when input is empty
      if (inputElement.value.length === 0 && pastedData.startsWith(' ')) {
        $event.preventDefault();
      }
  
      // Prevent consecutive spaces when pasting
      if (inputElement.value.endsWith(' ') && pastedData.startsWith(' ')) {
        $event.preventDefault();
      }
    }
  
    // Handling direct input changes
    if ($event instanceof InputEvent) {
      // Remove invalid characters
      inputElement.value = inputElement.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  
      // Prevent consecutive spaces (trim start)
      if (inputElement.value.startsWith(' ')) {
        inputElement.value = inputElement.value.trimStart();
      }
  
      // Replace multiple consecutive spaces with a single space
      inputElement.value = inputElement.value.replace(/\s{2,}/g, ' ');
    }
  }
  

  // Validación para permitir texto y números
  ValidarTextoNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ 0-9]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  // Método para mostrar el cuadro de diálogo de confirmación de eliminación
  EliminarSubCategoria() {
  
    this.Delete = true;
    this.id = this.selectedsubcategoria.suca_Id;
  }

  // Método para seleccionar una subcategoría de la tabla
  onRowSelect(subcategoria: subcategoria) {
    this.selectedsubcategoria = subcategoria;
  }

  // Método para mostrar el cuadro de diálogo de confirmación de edición
  confirmarEditar() {
    this.Edit = true;
  }

  // Método para guardar una subcategoría
  Guardar() {
    const selectedCategoryId = this.categoria.find(cate => cate.cate_Descripcion === this.form.value.cate_Descripcion)?.cate_Id ?? 0;
    if (selectedCategoryId !== 0) {
    
      this.form.get('cate_Descripcion')?.setErrors(null);
      }  else if(this.form.value.cate_Descripcion == "" || this.form.value.cate_Descripcion == null){
        this.Error_SubCategoria = "El campo es requerido."
        this.form.get('cate_Descripcion')?.setErrors({ 'invalidCateId': true });
      } else {
        this.Error_SubCategoria = "Opción no encontrada."
        this.form.get('cate_Descripcion')?.setErrors({ 'invalidCateId': true });
      }
    if (this.form.valid) {
      const subcategoria: subcategoria = {
        suca_Id: this.identity === 'editar' ? this.id : 0,
        suca_Descripcion: this.form.value.suca_Descripcion,
        cate_Id: selectedCategoryId.toString(),
        usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
        suca_FechaCreacion: new Date().toISOString(),
        suca_FechaModificacion: new Date().toISOString()
      };
     
      if (this.identity === 'crear') {
        const subcategoriaExiste = this.subcategoria.some(sc =>
          sc.suca_Descripcion.toLowerCase() === subcategoria.suca_Descripcion.toLowerCase() &&
          sc.cate_Id === subcategoria.cate_Id
        );
  
        if (subcategoriaExiste) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La subcategoría ya existe en esta categoría.', life: 3000,styleClass:'iziToast-custom' });
          return; // Salir de la función si ya existe
        }
  
        this.service.Insertar(subcategoria).subscribe(
          (respuesta: Respuesta) => {
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
              this.Listado();
              this.CerrarSubCategoria();
              this.submitted = false;
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La Sub Categoría ya existe.', life: 3000,styleClass:'iziToast-custom'});
            }
          },
          error => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al realizar esta operación.', life: 3000,styleClass:'iziToast-custom' });
          }
        );
      } else {
        this.Edit = true; // Mostrar el modal de confirmación
      }
    } else {
      this.submitted = true;
    }
  }
  

  
// Método para guardar la edición de una subcategoría
GuardarEdicion() {
  this.Edit = false;
  const selectedCategoryId = this.categoria.find(cate => cate.cate_Descripcion === this.form.value.cate_Descripcion)?.cate_Id ?? 0;
  if (selectedCategoryId !== 0) {
  
    this.form.get('cate_Descripcion')?.setErrors(null);
    }  else if(this.form.value.cate_Descripcion == "" || this.form.value.cate_Descripcion == null){
      this.Error_SubCategoria = "El campo es requerido."
      this.form.get('cate_Descripcion')?.setErrors({ 'invalidCateId': true });
    } else {
      this.Error_SubCategoria = "Opción no encontrada."
      this.form.get('cate_Descripcion')?.setErrors({ 'invalidCateId': true });
    }
  if (this.form.valid) {
    const newDescription = this.form.value.suca_Descripcion;
  

    // Crear un objeto subcategoria con los valores del formulario
    const subcategoria: subcategoria = {
      suca_Id: this.id,
      suca_Descripcion: newDescription,
      cate_Id: selectedCategoryId.toString(),
      usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
      usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
      suca_FechaCreacion: new Date().toISOString(),
      suca_FechaModificacion: new Date().toISOString()
    };

    // Verificar si el nombre ha cambiado
    if (this.selectedsubcategoria.suca_Descripcion.toLowerCase() !== newDescription.toLowerCase() ||
        this.selectedsubcategoria.cate_Id !== selectedCategoryId) {
      // Verificar si la nueva descripción ya existe en el resto del listado
      const subcategoriaExiste = this.subcategoria.some(sc =>
        sc.suca_Descripcion.toLowerCase() === newDescription.toLowerCase() &&
        sc.cate_Id === selectedCategoryId.toString() &&
        sc.suca_Id !== this.id
      );

      // Si la nueva descripción ya existe, mostrar un mensaje de error
      if (subcategoriaExiste) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La subcategoría ya existe en esta categoría.', life: 3000,styleClass:'iziToast-custom' });
        return; // Salir de la función si ya existe
      }
    }

    // Llamar al servicio para actualizar la subcategoría
    this.service.Actualizar(subcategoria).subscribe(
      (respuesta: Respuesta) => {
        if (respuesta.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 ,styleClass:'iziToast-custom'});
          this.Listado();
          this.CerrarSubCategoria();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La Sub Categoría ya existe.', life: 3000 ,styleClass:'iziToast-custom'});
        }
      }
    );
  } else {
    this.submitted = true;
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
  this.form.controls['suca_Descripcion'].setValue(inputElement.value);
}
}
