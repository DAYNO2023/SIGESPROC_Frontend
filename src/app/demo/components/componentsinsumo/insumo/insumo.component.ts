import { Component, OnInit, NgModule } from '@angular/core';
import { Router, NavigationEnd  } from '@angular/router';
import { Insumo, Fill, ddlMaterial, ddlSubcategoria, ddlCategorias } from '../../../models/modelsinsumo/insumosviewmodel';
import { InsumoService } from '../../../services/servicesinsumo/insumos.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-insumo',
  templateUrl: './insumo.component.html',
  styleUrls: ['./insumo.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class InsumoComponent implements OnInit {
  insumo: Insumo[] = [];
  // categorias: { label: string, value: number }[] = [];
subcategorias: { suca_Descripcion: string, suca_Id: number }[] = [];
//propiedad que almacena el valor de la subcategoria
  // materiales: { label: string, value: number }[] = [];
  display: boolean = false;
  isLoading = false;
  formInsumo: FormGroup;
  items: MenuItem[] = [];
  modalTitle: string = 'Nuevo Insumo';
  modalButtonLabel: string = 'Guardar';
  confirmacionVisible: boolean = false;
  selectedInsumo: Insumo | null = null;
  confirmInsumoDialog: boolean = false;
  detalless: boolean = false;
  confirm: boolean = true;
  codigo:number;
  Datos = [{}];
  insu_Id?: number;
  suca_Id?: number;
  mate_Id?: number;
  insu_Descripcion?: string;
  insu_Observacion?: string;
  insu_UltimoPrecioUnitario?: number;
  usua_Creacion?: number;
  insu_FechaCreacion?: string;
  usua_Modificacion?: number;
  insu_FechaModificacion?: string;
  usuaCreacion?: string;
  Error_Material = 'El campo es requerido.'
  Error_Categoria = 'El campo es requerido.'
  Error_SubCategoria = 'El campo es requerido.'
  //Autocompletado
  categorias: any[] = [];
  material: any[] = [];
  //Propiedades para el filtrado
  categoria: ddlCategorias[] | undefined;
  filtradocategoria: ddlCategorias[] = [];
  materiales: ddlMaterial[] = [];
  filtradomateriales: any[] = [];
  filteredSubcategorias: any[] = [];
  usuaModificacion?: string;
  submitted: boolean = false;
  subcategoriaDescripcion?: string;
  materialDescripcion?: string;
  cate_Descripcion: string;
  deta_codigo: number;

  constructor(
    private service: InsumoService,
    public cookieService: CookieService,
    private router: Router,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public globalMoneda: globalmonedaService
  ) {

    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/insumo/Insumos')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });

    this.formInsumo = this.fb.group({
      cate_Id: [null, Validators.required],
      cate_Descripcion: ['', Validators.required],
      suca_Id: [null],
      suca_Descripcion: ['', ],
      mate_Descripcion: ['', Validators.required],
      mate_Id: [null, Validators.required],
      insu_Descripcion: ['', Validators.required],
      insu_Observacion: [''],
      insu_UltimoPrecioUnitario: ['', Validators.required]
    });
  }
  onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar

    this.ngOnInit();
  }

  ngOnInit(): void { //Primera carga
    this.getInsumo(); //Listado de los insumos
    this.ListarCategoria(); //Listado de categoria
    this.ListarMateriales(); //Listado de Materiales
    //console.log(this.globalMoneda.getState(), 'this.globalMoneda.getState()');
    this.display = false;


    this.detalless = false;
    this.confirm = false;
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }

    if (!this.globalMoneda.getState()) {
      //console.log('hola');
      this.globalMoneda.setState()
    }

    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.editar() },
      { label: 'Detalle', icon: 'pi pi-eye', command: () => this.detalles() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.confirmarEliminar(this.selectedInsumo) }
    ];
  }
  //Funcion que carga los datos del insumo
  getInsumo() {
    this.isLoading = true;
    this.service.Listar().subscribe(
      (data: any) => {
        this.insumo = data;
        //console.log('Insumos listados:', this.insumo);
        this.isLoading = false;
      },

      error => {
        //console.log(error);
        this.isLoading = false;
      },
      () =>{
        this.isLoading = false;
      }
    );
  }

  cargarDatos() {
    this.isLoading = true; // Mostrar el spinner
    //console.log('Cargando datos...');
    this.service.Listar().subscribe(
      (data: any) => {
        this.insumo = data;
        //console.log('Insumos listados:', this.insumo);
        this.isLoading = false;
      },
      error => {
        //console.log(error);
        this.isLoading = false;
      }
    );
  }
  //Este es el evento que se utiliza para filtrar en la tabla
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }


  
//Autollenado para la categoria
ListarCategoria() {
  this.service.ListarCategoria().subscribe(
    (Categoria: ddlCategorias[]) => {
      if (Categoria && Array.isArray(Categoria)) {
        this.categoria = Categoria
          .sort((a, b) => a.cate_Descripcion.localeCompare(b.cate_Descripcion));
      } else {
        //console.error('La respuesta de listar categorías no es un array:', Categoria);
      }
    },
    error => {
      //console.log(error);
    }
  );
}

