import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CategoriaComponent } from './categoria.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: CategoriaComponent }
	])],
	exports: [RouterModule]
})
export class CategoriaRoutingModule { }
