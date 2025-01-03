import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlcalidadchildComponent } from './controlcalidadchild.component';
import { ControlcalidadchildRoutingModule } from './controlcalidadchild-routing.module';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from "@angular/forms";
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
import { FormsModule } from "@angular/forms";
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FileUploadModule } from 'primeng/fileupload';



@NgModule({
  declarations: [ControlcalidadchildComponent],
  imports: [
    CommonModule,
    ControlcalidadchildRoutingModule,
    ButtonModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    FileUploadModule,
    AutoCompleteModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputNumberModule,
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
export class ControlcalidadchildModule { }
