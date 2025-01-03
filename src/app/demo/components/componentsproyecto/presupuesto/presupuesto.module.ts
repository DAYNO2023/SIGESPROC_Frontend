import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MultiSelectModule } from "primeng/multiselect";
import { FormsModule } from '@angular/forms'; 
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from "primeng/ripple";
import { SplitButtonModule } from "primeng/splitbutton";
import { TableModule } from "primeng/table";
import { OverlayPanelModule } from "primeng/overlaypanel"; 
import { ToggleButtonModule } from "primeng/togglebutton";
import { PresupuestoComponent } from "./presupuesto.component";
import { PresupuestoRoutingModule } from "./presupuesto-routing.module";
import { TabViewModule } from 'primeng/tabview';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextareaModule } from "primeng/inputtextarea";
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { FieldsetModule } from 'primeng/fieldset';
import { RadioButtonModule } from 'primeng/radiobutton';
@NgModule({
    imports: [
      CommonModule,
      PresupuestoRoutingModule,
      ReactiveFormsModule,
      InputTextareaModule,
      RadioButtonModule,
      FieldsetModule,
      CheckboxModule,
      OverlayPanelModule,
      TableModule,
      TooltipModule,
      ButtonModule,
      ToastModule,
      AutoCompleteModule,
      TabViewModule,
      InputNumberModule,
      MenuModule,
      InputSwitchModule,
      InputTextModule,
      CalendarModule,
      FormsModule,
      ToggleButtonModule,
      RippleModule,
      InputGroupModule,
      MultiSelectModule,
      DropdownModule,
      DialogModule,
      SplitButtonModule,
    ],
    declarations: [
      PresupuestoComponent
    ]
  })
  export class PresupuestoModule { }