import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { tr } from 'date-fns/locale';
import { CookieService } from 'ngx-cookie-service';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { filter } from 'rxjs';
import { Gravedades } from 'src/app/demo/models/GravedadIzitoastEnum';
import { ciudad } from 'src/app/demo/models/modelsgeneral/ciudadviewmodel';
import { Estado } from 'src/app/demo/models/modelsgeneral/estadoviewmodel ';
import { Pais } from 'src/app/demo/models/modelsgeneral/paisviewmodel';
import { Proveedor } from 'src/app/demo/models/modelsinsumo/proveedorviewmodel';
import { ciudadService } from 'src/app/demo/services/servicesgeneral/ciudad.service';
import { EstadoService } from 'src/app/demo/services/servicesgeneral/estado.service';
import { PaisService } from 'src/app/demo/services/servicesgeneral/pais.service';
import { ProveedorService } from 'src/app/demo/services/servicesinsumo/proveedor.service';
import { ToastService } from 'src/app/demo/services/toast.service';

@Component({
  templateUrl: './proveedor.component.html',
  styleUrl: './proveedor.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class ProveedorComponent {
 // Propiedades
  proveedorFormulario: boolean = false;

  indexProveedor: boolean = true;
  confirm: boolean = false;

  detalleProveedor: boolean = false;

  deleteProveedorDialog: boolean = false;

  confirmProveedorDialog: boolean = false;

  proveedores: Proveedor[] = [];

  selectedProveedor: Proveedor[] = [];

  proveedor: Proveedor = {usua_Creacion: parseInt(this.cookieService.get('usua_Id'))};

  submitted: boolean = false;

  loading: boolean = true;

  cols: any[] = [];

  title: string = "";

  acciones: MenuItem[] = [];

  ciudades: ciudad[] = [];

  estados: Estado[] = [];

  paises: Pais[] = [];

  Descripcion: string = ""
  //Detalle
  detalle_Codigo:number

  detalle_Descripcion: string = ""

  detalle_Correo: string = ""

  detalle_Telefono: string = ""

  detalle_Telefono2: string = ""

  detalle_Ciudad: string = ""

  detalle_Estado: string = ""

  detalle_Pais: string = ""

  detalle_Venta: string = ""

  ventas = [
    { label: 'Maquinaria', value: 0 },
    { label: 'Insumo', value: 1 },
    { label: 'Ambas', value: 2 }
  ];

  filteredVentas: any[];

  filteredCiudades: any[];

  filteredEstados: any[];

  filteredPaises: any[];

  isTableLoading: boolean = false;

  loadedTableMessage: string = "";

  isLoading = false; 
  isOptionPaisNotFound: boolean;
  isOptionEstadoNotFound: boolean;
  isOptionCiudadNotFound: boolean;
//  Constructor

  constructor(
    private proveedorService: ProveedorService,
    private ciudadService: ciudadService,
    private estadoService: EstadoService,
    private paisService: PaisService,
    private messageService: MessageService,
    private toastService: ToastService,
    public cookieService: CookieService,
    private router: Router,
  )
    {
      this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (event.urlAfterRedirects.includes('/sigesproc/insumo/proveedor')
                ) {
                    this.ngOnInit();
                    this.cerrarFormulario();
                    this.cerrarDetalle();
                }
            });
    }

    // Primera carga
  async ngOnInit() {
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
      //El titulo cambiara dependiendo la accion a realizar
      this.title = "";

      //Inicializa el autocomplete de ciudades en null
      this.ciudades = [];

      //Inicializa el autocomplete de estados en null
      this.estados = [];


      //Seteamos en la tabla el listado de proveedores
      this.ListarProveedores()
       
        
      //Seteamos en el autocomplete el listado de paises
      this.paisService.Listar()
          .subscribe((data: any) => { this.paises = data.data.sort((a, b) => a.pais_Nombre.localeCompare(b.pais_Nombre)) })



      //Las acciones que tiene acceso el usuario
      this.acciones = [
          { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.editarProveedor() },
          { label: 'Detalle', icon: 'pi pi-eye',command: (event) => this.abrirDetalle() },
          { label: 'Eliminar', icon: 'pi pi-trash',command: (event) => this.eliminarProveedor() },
        ];

    
  }
  async ListarProveedores() {
    //Mostramos el index
    this.indexProveedor = true;
    

    //Mostramos el cargando mientras obtenemos el listado
    this.loading = true
    try {
      //Seteeamos de un endpoint el listado 
      this.proveedores = await this.proveedorService.Listar();
 
  

      //Quitamos el cargando
      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.loadedTableMessage ="No existen proveedores existentes aún.";
    } 
  }

  //Seleccionar registro para usar en el editado
  selectProveedor(proveedor: Proveedor) {
      this.proveedor = { ...proveedor, usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))};
  }
  //Filtro del autocompleatdo para ciudades
  searchCiudades(event) {
    this.filteredCiudades = this.ciudades.filter(ciudad => 
      ciudad.ciud_Descripcion.toLowerCase().includes(event.query.toLowerCase())
    );

    const foundciudad = this.ciudades.some(x => x.ciud_Descripcion === this.proveedor.ciud_Descripcion);
    this.isOptionCiudadNotFound = !foundciudad;
  }
    //Filtro del autocompleatdo para estados
  searchEstados(event) {
    this.filteredEstados = this.estados.filter(estado => 
      estado.esta_Nombre.toLowerCase().includes(event.query.toLowerCase())
    );

    const foundestado = this.estados.some(x => x.esta_Nombre === this.proveedor.esta_Nombre);
    this.isOptionEstadoNotFound = !foundestado;
  }
  //Filtro del autocompleatdo para  paises
  searchPaises(event) {
    this.filteredPaises = this.paises.filter(pais => 
      pais.pais_Nombre.toLowerCase().includes(event.query.toLowerCase())
    );

    const foundpais = this.paises.some(pais => pais.pais_Nombre === this.proveedor.pais_Nombre);
    this.isOptionPaisNotFound = !foundpais;
  }
  //Filtro del autocompleatdo para ventas
  searchVentas(event) {
    this.filteredVentas = this.ventas.filter(venta => 
      venta.label.toLowerCase().includes(event.query.toLowerCase())
    );
  }
