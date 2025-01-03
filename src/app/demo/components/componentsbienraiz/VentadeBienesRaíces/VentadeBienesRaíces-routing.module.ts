import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VentabienraizComponent } from "./VentadeBienesRaíces.component";


@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: VentabienraizComponent }
	])],
	exports: [RouterModule]
})
export class VentabienraizRoutingModule { }
