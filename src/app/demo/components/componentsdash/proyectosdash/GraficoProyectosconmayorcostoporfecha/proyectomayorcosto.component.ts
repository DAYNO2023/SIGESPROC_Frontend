import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardService } from 'src/app/demo/services/servicesgeneral/dashboard.service';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-proyectomayorcosto',
  templateUrl: './proyectomayorcosto.component.html',
  styleUrl: './proyectomayorcosto.component.scss'
})
export class ProyectomayorcostoComponent implements OnInit {
  barData: any;
  pieOptions: any;
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

  // Método para inicializar las opciones del gráfico
  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color-secondary');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.pieOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        tooltip: {
            callbacks: {
              label: function(context) {
                // Aquí agregamos el prefijo "LPS" a los valores del tooltip
                const label = context.dataset.label || '';
                const value = context.raw.toLocaleString(); // Formatear el valor con separadores de miles
                return `${label}: LPS ${value}`;
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
              callback: function(value: any) {
                // Aquí se agrega el prefijo "LPS" a los valores del eje Y
                return `LPS ${value.toLocaleString()}`;
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




  // Método para listar proyectos con mayor costo por fecha
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

    // Definir los colores aquí localmente
    const documentStyle = getComputedStyle(document.documentElement);
    const colors = [
      documentStyle.getPropertyValue('--blue-500'),
      documentStyle.getPropertyValue('--green-500'),
      documentStyle.getPropertyValue('--red-500'),
      documentStyle.getPropertyValue('--yellow-500'),
      documentStyle.getPropertyValue('--purple-500'),
      documentStyle.getPropertyValue('--orange-500'),
      documentStyle.getPropertyValue('--cyan-500'),
      documentStyle.getPropertyValue('--teal-500'),
      documentStyle.getPropertyValue('--pink-500'),
      documentStyle.getPropertyValue('--lime-500')
    ];

    // Llamar al servicio para obtener los proyectos con mayor costo
    this.service.MayorCostoPorFechas(formattedFechaInicio, formattedFechaFinal).subscribe(
      (data: any) => {
        //console.log("Datos recibidos:", data);
        if(!data || data.length=== 0)
            {
              this.nodata = true;
                this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No hay datos para este rango de fechas.', life: 3000 });
            }
            else{
              this.nodata = false;
            }
        // Usamos el campo "proyecto" de la API
        const labels = data.map((item: any) => item.proyecto || 'Sin nombre');  // Si "proyecto" es undefined, se mostrará 'Sin nombre'
        const totalCostoProyecto = data.map((item: any) => parseFloat(item.totalCostoProyecto));  // Asegúrate de que sea decimal

        // Verifica que los datos no estén vacíos
        //console.log("Labels:", labels);
        //console.log("Total Costo Proyecto:", totalCostoProyecto);

        // Asignar colores diferentes a cada proyecto
        const backgroundColors = labels.map((_, index) => colors[index % colors.length]);

        this.barData = {
          labels: labels,
          datasets: [
            {
              label: 'Costo Total del Proyecto',
              backgroundColor: backgroundColors,
              borderColor: backgroundColors,
              data: totalCostoProyecto
            }
          ]
        };

        // Forzar actualización si es necesario
        this.barData = { ...this.barData };
      },
      (error) => {
        console.error('Error al obtener los datos del servidor.');
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
