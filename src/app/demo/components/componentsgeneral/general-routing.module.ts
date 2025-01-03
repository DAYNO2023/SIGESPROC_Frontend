import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { RoleGuard } from 'src/app/guards/role.guard';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'estado',
                data: { breadcrumb: 'Estados' },
                loadChildren: () =>
                    import('../componentsgeneral/estado/estado.module').then(
                        (m) => m.EstadoModule
                    ),
                canActivate: [AuthGuard, RoleGuard]  
            },
            { 
                path: 'unidadesdemedida',
                data: { breadcrumb: 'Unidades de Medida' },
                loadChildren: () =>
                    import(
                        './UnidadesdeMedida/unidadmedida.module'
                    ).then((m) => m.UnidadMedidaModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
            { 
                path: 'impuesto',
                data: { breadcrumb: 'Impuesto' },
                loadChildren: () =>
                    import(
                        '../componentsgeneral/impuesto/impuesto.module'
                    ).then((m) => m.ImpuestoModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'Colaboradores',
                data: { breadcrumb: 'Colaboradores' },
                loadChildren: () =>
                    import(
                        '../componentsgeneral/empleado/empleado.module'
                    ).then((m) => m.EmpleadoModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'banco',
                data: { breadcrumb: 'Bancos' },
                loadChildren: () =>
                    import('../componentsgeneral/banco/banco.module').then(
                        (m) => m.BancoModule
                    ),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'cargo',
                data: { breadcrumb: 'Cargos' },
                loadChildren: () =>
                    import('../componentsgeneral/cargo/cargo.module').then(
                        (m) => m.CargoModule
                    ),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'moneda',
                data: { breadcrumb: 'Monedas' },
                loadChildren: () =>
                    import('../componentsgeneral/moneda/moneda.module').then(
                        (m) => m.MonedaModule
                    ),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'estadosciviles',
                data: { breadcrumb: 'Estados Civiles' },
                loadChildren: () =>
                    import(
                        './EstadosCiviles/estadoCivil.module'
                    ).then((m) => m.EstadoCivilModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'nivel',
                data: { breadcrumb: 'Niveles' },
                loadChildren: () =>
                    import(
                        '../componentsgeneral/niveles/niveles/niveles.module'
                    ).then((m) => m.NivelesModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'pais',
                data: { breadcrumb: 'Países' },
                loadChildren: () =>
                    import('../componentsgeneral/pais/pais.module').then(
                        (m) => m.PaisModule
                    ),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'tasasdecambio',
                data: { breadcrumb: 'Tasas de Cambio' },
                loadChildren: () =>
                    import(
                        './TasasdeCambio/tasacambio.module'
                    ).then((m) => m.TasacambioModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'tiposdeproyecto',
                data: { breadcrumb: 'Tipos de Proyecto' },
                loadChildren: () =>
                    import(
                        './TiposdeProyecto/tipoproyecto.module'
                    ).then((m) => m.TipoproyectoModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
            {
                path: 'apiMapa',
                data: { breadcrumb: 'Api Mapa' },
                loadChildren: () =>
                    import('../apiMapa/apiMapa.module').then(
                        (m) => m.ApiMapaModule
                    ),
                canActivate: [AuthGuard, RoleGuard]  
            },
            { 
                path: 'ciudad', 
                data: { breadcrumb: 'Ciudades' }, 
                loadChildren: () => import('../componentsgeneral/ciudad/ciudad.module').then(m => m.ciudadModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
            { 
                path: 'cliente', 
                data: { breadcrumb: 'Clientes' }, 
                loadChildren: () => import('../componentsgeneral/cliente/cliente.module').then(m => m.clienteModule),
                canActivate: [AuthGuard, RoleGuard]  
            },
        ]),
    ],
    exports: [RouterModule],
})
export class GeneralRoutingModule {}
