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
export class  ReportecomprasPendientesEnvio{
  noOrdencompraPendientesEnvio?: string;
  precioCompraPendientesEnvio?: string;
  nocompraPendientesEnvio?: string;
  unidadMedidaoRentaPendientesEnvio?: string;
  tipoRentaPendientesEnvio?: string;
  articuloCompraPendientesEnvio?: string;
  ultimoPrecioUnitarioPendientesEnvio?: string;
  unidadMedidaPendientesEnvio?: string;
  fechaInicioCompraPendientesEnvio?: string;
  fechaFinCompraPendientesEnvio?: string;
  cotizacionProveedorPendientesEnvio?: string;
  cantidadVerificadaPendientesEnvio?: string;
  ubicacionesPendientesEnvio?: string;
  tipoArticuloPendientesEnvio?: string;
}

@Component({
  selector: 'app-reporte-terreno-fecha-creacion',
  templateUrl: './ReportecomprasPendientesEnvio.component.html',
  styleUrls: ['./ReportecomprasPendientesEnvio.component.scss'],
  providers: [MessageService] 
})
export class ReportecomprasPendientesEnvioComponent implements OnInit {
  reportForm: FormGroup;
  pdfSrc: SafeResourceUrl | null = null;
  loading: boolean = false;
  Usuario : string = (this.cookieService.get('usua_Usuario'));
  submitted: boolean = false;
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
         const token = this.cookieService.get('Token');
        if(token == 'false'){
          this.router.navigate(['/auth/login'])
        }
  }
  generateReport() {
    this.submitted = true;
    if (this.reportForm.invalid) {
        return; 
    }

    const fechaInicio = new Date(this.reportForm.value.fechaInicio);
    const fechaFinal = new Date(this.reportForm.value.fechaFinal);

    // Validar si la fecha final es antes de la fecha de inicio
    if (fechaFinal < fechaInicio) {
      this.messageService.add({severity: 'warn', summary: 'Advertencia',detail: 'No se encontraron datos para el reporte.',styleClass: 'iziToast-custom',});
        this.loading = false; 
        this.submitted = false;
        return;
    }

    if (!fechaInicio || !fechaFinal) {
        console.error('Fechas no válidas');
        return;
    }

    this.loading = true; // Mostrar el spinner

    const formattedFechaInicio = fechaInicio.toISOString();
    const formattedFechaFinal = fechaFinal.toISOString();

    this.reporte.GetReportecomprasPendientesEnvio(formattedFechaInicio, formattedFechaFinal).subscribe(
        (data: ReportecomprasPendientesEnvio[]) => {
            this.loading = false;
            this.submitted = false;

            // Validar datos - incluir solo filas con datos válidos
            const filteredData = data.filter(item => 
                item.noOrdencompraPendientesEnvio?.trim() &&
                item.precioCompraPendientesEnvio?.trim() &&
                item.unidadMedidaoRentaPendientesEnvio?.trim() &&
                item.tipoRentaPendientesEnvio?.trim() &&
                item.articuloCompraPendientesEnvio?.trim() &&
                item.ultimoPrecioUnitarioPendientesEnvio?.trim() &&
                item.unidadMedidaPendientesEnvio?.trim() &&
                item.fechaInicioCompraPendientesEnvio?.trim() &&
                item.fechaFinCompraPendientesEnvio?.trim() &&
                item.cotizacionProveedorPendientesEnvio?.trim() &&
                item.cantidadVerificadaPendientesEnvio?.trim() &&
                item.ubicacionesPendientesEnvio?.trim() &&
                item.tipoArticuloPendientesEnvio?.trim()
            );

            if (filteredData.length === 0) {
              this.messageService.add({severity: 'warn', summary: 'Advertencia',detail: 'No se encontraron datos para el reporte.',styleClass: 'iziToast-custom',});
              return;
            }

            // Generar PDF
            const doc = new jsPDF('landscape');
            const pageWidth = doc.internal.pageSize.getWidth(); 
            const margin = { top: 55, left: 10, right: 10, bottom: 40 };
            const rowsPerPage = 10; // Ajusta el número de filas por página
            let yOffset = 60;
            let currentPage = 0;

            // Función para agregar una tabla al PDF
            const addTable = (startRow, endRow) => {
                autoTable(doc, {
                    startY: yOffset,
                    head: [['No', 'Orden de Compra', 'Precio Compra', 'Unidad de Medida/Renta', 'Tipo de Renta', 'Artículo', 'Último Precio Unitario', 'Unidad de Medida', 'Fecha Inicio - Fecha Fin', 'Cotización Proveedor', 'Cantidad Verificada', 'Ubicaciones', 'Tipo de Artículo']],
                    body: filteredData.slice(startRow, endRow).map((item, index) => [
                        index + 1 + (currentPage * rowsPerPage), 
                        item.noOrdencompraPendientesEnvio || '',
                        item.precioCompraPendientesEnvio || '0',
                        item.unidadMedidaoRentaPendientesEnvio || '',
                        item.tipoRentaPendientesEnvio || '',
                        item.articuloCompraPendientesEnvio || '',
                        item.ultimoPrecioUnitarioPendientesEnvio || '0',
                        item.unidadMedidaPendientesEnvio || '',
                        `${item.fechaInicioCompraPendientesEnvio || ''} - ${item.fechaFinCompraPendientesEnvio || ''}`,
                        item.cotizacionProveedorPendientesEnvio || '',
                        item.cantidadVerificadaPendientesEnvio || '0',
                        item.ubicacionesPendientesEnvio || '',
                        item.tipoArticuloPendientesEnvio || '',
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
                    columnStyles: {
                        2: { cellWidth: 25 }, // Ajustar ancho de la columna de Precio Compra
                        8: { cellWidth: 50 }  // Ajustar ancho de la columna de Fecha Inicio - Fecha Fin
                    },
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
    doc.text('Reporte de Compras pendiente de Envio', doc.internal.pageSize.width / 2, 50, { align: 'center' });

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
