export interface EquipoSeguridadPorProveedor{
    eqpp_Id?: number;
    equs_Id?: number;
    prov_Id?: number;
    eqpp_PrecioCompra?: number;

    //NotMapped
    equs_Nombre?: string;
    equs_Descripcion?: string;
    prov_Descripcion?: string;
    eqbo_Stock?: number;
}