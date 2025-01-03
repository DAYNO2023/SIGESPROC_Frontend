import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
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
import { ApiMapaComponent } from "./apiMapa.component";
import { ApiMapaRoutingModule } from "./apiMapa-routing.module";
import { ApiMapaService } from 'src/app/demo/services/servicesgeneral/apiMapa.service';
import { AppComponent } from '../../../app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from "@angular/google-maps";


@NgModule({
    imports: [
      CommonModule,
      ApiMapaRoutingModule,
      ReactiveFormsModule,
      TableModule,
      ButtonModule,
      ToastModule,
      InputTextModule,
      CalendarModule,
      ToggleButtonModule,
      GoogleMapsModule,
      RippleModule,
      InputGroupModule,
      MultiSelectModule,
      DropdownModule,
      DialogModule,
      SplitButtonModule,
      HttpClientModule,
      FormsModule
    ],
    declarations: [
      ApiMapaComponent
    ],
    providers: [ApiMapaService]
  })
  export class ApiMapaModule { }
