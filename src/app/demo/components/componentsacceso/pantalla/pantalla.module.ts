import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { PantallaRoutingModule } from "./pantalla-routing.module";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { DropdownModule } from "primeng/dropdown";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { RippleModule } from "primeng/ripple";
import { SplitButtonModule } from "primeng/splitbutton";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { ToggleButtonModule } from "primeng/togglebutton";
import { PantallaComponent } from "./pantalla.component";

@NgModule({
    declarations: [PantallaComponent],
    imports: [
        CommonModule,
        PantallaRoutingModule,
        DialogModule,
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
        SplitButtonModule,
    ]
})
export class PantallaModule { }
