export class Abono {
    constructor(
        usua_Creacion: number,
        abpr_FechaCreacion: Date,
        pres_Id: number = 0
    ) {
        this.abpr_Id = 0;
        this.pres_Id = pres_Id;
        // this.abpr_MontoAbonado = 0;
        this.abpr_Fecha = new Date();
        this.abpr_DeducidoEnPlanilla = false;
        this.usua_Creacion = usua_Creacion;
        this.abpr_FechaCreacion = abpr_FechaCreacion;
        this.usua_Modificacion = 0;
        this.abpr_FechaModificacion = abpr_FechaCreacion;
        this.abpr_Estado = true;
    }

    codigo?: number;
    abpr_Id: number;
    pres_Id: number;
    abpr_MontoAbonado?: number;
    abpr_Fecha: Date;
    fecha: string;
    abpr_DeducidoEnPlanilla: boolean;
    usua_Creacion: number;
    usuaCreacion?: string;
    abpr_FechaCreacion: Date;
    fechaCreacion?: string;
    usua_Modificacion: number;
    usuaModificacion?: string;
    abpr_FechaModificacion: Date;
    fechaModificacion?: string;
    abpr_Estado: boolean;
}
