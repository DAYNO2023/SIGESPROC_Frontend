import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AgenteBienRaizComponent } from './agentebienraiz.component';

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: AgenteBienRaizComponent }
  ])],
  exports: [RouterModule]
})
export class AgenteBienRaizRoutingModule { }