onSubCategoriaSelect(event: any) {
  const subcategoriaSeleccionada = event.value;
  //console.log('Subcategoría seleccionada:', subcategoriaSeleccionada);
  this.formInsumo.patchValue({
    suca_Descripcion: subcategoriaSeleccionada.suca_Descripcion, // Aquí usamos suca_Descripcion
    suca_Id: subcategoriaSeleccionada.value  // Aquí usamos el ID para guardar correctamente
  });
}

onCategoriaSelect(event: any) {
  const categoriaSeleccionado = event.value;
  //console.log('Selected category:', categoriaSeleccionado);

  // Patch both cate_Id and cate_Descripcion in the form
  this.formInsumo.patchValue({
    cate_Id: categoriaSeleccionado.cate_Id,  // Ensure cate_Id is updated
    cate_Descripcion: categoriaSeleccionado.cate_Descripcion
  });

  // Fetch subcategories based on the selected category ID
  this.filterSubcategorias({ query: '' });
}

filterCategoria(event: any) {
  const query = event.query.toLowerCase();
  this.filtradocategoria = this.categoria.filter(Categoria =>
    Categoria.cate_Descripcion.toLowerCase().includes(query)
  );
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
    this.formInsumo.controls['insu_Descripcion'].setValue(inputElement.value);
  }

handleInputObse(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    inputElement.value = texto.replace(/[^a-zñA-ZÑáéíóúüÁÉÍÓÚÜ\s\d]/g, '');
    this.formInsumo.controls['insu_Observacion'].setValue(inputElement.value);

  }

  handleInputMate(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    inputElement.value = texto.replace(/[^a-zñA-ZÑáéíóúüÁÉÍÓÚÜ\s\d]/g, '');
    this.formInsumo.controls['mate_Descripcion'].setValue(inputElement.value);

  }

  handleInputcate(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    inputElement.value = texto.replace(/[^a-zñA-ZÑáéíóúüÁÉÍÓÚÜ\s\d]/g, '');
    this.formInsumo.controls['cate_Descripcion'].setValue(inputElement.value);

  }

  handleInputsub(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    inputElement.value = texto.replace(/[^a-zñA-ZÑáéíóúüÁÉÍÓÚÜ\s\d]/g, '');
    this.formInsumo.controls['suca_Descripcion'].setValue(inputElement.value);
  }

///Fin del autollenado para la categoria
//autollenado de Materiales
ListarMateriales() {
  this.service.ListarMaterial().subscribe(
    (material: ddlMaterial[]) => {
      if (material && Array.isArray(material)) {
        this.material = material
          .sort((a, b) => a.mate_Descripcion.localeCompare(b.mate_Descripcion));
      } else {
        //console.error('La respuesta de listar materiales no es un array:', material);
      }
    },
    error => {
      //console.log(error);
    }
  );
}

//Funcion para seleccionar el material
onMaterialesSelect(event: any) {
  const materialSeleccionado = event.value;
  //console.log('Material seleccionado:', materialSeleccionado); // Asegúrate de que se imprime correctamente el objeto seleccionado

  if (materialSeleccionado) {
    this.formInsumo.patchValue({
      mate_Id: materialSeleccionado.mate_Id, // Asegúrate de que mate_Id esté presente
      mate_Descripcion: materialSeleccionado.mate_Descripcion
    });
  } else {
    //console.error('No se pudo seleccionar el material correctamente.');
  }
}

//Funcion que hace el filtrado de los materiales
filterMateriales(event: any) {
  const query = event.query.toLowerCase();
  this.filtradomateriales = this.material.filter(material =>
    material.mate_Descripcion.toLowerCase().includes(query)
  );
}

