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
import { ProyectoChildEtapasComponent } from "./proyectochild-etapas.component";
import { TableModule } from "primeng/table";
import { AutoCompleteModule } from "primeng/autocomplete";
import { SplitButtonModule } from "primeng/splitbutton";
import { TabViewModule } from "primeng/tabview";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { CheckboxModule } from "primeng/checkbox";
import { PickListModule } from 'primeng/picklist';

@NgModule({
    declarations: [ProyectoChildEtapasComponent],
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
        AutoCompleteModule,
        SplitButtonModule,
        TabViewModule,
        InputGroupModule,
        InputGroupAddonModule,
        CheckboxModule,
        PickListModule,
        RouterModule.forChild([
            { path: '', component: ProyectoChildEtapasComponent }
        ]),
    ]
})
export class ProyectoChildEtapasModule { }
