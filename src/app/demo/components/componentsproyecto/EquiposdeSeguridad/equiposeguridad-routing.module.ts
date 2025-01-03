import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { equiposeguridadComponent } from "./equiposeguridad.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: equiposeguridadComponent }
	])],
	exports: [RouterModule]
})
export class equiposeguridadRoutingModule { }