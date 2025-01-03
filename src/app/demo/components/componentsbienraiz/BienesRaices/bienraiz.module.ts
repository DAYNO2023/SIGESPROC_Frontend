import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { CheckboxModule } from 'primeng/checkbox';
import { StepsModule } from 'primeng/steps';
import { TabMenuModule } from 'primeng/tabmenu';
import { CardModule } from 'primeng/card';
import{ ListboxModule}from 'primeng/listbox';
import { BienesRaicesComponent } from './bienraiz.component';
import { BienraizRoutingModule } from './bienraiz-routing.module';
import { FileUploadModule } from 'primeng/fileupload';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import{FieldsetModule}from'primeng/fieldset';
import { TabViewModule } from 'primeng/tabview';

@NgModule({
  declarations: [
    BienesRaicesComponent
  ],
  imports: [
    CommonModule,
    BienraizRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    TabViewModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    CalendarModule,
    ToggleButtonModule,
    RippleModule,
    AutoCompleteModule,
    InputGroupModule,
    MultiSelectModule,
    DropdownModule,
    DialogModule,
    SplitButtonModule,
    CheckboxModule,
    StepsModule,
    TabMenuModule,
    CardModule,
    FieldsetModule,
    FileUploadModule,
    ListboxModule,
    ProgressSpinnerModule
  ],
})
export class BienraizModule { }