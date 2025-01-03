import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api'; // Import MessageService
import { DashboardService } from 'src/app/demo/services/servicesgeneral/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fletesasociadosaproyectos',
  templateUrl: './fletesasociadosaproyectos.component.html',
  styleUrl: './fletesasociadosaproyectos.component.scss'
})
export class FletesasociadosaproyectosComponent {

  barOptions: any;
  barData: any;
  reportForm: FormGroup;
  submitted: boolean = false;
  datos: boolean = false;
  nodata : boolean = true;

constructor(
  private service: DashboardService,
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

  ngOnInit(){

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
                  color: textColor
              }
          }
      },
      scales: {
          r: {
              grid: {
                  color: textColorSecondary
              },
              pointLabels: {
                  color: textColorSecondary
              }
          }
      }
  };
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  Listado(){
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

    this.service.FletesAsociadosProyecto(formattedFechaInicio,formattedFechaFinal).subscribe(
      (data: any) =>{
        console.log(data)
       const labels = data.map((item: any) => item.proy_Nombre);
       const datos = data.map((item: any) => item.totalFletesDestinoProyecto) 
       
       this.datos = true;

        for (let index = 0; index < labels.length; index++) {
          const element = labels[index];
          
        }
        this.barData = {
              labels: labels,
              datasets: [
                {
                  label: "Fletes",
                    borderColor: colors,
                    pointBackgroundColor: documentStyle.getPropertyValue('--primary-400'),
                    data: datos,
                   
                  pointhoverBackgroundColor: colors.map(color => color.replace('500', '400'))
                }
            ]
        };
       
        if(data.length === 0){
          this.nodata = true;
        this.datos = false;
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No hay datos en estas fechas.'
        });
      }
      else{
        this.nodata = false;
      }
      }
    )

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
