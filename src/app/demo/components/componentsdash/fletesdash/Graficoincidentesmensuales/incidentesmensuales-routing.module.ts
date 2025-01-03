import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IncidentesmensualesComponent } from './incidentesmensuales.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: IncidentesmensualesComponent }])],
    exports: [RouterModule],
})
export class IncidentesMensualesRoutingModule {}
