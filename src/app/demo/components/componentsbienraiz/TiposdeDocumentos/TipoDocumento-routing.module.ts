import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { categoriaviaticoComponent } from './TipoDocumento.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: categoriaviaticoComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
