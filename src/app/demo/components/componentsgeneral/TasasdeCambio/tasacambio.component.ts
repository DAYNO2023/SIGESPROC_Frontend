import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { TasaCambiosService } from 'src/app/demo/services/servicesgeneral/tasacambio.service';
import { TasaCambio, MonedaA, MonedaB } from 'src/app/demo/models/modelsgeneral/tasacambioviewmodel';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { filter } from 'rxjs/operators';

import { Moneda } from 'src/app/demo/models/modelsgeneral/monedaviewmodel';
import { MonedaService } from 'src/app/demo/services/servicesgeneral/moneda.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-tasacambio',
  templateUrl: './tasacambio.component.html',
  styleUrl: './tasacambio.component.scss',
  providers: [MessageService]
})
export class TasacambioComponent implements OnInit {

//#region variables

    monedas: Moneda[] = []; //variable de tipo arreglo del viewmodel de monedas
    monedasB: Moneda[] = [];//variable de tipo arreglo del viewmodel de monedas
    TasaCambio: TasaCambio[] = [];//variable de tipo arreglo del viewmodel de tasa de cambio
    items: MenuItem[] = []; //variable que almacena los items de lista de acciones dismponibles
    Index: boolean = true; //variable de despliege de index
    Create: boolean = false;//variable de despliege de formulario de creacion
    Detail = false;//variable de despliege de mostrar detalles
    Delete = false;//variable de despliege de modal de eliminar
    Edit = false;//variable de despliege de modal de editar
    form: FormGroup;//variable de tipo formgorup para envio de datos
    submitted: boolean = false;//variable para mostrar mensaje de campos vacios
    identity = 'Crear';//accion a realizar en el formulario de crear
    selectedTasaCambio: any;//accion para guardar los campos de la fila seleccinada de la tabla
    id: number = 0; //variable para guardar el id del campo
    moneda1: string; //Nombre de la moneda A para mostrar en el eliminar
    moneda2: string; //Nombre de la moneda B para mostrar en el eliminar
    isTableLoading: boolean = false;//variable para mostrar el mensaje de cargando con el spinner
    loadedTableMessage: string = "";//varaible que almacena un mensaje si no hay registros en la tabla
    loading: boolean = true;
    titulo = 'Nuevo';//titulo del formulario
    usua_Id: number;
    formularioEditar:any; //variable para guardar el formgroup lleno y enviarlo al editar
    // autocompletados
    monedaA: MonedaA[] = []
    monedaAfill: Moneda[] | undefined
    monedaB: MonedaB[] = []
    monedaBfill: Moneda[] | undefined

    //Detalles
    Datos = [{}];
    detalle_taca_Id = 0;
    detalle_mone_A = '';
    detalle_mone_B = '';
    detalle_taca_ValorA = '';
    detalle_taca_ValorB = '';
    detalle_moneda_A = '';
    detalle_moneda_B = '';
    detalle_usuaCreacion = '';
    detalle_usuaModificacion = '';
    detalle_FechausuaCreacion = '';
    detalle_FechausuaModificacion = '';

//#endregion

