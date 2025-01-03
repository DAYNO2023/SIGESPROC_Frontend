import { Injectable } from '@angular/core';
import { MessageService, TreeNode } from 'primeng/api';
import { Titulos } from '../models/TitulosIzitoastEnum';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    constructor(private messageService: MessageService) { }

    //Muestra un toast en pantalla, recibe un valor del enum Gravedades y un mensaje
    toast(gravedad: string, mensaje: string) {
        this.messageService.add({
            severity: gravedad,
            styleClass:'iziToast-custom',
            summary: Titulos[gravedad],
            detail: mensaje,
            life: 3000,
        });
    }
}