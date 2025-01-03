export interface EquipoSeguridadPorActividad{
    row?: number;

    eqac_Id?: number;
    eqpp_Id?: number;
    eqac_Costo?: number;
    eqac_Cantidad?: number;
    acet_Id?: number;
    usua_Creacion?: number;
    eqac_FechaCreacion?: Date;
    usua_Modificacion?: number;
    eqac_FechaModificacion?: Date;
    eqac_Estado?: boolean;

    //NotMapped
    usuaCreacion?: string;
    usuaModificacion?: string;

    equs_Id?: number;
    equs_Nombre?: string;
    equs_Descripcion?: string;
    eqpp_PrecioCompra?: number;
    eqbo_Stock?: number;
    bode_Id?: number;
    bode_Descripcion?: string;
    prov_Id?: number;
    prov_Descripcion?: string;
}