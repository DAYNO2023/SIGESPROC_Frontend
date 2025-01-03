//Modelo para incidentes
export class incidentes{
    inci_Id?:number;
    inci_Descripcion?:string;
    inci_Costo?:string;
    inci_Fecha?:string;
    imin_Imagen?;
    usua_Creacion?:number;
    inci_FechaCreacion?:string;
    usua_Modificacion?:number; 
    inci_FechaModificacion?:string; 
    codigo?:number;
    
    usuario_Creacion?:string;
    usuario_Modificacion?:string;
    
    
    
    acet_Id?:number;
    acet_Cantidad ?: number;
    
    etap_Id ?: number;
    etpr_Id?:number;
    proy_Id?:number;
    
    etap_Descripcion?:string;
    proy_Descripcion?:string;
    acti_Descripcion?:string;
    proy_Nombre?:string;

}


export class ProyectoControl{
  codigo ?: number;
  proy_Id ?: number;
  proy_Nombre?:string;
  proy_Descripcion ?: string;
  proy_FechaInicio ?: string;
  proy_FechaFin ?: string;
}


//Modelo para Imagenes
export class Imagenes{
  imin_Id ?: number;
  imin_Imagen?: string;
  inci_Id?:number
  usua_Creacion?:number;
  imin_FechaCreacion?: string;
  usua_Modificacion?: number;
  imin_FechaModificacion?: string;
}