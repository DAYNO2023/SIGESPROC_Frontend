import { Component, OnInit } from '@angular/core'; //n
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { autocompleteEmpleado, Usuario } from 'src/app/demo/models/modelsacceso/usuarioviewmodel';
import { UsuarioService } from 'src/app/demo/services/servicesacceso/usuario.service';
import { Rol } from 'src/app/demo/models/modelsacceso/rolviewmodel';
import { RolService } from 'src/app/demo/services/servicesacceso/rol.service';
import { i, log } from 'mathjs';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
  providers: [MessageService]
})
export class PerfilComponent implements OnInit {
  Usuario: Usuario[] = [];
  items: MenuItem[] = [];
  Index: boolean = true;
  Create: boolean = false;
  Detail: boolean = false;
  Delete: boolean = false;
  form: FormGroup;
  submitted: boolean = false;
  identity: string = "Crear";
  selectedUsuario: Usuario;
  id: number = 3;
  Correo: boolean = true;
  titulo: string = "Nuevo Correo";
  contra: boolean = false;
  editarUsuarioDialog: boolean = false;
  roles: Rol[] | undefined;
  filteredRoles: any[] = [];
  selectedRol: string = "";
  empleados: autocompleteEmpleado[] | undefined;
  filtradoEmpleado: autocompleteEmpleado[] = [];
  Datos = [{}];
  detalle_Codigo: string = "";
  detalle_Usuario: string = "";
  detalle_Administrador: string = "";
  detalle_Rol: string = "";
  detalle_Estado: string = "";
  detalle_Empleado: string = "";
  detalle_usuaCreacion: string = "";
  detalle_usuaModificacion: string = "";
  detalle_FechausuaCreacion: string = "";
  detalle_FechausuaModificacion: string = "";
  selectedProduct: any;
  textoDialogActivarDesactivar: string = "";
  Admin: boolean = true;
  private actionItemsCache = new Map();

  constructor(
    private messageService: MessageService,
    private serviceDropRoles: RolService,
    private service: UsuarioService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      empl_CorreoElectronico: ['', Validators.required],
      usua_Clave: [''], // Agregué el campo de la clave
    });
  }

  ngOnInit(): void {
    this.Listado();
    this.Correo = false;
  }

  Listado() {
    this.service.UsuarioBuscar(this.id).subscribe(
      (response: any) => {
        if (response.success && response.data) {
          this.Usuario = Array.isArray(response.data) ? response.data : [response.data];
          console.log('Usuario cargado:', this.Usuario);
        } else {
          console.error('Error en la respuesta o datos:', response);
          this.Usuario = [];
        }
      },
      error => {
        console.error('Error en la petición:', error);
      }
    );
  }

  CloseDialog() {
    this.Correo = false;
    this.submitted = false;
    this.form.reset();
  }

  EditarUsuario() {
    this.contra = false;
    this.Correo = true;
    this.titulo = "Nuevo Correo";
    this.form.patchValue({
      empl_CorreoElectronico: this.selectedUsuario.empl_CorreoElectronico,
    });

    this.id = this.selectedUsuario.usua_Id;
  }

  ReestablecerUsuario() {
    
    if(this.contra == true){
      this.contra = true;
      document.getElementById("empl_CorreoElectronico").hidden;
    }

    this.Correo = true; // Habilitar el formulario para restablecer la contraseña
    this.titulo = "Reestablecer contraseña";
    this.form.reset(); // Restablecer el formulario

    this.form.patchValue({
      empl_CorreoElectronico: this.selectedUsuario.empl_CorreoElectronico, // Si necesitas mostrar el correo también
    });

    this.id = this.selectedUsuario.usua_Id;
    this.submitted = false;
  }

  GuardarCorreo() {
    if (this.form.valid) {
      const datosUsuario: any = {
        empl_CorreoElectronico: this.form.value.empl_CorreoElectronico,
      };

      const datosClave: any = {
        Usua_Id: this.id,
        usua_Clave: this.contra ? this.form.value.usua_Clave : undefined, // Enviar la clave si está en modo restablecer    
      }; 

     console.log(this.form.value.empl_CorreoElectronico , "correo");
   
      if (this.contra) { // Verificar si es restablecer
        this.service.Reestablecer(datosClave).subscribe(
          (respuesta: Respuesta) => {
            console.log(respuesta);
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña restablecida con éxito.', life: 3000 });
              this.Listado();
              this.CloseDialog();
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000 });
              console.log('RESPONSE:' + respuesta.success);
            }
          }
        );
      } else {
        this.service.ReestablecerCorreo(this.id, datosUsuario.empl_CorreoElectronico).subscribe(
          (respuesta: Respuesta) => {
            console.log(respuesta);
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Correo actualizado con éxito.', life: 3000 });
              this.Listado();
              this.CloseDialog();
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El usuario ya existe.', life: 3000 });
              console.log('RESPONSE:' + respuesta.success);
            }
          }
        );
      }
    } else {
      this.submitted = true;
    }
  }
}
