import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable, { ThemeType } from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { reporteService } from 'src/app/demo/services/servicesreporte/reporteterrenofechacreacion.service';
import { YService } from '../Impresion/impresion.service';
import { ddlempresa, ddlproveedor } from 'src/app/demo/models/ModelReporte/ReporteViewModel';
import { MessageService } from 'primeng/api'; // Import MessageService
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
export class  ReporteHistorialCotizaciones{
  noCotiazacion?: number;
  fechaCotizacion?: string;
  empleadoCotizacion?:  string;
  impuestoCotizacion?: string;
  cantidadProductos?: string;
  precioCompraCotizacion?: string;
  proveedorCotizacion?: string;
  correoProveedor?: string;
  telefonoProveedor?: string;
  segundoTelefonoProveedor?: string;
}


@Component({
  selector: 'app-reporte-terreno-fecha-creacion',
  templateUrl: './ReporteHistorialCotizaciones.component.html',
  styleUrls: ['./ReporteHistorialCotizaciones.component.scss'],
  providers: [MessageService] 
})
export class RReporteHistorialCotizacionesComponent implements OnInit {
  reportForm: FormGroup;
  pdfSrc: SafeResourceUrl | null = null;
  loading: boolean = false;
  submitted: boolean = false;
  Usuario : string = (this.cookieService.get('usua_Usuario'));
  prov: ddlproveedor[] = [];
  noOptionFound: boolean = false;
  campoRequerido: boolean = false;
  filteredproveedor: ddlempresa[] = [];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService, 
    private reporte: reporteService,
    public cookieService: CookieService,
    private router: Router,
    private yService: YService
  ) {
    this.reportForm = this.fb.group({
      RangoFechaInicio: ['', Validators.required],
      RangoFechaFin: ['', Validators.required],
      ProveedorId : [0],
      MostrarTodo:[false]
    });
  }

  ngOnInit(): void {
    this.reporte.ListarProveedor().subscribe(data => {
      this.prov = data;
      console.log('Empresas:', this.prov);
  });
  const token = this.cookieService.get('Token');
  if(token == 'false'){
    this.router.navigate(['/auth/login'])
  }
  }
  
  proveedorError: boolean = false; // Variable para controlar el error del proveedor

filterEmpresa(event: any) {
  const query = event.query.toLowerCase();
  console.log('Query:', query);

  // Filtra los proveedores en base a la búsqueda
  this.filteredproveedor = this.prov.filter(provee =>
    provee.text?.toLowerCase().includes(query)
  );
  console.log('Filtered Empresas:', this.filteredproveedor);
}

onProveedorSelect(event: any) {
  // Restablece el estado del error al seleccionar un proveedor
  this.proveedorError = false;
}

