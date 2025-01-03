import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UbicacionmasenviadaComponent } from './ubicacionmasenviada.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: UbicacionmasenviadaComponent }])],
    exports: [RouterModule],
})
export class UbicacionmasenviadaRoutingModule {}
