export interface Cotizacion{
    codigo?: number;
    prov_Descripcion?:string;
    fecha?:string;
    coti_Documento?:string;
    coti_Id?: number;
    prov_Id?: number;
    empl_Id?: number;

    usua_Creacion?:number;
    coti_FechaCreacion?: Date;
    usua_Modificacion?:number;
    coti_FechaModificacion?: Date;
    coti_Estado?:boolean;
    usuaCreacion?:string;
    usuaModificacion?:string;
    venta?:string;
}


export interface CotizacionTabla{
    codigo?: number;
    code_Id?: number;
    id?:number;
    idP?:number;
    articulo?: string;
    precio?: number;
    fechaCreacion?: Date;
    categoria?: string;
    unidad?: number;
    medida?: string;
    cantidad?: number;
    total?: string;
    agregadoACotizacion?: boolean;
    coti_Incluido?: boolean;
    coti_Impuesto?: string;
    medidaORenta?: string;
}

export interface CotizacionImpuesto{
    impu_Porcentaje?:string;
}


export interface TablaMaestra{
    codigo?: number;
    articulo?: string;
    precio?: number;
    medida?: string;
    cantidad?: number;
    total?: string;
    subtotal?: string;
    impuesto?: string;
    coti_Id?: string;
}