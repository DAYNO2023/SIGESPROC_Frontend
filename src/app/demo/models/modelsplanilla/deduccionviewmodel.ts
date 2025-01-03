export class Deduccion {    

    constructor(usua_Creacion: number, dedu_FechaCreacion: string) {
        this.dedu_Id = 0;
        this.dedu_Descripcion = '';
        // this.dedu_Porcentaje = 0;
        this.dedu_EsMontoFijo = false;
        this.usua_Creacion = usua_Creacion;
        this.dedu_FechaCreacion = dedu_FechaCreacion;
        this.usua_Modificacion = 0;
        this.dedu_FechaModificacion = dedu_FechaCreacion;
        this.dedu_Estado = true;
        this._checked = false;
        this.numDeducciones = 0;
    }

    dedu_Id: number;
    codigo?: number;
    dedu_Descripcion: string;
    dedu_Porcentaje?: number;
    dedu_EsMontoFijo: boolean;
    usua_Creacion: number;
    usuaCreacion?: string;
    dedu_FechaCreacion: string;
    fechaCreacion?: string;
    usua_Modificacion: number;
    usuaModificacion?: string;
    dedu_FechaModificacion: string;
    fechaModificacion?: string;
    dedu_Estado: boolean;
    _checked?: boolean;
    numDeducciones: number;


}
