import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReporteVentasPorEmpresaComponent } from './ReporteVentasPorEmpresa.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ReporteVentasPorEmpresaComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
