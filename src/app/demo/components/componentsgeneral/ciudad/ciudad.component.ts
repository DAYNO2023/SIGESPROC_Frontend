import { Component, OnInit } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { ciudadService } from 'src/app/demo/services/servicesgeneral/ciudad.service';
import { EstadoService } from 'src/app/demo/services/servicesgeneral/estado.service';
import { ciudad } from 'src/app/demo/models/modelsgeneral/ciudadviewmodel';
import { PaisService } from 'src/app/demo/services/servicesgeneral/pais.service';
import { DropDownEstados } from 'src/app/demo/models/modelsgeneral/estadoviewmodel';
import { Estado } from 'src/app/demo/models/modelsgeneral/estadoviewmodel ';
import { CookieService } from 'ngx-cookie-service';
import { Pais } from 'src/app/demo/models/modelsgeneral/paisviewmodel';
import { tr } from 'date-fns/locale';
import { log } from 'mathjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-ciudad',
  templateUrl: './ciudad.component.html',
  styleUrl: './ciudad.component.scss',
  providers: [MessageService]
})
export class CiudadComponent implements OnInit {

  ciudades: ciudad[] = [];
  estado: DropDownEstados[] = [];
  items: MenuItem[] = [];
  estados: Estado[] = [];
  ciudad: ciudad = { usua_Creacion: 3 , usua_Modificacion:3};
  paises: Pais[] = [];
  paisfill: Pais[] = [];
  estadofill: Estado[] = [];
  Index: boolean = true;
  Create: boolean = false;
  Detail: boolean = false;
  Delete: boolean = false;
  loading: boolean = true; // Para controlar el estado de carga
  modaleliminar: boolean = false;
  modalConfirmacion: boolean = false;
  confirm: boolean = false;
  form: FormGroup;
  submitted: boolean = false;
  identity: string = "Crear";
  selectedciudad: any;
  id : number = parseInt(this.cookieService.get('usua_Id'));
  titulo: string = "Nuevo";
  // Detalles
  Datos = [{}];
  detalle_ciud_Id: string = "";
  detalle_ciud_Codigo: string = "";
  detalle_ciud_Descripcion: string = "";
  detalle_esta_Id: string = "";
  detalle_esta_Codigo: string = "";
  detalle_esta_Nombre: string = "";
  detalle_pais_Id: string = "";
  detalle_pais_Nombre: string = "";
  detalle_usuaCreacion: string = "";
  detalle_usuaModificacion: string = "";
  detalle_FechausuaCreacion: string = "";
  detalle_FechausuaModificacion: string = "";
  esta_Id: any;
  CiudId: number = 0;
  selectedCiudadDescripcion: string = '';
  notFound: boolean = false;
  notFound1: boolean = false;
  notFound2: boolean = false;

