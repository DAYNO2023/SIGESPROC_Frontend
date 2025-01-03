import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EstadisticasFletes_ComparacionComponent } from './EstadisticasFletes_Comparacion.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: EstadisticasFletes_ComparacionComponent }
    ])],
    exports: [RouterModule]
})
export class categoriaviaticoRoutingModule { }
