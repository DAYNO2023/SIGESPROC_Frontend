import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable'; 
import { CookieService } from 'ngx-cookie-service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { reporteService } from 'src/app/demo/services/servicesreporte/reporteterrenofechacreacion.service';
import { YService } from '../Impresion/impresion.service';
import { MessageService } from 'primeng/api';
import { fechaIncidenciaValida } from '../../componentsflete/Fletes/fechavalidacion';
import { invalid } from 'moment';
import { Router } from '@angular/router';

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




@Component({
  selector: 'app-reporte-terreno-fecha-creacion',
  templateUrl: './ReporteComparacionMonetaria.component.html',
  styleUrls: ['./ReporteComparacionMonetaria.component.scss'],
  providers: [MessageService]
})
export class ReporteComparacionMonetariaComponent implements OnInit {
  reportForm: FormGroup;
  pdfSrc: SafeResourceUrl | null = null;
  loading: boolean = false;
  submitted: boolean = false;
  Usuario : string = (this.cookieService.get('usua_Usuario'));
  proy: any[] = [];
  filteredproyecto: any[] = [];
  proycambio: any[] = [];
  filteredproyecto2: any[] = [];
  tasa: any[] = [];
  filteredTasaCambio: any[] = [];
  private yOffset: number = 40; // Initialize with the top margin

  constructor(
    private fb: FormBuilder,
    private reporte: reporteService,
    private yService: YService,
    public cookieService: CookieService,
    private router: Router,
    private messageService: MessageService,
  ) {
    this.reportForm = this.fb.group({
      proy_Id: ['',Validators.required]
    });
  }

  ngOnInit(): void {
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
  
    this.Usuario = (this.cookieService.get('usua_Usuario'));
  
    console.log("El  usuario es: ", this.Usuario)
    this.reporte.ListarProyecto().subscribe(data => {
      this.proy = data;
      console.log('Empresas:', this.proy);

    });
    this.reporte.ListarProyecto().subscribe(data => {
      this.proycambio = data;
      console.log('Empresas:', this.proycambio);

    });
    this.reporte.Listartasacambio().subscribe(data => {
      this.tasa = data;
      console.log('Empresas:', this.tasa);

    });
    
  }

  filterproyecto(event: any) {
    const query = event.query.toLowerCase();
  console.log('Query:', query);
  this.filteredproyecto = this.proy.filter(empresa =>
      empresa.text?.toLowerCase().includes(query)
  );
  console.log('Filtered Empresas:', this.filteredproyecto);

    const selectedProyecto = this.reportForm.value.proy_Id;
    if (selectedProyecto && !this.filteredproyecto.find(e => e.value === selectedProyecto.value)) {
        this.reportForm.controls['proy_Id'].setErrors({ 'invalidOption': true });
    } else {
        this.reportForm.controls['proy_Id'].setErrors(null);
    }
}

  filterproyecto2(event: any) {
    const query = event.query.toLowerCase();
    this.filteredproyecto2 = this.proycambio.filter(proyectoId =>
      proyectoId.text?.toLowerCase().includes(query)
    );
    console.log('Filtered Empresas:', this.filteredproyecto2);
  }

