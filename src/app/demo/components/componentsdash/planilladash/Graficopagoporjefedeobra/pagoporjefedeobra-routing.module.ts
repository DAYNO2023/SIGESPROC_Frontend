import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PagoporjefedeobraComponent } from './pagoporjefedeobra.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: PagoporjefedeobraComponent }])],
    exports: [RouterModule],
})
export class PagoPorJefedeObraRoutingModule {}
