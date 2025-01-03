export class PagoJefeObraPlanillaViewModel {
    empl_Id?: number; // ID del empleado
    codigo?: number; // ID del empleado
    nombreCompleto?: string; // Nombre Completo del empleado
    proyecto?: string; // Proyecto asignado
    etapa?: string; // Etapa del proyecto
    actividad?: string; // Actividad realizada
    totalMetrosTrabajados?: number; // Total de metros trabajados
    precioPorMetro?: number; // Precio por metro trabajado
    sueldoTotal?: number; // Sueldo total
    ultimaFechaControlCalidad?: Date; // Última fecha de control de calidad
    carg_Descripcion?: string; // Descripción del cargo
    afag?: number; // Aporte de fondo de ahorro general (afag)
    deduccin?: number; // Deducción (campo mal escrito, revisar si es 'Deduccion')
    deduccion?: number; // Deducción
    ihss?: number; // Deducción IHSS
    impuestoPersonal?: number; // Impuesto Personal
    isr?: number; // Impuesto sobre la renta
    ivm?: number; // IVM (Instituto de Vivienda y Mutualidad)
    noje?: number; // Noje (Revisar si es correcto)
    nuevaDeduEditada?: number; // Nueva deducción editada
    pavelTax?: number; // Pavel Tax
    rap?: number; // RAP (Régimen de Aportaciones Privadas)
    siu?: number; // Siu (Revisar si es correcto)
    cuotaPrestamo?: number; // Cuota prestamo
    sueldoDevengado?: number; // Sueldo devengado
}
