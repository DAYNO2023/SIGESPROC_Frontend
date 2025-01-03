export interface InsumoPorActividad{
    row?: number;

    inpa_Id?: number;
    inpp_Id?: number;
    inpa_Rendimiento?: number;
    inpa_stock?: number;
    acet_Id?: number;
    inpa_PrecioCompra?: number;
    usua_Creacion?: number;
    inpa_FechaCreacion?: Date;
    usua_Modificacion?: number;
    inpa_FechaModificacion?: Date;
    inpa_Estado?: boolean;

    //NotMapped
    usuaCreacion?: string;
    usuaModificacion?: string;

    insu_Id?: number;
    insu_Descripcion?: string;
    unme_Nombre?: string;
    unme_Nomenclatura?: string;
    bopi_Stock?: number;
    suca_Descripcion?: string;
    inpp_Observacion?: string;
    cate_Descripcion?: string;
    mate_Descripcion?: string;
    prov_Id?: number;
    prov_Descripcion?: string;
    inpp_Preciocompra?: number;
    inpa_Recomendado?: boolean;
    bode_Descripcion?: string;
    bode_Id?: number;
    inpa_EstadoInsumo?: string;
}