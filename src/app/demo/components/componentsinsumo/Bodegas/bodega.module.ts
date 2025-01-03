import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
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
import { BodegaRoutingModule } from './bodega-routing.module';
import { BodegaComponent } from './bodega.component';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from "primeng/autocomplete";
import { FormsModule } from '@angular/forms';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SidebarModule } from 'primeng/sidebar';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TabViewModule } from 'primeng/tabview';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GoogleMapsModule } from '@angular/google-maps';


@NgModule({
    imports: [
      CommonModule,
      BodegaRoutingModule,
      ReactiveFormsModule,
      AutoCompleteModule,
      TableModule,
      ButtonModule,
      GoogleMapsModule,
      InputTextModule,
      CalendarModule,
      ToggleButtonModule,
      RippleModule,
      InputGroupModule,
      MultiSelectModule,
      DropdownModule,
      DialogModule,
      SplitButtonModule,
      ToastModule,
      FormsModule,
        OverlayPanelModule,
        ConfirmDialogModule,
        SidebarModule,
        InputGroupAddonModule,
        ConfirmPopupModule,
        TooltipModule,
        ProgressSpinnerModule,
        InputNumberModule,
        TreeModule,
        TreeTableModule,
        FileUploadModule,
        InputTextareaModule,
        TabViewModule,
        CheckboxModule
    ],
    declarations: [
      BodegaComponent
    ]
  })
  export class BodegaModule { }
