import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { AutoCompleteModule } from 'primeng/autocomplete';
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
import { UsuarioComponent } from "./usuario.component";
import { UsuarioRoutingModule } from "./usuario-routing.module";
import { CheckboxModule } from 'primeng/checkbox';
@NgModule({
    declarations: [
      UsuarioComponent
    ],
    imports: [
      CheckboxModule,
      AutoCompleteModule,
      CommonModule,
      UsuarioRoutingModule,
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
    ]
  })
  export class UsuarioModule { }

