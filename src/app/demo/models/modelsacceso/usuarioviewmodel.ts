import { Rol } from "./rolviewmodel";

export class Usuario {
    codigo?: number;
    usua_Id?: number;
    usua_Usuario?: string;
    usua_Clave?: string;
    usua_EsAdministrador?: boolean;
    role_Id?: number;
    empl_Id?: number;
    usua_ObservacionInactivar?:string;
    role?: Rol;
    selected?: boolean;
    empleadoSinDNI?: string;
    usua_Creacion?: number;
    usua_FechaCreacion?: Date;
    usua_Modificacion?: number;
    usua_FechaModificacion?: Date;
    usua_Estado?: boolean;

    role_Descripcion?: string;
    empleado?: string;
    empleadoDNI?: string;
    usuaCreacion?: string;
    usuaModificacion?: string;

    nombre_Empleado: string;
    empl_CorreoElectronico: string;
    empl_Telefono: string;
    empl_Imagen: string;
    carg_Descripcion: string;
    empl_FechaNacimiento: string;

   pant_Id?: number;
   pant_Descripcion?: string;
}

export class autocompleteEmpleado {
    empl_Id?: number;
    empleado?: string;
}