//   Boton nuevo
  abrirNuevo() {
      //Inicializamos el formulario en null
      this.proveedor = {usua_Creacion: parseInt(this.cookieService.get('usua_Id'))};
      this.submitted = false;

      //Mostramos el titulo de la accion
      this.title = "Nuevo"

      //Ocultamos las otras partes de la pantalla
      this.indexProveedor = false;
      this.confirm = false;
      this.proveedorFormulario = true;
  }

//   Accion Editar
  async editarProveedor() {
      //Mostramos el titulo de la accion
      this.title = "Editar";
      this.indexProveedor = false;
      this.proveedorFormulario = true;
      this.confirm = true;   
  }

 
//   Accion Detalle
  async abrirDetalle(){

    //En un endpoint enviamos el id del proveedor para obtener los datos de ese proveedor
      await this.proveedorService.Buscar(this.proveedor.prov_Id)
          .then((data) => this.selectedProveedor.push(data));


      //Seteamos la informacion en detalles para mostrarlos en el html
      this.detalle_Codigo = this.proveedor.codigo
      this.detalle_Descripcion= this.proveedor.prov_Descripcion
      this.detalle_Correo= this.proveedor.prov_Correo
      this.detalle_Telefono= this.proveedor.prov_Telefono
      this.detalle_Telefono2= this.proveedor.prov_SegundoTelefono
      this.detalle_Ciudad= this.proveedor.ciud_Descripcion
      this.detalle_Estado= this.proveedor.esta_Nombre
      this.detalle_Pais= this.proveedor.pais_Nombre
      this.title = "";
      this.detalle_Venta = this.proveedor.venta
      this.indexProveedor = false;
      this.detalleProveedor = true;
  }

//   Accion Eliminar
 eliminarProveedor() {
    //Abrimos el modal de confirmacion
    this.Descripcion = this.proveedor.prov_Descripcion  
    this.deleteProveedorDialog = true;
      
  }

  // Confirmar Eliminar
  async confirmarEliminar() {
    // Cierra el cuadro de diálogo de confirmación de eliminación
    this.deleteProveedorDialog = false;

    try {
        // Llama al servicio para eliminar el proveedor y espera la respuesta
        const response = await this.proveedorService.Eliminar(this.proveedor.prov_Id);
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
        if (severity != 'success') {
          this.messageService.add({
            severity,
            summary,
            detail,
            life: 3000,styleClass:'iziToast-custom'
          });
        }else{
          this.toastService.toast(
            Gravedades.success,
            detail
          )
        }

        // Reinicia el componente
        this.ngOnInit();
    } catch (error) {
        // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
        this.toastService.toast(
          Gravedades.error,
          'Comunicarse con el administrador.'
        )
    }
  }

