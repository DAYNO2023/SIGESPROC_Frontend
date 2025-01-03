// Clase que representa una venta de bien raíz.
export class ventabienraiz {
    mant_Id?: number;
    btrp_Id?: number; // Identificador único de la venta.
    btrp_Identificador?: number; // Identificador asociado al bien raíz o terreno.
    btrp_PrecioVenta_Final?: number; // Precio final de venta.
    btrp_FechaVendida?: Date; // Fecha en la que se vendió el bien raíz.
    agen_NombreCompleto?: string; // Nombre completo del agente involucrado en la venta.
    btrp_FechaModificacion?: Date; // Fecha de la última modificación de la venta.
    usua_Modificacion?: number; // ID del usuario que realizó la última modificación.
    Descripcion?: string; // Descripción del bien raíz o venta (nuevo campo).

    btrp_PrecioVenta_Inicio?: number; // Precio inicial de venta.
    btrp_FechaPuestaVenta?: Date; // Fecha en que el bien raíz fue puesto en venta.
    agen_Id?: number; // Identificador del agente de bienes raíces.
    btrp_Terreno_O_BienRaizId?: boolean; // Indica si se trata de un terreno (true) o de otro tipo de bien raíz (false).
    btrp_BienoterrenoId?: number; // Identificador del bien o terreno asociado.
    usua_Creacion?: number; // ID del usuario que creó el registro.
    btrp_FechaCreacion?: Date; // Fecha de creación del registro.

    agen_DNI?: string; // Documento Nacional de Identidad del agente.
    agen_Correo?: string; // Correo electrónico del agente.

    terr_Identificador?: boolean; // Indica si el terreno está identificado.

    Imagen?: string; // URL o referencia de la imagen asociada al bien raíz.

    // Propiedad para almacenar los datos de imagenes relacionadas con la venta.
    tbImagenesPorProcesosVentas?: ImageData;

    bien_Id?: number; // Identificador del bien raíz.
    bien_Desripcion?: string; // Descripción del bien raíz.
    pcon_Id?: number; // Identificador del proyecto de construcción (si aplica).

    bien_FechaCreacion?: Date; // Fecha de creación del bien raíz.
    bien_FechaModificacion?: Date; // Fecha de modificación del bien raíz.
    bien_Estado?: boolean; // Estado del bien raíz (activo/inactivo).
    bien_Imagen?: string; // URL o referencia de la imagen del bien raíz.
    bien_Precio?: string; // Precio del bien raíz.

    terr_Id?: number; // Identificador del terreno.
    terr_Descripcion?: string; // Descripción del terreno.
    terr_Direccion?: string; // Dirección del terreno.
    terr_Area?: string; // Área del terreno.
    terr_Estado?: boolean; // Estado del terreno (activo/inactivo).
    terr_PecioCompra?: string; // Precio de compra del terreno.
    terr_PrecioVenta?: string; // Precio de venta del terreno.
    terr_LinkUbicacion?: string; // Enlace de ubicación del terreno.
    terr_Imagen?: string; // URL o referencia de la imagen del terreno.
    terr_Coordenadas?: string; // Coordenadas del terreno.
    terr_Latitud?: number; // Latitud del terreno.
    terr_Longitud?: number; // Longitud del terreno.
    terr_FechaCreacion?: Date; // Fecha de creación del terreno.
    terr_FechaModificacion?: Date; // Fecha de modificación del terreno.

    precioCompra?: string; // Precio de compra del bien raíz o terreno.

    id?: number; // Identificador general.
    tipo?: number; // Tipo de bien raíz o terreno.

    codigo?: string; // Código del bien raíz o terreno.


    mant_DNI?: string;
    mant_NombreCompleto?: string;
    mant_Telefono?: number;

    clie_Id?: string;
}

// Clase que representa el modelo de imagen para el proceso de venta.
export class ImagenViewModel {
    btrp_Id?: number; // Identificador único del proceso de venta.
    impr_Imagen?: string; // URL o referencia de la imagen.
    usua_Creacion?: number; // ID del usuario que creó la imagen.
}

export class Mantenimiento {
    mant_Id?: number;
    mant_DNI?: string;
    mant_NombreCompleto?: string;
    mant_Telefono?: number;
    usua_Creacion?: number;
    mant_FechaCreacion?: Date;
}
