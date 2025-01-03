import {
    Component,
    ElementRef,
    OnInit,
    OnDestroy,
    ViewChild,
    ViewEncapsulation,
    HostListener,
    ComponentFactoryResolver,
    Inject
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { pipe, Subscription } from 'rxjs';
import { gantt } from 'dhtmlx-gantt';
import { DatePipe } from '@angular/common';
import { TaskService } from '../../../services/servicesproyecto/task.service';
import { LinkService } from '../../../services/servicesproyecto/link.service';
import { GanttService } from 'src/app/demo/services/servicesproyecto/gantt.service';
import { EtapaPorProyectoService } from 'src/app/demo/services/servicesproyecto/etapaporproyecto.service';
import { ActividadPorEtapaService } from 'src/app/demo/services/servicesproyecto/actividadporetapa.service';
import { NavigationStateService } from 'src/app/demo/services/navigationstate.service';
import { Proyecto } from 'src/app/demo/models/modelsproyecto/proyectoviewmodel';
import { TaskViewModel } from 'src/app/demo/models/modelsproyecto/taskviewmodel';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    FormsModule,
} from '@angular/forms';
import { EtapaService } from 'src/app/demo/services/servicesproyecto/etapa.service';
import { ActividadService } from 'src/app/demo/services/servicesproyecto/actividad.service';
import { Actividad } from 'src/app/demo/models/modelsproyecto/actividadviewmodel';
import { EtapaPorProyecto } from 'src/app/demo/models/modelsproyecto/proyectoviewmodel';
import { ActividadPorEtapa } from 'src/app/demo/models/modelsproyecto/proyectoviewmodel';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { Etapa } from 'src/app/demo/models/modelsproyecto/etapaviewmodel';
import { Dropdown } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from 'src/app/demo/services/servicesgeneral/empleado.service';
import { Empleado } from 'src/app/demo/models/modelsgeneral/empleadoviewmodel';
import { CookieService } from 'ngx-cookie-service';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { parseAsync } from 'docx-preview';
import { Router } from '@angular/router';
import { unidadMedidaService } from 'src/app/demo/services/servicesgeneral/unidadmedida.service';
import { UnidadMedida } from 'src/app/demo/models/modelsgeneral/unidadmedidaviewmodel';
import { get } from 'lodash';

interface AutoCompleteCompleteEvent {
    originalEvent: Event;
    query: string;
}

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-gantt',
    standalone: true,
    imports: [
        DialogModule,
        ButtonModule,
        InputSwitchModule,
        DropdownModule,
        InputTextModule,
        ReactiveFormsModule,
        FormsModule,
        AutoCompleteModule,
        CommonModule,
        CalendarModule,
        InputTextareaModule,
    ],
    templateUrl: './gantt.component.html',
    styleUrl: './gantt.component.scss',
    providers: [
        TaskService,
        LinkService,
        DatePipe,
        EtapaPorProyectoService,
        EtapaService,
        ActividadService,
        CookieService,
        unidadMedidaService
    ],
})
export class GanttComponent implements OnInit {
    @ViewChild('gantt_here', { static: true }) ganttContainer!: ElementRef;

    //VARIABLES
    private subscriptionPdf: Subscription;
    private subscriptionPng: Subscription;
    private subscriptionExcel: Subscription;
    private subscriptionProject: Subscription;
    private subscriptionFullscreen: Subscription;

    proyecto: Proyecto = {};
    etapas: Etapa[] = [];
    etapasFiltradas: Etapa[];
    actividades: Actividad[] = [];
    actividadesFiltradas: Actividad[] = [];
    empleados: Empleado[] = [];
    empleadosFiltrados: Empleado[];
    unidades: UnidadMedida[];
    unidadesFiltradas: UnidadMedida[];
    tasks: any[] = [];
    dblClickTask: any = {};
    draggedTask: any = {};
    tasksSelected: any[] = [];
    taskSelected: any = {};

    mostrarModalEtapa: boolean = false;
    mostrarModalActividad: boolean = false;
    mostrarModalEliminar: boolean = false;
    mostrarModalConfirmar: boolean = false;
    formEtapa: FormGroup;
    formActividad: FormGroup;
    submitEtapa: boolean = false;
    submitACtividad: boolean = false;
    parent: number;
    actualizando: boolean = false;
    jefesCuadrilla: Empleado[] = [];
    todosMenosJefeCuadrilla: Empleado[] =[];
    loading: boolean = false;
    minDate: Date;
    maxDate: Date;

    errorEtapa: string;
    errorEncargado: string;
    errorUnidadMedida: string;
    errorActividad: string;

    constructor(
        private taskService: TaskService,
        private linkService: LinkService,
        private GanttService: GanttService,
        private datePipe: DatePipe,
        private EtapaPorProyectoService: EtapaPorProyectoService,
        private ActividadPorEtapaService: ActividadPorEtapaService,
        private navigationStateService: NavigationStateService,
        private FormBuilder: FormBuilder,
        private etapaService: EtapaService,
        private actividadService: ActividadService,
        private empleadoService: EmpleadoService,
        private CookieService: CookieService,
        private Router: Router,
        private UnidadMedidaServide: unidadMedidaService,
        @Inject(DOCUMENT) private document: Document
    ) {
        this.minDate = new Date(1920, 0, 1);
        this.maxDate = new Date(9999, 0, 1);

        this.formEtapa = this.FormBuilder.group({
            etapa: [null,],
            encargado: [null,],
        });
        this.formActividad = this.FormBuilder.group({
            actividad: [null,],
            encargado: [null, Validators.required],
            fechaInicio: [null, Validators.required],
            fechaFin: [null, Validators.required],
            unidadMedida: [null,],
            cantidad: [null, Validators.required],
            observaciones: [null]
        });
    }

    @HostListener('window:keydown.escape', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        gantt.unselectTask();
    }

    @HostListener('window:keydown.c', ['$event'])
    handleQAEvent(event: KeyboardEvent) {
        this.tasksSelected = gantt.getSelectedTasks();
        if(this.tasksSelected.length > 0 && this.mostrarModalActividad == false && this.mostrarModalEtapa == false) {
            this.taskSelected = gantt.getTask(this.tasksSelected[0]);
            if(this.taskSelected.parent != 0){
            const actividad = {
                acti_Descripcion: this.taskSelected.text,
                acet_Id: this.taskSelected.dbid,
                etap_Descripcion: gantt.getTask(this.taskSelected.parent).text,
                etpr_Id: this.taskSelected.parent,
                proy_Nombre: this.proyecto.proy_Nombre,
                proy_Id: this.proyecto.proy_Id,
                acet_Cantidad: this.taskSelected.acet_Cantidad
            }
            this.closeFullscreen();
            this.CookieService.set('QAactividad', JSON.stringify(actividad))
            this.Router.navigate(['/sigesproc/proyecto/controlcalidadchild']);
            event.preventDefault();
            }
        }
    }

