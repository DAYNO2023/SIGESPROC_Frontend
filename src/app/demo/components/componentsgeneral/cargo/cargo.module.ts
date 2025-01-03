import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
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
import { CargoComponent } from "./cargo.component";
import { CargoRoutingModule } from "./cargo-routing.module";
@NgModule({
    imports: [
      CommonModule,
      CargoRoutingModule,
      ReactiveFormsModule,
      FormsModule,
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
    ],
    declarations: [
      CargoComponent
    ]
  })
  export class CargoModule { }
