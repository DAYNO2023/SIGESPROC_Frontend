import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
// import { ni } from "../../niveles/niveles/niveles.component";
import { NivelesComponent } from "./niveles.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: NivelesComponent }
	])],
	exports: [RouterModule]
})
export class NivelesRoutingModule { }