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

import { ActividadPorEtapa, Proyecto } from 'src/app/demo/models/modelsflete/fleteviewmodel';
import { consumerPollProducersForChange } from '@angular/core/primitives/signals';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { MessageService } from 'primeng/api';


export class ReporteArticulosActividadesViewModel {
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
  templateUrl: './ReporteArticulosActividades.component.html',
  styleUrls: ['./ReporteArticulosActividades.component.scss']
})
export class ReporteArticulosActividades implements OnInit {
  reportForm: FormGroup;
  filtradoProyectosSalida: Proyecto[] = [];
  proyectosSalida: Proyecto[] = [];
  filtradoEtapasSalida: any[] = [];
  actividadesSalida: ActividadPorEtapa[] = [];
  filtradoActividadesSalida: any[] = [];
  pdfSrc: SafeResourceUrl | null = null;
  loading : boolean = false;
  Usuario : string = (this.cookieService.get('usua_Usuario'));
  submitted: boolean = false;
  error_Proyecto: string = "El campo es requerido.";
  error_Etapa: string = "El campo es requerido.";
  error_Actividad: string = "El campo es requerido.";
  constructor(
    private fb: FormBuilder,
    private tipoDocumentoService: reporteService,
    private sanitizer: DomSanitizer,
    public cookieService: CookieService,
    private router: Router,
    private yService: YService,
    private messageService: MessageService,
    public globalMoneda: globalmonedaService,
  ) {
    this.reportForm = this.fb.group({
      proyecto: ['',],
      actividad: ['',],
      etapa: ['',],
      eleccion: ['',Validators.required]
    });
  }
  

  async ngOnInit(){
    if (!this.globalMoneda.getState()) {
      this.globalMoneda.setState();
  }
      this.tipoDocumentoService.ListarProyectos().then(
          (data: Proyecto[]) => {
              this.proyectosSalida = data.sort((a, b) => a.proy_Nombre.localeCompare(b.proy_Nombre));;  // Guardamos los proyectos en la variable correspondiente
              console.log('Proyectos de salida cargados:', this.proyectosSalida);
          },
          error => {
              console.error('Error al cargar los proyectos de salida:', error);
          }
      );

      this.tipoDocumentoService.ListarActividadesPorEtapa().subscribe(
        (data: ActividadPorEtapa[]) => {
            console.log('Datos recibidos desde el servicio ListarActividadesPorEtapa:', data);
            this.actividadesSalida = data;

            
           
        },
        (error) => {
            console.error('Error al cargar actividades desde el servicio:', error);
        }
    );
    const token = this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
    }
  }

  filterProyectosSalida(event: any) {
    const query = event.query.toLowerCase();
    this.filtradoProyectosSalida = this.proyectosSalida.filter(proyecto =>
        proyecto.proy_Nombre && proyecto.proy_Nombre.toLowerCase().includes(query)
    );
}
onEtapaSalidaSelect(event: any) {
  const etapaSeleccionada = event.value;

  console.log(this.actividadesSalida)
  if (etapaSeleccionada) {
      // Almacena solo el ID de la etapa seleccionada
      this.reportForm.patchValue({
          etapa: etapaSeleccionada.etap_Descripcion
      });
      console.log(etapaSeleccionada);
      console.log('Etapa seleccionada (ID):', etapaSeleccionada.etpr_Id);
      console.log(this.filtradoActividadesSalida);
      // Filtrar las actividades basadas en el ID de la etapa seleccionada
      this.filtradoActividadesSalida = this.actividadesSalida.filter(actividad => actividad.etpr_Id == etapaSeleccionada.etpr_Id).sort((a, b) => a.acti_Descripcion.localeCompare(b.acti_Descripcion));;
      console.log(this.filtradoActividadesSalida)
      if (this.filtradoActividadesSalida.length > 0) {
          console.log('Actividades cargadas para la etapa seleccionada:', this.filtradoActividadesSalida);
      } else {
          console.warn('No se encontraron actividades para la etapa seleccionada con ID:', etapaSeleccionada.etap_Id);
      }
  } else {
      console.error('Etapa seleccionada no válida');
  }
}

