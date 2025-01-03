import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { RoleGuard } from 'src/app/guards/role.guard';

@NgModule({
    imports: [RouterModule.forChild([
        { 
            path: 'cotizacion', 
            data: { breadcrumb: 'Cotizaciones' }, 
            loadChildren: () => import('../componentsinsumo/cotizacion/cotizacion.module').then(m => m.CotizacionModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'material', 
            data: { breadcrumb: 'Materiales' }, 
            loadChildren: () => import('../componentsinsumo/material/material.module').then(m => m.MaterialModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'subcategoria', 
            data: { breadcrumb: 'Sub Categorías' },
            loadChildren: () => import('../componentsinsumo/subcategoria/subcategoria.module').then(m => m.SubcategoriaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'bodegas', 
            data: { breadcrumb: 'Bodegas' }, 
            loadChildren: () => import('./Bodegas/bodega.module').then(m => m.BodegaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'bodegai', 
            data: { breadcrumb: 'BodegasPorInsumos' },
            loadChildren: () => import('../componentsinsumo/bodegaporinsumo/bodegaporinsumo.module').then(m => m.BodegaPorInsumoModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'categoria', 
            data: { breadcrumb: 'Categorías' }, 
            loadChildren: () => import('../componentsinsumo/categoria/categoria.module').then(m => m.CategoriaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'compra', 
            data: { breadcrumb: 'Órdenes de Compra' }, 
            loadChildren: () => import('../componentsinsumo/compra/compra.module').then(m => m.CompraModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'Insumos', 
            data: { breadcrumb: 'Insumos' }, 
            loadChildren: () => import('../componentsinsumo/insumo/insumo.module').then(m => m.InsumoModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'proveedor', 
            data: { breadcrumb: 'Proveedores' }, 
            loadChildren: () => import('../componentsinsumo/proveedor/proveedor.module').then(m => m.ProveedorModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'maquinaria', 
            data: { breadcrumb: 'Maquinarias' }, 
            loadChildren: () => import('../componentsinsumo/maquinaria/maquinaria.module').then(m => m.MaquinariaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'rentamaquinariaporactividad', 
            data: { breadcrumb: 'Rentas Maquinaria Por Actividad' }, 
            loadChildren: () => import('../componentsinsumo/rentamaquinariaporactividad/rentamaquinariaporactividad.module').then(m => m.RentaMaquinariaPorActividadModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
    ])],
    exports: [RouterModule],
})
export class InsumoRoutingModule { }
