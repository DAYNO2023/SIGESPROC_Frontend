import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { RoleGuard } from 'src/app/guards/role.guard';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'deduccion',
                data: { breadcrumb: 'Deducciones' },
                loadChildren: () =>
                    import(
                        '../componentsplanilla/deduccion/deduccion.module'
                    ).then((m) => m.DeduccionModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'categoriasviaticos',
                data: { breadcrumb: 'Categorías Viáticos' },
                loadChildren: () =>
                    import(
                        './CategoriasViaticos/categoriaviatico.module'
                    ).then((m) => m.UnidadMedidaModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'frecuencia',
                data: { breadcrumb: 'Frecuencias' },
                loadChildren: () =>
                    import(
                        '../componentsplanilla/frecuencia/frecuencia.module'
                    ).then((m) => m.FrecuenciaModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'costosporactividad',
                data: { breadcrumb: 'Costos por Actividad' },
                loadChildren: () =>
                    import(
                        './CostosPorActividad/costoporactividad.module'
                    ).then((s) => s.CostoporactividadModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'viaticos',
                data: { breadcrumb: 'Viáticos' },
                loadChildren: () =>
                    import(
                        './Viaticos/viaticosenc.module'
                    ).then((s) => s.ViaticosEncModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'planilla',
                data: { breadcrumb: 'Planillas' },
                loadChildren: () =>
                    import(
                        '../componentsplanilla/planilla/planilla.module'
                    ).then((m) => m.PlanillaModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'prestamo',
                data: { breadcrumb: 'Préstamos' },
                loadChildren: () =>
                    import(
                        '../componentsplanilla/prestamo/prestamo.module'
                    ).then((m) => m.PrestamoModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
        ]),
    ],
    exports: [RouterModule],
})
export class PlanillaRoutingModule {}
