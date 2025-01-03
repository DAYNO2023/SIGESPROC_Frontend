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
import { ProyectoejecuciondepartamentosComponent } from './proyectoejecuciondepartamentos.component';
import { ProyectoejecuciondepartamentosRoutingModule } from './proyectoejecuciondepartamentos-routing.module';
import { ChartModule } from 'primeng/chart'
import { AutoCompleteModule } from 'primeng/autocomplete';

@NgModule({
    imports: [
        CommonModule,
        ProyectoejecuciondepartamentosRoutingModule,
        ReactiveFormsModule,
        TableModule,
        ChartModule,
        ButtonModule,
        ToastModule,
        FormsModule,
        InputTextModule,
        ButtonModule,
        CalendarModule,
        AutoCompleteModule,
        ToggleButtonModule,
        RippleModule,
        InputGroupModule,
        MultiSelectModule,
        DropdownModule,
        DialogModule,
        SplitButtonModule,
    ],
    declarations: [ProyectoejecuciondepartamentosComponent],
})
export class ProyectoejecuciondepartamentosModule {}
