// Clase que representa un agente de bienes raíces.
export class AgenteBienRaiz {
    agen_Id?: number; // Identificador único del agente.
    agen_DNI?: string; // Documento Nacional de Identidad del agente.
    agen_Nombre?: string; // Nombre del agente.
    agen_Apellido?: string; // Apellido del agente.
    agen_Telefono?: string; // Teléfono de contacto del agente.
    agen_Correo?: string; // Correo electrónico del agente.
    usuaCreacion?: string; // Usuario que creó el registro.
    usuaModificacion?: string; // Usuario que modificó el registro.
    embr_Nombre?: string; // Nombre de la empresa asociada al agente.
    usua_Creacion?: number; // ID del usuario que creó el registro.
    agen_FechaCreacion?: string; // Fecha de creación del registro.
    usua_Modificacion?: number; // ID del usuario que modificó el registro.
    agen_FechaModificacion?: string; // Fecha de modificación del registro.
    agen_Estado?: string; // Estado del agente (activo/inactivo).
    embr_Id?: any; // Identificador de la empresa asociada.
    codigo?: number; // Código del agente (opcional).

    // Aquí se podría implementar un getter para obtener el nombre completo del agente combinando nombre y apellido.
}

// Clase que representa una empresa en un menú desplegable (dropdown).
export class DropDownEmpresas {
    embr_Id?: number; // Identificador de la empresa.
    embr_Nombre?: string; // Nombre de la empresa.
}

// Interfaz que define la estructura básica de un agente de bienes raíces.
export interface AgenteBienRaiz2 {
    agen_DNI: string; // Documento Nacional de Identidad del agente.
    agen_Nombre: string; // Nombre del agente.
    agen_Apellido: string; // Apellido del agente.
    agen_Correo: string; // Correo electrónico del agente.
}
