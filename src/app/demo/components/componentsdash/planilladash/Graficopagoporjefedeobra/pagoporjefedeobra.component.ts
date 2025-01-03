import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api'; // Import MessageService
import { DashboardService } from 'src/app/demo/services/servicesgeneral/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagoporjefedeobra',
  templateUrl: './pagoporjefedeobra.component.html',
  styleUrl: './pagoporjefedeobra.component.scss'
})
export class PagoporjefedeobraComponent {
  JefeObrafill: any[] | undefined //variable que filtra los Proyectos
  JefeObra: any[] = [];//variable que almacena los Proyectos
  barData: any;
  barOptions: any;
  pieOptions: any;
  form: FormGroup;
  submitted: boolean = false;
  datos: boolean = true;
  nodata : boolean = true;

  constructor(
  private servicio : DashboardService,
    private messageService: MessageService,
    private fb: FormBuilder,
    public cookieService: CookieService,
    private router: Router,
  ){
    this.form = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFinal: ['', Validators.required]
      });
  }

  ngOnInit(): void {
      this.servicio.JefesdeObra().subscribe((data: any)=>{
        this.JefeObra = data.sort((a, b) => a.empleado.localeCompare(b.empleado))
      })

      const token =  this.cookieService.get('Token');
      if(token == 'false'){
        this.router.navigate(['/auth/login'])
        console.log('Me mando el login pq el token me dio false')
      }
  }


    //Seleccion de proyecto con autocompletado
    onProyectoSelect(event: any) {
      const proyectoSeleccionada = event;
       this.form.patchValue({ empl_Id: proyectoSeleccionada.value.empl_Id, empleado:proyectoSeleccionada.value.empleado});

    }

    //filtro proyecto
    filterProyecto(event: any) {
      const query = event.query.toLowerCase();
      this.JefeObrafill = this.JefeObra.filter(jefe =>
        jefe.empleado.toLowerCase().includes(query)
      );
    }


  comprasrealizadas(){
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color-secondary');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.submitted = true;
    if (this.form.invalid) {
        return;
    }
    const { fechaInicio, fechaFinal } = this.form.value;


    if (new Date(fechaInicio) > new Date(fechaFinal)) {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'La fecha final no puede ser anterior a la fecha de inicio.'
        });
        // this.loading = false;
        return;
    }

    const formattedFechaInicio = this.formatDate(new Date(fechaInicio));
    const formattedFechaFinal = this.formatDate(new Date(fechaFinal));

    const colors = [
        documentStyle.getPropertyValue('--blue-500'),
        documentStyle.getPropertyValue('--green-500'),
        documentStyle.getPropertyValue('--red-500'),
        documentStyle.getPropertyValue('--yellow-500'),
        documentStyle.getPropertyValue('--cyan-500')
      ];


    this.servicio.PagosJefeObra(formattedFechaInicio, formattedFechaFinal).subscribe(
        (data: any[]) => {
          const labels = data.map((item: any) => item.empleado);
          const datos = data.map((item: any) => item.totalM);
          const cantidad = data.map((item: any) => item.totalMC)

          this.barData = {
            labels: labels,
            datasets: [
                {
                  label: "Cantidad pagada",
                    borderColor: colors,
                    data: datos,
                    backgroundColor: colors,
                  hoverBackgroundColor: colors.map(color => color.replace('500', '400'))
                },
                {
                  label: "cantidad de pagos",
                    borderColor: colors,
                    data: cantidad,
                    backgroundColor: colors,
                  hoverBackgroundColor: colors.map(color => color.replace('500', '400'))
                }
            ]
        };

        if(data.length > 0){
this.nodata = false;
        this.barOptions = {
          maintainAspectRatio: false,
          aspectRatio: 0.6,
          plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }

                        if (context.raw !== null) {
                            // Verifica si es el dataset de "Total de Compras"
                            if (context.dataset.label === 'Cantidad pagada') {
                                label += `LPS ${context.raw.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;
                            } else {
                                // Si es el dataset de "Número de Compras", solo muestra el valor sin formato de moneda
                                label += context.raw;
                            }
                        }
                        return label;
                    }
                }
            }
        },
          scales: {
              x: {
                  ticks: {
                      color: textColorSecondary
                  },
                  grid: {
                      color: surfaceBorder
                  }
              },
              y: {
                  ticks: {
                      color: textColorSecondary
                  },
                  grid: {
                      color: surfaceBorder
                  }
              }
          }
        };
            this.submitted = false;
            this.datos = false;
            console.log(data)
          }
          else {
this.nodata = true;
    this.datos = true;
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'No hay datos en estas fechas.'
  });
          }
        })


  }



preventManualInput(event: KeyboardEvent | InputEvent): void {
    event.preventDefault();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Añade un 0 delante si es necesario
    const day = ('0' + date.getDate()).slice(-2); // Añade un 0 delante si es necesario
    return `${year}-${month}-${day}`;
  }


}
