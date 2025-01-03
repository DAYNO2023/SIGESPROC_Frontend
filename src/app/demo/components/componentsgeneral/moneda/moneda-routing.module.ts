import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MonedaComponent } from "./moneda.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: MonedaComponent }
	])],
	exports: [RouterModule]
})
export class MonedaRoutingModule { }
