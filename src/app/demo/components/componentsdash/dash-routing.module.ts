import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { RoleGuard } from 'src/app/guards/role.guard';

@NgModule({
    imports: [RouterModule.forChild([
        {
            path: 'graficoTotaldeCompras',
            data: { breadcrumb: 'Gráfico Total de Compras' },
            loadChildren: () => import('./cotizaciondash/GraficoTotaldeCompras/totalcompras.module').then(m => m.TotalComprasModule),
            canActivate: [AuthGuard, RoleGuard]
        },
        {
            path: 'graficoubicacionmasenviada',
            data: { breadcrumb: 'Gráfico Ubicación más Enviada al Comprar' },
            loadChildren: () => import('./cotizaciondash/Graficoubicacionmasenviada/ubicacionmasenviada.module').then(m => m.UbicacionesCompraModule),
            canActivate: [AuthGuard, RoleGuard]
        },
        {
            path: 'graficoproveedoresmascomprados',
            data: { breadcrumb: 'Gráfico Proveedores más Comprados' },
            loadChildren: () => import('./cotizaciondash/Graficoproveedoresmascomprados/proveedoresmascomprados.module').then(m => m.ProveedoresmasCompradosModule),
            canActivate: [AuthGuard, RoleGuard]
        },
        {
            path: 'GraficoBodegasMasEnviadasFletes',
            data: { breadcrumb: 'Gráfico Bodegas Más Enviadas Fletes' },
            loadChildren: () => import('./fletesdash/GraficoBodegasMasEnviadasFletes/lugarmasenviado.module').then(m => m.LugarmasEnviadoModule),
            canActivate: [AuthGuard, RoleGuard]
        },
        {
            path: 'graficoincidentesmensuales',
            data: { breadcrumb: 'Gráfico Incidentes Mensuales' },
            loadChildren: () => import('./fletesdash/Graficoincidentesmensuales/incidentesmensuales.module').then(m => m.IncidentesMensualesModule),
            canActivate: [AuthGuard, RoleGuard]
        },

        {
            path: 'graficobancosmasacreditados',
            data: { breadcrumb: 'Gráfico Bancos más Acreditados' },
            loadChildren: () => import('./planilladash/Graficobancosmasacreditados/bancosmasacreditados.module').then(m => m.BancosmasAcreditadosModule),
            canActivate: [AuthGuard, RoleGuard]
        },
        // {
        //     path: 'deudaporempleado',
        //     data: { breadcrumb: 'Deuda por Empleado' },
        //     loadChildren: () => import('../componentsdash/planilladash/deudadelempleado/deudadelempleado.module').then(m => m.DeudadelEmpleadoModule),
        //     canActivate: [AuthGuard, RoleGuard]
        // },
        {
            path: 'graficoPagoporJefedeObra',
            data: { breadcrumb: 'Gráfico Pago por Jefe de Obra' },
            loadChildren: () => import('./planilladash/GraficoPagoporJefedeObra/pagoporjefedeobra.module').then(m => m.PagoporJefedeObraModule),
            canActivate: [AuthGuard, RoleGuard]
        },
        {
            path: 'GraficoVentasBienesRaicesMensuales',
            data: { breadcrumb: 'Gráfico Ventas Bienes Raíces Mensuales' },
            loadChildren: () => import('./procesosventadash/GraficoVentasBienesRaicesMensuales/ventasbienesraicespormes.module').then(m => m.VentaBienesRaicesPorMesModule),
            canActivate: [AuthGuard, RoleGuard]
        },
        {
            path: 'graficoventasporagente',
            data: { breadcrumb: 'Gráfico Ventas por Agente' },
            loadChildren: () => import('./procesosventadash/Graficoventasporagente/ventasporagente.module').then(m => m.VentasPorAgenteModule),
            canActivate: [AuthGuard, RoleGuard]
        },
        {
            path: 'graficoVentasTerrenosMensuales',
            data: { breadcrumb: 'Gráfico Ventas Terrenos Mensuales' },
            loadChildren: () => import('./procesosventadash/GraficoVentasTerrenosMensuales/ventasterrenospormes.module').then(m => m.VentasTerrenosPorMesModule),
            canActivate: [AuthGuard, RoleGuard]
        },
        {
            path: 'graficoIncidenciasdeproyectospormes',
            data: { breadcrumb: 'Gráfico Incidencias de proyectos por mes' },
            loadChildren: () => import('./proyectosdash/GraficoIncidenciasdeproyectospormes/incidentesactividadesdash.module').then(m => m.IncidentesPorActividadesModule),
            canActivate: [AuthGuard, RoleGuard]
        },
        {
            path: 'graficoProyectosconMayorCostoporDepartamento',
            data: { breadcrumb: 'Gráfico Proyectos con Mayor Costo por Departamento' },
            loadChildren: () => import('./proyectosdash/GraficoProyectosconMayorCostoporDepartamento/proyectoejecuciondepartamentos.module').then(m => m.ProyectoejecuciondepartamentosModule),
            canActivate: [AuthGuard, RoleGuard]
        },
        {
            path: 'graficoProyectosconmayorcostoporfecha',
            data: { breadcrumb: 'Gráfico Proyectos con mayor costo' },
            loadChildren: () => import('./proyectosdash/GraficoProyectosconmayorcostoporfecha/proyectomayorcosto.module').then(m => m.ProyectomayorcostoModule),
            canActivate: [AuthGuard, RoleGuard]
        },
        {
            path: 'graficofletesasociadosaproyectos',
            data: { breadcrumb: 'Gráfico Fletes Asociados a Proyectos' },
            loadChildren: () => import('./fletesdash/Graficofletesasociadosaproyectos/fletesasociadosaproyectos.module').then(m => m.FletesAsociadosaProyectosModule),
            canActivate: [AuthGuard, RoleGuard]
        },
        {
            path: 'graficoTotalNominaAnual',
            data: { breadcrumb: 'Gráfico Total Nómina Anual' },
            loadChildren: () => import('./planilladash/GraficoTotalNominaAnual/totalesnominaanual.module').then(m => m.TotalesNominaAnualModule),
            canActivate: [AuthGuard, RoleGuard]
        },
        {
            path: 'graficoTotalProcesosVenta',
            data: { breadcrumb: 'Gráfico Total Procesos Venta' },
            loadChildren: () => import('./procesosventadash/GraficoTotalProcesosVenta/totalventas.module').then(m => m.TotalVentasModule),
            canActivate: [AuthGuard, RoleGuard]
        },
    ])],
    exports: [RouterModule]
})
export class DashRoutingModule { }
