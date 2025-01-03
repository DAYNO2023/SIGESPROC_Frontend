export class Estado{
    codigo?: number;
    esta_Id?: number;
    esta_Codigo?:string;
    esta_Nombre?:string;
    pais_Id?:number;
    pais_Nombre?:string;
    usua_Creacion?:number;
    usua_Modificacion?: number;
    usuaCreacion?:string;
    usuaModificacion?:string;
    esta_FechaCreacion?: string;
    esta_FechaModificacion?: string;
}


export class DropDownEstados{
    esta_Id?:number;
    esta_Nombre?:string
    pais_Id?:number;
   }

   export class DropDownPaises{
    pais_Nombre?:string
    pais_Id?:number;
   }