import { _Start } from "@angular/cdk/scrolling";

export class GestionAdicional {
      adic_Id?:number;
      adic_Descripcion?:string;
      adic_Fecha?:string;
      adic_PresupuestoAdicional?:number;
      usua_Creacion?:number;
      adic_FechaCreacion?:string;
      usua_Modificacion?:number;
      adic_FechaModificacion?:string;

      adic_UsuarioCreacion?:string;
      adic_UsuarioModificacion?:string;

      acet_Id?:number;
      acet_Cantidad ?: number;

      etap_Id ?: number;
      etpr_Id?:number;
      proy_Id?:number;

      etap_Descripcion?:string;
      proy_Descripcion?:string;
      acti_Descripcion?:string;
      codigo?:number;
 
      proy_Nombre?:string;

}

export class GestionAdicionalImagen {
      imge_Id?: number;
      acet_Id?:number;
      imge_Imagen?: string;
      usua_Creacion?: number;
      Imge_FechaCreacion?: string;
      usua_Modificacion?: number;
      Imge_FechaModificacion?: string;
}

