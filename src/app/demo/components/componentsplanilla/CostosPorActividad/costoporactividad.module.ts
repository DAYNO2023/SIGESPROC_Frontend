import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { costoporactividadRoutingModule } from "./costoporactividad-routing.module";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormatCurrencyDirective } from '../../../../format-currency.directive';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { RippleModule } from "primeng/ripple";
import { SplitButtonModule } from "primeng/splitbutton";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { ToggleButtonModule } from "primeng/togglebutton";
import { CostoporactividadComponent } from "./costoporactividad.component";
import { InputSwitchModule } from 'primeng/inputswitch';

import { CheckboxModule } from 'primeng/checkbox';
import { StepsModule } from 'primeng/steps';
import { TabMenuModule } from 'primeng/tabmenu';
import { CardModule } from 'primeng/card';
import{ ListboxModule}from 'primeng/listbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { FileUploadModule } from 'primeng/fileupload';
import { AutoCompleteModule } from 'primeng/autocomplete';

@NgModule({
    declarations: [CostoporactividadComponent, FormatCurrencyDirective],
    imports: [
        InputNumberModule,
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        FormsModule,
        InputTextModule,
        CalendarModule,
        ToggleButtonModule,
        RippleModule,
        AutoCompleteModule,
        InputGroupModule,
        MultiSelectModule,
        DropdownModule,
        DialogModule,
        SplitButtonModule,
        CheckboxModule,
        StepsModule,
        TabMenuModule,
        CardModule,
        FileUploadModule,
        ListboxModule,
        costoporactividadRoutingModule,
        ProgressSpinnerModule
    ]
})
export class CostoporactividadModule { }