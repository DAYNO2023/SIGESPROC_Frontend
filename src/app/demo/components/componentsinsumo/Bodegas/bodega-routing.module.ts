import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BodegaComponent } from './bodega.component';
@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: BodegaComponent }
	])],
	exports: [RouterModule]
})
export class BodegaRoutingModule { }
