import { Component, OnInit, NgModule,Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { EtapaService } from 'src/app/demo/services/servicesproyecto/etapa.service';
import { Etapa } from 'src/app/demo/models/modelsproyecto/etapaviewmodel';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { ChangeDetectorRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-etapa',
  templateUrl: './etapa.component.html',
  styleUrl: './etapa.component.scss',
  providers: [MessageService]

})
export  class EtapaComponent implements OnInit {
//#region  variables
  etapas: Etapa[] = [];
  etapass: Etapa[] = [];
  etapa: Etapa = {};
  columnas: any[] = [];
  items: MenuItem[];
  modaleliminar: boolean = false;
  detalles: boolean = false;
  rowactual:Etapa | null;
  Descripcion: string = "";
  Index: boolean = true;
  CreateEdit: boolean = false;
  Edit: boolean = false;
  Edito: boolean = false;//variable para abrir el modal de editar
  editarformenvio: any; //variable que almacena el formulario de envio el aeidtar
  isTableLoading: boolean = false;//variable para mostrar el spinner
  loadedTableMessage: string = "";//variable para almacenar el mensaje de carga
  form: FormGroup;
  submitted: boolean = false;
  //#endregion
  loading: boolean= true;
  usua_Id: number;

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private service: EtapaService,
    private router: Router,
    private fb: FormBuilder,
    public cookieService: CookieService,
  ) {
    this.form = this.fb.group({
      etap_Descripcion: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9\\s]+$'),
          this.noSoloEspacios
        ]
      ],
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects.includes('/sigesproc/proyecto/etapa')) {
          this.onRouteChange();
        }
      });
  }

  // Método al cambiar de ruta
  onRouteChange() {
    this.Index = true;  // Mostrar la vista principal
    this.CreateEdit = false;  // Ocultar formularios
    this.modaleliminar = false;  // Ocultar modales de eliminación
    this.form.reset();  // Reiniciar el formulario
  }

  ngOnInit(): void {
    this.Listado();
    this.items = this.getItems();

    const token = this.cookieService.get('Token');
    if (token == 'false') {
      this.router.navigate(['/auth/login']);
    }
    this.usua_Id = parseInt(this.cookieService.get('usua_Id'));
  };


//lista de acciones desplegable por registro
  getItems(): MenuItem[] {
    const items: MenuItem[] = [
        {
            label: 'Editar',
            icon: 'pi pi-user-edit',
            command: (event: any) => {
                this.ActualizarEtapa(this.rowactual);
            },
        },
        {
            label: 'Detalle',
            icon: 'pi pi-eye',
            command: (event: any) => {
                this.Details(this.rowactual);
            },
        },
        {
            label: 'Eliminar',
            icon: 'pi pi-trash',
            command: (event: any) => {
                this.modaleliminaretapa(this.rowactual);
            },
        }
    ];
    return items;
}

  //Accion de la barra de busqueda
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}

//listado de datos de la tabla
Listado() {
  this.loading = true;
  this.service.Listar().subscribe(
    (data: any) => {
      this.etapas = data.map((etapa: any) => {
        const fechaModificacion = etapa.etap_FechaModificacion ? new Date(etapa.etap_FechaModificacion).toLocaleDateString() : '';

        return {
          ...etapa,
          etap_FechaCreacion: etapa.etap_FechaCreacion ? new Date(etapa.etap_FechaCreacion).toLocaleDateString() : '',
          etap_FechaModificacion: fechaModificacion,
          codigo : parseInt(etapa.codigo)

        };
      });
      if(this.etapas.length ===0){
        this.loadedTableMessage = "No hay etapas existentes aún.";//mensaje que se muestra si no hay registros en la tabla
      }

    },
    error => {
        // this.loadedTableMessage = "Error al cargar datos.";//mensaje que se muestra si no hay registros en la tabla
    },
    () => {
      this.loading = false; // Oculta el loader cuando se completa la carga
  }
  );
}


//Accion que despliega el formulario de creacion
CrearEtapa() {
  this.Index = false;
  this.CreateEdit = true;
  this.Edit = false;
  this.form.reset();
}

//Accion que despliega el formulario de modificacion
ActualizarEtapa(etapa: Etapa) {
  this.Index = false;
  this.CreateEdit = true;
  this.Edit = true;
  this.form.patchValue({ etap_Descripcion: etapa.etap_Descripcion });
  this.etapa = { ...etapa };
  this.Descripcion = this.etapa.etap_Descripcion; // Actualiza la descripción
}


//accion de plegar los formularios
Cancelar() {
  this.CreateEdit = false;
  this.Edit = false;
  this.Index = true;
  this.form.reset();
  this.submitted = false;
}

//accion de envio de datos para guardar de formulario al backend o enviar los datos al la accion de editar
Guardar() {
  if (this.form.valid) {
    const etap_Descripcion = this.form.value.etap_Descripcion.trim();
      const usua_Creacion = this.usua_Id;
      const usua_Modificacion = this.usua_Id;
      const etap_Id = this.etapa ? this.etapa.etap_Id : null;

      const Etapa: any = {
          etap_Descripcion: etap_Descripcion,
          usua_Creacion: usua_Creacion
      };

      const Etapa2: any = {
          etap_Id: etap_Id,
          etap_Descripcion: etap_Descripcion,
          usua_Modificacion: usua_Modificacion
      };

      if (this.Edit) {
          this.editarformenvio = Etapa2;
          // Actualiza la descripción antes de abrir el modal
          this.Descripcion = etap_Descripcion;
          this.Edito = true;
      } else {
          this.service.Insertar(Etapa).subscribe(
              (respuesta: Respuesta) => {
                  if (respuesta.success) {
                      this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });

                      this.CreateEdit = false;
                      this.Index = true;
                      this.ngOnInit();
                  } else {
                      this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'La etapa ya existe.', life: 3000 });
                  }
              }
          );
      }
  } else {
      this.submitted = true;
  }
}


