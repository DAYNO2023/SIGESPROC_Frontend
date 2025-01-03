import { AbstractControl, ValidatorFn, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Validación personalizada para la fecha de incidencia
export function fechaIncidenciaValida(fechaSalida: Date, fechaLlegada: Date): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const fechaIncidencia = new Date(control.value);
        return fechaIncidencia >= fechaSalida && fechaIncidencia <= fechaLlegada ? null : { fechaInvalida: true };
    };
}
