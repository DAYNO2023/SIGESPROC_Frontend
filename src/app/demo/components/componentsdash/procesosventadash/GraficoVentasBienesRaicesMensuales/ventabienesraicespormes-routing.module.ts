import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VentasbienesraicespormesComponent } from './ventasbienesraicespormes.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: VentasbienesraicespormesComponent }])],
    exports: [RouterModule],
})
export class VentaBienesRaicesPorMesRoutingModule {}
