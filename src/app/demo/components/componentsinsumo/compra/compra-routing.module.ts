import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CompraComponent } from './compra.component'; 
@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: CompraComponent }
	])],
	exports: [RouterModule]
})
export class CompraRoutingModule { }
