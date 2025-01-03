import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { reporteService } from 'src/app/demo/services/servicesreporte/reporteterrenofechacreacion.service';
import { YService } from '../Impresion/impresion.service';
import { Terreno } from 'src/app/demo/models/modelsbienraiz/terrenoviewmodel';
import { ddlempresa } from 'src/app/demo/models/ModelReporte/ReporteViewModel';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
export class  ReporteVentasPorEmpresa{
  ventaId?: number;
  identificador?: string;
  precioVentaInicio?: string;
  precioVentaFinal?: string;
  fechaPuestaVenta?: string;
  fechaVendida?:string;
  nombreAgente?: string;
  nombreEmpresa?: string;
}

@Component({
  selector: 'app-reporte-terreno-fecha-creacion',
  templateUrl: './ReporteVentasPorEmpresa.component.html',
  styleUrls: ['./ReporteVentasPorEmpresa.component.scss']
})
export class ReporteVentasPorEmpresaComponent implements OnInit {
  reportForm: FormGroup;
  pdfSrc: SafeResourceUrl | null = null;
  loading: boolean = false;
  submitted: boolean = false;
  noOptionFound: boolean = false;
  campoRequerido: boolean = false;
  Usuario : string = (this.cookieService.get('usua_Usuario'));
  empresas: ddlempresa[] = [];
  filteredEmpresas: ddlempresa[] = [];

  constructor(
    private fb: FormBuilder,
    private tipoDocumentoService: reporteService,
    public cookieService: CookieService,
    private router: Router,
    private yService: YService,
    private messageService: MessageService, 
  ) {
    this.reportForm = this.fb.group({
      empresa: ['', Validators.required],
      tipo: [false] 
    });
  }
  

  ngOnInit(): void {
    this.tipoDocumentoService.Listar().subscribe(data => {
        this.empresas = data;
        console.log('Empresas:', this.empresas);
    });
    const token = this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
}

filterEmpresa(event: any) {
  const query = event.query.toLowerCase();
  console.log('Query:', query);
  
  this.filteredEmpresas = this.empresas.filter(empresa =>
      empresa.text?.toLowerCase().includes(query)
  );

  this.noOptionFound = this.filteredEmpresas.length === 0;
}




  generateReport() {
    this.submitted = true;
    this.campoRequerido = this.reportForm.controls['empresa'].invalid;

        if (this.campoRequerido || this.noOptionFound) {
            return; 
        }
    const formattedFechaInicio = new Date().toLocaleDateString(); 
  const formattedFechaFinal = new Date().toLocaleTimeString(); 
    this.loading = true; // Mostrar el spinner
  
    const empresa = this.reportForm.value.empresa;
    if (!empresa || !empresa.text) {
      this.loading = false;
      this.messageService.add({severity: 'warn', summary: 'Advertencia', detail: 'No se pudo generar el PDF porque no existe una empresa seleccionada.', styleClass: 'iziToast-custom'});
      return;
    }
    const empresaNombre = empresa ? empresa.text : 'No seleccionada';
    
    if (empresa && empresa.text) {
    this.tipoDocumentoService.GEtReporteVentasPorEmpresa(empresa.value).subscribe(
      (data: any[]) => {
        this.loading = false;
        this.submitted = false;
        if (!data || data.length === 0) {
          this.messageService.add({severity: 'warn', summary: 'Advertencia',detail: 'No se encontraron datos para el reporte.',styleClass: 'iziToast-custom',});
          return;
        }
  
        const doc = new jsPDF();
        const margin = { top: 60, left: 10, right: 10, bottom: 50 }; 
  
        autoTable(doc, {
          startY: 60,
          head: [['No.', 'Agente', 'Venta Inicio', 'Venta final', 'Fecha Venta']],
          body: data.map((item, index) => [
            index + 1, 
            item.nombreAgente || '',
            item.precioVentaInicio || '',
            item.precioVentaFinal || '',
            item.fechaPuestaVenta || '',
            item.fechaVendida || ''
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
            this.addHeader(doc, formattedFechaInicio, formattedFechaFinal, empresaNombre, margin);
            this.addFooter(doc, data.pageNumber, doc);
          },
          columnStyles: {
            0: { cellWidth: 20 }, 
            1: { cellWidth: 40 },
            2: { cellWidth: 40 }, 
            3: { cellWidth: 40 }, 
            4: { cellWidth: 40 } ,
          }
        });
  
        this.openPdfInDiv(doc);
      },
      error => {
        this.loading = false; 
        console.error('Error en la solicitud', error);
      }
    );
  };
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

  private addHeader(doc: jsPDF, fechaInicio: string, fechaFinal: string, empresaNombre: string, margin: any) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const logoUrl = '/assets/demo/images/disenoactualizado.png'; // URL segura del logo
  
    // Agrega el logo al encabezado
    doc.addImage(logoUrl, 'PNG', 0, -18, 220, 50); // Ajusta la posición y el tamaño de la imagen
  
    // Agrega el título del reporte y el nombre de la empresa
    doc.setFontSize(25);  // Configura el tamaño de la fuente
    doc.setTextColor(0, 0, 0);  // Configura el color del texto
    doc.text(`Reporte de Ventas para ${empresaNombre}`, doc.internal.pageSize.width / 2, 50, { align: 'center' });
  
    // Agrega la fecha de emisión
    doc.setFontSize(8);  // Configura el tamaño de la fuente para la fecha y hora
    doc.setTextColor(255, 255, 255); 
    doc.text(`Fecha de emisión: ${date} ${time}`, doc.internal.pageSize.width - 10, 10, { align: 'right' });
  
    doc.setFontSize(9);  // Configura el tamaño de la fuente para el nombre del generador
    doc.setTextColor(255, 255, 255);
    doc.text(`Generado por: ${this.Usuario}`, doc.internal.pageSize.width - 10, 20, { align: 'right' });
  }
  

  private addFooter(doc: jsPDF, pageNumber: number, docInstance: jsPDF) {
    const footerLogo = '/assets/demo/images/disenoactualizado.png'; 
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
    const iframe = `<iframe width='100%' height='800px' src='${string}'></iframe>`;
    const pdfContainer = document.getElementById('pdfContainer');
    if (pdfContainer) {
      pdfContainer.innerHTML = iframe;
    } else {
      console.error('PDF container not found');
    }
  }
}
