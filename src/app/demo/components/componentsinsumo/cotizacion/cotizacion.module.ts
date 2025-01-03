import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SidebarModule } from 'primeng/sidebar';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { RippleModule } from 'primeng/ripple';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from "primeng/dropdown";
import { InputNumberModule } from 'primeng/inputnumber';
import{ ListboxModule}from 'primeng/listbox';
import { TreeModule } from 'primeng/tree';
import { ReactiveFormsModule } from '@angular/forms';
import { TreeTableModule } from 'primeng/treetable';
import { SplitButtonModule } from "primeng/splitbutton";
import { FileUploadModule } from 'primeng/fileupload';
import { cotizacionRoutingModule } from './cotizacion-routing.module';
import { cotizacionComponent } from './cotizacion.component';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabViewModule } from 'primeng/tabview';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchModule } from 'primeng/inputswitch';
@NgModule({
	imports: [ListboxModule,
		ProgressSpinnerModule,
		InputSwitchModule,
		RadioButtonModule,
		InputGroupAddonModule,
		InputGroupModule,
		InputNumberModule,
		CheckboxModule,
		TabViewModule,
		InputTextareaModule,
		MultiSelectModule,
		AutoCompleteModule,
		CalendarModule,
		FileUploadModule,
		SplitButtonModule,
		CommonModule,
		cotizacionRoutingModule,
		ToastModule,
		DialogModule,
		FormsModule,
		TooltipModule,
		InputTextModule,
		DropdownModule,
		ButtonModule,
		OverlayPanelModule,
		TableModule,
		ConfirmDialogModule,
		SidebarModule,
		RippleModule,
		ConfirmPopupModule,
		TreeModule,
		TreeTableModule,
		ReactiveFormsModule
		
	], declarations: [
        cotizacionComponent
      ]
})
export class CotizacionModule { }