import { SegRect } from "@fullcalendar/core/internal";

 export class Terreno {
    terr_Id?: string;
    terr_Descripcion?: string;
    terr_Area?: string;
    terr_Estado?: boolean;
    terr_PecioCompra?: string;
    terr_PrecioVenta?:string;
    terr_Latitud?: string;
    terr_Longitud?: string;
    terr_LinkUbicacion?:string;
    terr_Imagen?:string;
    usua_Creacion?: string;
    terr_FechaCreacion?:string;
    usua_Modificacion?:string;
    terr_FechaModificacion?:string;
    ciudad ?: string;
    pais ?: string;
    codigo?:string;
    usuaModificacion?:string;
    usuaCreacion?:string;
    dobt_DescipcionDocumento?: string;
    terr_Identificador?:boolean;
}
interface ValidationErrors {
    [key: string]: string[];
}

export class ddlproyecto{
    proy_Id?: number;
    proy_Nombre?: string;
}

export class ddldoc {
    tido_Id?:number;
    tido_Descripcion?:string;

}

export interface RespuestaServicio {
    success: boolean;
    data: any;
    message?: string;
  }
  export interface TablaMaestra{
    codigo2: number;
    documentoId?: number;
    descripcionDocumento?: string;
    tipoDocumentoId?: number;
    tipoDocumentoDescripcion?:string    ;
    documentoImagen?:string;
}
