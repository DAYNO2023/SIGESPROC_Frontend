import { Abono } from './abonoviewmodel';

export class Prestamo {
    constructor(
        usua_Creacion: number,
        pres_FechaCreacion: Date,
        empl_Id: number = 0
    ) {
        this.pres_Id = 0;
        this.pres_Descripcion = '';
        // this.pres_Monto = 0;
        this.pres_Abonado = 0;
        this.pres_TasaInteres = 0;
        // this.pres_Pagos = 0;
        this.pres_FechaPrimerPago = new Date();
        this.empl_Id = empl_Id;
        this.frec_Id = 0;
        this.abonos = [];
        this.usua_Creacion = usua_Creacion;
        this.pres_FechaCreacion = pres_FechaCreacion;
        this.usua_Modificacion = 0;
        this.pres_FechaModificacion = pres_FechaCreacion;
        this.pres_Estado = true;
    }

    pres_Id: number;
    codigo?: number;
    empleado?: string;
    empl_DNI?: string;
    pres_Descripcion: string;
    pres_Monto?: number;
    pres_Abonado: number;
    pres_TasaInteres: number;
    tasaInteres?: string;
    interes?: number;
    estadoPrestamo: string;
    pres_Pagos?: number;
    cuota?: number;
    total?: number;
    pagosRestantes?: number;
    pres_FechaPrimerPago: Date;
    fechaUltimoPago?: string;
    fechaPrimerPago: string;
    empl_Id: number;
    frec_Id: number;
    abonos: Abono[];
    frec_Descripcion?: string;
    usua_Creacion: number;
    usuaCreacion?: string;
    pres_FechaCreacion: Date;
    fechaCreacion?: string;
    usua_Modificacion: number;
    usuaModificacion?: string;
    pres_FechaModificacion: Date;
    fechaModificacion?: string;
    pres_Estado: boolean;
}
