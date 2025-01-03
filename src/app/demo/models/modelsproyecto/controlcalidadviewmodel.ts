export class ControlCalidad {
      codigo ?: number;
      coca_Id ?: number;
      coca_Descripcion ?: string;
      coca_Fecha ?: string;
      usua_Creacion ?: number;
      coca_FechaCreacion ?: string;
      usua_Modificacion ?: number;
      coca_FechaModificacion ?: string;
      coca_Estado ?: string;
      acet_Id ?: number;
      acet_Cantidad ?: number;
      coca_MetrosTrabajados ?: string;
      acti_Descripcion ?: string;
      etap_Id ?: number;
      etpr_Id ?: number;
      etap_Descripcion ?: string;
      proy_Id ?: number;
      proy_Descripcion ?: string;
      proy_Nombre ?: string;
      usuaCreacion ?: string;
      usuaModificacion ?: string;
      coca_CantidadTrabajada ?: string;
      coca_Aprobado ?: boolean;
}

export class ProyectoControl{
      codigo ?: number;
      proy_Id ?: number;
      proy_Descripcion ?: string;
      proy_FechaInicio ?: string;
      proy_FechaFin ?: string;
}

export class ControlCalidadImagen {
        icca_Id ?: number;
        icca_Imagen : string;
        icca_Descripcion  : string;
        coac_Id : number;
        usua_Creacion : number
        icca_FechaCreacion : string;
        usua_Modificacion : number;
        icca_FechaModificacion : string;
        icca_Estado : string;
        coca_Id : number;

}