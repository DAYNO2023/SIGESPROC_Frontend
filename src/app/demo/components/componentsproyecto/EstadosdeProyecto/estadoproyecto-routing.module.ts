import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { estadoproyectoComponent } from "./estadoproyecto.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: estadoproyectoComponent }
	])],
	exports: [RouterModule]
})
export class estadoproyectoRoutingModule { }