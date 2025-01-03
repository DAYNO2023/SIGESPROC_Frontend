import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteInsumosTransportadosPorActividadComponent } from './ReporteInsumosTransportadosPorActividad.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteInsumosTransportadosPorActividadComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