    constructor(
      private messageService: MessageService,
      private service: TasaCambiosService,
      private servicemoneda: MonedaService,
      private router: Router,
      private fb: FormBuilder,
      public cookieService: CookieService,
    )
    {
      this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Si la URL coincide con la de este componente, forzamos la ejecución
        if (event.urlAfterRedirects.includes('/sigesproc/general/tasasdecambio')) {
          // Aquí puedes volver a ejecutar ngOnInit o un método específico
          this.onRouteChange();
        }
      });

      this.form = this.fb.group({
        taca_Id: [0], // Ajustar según sea necesario
        mone_A: [1, Validators.required],
        monea:  [{ value: null, disabled: true } , Validators.required],
        mone_B: [null, Validators.required],
        moneb:  [null, Validators.required],
        taca_ValorA: [{ value: 1 }, Validators.required], // Asegurar que se inicializa como número
        taca_ValorB: [{ value: 1, disabled: true }, Validators.required],
        taca_FechaCreacion: [new Date().toISOString()],
        taca_FechaModificacion: [new Date().toISOString()],
    })

    }

    onRouteChange(): void {
      // Aquí puedes llamar cualquier método que desees reejecutar
    
      this.ngOnInit();
    }


    //accion que se realiza al inicio de la ejecucion de la pantalla
    ngOnInit(): void {
      this.Index = true;
      this.Create = false;
      this.Detail = false;
      this.Listado();
      const token =  this.cookieService.get('Token');
      if(token == 'false'){
        this.router.navigate(['/auth/login'])
      }
      this.usua_Id = parseInt(this.cookieService.get('usua_Id'));

      this.items = [//Lista de acciones realizables
        { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.EditarTasaCambio() },
        { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleTasaCambio() },
        { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.EliminarTasaCambio() },
    ];
    };

    //Listado de campos de la tabla principal
    Listado() {
      this.loading = true;
      this.service.Listar().subscribe(
        (data: any) => {

          this.TasaCambio = data.map((tasacambio: any) => ({
            ...tasacambio,
            taca_FechaCreacion: new Date(tasacambio.taca_FechaCreacion).toLocaleDateString(),
            taca_FechaModificacion: new Date(tasacambio.taca_FechaModificacion).toLocaleDateString()

          }));
          if(this.TasaCambio.length === 0){
            this.loadedTableMessage = "No hay tasas de cambio existentes aún.";//mensaje que se muestra si no hay registros en la tabla
          }
          else{
            this.loading = false;//oculta el spinner cuando se cargan los datos y no son 0
          }
        },
        error => {
            this.loading = false;//oculta el spinner cuando se cargan los datos y no son 0
            // this.loadedTableMessage = "Error al cargar datos.";//mensaje que se muestra si no hay registros en la tabla
        }
      );

      this.servicemoneda.Listar().subscribe((data: Moneda[]) => {
        this.monedas = data;
        this.monedasB = data;
    });
    }

    //accion para la barra de busqueda
    onGlobalFilter(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    //Seleccion de la moneda A con autocompletado
    onMonedaASelect(event: any) {
      const monedaSeleccionada = event;
      this.form.patchValue({ mone_A: monedaSeleccionada.value.mone_Id, monea:monedaSeleccionada.value.mone_Nombre});
    }

    //filtro Moneda A
    filterMonedaA(event: any) {
      const query = event.query.toLowerCase();
      this.monedaAfill = this.monedas.filter(moneda =>
        moneda.mone_Nombre.toLowerCase().includes(query)
      );
    }


//Seleccion de la moneda B con autocompletado
onMonedaBSelect(event: any) {
  const monedaSeleccionada = event;

  // Actualiza el valor de moneda2 basado en la selección
  this.moneda2 = monedaSeleccionada.value.mone_Nombre;

  this.form.patchValue({
    mone_B: monedaSeleccionada.value.mone_Id,
    moneb: monedaSeleccionada.value.mone_Nombre
  });
}


// Filtro Moneda B con opción de orden ascendente o descendente
filterMonedaB(event: any, ascendente = true) {
  const query = event.query.toLowerCase();
  this.monedaBfill = this.monedasB
    .filter(moneda => moneda.mone_Nombre.toLowerCase().includes(query))
    .sort((a, b) => {
      const comparison = a.mone_Nombre.localeCompare(b.mone_Nombre);
      return ascendente ? comparison : -comparison;
    });
}


    //desplegar el formulario de crear tasa de cambio
    CrearTasaCambio() {
      this.Index = false;
      this.Create = true;
      this.Detail = false;
      this.form.reset();
      this.identity = 'crear';
      let id = this.monedas.find(mone => mone.mone_Id === 1).mone_Id
      let Nombre = this.monedas.find(mone => mone.mone_Id === 1).mone_Nombre
      this.form.patchValue({ monea: Nombre, mone_A:  id,taca_ValorB: 1});
      this.titulo = 'Nueva Tasa de Cambio';
    }

    //cerrar formulario de creacion o edicion de tasa de cambio
    CerrarTasaCambio() {
      this.Index = true;
      this.Detail = false;
      this.Create = false;
      this.submitted = false;
    }

    //abir el formulario de editar tasa de cambio y llenado de los inputs
    EditarTasaCambio() {
      this.Detail = false;
      this.Index = false;
      this.Create = true;
      this.identity = 'editar';
      this.titulo = 'Editar Tasa de Cambio';

      this.form.patchValue({
          mone_A: this.selectedTasaCambio.mone_A,
          monea: this.selectedTasaCambio.moneda_A,
          mone_B: this.selectedTasaCambio.mone_B,
          moneb: this.selectedTasaCambio.moneda_B,
          taca_ValorA: this.selectedTasaCambio.taca_ValorA,
          taca_ValorB: this.selectedTasaCambio.taca_ValorB,
      });
      this.id = this.selectedTasaCambio.taca_Id; // Asegurarse de que `taca_Id` es un número
  }


    // DetalleTasaCambio() {
    //   this.Index = false;
    //   this.Create = false;
    //   this.Detail = true;
    //   this.detalle_taca_Id = this.selectedTasaCambio.taca_Id;
    //   this.detalle_mone_A = this.selectedTasaCambio.mone_A;
    //   this.detalle_mone_B = this.selectedTasaCambio.mone_B;
    //   this.detalle_taca_ValorA = this.selectedTasaCambio.taca_ValorA;
    //   this.detalle_taca_ValorB = this.selectedTasaCambio.taca_ValorB;
    //   this.detalle_moneda_A = this.selectedTasaCambio.moneda_A;
    //   this.detalle_moneda_B = this.selectedTasaCambio.moneda_B;
    //   this.detalle_usuaCreacion = this.selectedTasaCambio.usuaCreacion;
    //   if (this.selectedTasaCambio.usuaModificacion) {
    //     this.detalle_usuaModificacion = this.selectedTasaCambio.usuaModificacion;
    //     this.detalle_FechausuaModificacion = this.selectedTasaCambio.taca_FechaModificacion;
    //   } else {
    //     this.detalle_usuaModificacion = '';
    //     this.detalle_FechausuaModificacion = '';
    //   }
    //   this.detalle_FechausuaCreacion = this.selectedTasaCambio.taca_FechaCreacion;
    //   console.log(this.selectedTasaCambio);
    // }


    //despliege y llenado de campos de detalles de tasa de cambio
    DetalleTasaCambio() {
      this.Index = false;
      this.Create = false;
      this.Detail = true;
      this.detalle_taca_Id = this.selectedTasaCambio.codigo; // Asegurarse de que `taca_Id` es un número
      this.detalle_mone_A = this.selectedTasaCambio.mone_A;
      this.detalle_mone_B = this.selectedTasaCambio.mone_B;
      this.detalle_taca_ValorA = this.selectedTasaCambio.taca_ValorA;
      this.detalle_taca_ValorB = this.selectedTasaCambio.taca_ValorB;
      this.detalle_moneda_A = this.selectedTasaCambio.moneda_A;
      this.detalle_moneda_B = this.selectedTasaCambio.moneda_B;
      this.detalle_usuaCreacion = this.selectedTasaCambio.usuaCreacion;
      if (this.selectedTasaCambio.usuaModificacion) {
          this.detalle_usuaModificacion = this.selectedTasaCambio.usuaModificacion;
          this.detalle_FechausuaModificacion = this.selectedTasaCambio.taca_FechaModificacion;
      } else {
          this.detalle_usuaModificacion = '';
          this.detalle_FechausuaModificacion = '';
      }
      this.detalle_FechausuaCreacion = this.selectedTasaCambio.taca_FechaCreacion;
  }


    //abrir modal de confirmar eliminar tasa de cambio
    EliminarTasaCambio() {
      this.id = this.selectedTasaCambio.taca_Id;
      this.Delete = true;

    }

  //datos de la tabla al seleccionar una fila
    onRowSelect(tasacambio: TasaCambio) {
      this.selectedTasaCambio = tasacambio;
      this.moneda1 = this.selectedTasaCambio.moneda_A
      this.moneda2 = this.selectedTasaCambio.moneda_B


    }

    //accion de guardar creacion o envio de formulario a accion editar
    Guardar() {
      this.submitted = true;

      


      if (!this.form.value.mone_A || !this.form.value.mone_B) {

          return;
      }


      

      if (this.form.valid) {
          const tasaCambio: TasaCambio = {
              taca_Id: this.identity === 'editar' ? this.id : 0, // Asegurarse de que `taca_Id` es un número
              mone_A:  this.form.get('mone_A').value,
              mone_B: this.form.value.mone_B,
              taca_ValorA: + this.form.get('taca_ValorA').value || 1, // Asegurarse de que `taca_ValorA` no sea null
              taca_ValorB: + this.form.get('taca_ValorB').value || 1,  // Convertir a número
              usua_Creacion: this.usua_Id,
              usua_Modificacion: this.usua_Id,


          };

          if (this.identity !== 'editar') {
              this.service.Insertar(tasaCambio).subscribe(
                  (respuesta: Respuesta) => {
                      if (respuesta.success) {
                          this.messageService.add({ severity: 'success', summary: 'Éxito',  styleClass:'iziToast-custom',detail: 'Insertado con Éxito.', life: 3000 });
                          this.Listado();
                          this.CerrarTasaCambio();
                          this.submitted = false;
                      } else {
                          this.messageService.add({ severity: 'error', summary: 'Error',  styleClass:'iziToast-custom',detail: 'La tasa de cambio ya existe.', life: 3000 });
                      }
                  },
                  error => {
                      console.error('Error al insertar:', error);
                      this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'Comuniquese con un administrador.', life: 3000 });
                  }
              );
          } else {
            this.formularioEditar = tasaCambio
            this.Edit = true;

          }
      } else {
          const invalidControls = [];
          const controls = this.form.controls;
          for (const name in controls) {
              if (controls[name].invalid) {
                  invalidControls.push(name);
              }
          }

      }
  }

    //accion de eliminar tasa de cambio
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
             this.Listado();
          } else if(respuesta.code === 500){
             // Si hubo un error interno
            severity = 'error';
            summary = 'Error Interno';
          }
          this.messageService.add({
            severity,
            summary,
            styleClass:'iziToast-custom',
            detail,
            life: 3000
            });

        }
      );
    }
    catch (error) {
      // Captura cualquier error externo y añade un mensaje de error al servicio de mensajes
      this.messageService.add({
          severity: 'error',
          summary: 'Error Externo',
          styleClass:'iziToast-custom',
          detail: error.message || error,
          life: 3000
      });

    }


    this.Listado();
    this.Delete = false;
    }

    //Accion de envio de formulario de editar tasa de cambio
    EditarG(){

      this.service.Actualizar(this.formularioEditar).subscribe(
        (respuesta: Respuesta) => {
            if (respuesta.success) {
                this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Actualizado con Éxito.', life: 3000 });
                this.Listado();
                this.CerrarTasaCambio();
                this.submitted = false;
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'La tasa de cambio ya existe.', life: 3000 });
            }
        },
        error => {
            console.error('Error al actualizar:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'Comuniquese con un Administrador.', life: 3000 });
        }
    );
    this.Edit = false;
    }
  }
