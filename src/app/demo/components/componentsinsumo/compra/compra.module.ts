import { NgModule,  Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { CompraRoutingModule } from './compra-routing.module';
import { CompraComponent } from './compra.component'; 
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { TabViewModule } from 'primeng/tabview';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputSwitchModule } from 'primeng/inputswitch';


import { ProgressBarModule } from 'primeng/progressbar';

import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PanelModule } from 'primeng/panel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


import { insumoRoutingModule } from "../insumo/insumo-routing.module";


@NgModule({
    imports: [
      InputSwitchModule,
      CommonModule,
      CompraRoutingModule,
      ReactiveFormsModule,
      FormsModule,
      TabViewModule,
      TableModule,
      CheckboxModule,
      ButtonModule,
      InputTextModule,
      CalendarModule,
      ToggleButtonModule,
      ProgressSpinnerModule,
      RadioButtonModule,
      RippleModule,
      InputGroupModule,
      MultiSelectModule,
      DropdownModule,
      DialogModule,
      SplitButtonModule,
      ToastModule,
      AutoCompleteModule,
      InputNumberModule,
      

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
      ConfirmDialogModule
    ],
    declarations: [
        CompraComponent
    ]
})
export class CompraModule { }
