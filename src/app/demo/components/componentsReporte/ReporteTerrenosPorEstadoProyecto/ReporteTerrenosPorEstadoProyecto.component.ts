import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { reporteService } from 'src/app/demo/services/servicesreporte/reporteterrenofechacreacion.service';
import { YService } from '../Impresion/impresion.service';
import { Terreno } from 'src/app/demo/models/modelsbienraiz/terrenoviewmodel';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
export class ReporteTerrenosPorEstadoProyecto {
  terrenoId?: number;
  descripcion?: string;
  area?: string;
  precioCompra?: string;
  linkUbicacion?: string;
  latitud?: string;
  longitud?: string;
  fechaCreacion?: string;
  identificador?: string;
}

@Component({
  selector: 'app-reporte-terreno-fecha-creacion',
  templateUrl: './ReporteTerrenosPorEstadoProyecto.component.html',
  styleUrls: ['./ReporteTerrenosPorEstadoProyecto.component.scss']
})
export class ReporteTerrenosPorEstadoProyectoComponent implements OnInit {
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
    private yService: YService
  ) {
    this.reportForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFinal: ['', Validators.required],
      tipo: [false] 
    });
  }
  

  ngOnInit(): void {
    const token = this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
  }
  generateReport() {
    this.submitted = true;
    if (this.reportForm.invalid) {
      return; // Evita la generación si el formulario es inválido
    }
  
    this.loading = true;
  
    const { fechaInicio, fechaFinal, tipo } = this.reportForm.value; 
    const formattedFechaInicio = this.formatDate(new Date(fechaInicio));
    const formattedFechaFinal = this.formatDate(new Date(fechaFinal));

    if (formattedFechaFinal <= formattedFechaInicio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La fecha final no puede ser anterior a la fecha de inicio.',
        styleClass: 'iziToast-custom',
    });
    this.loading = false;
      return;
    }
  
    console.log('Fecha de inicio:', formattedFechaInicio);
    console.log('Fecha final:', formattedFechaFinal);
    console.log('Tipo:', tipo);
  
    this.tipoDocumentoService.GetReporteTerrenosPorEstadoProyecto(formattedFechaInicio, formattedFechaFinal, tipo).subscribe(
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
  
        const doc = new jsPDF();
        const margin = { top: 60, left: 10, right: 10, bottom: 50 }; 
        const pageSize = 5; 
  
        const chunks = [];
        for (let i = 0; i < data.length; i += pageSize) {
          chunks.push(data.slice(i, i + pageSize));
        }
  
        chunks.forEach((chunk, index) => {
          if (index > 0) {
            doc.addPage(); 
          }
  
          autoTable(doc, {
            startY: 60,
            head: [['No.','Terreno', 'Área', 'Precio', 'Coordenadas', 'Estado']],
            body: chunk.map(item => [
              item.terrenoId,
              item.descripcion || '',
              item.area ? `${item.area} m²` : '', 
              item.precioCompra || '', 
              `${'latitud -' + item.latitud || ''}, ${'longitud -' + item.longitud || ''}`,
              item.identificador || '' 
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
              0: { cellWidth: 15 }, // Aumenta el ancho de la columna "Terreno" a 80
              1: { cellWidth: 40 }, // Ancho de la columna "Área (Metros cuadrados)" a 40
              2: { cellWidth: 30 }, // Ancho de la columna "Precio (Currency)" a 40
              3: { cellWidth: 30 }, // Ancho de la columna "Latitud" a 60
              4: { cellWidth: 40 }, // Ancho de la columna "Longitud" a 60
              5: { cellWidth: 30 } 
            }
          });
        });
  
        this.openPdfInDiv(doc);
      },
      error => {
        this.loading = false; // Ocultar el spinner en caso de error
        console.error('Error en la solicitud', error);
      }
    );
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

    doc.setFontSize(25);  // Configura el tamaño de la fuente
    doc.setTextColor(0, 0, 0);  // Configura el color del texto
    doc.text(`Reporte de Terreno`, doc.internal.pageSize.width / 2, 50, { align: 'center' });  
    // Agrega la fecha de emisión
    doc.setFontSize(8);  // Configura el tamaño de la fuente para la fecha y hora
    doc.setTextColor(255, 255, 255); 
    doc.text(`Fecha de emisión: ${date} ${time}`, doc.internal.pageSize.width - 10, 10, { align: 'right' });

   
  doc.setFontSize(9);  // Configura el tamaño de la fuente para el nombre del generador
  doc.setTextColor(255, 255, 255);
    doc.text(`Generado por: ${this.Usuario}`, doc.internal.pageSize.width - 10, 20, { align: 'right' });
    // Agrega el título del reporte
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
    const iframe = `<iframe width='100%' height='800px' src='${string}'></iframe>`;
    const pdfContainer = document.getElementById('pdfContainer');
    if (pdfContainer) {
      pdfContainer.innerHTML = iframe;
    } else {
      console.error('PDF container not found');
    }
  }
}
