import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmpresaBienRaizComponent } from './empresabienraiz.component';

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: EmpresaBienRaizComponent }
  ])],
  exports: [RouterModule]
})
export class EmpresabienraizRoutingModule { }
