import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteTerrenosPorEstadoProyectoComponent } from './ReporteTerrenosPorEstadoProyecto.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteTerrenosPorEstadoProyectoComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
