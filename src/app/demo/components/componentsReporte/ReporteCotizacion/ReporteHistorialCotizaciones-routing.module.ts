import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RReporteHistorialCotizacionesComponent } from './ReporteHistorialCotizaciones.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: RReporteHistorialCotizacionesComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
