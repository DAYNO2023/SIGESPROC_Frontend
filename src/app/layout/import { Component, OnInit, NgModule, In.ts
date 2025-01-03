import { Component, OnInit, NgModule, Inject,ViewChild, ChangeDetectionStrategy  } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { HttpErrorResponse } from '@angular/common/http';

import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators} from '@angular/forms';
import { forkJoin } from 'rxjs';
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
import { FleteService } from 'src/app/demo/services/servicesflete/flete.service';
import { Flete, Bodega } from 'src/app/demo/models/modelsflete/fleteviewmodel';
import { MenuItem } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { autocompleteEmpleado } from 'src/app/demo/models/modelsacceso/usuarioviewmodel';
import { FleteDetalleService } from 'src/app/demo/services/servicesflete/fletedetalle.service';
import { InsumoPorProveedor } from 'src/app/demo/models/modelsinsumo/insumoporproveedorviewmodel';
import { FleteDetalle } from 'src/app/demo/models/modelsflete/fletedetalleviewmodel';
import { FleteControlCalidadService } from 'src/app/demo/services/servicesflete/fleteControlYCalidad.service';
import {  FormArray } from '@angular/forms';
import { FleteControlCalidad } from 'src/app/demo/models/modelsflete/fletecontrolycalidadviewmodel';

@Component({
    selector: 'app-flete',
    templateUrl: './flete.component.html',
    styleUrls: ['./flete.component.scss'],
    providers: [MessageService]
    //,
    // changeDetection: ChangeDetectionStrategy.OnPush

})
export class FleteComponent implements OnInit {
    Verificacion = false;
    Index = true;
    flete: Flete;
    verificarForm: FormGroup;
    pendientes: FleteDetalle[] = [];
    verificados: FleteDetalle[] = [];

    submitted: boolean = false;

    fletes: Flete[] = [];
    fleteDetalles: FleteDetalle[] = [];
    items: MenuItem[] = [];

    Detail: boolean = false;

    incidenciasForm: FormGroup;
    CreateEdit: boolean = false;
    noVerificados: FleteDetalle[] = [];


    verificarDialog: boolean = false;
    incidenciasDialog: boolean = false;
    insumosSeleccionados: any[] = [];
    insumosAgregados: number[] = [];     insumos: InsumoPorProveedor[] = [];
    cantidadInsumo: number;
    placeholderLlegada: string = 'Seleccione una bodega';
    bodegas: Bodega[] = [];
    filtradoBodegas: Bodega[] = [];
    fletess: Flete[] = [];
    columnas: any[] = [];
    detalles: boolean = false;
    rowactual: Flete | null;
    Edit: boolean = false;
    form: FormGroup;
    valSwitch: boolean = false;
    empleados: autocompleteEmpleado[] | undefined;
    filtradoEmpleado: autocompleteEmpleado[] = [];
    Indexactivo: number = 0;
    encabezadoId: number | null = null;
    IndexIncidencias:boolean = false;
    incidencias: FleteControlCalidad[] = [];
    incidencia: FleteControlCalidad;
    itemsIncidencias: MenuItem[] = [];
    createIncidencia:boolean = false;
    fleteIncidenciaId:number = 0;
    formIncidencias: FormGroup;
    identity:string = "crear";
    idIncidencia:number = 0;
    submittedIncidencia: boolean = false;
    DetalleVerificacion: boolean = false;
cantidadesOriginales: { [key: number]: number } = {};
titulo: string = "Nueva Incidencia";
selectedIncidencia: any;
deleteIncidencia:boolean = false;
   //VERIFICACION Y INCIDENCIASSSSSSSSSSSS

