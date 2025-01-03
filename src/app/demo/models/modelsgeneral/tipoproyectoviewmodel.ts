export class TipoProyecto{
    //Campos
    tipr_Id ?:number;
    tipr_Descripcion ?: string;

    //Auditoria
    usua_Creacion?:number;
    usua_Modificacion?: number;
    tipr_FechaCreacion?: string;
    tipr_FechaModificacion?: string;

    //JOINs
    usuaCreacion?:string;
    usuaModificacion?:string;
    row?: number;
}