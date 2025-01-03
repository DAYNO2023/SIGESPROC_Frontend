import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { RoleGuard } from 'src/app/guards/role.guard';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '', redirectTo: 'auth', pathMatch: 'full',
            },
            {
                path: 'auth',
                data: { breadcrumb: 'Auth' },
                loadChildren: () =>
                    import('./demo/components/auth/auth.module').then(
                        (m) => m.AuthModule
                    ),
            },
        ]
    },
    {
        path: 'sigesproc',
        component: AppLayoutComponent,
        canActivate: [AuthGuard],  // Protege todas las rutas dentro de sigesproc
        children: [
            {
                path: 'Paginaprincipal',
                data: { breadcrumb: 'Inicio' },
                loadChildren: () =>
                    import('./demo/components/componentsgraficosprincipales/graficosprincipales.module').then((m) => m.GraficoModule),
                // canActivate: [RoleGuard],  // Aplicar RoleGuard si es necesario
            },
            {
                path: 'acceso',
                data: { breadcrumb: 'Acceso' },
                loadChildren: () =>
                    import('./demo/components/componentsacceso/acceso.module').then((m) => m.AccesoModule),
                canActivate: [RoleGuard],  // Aplicar RoleGuard si es necesario
            },
            {
                path: 'bienraiz',
                data: { breadcrumb: 'Bienes Raíces' },
                loadChildren: () =>
                    import('./demo/components/componentsbienraiz/bienraiz.module').then((m) => m.BienRaizModule),
                canActivate: [RoleGuard],  // Aplicar RoleGuard si es necesario
            },
            {
                path: 'Fletes',
                data: { breadcrumb: 'Fletes' },
                loadChildren: () =>
                    import('./demo/components/componentsflete/Fletes.module').then((m) => m.FleteModule),
                canActivate: [RoleGuard],  // Aplicar RoleGuard si es necesario
            },
            {
                path: 'general',
                data: { breadcrumb: 'General' },
                loadChildren: () =>
                    import('./demo/components/componentsgeneral/general.module').then((m) => m.GeneralModule),
                canActivate: [RoleGuard],  // Aplicar RoleGuard si es necesario
            },
            {
                path: 'insumo',
                data: { breadcrumb: 'Insumo' },
                loadChildren: () =>
                    import('./demo/components/componentsinsumo/insumo.module').then((m) => m.InsumoModule),
                canActivate: [RoleGuard],  // Aplicar RoleGuard si es necesario
            },
            {
                path: 'planilla',
                data: { breadcrumb: 'Planilla' },
                loadChildren: () =>
                    import('./demo/components/componentsplanilla/planilla.module').then((m) => m.PlanillaModule),
                canActivate: [RoleGuard],  // Aplicar RoleGuard si es necesario
            },
            {
                path: 'proyecto',
                data: { breadcrumb: 'Proyecto' },
                loadChildren: () =>
                    import('./demo/components/componentsproyecto/proyecto.module').then((m) => m.ProyectoModule),
                // canActivate: [RoleGuard],  // Aplicar RoleGuard si es necesario
            },
            {
                path: 'favorito',
                data: { breadcrumb: 'Favorito' },
                loadChildren: () =>
                    import('./demo/components/componentsfavorito/favorito.module').then((m) => m.favoritoModule),
                canActivate: [RoleGuard],  // Aplicar RoleGuard si es necesario
            },
            {
                path: 'reporte',
                data: { breadcrumb: 'Reporte' },
                loadChildren: () =>
                    import('./demo/components/componentsReporte/reporte-routing.module').then((m) => m.ReporteRoutingModule),
                canActivate: [RoleGuard],  // Aplicar RoleGuard si es necesario
            },
            {
                path: 'dash',
                data: { breadcrumb: 'dash' },
                loadChildren: () =>
                    import('./demo/components/componentsdash/dash-routing.module').then((m) => m.DashRoutingModule),
                canActivate: [RoleGuard],  // Aplicar RoleGuard si es necesario
            },
            
        ],
    },
    {
        path: '**', // Cualquier ruta que no coincida, redirigir al login
        redirectTo: '/auth/login',
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
    exports: [RouterModule]
})
export class AppRoutingModule {}
