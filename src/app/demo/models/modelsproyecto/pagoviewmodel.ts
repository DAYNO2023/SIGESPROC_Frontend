export interface Pago{
    row?: number;
    
    pago_Id?: number;
    pago_Monto?: number;
    pago_Fecha?: Date;
    clie_Id?: number;
    proy_Id?: number;

    usua_Creacion?: number;
    pago_FechaCreacion?: Date;
    usua_Modificacion?: number;
    pago_FechaModificacion?: Date;
    pago_Estado?: boolean;

    clie_NombreComplet?: string;
}