import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { ReactiveFormsModule } from "@angular/forms";
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
import { MaquinariaRoutingModule } from "./maquinaria-routing.module";
import { MaquinariaComponent } from "./maquinaria.component";
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from "@angular/forms";
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputNumberModule } from 'primeng/inputnumber';
@NgModule({
    imports: [
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        MaquinariaRoutingModule,
        TableModule,
        InputNumberModule,
        AutoCompleteModule,
        ButtonModule,
        ToastModule,
        InputTextModule,
        CalendarModule,
        ToggleButtonModule,
        RippleModule,
        InputGroupModule,
        MultiSelectModule,
        DropdownModule,
        DialogModule,
        SplitButtonModule,
        ProgressSpinnerModule,
    ],
    declarations: [
        MaquinariaComponent
    ]
})
export class MaquinariaModule { }