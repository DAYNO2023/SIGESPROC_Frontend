export class Banco {
    constructor(usua_Creacion: number, banc_FechaCreacion: string) {
        this.banc_Id = 0;
        this.banc_Descripcion = '';
        this.usua_Creacion = usua_Creacion;
        this.banc_FechaCreacion = banc_FechaCreacion;
        this.usua_Modificacion = 0;
        this.banc_FechaModificacion = banc_FechaCreacion;
        this.banc_Estado = true;
    }

    banc_Id: number;
    codigo?: number;
    banc_Descripcion: string;
    usua_Creacion: number;
    usuaCreacion?: string;
    usuaModificacion?: string;
    banc_FechaCreacion: string;
    usua_Modificacion: number;
    banc_FechaModificacion: string;
    banc_Estado: boolean;
}
