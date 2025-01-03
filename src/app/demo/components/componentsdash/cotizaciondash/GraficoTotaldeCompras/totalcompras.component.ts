import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DashboardService } from 'src/app/demo/services/servicesgeneral/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-totalcompras',
  templateUrl: './totalcompras.component.html',
  styleUrl: './totalcompras.component.scss'
})
export class TotalcomprasComponent {
  lineData: any;  // Cambié barData a lineData para el gráfico de línea
  lineOptions: any;
  reportForm: FormGroup;
  submitted: boolean = false;
  minDate: Date;
  maxDate: Date;
  nodata : boolean = true;

  constructor(
    private servicio: DashboardService,
    private messageService: MessageService,
    private fb: FormBuilder,
    public cookieService: CookieService,
    private router: Router,
  ) {
    this.reportForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFinal: ['', Validators.required]
    });
  }

  ngOnInit(): void {

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

  comprasrealizadas() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--primary-50');

    this.submitted = true;

    if (this.reportForm.invalid) {
      return;
    }

    const { fechaInicio, fechaFinal } = this.reportForm.value;

    if (new Date(fechaInicio) > new Date(fechaFinal)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La fecha final no puede ser anterior a la fecha de inicio.'
      });
      return;
    }

    const formattedFechaInicio = this.formatDate(new Date(fechaInicio));
    const formattedFechaFinal = this.formatDate(new Date(fechaFinal));

    this.servicio.ComprasRealizadas(formattedFechaInicio, formattedFechaFinal).subscribe(
      (data: any[]) => {

        if(!data || data.length=== 0)
            {
              this.nodata = true;
                this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass:'iziToast-custom', detail: 'No hay datos para este rango de fechas.', life: 3000 });
            }
            else{
              this.nodata = false;
            }
        const labels = data.map((item: any) => item.meses);
        const numeroCompras = data.map((item: any) => item.numeroCompras);
        const totalCompraMes = data.map((item: any) => item.totalCompraMes);  // Prepend 'LPS' to totalCompraMes

        this.lineData = {
          labels: labels,
          datasets: [
            {
              label: 'Número de Compras',
              data: numeroCompras,
              fill: false,
              borderColor: documentStyle.getPropertyValue('--indigo-500'),
              tension: 0.4
            },
            {
              label: 'Total de Compras por Mes',
              data: totalCompraMes,
              fill: false,
              borderColor: documentStyle.getPropertyValue('--purple-500'),
              tension: 0.4
            }
          ]
        };

   this.lineOptions = {
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
          if (context.dataset.label === 'Total de Compras por Mes') {
            const value = context.raw.toLocaleString(); // Formatear con separadores de miles
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
        color: documentStyle.getPropertyValue('--text-color-secondary')
      },
      grid: {
        color: documentStyle.getPropertyValue('--surface-border')
      }
    },
    y: {
      ticks: {
        color: documentStyle.getPropertyValue('--text-color-secondary'),
        callback: function(value) {
          // Añadir "LPS" al eje Y para el total de compras
          return 'LPS ' + value.toLocaleString();
        }
      },
      grid: {
        color: documentStyle.getPropertyValue('--surface-border')
      }
    }
  }
};

        this.submitted = false;
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al obtener los datos del servidor.'
        });
      }
    );
  }

  preventManualInput(event: KeyboardEvent | InputEvent): void {
    event.preventDefault();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
}
