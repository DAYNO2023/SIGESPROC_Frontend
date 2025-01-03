import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { GanttRoutingModule } from './gantt-routing.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GanttRoutingModule,
    ReactiveFormsModule, 
    FormsModule,
    AutoCompleteModule,
    DropdownModule
  ]
})
export class GanttModule { }