validateProveedor() {
  const selectedProveedor = this.reportForm.value.ProveedorId;
  
  // Verifica si el proveedor seleccionado es uno de los proveedores filtrados
  if (selectedProveedor && !this.filteredproveedor.some(prov => prov.value === selectedProveedor.value)) {
    this.proveedorError = true;
  } else {
    this.proveedorError = false;
  }
}
generateReport() {
  this.submitted = true;

  // Verifica si el formulario es válido
  if (this.reportForm.invalid) {
    return; 
  }

  // Inicializa variables
  const fechaInicio = new Date(this.reportForm.value.RangoFechaInicio);
  const fechaFinal = new Date(this.reportForm.value.RangoFechaFin);
  const estado = this.reportForm.value.MostrarTodo;
  const Proveedor = this.reportForm.value.ProveedorId;

  // Verifica las validaciones de fecha y proveedor
  if (fechaFinal <= fechaInicio) {
    this.messageService.add({severity: 'warn', summary: 'Advertencia',detail: 'La fecha final no puede ser anterior a la fecha de inicio.',styleClass: 'iziToast-custom',});
    return;
  }

  if (Proveedor && this.filteredproveedor.every(prov => prov.value !== Proveedor.value)) {
    this.messageService.add({severity: 'warn', summary: 'Advertencia',detail: 'Proveedor no válido. Seleccione un proveedor existente.',styleClass: 'iziToast-custom',});
    return;
  }


  const proveedorId = Proveedor && Proveedor.value !== 0 ? Proveedor.value : 4;
  this.loading = true; // Mostrar el spinner

  const formattedFechaInicio = fechaInicio.toISOString();
  const formattedFechaFinal = fechaFinal.toISOString();

  this.reporte.GetReporteHistorialCotizaciones(formattedFechaInicio, formattedFechaFinal, proveedorId, estado).subscribe(
    (data: ReporteHistorialCotizaciones[]) => {
      this.loading = false;
      this.submitted = false;

      if (!data || data.length === 0) {
        this.messageService.add({severity: 'warn', summary: 'Advertencia',detail: 'No se encontraron datos para el reporte.',styleClass: 'iziToast-custom',});
          return;
      }

      const filteredData = data.filter(item => 
        item.noCotiazacion &&
        item.fechaCotizacion &&
        item.empleadoCotizacion &&
        item.impuestoCotizacion &&
        item.cantidadProductos &&
        item.precioCompraCotizacion &&
        item.proveedorCotizacion &&
        item.correoProveedor &&
        item.telefonoProveedor &&
        item.segundoTelefonoProveedor
      );

      if (filteredData.length === 0) {
        this.messageService.add({severity: 'warn', summary: 'Advertencia',detail: 'No se encontraron datos para el reporte.',styleClass: 'iziToast-custom',});
        return;
      }

      if (filteredData.length > 500) {
        this.messageService.add({ severity: 'info', summary: 'Datos extensos', detail: 'El reporte contiene una gran cantidad de datos, puede tardar un momento en generarse.', styleClass: 'iziToast-custom' });
      }

      this.generatePDF(filteredData, formattedFechaInicio, formattedFechaFinal);
    },
    error => {
      this.loading = false;
      this.messageService.add({severity: 'error', summary: 'Error',detail: 'Error en la solicitud de datos.',styleClass: 'iziToast-custom',});
      console.error('Error en la solicitud', error);
    }
  );
}

// Función para mostrar mensajes
private showMessage(severity: string, summary: string, detail: string) {
  this.messageService.add({ severity, summary, detail, styleClass: 'iziToast-custom' });
}

// Función para generar el PDF
private generatePDF(data: ReporteHistorialCotizaciones[], fechaInicio: string, fechaFinal: string) {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = { top: 60, left: 10, right: 10, bottom: 50 };

  autoTable(doc, {
    head: [['No', 'No. Cotización', 'Fecha', 'Empleado', 'Proveedor', 'Correo', 'Teléfono', 'Teléfono Secundario', 'Impuesto', 'Total']],
    body: data.map((item, index) => [
      index + 1, 
      item.noCotiazacion || '',
      item.fechaCotizacion || '',
      item.empleadoCotizacion || '', 
      item.proveedorCotizacion || '',
      item.correoProveedor || '',
      item.telefonoProveedor || '',
      item.segundoTelefonoProveedor || '',
      (item.impuestoCotizacion ? item.impuestoCotizacion + '%' : ''),  
      item.precioCompraCotizacion || '' 
    ]),
    theme: 'striped',
    styles: {
      halign: 'center',
      font: 'helvetica',
      lineWidth: 0.1,
      cellPadding: 3,
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
    tableWidth: pageWidth - margin.left - margin.right,
    didDrawPage: (data) => {
      this.addHeader(doc, fechaInicio, fechaFinal, margin);
      this.addFooter(doc, data.pageNumber, doc);
    }
  });

  this.openPdfInDiv(doc);
}







  
  
  
  
  private addHeader(doc: jsPDF, fechaInicio: string, fechaFinal: string, margin: any) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const logoUrl = '/assets/demo/images/disenoactualizado.png';

    doc.addImage(logoUrl, 'PNG', 0, -18, 297, 50); // Ajuste para landscape
    doc.setFontSize(25);
    doc.setTextColor(0, 0, 0);
    doc.text('Historial de cotización por Proveedor', doc.internal.pageSize.width / 2, 50, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`Fecha de emisión: ${date} ${time}`, doc.internal.pageSize.width - 10, 10, { align: 'right' });

    doc.setFontSize(9);
    doc.text(`Generado por: ${this.Usuario}`, doc.internal.pageSize.width - 10, 20, { align: 'right' });
  }

  private addFooter(doc: jsPDF, pageNumber: number, docInstance: jsPDF) {
    const footerLogo = '/assets/demo/images/disenoactualizado.png';
    const pageHeight = docInstance.internal.pageSize.height;

    docInstance.addImage(footerLogo, 'PNG', 0, pageHeight - 20, 297, 60); // Ajuste para landscape

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
