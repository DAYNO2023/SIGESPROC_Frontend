import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { equiposeguridad } from 'src/app/demo/models/modelsproyecto/equiposeguridadviewmodel';
import { equiposeguridadService } from 'src/app/demo/services/servicesproyecto/equiposeguridad.service';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-equiposeguridad',
  templateUrl: './equiposeguridad.component.html',
  styleUrls: ['./equiposeguridad.component.scss'],
  providers: [MessageService]
})
export class equiposeguridadComponent implements OnInit {
//#region variables
  equiposeguridad: equiposeguridad[] = [];
  items: MenuItem[] = [];
  Index: boolean = true;
  Create: boolean = false;
  Detail: boolean = false;
  Delete: boolean = false;
  Edit: boolean = false; //variable para desplegar el modal de confirmar editar
  form: FormGroup;
  submitted: boolean = false;
  identity: string  = "Crear";
  selectedEquiposeguridad: any;
  isTableLoading: boolean = false;//variable para mostrar el spinner
  loadedTableMessage: string = "";//variable para almacenar el mensaje de carga
  titulo: string = "Nuevo";//variable del titulo de los formularios de editar y crear
  equipodeseguridadeditar: any;//formgroup enviado al modal de editar

  //#region  Detalles
  id: number = 0;
  Datos = [{}];//arreglo que almacena las auditorias del detalle
  Descripcion: string = "";
  detalle_equs_Id: string = "";
  detalle_equs_Nombre: string = "";
  detalle_equs_Descripcion: string = "";
  detalle_usuaCreacion: string = "";
  detalle_usuaModificacion: string = "";
  detalle_FechausuaCreacion: string = "";
  detalle_FechausuaModificacion: string = "";
  //#endregion
 //#endregion
 
