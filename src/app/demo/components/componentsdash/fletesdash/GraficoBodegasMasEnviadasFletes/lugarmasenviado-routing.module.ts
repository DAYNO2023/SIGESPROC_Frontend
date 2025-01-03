import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LugarmasenviadoComponent } from './lugarmasenviado.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: LugarmasenviadoComponent }])],
    exports: [RouterModule],
})
export class LugarmasEnviadoRoutingModule {}
