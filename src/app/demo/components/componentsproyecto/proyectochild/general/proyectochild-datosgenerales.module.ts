import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { ProyectoChildDatosGeneralesComponent } from "./proyectochild-datosgenerales.component";
import { CalendarModule } from "primeng/calendar";
import { RouterModule } from "@angular/router";
import { AutoCompleteModule } from "primeng/autocomplete";
import { InputTextareaModule } from "primeng/inputtextarea";

@NgModule({
    declarations: [ProyectoChildDatosGeneralesComponent],
    imports: [
        CommonModule,
		ButtonModule,
		InputTextModule,
		DropdownModule,
		InputNumberModule,
		DialogModule,
        FormsModule,
        CalendarModule,
        AutoCompleteModule,
        InputTextareaModule,
        RouterModule.forChild([
            { path: '', component: ProyectoChildDatosGeneralesComponent }
        ]),
    ]
})
export class ProyectoChildDatosGeneralesModule { }