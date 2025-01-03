import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CargoComponent } from "./cargo.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: CargoComponent }
	])],
	exports: [RouterModule]
})
export class CargoRoutingModule { }
