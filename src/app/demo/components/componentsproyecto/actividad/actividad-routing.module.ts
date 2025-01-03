import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
// import { ni } from "../../niveles/niveles/niveles.component";
import { ActividadComponent } from "./actividad.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ActividadComponent }
	])],
	exports: [RouterModule]
})
export class ActividadRoutingModule { }