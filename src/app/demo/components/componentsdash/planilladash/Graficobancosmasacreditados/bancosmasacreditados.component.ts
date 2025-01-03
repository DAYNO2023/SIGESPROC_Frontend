import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api'; // Import MessageService
import { DashboardService } from 'src/app/demo/services/servicesgeneral/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bancosmasacreditados',
  templateUrl: './bancosmasacreditados.component.html',
  styleUrl: './bancosmasacreditados.component.scss'
})
export class BancosmasacreditadosComponent {

  barOptions: any;
    countryChart: any;
    barData: any;
    countryChartOptions: any;
    top5List: any;
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
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  cargarDatosTop5Articulos() {
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

    const colors = [
        documentStyle.getPropertyValue('--blue-500'),
        documentStyle.getPropertyValue('--green-500'),
        documentStyle.getPropertyValue('--red-500'),
        documentStyle.getPropertyValue('--yellow-500'),
        documentStyle.getPropertyValue('--cyan-500')
      ];


    this.service.BancosMasAcreditados(formattedFechaInicio, formattedFechaFinal).subscribe((data : any) => {
      if(data.length > 0){
        this.nodata = false;
        this.datos = true;
        const labels = data.map(item => item.banco);
        const dataTotalCompra = data.map(item => item.numeroAcreditaciones);
        const numeroCompras = data.map(item => item.numeroAcreditaciones); // Nuevo dato para el número de compras
        const totalCompras = dataTotalCompra.reduce((acc, val) => acc + val, 0); // Suma total de compras


        this.countryChart = {
            labels: labels,
            datasets: [
                {
                    data: dataTotalCompra,
                    backgroundColor: colors,
                    hoverBackgroundColor: colors.map(color => color.replace('500', '400'))
                }
            ]
        };

        // Generar opciones para el gráfico con las tooltips personalizadas
        this.countryChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: documentStyle.getPropertyValue('--text-color')
                    }
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                        let label = context.label || '';
                        if (label) {
                            label += ', ';
                        }
                        if (context.raw !== null) {
                            label += `Acreditaciones: ${context.raw.toLocaleString('es-HN', { })}`;
                        }
                        return label;
                    }
                }
                }
            },
            cutout: '60%'
        };

        // Datos para la lista de detalles, ahora incluye el número de compras y el valor formateado con "LPS"
        this.top5List = data.map((item, index) => ({
            nombre: item.articulo,
            porcentaje: ((item.totalCompra / totalCompras) * 100).toFixed(2),
            numeroCompras: item.numeroCompras, // Agregamos número de compras
            color: colors[index],
            boxShadow: `0px 0px 10px rgba(0, 0, 0, 0.2)`
        }));
      }
      else{
        this.nodata = true;
        this.datos = false;
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No hay datos en estas fechas.'
        });
      }
    });

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
