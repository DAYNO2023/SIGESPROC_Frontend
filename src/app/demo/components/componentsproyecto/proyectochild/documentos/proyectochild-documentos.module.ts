import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { CalendarModule } from "primeng/calendar";
import { RouterModule } from "@angular/router";
import { ProyectoChildDocumentosComponent } from "./proyectochild-documentos.component";
import { RadioButtonModule } from "primeng/radiobutton";
import { AutoCompleteModule } from "primeng/autocomplete";
import { FileUploadModule } from "primeng/fileupload";
import { TableModule } from "primeng/table";
import { ProgressBarModule } from "primeng/progressbar";
import { BadgeModule } from "primeng/badge";
import { SplitButtonModule } from "primeng/splitbutton";
import { ImageModule } from "primeng/image";
import { InputTextareaModule } from "primeng/inputtextarea";

@NgModule({
    declarations: [ProyectoChildDocumentosComponent],
    imports: [
        CommonModule,
		ButtonModule,
		InputTextModule,
		DropdownModule,
		InputNumberModule,
		DialogModule,
        FormsModule,
        CalendarModule,
        RadioButtonModule,
        AutoCompleteModule,
        FileUploadModule,
        TableModule,
        ProgressBarModule,
        BadgeModule,
        SplitButtonModule,
        ImageModule,
        InputTextareaModule,
        RouterModule.forChild([
            { path: '', component: ProyectoChildDocumentosComponent }
        ]),
    ]
})
export class ProyectoChildDocumentosModule { }
