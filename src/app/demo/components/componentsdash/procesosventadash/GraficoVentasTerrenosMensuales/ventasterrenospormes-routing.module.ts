import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VentasterrenospormesComponent } from './ventasterrenospormes.component';
@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: VentasterrenospormesComponent }])],
    exports: [RouterModule],
})
export class VentasTerrenosPorMesRoutingModule {}
