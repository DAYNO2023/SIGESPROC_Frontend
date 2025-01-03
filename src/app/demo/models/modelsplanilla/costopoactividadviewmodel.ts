export interface CostoActividad {
    codigo?: number;
    copc_Id: number;
    copc_Observacion: string;
    unidadDeMedida?: string;
    unme_Id?: number;
    Actividad?: string;
    acti_Id?: number;
    copc_Valor?: number;
    copc_EsPorcentaje?: boolean;
    UsuarioCreacion?: string;
    usua_Creacion?: number;
    copc_FechaCreacion?: string;
    UsuarioModifica?: string;
    usua_Modificacion?: number;
    copc_FechaModificacion?: string;
    copc_EstadoActividad?: number;
}
