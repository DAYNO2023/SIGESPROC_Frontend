import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { estadoproyecto } from 'src/app/demo/models/modelsproyecto/estadoproyectoviewmodel';
import { estadoproyectoService } from 'src/app/demo/services/servicesproyecto/estadoproyecto.service';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-estadoproyecto',
  templateUrl: './estadoproyecto.component.html',
  styleUrl: './estadoproyecto.component.scss',
  providers: [MessageService]
})
export class estadoproyectoComponent implements OnInit {
//#region variables
  estadoproyecto: estadoproyecto[] = [];
  items: MenuItem[] = [];
  Index: boolean = true;
  Create: boolean = false;
  Detail: boolean = false;
  Delete: boolean = false;
  Edit: boolean = false;//variable para abrir el modal de editar
  form: FormGroup;
  submitted: boolean = false;
  isTableLoading: boolean = false;//variable para mostrar el spinner
  loadedTableMessage: string = "";//variable para almacenar el mensaje de carga
  selectedEstadoproyecto: any;
  id: number = 0;
  titulo: string = "Nuevo";
  editarformguardar: any; //variable para guardar el formulario de envio de datos en el guardar

  //#region Detalle
  Datos = [{}];
  Descripcion: string = "";
  detalle_espr_Id: string = "";
  detalle_espr_Descripcion: string = "";
  detalle_usuaCreacion: string  = "";
  detalle_usuaModificacion: string  = "";
  detalle_FechausuaCreacion: string  = "";
  detalle_FechausuaModificacion: string  = "";
 //#endregion
//#endregion 
  constructor(
    private messageService: MessageService,
    private service: estadoproyectoService,
    public cookieService: CookieService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      espr_Descripcion: ['', Validators.required],
    });
  }

  //acciones que se realizan al incio de la ejecucion de la pantalla
  ngOnInit(): void {
    const token = this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Verificar si la URL actual incluye '/sigesproc/estadoproyecto/estadoproyecto'
      if (event.urlAfterRedirects.includes('/sigesproc/proyecto/estadosdeproyecto')) {
        this.onRouteChange();
      }
    });
      this.isTableLoading = true;
      this.Listado();
    
    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.Editarestadoproyecto() },
      { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.Detalleestadoproyecto() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.Eliminarestadoproyecto() },
    ];
  }
  onRouteChange() {
    // Reinicializa la vista al índice
    this.Index = true;
    this.Create = false;
    this.Detail = false;
    this.Delete = false;
    this.Edit = false;
  
    // Limpia otros estados del componente
    this.selectedEstadoproyecto = null;
    this.form.reset();
    this.submitted = false;
  
  }
  //Accion de llenado del listado de la tabla principal
  Listado() {
    this.service.Listar().subscribe(
      (data: any) => {
        this.estadoproyecto = data.map((estadoproyecto: any) => ({
          ...estadoproyecto,
          espr_FechaCreacion: new Date(estadoproyecto.espr_FechaCreacion).toLocaleDateString(),
          espr_FechaModificacion: new Date(estadoproyecto.espr_FechaModificacion).toLocaleDateString(),
          codigo : parseInt(estadoproyecto.codigo)

        }));
        this.isTableLoading = false;
      }),()=>{
        this.isTableLoading = false;//oculta el spinner cuando se cargan los datos y no son 0

      };
  }
  
  //Accion que valida que solo se pueda escribir letras con o sin tildes
  validarTexto(event: KeyboardEvent) {
    const texto = (event.target as HTMLInputElement).value;
    const cursorPosition = (event.target as HTMLInputElement).selectionStart;

    if (!/^[a-zñA-ZÀ-ÿ\u00f1\u00d1 ]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        event.preventDefault();
    } else if (event.key === ' ' && (texto.trim() === '' || cursorPosition === 0)) {
        event.preventDefault();
    }
}
  
  //Accion que habilita la barra de busqueda en el index
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  //Accion que llena los datos de la fila del campo selecionado
  selectEstadoproyecto(estadoproyecto: any) {
    this.selectedEstadoproyecto = estadoproyecto;
  }

  //Accion que despliega el formulario de creacion
  Crearestadoproyecto() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.form.reset();
    this.submitted = false;
    this.titulo = "Nuevo";
  }

  //Accion que pliega de nuevo acciondes deplegadas
  Cerrarestadoproyecto() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
  }

  //Accion que despliega el fomrulario de edicion y llena los campos del mismo
  Editarestadoproyecto() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.titulo = "Editar";
    this.form.patchValue({
      espr_Descripcion: this.selectedEstadoproyecto.espr_Descripcion
    });
        this.id = this.selectedEstadoproyecto.espr_Id;
  }

  //Accion que despliega y llena los detalles del estado de proyecto
  Detalleestadoproyecto() {
    this.Index = false;
    this.Create = false;
    this.Detail = true;
    this.detalle_espr_Id = this.selectedEstadoproyecto.codigo;
    this.detalle_espr_Descripcion = this.selectedEstadoproyecto.espr_Descripcion;
    this.detalle_usuaCreacion = this.selectedEstadoproyecto.usuaCreacion;
    if (this.selectedEstadoproyecto.usuaModificacion != null) {
      this.detalle_usuaModificacion =this.selectedEstadoproyecto.usuaModificacion;
      this.detalle_FechausuaModificacion = this.selectedEstadoproyecto.espr_FechaModificacion;
    
    }else{
      this.detalle_usuaModificacion = "";
      this.detalle_FechausuaModificacion = "";
    }
    
    this.detalle_FechausuaCreacion = this.selectedEstadoproyecto.espr_FechaCreacion;
    }
  
  //Accion que abre el modal de confirmacion de eliminar
  Eliminarestadoproyecto() {
    this.id = this.selectedEstadoproyecto.espr_Id;
    this.Delete = true;    
    this.Descripcion = this.selectedEstadoproyecto.espr_Descripcion

  }



  //Accion que envia los datos del formulario al backend o a la accion de editar
  Guardar() {    
    if (this.form.valid) {
      const estadoproyecto: any = {       
        espr_Id: this.id,
        espr_Descripcion: this.form.value.espr_Descripcion,
        usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
      };

      if (this.titulo === "Nuevo") {
        this.service.Insertar(estadoproyecto).subscribe(
          (respuesta: Respuesta) => {
            if (respuesta.data.codeStatus == 1) {
              this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass: 'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
              this.Listado();
              this.Cerrarestadoproyecto();
            } else  if (respuesta.data.codeStatus == 2) {
              this.messageService.add({ severity: 'error', summary: 'Error',  styleClass: 'iziToast-custom', detail: 'El estado ya existe.', life: 3000 });
            }
            else {
              this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'Comuniquese con un Administrador.', life: 3000 });
            }
          }
        );
      } else {
        this.editarformguardar = estadoproyecto
        this.Descripcion =  this.form.value.espr_Descripcion
        this.Edit = true;
      }
      
    } else {
      this.submitted = true;
    }
  }

  //Accion de eliminar
  Eliminar() {  
  try{
    // Inicializa variables para el mensaje del servicio
    let severity = 'error';
    let summary = 'Error';
    
    this.service.Eliminar(this.id).subscribe( //ejecucion del servicio eliminar
      (respuesta: Respuesta) => {
      let detail = respuesta.data.messageStatus;
        if (respuesta.code === 200) {
       // Si la eliminación fue exitosa o hay una advertencia
       severity = respuesta.data.codeStatus > 0 ? 'success' : 'warn';
       summary = respuesta.data.codeStatus > 0 ? 'Éxito' : 'Advertencia';

        } else if (respuesta.code == 500) {
          // Si hubo un error interno
          severity = 'error';
          summary = 'Error Interno';

        }
           
          // Añade el mensaje de estado al servicio de mensajes
         this.messageService.add({
          severity,
          summary,
          styleClass: 'iziToast-custom',
          detail,
          life: 3000
          });
          this.Listado();

      }
    );
  this.Listado();
}
  catch (error) {
    // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
    this.messageService.add({
        severity: 'error',
        summary: 'Error Externo',
        styleClass: 'iziToast-custom',
        detail: error.message || error,
        life: 3000
    });
    this.Listado();

  }
  this.Delete = false;
  }
  
  //Accion de envio de datos del formulario de editar
  EditarG(){
    this.service.Actualizar(this.editarformguardar).subscribe(
      (respuesta: Respuesta) => {
        if (respuesta.data.codeStatus == 1) {
          this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass: 'iziToast-custom', detail: 'Actualizado con Éxito.', life: 3000 });
          this.Listado();
          this.Cerrarestadoproyecto();
        } else if (respuesta.data.codeStatus == 2) {
          this.messageService.add({ severity: 'error', summary: 'Error',  styleClass: 'iziToast-custom', detail: 'El estado ya existe.', life: 3000 });
        }
        else {
          this.messageService.add({ severity: 'error', summary: 'Error',  styleClass: 'iziToast-custom', detail: 'Comuniquese con un Administrador.', life: 3000 });
        }
      }
    );
    this.Edit = false;
  }


  handleInput(event: Event, controlName: string) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    inputElement.value = texto
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '') 
        .replace(/\s{2,}/g, ' ') 
        .replace(/^\s/, ''); 

    this.form.controls[controlName].setValue(inputElement.value);
}

}