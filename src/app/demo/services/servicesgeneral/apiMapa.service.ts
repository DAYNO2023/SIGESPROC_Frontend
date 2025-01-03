import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { environment } from 'src/environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiMapaService {

  constructor(private http: HttpClient) { }
  private apiKey = 'pk.f60b0fae3f26e68d41078e516c7483c9';
  private baseUrl = 'https://us1.locationiq.com/v1/reverse.php';


  getReverseGeocode(lat: number, lon: number): Observable<any> {
    const params = new HttpParams()
      .set('key', this.apiKey)
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('format', 'json');

    return this.http.get(this.baseUrl, { params });
  }

}