    constructor(
        private service: FleteService,
        private detalleService: FleteDetalleService,
        private controlCalidadService: FleteControlCalidadService,
        private router: Router,
        private fb: FormBuilder,
        private messageService: MessageService

    ) {

        this.formIncidencias = this.fb.group({
            flcc_DescripcionIncidencia: ['', Validators.required],
            flcc_FechaHoraIncidencia: ['', Validators.required],
            flen_Id: ['', Validators.required]

          });

        this.form = this.fb.group({
            flen_FechaHoraSalida: ['', Validators.required],
            // flen_FechaHoraLlegada: ['', Validators.required],
            flen_FechaHoraEstablecidaDeLlegada: ['', Validators.required],
            encargado: ['', Validators.required],
            emtr_Id: ['', Validators.required],
            supervisorsalida: ['', Validators.required],
            emss_Id: ['', Validators.required],
            supervisorllegada: ['', Validators.required],
            emsl_Id: ['', Validators.required],
            boll_Id: ['', Validators.required],
            salida: ['', Validators.required],
            flen_DestinoProyecto: [false, Validators.required],
            bopr_Id: ['', Validators.required],
            llegada: ['', Validators.required],
        });
        this.verificarForm = this.fb.group({
            flen_FechaHoraLlegada: ['', Validators.required],
            detalles: this.fb.array([])
        });


        this.incidenciasForm = this.fb.group({
            incidencias: this.fb.array([])
        });
// inicializacion cantidad de verificacion
        this.cantidadesOriginales = {};

    }

    ngOnInit(): void {
        this.Listado();
        this.ListadoEmpleados();
        this.ListadoBodegas();
        this.ListadoInsumos();
        this.itemsIncidencias = this.getItemsIncidencias();
        this.pendientes.forEach(detalle => {
            this.cantidadesOriginales[detalle.flde_Id] = detalle.flde_Cantidad;
        });



        this.pendientes.forEach(detalle => {
            this.cantidadesOriginales[detalle.flde_Id] = detalle.flde_Cantidad;
        });


    }


    ListadoInsumos() {
        this.detalleService.ListarInsumosPorProveedor().subscribe(
            (data: InsumoPorProveedor[]) => {
                this.insumos = data;
                console.log('Insumos disponibles:', this.insumos);
            },
            (error) => {
                console.log(error);
            }
        );
    }


    actualizarStockDisponible(insumoId: number, cantidad: number) {
        const insumo = this.insumos.find(i => i.inpp_Id === insumoId);
        if (insumo) {
            insumo.bopi_Stock -= cantidad;
            console.log('Stock actualizado:', insumo.bopi_Stock);
        }
    }

        actualizarStockDisponibleP(insumoId: number, cantidad: number) {
        const insumo = this.insumos.find(i => i.inpp_Id === insumoId);
        if (insumo) {
            insumo.bopi_Stock -= cantidad;
            console.log('Stock actualizado:', insumo.bopi_Stock);
        }
    }



    finalizar() {
        this.submitted = true;

        let valid = true;
        this.insumosSeleccionados.forEach(insumo => {
            if (insumo.cantidad < 1 || insumo.cantidad > insumo.bopi_Stock) {
                valid = false;
                insumo.cantidadError = 'Cantidad inválida. Debe ser mayor que 0 y menor o igual que el stock.';
            }
        });

        if (!valid) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Corrige las cantidades inválidas antes de enviar el formulario.' });
            return;
        }

        if (this.form.valid) {
            const formValue = this.form.value;
            const nuevoFlete = {
                ...formValue,
                flen_FechaHoraSalida: this.formatDate(formValue.flen_FechaHoraSalida),
                flen_FechaHoraEstablecidaDeLlegada: this.formatDate(formValue.flen_FechaHoraEstablecidaDeLlegada),
                usua_Creacion: 3,
            };

            this.service.Insertar(nuevoFlete).subscribe(
                (respuesta: Respuesta) => {
                    if (respuesta.success) {
                        console.log('Encabezado insertado, RESPONSE:', respuesta.success);
                        this.encabezadoId = respuesta.data.codeStatus;

                        const detalles: FleteDetalle[] = this.insumosSeleccionados.map(insumo => ({
                            flde_Cantidad: insumo.cantidad,
                            flen_Id: this.encabezadoId,
                            inpp_Id: insumo.inpp_Id,
                            usua_Creacion: 3,
                            flde_FechaCreacion: new Date()
                        }));

                        console.log('Detalles a insertar:', detalles);

                        const inserciones = detalles.map(detalle => this.detalleService.Insertar(detalle));
                        forkJoin(inserciones).subscribe(
                            responses => {
                                console.log('Todos los detalles han sido insertados:', responses);
                                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Flete y detalles guardados correctamente', life: 3000 });
                                this.limpiarCampos();
                                this.Cancelar();
                            },
                            error => {
                                console.error('Error insertando detalles:', error);
                                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al guardar los detalles', life: 3000 });
                            }
                        );
                    } else {
                        console.log('Error en la respuesta de insertar encabezado:', respuesta.success);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al guardar el encabezado', life: 3000 });
                    }
                },
                (error) => {
                    console.error('Error insertando encabezado:', error);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al guardar el encabezado', life: 3000 });
                }
            );
        } else {
            console.log('Formulario inválido');
            this.form.markAllAsTouched();
        }
    }


    limpiarCampos() {
        this.insumosSeleccionados = [];
        this.ListadoInsumos();
        this.form.reset();
        this.valSwitch = false;
        this.form.patchValue({ flen_DestinoProyecto: false });
        this.Indexactivo = 0;
    }

    Guardar() {
        this.submitted = true;
        if (this.form.valid) {
            this.Indexactivo = 1;
        } else {
            console.log('Formulario inválido');
            this.form.markAllAsTouched();
        }
    }




