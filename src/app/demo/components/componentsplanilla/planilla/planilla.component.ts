
import { Component, OnInit } from '@angular/core';
import { DeduccionService } from '../../../services/servicesplanilla/deduccion.service';
import { FrecuenciaService } from '../../../services/servicesplanilla/frecuencia.service';
import { Table, TableModule } from 'primeng/table';
import { planillaservice } from '../../../services/Servicesplanilla/planilla.service';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { Deduccion } from '../../../models/modelsplanilla/deduccionviewmodel';
import { Deduccionesjefe } from '../../../models/modelsplanilla/deduccionesplanillajefesviemodel';
import { Planilla } from '../../../models/modelsplanilla/planillaviewmdel';
import { FrecuenciaDDL } from '../../../models/modelsplanilla/frecuenciaviewmodel';
import { ListadoEmpleadosPlanilla, Deducciones, contenedor } from '../../../models/modelsplanilla/planillaviewmdel';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { concatAll, empty } from 'rxjs';
import { PagoJefeObraPlanillaViewModel } from '../../../models/modelsplanilla/planillajefeobraviewmodel';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { log, number } from 'mathjs';
import { ChangeDetectorRef } from '@angular/core';
import { getDayOfYear, parse } from 'date-fns';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { UsuarioService } from 'src/app/demo/services/servicesacceso/usuario.service';
import { da } from 'date-fns/locale';
import { CookieService } from 'ngx-cookie-service';
import { Router, NavigationEnd  } from '@angular/router';
import { ToastService } from 'src/app/demo/services/toast.service';
import { Gravedades } from 'src/app/demo/models/GravedadIzitoastEnum';
import { NotificacionesComponent } from '../../componentsproyecto/notificaciones/notificaciones.component'
import { Usuario } from 'src/app/demo/models/modelsacceso/usuarioviewmodel';
import { NotificacionesService } from 'src/app/demo/services/servicesproyecto/notificacion.service';
import { NotificationManagerService } from 'src/app/demo/services/notificacionservice/NotificacionGlobal.service';
import { NotificacionUpdateService } from 'src/app/demo/services/servicesproyecto/Notificacionactualizar.service'; 
import { filter } from 'rxjs/operators';
import { PrimeNGConfig } from 'primeng/api';

@Component({
    selector: 'app-planilla',
    templateUrl: './planilla.component.html',
    styleUrls: ['./planilla.component.scss'],
    providers: [MessageService],
})
export class PlanillaComponent implements OnInit {
  filteredFrecuenciaPla: FrecuenciaDDL [] = [];
  filteredFrecuenciaPla2: FrecuenciaDDL [] = [];
  FrecuenciaPla: FrecuenciaDDL [] = [];
  noti : NotificacionesComponent;
  isJefeDeCuadrilla: boolean = false;
  planillaListado : Planilla [] = [];
  deduccionesJefe: Deduccionesjefe[] = [];
  deduccion: Deduccion[] = []; // Array para almacenar las deducciones
  deduccionesDetallePlanilla : Deducciones [] = [];
  listadoplanilla: ListadoEmpleadosPlanilla[] = []; // Array para almacenar el listado de planillas
  empleadosFiltradorDeducciones: ListadoEmpleadosPlanilla[] = [];
  deduccionesFiltradas: ListadoEmpleadosPlanilla[] = [];
  Index: boolean = true; // Estado para mostrar/ocultar componentes
  create: boolean = false; // Estado para mostrar/ocultar componentes
  numDeducciones: number; // Número total de deducciones
  numDeduccionesJFObra : number;
  coso2 :boolean = false;
  coso3 :boolean = false;
  modal: boolean = false; // Estado del modal
  form: FormGroup; // Formulario reactivo
  maxDate: Date; // Fecha máxima para el formulario
  UsuarioCreo: string = ""; // Usuario que creó la planilla
  FechaCreo: string = ""; // Fecha de creación de la planilla
  FechaPago: string; // Fecha de pago de la planilla
  NoNomina: string = ""; // Número de nómina
  selectedPlanilla: any; // Planilla seleccionada
  items: MenuItem[] = []; // Elementos del menú
  items2: MenuItem[] = []; // Elementos del menú
  itemsS:                   MenuItem[] = []; // Elementos del menú secundario
  modaldedujefes: boolean = false; // Estado del modal de deducciones
  modalDeducciones: boolean = false; // Estado del modal de deducciones
  // listadoPlanillaEmpleadosFiltrado: Deducciones[] = []; // Listado filtrado de deducciones
  contardeduccione: number = 0;
  verplanilla: boolean = false;
  frecuencia: string;
  i: number = 0;
  emplejefe : string;
  loading3 : boolean = false;
  loadedTableMessage: string = "";
  detalleActivo: boolean = false; 
  totalColumnas: number = 0 ;
  PlanillJefeOBr: PagoJefeObraPlanillaViewModel[] = [];
  PlanillJefeOBr2: PagoJefeObraPlanillaViewModel[] = []; 
  coso = false;
  isRegresarVisible: boolean = false;
  isPdfVisible: boolean = false
  btnGuardar: boolean = true;
  hideFrecuencia: boolean = true;
  previousValue: boolean = false;
  planillaJefes: boolean = false;
  usuario: Usuario[] = [];
  lbOpcionNA :  boolean = false
  
  frecuenciaSeleccionado: any = {
    value:{
      frec_Id: 0, 
      frecuencia: '',
      frec_Descripcion: ''
    }
  }

  modalValidaciones: boolean = false;
  submitted : boolean =  false;
  fechadePlanillAnterior : Date;
  formattedDate : string;
  nombreFrecuencia: string;
  saberDeduccionDetalle: boolean = false;
  usua_Id: number;
  minDate: Date;
  localeEs : any
  frecuenciaDdlSaber : boolean = true; 

  // Selecciona una planilla en la tabla
  selectPlanillaIndex(planillaListado: any) {
    this.selectedPlanilla = planillaListado;
  }

   /**
    * Constructor del componente donde se inyectan los servicios necesarios y se inicializa el formulario.
    * @param notificacionUpdateService Servicio para emitir eventos cuando se actualizan notificaciones.
    */

  constructor(
    private service: DeduccionService,
    private servicePlanilla: planillaservice,
    private fb: FormBuilder,
    private toastService: ToastService,
    private messageService: MessageService,
    private serviceFrecuencia: FrecuenciaService, private cd: ChangeDetectorRef,
    public globalmoneda : globalmonedaService, 
    public cookieService: CookieService,
    private router: Router,
    public usuarioService : NotificacionesService,
    private notificationManagerService: NotificationManagerService,
    private notificacionUpdateService: NotificacionUpdateService,
    private primengConfig: PrimeNGConfig
    
  ) {

    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/planilla/planilla')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });

    this.minDate = new Date(1920, 0, 1);
    // Inicializa el formulario reactivo con validaciones
    this.form = this.fb.group({
      plan_FechaPeriodoInicio: [{ value: '', disabled: true }],
      plan_FechaPago: ['', Validators.required],
      plan_FechaPeriodoFin: ['', Validators.required],
      plan_Observaciones: [''],
      plan_PlanillaJefes: [false],
      frec_Id: [0, Validators.required],
      frecuencia: ['', Validators.required],
    });
  }
 //T00:00:00

 onRouteChange(): void {
  // Aquí puedes llamar cualquier método que desees reejecutar
  this.ngOnInit();
}

