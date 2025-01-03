import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { AgenteBienRaiz } from 'src/app/demo/models/modelsbienraiz/agentebienraizviewmodel';
import { agenteBienRaizService } from 'src/app/demo/services/servicesbienraiz/agenteBienRaiz.service';
import { EmpresaBienRaizService } from 'src/app/demo/services/servicesbienraiz/empresaBienRaiz.service';
import { DropDownEmpresas, EmpresaBienRaiz } from 'src/app/demo/models/modelsbienraiz/empresabienraizviewmodel';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs';
@Component({
  selector: 'app-agentebienraiz',
  templateUrl: './agentebienraiz.component.html',
  styleUrls: ['./agentebienraiz.component.scss'],
  providers: [MessageService]
})
export class AgenteBienRaizComponent implements OnInit {
  // Lista de agentes de bienes raíces
  AgenteBienesRaices: AgenteBienRaiz[] = [];
  
  // Lista de empresas para el dropdown
  empresas: { value: number, label: string }[] = [];
  
  // Elementos del menú para opciones de acciones
  items: MenuItem[] = [];
  
  // Listas para manejar las empresas en el dropdown y el filtro
  EmpresaBR: DropDownEmpresas[] = [];
  filteredEmpresaBR: DropDownEmpresas[] = [];
  
  // Estados de las vistas
  Index: boolean = true; // Vista de índice
  Create: boolean = false; // Vista de creación
  Detail: boolean = false; // Vista de detalles
  Delete: boolean = false; // Vista de eliminación
  
  // Formulario para creación/edición de agentes
  form: FormGroup;
  submitted: boolean = false; // Indica si el formulario ha sido enviado
  
  // Identificador para diferenciar entre creación y edición
  identity: string = "Crear";
  
  // Variables para manejar el agente seleccionado
  selectedAgenteBienRaiz: any;
  selectedProduct: any;
  
  // Variable para controlar la visibilidad del modal de edición
  modaleditar: boolean = false;
  
  // Estado de carga para mostrar spinners
  isLoading = false;

  // ID del agente seleccionado para edición o eliminación
  id: number = 0;
  
  // Título de la vista actual
  titulo: string = "Nuevo";

  Error_Empresa: string = "El campo es requerido."

  // Variables para los detalles del agente
  Datos = [{}];
  detalle_agen_Id: string = "";
  detalle_agen_DNI: string = "";
  detalle_agen_Nombre: string = "";
  detalle_agen_Apellido: string = "";
  detalle_agen_Telefono: string = "";
  detalle_agen_Correo: string = "";
  detalle_usuaCreacion: string = "";
  detalle_usuaModificacion: string = "";
  detalle_embr_Nombre: string = "";
  detalle_usua_Creacion: string = "";
  detalle_agen_FechaCreacion: string = "";
  detalle_usua_Modificacion: string = "";
  detalle_agen_FechaModificacion: string = "";
  detalle_agen_Estado: string = "";
  detalle_embr_Id: string = "";

