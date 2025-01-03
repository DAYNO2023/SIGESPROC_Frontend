import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class UtilitariosService {
    constructor() { }
    
    setDateProperties(obj: any) {
        const isDateString = (value: any): boolean => {
          return typeof value === 'string' && !isNaN(Date.parse(value));
        };

        for (const key in obj) {
            if (!key.endsWith('DireccionExacta') &&
                !key.endsWith('Nombre') &&
                !key.endsWith('Descripcion')
                && isDateString(obj[key])) {
                obj[key] = new Date(obj[key]);
            }
        }
    }
}