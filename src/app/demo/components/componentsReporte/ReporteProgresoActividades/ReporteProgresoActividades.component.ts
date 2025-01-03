import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { reporteService } from 'src/app/demo/services/servicesreporte/reporteterrenofechacreacion.service';
import { YService } from '../Impresion/impresion.service';
import { MessageService } from 'primeng/api';
import { fechaIncidenciaValida } from '../../componentsflete/Fletes/fechavalidacion';
import autoTable from 'jspdf-autotable';
import { invalid } from 'moment';
import { DDL } from 'src/app/demo/models/ModelReporte/ReporteViewModel';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export class  ReporteProgresoActividades{
  etapaDescripcion?: string;
  actividadDescripcion?: string;
  descripcionControlDeCalidad?: string;
  porcentajeControlDeCalidad?:string;
  porcentajeTotalActividad?: string;
  porcentajeFaltanteActividad?: string;
}



@Component({
  selector: 'app-reporte-terreno-fecha-creacion',
  templateUrl: './ReporteProgresoActividades.component.html',
  styleUrls: ['./ReporteProgresoActividades.component.scss'],
  providers: [MessageService]
})
export class ReporteProgresoActividadesComponent implements OnInit {
  reportForm: FormGroup;
  pdfSrc: SafeResourceUrl | null = null;
  loading: boolean = false;
  Usuario : string = (this.cookieService.get('usua_Usuario'));
  submitted: boolean = false;
  Proyectos: DDL[] = [];
  filteredEmpresa: DDL[] = [];

  constructor(
    private fb: FormBuilder,
    private reporte: reporteService,
    private yService: YService,
    public cookieService: CookieService,
    private router: Router,
    private messageService: MessageService,
    public globalMoneda: globalmonedaService
  ) {
    this.reportForm = this.fb.group({
      fechainicio: ['', Validators.required],  
      fechafin: ['', Validators.required], 
      proy_id: ['',Validators.required]
    });
  }
  

