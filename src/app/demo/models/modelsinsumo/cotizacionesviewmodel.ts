export class cotizacion {
    coti_Id ?: number;
    prov_Id ?: number;
    coti_Fecha ?:string;
    empl_Id ?: number;
    usua_Creacion ?: number;
    total?:string;
    coti_FechaCreacion ?: string;
    usua_Modificacion ?: number;
    coti_FechaModificacion ?: string;
}

export class cotizacionesDetalle {

}

export interface CotizacionImpuesto{
    impu_Porcentaje?:string;
}

export interface CotizacionTabla{
    codigo?: number;
    cantidad?: number;
    total?: string;
    agregadoACotizacion?: boolean;
    coti_Impuesto?: string;
    coti_Incluido?: boolean;
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