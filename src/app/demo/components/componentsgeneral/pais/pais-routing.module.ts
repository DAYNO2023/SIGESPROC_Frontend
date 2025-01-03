import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
// import { ni } from "../../niveles/niveles/niveles.component";
import { PaisComponent } from "./pais.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: PaisComponent }
	])],
	exports: [RouterModule]
})
export class PaisRoutingModule { }