Listado() {
    this.service.Listar().subscribe(
        (data: any) => {
            this.fletes = data.map((flete: any) => ({
                ...flete,
                flen_FechaCreacion: new Date(flete.flen_FechaCreacion).toLocaleDateString(),
                flen_FechaModificacion: new Date(flete.flen_FechaModificacion).toLocaleDateString(),
                flen_FechaHoraEstablecidaDeLlegada: new Date(flete.flen_FechaHoraEstablecidaDeLlegada).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                items: this.getItems(flete)
            }));
            console.log('Listado de fletes:', this.fletes);
        },
        (error) => {
            console.log('Error al listar fletes:', error);
        }
    );
}




    limpiarVerificacion() {
        this.verificarForm.reset();
        this.pendientes = [];
        this.verificados = [];
        this.Verificacion = false;
        this.Index = true;
    }

    convertToISOFormat(date: Date | string): string {
        if (!date) return null;
        const parsedDate = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(parsedDate.getTime())) {
            console.error('Invalid date value:', date);
            return null;
        }
        return parsedDate.toISOString();
    }

    CancelarVerificacion() {
        this.Verificacion = false;
        this.Index = true;
    }









    convertToISODate(date: string | Date): string {
        if (!date) return null;
        let parsedDate = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(parsedDate.getTime())) {
            console.error('Invalid date value:', date);
            return null;
        }
        return parsedDate.toISOString();
    }













    agregarIncidencia() {
        const incidencias = this.incidenciasForm.get('incidencias') as FormArray;
        incidencias.push(this.fb.control('', Validators.required));
        console.log('Formulario de incidencias:', this.incidenciasForm.value);
    }

    submitIncidencias() {
        const incidencias = this.incidenciasForm.value.incidencias.map((descripcion: string) => ({
            flcc_DescripcionIncidencia: descripcion,
            flen_Id: this.flete.flen_Id,
            usua_Creacion: 1,
            flcc_FechaHoraIncidencia: new Date()
        }));

        console.log('Enviar incidencias:', incidencias);

        incidencias.forEach((incidencia: any) => {
            this.controlCalidadService.Insertar(incidencia).subscribe(
                (respuesta: Respuesta) => {
                    console.log('Respuesta de incidencia:', respuesta);
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Incidencia reportada correctamente', life: 3000 });
                },
                (error) => {
                    console.error('Error al reportar incidencia:', error);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al reportar la incidencia', life: 3000 });
                }
            );
        });

        this.incidenciasDialog = false;
        this.Listado();
    }

    get detalless() {
        return this.verificarForm.get('detalles') as FormArray;
    }

    getItems(flete: Flete): MenuItem[] {
        if (flete.estado === 'Llego') {
            return [
                {
                    label: 'Incidencias',
                    icon: 'pi pi-minus-circle',
                    command: (event: any) => {
                        this.BuscarIncidencias(this.rowactual);
                    },
                },
                {
                    label: 'Editar',
                    icon: 'pi pi-check',
                    command: (event: any) => {
                        // this.Editar(this.rowactual);
                    },
                },
                {
                    label: 'Detalle',
                    icon: 'pi pi-eye',
                    command: (event: any) => {
                        // this.Details(this.rowactual);
                    },
                },

                {
                    label: 'Ver Verificación',
                    icon: 'pi pi-eye',
                    command: () => {
                        this.VerVerificacion(flete);
                    }
                },
            ];
        } else {
            return [
                {
                    label: 'Incidencias',
                    icon: 'pi pi-minus-circle',
                    command: (event: any) => {
                        this.BuscarIncidencias(this.rowactual);
                    },
                },
                {
                    label: 'Verificar',
                    icon: 'pi pi-check',
                    command: (event: any) => {
                        this.Verificar(this.rowactual);
                    },
                },
                {
                    label: 'Editar',
                    icon: 'pi pi-check',
                    command: (event: any) => {
                        // this.Editar(this.rowactual);
                    },
                },
                {
                    label: 'Detalle',
                    icon: 'pi pi-eye',
                    command: (event: any) => {
                        // this.Details(this.rowactual);
                    },
                },

            ];
        }
    }



    ListadoEmpleados() {
        this.service.ListarEmpleados().subscribe(
            (Empleado: autocompleteEmpleado[]) => {
                this.empleados = Empleado;
            },
            (error) => {
                console.log(error);
            }
        );
    }
    ListadoBodegas() {
        this.service.ListarBodegas().subscribe(
            (data: Bodega[]) => {
                this.bodegas = data;
            },
            (error) => {
                console.log(error);
            }
        );
    }
    onSwitchChange(event: any) {
        this.form.patchValue({ llegada: '' });
        if (event.checked) {
            this.ListadoProyectos();
            this.placeholderLlegada = 'Seleccione un proyecto';
        } else {
            this.ListadoBodegas();
            this.placeholderLlegada = 'Seleccione una bodega';
        }
    }

    ListadoProyectos() {
        this.bodegas = [
            { bode_Id: 1, bode_Descripcion: 'Proyecto A' },
            { bode_Id: 2, bode_Descripcion: 'Proyecto B' }
        ];
    }

    filterEmpleado(event: any) {
        const query = event.query.toLowerCase();
        this.filtradoEmpleado = this.empleados.filter((empleado) =>
            empleado.empleado.toLowerCase().includes(query)
        );
    }

    filterBodegas(event: any) {
        const query = event.query.toLowerCase();
        this.filtradoBodegas = this.bodegas.filter((bodega) =>
            bodega.bode_Descripcion.toLowerCase().includes(query)
        );
    }

    onEncargadoSelect(event: any) {
        const encargadoSeleccionado = event;
        console.log(encargadoSeleccionado.value);
        this.form.patchValue({
            emtr_Id: encargadoSeleccionado.value.empl_Id,
            encargado: encargadoSeleccionado.value.empleado,
        });
    }

    onSupervisorSalidaSelect(event: any) {
      const supervisorsalidaSeleccionado = event;
      console.log(supervisorsalidaSeleccionado.value);
      this.form.patchValue({
          emss_Id: supervisorsalidaSeleccionado.value.empl_Id,
          supervisorsalida: supervisorsalidaSeleccionado.value.empleado,
      });
  }

  onSupervisorLlegadaSelect(event: any) {
      const supervisorllegadaSeleccionado = event;
      console.log(supervisorllegadaSeleccionado.value);
      this.form.patchValue({
          emsl_Id: supervisorllegadaSeleccionado.value.empl_Id,
          supervisorllegada: supervisorllegadaSeleccionado.value.empleado,
      });
  }

    onBodegaSalidaSelect(event: any) {
        const salidaSeleccionada = event;
        console.log(salidaSeleccionada.value);
        this.form.patchValue({
            boll_Id: salidaSeleccionada.value.bode_Id,
            salida: salidaSeleccionada.value.bode_Descripcion,
        });
    }
    onBodegaLlegadaSelect(event: any) {
      const llegadaSeleccionada = event;
      console.log(llegadaSeleccionada.value);
      this.form.patchValue({
          bopr_Id: llegadaSeleccionada.value.bode_Id,
          llegada: llegadaSeleccionada.value.bode_Descripcion,
      });
  }
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    CrearFlete() {
        this.Index = false;
        this.CreateEdit = true;
        this.Edit = false;
        this.form.reset();
        this.form.patchValue({ flen_DestinoProyecto: false });

    }
