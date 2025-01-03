import { Component } from '@angular/core';
import { NotificationPushService, NotificacionPush } from 'src/app/demo/services/notificacionservice/notificacionpush.service'; 

export class NotificationComponent {

  constructor(private notificationService: NotificationPushService) { }

  sendNotification() {
    const token: any[] = []; // Aquí va el token o los tokens que deseas enviar, actualmente vacío
    const payload: NotificacionPush = {
      notification: {
        title: 'Nuevo mensaje',
        body: 'Has recibido un nuevo mensaje',
        icon: 'assets/layout/images/logo-sigesproc.png',
        actions: [
          { action: 'reply', title: 'Responder', type: 'text' },
          { action: 'send', title: 'Enviar' }
        ],
        data: {
          onActionClick: {
            default: { operation: 'openWindow', url: '#/chats/' },
            reply: { operation: 'focusLastFocusedOrOpen', url: '#/chats/response' }
          }
        }
      }
    };

    this.notificationService.createNotification(3,token, payload).subscribe(
      response => {
        console.log('Notificación enviada con éxito', response);
      },
      error => {
        console.error('Error al enviar la notificación', error);
      }
    );
  }
}
