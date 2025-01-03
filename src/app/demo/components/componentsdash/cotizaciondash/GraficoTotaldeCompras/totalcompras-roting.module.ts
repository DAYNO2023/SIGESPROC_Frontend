import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TotalcomprasComponent } from './totalcompras.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: TotalcomprasComponent }])],
    exports: [RouterModule],
})
export class TotalComprasRoutingModule {}
