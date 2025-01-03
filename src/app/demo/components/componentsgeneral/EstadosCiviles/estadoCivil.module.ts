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
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToggleButtonModule } from "primeng/togglebutton";
import { EstadoCivilComponent } from "./estadoCivil.component";
import { EstadoCivilRoutingModule } from "./estadoCivil-routing.module";
//importe de los modulos a utilizar
@NgModule({
    imports: [
      CommonModule,
      FormsModule,
      EstadoCivilRoutingModule,
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
      ProgressSpinnerModule
    ],
    declarations: [
      EstadoCivilComponent
    ]
  })
  export class EstadoCivilModule { }
