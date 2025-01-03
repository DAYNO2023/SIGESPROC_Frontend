import { S } from "@fullcalendar/core/internal-common";

export class  ReporteTerrenoFechaCreracion{
    terrenoId?: number;
    descripcion?:string;
    area?: string;
    precioCompra?: string;
    linkUbicacion?: string;
    latitud?: string;
    longitud?: string;
    fechaCreacion?: string;
    identificador?: boolean;
}
export class  ReporteTerrenosPorEstadoProyecto{
    terrenoId?: number;
    descripcion?:string;
    area?: string;
    precioCompra?: string;
    linkUbicacion?: string;
    latitud?: string;
    longitud?: string;
    fechaCreacion?: string;
    identificador?: boolean;
}
export class  ReporteVentasPorEmpresa{
    ventaId?: number;
    identificador?: string;
    precioVentaInicio?: string;
    precioVentaFinal?: string;
    fechaPuestaVenta?: string;
    fechaVendida?:string;
    nombreAgente?: string;
    nombreEmpresa?: string;
}

export class ddlempresa{
text?:string;
value?: Number;
}
export class DDL{
    text?:string;
    value?: Number;
    }
export class ddlproveedor{
    text?:string;
    value?: Number;
}
export class  ReporteEmpleadoPorEstado{
    codigo?: number;
    dNI?: string;
    telefono?: string;
    email?: string;
    nacimiento?: string;
    salario?: string;
    ciudad?: string;
    estado?: string;
    estadoCivil?: string;
    cargo?:string;
    banco?: string;
    noBancario?: string;
    frecuencia?: string;
    frec_NumeroDias?: string;
    empl_NombreCompleto?: string;
}
export class  ReporteFletesPorFecha{
    numeroFlete?: string;
    encargado?: string;
    supervisorsalida?: string;
    supervisorllegada?: string;
    estadoFlete?: string;
    fechaHoraSalida?: string;
    fechaHoraLlegada?: string;
    fechaHoraEstablecidaDeLlegada?: string;
    salida?: string;
    destinoProyecto?: string;
    actividad_Etapa?: string;
    destino?: string;
    cantidad?: string;
    flde_Llegada?: string;
    proveedor?: string;
    insumo?: string;
    observaciones?: string;
    fleteDetalleLLegada?: string;
    tipoCarga?: string;
    material?: string;
    equipoSeguridad1?: string;
    unidadMedida?: string;
    nomenclatura?: string;
    bodega?: string;
    stock?: string;
    precioCompra?: string;
    equipoSeguridad2?: string;
    equiposeguridad3?: string;
}
export class  ReporteHistorialCotizaciones{
    noCotiazacion?: number;
    fechaCotizacion?: string;
    empleadoCotizacion?:  string;
    impuestoCotizacion?: string;
    cantidadProductos?: string;
    precioCompraCotizacion?: string;
    proveedorCotizacion?: string;
    correoProveedor?: string;
    telefonoProveedor?: string;
    segundoTelefonoProveedor?: string;
}
export class  ReporteComprasRealizadas{
    codigo?: string;
    cantidadCompra?: string;
    precioCompra_Compra?: string;
    unidadMedidaoRentaCompra?:string;
    tipoRentaCompra?: string;
    articuloCompra?: string;
    ultimoPrecioUnitarioCompra?: string;
    unidadMedidaCompra?: string;
    fechaCompra?: string;
    fechaFinCompra?: string;
    fechaInicioCompra?: string;
    impuestoCompra?: string;
    cotizacionProveedorCompra?: string;
    cantidadVerificadaCompra?: string;
    ubicacionesCompra?: string;
    tipoArticuloCompra?: string;
    tipoArticulo?: string;
}
export class ReporteComparacionMonetaria {
  actividad_comparacion?: string;
  cantidad_comparativo?: string;
  manoObraUsada_comparativo?: string;
  unidadmedida_comparativo?: string;
  costoMateriales_comparativo?: string;
  precioUnitario_comparativo?: string;
  subtotal_comparativo?: string;


