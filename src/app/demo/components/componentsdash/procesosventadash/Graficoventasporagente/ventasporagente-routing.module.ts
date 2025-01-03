import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VentasporagenteComponent } from './ventasporagente.component';
@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: VentasporagenteComponent }])],
    exports: [RouterModule],
})
export class VentasPorAgenteRoutingModule {}
