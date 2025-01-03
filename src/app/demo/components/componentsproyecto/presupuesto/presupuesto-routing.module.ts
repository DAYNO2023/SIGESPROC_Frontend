import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PresupuestoComponent } from './presupuesto.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: PresupuestoComponent }
	])],
	exports: [RouterModule]
})
export class PresupuestoRoutingModule { }
