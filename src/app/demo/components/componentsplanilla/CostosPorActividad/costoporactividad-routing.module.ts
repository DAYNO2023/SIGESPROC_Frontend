import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CostoporactividadComponent } from './costoporactividad.component';

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: CostoporactividadComponent }
    ])],
    exports: [RouterModule]
})
export class costoporactividadRoutingModule { }