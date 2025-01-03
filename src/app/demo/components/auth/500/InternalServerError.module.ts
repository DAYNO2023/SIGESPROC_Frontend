import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InternalServerErrorModule } from './InternalServerError-routing.module';
import { InternalServerError } from './InternalServerError.component'
import { ButtonModule } from 'primeng/button';

@NgModule({
    imports: [
        CommonModule,
        InternalServerErrorModule,
        ButtonModule
    ],
    declarations: [InternalServerError]
})
export class  InternalServerModule {}
