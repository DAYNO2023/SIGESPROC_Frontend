export interface MaquinariaPorProveedor{
    mapr_Id?: number;
    maqu_Id?: number;
    prov_Id?: number;
    mapr_DiaHora?: number;
    mapr_PrecioCompra?: number;

    //Auditoria
    usua_Creacion?: number;
    mapr_FechaCreacion?: Date;
    usua_Modificacion?: number;
    mapr_FechaModificacion?: Date;

    //NotMapped
    maqu_Descripcion?: string;
    nive_Descripcion?: string;
    prov_Descripcion?: string;
}