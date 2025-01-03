import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteProcesoVentaComponent } from './ReporteProcesoVenta.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteProcesoVentaComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
