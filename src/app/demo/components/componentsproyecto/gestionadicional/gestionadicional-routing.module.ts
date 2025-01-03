import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
// import { ni } from "../../niveles/niveles/niveles.component";
import { GestionAdicionalComponent } from "./gestionadicional.component"; 

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: GestionAdicionalComponent }
	])],
	exports: [RouterModule]
})
export class GestionadicionalRoutingModule { }