  /**
   * Constructor para `AgenteBienRaizComponent`.
   * @param messageService - Servicio para mostrar mensajes en la interfaz.
   * @param service - Servicio para manejar la lógica de negocio de agentes de bienes raíces.
   * @param serviceEmpresa - Servicio para manejar la lógica de negocio de empresas de bienes raíces.
   * @param router - Router para la navegación entre componentes.
   * @param fb - FormBuilder para crear el formulario reactivo.
   */
  constructor(
    private messageService: MessageService,
    private service: agenteBienRaizService,
    private serviceEmpresa: EmpresaBienRaizService,
    public cookieService: CookieService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/bienraiz/agentesdebienesraices')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
    // Inicializa el formulario con validaciones
    this.form = this.fb.group({
      agen_DNI: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
      agen_Nombre: ['', Validators.required],
      agen_Apellido: ['', Validators.required],
      agen_Telefono: ['', Validators.required],
      agen_Correo: ['', Validators.required],
      empresa: ['']
    });
  }
  onRouteChange(): void {
    this.ngOnInit();
  }
  /**
   * Método de inicialización del componente.
   * Carga el listado de agentes y empresas, y configura los elementos del menú.
   */
  ngOnInit(): void {
  
  
  // Estados de las vistas
  this.Index= true; // Vista de índice
  this.Create = false; // Vista de creación
  this.Detail = false; // Vista de detalles
  this.Delete = false; // Vista de eliminación
  this.modaleditar= false;
  this.id = 0;

    // Carga la lista de agentes y empresas en la inicialización
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
    this.Listado();
    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarAgenteBienRaiz() },
      { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleAgenteBienRaiz() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.EliminarAgenteBienRaiz() },
    ];
  }

  /**
   * Cargar el listado de agentes y empresas.
   * Muestra un spinner durante la carga.
   */
  Listado() {
    // Obtiene la lista de agentes desde el servicio
    this.isLoading = true; // Mostrar el spinner
    this.service.Listar().subscribe(
      (data: any) => {
        // Formatear las fechas de creación y modificación para su visualización
        this.AgenteBienesRaices = data.map((AgenteBienesRaices: any) => ({
          ...AgenteBienesRaices,
          agen_FechaCreacion: new Date(AgenteBienesRaices.agen_FechaCreacion).toLocaleDateString(),
          agen_FechaModificacion: new Date(AgenteBienesRaices.agen_FechaModificacion).toLocaleDateString()
        }));
        this.isLoading = false;
      }
    );

    // Obtiene la lista de empresas desde el servicio
    this.serviceEmpresa.DropDown().subscribe(
      (data: DropDownEmpresas[]) => {
        if (data && Array.isArray(data)) {
          this.EmpresaBR = data
            .sort((a, b) => a.embr_Nombre.localeCompare(b.embr_Nombre));
        } else {
          
        }
      }
    );
    
  }

  /**
   * Cierra la vista de creación/edición o detalles y regresa a la vista de índice.
   */
  cerrarAgente(){
    this.Index = true;
    this.Create = false;
    this.modaleditar = false;
    this.Detail = false;
    this.Delete = false;
  }

  /**
   * Filtrar empresas en el dropdown basadas en la búsqueda del usuario.
   * @param event - Evento que contiene la consulta de búsqueda.
   */
  searchEmpresa(event: any) {
    let query = event.query;
    // Filtra las empresas basadas en la búsqueda del usuario
    this.filteredEmpresaBR = this.EmpresaBR.filter(cate => cate.embr_Nombre.toLowerCase().includes(query.toLowerCase()));
  }

  /**
   * Edita un agente de bien raíz.
   * Configura el formulario para la edición y carga los datos seleccionados.
   */
  EditarAgenteBienRaiz() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.identity = "editar";
    this.titulo = "Editar";
    this.detalle_agen_Nombre = this.selectedAgenteBienRaiz.agen_Nombre;
    this.detalle_agen_Apellido = this.selectedAgenteBienRaiz.agen_Apellido;

    this.form.patchValue({
      agen_DNI: this.selectedAgenteBienRaiz.agen_DNI,
      agen_Nombre: this.selectedAgenteBienRaiz.agen_Nombre,
      agen_Apellido: this.selectedAgenteBienRaiz.agen_Apellido,
      agen_Telefono: this.selectedAgenteBienRaiz.agen_Telefono,
      agen_Correo: this.selectedAgenteBienRaiz.agen_Correo,
      empresa: this.selectedAgenteBienRaiz.embr_Nombre
    });
    this.id = this.selectedAgenteBienRaiz.agen_Id;
  }

  /**
   * Aplica un filtro global a la tabla.
   * @param table - Referencia a la tabla que se va a filtrar.
   * @param event - Evento que contiene el valor a filtrar.
   */
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  /**
   * Selecciona un agente de bien raíz para editar o ver detalles.
   * @param agenteBienRaiz - El agente seleccionado.
   */
  selectAgenteBienRaiz(agenteBienRaiz: any) {
    this.selectedAgenteBienRaiz = agenteBienRaiz;
  }
  async onEmpresa(event){
    this.form.patchValue({ empresa:event.value.embr_Nombre});
  }
  /**
   * Configura el formulario para crear un nuevo agente de bien raíz.
   */
  validarCorreo() {
    const regex = /^[a-zA-Z0-9](?!.*\.\.)[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const email = this.form.value.agen_Correo.trim(); // Elimina espacios en blanco al inicio y al final
  
    // Verifica si el correo está vacío o es null
    if (!email) {
      return false;
    }
  
    // Verifica si el correo termina en .com
    if (!email.endsWith('.com')) {

      return false;
    }
  
    // Verifica que no haya un punto justo antes del símbolo @
    const atIndex = email.indexOf('@');
    if (email[atIndex - 1] === '.') {

      return false;
    }

    if (email[atIndex + 1] === '.') {
  
      return false;
    }
  
    // Verifica si el correo cumple con la expresión regular
    const valid = regex.test(email);

    return valid;
  }
   
  CrearAgenteBienRaiz() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.form.reset();
    this.submitted = false;
    this.identity = "crear";
    this.titulo = "Nuevo";
  }
  allowObservacion(event: any) {
    event.target.value = event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');
  }
  ValidarNumeros(event: any) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
  }
  /**
   * Determina si se debe guardar un nuevo agente o mostrar un modal de confirmación para editar.
   */
  saberCrearEditar(){
    if(this.titulo != "Nuevo" )
    {
      if (this.validarCorreo() == true &&  this.form.valid == true) {
        this.modaleditar =  true;
      }else{
        this.submitted = true
      }
     
    }
    else
    {
      this.Guardar();
    }
  }

  /**
   * Muestra los detalles del agente de bien raíz seleccionado.
   */
  DetalleAgenteBienRaiz() {
    this.Index = false;
    this.Create = false;
    this.Detail = true;

    this.detalle_agen_Id = this.selectedAgenteBienRaiz.codigo;
    this.detalle_agen_DNI = this.selectedAgenteBienRaiz.agen_DNI;
    this.detalle_agen_Nombre = this.selectedAgenteBienRaiz.agen_Nombre;
    this.detalle_agen_Apellido = this.selectedAgenteBienRaiz.agen_Apellido;
    this.detalle_agen_Telefono = this.selectedAgenteBienRaiz.agen_Telefono;
    this.detalle_agen_Correo = this.selectedAgenteBienRaiz.agen_Correo;
    this.detalle_embr_Nombre = this.selectedAgenteBienRaiz.embr_Nombre;
    this.detalle_usuaCreacion = this.selectedAgenteBienRaiz.usuaCreacion;
    this.detalle_agen_FechaCreacion = this.selectedAgenteBienRaiz.agen_FechaCreacion;

    if (this.selectedAgenteBienRaiz.usuaModificacion != null) {
      this.detalle_usuaModificacion = this.selectedAgenteBienRaiz.usuaModificacion;
      this.detalle_agen_FechaModificacion = this.selectedAgenteBienRaiz.agen_FechaModificacion;
    } else {
      this.detalle_usuaModificacion = "";
      this.detalle_agen_FechaModificacion = "";
    }
  }

  /**
   * Configura el estado para eliminar un agente de bien raíz.
   * Muestra el nombre y apellido del agente en el cuadro de diálogo de confirmación.
   */
  EliminarAgenteBienRaiz() {
    this.detalle_agen_Nombre = this.selectedAgenteBienRaiz.agen_Nombre;
    this.detalle_agen_Apellido = this.selectedAgenteBienRaiz.agen_Apellido;
    this.id = this.selectedAgenteBienRaiz.agen_Id;
    this.Delete = true;
  }

  /**
   * Guarda o actualiza un agente de bien raíz según el modo (crear o editar).
   * Realiza validaciones antes de enviar los datos al servidor.
   */
  Guardar() {

const IDempresa = this.EmpresaBR.find(rol => rol.embr_Nombre ===
this.form.value.empresa)?.embr_Id ?? 0;

 if (IDempresa !== 0) {
 this.form.get('empresa')?.setErrors(null);
 //De lo contrario le decimos si esta vacio para ver decirle que el campo es

 } else if(this.form.value.empresa == "" ||
this.form.value.empresa == null){
 //Puede ser cualquier texto el invalidRoleId
 this.Error_Empresa = "El campo es requerido."
 this.form.get('empresa')?.setErrors({ 'invalidempresaId': true });
 //Si no es ninguna de las dos es por que tiene texto, pero no existe la opcion
 }else {
 //Puede ser cualquier texto el invalidRoleId
 this.Error_Empresa = "Opción no encontrada."
 this.form.get('empresa')?.setErrors({ 'invalidempresaId': true });
 }
 
    if (this.form.valid && this.validarCorreo() == true) {
      const agenteBienRaiz: AgenteBienRaiz = {
        agen_Id: this.id,
        agen_DNI: this.form.value.agen_DNI,
        agen_Nombre: this.form.value.agen_Nombre,
        agen_Apellido: this.form.value.agen_Apellido,
        agen_Telefono: this.form.value.agen_Telefono,
        agen_Correo: this.form.value.agen_Correo,
        embr_Id: IDempresa,
        usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
      };


      if (this.identity !== "editar") {
        // Inserta un nuevo agente
        this.service.Insertar(agenteBienRaiz).subscribe(
          (respuesta: Respuesta) => {
        
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000, styleClass: 'iziToast-custom', });
              this.Listado();
              this.CerrarAgenteBienRaiz();
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El DNI o Correo ya existe.', life: 3000, styleClass: 'iziToast-custom', });

            }
          }
        );
      } else {
        // Actualiza un agente existente
        this.service.Actualizar(agenteBienRaiz).subscribe(
          (respuesta: Respuesta) => {

            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000, styleClass: 'iziToast-custom', });
              this.Listado();
              this.CerrarAgenteBienRaiz();
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El DNI o Correo ya existe.', life: 3000, styleClass: 'iziToast-custom', });
         
            }
          }
        );
      }
    } else {
      this.submitted = true;
    }
  }

  /**
   * Restaura el estado del componente al estado inicial.
   * Cierra las vistas de creación, edición o detalles.
   */
  CerrarAgenteBienRaiz() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.modaleditar = false;
  }

  /**
   * Elimina un agente de bien raíz.
   * Muestra un cuadro de diálogo de confirmación antes de eliminar.
   */
  async Eliminar() {
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
        life: 3000,
        styleClass: 'iziToast-custom',
      });

      this.ngOnInit();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error Externo',
        detail: error.message || error,
        life: 3000,
        styleClass: 'iziToast-custom',
      });
    }
  }

  // Validaciones para los campos de entrada

  /**
   * Validar que el campo solo acepte números.
   * @param event - Evento de teclado.
   */


  /**
   * Validar que el campo de DNI solo acepte números y tenga un máximo de 13 caracteres.
   * @param event - Evento de teclado.
   */
  ValidarDNI(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
      event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
    if (inputElement.value.length >= 13 && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }
  }

  /**
   * Validar que el campo solo acepte texto.
   * @param event - Evento de teclado.
   */
  ValidarTexto(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zñA-ZÑ\sáéíóúÁÉÍÓÚñ ]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  /**
   * Validar que el campo acepte texto y números.
   * @param event - Evento de teclado.
   */
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

  /**
   * Validar que el campo acepte texto, números y caracteres especiales.
   * @param event - Evento de teclado.
   */
  ValidarEspacio(event: any) {
    event.target.value = event.target.value
      .replace(/[^a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~@.]/g, '') // Allow valid characters including dot
      .replace(/\.{2,}/g, '.')                            // Replace consecutive dots with a single dot
      .replace(/@{2,}/g, '@')                             // Replace consecutive @ symbols with a single @
      .replace(/(@.*@)/g, '@');                           // Allow only one @ symbol
  }
  
  
}
