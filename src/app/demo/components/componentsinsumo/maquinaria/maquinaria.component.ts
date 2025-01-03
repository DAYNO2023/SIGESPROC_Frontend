import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Maquinaria, MaquinariaCrud } from '../../../models/modelsinsumo/maquinariaviewmodel';
import { Niveles } from '../../../models/modelsgeneral/nivelesviewmodel';
import { MaquinariaService } from '../../../services/servicesinsumo/maquinaria.service';
import { NivelesService } from '../../../services/servicesgeneral/niveles.service';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';
import { ToastService } from 'src/app/demo/services/toast.service';
import { Gravedades } from 'src/app/demo/models/GravedadIzitoastEnum';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-maquinaria',
  templateUrl: './maquinaria.component.html',
  styleUrl: './maquinaria.component.scss',
  providers: [MessageService]
})
export class MaquinariaComponent implements OnInit {

//#region variables
  maquinarias:  MaquinariaCrud[] = [] ;
  items: MenuItem[] = [];
  Index: boolean = true;
  toast: boolean = true;
  form: FormGroup;
  create:boolean =  false;
  selectedMaquinaria :  any;
  submitted: boolean = false;
  titulo: string = "Nueva";
  Detail: boolean = false;
  Delete: boolean = false; //variable para abrir el modal de eliminar
  Edit: boolean = false; //variable para abrir el modal de editar
  MaquinariaFromEditar: any; //variable que almacena el formgroup lleno de editar
  isTableLoading: boolean = false;//variable para mostrar el spinner
  loadedTableMessage: string = "";//variable para almacenar el mensaje de carga
  identity: string = "Crear";//diferenciador de editar o crear
  id: number = 0;
  nivel: Niveles [] = [];
  //Detalles 
  Datos = [{}];
  detalle_maqu_Id : string = "";
  detalle_maqu_Descripcion: string = "";
  detalle_nive_Id : string = "";
  detalle_usua_Creacion: string = "";
  detalle_maqu_FechaCreacion : string = "";
  detalle_usua_Modificacion : string = "";
  detalle_maqu_FechaModificacion: string = "";
  detalle_maqu_Estado : string = "";
  detalle_nive_Descripcion : string = "";
  detalle_usuaCreacion : string = "";
  detalle_usuaModificacion : string = "";
  detalle_maqu_UltimoPrecioUnitario: string = "";
  nivelSeleccionadoDDL: any;
  SubmittedDDL: boolean = false;
  descripcion: string = ''
  
  nivelesfill: Niveles[] | undefined
//#endregion
    
  constructor(
    private service: MaquinariaService,
    private serviceNivel: NivelesService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private messageService: MessageService,
    public cookieService: CookieService,
    private router: Router,
    
    public globalMoneda: globalmonedaService
  ) {


    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/insumo/maquinaria')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });

  }

  onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar
    this.ngOnInit();
  }

    //acciones que se realizan cuando se inicia la ejecucion de la pantalla
    ngOnInit(): void {
      
      this.Index = true ;
      this.create =  false;
      this.Detail = false;

      this.form = this.fb.group({
        maqu_Descripcion: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s0-9\.]*$/)]],
        maqu_UltimoPrecioUnitario: ['', [Validators.required, Validators.min(0.01)]],
        nive_Id: ['', Validators.required],
        nive_Descripcion: ['', Validators.required]
      });
    
    const token = this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
    
      this.Listado();
      if (!this.globalMoneda.getState()) {
        this.globalMoneda.setState()
      }
      this.serviceNivel.Listar().subscribe((data: Niveles[]) => {
        this.nivel = data.sort((a, b) => a.nive_Descripcion.localeCompare(b.nive_Descripcion));
     });

      
      this.items = [//lista de aciones que se pueden realizar en el campo
        { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarMaquinaria() },
        { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleMaquinaria() },
        { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.EliminarMaquinaria() },
    ];
    };