    @HostListener('window:keydown.i', ['$event'])
    handleIncidenteEvent(event: KeyboardEvent) {
        this.tasksSelected = gantt.getSelectedTasks();
        if(this.tasksSelected.length > 0 && this.mostrarModalActividad == false && this.mostrarModalEtapa == false) {
            this.taskSelected = gantt.getTask(this.tasksSelected[0]);
            if(this.taskSelected.parent != 0){
                const actividad = {
                    acti_Descripcion: this.taskSelected.text,
                    acet_Id: this.taskSelected.dbid,
                    etap_Descripcion: gantt.getTask(this.taskSelected.parent).text,
                    etpr_Id: this.taskSelected.parent,
                    proy_Nombre: this.proyecto.proy_Nombre,
                    proy_Id: this.proyecto.proy_Id,
                    
                }
                this.closeFullscreen();
                this.CookieService.set('IncidenteActividad', JSON.stringify(actividad))
                this.Router.navigate(['/sigesproc/proyecto/incidente']);
                event.preventDefault();
            }
        }
    }

    @HostListener('window:keydown.backspace', ['$event'])
    handleDeleteKeyboardEvent(event: KeyboardEvent) {
        this.tasksSelected = gantt.getSelectedTasks();
        if(this.tasksSelected.length === 1 && this.mostrarModalActividad == false && this.mostrarModalEtapa == false) {
            this.taskSelected = gantt.getTask(this.tasksSelected[0]);
            this.mostrarModalEliminar = true;
            event.preventDefault();
        } else if (this.tasksSelected.length > 1 && this.mostrarModalActividad == false && this.mostrarModalEtapa == false) {
            this.mostrarModalEliminar = true;
            event.preventDefault();
        }
    }