//   Regresar Detalle
  cerrarDetalle(){
      this.title = "";
      this.detalleProveedor = false;
      this.indexProveedor = true;
      this.selectedProveedor = [];
  }

//   Cerrar Form
  cerrarFormulario() {
      this.title = "";
      this.proveedorFormulario = false;
      this.indexProveedor = true;
      this.submitted = false;
  }

//   Confirmar Editar Form
async confirmarProveedor(){
    await this.guardarProveedor();
}
//   Guardar Form
  async guardarProveedor() {
    if (this.confirm == false) {
      this.submitted = true;
      //Si el submited es true y lo demas existe texto entrara al metodo, de lo contrario  mostrara en rojo lo que falta
    this.proveedor.prov_Descripcion = this.proveedor.prov_Descripcion.trim();
    this.proveedor.prov_Correo = this.proveedor.prov_Correo.trim();

      if (this.submitted && this.proveedor.prov_Descripcion?.trim() && this.proveedor.ciud_Descripcion?.trim() && this.proveedor.prov_InsumoOMaquinariaOEquipoSeguridad != null && this.validarCorreo()) {
          try {
              let response;
              //Dependiendo si el proveedor existe, creara o actualiza el proveedor
              if (this.proveedor.prov_Id) {
                  response = await this.proveedorService.Actualizar(this.proveedor);
              } else {
                  response = await this.proveedorService.Insertar(this.proveedor);
              }

              let severity = 'error';
              let summary = 'Error';
              let detail = response.data?.messageStatus;
              //Llamos un IziToast para mostrar si es exitoso o fallo
              severity = response.data.codeStatus > 0 ? 'success' : 'error';
              summary = response.data.codeStatus > 0 ? 'Éxito' : 'Error';
              this.messageService.add({
                severity,
                summary,
                detail,
                life: 3000,styleClass:'iziToast-custom'
              });


              //Si todo salio bien
              if (response.code == 200 && response.data.codeStatus > 0) {
                //Volvemos al listado principal
                  this.proveedorFormulario = false;
                 
                  this.proveedor = {usua_Creacion: parseInt(this.cookieService.get('usua_Id')), prov_InsumoOMaquinariaOEquipoSeguridad: null};
                  this.ngOnInit();
                  this.submitted = false;
              }
              this.confirmProveedorDialog = false;

          } catch (error) {
              this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: error.message || error,
                  life: 3000,styleClass:'iziToast-custom'
              });
          }
      }else {
        this.confirmProveedorDialog = false;
      }
    }else{
      this.confirm = false
      this.confirmProveedorDialog = true;
      
    }
  }
  // Onchange Paises y aqui agarramos el id de paises
  async onEstadoCargar(event){
    this.proveedor.pais_Nombre = event.value.pais_Nombre
    let id = this.paises.find(pais => pais.pais_Nombre === event.value.pais_Nombre).pais_Id;
    await this.estadoService.DropDownEstadosByCountry2(id)
        .then(data => this.estados = data.sort((a, b) => a.esta_Nombre.localeCompare(b.esta_Nombre)));
  }
  // Onchange Estados  y aqui agarramos el id de estados
  async filtrarCiudades(event){
    this.proveedor.esta_Nombre = event.value.esta_Nombre
    let id = this.estados.find(estado => estado.esta_Nombre === event.value.esta_Nombre).esta_Id;
    await this.ciudadService.DropDownByState2(event.value.esta_Id)
        .then(data => this.ciudades = data.sort((a, b) => a.ciud_Descripcion.localeCompare(b.ciud_Descripcion)));
  }

//   onchange Ciudades y aqui agarramos el id de ciudades
async ciudadOnchange(event){
    this.proveedor.ciud_Descripcion = event.value.ciud_Descripcion
    this.proveedor.ciud_Id = event.value.ciud_Id
  }
  //   onchange venta y aqui agarramos el id de venta
  VentaOnchange(event){
    this.proveedor.prov_InsumoOMaquinariaOEquipoSeguridad = event.value.value
  }

 
