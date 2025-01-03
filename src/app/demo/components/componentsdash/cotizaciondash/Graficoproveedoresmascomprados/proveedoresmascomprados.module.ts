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
import { ProveedoresmascompradosComponent } from './proveedoresmascomprados.component';
import { ProveedoresmasCompradosRoutingModule } from './proveedoremascomprados-routing.module';
import { ChartModule } from 'primeng/chart'
@NgModule({
    imports: [
        CommonModule,
        ProveedoresmasCompradosRoutingModule,
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
    declarations: [ProveedoresmascompradosComponent],
})
export class ProveedoresmasCompradosModule {}