    async ngOnInit() {
        if(this.CookieService.get('Token') == 'false') this.Router.navigate(['/auth/login'])
            this.loading = true;
        //GANTT INIT CONFIG
        {
            gantt.init(this.ganttContainer.nativeElement);

            this.proyecto = await JSON.parse(
                this.CookieService.get('proyecto')
            );
            this.proyecto.proy_FechaInicio = new Date(this.proyecto.proy_FechaInicio);
            this.proyecto.proy_FechaFin = new Date(this.proyecto.proy_FechaFin);

            gantt.i18n.setLocale('es');
            // gantt.config.drag_multiple = true;
            // gantt.config.drag_project = true;
            // gantt.config.autofit = true;
            // gantt.config.grid_elastic_columns = true;
            // gantt.config.date_grid = '%d/%m/%Y';
            // gantt.config.autosize = 'xy';
            gantt.config.drag_links = false;
            gantt.config.scale_height = 90;
            gantt.config.date_format = '%Y-%m-%d %H:%i';
            gantt.config.open_tree_initially = true;
            gantt.config.fit_tasks = true;
            gantt.config.drag_progress = false;
            gantt.config.show_tasks_outside_timescale = true;
            gantt.config.start_date = new Date(
                this.proyecto.proy_FechaInicio.getFullYear(),
                this.proyecto.proy_FechaInicio.getMonth(),
                this.proyecto.proy_FechaInicio.getDate()
            );
            gantt.config.end_date = new Date(
                this.proyecto.proy_FechaFin.getFullYear(),
                this.proyecto.proy_FechaFin.getMonth(),
                this.proyecto.proy_FechaFin.getDate() + 1
            );

            gantt.plugins({
                undo: true,
                redo: true,
                fullscreen: true,
                tooltip: true,
                export_api: true,
                multiselect: true,
                marker: true
            });

            var textEditor = { type: 'text', map_to: 'text' };
            var startDateEditor = { type: 'date', map_to: 'start_date' };
            var endDateEditor = { type: 'date', map_to: 'end_date' };
            var durationEditor = {
                type: 'number',
                map_to: 'duration',
                min: 0,
                max: 100,
            };
            var progressEditor = { type: 'number', map_to: 'progress' };
            var holderEditor = { type: 'text', map_to: 'holder' };

            gantt.config.columns = [
                { name: 'add', label: '' },
                {
                    name: 'idx',
                    label: '#',
                    width: 40,
                    align: 'center',
                    template: function (task) {
                        return gantt.getWBSCode(task);
                    },
                },
                {
                    name: 'incidentes',
                    label: '',
                    width: 22,
                    align: 'center',
                    template: function (obj) {
                        return obj['incidentes'] > 0
                            ? '<i class="pi pi-exclamation-circle" style="color:red "></i>'
                            : '';
                    },
                },
                {
                    name: 'text',
                    label: 'Tarea',
                    tree: true,
                    min_width: 160,
                    // editor: textEditor,
                },
                {
                    name: 'start_date',
                    label: 'Fecha Inicio',
                    align: 'center',
                    min_width: 80,
                    // editor: startDateEditor,
                },
                {
                    name: 'end_date',
                    label: 'Fecha Fin',
                    align: 'center',
                    min_width: 80,
                    // editor: endDateEditor,
                },
                {
                    name: 'duration',
                    label: 'Duración',
                    align: 'center',
                    // editor: durationEditor,
                    template: function (obj) {
                        return obj.duration > 1
                            ? obj.duration + ' días'
                            : obj.duration + ' día';
                    },
                },
                {
                    name: 'holder',
                    label: 'Responsable',
                    align: 'center',
                    min_width: 130,
                    // editor: holderEditor,
                },
                {
                    name: 'progress',
                    label: 'Progreso',
                    align: 'center',
                    editor: progressEditor,
                    template: function (obj) {
                        return (obj.progress * 100).toFixed(2) + '%';
                    },
                },
            ];

            gantt.templates.task_class = function (start, end, task) {
                if (task.parent == '0') {
                    return 'etapa';
                } else {
                    return '';
                }
            };

            gantt.templates.rightside_text = function (start, end, task) {
                return `${task.progress * 100}%`;
            };

            gantt.addMarker({
                start_date: new Date(), 
                css: "today",
                text: "Hoy", 
            });

            //TASK SCALE
            gantt.attachEvent('onLightboxSave', function (id, task, is_new) {
                var taskStart = task.start_date;
                var taskEnd = task.end_date;
                var scaleStart = gantt.config.start_date;
                var scaleEnd = gantt.config.end_date;

                if (scaleStart > taskEnd || scaleEnd < taskStart) {
                    gantt.config.end_date = new Date(
                        Math.max(taskEnd.valueOf(), scaleEnd.valueOf())
                    );
                    gantt.config.start_date = new Date(
                        Math.min(taskStart.valueOf(), scaleStart.valueOf())
                    );
                    gantt.render();
                }
                return true;
            });

            // esconde boton add para tareas
            gantt.templates.grid_row_class = function (start, end, task) {
                if (task.$level > 0) {
                    return 'nested_task';
                }
                return '';
            };

            //CUSTOM TOOLTIP
            // gantt.config.tooltip_hide_timeout = 1000;

            gantt.templates.tooltip_text = function (start, end, task) {
                return (
                    '<b>Tarea:</b> ' +
                    task.text +
                    '<br/><b>Duración:</b> ' +
                    (task.duration > 1
                        ? task.duration + ' días'
                        : task.duration + 'día') +
                    '<br/><b>Inicio:</b> ' +
                    gantt.templates.tooltip_date_format(task.start_date) +
                    '<br/><b>Fin:</b> ' +
                    gantt.templates.tooltip_date_format(task.end_date) +
                    '<br/><b>Responsable:</b> ' +
                    task['holder'] +
                    '<br/><b>Progreso:</b> ' +
                    task.progress * 100 +
                    '%' +
                    (task['incidentes'] > 0 ? '<br/><b>Incidentes:</b> ' +
                    task['incidentes'] : '')
                );
            };

            function getWeekOfMonthNumber(date) {
                let firstDayOfMonth = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    1
                );
                let firstDayWeekday = firstDayOfMonth.getDay();
                let dayOfMonth = date.getDate();
                let weekOfMonth = Math.ceil((dayOfMonth + firstDayWeekday) / 7);

                return weekOfMonth;
            }

            //escalas
            gantt.config.scales = [
                { unit: 'month', step: 1, format: '%F, %Y' },
                {
                    unit: 'week',
                    step: 1,
                    format: function (date) {
                        return 'Semana #' + getWeekOfMonthNumber(date);
                    },
                },
                {
                    unit: 'day',
                    step: 1,
                    format: '%j %D',
                    css: function (date) {
                        if (!gantt.isWorkTime(date)) {
                            return 'week-end';
                        }
                        return '';
                    },
                },
            ];

            // configuracion de columnas
            gantt.config.layout = {
                css: 'gantt_container',
                cols: [
                    {
                        width: 400,
                        minWidth: 300,
                        maxWidth: 600,
                        rows: [
                            {
                                view: 'grid',
                                scrollX: 'gridScroll',
                                scrollable: true,
                                scrollY: 'scrollVer',
                            },

                            // horizontal scrollbar for the grid
                            {
                                view: 'scrollbar',
                                id: 'gridScroll',
                                group: 'horizontal',
                            },
                        ],
                    },
                    { resizer: true, width: 1 },
                    {
                        rows: [
                            {
                                view: 'timeline',
                                scrollX: 'scrollHor',
                                scrollY: 'scrollVer',
                            },

                            // horizontal scrollbar for the timeline
                            {
                                view: 'scrollbar',
                                id: 'scrollHor',
                                group: 'horizontal',
                                crollable: true,
                            },
                        ],
                    },
                    {
                        view: 'scrollbar',
                        id: 'scrollVer',
                        group: 'vertical',
                    },
                ],
            };

            gantt.init(this.ganttContainer.nativeElement);

            //TOOLBAR
            {
                this.subscriptionFullscreen =
                    this.GanttService.fullScreen.subscribe((isTrue) => {
                        if (isTrue) {
                            gantt.expand();
                            this.GanttService.msProject.next(false);
                        }
                    });

                this.subscriptionProject =
                    this.GanttService.msProject.subscribe((isTrue) => {
                        if (isTrue) {
                            gantt.exportToMSProject({
                                name:this.proyecto.proy_Nombre+".xml",
                                tasks: {
                                    'Tarea': function (task) {
                                        return task.text;

                                    },
                                    'Fecha Inicio': function (task) {
                                        return task.start_date;
                                    },
                                    'Fecha Fin': function (task) {
                                        return task.end_date;
                                    },
                                    'Responsable': function (task){
                                        return task.holder;
                                    }
                                }
                            });
                            this.GanttService.msProject.next(false);
                        }
                    });

                this.subscriptionPdf = this.GanttService.pdf.subscribe(
                    (isTrue) => {
                        if (isTrue) {
                            gantt.exportToPDF({
                                name:this.proyecto.proy_Nombre+".pdf",
                                header:"<h1 style='text-align: center; font-family: Raleway, sans-serif; color: #2e2e2e;'>"+this.proyecto.proy_Nombre+"</h1><style>.etapa{background-color: #605FE1; border:  solid 1px #7d7ae7;} .gantt_add, .gantt_grid_head_add{background-image: none;} div[data-column-name='add']{display: none;} .gantt_grid_head_cell, .gantt_tree_content, .gantt_side_content, .gantt_scale_cell, .gantt_task_scale{color: #2e2e2e !important;}</style>",
                                locale:"es",
                            });
                            this.GanttService.pdf.next(false);
                        }
                    }
                );

                this.subscriptionPng = this.GanttService.png.subscribe(
                    (isTrue) => {
                        if (isTrue) {
                            gantt.exportToPNG({
                                name:this.proyecto.proy_Nombre+".png",
                                header:"<h1 style='text-align: center; font-family: Raleway, sans-serif; color: #2e2e2e;'>"+this.proyecto.proy_Nombre+"</h1><style>.etapa{background-color: #605FE1; border:  solid 1px #7d7ae7;} .gantt_add, .gantt_grid_head_add{background-image: none;} div[data-column-name='add']{display: none;} .gantt_grid_head_cell, .gantt_tree_content, .gantt_side_content, .gantt_scale_cell, .gantt_task_scale{color: #2e2e2e !important;}</style>",
                                locale:"es",
                            });
                            this.GanttService.png.next(false);
                        }
                    }
                );

                this.subscriptionExcel = this.GanttService.excel.subscribe(
                    (isTrue) => {
                        if (isTrue) {
                            gantt.exportToExcel();
                            this.GanttService.excel.next(false);
                        }
                    }
                );

                // this.GanttService.deshacer.subscribe(() => {
                //     gantt.undo();
                // });

                // this.GanttService.rehacer.subscribe(() => {
                //     gantt.redo();
                // });

                this.GanttService.colapsar.subscribe((shouldCollapse) => {
                    const newState = shouldCollapse ? false : true;

                    gantt.eachTask(function (task) {
                        task.$open = newState;
                    });

                    gantt.render();
                });
            }
        }
        // END CONFIGURACION DE GANTT

