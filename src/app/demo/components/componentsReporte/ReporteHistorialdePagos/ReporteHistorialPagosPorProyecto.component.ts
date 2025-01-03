import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
const doc = new jsPDF('landscape');
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { reporteService } from 'src/app/demo/services/servicesreporte/reporteterrenofechacreacion.service';
import { YService } from '../Impresion/impresion.service';
import { Terreno } from 'src/app/demo/models/modelsbienraiz/terrenoviewmodel';
import { DDL, ddlempresa } from 'src/app/demo/models/ModelReporte/ReporteViewModel';
import { Estado } from 'src/app/demo/models/modelsgeneral/estadoviewmodel ';
import { MessageService } from 'primeng/api'; // Import MessageService
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
export class  ReporteHistorialPagosPorProyecto{
  proyectoplanilla?: string;
  empleadoplanilla?: string;
  numeroPlanilla?: string;
  fechaPagoplanilla?: string;
  sueldoBrutoplanilla?: string;
  totalDeduccionesplanilla?: string;
  totalPrestamosplanilla?: string;
  sueldoNetoplanilla?: string;
  prestamosDescripcionplanilla?: string;
  totalMontoPrestamosplanilla?: string;
  totalMontoAbonadoplanilla?: string;
  totalMontoEstimadoViaticoplanilla?: string;
  totalTotalGastadoViaticoplanilla?: string;
  totalMontoGastadoFacturaplanilla?: string;
}



@Component({
  selector: 'app-reporte-terreno-fecha-creacion',
  templateUrl: './ReporteHistorialPagosPorProyecto.component.html',
  styleUrls: ['./ReporteHistorialPagosPorProyecto.component.scss'],
  providers: [MessageService] 
})
export class ReporteHistorialPagosPorProyectoComponent implements OnInit {
  reportForm: FormGroup;
  pdfSrc: SafeResourceUrl | null = null;
  loading: boolean = false;
  submitted: boolean = false;
  Usuario : string = (this.cookieService.get('usua_Usuario'));
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
      proyectoId: ['',Validators.required]
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
  const selectedProyecto = this.reportForm.value.proyectoId;
  if (selectedProyecto && !this.filteredEmpresa.find(e => e.value === selectedProyecto.value)) {
    this.reportForm.controls['proyectoId'].setErrors({ 'invalidOption': true });
  } else {
    this.reportForm.controls['proyectoId'].setErrors(null);
  }
}

private addHeader(doc: jsPDF, fechaInicio: string, fechaFinal: string, margin: any, proyectoPlanilla: string) {
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();
  const logoUrl = '/assets/demo/images/disenoactualizado.png';


  doc.addImage(logoUrl, 'PNG', 0, -18, 297, 50); 
  doc.setFontSize(25);
  doc.setTextColor(0, 0, 0);
  doc.text('Reporte de Historial de Pagos', doc.internal.pageSize.width / 2, 50, { align: 'center' });

 
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Fecha de emisión: ${date} ${time}`, doc.internal.pageSize.width - 10, 10, { align: 'right' });

  doc.setFontSize(9);
    doc.text(`Generado por: ${this.Usuario}`, doc.internal.pageSize.width - 10, 20, { align: 'right' });

  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Proyecto: ${proyectoPlanilla}`,margin.left, 40);
}

