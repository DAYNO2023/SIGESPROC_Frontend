import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ControlcalidadchildComponent } from './controlcalidadchild.component';

const routes: Routes = [
  {path: '', component: ControlcalidadchildComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControlcalidadchildRoutingModule { }
