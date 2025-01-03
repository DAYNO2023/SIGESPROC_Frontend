import { Component } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';


@Component({
    templateUrl: './notfound.component.html',
    styleUrls: ['./notfound.css'],
})
export class NotfoundComponent { 
    constructor(public layoutService: LayoutService){

    }
}