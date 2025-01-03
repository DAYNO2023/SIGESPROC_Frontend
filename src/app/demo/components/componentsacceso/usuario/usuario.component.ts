
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { autocompleteEmpleado, Usuario } from 'src/app/demo/models/modelsacceso/usuarioviewmodel';
import { UsuarioService } from 'src/app/demo/services/servicesacceso/usuario.service';
import { Rol } from 'src/app/demo/models/modelsacceso/rolviewmodel';
import { RolService } from 'src/app/demo/services/servicesacceso/rol.service';
import { isInt } from '@fullcalendar/core/internal';
import { CookieService } from 'ngx-cookie-service';
import { invalid } from 'moment';
import { isEmpty } from 'lodash';
import { filter } from 'rxjs';


export function roleIdValidator(control: AbstractControl): ValidationErrors | null {
  if (control.value && control.value.trim() !== '') {

    return { 'invalidRoleId': true }; // El campo tiene texto, lo consideramos inválido
  }
  return null; // Si el campo está vacío, es válido
}
const passwordPattern: RegExp = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/;
function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const valid = passwordPattern.test(control.value);
    return valid ? null : { invalidPassword: true };
  };
}
@Component({
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss',
  providers: [MessageService]
})




export  class UsuarioComponent implements OnInit {
  Usuario: Usuario[] = [];
  items: MenuItem[] = [];
  Index: boolean = true;
  Create: boolean = false;
  Detail: boolean = false;
  Delete: boolean = false;
  form: FormGroup;
  formObservacion: FormGroup;
  submitted: boolean = false;
  identity: string  = "Crear";
  selectedUsuario: any;
  id: number = 0;
  titulo: string = "Nuevo"
  contra: boolean = true;
  usuario: boolean = true;
  isTableLoading: boolean = false;
  editarUsuarioDialog: boolean = false;
  //Dropdowns
  roles: Rol[] | undefined;

  filteredRoles: any[] = [];
  selectedRol: string = "";
  empleadosBuscar: autocompleteEmpleado[] | undefined;
  empleados: autocompleteEmpleado[] | undefined;
  filtradoEmpleado: autocompleteEmpleado[] = [];
  //Detalles
  Datos = [{}];
  detalle_Codigo : string  = "";
  detalle_Usuario: string  = "";
  detalle_Administrador: string  = "";
  detalle_Observacion: string  = "";
  detalle_Rol: string  = "";
  detalle_Estado: string  = "";
  detalle_Empleado: string  = "";
  detalle_usuaCreacion: string  = "";
  detalle_usuaModificacion: string  = "";
  detalle_FechausuaCreacion: string  = "";
  detalle_FechausuaModificacion: string  = "";
  selectedProduct: any;
  reestableceerModal: boolean = false;
  textoDialogActivarDesactivar: string = "";

  loading: boolean= true;
  //Ocultar rol si es administrador
  Admin: boolean = true;

  //ErrorAutoCompletes
  Error_Rol: string = "El campo es requerido."
  Error_Usuario: string = "El campo es requerido."



  RolValidar: ValidationErrors | null




  private actionItemsCache = new Map();

