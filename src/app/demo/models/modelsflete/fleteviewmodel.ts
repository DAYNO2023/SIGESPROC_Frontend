export class Flete {
    flen_Id?: number;
    flen_FechaHoraSalida?: string;
    flen_FechaHoraEstablecidaDeLlegada?: string;
    flen_FechaHoraLlegada?: string;
    flen_Estado?: boolean;
    flen_SalidaProyecto?: boolean;
    flen_DestinoProyecto?: boolean;
    boas_Id?: number;
    boat_Descripcion?: string;
    boat_Id?: number;
    emtr_Id?: number;
    emss_Id?: number;
    emsl_Id?: number;
    usua_Creacion?: number;
    flen_FechaCreacion?: string;
    usua_Modificacion?: number;
    flen_FechaModificacion?: string;
    flen_EstadoFlete?: number;
    codigo?: number;
    inpp_Observacion?: string;
    encargado?: string;
    destino?: string;
    estado?: string;
    supervisorsalida?: string;
    supervisorllegada?: string;
    usuarioCreacion?: string;
    usuaCreacion?: string;
    usuaModificacion?: string;
    usuarioModificacion?: string;
    proy_Id?: number;
    proy_Nombre?: string;
    flen_ComprobanteLLegada: string;
    bode_Descripcion?: string;

}


export class Bodega {
    bode_Id?: number;
    bode_Descripcion?: string;
}



export class Proyecto {
    proy_Id?: number;
    proy_Nombre?: string;
}


export interface Ubicacion {
    id: number;
    descripcion: string;
}



export interface ActividadPorEtapa {
    acet_Id?: number;
    acet_Observacion?: string;
    acet_Cantidad?: number;
    espr_Id?: number;
    empl_Id?: number;
    acet_FechaInicio?: Date;
    acet_FechaFin?: Date;
    acet_PrecioManoObraEstimado?: number;
    acet_PrecioManoObraFinal?: number;
    acti_Id?: number;
    unme_Id?: number;
    etpr_Id?: number;
    proy_Id?: number;
    proy_Descripcion?: string;
    etap_Id?: number;

    espr_Descripcion?: string;
    empl_NombreCompleto?: string;
    acti_Descripcion?: string;
    etap_Descripcion?: string;
    unme_Nombre?: string;
    unme_Nomenclatura?: string;
    unme_Identificador?: string;
    acet_Estado?:boolean;
    etapaActividadConcatenado?: string;
}