  constructor(
    private messageService: MessageService,
    private service: equiposeguridadService,
    public cookieService: CookieService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      equs_Nombre:['', Validators.required],
      
      equs_Descripcion:['', Validators.required],
      
    });
  }

  //acciones que se realizan al momento de iniciar la ejecucion de la pantalla
  ngOnInit(): void {
    const token = this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Comprobar si la URL incluye la ruta correspondiente a `equiposeguridad`
      if (event.urlAfterRedirects.includes('/sigesproc/proyecto/equiposdeseguridad')) {
        this.onRouteChange();
      }
    });
  
  
      this.Listado();
    
    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.Editarquiposeguridad() },
      { label: 'Detalle', icon: 'pi pi-eye', command: () => this.Detallequiposeguridad() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.Eliminarquiposeguridad() },
    ];
  }


  //accion para llenar el listar de la tabla principal
  Listado() {
    this.isTableLoading = true;
    this.service.Listar().subscribe(
      (data: any) => {
        
        this.equiposeguridad = data.map((equiposeguridad: any) => ({
          ...equiposeguridad,
          equs_FechaCreacion: new Date(equiposeguridad.equs_FechaCreacion).toLocaleDateString(),
          equs_FechaModificacion: new Date(equiposeguridad.equs_FechaModificacion).toLocaleDateString(),
          codigo : parseInt(equiposeguridad.codigo),
        }));
        this.isTableLoading = false;
      }),()=>{
        this.isTableLoading = false;//oculta el spinner cuando se cargan los datos y no son 0
      }
  }
  
  //validacion para solo poder insertar texto con o sin tildes
  onRouteChange() {
    // Reinicializa la vista al index
    this.Index = true;
    this.Create = false;
    this.Detail = false;
    this.Delete = false;
    this.Edit = false;
  
    // Limpia el estado de otros elementos del componente
    this.selectedEquiposeguridad = null;
    this.form.reset();
    this.submitted = false;
  }

  //accion de busqueda de la barra de busqueda
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  //accion para guardar los datos de la fila del elemento seleccionado
  selectEquiposeguridad(equiposeguridad: any) {
    this.selectedEquiposeguridad = equiposeguridad;

  }

  //accion para deplegar el formulario de creacion de nuevo equipo de seguridad
  Crearquiposeguridad() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.form.reset();
    this.identity = "crear";
    this.submitted = false;
    this.titulo = "Nuevo";
  }

  //accion para regresar al index
  Cerrarequiposeguridad() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
  }

  //accion de llenado de inputs y desplegado de formulario de editar
  Editarquiposeguridad() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.identity = "editar";
    this.titulo = "Editar";
    this.form.patchValue({
      equs_Nombre: this.selectedEquiposeguridad.equs_Nombre,
      equs_Descripcion: this.selectedEquiposeguridad.equs_Descripcion
    });
    this.id = this.selectedEquiposeguridad.equs_Id;
  }

  //llenado y desplegado del detalles 
  Detallequiposeguridad() {
    this.Index = false;
    this.Create = false;
    this.Detail = true;
    this.detalle_equs_Id = this.selectedEquiposeguridad.codigo;
    this.detalle_equs_Nombre = this.selectedEquiposeguridad.equs_Nombre;
    this.detalle_equs_Descripcion = this.selectedEquiposeguridad.equs_Descripcion;
    this.detalle_usuaCreacion = this.selectedEquiposeguridad.usuaCreacion;
    if (this.selectedEquiposeguridad.usuaModificacion != null) {
      this.detalle_usuaModificacion = this.selectedEquiposeguridad.usuaModificacion;
      this.detalle_FechausuaModificacion = this.selectedEquiposeguridad.equs_FechaModificacion;
    
    }else{
      this.detalle_usuaModificacion = "";
      this.detalle_FechausuaModificacion = "";
    }
    
    this.detalle_FechausuaCreacion = this.selectedEquiposeguridad.equs_FechaCreacion;
    }

  //accion que abre el modal de confirmacion de eliminar
  Eliminarquiposeguridad() {
    this.id = this.selectedEquiposeguridad.equs_Id;
    this.Descripcion = this.selectedEquiposeguridad.equs_Nombre
    this.Delete = true;
  }

  //accion de envio de datos de formulario de creacio o edicion al backend o a la accion de editar
  Guardar() {    
    if (this.form.valid) {
      const equiposeguridad: any = {       
        equs_Id: this.id,
        equs_Nombre: this.form.value.equs_Nombre,
        equs_Descripcion: this.form.value.equs_Descripcion,
        usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
      };

      if (this.titulo === "Nuevo") {
        this.service.Insertar(equiposeguridad).subscribe(
          (respuesta: Respuesta) => {
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass: 'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
              this.Listado();
              this.Cerrarequiposeguridad();
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error',  styleClass: 'iziToast-custom', detail: 'Comuniquese con un administrador.', life: 3000 });
            }
          }
        );
      } else {
        this.equipodeseguridadeditar = equiposeguridad;
        this.Edit = true;
        this.Descripcion = this.form.value.equs_Nombre
      }
    } else {
      this.submitted = true;
    }
  }


  //accion de eliminar al confirmar en el modal
  Eliminar() {  
   // Inicializa variables para el mensaje del servicio
   let severity = 'error';
   let summary = 'Error';
   try{
    this.service.Eliminar(this.id).subscribe(
      (respuesta: Respuesta) => {
        let detail = respuesta.data.messageStatus;
        if (respuesta.code === 200) {
          // Si la eliminación fue exitosa o hay una advertencia
          severity = respuesta.data.codeStatus > 0 ? 'success' : 'warn';
          summary = respuesta.data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
          
        } else if (respuesta.code === 500){
          // Si hubo un error interno
          severity = 'error';
          summary = 'Error Interno';
        }
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
      // Reinicia el componente
  }
  
  //accion de editar al confirmar en el modal
  EditarG(){
    this.service.Actualizar(this.equipodeseguridadeditar).subscribe(
      (respuesta: Respuesta) => {
        if (respuesta.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass: 'iziToast-custom', detail: 'Actualizado con Éxito.', life: 3000 });
          this.Listado();
          this.Cerrarequiposeguridad();
        } else {
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
