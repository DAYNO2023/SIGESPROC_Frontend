import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GraficosComponent } from './graficos.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: GraficosComponent }
    ])],
    exports: [RouterModule]
})
export class GraficosRoutingModule { }