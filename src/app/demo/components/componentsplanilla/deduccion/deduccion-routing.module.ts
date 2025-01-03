import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeduccionComponent } from './deduccion.component';

@NgModule({
    imports: [
        RouterModule.forChild([{ path: '', component: DeduccionComponent }]),
    ],
    exports: [RouterModule],
})
export class DeduccionRoutingModule {}
