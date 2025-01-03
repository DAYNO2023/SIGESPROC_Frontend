import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
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
import { TasacambioComponent } from "./tasacambio.component";
import { TasacambioRoutingModule } from "./tasacambio-routing.module";
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from "@angular/forms";
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@NgModule({
    imports: [
      CommonModule,
      TasacambioRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      AutoCompleteModule,
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
      ProgressSpinnerModule
    ],
    declarations: [
      TasacambioComponent
    ]
  })
  export class TasacambioModule { }
