export class Bodega {
    codigo ?: number;
    bode_Id ?: number;
    bode_Descripcion ?: string;
    bode_Latitud ?: string;
    bode_Longitud ?: string;
    bode_LinkUbicacion ?: string;
    usua_Creacion ?: number;
    bode_FechaCreacion ?: string;
    usua_Modificacion ?: number;
    bode_FechaModificiacion ?: string;
    ciudad ?: string;
    pais ?: string;

    // Propiedades adicionales
    inpp_Id ?: number;
    bopi_Stock ?: number;
    bopi_FechaCreacion ?: string;
    bopi_FechaModificacion ?: string;
    bopi_Precio ?: number;

    // Propiedades NotMapped
    usuaCreacion ?: string;
    usuaModificacion ?: string;
    insu_Descripcion ?: string;
    unme_Nombre ?: string; // Nombre de la unidad de medida
    unme_Nomenclatura ?: string;
    prov_Descripcion ?: string; // Descripción del proveedor
    mate_Descripcion ?: string; // Descripción del material

    id ?: number;
    insumoId ?: number;
    articulo ?: string;
    precio ?: number;
    fechaCreacion ?: string;
    categoria ?: string;
    unidad ?: number;
    medida ?: string;
    stock ?: number;
    precioEnBodega ?: number;
    agregadoABodega ?: boolean;
    bopi_Id ?: number;
}


export class DropDownBodega{
      bode_Id ?: number;
      bode_Descripcion ?: string;
}


export class BodegaInsumosEquipoSeguridad{
    codigo ?: number;
    id ?: number;
    categoria ?: number;
    articulo ?: number;
    stock ?: number;
}
