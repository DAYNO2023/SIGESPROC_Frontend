import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { RippleModule } from 'primeng/ripple';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { IncidentesactividadesdashComponent } from './incidentesactividadesdash.component';
import { IncidentesPorActividadesRoutingModule } from './incidentesactividadesdash-routing.module';
import { ChartModule } from 'primeng/chart'

@NgModule({
    imports: [
        CommonModule,
        IncidentesPorActividadesRoutingModule,
        ReactiveFormsModule,
        TableModule,
        ChartModule,
        ButtonModule,
        ToastModule,
        FormsModule,
        InputTextModule,
        ButtonModule,
        CalendarModule,
        ToggleButtonModule,
        RippleModule,
        InputGroupModule,
        MultiSelectModule,
        DropdownModule,
        DialogModule,
        SplitButtonModule,
    ],
    declarations: [IncidentesactividadesdashComponent],
})
export class IncidentesPorActividadesModule {}
