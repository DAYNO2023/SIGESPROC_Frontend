export interface Material{
    // Campos
    mate_Id?:number;
    mate_Descripcion?:string;

    // Auditoria
    usua_Creacion?:number;
    mate_FechaCreacion?: Date;
    usua_Modificacion?:number;
    mate_FechaModificacion?: Date;
    mate_Estado?:boolean;

    // JOINs
    usuaCreacion?:string;
    usuaModificacion?:string;

    // RowNumber
    codigo?:number;
}
