import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InternalServerError } from './InternalServerError.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: InternalServerError }
    ])],
    exports: [RouterModule]
})
export class InternalServerErrorModule {}
