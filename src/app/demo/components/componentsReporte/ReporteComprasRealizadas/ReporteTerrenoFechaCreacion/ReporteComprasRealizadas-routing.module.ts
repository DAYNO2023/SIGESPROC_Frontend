import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteComprasRealizadasComponent } from './ReporteComprasRealizadas.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteComprasRealizadasComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
