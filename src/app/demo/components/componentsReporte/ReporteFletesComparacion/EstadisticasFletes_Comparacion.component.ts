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
export class  EstadisticasFletes_Comparacion{
  encargadoComparacion?: string;
  supervisorComparacion?: string;
  supervisorllegadoComparacion?: string;
  fechasalidaComparacion?: string;
  fechaestablecidaComparacion?: string;
  fechallegadaComparacion?: string;
  estadoComparacion?: string;
  horasDiferenciaComparacion?: string;


  totalFletesProgramadosComparacion?: string;
  totalFletesLlegadosComparacion?: string;
  diferenciaFletesComparacion?: string;
  porcentajeLlegadosComparacion?: string;
  
  salida_CantidadComparacion?: string;
  llegada_CantidadComparacion?: string;
  insumo_SalidaComparacion?: string;
  insumo_LlegadaComparacion?: string;
}

@Component({
  selector: 'app-reporte-terreno-fecha-creacion',
  templateUrl: './EstadisticasFletes_Comparacion.component.html',
  styleUrls: ['./EstadisticasFletes_Comparacion.component.scss'],
  providers: [MessageService] 
})
export class EstadisticasFletes_ComparacionComponent implements OnInit {
  reportForm: FormGroup;
  pdfSrc: SafeResourceUrl | null = null;
  loading: boolean = false;
  submitted: boolean = false;
  Usuario : string = (this.cookieService.get('usua_Usuario'));
  empresas: ddlempresa[] = [];
  noOptionFound: boolean = false;
  campoRequerido: boolean = false;
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
      flen_Id : ['',Validators.required]
    });
  }

  ngOnInit(): void {
    this.reporte.Listarflete().subscribe(data => {
      this.empresas = data;
      console.log('Empresas:', this.empresas);

    });
    const token = this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
  }
  filterflete(event: any) {
    const query = event.query.toLowerCase();
    this.filteredEmpresas = this.empresas.filter(flete =>
      flete.text?.toLowerCase().includes(query)
    );
    console.log('Filtered Empresas:', this.filteredEmpresas);

    this.noOptionFound = this.filteredEmpresas.length === 0;
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
    this.campoRequerido = this.reportForm.controls['flen_Id'].invalid;
  
    if (this.campoRequerido || this.noOptionFound) {
      return; 
    }
  
    const formattedFechaInicio = new Date().toLocaleDateString();
    const formattedFechaFinal = new Date().toLocaleTimeString();
  
    this.loading = true;
  
    const flete = this.reportForm.value.flen_Id;
    if (flete && this.filteredEmpresas.every(emp => emp.value !== flete.value)) {
      this.noOptionFound = true;
      this.loading = false; 
      this.submitted = false;
      return;
    }
    const flen_Id = flete?.value;
  
    console.log('Proyecto ID:', flen_Id);
    if (flete && flete.text) {
      this.reporte.GetEstadisticasFletes_Comparacion(flete.value).subscribe(
        (data: EstadisticasFletes_Comparacion[]) => {
          this.loading = false;
          this.submitted = false;
  
          const filteredData = data.filter(item => 
            item.encargadoComparacion !== undefined &&
            item.supervisorComparacion !== undefined &&
            item.supervisorllegadoComparacion !== undefined &&
            item.fechasalidaComparacion !== undefined &&
            item.fechaestablecidaComparacion !== undefined &&
            item.fechallegadaComparacion !== undefined &&
            item.salida_CantidadComparacion !== undefined &&
            item.llegada_CantidadComparacion !== undefined &&
            item.insumo_SalidaComparacion !== undefined &&
            item.insumo_LlegadaComparacion !== undefined &&
            item.totalFletesProgramadosComparacion !== undefined &&
            item.totalFletesLlegadosComparacion !== undefined &&
            item.diferenciaFletesComparacion !== undefined &&
            item.porcentajeLlegadosComparacion !== undefined
          );
  
          if (filteredData.length === 0) {
            this.messageService.add({
              severity: 'warn', 
              summary: 'Advertencia', 
              detail: 'No se encontraron datos para el reporte.', 
              styleClass: 'iziToast-custom',
            });
            return;
          }
  
          // Generar PDF
          const doc = new jsPDF('landscape');
          const pageWidth = doc.internal.pageSize.getWidth(); 
          const margin = { top: 55, left: 10, right: 10, bottom: 40 };
          const rowsPerPage = 50; // Ajusta el número de filas por página
          let yOffset = 60;
          let currentPage = 1;
  
          const addTable = (startRow, endRow) => {
            autoTable(doc, {
              startY: yOffset,
              head: [['No', 'Encargado', 'Supervisor', 'Supervisor Llegada', 'Fecha Salida', 'Fecha Establecida', 'Fecha Llegada', 'Salida Cantidad', 'Llegada Cantidad', 'Insumo Salida', 'Insumo Llegada', 'Diferencia(Cantidad)']],
              body: filteredData.slice(startRow, endRow).map((item, index) => [
                index + 1 + (currentPage - 1) * rowsPerPage, // No. para las filas
                item.encargadoComparacion || '',
                item.supervisorComparacion || '',
                item.supervisorllegadoComparacion || '',
                item.fechasalidaComparacion || '',
                item.fechaestablecidaComparacion || '',
                item.fechallegadaComparacion || '',
                item.salida_CantidadComparacion || '',
                item.llegada_CantidadComparacion || '',
                item.insumo_SalidaComparacion || '',
                item.insumo_LlegadaComparacion || '',
                item.horasDiferenciaComparacion
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
                this.addFooter(doc, currentPage, filteredData, doc);
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
          this.messageService.add({
            severity: 'error', 
            summary: 'Error', 
            detail: 'Error en la solicitud de datos.', 
            styleClass: 'iziToast-custom',
          });
          console.error('Error en la solicitud', error);
        }
      );
    };
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
  
  private addFooter(doc: jsPDF, pageNumber: number, filteredData: EstadisticasFletes_Comparacion[], docInstance: jsPDF) {
    const footerLogo = '/assets/demo/images/disenoactualizado.png';
    const pageHeight = docInstance.internal.pageSize.height;
    
    // Obtener los datos de la primera página
    const data = filteredData[0] || {};
    
    docInstance.addImage(footerLogo, 'PNG', 0, pageHeight - 20, 297, 60); // Ajuste para landscape
    docInstance.setFontSize(10);
    docInstance.setTextColor(0, 0, 0);
  
    // Establecer la posición de los campos en el mismo lado, un poco más arriba
    const leftMargin = 10;
    const textVerticalSpacing = 5; // Espaciado vertical entre líneas
    let yPosition = pageHeight - 35; // Inicio de la posición Y, ajustado más arriba
  
    // docInstance.text(`Total Fletes Programados: ${data.totalFletesProgramadosComparacion || ''}`, leftMargin, yPosition);
    // yPosition += textVerticalSpacing;
    // docInstance.text(`Total Fletes Llegados: ${data.totalFletesLlegadosComparacion || ''}`, leftMargin, yPosition);
    // yPosition += textVerticalSpacing;
    // docInstance.text(`Diferencia Fletes: ${data.diferenciaFletesComparacion || ''}`, leftMargin, yPosition);
    // yPosition += textVerticalSpacing;
    // docInstance.text(`Porcentaje Llegados: ${data.porcentajeLlegadosComparacion || ''}%`, leftMargin, yPosition);
  

  
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
