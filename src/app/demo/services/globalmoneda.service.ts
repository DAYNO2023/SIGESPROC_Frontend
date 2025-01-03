import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Moneda } from '../models/modelsgeneral/monedaviewmodel';
import { environment } from 'src/environment/environment';

@Injectable({providedIn: 'root'})

export class globalmonedaService {
    private stateSubject: BehaviorSubject<any> = new BehaviorSubject<any>({});
    private state: Moneda;

    constructor(public http: HttpClient) { }
    private apiUrl: string = environment.apiUrl;
    private apiKey: string = environment.apiKey;
    private Moneda = `${this.apiUrl}/api/Moneda`;
    private getHttpOptions() {
        return {
          headers: new HttpHeaders({
            'XApiKey': `${this.apiKey}`
          })
        };
      }


    setState() {
        this.http.get<any>(`${this.Moneda}/Buscar/1`,this.getHttpOptions())
            .toPromise()
            .then(result => {
                this.state = result;
            })
    }

    getState() {
        return this.state;
    }

    getStateObservable(): Observable<any> {
        return this.stateSubject.asObservable();
    }

    clearState() {
        this.state = null;
        this.stateSubject.next(this.state);
    }
}