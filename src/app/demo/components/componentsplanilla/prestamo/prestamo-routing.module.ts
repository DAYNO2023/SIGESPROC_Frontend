import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PrestamoComponent } from './prestamo.component';

@NgModule({
    imports: [
        RouterModule.forChild([{ path: '', component: PrestamoComponent }]),
    ],
    exports: [RouterModule],
})
export class PrestamoRoutingModule {}
