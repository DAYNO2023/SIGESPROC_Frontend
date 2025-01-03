import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteProgresoActividadesComponent } from './ReporteProgresoActividades.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteProgresoActividadesComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
