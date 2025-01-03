import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SubcategoriaComponent } from "./subcategoria.component";

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component:SubcategoriaComponent }
  ])],

  exports: [RouterModule]
})
export class SubcategoriaRoutingModule { }
