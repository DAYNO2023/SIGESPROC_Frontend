import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
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
import { VentabienraizComponent } from "./VentadeBienesRaíces.component";
import { VentabienraizRoutingModule } from "./VentadeBienesRaíces-routing.module";
import { TabViewModule } from 'primeng/tabview';
import { FileUploadModule } from 'primeng/fileupload';
import { CarouselModule } from 'primeng/carousel';
import { FieldsetModule } from 'primeng/fieldset';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { ScrollTopModule } from 'primeng/scrolltop';


import { ImageModule } from 'primeng/image';
import { ProgressSpinnerModule } from 'primeng/progressspinner';







import { InputGroupAddonModule } from 'primeng/inputgroupaddon';




import { GalleriaModule } from 'primeng/galleria';

import { ContextMenuModule } from 'primeng/contextmenu';
import { BrowserModule } from '@angular/platform-browser';
// import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { HttpClientModule } from '@angular/common/http';
import { InputNumberModule } from 'primeng/inputnumber';

@NgModule({
  imports: [
    CommonModule,
    VentabienraizRoutingModule,
    FormsModule,
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
    TabViewModule,
    FileUploadModule,
    CarouselModule,
    FieldsetModule,
    ContextMenuModule,
    GalleriaModule,
    CheckboxModule,
    RadioButtonModule,
    AutoCompleteModule,
    InputGroupAddonModule,
    ButtonModule,
    ImageModule,
    ScrollTopModule,

    // NgxExtendedPdfViewerModule,
    NgxDocViewerModule,
    HttpClientModule,
    ProgressSpinnerModule,
    InputNumberModule




  ],
  declarations: [
    VentabienraizComponent
  ]
})
export class VentabienraizModule { }