filterSubcategorias(event: any) {
  const query = event.query.toLowerCase();
  const selectedCategoryId = this.formInsumo.controls['cate_Id'].value;

  if (selectedCategoryId) {
    this.service.ListarSubcategoriasPorCategoria(selectedCategoryId).subscribe(
      (response: any) => {
        const data = response.data || response;
        if (Array.isArray(data)) {
          this.filteredSubcategorias = data
            .map((item: ddlSubcategoria) => ({ suca_Descripcion: item.suca_Descripcion, value: item.suca_Id }))  // Cambiado a suca_Descripcion
            .filter(subcategoria => subcategoria.suca_Descripcion.toLowerCase().includes(query));  // Cambiado a suca_Descripcion
          //console.log('Filtered Subcategorias:', this.filteredSubcategorias);
        } else {
          //console.error('La respuesta de ListarSubcategoriasPorCategoria no es un array:', data);
          this.filteredSubcategorias = [];
        }
      },
      error => {
        //console.error('Error al listar las subcategorías:', error);
        this.filteredSubcategorias = [];
      }
    );
  } else {
    this.filteredSubcategorias = [];
  }
}

    //funcion del boton de detalle
  detalles() {
    if (this.selectedInsumo?.insu_Id) {
      this.detalless = true;
      this.display = false;
      this.deta_codigo = this.selectedInsumo.codigo;
      this.service.Obtener(this.selectedInsumo.insu_Id).subscribe({
        next: (data: Fill) => {
          this.populateDetails(data);
        },
        error: (e) => {
          //console.error(e);
        }
      });
    }
  }
  //Funcion que trea los datos del insumo
  populateDetails(data: Fill) {
    this.confirmInsumoDialog = false;
    this.confirm = true;
    //console.log(data);
    this.insu_Id = data.insu_Id;
    this.suca_Id = data.suca_Id;
    this.insu_Descripcion = data.insu_Descripcion;
    this.insu_Observacion = data.insu_Observacion;
    this.mate_Id = data.mate_Id;
    this.insu_UltimoPrecioUnitario = data.insu_UltimoPrecioUnitario;
    this.usua_Creacion = data.usua_Creacion;
    this.insu_FechaCreacion = new Date(data.insu_FechaCreacion).toLocaleDateString();
    this.codigo = data.codigo;
    this.usua_Modificacion = data.usua_Modificacion || parseInt(this.cookieService.get('usua_Id')); // Asegúrate de que usua_Modificacion tenga un valor
    // Verificar si insu_FechaModificacion es válida antes de convertirla
    this.insu_FechaModificacion = data.insu_FechaModificacion
      ? new Date(data.insu_FechaModificacion).toLocaleDateString()
      : ''; // Valor predeterminado si la fecha no está disponible
    this.usuaCreacion = data.usuaCreacion;
    this.usuaModificacion = data.usuaModificacion;
    this.cate_Descripcion = data.cate_Descripcion;
    this.subcategoriaDescripcion = data.suca_Descripcion;
    this.materialDescripcion = data.mate_Descripcion;
  }

  Regresar() {
    this.detalless = false;
  }
  //Boton que abre el formulario de crear
  displayNuevo() {
    this.formInsumo.reset();
    this.modalTitle = 'Nuevo';
    this.modalButtonLabel = 'Guardar';
    this.confirmInsumoDialog = false;
    this.display = true;
    this.confirm = false;
    this.detalless = false;
    this.submitted = false;
  }

