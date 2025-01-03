import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '../demo/services/servicesacceso/usuario.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
    model: any[] = [];

    constructor(
        private router: Router,
        private usuarioService: UsuarioService,
        private cookieService: CookieService 
    ) {}

    ngOnInit() {
        this.cargarMenu();
    }

    irAPlanilla() {
        const randomParam = Math.random(); // Genera un valor aleatorio para forzar la navegación
        return this.router.navigate(['/sigesproc/planilla/planilla', { refresh: randomParam }]);
      }

    cargarMenu() {
        const esAdmin = this.cookieService.get('usua_Admin') === 'true';

        if (esAdmin) {
            this.cargarMenuCompleto(); // Si es admin, carga el menú completo
        } else {
            const pantallasPermitidas = this.usuarioService.getPantallasPermitidas();
            // console.log(pantallasPermitidas)
            if (pantallasPermitidas && pantallasPermitidas.length > 0) {
                this.filtrarMenu(pantallasPermitidas); // Filtra el menú con las pantallas permitidas
            } else {
                console.warn('No se encontraron pantallas permitidas para el usuario');
            }
        }
    }

    cargarMenuCompleto() {
        this.model = [
            {

                icon: 'pi pi-th-large',
                items: [
                    {
                        label: 'Inicio',
                        icon: 'pi pi-home',
                        routerLink: ['/sigesproc/Paginaprincipal/Paginaprincipal'],

                    },
                    {
                        label: 'Proyectos',
                        icon: 'pi pi-folder',
                        items: [
                            { label: 'Cotizaciones', icon: 'pi pi-fw pi-shopping-bag', routerLink: ['/sigesproc/favorito/cotizacion'] },
                            { label: 'Órdenes de Compra', icon: 'pi pi-fw pi-dollar', routerLink: ['/sigesproc/favorito/compra'] },
                            { label: 'Proyectos', icon: 'pi pi-fw pi-tablet', routerLink: ['/sigesproc/favorito/proyecto'] },
                            { label: 'Presupuestos', icon: 'pi pi-fw pi-sign-in', routerLink: ['/sigesproc/favorito/presupuesto'] },
                            { label: 'Planillas', icon: 'pi pi-wallet', routerLink: ['/sigesproc/favorito/planilla'] },
                            { label: 'Bienes Raíces', icon: 'pi pi-fw pi-sign-in', routerLink: ['/sigesproc/favorito/bienraiz'] },
                            { label: 'Venta de Bienes Raíces', icon: 'pi pi-fw pi-home', routerLink: ['/sigesproc/favorito/ventadebienesraices'] },
                        ],
                    },
                    {
                        label: 'Acceso',
                        icon: 'pi pi-user',
                        items: [
                               {
                                label: 'Roles',
                                icon: 'pi pi-fw pi-key',
                                routerLink: ['/sigesproc/acceso/rol'],
                            },
                            {
                                label: 'Usuarios',
                                icon: 'pi pi-fw pi-user',
                                routerLink: ['/sigesproc/acceso/usuario'],
                            },
                         
                            // {
                            //     label: 'Pantalla',
                            //     icon: 'pi pi-fw pi-desktop',
                            //     routerLink: ['/sigesproc/acceso/pantalla'],
                            // },
                        ],
                    },
                    {
                        label: 'Bienes Raíces',
                        icon: 'pi pi-map-marker',
                        items: [
                            {
                                label: 'Agentes de Bienes Raíces',
                                icon: 'pi pi-fw pi-user',
                                routerLink: [
                                    '/sigesproc/bienraiz/agentesdebienesraices',
                                ],
                            },
                            {
                                label: 'Bienes Raíces',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/sigesproc/bienraiz/bienesraices'],
                            },
                            {
                                label: 'Empresas de Bienes Raíces',
                                icon: 'pi pi-fw pi-map-marker',
                                routerLink: [
                                    '/sigesproc/bienraiz/empresabienraiz',
                                ],
                            },
                            {
                                label: 'Terreno',
                                icon: 'pi pi-fw pi-globe',
                                routerLink: ['/sigesproc/bienraiz/terreno'],
                            },
                            {
                                label: 'Tipos de Documentos',
                                icon: 'pi pi-fw pi-file-o',
                                routerLink: [
                                    '/sigesproc/bienraiz/tiposdedocumentos',
                                ],
                            },
                            {
                                label: 'Venta de Bienes Raíces',
                                icon: 'pi pi-fw pi-home',
                                routerLink: [
                                    '/sigesproc/bienraiz/ventadebienesraices',
                                ],
                            },
                            // {
                            //     label: 'Mantenimiento',
                            //     icon: 'pi pi-fw pi-user',
                            //     routerLink: ['/sigesproc/bienraiz/mantenimiento']
                            // }
                        ],
                    },
                    {
                        label: 'Fletes',
                        icon: 'pi pi-truck',
                        items: [
                            {
                                label: 'Fletes',
                                icon: 'pi pi-truck',
                                routerLink: ['/sigesproc/Fletes/Fletes'],
                            },
                        ],
                    },
                    {
                        label: 'Generales',
                        icon: 'pi pi-images',
                        items: [
                            {
                                label: 'Bancos',
                                icon: 'pi pi-fw pi-building',
                                routerLink: ['/sigesproc/general/banco'],
                            },
                            {
                                label: 'Cargos',
                                icon: 'pi pi-fw pi-verified',
                                routerLink: ['/sigesproc/general/cargo'],
                            },
                            {
                                label: 'Ciudades',
                                icon: 'pi pi-fw pi-map-marker',
                                routerLink: ['/sigesproc/general/ciudad'],
                            },
                            {
                                label: 'Clientes',
                                icon: 'pi pi-fw pi-user',
                                routerLink: ['/sigesproc/general/cliente'],
                            },
                            {
                                // label: 'Colaboradores',
                                label: 'Colaboradores',
                                icon: 'pi pi-fw pi-id-card',
                                routerLink: ['/sigesproc/general/Colaboradores'],
                            },
                            {
                                label: 'Estados',
                                icon: 'pi pi-fw pi-directions',
                                routerLink: ['/sigesproc/general/estado'],
                            },
                            {
                                label: 'Estados Civiles',
                                icon: 'pi pi-fw pi-heart-fill',
                                routerLink: ['/sigesproc/general/estadosciviles'],
                            },
                            {
                                label: 'Impuesto',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/sigesproc/general/impuesto'],
                            },
                            {
                                label: 'Monedas',
                                icon: 'pi pi-fw pi-money-bill',
                                routerLink: ['/sigesproc/general/moneda'],
                            },
                            {
                                label: 'Niveles',
                                icon: 'pi pi-fw pi-sitemap',
                                routerLink: ['/sigesproc/general/nivel'],
                            },
                            {
                                label: 'Países',
                                icon: 'pi pi-fw pi-globe',
                                routerLink: ['/sigesproc/general/pais'],
                            },
                            {
                                label: 'Tipos de Proyecto',
                                icon: 'pi pi-filter',
                                routerLink: ['/sigesproc/general/tiposdeproyecto'],
                            },
                            {
                                label: 'Tasas de Cambio',
                                icon: 'pi pi-filter',
                                routerLink: ['/sigesproc/general/tasasdecambio'],
                            },
                            {
                                label: 'Unidades de Medida',
                                icon: 'pi pi-filter',
                                routerLink: ['/sigesproc/general/unidadesdemedida'],
                            },
                        ],
                    },
                    {
                        label: 'Insumos',
                        icon: 'pi pi-box',
                        items: [
                            {
                                label: 'Bodegas',
                                icon: 'pi pi-fw pi-home',
                                routerLink: ['/sigesproc/insumo/bodegas'],
                            },
                            {
                                label: 'Categorías',
                                icon: 'pi pi-fw pi-tag',
                                routerLink: ['/sigesproc/insumo/categoria'],
                            }, 
                             {
                                label: 'Cotizaciones',
                                icon: 'pi pi-fw pi-shopping-bag',
                                routerLink: ['/sigesproc/insumo/cotizacion'],
                            },
                            {
                                label: 'Insumos',
                                icon: 'pi pi-wrench',
                                routerLink: ['/sigesproc/insumo/Insumos'],
                            },
                            {
                                label: 'Maquinarias',
                                icon: 'pi pi-fw pi-car',
                                routerLink: ['/sigesproc/insumo/maquinaria'],
                            },
                            {
                                label: 'Materiales',
                                icon: 'pi pi-fw pi-list',
                                routerLink: ['/sigesproc/insumo/material'],
                            },
                            {
                                label: 'Órdenes de Compra',
                                icon: 'pi pi-fw pi-dollar',
                                routerLink: ['/sigesproc/insumo/compra'],
                            },
                     
                            {
                                label: 'Proveedores',
                                icon: 'pi pi-fw pi-users',
                                routerLink: ['/sigesproc/insumo/proveedor'],
                            },
                            {
                                label: 'Sub Categorías',
                                icon: 'pi pi-fw pi-tags',
                                routerLink: ['/sigesproc/insumo/subcategoria'],
                            },
                        ],
                    },
                    {
                        label: 'Planillas',
                        icon: 'pi pi-dollar',
                        items: [
                            {
                                label: 'Categorías Viáticos',
                                icon: 'pi pi-fw pi-shield',
                                routerLink: [
                                    '/sigesproc/planilla/categoriasviaticos',
                                ],
                            },
                            {
                                label: 'Costos por Actividad',
                                icon: 'pi pi-fw pi-percentage',
                                routerLink: [
                                    '/sigesproc/planilla/costosporactividad',
                                ],
                            },
                            {
                                label: 'Deducciones',
                                icon: 'pi pi-fw pi-arrow-down',
                                routerLink: ['/sigesproc/planilla/deduccion'],
                            },
                            {
                                label: 'Frecuencias',
                                icon: 'pi pi-fw pi-forward',
                                routerLink: ['/sigesproc/planilla/frecuencia'],
                            },
                            {
                                label: 'Planillas',
                                icon: 'pi pi-wallet',
                                routerLink: ['/sigesproc/planilla/planilla'],
                            },
                            {
                                // label: 'Prestamos',
                                label: 'Préstamos',
                                icon: 'pi pi-fw pi-money-bill',
                                routerLink: ['/sigesproc/planilla/prestamo'],
                            },
                            {
                                label: 'Viáticos',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/sigesproc/planilla/viaticos'],
                            },
                        ],
                    },
                    {
                        label: 'Seguimiento de proyectos',
                        icon: 'pi pi-chart-bar',
                        items: [
                            {
                                label: 'Actividades',
                                icon: 'pi pi-list',
                                routerLink: ['/sigesproc/proyecto/actividad'],
                            },
                            {
                                label: 'Controles de calidad',
                                icon: 'pi pi-list',
                                routerLink: [
                                    '/sigesproc/proyecto/controldecalidad',
                                ],
                            },
                            {
                                label: 'Etapas',
                                icon: 'pi pi-fw pi-sitemap',
                                routerLink: ['/sigesproc/proyecto/etapa'],
                            },
                            {
                                label: 'Equipos de Seguridad',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: [
                                    '/sigesproc/proyecto/equiposdeseguridad',
                                ],
                            },
                            {
                                label: 'Estados de Proyecto',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: [
                                    '/sigesproc/proyecto/estadosdeproyecto',
                                ],
                            },
                            {
                                label: 'Gestiones Adicionales',
                                icon: 'pi pi-list',
                                routerLink: [
                                    '/sigesproc/proyecto/gestionesadicionales',
                                ],
                            },
                            {
                                label: 'Incidentes',
                                icon: 'pi pi-fw pi-tablet',
                                routerLink: ['/sigesproc/proyecto/incidentes'],
                            },
                            {
                                label: 'Notificaciones',
                                icon: 'pi pi-bell',
                                routerLink: ['/sigesproc/proyecto/notificaciones'],
                            },
                            {
                                label: 'Presupuestos',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/sigesproc/proyecto/presupuesto'],
                            },
                            {
                                label: 'Proyectos',
                                icon: 'pi pi-fw pi-tablet',
                                routerLink: ['/sigesproc/proyecto/proyecto'],
                            },
                         
                        ],
                    },
                    {
                        label: 'Gráficos',
                     icon: 'pi pi-shopping-cart',
                     items: [
                         {
                             label: 'Bienes y Raíces',
                             icon: 'pi pi-map-marker',
                             items: [
                                 {
                                     label: 'Gráfico Total Procesos Venta',
                                     icon: 'pi pi-chart-bar',
                                      routerLink: ['/sigesproc/dash/graficoTotalProcesosVenta']
                                 },
                                 {
                                     label: 'Gráfico Ventas Bienes Raíces Mensuales',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/GraficoVentasBienesRaicesMensuales'],
                                 },
                                 {
                                     label: 'Gráfico Ventas por Agente',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficoventasporagente'],
                                 },
                                 {
                                     label: 'Gráfico Ventas Terrenos Mensuales',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficoVentasTerrenosMensuales'],
                                 },
                             ],
                         },
                         {
                             label: 'Fletes',
                             icon: 'pi pi-truck',
                             items: [
                                 {
                                     label: 'Gráfico Fletes Asociados a Proyectos',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficofletesasociadosaproyectos'],
                                 },
                                 {
                                     label: 'Gráfico Incidentes Mensuales',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficoincidentesmensuales'],
                                 },
                                 {
                                     label: 'Gráfico Bodegas Más Enviadas Fletes',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/GraficoBodegasMasEnviadasFletes'],
                                 },
                             ],
                         },
                         {
                             label: 'Insumos',
                             icon: 'pi pi-box',
                             items: [
                                 {
                                     label: 'Gráfico Proveedores más Comprados',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficoproveedoresmascomprados']},
                                 {
                                     label: 'Gráfico Total de Compras',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficoTotaldeCompras']
                                 },
                                 {
                                     label: 'Gráfico Ubicación más Enviada al Comprar',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficoubicacionmasenviada'],
                                 },

                             ],
                         },
                         {
                             label: 'Planillas',
                             icon: 'pi pi-dollar',
                             items: [
                                 {
                                     label: 'Gráfico Bancos más acreditados',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficobancosmasacreditados'],
                                 },

                                 {
                                     label: 'Gráfico Pago por Jefe de Obra',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficoPagoporJefedeObra'],
                                 },

                                 { label: 'Gráfico Total Nómina Anual',
                                      icon: 'pi pi-chart-bar',
                                       routerLink: ['/sigesproc/dash/graficoTotalNominaAnual']
                                 },
                             ],
                         },
                         {
                             label: 'Seguimiento de proyectos',
                             icon: 'pi pi-chart-bar',
                             items:[
                               { label: 'Gráfico Incidencias de proyectos por mes',
                                    icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficoIncidenciasdeproyectospormes']
                               },
                               { label: 'Gráfico Proyectos con mayor costo por fecha',
                                        icon: 'pi pi-chart-bar',
                                        routerLink: ['/sigesproc/dash/graficoProyectosconmayorcostoporfecha']
                                },
                                { label: 'Gráfico Proyectos con Mayor Costo por Departamento',
                                        icon: 'pi pi-chart-bar',
                                        routerLink: ['/sigesproc/dash/graficoProyectosconMayorCostoporDepartamento']
                                },
                             ],
                         },
                     ].filter(submenu => submenu.items && submenu.items.length > 0),


                 },

                    {
                        label: 'Reportes',
                        icon: 'pi pi-file',
                        items: [
                            {
                                label: 'Bienes y Raíces',
                                icon: 'pi pi-map-marker',
                                items: [
                                    {
                                        label: 'Reporte Empresa Bien raíz',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reporteempresabienraiz'],
                                    },
                                    {
                                        label: 'Reporte Terreno',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteTerrenofechacreacion'],
                                    },
                                    {
                                        label: 'Reporte Terreno Proyecto',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteTerrenosPorEstadoProyecto'],
                                    },
                                    {
                                        label: 'Reporte Proceso de venta',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reporteprocesodeventa'],
                                    },
                                ]
                            },
                            {
                                label: 'Fletes',
                                icon: 'pi pi-truck',
                                items: [
                                    {
                                        label: 'Reporte Flete',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteFletesPorFecha'],
                                    },
                                    {
                                        label: 'Reporte Fletes Comparacion',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportefletescomparacion'],
                                    },
                                    {
                                        label: 'Reporte Fletes Insumo Por Actividad',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportefletesinsumoporactividad'],
                                    },
                                    {
                                        label: 'Reporte Fletes llegada',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportefletesllegada'],
                                    }
                                ]
                            },
                            {
                                label: 'Insumos',
                                icon: 'pi pi-box',
                                items: [
                                    {
                                        label: 'Reporte Compra',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteComprasRealizadasComponent'],
                                    },
                                    {
                                        label: 'Reporte Comparativo Producto',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteComparativoProductos'],
                                    },
                                    {
                                        label: 'Reporte Compra Pendiente',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReportecomprasPendientesEnvio'],
                                    },
                                    {
                                        label: 'Reporte Compra por Ubicación',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportecompraporubicacion'],
                                    },
                                    {
                                        label: 'Reporte Cotización',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportecotizacion'],
                                    },
                                    {
                                        label: 'Reporte de Cotización por Rango Precio',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportedecotizacionporrangoprecio'],
                                    },
                                    {
                                        label: 'Reporte de Insumo a Bodega',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteInsumosBodega'],
                                    },
                                    {
                                        label: 'Reporte de Insumo a Proyecto',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteInsumosAProyecto'],
                                    },
                                    {
                                        label: 'Reporte Insumos Último Precio',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reporteinsumosultimoprecio'],
                                    },
                                
                                   
                               
                                
                                 
                                ]
                            },
                            {
                                label: 'Planillas',
                                icon: 'pi pi-dollar',
                                items: [
                                    {
                                        label: 'Reporte Colaborador',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportecolaborador'],
                                    },
                                    {
                                        label: 'Reporte Historial de Pagos',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportehistorialdepagos'],
                                    },
                                ]
                            },
                            {
                                label: 'Seguimiento de proyectos',
                                icon: 'pi pi-chart-bar',
                                items: [
                                    {
                                        label: 'Reporte Articulos de Actividad',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportearticulosactividades'],
                                    },
                                    {
                                        label: 'Reporte Progreso de actividades',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteProgresoActividades'],
                                    },

                                    // {
                                    //     label: 'Reporte Proyecto',
                                    //     icon: 'pi pi-file-pdf',
                                    //     routerLink: ['/sigesproc/reporte/reporteproyecto'],
                                    // },
                                    // {
                                    //     label: 'Reporte Articulos de Actividad',
                                    //     icon: 'pi pi-file-pdf',
                                    //     routerLink: ['/sigesproc/reporte/reportearticulosactividades'],
                                    // }
                                ]
                            },
                        ]
                    }                                                          
                ],
            },
        ];

        // console.log('Modelo de menú completo para administrador:', this.model);
    }

    filtrarMenu(pantallasPermitidas: string[]) {
        const nombresPermitidos = new Set(pantallasPermitidas.map(p => p.toLowerCase().trim()));

        const filtrarSubitems = (subitems) =>
            subitems.filter(opcion => {
                const labelNormalizado = opcion.label.toLowerCase().trim();
                return nombresPermitidos.has(labelNormalizado);
            });

        this.model = [
                {
                icon: 'pi pi-th-large',
                items: [
                    {
                        label: 'Inicio',
                        icon: 'pi pi-home',
                        routerLink: ['/sigesproc/Paginaprincipal/Paginaprincipal'],

                    },
                    {
                        label: 'Proyectos',
                        icon: 'pi pi-folder',
                        items: filtrarSubitems([
                            { label: 'Cotizaciones', icon: 'pi pi-fw pi-shopping-bag', routerLink: ['/sigesproc/favorito/cotizacion'] },
                            { label: 'Órdenes de Compra', icon: 'pi pi-fw pi-dollar', routerLink: ['/sigesproc/favorito/compra'] },
                            { label: 'Proyectos', icon: 'pi pi-fw pi-tablet', routerLink: ['/sigesproc/favorito/proyecto'] },
                            { label: 'Presupuestos', icon: 'pi pi-fw pi-sign-in', routerLink: ['/sigesproc/favorito/presupuesto'] },
                            { label: 'Planillas', icon: 'pi pi-wallet', routerLink: ['/sigesproc/favorito/planilla'] },
                            { label: 'Bienes Raíces', icon: 'pi pi-fw pi-sign-in', routerLink: ['/sigesproc/favorito/bienraiz'] },
                            { label: 'Venta de Bienes Raíces', icon: 'pi pi-fw pi-home', routerLink: ['/sigesproc/favorito/ventadebienesraices'] },
                        ]),
                    },
                    {
                        label: 'Acceso',
                        icon: 'pi pi-user',
                        items: filtrarSubitems([
                            { label: 'Roles', icon: 'pi pi-fw pi-key', routerLink: ['/sigesproc/acceso/rol'] },
                            { label: 'Usuarios', icon: 'pi pi-fw pi-user', routerLink: ['/sigesproc/acceso/usuario'] },
                            { label: 'Perfil', icon: 'pi pi-fw pi-key', routerLink: ['/sigesproc/acceso/perfil'] },
                        ]),
                    },
                    {
                        label: 'Bienes Raíces',
                        icon: 'pi pi-map-marker',
                        items: filtrarSubitems([
                            { label: 'Agentes de Bienes Raíces', icon: 'pi pi-fw pi-user', routerLink: ['/sigesproc/bienraiz/agentesdebienesraices'] },
                            { label: 'Bienes Raíces', icon: 'pi pi-fw pi-sign-in', routerLink: ['/sigesproc/bienraiz/bienesraices'], },
                            { label: 'Empresas de Bienes Raíces', icon: 'pi pi-fw pi-map-marker', routerLink: ['/sigesproc/bienraiz/empresabienraiz'] },
                            { label: 'Terrenos', icon: 'pi pi-fw pi-globe', routerLink: ['/sigesproc/bienraiz/terreno'] },
                            { label: 'Tipos de Documentos', icon: 'pi pi-fw pi-file-o', routerLink: ['/sigesproc/bienraiz/tiposdedocumentos'] },
                            { label: 'Venta de Bienes Raíces', icon: 'pi pi-fw pi-home', routerLink: ['/sigesproc/bienraiz/ventadebienesraices'] },
                        ]),
                    },
                    {
                        label: 'Fletes',
                        icon: 'pi pi-truck',
                        items: filtrarSubitems([
                            {
                                label: 'Fletes',
                                icon: 'pi pi-truck',
                                routerLink: ['/sigesproc/Fletes/Fletes'],
                            },
                        ]),
                    },
                    {
                        label: 'Generales',
                        icon: 'pi pi-images',
                        items: filtrarSubitems([
                            { label: 'Bancos', icon: 'pi pi-fw pi-building', routerLink: ['/sigesproc/general/banco'] },
                            { label: 'Cargos', icon: 'pi pi-fw pi-verified', routerLink: ['/sigesproc/general/cargo'] },
                            { label: 'Ciudades', icon: 'pi pi-fw pi-map-marker', routerLink: ['/sigesproc/general/ciudad'] },
                            { label: 'Clientes', icon: 'pi pi-fw pi-user', routerLink: ['/sigesproc/general/cliente'] },
                            { label: 'Colaboradores', icon: 'pi pi-fw pi-id-card', routerLink: ['/sigesproc/general/Colaboradores'] },
                            { label: 'Estados', icon: 'pi pi-fw pi-directions', routerLink: ['/sigesproc/general/estado'] },
                            { label: 'Estados Civiles', icon: 'pi pi-fw pi-heart-fill', routerLink: ['/sigesproc/general/estadosciviles'] },
                            { label: 'Impuesto', icon: 'pi pi-fw pi-sign-in', routerLink: ['/sigesproc/general/impuesto'] },
                            { label: 'Monedas', icon: 'pi pi-fw pi-money-bill', routerLink: ['/sigesproc/general/moneda'] },
                            { label: 'Niveles', icon: 'pi pi-fw pi-sitemap', routerLink: ['/sigesproc/general/nivel'] },
                            { label: 'Países', icon: 'pi pi-fw pi-globe', routerLink: ['/sigesproc/general/pais'] },
                            { label: 'Tipos de Proyecto', icon: 'pi pi-filter', routerLink: ['/sigesproc/general/tiposdeproyecto'], },
                            { label: 'Tasas de Cambio', icon: 'pi pi-filter', routerLink: ['/sigesproc/general/tasasdecambio'] },
                            { label: 'Unidades de Medida', icon: 'pi pi-filter', routerLink: ['/sigesproc/general/unidadesdemedida'] }
                        ]),
                    },
                    {
                        label: 'Insumos',
                        icon: 'pi pi-box',
                        items: filtrarSubitems([
                            { label: 'Bodegas', icon: 'pi pi-fw pi-home', routerLink: ['/sigesproc/insumo/bodegas'] },
                            { label: 'Categorías', icon: 'pi pi-fw pi-tag', routerLink: ['/sigesproc/insumo/categoria'] },
                            { label: 'Cotizaciones', icon: 'pi pi-fw pi-shopping-bag', routerLink: ['/sigesproc/insumo/cotizacion'] },
                            { label: 'Insumos', icon: 'pi pi-wrench', routerLink: ['/sigesproc/insumo/Insumos'] },
                            { label: 'Maquinarias', icon: 'pi pi-fw pi-car', routerLink: ['/sigesproc/insumo/maquinaria'] },
                            { label: 'Materiales', icon: 'pi pi-fw pi-list', routerLink: ['/sigesproc/insumo/material'] },
                            { label: 'Órdenes de Compra', icon: 'pi pi-fw pi-dollar', routerLink: ['/sigesproc/insumo/compra'] },
                          
                           
                           
                            { label: 'Proveedores', icon: 'pi pi-fw pi-users', routerLink: ['/sigesproc/insumo/proveedor'] },
                            { label: 'Sub Categorías', icon: 'pi pi-fw pi-tags', routerLink: ['/sigesproc/insumo/subcategoria'] }
                        ]),
                    },
                    {
                        label: 'Planillas',
                        icon: 'pi pi-dollar',
                        items: filtrarSubitems([
                            { label: 'Categorías Viáticos', icon: 'pi pi-fw pi-shield', routerLink: ['/sigesproc/planilla/categoriasviaticos'] },
                            { label: 'Costos por Actividad', icon: 'pi pi-fw pi-percentage', routerLink: ['/sigesproc/planilla/costosporactividad'] },
                            { label: 'Deducciones', icon: 'pi pi-fw pi-arrow-down', routerLink: ['/sigesproc/planilla/deduccion'] },
                            { label: 'Frecuencias', icon: 'pi pi-fw pi-forward', routerLink: ['/sigesproc/planilla/frecuencia'] },
                            { label: 'Planillas', icon: 'pi pi-wallet', routerLink: ['/sigesproc/planilla/planilla'] },
                            { label: 'Préstamos', icon: 'pi pi-fw pi-money-bill', routerLink: ['/sigesproc/planilla/prestamo'] },
                            { label: 'Viáticos', icon: 'pi pi-fw pi-sign-in', routerLink: ['/sigesproc/planilla/viaticos'] }
                        ]),
                    },
                    {
                        label: 'Seguimiento de proyectos',
                        icon: 'pi pi-chart-bar',
                        items: filtrarSubitems([
                            { label: 'Actividades', icon: 'pi pi-list', routerLink: ['/sigesproc/proyecto/actividad'] },
                            { label: 'Control de Calidad', icon: 'pi pi-list', routerLink: ['/sigesproc/proyecto/controldecalidad'] },
                            { label: 'Etapas', icon: 'pi pi-fw pi-sitemap', routerLink: ['/sigesproc/proyecto/etapa'] },
                            { label: 'Equipos de Seguridad', icon: 'pi pi-fw pi-sign-in', routerLink: ['/sigesproc/proyecto/equiposdeseguridad'] },
                            { label: 'Estados de Proyecto', icon: 'pi pi-fw pi-sign-in', routerLink: ['/sigesproc/proyecto/estadosdeproyecto'] },
                            { label: 'Gestiones Adicionales', icon: 'pi pi-list', routerLink: ['/sigesproc/proyecto/gestionesadicionales'] },
                            { label: 'Incidentes', icon: 'pi pi-fw pi-tablet', routerLink: ['/sigesproc/proyecto/incidentes'],},
                            { label: 'Notificaciones', icon: 'pi pi-list', routerLink: ['/sigesproc/proyecto/notificaciones'] },
                            { label: 'Presupuestos', icon: 'pi pi-fw pi-sign-in', routerLink: ['/sigesproc/proyecto/presupuesto'] },
                            { label: 'Proyectos', icon: 'pi pi-fw pi-tablet', routerLink: ['/sigesproc/proyecto/proyecto'] }
                        ]),
                    },
                    {
                        label: 'Gráficos',
                     icon: 'pi pi-shopping-cart',
                     items: [
                         {
                             label: 'Bienes y Raíces',
                             icon: 'pi pi-map-marker',
                             items: filtrarSubitems([
                                 {
                                     label: 'Gráfico Total Procesos Venta',
                                     icon: 'pi pi-chart-bar',
                                      routerLink: ['/sigesproc/dash/graficoTotalProcesosVenta']
                                 },
                                 {
                                     label: 'Gráfico Ventas Bienes Raíces Mensuales',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/GraficoVentasBienesRaicesMensuales'],
                                 },
                                 {
                                     label: 'Gráfico Ventas por Agente',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficoventasporagente'],
                                 },
                                 {
                                     label: 'Gráfico Ventas Terrenos Mensuales',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficoVentasTerrenosMensuales'],
                                 },
                             ]),
                         },
                         {
                             label: 'Fletes',
                             icon: 'pi pi-truck',
                             items: filtrarSubitems([
                                {
                                    label: 'Gráfico Fletes Asociados a Proyectos',
                                    icon: 'pi pi-chart-bar',
                                    routerLink: ['/sigesproc/dash/graficofletesasociadosaproyectos'],
                                },
                                {
                                    label: 'Gráfico Incidentes Mensuales',
                                    icon: 'pi pi-chart-bar',
                                    routerLink: ['/sigesproc/dash/graficoincidentesmensuales'],
                                },


                                 {
                                     label: 'Gráfico Bodegas Más Enviadas Fletes',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/GraficoBodegasMasEnviadasFletes'],
                                 },
                             ]),
                         },
                         {
                             label: 'Insumos',
                             icon: 'pi pi-box',
                             items: filtrarSubitems([
                                 {
                                     label: 'Gráfico Proveedores más Comprados',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficoproveedoresmascomprados']},
                                 {
                                     label: 'Gráfico Total de Compras',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficoTotaldeCompras']
                                 },
                                 {
                                     label: 'Gráfico Ubicación más Enviada al Comprar',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficoubicacionmasenviada'],
                                 },

                             ]),
                         },
                         {
                             label: 'Planillas',
                             icon: 'pi pi-dollar',
                             items: filtrarSubitems([
                                 {
                                     label: 'Gráfico Bancos más acreditados',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficobancosmasacreditados'],
                                 },

                                 {
                                     label: 'Gráfico Pago por Jefe de Obra',
                                     icon: 'pi pi-chart-bar',
                                     routerLink: ['/sigesproc/dash/graficoPagoporJefedeObra'],
                                 },

                                 { label: 'Gráfico Total Nómina Anual',
                                      icon: 'pi pi-chart-bar',
                                       routerLink: ['/sigesproc/dash/graficoTotalNominaAnual']
                                 },
                             ]),
                         },
                         {
                             label: 'Seguimiento de proyectos',
                             icon: 'pi pi-chart-bar',
                             items: filtrarSubitems([
                                 { label: 'Gráfico Incidencias de proyectos por mes',
                                     icon: 'pi pi-chart-bar',
                                      routerLink: ['/sigesproc/dash/graficoIncidenciasdeproyectospormes']
                                },
                                     { label: 'Gráfico Proyectos con mayor costo por fecha',
                                         icon: 'pi pi-chart-bar',
                                         routerLink: ['/sigesproc/dash/graficoProyectosconmayorcostoporfecha']
                                 },
                                     { label: 'Gráfico Proyectos con Mayor Costo por Departamento',
                                         icon: 'pi pi-chart-bar',
                                         routerLink: ['/sigesproc/dash/graficoProyectosconMayorCostoporDepartamento']
                                 },
                             ]),
                         },
                     ].filter(submenu => submenu.items && submenu.items.length > 0),


                 },

                    {
                        label: 'Reportes',
                        icon: 'pi pi-file',
                        items: [
                            {
                                label: 'Bienes y Raíces',
                                icon: 'pi pi-map-marker',
                                items: filtrarSubitems([
                                    {
                                        label: 'Reporte Empresa Bien raíz',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reporteempresabienraiz'],
                                    },
                                    {
                                        label: 'Reporte Terreno',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteTerrenofechacreacion'],
                                    },
                                    {
                                        label: 'Reporte Terreno Proyecto',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteTerrenosPorEstadoProyecto'],
                                    },
                                    {
                                        label: 'Reporte Proceso de venta',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reporteprocesodeventa'],
                                    },
                                ]),
                            },
                            {
                                label: 'Fletes',
                                icon: 'pi pi-truck',
                                items: filtrarSubitems([
                                    {
                                        label: 'Reporte Flete',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteFletesPorFecha'],
                                    },
                                    {
                                        label: 'Reporte Fletes Comparacion',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportefletescomparacion'],
                                    },
                                    {
                                        label: 'Reporte Fletes Insumo Por Actividad',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportefletesinsumoporactividad'],
                                    },
                                    {
                                        label: 'Reporte Fletes llegada',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportefletesllegada'],
                                    }
                                ]),
                            },
                            {
                                label: 'Insumos',
                                icon: 'pi pi-box',
                                items: filtrarSubitems([
                                    {
                                        label: 'Reporte Compra',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteComprasRealizadasComponent'],
                                    },
                                    {
                                        label: 'Reporte Comparativo Producto',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteComparativoProductos'],
                                    },
                                    {
                                        label: 'Reporte Compra Pendiente',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReportecomprasPendientesEnvio'],
                                    },
                                    {
                                        label: 'Reporte Compra por Ubicación',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportecompraporubicacion'],
                                    },
                                    {
                                        label: 'Reporte Cotización',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportecotizacion'],
                                    },
                                    {
                                        label: 'Reporte de Cotización por Rango Precio',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportedecotizacionporrangoprecio'],
                                    },
                                    {
                                        label: 'Reporte de Insumo a Bodega',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteInsumosBodega'],
                                    },
                                    {
                                        label: 'Reporte de Insumo a Proyecto',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteInsumosAProyecto'],
                                    },
                                    {
                                        label: 'Reporte Insumos Último Precio',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reporteinsumosultimoprecio'],
                                    },                               
                                 
                                ]),
                            },
                            {
                                label: 'Planillas',
                                icon: 'pi pi-dollar',
                                items: filtrarSubitems([
                                    {
                                        label: 'Reporte Colaborador', 
                                        icon: 'pi pi-file-pdf', 
                                        routerLink: ['/sigesproc/reporte/reportecolaborador']
                                    },
                                    {
                                        label: 'Reporte Historial de Pagos',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportehistorialdepagos'],
                                    },
                                ]),
                            },
                            {
                                label: 'Seguimiento de proyectos',
                                icon: 'pi pi-chart-bar',
                                items: filtrarSubitems([
                                    //Reporte Articulos de Actividades
                                    {
                                        label: 'Reporte Articulos de Actividad',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/reportearticulosactividades'],
                                    },
                                    {
                                        label: 'Reporte Progreso de actividades',
                                        icon: 'pi pi-file-pdf',
                                        routerLink: ['/sigesproc/reporte/ReporteProgresoActividades'],
                                    },
                            
                                    // {
                                    //     label: 'Reporte Proyecto',
                                    //     icon: 'pi pi-file-pdf',
                                    //     routerLink: ['/sigesproc/reporte/reporteproyecto'],
                                    // }
                                ]),
                            },
                        ].filter(submenu => submenu.items && submenu.items.length > 0),
                    },
                
                ],
            
        
            },
        
        ];
    

        // Filtra los elementos principales que no tienen subitems visibles
        this.model = this.model.filter(menuGroup => {
            menuGroup.items = menuGroup.items.filter(submenu => submenu.items && submenu.items.length > 0 || submenu.label ==='Inicio');
            return menuGroup.items.length > 0;
        });

        // console.log('Modelo de menú filtrado:', this.model);
    }

}
