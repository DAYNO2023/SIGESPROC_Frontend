import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FleteComponent } from './Fletes.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: FleteComponent }
    ])],
    exports: [RouterModule]
})
export class FleteRoutingModule { }