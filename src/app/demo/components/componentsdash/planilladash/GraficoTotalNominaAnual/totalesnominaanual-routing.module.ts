import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TotalesnominaanualComponent } from './totalesnominaanual.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: TotalesnominaanualComponent }])],
    exports: [RouterModule],
})
export class TotalesNominaAnualRoutingModule {}
