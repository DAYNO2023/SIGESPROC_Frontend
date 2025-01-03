export class CompraEncabezado {
    coen_Id ?: number;
    coen_EnvioBodega ?: number;
    empl_Id ?: string;
    meto_Id ?: number;
    usua_Creacion ?: number;
    usuarioCreacion?: string;
    usuarioModifica?: string;
    coen_FechaCreacion ?: string;
    usua_Modificacion ?: number;
    coen_FechaModificacion ?: string;
    meto_Descripcion?: string;
    coti_Id ?: number;
    cotizacionProveedor ?: string;
    empleado ?: string;
    totalCompra ?: number;
    articulo : string;
    codigo ?: number;
    cime_Id ?: number;
    Articulo ?: string;
    code_PrecioCompra ?: string;
    coti_Fecha ?: string;
    Categoria ?: string;
    prov_id ?: number;
    prov_Descripcion ?: string;
    code_Cantidad ?: number;
    Total ?: string;
    unme_Id ?: number;
    unidadMedida ?: string;
    unidadNomenclatura ?: string;
    AgregadoACotizacion ?: string;
    codt_Id ?: number;
    cime_InsumoOMaquinariaOEquipoSeguridad ?: number;
    code_Id ?: number;
    fechaInicio: string;
    fechaFin: string;
    coen_Estado : number;
    auditoria: { accion: string, usuario: string, fecha: Date }[];
    codt_cantidad ?: number;
    codt_preciocompra ?: number;
    codt_FechaCreacion ?: string;
    codt_FechaModificacion ?: string;
    etap_descripcion?:string;

}


export class CompraDetalle {
    codt_Id ?: number;
    coen_Id ?: number;
    code_Id ?: number;
    codd_ProyectoOBodega ?: string;
    codd_Boat_Id ?: number;
    codt_cantidad ?: number;
    codt_preciocompra ?: number;
    articulo ?: string;
    usua_Creacion ?: number;
    codt_FechaCreacion ?: string;
    usua_Modificacion ?: number;
    codt_FechaModificacion ?: string;
    prov_id ?: number;
    prov_Descripcion ?: string;
}



export class autocompleteEmpleado{
    empl_Id?: number;
    empleado?:string;
}

export class SelectItem{
    empl_Id?: number;
    empleado?:string;
}

export class CompraDetalleEnvio{
    codd_Id ?: number;
    codt_Id ?: number;
    codd_Cantidad ?:number;
    codd_ProyectoOBodega ?: string;
    codd_Boat_Id ?: number;
    codm_HorasRenta?:number;
    acet_Id?:number;
    usua_Creacion?:number;
    codm_Cantidad?:number;
}

export class EtapaPorProyecto{
    etpr_Id ?: number;
    etap_Descripcion ?: string;
    proy_Nombre ?: string;
}

export class ActividadesPorEtapa{
    acet_Id ?: number;
    acti_Descripcion ?: string;
}

