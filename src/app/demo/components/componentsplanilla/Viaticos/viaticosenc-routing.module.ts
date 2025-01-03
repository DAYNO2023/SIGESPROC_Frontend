import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ViaticosencComponent } from './viaticosenc.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ViaticosencComponent }
    ])],
    exports: [RouterModule]
})
export class viaticosencRoutingModule { }