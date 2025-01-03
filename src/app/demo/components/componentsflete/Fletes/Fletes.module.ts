import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { RippleModule } from "primeng/ripple";
import { SplitButtonModule } from "primeng/splitbutton";
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from "primeng/table";
import { ToggleButtonModule } from "primeng/togglebutton";
import { FleteComponent } from "./Fletes.component";
import { FleteRoutingModule } from "./flete-routing.module";
import { AutoCompleteModule } from "primeng/autocomplete";
import { InputSwitchModule } from "primeng/inputswitch";
import { ToastModule } from "primeng/toast";
import { EditorModule } from 'primeng/editor'
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { CheckboxModule } from 'primeng/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MultiDragDropComponent } from './MultiDrag/multi-drag-drop.component';
import { MultiSelectDirective } from './multi-select.directive';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FileUploadModule } from 'primeng/fileupload';

@NgModule({
  imports: [
    FileUploadModule
    ,
    ToastModule,
    InputSwitchModule,
    CommonModule,
    AutoCompleteModule,
    TabViewModule,
    FleteRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    ToggleButtonModule,
    RippleModule,
    InputGroupModule,
    MultiSelectModule,
    DropdownModule,
    DialogModule,
    SplitButtonModule,
    EditorModule,
    AvatarModule,
    AvatarGroupModule,
    CheckboxModule,
    MenuModule,
    ConfirmDialogModule,
    DragDropModule,
    ProgressSpinnerModule
  ],
  exports: [
    MultiSelectDirective
  ],
  declarations: [
    FleteComponent, MultiDragDropComponent, MultiSelectDirective

  ]
})
export class FleteModule { }
