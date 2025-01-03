import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProveedoresmascompradosComponent } from './proveedoresmascomprados.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: ProveedoresmascompradosComponent }])],
    exports: [RouterModule],
})
export class ProveedoresmasCompradosRoutingModule {}
