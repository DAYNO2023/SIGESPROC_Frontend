
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { PresupuestoComponent } from "../../componentsproyecto/presupuesto/presupuesto.component";
import { UsuarioComponent } from "./usuario.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: UsuarioComponent }
	])],
	exports: [RouterModule]

})
export class UsuarioRoutingModule { }