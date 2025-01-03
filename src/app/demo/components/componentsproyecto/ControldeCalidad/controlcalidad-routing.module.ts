import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
// import { ni } from "../../niveles/niveles/niveles.component";
import { ControlcalidadComponent } from "./controlcalidad.component"; 

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ControlcalidadComponent}
	])],
	exports: [RouterModule]
})
export class ControlCalidadRoutingModule { }