 ngOnInit(): void {

  this.create = false;
  this.coso = false;
  this.coso2 = false;
  this.Index = true;
  this.create = false;
  this.modal = false;
   this.isPdfVisible = false;
  this.detalleActivo = false;
  this.form.reset();
  this.isRegresarVisible = false;
  this.UsuarioCreo = this.cookieService.get('usua_Usuario');
  const token =  this.cookieService.get('Token');
  //  
  if(token == 'false'){
    this.router.navigate(['/auth/login'])
  }

  this.usua_Id = parseInt(this.cookieService.get('usua_Id'));

      this.serviceFrecuencia.ddl().subscribe(
    (data: FrecuenciaDDL[]) => {
      this.FrecuenciaPla = data.sort((a, b) => a.frec_Descripcion.localeCompare(b.frec_Descripcion));
      // Log para verificar que las empresas se cargaron correctamente
      //  
    },
    error => {
      // Manejo de errores para la llamada al servicio
    }
  );

  // setTimeout(() => {
  //   this.form.get('plan_PlanillaJefes')?.valueChanges.subscribe(value => {
  //     if (value === true) {
  //       this.performAction(); // Call the function you want to execute
  //        
  //     }else{
  //       this.hideFrecuencia = false;

  //     }
  //   });
  // });
  this.form.get('plan_PlanillaJefes')?.valueChanges.subscribe(value => {
    if (value === true) {
      this.performAction(); // Call the function you want to execute
    }
    this.cd.detectChanges(); // Manually trigger change detection
  });

  // Inicializa el componente cargando los datos
  this.Listado();

  // Configura los elementos del menú
  this.items = [
    { label: 'Deducciones', icon: 'pi pi-money-bill', command: (event) => this.FiltradoDeduccionesPorEmpleados() },
    // { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleMaquinaria() },
    // { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.EliminarMaquinaria() },
  ];
  this.items2 = [
    { label: 'Deducciones', icon: 'pi pi-money-bill', command: (event) => this.deduccJefeObra() },
    // { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleMaquinaria() },
    // { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.EliminarMaquinaria() },
  ];
  this.itemsS = [
    { label: 'Planilla', icon: 'pi pi-money-bill', command: (event) => this.DetallesPlanilla() },
  ];


  if(!this.globalmoneda.getState()){

    this.globalmoneda.setState();
  }

  this.ListadoUsuarios()

}

togglePdfVisibility() {
  if (this.isPdfVisible) {
    this.isPdfVisible = false;
    this.coso = true;
    this.cancelarImpresion();

    
  } else {
    this.cerrarPlanilla();
    this.coso = false;
    this.Index = true;
  }
}
togglePdfVisibility2() {
  if (this.isPdfVisible) {
    this.isPdfVisible = false;
    this.coso2 = true;
    this.cancelarImpresion();

    
  } else {
    this.cerrarPlanilla();
    this.coso2 = false;
    this.Index = true;
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
  this.form.controls['plan_Observaciones'].setValue(inputElement.value);
}

  async Listado(){
    this.loading3 = true;

    await this.servicePlanilla.Listar().then(
      (data: any) => {

        this.planillaListado = data.map(( planilla: any) => ({
          ... planilla,
          detalle_usuaCreacion: planilla.usuaCreacion,
          plan_FechaCreacion: new Date(planilla.plan_FechaCreacion).toLocaleDateString(),
          plan_FechaModificacion: new Date(planilla.plan_FechaModificacion).toLocaleDateString(),
          plan_FechaPago: planilla.plan_FechaPago.replace("T00:00:00", ""),

        }));

        let usua = this.planillaListado.find(pl => pl.plan_FechaPeriodoFin == this.form.value.plan_FechaPeriodoFin)
        if(usua != undefined){

        }

        if(this.planillaListado.length === 0){
          this.loadedTableMessage = "No hay planillas existentes aún.";//mensaje que se muestra si no hay registros en la tabla
          this.loading3 = false;
        }
        else{
          this.loading3 = false;//oculta el spinner cuando se cargan los datos y no son 0
        }
      },
      error => {
          // this.loadedTableMessage = error.message;
          // this.loadedTableMessage = "Error al cargar datos.";//mensaje que se muestra si no hay registros en la tabla
          this.loading3 = false;//oculta el spinner cuando se cargan los datos y no son 0

      }
    );

  }

  async ListadoUsuarios() {
    this.loading3 = true; // Activa el spinner de carga
    await this.usuarioService.ListarUsuariosAwait().then(
      (data: Usuario[]) => {
        // Filtra los usuarios que tienen un ID válido (no null ni undefined)
        this.usuario = data.filter(item => item.usua_Id !== null && item.usua_Id !== undefined);
        this.loading3 = false; // Desactiva el spinner de carga
  
        // Muestra un mensaje si no hay usuarios disponibles
        if (this.usuario.length === 0) {
          this.loadedTableMessage = "No hay Usuarios disponibles.";
        }
      },
      error => {
        this.loading3 = false; // Desactiva el spinner de carga en caso de error
        console.error('Error al cargar usuarios', error);
      }
    );
  }
  

//   getDeduccionParaEmpleado(deduccionesEmpleado: any[], deduccionDescripcion: string,sueldoTotal:number ): number {
//     const deduccion = deduccionesEmpleado.find(d => d.dedu_Descripcion === deduccionDescripcion);
    
//     if (deduccion) {
//         return deduccion.dedu_EsMontoFijo 
//             ? deduccion.dedu_Porcentaje 
//             : (deduccion.dedu_Porcentaje * sueldoTotal / 100);
//     }
    
//     return 0; // Retorna 0 si el empleado no tiene esa deducción
// }

  ngDoCheck(): void {
    const currentValue = this.form.get('plan_PlanillaJefes')?.value;
    if (currentValue !== this.previousValue && currentValue === true) {
      this.previousValue = currentValue;
      this.performAction(); // Call the function you want to execute
    }
  }
  performAction(): void {
    // Define the action you want to perform
    this.hideFrecuencia = true;
    this.form.patchValue({frecuencia: "Semanal - 7 Dias" , frec_Id: 1 });
    // Additional logic here
  }

  // Obtiene el listado de deducciones desde el servicio
  // ListadoDeducciones() {
  //    

  //   this.service.getData().subscribe(
  //     (data: Deduccion[]) => {
  //        

  //       this.numDeducciones = data.length + 1;

  //       this.totalColumnas = data.length +10;

  //        

  //       // Formatea las deducciones para mostrar el porcentaje
  //       this.deduccion = data.map((dedu) => ({
  //         ...dedu,
  //         dedu_Porcentaje: dedu.dedu_EsMontoFijo
  //           ? `L. ${parseFloat(dedu.dedu_Porcentaje.toString()).toFixed(2)}`
  //           : `${dedu.dedu_Porcentaje}%`,
  //       }));

  //        
  //     },
  //     (error) => {
  //        
  //     }
  //   );

  //    


  //   this.serviceFrecuencia.ddl().subscribe(
  //     (data: FrecuenciaDDL[]) => {
  //       this.FrecuenciaPla = data;
  //       // Log para verificar que las empresas se cargaron correctamente
  //       //  
  //     },
  //     error => {
  //       // Manejo de errores para la llamada al servicio
  //        
  //     }
  //   );

  // }
  ngAfterViewChecked() {
    this.cd.detectChanges();
}

  Visualizar(){
    this.Index = false;
    this.coso2 = true;
    this.loading3 = true;
    this.loadPlanillaJefeObra();
  }
  onSwitchChange() {
    this.detalleActivo ? (this.coso=true, this.coso2=false ): (this.coso=false, this.coso2=true);
    // Aquí puedes agregar la lógica que cambia según el valor de detalleActivo
  }

  getDeduccionParaEmpleado(deduccionesEmpleado: any[], deduccionDescripcion: string, sueldoTotal: number, empleadoId: number): number {
    const deduccion = deduccionesEmpleado.find(d => 
        d.dedu_Descripcion === deduccionDescripcion && d.empl_Id === empleadoId
    );
    
    if (deduccion) {
        return deduccion.dedu_EsMontoFijo 
            ? deduccion.dedu_Porcentaje 
            : (deduccion.dedu_Porcentaje * sueldoTotal / 100);
    }
    
    return 0; // Retorna 0 si el empleado no tiene esa deducción
  }
  calcularTotalDeduccioness(empleadoId: number, sueldoTotal: number): number {
    const uniqueDeducciones = this.getUniqueDeducciones(this.deduccionesJefe);

    const totalDeducciones = uniqueDeducciones
        .map(deduccion => this.getDeduccionParaEmpleado(this.deduccionesJefe, deduccion.dedu_Descripcion, sueldoTotal, empleadoId))
        .reduce((total, deduccion) => total + deduccion, 0);

    return totalDeducciones;
}
  getUniqueDeducciones(deducciones: any[]): any[] {
    return deducciones.filter((deduccion, index, self) =>
        index === self.findIndex((d) => (
            d.dedu_Descripcion === deduccion.dedu_Descripcion
        ))
    );
  }
  calcularSueldoNeto(empleadoId: number, sueldoTotal: number): number {
    const totalDeducciones = this.calcularTotalDeduccioness(empleadoId, sueldoTotal);
    return sueldoTotal - totalDeducciones;
}
  calcularTotalDeducciones(empleadoId: number): number {
    return this.deduccionesJefe
        .filter(deduccion => deduccion.empl_Id === empleadoId)
        .reduce((total, deduccion) => total + deduccion.dedu_Porcentaje, 0);
  }

  loadPlanillaJefeObra(): void {

    const fechaPeriodoFin = this.form?.get('plan_FechaPeriodoFin')?.value;
    const fechaFormateada = fechaPeriodoFin ? new Date(fechaPeriodoFin).toISOString().split('T')[0] : '';

    this.servicePlanilla.ListadoDeduccionesJefes(fechaFormateada).subscribe(
     (data: Deduccionesjefe[]) => {
       this.deduccionesJefe = data || [];
     },
     (error) => {
     }
    );

    

    this.servicePlanilla.ListarJefeObra(fechaFormateada).subscribe(
      (data: PagoJefeObraPlanillaViewModel[]) => {
        this.PlanillJefeOBr = data || [];
        this.numDeduccionesJFObra = this.getUniqueDeducciones(this.deduccionesJefe).length + 1;

      },
      (error) => {
      }
    );

    this.servicePlanilla.ListarJefeObra2(fechaFormateada).subscribe(
      (data: PagoJefeObraPlanillaViewModel[]) => {
        this.PlanillJefeOBr2 = data || [];
        this.numDeduccionesJFObra = this.getUniqueDeducciones(this.deduccionesJefe).length + 1;

      },
      (error) => {
      }
    );
  // Verificar el tipo de datos
  console.log('Fin del spinner')
  this.loading3 = false;

  }
  enviarPlanillaJefeObra(): void {

    console.log('Me entro al metodo de guardar planilla de jefe de obra')

    const transformedPlanilla = this.PlanillJefeOBr.map((jefeObra) => {
      const sueldoTotal = jefeObra.sueldoTotal ?? 0; // Asegurarse de que SueldoTotal no sea null o undefined
      const totalDeducido = 
            (jefeObra.rap ?? 0) + 
            (jefeObra.isr ?? 0) + 
            (jefeObra.ihss ?? 0) + 
            (jefeObra.ivm ?? 0) + 
            (jefeObra.afag ?? 0) + 
            (jefeObra.deduccin ?? 0) + 
            (jefeObra.deduccion ?? 0) + 
            (jefeObra.impuestoPersonal ?? 0) + 
            (jefeObra.noje ?? 0) + 
            (jefeObra.nuevaDeduEditada ?? 0) + 
            (jefeObra.pavelTax ?? 0) + 
            (jefeObra.siu ?? 0);
    
      return {
        empl_Salario: sueldoTotal,
        totalDeducido: totalDeducido,
        totalPrestamos: 0, // O el valor correspondiente
        empl_Id: jefeObra.empl_Id,
        plan_Id: 0, // O el valor correspondiente
        usua_Creacion: this.usua_Id, // Valor dinámico según corresponda
        empl_FechaCreacion: new Date(),
      };
    });
    const fecha: Date = new Date(this.form.value.plan_FechaPago);
    // Formatear la fecha en el formato dd/mm/yyyy
    const fechaFormateada = fecha.toISOString()

    const fechaFinPeriodo: Date = new Date(this.form.value.plan_FechaPeriodoFin);
    // Formatear la fecha en el formato dd/mm/yyyy
    const fechaFormateadaFinPeriodo = fechaFinPeriodo.toISOString()
    const Planilla: Planilla = {
      plan_Id: 0,
      plan_NumNomina: 0,
      plan_FechaPago: fechaFormateada,
      plan_FechaPeriodoFin: fechaFormateadaFinPeriodo,
      plan_Observaciones: this.form.value.plan_Observaciones ?? '',
      plan_PlanillaJefes: this.form.value.plan_PlanillaJefes,
      frec_Id: this.form.value.frec_Id,
      usua_Creacion: this.usua_Id,
      usua_Modificacion: 0,
      // Eliminando los campos no mapeados para evitar conflictos
      usuaCreacion: "",  // No necesario
      usuaModificacion: ""  // No necesario
    };
    // Convertir a JSON
    const jsonPlanilla = JSON.stringify(transformedPlanilla);
    const contenedor: any = {
      planillaViewModel: [Planilla],
      DetalleJefes: jsonPlanilla
    };
    // Enviar el JSON a la API
    this.servicePlanilla.InsertarJObra(contenedor,fechaFormateadaFinPeriodo).then(async (response) => {
      if(response.code == 200){
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000, styleClass: 'iziToast-custom', });
        // this.planillaListado
       await  this.Listado();
    
        this.FechaPago = this.planillaListado[0]?.plan_FechaPago;
        this.FechaCreo =this.planillaListado[0]?.plan_FechaPago;
        this.NoNomina = this.planillaListado[0]?.plan_NumNomina.toString();
        this.emplejefe = this.planillaListado[0]?.plan_PlanillaJefes? 'Para colaborador': 'Jefe cuadrilla';
        this.frecuencia = this.planillaListado[0]?.frec_Descripcion;
        this.verplanilla= true;
      }
 
    }).catch((error) => {
      this.toastService.toast(
        Gravedades.error,
        'Algo salió mal. Comuníquese con un Administrador.'
    );
    });
   
   


      
    
  }
  private addTabContentToDoc2(doc: jsPDF): void {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    const tableHeaders = [
        'No.',
        'Nombre Completo',
        'Cargo',
        'Frecuencia',
        'Diario',
        'Ordinario',
        'Total Devengado',
        'Préstamos',
        'Total Salario'
    ];

    const tableBody = this.PlanillJefeOBr2.flatMap((planilla, index) => {
        // Fila principal
        const mainRow = [
            index + 1, // Número
            planilla.nombreCompleto,
            planilla.carg_Descripcion,
            'Semanal', // Frecuencia
            `${this.globalmoneda.getState().mone_Abreviatura} ${(planilla.sueldoTotal / 6).toFixed(2)}`, // Salario Diario
            `${this.globalmoneda.getState().mone_Abreviatura} ${planilla.sueldoTotal.toFixed(2)}`, // Salario Ordinario
            `${this.globalmoneda.getState().mone_Abreviatura} ${planilla.sueldoTotal.toFixed(2)}`, // Total Devengado
            `${this.globalmoneda.getState().mone_Abreviatura} ${(planilla.cuotaPrestamo ?? 0).toFixed(2)}`, // Préstamos
            `${this.globalmoneda.getState().mone_Abreviatura} ${(this.calcularSueldoNeto(planilla.empl_Id, planilla.sueldoTotal) - (planilla.cuotaPrestamo ?? 0)).toFixed(2)}` // Total Salario
        ];
        const numEmptyColumnsBeforeDeductions = 9; // El número de columnas antes de las deducciones


        // Fila de subencabezado para deducciones (ocupa las mismas columnas que la fila principal)
        // const subHeaderRow = [
        //     ...this.getUniqueDeducciones(this.deduccionesJefe).map(deduccion => deduccion.dedu_Descripcion)
        // ];

        // // Fila de valores de deducciones (alineada con las columnas correctas)
        // const childRow = [
            
        //     ...this.getUniqueDeducciones(this.deduccionesJefe).map(deduccion => 
        //         `${this.globalmoneda.getState().mone_Abreviatura} ${this.getDeduccionParaEmpleado(this.deduccionesJefe, deduccion.dedu_Descripcion, planilla.sueldoTotal, planilla.empl_Id).toFixed(2)}`
        //     ),
        //     '' // Ajustar si necesitas un valor o columna extra
        // ];

        // return [mainRow, subHeaderRow, childRow];

        const uniqueDeducciones = this.getUniqueDeducciones(this.deduccionesJefe);

        const valor = this.deduccionesJefe.length;
      const subHeaderRow = uniqueDeducciones.length != null 
          ? ['', 
              ...uniqueDeducciones.map(deduccion => deduccion.dedu_Descripcion)
            ]
          : []; 
      
      const childRow = uniqueDeducciones.length != null
          ? ['', 
              ...uniqueDeducciones.map(deduccion => 
                  `${this.globalmoneda.getState().mone_Abreviatura} ${this.getDeduccionParaEmpleado(this.deduccionesJefe, deduccion.dedu_Descripcion, planilla.sueldoTotal, planilla.empl_Id).toFixed(2)}`
              )
            ]
          : []; 
      
      
      if (valor > 1) {
          return [mainRow, subHeaderRow, childRow];
      } else {
          return [mainRow]; 
      }
    });

    doc.autoTable({
        startY: 50,
        head: [tableHeaders],
        body: tableBody,
        theme: 'striped',
        styles: {
            halign: 'center',
            font: 'helvetica',
            lineWidth: 0.1,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [255, 237, 58],
            textColor: [0, 0, 0],
            fontSize: 12,
            fontStyle: 'bold',
            halign: 'center',
        },
        bodyStyles: {
            textColor: [0, 0, 0],
            fontSize: 10,
            halign: 'center',
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240],
        },
        margin: { top: 50, bottom: 30 },
    });

    doc.setFontSize(10);
}

 mostrarPrevisualizacion2() {
  this.isRegresarVisible = true;
  this.isPdfVisible = true;

    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [216, 356],
    });

    // Añadir el contenido y los encabezados/pies de página a la primera página
    this.addHeader(doc);
    this.addTabContentToDoc2(doc);
    this.addFooter(doc, 1);

    const pageCount = doc.internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        this.addHeader(doc);
        if (i === pageCount) {
            this.addFooter(doc, i - 1);
        } else {
            this.addFooter(doc, i);
        }
    }

    this.openPdfInDiv(doc);
    this.isRegresarVisible = true;
}

