import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class NavigationStateService {
    private stateSubject: BehaviorSubject<any> = new BehaviorSubject<any>({});
    private state: any = {};

    constructor() { }

    setState(key:string, value: any) {
        this.state = {...this.state, [key]: value};
        this.stateSubject.next(this.state); 
    }

    getState() {
        return this.state;
    }

    getStateObservable(): Observable<any> {
        return this.stateSubject.asObservable();
    }

    clearState() {
        this.state = {};
        this.stateSubject.next(this.state);
    }

    clearSpecificState(key: string) {
        if (this.state.hasOwnProperty(key)) {
            const { [key]: removedKey, ...newState } = this.state;
            this.state = newState;
            this.stateSubject.next(this.state);
        }
    }
}