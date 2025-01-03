import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BancoComponent } from './banco.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: BancoComponent }])],
    exports: [RouterModule],
})
export class BancoRoutingModule {}
