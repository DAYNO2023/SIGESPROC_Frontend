import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FletesasociadosaproyectosComponent } from './fletesasociadosaproyectos.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: FletesasociadosaproyectosComponent }])],
    exports: [RouterModule],
})
export class FletesAsociadosaProyectosRoutingModule {}
