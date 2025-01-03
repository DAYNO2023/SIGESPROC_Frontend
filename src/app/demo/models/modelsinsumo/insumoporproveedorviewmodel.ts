export interface InsumoPorProveedor {
  inpp_Id: number;
  insu_Id?: number;
  prov_Id?: number;
  inpp_Preciocompra?: number;
  usua_Creacion: number;
  inpp_FechaCreacion: Date;
  usua_Modificacion?: number;
  inpp_FechaModificacion?: Date;
  codigo?: number;
  mate_Descripcion?: string;
  insu_Descripcion?: string;
  prov_Descripcion?: string;
  unme_Nombre?: string;
  unme_Id?: number;
  unme_Nomenclatura?: string;
  usuaCreacion?: string;
  usuaModificacion?: string;
  bode_Id?: number;
  bode_Descripcion?: string;
  bopi_Stock?: number;
  inpp_Observacion?: string;
  flde_llegada?: number;
  cantidad: number;
  cantidadError: string;
  stockRestante: number;
  inpa_Stock?: number;



  inputDisabled: boolean;
  flde_TipodeCarga?: boolean;

  eqpp_Id?: number;
  equs_Id?: number;
  equs_Descripcion?: string;
  equs_Nombre?: string;
  eqpp_PrecioCompra?: number;
  eqac_Costo?: number;
  eqac_Cantidad?: number;
}



export interface EquipoPorProveedor {
  eqpp_Id: number;
  equs_Id?: number;
  prov_Id?: number;
  eqpp_Preciocompra?: number;
  usua_Creacion: number;
  eqpp_FechaCreacion: Date;
  usua_Modificacion?: number;
  eqpp_FechaModificacion?: Date;
  codigo?: number;
  equs_Descripcion?: string;
  equs_Nombre?: string;
  prov_Descripcion?: string;
  bode_Id?: number;
  bode_Descripcion?: string;
  bopi_Stock?: number;
  usuaCreacion?: string;
  usuaModificacion?: string;
  cantidad: number;
  cantidadError: string;
  stockRestante: number;
  inputDisabled: boolean;

}

export interface EquipoPorProveedorExtendido extends EquipoPorProveedor {
  cantidad: number;
  cantidadError: string;
  stockRestante: number;
  inputDisabled: boolean;
  flde_TipodeCarga?: boolean;
  stockRealInicial?: number;
}

export interface InsumoPorProveedorExtendido extends InsumoPorProveedor {
  cantidad: number;
  cantidadError: string;
  stockRestante: number;
  inputDisabled: boolean;
  flde_TipodeCarga?: boolean;
  stockRealInicial?: number;
}





