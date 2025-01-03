import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaquinariaComponent } from './maquinaria.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: MaquinariaComponent }
    ])],
    exports: [RouterModule]
})
export class MaquinariaRoutingModule { }