  constructor(
    private messageService: MessageService,
    private serviceDropRoles: RolService,
    private service: UsuarioService,
    private router: Router,
    private fb: FormBuilder,
    public cookieService: CookieService,
  ) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/acceso/usuario')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
    this.form = this.fb.group({
      usua_Usuario: ['', Validators.required],
      usua_Clave: ['', [
        Validators.required,       // El campo es obligatorio
        Validators.minLength(8),    // Al menos 8 caracteres
        passwordValidator()         // Validación personalizada (mayúscula, número, carácter especial)
      ]],
      usua_EsAdministrador: [false],
      role_Descripcion: ['',],
      empleado: ['', Validators.required],
    });
    this.formObservacion = this.fb.group({
      Observacion: ['', Validators.required],
    });
  }
  onRouteChange(): void {
    this.ngOnInit();
  }
  ngOnInit(): void {
    this.Usuario = [];
    this.Index = true;
    this.Create = false;
    this.Detail = false;
    this.Delete = false;
    this.id = 0;

  
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
  
    this.Listado();
    this.ListarRoles();
    this.ListarEmpleados();
    // this.items = [
    //    { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarUsuario() },
    //  { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleUnidadMedida() },
    //  { label: 'Activar', icon: 'pi pi-lock-open', command: (event) => this.EliminarUsuario() },
    //    { label: 'Reestablecer', icon: 'pi pi-cog', command: (event) => this.ReestablecerUsuario() },
    //  ];


  }

  generarModelSplitButton(usuario){
    if (!this.actionItemsCache.has(usuario)) {
      const items = [


      ];

      // Verificar si el usuario es admin para agregar el botón "Restablecer"
      if (this.cookieService.get('usua_Admin') === 'true') {
        items.push({ label: 'Editar', icon: 'pi pi-user-edit', command: () => this.EditarUsuario() });
        items.push( { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleUnidadMedida() },);
        items.push({ label: 'Restablecer', icon: 'pi pi-cog', command: () => this.ReestablecerUsuario() });
        items.push( { label: usuario.usua_Estado ? 'Desactivar' : 'Activar', icon: usuario.usua_Estado ? 'pi pi-lock' : 'pi pi-lock-open', command: () => this.EliminarUsuario(usuario) });
      }else
      {
        items.push( { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleUnidadMedida() },);
      }

      this.actionItemsCache.set(usuario, items);
    }
    return this.actionItemsCache.get(usuario);
  }

  ListarEmpleados() {
    this.service.ListarEmpleados().subscribe(
      (Empleado: autocompleteEmpleado[]) => {
        // Asumiendo que `this.Usuario` es un array de objetos que contienen `empl_Id` y `usua_Estado`
        const usuariosActivos = this.Usuario.filter(usuario => usuario.usua_Estado == true).map(usuario => usuario.empl_Id);

        // Filtrar empleados que no estén relacionados con un `empl_Id` de usuarios activos
        this.empleadosBuscar = Empleado
         this.empleados = Empleado
        .filter(empleado => !usuariosActivos.includes(empleado.empl_Id))
        .sort((a, b) => a.empleado.localeCompare(b.empleado)); // Ordenar alfabéticamente por el campo `nombre`


      }
    );
  }
  ListarRoles() {
    this.serviceDropRoles.Listar().subscribe(
      (roles: Rol[]) => {
        this.roles = roles.sort((a, b) => a.role_Descripcion.localeCompare(b.role_Descripcion));


      }
    );
  }
  async Listado() {
    this.loading = true;
    await this.service.Listar().then(
      (data: any) => {

        this.Usuario = data.map((Usuario: any) => ({
          ...Usuario,
          usua_FechaCreacion: new Date(Usuario.usua_FechaCreacion).toLocaleDateString(),
          usua_FechaModificacion: new Date(Usuario.usua_FechaModificacion).toLocaleDateString(),
          usua_EsAdministrador: Usuario.usua_EsAdministrador ? 'Si' : 'No',
          codigo: parseInt(Usuario.codigo),
        }));
        this.loading = false;
      }
    );
  }

  filterEmpleado(event: any) {
    const query = event.query.toLowerCase();
    this.filtradoEmpleado = this.empleados.filter(empleado =>
      empleado.empleado.toLowerCase().includes(query)
    );
  }
  filterRol(event: any){
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.roles.length; i++) {
      const rol = this.roles[i];

      if (rol.role_Descripcion.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(rol.role_Descripcion);
      }
    }

    this.filteredRoles = filtered;
  }
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  onEmpleadoSelect(event: any) {
    const empleadoSeleccionado = event;
    this.form.patchValue({ empleado:empleadoSeleccionado.value.empleado});
  }

  onRolSelect(event: any) {
    const RolSeleccionado = event;
    this.form.patchValue({ rol_Descripcion:RolSeleccionado.value.rol_Descripcion});
  }

  selectUsuario(usuario: any) {
    this.selectedUsuario = usuario;
  }


  CrearUsuario() {
    this.contra = true;
    this.usuario = true;
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.Admin = true;
    this.form.reset();
    this.selectedRol = null;
    this.form.patchValue({
      usua_EsAdministrador: false,
    });
    this.identity = "crear";
    this.titulo= "Nuevo"
  }
  CerrarUsuario() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
  }

  esAdmin(event){
      if(event.checked){
        this.Admin = false;
         this.form.patchValue({
          role_Descripcion: 'Administrador',
         });
     
      }else{
         this.form.patchValue({
          role_Descripcion: '',
        });
        this.Admin = true;
        this.submitted = false;
      }
  }


  EditarUsuario() {
    this.detalle_Usuario = this.selectedUsuario.usua_Usuario;

    this.usuario = true;
    this.contra = false;
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.Admin = true;
    this.identity = "editar";
    this.titulo= "Editar"

    let check = false;

    if (this.selectedUsuario.usua_EsAdministrador == "Si") {
        check = true;
        this.Admin = false;
        this.form.patchValue({
          usua_Usuario: this.selectedUsuario.usua_Usuario,
          usua_Clave: "AAaa404%_afafagga",
          role_Descripcion: "",
          usua_EsAdministrador: check,
          empleado: this.selectedUsuario.empleado,
        });
    }else{
        this.selectedRol = this.selectedUsuario.role_Descripcion;
        this.form.patchValue({
          usua_Usuario: this.selectedUsuario.usua_Usuario,
          usua_Clave: "AAaa404%_afafagga",
          role_Descripcion: this.selectedUsuario.role_Descripcion,
          usua_EsAdministrador: check,
          empleado: this.selectedUsuario.empleado,
        });
    }



    this.id = this.selectedUsuario.usua_Id;
  }

  ReestablecerUsuario() {
    this.usuario = false;
    this.contra = true;
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.Admin = false;
    this.detalle_Usuario = this.selectedUsuario.usua_Usuario;
    this.identity = "reestablecer";
    this.titulo= "Restablecer contraseña"
    this.form.reset()
    this.id = this.selectedUsuario.usua_Id;
    this.submitted = false;
  }


  DetalleUnidadMedida(){
  
    this.Index = false;
    this.Create = false;
    this.Detail = true;
    this.detalle_Codigo = this.selectedUsuario.codigo;
    this.detalle_Usuario = this.selectedUsuario.usua_Usuario;
    this.detalle_Empleado = this.selectedUsuario.empleado;
    this.detalle_Observacion = this.selectedUsuario.usua_ObservacionInactivar;
    this.detalle_Administrador = this.selectedUsuario.usua_EsAdministrador;
    this.detalle_Rol = this.selectedUsuario.role_Descripcion;
    this.detalle_Estado = this.selectedUsuario.usua_Estado ? "Activo" : "Inactivo";
    this.detalle_usuaCreacion = this.selectedUsuario.usuaCreacion;
    if (this.selectedUsuario.usuaModificacion != null) {
      this.detalle_usuaModificacion = this.selectedUsuario.usuaModificacion;
      this.detalle_FechausuaModificacion = this.selectedUsuario.usua_FechaModificacion;

    }else{
      this.detalle_usuaModificacion = "";
      this.detalle_FechausuaModificacion = "";
    }

    this.detalle_FechausuaCreacion = this.selectedUsuario.usua_FechaCreacion;
 
    }

    EliminarUsuario(usuario){

        this.detalle_Usuario = this.selectedUsuario.usua_Usuario;
        this.textoDialogActivarDesactivar = usuario.usua_Estado ? 'desactivar' : 'activar'
        this.id = this.selectedUsuario.usua_Id;
        this.Delete = true;


   }


  Guardar() {
    if (this.identity == "reestablecer") {
      if (this.form.value.usua_Clave != null) {
        let check = false;
        if (this.selectedUsuario.usua_EsAdministrador == "Si") {
          check = true;
        }
        this.form.patchValue({
          usua_Usuario: this.selectedUsuario.usua_Usuario,
          role_Descripcion: this.selectedUsuario.role_Descripcion,
          usua_EsAdministrador: check,
          empleado: this.selectedUsuario.empleado
        });
        this.identity = 'rees';
        this.reestableceerModal = true;
        return;
      }else{
        this.submitted = true;
        return;
      }

    }



    //Traer el id del rol y validar si existe.
    let idRol = this.roles.find(rol => rol.role_Descripcion === this.form.value.role_Descripcion)?.role_Id ?? 0;
    //Si es diferente a 0 le declaramos que no tendra ninguna validacion
  
    if (idRol !== 0) {
      this.form.get('role_Descripcion')?.setErrors(null);
      //De lo contrario le decimos si esta vacio para ver decirle que el campo es requerido
    } else if(this.form.value.role_Descripcion == ""  || this.form.value.role_Descripcion == null && this.Admin != false){
      //Puede ser cualquier texto el invalidRoleId
      this.Error_Rol = "El campo es requerido."
      this.form.get('role_Descripcion')?.setErrors({ 'invalidRoleId': true });
      //Si no es ninguna de las dos es por que tiene texto, pero no existe la opcion
    }else {
      //Puede ser cualquier texto el invalidRoleId
      this.Error_Rol = "Opción no encontrada."
      this.form.get('role_Descripcion')?.setErrors({ 'invalidRoleId': true });
    }

      //Si es admin ignora la validacion
      if (this.Admin == false) {
        idRol = 1
        this.form.get('role_Descripcion')?.setErrors(null);
      }

    let idEmpleado = this.empleadosBuscar.find(rol => rol.empleado === this.form.value.empleado)?.empl_Id ?? 0;

    if (idEmpleado !== 0) {
      this.form.get('empleado')?.setErrors(null);
    } else if(this.form.value.empleado == "" || this.form.value.empleado == null) {
      this.Error_Usuario = "El campo es requerido."
      this.form.get('empleado')?.setErrors({ 'invalidEmpleadoId': true });
    }else {

      this.Error_Usuario = "Opción no encontrada."
      this.form.get('empleado')?.setErrors({ 'invalidEmpleadoId': true });
    }



    if (this.form.valid) {
            const UsuarioViewModel: any = {
            Usua_Id: this.id,
            usua_Usuario: this.form.value.usua_Usuario,
            usua_Clave: this.form.value.usua_Clave,
            usua_EsAdministrador: this.form.value.usua_EsAdministrador,
            //Asiganmos la id que encontro de empleado y rol si son validos
            role_Id: idRol,
            empl_Id:  idEmpleado,
            usua_Creacion:parseInt(this.cookieService.get('usua_Id')),
            usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
            };



          if (this.identity == "crear") {
            this.service.Insertar(UsuarioViewModel).subscribe(
              (respuesta: Respuesta) => {
              
                if (respuesta.success) {
                  this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
                  this.Listado();
                  this.CerrarUsuario();
                  this.submitted = false;
                } else {
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El usuario ya existe.', life: 3000,styleClass:'iziToast-custom' });
          

                }
              }
            );
          }else if (this.identity == "editar"){

            if (this.editarUsuarioDialog) {
              this.editarUsuarioDialog = false;

              this.service.Actualizar(UsuarioViewModel).subscribe(
                (respuesta: Respuesta) => {
                 
                  if (respuesta.success) {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000,styleClass:'iziToast-custom' });
                    this.Listado();
                    this.CerrarUsuario();
                  } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El usuario ya existe.', life: 3000,styleClass:'iziToast-custom' });
               
                  }
                }
              );

            }else{
              this.editarUsuarioDialog = true;
            }

          }else{
            this.service.Reestablecer(UsuarioViewModel).subscribe(
              (respuesta: Respuesta) => {
              
                if (respuesta.success) {
                  this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Reestablecido con Éxito.', life: 3000,styleClass:'iziToast-custom' });
                  this.Listado();
                  this.reestableceerModal = false
                  this.CerrarUsuario();
                   this.submitted = false;
                } else {
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000,styleClass:'iziToast-custom' });
                 
                }
              }
            );
          }

    } else {
     this.submitted = true;
    }

   
  }

  Eliminar(textoDialogActivarDesactivaro: string) {
 
    if(this.formObservacion.valid){
    this.service.Eliminar(this.id,this.formObservacion.value.Observacion).subscribe(
      (respuesta: Respuesta) => {
        if (respuesta.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `${textoDialogActivarDesactivaro == 'Activar' ? 'Activado':'Desactivado'} con Éxito.`, life: 3000,styleClass:'iziToast-custom' });
          this.Listado();
          this.formObservacion.reset();
          this.submitted = false
          this.Delete = false;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000,styleClass:'iziToast-custom' });
          this.Delete = false;
        }
      }
    ); }else{
      this.submitted = true;
    }


  }


  allowUsuarios(event: any) {
    // Expresión regular ajustada para bloquear los espacios y caracteres no permitidos
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ._-]/g, '');
  }

  allowContra(event: any) {
    // Obtiene el valor del campo de entrada
    const inputValue = event.target.value;

    // Si el primer carácter es un espacio, lo elimina
    if (inputValue.charAt(0) === ' ') {
      event.target.value = inputValue.slice(1); // Elimina el espacio inicial
    }

    // Expresión regular para eliminar caracteres no permitidos
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, '');
  }



  allowObservacion(event: any) {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');
  }

}


