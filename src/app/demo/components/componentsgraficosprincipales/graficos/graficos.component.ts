import { Component } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { graficosServices } from 'src/app/demo/services/servicesgeneral/graficos.service';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { ChangeDetectorRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-graficos',
  templateUrl: './graficos.component.html',
  styleUrl: './graficos.component.scss'
})
export class GraficosComponent {


    data: any;
    top5List: any;
    countryChart: any;
    optionsTop5: any;
    countryChartOptions: any;
    options: any;
    menuOutsideClickListener: any;
    insumoChart: any;
    insumoChartOptions: any;
    insumoChartList: any[] = [];

    maquinariaChart: any;
    maquinariaChartOptions: any;
    maquinariaChartList: any[] = [];
    simboloMoneda: string = '';
    equipoChart: any;
    equipoChartOptions: any;
    equipoChartList: any[] = [];
    top5ProyectosList: any[] = [];
    proyectoChart: any;
    proyectoChartOptions: any;
    departamentoChart: any;
    departamentoChartOptions: any;
    totalIncidencias: number = 0;
    totalIncidenciasproy: number = 0;
    totalCostoIncidencias: number = 0;
    mesActual: string = '';
    proyectotop5Chart: any;
    proyectotop5ChartOptions: any;
    proyectotop5List: any[] = [];
    promedioCostoPorProyecto: number = 0;
    promedioTiempoProyectos: number;

    proveedorChart: any;
    proveedorChartOptions: any;
    top5ProveedoresList: any[] = [];
    mesActualterre: number;
    incidenciasFletesChart: any;
    incidenciasFletesChartOptions: any;
    mesActualflete: number = new Date().getMonth() + 1;
    mesActualTexto: string = '';
    totalFletesMensuales: number = 0;

    ventasPorAgenteChart: any;
    ventasPorAgenteChartOptions: any;

    terrenosVendidosChart: any;
  terrenosVendidosChartOptions: any;

  bienesRaicesChart: any;
  bienesRaicesChartOptions: any;

  anioActual: number = new Date().getFullYear(); // Obtener el año actual


    bodegasChart: any;
    bodegasChartOptions: any;
    top5BodegasList: any[] = [];

    proyectosChart: any;
    proyectosChartOptions: any;

    constructor(
        private charts:ChartModule,
        private graficosService: graficosServices,
        public globalmoneda : globalmonedaService,
        private cdr: ChangeDetectorRef,
        public cookieService: CookieService,
        private router: Router,
    ) {}

