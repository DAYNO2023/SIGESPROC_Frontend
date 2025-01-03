import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SharedService {
    private buttonGuardarSubject = new Subject<void>();
    buttonGuardar$ = this.buttonGuardarSubject.asObservable();
  
    triggerButtonClick() {
      this.buttonGuardarSubject.next();
    }
}
