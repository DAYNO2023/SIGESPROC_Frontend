import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
// import { ni } from "../../niveles/niveles/niveles.component";
import { TasacambioComponent } from "./tasacambio.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: TasacambioComponent }
	])],
	exports: [RouterModule]
})
export class TasacambioRoutingModule { }