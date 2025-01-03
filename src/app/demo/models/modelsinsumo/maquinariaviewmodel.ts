export interface Maquinaria { 
    maqu_Id? : number;  
    maqu_Descripcion? : string;  
    maqu_UltimoPrecioUnitario? : string;  
    nive_Id? : number;  
    usua_Creacion? : number ;
    maqu_FechaCreacion? : Date;
    usua_Modificacion? : number;  
    maqu_FechaModificacion? : string;
    maqu_Estado? : boolean;  
}


export interface MaquinariabBuscar { 
    codigo? : number;  
    mapr_Id? : number; 
    maqu_Descripcion? : string;  
    estado? : string;  
    renta? : string;  
    mapr_PrecioCompra? : string ;
    nive_Descripcion? : string;
  
}


export interface MaquinariaCrud{ 
    maqu_Id? : number;  
    maqu_Descripcion? : string;  
    ultimoPrecio? : string;  
    maqu_UltimoPrecioUnitario? : number ;  
    nive_Id? : number;  
    usua_Creacion? : number ;
    maqu_FechaCreacion? : Date;
    usua_Modificacion? : number;  
    maqu_FechaModificacion? : string;
    maqu_Estado? : boolean;  
    nive_Descripcion? : string;
    codigo? : string
}

export interface Nivel { 
    nive_Id? : number;  
    nive_Descripcion? : string;  

}