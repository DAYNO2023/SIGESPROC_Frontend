import { Respuesta } from "../../services/ServiceResult";
export class Planilla{
     plan_Id? : number;
     plan_NumNomina? : number;
     plan_FechaPago?: string;
     plan_FechaPeriodoFin?: string;
     plan_Observaciones?: string ; 
     usua_Creacion?: number; 
     plan_FechaCreacion?: Date; 
     usua_Modificacion?: number;
     plan_FechaModificacion? : Date; 
     frec_Id?: number;
     plan_PlanillaJefes?: boolean;
     usuaCreacion? : string; 
     usuaModificacion?: string;
     planilla? : string; 
     frec_Descripcion?: string;
}

export class contenedor {
     planillaViewModel?:[]
     
     planillaEmpleado?:[
          deducciones?:[],
          prestamos?:[],
     ]
}

export class ListadoEmpleadosPlanilla  {

     plan_Id?: number;
     usua_Creacion?: number;
     empl_FechaCreacion?: Date;
     codigo?: number;
     empl_Id?: number;
     empl_Estado?: boolean; 
     empl_DNI?: string;
     empl_Nombre?: string;
     empl_Apellido?: string;
     empl_CorreoElectronico?: string;
     empl_Salario?: number;
     carg_Id?: number;   
     cargo?: string;
     frecuencia?: string;
     horasExtras?: number;
     salarioExtra?: number;
     salarioDiario?: number;
     totalDevenagado?: number;
     totalDeducido?: number;
     sueldoTotal?: number;
     frec_Descripcion?: string;
     frec_NumeroDias?: number;
     deducciones?:Deducciones[];
     prestamos?:[];
     totalPrestamos?: number;
}

export class Deducciones {
    dedu_Descripcion?: string;
    dedu_Porcentaje?: string;
    totalPorDeduccion?: string;a
    totalDeducido?: number;
    sueldoTotal?: number;
    empl_Salario?: number;
    empl_Id?: number;
    saberSiDeduce?: number;
    plde_Id?: number;
    dedu_Id?: number;
}