//Boton que esta en el guardar que identifica si va a insertar o a actualizar
guardar() {
  this.submitted = true;
  //console.log("Validación iniciada.");
  // Validación de la categoría seleccionada
  const categoriaSeleccionada = this.categoria?.find(cat => cat.cate_Descripcion === this.formInsumo.value.cate_Descripcion);
  if (categoriaSeleccionada) {
    this.formInsumo.get('cate_Descripcion')?.setErrors(null);
  } else if (!this.formInsumo.value.cate_Descripcion) {
    this.Error_Categoria = 'El campo es requerido.';
    this.formInsumo.get('cate_Descripcion')?.setErrors({ required: true });
  } else {
    this.Error_Categoria = 'Opción no encontrada.';
    this.formInsumo.get('cate_Descripcion')?.setErrors({ invalidOption: true });
  }
  // Validación de la subcategoría seleccionada
  const subcategoriaSeleccionada = this.filteredSubcategorias?.find(sub => sub.suca_Descripcion === this.formInsumo.value.suca_Descripcion);
  if (subcategoriaSeleccionada) {
    this.formInsumo.get('suca_Descripcion')?.setErrors(null);
  } else if (!this.formInsumo.value.suca_Descripcion) {
    this.Error_SubCategoria = 'El campo es requerido.';
    this.formInsumo.get('suca_Descripcion')?.setErrors({ required: true });
  } else {
    this.Error_SubCategoria = 'Opción no encontrada.';
    this.formInsumo.get('suca_Descripcion')?.setErrors({ invalidOption: true });
  }
  // Validación de material seleccionado
  const materialSeleccionado = this.material?.find(mat => mat.mate_Descripcion === this.formInsumo.value.mate_Descripcion);
  if (materialSeleccionado) {
    this.formInsumo.get('mate_Descripcion')?.setErrors(null);
  } else if (!this.formInsumo.value.mate_Descripcion) {
    this.Error_Material = 'El campo es requerido.';
    this.formInsumo.get('mate_Descripcion')?.setErrors({ required: true });
  } else {
    this.Error_Material = 'Opción no encontrada.';
    this.formInsumo.get('mate_Descripcion')?.setErrors({ invalidOption: true });
  }
  // Mostrar estado del formulario y errores de cada control
  //console.log("Estado del formulario:", this.formInsumo.valid);
  Object.keys(this.formInsumo.controls).forEach(key => {
    const controlErrors = this.formInsumo.get(key)?.errors;
    if (controlErrors) {
      //console.log(`Error en ${key}:`, controlErrors);
    }
  });

  // Si el formulario es inválido, marcamos los campos como tocados y no procedemos
  if (this.formInsumo.invalid) {
    this.formInsumo.markAllAsTouched();
    //console.log("Formulario con errores. No se procede al guardado.");
    return;
  }
  // Si el formulario es válido, revisamos el estado de confirmación
  if (this.confirm == false) {
    //console.log("Creando nuevo insumo...");
    this.NuevoInsumo();  // Llama al método para crear un nuevo insumo
  } else if (this.confirm == true) {
    //console.log("Mostrando diálogo de confirmación...");
    this.confirmInsumoDialog = true;  // Abre el diálogo de confirmación
  }
}

//El código maneja la inserción de un nuevo insumo en el sistema
NuevoInsumo() {
  const formvalue = this.formInsumo.value;

  // Encuentra el ID de la subcategoría seleccionada
  const idSuca = this.filteredSubcategorias.find(sub => sub.suca_Descripcion === formvalue.suca_Descripcion)?.value ?? 0;

  const modelo = {
    insu_Descripcion: formvalue.insu_Descripcion,
    suca_Id: idSuca,
    insu_UltimoPrecioUnitario: formvalue.insu_UltimoPrecioUnitario,
    insu_Observacion: formvalue.insu_Observacion,
    mate_Id: formvalue.mate_Id,
    usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
  };

  //console.log("Modelo a enviar:", modelo); // Log para ver el modelo antes de enviarlo
  this.service.Insertar(modelo).subscribe({
    next: () => {
      this.getInsumo();
      this.display = false;
      this.confirmInsumoDialog = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Insertado con Éxito.',
        styleClass: 'iziToast-custom',
      });
    },
    error: (e) => {
      this.handleError(e);
    }
  });
}

