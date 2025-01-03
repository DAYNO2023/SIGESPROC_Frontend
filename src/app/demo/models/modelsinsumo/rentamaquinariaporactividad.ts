export interface RentaMaquinariaPorActividad{
    rmac_Id?:number;
    rmac_PrecioTotal?:number;
    rmac_FechaContratacion?:Date;
    rmac_HorasRenta?:Date;
    mapr_Id?:number;
    acet_Id?:number;

    usua_Creacion?:number;
    rmac_FechaCreacion?: Date;
    usua_Modificacion?:number;
    rmac_FechaModificacion?: Date;
    rmac_Estado?:boolean;

    usuaCreacion?:string;
    usuaModificacion?:string;
}