import { ciudad } from "../modelsgeneral/ciudadviewmodel";
import { Estado } from "../modelsgeneral/estadoviewmodel ";
import { Pais } from "../modelsgeneral/paisviewmodel";

export interface Proveedor{
    // Campos
    prov_Id?:number;
    prov_Descripcion?:string;
    prov_Correo?:string;
    prov_Telefono?:string;
    prov_SegundoTelefono?:string;
    ciud_Id?:number;
    prov_InsumoOMaquinariaOEquipoSeguridad?:number;
  

    // Auditoria
    usua_Creacion?:number;
    prov_FechaCreacion?: Date;
    usua_Modificacion?:number;
    prov_FechaModificacion?: Date;
    prov_Estado?:boolean;

    // JOINs
    usuaCreacion?:string;
    usuaModificacion?:string;
    venta?:string;
    esta_Nombre?: string;
    pais_Nombre?: string;
    ciud_Descripcion?: string;

    //RowNumber
    codigo?: number;
}
