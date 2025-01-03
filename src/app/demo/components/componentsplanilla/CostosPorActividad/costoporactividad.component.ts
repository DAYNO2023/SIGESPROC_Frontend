import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { CostoActividad } from 'src/app/demo/models/modelsplanilla/costopoactividadviewmodel';
import { costoActivadService } from 'src/app/demo/services/servicesplanilla/costoporactividad.service';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';

/**
 * CostoporactividadComponent gestiona la logica y vista relacionada con los costos por actividad
 * Permite realizar operaciones CRUD sobre los costos por actividad
 */
@Component({
  selector: 'app-costoporactividad',
  templateUrl: './costoporactividad.component.html',
  styleUrls: ['./costoporactividad.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class CostoporactividadComponent implements OnInit {

  // Listas de datos para mostrar en la vista
  CostosPorActividad: any[] = [];
  unidadm: any[] = [];
  items: MenuItem[] = [];
  actividades: any[] = [];
  filtradoActividades: any[] = [];
  filtradoUM: any[] = [];

    // Variables de estado para controlar la vista
  Index: boolean = true;
  Create: boolean = false;
  Detail: boolean = false;
  Delete: boolean = false;
  form: FormGroup;// Formulario  para crear o editar un costo por actividad
  submitted: boolean = false; // Indica si el formulario ha sido enviado
  identity: string = "Crear"; // Identificador para distinguir entre crear y editar
  selectedCostoPorActividad: any; // Elemento seleccionado en la tabla
  id: number = 0; // Id del costo por actividad actual
  titulo: string = "Nuevo"; // Titulo del formulario (Nuevo o Editar)
  confirmEditDialog: boolean = false; // Controla la visualización del diálogo de confirmación de edicion
  isLoading: boolean = false; // Variable  control spinner

  // Mostrar en la vista de detalles
  Datos = [{}];
  detalle_copc_Id: string = "";
  detalle_copc_Observacion: string = "";
  detalle_acti_Id: string = "";
  detalle_copc_Valor: string = "";
  detalle_copc_EsPorcentaje: string = "";
  detalle_usuaCreacion: string = "";
  detalle_usuaModificacion: string = "";
  detalle_copc_FechaCreacion: string = "";
  detalle_copc_FechaModificacion: string = "";
  detalle_unme_Id: string = "";
  loading: boolean= true; // Variable para mostrar el spinner de carga
  usua_Id: number = 0;

  Error_Acti: string = "El campo es requerido."
  Error_Unme: string = "El campo es requerido."
  //   /**
  //  * Constructor para `CostoporactividadComponent`
  //  * @param service - Servicio para gestionar las operaciones de costos por actividad
  //  * @param messageService - Servicio para mostrar mensajes
  //  * @param confirmationService - Servicio para mostrar dialogos de confirmacion
  //  * @param router - Router para navegacion
  //  * @param fb - FormBuilder para crear formularios
  //  * @param globalmoneda
  //  */
  constructor(
    private service: costoActivadService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private fb: FormBuilder,
    public globalMoneda: globalmonedaService,
    public cookieService: CookieService,
  ) {
    this.form = this.fb.group({
      acti_Descripcion: ['', Validators.required],
      copc_Valor: ['', Validators.required],
      unme_Nombre: ['', Validators.required]
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects.includes('/sigesproc/planilla/costosporactividad')) {
          this.onRouteChange();  
        }
      });
  }

  // Método al cambiar de ruta
  onRouteChange() {
    this.Index = true;  // Mostrar la vista principal
    this.Create = false;  // Ocultar formularios
    this.Detail = false;  // Ocultar detalles
    this.form.reset();  // Reiniciar el formulario
  }

  ngOnInit(): void {
    const token = this.cookieService.get('Token');
    if (token == 'false') {
      this.router.navigate(['/auth/login']);
    }

    this.usua_Id = parseInt(this.cookieService.get('usua_Id'));

    this.Listado();
    this.ListadoUM();
    this.ListadoActividades();

    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.EditarCostoPorActividad() },
      { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleCostoPorActividad() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.EliminarCostoPorActividad() }
    ];

    if (!this.globalMoneda.getState()) {
      this.globalMoneda.setState();
    }
  }
   /**
   * Metodo que permite ingresar solo numeros en un campo de texto
   * @param event - Evento de teclado
   */
  // Numeros(event: KeyboardEvent) {
  //   const pattern = /[0-9\.]/;
  //   const inputChar = String.fromCharCode(event.charCode);

  //   if (!pattern.test(inputChar)) {
  //     event.preventDefault();
  //   } else {
  //     if (inputChar === '.' && (event.target as HTMLInputElement).value.includes('.')) {
  //       event.preventDefault();
  //     }
  //   }
  // }
  Numeros(event: KeyboardEvent) {
    const pattern = /[0-9\.]/;
    const inputChar = String.fromCharCode(event.charCode);// Aquí defines las letras que quieres aceptar

    // Construye un patrón que acepte números, puntos y las letras en 'letra'
    const combinedPattern = new RegExp(`[0-9\\}]`);

    if (!combinedPattern.test(inputChar)) {
      event.preventDefault();
    }
    else {
      if (inputChar === '.' && (event.target as HTMLInputElement).value.includes('.')) {
        event.preventDefault();
      }
    }
  }

 /**
   * Aplica un filtro global en la tabla
   */
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  /**
   * Selecciona un costo por actividad de la tabla
   * @param costoPorActividad - Elemento seleccionado
   */
  selectCostoPorActividad(costoPorActividad: any) {
    this.selectedCostoPorActividad = costoPorActividad;
  }
 /**
   * Lista las unidades de medida
   */
  ListadoUM() {
    this.service.ListarUM().subscribe(
      (data: any) => {
        this.unidadm = data.sort((a, b) => a.unme_Nombre.localeCompare(b.unme_Nombre));
      },
      error => {
        // console.log(error);
      }
    );
  }
 /**
   * Lista las actividades
   */
  ListadoActividades() {
    this.service.ListarActividad().subscribe(
      (data: any) => {
        this.actividades = data.sort((a, b) => a.acti_Descripcion.localeCompare(b.acti_Descripcion));
      },
      error => {
        // console.log(error);
      }
    );
  }
  /**
   * Lista los costos por actividad
   */
  async Listado() {
    this.loading = true;
    await this.service.Listar().then(
      (data: any) => {
        this.CostosPorActividad = data.map((costoActividad: any) => ({
          ...costoActividad,
          copc_FechaCreacion: new Date(costoActividad.copc_FechaCreacion).toLocaleDateString(),
          copc_FechaModificacion: new Date(costoActividad.copc_FechaModificacion).toLocaleDateString()
        }));
        this.isLoading = false;
      }
    ).catch(error => {
      // console.log(error);
    }).finally(() => {
      this.loading = false;
    });
  }


  /**
   * Recarga los datos de las listas de actividades
   */
  cargarDatos() {
    this.isLoading = true;
    this.ListadoUM();
    this.ListadoActividades();
    this.Listado();
  }
 /**
   * Vista para crear un nuevo rsgistro de costo por actividad
   */
  CrearCostoPorActividad() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.form.reset();
    this.submitted = false;
    this.identity = "crear";
    this.titulo = "Nuevo";
  }
 /**
   * Cerrar la vista actual y regresa al index
   */
  CerrarCostoPorActividad() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
  }

   /**
   * Vista para editar .
   */
   EditarCostoPorActividad() {

    const detalle = this.selectedCostoPorActividad;
    if (!detalle) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Seleccione un costo por actividad para editar', life: 3000 });
      return;
    }
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.identity = "editar";
    this.titulo = "Editar";


    // Obtener el símbolo de la moneda
    const simboloMoneda = this.globalMoneda.getState().mone_Abreviatura;

    // Asegúrate de que el valor incluya el símbolo de la moneda
    const valorConDecimales = parseFloat(detalle.copc_Valor).toFixed(2);

    // Asegúrate de que el valor incluya el símbolo de la moneda
    const valorConMoneda = `${simboloMoneda} ${valorConDecimales}`;
    let cti = this.actividades.find(act => act.acti_Id ===
      detalle.acti_Id)?.acti_Descripcion ?? "";
  let Unme = this.unidadm.find(unm => unm.unme_Id ===
    detalle.unme_Id)?.unme_Nombre ?? "";
    this.form.patchValue({
      acti_Descripcion: cti,
      copc_Valor: detalle.copc_Valor,  // Aquí añades el símbolo de la moneda
      unme_Nombre: Unme
    });
    this.id = detalle.copc_Id;
  }

 /**
   * Dialogo para confirmar la edicion.
   */
  abrirConfirmacionEdicion() {
    if (this.identity === "editar") {
      this.confirmEditDialog = true;
    } else {
      this.Guardar();
    }
  }
 /**
   * Confirma la edicion .
   */
  confirmarEdicion() {
    this.confirmEditDialog = false;
    this.Guardar();
  }

    /**
   * Muestra los detalles del costo por actividad
   */
  DetalleCostoPorActividad() {
    if (!this.selectedCostoPorActividad) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Seleccione un costo por actividad para ver detalles', life: 3000 });
      return;
    }
    this.Index = false;
    this.Create = false;
    this.Detail = true;

    this.detalle_copc_Id = this.selectedCostoPorActividad.codigo;
    this.detalle_acti_Id = this.selectedCostoPorActividad.actividad;
    this.detalle_copc_Valor = this.selectedCostoPorActividad.copc_Valor;
    this.detalle_unme_Id = this.selectedCostoPorActividad.unidadDeMedida;
    this.detalle_usuaCreacion = this.selectedCostoPorActividad.usuarioCreacion;
    this.detalle_copc_FechaCreacion = this.selectedCostoPorActividad.copc_FechaCreacion;

    if (this.selectedCostoPorActividad.usua_Modificacion != null) {
      this.detalle_usuaModificacion = this.selectedCostoPorActividad.usuarioModifica;
      this.detalle_copc_FechaModificacion = this.selectedCostoPorActividad.copc_FechaModificacion;
    } else {
      this.detalle_usuaModificacion = "";
      this.detalle_copc_FechaModificacion = "";
    }
  }

   /**
   *Vista para eliminar el costo por actividad
   */
  EliminarCostoPorActividad() {
    if (!this.selectedCostoPorActividad) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Seleccione un costo por actividad para eliminar', life: 3000 });
      return;
    }
    this.detalle_copc_Valor = this.selectedCostoPorActividad.copc_Valor;
    this.id = this.selectedCostoPorActividad.copc_Id;
    this.Delete = true;
  }
 /**
   * Confirma la eliminación
   */
  async confirmarEliminar() {
    this.Delete = false;

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
        life: 3000
      });

      this.ngOnInit();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error Externo',
        detail: error.message || error,
        life: 3000
      });
    }
  }
 /**
   * Guarda el costo por actividad ya sea creando uno nuevo o actualizando uno existente.
   */
  Guardar() {
    //Traer el id del rol y validar si existe.
  let idActi = this.actividades.find(act => act.acti_Descripcion ===
  this.form.value.acti_Descripcion)?.acti_Id ?? 0;
  let idUnme = this.unidadm.find(unm => unm.unme_Nombre ===
    this.form.value.unme_Nombre)?.unme_Id ?? 0;
  //Si es diferente a 0 le declaramos que no tendra ninguna validacion
  if (idActi !== 0) {
  this.form.get('acti_Descripcion')?.setErrors(null);
  //De lo contrario le decimos si esta vacio para ver decirle que el campo es
  } else if(this.form.value.acti_Descripcion == ""  ||
  this.form.value.acti_Descripcion == null){
  //Puede ser cualquier texto el invalidRoleId
  this.Error_Acti = "El campo es requerido."
  this.form.get('acti_Descripcion')?.setErrors({ 'invalidActiId': true });
  //Si no es ninguna de las dos es por que tiene texto, pero no existe la opcion
  }else {
  //Puede ser cualquier texto el invalidRoleId
  this.Error_Acti = "Opción no encontrada."
  this.form.get('acti_Descripcion')?.setErrors({ 'invalidActiId': true });
  }


    //Si es diferente a 0 le declaramos que no tendra ninguna validacion
    if (idUnme !== 0) {
    this.form.get('unme_Nombre')?.setErrors(null);
    //De lo contrario le decimos si esta vacio para ver decirle que el campo es
    } else if(this.form.value.acti_Descripcion == ""  ||
    this.form.value.acti_Descripcion == null){
    //Puede ser cualquier texto el invalidRoleId
    this.Error_Unme = "El campo es requerido."
    this.form.get('unme_Nombre')?.setErrors({ 'invalidUnmeId': true });
    //Si no es ninguna de las dos es por que tiene texto, pero no existe la opcion
    }else {
    //Puede ser cualquier texto el invalidRoleId
    this.Error_Unme = "Opción no encontrada."
    this.form.get('unme_Nombre')?.setErrors({ 'invalidUnmeId': true });
    }

    if (this.form.valid) {
      var actividad;

      if(this.identity !== "editar"){
        actividad = this.CostosPorActividad.find(cp => cp.acti_Id == idActi) ?? 0;
        // actividad = this.CostosPorActividad.filter(cp => {

        //   return cp.acti_Id == this.form.value.acti_Id.acti_Id || this.form.value.acti_Id;
        // }).slice(0, 1)

      }else{
        actividad = 0;
      }


      if(actividad == idActi && this.identity !== "editar" && actividad !== undefined){
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ya existe un costo por actividad con esa actividad.', life: 3000 });
      }

      else{
      const CostoPorActividad: any = {
        copc_Id: this.id,
        acti_Id: idActi,
        copc_Valor: this.form.value.copc_Valor,
        unme_Id: idUnme,
        usua_Creacion: this.usua_Id,
        usua_Modificacion: this.usua_Id
      };

      if (this.identity !== "editar") {
        this.service.Insertar(CostoPorActividad).subscribe(
          (respuesta: any) => {
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });
              this.Listado();
              this.CerrarCostoPorActividad();
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ha ocurrido un error.', life: 3000 });
            }
          }
        );
      } else {
        this.service.Actualizar(CostoPorActividad).subscribe(
          (respuesta: any) => {
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 });
              this.Listado();
              this.CerrarCostoPorActividad();
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Actualizado fallido', life: 3000 });
            }
          }
        );
      }
    }
    }

    else {
      this.submitted = true;
    }
  }

   /**
   * Filtra la lista de actividades
   * @param event - Evento que contiene la consulta para el filtro
   */
  filterActividades(event: any) {
    const query = event.query.toLowerCase();
    this.filtradoActividades = this.actividades.filter(actividad => actividad.acti_Descripcion.toLowerCase().includes(query));
  }

    /**
   * Filtra la lista de unidades de medida
   * @param event - Evento que contiene la consulta para el filtro
   */
  filterUM(event: any) {
    const query = event.query.toLowerCase();
    this.filtradoUM = this.unidadm.filter(unidad => unidad.unme_Nombre.toLowerCase().includes(query));
  }
 /**
   * Manejar la selección de una actividad r
   * @param event - Evento que contiene la actividad seleccionada
   */
  onActividadSelect(event: any) {
    this.form.patchValue({ acti_Descripcion: event.value.acti_Descripcion });
  }

    /**
   * Manejar la selección de una unidad de medida
   * @param event - Evento que contiene la unidad de medida seleccionada
   */
  onUMSelect(event: any) {
    this.form.patchValue({ unme_Nombre: event.value.unme_Nombre });
  }
  /**
   * Valida que el texto ingresado sea alfanumerico y no permita espacios al inicio
   * @param event - Evento de teclado
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
