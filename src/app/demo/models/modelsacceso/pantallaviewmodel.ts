export interface Pantalla{
    // Campos
    pant_Id?:number;
    pant_Descripcion?:string;
    pant_direccionURL ?:string;

    // Auditoria
    usua_Creacion?: number;
    pant_FechaCreacion?: Date;
    usua_Modificacion?: number;
    pant_FechaModificacion?: Date;
    pant_Estado?:boolean;

    // JOINs
    usuaCreacion?:string;
    usuaModificacion?:string;
}
