import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { mantenimientoComponent } from './mantenimiento.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: mantenimientoComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
