import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PantallaComponent } from './pantalla.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: PantallaComponent }
    ])],
    exports: [RouterModule]
})
export class PantallaRoutingModule { }