    ngOnInit() {

      const token = this.cookieService.get('Token');
      if(token == 'false'){
        this.router.navigate(['/auth/login'])
      }
        this.cargarDatosVentasPorAgentes();
        this.cargarDatosCompras();
        this.cargarDatosTerrenosVendidos();
        this.cargarDatosTop5Proyectos();
        this.cargarDatosTop5Articulos();
        // Asegúrate de obtener el mes y año actuales correctamente
this.mesActualterre = new Date().getMonth() + 1; // Enero es 0, por eso sumamos 1
this.anioActual = new Date().getFullYear();

        this.obtenerDatosDashboard();
        this.cargarDatosBienesRaices();
        this.cargarProyectosMayorPresupuesto();
        this.cargarDatosTop5PorTipo();
        this.obtenerMesActualTexto();
        this.cargarDatosProyectosMasEnviados();
        this.cargarDatosTop5Bodegas();
        this.obtenerMesActual();
        this.cargarDatosIncidenciasFletes();
        this.obtenerPromedioTiempoProyectos();
        this.obtenerPromedioCostosProyectos();
        this.cargarProyectosPorDepartamento();
        this.cargarDatosTop5Proveedores();
        this.globalmoneda.setState();
        this.simboloMoneda = this.globalmoneda.getState().mone_Abreviatura || 'USD';  // Default a 'USD' si no existe
    }
    cargarDatosTop5Articulos() {
        this.graficosService.ListarTop5GlobaldeArticulos().subscribe(res => {
            const labels = res.map(item => item.articulo);
            const dataTotalCompra = res.map(item => item.totalCompra);
            const numeroCompras = res.map(item => item.numeroCompras); // Nuevo dato para el número de compras
            const totalCompras = dataTotalCompra.reduce((acc, val) => acc + val, 0); // Suma total de compras

            const documentStyle = getComputedStyle(document.documentElement);
            const colors = [
                documentStyle.getPropertyValue('--blue-500'),
                documentStyle.getPropertyValue('--green-500'),
                documentStyle.getPropertyValue('--red-500'),
                documentStyle.getPropertyValue('--yellow-500'),
                documentStyle.getPropertyValue('--cyan-500')
            ];

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
                            label: function(tooltipItem) {
                                // Agregar "LPS" al valor total de compra en las tooltips
                                const value = tooltipItem.raw;
                                return `LPS ${value.toLocaleString()}`;
                            }
                        }
                    }
                },
                cutout: '60%'
            };

            // Datos para la lista de detalles, ahora incluye el número de compras y el valor formateado con "LPS"
            this.top5List = res.map((item, index) => ({
                nombre: item.articulo,
                porcentaje: ((item.totalCompra / totalCompras) * 100).toFixed(2),
                numeroCompras: item.numeroCompras, // Agregamos número de compras
                color: colors[index],
                boxShadow: `0px 0px 10px rgba(0, 0, 0, 0.2)`
            }));
        });
    }

    cargarDatosBienesRaices() {
      this.graficosService.ListarBienraiz().subscribe(res => {
        //console.log('bienes raicesss '+res);
          if (res && res.length > 0) {
              const data = res[0];  // Tomamos el primer resultado

              // Datos para los gráficos
              const labels = ['Bienes Totales', 'Vendidos', 'No Vendidos'];
              const dataValues = [data.totalBienesRaices, data.totalVendidos, data.totalNoVendidos];
              const dataPorcentajes = [data.porcentajeVendidos, data.porcentajeNoVendidos];

              const documentStyle = getComputedStyle(document.documentElement);
              const colors = [
                  documentStyle.getPropertyValue('--green-500'),
                  documentStyle.getPropertyValue('--red-500'),
                  documentStyle.getPropertyValue('--blue-500')
              ];

              // Configurar el gráfico mixto (barras y línea)
              this.bienesRaicesChart = {
                  labels: labels,
                  datasets: [
                      {
                          type: 'bar',
                          label: 'Cantidad Total',
                          data: dataValues,
                          backgroundColor: colors,
                          borderColor: colors,
                          borderWidth: 1
                      },
                      {
                          type: 'line',
                          label: 'Porcentaje (%)',
                          data: [100, data.porcentajeVendidos, data.porcentajeNoVendidos],
                          borderColor: documentStyle.getPropertyValue('--yellow-500'),
                          fill: false,
                          tension: 0.4,
                          pointBackgroundColor: documentStyle.getPropertyValue('--yellow-500')
                      }
                  ]
              };

              // Opciones del gráfico
              this.bienesRaicesChartOptions = {
                  plugins: {
                      legend: {
                          labels: {
                              color: documentStyle.getPropertyValue('--text-color')
                          }
                      },
                      tooltip: {
                          callbacks: {
                              label: (context) => {
                                  let label = context.dataset.label || '';
                                  if (label) {
                                      label += ': ';
                                  }
                                  if (context.dataset.type === 'line') {
                                      label += context.raw + '%';
                                  } else {
                                      label += context.raw;
                                  }
                                  return label;
                              }
                          }
                      }
                  },
                  scales: {
                      x: {
                          ticks: {
                              color: documentStyle.getPropertyValue('--text-color')
                          },
                          grid: {
                              color: documentStyle.getPropertyValue('--surface-border')
                          }
                      },
                      y: {
                          ticks: {
                              color: documentStyle.getPropertyValue('--text-color')
                          },
                          grid: {
                              color: documentStyle.getPropertyValue('--surface-border')
                          }
                      }
                  }
              };
          } else {
              //console.error('No se encontraron datos de bienes raíces.');
          }
      });
  }


    cargarDatosTerrenosVendidos() {
      // Asegúrate de obtener el mes y año actuales antes de filtrar
      this.mesActualterre = new Date().getMonth() + 1; // Obtener el mes actual
      this.anioActual = new Date().getFullYear(); // Obtener el año actual

      this.graficosService.ListarTerrenosVendidos().subscribe(res => {
          // Filtrar los datos por el mes y año actual
          const terrenosDelMes = res.filter(item => item.mes === this.mesActualterre && item.anio === this.anioActual);

          // Verifica si hay datos para el mes actual
          if (terrenosDelMes.length > 0) {
              const labels = terrenosDelMes.map(item => item.nombreTerreno);
              const dataPrecios = terrenosDelMes.map(item => item.precioFinalVenta);

              const documentStyle = getComputedStyle(document.documentElement);
              const textColor = documentStyle.getPropertyValue('--text-color');

              const colors = [
                documentStyle.getPropertyValue('--blue-500'),
                documentStyle.getPropertyValue('--green-500'),
                documentStyle.getPropertyValue('--red-500'),
                documentStyle.getPropertyValue('--yellow-500'),
                documentStyle.getPropertyValue('--cyan-500')
              ];
              // Configurar el gráfico tipo bar
              this.terrenosVendidosChart = {
                  labels: labels,
                  datasets: [
                    {
                      label: 'Precio Final de Venta (LPS)',
                      data: dataPrecios,
                      backgroundColor: colors,
                      hoverBackgroundColor: colors.map(color => color.replace('500', '400'))
                    }
                  ]
              };

              this.terrenosVendidosChartOptions = {
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
                          label += context.raw !== null ? `LPS ${context.raw.toLocaleString()}` : '';
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
                        color: documentStyle.getPropertyValue('--surface-border')
                      }
                    },
                    y: {
                      ticks: {
                        color: textColor,
                        callback: function(value) {
                          return `LPS ${value.toLocaleString()}`;  // Formatear el eje y con moneda
                        }
                      },
                      grid: {
                        color: documentStyle.getPropertyValue('--surface-border')
                      }
                    }
                  }
              };
          } else {
              //console.error('No se encontraron terrenos vendidos para el mes actual.');
          }
      });
  }

      cargarDatosVentasPorAgentes() {
        this.graficosService.ListarVentasPorAgentes().subscribe(res => {
          // Ordenar por cantidad vendida
          const agentesOrdenados = res.sort((a, b) => b.cantidadVendida - a.cantidadVendida);

          const labels = agentesOrdenados.map(item => item.agen_NombreCompleto);
          const dataVentas = agentesOrdenados.map(item => item.cantidadVendida);

          const totalVentas = dataVentas.reduce((a, b) => a + b, 0); // Sumar todas las ventas para calcular el porcentaje

          const documentStyle = getComputedStyle(document.documentElement);
          const colors = [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--red-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--cyan-500')
          ];

          // Configurar el gráfico tipo pie con datalabels
          this.ventasPorAgenteChart = {
            labels: labels,
            datasets: [
              {
                data: dataVentas,
                backgroundColor: colors,
                hoverBackgroundColor: colors.map(color => color.replace('500', '400'))
              }
            ]
          };

          // Opciones del gráfico
          this.ventasPorAgenteChartOptions = {
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
                      label += ': ';
                    }
                    label += context.raw !== null ? `${context.raw} ventas` : '';
                    return label;
                  }
                }
              },
              // Asegúrate de registrar el plugin aquí
              datalabels: {
                formatter: (value, ctx) => {
                  let percentage = (value / totalVentas * 100).toFixed(2) + '%';
                  return percentage; // Mostrar porcentaje encima del gráfico
                },
                color: '#fff',
                font: {
                  weight: 'bold',
                  size: 14
                }
              }
            },
            cutout: '0%' // Elimina el centro para un gráfico de "pie"
          };
        });
      }

    cargarDatosTop5Bodegas() {
        this.graficosService.ListarTopBodegas().subscribe(res => {
          // Filtrar los 5 principales destinos (bodegas) con más fletes
          const top5Bodegas = res.sort((a, b) => b.numeroFletes - a.numeroFletes).slice(0, 5);

          const labels = top5Bodegas.map(item => item.destino);
          const dataFletes = top5Bodegas.map(item => item.numeroFletes);

          const totalFletes = dataFletes.reduce((acc, val) => acc + val, 0);

          const documentStyle = getComputedStyle(document.documentElement);
          const colors = [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--red-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--cyan-500')
          ];

          // Configuración del gráfico
          this.bodegasChart = {
            labels: labels,
            datasets: [
              {
                data: dataFletes,
                backgroundColor: colors,
                hoverBackgroundColor: colors.map(color => color.replace('500', '400'))
              }
            ]
          };

          this.bodegasChartOptions = {
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
                      label += ': ';
                    }
                    if (context.raw !== null) {
                      label += `${context.raw} fletes`;
                    }
                    return label;
                  }
                }
              }
            },
            cutout: '60%'
          };

          // Datos para la lista de detalles
          this.top5BodegasList = top5Bodegas.map((item, index) => ({
            destino: item.destino,
            numeroFletes: item.numeroFletes,
            porcentaje: ((item.numeroFletes / totalFletes) * 100).toFixed(2),
            color: colors[index],
            boxShadow: `0px 0px 10px rgba(0, 0, 0, 0.2)`
          }));
        });
      }

      cargarDatosIncidenciasFletes() {
        this.graficosService.Listartasaincidenciasfletes().subscribe(res => {
          // Filtrar solo los datos del mes actual
          const datosDelMes = res.filter(item => item.mes === this.mesActualflete);

          if (datosDelMes.length > 0) {
            this.totalIncidencias = datosDelMes[0].incidenciasTotales;
            this.totalFletesMensuales = datosDelMes[0].numeroFletesMensuales;
          }
        });
      }

      obtenerMesActualTexto() {
        const meses = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',
          'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        this.mesActualTexto = meses[this.mesActualflete - 1]; // Ajustar índice de mes
      }
    obtenerDatosDashboard() {
        this.graficosService.DashboardIncidenciasPorMes().subscribe((data) => {
          if (data && data.length > 0) {
            this.totalIncidenciasproy = data[0].totalIncidencias;
            this.totalCostoIncidencias = data[0].totalCostoIncidencias;
          }
        });
      }
      obtenerMesActual() {
        const meses = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',
          'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        const fechaActual = new Date();
        this.mesActual = meses[fechaActual.getMonth()];
      }

    cargarProyectosPorDepartamento() {
        this.graficosService.ListarProyectosPorDepartamentos().subscribe(res => {
            //console.log('Datos recibidos:', res); // Verifica los datos recibidos
           // , ${item.ciud_Descripcion}
            const labels = res.map(item => `${item.esta_Nombre}`); // Estado y ciudad concatenados
            const dataCantidad = res.map(item => item.cantidad_Proyectos); // Cantidad de proyectos por estado y ciudad

            const documentStyle = getComputedStyle(document.documentElement);
            const colors = [
                documentStyle.getPropertyValue('--blue-500'),
                documentStyle.getPropertyValue('--green-500'),
                documentStyle.getPropertyValue('--red-500'),
                documentStyle.getPropertyValue('--yellow-500'),
                documentStyle.getPropertyValue('--cyan-500'),
                documentStyle.getPropertyValue('--purple-500')
            ];

            // Configurar el gráfico tipo bar
            this.departamentoChart = {
                labels: labels,
                datasets: [
                    {
                        data: dataCantidad, // Usamos 'Cantidad_Proyectos' para el gráfico
                        backgroundColor: colors,
                        hoverBackgroundColor: colors.map(color => color.replace('500', '400'))
                    }
                ]
            };

            this.departamentoChartOptions = {
                plugins: {
                    legend: {
                        display: false, // Si no deseas mostrar la leyenda
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Cantidad de Proyectos: ${context.raw}`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: documentStyle.getPropertyValue('--text-color')
                        },
                        grid: {
                            color: documentStyle.getPropertyValue('--surface-border')
                        }
                    },
                    y: {
                        ticks: {
                            color: documentStyle.getPropertyValue('--text-color')
                        },
                        grid: {
                            color: documentStyle.getPropertyValue('--surface-border')
                        }
                    }
                }
            };
        });
    }

    cargarDatosTop5Proveedores() {
        this.graficosService.ListarTopProveedores().subscribe(res => {
          // Filtrar los 5 principales proveedores
          const top5Proveedores = res.sort((a, b) => b.numeroDeCotizaciones - a.numeroDeCotizaciones).slice(0, 5);

          const labels = top5Proveedores.map(item => item.prov_Descripcion);
          const dataCotizaciones = top5Proveedores.map(item => item.numeroDeCotizaciones);

          const totalCotizaciones = dataCotizaciones.reduce((acc, val) => acc + val, 0);

          const documentStyle = getComputedStyle(document.documentElement);
          const colors = [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--red-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--cyan-500')
          ];

          // Configurar el gráfico
          this.proveedorChart = {
            labels: labels,
            datasets: [
              {
                data: dataCotizaciones,
                backgroundColor: colors,
                hoverBackgroundColor: colors.map(color => color.replace('500', '400'))
              }
            ]
          };

          this.proveedorChartOptions = {
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
                      label += ': ';
                    }
                    if (context.raw !== null) {
                      label += `${context.raw} cotizaciones`;
                    }
                    return label;
                  }
                }
              }
            },
            cutout: '60%'
          };

          // Datos para la lista de detalles
          this.top5ProveedoresList = top5Proveedores.map((item, index) => ({
            nombre: item.prov_Descripcion,
            numeroDeCotizaciones: item.numeroDeCotizaciones,
            porcentaje: ((item.numeroDeCotizaciones / totalCotizaciones) * 100).toFixed(2),
            color: colors[index],
            boxShadow: `0px 0px 10px rgba(0, 0, 0, 0.2)`
          }));
        });
      }

    obtenerPromedioCostosProyectos() {
        this.graficosService.ListarProyectos().subscribe((proyectos) => {
          if (proyectos && proyectos.length > 0) {
            let totalCostos = 0;

            // Sumar los costos de todos los proyectos
            proyectos.forEach((proyecto) => {
              const totalProyecto =
                proyecto.proy_CostoIncidencias|| 0 +
                proyecto.proy_CostoEquipoSeguridad|| 0 +
                proyecto.proy_CostoMaquinaria|| 0 +
                proyecto.proy_CostoInsumos|| 0 +
                proyecto.proy_PrecioManoObra|| 0;

              totalCostos += totalProyecto;
            });

            // Calcular el promedio
            this.promedioCostoPorProyecto = totalCostos / proyectos.length;
          }
        });
      }

      cargarDatosProyectosMasEnviados() {
        this.graficosService.ListarProyectosmasEnviados().subscribe(res => {
          // Filtrar los proyectos y ordenar por totalFletesDestinoProyecto
          const proyectosOrdenados = res.sort((a, b) => b.totalFletesDestinoProyecto - a.totalFletesDestinoProyecto).slice(0, 5);

          const labels = proyectosOrdenados.map(item => item.proy_Nombre);
          const dataFletes = proyectosOrdenados.map(item => item.totalFletesDestinoProyecto);

          const documentStyle = getComputedStyle(document.documentElement);
          const textColor = documentStyle.getPropertyValue('--text-color');

          const colors = [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--red-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--cyan-500')
          ];

          // Configurar el gráfico
          this.proyectosChart = {
            labels: labels,
            datasets: [
              {
                label: 'Total de Fletes Enviados',
                data: dataFletes,
                backgroundColor: colors,
                hoverBackgroundColor: colors.map(color => color.replace('500', '400'))

              }
            ]
          };

          this.proyectosChartOptions = {
            plugins: {
              legend: {
                labels: {
                  color: textColor
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    let label = context.label || '';
                    if (label) {
                      label += ': ';
                    }
                    label += context.raw !== null ? `${context.raw} fletes` : '';
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
                  color: documentStyle.getPropertyValue('--surface-border')
                }
              },
              y: {
                ticks: {
                  color: textColor
                },
                grid: {
                  color: documentStyle.getPropertyValue('--surface-border')
                }
              }
            }
          };
        });
      }

      obtenerPromedioTiempoProyectos() {
        this.graficosService.ListarProyectos().subscribe((proyectos) => {
          if (proyectos && proyectos.length > 0) {
            let totalDias = 0;

            // Iterar sobre cada proyecto y calcular la diferencia entre las fechas
            proyectos.forEach((proyecto) => {
              const fechaInicio = new Date(proyecto.proy_FechaInicio);
              const fechaFin = new Date(proyecto.proy_FechaFin);

              // Calcular la diferencia en milisegundos y convertirla a días
              const diferenciaEnDias = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 3600 * 24);
              totalDias += diferenciaEnDias;
            });

            // Calcular el promedio de días
            this.promedioTiempoProyectos = totalDias / proyectos.length;
          }
        });
      }

      cargarProyectosMayorPresupuesto() {
        this.graficosService.ListarProyectosMayorPresupuesto().subscribe(res => {
            // Filtrar los 5 proyectos con mayor presupuesto
            const top5Proyectos = res.sort((a, b) => b.presupuestoTotal - a.presupuestoTotal).slice(0, 5);

            const labels = top5Proyectos.map(item => item.proy_Nombre); // Nombres de los proyectos
            const dataPresupuesto = top5Proyectos.map(item => item.presupuestoTotal); // Presupuesto total por proyecto

            const documentStyle = getComputedStyle(document.documentElement);
            const colors = [
                documentStyle.getPropertyValue('--blue-500'),
                documentStyle.getPropertyValue('--green-500'),
                documentStyle.getPropertyValue('--red-500'),
                documentStyle.getPropertyValue('--yellow-500'),
                documentStyle.getPropertyValue('--cyan-500')
            ];

            // Configurar el gráfico tipo doughnut
            this.proyectoChart = {
                labels: labels,
                datasets: [
                    {
                        data: dataPresupuesto,
                        backgroundColor: colors,
                        hoverBackgroundColor: colors.map(color => color.replace('500', '400'))
                    }
                ]
            };

            this.proyectoChartOptions = {
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
                cutout: '60%' // Hacer que el gráfico tenga forma de doughnut
            };

            // Crear la lista de detalles de los proyectos
            this.top5ProyectosList = top5Proyectos.map((item, index) => ({
                nombre: item.proy_Nombre,
                presupuestoTotal: `LPS ${item.presupuestoTotal.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                color: colors[index],
                boxShadow: `0px 0px 10px rgba(0, 0, 0, 0.2)`
            }));
        });
    }


    cargarDatosTop5PorTipo() {
        this.graficosService.ListarTop5deCadaArticulos().subscribe(res => {
            // Filtrar los datos por tipo de artículo
            const top5Insumos = res.filter(item => item.tipoArticulo === 'Insumo').sort((a, b) => b.numeroCompras - a.numeroCompras).slice(0, 5);
            const top5Maquinarias = res.filter(item => item.tipoArticulo === 'Maquinaria').sort((a, b) => b.numeroCompras - a.numeroCompras).slice(0, 5);
            const top5Equipos = res.filter(item => item.tipoArticulo === 'Equipo de Seguridad').sort((a, b) => b.numeroCompras - a.numeroCompras).slice(0, 5);

            // Crear los gráficos para cada tipo de artículo
            this.crearGrafico(top5Insumos, 'insumoChart', 'insumoChartOptions', 'Insumos');
            this.crearGrafico(top5Maquinarias, 'maquinariaChart', 'maquinariaChartOptions', 'Maquinarias');
            this.crearGrafico(top5Equipos, 'equipoChart', 'equipoChartOptions', 'Equipos de Seguridad');
        });
    }

    cargarDatosTop5Proyectos() {
        this.graficosService.ListarProyectos().subscribe(res => {
            // Procesar los datos para obtener el total de costos
            const proyectos = res.map(item => ({
                nombre: item.proy_Nombre,
                costoTotal: (
                    (item.proy_CostoIncidencias || 0) +
                    (item.proy_CostoEquipoSeguridad || 0) +
                    (item.proy_CostoMaquinaria || 0) +
                    (item.proy_CostoInsumos || 0) +
                    (item.proy_PrecioManoObra || 0)
                )
            }));

            // Ordenar los proyectos por el costo total de manera descendente
            proyectos.sort((a, b) => b.costoTotal - a.costoTotal);

            // Obtener los 5 proyectos con mayor costo total
            const top5Proyectos = proyectos.slice(0, 5);

            // Extraer etiquetas y datos para el gráfico
            const labels = top5Proyectos.map(item => item.nombre);
            const data = top5Proyectos.map(item => item.costoTotal);

            // Obtener colores de la configuración de la aplicación
            const documentStyle = getComputedStyle(document.documentElement);
            const colors = [
                documentStyle.getPropertyValue('--blue-500'),
                documentStyle.getPropertyValue('--green-500'),
                documentStyle.getPropertyValue('--red-500'),
                documentStyle.getPropertyValue('--yellow-500'),
                documentStyle.getPropertyValue('--cyan-500')
            ];

            // Configuración del gráfico
            this.proyectotop5Chart = {
                labels: labels,
                datasets: [
                    {
                        label: 'Costo Total de Proyectos',
                        data: data,
                        backgroundColor: colors,
                        hoverBackgroundColor: colors.map(color => color.replace('500', '400'))
                    }
                ]
            };

            // Opciones del gráfico con formato en los tooltips
            this.proyectotop5ChartOptions = {
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
                                    label += ': ';
                                }
                                if (context.raw !== null) {
                                    label += `LPS ${context.raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;  // Formato con comas
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: documentStyle.getPropertyValue('--text-color')
                        },
                        grid: {
                            color: documentStyle.getPropertyValue('--surface-border')
                        }
                    },
                    y: {
                        ticks: {
                            color: documentStyle.getPropertyValue('--text-color')
                        },
                        grid: {
                            color: documentStyle.getPropertyValue('--surface-border')
                        }
                    }
                }
            };

            // Datos para la lista de detalles del top 5
            this.proyectotop5List = top5Proyectos.map((item, index) => ({
                nombre: item.nombre,
                costoTotal: `LPS ${item.costoTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,  // Formato con comas
                color: colors[index],
                boxShadow: `0px 0px 10px rgba(0, 0, 0, 0.2)`
            }));
        });
    }



    crearGrafico(data, chartProp, optionsProp, titulo) {
        const labels = data.map(item => item.articulo);
        const dataNumeroCompras = data.map(item => item.numeroCompras);
        const totalCompras = dataNumeroCompras.reduce((acc, val) => acc + val, 0);

        const documentStyle = getComputedStyle(document.documentElement);
        const colors = [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--red-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--cyan-500')
        ];

        this[chartProp] = {
            labels: labels,
            datasets: [
                {
                    data: dataNumeroCompras,
                    backgroundColor: colors,
                    hoverBackgroundColor: colors.map(color => color.replace('500', '400'))
                }
            ]
        };

        this[optionsProp] = {
            plugins: {
                legend: {
                    labels: {
                        color: documentStyle.getPropertyValue('--text-color')
                    }
                }
            },
            cutout: '60%'
        };

        // Actualizar la lista de detalles
        this[`${chartProp}List`] = data.map((item, index) => ({
            nombre: item.articulo,
            porcentaje: ((item.numeroCompras / totalCompras) * 100).toFixed(2),
            numeroCompras: item.numeroCompras,
            color: colors[index],
            boxShadow: `0px 0px 10px rgba(0, 0, 0, 0.2)`
        }));
    }




    cargarDatosCompras() {

        this.graficosService.ListarTotalComprasMes().subscribe(res => {
            const obtenerNombreMes = (mes) => {
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                return meses[mes - 1];
            };

            // Ordenar los resultados por el número del mes
            res.sort((a, b) => a.mes - b.mes);

            const labels = res.map(item => obtenerNombreMes(item.mes));
            const dataCompras = res.map(item => item.numeroCompras);
            const totalCompra = res.map(item => item.totalCompraMes);  // Valores como números

            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--text-color');

            this.data = {
                labels: labels,
                datasets: [
                    {
                        label: 'Número de Compras',
                        data: dataCompras,
                        fill: false,
                        borderColor: documentStyle.getPropertyValue('--blue-500'),
                        tension: 0.4
                    },
                    {
                        label: 'Total de Compras (LPS)',
                        data: totalCompra,  // Deja los datos como números
                        fill: false,
                        borderColor: documentStyle.getPropertyValue('--green-500'),
                        tension: 0.4
                    }
                ]
            };

            this.options = {
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
                                    if (context.dataset.label === 'Total de Compras (LPS)') {
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
                            color: textColor
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
        });
    }


}
