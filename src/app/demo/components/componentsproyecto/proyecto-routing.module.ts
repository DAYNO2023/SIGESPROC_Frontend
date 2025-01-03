import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { RoleGuard } from 'src/app/guards/role.guard';

@NgModule({
    imports: [RouterModule.forChild([
        { 
            path: 'equiposdeseguridad', 
            data: { breadcrumb: 'Equipos de Seguridad' }, 
            loadChildren: () => import('./EquiposdeSeguridad/equiposeguridad.module').then(m => m.equiposeguridadModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'estadosdeproyecto', 
            data: { breadcrumb: 'Estados de Proyecto' }, 
            loadChildren: () => import('./EstadosdeProyecto/estadoproyecto.module').then(m => m.estadoproyectoModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'presupuesto', 
            data: { breadcrumb: 'Presupuestos' }, 
            loadChildren: () => import('../componentsproyecto/presupuesto/presupuesto.module').then(m => m.PresupuestoModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'etapa', 
            data: { breadcrumb: 'Etapas' }, 
            loadChildren: () => import('../componentsproyecto/etapa/etapa.module').then(m => m.EtapaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'proyecto', 
            data: { breadcrumb: 'Proyectos' }, 
            loadChildren: () => import('../componentsproyecto/proyectochild/proyectochild.module').then(m => m.ProyectoChildModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'actividad', 
            data: { breadcrumb: 'Actividades' }, 
            loadChildren: () => import('../componentsproyecto/actividad/actividad.module').then(m => m.actividadmodule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'incidente', 
            data: { breadcrumb: 'Incidentes' }, 
            loadChildren: () => import('./incidente/incidentes.module').then(m => m.IncidentesModule),
            // canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'incidentes', 
            data: { breadcrumb: 'Incidentes' }, 
            loadChildren: () => import('./Incidentes/incidentes-completo.module').then(m => m.incidentescompletoModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'controlcalidadchild', 
            data: { breadcrumb: 'Control de calidad' }, 
            loadChildren: () => import('../componentsproyecto/controlcalidadchild/controlcalidadchild.module').then(m => m.ControlcalidadchildModule),
            // canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'seguimientoproyecto', 
            data: { breadcrumb: 'Seguimiento de proyecto' }, 
            loadChildren: () => import('../componentsproyecto/seguimientoproyecto/seguimientoproyecto.module').then(m => m.SeguimientoproyectoModule),
            // canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'controldecalidad', 
            data: { breadcrumb: 'Controles de calidad' }, 
            loadChildren: () => import('./ControldeCalidad/controlcalidad.module').then(m => m.controlcalidadmodule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'gestionesadicionales', 
            data: { breadcrumb: 'Gestiones Adicionales' }, 
            loadChildren: () => import('../componentsproyecto/gestionadicional/gestionadicional.module').then(m => m.gestionadicionalmodule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'notificaciones', 
            data: { breadcrumb: 'Notificaciones' }, 
            loadChildren: () => import('../componentsproyecto/notificaciones/notificaciones.module').then(m => m.NotificacionesModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
    ])],
    exports: [RouterModule]
})
export class ProyectoRoutingModule { }
