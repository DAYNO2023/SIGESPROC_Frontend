import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api'; // Import MessageService
import { DashboardService } from 'src/app/demo/services/servicesgeneral/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ventasbienesraicespormes', 
  templateUrl: './ventasbienesraicespormes.component.html',
  styleUrl: './ventasbienesraicespormes.component.scss'
})
export class VentasbienesraicespormesComponent {
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
            },
        }
      };
  }

  
  
  comprasrealizadas(){
    const documentStyle = getComputedStyle(document.documentElement);

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

    const colors = [
        documentStyle.getPropertyValue('--blue-500'),
        documentStyle.getPropertyValue('--green-500'),
        documentStyle.getPropertyValue('--red-500'),
        documentStyle.getPropertyValue('--yellow-500'),
        documentStyle.getPropertyValue('--cyan-500')
      ];

    this.servicio.VentaBienesRaicePorFecha(formattedFechaInicio, formattedFechaFinal).subscribe(
        (data: any[]) => {
        if(data.length > 0){
          const labels = data.map((item: any) => item.nombreTerreno);
          const datos = data.map((item: any) => item.cantidadVendida) 
       
          this.barData = {
            labels: labels,
            datasets: [
                {
                    label: "precio vendido",
                    borderColor: documentStyle.getPropertyValue('--primary-500'),
                    data: datos,
                    backgroundColor:colors,
                  hoverBackgroundColor: colors.map(color => color.replace('500', '400'))
                }
                ]
            };
            this.nodata = false;
            // this.loading = false; 
            this.datos = true
            this.submitted = false;
        }
        else if(data.length === 0){
          this.nodata = true;
            this.datos = false
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
