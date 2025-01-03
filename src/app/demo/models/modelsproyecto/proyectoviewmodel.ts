import { Pago } from "./pagoviewmodel";

export interface Proyecto{
    row?: number;
    //Campos
    proy_Id?: number;
    tipr_Id?: number;
    proy_Nombre?: string;
    proy_Descripcion?: string;
    proy_FechaInicio?: Date;
    proy_FechaFin?: Date;
    proy_DireccionExacta?: string;
    espr_Id?: number;
    clie_Id?: number;
    ciud_Id?: number;
    frec_Id?: number;
    //Auditoria
    usua_Creacion?:number;
    proy_FechaCreacion?: Date;
    usua_Modificacion?:number;
    proy_FechaModificacion?: Date;
    proy_Estado?:boolean;

    //JOINs
    usuaCreacion?:string;
    usuaModificacion?:string;

    esta_Nombre?: string;
    pais_Nombre?: string;
    ciud_Descripcion?: string;
    clie_NombreCompleto?: string;
    espr_Descripcion?: string;
    tipr_Descripcion?: string;
    empl_NombreCompleto?: string;
    proy_PrecioManoObra?: number;
    proy_CostoInsumos?: number;
    proy_CostoMaquinaria?: number;
    proy_CostoEquipoSeguridad?: number;
    proy_CostoIncidencias?: number;
    proy_Progreso?: number;
    proy_CostoProyecto?: number;
    frecuencia?: string;
    frec_NumeroDias?: number;
    pagos?: Pago[];
}

export interface Riesgo{
    row?: number;
    //Campos
    geri_Id?: number;
    geri_Descripcion?: string;
    geri_Impacto?: string;
    geri_Probabilidad?: number;
    geri_Mitigacion?: string;
    proy_Id?: number;

    //Auditoria
    usua_Creacion?:number;
    geri_FechaCreacion?: Date;
    usua_Modificacion?:number;
    geri_FechaModificacion?: Date;
    geri_Estado?:boolean;

    //JOINs
    usuaCreacion?:string;
    usuaModificacion?:string;

    proy_Nombre?: string;
}

export interface Documento{
    row?: number;
    //Campos
    docu_Id?: number;
    docu_Tipo?: string;
    docu_Descripcion?: string;
    docu_Ruta?: string;
    docu_Fecha?: Date;
    empl_Id?: number;
    proy_Id?: number;

    //Auditoria
    usua_Creacion?:number;
    docu_FechaCreacion?: Date;
    usua_Modificacion?:number;
    docu_FechaModificacion?: Date;
    docu_Estado?:boolean;

    //JOINs
    usuaCreacion?:string;
    usuaModificacion?:string;

    empl_NombreCompleto?: string;
    docu_TipoDescripcion?: string;
    proy_Nombre?: string;
}

export interface EtapaPorProyecto{
    row?: number;
    //Campos
    etpr_Id?: number;
    etap_Id?: number;
    empl_Id?: number;
    proy_Id?: number;

    //Auditoria
    usua_Creacion?:number;
    etpr_FechaCreacion?: Date;
    usua_Modificacion?:number;
    etpr_FechaModificacion?: Date;
    etpr_Estado?:boolean;

    //JOINs
    usuaCreacion?:string;
    usuaModificacion?:string;

    proy_Nombre?: string;
    empl_NombreCompleto?: string;
    proy_FechaInicio?: Date;
    etap_Descripcion?: string;
    etpr_FechaInicio?: Date;
    etpr_FechaFin?: Date;
    carg_Descripcion?: string;
    etpr_CostoInsumos?: number;
    etpr_CostoMaquinaria?: number;
    etpr_CostoEquipoSeguridad?: number;
    etpr_Progreso?: number;

    //Array para Master
    actividadesPorEtapa?: any[];
}

export interface ActividadPorEtapa{
    row?: number;
    //Campos
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

    //Auditoria
    usua_Creacion?:number;
    acet_FechaCreacion?: Date;
    usua_Modificacion?:number;
    acet_FechaModificacion?: Date;
    acet_Estado?:boolean;

    //JOINs
    usuaCreacion?:string;
    usuaModificacion?:string;

    espr_Descripcion?: string;
    empl_NombreCompleto?: string;
    acti_Descripcion?: string;
    etap_Descripcion?: string;
    unme_Nombre?: string;
    unme_Nomenclatura?: string;
    inpa_CostoInsumos?: number;
    rmac_CostoMaquinaria?: number;
    acet_Progreso?: number;
    etapaActividadConcatenado?: string;
}