  ngOnInit(): void {
    console.log(this.globalMoneda.getState(), 'this.globalMoneda.getState()');
    

    if (!this.globalMoneda.getState()) {
      console.log('hola');
      this.globalMoneda.setState()
    }
    this.reporte.ListarProyecto().subscribe(data => {
      this.Proyectos = data;
      console.log('Empresas:', this.Proyectos);
  });
  const token = this.cookieService.get('Token');
  if(token == 'false'){
    this.router.navigate(['/auth/login'])
  }
}
filterEmpresa(event: any) {
  const query = event.query.toLowerCase();
  console.log('Query:', query);
  this.filteredEmpresa = this.Proyectos.filter(empresa =>
      empresa.text?.toLowerCase().includes(query)
  );
  console.log('Filtered Empresas:', this.filteredEmpresa);

  const selectedProyecto = this.reportForm.value.proy_id;
  if (selectedProyecto && !this.filteredEmpresa.find(e => e.value === selectedProyecto.value)) {
      this.reportForm.controls['proy_id'].setErrors({ 'invalidOption': true });
  } else {
      this.reportForm.controls['proy_id'].setErrors(null);
  }
}

generateReport() {
  this.submitted = true;

  if (this.reportForm.invalid) {
      if (!this.reportForm.controls['proy_id'].value) {
          this.reportForm.controls['proy_id'].setErrors({ 'required': true });
      }
      return;
  }

  const formattedFechaInicio = new Date().toLocaleDateString();
  const formattedFechaFinal = new Date().toLocaleDateString();
  this.loading = true;

  const proyecto = this.reportForm.value.proy_id;
  const fechainicio = this.reportForm.value.fechainicio.toISOString();
  const fechafin = this.reportForm.value.fechafin.toISOString();
  const proyectoValue = proyecto?.value;
  const proyectoNombre = proyecto?.text || 'Desconocido';

  this.reporte.GetReporteProgresoActividades(proyectoValue, fechainicio, fechafin).subscribe(
      (data: ReporteProgresoActividades[]) => {
          this.loading = false;
          this.submitted = false;

          if (!data || data.length === 0) {
              this.messageService.add({
                  severity: 'warn',
                  summary: 'Advertencia',
                  detail: 'No se encontraron datos para el reporte.',
                  styleClass: 'iziToast-custom',
              });
              return;
          }

          const doc = new jsPDF('landscape');
          const pageWidth = doc.internal.pageSize.getWidth();
          const margin = { top: 60, left: 10, right: 10, bottom: 60 };
          let yOffset = margin.top;
          const rowsPerPage = 5;  // Limitar a 5 registros por página
          let currentRow = 0;

          const primaryData = [];
          let rowIndex = 1; // Contador para el número de fila

          data.forEach(item => {
              // Agrega la fila de Etapa y Actividad
              primaryData.push([
                  rowIndex++, // Número de fila
                  `Etapa: ${item.etapaDescripcion || 'Sin etapa'}`,
                  `Actividad: ${item.actividadDescripcion || 'Sin actividad'}`,
                  '-', '-', '-'
              ]);

              // Agrega subencabezado para controles de calidad
              primaryData.push([
                  '', // Espacio para el número de fila
                  'Control de Calidad', 
                  'Porcentaje-Control-de-Calidad', 
                  'Progreso-de-Actividad', 
                  'Porcentaje Faltante'
              ]);

              // Agrega las filas de los controles de calidad con el símbolo %
              primaryData.push([
                  '', // Espacio para el número de fila
                  item.descripcionControlDeCalidad || 'Sin control de calidad',
                  `${item.porcentajeControlDeCalidad || 0}%`,
                  `${item.porcentajeTotalActividad || 0}%`,
                  `${item.porcentajeFaltanteActividad || 0}%`
              ]);

              // Incrementar el contador de filas
              currentRow += 3;

              // Si alcanzamos el límite de 5 filas, agregar una nueva página
              if (currentRow >= rowsPerPage) {
                  this.addTableToPage(doc, primaryData, yOffset, margin, pageWidth, formattedFechaInicio, formattedFechaFinal, proyectoNombre);
                  primaryData.length = 0;  // Limpiar los datos de la página actual
                  currentRow = 0;  // Restablecer el contador de filas

                  // Solo agregar una nueva página si hay más datos para mostrar
                  if (item !== data[data.length - 1]) {
                      doc.addPage();  // Nueva página
                      yOffset = margin.top;  // Restablecer el desplazamiento Y para la nueva página
                  }
              }
          });

          // Renderizar cualquier dato restante
          if (primaryData.length > 0) {
              this.addTableToPage(doc, primaryData, yOffset, margin, pageWidth, formattedFechaInicio, formattedFechaFinal, proyectoNombre);
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



addTableToPage(doc, primaryData, yOffset, margin, pageWidth, formattedFechaInicio, formattedFechaFinal, proyectoNombre) {
  autoTable(doc, {
      startY: yOffset,
      head: [['Etapa', 'Actividad', '-', '-', '']],
      body: primaryData,
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
          halign: 'left',
      },
      alternateRowStyles: {
          fillColor: [240, 240, 240],
      },
      margin: margin,
      tableWidth: pageWidth - margin.left - margin.right,
      columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
          // Verificar si la fila es una descripción de Etapa y Actividad
          if (data.row.index % 3 === 0) { // Fila de descripción y actividad
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.textColor = [0, 0, 0]; // Texto negro
          }
      },
      didDrawPage: (data) => {
          this.addHeader(doc, formattedFechaInicio, formattedFechaFinal, margin, proyectoNombre);
          this.addFooter(doc, data.pageNumber, doc);
      }
  });
}






private addHeader(doc: jsPDF, fechaInicio: string, fechaFinal: string, margin: any, proyectoNombre: string) {
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();
  const logoUrl = '/assets/demo/images/disenoactualizado.png';

  // Ajuste para header en landscape
  doc.addImage(logoUrl, 'PNG', 0, -18, 297, 50); // Ancho ajustado para landscape
  doc.setFontSize(25);
  doc.setTextColor(0, 0, 0);
  doc.text('Reporte Progreso de Actividades', doc.internal.pageSize.width / 2, 50, { align: 'center' });

  // Fecha y nombre del generador en la parte superior derecha
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Fecha de emisión: ${date} ${time}`, doc.internal.pageSize.width - 10, 10, { align: 'right' });

  doc.setFontSize(9);
  doc.text(`Generado por: ${this.Usuario}`, doc.internal.pageSize.width - 10, 20, { align: 'right' });

  // Agregar nombre del proyecto en el encabezado
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Proyecto: ${proyectoNombre}`, margin.left, 40);
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
    const iframe = `<iframe width='100%' height='800px' src='${string}'></iframe>`;
    const pdfContainer = document.getElementById('pdfContainer');
    if (pdfContainer) {
      pdfContainer.innerHTML = iframe;
    } else {
      console.error('PDF container not found');
    }
  }
}
