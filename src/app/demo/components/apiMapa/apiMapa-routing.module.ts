import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ApiMapaComponent } from "./apiMapa.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ApiMapaComponent }
	])],
	exports: [RouterModule]
})
export class ApiMapaRoutingModule { }
