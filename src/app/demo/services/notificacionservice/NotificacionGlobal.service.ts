import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { mergeMap, map, catchError, toArray } from 'rxjs/operators';
import { NotificationFlutterPushService, NotificacionFlutterPush } from 'src/app/demo/services/notificacionservice/notificacionflutter.service';
import { NotificacionesService } from 'src/app/demo/services/servicesproyecto/notificacion.service';
import { Usuario } from 'src/app/demo/models/modelsacceso/usuarioviewmodel';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationManagerService {
  private UrlFront: string = environment.UrlFront;
  private frontend = `${this.UrlFront}`;
  constructor(
    private servicePush: NotificationFlutterPushService,
    private notificacionesService: NotificacionesService
  ) { }

  /**
   * Inserta notificaciones y envía notificaciones push a los usuarios seleccionados.
   * Este método combina la inserción de notificaciones en la base de datos con el envío de notificaciones
   * push a los usuarios, asegurando que ambas operaciones se completen correctamente.
   *
   * @param detalles Lista de detalles de notificaciones a insertar.
   * @returns Observable que emite el resultado de la operación, indicando éxito o fallo.
   */
  insertarYEnviarNotificaciones(detalles: any[], notiRuta: string): Observable<any> {
    return this.notificacionesService.InsertarAlerta(detalles).pipe(
        mergeMap(respuesta => {
            if (respuesta.success) {
                const notiDescripcion = detalles[0].aler_Descripcion;
                return this.enviarNotificacionesPush(detalles, notiDescripcion, notiRuta);
            } else {
                return of({ success: false, message: 'Error al insertar la notificación.' });
            }
        }),
        catchError(error => {
            console.error('Error durante la inserción de notificaciones:', error);
            return of({ success: false, message: 'Error durante la inserción de notificaciones.' });
        })
    );
}

  /**
   * Envía notificaciones push a los usuarios especificados.
   * Este método toma la lista de detalles de notificación y envía una notificación push a cada usuario
   * correspondiente, utilizando los tokens de notificación obtenidos.
   *
   * @param detalles Lista de detalles de notificaciones, cada uno asociado a un usuario.
   * @param notiDescripcion Descripción de la notificación que se enviará.
   * @returns Observable que emite un array con los resultados del envío de notificaciones push.
   */
  private enviarNotificacionesPush(detalles: any[], notiDescripcion: string, notiRuta: string): Observable<any> {
    // Verifica que notiRuta no esté duplicada
    const finalRuta = notiRuta.startsWith(this.frontend) ? notiRuta : `${this.frontend}${notiRuta}`;
    
    //console.log('Ruta de notificación (click_action):', finalRuta);
    
    const payload: NotificacionFlutterPush = {
        data: {
            title: 'Tienes una notificación',
            body: notiDescripcion,
            click_action: finalRuta // Aquí pasas la ruta corregida al campo click_action
        }
    };

    return from(detalles).pipe(
        mergeMap(detalle =>
            this.notificacionesService.ListarTokensUsuario(detalle.usua_Id).pipe(
                mergeMap((data: any) => {
                    const tokensArray = data.data.flatMap((item: any) => item.tokn_JsonToken.split(','));
                    if (tokensArray.length > 0) {
                        return this.servicePush.createNotification(tokensArray, payload).pipe(
                            map(() => ({ success: true, usuarioId: detalle.usua_Id })),
                            catchError(error => {
                                console.error(`Error al enviar notificación push al usuario ${detalle.usua_Id}:`, error);
                                return of({ success: false, usuarioId: detalle.usua_Id, error });
                            })
                        );
                    } else {
                        console.warn(`No se encontraron tokens para el usuario ${detalle.usua_Id}.`);
                        return of({ success: false, usuarioId: detalle.usua_Id, message: 'No tokens found.' });
                    }
                }),
                catchError(error => {
                    console.error(`Error al obtener tokens para el usuario ${detalle.usua_Id}:`, error);
                    return of({ success: false, usuarioId: detalle.usua_Id, error });
                })
            )
        ),
        toArray()
    );
}

}
