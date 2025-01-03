import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IncidentesactividadesdashComponent } from './incidentesactividadesdash.component';
@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: IncidentesactividadesdashComponent }])],
    exports: [RouterModule],
})
export class IncidentesPorActividadesRoutingModule {}
