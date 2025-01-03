import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api'; // Import MessageService
import { DashboardService } from 'src/app/demo/services/servicesgeneral/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ventasporagente',
  templateUrl: './ventasporagente.component.html',
  styleUrl: './ventasporagente.component.scss'
})
export class VentasporagenteComponent {
    JefeObrafill: any[] | undefined //variable que filtra los Proyectos
    JefeObra: any[] = [];//variable que almacena los Proyectos
    barData: any;
    barOptions: any;
    pieOptions: any;
    form: FormGroup;
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
      this.form = this.fb.group({
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


      //Seleccion de proyecto con autocompletado
      onProyectoSelect(event: any) {
        const proyectoSeleccionada = event;
         this.form.patchValue({ agen_Id: proyectoSeleccionada.value.agen_Id, agen_Nombre:proyectoSeleccionada.value.agen_Nombre});

      }

      //filtro proyecto
      filterProyecto(event: any) {
        const query = event.query.toLowerCase();
        this.JefeObrafill = this.JefeObra.filter(jefe =>
          jefe.agen_Nombre.toLowerCase().includes(query)+
          jefe.agen_Apellido.toLowerCase().includes(query),

        );
      }


    comprasrealizadas(){
      const documentStyle = getComputedStyle(document.documentElement);

      this.submitted = true;
    if (this.form.invalid) {
        return; 
    }
    const { fechaInicio, fechaFinal } = this.form.value;


    if (new Date(fechaInicio) > new Date(fechaFinal)) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
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

      this.servicio.VentasPorAgente(formattedFechaInicio, formattedFechaFinal).subscribe(
          (data: any[]) => {
            if(data.length > 0){
              this.nodata = false;
            const labels = data.map((item: any) => item.nombreAgente);
            const datos = data.map((item: any) => item.cantidadVendida)
            this.datos = true

            this.barData = {
              labels: labels,
              datasets: [
                  {
                      borderColor: colors,
                      label:'cantidad vendida',
                      data: datos,
                      backgroundColor:colors,
                    hoverBackgroundColor: colors.map(color => color.replace('500', '400'))
                  }
              ]
          };

              // this.loading = false;
              this.submitted = false;
              console.log(data)
        }
        else{
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
