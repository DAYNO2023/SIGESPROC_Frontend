import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { reporteService } from 'src/app/demo/services/servicesreporte/reporteterrenofechacreacion.service';

import { Terreno } from 'src/app/demo/models/modelsbienraiz/terrenoviewmodel';
import { MessageService } from 'primeng/api'; // Import MessageService
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
export class  ReporteComprasRealizadas{
  codigo?: string;
  CantidadCompra?: string;
  PrecioCompra_Compra?: string;
  unidadMedidaoRentaCompra?:string;
  tipoRentaCompra?: string;
  ArticuloCompra?: string;
  UltimoPrecioUnitarioCompra?: string;
  UnidadMedidaCompra?: string;
  FechaCompra?: string;
  fechaFinCompra?: string;
  fechaInicioCompra?: string;
  ImpuestoCompra?: string;
  CotizacionProveedorCompra?: string;
  cantidadVerificadaCompra?: string;
  ubicacionesCompra?: string;
  tipoArticuloCompra?: string;
  tipoArticulo?: string;
}

@Component({
  selector: 'app-reporte-terreno-fecha-creacion',
  templateUrl: './ReporteComprasRealizadas.component.html',
  styleUrls: ['./ReporteComprasRealizadas.component.scss'],
  providers: [MessageService] 
})
export class ReporteComprasRealizadasComponent implements OnInit {
  reportForm: FormGroup;
  pdfSrc: SafeResourceUrl | null = null;
  loading : boolean = false;
  Usuario : string = (this.cookieService.get('usua_Usuario'));
  submitted: boolean = false;
  constructor(
    private fb: FormBuilder,
    private tipoDocumentoService: reporteService,
    private sanitizer: DomSanitizer,
    public cookieService: CookieService,
    private router: Router,
    private messageService: MessageService, 
  ) {
    this.reportForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFinal: ['', Validators.required]
    });
  }

  ngOnInit(): void {}
  
  generateReport() {
    this.submitted = true;

    if (this.reportForm.invalid) {
        return; 
    }

    const { fechaInicio, fechaFinal } = this.reportForm.value;


    if (new Date(fechaInicio) > new Date(fechaFinal)) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'La fecha final no puede ser anterior a la fecha de inicio.',
            styleClass: 'iziToast-custom',
        });
        this.loading = false; 
        return;
    }

    this.loading = true; 

    const formattedFechaInicio = this.formatDate(new Date(fechaInicio));
    const formattedFechaFinal = this.formatDate(new Date(fechaFinal));

    console.log('Fecha de inicio:', formattedFechaInicio);
    console.log('Fecha final:', formattedFechaFinal);

    this.tipoDocumentoService.GetReporteComprasRealizadas(formattedFechaInicio, formattedFechaFinal).subscribe(
        (data: any[]) => {
            this.loading = false; 
            this.submitted = false;

            if (!data || data.length === 0) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No hay datos válidos para mostrar.',
                    styleClass: 'iziToast-custom',
                });
                return; 
            }


            const cleanedData = data.filter(item => 
                item.codigo &&
                item.precioCompra_Compra &&
                item.unidadMedidaoRentaCompra &&
                item.tipoRentaCompra &&
                item.articuloCompra &&
                item.ultimoPrecioUnitarioCompra &&
                item.tipoArticulo &&
                item.fechaCompra
            );

            if (cleanedData.length === 0) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No hay datos válidos para mostrar en la tabla.',
                    styleClass: 'iziToast-custom',
                });
                return; 
            }

            const doc = new jsPDF();
            const margin = { top: 60, left: 10, right: 10, bottom: 50 }; 
            let startY = margin.top;

            const addTable = (data: any[]) => {
                autoTable(doc, {
                    startY: startY,
                    head: [['No.', 'Total Precio', 'Unidad Medida', 'Tipo Renta', 'Artículo', 'Precio Unitario', 'Tipo Artículos', 'Fecha Compra']],
                    body: data.map(item => [
                        item.codigo || '-',
                        item.precioCompra_Compra || '-',
                        item.unidadMedidaoRentaCompra || '-',
                        item.tipoRentaCompra || '-',
                        item.articuloCompra || '-',
                        item.ultimoPrecioUnitarioCompra || '-',
                        item.tipoArticulo || '-',
                        item.fechaCompra || '-'
                    ]),
                    theme: 'striped',
                    styles: {
                        halign: 'center',
                        font: 'helvetica',
                        lineWidth: 0.1,
                        cellPadding: 3,
                        fontSize: 8
                    },
                    headStyles: {
                        fillColor: [255, 237, 58],
                        textColor: [0, 0, 0],
                        fontSize: 10,
                        fontStyle: 'bold',
                        halign: 'center'
                    },
                    bodyStyles: {
                        textColor: [0, 0, 0],
                        fontSize: 8,
                        halign: 'center'
                    },
                    alternateRowStyles: {
                        fillColor: [240, 240, 240]
                    },
                    margin: margin,
                    didDrawPage: (data) => {
                        this.addHeader(doc, formattedFechaInicio, formattedFechaFinal, margin);
                        this.addFooter(doc, data.pageNumber, doc);
                    },
                    columnStyles: {
                        0: { cellWidth: 13 },
                        1: { cellWidth: 30 },
                        2: { cellWidth: 30 },
                        3: { cellWidth: 20 },
                        4: { cellWidth: 20 },
                        5: { cellWidth: 30 },
                        6: { cellWidth: 25 },
                        7: { cellWidth: 20 }
                    },
                    didDrawCell: (data) => {
         
                        if (data.cell.y + data.cell.height > doc.internal.pageSize.height - margin.bottom) {
                            doc.addPage();
                            startY = margin.top; 
                        }
                    }
                });


                startY = doc.internal.pageSize.height - margin.bottom;
            };


            doc.setFontSize(12);
            startY += 10; 
            addTable(cleanedData);

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
}




