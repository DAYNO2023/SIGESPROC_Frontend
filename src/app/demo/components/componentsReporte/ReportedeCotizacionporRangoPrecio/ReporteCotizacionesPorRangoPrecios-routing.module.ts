import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteCotizacionesPorRangoPreciosComponent } from './ReporteCotizacionesPorRangoPrecios.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteCotizacionesPorRangoPreciosComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
