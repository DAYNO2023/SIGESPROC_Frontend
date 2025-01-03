import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { clienteComponent } from './cliente.component';

const routes: Routes = [
  { path: '', component: clienteComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteRoutingModule { }
