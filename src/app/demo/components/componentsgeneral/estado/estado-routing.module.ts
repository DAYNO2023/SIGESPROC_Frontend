import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { EstadoComponent } from "./estado.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: EstadoComponent }
	])],
	exports: [RouterModule]
})
export class EstadoRoutingModule { }
