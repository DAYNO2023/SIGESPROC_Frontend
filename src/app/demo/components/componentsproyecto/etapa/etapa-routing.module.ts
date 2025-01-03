import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EtapaComponent } from './etapa.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: EtapaComponent }
	])],
	exports: [RouterModule]
})
export class EtapaRoutingModule { }
