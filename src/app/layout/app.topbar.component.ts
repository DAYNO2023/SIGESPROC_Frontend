import { Component, ElementRef, NgModule, ViewChild } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AppSidebarComponent } from './app.sidebar.component';
import { NotificacionesService } from '../demo/services/servicesproyecto/notificacion.service';
import { NotificationPushService, NotificacionPush } from '../demo/services/notificacionservice/notificacionpush.Service';
import { NotificationFlutterPushService, NotificacionFlutterPush } from '../demo/services/notificacionservice/notificacionflutter.service';
import { CookieService } from 'ngx-cookie-service';
import { NotificacionAlertaPorUsuario } from '../demo/models/modelsproyecto/notificacionesviewmodel';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { SwPush } from '@angular/service-worker';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { environment } from 'src/environment/environmentnotipush';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { autocompleteEmpleado, Usuario } from 'src/app/demo/models/modelsacceso/usuarioviewmodel';
import { UsuarioService } from 'src/app/demo/services/servicesacceso/usuario.service';
import { Rol } from 'src/app/demo/models/modelsacceso/rolviewmodel';
import { RolService } from 'src/app/demo/services/servicesacceso/rol.service';
import { CommonModule } from "@angular/common"; //no
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ReactiveFormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { RippleModule } from "primeng/ripple";
import { SplitButtonModule } from "primeng/splitbutton";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { ToggleButtonModule } from "primeng/togglebutton";
import { CheckboxModule } from 'primeng/checkbox';
import { tr } from 'date-fns/locale';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PushNotificationService } from '../demo/services/notificacionservice/push-notification.service';
import { NotificacionUpdateService } from 'src/app/demo/services/servicesproyecto/Notificacionactualizar.service'; // Ajusta la ruta según tu proyecto
import { EmpleadoService } from '../demo/services/servicesgeneral/empleado.service';


@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  providers: [MessageService]

})

export class AppTopbarComponent {

  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild('searchinput') searchInput!: ElementRef;
  @ViewChild(AppSidebarComponent) appSidebar!: AppSidebarComponent;
  searchActive: boolean = false;
  notificaciones: NotificacionAlertaPorUsuario[] = [];
  valor: number = 0;
    usuario: number = parseInt(this.cookieService.get('usua_Id'));
  campana: boolean = true;
  visible: boolean = false;
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
  id: number = parseInt(this.cookieService.get('usua_Id'));
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
  modalCorreo: boolean = false;
  modalContra: boolean = false;
  confirm: boolean = false;

  urlHost:string = this.empleadoService.BaseUrl;
  private actionItemsCache = new Map();





  constructor(
    public layoutService: LayoutService,
    public el: ElementRef,
    private service: NotificacionesService,
    public cookieService: CookieService,
    private messageService: MessageService,
    private swPush: SwPush,
    private servicenotificationflutter: NotificationFlutterPushService,
    // private notificationService: NotificationPushService,
    private serviceDropRoles: RolService,
    private usuarioservice: UsuarioService,
    private router: Router,
    private fb: FormBuilder,
    private servicePush: NotificationPushService,
    private sanitizer: DomSanitizer,
    private notificacionUpdateService: NotificacionUpdateService,

    private pushService: PushNotificationService,
    //Inyectamos el servicio de los empleados
    public empleadoService: EmpleadoService,
  ) {
    this.form = this.fb.group({
      empl_CorreoElectronico: ['', Validators.required],
      usua_Clave: [''], // Agregué el campo de la clave
    });
  }



  ngOnInit(): void {
    this.Listado(this.usuario);
    // this.onEventNotifications();
    this.notificacionUpdateService.notificacionesActualizadas$.subscribe(() => {
      this.Listado( parseInt(this.cookieService.get('usua_Id'))); // Llamar a Listado cuando se actualicen las notificaciones
    });
    this.ListadoUsuario();
    this.Correo = false;
    this.pushService.requestPermission();//peticion del permiso al servicio
    this.pushService.receiveMessage();

    const valorGuardado = this.cookieService.get('notificacionesNoLeidas');
    if (valorGuardado) {
        this.valor = parseInt(valorGuardado, 10);
        this.campana = this.valor > 0;
    }
  }


  CerrarSesion(){
    const tokenconsole = this.cookieService.get('Notificacion')

    this.service.EliminarToken(this.usuario, tokenconsole).subscribe(
      (data: any) => {
        if(data.code == 200){
        }
      })

    this.cookieService.set('Token', 'false'); // cookie que guarda el token
    this.cookieService.set('Notificacion', 'false'); // cookie que guarda el token

    const tokenconsolepos = this.cookieService.get('Notificacion')

    this.cookieService.delete('Notificacion');
    //console.log("aja: "+ tokenconsolepos)

    this.router.navigateByUrl('/');
    sessionStorage.clear();
  }
  //#region Perfil

