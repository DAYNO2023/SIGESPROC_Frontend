import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api'; // Import MessageService
import { DashboardService } from 'src/app/demo/services/servicesgeneral/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-totalesnominaanual',
  templateUrl: './totalesnominaanual.component.html',
  styleUrl: './totalesnominaanual.component.scss'
})
export class TotalesnominaanualComponent {
  barData: any;
  barOptions: any;
  pieOptions: any;
  reportForm: FormGroup;
  submitted: boolean = false;
  datos: boolean = false;
  nodata : boolean = true;

  constructor(
  private servicio : DashboardService,
    private messageService: MessageService, 
    private fb: FormBuilder,
    public cookieService: CookieService,
    private router: Router,
  ){
    this.reportForm = this.fb.group({
        fechaInicio: ['', Validators.required]
      });
  }
  
  ngOnInit(): void {
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
      console.log('Me mando el login pq el token me dio false')
    }
  }

  
  
  comprasrealizadas(){
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
        // this.loading = false; 
        return;
    }

    const formattedFechaInicio = this.formatDate(new Date(fechaInicio));

    const colors = [
      documentStyle.getPropertyValue('--blue-500'),
      documentStyle.getPropertyValue('--green-500'),
      documentStyle.getPropertyValue('--red-500'),
      documentStyle.getPropertyValue('--yellow-500'),
      documentStyle.getPropertyValue('--cyan-500')
    ];

    console.log('Fecha de inicio:', formattedFechaInicio);
  
    this.servicio.TotalPlanillaAnual(formattedFechaInicio).subscribe(
        (data: any[]) => {
          if(data.length > 0){
this.nodata = false;
          const labels = data.map((item: any) => item.meses);
          const datos = data.map((item: any) => item.totalM) 
       
          this.barData = {
            labels: labels,
            datasets: [
                {
                  label:'pagos por mes',
                    borderColor: colors,
                    data: datos,
                    fill: false,
                    backgroundColor: colors,
                  hoverBackgroundColor: colors.map(color => color.replace('500', '400')),
                  tension: .4

                }
            ]
        };
        
        this.pieOptions = {
          plugins: {
              legend: {
                  labels: {
                      fontColor: textColor
                  }
              },
              tooltip: {
                callbacks: {
                    label: (context) => {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.raw !== null) {
                            label += `LPS ${context.raw.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        }
                        return label;
                    }
                }
            }
          },
          scales: {
              x: {
                  ticks: {
                      color: textColor
                  },
                  grid: {
                      color: textColor,
                      drawBorder: false
                  }
              },
              y: {
                  ticks: {
                      color: textColor
                  },
                  grid: {
                      color: textColor,
                      drawBorder: false
                  }
              },
          }
      };
            this.submitted = false;
            this.datos = true;
            console.log(data)
          }
          else{
            this.nodata = true;
            this.datos = false;
            this.messageService.add({
              severity: 'warn',
              summary: 'Advertencia',
              detail: 'No hay datos en este año.'
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
