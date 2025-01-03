import { AfterViewInit, Component, inject , ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem, PrimeNGConfig } from 'primeng/api';
import { filter } from 'rxjs';
import { SharedService } from './demo/services/shared.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { WebPushNotificationsService } from './demo/services/notificacionservice/web-push-notifications.service';
import { PushNotificationService } from './demo/services/notificacionservice/push-notification.service';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';


import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { environment } from 'src/environment/environment';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    animations: [
        trigger('fadeAnimation', [
          transition(':enter', [
            style({ opacity: 0 }),
            animate('300ms', style({ opacity: 1 }))
          ]),
          transition(':leave', [
            style({ opacity: 1 }),
            animate('300ms', style({ opacity: 0 }))
          ])
        ])
      ]
})
export class AppComponent implements OnInit {
  // private readonly _messaging = inject(Messaging);


    tooltipItems: MenuItem[] = [];
    isScrollable: boolean = false;
    scrollY: number = 0;
    scrollHeight: number = 0;

    constructor(
        private primengConfig: PrimeNGConfig, 
        private router: Router,
        private sharedService: SharedService,
        private pushnotificaservice: PushNotificationService,
        private afMessaging: AngularFireMessaging, 
    ) { 
    Notification.requestPermission().then(token=>{
      console.log(token)
    })
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        this.checkScrollable();

        scrollY = window.scrollY;
        this.scrollHeight = document.documentElement.scrollHeight;
    }

    ngOnInit(): void {      
      this.primengConfig.setTranslation({
        dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
        dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
        monthNames: [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ],
        monthNamesShort: [
          "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
        ],
        today: 'Hoy',
        clear: 'Limpiar',
        dateFormat: 'dd/mm/yy',
        weekHeader: 'Sm',
        firstDayOfWeek: 1
      });  
      // this._getDeviceToken();
      // this._onMessage();

        this.primengConfig.ripple = true;
        // this.pushnotificaservice.requestPermission().then((token) => {
        //     console.log('Token:', token);
        //     // Envía el token a tu servidor o úsalo como necesites
        //   }).catch((err) => {
        //     console.error('No se pudo obtener el token:', err);
        //   });
          
        
        this.tooltipItems = [
            {
                tooltipOptions: {
                    tooltipLabel: 'Regresar'
                },
                icon: 'pi pi-arrow-left',
                command: () => {                    
                    this.sharedService.triggerButtonClick();
                }
            },
            {
                tooltipOptions: {
                    tooltipLabel: 'Guardar'
                },
                icon: 'pi pi-save',
                command: () => {                    
                    this.sharedService.triggerButtonClick();
                }
            }
        ];

        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                setTimeout(() => {
                    this.scrollY = window.scrollY + window.innerHeight;    
                    this.scrollHeight = document.documentElement.scrollHeight;
                    this.checkScrollable();
                  }, 400);
        });

        setTimeout(() => {
            window.addEventListener('scroll', () => {
                this.scrollY = window.scrollY + window.innerHeight;    
                this.scrollHeight = document.documentElement.scrollHeight;
            });
        }, 400); 
    }
   
    // private _getDeviceToken(): void {
    //   getToken(this._messaging, { vapidKey: environment.vapidKey })
    //     .then((token) => {
    //       console.log(token);
    //       // save the token in the server, or do whathever you want
    //     })
    //     .catch((error) => console.log('Token error', error));
    // }
  
    // private _onMessage(): void {
    //   onMessage(this._messaging, {
    //     next: (payload) => console.log('Message', payload),
    //     error: (error) => console.log('Message error', error),
    //     complete: () => console.log('Done listening to messages'),
    //   });
    // }
  // requestPermission() {
  //   this.afMessaging.requestToken.subscribe(
  //     (token) => {
  //       console.log('Permission granted! Save to the server!', token);
  //     },
  //     (error) => {
  //       console.error(error);
  //     }
  //   );
  // }

  listen() {
    this.afMessaging.messages.subscribe((message) => {
      console.log(message);
    });
  }
   
    checkScrollable() { 
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;

        this.isScrollable = scrollHeight > clientHeight;
    }

    scrollToBottom() {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });        
    }

    calculateRadius(): number{ 
        return this.tooltipItems.length * 24;
    }
}
