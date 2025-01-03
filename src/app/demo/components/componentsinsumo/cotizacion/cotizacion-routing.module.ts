import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { cotizacionComponent } from './cotizacion.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: cotizacionComponent }
    ])],
    exports: [RouterModule]
})
export class cotizacionRoutingModule { }