  sanitizarUrl(base64: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(base64);

}


  ListadoUsuario() {
    this.usuarioservice.UsuarioBuscar(this.id).subscribe(
      (response: any) => {
        if (response.success && response.data) {
          this.Usuario = Array.isArray(response.data) ? response.data : [response.data];
        } else {
          this.Usuario = [];
        }
      },
      error => {
      }
    );
  }

  CloseDialog() {
    this.Correo = false;
    this.modalContra = false;
    this.modalCorreo = false;
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

    if (this.contra == true) {
      this.contra = true;
      document.getElementById("empl_CorreoElectronico").hidden;
    }

    this.Correo = true; // Habilitar el formulario para restablecer la contraseña
    this.titulo = "Restablecer contraseña";
    this.form.reset(); // Restablecer el formulario

    this.form.patchValue({
      empl_CorreoElectronico: this.selectedUsuario.empl_CorreoElectronico, // Si necesitas mostrar el correo también
    });

    this.id = this.selectedUsuario.usua_Id;
    this.submitted = false;
  }

  GuardarCorreo() {


    if(this.titulo == 'Nuevo Correo' && !this.modalCorreo){
      this.modalCorreo = true;
      return
    }else if(this.titulo == 'Nuevo Correo' && this.modalCorreo){
      this.confirm = true;
    }


    if(this.titulo == 'Restablecer contraseña' && !this.modalContra){
      this.modalContra = true;
      return
    }else if(this.titulo == 'Restablecer contraseña' && this.modalContra){
      this.confirm = true;
    }


    if (this.form.valid) {
      const datosUsuario: any = {
        empl_CorreoElectronico: this.form.value.empl_CorreoElectronico,
      };

      const datosClave: any = {
        Usua_Id: this.id,
        usua_Clave: this.contra ? this.form.value.usua_Clave : undefined, // Enviar la clave si está en modo restablecer
      };

      //console.log(this.form.value.empl_CorreoElectronico, "correo");

      if (this.contra && this.titulo == "Restablecer contraseña") {
        this.modalContra = true;
        this.modalCorreo = false;
        // Verificar si es restablecer
        this.usuarioservice.Reestablecer(datosClave).subscribe(
          (respuesta: Respuesta) => {
            //console.log(respuesta);
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña restablecida con éxito.', life: 3000 });
              this.ListadoUsuario();
              this.CloseDialog();
              this.modalContra = false;
              this.modalCorreo = false;
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000 });
              //console.log('RESPONSE:' + respuesta.success);
            }
          }
        );
      } else {
        this.modalContra = false;
        this.modalCorreo = true;
        this.usuarioservice.ReestablecerCorreo(this.id, datosUsuario.empl_CorreoElectronico).subscribe(
          (respuesta: Respuesta) => {
            //console.log(respuesta);
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Correo actualizado con éxito.', life: 3000 });
              this.ListadoUsuario();
              this.CloseDialog();
              this.modalContra = false;
              this.modalCorreo = false;
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El usuario ya existe.', life: 3000 });
              //console.log('RESPONSE:' + respuesta.success);
            }
          }
        );
      }
    } else {
      this.submitted = true;
    }
  }

  onMenuButtonClick() {
    this.layoutService.onMenuToggle();
  }

   activateSearch() {
    this.searchActive = true;
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 100);
  }

  deactivateSearch() {
    this.searchActive = false;
  }


  onConfigButtonClick() {
    this.layoutService.showConfigSidebar();
  }

  onSidebarButtonClick() {
    this.layoutService.showSidebar();
  }

  //#endregion
  //#region  envio de notificaciones de prueba
  // sendNotification() {
  //   //console.log("entra al envio")
  //   const token: any[] = [{
  //     "endpoint": "https://wns2-bl2p.notify.windows.com/w/?token=BQYAAAA5%2fJVd%2b2VGWXjzsFdvD1P7zSxIRckqIjePUdg5b9RkIu4xD5MKO8J1IEFkkHIMPJUq03PUnFcAAuVGq60nbD%2fgrP9wyzV1FKQoKybI58F8gQ3QIPrcNNH2FpLLuZ5C%2b9KcH86lnoqW7Pe%2bSpsC0qpoonf7S87s9KXME2LeQsl1yBCYMEQfkk4%2fO65NHnoQccX7ul1kFuEECdVEF3qtp2V4PGUpXpbRHefcC577zNGW6XsFG19U6HuzKmfFo%2fcXOTdUF60qKlOxUe3nBszdvfK7ev9C4VVknb4ewKLHka2Q6QSOX9GjMLH2qkY05nCnVBsbm%2fF3V1bwJR4OOXHixBaL",
  //     "expirationTime": null,
  //     "keys": {
  //       "p256dh": "BI-hHFFdMMr1NQcddsQ03hUKiEON0hDY4rxmcRVlaJRS5iou_Y6JamuRB6ah0ltporxBybNJSfsziz1vjZjvvdo",
  //       "auth": "sP0xa2YtJvKbNtC95b-RNw"
  //     }
  //   },
  //   {
  //     "endpoint": "https://fcm.googleapis.com/fcm/send/etYKrni7BA4:APA91bHpziya43aF_lBsQ-ZTVKLrMZ3XiQ6pHdlNfZOJk7yMCjYruI3yf5NsedbWGBuMlRo6e4qNliDjnrIibbHsPW0XZBtdIMnWct0P74DGTujTu9yptRD20zXNu5kxD4k5Y9ttAooY",
  //     "expirationTime": null,
  //     "keys": {
  //       "p256dh": "BJcYJZdDt2T2SExUua6MoAsUz-WI-xWqquoPkreoLWJM0NxxpqM8o89WvLWjXVSBv0VOjAr10GwkAGTwxx4KsoE",
  //       "auth": "H4ZDKePh_dP9k1zXoJPAYg"
  //     }
  //   }]; // Aquí va el token o los tokens que deseas enviar, actualmente vacío
  //   const payload: NotificacionFlutterPush = {
  //     data: {
  //       title: 'Nuevo mensaje',
  //       body: 'Has recibido un nuevo mensaje',
  //     }
  //   };

  //   this.servicenotificationflutter.createNotification(token, payload).subscribe(
  //     response => {
  //       //console.log('Notificación enviada con éxito', response);
  //     },
  //     error => {
  //       console.error('Error al enviar la notificación', error);
  //     }
  //   );
  // }


  //#endregion

  //#region pwa otro programa (no se utiliza)

  enableNotify() {
    if (this.swPush.isEnabled) {
      try {
        if (Notification.permission != 'granted') {
          this.requestSubscription();
        } else {
          // const isConfirm = confirm("Ya tiene los permisos para notificar. ¿Deseas refrescar el token?");
          // if (isConfirm)
          this.requestSubscription();

          //   const isConfirm = confirm("Ya tiene los permisos para notificar. ¿Deseas refrescar el token?");
          //   if (isConfirm) this.requestSubscription()
        }
      } catch (error: any) {
        alert('No se estableció los permisos para notificar');
      }
    } else {
    }
  }

  validarCorreo() {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(this.form.value.agen_Correo);
}

  unsubscribe() {
    if (this.swPush.isEnabled && Notification.permission == 'granted')
      this.swPush.unsubscribe();
  }

  getToken() {
    if (this.swPush.isEnabled && Notification.permission == 'granted')
      this.swPush.subscription.subscribe((subscription) => {
      });
  }

  private async requestSubscription() {
    const payload = await this.swPush.requestSubscription({ serverPublicKey: environment.publicKey });
    const token = JSON.stringify(payload.toJSON());  // Convertir el token a string JSON
    this.cookieService.set('Notificacion', token); // cookie que guarda el token

    const tokenconsole = this.cookieService.get('Notificacion')

    const modelotoken: any = {
      usua_Id: this.usuario,
      tokn_JsonToken: token
    }

    this.service.InsertarTokens(modelotoken).subscribe(
      (data: Respuesta) => {
      })


    this.onEventNotifications();
    //? Hacer petición para guardar token en el backend
  }

  private onEventNotifications() {
    if (this.swPush.isEnabled && Notification.permission == 'granted') {

      this.swPush.notificationClicks.subscribe((data) => {
        this.messageService.add({ key: 'confirm', sticky: false, severity: '', summary: 'Tienes una nueva notificacion' });
      })

      this.swPush.messages.subscribe((message: any) => {
      });
    }
  }
  //#endregion



  showConfirm() {
    if (!this.visible) {
      this.visible = true;
    }
  }

  onConfirm() {
    this.messageService.clear('confirm');
    this.visible = false;
  }

  onReject() {
    this.messageService.clear('confirm');
    this.visible = false;
  }



