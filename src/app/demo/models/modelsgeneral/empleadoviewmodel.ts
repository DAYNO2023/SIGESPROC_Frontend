import { SafeUrl } from '@angular/platform-browser';

export class Empleado {
    constructor(usua_Creacion: number, empl_FechaCreacion: Date) {
        this.empl_Id = 0;
        this.empl_DNI = '';
        this.empl_Nombre = '';
        this.empl_Apellido = '';
        this.empl_CorreoElectronico = '';
        this.empl_Telefono = '';
        this.empl_Sexo = '';
        this.empl_FechaNacimiento = new Date();
        this.empl_FechaNacimiento.setFullYear(
            this.empl_FechaNacimiento.getFullYear() - 18
        );
        // this.empl_Salario = 0;
        // this.empl_Prestaciones = 0;
        // this.empl_OtrasRemuneraciones = 0;
        this.ciud_Id = 0;
        this.esta_Id = 0;
        this.civi_Id = 0;
        this.carg_Id = 0;
        this.usua_Creacion = usua_Creacion;
        this.empl_FechaCreacion = empl_FechaCreacion;
        this.usua_Modificacion = 0;
        this.empl_FechaModificacion = empl_FechaCreacion;
        this.empl_Estado = true;
        this.frec_Id = 0;
        this.empl_NoBancario = '';
        this.banc_Id = 0;
        this.empl_Imagen = '';
    }

    empl_Id: number;
    codigo?: number;
    empl_DNI: string;
    empleado?: string;
    empl_Nombre: string;
    empl_Apellido: string;
    empl_CorreoElectronico: string;
    empl_Telefono: string;
    empl_Sexo: string;
    empl_FechaNacimiento: Date;
    fechaNacimiento?: string;
    empl_Salario?: number;
    empl_Prestaciones?: number;
    empl_OtrasRemuneraciones?: number;
    salario?: string;
    salarioPromedio?: number;
    ciud_Id: number;
    ciudad?: string;
    esta_Id?: number;
    estado?: string;
    civi_Id: number;
    estadoCivil?: string;
    carg_Id: number;
    cargo?: string;
    usua_Creacion: number;
    usuaCreacion?: string;
    empl_FechaCreacion: Date;
    fechaCreacion?: string;
    usua_Modificacion: number;
    usuaModificacion?: string;
    empl_FechaModificacion: Date;
    fechaModificacion?: string;
    empl_Estado: boolean;
    frec_Id: number;
    frecuencia?: string;
    empl_NoBancario: string;
    banc_Id: number;
    banco?: string;
    empl_Imagen: string;
    empl_ObservacionActivar: string;
    empl_ObservacionInactivar: string;
    // empl_ImagenSafeUrl: SafeUrl;

    empl_NombreCompleto: string;
}
