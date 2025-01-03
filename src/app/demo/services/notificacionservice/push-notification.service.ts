import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { BehaviorSubject } from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { environment } from 'src/environment/environment';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AppTopbarComponent } from 'src/app/layout/app.topbar.component';
import { NotificacionUpdateService } from 'src/app/demo/services/servicesproyecto/Notificacionactualizar.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  currentMessage = new BehaviorSubject(null);
  private apiUrl: string = environment.apiUrl;
    private apiKey: string = environment.apiKey;
 private top : AppTopbarComponent
  constructor(private afMessaging: AngularFireMessaging, private http: HttpClient,
    public cookieService: CookieService, 
    private notificacionUpdateService: NotificacionUpdateService
  ) {}

  private Notificacion = `${this.apiUrl}/api/Notificacion`;
  private NotificacionesPorUsuario =`${this.apiUrl}/api/NotificacionAlertaPorUsuario` ;
  private getHttpOptions() {
      return {
        headers: new HttpHeaders({
          'XApiKey': `${this.apiKey}`
        })
      };
  }


  InsertarTokens(modelo :any ): Observable<any> {
    return this.http.post<any>(`${this.NotificacionesPorUsuario}/InsertarToken`,modelo, this.getHttpOptions());
    
  }


  requestPermission() {
    this.afMessaging.requestToken
      .subscribe(
        (token) => {
          //console.log('Permission granted! Save the token to server!', token);
          const usua_Id =  parseInt(this.cookieService.get('usua_Id'))

          const modelotoken : any = {
            usua_Id : usua_Id,
            tokn_JsonToken : token
          }

          this.cookieService.set('Notificacion', token); // cookie que guarda el token
          this.InsertarTokens(modelotoken).subscribe((data: any)=>{
            //console.log(data)    
        
          })

        },
        (error) => {
          console.error(error);
        }
      );
  }

  receiveMessage() {
    this.afMessaging.messages
      .subscribe((payload) => {
        //console.log('Message received. ', payload);
        this.currentMessage.next(payload);
        this.notificacionUpdateService.notificacionesActualizadasEmit();
      });

    }
    
}
