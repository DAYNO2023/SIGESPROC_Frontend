import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardService } from 'src/app/demo/services/servicesgeneral/dashboard.service';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-incidentesactividadesdash',
  templateUrl: './incidentesactividadesdash.component.html',
  styleUrls: ['./incidentesactividadesdash.component.scss']
})
export class IncidentesactividadesdashComponent implements OnInit {
  barData: any;
  barOptions: any;
  reportForm: FormGroup;
  submitted: boolean = false;
  minDate: Date;
  maxDate: Date;  
  nodata : boolean = true;

  constructor(
    private service: DashboardService,
    private fb: FormBuilder,
    private messageService: MessageService,
    public cookieService: CookieService,
    private router: Router,
  ) {
    // Inicializar el formulario de fechas
    this.reportForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFinal: ['', Validators.required]
    });
  }

  ngOnInit() {

    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
      //console.log('Me mando el login pq el token me dio false')
    }
    this.initCharts();
    this.minDate = new Date();
    this.minDate.setFullYear(1920, 0, 1); // Año 1920, mes 0 (enero), día 1

    // Configuramos la fecha máxima como el 31 de diciembre de 2050
    this.maxDate = new Date();
    this.maxDate.setFullYear(3000, 11, 31); // Año 3000, mes 11 (diciembre), día 31
  }

  // Método para inicializar el estilo del gráfico
  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color-secondary');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.barOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (context.dataset.label === 'Costo Total de Incidencias') {
                const value = context.raw.toLocaleString();
                return `${label}: LPS ${value}`;
              } else {
                return `${label}: ${context.raw}`;
              }
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            display: false,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary,
            callback: function(value) {

              return 'LPS ' + value.toLocaleString();
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  // Método para listar incidencias filtradas por fecha
  ListadoFiltrado() {
    this.submitted = true;

    // Verificar si el formulario es válido
    if (this.reportForm.invalid) {
      return;
    }

    const { fechaInicio, fechaFinal } = this.reportForm.value;

    // Validar que la fecha final no sea anterior a la fecha de inicio
    if (new Date(fechaInicio) > new Date(fechaFinal)) {
      return;
    }

    // Formatear las fechas
    const formattedFechaInicio = this.formatDate(new Date(fechaInicio));
    const formattedFechaFinal = this.formatDate(new Date(fechaFinal));

    // Definir una mayor variedad de colores localmente
    const documentStyle = getComputedStyle(document.documentElement);
    const colors = [
      documentStyle.getPropertyValue('--blue-500'),
      documentStyle.getPropertyValue('--green-500'),
      documentStyle.getPropertyValue('--red-500'),
      documentStyle.getPropertyValue('--yellow-500'),
      documentStyle.getPropertyValue('--cyan-500')
    ];

    // Llamar al servicio para obtener los datos de incidencias
    this.service.IncidenciasPorfechas(formattedFechaInicio, formattedFechaFinal).subscribe(
        (data: any) => {
            // Verificar si los datos están vacíos
            if (!data || data.length === 0) {
              this.nodata = true;
              this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                styleClass: 'iziToast-custom',
                detail: 'No hay datos para este rango de fechas.',
                life: 3000
              });
              return;
            }
            else{
              this.nodata = false;
            }
        // Verifica si existe el campo "actividadNombre" en los datos
        const labels = data.map((item: any) => item.actividadNombre || 'Total'); // Ajusta esto según el nombre correcto
        const totalIncidencias = data.map((item: any) => parseInt(item.totalIncidencias));  // Asegúrate de que sea int
        const totalCostoIncidencias = data.map((item: any) => parseFloat(item.totalCostoIncidencias));  // Convertir a decimal si es necesario

        //console.log("Labels:", labels);
        //console.log("Total Incidencias:", totalIncidencias);
        //console.log("Total Costo Incidencias:", totalCostoIncidencias);

        // Asignar colores diferentes a cada barra
        const backgroundColorsIncidencias = totalIncidencias.map((_, index) => colors[index % colors.length]);
        const backgroundColorsCosto = totalCostoIncidencias.map((_, index) => colors[(index + 1) % colors.length]); // Usamos colores diferentes

        this.barData = {
          labels: labels,
          datasets: [
            {
              label: 'Total de Incidencias',
              backgroundColor: backgroundColorsIncidencias,
              borderColor: backgroundColorsIncidencias,
              data: totalIncidencias
            },
            {
              label: 'Costo Total de Incidencias',
              backgroundColor: backgroundColorsCosto,
              borderColor: backgroundColorsCosto,
              data: totalCostoIncidencias
            }
          ]
        };

        this.barData = { ...this.barData }; // Forzar actualización si es necesario
      },
      (error) => {
        console.error("Error al obtener los datos del servidor.");
      }
    );
  }

  // Método para formatear las fechas
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Añade un 0 delante si es necesario
    const day = ('0' + date.getDate()).slice(-2); // Añade un 0 delante si es necesario
    return `${year}-${month}-${day}`;
  }
}
