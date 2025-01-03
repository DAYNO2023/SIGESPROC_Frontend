import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProyectoejecuciondepartamentosComponent } from './proyectoejecuciondepartamentos.component';
@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: ProyectoejecuciondepartamentosComponent }])],
    exports: [RouterModule],
})
export class ProyectoejecuciondepartamentosRoutingModule {}
