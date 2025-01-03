import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';

import { DialogModule } from "primeng/dialog";
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { InputGroupModule } from 'primeng/inputgroup';
import { CalendarModule } from 'primeng/calendar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { PanelModule } from 'primeng/panel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule  } from '@angular/forms';
import { Component, OnInit, NgModule } from '@angular/core';
import { InsumoComponent } from '../insumo/insumo.component';
import { insumoRoutingModule } from "../insumo/insumo-routing.module";
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputNumberModule } from 'primeng/inputnumber';
@NgModule({
    imports: [
      DialogModule,
      CommonModule,
      ReactiveFormsModule,
      TableModule,
      ButtonModule,
      InputTextModule,
      ToggleButtonModule,
      RippleModule,
      MultiSelectModule,
      DropdownModule,
      ProgressBarModule,
      ToastModule,
      SliderModule,
      RatingModule,
      insumoRoutingModule,
      InputGroupModule,
      CalendarModule,
      SplitButtonModule,
      PanelModule,
      ConfirmDialogModule,
      AutoCompleteModule,
      FormsModule,
      ProgressSpinnerModule,
      InputNumberModule
    ],
    declarations: [InsumoComponent]
  })
  export class InsumoModule { }


  