onProyectoSalidaSelect(event: any) {
  const proyectoSeleccionado = event.value.proy_Id;
  this.reportForm.patchValue({
    proyecto: event.value.proy_Nombre
  });
  if (!proyectoSeleccionado) {
      console.error('No hay un proyecto seleccionado.');
      return;
  }

  this.ListadoEtapasPorProyectoSalida(proyectoSeleccionado)
      .then(() => {
          console.log('Etapas cargadas correctamente para el proyecto seleccionado.');
          // Aquí NO cargamos actividades. La carga de actividades será gestionada por onEtapaSalidaSelect
      })
      .catch(error => {
          console.error('Error al cargar las etapas de salida:', error);
      });
}

ListadoEtapasPorProyectoSalida(proyectoId: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
      this.tipoDocumentoService.ListarActividadesPorEtapa().subscribe((data: ActividadPorEtapa[]) => {
          if (data) {
              this.filtradoEtapasSalida = data
                  .filter(item => item.proy_Id === proyectoId)
                  .map(item => ({ etap_Id: item.etap_Id, etap_Descripcion: item.etap_Descripcion, etpr_Id: item.etpr_Id }))
                  .filter((value, index, self) =>
                      self.findIndex(v => v.etap_Id === value.etap_Id) === index)
                  .sort((a, b) => a.etap_Descripcion.localeCompare(b.etap_Descripcion));;

              console.log('Etapas de salida filtradas por proyecto (con ID):', this.filtradoEtapasSalida);
              resolve();
          } else {
              console.error('No se recibieron datos al listar etapas de salida.');
              reject('No se recibieron datos al listar etapas de salida.');
          }
      }, (error) => {
          console.error('Error al listar etapas de salida:', error);
          reject(error);
      });
  });
}

filterEtapasSalida(event: any) {
  const query = event.query.toLowerCase();

  // Filtrar solo por la propiedad etap_Descripcion
  this.filtradoEtapasSalida = this.filtradoEtapasSalida.filter(etapa =>
      etapa.etap_Descripcion.toLowerCase().includes(query)
  );

  console.log('Etapas de salida filtradas por búsqueda:', this.filtradoEtapasSalida);

}



filterActividadesSalida(event: any) {
  const query = event.query.toLowerCase();

  // Asegurarse de que las actividades están previamente filtradas por la etapa seleccionada
  if (this.filtradoActividadesSalida.length > 0) {
      // Filtrar actividades de salida basadas en el texto de búsqueda
      this.filtradoActividadesSalida = this.filtradoActividadesSalida.filter(actividad =>
          actividad.acti_Descripcion.toLowerCase().includes(query)
      );
      console.log('Actividades de salida filtradas por búsqueda:', this.filtradoActividadesSalida);
  } else {
      console.warn('No hay actividades filtradas previamente para esta etapa.');
  }
}


