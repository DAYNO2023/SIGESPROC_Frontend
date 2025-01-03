import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RentaMaquinariaPorActividadComponent } from './rentamaquinariaporactividad.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: RentaMaquinariaPorActividadComponent }
    ])],
    exports: [RouterModule]
})
export class RentaMaquinariaPorActividadRoutingModule { }