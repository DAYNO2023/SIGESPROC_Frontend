export class BienRaiz {
    bien_Imagen?: string;
    bien_Id?: number;
    bien_Desripcion?: string;
    pcon_Id?: number;
    usua_Creacion?: number;
    terr_Id?: number;
    proy_Id?: number;
    terr_Descripcion?: string;
    terr_Direccion?: string;
    terr_Area?: string;
    proy_Nombre?: string;
    proy_Descripcion?: string;
    usuaCreacion?: string;
    usuaModificacion?: string;
    bien_FechaCreacion?: string;
    usua_Modificacion?: number;
    bien_FechaModificacion?: string;
    bien_Estado?: string;
    codigo?: string;
    dobt_DescipcionDocumento? :string;
    bien_precio ? :number;
    bien_Identificador? :string;

}


export class ddldoc {
    tido_Id?:number;
    tido_Descripcion?:string;

}


export interface TablaMaestra{
    codigo2: number;
    documentoId?: number;
    descripcionDocumento?: string;
    tipoDocumentoId?: number;
    tipoDocumentoDescripcion?:string
}



export class ProyectoContruccionBienRaiz {
    pcon_Id?: number;
    proy_Descripcion?: string;
    proy_DireccionExacta?: string;
    terr_Descripcion?: string;
    terr_Direccion?: string;
    precio? : number;
}
