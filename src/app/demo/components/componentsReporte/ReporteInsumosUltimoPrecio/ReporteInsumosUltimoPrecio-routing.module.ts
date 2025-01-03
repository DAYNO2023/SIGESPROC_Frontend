import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteInsumosUltimoPrecioComponent } from './ReporteInsumosUltimoPrecio.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteInsumosUltimoPrecioComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