inputCorreo(event: any) {
  event.target.value = event.target.value.replace(/[^a-zA-Z0-9\s@.]|(?<=\s)[^a-zA-Z0-9\s@.]/g, '')
            .replace(/\s{2,}/g, ' ')
            .replace(/^\s/, '');
}

  // Regex para validar correo
validarCorreo() {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(this.proveedor.prov_Correo);
}
//   Buscar por id (no utilizado)
  findIndexById(id: number): number {
      let index = -1;
      for (let i = 0; i < this.proveedores.length; i++) {
          if (this.proveedores[i].prov_Id === id) {
              index = i;
              break;
          }
      }

      return index;
  }

//   Filtro Search Tabla
  onGlobalFilter(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }


   // Función para validar solo números
ValidarNumeros($event: KeyboardEvent | ClipboardEvent | InputEvent) {
  const inputElement = $event.target as HTMLInputElement;

  // Validación para eventos de teclado
  if ($event instanceof KeyboardEvent) {
    const key = $event.key;
    
    // Permite ciertas teclas sin restricción
    if (
      key === 'Backspace' ||  // Retroceso
      key === 'Delete' ||     // Suprimir
      key === 'ArrowLeft' ||  // Flecha izquierda
      key === 'ArrowRight' || // Flecha derecha
      key === 'Tab'           // Tabulación
    ) {
      return;
    }
    
    // Evita la entrada si no es un dígito numérico
    if (!/^\d$/.test(key)) {
      $event.preventDefault();
    }
  }
  
  // Validación para eventos de pegado desde el portapapeles
  if ($event instanceof ClipboardEvent) {
    const clipboardData = $event.clipboardData;
    const pastedData = clipboardData.getData('text');
    
    // Evita pegar si el contenido no son solo números o espacios
    if (!/^[0-9\s]*$/.test(pastedData)) {
      $event.preventDefault();
    }
  }
  
  // Validación para eventos de entrada
  if ($event instanceof InputEvent) {
    // Reemplaza cualquier carácter que no sea un número
    if (!/^[0-9]*$/.test(inputElement.value)) {
      inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
    }
  }
}
allowOnlyAlphanumeric(event: any) {
  event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  .replace(/\s{2,}/g, ' ')
  .replace(/^\s/, '');
}



// Función para validar solo texto
ValidarTexto($event: KeyboardEvent | ClipboardEvent | InputEvent) {
  const inputElement = $event.target as HTMLInputElement;
  
  // Validación para eventos de teclado
  if ($event instanceof KeyboardEvent) {
    const key = $event.key;
    
    // Permite ciertas teclas sin restricción
    if (
      key === 'Backspace' ||  // Retroceso
      key === 'Delete' ||     // Suprimir
      key === 'ArrowLeft' ||  // Flecha izquierda
      key === 'ArrowRight' || // Flecha derecha
      key === 'Tab'           // Tabulación
    ) {
      return;
    }
    
    // Evita que se ingrese un espacio como primer carácter
    if (inputElement.value.length === 0 && key === ' ') {
      $event.preventDefault();
      return;
    }
    
    // Evita la entrada si no es una letra o espacio
    if (!/^[a-zA-Z\s]$/.test(key)) {
      $event.preventDefault();
    }
  }
  
  // Validación para eventos de pegado desde el portapapeles
  if ($event instanceof ClipboardEvent) {
    const clipboardData = $event.clipboardData;
    const pastedData = clipboardData.getData('text');
    
    // Evita pegar si el contenido no son solo letras o espacios
    if (!/^[a-zA-Z\s]*$/.test(pastedData)) {
      $event.preventDefault();
    }
    
    // Evita que se pegue un espacio como primer carácter
    if (inputElement.value.length === 0 && pastedData.startsWith(' ')) {
      $event.preventDefault();
    }
  }
  
  // Validación para eventos de entrada
  if ($event instanceof InputEvent) {
    // Reemplaza cualquier carácter que no sea una letra o espacio
    inputElement.value = inputElement.value.replace(/[^a-zA-Z\s]/g, '');
    
    // Elimina los espacios al inicio del texto
    if (inputElement.value.startsWith(' ')) {
      inputElement.value = inputElement.value.trimStart();
    }
  }
}

// Función para validar texto y números
ValidarTextoNumeros(event: KeyboardEvent) {
  const inputElement = event.target as HTMLInputElement;
  const key = event.key;

  if (key === ' ' && inputElement.selectionStart === 0) {
  event.preventDefault();
  }
}

}