  filtertasaCambio(event: any) {
    const query = event.query.toLowerCase();
    this.filteredTasaCambio = this.tasa.filter(tasaId =>
      tasaId.text?.toLowerCase().includes(query)
    );
    console.log('Filtered Empresas:', this.filteredTasaCambio);
  }

  
  generateReport() {
    this.submitted = true;

    if (this.reportForm.invalid) {
        if (!this.reportForm.controls['proy_Id'].value) {
            this.reportForm.controls['proy_Id'].setErrors({ 'required': true });
        }
        return;
    }

    const formattedFechaInicio = new Date().toLocaleDateString();
    const formattedFechaFinal = new Date().toLocaleDateString();
    this.loading = true;

    const proyecto = this.reportForm.value.proy_Id;
    const proyectoValue = proyecto?.value;
    console.log('Datos del proyecto:', proyectoValue);
    if (!proyectoValue) {
        return;
    }

    this.reporte.GetReporteComparacionMonetaria(proyectoValue).subscribe(
        (data: ReporteComparacionMonetaria[]) => {
            this.loading = false;
            this.submitted = false;
            console.log('Datos recibidos del proyecto:', data);

            if (!data || data.length === 0) {
              this.messageService.add({severity: 'warn', summary: 'Advertencia',detail: 'No se encontraron datos para el reporte.',styleClass: 'iziToast-custom',});
              return;
            }

            const doc = new jsPDF('landscape');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = { top: 60, left: 10, right: 10, bottom: 60 };
            let yOffset = margin.top;

            const addTable = (tableData: any[], headers: string[], isLastTable: boolean = false) => {
                if (tableData.length === 0) return;

                const rowHeight = 10;
                const tableHeight = tableData.length * rowHeight + 20;

                if (yOffset + tableHeight > pageHeight - margin.bottom) {
                    doc.addPage();
                    yOffset = margin.top;
                }

                console.log('Adding table at yOffset:', yOffset); // Debugging line

                autoTable(doc, {
                    startY: yOffset,
                    head: [headers],
                    body: tableData,
                    theme: 'striped',
                    styles: {
                        halign: 'center',
                        font: 'helvetica',
                        lineWidth: 0.1,
                        cellPadding: 1.5,
                        fontSize: 11,
                    },
                    headStyles: {
                        fillColor: [255, 237, 58],
                        textColor: [0, 0, 0],
                        fontSize: 8,
                        fontStyle: 'bold',
                        halign: 'center',
                    },
                    bodyStyles: {
                        textColor: [0, 0, 0],
                        fontSize: 7,
                        halign: 'center',
                    },
                    alternateRowStyles: {
                        fillColor: [240, 240, 240],
                    },
                    margin: margin,
                    didDrawPage: (data) => {
                        this.addHeader(doc, formattedFechaInicio, formattedFechaFinal, margin);
                        this.addFooter(doc, data.pageNumber, doc);
                    },
                    tableWidth: pageWidth - margin.left - margin.right,
                    pageBreak: 'auto'
                });

                yOffset += tableHeight + 20;
            };

            // **Combined Table for Project and Budget**
            const projectBudgetData = data.map(item => [
                item.total_Cantidad_Proyecto || '',
                item.total_ManoObra_Proyecto || '',
                item.total_CostoMateriales_Proyecto || '',
                item.total_Subtotal_Proyecto || '',
                item.total_Cantidad_Presupuesto || '',
                item.total_ManoObra_Presupuesto || '',
                item.total_CostoMateriales_Presupuesto || '',
                item.total_PrecioMaquinaria_Presupuesto || '',
                item.total_Ganancia_Presupuesto || '',
                item.total_Pagos_Proyecto || '',
                item.total_Global_Proyecto || '',
                item.total_Global_Presupuesto || ''
            ]).filter(row => row.some(cell => cell)); // Filter out empty rows

            // Add the combined project and budget table
            console.log('Datos del Proyecto y Presupuesto:', projectBudgetData);
            addTable(
                projectBudgetData,
                ['Cantidad Proyecto', 'Mano de Obra Proyecto', 'Costo Materiales Proyecto', 'Subtotal Proyecto',
                 'Cantidad Presupuesto', 'Mano de Obra Presupuesto', 'Costo Materiales Presupuesto', 'Precio Maquinaria Presupuesto',
                 'Ganancia Presupuesto', 'Pagos Proyecto', 'Total Global Proyecto', 'Total Global Presupuesto']
            );

            const etapasData = [];
            let currentEtapa = null;
            
            data.forEach(item => {
              // Asegúrate de que la etapa sea válida para comparación
              const etapaActual = item.etapa_comparativo ? item.etapa_comparativo.trim().toLowerCase() : null;
            
              // Verifica si la etapa es un guion o vacía, en ese caso la ignoramos pero continuamos con las actividades
              if (etapaActual !== '-' && etapaActual !== (currentEtapa ? currentEtapa.trim().toLowerCase() : null)) {
                // Nueva etapa, la agregamos como encabezado solo si no es un guion
                currentEtapa = item.etapa_comparativo;
                if (currentEtapa && currentEtapa !== '-') {
                  const etapaRow = [
                    'Etapa - ' + currentEtapa || 'Sin Etapa',    // Descripción de la etapa
                    item.etapa_TotalCantidad_comparativo || '0.00', // Cantidad total
                    item.etapa_TotalManoObra_comparativo || '0.00', // Mano de obra total
                    item.unidadmedida_comparativo || 'N/A', // Unidad de medida
                    item.etapa_TotalMateriales_comparativo || '0.00', // Materiales total
                    item.precioUnitario_comparativo || 'N/A', // Precio unitario
                    item.etapa_TotalSubtotal_comparativo || '0.00'   // Subtotal total
                  ];
                  etapasData.push(etapaRow); // Agrega la fila de la etapa
                }
              }
              const actividadRow = [
               (item.actividad_comparacion || 'Sin actividad'), // Descripción de la actividad
                item.cantidad_comparativo || '0.00', // Cantidad usada en actividad
                item.manoObraUsada_comparativo || '0.00', // Mano de obra usada en actividad
                item.unidadmedida_comparativo || 'N/A', // Unidad de medida
                item.costoMateriales_comparativo || '0.00', // Costo de materiales
                item.precioUnitario_comparativo || '0.00', // Precio unitario
                item.subtotal_comparativo || '0.00' // Subtotal de la actividad
              ];
            
              etapasData.push(actividadRow); // Agrega la fila de la actividad
            });
            
            console.log('Datos de Etapas y Actividades:', etapasData);
            
            // Solo agrega la tabla de etapas y actividades si hay datos
            if (etapasData.length > 0) {
              addTable(etapasData, [
                'Descripción Etapa / Actividad', 'Cantidad', 'Mano de Obra', 'Unidad', 'Costo Materiales', 'Precio Unitario', 'Subtotal'
              ], true);
            }
            
            
            
this.openPdfInDiv(doc);

        },
        error => {
            this.loading = false;
            this.messageService.add({
                severity: 'error',
                summary: 'Error en la Solicitud',
                detail: 'Hubo un problema al generar el reporte.',
                styleClass: 'iziToast-custom',
            });
        }
    );
}

























