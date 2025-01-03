import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteComparacionMonetariaComponent } from './ReporteComparacionMonetaria.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteComparacionMonetariaComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
