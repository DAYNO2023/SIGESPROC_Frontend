import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definir la interfaz IPayloadNotificationPush en TypeScript
export interface NotificacionPush {
  notification: {
    title: string;
    body: string;
    icon?: string;
    actions?: Array<{
      action: string;
      title: string;
      type?: string;
    }>;
    data?: {
      onActionClick?: {
        default?: {
          operation: string;
          url: string;
        };
        reply?: {
          operation: string;
          url: string;
        };
      };
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationPushService {

  private baseUrl: string = 'http://localhost:3000/api/abrev/v1'; // Cambia esto por la URL de tu API

  constructor(private http: HttpClient) { }

  // Método para crear una notificación
  createNotification(usua_Id : any, token: any[], payload: NotificacionPush): Observable<any> {
    const url = `${this.baseUrl}/notifications`;

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post(url, { usua_Id, token, payload }, { headers });
  }

}
