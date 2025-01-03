import { NgModule } from "@angular/core";
import { ProyectoChildComponent } from "./proyectochild.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { FileUploadModule } from "primeng/fileupload";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { RadioButtonModule } from "primeng/radiobutton";
import { RatingModule } from "primeng/rating";
import { SplitButtonModule } from "primeng/splitbutton";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { ToolbarModule } from "primeng/toolbar";
import { ProyectoChildRoutingModule } from "./proyectochild-routing.module";
import { TabMenuModule } from "primeng/tabmenu";
import { ToggleButtonModule } from "primeng/togglebutton";
import { CalendarModule } from "primeng/calendar";

@NgModule({
    declarations: [ProyectoChildComponent],
    imports: [
        CommonModule,
        ProyectoChildRoutingModule,
        TableModule,
		FileUploadModule,
		ToggleButtonModule,
		FormsModule,
		ButtonModule,
		ToastModule,
		ToolbarModule,
		RatingModule,
		InputTextModule,
		InputTextareaModule,
		DropdownModule,
		RadioButtonModule,
		InputNumberModule,
		DialogModule,
		SplitButtonModule,
		TabMenuModule,
		CalendarModule,
    ]
})
export class ProyectoChildModule { }
