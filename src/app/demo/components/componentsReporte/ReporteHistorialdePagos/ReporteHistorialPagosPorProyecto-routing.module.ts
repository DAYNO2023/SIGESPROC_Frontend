import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteHistorialPagosPorProyectoComponent } from './ReporteHistorialPagosPorProyecto.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteHistorialPagosPorProyectoComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