W
    Cancelar() {
        this.CreateEdit = false;
        this.Edit = false;
        this.Index = true;
        this.form.reset();
        this.submitted = false;
        this.form.patchValue({ flen_DestinoProyecto: false });
    }




formatDate(date: Date): string {
  return date.toISOString();
}



    hola() {
        this.Index = true;
        this.detalles = false;
        this.fletess = [];
    }

    setIndexActivo(index: number) {
        this.Indexactivo = index;
    }

    isOutlined(index: number): boolean {
        return this.Indexactivo !== index;
    }












    updateInsumoCantidad(insumo: any) {
        const insumoDisponible = this.insumos.find(item => item.codigo === insumo.codigo);
        if (insumoDisponible) {
            const diferencia = insumo.cantidadSeleccionada - insumo.cantidadPrevia;
            insumoDisponible.bopi_Stock -= diferencia;
            insumo.cantidadPrevia = insumo.cantidadSeleccionada;
        }
    }

    onInsumoCantidadChange(event: any, insumo: any) {
        const nuevaCantidad = event.target.valueAsNumber || 0;
        if (nuevaCantidad >= 0 && nuevaCantidad <= (insumo.cantidadPrevia + insumo.bopi_Stock)) {
            insumo.cantidadSeleccionada = nuevaCantidad;
            this.updateInsumoCantidad(insumo);
        } else {
            event.preventDefault();
        }
    }

    onInsumoSelect(event: any) {
        const insumoSeleccionado = event;
        insumoSeleccionado.cantidadSeleccionada = 0;
        insumoSeleccionado.cantidadPrevia = 0;
        this.insumosSeleccionados.push(insumoSeleccionado);
    }



    agregarInsumo(insumo: any) {
        const insumoSeleccionado = { ...insumo, cantidad: 1, cantidadPrevia: 0 };
        this.insumosSeleccionados.push(insumoSeleccionado);
    }


    insumoAgregado(codigo: string): boolean {
        return this.insumosSeleccionados.some(insumo => insumo.codigo === codigo);
    }


    actualizarCantidad(insumo) {
        const originalInsumo = this.insumos.find(i => i.codigo === insumo.codigo);

        if (insumo.cantidad < 1) {
            insumo.cantidad = 1;
            insumo.cantidadError = 'La cantidad no puede ser menor que 1';
        } else if (insumo.cantidad > originalInsumo.bopi_Stock) {
            insumo.cantidad = originalInsumo.bopi_Stock;
            insumo.cantidadError = 'La cantidad no puede ser mayor que el stock';
        } else {
            insumo.cantidadError = '';
            originalInsumo.bopi_Stock -= insumo.cantidad - (insumo.cantidadAnterior || 0);
            insumo.cantidadAnterior = insumo.cantidad;
        }
    }



    eliminarInsumo(insumo: any) {
        const index = this.insumosSeleccionados.indexOf(insumo);
        if (index > -1) {
            this.insumosSeleccionados.splice(index, 1);

            const insumoDisponible = this.insumos.find(item => item.codigo === insumo.codigo);
            if (insumoDisponible) {
                insumoDisponible.bopi_Stock += insumo.cantidad;
            }
        }
    }

    VerVerificacion(flete: Flete) {
        this.flete = flete;
        console.log('Ver Verificación flete:', flete);
        this.detalleService.Buscar(flete.flen_Id).subscribe(
            (data: FleteDetalle[]) => {
                console.log('Detalles del flete:', data);
                this.fleteDetalles = data;
                this.DetalleVerificacion = true;
                this.Index = false;
            },
            (error) => {
                console.error('Error al obtener detalles del flete:', error);
            }
        );
    }






    regresarIndex()
    {
        this.Index = true;
        this.IndexIncidencias = false;
    }



        // INCIDENCIAAAAAAAAA


        BuscarIncidencias(flete: Flete) {
            this.flete = flete;
            this.fleteIncidenciaId = flete.flen_Id;

            this.controlCalidadService.BuscarIncidencias(flete.flen_Id).subscribe(
                (data: any) => {

                    this.incidencias = data.map((incidencia: any) => ({
                        ...incidencia,
                        flcc_FechaCreacion: new Date(incidencia.flcc_FechaCreacion).toLocaleDateString(),
                        flcc_FechaModificacion: new Date(incidencia.flcc_FechaModificacion).toLocaleDateString(),
                        flcc_FechaHoraIncidencia: new Date(incidencia.flcc_FechaHoraIncidencia).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        flen_FechaHoraEstablecidaDeLlegada: new Date(incidencia.flen_FechaHoraEstablecidaDeLlegada).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                    }));
                    console.log('Listado de Incidencias:', this.incidencias);
                    this.IndexIncidencias = true;
                    this.Index = false;

                    this.actualizarTituloConFecha(flete.flen_FechaHoraSalida);
                },
                (error) => {
                    console.log('Error al listar Incidencias:', error);
                }
            );
        }

        actualizarTituloConFecha(fechaSalida: string) {
            const fecha = new Date(fechaSalida).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
            this.titulo = `Incidencias Flete - ${fecha}`;
        }


    getItemsIncidencias(): MenuItem[] {
        return [
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                command: (event: any) => {
                    this.EditarIncidencia();
                },
            },

            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: (event: any) => {
                    this.EliminarIncidencia()
                },
            },
        ];
    }

    CrearIncidencia() {
        this.Index = false;
        this.IndexIncidencias = false;
        this.createIncidencia = true;
        this.formIncidencias.reset();
        this.identity = "crear";
        this.titulo = `Nueva Incidencia Flete - ${this.formatearFecha(this.flete.flen_FechaHoraSalida)}`;
        this.formIncidencias.patchValue({
            flen_Id: this.fleteIncidenciaId
        });
    }


    EditarIncidencia() {
        this.Index = false;
        this.IndexIncidencias = false;
        this.createIncidencia = true;
        this.formIncidencias.reset();
        this.identity = "editar";
        this.titulo = `Editar Incidencia ${this.selectedIncidencia.codigo} - ${this.formatearFecha(this.flete.flen_FechaHoraSalida)}`;

        const rawDate = this.selectedIncidencia.flcc_FechaHoraIncidencia;
        const parts = rawDate.split(', ');
        const dateParts = parts[0].split('/');
        const timeParts = parts[1].split(':');

        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timeParts[0]}:${timeParts[1]}:00`;
        const date = new Date(formattedDate);

        this.formIncidencias.patchValue({
            flcc_DescripcionIncidencia: this.selectedIncidencia.flcc_DescripcionIncidencia,
            flcc_FechaHoraIncidencia: date,
            flen_Id: this.selectedIncidencia.flen_Id
        });
        this.idIncidencia = this.selectedIncidencia.flcc_Id;
    }

    formatearFecha(fecha: string): string {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    }





    selectIncidencia(Incidencia: any) {
        this.selectedIncidencia = Incidencia;
      }

      EliminarIncidencia(){
        this.idIncidencia = this.selectedIncidencia.flcc_Id;
        this.deleteIncidencia = true;
       }

      GuardarIncidencia() {
        console.log("ENTRAA")
        if (this.formIncidencias.valid) {
            console.log("VALIDO")
          const Incidencia: any = {
            flcc_Id: this.idIncidencia,
            flcc_DescripcionIncidencia: this.formIncidencias.value.flcc_DescripcionIncidencia,
            flcc_FechaHoraIncidencia: this.formIncidencias.value.flcc_FechaHoraIncidencia,
            flen_Id: this.fleteIncidenciaId,
            usua_Creacion: 3,
            usua_Modificacion: 3
            };

          if (this.identity != "editar") {
            this.controlCalidadService.Insertar(Incidencia).subscribe(
              (respuesta: Respuesta) => {
                console.log(respuesta)
                if (respuesta.success) {
                  this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });
                  this.BuscarIncidencias(this.rowactual);
                  this.CerrarIncidencia();
                } else {
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Insertado fallido', life: 3000 });
                  console.log('RESPONSE:' + respuesta.success)

                }
              }
            );
          }else{
            this.controlCalidadService.Actualizar(Incidencia).subscribe(
              (respuesta: Respuesta) => {
                console.log(respuesta)
                if (respuesta.success) {
                  this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 });

                  this.BuscarIncidencias(this.rowactual);
                  this.CerrarIncidencia();
                } else {
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Actualizado fallido', life: 3000 });
                  console.log('RESPONSE:' + respuesta.success)
                }
              }
            );
          }

        } else {
         this.submittedIncidencia = true;
        }
      }

      Eliminar1() {
        this.controlCalidadService.Eliminar(this.idIncidencia).subscribe(
          (respuesta: Respuesta) => {
            console.log(respuesta)
            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000 });
              this.BuscarIncidencias(this.rowactual);
              this.deleteIncidencia = false;
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Eliminado fallido', life: 3000 });
              this.deleteIncidencia = false;
            }
          }
        );


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

    // INCIDENCIAAAAAAAAA




    CerrarIncidencia() {
        this.Index = false;
        this.IndexIncidencias = true;
        this.createIncidencia = false;
        this.formIncidencias.reset();
    }

      //FUNCIONALIDAD DE PARTICION DE INSUMOS SELECCIONADOS Y NO LLEGADOS





 finalizarVerificacion() {
    if (this.verificarForm.valid) {
        const fleteActualizado: Flete = {
            flen_Id: this.flete.flen_Id ?? 0,
            flen_FechaHoraSalida: this.convertToISOFormat(this.flete.flen_FechaHoraSalida) ?? this.convertToISOFormat(new Date()),
            flen_FechaHoraEstablecidaDeLlegada: this.convertToISOFormat(this.flete.flen_FechaHoraEstablecidaDeLlegada) ?? this.convertToISOFormat(new Date()),
            flen_FechaHoraLlegada: this.convertToISOFormat(this.verificarForm.get('flen_FechaHoraLlegada').value) ?? this.convertToISOFormat(new Date()),
            flen_Estado: this.flete.flen_Estado ?? false,
            flen_DestinoProyecto: this.flete.flen_DestinoProyecto ?? false,
            boll_Id: this.flete.boll_Id ?? 0,
            bopr_Id: this.flete.bopr_Id ?? 0,
            emtr_Id: this.flete.emtr_Id ?? 0,
            emss_Id: this.flete.emss_Id ?? 0,
            emsl_Id: this.flete.emsl_Id ?? 0,
            usua_Creacion: this.flete.usua_Creacion ?? 0,
            flen_FechaCreacion: this.convertToISOFormat(this.flete.flen_FechaCreacion) ?? this.convertToISOFormat(new Date()),
            usua_Modificacion: 3,
            flen_FechaModificacion: this.convertToISOFormat(new Date()),
            flen_EstadoFlete: this.flete.flen_EstadoFlete ?? 0
        };

        this.service.Actualizar(fleteActualizado).subscribe(
            (response) => {
                const actualizaciones = [];
                const inserciones = [];

                // Procesar detalles verificados
                this.verificados.forEach(detalle => {
                    detalle.flde_llegada = true;
                    detalle.usua_Modificacion = 3;
                    actualizaciones.push(this.detalleService.Actualizar(detalle));
                });

                // Procesar detalles pendientes
                this.pendientes.forEach(detalle => {
                    // Si la cantidad pendiente es menor que la cantidad original, es un detalle particionado
                    if (detalle.flde_Cantidad < this.cantidadesOriginales[detalle.flde_Id]) {
                        const detalleNuevo = { ...detalle, flde_llegada: false, usua_Modificacion: 3 };
                        inserciones.push(this.detalleService.Insertar(detalleNuevo));
                    } else {
                        detalle.flde_llegada = false;
                        detalle.usua_Modificacion = 3;
                        actualizaciones.push(this.detalleService.Actualizar(detalle));
                    }
                });

                forkJoin(inserciones).subscribe(
                    insertResponses => {
                        const actualizacionesPostInsercion = insertResponses.map((resp, index) => {
                            if (resp.success && resp.data && resp.data.codeStatus) {
                                const detallePendiente = this.pendientes[index];
                                const detalleInsertado: FleteDetalle = {
                                    flde_Id: resp.data.codeStatus,
                                    flde_Cantidad: detallePendiente.flde_Cantidad,
                                    flen_Id: detallePendiente.flen_Id,
                                    inpp_Id: detallePendiente.inpp_Id,
                                    usua_Creacion: detallePendiente.usua_Creacion,
                                    flde_FechaCreacion: detallePendiente.flde_FechaCreacion,
                                    usua_Modificacion: 3,
                                    flde_FechaModificacion: new Date(),
                                    flde_llegada: false
                                };
                                return this.detalleService.Actualizar(detalleInsertado);
                            }
                            return null;
                        }).filter(act => act !== null);

                        forkJoin([...actualizaciones, ...actualizacionesPostInsercion]).subscribe(
                            responses => {
                                this.Listado();
                                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Flete y detalles actualizados exitosamente' });
                                this.limpiarVerificacion();
                            },
                            error => {
                                console.error('Error en actualizaciones post inserción:', error);
                                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar detalles post inserción' });
                            }
                        );
                    },
                    error => {
                        console.error('Error en inserciones:', error);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al insertar detalles' });
                    }
                );
            },
            (error: HttpErrorResponse) => {
                console.error('Error al actualizar el flete:', error);
                if (error.error.errors) {
                    console.log('Error details:', error.error.errors);
                } else {
                    console.log('Error message:', error.message);
                }
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el flete' });
            }
        );
    } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Formulario no es válido' });
    }
}






revertirInsumo(insumo: FleteDetalle, index: number) {
    const cantidadOriginal = this.cantidadesOriginales[insumo.flde_Id];
    this.verificados = this.verificados.filter(v => v.flde_Id !== insumo.flde_Id);

    let pendienteExistente = this.pendientes.find(p => p.flde_Id === insumo.flde_Id);
    if (pendienteExistente) {
        pendienteExistente.flde_Cantidad = cantidadOriginal;
    } else {
        const nuevoPendiente = { ...insumo, flde_Cantidad: cantidadOriginal, verificado: false };
        this.pendientes.push(nuevoPendiente);
    }
}


actualizarFormulario() {
    const detallesArray = this.pendientes.map(det => this.fb.group({
        insu_Descripcion: [det.insu_Descripcion],
        unme_Nombre: [det.unme_Nombre],
        bode_Descripcion: [det.bode_Descripcion],
        flde_Cantidad: [det.flde_Cantidad, Validators.required],
        verificado: [det.verificado]
    }));
    this.verificarForm.setControl('detalles', this.fb.array(detallesArray));
}

Verificar(flete: Flete) {
    this.flete = flete;
    this.detalleService.Buscar(flete.flen_Id).subscribe(
        (data: FleteDetalle[]) => {
            this.pendientes = data.map(det => ({ ...det, verificado: false }));
            this.verificados = [];
            this.pendientes.forEach(detalle => {
                this.cantidadesOriginales[detalle.flde_Id] = detalle.flde_Cantidad;
            });
            this.actualizarFormulario();
            this.Verificacion = true;
            this.Index = false;
        },
        (error) => {
            console.error('Error al obtener detalles del flete:', error);
        }
    );
}

onCheckboxChange(event: any, detalle: FleteDetalle, index: number) {
    detalle.verificado = event.checked;
    if (detalle.verificado) {
        this.verificados.push({ ...detalle, flde_Cantidad: this.cantidadesOriginales[detalle.flde_Id] });
        this.pendientes.splice(index, 1);
    } else {
        const cantidadOriginal = this.cantidadesOriginales[detalle.flde_Id];
        this.pendientes.push({ ...detalle, flde_Cantidad: cantidadOriginal - detalle.flde_Cantidad, verificado: false });
        this.verificados = this.verificados.filter(v => v.flde_Id !== detalle.flde_Id);
    }
    this.actualizarFormulario();
}

onCantidadChange(event: any, insumo: FleteDetalle, index: number) {
    const nuevaCantidad = event.target.valueAsNumber || 0;
    const cantidadOriginal = this.cantidadesOriginales[insumo.flde_Id];
    this.actualizarPendientesVerificados(insumo, nuevaCantidad, cantidadOriginal);
}

actualizarPendientesVerificados(insumo: FleteDetalle, nuevaCantidad: number, cantidadOriginal: number) {
    const cantidadPendiente = cantidadOriginal - nuevaCantidad;
    if (cantidadPendiente > 0) {
        let pendienteExistente = this.pendientes.find(p => p.flde_Id === insumo.flde_Id);
        if (pendienteExistente) {
            pendienteExistente.flde_Cantidad = cantidadPendiente;
        } else {
            const nuevoPendiente = { ...insumo, flde_Cantidad: cantidadPendiente, verificado: false };
            this.pendientes.push(nuevoPendiente);
        }
    } else {
        this.pendientes = this.pendientes.filter(p => p.flde_Id !== insumo.flde_Id);
    }

    if (nuevaCantidad === 0) {
        this.verificados = this.verificados.filter(v => v.flde_Id !== insumo.flde_Id);
    } else {
        let verificadoExistente = this.verificados.find(v => v.flde_Id === insumo.flde_Id);
        if (verificadoExistente) {
            verificadoExistente.flde_Cantidad = nuevaCantidad;
        } else {
            this.verificados.push(insumo);
        }
    }
}











}
