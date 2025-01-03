export interface ViaticosEncabezados {
    vien_Id?: number;
    vien_SaberProyeto: boolean;
    vien_MontoEstimado: number;
    vien_TotalGastado: number;
    vien_FechaEmicion: string;
    empleado: string;
    proyecto: string;
    empl_Id: number;
    proy_Id: number;
    usua_Creacion: number;
    vien_FechaCreacion: string;
    usua_Modificacion?: number;
    vien_FechaModificacion?: string;
    vien_TotalReconocido?: number;
    vien_Estado?: boolean;
    UsuarioCreacion?: string;
    UsuarioModifica?: string;
    usuarioEsAdm?: boolean;
}
