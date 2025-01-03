import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteArticulosActividades } from './ReporteArticulosActividades.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteArticulosActividades }
    ])],
    exports: [RouterModule]
})
export class ReporteArticulosActividadesRoutingModule { }