        //CARGAR DATA GANTT
        {
            await this.EtapaPorProyectoService.Listar(
                this.proyecto.proy_Id
            ).then(async (etapas) => {
                // Array para almacenar las promesas de actividades
                const actividadPromises = [];
                etapas.forEach((etapa) => {
                    this.tasks.push({
                        id: etapa.etpr_Id,
                        text: etapa.etap_Descripcion,
                        start_date: etapa['etpr_FechaInicio']
                            ? new Date(etapa['etpr_FechaInicio'])
                            : new Date(this.proyecto.proy_FechaInicio),
                        end_date: etapa['etpr_FechaFin']
                            ? new Date(etapa['etpr_FechaFin'])
                            : new Date(
                                  this.proyecto.proy_FechaInicio.getFullYear(),
                                  this.proyecto.proy_FechaInicio.getMonth(),
                                  this.proyecto.proy_FechaInicio.getDate() + 1
                              ),
                        duration: Math.round(
                            (new Date(etapa['etpr_FechaFin']).getTime() -
                                new Date(etapa['etpr_FechaInicio']).getTime()) /
                                (1000 * 60 * 60 * 24)
                        ),
                        progress: (etapa['etpr_Progreso'] / 100).toFixed(2),
                        parent: 0,
                        holder: etapa['empl_NombreCompleto']
                            ? etapa['empl_NombreCompleto']
                            : 'no asignado',
                        dbid: etapa.etpr_Id,
                        etap_Id: etapa.etap_Id,
                        proy_Id: etapa.proy_Id,
                        empl_Id: etapa.empl_Id,
                        etpr_Estado: etapa.etpr_Estado
                    });

                    // Añadir la promesa de listar actividades al array
                    actividadPromises.push(
                        this.ActividadPorEtapaService.Listar(
                            etapa.etpr_Id
                        ).then((actividades) => {
                            if (actividades) {
                                actividades.forEach((actividad) => {
                                    this.tasks.push({
                                        id: Math.floor(-Date.now() * actividad.acet_Id),
                                        text: actividad.acti_Descripcion,
                                        start_date: actividad.acet_FechaInicio
                                            ? new Date(
                                                  actividad.acet_FechaInicio
                                              )
                                            : new Date(
                                                  etapa['etpr_FechaInicio']
                                              ),
                                        end_date: actividad.acet_FechaFin
                                            ? new Date(actividad.acet_FechaFin)
                                            : new Date(
                                                  etapa[
                                                      'etpr_FechaFin'
                                                  ].getFullYear(),
                                                  etapa[
                                                      'etpr_FechaFin'
                                                  ].getMonth(),
                                                  etapa[
                                                      'etpr_FechaFin'
                                                  ].getDate() + 1
                                              ),
                                        duration: Math.round(
                                            (new Date(
                                                actividad['acet_FechaFin']
                                            ).getTime() -
                                                new Date(
                                                    actividad[
                                                        'acet_FechaInicio'
                                                    ]
                                                ).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                        ),
                                        progress: (actividad.acet_Progreso / 100).toFixed(2),
                                        parent: etapa.etpr_Id,
                                        holder: actividad.empl_NombreCompleto
                                            ? actividad.empl_NombreCompleto
                                            : 'no asignado',
                                        dbid: actividad.acet_Id,
                                        acet_Id: actividad.acet_Id,
                                        acet_Observacion: actividad.acet_Observacion,
                                        acet_Cantidad: actividad.acet_Cantidad,
                                        unme_Id: actividad.unme_Id,
                                        acet_PrecioManoObraEstimado: actividad.acet_PrecioManoObraEstimado,
                                        acet_PrecioManoObraFinal: actividad.acet_PrecioManoObraFinal,
                                        espr_Id: actividad.espr_Id,
                                        empl_Id: actividad.empl_Id,
                                        acti_Id: actividad.acti_Id,
                                        etpr_Id: actividad.etpr_Id,
                                        acet_Estado: actividad.acet_Estado,
                                        incidentes: actividad['incidentes']
                                    });
                                });
                            }
                        })
                    );
                });
                await Promise.all(actividadPromises);
                this.tasks.forEach(etapa => {
                    this.RangoProyecto(etapa)
                })
                
            });
            gantt.parse({ data: this.tasks, links: [] });
        }
        //END CARGAR DATA GANTT

        //CARGAR DATA CRUDS
        this.cargarDatos();

        //END CARGAR DATA CRUDS

        // custom dialog
        gantt.attachEvent('onTaskDblClick', (id, e) => {
            this.dblClickTask = gantt.getTask(id);
            if(this.dblClickTask.parent == '0' && this.dblClickTask.progress < 1){
                this.actualizando = true;
                const etapaSeleccionada = this.etapas.find(etapa => etapa.etap_Id === this.dblClickTask.etap_Id);
                this.formEtapa.get('etapa').setValue(etapaSeleccionada);
                
                const encargadoSeleccionado = this.empleados.find(empleado => empleado.empl_Id === this.dblClickTask.empl_Id);
                this.formEtapa.get('encargado').setValue(encargadoSeleccionado);   
                this.mostrarModalEtapa = true;
            }else if(this.dblClickTask.parent != '0' && this.dblClickTask.progress < 1){
                this.actualizando = true;
                const actividadSeleccionada = this.actividades.find(actividad => actividad.acti_Id === this.dblClickTask.acti_Id);
                this.formActividad.get('actividad').setValue(actividadSeleccionada);
                
                const encargadoSeleccionado = this.empleados.find(empleado => empleado.empl_Id === this.dblClickTask.empl_Id);
                this.formActividad.get('encargado').setValue(encargadoSeleccionado);
                
                this.formActividad.get('fechaInicio').setValue(this.dblClickTask.start_date);
                this.formActividad.get('fechaFin').setValue(this.dblClickTask.end_date);
                
                this.formActividad.get('observaciones').setValue(this.dblClickTask.acet_Observacion);

                this.formActividad.get('cantidad').setValue(this.dblClickTask.acet_Cantidad);
                const unidadMedidaSeleccionada = this.unidades.find(unidadMedida => unidadMedida.unme_Id === this.dblClickTask.unme_Id);
                this.formActividad.get('unidadMedida').setValue(unidadMedidaSeleccionada);
                this.mostrarModalActividad = true;
            }
            return false;
        });

        gantt.batchUpdate( () => {
            gantt.eachSelectedTask((task_id) => {
                gantt.unselectTask(task_id);
            });
        });

        gantt.attachEvent('onBeforeTaskDrag', (id, mode, e) => {
            const task = gantt.getTask(id);
            if (task.parent === 0) {    
                return false;   
            }else{
                if(task.progress < 1){
                    this.draggedTask = task;
                return true;
                }else{
                    return false;
                }
                
            }
        });
        
        gantt.attachEvent('onAfterTaskDrag', (id, mode, e) => {
            const task = gantt.getTask(id);
            if(this.draggedTask.start_Date != task.start_date || this.draggedTask.end_Date != task.end_date){
                const actividadPorEtapa: ActividadPorEtapa = {
                    acet_Id: task['acet_Id'],
                    acet_Observacion: task['acet_Observacion'],
                    acet_Cantidad: task['acet_Cantidad'],
                    espr_Id: task['espr_Id'],
                    empl_Id: task['empl_Id'],
                    acet_FechaInicio: new Date(task.start_date.getFullYear(), task.start_date.getMonth(), task.start_date.getDate(), -6,0,0),
                    acet_FechaFin: new Date(task.end_date.getFullYear(), task.end_date.getMonth(), task.end_date.getDate(), -6,0,0),
                    acet_PrecioManoObraEstimado: task['acet_PrecioManoObraEstimado'],
                    acet_PrecioManoObraFinal: task['acet_PrecioManoObraFinal'],
                    acti_Id: task['acti_Id'],
                    unme_Id: task['unme_Id'],
                    etpr_Id: task['etpr_Id'],
                    usua_Modificacion: parseInt(this.CookieService.get('usua_Id')),
                    acet_FechaModificacion: new Date()
                }
                this.actualizarActividad(actividadPorEtapa).then(res => {
                    if(res.data.codeStatus > 0){
                        
                        //actualizo el rango de la etapa en base a su primer actividad ay ultima
                        const parentTask = gantt.getTask(this.draggedTask.parent)
                        // const children = [];
                        // gantt.eachTask((child) => {
                        //     children.push(child)
                        // }, parentTask.id);
                        // children.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
                        // const childTasks = children;
                        // const firstTask = childTasks[0];
                        // const lastTask = childTasks[childTasks.length - 1];
                        // parentTask.start_date = new Date(firstTask.start_date);
                        // parentTask.end_date = new Date(lastTask.end_date);
                        // gantt.updateTask(parentTask.id);
                        this.RangoEtapa(parentTask)
                    }
                })
                
                return true;
            }else{
                return false;
            }
        });

        gantt.attachEvent('onTaskCreated', (task) => {
            this.actualizando = false
            if (task.parent) {
                this.mostrarModalActividad = true;
                this.formActividad.reset();
                this.parent = parseInt(task.parent.toString(), 10);
            } else {
                this.mostrarModalEtapa = true;
                this.formEtapa.reset();
            }
            return false;
        });

    } //end ngOnInit

