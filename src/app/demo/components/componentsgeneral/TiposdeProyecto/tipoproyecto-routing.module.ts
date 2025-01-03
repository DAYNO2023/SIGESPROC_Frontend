import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { TipoproyectoComponent } from "./tipoproyecto.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: TipoproyectoComponent }
	])],
	exports: [RouterModule]
})
export class TipoproyectoRoutingModule { }
