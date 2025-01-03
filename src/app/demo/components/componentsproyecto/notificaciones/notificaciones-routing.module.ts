import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
// import { ni } from "../../niveles/niveles/niveles.component";
import { NotificacionesComponent } from "./notificaciones.component";

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: NotificacionesComponent }
	])],
	exports: [RouterModule]
})
export class NotificacionesRoutingModule { }