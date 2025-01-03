import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
const doc = new jsPDF('landscape');
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { reporteService } from 'src/app/demo/services/servicesreporte/reporteterrenofechacreacion.service';
import { YService } from '../Impresion/impresion.service';
import { Terreno } from 'src/app/demo/models/modelsbienraiz/terrenoviewmodel';
import { ddlempresa } from 'src/app/demo/models/ModelReporte/ReporteViewModel';
import { Estado } from 'src/app/demo/models/modelsgeneral/estadoviewmodel ';
import { MessageService } from 'primeng/api'; 
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

export class  ReporteComparativoProductos{
  codigoCotizacion?: string;
  articuloCotizacion?: string;
  ultimoPrecioUnitarioCotizacion?: string;
  unidadMedidaoRentaCotizacion?: string;
  cantidadCotizacion?: string;
  preciocompraCotizacionpp?: string;
  total?: string;
  cantidadCotizacionpp?: string;
  fechacotiCotizacion?: string;
}

@Component({
  selector: 'app-reporte-terreno-fecha-creacion',
  templateUrl: './ReporteComparativoProductos.component.html',
  styleUrls: ['./ReporteComparativoProductos.component.scss'],
  providers: [MessageService] 
})
export class ReporteComparativoProductosComponent implements OnInit {
  reportForm: FormGroup;
  pdfSrc: SafeResourceUrl | null = null;
  loading: boolean = false;
  submitted: boolean = false;
  Usuario : string = (this.cookieService.get('usua_Usuario'));
  empresas: ddlempresa[] = [];
  filteredEmpresas: ddlempresa[] = [];

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
      tipo: [0],  
    });
  }
  

  ngOnInit(): void {
    console.log(this.globalMoneda.getState(), 'this.globalMoneda.getState()');
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
  
    this.Usuario = (this.cookieService.get('usua_Usuario'));
  
    console.log("El  usuario es: ", this.Usuario)

    if (!this.globalMoneda.getState()) {
      console.log('hola');
      this.globalMoneda.setState()
    }
    
}

generateReport() {
  this.submitted = true;

  // Verificar si el formulario es inválido
  if (this.reportForm.invalid) {
    return; 
  }

  // Formatear las fechas para el encabezado del PDF
  const formattedFechaInicio = new Date().toLocaleDateString();  
  const formattedFechaFinal = new Date().toLocaleTimeString(); 
  this.loading = true; 
  const tipo = this.reportForm.value.tipo;
  console.log('Datos del formulario:', { tipo });
  this.reporte.GetReporteComparativoProductos(tipo).subscribe(
    (data: ReporteComparativoProductos[]) => {
      this.loading = false;
      this.submitted = false;
      if (!data || data.length === 0) {
        this.messageService.add({severity: 'warn', summary: 'Advertencia',detail: 'No se encontraron datos para el reporte.',styleClass: 'iziToast-custom',});
        return;
      }
      const filteredData = data.filter(item =>
        item.codigoCotizacion ||
        item.articuloCotizacion ||
        item.ultimoPrecioUnitarioCotizacion ||
        item.unidadMedidaoRentaCotizacion ||
        item.cantidadCotizacion ||
        item.preciocompraCotizacionpp ||
        item.total ||
        item.cantidadCotizacionpp ||
        item.fechacotiCotizacion
      );
      if (filteredData.length === 0) {
        this.messageService.add({severity: 'warn', summary: 'Advertencia',detail: 'No se encontraron datos para el reporte.',styleClass: 'iziToast-custom',});
        return;
      }
      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.getWidth(); 
      const margin = { top: 60, left: 10, right: 10, bottom: 50 }; 
      autoTable(doc, {
        startY: 60,
        head: [[
          'No.', 
          'Artículo', 
          'Último Precio Unitario', 
          'Unidad/Medida o Renta', 
          'Precio Compra', 
          'Total', 
          'Cantidad', 
          'Fecha Cotización'
        ]],
        body: filteredData.map((item, index) => [
          (index + 1).toString(), 
          item.articuloCotizacion || '',
          item.ultimoPrecioUnitarioCotizacion || '',
          item.unidadMedidaoRentaCotizacion || '',
          item.preciocompraCotizacionpp || '',
          item.total || '',
          item.cantidadCotizacionpp || '',
          item.fechacotiCotizacion || ''
        ]),
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
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' }, 
          2: { cellWidth: 'auto' }, 
          3: { cellWidth: 'auto' }, 
          4: { cellWidth: 'auto' }, 
          5: { cellWidth: 'auto' }, 
          6: { cellWidth: 'auto' }, 
          7: { cellWidth: 'auto' }, 
          8: { cellWidth: 'auto' },
        },
        tableWidth: pageWidth - margin.left - margin.right, 
      });
      this.openPdfInDiv(doc);
    },
    error => {
      this.loading = false; 
      this.messageService.add({
        severity: 'error',
        summary: 'Error en la Solicitud',
        detail: 'Ocurrió un error al generar el reporte. Intente nuevamente más tarde.', styleClass: 'iziToast-custom', });
      console.error('Error en la solicitud', error);
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
  doc.text('Reporte de Comparativo de producto', doc.internal.pageSize.width / 2, 50, { align: 'center' });

  // Fecha y nombre del generador en la parte superior derecha
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Fecha de emisión: ${date} ${time}`, doc.internal.pageSize.width - 10, 10, { align: 'right' });

  doc.setFontSize(9);
  doc.text(`Generado por: ${this.Usuario}`, doc.internal.pageSize.width - 10, 20, { align: 'right' });
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
  const iframe = `<iframe width='100%' height='800px' src='${string}'></iframe>`;
  const pdfContainer = document.getElementById('pdfContainer');
  if (pdfContainer) {
    pdfContainer.innerHTML = iframe;
  } else {
    console.error('PDF container not found');
  }
}


}
