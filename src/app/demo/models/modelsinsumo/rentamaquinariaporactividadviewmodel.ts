export interface RentaMaquinariaPorActividad{
    rmac_Id?:number;
    rmac_PrecioTotal?:number;
    rmac_FechaContratacion?:string;
    rmac_HorasRenta?:string;
    mapr_Id?:number;
    acet_Id?:number;

    usua_Creacion?:number;
    rmac_FechaCreacion?: string;
    usua_Modificacion?:number;
    rmac_FechaModificacion?: string;
    rmac_Estado?:boolean;

    usuaCreacion?:string;
    usuaModificacion?:string;
}

export interface RentaMaquinariaPorActividadE{
    rmac_PrecioTotal?:number;
    rmac_FechaContratacion?:string;
    rmac_HorasRenta?:string;
    mapr_Id?:number;
    acet_Id?:number;

    usua_Creacion?:number;

}