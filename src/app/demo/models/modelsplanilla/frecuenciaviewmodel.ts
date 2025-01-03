export class Frecuencia {
    frec_Id?: number;
    frec_Descripcion?: string;
    usua_Creacion?: number;
    frec_FechaCreacion?: string;
    usua_Modificacion?: number;
    frec_FechaModificacion?: string;
    frec_Estado?: string;
    frec_NumeroDias?: string;
    codigo?: string;
    constructor(usua_Creacion: number, pres_FechaCreacion: string) {}
}

export class FrecuenciaDDL{
    frec_Id?: number;
    frec_Descripcion?: string;
    frec_NumeroDias?: number;
    frecuencia?: string;
}
