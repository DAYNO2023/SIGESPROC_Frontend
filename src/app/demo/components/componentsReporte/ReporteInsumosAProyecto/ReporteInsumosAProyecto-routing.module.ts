import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteInsumosAProyectoComponent } from './ReporteInsumosAProyecto.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteInsumosAProyectoComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
