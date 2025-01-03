import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api'; // Import MessageService
import { DashboardService } from 'src/app/demo/services/servicesgeneral/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-deudadelempleado',
  templateUrl: './deudadelempleado.component.html',
  styleUrl: './deudadelempleado.component.scss'
})
export class DeudadelempleadoComponent {
  barData: any;
  barOptions: any;
  pieOptions: any;
  reportForm: FormGroup;
  submitted: boolean = false;
  lineOptions: any;
  lineData: any;
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
        fechaInicio: ['', Validators.required],
        fechaFinal: ['', Validators.required]
      });
  }
  
  ngOnInit(): void {
    const token =  this.cookieService.get('Token');
    if(token == 'false'){
      this.router.navigate(['/auth/login'])
      console.log('Me mando el login pq el token me dio false')
    }
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color-secondary');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    

    this.barData = {
      labels: ['agosto', 'febrero', 'martes'],
      datasets: [
          {
              borderColor: documentStyle.getPropertyValue('--primary-500'),
              data: [82, 70,1],
              backgroundColor: [
                documentStyle.getPropertyValue('--indigo-500'),
                documentStyle.getPropertyValue('--purple-500')
            ],
            hoverBackgroundColor: [
                documentStyle.getPropertyValue('--indigo-400'),
                documentStyle.getPropertyValue('--purple-400')
            ]
          }
      ]
  };

  this.pieOptions = {
    plugins: {
        legend: {
            labels: {
                usePointStyle: true,
                color: textColor
            }
        }
    }
};


  }
  
  
  comprasrealizadas(){
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color-secondary');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    
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
    const formattedFechaFinal = this.formatDate(new Date(fechaFinal));

    console.log('Fecha de inicio:', formattedFechaInicio);
    console.log('Fecha final:', formattedFechaFinal);
  
    this.servicio.ComprasRealizadas(formattedFechaInicio, formattedFechaFinal).subscribe(
        (data: any[]) => {
            if(data.length > 0 ){
              this.nodata = false;
          const labels = data.map((item: any) => item.mes);
          const datos = data.map((item: any) => item.numeroCompras) 
    this.datos = true;
       
          this.barData = {
            labels: labels,
            datasets: [
                {
                    borderColor: documentStyle.getPropertyValue('--primary-500'),
                    data: datos,
                    backgroundColor: [
                      documentStyle.getPropertyValue('--indigo-500'),
                      documentStyle.getPropertyValue('--primary-500'),
                      documentStyle.getPropertyValue('--cyan-200'),

                  ],
                  hoverBackgroundColor: [
                      documentStyle.getPropertyValue('--indigo-400'),
                      documentStyle.getPropertyValue('--yellow-200'),
                      documentStyle.getPropertyValue('--cyan-700'),

                  ]
                }
            ]
        };
        
        this.lineData = {
          labels: labels,
          datasets: [
              {
                  label: 'First Dataset',
                  data: datos,
                  fill: false,
                  backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                  borderColor: documentStyle.getPropertyValue('--primary-500'),
                  tension: .4
              },
             
          ]
      };
      this.lineOptions = {
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
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
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
            },
        }
    };
    
            // this.loading = false; 
            this.submitted = false;
            console.log(data)
    }
    else{
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
