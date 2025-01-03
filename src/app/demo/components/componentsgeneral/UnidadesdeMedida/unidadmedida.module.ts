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
import { FormsModule } from '@angular/forms';

import { SplitButtonModule } from "primeng/splitbutton";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { ToggleButtonModule } from "primeng/togglebutton";
import { UnidadMedidaComponent } from "./unidadmedida.component";
import { UnidadMedidaRoutingModule } from "./unidadmedida-routing.module";
@NgModule({
    imports: [
      CommonModule,
      UnidadMedidaRoutingModule,
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
      DropdownModule,FormsModule,
      DialogModule,
      SplitButtonModule,
    ],
    declarations: [
      UnidadMedidaComponent
    ]
  })
  export class UnidadMedidaModule { }