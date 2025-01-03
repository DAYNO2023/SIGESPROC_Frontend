export class Insumo{
    insu_Id!: number;
    suca_Id!:number;
    insu_Descripcion:string;
    insu_Observacion:string;
    mate_Id:number;
    insu_UltimoPrecioUnitario :number;
    codigo: number;
    usuaCreacion: string;
    usuaModificacion: string;
    cate_Descripcion: string;
    cate_Id:number;
    suca_Descripcion:string;
    mate_Descripcion:string;

}
export class InsumoEnviar{
    suca_Id!:number;
    insu_Descripcion:string;
    insu_Observacion:string;
    mate_Id:number;
    insu_UltimoPrecioUnitario :number;
    usua_Creacion?: number;

}

export class Fill{
    insu_Id: number;
    suca_Id:number;
    insu_Descripcion:string;
    insu_Observacion:string;
    mate_Id:number;
    insu_UltimoPrecioUnitario :number;
    usua_Creacion:number;
    insu_FechaCreacion:string;
    usua_Modificacion:number;
    insu_FechaModificacion:string;
    mate_Descripcion:string;
    suca_Descripcion:string;
    codigo: number;
    usuaCreacion: string;
    usuaModificacion: string;
    cate_Descripcion: string;
    cate_Id:number;
}

export class ddlMaterial{
    mate_Id: number;
    mate_Descripcion:string;

}

export class ddlSubcategoria{
    suca_Id: number;
    suca_Descripcion:string;
    cate_Descripcion: string;
    cate_Id:number;
}

export class ddlCategorias{
    cate_Descripcion: string;
    cate_Id:number;
    suca_Id: number;
    suca_Descripcion:string;
}

export class ddlSubcategoriaPorcategorias{
    suca_Id: number;
    suca_Descripcion:string;
    cate_Descripcion: string;
    cate_Id:number;

}



// response-api.model.ts
export interface ResponseApi<T> {
    code: number;
    data?: T;
    message?: string;
  }
