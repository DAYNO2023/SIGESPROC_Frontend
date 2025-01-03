import { Component } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';


@Component({
    templateUrl: './InternalServerError.component.html',
    styleUrls: ['./InternalServerError.css'],
})
export class InternalServerError { 
    constructor(public layoutService: LayoutService){

    }
}