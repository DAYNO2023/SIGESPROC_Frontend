import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrecuenciaComponent } from './frecuencia.component';


@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: FrecuenciaComponent }
  ])],
  exports: [RouterModule]
})
export class FrecuenciaRoutingModule { }
