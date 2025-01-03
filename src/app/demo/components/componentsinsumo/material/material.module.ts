import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MaterialRoutingModule } from "./material-routing.module";
import { MaterialComponent } from "./material.component";

import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@NgModule({
    declarations: [MaterialComponent],
    imports: [
        CommonModule,
        MaterialRoutingModule,
        TableModule,
		FileUploadModule,
		FormsModule,
		ButtonModule,
		RippleModule,
        ProgressSpinnerModule,
		ToastModule,
		ToolbarModule,
		RatingModule,
		InputTextModule,
		InputTextareaModule,
		DropdownModule,
		RadioButtonModule,
		InputNumberModule,
		DialogModule,
		SplitButtonModule,
    ]
})
export class MaterialModule { }
