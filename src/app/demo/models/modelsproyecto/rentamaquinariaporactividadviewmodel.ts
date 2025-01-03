export interface RentaMaquinariaPorActividad{
    row?: number;

    rmac_Id?: number;
    mapr_Id?: number;
    rmac_RentaPor?: number;
    rmac_CantidadRenta?: number;   
    rmac_PrecioRenta?: number;   
    rmac_CantidadMaquinas?: number;   
    rmac_FechaContratacion?: number;   
    acet_Id?: number;
    usua_Creacion?: number;
    rmac_FechaCreacion?: Date;
    usua_Modificacion?: number;
    rmac_FechaModificacion?: Date;
    rmac_Estado?: boolean;

    //NotMapped
    usuaCreacion?: string;
    usuaModificacion?: string;

    maqu_Id?: number;
    maqu_Descripcion?: string;
    mapr_PrecioCompra?: number;
    mapr_DiaHora?: number;
    prov_Id?: number;
    prov_Descripcion?: string;
    nive_Id?: number;
    nive_Descripcion?: string;
    rmac_Recomendado?: boolean;
}