//accion de abiri modal confirmacion de eliminar
modaleliminaretapa(etapa: Etapa) {
  this.modaleliminar = true;
  this.etapa = { ...etapa };
  this.Descripcion = this.etapa.etap_Descripcion;
}

//Accion del modal de confirmar editar
modalEditar(){
  this.service.Actualizar(this.editarformenvio).subscribe(
    (respuesta: Respuesta) => {

      if (respuesta.data.codeStatus == 1) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Actualizado con Éxito.', life: 3000 });

          this.ngOnInit();

          this.CreateEdit = false;
          this.Index = true;
          this.Edit = false;
      } else if (respuesta.data.codeStatus == 2){
          this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'la etapa ya existe.', life: 3000 });

      }
      else {
        this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'Comuniquese con un Administrador.', life: 3000 });

    }
  }
  );
  this.Edito = false

}

//Accion de ejecutar eliminar
EliminarEtapa() {
  // Inicializa variables para el mensaje del servicio
  let severity = 'error';
  let summary = 'Error';

  try {
    // Cierra el modal de eliminación
    this.modaleliminar = false;

    // Llama al servicio de eliminación
    this.service.Eliminar(this.etapa.etap_Id).subscribe((respuesta: Respuesta) => {
      let detail = respuesta.data?.messageStatus || 'Operación completada';

      // Verifica el código de respuesta
      if (respuesta.code === 200) {
        // Ajusta la severidad y resumen basado en el código de estado
        severity = respuesta.data.codeStatus > 0 ? 'success' : 'warn';
        summary = respuesta.data.codeStatus > 0 ? 'Éxito' : 'Advertencia';

        // Si la eliminación fue exitosa, elimina el elemento de la lista sin recargar toda la tabla
        if (respuesta.data.codeStatus > 0) {
          const index = this.etapas.findIndex(e => e.etap_Id === this.etapa.etap_Id);
          if (index !== -1) {
            this.etapas.splice(index, 1); // Elimina el registro localmente
          }
        }
      } else if (respuesta.code === 500) {
        // Manejo del error interno
        severity = 'error';
        summary = 'Error Interno';
      }

      // Muestra el mensaje de notificación
      this.messageService.add({
        severity,
        summary,
        styleClass:'iziToast-custom',
        detail,
        life: 3000
      });
    });

  } catch (error) {
    // Captura cualquier error externo y muestra un mensaje de error
    this.messageService.add({
      severity: 'error',
      summary: 'Error Externo',
      styleClass:'iziToast-custom',
      detail: error.message || 'Error inesperado',
      life: 3000
    });
  }
}



//accion de plegar el apartado de detalles
hola(){
  this.Index = true;
  this.detalles = false;
  this.etapass = [];

}


//accion de depliege y llenado de los campos del apartado de detalles
Details(etapa: Etapa) {
  this.Index = false;
  this.detalles = true;
  this.etapa = { ...etapa };
  this.service.Buscar(this.etapa.etap_Id).subscribe(
    (data: any) => {
        const detalle = {
            ...data,
        };

        this.etapass.push(detalle);
    },
    error => {
        console.error('Error fetching data:', error);
    }
);

  this.columnas = [
      { field: 'UsuarioCreacion' },
      { field: 'UsuarioModificacion' },
      { field: 'etap_FechaCreacion' },
      { field: 'etap_FechaModificacion' }
  ];
}

//validacion para solo poder insertar numeros
ValidarNumeros(event: KeyboardEvent) {
  const inputElement = event.target as HTMLInputElement;
  const key = event.key;
  if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
      event.preventDefault();
  }
  if (key === ' ' && inputElement.selectionStart === 0) {
    event.preventDefault();
  }
}

//validacion para solo poder insertar letras con o sin tildes
ValidarTexto(event: KeyboardEvent) {
  const inputElement = event.target as HTMLInputElement;
  const key = event.key;
  if (!/^[a-zñA-ZÀ-ÿ\u00f1\u00d1]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
  }
  if (key === ' ' && inputElement.selectionStart === 0) {
    event.preventDefault();
  }
}

ValidarTextoNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z0-9\s]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
}

allowOnlyAlphanumeric(event: any) {
    // Permitir letras, números, tildes, ñ/Ñ y un solo espacio
    event.target.value = event.target.value
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')  // Eliminar todo lo que no sea alfanumérico o espacios
        .replace(/\s{2,}/g, ' ');  // Reemplazar múltiples espacios por uno solo
}

noSoloEspacios(control: any) {
    if (control.value && control.value.trim() === '') {
      return { noSoloEspacios: true };  // Devuelve un error si el valor son solo espacios
    }
    return null;  // No hay error si el valor es válido
  }

}
