import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanillaComponent } from './planilla.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: PlanillaComponent }
  ])],
  exports: [RouterModule]
})
export class PlanillaRoutingModule { }