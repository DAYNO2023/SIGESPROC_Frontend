import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Injectable, NgModule } from '@angular/core';
import { cu } from '@fullcalendar/core/internal-common';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class YService {
  private pageCount = 1;
  cajaStateSource: EventEmitter<string> = new EventEmitter<string>();
  constructor() {
   
  }
  changeCajaState(state: string) {
    this.cajaStateSource.emit(state);
  }
 
   

  
}
