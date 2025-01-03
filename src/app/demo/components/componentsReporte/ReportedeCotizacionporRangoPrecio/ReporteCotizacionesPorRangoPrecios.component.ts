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
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
export class  ReporteCotizacionesPorRangoPrecios{
  proveedorDescripcionRangoprecio?: string;
  precioCompraInsumoRangoprecio?: string;
  precioCompraMaquinariaRangoprecio?: string;
  precioCompraEquipoSeguridadRangoprecio?: string;
  descripcionInsumoRangoprecio?: string;
  descripcionMaquinariaRangoprecio?: string;
  descripcionEquipoSeguridadRangoprecio?:string;
  unidadMedidaNombreRangoprecio?: string;
  unidadMedidaNomenclaturaRangoprecio?: string;
  tipoRangoprecio?: string;
}

@Component({
  selector: 'app-reporte-terreno-fecha-creacion',
  templateUrl: './ReporteCotizacionesPorRangoPrecios.component.html',
  styleUrls: ['./ReporteCotizacionesPorRangoPrecios.component.scss'],
  providers: [MessageService] 
})
export class ReporteCotizacionesPorRangoPreciosComponent implements OnInit {
  reportForm: FormGroup;
  pdfSrc: SafeResourceUrl | null = null;
  Usuario : string = (this.cookieService.get('usua_Usuario'));
  loading: boolean = false;
  submitted: boolean = false;
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
      precio: ['', Validators.required],
      mostrar: [false]
    });
  }
  

  ngOnInit(): void {
    console.log(this.globalMoneda.getState(), 'this.globalMoneda.getState()');
    

    if (!this.globalMoneda.getState()) {
      console.log('hola');
      this.globalMoneda.setState()
    }
    const token = this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
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
  this.loading = true; // Mostrar el spinner

  const tipo = this.reportForm.value.tipo;
  const rangoprecio = this.reportForm.value.precio;
  const mostrar = this.reportForm.value.mostrar;
  
  console.log('Datos del formulario:', { tipo, rangoprecio, mostrar });
  
  // Solicitar el reporte basado en el tipo, rango de precio, y mostrar todo
  this.reporte.GetReporteCotizacionesPorRangoPrecios(tipo, rangoprecio, mostrar).subscribe(
    (data: ReporteCotizacionesPorRangoPrecios[]) => {
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

      // Filtrar datos para eliminar filas vacías
      const filteredData = data.filter(item =>
        item.proveedorDescripcionRangoprecio ||
        item.descripcionInsumoRangoprecio ||
        item.descripcionMaquinariaRangoprecio ||
        item.descripcionEquipoSeguridadRangoprecio ||
        item.precioCompraInsumoRangoprecio ||
        item.precioCompraMaquinariaRangoprecio ||
        item.precioCompraEquipoSeguridadRangoprecio ||
        item.unidadMedidaNombreRangoprecio ||
        item.unidadMedidaNomenclaturaRangoprecio ||
        item.tipoRangoprecio
      );

      if (filteredData.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Sin Datos Válidos',
          detail: 'No se encontraron datos válidos para el reporte.'
        });
        return;
      }

      // Generar el documento PDF en modo landscape
      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.getWidth(); // Obtener el ancho de la página
      const margin = { top: 60, left: 10, right: 10, bottom: 50 }; 

      // Configurar la tabla para ocupar todo el ancho
      autoTable(doc, {
        startY: 60,
        head: [[
          'No',
          'Proveedor', 
          'Descripción Insumo', 
          'Descripción Maquinaria', 
          'Descripción Equipo Seguridad', 
          'Precio Insumo', 
          'Precio Maquinaria', 
          'Precio Equipo Seguridad', 
          'Unidad Medida', 
          'Unidad Medida (Nomenclatura)', 
          'Tipo'
        ]],
        body: filteredData.map((item, index) => [
          index + 1 ,
          item.proveedorDescripcionRangoprecio || '',
          item.descripcionInsumoRangoprecio || '',
          item.descripcionMaquinariaRangoprecio || '',
          item.descripcionEquipoSeguridadRangoprecio || '',
          item.precioCompraInsumoRangoprecio || '',
          item.precioCompraMaquinariaRangoprecio || '',
          item.precioCompraEquipoSeguridadRangoprecio || '',
          item.unidadMedidaNombreRangoprecio || '',
          item.unidadMedidaNomenclaturaRangoprecio || '',
          item.tipoRangoprecio || ''
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
          9: { cellWidth: 'auto' }, 
          10: { cellWidth: 'auto' }, 
        },
        tableWidth: pageWidth - margin.left - margin.right, // Ajustar la tabla al ancho de la página
      });

      // Abrir el PDF en el div
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



private addHeader(doc: jsPDF, fechaInicio: string, fechaFinal: string, margin: any) {
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();
  const logoUrl = '/assets/demo/images/disenoactualizado.png';

  // Ajuste para header en landscape
  doc.addImage(logoUrl, 'PNG', 0, -18, 297, 50); // Ancho ajustado para landscape
  doc.setFontSize(25);
  doc.setTextColor(0, 0, 0);
  doc.text('Reporte de Cotización  por Precio', doc.internal.pageSize.width / 2, 50, { align: 'center' });

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
