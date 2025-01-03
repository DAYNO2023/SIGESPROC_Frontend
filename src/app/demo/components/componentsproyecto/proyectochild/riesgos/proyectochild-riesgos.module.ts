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
import { ProyectoChildRiesgosComponent } from "./proyectochild-riesgos.component";
import { TableModule } from "primeng/table";
import { SplitButtonModule } from "primeng/splitbutton";
import { InputTextareaModule } from "primeng/inputtextarea";

@NgModule({
    declarations: [ProyectoChildRiesgosComponent],
    imports: [
        CommonModule,
		ButtonModule,
		InputTextModule,
		DropdownModule,
		InputNumberModule,
		DialogModule,
        FormsModule,
        CalendarModule,
        TableModule,
        SplitButtonModule,
        InputTextareaModule,
        RouterModule.forChild([
            { path: '', component: ProyectoChildRiesgosComponent }
        ]),
    ]
})
export class ProyectoChildRiesgosModule { }
