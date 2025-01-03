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
import { PrestamoComponent } from './prestamo.component';
import { PrestamoRoutingModule } from './prestamo-routing.module';
import { FormPrestamoComponent } from './form-prestamo/form-prestamo.component';
import { InputNumberModule } from 'primeng/inputnumber';
@NgModule({
    imports: [
        CommonModule,
        PrestamoRoutingModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        InputTextModule,
        InputNumberModule,
        CalendarModule,
        ToggleButtonModule,
        RippleModule,
        InputGroupModule,
        MultiSelectModule,
        DropdownModule,
        DialogModule,
        SplitButtonModule,
        FormPrestamoComponent,
        FormsModule,
    ],
    declarations: [PrestamoComponent],
})
export class PrestamoModule {}
