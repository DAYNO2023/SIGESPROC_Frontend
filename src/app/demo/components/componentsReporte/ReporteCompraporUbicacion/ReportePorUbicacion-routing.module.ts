import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportePorUbicacionComponent } from './ReportePorUbicacion.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReportePorUbicacionComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
