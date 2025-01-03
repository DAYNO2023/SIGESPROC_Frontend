import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { ClienteService } from 'src/app/demo/services/servicesgeneral/cliente.service';
import { Cliente } from 'src/app/demo/models/modelsgeneral/clienteviewmodel';
import { DropDownEstadoCivil } from 'src/app/demo/models/modelsgeneral/estadoCivilviewmodel';
import { ciudadService } from 'src/app/demo/services/servicesgeneral/ciudad.service';
import { EstadoService } from 'src/app/demo/services/servicesgeneral/estado.service';
import { PaisService } from 'src/app/demo/services/servicesgeneral/pais.service';
import { EstadoCivilService } from 'src/app/demo/services/servicesgeneral/estadoCivil.service';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { ciudad } from 'src/app/demo/models/modelsgeneral/ciudadviewmodel';
import { Estado } from 'src/app/demo/models/modelsgeneral/estadoviewmodel ';
import { Pais } from 'src/app/demo/models/modelsgeneral/paisviewmodel';
import { tr } from 'date-fns/locale';
import { CookieService } from 'ngx-cookie-service';
import { log } from 'mathjs';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss'],
  providers: [MessageService]
})
export class clienteComponent implements OnInit {
  clientes: Cliente[] = [];
  items: MenuItem[] = [];
  Index: boolean = true;
  Create: boolean = false;
  Detail: boolean = false;
  Delete: boolean = false;
  modaleliminar: boolean = false;
  modalConfirmacion: boolean = false;
  confirm: boolean = false;
  loading: boolean = false;
  minDate: Date;
  identidad: number;
  form: FormGroup;
  submitted: boolean = false;
  identity: string = "Crear";
  selectedCliente: Cliente;
  selectedPais: any;
  selectedEstado: any;
  selectedCiudad: any;

  id : number = parseInt(this.cookieService.get('usua_Id'));
  idClie: number;

  titulo: string = "Nuevo";
  estadosCiviles: DropDownEstadoCivil[] = [];
  detalle: any = {};
  civiles: DropDownEstadoCivil[] = [];

  cliente: Cliente = { };

  ciudades: ciudad[] = [];

  estados: Estado[] = [];

  paises: Pais[] = [];

  paisfill: Pais[] = [];
  estadofill: Estado[] = [];
  ciudadfill: ciudad[] = [];

  Datos = [{}];

  //Detalles
  detalle_clie_Id: string;
  detalle_clie_DNI: string = "";
  detalle_clie_Nombre: string = "";
  detalle_clie_Apellido: string = "";
  detalle_clie_CorreoElectronico: string = "";
  detalle_clie_Telefono: string = "";
  detalle_clie_FechaNacimiento: string = "";
  detalle_clie_Sexo: string = "";
  detalle_clie_Tipo: string = "";

  detalle_clie_DireccionExacta: string = "";
  detalle_ciud_Descripcion: string = "";
  detalle_usua_Creacion: string = "";
  detalle_usua_Modificacion: string = "";
  detalle_clie_FechaCreacion: string = "";
  detalle_clie_FechaModificacion: string = "";
  detalle_civi_Descripcion: string = "";
  selectedClienteNombre: string = "";
  Nombre: string = "";

  notFound: boolean = false;
  notFound1: boolean = false;
  notFound2: boolean = false;

