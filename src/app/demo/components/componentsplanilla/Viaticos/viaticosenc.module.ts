import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { viaticosencRoutingModule } from "./viaticosenc-routing.module";
import { FormsModule } from '@angular/forms';
import { ButtonModule } from "primeng/button";
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
import { ViaticosencComponent } from "./viaticosenc.component";
import { InputSwitchModule } from 'primeng/inputswitch';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { HttpClientModule } from '@angular/common/http'; 
@NgModule({
    declarations: [ViaticosencComponent],
    imports: [
        ReactiveFormsModule,
        CommonModule,
        InputSwitchModule,
        TableModule,
        ButtonModule,
        ToastModule,
        InputTextModule,
        CalendarModule,
        ToggleButtonModule,
        RippleModule,
        InputNumberModule,
        InputGroupModule,
        MultiSelectModule,
        DropdownModule,
        DialogModule,
        AccordionModule,
        SplitButtonModule,
        HttpClientModule,
        FormsModule,
        viaticosencRoutingModule,AutoCompleteModule,FileUploadModule,ConfirmDialogModule,
    ]
})
export class ViaticosEncModule { }