export class HistorialDePago {
    codigo: number;
    plan_NumNomina: number;
    empl_Id: number;
    nombreCompleto: string;
    cargo: string;
    frecuencia: string;
    frec_NumeroDias: number;
    plan_Id: number;
    empl_Salario: number;
    totalDeducido: number;
    totalPrestamos: number;
    plde_SueldoNeto: number;

    constructor(init?: Partial<HistorialDePago>) {
        Object.assign(this, init);
    }
}
