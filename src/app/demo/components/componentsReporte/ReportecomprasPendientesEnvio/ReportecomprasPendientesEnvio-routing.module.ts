import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportecomprasPendientesEnvioComponent } from './ReportecomprasPendientesEnvio.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReportecomprasPendientesEnvioComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
