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
import { FormsModule } from '@angular/forms';
import { ToastModule } from "primeng/toast";
import { ToggleButtonModule } from "primeng/togglebutton";
import { categoriaviaticoComponent } from "./categoriaviatico.component";
import { categoriaviaticoRoutingModule } from "./categoriaviatico-routing.module";
import { UnidadMedidaRoutingModule } from "../../componentsgeneral/UnidadesdeMedida/unidadmedida-routing.module";
@NgModule({
    imports: [
      CommonModule,
      categoriaviaticoRoutingModule,
      ReactiveFormsModule,
      TableModule,
      ButtonModule,
      ToastModule,
      InputTextModule,
      CalendarModule,
      ToggleButtonModule,
      RippleModule,FormsModule,
      InputGroupModule,
      MultiSelectModule,
      DropdownModule,
      DialogModule,
      SplitButtonModule,
    ],
    declarations: [
        categoriaviaticoComponent
    ]
  })
  export class UnidadMedidaModule { }