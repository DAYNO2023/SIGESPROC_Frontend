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
import { EmpleadoRoutingModule } from './empleado-routing.module';
import { EmpleadoComponent } from './empleado.component';
import { TabViewModule } from 'primeng/tabview';
import { InfoComponent } from './info/info.component';
import { FormPrestamoComponent } from '../../componentsplanilla/prestamo/form-prestamo/form-prestamo.component';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
@NgModule({
    imports: [
        CommonModule,
        EmpleadoRoutingModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        InputTextModule,
        InputNumberModule,
        TooltipModule,
        CalendarModule,
        ToggleButtonModule,
        RippleModule,
        InputGroupModule,
        MultiSelectModule,
        DropdownModule,
        DialogModule,
        SplitButtonModule,
        TabViewModule,
        InfoComponent,
        FormsModule,
        FormPrestamoComponent,
        CheckboxModule,
    ],
    declarations: [EmpleadoComponent],
})
export class EmpleadoModule {}