    //FILTRADOS
    filtrarEtapas(event: any) {
        const query = event.query.toLowerCase();

        this.etapasFiltradas = this.etapas.filter((etapa) =>
            etapa.etap_Descripcion.toLowerCase().includes(query.trim())
        );
    }

    filtrarEmpleados(event: any) {
        const query = event.query.toLowerCase();

        this.empleadosFiltrados = this.empleados.filter(
            (empleado) =>
                empleado.empl_DNI.toLowerCase().includes(query.trim()) ||
                empleado.empl_Nombre.toLowerCase().includes(query.trim()) ||
                empleado.empl_Apellido.toLowerCase().includes(query.trim())
        );
    }

    filtrarJefeCuadrilla(event: any) {
        const query = event.query.toLowerCase();

        this.empleadosFiltrados = this.jefesCuadrilla.filter(
            (empleado) =>
                empleado.empl_DNI.toLowerCase().includes(query.trim()) ||
                empleado.empl_Nombre.toLowerCase().includes(query.trim()) ||
                empleado.empl_Apellido.toLowerCase().includes(query.trim())
        );
    }

    filtrarTodosMenosJefes(event: any) {
        const query = event.query.toLowerCase();

        this.empleadosFiltrados = this.todosMenosJefeCuadrilla.filter(
            (empleado) =>
                empleado.empl_DNI.toLowerCase().includes(query.trim()) ||
                empleado.empl_Nombre.toLowerCase().includes(query.trim()) ||
                empleado.empl_Apellido.toLowerCase().includes(query.trim())
        );
    }

    filtrarActividad(event: any) {
        const query = event.query.toLowerCase();

        this.actividadesFiltradas = this.actividades.filter((etapa) =>
            etapa.acti_Descripcion.toLowerCase().includes(query.trim())
        );
    }

    filtrarUnidades(event: any){
        const query = event.query.toLowerCase();

        this.unidadesFiltradas = this.unidades.filter(
            (unidad) =>
                unidad.unme_Nombre.toLowerCase().includes(query.trim()) ||
                unidad.unme_Nomenclatura.toLowerCase().includes(query.trim())
        );
    }

    RangoProyecto(task){
        var taskStart = task.start_date;
        var taskEnd = task.end_date;
        var scaleStart = gantt.config.start_date;
        var scaleEnd = gantt.config.end_date;
        
        // solo si la task esta fuera del proyecto
        if(scaleStart > taskEnd || scaleEnd < taskStart ){
         // actualizar el rango de la escala proyecto
         gantt.config.end_date=new Date(Math.max(taskEnd.valueOf(), scaleEnd.valueOf()));
         gantt.config.start_date=new Date(Math.min(taskStart.valueOf(),scaleStart.valueOf()));
         gantt.render();
        } 
    }

    RangoEtapa(task){
        const children = [];
        gantt.eachTask((child) => {
            children.push(child)
        }, task.id);
        if(children.length > 0){
            // children.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        const childTasks = children;
        const startDateTask = childTasks.reduce((prev, curr) => {
            return curr.start_date < prev.start_date ? curr : prev;
        })
        const endDateTask = childTasks.reduce((prev, curr) => {
            return curr.end_date > prev.end_date ? curr : prev;
        })
        task.start_date = new Date(startDateTask.start_date);
        task.end_date = new Date(endDateTask.end_date);
        gantt.updateTask(task.id)
        }else{
            task.start_date = new Date(this.proyecto.proy_FechaInicio)
            task.end_date = new Date(this.proyecto.proy_FechaFin)
            gantt.updateTask(task.id, {...task, start_Date: new Date(this.proyecto.proy_FechaInicio), end_Date: new Date(this.proyecto.proy_FechaFin)})
        }
    }

    async guardarEtapa() {
        this.submitEtapa = true;

        try {
            if (this.formEtapa.valid && this.actualizando == false) {
                this.mostrarModalEtapa = false;
                
                const id = await this.insertarEtapa();
                if (id > 0) {
                    gantt.addTask({
                        id: id,
                        text: this.formEtapa.value.etapa.etap_Descripcion,
                        start_date: new Date(this.proyecto.proy_FechaInicio),
                        end_date: new Date(this.proyecto.proy_FechaFin),
                        progress: this.dblClickTask.progress,
                        parent: 0,
                        holder: this.formEtapa.value.encargado.empl_Nombre,
                        dbid: id,
                        etap_Id: this.formEtapa.value.etapa.etap_Id,
                        proy_Id: this.proyecto.proy_Id,
                        empl_Id: this.formEtapa.value.encargado.empl_Id,
                    });
                }
                this.submitEtapa = false;
                this.mostrarModalEtapa =false;
                this.formEtapa.reset();
                this.actualizando = false;
                this.mostrarModalConfirmar = false;
            } else if(this.formEtapa.valid && this.actualizando == true) {
                const etapaPorProyecto = {
                    etpr_Id: this.dblClickTask.id,
                    etap_Id: this.formEtapa.value.etapa.etap_Id,
                    empl_Id: this.formEtapa.value.encargado.empl_Id,
                    proy_Id: this.dblClickTask.proy_Id,
                    usua_Modificacion: parseInt(this.CookieService.get('usua_Id')),
                    etpr_Estado: true,
                    etpr_FechaModificacion: new Date(),
                }
                this.actualizarEtapa(etapaPorProyecto).then(res => {
                    if(res.data.codeStatus > 0){
                        gantt.updateTask(this.dblClickTask.id, {
                            id: this.dblClickTask.id,
                            text: this.formEtapa.value.etapa.etap_Descripcion,
                            start_date: new Date(this.dblClickTask.start_date),
                            end_date: new Date(this.dblClickTask.end_date),
                            progress: this.dblClickTask.progress,
                            parent: 0,
                            holder: this.formEtapa.value.encargado.empl_Nombre,
                            dbid: this.dblClickTask.id,
                            etpr_Id: this.dblClickTask.id,
                            etap_Id: this.formEtapa.value.etapa.etap_Id,
                            empl_Id: this.formEtapa.value.encargado.empl_Id,
                            proy_Id: this.dblClickTask.proy_Id,
                            etpr: this.dblClickTask.etpr_Estado
                        })
                    }
                    this.formEtapa.reset();
                })
                this.submitEtapa = false;
                this.mostrarModalEtapa =false;
                this.actualizando = false;
                this.mostrarModalConfirmar = false;
            }
        } catch (err) {
        }
    }

