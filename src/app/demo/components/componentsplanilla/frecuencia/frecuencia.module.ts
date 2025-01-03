import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { RippleModule } from 'primeng/ripple';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FrecuenciaComponent } from './frecuencia.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {  FormsModule } from "@angular/forms"; 

import { FrecuenciaRoutingModule } from './frecuencia-routing.module';


@NgModule({
  declarations: [
    FrecuenciaComponent
  ],
  imports: [
    CommonModule,
    FrecuenciaRoutingModule,
    ReactiveFormsModule,
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
    DialogModule,
    SplitButtonModule,
    ProgressSpinnerModule,
    FormsModule
  ],
})
export class FrecuenciaModule { }
