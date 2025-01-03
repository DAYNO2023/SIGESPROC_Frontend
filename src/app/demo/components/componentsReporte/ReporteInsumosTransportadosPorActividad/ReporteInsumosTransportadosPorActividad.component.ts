import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { reporteService } from 'src/app/demo/services/servicesreporte/reporteterrenofechacreacion.service';
import { YService } from '../Impresion/impresion.service';
import { ddlempresa } from 'src/app/demo/models/ModelReporte/ReporteViewModel';
import { MessageService } from 'primeng/api'; // Import MessageService
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
export class  ReporteInsumosTransportadosPorActividad{
  codigo_flete?: string;
  flde_Cantidad?: string;
  insumosFletesporActividad?: string;
  actividad_Descripcion?: string;
  proveedor_Descripcion?: string;
  flete_Observacion?: string;
  materiales_Descripcion?: string;
  equipos_Nombre?: string;
  unme_Nombre?: string;
  bodega_Descripcion?: string;
  flete_Stock?: string;
  fechaCreacion_flete?: string;
  fechaModificacion_flete?: string;
}

@Component({
  selector: 'app-reporte-terreno-fecha-creacion',
  templateUrl: './ReporteInsumosTransportadosPorActividad.component.html',
  styleUrls: ['./ReporteInsumosTransportadosPorActividad.component.scss'],
  providers: [MessageService] 
})
export class ReporteInsumosTransportadosPorActividadComponent implements OnInit {
  reportForm: FormGroup;
  pdfSrc: SafeResourceUrl | null = null;
  loading: boolean = false;
  Usuario : string = (this.cookieService.get('usua_Usuario'));
  submitted: boolean = false;
  empresas: ddlempresa[] = [];
  proyecto: ddlempresa[] = [];
  noOptionFound: boolean = false;
  campoRequerido: boolean = false;
  filteredEmpresas: ddlempresa[] = [];
  filteredProyecto: ddlempresa[] = [];
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
      fechaFinal: ['', Validators.required],
      actividadId: ['']
    });
  }

  ngOnInit(): void {
    const token = this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
    this.reporte.ListarActividad().subscribe(data => {
      this.empresas = data;
      console.log('Empresas:', this.empresas);

    });
    this.reporte.ListarProyecto().subscribe(data => {
      this.proyecto = data;
      console.log('Empresas:', this.proyecto);

    });
  }
  filterflete(event: any) {
    const query = event.query.toLowerCase();
    this.filteredEmpresas = this.empresas.filter(flete =>
      flete.text?.toLowerCase().includes(query)
    );
    console.log('Filtered Empresas:', this.filteredEmpresas);

    this.noOptionFound = this.filteredEmpresas.length === 0;
  }
  filterProyecto(event: any) {
    const query = event.query.toLowerCase();
    this.filteredProyecto = this.proyecto.filter(flete =>
      flete.text?.toLowerCase().includes(query)
    );
    console.log('Filtered Empresas:', this.filteredProyecto);

    this.noOptionFound = this.filteredProyecto.length === 0;
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
    if (this.noOptionFound) {
      return; 
    }
    const fechaInicio = new Date(this.reportForm.value.fechaInicio);
    const fechaFinal = new Date(this.reportForm.value.fechaFinal);
  
    // Validate if the end date is before the start date
    if (fechaFinal < fechaInicio) {
      this.messageService.add({severity: 'warn', summary: 'Advertencia', detail: 'La fecha final no puede ser anterior a la fecha de inicio.',styleClass: 'iziToast-custom',});
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
    const flete = this.reportForm.value.actividadId;
    const flen_Id = flete?.value ? flete.value : 0;
  
    this.reporte.GetReporteInsumosTransportadosPorActividad(formattedFechaInicio, formattedFechaFinal,flen_Id).subscribe(
      (data: ReporteInsumosTransportadosPorActividad[]) => {
        this.loading = false;
        this.submitted = false;
  
        // Filter out any rows with empty or undefined fields
        const filteredData = data.filter(item => 
          item.codigo_flete &&
          item.flde_Cantidad &&
          item.insumosFletesporActividad &&
          item.actividad_Descripcion &&
          item.proveedor_Descripcion &&
          item.materiales_Descripcion &&
          item.unme_Nombre &&
          item.flete_Stock 
        );
  
        if (filteredData.length === 0) {
          this.messageService.add({severity: 'warn', summary: 'Advertencia', detail: 'No hay datos válidos para mostrar.',styleClass: 'iziToast-custom',});
          return;
        }
  
        const doc = new jsPDF('landscape');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = { top: 55, left: 10, right: 10, bottom: 40 };
        const rowsPerPage = 10;
        let yOffset = 60;
        let currentPage = 0;
  
        const addTable = (startRow, endRow) => {
          autoTable(doc, {
            startY: yOffset,
            head: [['No', 'Cantidad', 'Insumos por Actividad', 'Descripción Actividad', 'Descripción Proveedor', 'Descripción Materiales','Unidad Medida', 'Stock']],
            body: filteredData.slice(startRow, endRow).map((item, index) => [
              index + 1,
              item.flde_Cantidad || '',
              item.insumosFletesporActividad || '',
              item.actividad_Descripcion || '',
              item.proveedor_Descripcion || '',
              item.materiales_Descripcion || '',
              item.unme_Nombre || '',
              item.flete_Stock || '',
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
              this.addFooter(doc, data.pageNumber, doc);
            },
            didDrawCell: (data) => {
              if (data.column.index === 0 && data.row.index === filteredData.length - 1) {
                yOffset = data.table.finalY + 10;
              }
            }
          });
  
          if (endRow < filteredData.length) {
            currentPage++;
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

  private addFooter(doc: jsPDF, pageNumber: number, docInstance: jsPDF) {
    const footerLogo = '/assets/demo/images/disenoactualizado.png';
    const pageHeight = docInstance.internal.pageSize.height;

    docInstance.addImage(footerLogo, 'PNG', 0, pageHeight - 20, 297, 50); // Ajuste para landscape

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
