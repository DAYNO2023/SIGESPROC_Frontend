import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/demo/services/servicesgeneral/dashboard.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ubicacionmasenviada',
  templateUrl: './ubicacionmasenviada.component.html',
  styleUrl: './ubicacionmasenviada.component.scss'
})
export class UbicacionmasenviadaComponent implements OnInit {
  barOptions: any;
  barData: any;
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
    // Inicialización del formulario con los campos de fecha
    this.reportForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFinal: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.initCharts();
    this.minDate = new Date();
    this.minDate.setFullYear(1920, 0, 1); // Año 1920, mes 0 (enero), día 1
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
      //console.log('Me mando el login pq el token me dio false')
    }
    // Configuramos la fecha máxima como el 31 de diciembre de 2050
    this.maxDate = new Date();
    this.maxDate.setFullYear(3000, 11, 31); // Año 3000, mes 11 (diciembre), día 31
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color-secondary');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.barOptions = {
      plugins: {
        legend: {
          labels: {
            fontColor: textColor
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
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  // Método para cargar datos filtrados por fecha
  ListadoFiltrado() {
    this.submitted = true;

    // Verifica que el formulario es válido
    if (this.reportForm.invalid) {
      return;
    }

    const { fechaInicio, fechaFinal } = this.reportForm.value;

    if (new Date(fechaInicio) > new Date(fechaFinal)) {
      return;
    }

    // Llama al servicio con las fechas
    const formattedFechaInicio = this.formatDate(new Date(fechaInicio));
    const formattedFechaFinal = this.formatDate(new Date(fechaFinal));

    // Mover la definición de los colores aquí dentro
    const documentStyle = getComputedStyle(document.documentElement);
    const colors = [
      documentStyle.getPropertyValue('--blue-500'),
      documentStyle.getPropertyValue('--green-500'),
      documentStyle.getPropertyValue('--red-500'),
      documentStyle.getPropertyValue('--yellow-500'),
      documentStyle.getPropertyValue('--cyan-500')
    ];

    this.service.UbicacionesCompra(formattedFechaInicio, formattedFechaFinal).subscribe(
      (data: any) => {

        if(!data || data.length=== 0)
            {
              this.nodata = true;
                this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No hay datos para este rango de fechas.', life: 3000 });
            }
            else{
              this.nodata = false;
            }
        const labels = data.map((item: any) => item.destino);
        const datos = data.map((item: any) => item.cantidadEnvios);

        // Usa los colores definidos en el CSS
        const backgroundColors = datos.map((_, index) => colors[index % colors.length]);
        const hoverBackgroundColors = backgroundColors.map(color => color.replace('500', '400'));

        this.barData = {
          labels: labels,
          datasets: [
            {
              label: 'Compras por Ubicación',
              borderColor: backgroundColors,
              data: datos,
              backgroundColor: backgroundColors,
              hoverBackgroundColor: hoverBackgroundColors
            }
          ]
        };
      },
      (error) => {
        console.error('Error al obtener los datos del servidor');
      }
    );
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Añade un 0 delante si es necesario
    const day = ('0' + date.getDate()).slice(-2); // Añade un 0 delante si es necesario
    return `${year}-${month}-${day}`;
  }
}