  private addHeader(doc: jsPDF, fechaInicio: string, fechaFinal: string, margin: any) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const logoUrl = '/assets/demo/images/disenoactualizado.png';
  
    // Ajuste para header en landscape
    doc.addImage(logoUrl, 'PNG', 0, -18, 297, 50); // Ancho ajustado para landscape
    doc.setFontSize(25);
    doc.setTextColor(0, 0, 0);
    doc.text('Reporte Comparación Monetaria', doc.internal.pageSize.width / 2, 50, { align: 'center' });
  
    // Fecha y nombre del generador en la parte superior derecha
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`Fecha de emisión: ${date} ${time}`, doc.internal.pageSize.width - 10, 10, { align: 'right' });
  
    doc.setFontSize(9);
    doc.text(`Generado por: ${this.Usuario}`, doc.internal.pageSize.width - 10, 20, { align: 'right' });
  
    // Agregar total del proyecto en el encabezado
    // doc.setFontSize(10);
    // doc.setTextColor(0, 0, 0);
    // doc.text(`Total Proyecto: LPS ${totalProyecto.toFixed(2)}`, margin.left, 40);
  }
  
  
  private addFooter(doc: jsPDF, pageNumber: number, docInstance: jsPDF) {
    const footerLogo = '/assets/demo/images/disenoactualizado.png';
    const pageHeight = docInstance.internal.pageSize.height;

    docInstance.addImage(footerLogo, 'PNG', 0, pageHeight - 20, 297, 60);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    docInstance.text(`Página ${pageNumber}`, doc.internal.pageSize.width / 2, pageHeight - 10, { align: 'center' });
  }

  private openPdfInDiv(doc: jsPDF) {
    const string = doc.output('datauristring');
    const iframe = `<iframe width='100%' height='100%' style='border:none;' src='${string}'></iframe>`;
    const pdfContainer = document.getElementById('pdfContainer');
    if (pdfContainer) {
        pdfContainer.innerHTML = iframe;
    } else {
        console.error('PDF container not found');
    }
}

}
