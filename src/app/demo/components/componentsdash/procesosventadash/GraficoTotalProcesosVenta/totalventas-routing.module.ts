import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TotalventasComponent } from './totalventas.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: TotalventasComponent }])],
    exports: [RouterModule],
})
export class TotalVentasRoutingModule {}
