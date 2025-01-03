import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
// import { ni } from "../../niveles/niveles/niveles.component";
import { incidentescompletoComponent } from "./incidentes-completo.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: incidentescompletoComponent }
	])],
	exports: [RouterModule]
})
export class IncidentesRoutingModule { }