preventManualInput(event: KeyboardEvent | InputEvent): void {
  event.preventDefault();
}
  
  private formatLink(link: string): string {
    return link ? `${link}` : ''; // Simplificar enlace
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Añade un 0 delante si es necesario
    const day = ('0' + date.getDate()).slice(-2); // Añade un 0 delante si es necesario
    return `${year}-${month}-${day}`;
  }

  private formatDateFromServer(dateString: string): string {
    // Asume que la fecha del servidor está en formato 'dd/MM/yyyy'
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`; // Devuelve la fecha en formato 'yyyy-MM-dd'
  }

  private addHeader(doc: jsPDF, fechaInicio: string, fechaFinal: string, margin: any) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const logoUrl = '/assets/demo/images/disenoactualizado.png'; // URL segura del logo

    // Agrega el logo al encabezado
    doc.addImage(logoUrl, 'PNG',  0, -18, 220, 50); // Ajusta la posición y el tamaño de la imagen

    doc.setFontSize(20);  // Configura el tamaño de la fuente
    doc.setTextColor(0, 0, 0);  // Configura el color del texto
    doc.text(`Reporte de Compras Realizadas`, doc.internal.pageSize.width / 2, 50, { align: 'center' });  
    // Agrega la fecha de emisión
    doc.setFontSize(8);  // Configura el tamaño de la fuente para la fecha y hora
    doc.setTextColor(255, 255, 255); 
    doc.text(`Fecha de emisión: ${date} ${time}`, doc.internal.pageSize.width - 10, 10, { align: 'right' });

   
    doc.setFontSize(9);
    doc.text(`Generado por: ${this.Usuario}`, doc.internal.pageSize.width - 10, 20, { align: 'right' });
  }

  private addFooter(doc: jsPDF, pageNumber: number, docInstance: jsPDF) {
    const footerLogo = '/assets/demo/images/disenoactualizado.png'; // URL segura del logo
    const pageHeight = docInstance.internal.pageSize.height;
    const margin = { bottom: 50 };

    // Agrega el logo al pie de página
    docInstance.addImage(footerLogo, 'PNG',  0, 280, 220, 50);

    // Agrega el número de página
    doc.setFontSize(12);  // Configura el tamaño de la fuente para el número de página
    doc.setTextColor(0, 0, 0);
    docInstance.text(`Página ${pageNumber}`, doc.internal.pageSize.width - 94, 292, { align: 'right' });
  }

  private openPdfInDiv(doc: jsPDF) {
    const string = doc.output('datauristring');
    const iframe = `<iframe width='100%' height='600px' src='${string}'></iframe>`;
    const pdfContainer = document.getElementById('pdfContainer');
    if (pdfContainer) {
      pdfContainer.innerHTML = iframe;
    } else {
      console.error('PDF container not found');
    }
  }
}