  //Etapa
  etapa_comparativo?: string;
  etapa_TotalCantidad_comparativo?: string;
  etapa_TotalManoObra_comparativo?: string;
  etapa_TotalMateriales_comparativo?: string;
  etapa_TotalSubtotal_comparativo?: string;

  //Presupiestp mas proyecto + cliente
  total_Cantidad_Proyecto?: string;
  total_ManoObra_Proyecto?: string;
  total_CostoMateriales_Proyecto?: string;
  total_Subtotal_Proyecto?: string;
  total_Cantidad_Presupuesto?: string;
  total_ManoObra_Presupuesto?: string;
  total_CostoMateriales_Presupuesto?: string;
  total_PrecioMaquinaria_Presupuesto?: string;
  total_Ganancia_Presupuesto?: string;
  total_Pagos_Proyecto?: string;
  total_Global_Proyecto?: string;
  total_Global_Presupuesto?: string;

}


export class  ReporteCotizacionesPorRangoPrecios{
    proveedorDescripcionRangoprecio?: string;
    precioCompraInsumoRangoprecio?: string;
    precioCompraMaquinariaRangoprecio?: string;
    precioCompraEquipoSeguridadRangoprecio?: string;
    descripcionInsumoRangoprecio?: string;
    descripcionMaquinariaRangoprecio?: string;
    descripcionEquipoSeguridadRangoprecio?:string;
    unidadMedidaNombreRangoprecio?: string;
    unidadMedidaNomenclaturaRangoprecio?: string;
    tipoRangoprecio?: string;
}
export class  ReporteInsumosBodega{
    cantidadBodega?: string;
    unidadMedidaoRentaBodega?: string;
    tipoRentaBodega?: string;
    articuloBodega?: string;
    ultimoPrecioUnitarioBodega?: string;
    unidadMedidaBodega?: string;
    fechaFinBodega?: string;
    fechaIniciobodega?: string;
    impuestoBodega?: string;
    cotizacionProveedorBodega?: string;
    cantidadVerificadaBodega?: string;
    ubicacionesBodegas?: string;
    tipoArticuloBodegas?: string;
}
export class  ReporteInsumosAProyecto{
    cantidadproyecto?: string;
    numerocompraproyecto?: string;
    unidadMedidaoRentaproyecto?: string;
    tipoRentaproyecto?: string;
    ultimoPrecioUnitarioproyecto?: string;
    unidadMedidaproyecto?: string;
    fechaFinproyecto?: string;
    fechaInicioproyecto?: string;
    CotizacionProveedorproyecto?: string;
    cantidadVerificadaproyecto?: string;
    ubicacionesproyecto?: string;
    tipoArticuloproyecto?: string;
}
export class  ReporteHistorialPagosPorProyecto{
    proyectoplanilla?: string;
    empleadoplanilla?: string;
    numeroPlanilla?: string;
    fechaPagoplanilla?: string;
    sueldoBrutoplanilla?: string;
    totalDeduccionesplanilla?: string;
    totalPrestamosplanilla?: string;
    sueldoNetoplanilla?: string;
    prestamosDescripcionplanilla?: string;
    totalMontoPrestamosplanilla?: string;
    totalMontoAbonadoplanilla?: string;
    totalMontoEstimadoViaticoplanilla?: string;
    totalTotalGastadoViaticoplanilla?: string;
    totalMontoGastadoFacturaplanilla?: string;
}
export class  ReporteComparativoProductos{
    codigoCotizacion?: string;
    articuloCotizacion?: string;
    ultimoPrecioUnitarioCotizacion?: string;
    unidadMedidaoRentaCotizacion?: string;
    cantidadCotizacion?: string;
    preciocompraCotizacionpp?: string;
    total?: string;
    cantidadCotizacionpp?: string;
    fechacotiCotizacion?: string;
  }
  export class  ReportecomprasPendientesEnvio{
    noOrdencompraPendientesEnvio?: string;
    precioCompraPendientesEnvio?: string;
    nocompraPendientesEnvio?: string;
    unidadMedidaoRentaPendientesEnvio?: string;
    tipoRentaPendientesEnvio?: string;
    articuloCompraPendientesEnvio?: string;
    ultimoPrecioUnitarioPendientesEnvio?: string;
    unidadMedidaPendientesEnvio?: string;
    fechaInicioCompraPendientesEnvio?: string;
    fechaFinCompraPendientesEnvio?: string;
    cotizacionProveedorPendientesEnvio?: string;
    cantidadVerificadaPendientesEnvio?: string;
    ubicacionesPendientesEnvio?: string;
    tipoArticuloPendientesEnvio?: string;
  }
  export class  ReporteProgresoActividades{
    etapaDescripcion?: string;
    actividadDescripcion?: string;
    descripcionControlDeCalidad?: string;
    porcentajeControlDeCalidad?:string;
    porcentajeTotalActividad?: string;
    PorcentajeFaltanteActividad?: string;
  }
  export class  ReportePorUbicacion{
    fechaCotizacionUbicacion?: string;
    precioCompra_CompraUbicacion?: string;
    articuloUbicacion?: string;
    ultimoPrecioUnitarioUbicacion?: string;
    unidadMedidaUbicacion?: string;
    tipoArticuloUbicacion?: string;
    ubicacionesUbicacion?: string;
  }
  export class  EstadisticasFletes_Comparacion{
    encargadoComparacion?: string;
    supervisorComparacion?: string;
    supervisorllegadoComparacion?: string;
    fechasalidaComparacion?: string;
    fechaestablecidaComparacion?: string;
    fechallegadaComparacion?: string;
    estadoComparacion?: string;
    horasDiferenciaComparacion?: string;
  
  
    totalFletesProgramadosComparacion?: string;
    totalFletesLlegadosComparacion?: string;
    diferenciaFletesComparacion?: string;
    porcentajeLlegadosComparacion?: string;

    salida_CantidadComparacion?: string;
    llegada_CantidadComparacion?: string;
    insumo_SalidaComparacion?: string;
    insumo_LlegadaComparacion?: string;
  }
  export class  ReporteProcesoVenta{
    btrp_PrecioVenta_Inicio?: String;
    btrp_PrecioVenta_Final?: string;
    btrp_FechaPuestaVenta?: string;
    btrp_FechaVendida?: string;
    bien_Descripcion?: string;
    terr_Descripcion?: string;
    terr_Area?: string;
    terr_PecioCompra?: string;
    agen_DNI?: String;
    agen_Nombre?: string;
    agen_Apellido?: string;
    clie_DNI?: string;
    clie_Nombre?: string;
    clie_Apellido?: string;
  }
  export class  EstadisticasFletes_Llegada{
    encargadoLlegada?: string;
    supervisorSalidaLlegada?: string;
    supervisorLlegadaLlegada?: string;
    fechaHoraSalidaLlegada?: string;
    fechaHoraLlegadaLlegada?: string;
    fechaHoraEstablecidaDeLlegada?: string;
    diferenciaenHorasLlegada?: string;
    estadoLlegadaLlegada?: string;
    salidaProyectoLlegada?: string;
    destinoProyectoLlegada?: string;
    estadoLlegada?: string;
  }
  export class  ReporteInsumosTransportadosPorActividad{
    codigo_flete?: string;
    flde_Cantidad?: string;
    insumosFletesporActividad?: string;
    actividad_Descripcion?: string;
    proveedor_Descripcion?: string;
    flete_Observacion?: string;
    materiales_Descripcion?: string;
    equipos_Nombre?: string;
    unme_Nombre?: string;
    bodega_Descripcion?: string;
    flete_Stock?: string;
    fechaCreacion_flete?: string;
    fechaModificacion_flete?: string;
  }
  export class  ReporteInsumosUltimoPrecio{
    codigo?: string;
    cantidadCompraUltimoPrecio?: string;
    precioCompra_CompraUltimoPrecio?: string;
    precioCotizacionUltimoPrecio?: string;
    unidadMedidaCompraUltimoPrecio?: string;
    articuloCompraUltimoPrecio?: String;
    fechaCompraUltimoPrecio?: String;
    impuestoCompraUltimoPrecio?: String;
    cotizacionProveedorCompraUltimoPrecio?: String;
    tipoArticuloCompraUltimoPrecio?: String;
  }