generateReport() {
  this.submitted = true;

  if (this.reportForm.invalid) {
    Object.keys(this.reportForm.controls).forEach(field => {
      const control = this.reportForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
    return; 
  }

  const proyecto = this.reportForm.value.proyectoId;
  if (!proyecto || !this.Proyectos.find(e => e.value === proyecto.value)) {
    this.reportForm.controls['proyectoId'].setErrors({ 'invalidOption': true });
    return;
  }

  const formattedFechaInicio = new Date().toLocaleDateString();
  const formattedFechaFinal = new Date().toLocaleDateString();
  this.loading = true;

  const fechainicio = this.reportForm.value.fechainicio.toISOString();
  const fechafin = this.reportForm.value.fechafin.toISOString();
  const proyectoValue = proyecto?.value;
  const proyectoPlanilla = proyecto?.text || 'Desconocido';

  this.reporte.GetReporteHistorialPagosPorProyecto(fechainicio, fechafin, proyectoValue).subscribe(
    (data: ReporteHistorialPagosPorProyecto[]) => {
      this.loading = false;
      this.submitted = false;

      if (!data || data.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Sin Datos',
          detail: 'No se encontraron datos para el reporte.',
          styleClass: 'iziToast-custom',
        });
        return;
      }

      const doc = new jsPDF('landscape');
      // Reducimos los márgenes izquierdo y derecho para dar más espacio a la tabla
      const margin = { top: 60, left: 5, right: 5, bottom: 30 };
      const startY = 60;

      autoTable(doc, {
        startY: startY,
        head: [
          [{ content: 'Datos del Empleado', colSpan: 2 }, { content: 'Salarios', colSpan: 3 }, { content: 'Prestamos y Viáticos', colSpan: 5 }],
          ['No.', 'Empleado', 'Sueldo Bruto', 'Deducciones', 'Préstamo', 'Sueldo Neto', 'Descripción Préstamos', 'Monto Préstamos', 'Monto Abonado', 'Estimado Viáticos', 'Gastado Viáticos', 'Gastado Factura']
        ],
        body: data.map((item, index) => [
          index + 1,
          item.empleadoplanilla || '',
          item.sueldoBrutoplanilla || '',
          item.totalDeduccionesplanilla || '',
          item.totalPrestamosplanilla || '',
          item.sueldoNetoplanilla || '',
          item.prestamosDescripcionplanilla || '',
          item.totalMontoPrestamosplanilla || '',
          item.totalMontoAbonadoplanilla || '',
          item.totalMontoEstimadoViaticoplanilla || '',
          item.totalTotalGastadoViaticoplanilla || '',
          item.totalMontoGastadoFacturaplanilla || ''
        ]),
        theme: 'striped',
        styles: {
          halign: 'center',
          font: 'helvetica',
          lineWidth: 0.1,
          cellPadding: 1,
          fontSize: 7,
        },
        headStyles: {
          fillColor: [255, 237, 58],
          textColor: [0, 0, 0],
          fontSize: 7,
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
        tableWidth: 'auto', // Deja que la tabla ocupe todo el ancho posible
        columnStyles: {
          0: { cellWidth: 15 },  // Ajuste personalizado del ancho de columna
          1: { cellWidth: 30 },  // Ajustamos algunas columnas para hacerlas más amplias
          2: { cellWidth: 25 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 },
          5: { cellWidth: 30 },
          6: { cellWidth: 30 },
          7: { cellWidth: 30 },
          8: { cellWidth: 30 },
          9: { cellWidth: 30 },
          10: { cellWidth: 30 }
        },
        didDrawPage: (data) => {
          this.addHeader(doc, formattedFechaInicio, formattedFechaFinal, margin, proyectoPlanilla);
          this.addFooter(doc, data.pageNumber, doc);
        },
        pageBreak: 'auto',
      });

      this.openPdfInDiv(doc);
    },
    error => {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error en la Solicitud',
        detail: 'Ocurrió un error al generar el reporte. Intente nuevamente más tarde.',
        styleClass: 'iziToast-custom',
      });
      console.error('Error en la solicitud', error);
    }
  );
}






private addFooter(doc: jsPDF, pageNumber: number, docInstance: jsPDF) {
  const footerLogo = 'https://restaurantebucket.s3.us-east-2.amazonaws.com/disenoactualizado.png';
  const pageHeight = docInstance.internal.pageSize.height;

  // Ajustar footer para landscape
  docInstance.addImage(footerLogo, 'PNG', 0, pageHeight - 20, 297, 60); // Ancho ajustado para landscape

  // Número de página en la parte inferior central
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  docInstance.text(`Página ${pageNumber}`, doc.internal.pageSize.width / 2, pageHeight - 10, { align: 'center' });
}

private openPdfInDiv(doc: jsPDF) {
  const string = doc.output('datauristring');
  const iframe = `<iframe width='100%' height='1000px' src='${string}'></iframe>`;
  const pdfContainer = document.getElementById('pdfContainer');
  if (pdfContainer) {
    pdfContainer.innerHTML = iframe;
  } else {
    console.error('PDF container not found');
  }
}


}
