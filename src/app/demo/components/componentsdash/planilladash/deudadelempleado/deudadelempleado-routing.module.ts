import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeudadelempleadoComponent } from './deudadelempleado.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: DeudadelempleadoComponent }])],
    exports: [RouterModule],
})
export class DeudadelEmpleadoRoutingModule {}
