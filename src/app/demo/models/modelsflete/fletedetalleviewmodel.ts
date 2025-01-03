export interface FleteDetalle {
  codigo?: number;
  flde_Id?: number;
  flde_Cantidad: number;
  flen_Id: number;
  usua_Creacion: number;
  flde_FechaCreacion: Date;
  usua_Modificacion?: number;
  flde_FechaModificacion?: Date;
  bode_Descripcion?: string;
  bode_Id?: number;
  bopi_Stock?: number;
  inpp_Id: number;
  prov_Descripcion?: string;
  insu_Descripcion?: string;
  usuaCreacion?: string;
  usuaModificacion?: string;
  insu_Id?: number;
  prov_Id?: number;
  inpp_Preciocompra?: number;
  mate_Descripcion?: string;
  unme_Nombre?: string;
  unme_Id?: number;
  unme_Nomenclatura?: string;
  verificado?: boolean;
  flde_llegada?: boolean;

  eqpp_Id?: number;
  flde_TipodeCarga: boolean;
  stock?: number;

  equs_Descripcion?: string;
  equs_Nombre?: string;
  //para verificacion
  cantidadInvalida?: boolean;
  cantidadError?: string;

  proy_Id?: number;
  proy_Nombre?: string;
  proy_Descripcion?: string;
  etpr_Id?: number;
  etap_Descripcion?: string;
  acti_Id?: number;
  acti_Descripcion?: string;
  insu_Observacion?: string;
  mate_Id?: number;



}

export interface FleteDetalleExtendido extends FleteDetalle {
  cantidadError?: string;
}