Listado(usua_Id: number) {
  this.service.BuscarPorUsuario(usua_Id).subscribe(
      (data: any) => {
          //console.log("notificaciones:");
          //console.log(data);

          this.notificaciones = data.map((notifica: any) => ({
              ...notifica,
              fecha: new Date(notifica.fecha).toLocaleDateString(),
              napu_Ruta: notifica.napu_Ruta ? "#/sigesproc" + notifica.napu_Ruta : "#/sigesproc/Paginaprincipal/Paginaprincipal"
            }));

          // Resetea el valor antes de contar las notificaciones no leídas
          this.valor = 0;

          for (let index = 0; index < data.length; index++) {
              if (data[index].leida === 'No Leida') {
                  this.valor++;
              }
          }

          // Actualiza la campana en base al número de notificaciones no leídas
          this.campana = this.valor > 0;

          // Almacenar en localStorage
         this.cookieService.set('notificacionesNoLeidas', this.valor.toString());

      }
  );
}


leer(napu_Id: number, notificacion: any) {
  //console.log("Marcar como leída la notificación ID:", napu_Id);
  this.service.Leer(napu_Id).subscribe((data: any) => {
      //console.log(data);
      if (data.code == 200) {
          this.valor--;
          this.campana = this.valor > 0;
          notificacion.leida = 'Leida';  // Cambia el estado a 'Leida' para eliminar el resaltado

          // Actualizar el localStorage
          this.cookieService.set('notificacionesNoLeidas', this.valor.toString());

              // Ocultar el menú de notificaciones
      this.cerrarMenuNotificaciones();
      }
  });
}


