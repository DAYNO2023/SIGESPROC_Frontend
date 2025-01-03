import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BienesRaicesComponent } from './bienraiz.component';

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: BienesRaicesComponent }
  ])],
  exports: [RouterModule]
})
export class BienraizRoutingModule { }
