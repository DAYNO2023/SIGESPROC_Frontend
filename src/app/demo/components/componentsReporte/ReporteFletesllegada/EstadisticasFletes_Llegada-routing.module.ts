import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EstadisticasFletes_LlegadaComponent } from './EstadisticasFletes_Llegada.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: EstadisticasFletes_LlegadaComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
