import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

// Definir la interfaz IPayloadNotificationPush en TypeScript
export interface NotificacionFlutterPush {
  data: {
    title: string;
    body: string;
    click_action: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationFlutterPushService {

  private baseUrl: string = 'https://sigesproc.onrender.com';
  private UrlFront: string = environment.UrlFront;
  private frontend = `${this.UrlFront}`;
  constructor(private http: HttpClient) { }


  createNotification(token: any[], payload: NotificacionFlutterPush): Observable<any> {
    const url = `${this.baseUrl}/send-notification`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (!payload.data) {
        payload.data = { title: '', body: '', click_action:'' };
    } else {
        if (payload.data.click_action === null){
            payload.data.click_action = this.frontend + '/Paginaprincipal/Paginaprincipal';
        } else if (!payload.data.click_action.startsWith(this.frontend)) {
            // Concatenar solo si no empieza con la URL base
            payload.data.click_action = this.frontend + payload.data.click_action;
        }
    }

    //console.log('Ruta de notificación (click_action):', payload.data.click_action);
    
    const body = {
        token: token,
        data: payload.data
    };

    //console.log(body);
    return this.http.post(url, body, { headers });
}


}
