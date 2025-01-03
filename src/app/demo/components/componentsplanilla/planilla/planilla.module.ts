import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanillaRoutingModule } from './planilla-routing.module';
import { ButtonModule } from "primeng/button";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
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
import { PlanillaComponent } from "./planilla.component";
import { AutoCompleteModule } from 'primeng/autocomplete'; 
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  imports: [
    CommonModule,
    PlanillaRoutingModule,
    ReactiveFormsModule,
    CommonModule,
    TableModule,
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
    AutoCompleteModule,
    InputSwitchModule,
    FormsModule, 
    ProgressSpinnerModule
  ],
  declarations: [PlanillaComponent]
})
export class PlanillaModule { }
