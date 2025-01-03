import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TerrenoComponent } from './terreno.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: TerrenoComponent }
    ])],
    exports: [RouterModule]
})
export class TerrenoRoutingModule { }