import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { EstadoCivilComponent } from "./estadoCivil.component";


@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: EstadoCivilComponent }
	])],
	exports: [RouterModule]
})
export class EstadoCivilRoutingModule { }
