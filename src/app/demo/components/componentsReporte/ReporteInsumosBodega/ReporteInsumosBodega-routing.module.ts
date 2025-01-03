import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteInsumosBodegaComponent } from './ReporteInsumosBodega.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteInsumosBodegaComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
