import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificacionUpdateService {
  private notificacionesActualizadas = new Subject<void>();

  // Observable para que otros componentes se suscriban
  notificacionesActualizadas$ = this.notificacionesActualizadas.asObservable();

  // Método para emitir el evento
  notificacionesActualizadasEmit() {
    this.notificacionesActualizadas.next();
  }
}