//Listado de datos de la tabla principal de la pantalla
async Listado(){
  this.isTableLoading = true;
  this.Index = true;
  
  await this.service.Listar().then((data: any) => {

      this.maquinarias = data.data.map(( maquinaria: any) => ({
        ... maquinaria,
        maqu_FechaCreacion: new Date(maquinaria.maqu_FechaCreacion).toLocaleDateString(),
        maqu_FechaModificacion: new Date(maquinaria.maqu_FechaModificacion).toLocaleDateString(),
        maqu_UltimoPrecioUnitario: parseFloat(maquinaria.maqu_UltimoPrecioUnitario.toFixed(2))
      }));
    //#region muerto
      // if(this.maquinarias.length === 0){
      //   this.loadedTableMessage = "No hay maquinarias existentes aún.";//mensaje que se muestra si no hay registros en la tabla
      // }
      // else{
      //   this.isTableLoading = false;//oculta el spinner cuando se cargan los datos y no son 0
      // }
    // error => {
    //     // this.loadedTableMessage = error.message;
    //     // this.loadedTableMessage = "Error al cargar datos.";//mensaje que se muestra si no hay registros en la tabla
    //     this.isTableLoading = false;//oculta el spinner cuando se cargan los datos y no son 0
    //     this.loadedTableMessage = "Ocurrió un error al cargar los campos.";//mensaje que se muestra si no hay registros en la tabla
    // }
    //#endregion
    this.isTableLoading = false;
    }),()=>{
    this.isTableLoading = false;
  }
}

  //Accion de la barra de busqueda
  onGlobalFilter(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  //accion para guardar los datos del campo seleccionado
  selectMaquinaria(maquinaria: any) {
    this.selectedMaquinaria = maquinaria;
  }

  //Nivel seleccionado en el autocompletado
  onNivelSelect(event: any) {
    const nivelSeleccionado = event;
    this.nivelSeleccionadoDDL = event.value;
    this.form.patchValue({ nive_Id: nivelSeleccionado.value.nive_Id , nive_Descripcion:nivelSeleccionado.value.nive_Descripcion});
  }

  //filtro Nivel
  filterNivel(event: any) {
    const query = event.query.toLowerCase();
    this.nivelesfill = this.nivel.filter(nivel =>
      nivel.nive_Descripcion.toLowerCase().includes(query)
    );

    this.SubmittedDDL = this.nivelesfill.length === 0;

  }

  //acccion de desplegar el formulario para editar maquinaria
  EditarMaquinaria() {
    this.Detail = false;
    this.Index = false;
    this.create = true;
    this.identity = "editar";
    this.titulo= "Editar"
    this.form.patchValue({
      maqu_Descripcion: this.selectedMaquinaria.maqu_Descripcion,
      maqu_UltimoPrecioUnitario: this.selectedMaquinaria.maqu_UltimoPrecioUnitario,
      nive_Id: this.selectedMaquinaria.nive_Id,
      nive_Descripcion: this.selectedMaquinaria.nive_Descripcion
    });
    this.id = this.selectedMaquinaria.maqu_Id;
    this.detalle_maqu_Descripcion = this.selectedMaquinaria.maqu_Descripcion;
    
  }

  //accion de desplegar y llenar los campos de detalle
  DetalleMaquinaria(){
    this.Index = false;
    this.create = false;
    this.Detail = true;
    this.detalle_maqu_Id = this.selectedMaquinaria.codigo;
    this.detalle_maqu_Descripcion = this.selectedMaquinaria.maqu_Descripcion;
    this.detalle_maqu_UltimoPrecioUnitario = this.selectedMaquinaria.ultimoPrecio
    this.detalle_nive_Id = this.selectedMaquinaria.nive_Id;
    this.detalle_nive_Descripcion = this.selectedMaquinaria.nive_Descripcion;
    this.detalle_usuaCreacion = this.selectedMaquinaria.usuaCreacion
    this.detalle_maqu_FechaCreacion = this.selectedMaquinaria.maqu_FechaCreacion
    if (this.selectedMaquinaria.usuaModificacion != "") {
      this.detalle_usuaModificacion = this.selectedMaquinaria.usuaModificacion;
      this.detalle_maqu_FechaModificacion = this.selectedMaquinaria.maqu_FechaModificacion;
      if( this.selectedMaquinaria.maqu_FechaModificacion == "31/12/1969")
      {
        this.selectedMaquinaria.maqu_FechaModificacion = ""        
      }
    }else{
      this.detalle_usuaModificacion = "";
      this.detalle_maqu_FechaModificacion = "";
    }
    }

  //Accion para desplegar el formulario de creacion de maquinaria
  CrearMaquinaria() {
    this.form = this.fb.group({
      maqu_Descripcion: ['', Validators.required],
      maqu_UltimoPrecioUnitario: [null, Validators.required],
      nive_Id: ['', Validators.required],
      nive_Descripcion: ['', Validators.required]
    });
    this.submitted = false;
    this.Index = false;
    this.create = true;
    this.Detail = false;
    this.identity = "crear";
    this.titulo =  "Nueva";
  }

  //Accion que cierra los formularios y devuelve al inicio
  CerrarMaquinaria(){
    this.Index = true ;
    this.create =  false;
    this.Detail = false;
  }

  allowOnlyAlphanumeric(event: any) {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');
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
    this.form.controls['maqu_Descripcion'].setValue(inputElement.value);
  }

   matcher(event: any) {
    const allowedRegex = /[^a-zA-Z]+$/g;

    if (!event.key.match(allowedRegex)) {
        event.preventDefault();
    }
  }

  validateNumber(event: any) {
    const keyCode = event.keyCode;

    const excludedKeys = [8, 37, 39, 46];

    if (!((keyCode >= 48 && keyCode <= 57) ||
      (keyCode >= 96 && keyCode <= 105) ||
      (excludedKeys.includes(keyCode)))) {
      event.preventDefault();
    }
  }

    //Accion de Guardar una nueva maquinaria o actualizar una ya existente
    Guardar(){
      const valorNivel = this.form.get('nive_Descripcion')?.value.trim()
      if(valorNivel){
      let maquinaria;
      maquinaria = this.maquinarias.find(maq => maq.maqu_Descripcion === this.form.value.maqu_Descripcion.trim() && 
        maq.nive_Id === parseInt(this.form.value.nive_Id) && 
        maq.maqu_UltimoPrecioUnitario == this.form.value.maqu_UltimoPrecioUnitario
      ) ?? 'no existe ese registro'



      if(!/[A-Za-z]/.test(this.form.value.maqu_Descripcion))
      {

      }
      
      if (this.form.valid){

        const Maquinaria: any = {  
          maqu_Id: this.id,
          maqu_Descripcion: this.form.value.maqu_Descripcion.trim(),
          maqu_UltimoPrecioUnitario : this.form.value.maqu_UltimoPrecioUnitario,
          nive_Id: this.form.value.nive_Id,
          unme_Identificador:  this.form.value.unme_Identificador,
          nive_Descripcion: this.form.value.nive_Descripcion,
          usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
          usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
          };

          if(maquinaria != 'no existe ese registro' )
          {
            this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom' , detail: 'Ya existe una maquinaria con ese nombre.', life: 3000 });
          }

          else{
            if (this.identity != "editar"){
              this.service.Insertar(Maquinaria).subscribe(
                (respuesta: Respuesta) => {
                  if (respuesta.success) {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom' , detail: 'Insertado con Éxito.', life: 3000 });
                    this.Listado();
                    this.CerrarMaquinaria();
                  } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom' , detail: 'Insertado fallido', life: 3000 });
                  
                  }
                }
              );
            }
            else {
              this.MaquinariaFromEditar = Maquinaria;
              this.detalle_maqu_Descripcion = this.form.value.maqu_Descripcion;
              this.Edit = true;
            }
          }
      }
      else {
        this.submitted = true;
       }
      }
      else{
        this.SubmittedDDL = true;
      }
    }

    //Abrir el modal para eliminar maquinaria
    EliminarMaquinaria(){
      this.detalle_maqu_Descripcion = this.selectedMaquinaria.maqu_Descripcion;
      this.id = this.selectedMaquinaria.maqu_Id;
      this.Delete = true;
    }

    //Accion para Eliminar maquinaria
    async  Eliminar (){
      this.Delete = false;
     
   
     try {
      // Llama al servicio para eliminar el proveedor y espera la respuesta
      const response  = await this.service.Eliminar(this.id);
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
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass: 'iziToast-custom' , detail: detail, life: 3000 });
      }else{
        this.toastService.toast(
          Gravedades.success,
          detail
        )
      }

            // Actualiza la lista después de la eliminación
      this.Listado();
  } catch (error) {
      // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
      this.toastService.toast(
        Gravedades.error,
        'Comunicarse con el administrador.'
      )
  }
     
    }

    //Accion de confirmar el editar
    EditarModal (){
    
      this.service.Actualizar(this.MaquinariaFromEditar).subscribe(
        (respuesta: Respuesta) => {
          if (respuesta.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom' , detail: 'Actualizado con Éxito.', life: 3000 });
            this.Listado();
            this.CerrarMaquinaria();
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom' , detail: 'Comuniquese con un administrador', life: 3000 });
          }
        }
      );
      this.Edit = false;
    }

    //regex para validar que no se puedan ingresar letras ni alfanumericos
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
    }

  
    //regex para validar que no se puedan ingresar numeros ni alfanumericos, pero sí tildes
    ValidarTexto(event: KeyboardEvent) {
      const inputElement = event.target as HTMLInputElement;
      const key = event.key;
      if (!/^[a-zñA-ZÀ-ÿ\u00f1\u00d1 ]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
          event.preventDefault();
      }
      if (key === ' ' && inputElement.selectionStart === 0) {
        event.preventDefault();
      }
    }
    
    //regex para validar que solo se puedan ingresar letras y numeros
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

}