    async guardarActividad(){

        if(this.formActividad.valid && this.actualizando == true && this.formActividad.value['fechaFin'] > this.formActividad.value['fechaInicio']){
            try{
                const actividadPorEtapa = {
                        acet_Id: this.dblClickTask['acet_Id'],
                        acet_Observacion: this.formActividad.value['observaciones'],
                        acet_Cantidad: this.formActividad.value['cantidad'],
                        espr_Id: this.dblClickTask['espr_Id'],
                        empl_Id: this.formActividad.value['encargado']['empl_Id'],
                        acet_FechaInicio: new Date(this.formActividad.value['fechaInicio'].getFullYear(), this.formActividad.value['fechaInicio'].getMonth(), this.formActividad.value['fechaInicio'].getDate(), -6,0,0),
                        acet_FechaFin: new Date(this.formActividad.value['fechaFin'].getFullYear(),this.formActividad.value['fechaFin'].getMonth(), this.formActividad.value['fechaFin'].getDate(), -6,0,0),
                        acet_PrecioManoObraEstimado: this.dblClickTask['acetsd_PrecioManoObraEstimado'],
                        acet_PrecioManoObraFinal: this.dblClickTask['acet_PrecioManoObraFinal'],
                        acti_Id: this.formActividad.value['actividad']['acti_Id'],
                        unme_Id: this.formActividad.value['unidadMedida']['unme_Id'],
                        etpr_Id: this.dblClickTask['etpr_Id'],
                        usua_Modificacion: parseInt(this.CookieService.get('usua_Id')),
                        acet_FechaModificacion: new Date()
                }
                this.actualizarActividad(actividadPorEtapa).then(res => {
                    if(res.data.codeStatus > 0){
                        gantt.updateTask(this.dblClickTask.id, {
                            id: this.dblClickTask.id,
                            text: this.formActividad.value['actividad']['acti_Descripcion'],
                            start_date: new Date(this.formActividad.value.fechaInicio),
                            end_date: new Date(this.formActividad.value.fechaFin),
                            progress: this.dblClickTask.progress,
                            parent: this.dblClickTask.parent,
                            holder: this.formActividad.value.encargado.empl_Nombre,
                            dbid: this.dblClickTask.id,
                            acet_Id: this.dblClickTask['acet_Id'],
                            acet_Observacion: this.formActividad.value['observaciones'],
                            acet_Cantidad: this.formActividad.value['cantidad'],
                            espr_Id: this.dblClickTask['espr_Id'],
                            empl_Id: this.formActividad.value['encargado']['empl_Id'],
                            acet_PrecioManoObraEstimado: this.dblClickTask['acetsd_PrecioManoObraEstimado'],
                            acet_PrecioManoObraFinal: this.dblClickTask['acet_PrecioManoObraFinal'],
                            acti_Id: this.formActividad.value['actividad']['acti_Id'],
                            unme_Id: this.formActividad.value['unidadMedida']['unme_Id'],
                            etpr_Id: this.dblClickTask['etpr_Id'],
                        })
                        
                        this.RangoProyecto(this.dblClickTask)
                        const parentTask = gantt.getTask(this.dblClickTask.parent)
                        this.RangoEtapa(parentTask)
                        // const children = [];
                        // gantt.eachTask((child) => {
                        //     children.push(child)
                        // }, parentTask.id);
                        // children.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
                        // const childTasks = children;
                        // const firstTask = childTasks[0];
                        // const lastTask = childTasks[childTasks.length - 1];
                        // parentTask.start_date = new Date(firstTask.start_date);
                        // parentTask.end_date = new Date(lastTask.end_date);
                        // gantt.updateTask(parentTask.id);
                        this.formActividad.reset();
                    }
                })
                        this.actualizando = false;
                        this.mostrarModalActividad = false;
                        this.submitACtividad = false;
                        this.mostrarModalConfirmar = false;
            }catch(err){
            }
        }else if(this.formActividad.valid && this.actualizando == false && this.formActividad.value['fechaFin'] > this.formActividad.value['fechaInicio']){
            try{
                this.mostrarModalActividad =false;

                const id = await this.insertarActividad();
                if(id > 0){
                    gantt.addTask({
                        id: id,
                        text: this.formActividad.value.actividad.acti_Descripcion,
                        start_date: new Date(this.formActividad.value.fechaInicio),
                        end_date: new Date(this.formActividad.value.fechaFin),
                        progress: 0,
                        parent: this.parent,
                        holder: this.formActividad.value.encargado.empl_Nombre,
                        dbid: id,
                        acet_Id: id,
                        etpr_Id: this.parent,
                        acti_Id: this.formActividad.value.actividad.acti_Id,
                        empl_Id: this.formActividad.value.encargado.empl_Id,
                        acet_Observacion: this.formActividad.value.observaciones,
                        acet_Cantidad: this.formActividad.value.cantidad,
                        unme_Id: this.formActividad.value.unidadMedida.unme_Id,
                        acet_PrecioManoObraEstimado: 0,
                        acet_PrecioManoObraFinal: 0,
                        usua_Creacion: this.CookieService.get('usua_Id'),
                        acet_Estado: true,
                        espr_Id: 1
                    })
                    
                    this.RangoProyecto(gantt.getTask(id))
                    const parentTask = gantt.getTask(this.parent);
                    this.RangoEtapa(parentTask)
                    // const children = [];
                    // gantt.eachTask((child) => {
                    //     children.push(child)
                    // }, parentTask.id);
                    // children.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
                    // const childTasks = children;
                    // const firstTask = childTasks[0];
                    // const lastTask = childTasks[childTasks.length - 1];
                    // parentTask.start_date = new Date(firstTask.start_date);
                    // parentTask.end_date = new Date(lastTask.end_date);
                    // gantt.updateTask(parentTask.id);
                }
                this.mostrarModalActividad = false;
                this.formActividad.reset();
                this.submitACtividad = false;
                this.mostrarModalConfirmar = false;
            }catch(err){
                // console.error(err)
            }
        }
    }