cerrarMenuNotificaciones() {
  const menuNotificaciones = document.querySelector('.topbar-menu.active-topbar-menu');
  if (menuNotificaciones) {
      menuNotificaciones.classList.add('ng-hidden');
      menuNotificaciones.classList.remove('active-topbar-menu');
  }
}

    cerrarSesion(){
      const tokenconsole = this.cookieService.get('Token')

      this.service.EliminarToken(this.usuario, tokenconsole).subscribe(
        (data: any) => {
          if(data.code == 200){
            //console.log("Éxito")
          }
        })

      this.cookieService.deleteAll()

      // this.cookieService.set('Token', 'false'); 
      // cookie que guarda el token
      const tokenconsolepos = this.cookieService.get('Token')
      // this.cookieService.delete('Token');
      //console.log("aja: "+ tokenconsolepos)
    }
  }

  // activateSearch() {
  //   this.searchActive = true;
  //   setTimeout(() => {
  //     this.searchInput.nativeElement.focus();
  //   }, 100);
  // }

  // deactivateSearch() {
  //   this.searchActive = false;
  // }


  // onConfigButtonClick() {
  //   this.layoutService.showConfigSidebar();
  // }

  // onSidebarButtonClick() {
  //   this.layoutService.showSidebar();
  // }

  // cerrarSesion() {
  //   this.cookieService.set('Token', ""); // cookie que guarda el token


  //   const tokenconsole = this.cookieService.get('Token')

  //   //console.log("aja: " + tokenconsole)
  // }

  // sendNotification() {
  //   const token: any[] = []; // Aquí va el token o los tokens que deseas enviar, actualmente vacío
  //   const payload: NotificacionPush = {
  //     notification: {
  //       title: 'Nuevo mensaje',
  //       body: 'Has recibido un nuevo mensaje',
  //       icon: 'assets/layout/images/logo-sigesproc.png',
  //       actions: [
  //         { action: 'reply', title: 'Responder', type: 'text' },
  //         { action: 'send', title: 'Enviar' }
  //       ],
  //       data: {
  //         onActionClick: {
  //           default: { operation: 'openWindow', url: '#/chats/' },
  //           reply: { operation: 'focusLastFocusedOrOpen', url: '#/chats/response' }
  //         }
  //       }
  //     }
  //   };

  //   this.notificationService.createNotification(this.usuario, token, payload).subscribe(
  //     response => {
  //       //console.log('Notificación enviada con éxito', response);
  //     },
  //     error => {
  //       console.error('Error al enviar la notificación', error);
  //     }
  //   );
  // }


@NgModule({
  imports: [
    CheckboxModule,
    AutoCompleteModule,
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    CalendarModule,
    ToggleButtonModule,
    RippleModule,
    InputGroupModule,
    MultiSelectModule,
    DropdownModule,
    DialogModule,
    SplitButtonModule,
  ],
})
export class AppTopBarModule { }
function onMenuButtonClick() {
  throw new Error('Function not implemented.');
}

