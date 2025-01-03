import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ImpuestoComponent } from "./impuesto.component"; 

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ImpuestoComponent }
	])],
	exports: [RouterModule]
})
export class ImpuestoRoutingModule { }
