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
import { ReportePorUbicacionComponent } from "./ReportePorUbicacion.component";
import { categoriaviaticoRoutingModule } from "./ReportePorUbicacion-routing.module";
import { UnidadMedidaRoutingModule } from "../../componentsgeneral/UnidadesdeMedida/unidadmedida-routing.module";
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TooltipModule } from 'primeng/tooltip';
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
      RippleModule,
      InputGroupModule,
      MultiSelectModule,
      DropdownModule,
      DialogModule,
      SplitButtonModule,
      ProgressSpinnerModule,
      FormsModule,
      CardModule,
      ButtonModule,
      ProgressSpinnerModule,
      InputSwitchModule,
      AutoCompleteModule,
      TooltipModule
    ],
    declarations: [
      ReportePorUbicacionComponent
    ]
  })
  export class ReportePorUbicacionComponentaModule { }