//Maneja los errores
handleError(e: any) {
  if (e.error && e.error.errors) {
    for (const field in e.error.errors) {
      if (e.error.errors.hasOwnProperty(field)) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error en el campo ${field}: ${e.error.errors[field]}`, styleClass: 'iziToast-custom', });
      }
    }
  } else {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error. Por favor, comuníquese con el administrador.', styleClass: 'iziToast-custom', });
  }
  //console.error(e);
}

  confirmarActualizar() {
    if (!this.selectedInsumo) {
      return;
    }
    const formvalue = this.formInsumo.value;
    // Verifica que las subcategorías y materiales estén correctamente filtrados
    //console.log("Descripción de subcategoría en el formulario:", formvalue.suca_Descripcion);
    //console.log("Subcategorías filtradas:", this.filteredSubcategorias);

    const idSuuca = this.filteredSubcategorias.find(sub => sub.suca_Descripcion === formvalue.suca_Descripcion)?.suca_Id ?? 0;
    const idSmate = this.filtradomateriales.find(mate => mate.mate_Descripcion === formvalue.mate_Descripcion)?.mate_Id ?? 0;

    // Verifica el valor obtenido para suca_Id y mate_Id
    //console.log('ID Suca:', idSuuca);
    //console.log('ID Material:', idSmate);

    // if (idSuuca === 0) {
    //   //console.error('No se pudo encontrar una subcategoría válida.');
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: 'Error',
    //     detail: 'Subcategoría no válida o no seleccionada.',
    //     styleClass: 'iziToast-custom',
    //   });
    //   return;
    // }

    // if (idSmate === 0) {
    //   //console.error('No se pudo encontrar un material válido.');
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: 'Error',
    //     detail: 'Material no válido o no seleccionado.',
    //     styleClass: 'iziToast-custom',
    //   });
    //   return;
    // }

    const modelo = {
      insu_Id: this.selectedInsumo.insu_Id,  // ID del insumo que se va a actualizar
      insu_Descripcion: formvalue.insu_Descripcion,
      suca_Id: formvalue.suca_Id,  // ID de la subcategoría obtenida
      insu_UltimoPrecioUnitario: formvalue.insu_UltimoPrecioUnitario,
      insu_Observacion: formvalue.insu_Observacion,
      mate_Id: formvalue.mate_Id,
      usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),  // ID del usuario que está modificando
    };

   // console.log("Modelo a enviar para actualización:", modelo); // Log para verificar el modelo antes de enviarlo

    this.service.Actualizar(modelo).subscribe({
      next: () => {
        this.getInsumo();  // Refresca la lista de insumos
        this.display = false;
        this.confirmInsumoDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Actualizado con Éxito.',
          styleClass: 'iziToast-custom',
        });
        this.confirm = false;
      },
      error: (e) => {
        this.handleError(e);  // Maneja errores
      }
    });
  }

  //Valida que solo se pueda ingresa texto sin numero
  validarTexto(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;
    const cursorPosition = inputElement.selectionStart;
    const key = event.key;
  
    // Solo permitir letras, ñ, Ñ, espacios, y teclas de control como Backspace, Tab, flechas
    if (!/^[a-zñA-ZÑ\s]+$/.test(key) && key !== 'Backspace' && key !== 'Tab' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
      event.preventDefault();
    }
  
    // Evitar espacios al principio o múltiples espacios seguidos
    if (key === ' ' && (texto.trim() === '' || cursorPosition === 0 || texto[cursorPosition - 1] === ' ')) {
      event.preventDefault();
    }
  }
  //Valida que no haya espacion vacio al inicio
  validarEspacios(event: KeyboardEvent) {
    const texto = (event.target as HTMLInputElement).value;
    const cursorPosition = (event.target as HTMLInputElement).selectionStart;
    const key = event.key;
    if (event.key === ' ' && (texto.trim() === '' || cursorPosition === 0)) {
        event.preventDefault();
    }

       // Evitar espacios al principio o múltiples espacios seguidos
       if (key === ' ' && (texto.trim() === '' || cursorPosition === 0 || texto[cursorPosition - 1] === ' ')) {
        event.preventDefault();
      }
  }
  //Te permite unicamente ingresar numero sin letras
  ValidarNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;
  
    // Solo permitir números, un solo punto decimal, y teclas de control como Backspace, Tab, flechas
    if (!/^\d+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== '.') {
      event.preventDefault();
    }
  
    // Evitar múltiples puntos decimales
    if (event.key === '.' && texto.includes('.')) {
      event.preventDefault();
    }
  
    // Evitar punto decimal como primer carácter
    if (event.key === '.' && texto === '') {
      event.preventDefault();
    }
  
    // Evitar espacios en blanco
    if (event.key === ' ' && (texto.trim() === '' || texto.trim().length === inputElement.selectionEnd)) {
      event.preventDefault();
    }
  }
  //Funcion para confirmar el boton de guardar
  async confirmarInsumo(){
    //console.log("Funcionaa??")

    await this.guardar();
}
  //Funcion que esta en el boton de eliminar
  confirmarEliminar(insumo: Insumo | null) {
    this.insu_Descripcion =  this.selectedInsumo.insu_Descripcion;
    if (insumo) {
      this.selectedInsumo = insumo;
      this.confirmacionVisible = true;
      this.confirmationService.confirm({
        message: '¿Está seguro de que deseas eliminar este insumo?',
        accept: () => {
          this.eliminar();
        }
      });
    } else {
      //console.error('No se seleccionó ningún insumo para eliminar.');
    }
  }

  
  //Funcion que maneja la funcion de editar
  eliminar() {
    // Inicializa variables para el mensaje del servicio
    let severity = 'error';
    let summary = 'Error';

    // Verifica si hay un insumo seleccionado
    if (this.selectedInsumo) {
      const idInsumo = this.selectedInsumo.insu_Id;

      try {
        this.service.Eliminar(idInsumo).subscribe({
          next: (respuesta: Respuesta) => {
            let detail = respuesta.data.messageStatus;
            if (respuesta.code == 200) {
              // Si la eliminación fue exitosa o hay una advertencia
              severity = respuesta.data.codeStatus > 0 ? 'success' : 'warn';
              summary = respuesta.data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
            } else if (respuesta.code == 500) {
              // Si hubo un error interno
              severity = 'error';
              summary = 'Error Interno';
            }

            this.messageService.add({
              severity,
              summary,
              detail,
              life: 3000,
              styleClass: 'iziToast-custom',
            });

            // Reinicia el componente
            this.getInsumo(); // Asumimos que esta función recarga la lista de insumos
            this.confirmacionVisible = false;
          },
          error: (e) => {
            //console.error(e);
            this.messageService.add({
              severity: 'error',
              summary: 'Error Externo',
              detail: 'Comunicarse con un administrador',
              life: 3000,
              styleClass: 'iziToast-custom',
            });
          }
        });

        // Refresca la lista de insumos
        this.getInsumo();
        this.confirmacionVisible = false;
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error Externo',
          detail: error.message || 'Error inesperado',
          life: 3000,
          styleClass: 'iziToast-custom',
        });
      }
    }
  }

  //Funcion para cancelar
  cancelarEliminar() {
    this.confirmacionVisible = false;
  }
  //Funcion que selecciona un insumo
  onRowSelect(insumo: Insumo) {
    this.selectedInsumo = insumo;
  }
  editar() {
    if (this.selectedInsumo) {
      this.modalTitle = 'Editar';
      this.modalButtonLabel = 'Actualizar';
      this.display = true;
      this.detalless = false;
      this.confirm = true;
      this.ListarCategoria();
      this.ListarMateriales();

      // Asegurarse de que los valores del insumo estén correctamente cargados en el formulario
      this.formInsumo.patchValue({
        cate_Id: this.selectedInsumo.cate_Id,
        cate_Descripcion: this.selectedInsumo.cate_Descripcion,
        suca_Id: this.selectedInsumo.suca_Id,
        suca_Descripcion: this.selectedInsumo.suca_Descripcion, // Aquí cargas el valor de la subcategoría
        mate_Id: this.selectedInsumo.mate_Id,
        mate_Descripcion: this.selectedInsumo.mate_Descripcion,
        insu_Descripcion: this.selectedInsumo.insu_Descripcion,
        insu_Observacion: this.selectedInsumo.insu_Observacion,
        insu_UltimoPrecioUnitario: this.selectedInsumo.insu_UltimoPrecioUnitario,
      });

      // Si la subcategoría está seleccionada, entonces llama a la función para obtener las subcategorías de esa categoría
      if (this.selectedInsumo.cate_Id) {
        this.ListarSubcategoriasPorCategoria(this.selectedInsumo.cate_Id);
      }
    }
  }

  ListarSubcategoriasPorCategoria(categoriaId: number) {
    this.service.ListarSubcategoriasPorCategoria(categoriaId).subscribe(
      (response: any) => {
        const data = response.data || response;
        if (Array.isArray(data)) {
          this.filteredSubcategorias = data.map((item: ddlSubcategoria) => ({
            suca_Descripcion: item.suca_Descripcion,
            suca_Id: item.suca_Id
          }));

          //console.log("Subcategorías cargadas:", this.filteredSubcategorias);

          // Si ya existe una subcategoría seleccionada, parchearla en el formulario
          const selectedSubcategoria = this.filteredSubcategorias.find(sub => sub.suca_Id === this.selectedInsumo?.suca_Id);
          if (selectedSubcategoria) {
            this.formInsumo.patchValue({
              suca_Descripcion: selectedSubcategoria.suca_Descripcion,
              suca_Id: selectedSubcategoria.suca_Id
            });
          }
        } else {
          //console.error('La respuesta de ListarSubcategoriasPorCategoria no es un array:', data);
        }
      },
      error => {
        //console.error('Error al listar subcategorías:', error);
      }
    );
  }
}