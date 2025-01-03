import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BancosmasacreditadosComponent } from './bancosmasacreditados.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: BancosmasacreditadosComponent }])],
    exports: [RouterModule],
})
export class BancosMasAcreditadosRoutingModule {}
