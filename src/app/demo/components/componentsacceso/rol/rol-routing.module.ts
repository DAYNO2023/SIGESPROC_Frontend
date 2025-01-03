import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RolComponent } from './rol.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: RolComponent }
    ])],
    exports: [RouterModule]
})
export class RolRoutingModule { }