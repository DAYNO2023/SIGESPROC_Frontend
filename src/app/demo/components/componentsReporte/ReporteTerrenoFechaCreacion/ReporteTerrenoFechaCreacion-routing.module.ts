import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteTerrenoFechaCreacionComponent } from './ReporteTerrenoFechaCreacion.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteTerrenoFechaCreacionComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
