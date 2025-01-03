import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule ,FormsModule} from "@angular/forms";
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
import { CiudadComponent } from "./ciudad.component";
import { CiudadRoutingModule } from "./ciudad-routing.module";
import { AutoCompleteModule } from 'primeng/autocomplete';

@NgModule({
  imports: [
    AutoCompleteModule,
    CommonModule,
    ReactiveFormsModule,
    CiudadRoutingModule,
    TableModule,
    ButtonModule,
    FormsModule,
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
  ],
  declarations: [
    CiudadComponent
  ]
})
export class ciudadModule { }