onActividadSalidaSelect(event: any) {
  const actividadSeleccionada = event.value;

  this.reportForm.patchValue({
    actividad: event.value.acti_Descripcion
  });
}
  generateReport() {

  let IdProy = this.proyectosSalida.find(proy => proy.proy_Nombre ===
  this.reportForm.value.proyecto)?.proy_Id ?? 0;
  if (IdProy !== 0) {
  this.reportForm.get('proyecto')?.setErrors(null);
  } else if(this.reportForm.value.proyecto == "" ||
  this.reportForm.value.proyecto == null){
  this.error_Proyecto = "El campo es requerido."
  this.reportForm.get('proyecto')?.setErrors({ 'invalidproyectoId': true });
  }else {
  this.error_Proyecto = "Opción no encontrada."
  this.reportForm.get('proyecto')?.setErrors({ 'invalidproyectoId': true });
  }

    let IdEtapa = this.filtradoEtapasSalida.find(etap => etap.etap_Descripcion ===
    this.reportForm.value.etapa)?.etap_Id ?? 0;
    if (IdEtapa !== 0) {
    this.reportForm.get('etapa')?.setErrors(null);
    } else if(this.reportForm.value.etapa == "" ||
    this.reportForm.value.etapa == null){
    this.error_Etapa = "El campo es requerido."
    this.reportForm.get('etapa')?.setErrors({ 'invalidetapaId': true });
    }else {
    this.error_Etapa = "Opción no encontrada."
    this.reportForm.get('etapa')?.setErrors({ 'invalidetapaId': true });
    }

    let IdActividad = this.filtradoActividadesSalida.find(acti => acti.acti_Descripcion ===
      this.reportForm.value.actividad)?.acet_Id ?? 0;
      if (IdActividad !== 0) {
      this.reportForm.get('actividad')?.setErrors(null);
      } else if(this.reportForm.value.actividad == "" ||
      this.reportForm.value.actividad == null){
      this.error_Actividad = "El campo es requerido."
      this.reportForm.get('actividad')?.setErrors({ 'invalidetapaId': true });
      }else {
      this.error_Actividad = "Opción no encontrada."
      this.reportForm.get('actividad')?.setErrors({ 'invalidetapaId': true });
      }
      

      console.log(this.reportForm.value.proyecto)
      console.log(this.reportForm.value.etapa)
      console.log(this.reportForm.value.actividad)

      console.log(this.reportForm.value.eleccion)
      console.log(IdActividad)
    if (this.reportForm.valid) {
      console.log("Entre?")
      this.loading = true; // Mostrar el spinner
  
      const { fechaInicio, fechaFinal } = this.reportForm.value; // Obtener el valor del switch
      const formattedFechaInicio = this.formatDate(new Date(fechaInicio));
      const formattedFechaFinal = this.formatDate(new Date(fechaFinal));
    
      console.log('Fecha de inicio:', formattedFechaInicio);
      console.log('Fecha final:', formattedFechaFinal);

    
      this.tipoDocumentoService.GetReporteArticuloActividad(IdActividad, this.reportForm.value.eleccion).subscribe(
        (data: any[]) => {
          console.log(data)
          this.loading = false; // Ocultar el spinner cuando se complete la carga
          this.submitted = false;
          const doc = new jsPDF();
          const margin = { top: 60, left: 10, right: 10, bottom: 50 }; // Ajustar márgenes
          if (!data || data.length === 0) {
            
            this.messageService.add({
              severity: 'warn',
              summary: 'No hay datos disponibles',
              detail: 'No se encontraron datos para el reporte solicitado.',
              styleClass: 'iziToast-custom',
          });
          return;
        

          }else{
          
            autoTable(doc, {
              startY: 60,
              head: [['No.','Categoría', 'Artículos', 'Total']],
              body: data.map(item => [
                item.codigo,
                item.categoria || '',
                item.articulo || '', 
                `${this.globalMoneda.getState().mone_Abreviatura} ${new Intl.NumberFormat('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.total)}` || '0.00'
              ]),
              theme: 'striped',
              styles: {
                halign: 'center', // Center aligns by default
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
                fontSize: 8
              },
              alternateRowStyles: {
                fillColor: [240, 240, 240]
              },
              didDrawPage: (data) => {
                this.addHeader(doc, formattedFechaInicio, formattedFechaFinal, margin);
                this.addFooter(doc, data.pageNumber, doc);
              }
            });
      
            
          }
          const finalY = (doc as any).lastAutoTable.finalY
          let totalFinal = 0.00
          data.forEach(item => {
            totalFinal += parseFloat(item.total) 
          });
          const totalsConfig = [
            {
              label: 'TOTAL',
              value: this.globalMoneda.getState().mone_Abreviatura + ' ' + totalFinal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            },
          ];
          
          doc.setFontSize(10);
          totalsConfig.forEach((total, index) => {
            // Adjust the position to align to the right
            doc.text(`${total.label}: ${total.value}`, doc.internal.pageSize.width - 15, finalY + 15, { align: 'right' });
          });
          this.openPdfInDiv(doc);
    
        
    
          
        },
        error => {
          this.loading = false; // Ocultar el spinner en caso de error
          console.error('Error en la solicitud', error);
        }
      );
    }else{
      this.submitted = true;
      this.ListadoEtapasPorProyectoSalida(IdProy)
      .then(() => {
          console.log('Etapas cargadas correctamente para el proyecto seleccionado.');
          // Aquí NO cargamos actividades. La carga de actividades será gestionada por onEtapaSalidaSelect
      })
      .catch(error => {
          console.error('Error al cargar las etapas de salida:', error);
      });

      this.filtradoActividadesSalida = this.actividadesSalida.filter(actividad => actividad.etap_Id === IdEtapa).sort((a, b) => a.acti_Descripcion.localeCompare(b.acti_Descripcion));;
     }
  

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
    doc.text(`Reporte Artículos de Actividad`, doc.internal.pageSize.width / 2, 50, { align: 'center' });  
  
  
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
