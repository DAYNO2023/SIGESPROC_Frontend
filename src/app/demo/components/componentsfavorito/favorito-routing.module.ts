import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    { path: 'cotizacion', data: { breadcrumb: 'Cotizaciones' }, loadChildren: () => import('../componentsinsumo/cotizacion/cotizacion.module').then(m => m.CotizacionModule) },
    { path: 'compra', data: { breadcrumb: 'Órdenes de Compra' }, loadChildren: () => import('../componentsinsumo/compra/compra.module').then(m => m.CompraModule) },
    { path: 'proyecto', data: { breadcrumb: 'Proyectos' }, loadChildren: () => import('../componentsproyecto/proyectochild/proyectochild.module').then(m => m.ProyectoChildModule) },
    { path: 'presupuesto', data: { breadcrumb: 'Presupuestos' }, loadChildren: () => import('../componentsproyecto/presupuesto/presupuesto.module').then(m => m.PresupuestoModule) },
    { path: 'planilla', data: { breadcrumb: 'Planillas' }, loadChildren: () => import('../componentsplanilla/planilla/planilla.module').then(m => m.PlanillaModule) },
    { path: 'flete', data: { breadcrumb: 'Fletes' }, loadChildren: () => import('../componentsflete/Fletes/Fletes.module').then(m => m.FleteModule) },
    { path: 'bienraiz', data: { breadcrumb: 'Bienes Raices' }, loadChildren: () => import('../componentsbienraiz/BienesRaices/bienraiz.module').then(m => m.BienraizModule) },
    { path: 'ventadebienesraices', data: { breadcrumb: 'Ventas de Bienes Raices' }, loadChildren: () => import('../componentsbienraiz/VentadeBienesRaíces/VentadeBienesRaíces.module').then(m => m.VentabienraizModule) },
  ])],
  exports: [RouterModule]
})
export class favoritoRoutingModule { }
