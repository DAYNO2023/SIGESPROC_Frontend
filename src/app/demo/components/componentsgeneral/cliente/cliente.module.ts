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
import { clienteComponent } from "./cliente.component";
import { ClienteRoutingModule } from "./cliente-routing.module";
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';

@NgModule({
    imports: [
      CommonModule,
      RadioButtonModule,
      ClienteRoutingModule,
      FormsModule,
      ReactiveFormsModule,
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
    ],
    declarations: [
      clienteComponent
    ]
  })
  export class clienteModule { }