private addTabContentToDoc3(doc: jsPDF): void {
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  const tableHeaders = [
      'No.',
      'Nombre Completo',
      'Cargo',
      'Frecuencia',
      'Diario',
      'Ordinario',
      'Total Devengado',
      'Préstamos',
      'Total Salario'
  ];

  const tableBody = this.PlanillJefeOBr.flatMap((planilla, index) => {
      // Fila principal
      const mainRow = [
          index + 1, // Número
          planilla.nombreCompleto,
          planilla.carg_Descripcion,
          'Semanal', // Frecuencia
          `${this.globalmoneda.getState().mone_Abreviatura} ${(planilla.sueldoTotal / 6).toFixed(2)}`, // Salario Diario
          `${this.globalmoneda.getState().mone_Abreviatura} ${planilla.sueldoTotal.toFixed(2)}`, // Salario Ordinario
          `${this.globalmoneda.getState().mone_Abreviatura} ${planilla.sueldoTotal.toFixed(2)}`, // Total Devengado
          `${this.globalmoneda.getState().mone_Abreviatura} ${(planilla.cuotaPrestamo ?? 0).toFixed(2)}`, // Préstamos
          `${this.globalmoneda.getState().mone_Abreviatura} ${(this.calcularSueldoNeto(planilla.empl_Id, planilla.sueldoTotal) - (planilla.cuotaPrestamo ?? 0)).toFixed(2)}` // Total Salario
      ];

      // const subHeaderRow = [
      //     ...this.getUniqueDeducciones(this.deduccionesJefe).map(deduccion => deduccion.dedu_Descripcion)
      // ];

      // const childRow = [
          
      //     ...this.getUniqueDeducciones(this.deduccionesJefe).map(deduccion => 
      //         `${this.globalmoneda.getState().mone_Abreviatura} ${this.getDeduccionParaEmpleado(this.deduccionesJefe, deduccion.dedu_Descripcion, planilla.sueldoTotal, planilla.empl_Id).toFixed(2)}`
      //     ),
      //     ''
      // ];

      // return [mainRow, subHeaderRow, childRow];

      const uniqueDeducciones = this.getUniqueDeducciones(this.deduccionesJefe);

      const valor = this.deduccionesJefe.length;
    const subHeaderRow = uniqueDeducciones.length != null 
        ? ['', 
            ...uniqueDeducciones.map(deduccion => deduccion.dedu_Descripcion)
          ]
        : []; 
    
    const childRow = uniqueDeducciones.length != null
        ? ['', 
            ...uniqueDeducciones.map(deduccion => 
                `${this.globalmoneda.getState().mone_Abreviatura} ${this.getDeduccionParaEmpleado(this.deduccionesJefe, deduccion.dedu_Descripcion, planilla.sueldoTotal, planilla.empl_Id).toFixed(2)}`
            )
          ]
        : []; 
    
    
    if (valor > 1) {
        return [mainRow, subHeaderRow, childRow];
    } else {
        return [mainRow]; 
    }
  });

  doc.autoTable({
      startY: 50,
      head: [tableHeaders],
      body: tableBody,
      theme: 'striped',
      styles: {
          halign: 'center',
          font: 'helvetica',
          lineWidth: 0.1,
          cellPadding: 3,
      },
      headStyles: {
          fillColor: [255, 237, 58],
          textColor: [0, 0, 0],
          fontSize: 12,
          fontStyle: 'bold',
          halign: 'center',
      },
      bodyStyles: {
          textColor: [0, 0, 0],
          fontSize: 10,
          halign: 'center',
      },
      alternateRowStyles: {
          fillColor: [240, 240, 240],
      },
      margin: { top: 50, bottom: 30 },
  });

  doc.setFontSize(10);
}
mostrarPrevisualizacion3() {
  this.isRegresarVisible = true;
  this.isPdfVisible = true;

  const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [216, 356],
  });

  // Añadir el contenido y los encabezados/pies de página a la primera página
  this.addHeader(doc);
  this.addTabContentToDoc3(doc);
  this.addFooter(doc, 1);

  const pageCount = doc.internal.pages.length;
  for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      this.addHeader(doc);
      if (i === pageCount) {
          this.addFooter(doc, i - 1);
      } else {
          this.addFooter(doc, i);
      }
  }

  this.openPdfInDiv(doc);
  this.isRegresarVisible = true;
}

  searchFrecuencia(event: any) {
    let query = event.query;
    // Filtra las empresas basadas en la búsqueda del usuario
    if(this.frecuenciaDdlSaber){
      this.serviceFrecuencia.ddl().subscribe(
        (data: FrecuenciaDDL[]) => {
          this.FrecuenciaPla = data.sort((a, b) => a.frec_Descripcion.localeCompare(b.frec_Descripcion));
          // Log para verificar que las empresas se cargaron correctamente
          //  
        },
        error => {
          // Manejo de errores para la llamada al servicio
        }
      );
      this.filteredFrecuenciaPla = this.FrecuenciaPla.filter(frec => frec.frecuencia.toLowerCase().includes(query.toLowerCase()));
    }
   else{
    // this.filteredFrecuenciaPla2 = this.FrecuenciaPla.filter(frec => frec.frecuencia.toLowerCase().includes(query.toLowerCase()));
   }

    this.lbOpcionNA = this.filteredFrecuenciaPla.length === 0;
  }

  // onSacarUltimaFechadePlanilla(event: any){
  //   let eventt =  event;
  //    
  // }

  onNivelSelect(event: any) {
    this.frecuenciaSeleccionado = event;
    this.nombreFrecuencia = this.frecuenciaSeleccionado.value.frec_Descripcion;
  
  
    // Filtrar y obtener la fecha de finalización del periodo
      let fechafinperiodo;

      if(this.isJefeDeCuadrilla == false){

        try {
          fechafinperiodo = this.planillaListado.filter(pl => {
            return pl.frec_Id == this.frecuenciaSeleccionado.value.frec_Id;
          }).slice(0, 1)[0].plan_FechaPeriodoFin;
        }
      
        catch{
      
        } 
      }

      else if(this.isJefeDeCuadrilla == true){
        try {
          fechafinperiodo = this.planillaListado.filter(pl => {
            return pl.frec_Id == this.frecuenciaSeleccionado.value.frec_Id, pl.plan_PlanillaJefes == true;
          }).slice(0, 1)[0].plan_FechaPeriodoFin;
        }
      
        catch{
      
        } 
      }

    if(fechafinperiodo == undefined){
      fechafinperiodo =  Date.now
    }
  
    if(fechafinperiodo != '0001-01-01T00:00:00')
    {
  
      // Convertir la fecha a objeto Date
      this.fechadePlanillAnterior = new Date(fechafinperiodo);
  
      // Obtener el día, mes y año
      const day = this.fechadePlanillAnterior.getDate().toString().padStart(2, '0');
      const month = (this.fechadePlanillAnterior.getMonth() + 1).toString().padStart(2, '0'); // Los meses en JavaScript son 0-11
      const year = this.fechadePlanillAnterior.getFullYear();
  
      // Formatear la fecha
      var months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      var monthname = months[this.fechadePlanillAnterior.getMonth()];
      this.formattedDate = `${day} de ${monthname} del ${year}`;
  
        if(this.formattedDate == 'NaN/NaN/NaN' || this.formattedDate == 'NaN de undefined del NaN')
        {
          this.formattedDate = 'No hay datos';
        }
  
      }
      else 
      {
      this.formattedDate = 'No hay datos';
    }
  
      // Actualizar el formulario con los valores seleccionados
      this.form.patchValue({
        frecuencia: this.frecuenciaSeleccionado.value.frecuencia,
        frec_Id: this.frecuenciaSeleccionado.value.frec_Id,
        plan_FechaPeriodoInicio: this.formattedDate // Asignar la fecha formateada al formulario
      });
  }
  ValidacionesPlanilla2() { 
    console.log('Esto me lleva el valor de bool de jason del metodo 2', this.isJefeDeCuadrilla)

    this.listadoplanilla = null;

    if (this.form.valid) {
        this.submitted = false;

        const fechaPeriodoFin: Date = new Date(this.form.value.plan_FechaPeriodoFin);
        const fechaPago: Date = new Date(this.form.value.plan_FechaPago);

        let fechafinperiodo: Date | null = null;

        try {
            // Filtrando la fecha de fin de la planilla anterior basada en la frecuencia seleccionada
            const planillaAnterior = this.planillaListado.filter(pl => pl.frec_Id === this.frecuenciaSeleccionado.value.frec_Id);
            if (planillaAnterior.length > 0) {
                fechafinperiodo = new Date(planillaAnterior[0].plan_FechaPeriodoFin);
            }
        } catch (error) {
            console.error('Error obteniendo la fecha de la planilla anterior: ', error);
        }

        // Obtener el rango de fechas de la semana actual
        const hoy = new Date();
        const primerDiaSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 1)); // Lunes de esta semana
        const ultimoDiaSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 7)); // Domingo de esta semana

        // Validar si la fecha de fin de periodo es mayor al último día de esta semana
        if (fechaPeriodoFin > ultimoDiaSemana) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                styleClass: 'iziToast-custom',
                detail: 'La fecha de fin de periodo no puede ser mayor que el último día de la semana actual.',
                life: 3000
            });
            return; // Detener si la fecha es mayor a la semana actual
        }

        // Validar si la fecha es menor a la última planilla generada
        if (fechafinperiodo && fechaPeriodoFin < fechafinperiodo) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                styleClass: 'iziToast-custom',
                detail: 'La fecha de fin de periodo no puede ser menor que la fecha de la última planilla generada.',
                life: 3000
            });
            return; // Detener si la fecha es anterior a la última planilla
        }

        // Validación si la fecha es dentro de la semana actual y es válida

        // Si pasa todas las validaciones, generar la planilla
        this.GenerarPlanilla();

    } else {
        this.submitted = true;
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            styleClass: 'iziToast-custom',
            detail: 'Por favor, complete todos los campos obligatorios.',
            life: 3000
        });
    }
}


  ValidacionesPlanilla1(){ 

    // console.log('Esto me lleva el valor de bool de jason', this.isJefeDeCuadrilla)

    this.listadoplanilla =  null;

    if(this.form.value.frecuencia.trim()){
      var isPresent = this.FrecuenciaPla.find(fr => fr.frecuencia == this.form.value.frecuencia)
      // console.log('Me entro antes de is presen', isPresent)

      if(isPresent instanceof Object)
      {
        this.lbOpcionNA = false;
      }

      else{
        this.lbOpcionNA = true;
      }
    }

    if (this.form.valid) {
      if((isPresent instanceof Object)){

    const fecha: Date = new Date(this.form.value.plan_FechaPeriodoFin);
    const fechaPago: Date = new Date(this.form.value.plan_FechaPago);
    // const diafecha = getDayOfYear(fecha);  
    const dia = fecha.getDate();

    var months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    var days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    var dayName = days[fechaPago.getDay()];


      // let fechafinperiodo;
      let saberValor;


      if(this.isJefeDeCuadrilla == true){
      let fechafinperiodo;

        try {
          let fechafinperiodo = this.planillaListado.filter(pl => {
            return pl.frec_Id == this.frecuenciaSeleccionado.value.frec_Id, pl.plan_PlanillaJefes == this.isJefeDeCuadrilla;
          }).slice(0, 1)[0].plan_FechaPeriodoFin;
          }
    
          catch{
    
          }

          let fechaanteriorpago : Date = new Date(fechafinperiodo);
    
          if(fechaanteriorpago.toString() == fecha.toString()){
            this.messageService.add({ severity: 'error', 
                                      summary: 'Error', 
                                      styleClass: 'iziToast-custom',
                                      detail: 'Ya existe una planilla con la frecuencia seleccionada que tiene la misma fecha de finalización del período.', life: 3000 });
          }
    
          else if( fecha < fechaanteriorpago){
            this.messageService.add({ severity: 'error', 
                                      summary: 'Error',
                                      styleClass: 'iziToast-custom', 
                                      detail: 'No es posible ingresar una fecha de finalización del período que sea anterior a la de la planilla previa.', life: 3000 });
          }

          else{
            saberValor = 1;
          }

      }

      else if(this.isJefeDeCuadrilla == false){

        let fechafinperiodo;
        
        try {
          fechafinperiodo = this.planillaListado.filter(pl => {
            return pl.frec_Id == this.frecuenciaSeleccionado.value.frec_Id;
          }).slice(0, 1)[0].plan_FechaPeriodoFin;
          }
    
          catch{
    
          }
    
          let fechaanteriorpago : Date = new Date(fechafinperiodo);
    
          if(fechaanteriorpago.toString() == fecha.toString()){
            this.messageService.add({ severity: 'error', 
                                      summary: 'Error', 
                                      styleClass: 'iziToast-custom',
                                      detail: 'Ya existe una planilla con la frecuencia seleccionada que tiene la misma fecha de finalización del período.', life: 3000 });
          }
    
          else if( fecha < fechaanteriorpago){
            this.messageService.add({ severity: 'error', 
                                      summary: 'Error',
                                      styleClass: 'iziToast-custom', 
                                      detail: 'No es posible ingresar una fecha de finalización del período que sea anterior a la de la planilla previa.', life: 3000 });
          }
          
          else{
            saberValor = 1;
          }

      }

      if(saberValor == 1){

        if(dayName == 'Domingo'){
          this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'No se puede pagar un domingo.', life: 3000 });
        }
    
        else {
    
        let fechafinperiodo;
        try{
          fechafinperiodo = this.planillaListado.filter(pl => {
            return pl.frec_Id == this.frecuenciaSeleccionado.value.frec_Id
          }).slice(0, 1)[0].plan_FechaPeriodoFin;
        }
    
        catch{
          fechafinperiodo = '1990-01-01';
        }
    
        const nuevaFechaPeriodo = new Date(fechafinperiodo);
        let one_day = 1000 * 60 * 60 * 24;
    
        if(fechafinperiodo != null){
          console.log('Me entro al if #1')
          let numDia = Math.floor((Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) - Date.UTC(nuevaFechaPeriodo.getFullYear(), nuevaFechaPeriodo.getMonth(), nuevaFechaPeriodo.getDate()) ) /(one_day));
    
          if(nuevaFechaPeriodo.getMonth() != 2 && fecha.getMonth() != 2 && this.isJefeDeCuadrilla == false)
          {
            console.log('Me entro al if #2')
            if((numDia - 1) > this.frecuenciaSeleccionado.value.frec_NumeroDias || (numDia + 1) < this.frecuenciaSeleccionado.value.frec_NumeroDias){
              
              console.log('Me entro al if #3')
               this.modalValidaciones = true;
            }
    
            else{
              console.log('Me entro al else #1')
              this.GenerarPlanilla();
            }
          }
    
          else
          {
            console.log('Me entro al else #2')

            if((numDia - 3) > this.frecuenciaSeleccionado.value.frec_NumeroDias || (numDia + 3) < this.frecuenciaSeleccionado.value.frec_NumeroDias && this.isJefeDeCuadrilla == false){
              console.log('Me entro al if #4')
              this.modalValidaciones = true;
           }
    
           else{
            console.log('Me entro al else #3')
            this.GenerarPlanilla();
           }
          }
    
        }
      }
    
  }
  }
  }
  else{
    this.submitted = true;
   }
  }

  // Aplica un filtro global a la tabla
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Cierra la planilla y vuelve al estado inicial
  CerrarPlanilla() {
    this.create = false;
    this.coso = false;
    this.coso2 = false;
    this.Index = true;
    this.create = false;
    this.modal = false;
    this.ngOnInit();
     this.isPdfVisible = false;
    this.detalleActivo = false;
    this.form.reset();
    this.isRegresarVisible = false;

  }

  async DetallesPlanilla(){
    this.loading3 = true;
    if (this.selectedPlanilla.planilla !== "Jefe de Cuadrilla") {
    const id = this.selectedPlanilla.plan_Id;
    
    this.btnGuardar = false;
    this.Index = false;
    this.modal = false;
    this.create = true;
    this.verplanilla = false;
    this.listadoplanilla = null;
    this.deduccion = null


    this.servicePlanilla.ListadoDeduccionesPorPlaniall(id).subscribe(
      (data: Deduccion[]) => {
         

        this.numDeducciones = data.length + 1;

        this.totalColumnas = data.length +10;

         

        // Formatea las deducciones para mostrar el porcentaje
        this.deduccion = data.map((dedu) => ({
          ...dedu,
        }));

         
      },
      (error) => {
         
      }
    );

    await this.servicePlanilla.ListadoDetallePlanilla(id).then(
      (data: ListadoEmpleadosPlanilla[]) => {   

         

        // Asigna los datos de empleados a la lista
        this.listadoplanilla = data.map((listado) => ({
          ...listado,
          dedu_Porcentaje: listado.empl_Salario,
        }));

        this.form.value.frecuencia = this.listadoplanilla[0].frecuencia;

        this.loading3 = false;
      },

      (error) => {
        this.loading3 = false;
         
      },
      // () =>{
      //   this.loading = false;
      // }
    );

    await this.servicePlanilla.ListadoDeduccionesPorPlaniallaPorEmpleadp(id).then(
      (data: Deducciones[]) => {
         ;

        // Formatea las deducciones para mostrar el porcentaje
        this.deduccionesDetallePlanilla = data.map((dedu) => ({
          ...dedu,
        }));

         
    }
  )

    this.listadoplanilla = this.listadoplanilla.map(pl => {
      // Asignar deducciones filtradas a cada elemento de listadoplanilla
      return {
          ...pl,
          deducciones: this.deduccionesDetallePlanilla.filter(depl => depl.empl_Id == pl.empl_Id)
      };
  });
}
    else if (this.selectedPlanilla.planilla === "Jefe de Cuadrilla") {
    this.btnGuardar = false;

      this.Index = false;
    this.coso2 = true;
      const fechaPeriodoFin = this.selectedPlanilla.plan_FechaPeriodoFin;
    const fechaFormateada = fechaPeriodoFin ? new Date(fechaPeriodoFin).toISOString().split('T')[0] : '';

    this.servicePlanilla.ListadoDeduccionesJefes(fechaFormateada).subscribe(
     (data: Deduccionesjefe[]) => {
       this.deduccionesJefe = data || [];
        
        
     },
     (error) => {
        
     }
    );

    

    this.servicePlanilla.ListarJefeObra2(fechaFormateada).subscribe(
      (data: PagoJefeObraPlanillaViewModel[]) => {
        this.PlanillJefeOBr2 = data || [];
         
         
        this.numDeduccionesJFObra = this.getUniqueDeducciones(this.deduccionesJefe).length + 1;
         

      },
      (error) => {
         
      }
    );

    this.servicePlanilla.ListarJefeObra(fechaFormateada).subscribe(
      (data: PagoJefeObraPlanillaViewModel[]) => {
        this.PlanillJefeOBr = data || [];
         
         
        this.numDeduccionesJFObra = this.getUniqueDeducciones(this.deduccionesJefe).length + 1;
         

      },
      (error) => {
         
      }
    );
    // this.listadoplanilla.forEach(pl => {
    //   pl.deducciones = this.deduccionesDetallePlanilla.filter(depl =>{
    //       return depl.empl_Id == pl.empl_Id        
    //   })
    // });

     
     

    }
    this.loading3 = false;
    
  }

  // Selecciona una planilla para ver detalles
  selectPlanilla(planilla: any) {
    this.selectedPlanilla = planilla;
  }

  // Obtiene el listado de empleados desde el servicio

  GenerarPlanilla()
  {

    if (this.form.valid) {
      this.submitted = false;
    this.isRegresarVisible = false;
     

  // Convertir la fecha a un objeto Date si no lo es
  const fecha: Date = new Date(this.form.value.plan_FechaPago);

  // Formatear la fecha en el formato dd/mm/yyyy
  // const fechaFormateada = fecha.toLocaleDateString('es-ES', {
  //   day: '2-digit',
  //   month: '2-digit',
  //   year: 'numeric',
  // });
  const fechaFormateada = fecha.toISOString().split('T')[0];

   
    // const fechaModificada = fechaFormateada.replace(/\//g, '%2F');

    const modelo: any = {
      fecha: fechaFormateada,
      frecid: parseInt(this.form.value.frec_Id),
      jefeplani: this.form.value.plan_PlanillaJefes ?? false,
      saberCrear: false,
      plan_Id: 0,
      usuaCrea: this.usua_Id
    };

     


    console.log('Una liena antes del metodo this.ListadoEmpleadoNormal')
    this.ListadoEmpleadoNormal(modelo);
   }

   else {
    this.submitted = true;
   }

  }


  cerrarPlanilla(){

     

    if(this.isPdfVisible){
      this.Index = false;
      this.create = true;
      this.modal = false;
      this.cancelarImpresion();
       
    }

    else{
      this.Index = true;
      this.modal = false;
      this.create = false;
      this.cancelarImpresion();
       
    }

    this.verplanilla = false;
    this.modal = false;
    this.modalDeducciones = false;
    this.detalleActivo=false;
  }

  cancelarImpresion() {
    document.getElementById('pdfContainer').innerHTML = '';
    this.isRegresarVisible = false;
    this.isPdfVisible = false;
}
  async ListadoEmpleadoNormal(modelo:any) {

    // const fecha = this.form.value.plan_FechaPago;
    // const fechaModificada = fecha.replace(/\//g, '%2F');    //  
    if (this.isJefeDeCuadrilla === false) {

    this.loading3 = true;
    this.Index = false;
    this.modal = false;
    this.create = true;
    this.verplanilla = false;
    await this.servicePlanilla.ListadoEmpleadoNormal(modelo).then(
      (data: any[]) => {

        if(data.length !=0){
  
          this.numDeducciones = data[0].deducciones.length + 1;
          this.deduccion = data[0].deducciones;
  
          // Asigna los datos de empleados a la lista
          this.listadoplanilla = data.map((listado) => ({
            ...listado,
            dedu_Porcentaje: listado.empl_Salario,
          }));
  
           
          this.loading3 = false;
        }

        else{
          this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'No hay empleados ingresados con esa frecuencia', life: 3000 });
          this.loading3 = false;
        }
      },

      (error) => {
         
        this.loading3 = false;
      },
      // () =>{
      //   this.loading = false;
      // }
    );

  } else if ( this.isJefeDeCuadrilla === true) {
    console.log('Me entro al else if de jeson')
    this.Visualizar();
    this.Index = false;

    this.coso2 = true;
    this.modal = false;
  }

  }

  empl_Nombre: string = ""; // Nombre del empleado
  empl_Apellido: string = ""; // Apellido del empleado
  totalDeducido: number = 0; // Total deducido
  sueldoTotal: number = 0; // Sueldo total
  salariobase: number = 0; // Salario base
  salariobasePlanilla: number = 0; // Salario base en la planilla

  // Filtra las deducciones por empleados
  async FiltradoDeduccionesPorEmpleados() {
    this.modalDeducciones = true;
    this.create = false;
    this.empl_Nombre = this.selectedPlanilla.empl_Nombre;
    this.empl_Apellido = this.selectedPlanilla.empl_Apellido;
    this.salariobasePlanilla = this.selectedPlanilla.empl_Salario;

      this.empleadosFiltradorDeducciones = this.listadoplanilla.filter(pl => {
        return pl.empl_Id == this.selectedPlanilla.empl_Id
      });
  
      this.totalDeducido =  this.empleadosFiltradorDeducciones[0].deducciones[0].totalDeducido;
      this.sueldoTotal = this.empleadosFiltradorDeducciones[0].deducciones[0].sueldoTotal;
      this.salariobase = this.empleadosFiltradorDeducciones[0].deducciones[0].empl_Salario;
  
       

    // await this.servicePlanilla.ListarDeduccionesPorEmpleados(this.selectedPlanilla.empl_Id).then(
    //   (data: Deducciones[]) => {
    //      
    //      
    //     this.totalDeducido = data[0].totalDeducido;
    //     this.sueldoTotal = data[0].sueldoTotal;
    //     this.salariobase = data[0].empl_Salario;
    //     this.listadoPlanillaEmpleadosFiltrado = data.map((listado) => ({
    //       ...listado,
    //     }));

    //      
    //   },
    //   (error) => {
    //      
    //   }
    // );
  }
  deduccJefeObra() {
    this.modaldedujefes = true;
    this.coso2 = false;
    this.coso = false;
  }

  // onPlanillaJefesChange(event: any): void {
  //   this.isJefeDeCuadrilla = event;
  //   if (event == true) {
  //       this.form.patchValue({frecuencia: "Semanal - 7 Dias" , frec_Id: 1 });
  //   }
  // }

  onPlanillaJefesChange(checked: boolean) {
    if (checked) {

      this.frecuenciaDdlSaber = false;

      this.lbOpcionNA = false;
       
      this.isJefeDeCuadrilla = true;
      this.form.patchValue({frecuencia: "Semanal - 7 Dias" , frec_Id: 1 });
  
      // Copiamos solo las propiedades necesarias desde this.form.value a frecuenciaSeleccionado.value
      this.frecuenciaSeleccionado.value.frec_Id = 1;
      this.frecuenciaSeleccionado.value.frecuencia = this.form.value.frecuencia || '';
      this.frecuenciaSeleccionado.value.frec_Descripcion = 'Semanal';
  
       
      this.onNivelSelect(this.frecuenciaSeleccionado);
  
    } else {
      this.frecuenciaDdlSaber = true;
      this.isJefeDeCuadrilla = false;
    }
  }
  

  // Abre el modal para crear una nueva planilla
  CrearPlanilla() {
    // this.form.patchValue({
    //   'plan_PlanillaJefes' : false
    // });

    this.isJefeDeCuadrilla = false;
    // this.ListadoDeducciones();
    this.submitted = false;
    this.btnGuardar = true;
    this.modal = true;
    this.create = false;
    this.Index = false;

    this.form.reset();
    this.formattedDate = '';
  }


  EnviarAlerta(descripcion: string){
    const pantDireccionURL = this.form.value.pant_direccionURL || '';
    const notiRuta = pantDireccionURL ? `#/sigesproc${pantDireccionURL}` : '#/sigesproc/planilla/planilla';
    // let descripcion = 'Se cre una nueva planilla '+this.frecuencia+ ' para colaborador'

    const detalless = this.usuario.map(usuario => ({
      aler_Descripcion: descripcion, // Descripción de la notificación
      aler_Ruta: notiRuta, // Ruta de la notificación
      aler_Fecha: new Date().toISOString(), // Fecha actual en formato ISO
      usua_Id: usuario.usua_Id, // ID del usuario destinatario
      usua_Creacion: this.usua_Id, // ID del usuario que crea la notificación
      napu_Ruta: pantDireccionURL // Ruta de pantalla opcional
    }));

    this.notificationManagerService.insertarYEnviarNotificaciones(detalless, notiRuta).subscribe(
      // Maneja la respuesta exitosa de la inserción y envío de notificaciones
      resultados => {
        // Filtra los resultados para obtener los que fueron exitosos y los que fallaron
        const exitosos = resultados.filter((res: any) => res.success);
        const fallidos = resultados.filter((res: any) => !res.success);

        // Si hay inserciones exitosas, muestra un mensaje de éxito
        if (exitosos.length > 0) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass:'iziToast-custom', detail: 'Insertado con éxito.', life: 3000 });
        }

        // Llama al servicio para actualizar las notificaciones
        this.notificacionUpdateService.notificacionesActualizadasEmit();
      },
      // Maneja cualquier error ocurrido durante la inserción o envío de notificaciones
      error => {
        // this.messageService.add({ severity: 'error', summary: 'Error', styleClass:'iziToast-custom', detail: 'Error al procesar la solicitud.', life: 3000 });
        console.error('Error en GuardarEnviarAlertas:', error);
      }
    );
  }

  // Guarda la planilla en el servidor
  async guardar() {
    const fecha: Date = new Date(this.form.value.plan_FechaPago);
    // Formatear la fecha en el formato dd/mm/yyyy
    const fechaFormateada = fecha.toISOString()

    const fechaFinPeriodo: Date = new Date(this.form.value.plan_FechaPeriodoFin);
    // Formatear la fecha en el formato dd/mm/yyyy
    const fechaFormateadaFinPeriodo = fechaFinPeriodo.toISOString()

    this.loading3 = true;
    if (this.form.valid) {
      const Planilla: Planilla = {
        plan_Id: 0,
        plan_NumNomina: 0,
        plan_FechaPago: fechaFormateada,
        plan_FechaPeriodoFin: fechaFormateadaFinPeriodo,
        plan_Observaciones: this.form.value.plan_Observaciones ? this.form.value.plan_Observaciones : '',
        plan_PlanillaJefes: this.form.value.plan_PlanillaJefes ? this.form.value.plan_PlanillaJefes : false,
        frec_Id: this.form.value.frec_Id,
        usua_Creacion: this.usua_Id,
        usua_Modificacion: 0,
        // Eliminando los campos no mapeados para evitar conflictos
        usuaCreacion: "",  // No necesario
        usuaModificacion: ""  // No necesario
      };

      const contenedor: any = {
        planillaViewModel: [Planilla],
        planillaEmpleado: this.listadoplanilla
      };

       

       
       
      try {
      await this.servicePlanilla.Insertar(contenedor).then(
        (respuesta: Respuesta) => {
           
           

          if (respuesta.message == "55") {
            this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'No se puede pagar un domingo.', life: 3000 });
             
            this.loading3 = false;
          } else if (respuesta.success && this.form.value.plan_PlanillaJefes === false) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });

            const dataMessage = respuesta.data.message.split('|');
            // this.UsuarioCreo = dataMessage[0];
            this.FechaPago = dataMessage[1].split(' ')[0];
            this.FechaCreo = dataMessage[2];
            this.NoNomina = dataMessage[3];
            this.emplejefe = dataMessage[4];
            this.frecuencia = dataMessage[5];
            this.Listado();

            let descripcion = 'Se cre una nueva planilla '+this.frecuencia+ ' dias '+'para colaborador'
            this.EnviarAlerta(descripcion)
            

            this.emplejefe = this.emplejefe === "1" ? "Para jefe de cuadrilla" : "Para colaborador";
            this.loading3 = false;
            this.Index = false;
            this.verplanilla = true;
            this.modal = false;
            this.create = true;
          }
           else {
            this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'Inserción fallida.', life: 3000 });
            this.loading3 = false;
             
          }
        }
      );
    }
    catch (error){
      console.error('Error en la solicitud:', error);

      // Opcionalmente, puedes agregar un mensaje para el usuario
      this.messageService.add({ severity: 'error', summary: 'Error', styleClass: 'iziToast-custom', detail: 'Ocurrió un error al intentar guardar la planilla.', life: 3000 });

      this.loading3 = false; // Detener el spinner en caso de error
    };
    }
  }

        //#region Impresion
    // Método privado para agregar un encabezado al documento PDF
    private addHeader(doc: jsPDF) {
        const date = new Date().toLocaleDateString(); // Obtiene la fecha actual
        const time = new Date().toLocaleTimeString(); // Obtiene la hora actual

        const logo = '/assets/demo/images/encabezado_footer_horizontal4k.png';
        doc.addImage(logo, 'PNG', 0, -18, 370, 50);

        doc.setFontSize(24); // Configura el tamaño de la fuente
        doc.setTextColor(0, 0, 0); // Configura el color del texto
        doc.text(
            `Planilla ${this.form.value.frecuencia.split('-')[0].trim()}`,
            // del ${'Fecha inicio'} al ${'Fecha fin'}
            doc.internal.pageSize.width / 2,
            40,
            { align: 'center' }
        ); // Agrega el nombre del proveedor centrado

        doc.setFontSize(10); // Configura el tamaño de la fuente para la fecha y hora
        doc.setTextColor(255, 255, 255); // Configura el color del texto para la fecha y hora
        doc.text(
            `Fecha de emisión: ${date} ${time}`,
            doc.internal.pageSize.width - 10,
            10,
            { align: 'right' }
        ); // Agrega la fecha y hora en la esquina superior derecha

        doc.setFontSize(10); // Configura el tamaño de la fuente para el nombre del generador
        doc.setTextColor(255, 255, 255); // Configura el color del texto para el nombre del generador
        doc.text(
            `Generado por: ${this.UsuarioCreo}`,
            doc.internal.pageSize.width - 10,
            20,
            { align: 'right' }
        ); // Agrega el nombre del generador en la esquina superior derecha
    }

    // // Método privado para agregar un pie de página al documento PDF
    // private addFooter(doc: jsPDF, pageNumber: number) {
    //     doc.setDrawColor(255, 215, 0);  // Configura el color de la línea del pie de página
    //     doc.setLineWidth(1);  // Configura el grosor de la línea del pie de página
    //     doc.line(10, 287, doc.internal.pageSize.width - 10, 287);  // Dibuja la línea del pie de página

    //     const footerLogo = 'https://restaurantebucket.s3.us-east-2.amazonaws.com/encabezado_footer_horizontal4k.png';  // Ruta del logo del pie de página
    //     // const footerLogo = '/assets/demo/images/disenoactualizado2.png';  // Ruta del logo del pie de página
    //     doc.addImage(footerLogo, 'PNG', 0, 197.5, 436, 50);  // Agrega el logo al pie de página

    //     doc.setFontSize(16);  // Configura el tamaño de la fuente para el número de página
    //     doc.setTextColor(0, 0, 0);  // Configura el color del texto para el número de página
    //     doc.text(`Página ${pageNumber}`, doc.internal.pageSize.width - 145, 210, { align: 'right' });  // Agrega el número de página en la esquina inferior derecha
    // }

    // private addHeader(doc: jsPDF) {
    //     const date = new Date().toLocaleDateString();
    //     const time = new Date().toLocaleTimeString();

    //     const logo =
    //         '/assets/demo/images/encabezado_footer_horizontal4k.png';
    //     doc.addImage(logo, 'PNG', 0, -18, 220, 50);

    //     doc.setFontSize(20);
    //     doc.setTextColor(0, 0, 0);
    //     doc.text(`Planilla`, doc.internal.pageSize.width / 2, 50, {
    //         align: 'center',
    //     });

    //     doc.setFontSize(8);
    //     doc.setTextColor(200, 200, 200);
    //     doc.text(
    //         `Fecha de emisión: ${date} ${time}`,
    //         doc.internal.pageSize.width - 10,
    //         10,
    //         { align: 'right' }
    //     );

    //     doc.setFontSize(8);
    //     doc.setTextColor(200, 200, 200);
    //     doc.text(
    //         `Generado por: Esdra Cerna`,
    //         doc.internal.pageSize.width - 10,
    //         20,
    //         { align: 'right' }
    //     );
    // }

    private addFooter(doc: jsPDF, pageNumber: number) {
        doc.setDrawColor(255, 215, 0);
        doc.setLineWidth(1);
        doc.line(10, 287, doc.internal.pageSize.width - 10, 287);

        const footerLogo =
            '/assets/demo/images/encabezado_footer_horizontal4k.png';
        doc.addImage(footerLogo, 'PNG', 0, 197.8, 375, 50);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(
            `Página ${pageNumber}`,
            doc.internal.pageSize.width - 165,
            210,
            { align: 'right' }
        );
    }

    private addTabContentToDoc(doc: jsPDF): void {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        // Configure the table headers
        const tableHeaders = [
            'No.',
            'Nombre Completo',
            'Cargo',
            'Frecuencia',
            'Diario',
            'Ordinario',
            'Total Deducido',
            'Préstamos',
            'Total Salario',
        ];

        // Configura las columnas del subheader
        const childSubHeader = [
            '',
            ...this.deduccion.map((ded) => ded.dedu_Descripcion),
        ];

        // Configure the table body with child rows
        const tableBody = this.listadoplanilla.flatMap(
            (plde: ListadoEmpleadosPlanilla, index) => {
                // Main row
                const mainRow = [
                    plde.codigo,
                    plde.empl_Nombre + ' ' + plde.empl_Apellido || '',
                    plde.cargo || '',
                    plde.frecuencia || '',
                    `${this.globalmoneda.getState().mone_Abreviatura} ${new Intl.NumberFormat('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(plde.empl_Salario / plde.frec_NumeroDias)}`  || '0.00',
                    `${this.globalmoneda.getState().mone_Abreviatura} ${new Intl.NumberFormat('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(plde.empl_Salario)}`  || '0.00',
                    `${this.globalmoneda.getState().mone_Abreviatura} ${new Intl.NumberFormat('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(plde.deducciones?.[0]?.totalDeducido)}`  || '0.00',
                    `${this.globalmoneda.getState().mone_Abreviatura} ${new Intl.NumberFormat('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(plde.totalPrestamos)}`  || '0.00',
                    `${this.globalmoneda.getState().mone_Abreviatura} ${new Intl.NumberFormat('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(plde.empl_Salario - (plde.totalPrestamos + (plde.deducciones?.[0]?.totalDeducido ?? 0)))}`  || '0.00',
                ];

                const numColumnas = mainRow.length;

                let numSubCol = childSubHeader.length;
               
                let result:any = [mainRow];
                let subHeaderRow = childSubHeader;
                let childRows = plde.deducciones.map((ded: Deducciones) => [
                  `${this.globalmoneda.getState().mone_Abreviatura} ${ded.totalPorDeduccion ? new Intl.NumberFormat('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(ded.totalPorDeduccion.toString()))  : '0.00'}`  || '0.00',
                ]);
                 
                // Reducir array de deducciones;
                while (numSubCol > numColumnas) {
                  result = [...result, subHeaderRow, ['', ...childRows]];
                  subHeaderRow = childSubHeader.filter((item, index) => index === 0 || index >= numColumnas);
                  childRows = childRows.filter((item, index) => index >= numColumnas-1);
                  // acc += numColumnas;
                  numSubCol -= numColumnas; 
                }
                 
                
                result = [...result, subHeaderRow, ['', ...childRows]]
                return result;
            }
        );

        // Generate the table in the document
        doc.autoTable({
            startY: 50,
            head: [tableHeaders], // Header row
            body: tableBody, // Data rows, including child rows
            theme: 'striped', // Optional: grid or plain
            styles: {
                halign: 'center',
                font: 'helvetica',
                lineWidth: 0.1,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [255, 237, 58],
                textColor: [0, 0, 0],
                fontSize: 12,
                fontStyle: 'bold',
                halign: 'center',
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                fontSize: 10,
                halign: 'center',
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240],
            },
            margin: { top: 50, bottom: 30 },
        });

        doc.setFontSize(10);
    }

    private openPdfInDiv(doc: jsPDF) {
        // this.viewState = {
        //   create: false,
        //   variableCambiada: false, detail: false, maqui: false, delete: false, index: false, ordenes: false, ordenesEditar: false, Detalles: false,createdirect: false
        // };
        const string = doc.output('datauristring');
        const iframe = `<iframe width='100%' height='100%' src='${string}'></iframe>`;
        const pdfContainer = document.getElementById('pdfContainer');
         
        if (pdfContainer) {
            pdfContainer.innerHTML = iframe;
            this.isPdfVisible = true;
            //   this.cd.detectChanges();
        }
    }

    mostrarPrevisualizacion() {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [216, 356],
        });

        // Add content and headers/footers to the first page
        this.addHeader(doc);
        this.addTabContentToDoc(doc);
        this.addFooter(doc, 1);

        const pageCount = doc.internal.pages.length;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            this.addHeader(doc);
            //La número de página de la última página siempre es un número mayor porque seteamos el footer de forma manual
            if (i === pageCount) {
                this.addFooter(doc, i - 1);
            } else {
                this.addFooter(doc, i);
            }
        }

        this.openPdfInDiv(doc);
        this.isRegresarVisible = true;
    }

    //Lógica del botón de regresar
    botonRegresarClick() {
        document.getElementById('pdfContainer').innerHTML = '';
        this.isRegresarVisible = false;
        this.isPdfVisible = false;
    }
}
