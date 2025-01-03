import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GanttService {

  public fullScreen = new BehaviorSubject<boolean>(false);
  public msProject = new BehaviorSubject<boolean>(false);
  public excel = new BehaviorSubject<boolean>(false);
  public pdf = new BehaviorSubject<boolean>(false);
  public png = new BehaviorSubject<boolean>(false);
  public deshacer = new BehaviorSubject<boolean>(false);
  public rehacer = new BehaviorSubject<boolean>(false);
  public colapsar = new BehaviorSubject<boolean>(false);
  public crear = new BehaviorSubject<boolean>(false);

  constructor() { }
}