  constructor(
    private messageService: MessageService,
    private service: ciudadService,
    private estadoService: EstadoService,
    private paisService: PaisService,
    private router: Router,
    public cookieService: CookieService,
    private fb: FormBuilder,
  ) {




        this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          // Si la URL coincide con la de este componente, forzamos la ejecución
          if (event.urlAfterRedirects.includes('/sigesproc/general/ciudad')) {
            // Aquí puedes volver a ejecutar ngOnInit o un método específico
            this.onRouteChange();
          }
        });




    this.form = this.fb.group({
      ciud_Id: [],
      ciud_Codigo: ['', Validators.required],
      ciud_Descripcion: ['', Validators.required],
      esta_Id: [''], // Cambiado a 'esta_Id'
      pais_Id: [''], // Agregado campo pais_Id
      pais_Nombre: ['', Validators.required],
      esta_Nombre: ['', Validators.required]
    });
  }

  onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar
    this.ngOnInit();
  }

  async ngOnInit(): Promise<void> {

    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;

    const token = this.cookieService.get('Token');
    if (token == 'false') {
      this.router.navigate(['/auth/login'])
    }


    this.ciudades = [];
    this.estados = [];

    this.paisService.Listar()
      .subscribe((data: any) => { this.paises = data.data });

    this.Listado();

    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.Editarciudad() },
      { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.Detalleciudad() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.AbrirEliminar() },
    ];
  };

  Listado() {
    this.loading = true;

    this.service.Listar().subscribe(
      (data: any) => {
        this.ciudades = data.map((ciudades: any) => ({
          ...ciudades,
          esta_FechaCreacion: new Date(ciudades.esta_FechaCreacion).toLocaleDateString(),
          esta_FechaModificacion: new Date(ciudades.esta_FechaModificacion).toLocaleDateString()
        }));
      },
      error => {
      }, () => {
        this.loading = false; // Oculta el loader cuando se completa la carga
    }
    );
  }

  filterPais(event: any) {
    const query = event.query.toLowerCase();
    this.paisfill = this.paises
    .filter(pais => pais.pais_Nombre.toLowerCase().includes(query))
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

  async filtrarEstados(event: any) {
    const paisSeleccionado = event.value;  // El objeto seleccionado completo
    const paisId = paisSeleccionado?.pais_Id;  // Extraer el ID del país

    if (paisId) {
      try {
        const data = await this.estadoService.DropDownEstadosByCountry2(paisId);
        this.estados = data;  // Asignar los estados al array
        this.form.get('esta_Nombre')?.setValue(null);  // Restablecer el dropdown de estados
      } catch (error) {
        console.error('Error fetching estados:', error);
      }
    }
  }

  EstadoOnChange(event: any) {
    const estadoSeleccionado = event.value;  // El objeto seleccionado completo
    const estadoId = estadoSeleccionado?.esta_Id;  // Extraer el ID del estado

    if (estadoId) {
      this.form.patchValue({
        esta_Id: estadoId,  // Asignar el ID del estado al formulario
        esta_Nombre: estadoSeleccionado.esta_Nombre  // Asignar el nombre del estado al formulario
      });
    }
  }

  getEstadoNombre(estadoId: number): string {
    const estado = this.estados.find(e => e.esta_Id === estadoId);
    return estado ? estado.esta_Nombre : '';
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  selectciudad(ciudad: any) {
    this.selectedciudad = ciudad;
  }



  Crearciudad() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.form.reset();
    this.identity = "crear";
    this.titulo = "Nueva Ciudad";
  }

  Cerrarciudad() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
  }

  async Editarciudad() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.identity = "editar";
    this.titulo = "Editar Ciudad";

    try {
      // Carga los países y luego los estados
      await this.loadPaisesAndEstados();

      // Establece los valores del formulario después de cargar los datos
      this.form.patchValue({
        ciud_Id: this.selectedciudad.ciud_Id,
        ciud_Codigo: this.selectedciudad.ciud_Codigo,
        ciud_Descripcion: this.selectedciudad.ciud_Descripcion,
        pais_Id: this.selectedciudad.pais_Id,
        esta_Id: this.selectedciudad.esta_Id,

        pais_Nombre: this.selectedciudad.pais_Nombre,
        esta_Nombre: this.selectedciudad.esta_Nombre
      });
      this.CiudId = this.selectedciudad.ciud_Id;
      this.selectedCiudadDescripcion = this.selectedciudad.ciud_Descripcion;

    } catch (error) {
      console.error('Error al cargar países y estados:', error);
    }
  }

  async loadPaisesAndEstados() {
    return new Promise<void>((resolve, reject) => {
      this.paisService.Listar().subscribe(
        async (data: any) => {
          this.paises = data.data;

          const selectedPais = this.paises.find(pais => pais.pais_Id === this.selectedciudad.pais_Id);
          if (selectedPais) {
            try {
              const estadosData = await this.estadoService.DropDownEstadosByCountry2(selectedPais.pais_Id);
              this.estados = estadosData;
              resolve();
            } catch (error) {
              console.error('Error fetching estados:', error);
              reject(error);
            }
          } else {
            resolve();
          }
        },
        error => {
          console.error('Error fetching paises:', error);
          reject(error);
        }
      );
    });
  }

  Detalleciudad() {
    this.Index = false;
    this.Create = false;
    this.Detail = true;
    this.titulo = 'Detalle Ciudad'
    this.detalle_ciud_Id = this.selectedciudad.codigo;
    this.detalle_ciud_Codigo = this.selectedciudad.ciud_Codigo;
    this.detalle_ciud_Descripcion = this.selectedciudad.ciud_Descripcion;
    this.detalle_esta_Nombre = this.selectedciudad.esta_Nombre;
    this.detalle_usuaCreacion = this.selectedciudad.ciud_usua_Creacion;
    this.detalle_FechausuaCreacion = this.selectedciudad.ciud_FechaCreacion;
    this.detalle_usuaModificacion = this.selectedciudad.ciud_usua_Creacion;  //ciud_usua_Modificacion
    this.detalle_FechausuaModificacion = this.selectedciudad.ciud_FechaModificiacion;
  }

  ValidarNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;

    if (!/[0-9]/.test(key) && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }

    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }

    if (inputElement.value.length >= 4 && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }
  }

  ValidarTexto(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z\s ]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  ValidarTextoNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z\s 0-9]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
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
    this.form.controls['ciud_Descripcion'].setValue(inputElement.value);
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

  Guardar() {
    this.submitted = true;

    if(this.identity == 'editar' && !this.modalConfirmacion){
      this.modalConfirmacion = true;
      return
    }else if(this.identity == 'editar' && this.modalConfirmacion){
      this.confirm = true;
    }

    if (this.identity !== 'editar') {
      // Validaciones para creación de nueva ciudad
      const ciudadExistente = this.ciudades.some(c =>
        c.ciud_Descripcion.toLowerCase() === this.form.value.ciud_Descripcion.toLowerCase()
      );

      if (ciudadExistente) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'La ciudad ya existe',
          styleClass: 'iziToast-custom'
        });
        return; // Detener la ejecución si ya existe
      }

      const codigoExistente = this.ciudades.some(c =>
        c.ciud_Codigo.toLowerCase() === this.form.value.ciud_Codigo.toLowerCase()
      );

      if (codigoExistente) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'El código ya existe',
          styleClass: 'iziToast-custom'
        });
        return; // Detener la ejecución si ya existe
      }
    } else {
      // Validaciones para edición, asegurando que no duplique códigos o descripciones, excepto para el registro actual
      const ciudadExistente = this.ciudades.some(c =>
        c.ciud_Descripcion.toLowerCase() === this.form.value.ciud_Descripcion.toLowerCase() &&
        c.ciud_Id !== this.form.value.ciud_Id // Excluir el registro actual basado en el ID
      );

      if (ciudadExistente) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Otra ciudad ya tiene esa descripción',
          styleClass: 'iziToast-custom'
        });
        return;
      }

      const codigoExistente = this.ciudades.some(c =>
        c.ciud_Codigo.toLowerCase() === this.form.value.ciud_Codigo.toLowerCase() &&
        c.ciud_Id !== this.form.value.ciud_Id // Excluir el registro actual basado en el ID
      );

      if (codigoExistente) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Otro registro ya tiene ese código',
          styleClass: 'iziToast-custom'
        });
        return;
      }
    }

    if (this.form.valid) {
      const datos: any = {
        ciud_Id: this.CiudId,
        ciud_Codigo: this.form.value.ciud_Codigo,
        ciud_Descripcion: this.form.value.ciud_Descripcion,
        esta_Id: parseInt(this.form.value.esta_Id),
        usua_Creacion: this.id ,
        usua_Modificacion: this.id
      };

      if (this.identity === 'crear') {

        this.service.Insertar(datos).subscribe(
          () => {
            this.messageService.add({ severity: 'success',         styleClass: 'iziToast-custom' ,
              summary: 'Éxito', detail: 'Insertado con Éxito.' });
            this.Listado();
            this.Cerrarciudad();
            this.modalConfirmacion = false
          },
          () => {
            this.messageService.add({
              severity: 'warn',
              summary: 'Error',
              detail: 'El registro ya existe',
              styleClass: 'iziToast-custom'
            });}
        );
      } else if (this.confirm && this.identity === 'editar') {

          this.service.Actualizar(datos).subscribe(

            () => {
              this.messageService.add({ severity: 'success',        styleClass: 'iziToast-custom' ,
                summary: 'Éxito', detail: 'Actualizado con Éxito.' });
              this.Listado();
              this.Cerrarciudad();
              this.modalConfirmacion = false
            },
            () => {
              this.messageService.add({
                severity: 'warn',
                summary: '¡Error!',
                detail: 'Ocurrió un error al editar la ciudad.',
                styleClass: 'iziToast-custom'
              });
            }
          );
      }
    }
  }

  async Eliminarciudad() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.Delete = false;
    try {
      // Llama al servicio para eliminar el proveedor y espera la respuesta
      const response = await this.service.Eliminar(this.CiudId);

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
          styleClass = 'iziToast-custom'
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
          styleClass: 'iziToast-custom' ,

          detail: error.message || error,
          life: 30000
      });
  }

  }

  AbrirEliminar() {
    this.detalle_ciud_Descripcion = this.selectedciudad.ciud_Descripcion;
    this.CiudId = this.selectedciudad.ciud_Id;
    this.Delete = true;
  }

  CerrarEliminar() {
    this.Delete = false;
  }
}
