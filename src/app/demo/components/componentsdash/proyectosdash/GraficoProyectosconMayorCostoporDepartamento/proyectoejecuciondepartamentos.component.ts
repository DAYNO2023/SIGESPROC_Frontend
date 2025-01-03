import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardService } from 'src/app/demo/services/servicesgeneral/dashboard.service';
import { MessageService } from 'primeng/api';
import { Estado } from '../../../../models/modelsgeneral/estadoviewmodel';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-proyectoejecuciondepartamentos',
  templateUrl: './proyectoejecuciondepartamentos.component.html',
  styleUrls: ['./proyectoejecuciondepartamentos.component.scss']
})
export class ProyectoejecuciondepartamentosComponent implements OnInit {
  reportForm: FormGroup;
  submitted: boolean = false;
  estadoInvalido: boolean = false;
  estados: Estado[] = [];
  filteredEstados: Estado[] = [];
  barData: any;
  chartOptions: any;
  colors: string[] = [];
  nodata : boolean = true;

  constructor(
    private service: DashboardService,
    private fb: FormBuilder,
    private messageService: MessageService,
    public cookieService: CookieService,
    private router: Router,
  ) {
    this.reportForm = this.fb.group({
      estado: ['', Validators.required]
    });
  }

  ngOnInit() {
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
      //console.log('Me mando el login pq el token me dio false')
    }
    this.loadEstados();
    this.initCharts();
    this.loadColors();
  }

  loadColors() {
    const documentStyle = getComputedStyle(document.documentElement);
    this.colors = [
      documentStyle.getPropertyValue('--blue-500'),
      documentStyle.getPropertyValue('--green-500'),
      documentStyle.getPropertyValue('--red-500'),
      documentStyle.getPropertyValue('--yellow-500'),
      documentStyle.getPropertyValue('--cyan-500')
    ];
  }

  loadEstados() {
    this.service.Listarestados().subscribe(
      (data: Estado[]) => {
        this.estados = data;
      },
      (error) => {
        console.error('Error al cargar los estados:', error);
      }
    );
  }

  filterEstados(event: any) {
    const query = event.query.toLowerCase();
    this.filteredEstados = this.estados.filter(estado => estado.esta_Nombre.toLowerCase().includes(query));
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color-secondary');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.raw.toLocaleString();
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

  ListadoFiltrado() {
    this.submitted = true;
    this.estadoInvalido = false;

    if (this.reportForm.invalid) {
      return;
    }

    const selectedEstado = this.reportForm.value.estado;
    //console.log('Estado seleccionado:', selectedEstado);

    if (!selectedEstado || !selectedEstado.esta_Id) {
      this.estadoInvalido = true;
      return;
    }

    this.service.ProyectosconMayorCostoporDepartamento(selectedEstado.esta_Id).subscribe(
      (data: any) => {
        //console.log('Datos recibidos:', data);
        if (!data || data.length === 0) {
          this.nodata = true;
          this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass: 'iziToast-custom', detail: 'No hay datos para esta opción.', life: 3000 });
          return;
        }else{
          this.nodata = false
        }

        const labels = data.map((item: any) => item.proyecto || 'Sin nombre');
        const totalCostoProyecto = data.map((item: any) => parseFloat(item.totalCostoProyecto));

        const backgroundColors = labels.map((_, index) => this.colors[index % this.colors.length]);

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

        this.barData = Object.assign({}, this.barData);
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
}
