import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UnidadMedidaComponent } from './unidadmedida.component';

@NgModule({
    imports: [
        RouterModule.forChild([{ path: '', component: UnidadMedidaComponent }]),
    ],
    exports: [RouterModule],
})
export class UnidadMedidaRoutingModule {}
