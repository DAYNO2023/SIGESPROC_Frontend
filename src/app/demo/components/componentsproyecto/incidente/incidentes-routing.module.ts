import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
// import { ni } from "../../niveles/niveles/niveles.component";
import { IncidentesComponent } from "./incidentes.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: IncidentesComponent }
	])],
	exports: [RouterModule]
})
export class IncidentesRoutingModule { }