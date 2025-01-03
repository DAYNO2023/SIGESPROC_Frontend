export class Notificaciones {
    noti_Id ?: number;
    napu_Id ?: number;
    noti_Descripcion ?: string;
    noti_Fecha ?: string;
    usua_Creacion ?: number;
    noti_FechaCreacion ?: string;
    usua_Modificacion ?: number;
    noti_FechaModificacion ?: string;
    conteo ?: number;
    tian_Id ?: number
    tian_Descripcion ?: string
}

export class NotificacionAlertaPorUsuario {
    codigo : number;
    napu_Id ?: number;
    fecha : string;
    NotificacionOalerta : string;
    Descripcion : string;
    Leida : string;
    usua_Id : number;
    napu_Leida ?: boolean;
    napu_Ruta ?: string;
    
}