  constructor(
    private messageService: MessageService,
    private clienteService: ClienteService,
    private ciudadService: ciudadService,
    public cookieService: CookieService,
    private estadoService: EstadoService,
    private paisService: PaisService,
    private estadoCivilService: EstadoCivilService,
    private router: Router,
    private fb: FormBuilder,
  ) {

        this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          // Si la URL coincide con la de este componente, forzamos la ejecución
          if (event.urlAfterRedirects.includes('/sigesproc/general/cliente')) {
            // Aquí puedes volver a ejecutar ngOnInit o un método específico
            this.onRouteChange();
          }
        });


    this.form = this.fb.group({
      clie_DNI: ['', Validators.required],
      clie_Nombre: ['', Validators.required],
      clie_Apellido: ['', Validators.required],
      clie_CorreoElectronico: ['', [Validators.required, Validators.email,Validators.pattern('^.+.com$')]],
      clie_Telefono: ['', Validators.required],
      esta_Nombre: ['', Validators.required],
      pais_Nombre: ['', Validators.required],
      ciud_Descripcion: ['', Validators.required],
      esta_Id: [''], // Cambiado a 'esta_Id'
      pais_Id: [''],
      clie_FechaNacimiento: ['', Validators.required],
      clie_Sexo: ['', Validators.required],
      clie_DireccionExacta: ['', Validators.required],
      ciud_Id: [''],
      civi_Id: ['', Validators.required],
      clie_Tipo:['',Validators.required]
    });

    this.estados = [];
    this.paises = [];
    this.ciudades = [];
    this.estadosCiviles = [];
    this.civiles = [];

  }


  onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar
    this.ngOnInit();
  }

  ngOnInit(): void {

    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;

    this.minDate = new Date();
    this.minDate.setFullYear(1940, 0, 1);

    const token = this.cookieService.get('Token');
    if (token == 'false') {
      this.router.navigate(['/auth/login'])
    }

    this.Listado();
    this.loadCountries();



    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarCliente() },
      { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleCliente() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.ModalEliminar() },
    ];


    this.ciudades = []; //Carga las ciudades

    this.estados = []; //Carga los estados

    this.paisService.Listar() //Carga la lista de estados
    .subscribe((data: any) => { this.paises = data.data })

   this.estadoCivilService.DropDown()
   .subscribe((data: DropDownEstadoCivil[]) => {
    this.civiles = data;

      this.notFound = this.civiles.length === 0;      //Carga la lista de estados civiles
 });

  }

  Listado() { //Carga la lista de clientes
    this.loading = true;
    this.clienteService.Listar().subscribe(
      (data: any) => {

        if (Array.isArray(data)) {
          this.clientes = data;
        } else {
          console.error('Clientes data is not an array:', data);
          this.clientes = [];
        }
      },
      error => {
        console.error(error);
      },()=>{
        this.loading = false;
      }
    );
  }
// Filtrar Países
filterPais(event: any) {
  const query = event.query.toLowerCase();
  this.paisfill = this.paises
  .filter(pais =>pais.pais_Nombre.toLowerCase().includes(query))
  .sort((a,b)=>a.pais_Nombre.localeCompare(b.pais_Nombre));

  this.notFound = this.paisfill.length === 0;
}

// Filtrar Estados
filterEstado(event: any) {
  const query = event.query.toLowerCase();
  this.estadofill = this.estados
  .filter(estado => estado.esta_Nombre.toLowerCase().includes(query))
  .sort((a,b)=>a.esta_Nombre.localeCompare(b.esta_Nombre));

  this.notFound1 = this.estadofill.length === 0;

}

