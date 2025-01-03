import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteComparativoProductosComponent } from './ReporteComparativoProductos.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteComparativoProductosComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