    async insertarEtapa() {
        const EtapaPorProyecto: EtapaPorProyecto = {
            etap_Id: this.formEtapa.value.etapa.etap_Id,
            proy_Id: this.proyecto.proy_Id,
            empl_Id: this.formEtapa.value.encargado.empl_Id,
            usua_Creacion: parseInt(this.CookieService.get('usua_Id')),
            etpr_FechaCreacion: new Date(),
            etpr_Estado: true
        };

        const res = await this.EtapaPorProyectoService.Insertar(
            EtapaPorProyecto
        );
        return res.data.codeStatus;
    }

    async insertarActividad(){
        const ActividadPorEtapa: ActividadPorEtapa = {
            etpr_Id: this.parent,
            acti_Id: this.formActividad.value.actividad.acti_Id,
            empl_Id: this.formActividad.value.encargado.empl_Id,
            acet_FechaInicio: new Date(this.formActividad.value.fechaInicio.getFullYear(), this.formActividad.value.fechaInicio.getMonth(), this.formActividad.value.fechaInicio.getDate(), -6, 0, 0),
            acet_FechaFin: new Date(this.formActividad.value.fechaFin.getFullYear(), this.formActividad.value.fechaFin.getMonth(), this.formActividad.value.fechaFin.getDate(), -6, 0, 0),
            acet_Observacion: this.formActividad.value.observaciones,
            acet_Cantidad: this.formActividad.value.cantidad,
            unme_Id: this.formActividad.value.unidadMedida.unme_Id,
            acet_PrecioManoObraEstimado: 0,
            acet_PrecioManoObraFinal: 0,
            usua_Creacion: parseInt(this.CookieService.get('usua_Id')),
            acet_Estado: true
        }
        const res = await this.ActividadPorEtapaService.Insertar(ActividadPorEtapa).then(res => res.data.codeStatus)
        return res
    }

    confirmarEliminar() {
        //agarro cada task seleccionada
        const tasklist = this.tasksSelected.map(t => gantt.getTask(t));
        
        const etapas = tasklist.filter(t => t.parent === 0);
        const actividades = tasklist.filter(t => t.parent !== 0);

        // filtro solo las actividades que su etapa no este en la lista
        const actividadesAEliminar = actividades.filter(act => 
            !etapas.some(etapa => etapa.id === act.parent)
        );

        const listadoFinal = [
            ...etapas,
            ...actividadesAEliminar
        ];
        listadoFinal.forEach(item => {
            if(item.parent === 0){
                this.eliminarEtapa(parseInt(item['dbid'])).then(res => {
                    if(res > 0){
                        gantt.deleteTask(item.id);
                    }
                });
            }else{
                this.eliminarActividad(parseInt(item['dbid'])).then(res => {
                    if(res > 0){
                        const parentTask = gantt.getTask(item.parent)
                        gantt.deleteTask(item.id);
                        this.RangoEtapa(parentTask)
                    }
                })
            }
        })
        this.mostrarModalEliminar = false;
        this.taskSelected = null;
        this.tasksSelected = [];
    }

    async eliminarEtapa(id: number) {
        const res = await this.EtapaPorProyectoService.Eliminar(id);
        return res.data.codeStatus;
    }

    async eliminarActividad(id: number) {
        const res = await this.ActividadPorEtapaService.Eliminar(id);
        return res.data.codeStatus;
    }


    async actualizarEtapa(etapa: EtapaPorProyecto) {
        const res = await this.EtapaPorProyectoService.Actualizar(etapa)
        return res;
    }

    async actualizarActividad(actividad: ActividadPorEtapa) {
        const res = await this.ActividadPorEtapaService.Actualizar(actividad)
        return res;
    }


    cancelarEtapa(){
        this.submitEtapa = false;
        this.mostrarModalEtapa = false;
        this.formEtapa.reset();
    }

    cancelarActividad(){
        this.submitACtividad = false;
        this.mostrarModalActividad = false;
        this.parent = 0;
        this.formActividad.reset();
    }

    cancelarEliminar(){
        this.mostrarModalEliminar = false;
        this.taskSelected = null;
        this.tasksSelected = [];
    }

