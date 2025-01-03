import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeguimientoproyectoComponent } from './seguimientoproyecto.component'



const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([{ path: '', component: SeguimientoproyectoComponent }])],
  exports: [RouterModule]
})
export class SeguimientoproyectoRoutingModule { }
