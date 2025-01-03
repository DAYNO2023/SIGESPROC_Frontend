import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { reporteService } from 'src/app/demo/services/servicesreporte/reporteterrenofechacreacion.service';
import { YService } from '../Impresion/impresion.service';
import { ddlempresa } from 'src/app/demo/models/ModelReporte/ReporteViewModel';
import { MessageService } from 'primeng/api'; // Import MessageService
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
export class  EstadisticasFletes_Llegada{
  encargadoLlegada?: string;
  supervisorSalidaLlegada?: string;
  supervisorLlegadaLlegada?: string;
  fechaHoraSalidaLlegada?: string;
  fechaHoraLlegadaLlegada?: string;
  fechaHoraEstablecidaDeLlegada?: string;
  diferenciaenHorasLlegada?: string;
  estadoLlegadaLlegada?: string;
  salidaProyectoLlegada?: string;
  destinoProyectoLlegada?: string;
  estadoLlegada?: string;
}

@Component({
  selector: 'app-reporte-terreno-fecha-creacion',
  templateUrl: './EstadisticasFletes_Llegada.component.html',
  styleUrls: ['./EstadisticasFletes_Llegada.component.scss'],
  providers: [MessageService] 
})
export class EstadisticasFletes_LlegadaComponent implements OnInit {
  reportForm: FormGroup;
  pdfSrc: SafeResourceUrl | null = null;
  loading: boolean = false;
  submitted: boolean = false;
  Usuario : string = (this.cookieService.get('usua_Usuario'));
  empresas: ddlempresa[] = [];
  filteredEmpresas: ddlempresa[] = [];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService, 
    private reporte: reporteService,
    public cookieService: CookieService,
    private router: Router,
    private yService: YService
  ) {
    this.reportForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFinal: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const token = this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
  }
  disableManualInput(element: HTMLInputElement) {
    element.addEventListener('keydown', (event: KeyboardEvent) => {
      event.preventDefault();
    });

    element.addEventListener('keypress', (event: KeyboardEvent) => {
      event.preventDefault();
    });

    element.addEventListener('paste', (event: ClipboardEvent) => {
      event.preventDefault();
    });
  }
  generateReport() {
    this.submitted = true;
    if (this.reportForm.invalid) {
      return;
    }
  
    const fechaInicio = new Date(this.reportForm.value.fechaInicio);
    const fechaFinal = new Date(this.reportForm.value.fechaFinal);
  
    if (fechaFinal < fechaInicio) {
      this.messageService.add({severity: 'warn', summary: 'Advertencia', detail: 'La fecha final no puede ser anterior a la fecha de inicio.'});
      this.loading = false;
      this.submitted = false;
      return;
    }
  
    if (!fechaInicio || !fechaFinal) {
      console.error('Fechas no válidas');
      return;
    }
  
    this.loading = true;
  
    const formattedFechaInicio = fechaInicio.toISOString();
    const formattedFechaFinal = fechaFinal.toISOString();
  
    this.reporte.GetEstadisticasFletes_Llegada(formattedFechaInicio, formattedFechaFinal).subscribe(
      (data: EstadisticasFletes_Llegada[]) => {
        this.loading = false;
        this.submitted = false;
  
        const filteredData = data.filter(item => 
          item.encargadoLlegada &&
          item.supervisorSalidaLlegada &&
          item.supervisorLlegadaLlegada &&
          item.fechaHoraSalidaLlegada &&
          item.fechaHoraLlegadaLlegada &&
          item.fechaHoraEstablecidaDeLlegada &&
          item.diferenciaenHorasLlegada &&
          item.estadoLlegadaLlegada &&
          item.salidaProyectoLlegada &&
          item.destinoProyectoLlegada
        );
  
        if (filteredData.length === 0) {
          this.messageService.add({severity: 'warn', summary: 'Advertencia', detail: 'No hay datos válidos para mostrar.',styleClass: 'iziToast-custom',});
          return;
        }
  
        // Generar PDF
        const doc = new jsPDF('landscape');
        const pageWidth = doc.internal.pageSize.getWidth(); 
        const margin = { top: 55, left: 10, right: 10, bottom: 40 };
        const rowsPerPage = 15;
        let yOffset = 60;
        let currentPage = 1;
  
        const addTable = (startRow, endRow) => {
          autoTable(doc, {
            startY: yOffset,
            head: [['No', 'Encargado', 'Supervisor Salida', 'Supervisor Llegada', 'Fecha y Hora de Salida', 'Fecha y Hora de Llegada', 'Fecha y Hora Establecida', 'Diferencia en Horas', 'Estado Llegada', 'Salida Proyecto', 'Destino Proyecto']],
            body: filteredData.slice(startRow, endRow).map((item, index) => [
              startRow + index + 1, // Número de fila
              item.encargadoLlegada || '',
              item.supervisorSalidaLlegada || '',
              item.supervisorLlegadaLlegada || '',
              item.fechaHoraSalidaLlegada || '',
              item.fechaHoraLlegadaLlegada || '',
              item.fechaHoraEstablecidaDeLlegada || '',
              item.diferenciaenHorasLlegada || '',
              item.estadoLlegadaLlegada || '',
              item.salidaProyectoLlegada || '',
              item.destinoProyectoLlegada || '',
            ]),
            theme: 'striped',
            styles: {
              halign: 'center',
              font: 'helvetica',
              lineWidth: 0.1,
              cellPadding: 2,
              fontSize: 10,
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
              fontSize: 6.5,
              halign: 'center',
            },
            alternateRowStyles: {
              fillColor: [240, 240, 240],
            },
            margin: margin,
            tableWidth: pageWidth - margin.left - margin.right,
            didDrawPage: (data) => {
              this.addHeader(doc, formattedFechaInicio, formattedFechaFinal, margin);
              this.addFooter(doc, currentPage, doc);
            },
          });
  
          currentPage++;
  
          if (endRow < filteredData.length) {
            doc.addPage();
            yOffset = margin.top;
            addTable(endRow, endRow + rowsPerPage);
          }
        };
  
        addTable(0, rowsPerPage);
  
        this.openPdfInDiv(doc);
      },
      error => {
        this.loading = false;
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error en la solicitud de datos.',styleClass: 'iziToast-custom',});
        console.error('Error en la solicitud', error);
      }
    );
  }
  
  private addFooter(doc: jsPDF, pageNumber: number, docInstance: jsPDF) {
    const footerLogo = '/assets/demo/images/disenoactualizado.png';
    const pageHeight = docInstance.internal.pageSize.height;
  
    docInstance.addImage(footerLogo, 'PNG', 0, pageHeight - 20, 297, 60); // Ajuste para landscape
    docInstance.setFontSize(12);
    docInstance.setTextColor(0, 0, 0);
    docInstance.text(`Página ${pageNumber}`, doc.internal.pageSize.width / 2, pageHeight - 10, { align: 'center' });
  }
  
  private addHeader(doc: jsPDF, fechaInicio: string, fechaFinal: string, margin: any) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const logoUrl = '/assets/demo/images/disenoactualizado.png';
  
    doc.addImage(logoUrl, 'PNG', 0, -18, 297, 50); // Ajuste para landscape
    doc.setFontSize(25);
    doc.setTextColor(0, 0, 0);
    doc.text('Reporte de Fletes', doc.internal.pageSize.width / 2, 50, { align: 'center' });
  
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`Fecha de emisión: ${date} ${time}`, doc.internal.pageSize.width - 10, 10, { align: 'right' });
  
    doc.setFontSize(9);
    doc.text(`Generado por: ${this.Usuario}`, doc.internal.pageSize.width - 10, 20, { align: 'right' });
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