    showConfirm(tipo: string){
        
        if(tipo == 'etapa'){
        //valida el contenido de etapa autocmplete
            if(!this.formEtapa.value.etapa){
                this.errorEtapa = 'El campo es requerido.';
                this.formEtapa.get('etapa')?.setErrors({required: true});
            } else if(this.formEtapa.value.etapa.etap_Descripcion){
                const etapaSeleccionada = this.etapas.find(etapa => etapa.etap_Descripcion === this.formEtapa.value.etapa.etap_Descripcion);
                if (etapaSeleccionada) {
                    this.formEtapa.patchValue({etapa: etapaSeleccionada});
                    this.formEtapa.get('etapa')?.setErrors(null);
                } else {
                    this.errorEtapa = 'Opción no encontrada.';
                    this.formEtapa.get('etapa')?.setErrors({invalid: true});
                }
            }else if(this.formEtapa.value.etapa){
                const etapaSeleccionada = this.etapas.find(etapa => etapa.etap_Descripcion.toLowerCase() === this.formEtapa.value.etapa.toLowerCase())
                if(!etapaSeleccionada){
                    this.errorEtapa = 'Opción no encontrada.';
                    this.formEtapa.get('etapa')?.setErrors({invalid: true});
                }else{
                    this.formEtapa.get('etapa')?.setErrors(null);
                }
            }
            

            //valida el contenido de encargado autocmplete
            if(!this.formEtapa.value.encargado){
                this.errorEncargado = 'El campo es requerido.'
                this.formEtapa.get('encargado')?.setErrors({required: true});
            }else if(this.formEtapa.value.encargado.empl_NombreCompleto){
                this.formEtapa.patchValue({encargado: this.empleados.find((empleado) => empleado.empl_NombreCompleto == this.formEtapa.value.encargado.empl_NombreCompleto)})
                this.formEtapa.get('encargado')?.setErrors(null);
            }else if(this.formEtapa.value.encargado){
                const encargadoseleccionado = this.todosMenosJefeCuadrilla.find(empleado => empleado.empleado == this.formEtapa.value.encargado)
                if(!encargadoseleccionado){
                    this.errorEncargado = 'Opción no encontrada.'
                    this.formEtapa.get('encargado')?.setErrors({invalid: true});
                }else{
                    this.formEtapa.get('encargado')?.setErrors(null);
                }
            }

            if(this.actualizando == true){
                this.submitEtapa = true;
                if(this.formEtapa.valid){
                    this.mostrarModalConfirmar = true;
                    this.mostrarModalEtapa = false;
                }
            }
            if(this.actualizando == false){
                this.submitEtapa = true;
                if(this.formEtapa.valid){
                    this.guardarEtapa();
                }
            }
        }

        if(tipo == 'actividad'){
            if(!this.formActividad.value.unidadMedida){
                this.errorUnidadMedida = 'El campo es requerido.'
                this.formActividad.get('unidadMedida')?.setErrors({required: true});
            }else if(this.formActividad.value.unidadMedida.unme_Nombre){
                this.formActividad.patchValue({unidadMedida: this.unidades.find((unidad) => unidad.unme_Nombre == this.formActividad.value.unidadMedida.unme_Nombre)})
                this.formActividad.get('unidadMedida')?.setErrors(null);
            }else if(this.formActividad.value.unidadMedida){
                const UnidadSeleccionada = this.unidades.find(unidad => unidad.unme_Nombre == this.formActividad.value.unidadMedida)
                if(!UnidadSeleccionada){
                    this.errorUnidadMedida = 'Opción no encontrada.'
                    this.formActividad.get('unidadMedida')?.setErrors({invalid: true});
                }else{
                    this.formActividad.get('unidadMedida')?.setErrors(null);
                }
            }
            if(!this.formActividad.value.actividad){
                this.errorActividad = 'El campo es requerido.'
                this.formActividad.get('actividad')?.setErrors({required: true});
            }else if(this.formActividad.value.actividad.acti_Descripcion){
                this.formActividad.patchValue({actividad: this.actividades.find(actividad => actividad.acti_Descripcion == this.formActividad.value.actividad.acti_Descripcion)})
                this.formActividad.get('actividad')?.setErrors(null);
            }else if(this.formActividad.value.actividad){
                const actividadSeleccionada = this.actividades.find(actividad => actividad.acti_Descripcion == this.formActividad.value.actividad)
                if(!actividadSeleccionada){
                    this.errorActividad = 'Opcion no encontrada.'
                    this.formActividad.get('actividad')?.setErrors({invalid: true});
                }else{
                    this.formActividad.get('actividad')?.setErrors(null);
                }
            }

            if(!this.formActividad.value.encargado){
                this.errorEncargado = 'El campo es requerido.'
                this.formActividad.get('encargado')?.setErrors({required: true});
            }else if(this.formActividad.value.encargado.empl_NombreCompleto){
                this.formActividad.patchValue({encargado: this.empleados.find((empleado) => empleado.empl_NombreCompleto == this.formActividad.value.encargado.empl_NombreCompleto)})
                this.formActividad.get('encargado')?.setErrors(null);
            }else if(this.formActividad.value.encargado){
                const encargadoseleccionado = this.jefesCuadrilla.find(empleado => empleado.empleado == this.formActividad.value.encargado)
                if(!encargadoseleccionado){
                    this.errorEncargado = 'Opción no encontrada.'
                    this.formActividad.get('encargado')?.setErrors({invalid: true});
                }else{
                    this.formActividad.get('encargado')?.setErrors(null);
                }
            }

            if(this.actualizando == true){
                this.submitACtividad = true;
                if(this.formActividad.valid && this.formActividad.value['fechaFin'] > this.formActividad.value['fechaInicio']) {
                    this.mostrarModalConfirmar = true;
                    this.mostrarModalActividad = false;
                }
            }
            if(this.actualizando == false){
                this.submitACtividad = true;
                if(this.formActividad.valid){
                    this.guardarActividad();
                }
            }
        }
    }

    cancelarConfirmar(){
        this.mostrarModalConfirmar = false
        this.dblClickTask.parent == 0 ? this.mostrarModalEtapa = true : this.mostrarModalActividad = true
    }

    aceptarConfirmar(){
        if(this.dblClickTask.parent == 0){
            this.guardarEtapa();
        }
        if(this.dblClickTask.parent != 0){
            this.guardarActividad()
        }
    }

    //GET FORM   DATA
    getEmpleados() {
        this.empleadoService.getData().subscribe({
            next: (data) => {
                this.empleados = data.sort((a, b) => a.empleado.localeCompare(b.empleado));
                this.jefesCuadrilla = this.empleados.filter(a => a.carg_Id == 1)
                this.todosMenosJefeCuadrilla = this.empleados.filter(a => a.carg_Id != 1)
            },
            error: (err) => {
                // console.error('Error al obtener empleados:', err);
            },
        });
    }

    getActividades() {
        this.actividadService.Listar().subscribe({
            next: (data) => {
                this.actividades = data.sort((a,b) => a.acti_Descripcion.localeCompare(b.acti_Descripcion));
            },
            error: (err) => {
                // console.error('Error al obtener actividades:', err);
            },
        });
    }

    getUnidadadesDeMedidas(){
        this.UnidadMedidaServide.Listar().subscribe({
            next: (data) => {
                this.unidades = data.sort((a,b) => a.unme_Nombre.localeCompare(b.unme_Nombre));
            },
            error: (err) => {
                // console.error('Error al obtener actividades:', err);
            },
        })
    }

    async cargarDatos(){
        
        this.etapas = await this.etapaService.Listar2().then((data) => data.sort((a,b) => a.etap_Descripcion.localeCompare(b.etap_Descripcion)));
        this.getActividades();
        this.getEmpleados();
        this.getUnidadadesDeMedidas();
        this.loading = false;

    }

    ngOnDestroy(): void {
        this.dblClickTask = {};
        this.draggedTask = {};
        this.tasksSelected = [];
        this.taskSelected = {};
        gantt.clearAll(); 
    }

    seleccionarEtapa(event: any){
        const etapaSeleccionada = event.value.etap_Descripcion;   
        this.formEtapa.patchValue({etapa: this.etapas.find((etapa) => etapa.etap_Descripcion == etapaSeleccionada)})
    }

    seleccionarEncargado(event: any){
        const encargadoSeleccionado = event.value.empl_NombreCompleto;
        this.formEtapa.patchValue({encargado: this.empleados.find((encargado) => encargado.empl_NombreCompleto == encargadoSeleccionado)})
    }

    onSelectUnidad(event: any){ 
        const UnidadSeleccionada = event.value.unme_Nombre;
        this.formActividad.patchValue({unidad: this.unidades.find((unidad) => unidad.unme_Nombre ==UnidadSeleccionada)})
    }

    onSelectActividad(event: any){
        const actividadSeleccionada = event.value.acti_Descripcion;
        this.formActividad.patchValue({actividad: this.actividades.find(actividad => actividad.acti_Descripcion == actividadSeleccionada)})
    }

    closeFullscreen() {
        if (document.exitFullscreen) {
          this.document.exitFullscreen();
        }
      }
}