import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { RoleGuard } from 'src/app/guards/role.guard';


@NgModule({
    imports: [RouterModule.forChild([
        { 
            path: 'ReporteTerrenofechacreacion', 
            data: { breadcrumb: 'Reporte de Terreno' }, 
            loadChildren: () => import('../componentsReporte/ReporteTerrenoFechaCreacion/ReporteTerrenoFechaCreacion.module').then(m => m.UnidadMedidaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'ReporteTerrenosPorEstadoProyecto', 
            data: { breadcrumb: 'Reporte de Terreno en Proyecto' }, 
            loadChildren: () => import('../componentsReporte/ReporteTerrenosPorEstadoProyecto/ReporteTerrenosPorEstadoProyecto.module').then(m => m.ReporteTerrenosPorEstadoProyectoModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'reporteempresabienraiz', 
            data: { breadcrumb: 'Reporte de Ventas por Empresas Bien raiz' }, 
            loadChildren: () => import('./ReporteEmpresaBienraiz/ReporteVentasPorEmpresa.module').then(m => m.ReporteVentasPorEmpresaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'reportecolaborador', 
            data: { breadcrumb: 'Reporte de Colaboradores por Estado' }, 
            loadChildren: () => import('./ReporteColaborador/ReporteEmpleadoPorEstado.module').then(m => m.ReporteEmpleadoPorEstadoComponentaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'ReporteFletesPorFecha', 
            data: { breadcrumb: 'Reporte de Fletes por fecha' }, 
            loadChildren: () => import('../componentsReporte/ReporteFletesPorFecha/ReporteFletesPorFecha.module').then(m => m.ReporteFletesPorFechaComponentaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'reportecotizacion', 
            data: { breadcrumb: 'Reporte de Cotización' }, 
            loadChildren: () => import('./ReporteCotizacion/ReporteHistorialCotizaciones.module').then(m => m.RReporteHistorialCotizacionesComponentaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'ReporteComprasRealizadasComponent', 
            data: { breadcrumb: 'Reporte de Compra' }, 
            loadChildren: () => import('../componentsReporte/ReporteComprasRealizadas/ReporteTerrenoFechaCreacion/ReporteComprasRealizadas.module').then(m => m.ReporteComprasRealizadasModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'reporteproyecto', 
            data: { breadcrumb: 'Reporte de Comparación Monetaria' }, 
            loadChildren: () => import('./ReporteProyecto/ReporteComparacionMonetaria.module').then(m => m.ReporteComparacionMonetariaComponentaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'reportedecotizacionporrangoprecio', 
            data: { breadcrumb: 'Reporte de Cotización por precio' }, 
            loadChildren: () => import('./ReportedeCotizacionporRangoPrecio/ReporteCotizacionesPorRangoPrecios.module').then(m => m.ReporteCotizacionesPorRangoPreciosComponentaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'ReporteInsumosBodega', 
            data: { breadcrumb: 'Reporte de Insumos en Bodega' }, 
            loadChildren: () => import('../componentsReporte/ReporteInsumosBodega/ReporteInsumosBodega.module').then(m => m.ReporteInsumosBodegaComponentaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'ReporteInsumosAProyecto', 
            data: { breadcrumb: 'Reporte de Insumos a Proyecto' }, 
            loadChildren: () => import('../componentsReporte/ReporteInsumosAProyecto/ReporteInsumosAProyecto.module').then(m => m.ReporteInsumosAProyectoComponentaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { path: 'reportehistorialdepagos',
             data: { breadcrumb: 'Reporte historial de Pagos' },
              loadChildren: () => import('./ReporteHistorialdePagos/ReporteHistorialPagosPorProyecto.module').then(m => m.ReporteHistorialPagosPorProyectoComponentaModule) ,
              canActivate: [AuthGuard, RoleGuard] 
        },
        { path: 'ReporteComparativoProductos', 
          data: { breadcrumb: 'Reporte Comparativo de Producto' }, 
          loadChildren: () => import('../componentsReporte/ReporteComparativoProductos/ReporteComparativoProductos.module').then(m => m.ReporteComparativoProductosComponentaModule),
          canActivate: [AuthGuard, RoleGuard] 
        },
        { path: 'ReportecomprasPendientesEnvio', data: { breadcrumb: 'Reporte Compras Pendiente de envió' }, loadChildren: () => import('../componentsReporte/ReportecomprasPendientesEnvio/ReportecomprasPendientesEnvio.module').then(m => m.ReportecomprasPendientesEnvioComponentaModule),canActivate: [AuthGuard, RoleGuard]  },
        { path: 'ReporteProgresoActividades', data: { breadcrumb: ' Reporte Progreso de actividad' }, loadChildren: () => import('../componentsReporte/ReporteProgresoActividades/ReporteProgresoActividades.module').then(m => m.ReporteProgresoActividadesComponentaModule),canActivate: [AuthGuard, RoleGuard]  },
        { path: 'reportecompraporubicacion', data: { breadcrumb: 'Reporte de Compra por Ubicación ' }, loadChildren: () => import('./ReporteCompraporUbicacion/ReportePorUbicacion.module').then(m => m.ReportePorUbicacionComponentaModule),canActivate: [AuthGuard, RoleGuard]  },
        { path: 'reportefletescomparacion', data: { breadcrumb: 'Reporte de Fletes Estadística de Comparación' }, loadChildren: () => import('./ReporteFletesComparacion/EstadisticasFletes_Comparacion.module').then(m => m.EstadisticasFletes_ComparacionComponentaModule),canActivate: [AuthGuard, RoleGuard]  },
        { path: 'reporteprocesodeventa', data: { breadcrumb: 'Reporte de Proceso de venta Bien Raiz/Terreno' }, loadChildren: () => import('./ReporteProcesodeventa/ReporteProcesoVenta.module').then(m => m.ReporteProcesoVentaComponentaModule),canActivate: [AuthGuard, RoleGuard]  },
        { path: 'reportefletesllegada', data: { breadcrumb: 'Reporte de Fletes de Estadística de Llegada' }, loadChildren: () => import('./ReporteFletesllegada/EstadisticasFletes_Llegada.module').then(m => m.EstadisticasFletes_LlegadaComponentaModule),canActivate: [AuthGuard, RoleGuard]  },
        { path: 'reportefletesinsumoporactividad', data: { breadcrumb: 'Reporte de Fletes insumos tarnsportados por Actividad' }, loadChildren: () => import('../componentsReporte/ReporteInsumosTransportadosPorActividad/ReporteInsumosTransportadosPorActividad.module').then(m => m.ReporteInsumosTransportadosPorActividadComponentaModule),canActivate: [AuthGuard, RoleGuard]  },
        { path: 'reporteinsumosultimoprecio', data: { breadcrumb: 'Reporte de Insumos Último precio' }, loadChildren: () => import('../componentsReporte/ReporteInsumosUltimoPrecio/ReporteInsumosUltimoPrecio.module').then(m => m.ReporteInsumosUltimoPrecioComponentaModule),canActivate: [AuthGuard, RoleGuard]  },
        { path: 'reportearticulosactividades', data: { breadcrumb: 'Reporte Articulos de Actividad' }, loadChildren: () => import('../componentsReporte/ReporteArticulosActividades/ReporteArticulosActividades.module').then(m => m.ReporteReporteArticulosActividadesModule),canActivate: [AuthGuard, RoleGuard]  },
    ])],
    exports: [RouterModule]
})
export class ReporteRoutingModule { }
