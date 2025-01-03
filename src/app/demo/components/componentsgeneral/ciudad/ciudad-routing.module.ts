import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CiudadComponent } from "./ciudad.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: CiudadComponent }
	])],
	exports: [RouterModule]
})
export class CiudadRoutingModule { }