// Filtrar Ciudades
filterCiudad(event: any) {
  const query = event.query.toLowerCase();
  this.ciudadfill = this.ciudades
  .filter(ciudad =>ciudad.ciud_Descripcion.toLowerCase().includes(query))
  .sort((a,b)=>a.ciud_Descripcion.localeCompare(b.ciud_Descripcion));

  this.notFound2 = this.ciudadfill.length === 0;

}

   async loadCountries() {
    try {
      const data = await this.paisService.Listar().toPromise(); // Convert Observable to Promise
      this.paises = data; // Assign the result directly to paises
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  }

  async onCountryChange(event: any) {
    const paisSeleccionado = event.value;
    const paisId = paisSeleccionado?.pais_Id;

    if (paisId) {
      try {
        const data = await this.estadoService.DropDownEstadosByCountry2(paisId); // Espera la promesa
        this.estados = data; // Asigna los estados a la variable
        this.form.get('esta_Id')?.setValue(null); // Restablece el valor del dropdown de estados
        this.ciudades = []; // Resetea las ciudades
      } catch (error) {
        console.error('Error fetching states:', error); // Maneja los errores
      }
    }
  }

  async onStateChange(event: any) {
    const estadoSeleccionado = event.value;  // El objeto seleccionado completo
    const estadoId = estadoSeleccionado?.esta_Id;  // Extraer el ID del estado seleccionado

    if (estadoId) {
      try {
        const data = await this.ciudadService.DropDownByState2(estadoId);

        // Verificar si los datos son un array antes de asignar
        if (Array.isArray(data)) {
          this.ciudades = data; // Asignar las ciudades obtenidas
        } else {
          this.ciudades = []; // Si no es un array, inicializar vacío
          console.error('Error: las ciudades no se cargaron correctamente:', data);
        }

        this.form.get('ciud_Id')?.setValue(null); // Restablecer el valor del dropdown de ciudades
      } catch (error) {
        console.error('Error fetching cities:', error); // Manejar el error
        this.ciudades = []; // Vaciar el array si hay un error
      }
    } else {
      this.ciudades = []; // Si no hay estado seleccionado, limpiar las ciudades
    }
  }

  onCitySelect(event: any) {
    const ciudadSeleccionada = event.value;  // El objeto seleccionado completo de la ciudad
    const ciudadId = ciudadSeleccionada?.ciud_Id;  // Extraer el ID de la ciudad seleccionada

    if (ciudadId) {
      this.form.patchValue({
        ciud_Id: ciudadId  // Establecer el ID de la ciudad en el formulario
      });
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  selectCliente(cliente: Cliente) { //Carga el cliente seleccionado
    this.selectedCliente = cliente;
  }

  CrearCliente() { //Activa el collapse de Editar/Guardar
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.form.reset();
    this.identity = "crear";
    this.titulo = "Nuevo Cliente";
  }

  CerrarCliente() { //Metodo para cancelar la accion que se esta realzindo
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
  }


  async loadPaisesEstadosYCiudades() {
    // Cargar los países
    this.paisService.Listar().subscribe(
      async (data: any) => {
        this.paises = data.data;
        if (this.selectedCliente && this.selectedCliente.pais_Id) {
          const selectedPais = this.paises.find(pais => pais.pais_Id === this.selectedCliente.pais_Id);
          if (selectedPais) {
            try {
              const estadosData = await this.estadoService.DropDownEstadosByCountry2(selectedPais.pais_Id);
              this.estados = estadosData;

              if (this.selectedCliente.esta_Id) {
                const selectedEstado = this.estados.find(estado => estado.esta_Id === this.selectedCliente.esta_Id);
                if (selectedEstado) {
                  try {
                    const ciudadesData = await this.ciudadService.DropDownByState2(selectedEstado.esta_Id);
                    this.ciudades = ciudadesData;

                } catch (error) {
                    console.error('Error fetching ciudades:', error);
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching estados:', error);
            }
          }
        }
      },
      error => {
        console.error('Error fetching paises:', error);
      }
    );
  }


   EditarCliente() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.identity = "editar";
    this.titulo = "Editar Cliente";

    // Patch form values first
    this.form.patchValue({
      clie_Id: this.selectedCliente.clie_Id,
      clie_DNI: this.selectedCliente.clie_DNI,
      clie_Nombre: this.selectedCliente.clie_Nombre,
      clie_Apellido: this.selectedCliente.clie_Apellido,
      clie_CorreoElectronico: this.selectedCliente.clie_CorreoElectronico,
      clie_Telefono: this.selectedCliente.clie_Telefono,
      clie_FechaNacimiento: new Date(this.selectedCliente.clie_FechaNacimiento),
      clie_Sexo: this.selectedCliente.clie_Sexo,
      clie_DireccionExacta: this.selectedCliente.clie_DireccionExacta,
      clie_Tipo: this.selectedCliente.clie_Tipo,
      pais_Id: this.selectedCliente.pais_Id,
      esta_Id: this.selectedCliente.esta_Id,
      ciud_Id: this.selectedCliente.ciud_Id,
      civi_Id: this.selectedCliente.civi_Id,
      esta_Nombre: this.selectedCliente.esta_Nombre,
      pais_Nombre: this.selectedCliente.pais_Nombre,
      ciud_Descripcion: this.selectedCliente.ciud_Descripcion
   // Ensure this is patched correctly
    });
    this.idClie = this.selectedCliente.clie_Id;

  }


  ValidarDNI(event: KeyboardEvent) { //Solo permite ingresar numeros
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

 ValidarNumeroDeTelefono(event: KeyboardEvent) { //Solo permite ingresar numeros
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
}

 ValidarTexto(event: KeyboardEvent) { //Solo permite ingresar letras
  const inputElement = event.target as HTMLInputElement;
  const key = event.key;
  if (!/^[a-zA-Z\s]+$/.test(key) && key !== 'Backspace' && key !== 'Tab') {
    event.preventDefault();
  }
  if (key === ' ' && inputElement.selectionStart === 0) {
    event.preventDefault();
  }
}
ValidarTextoONumeros(event: KeyboardEvent, tipo: 'texto' | 'numeros') {
  const inputElement = event.target as HTMLInputElement;
  const key = event.key;

  if (tipo === 'texto') {
    if (!/^[a-zA-Z\s]+$/.test(key) && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  } else if (tipo === 'numeros') {
    if (!/^[0-9]+$/.test(key) && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }
  }
}

ValidarNumeros(event: KeyboardEvent) {
  const inputElement = event.target as HTMLInputElement;
  const key = event.key;
  if (!/^[0-9]+$/.test(key) && key !== 'Backspace' && key !== 'Tab') {
    event.preventDefault();
  }
}


 ValidarEmail(event: KeyboardEvent) {
  const inputElement = event.target as HTMLInputElement;
  const key = event.key;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (key === 'Backspace' || key === 'Tab') {
      return;
  }
  if (/^[a-zA-Z0-9._%+-@]$/.test(key)) {
      const newValue = inputElement.value + key;
      if (emailRegex.test(newValue)) {
          return;
      }
  }
  event.preventDefault();
}

handleInput(event: Event , controlName: string) {
  const inputElement = event.target as HTMLInputElement;
  const texto = inputElement.value;

  // Solo permitir letras y un espacio después de cada letra
  inputElement.value = texto
  .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  .replace(/\s{2,}/g, ' ')
  .replace(/^\s/, '');

  // Actualizar el valor en el formulario
  this.form.controls[controlName].setValue(inputElement.value);
}

handleInputnumber(event: Event , controlName: string) {
  const inputElement = event.target as HTMLInputElement;
  const texto = inputElement.value;

  // Solo permitir letras y un espacio después de cada letra
  inputElement.value = texto
  .replace(/[^0-9\s]|(?<=\s)[^\s0-9\s]/g, '')
  .replace(/\s{2,}/g, ' ')
  .replace(/^\s/, '');

  // Actualizar el valor en el formulario
  this.form.controls[controlName].setValue(inputElement.value);
}

handleInputespacial(event: Event , controlName: string) {
  const inputElement = event.target as HTMLInputElement;
  const texto = inputElement.value;

  // Solo permitir letras y un espacio después de cada letra
  inputElement.value = texto
  .replace(/[^a-zA-Z0-9.áéíóúÁÉÍÓÚñÑ@\s]|(?<=\s)[^\sa-zA-Z.áéíóúÁÉÍÓÚñÑ@\s]/g, '')
  .replace(/\s{2,}/g, ' ')
  .replace(/^\s/, '');

  // Actualizar el valor en el formulario
  this.form.controls[controlName].setValue(inputElement.value);
}
  Guardar() { //Metodo para enviar los datos al endpoint de insertar
    this.submitted = true;

    if(this.identidad < 13){
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La identidad no puede ser menor de 13 digitos',
        styleClass: 'iziToast-custom'
      });
    }

    if (this.identity !== 'editar') {
      // Validaciones para creación de nuevo cliente
      const DNIexistente = this.clientes.some(dni =>
        dni.clie_DNI.toLowerCase() === this.form.value.clie_DNI.toLowerCase()
      );

      if (DNIexistente) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'El DNI ya existe',
          styleClass: 'iziToast-custom'
        });
        return; // Detener la ejecución si ya existe
      }

      const correoExistente = this.clientes.some(correo =>
        correo.clie_CorreoElectronico.toLowerCase() === this.form.value.clie_CorreoElectronico.toLowerCase()
      );

      if (correoExistente) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'El correo ya existe',
          styleClass: 'iziToast-custom'
        });
        return; // Detener la ejecución si ya existe
      }
    } else {
      // Validaciones para edición, permitiendo que el DNI o correo sean los del cliente actual
      const DNIexistente = this.clientes.some(dni =>
        dni.clie_DNI.toLowerCase() === this.form.value.clie_DNI.toLowerCase() &&
        dni.clie_Id !== this.idClie // Excluir el registro actual por ID
      );

      if (DNIexistente) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Otro cliente ya tiene ese DNI',
          styleClass: 'iziToast-custom'
        });
        return; // Detener la ejecución si ya existe
      }

      const correoExistente = this.clientes.some(correo =>
        correo.clie_CorreoElectronico.toLowerCase() === this.form.value.clie_CorreoElectronico.toLowerCase() &&
        correo.clie_Id !== this.idClie // Excluir el registro actual por ID
      );

      if (correoExistente) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Otro cliente ya tiene ese correo',
          styleClass: 'iziToast-custom'
        });
        return; // Detener la ejecución si ya existe
      }
    }


    if (this.identity === 'editar' && !this.modalConfirmacion) {
      this.Nombre = this.selectedCliente.clie_Nombre;
      this.modalConfirmacion = true; // Muestra el modal de confirmación
      return
    }

    if (this.identity === 'editar' && this.modalConfirmacion && !this.confirm) {
      this.confirm = true; // Usuario ha confirmado la acción
    }



    if (this.form.valid) {
     const datos : any = {
        clie_Id: this.idClie,
        clie_DNI: this.form.value.clie_DNI,
        clie_Nombre: this.form.value.clie_Nombre,
        clie_Apellido: this.form.value.clie_Apellido,
        clie_CorreoElectronico: this.form.value.clie_CorreoElectronico,
        clie_Telefono: this.form.value.clie_Telefono,
        clie_FechaNacimiento: new Date(this.form.value.clie_FechaNacimiento),
        clie_Sexo: this.form.value.clie_Sexo,
        clie_DireccionExacta: this.form.value.clie_DireccionExacta,
        ciud_Id: this.form.value.ciud_Id,
        civi_Id: this.form.value.civi_Id,
        clie_Tipo:this.form.value.clie_Tipo,
        usua_Creacion: this.id,
        usua_Modificacion: this.id
     };

    if (this.identity === 'crear') {
      this.clienteService.Insertar(datos).subscribe(
        (data: Respuesta) => {
          this.messageService.add({ severity: 'success',         styleClass: 'iziToast-custom' ,
            summary: 'Éxito', detail: 'Insertado con Éxito.' });
          this.CerrarCliente();
          this.Listado();
          this.submitted = false;
          this.modalConfirmacion = false
          this.confirm = false; // Restablece la confirmación

        },
        error => {
          this.messageService.add({ severity: 'error',         styleClass: 'iziToast-custom' ,
            summary: 'Error', detail: 'Error al crear el cliente' });
        }
      );
    } else if (this.confirm && this.identity === 'editar') {
      this.clienteService.Actualizar(datos).subscribe(
        (data: Respuesta) => {
          this.messageService.add({ severity: 'success',         styleClass: 'iziToast-custom' ,
            summary: 'Éxito', detail: 'Actualizado con Éxito.' });
          this.CerrarCliente();
          this.Listado();
          this.submitted = false;
          this.modalConfirmacion = false
          this.confirm = false; // Restablece la confirmación
        },
        error => {
          this.messageService.add({ severity: 'error',         styleClass: 'iziToast-custom' ,
            summary: 'Error', detail: 'Error al actualizar el cliente' });
        }
      );
    }
  }
  }

  DetalleCliente() { //Metodo para carga los detalles del registro
    this.titulo = "Detalle Cliente";
    this.Detail = true;
    this.Index = false;
    this.Create = false;
    this.Delete = false;

    this.detalle_clie_Id = this.selectedCliente.codigo;
    this.detalle_clie_DNI = this.selectedCliente.clie_DNI;
    this.detalle_clie_Nombre = this.selectedCliente.clie_Nombre;
    this.detalle_clie_Apellido = this.selectedCliente.clie_Apellido;
    this.detalle_clie_CorreoElectronico = this.selectedCliente.clie_CorreoElectronico;
    this.detalle_clie_Telefono = this.selectedCliente.clie_Telefono;
    this.detalle_clie_FechaNacimiento = this.selectedCliente.clie_FechaNacimiento;
    this.detalle_clie_Sexo = this.selectedCliente.clie_Sexo ;
    this.detalle_clie_Tipo = this.selectedCliente.clie_Tipo;
    this.detalle_clie_DireccionExacta = this.selectedCliente.clie_DireccionExacta;
    this.detalle_ciud_Descripcion = this.selectedCliente.ciud_Descripcion;
    this.detalle_usua_Creacion = this.selectedCliente.clie_usua_Creacion;
    this.detalle_usua_Modificacion = this.selectedCliente.clie_usua_Modificacion;
    this.detalle_clie_FechaCreacion = this.selectedCliente.clie_FechaCreacion;
    this.detalle_clie_FechaModificacion = this.selectedCliente.clie_FechaModificacion;
    this.detalle_civi_Descripcion = this.selectedCliente.civi_Descripcion;
  }


  async EliminarCliente() {
    this.Delete = false;
    //Manda la confirmacion de eliminar
    try {
      // Llama al servicio para eliminar el proveedor y espera la respuesta
      const response = await this.clienteService.Eliminar2(this.idClie);

      const { code, data, message } = response; // Desestructura la respuesta
      // Inicializa variables para el mensaje del servicio
      let severity = 'error';
      let summary = 'Error';
      let detail = data?.messageStatus || message;
      let styleClass = '';

      // Verifica el código de respuesta
      if (code === 200) {
          // Si la eliminación fue exitosa o hay una advertencia
          severity = data.codeStatus > 0 ? 'success' : 'warn';
          summary = data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
          styleClass = 'iziToast-custom';
      } else if (code === 500) {
          // Si hubo un error interno
          severity = 'error';
          summary = 'Error Interno';
          styleClass = 'iziToast-custom';

      }

      // Añade el mensaje de estado al servicio de mensajes
      this.messageService.add({
          severity,
          summary,
          detail,
          styleClass: 'iziToast-custom' ,
          life: 3000
      });
      // Reinicia el componente
      this.ngOnInit();
  } catch (error) {
      // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
      this.messageService.add({
          severity: 'error',
          summary: 'Error Externo',
          detail: error.message || error,
          styleClass: 'iziToast-custom' ,
          life: 3000
      });
  }

}

ModalEliminar() {
  this.Delete = true;
  this.detalle_clie_Nombre = this.selectedCliente.clie_Nombre;
  this.idClie = this.selectedCliente.clie_Id;
}
}
