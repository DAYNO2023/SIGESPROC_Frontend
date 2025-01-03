import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProyectomayorcostoComponent } from './proyectomayorcosto.component';
@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: ProyectomayorcostoComponent }])],
    exports: [RouterModule],
})
export class ProyectomayorcostoRoutingModule {}
