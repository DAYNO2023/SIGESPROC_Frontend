import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BodegaPorInsumoComponent } from './bodegaporinsumo.component'; 
@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: BodegaPorInsumoComponent }
	])],
	exports: [RouterModule]
})
export class BodegaPorInsumoRoutingModule { }
