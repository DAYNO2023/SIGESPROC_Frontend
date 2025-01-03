import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteEmpleadoPorEstadoComponent } from './ReporteEmpleadoPorEstado.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteEmpleadoPorEstadoComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
