import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { MenuItem } from 'primeng/api';
import { Prestamo } from 'src/app/demo/models/modelsplanilla/prestamoviewmodel';
import { PrestamoService } from 'src/app/demo/services/servicesplanilla/prestamo.service';
import { ToastService } from 'src/app/demo/services/toast.service';
import { Gravedades } from 'src/app/demo/models/GravedadIzitoastEnum';
import { ExpandedRows } from 'src/app/demo/models/IExpandedRows';
import { Abono } from 'src/app/demo/models/modelsplanilla/abonoviewmodel';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';
import { CookieService } from 'ngx-cookie-service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-prestamo',
    templateUrl: './prestamo.component.html',
    styleUrl: './prestamo.component.scss',
    providers: [],
})
export class PrestamoComponent implements OnInit {
    items: MenuItem[] = [];

    tablaVacia = [{}];

    cargando: boolean = true;

    submitted: boolean = false;

    mostrarModalEliminar: boolean = false;
    mostrarModalAbono: boolean = false;

    expandedRows: ExpandedRows = {};

    abono: Abono = new Abono(
        parseInt(this.cookieService.get('usua_Id')),
        new Date()
    );
    mostrarModalConfirmacion: boolean;

    isPdfVisible: boolean = false;
    isRegresarVisible: boolean = false;
    usua_Id: number;
    Usuario: string;
    minDateAbono: Date;
    maxDateAbono: Date;

    montoMaximoAabonar: number = 0;
    constructor(
        public prestamoService: PrestamoService,
        private toastService: ToastService,
        //LLamamos al servicio de global para traer la nomenclatura de moneda
        public globalMoneda: globalmonedaService,
        public router: Router,
        public cookieService: CookieService
    ) {
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                // Si la URL coincide con la de este componente, forzamos la ejecución
                if (
                    event.urlAfterRedirects.includes(
                        '/sigesproc/planilla/prestamo'
                    )
                ) {
                    // Aquí puedes volver a ejecutar ngOnInit o un método específico
                    this.ngOnInit();
                }
            });
    }

    columnas: { prop: string; titulo: string }[] = [];
    columnasAbonos: { prop: string; titulo: string }[] = [];
    ngOnInit() {
        this.minDateAbono = new Date();
        this.minDateAbono.setFullYear(1924);
        this.maxDateAbono = new Date();
        this.maxDateAbono.setFullYear(this.maxDateAbono.getFullYear() + 5);
        // console.log(this.maxDateAbono, 'maxDateAbono');

        const token = this.cookieService.get('Token');
        this.Usuario = this.cookieService.get('usua_Usuario');
        if (token === 'false') {
            this.router.navigate(['/auth/login']);
        }
        //Seteamos el Id del usuario loggeado
        this.usua_Id = parseInt(this.cookieService.get('usua_Id'));
        //Llamamos a la nomenclatura de la moneda para setearla en el HTML
        if (!this.globalMoneda.getState()) {
            this.globalMoneda.setState();
        }
        this.prestamoService.mostrarPantalla('Index');

        const columnasMap = new Map<string, string>();
        columnasMap.set('empleado', 'Colaborador');
        columnasMap.set('empl_DNI', 'DNI');
        columnasMap.set('pres_Descripcion', 'Descripción');
        columnasMap.set('pres_Monto', 'Monto');
        columnasMap.set('total', 'Total a Pagar');
        columnasMap.set('pres_Abonado', 'Abonado');
        columnasMap.set('cuota', 'Cuota');
        columnasMap.set('tasaInteres', 'Tasa Interés');
        columnasMap.set('interes', 'Interés');
        columnasMap.set('frec_Descripcion', 'Frecuencia');
        columnasMap.set('pres_Pagos', 'No. Pagos');
        columnasMap.set('pagosRestantes', 'Pagos restantes');
        columnasMap.set('fechaPrimerPago', 'Fecha Primer Pago');
        columnasMap.set('fechaUltimoPago', 'Fecha Estimada Último Pago ');
        this.columnas = Array.from(columnasMap, ([key, value]) => ({
            prop: key,
            titulo: value,
        }));

        const columnasAbonosMap = new Map<string, string>();
        columnasAbonosMap.set('abpr_MontoAbonado', 'Monto');
        columnasAbonosMap.set('fecha', 'Fecha');
        this.columnasAbonos = Array.from(columnasAbonosMap, ([key, value]) => ({
            prop: key,
            titulo: value,
        }));

        this.prestamoService.cargarData();

        this.items = [
            {
                label: 'Editar',
                icon: 'pi pi-user-edit',
                command: (event) => this.prestamoService.mostrarForm(true),
            },
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: (event) =>
                    this.prestamoService.mostrarPantalla('Detalle'),
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: (event) => (this.mostrarModalEliminar = true),
            },
            {
                label: 'Abonar',
                icon: 'pi pi-money-bill',
                command: (event) => {
                    if (
                        this.prestamoService.prestamo.estadoPrestamo ===
                        'Cancelado'
                    ) {
                        this.toastService.toast(
                            Gravedades.warning,
                            'El préstamo ya está cancelado.'
                        );
                        this.mostrarModalEliminar = false;
                    } else {
                        this.mostrarModalAbonar();
                        this.abono = new Abono(
                            this.usua_Id,
                            new Date(),
                            this.prestamoService.prestamo.pres_Id
                        );
                    }
                },
            },
            {
                label: 'Historial',
                icon: 'pi pi-print',
                command: (event) => {
                    this.mostrarPrevisualizacion(this.prestamoService.prestamo);
                },
            },
        ];
    }

    mostrarModalAbonar(abono?: Abono) {
        this.submitted = false;
        if (abono) {
            //Se vuelve a parsear a tipo Date porque cuando se selecciona el abono, lo setea como string, entonces el p-calendar no lo agarra
            abono.abpr_Fecha = new Date(abono.abpr_Fecha.toString());
            this.abono = { ...abono };
        }
        this.mostrarModalAbono = true;
    }

    //Filtra el datatable
    filtrar(tabla: Table, event: Event) {
        tabla.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }
    //Setea el préstamo con que se van a realizar las acciones posteriores
    seleccionarPrestamo(prestamo: Prestamo) {
        this.prestamoService.prestamo = { ...prestamo };
    }

    //Setea el préstamo con que se van a realizar las acciones posteriores
    seleccionarAbono(abono: Abono) {
        this.abono = { ...abono };
    }

    // //Solo deja ingresar números
    // soloNumerosKeypress($event: any) {
    //     const regex = /^\d*\.?\d*$/;
    //     const input = $event.target.value + $event.key;
    //     if (!regex.test(input)) {
    //         $event.preventDefault();
    //     }
    // }

    handleInput(event: Event, prop?: string) {
        const inputElement = event.target as HTMLInputElement;
        const texto = inputElement.value;

        // Solo permitir letras y un espacio después de cada letra
        if (!prop) {
            inputElement.value = texto
                .replace(
                    /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g,
                    ''
                )
                .replace(/\s{2,}/g, ' ')
                .replace(/^\s/, '');
        }
        if (prop === 'empl_DNI') {
            // Solo permitir letras y un espacio después de cada letra
            inputElement.value = texto
                .replace(/[^0-9\s\-]|(?<=\s)[^0-9\s\-]/g, '')
                .replace(/\s{2,}/g, ' ')
                .replace(/^\s/, '');
        }
        if (prop === 'monto') {
            // Solo permitir letras y un espacio después de cada letra
            inputElement.value = texto
                .replace(/[^0-9]|(?<=\s)[^0-9]/g, '')
                .replace(/\s{2,}/g, ' ')
                .replace(/^\s/, '');
        }
    }

    //No deja pegar caracteres diferentes a los válidos según una regex
    validarPegar(event: ClipboardEvent, prop?: string) {
        const clipboardData = event.clipboardData?.getData('text') || '';
        let allowedTextPattern = /^[a-zñA-Z0-9ÑáéíóúÁÉÍÓÚ\s]*$/;
        if (prop === 'monto') {
            allowedTextPattern = /^[0-9.,]*$/;
        }
        if (prop === 'empl_DNI') {
            allowedTextPattern = /^[0-9\s\-]*$/;
        }

        const filteredText = clipboardData
            .split('')
            .filter((char) => allowedTextPattern.test(char))
            .join('');

        const cleanedText = filteredText.trimStart();

        if (clipboardData !== cleanedText) {
            event.preventDefault();
            document.execCommand('insertText', false, cleanedText);
        }
    }

    guardarAbono() {
        this.submitted = true;
        //VALIDACIONES
        let todosLosCamposLlenos = true;
        if (this.abono.abpr_Id) {
            this.abono.usua_Modificacion = this.usua_Id;
            this.abono.abpr_FechaModificacion = new Date();
            for (const prop in this.abono) {
                if (
                    prop === 'codigo' ||
                    prop === 'pres' ||
                    prop === 'usua_CreacionNavigation' ||
                    prop === 'usua_ModificacionNavigation' ||
                    prop === 'fechaModificacion' ||
                    prop === 'abpr_DeducidoEnPlanilla' ||
                    prop === 'usua_Modificacion' ||
                    prop === 'usuaModificacion'
                ) {
                    continue;
                }
                if (!this.abono[prop]) {
                    todosLosCamposLlenos = false;
                    // console.log(prop);
                    break;
                }
            }
        } else {
            for (const prop in this.abono) {
                if (
                    prop === 'abpr_Id' ||
                    prop === 'codigo' ||
                    prop === 'abpr_DeducidoEnPlanilla' ||
                    prop === 'fechaModificacion' ||
                    prop === 'usua_Modificacion' ||
                    prop === 'usuaModificacion'
                ) {
                    continue;
                }
                if (!this.abono[prop]) {
                    todosLosCamposLlenos = false;
                    // console.log(prop);
                    break;
                }
            }
        }

        // console.log(this.prestamo);
        // console.log(todosLosCamposLlenos);

        if (todosLosCamposLlenos && this.validarMontoAbonado()) {
            this.mostrarModalAbono = false;
            this.mostrarModalConfirmacion = true;
        }
    }
    //Validación del monto
    validarMontoAbonado() {
        const regex = /^\d*\.?\d*$/;
        //Si no ha ingresado nada
        if (!this.abono.abpr_MontoAbonado) {
            this.montoMaximoAabonar = 0;
            return false;
        }
        //Si solo es un punto es inválido
        if (this.abono.abpr_MontoAbonado.toString() === '.') {
            this.montoMaximoAabonar = 0;
            return false;
        }
        //Si no es un número es inválido
        if (!regex.test(this.abono.abpr_MontoAbonado.toString())) {
            this.montoMaximoAabonar = 0;
            return false;
        } else {
            //Si el monto a abonar es mayor al saldo pendiente es inválido

            if (this.abono.abpr_Id) {
                const montoAbonado =
                    this.prestamoService.prestamos
                        .find((p) => p.pres_Id === this.abono.pres_Id)
                        .abonos.find((a) => a.abpr_Id === this.abono.abpr_Id)
                        .abpr_MontoAbonado ?? 0;
                if (
                    parseFloat(this.abono.abpr_MontoAbonado.toString()) >
                    this.prestamoService.prestamo.total -
                        this.prestamoService.prestamo.pres_Abonado +
                        montoAbonado
                ) {
                    this.montoMaximoAabonar =
                        this.prestamoService.prestamo.total -
                        this.prestamoService.prestamo.pres_Abonado +
                        montoAbonado;
                    return false;
                }
            } else {
                if (
                    parseFloat(this.abono.abpr_MontoAbonado.toString()) >
                    this.prestamoService.prestamo.total -
                        this.prestamoService.prestamo.pres_Abonado
                ) {
                    this.montoMaximoAabonar =
                        this.prestamoService.prestamo.total -
                        this.prestamoService.prestamo.pres_Abonado;
                    return false;
                }
            }
        }
        return true;
    }

    insertarEditarAbono() {
        this.mostrarModalAbono = false;
        this.mostrarModalConfirmacion = false;
        this.prestamoService[
            this.abono.abpr_Id ? 'EditarAbono' : 'InsertarAbono'
        ](this.abono).subscribe(
            (exito: boolean) => {
                /*Si la petición salió bien reinicia el formulario, 
                    se muestra un toast y se vuelven a cargar los préstamos*/
                if (exito) {
                    this.submitted = false;
                    this.toastService.toast(
                        Gravedades.success,
                        this.abono.abpr_Id
                            ? 'Actualizado con Éxito.'
                            : 'Insertado con Éxito.'
                    );
                    //Como se recargan los prestamos, se vuelve a setear el prestamo previamente seleccionado, sino al editar de nuevo truena
                    const prestamoTemp = this.prestamoService.prestamo;
                    this.prestamoService.cargarData();
                    this.prestamoService.prestamo = prestamoTemp;
                } else {
                    this.toastService.toast(
                        Gravedades.error,
                        'Algo salió mal. Comuníquese con un Administrador.'
                    );
                }
            },
            (error) => {
                // console.log(error);
                this.toastService.toast(
                    Gravedades.error,
                    'Algo salió mal. Comuníquese con un Administrador.'
                );
            }
        );
    }

    //Elimina un préstamo
    eliminar() {
        if (
            this.prestamoService.prestamo.pres_Abonado ===
            this.prestamoService.prestamo.pres_Monto
        ) {
            this.toastService.toast(
                Gravedades.warning,
                'El préstamo ya está cancelado.'
            );
            return;
        }
        //Si el préstamo ya está pagado que no lo deje eliminarlo
        if (this.prestamoService.prestamo.pres_Abonado > 0) {
            this.toastService.toast(
                Gravedades.warning,
                'El préstamo ya cuenta con Abonos.'
            );
            return;
        }
        this.prestamoService
            .Eliminar(this.prestamoService.prestamo.pres_Id)
            .subscribe(
                (Éxito: boolean) => {
                    if (Éxito) {
                        /*Si la petición estuvo bien, se vuelven a cargar los préstamos, 
                        se muestra el toast y se oculta el modal de eliminar*/
                        this.prestamoService.cargarData();
                        this.toastService.toast(
                            Gravedades.success,
                            'Eliminado con Éxito.'
                        );
                        this.mostrarModalEliminar = false;
                    } else {
                        this.toastService.toast(
                            Gravedades.error,
                            'Algo salió mal. Comuníquese con un Administrador.'
                        );
                        this.mostrarModalEliminar = false;
                    }
                },
                (error) => {
                    // console.log(error);
                    this.toastService.toast(
                        Gravedades.error,
                        'Algo salió mal. Comuníquese con un Administrador.'
                    );
                    this.mostrarModalEliminar = false;
                }
            );
    }

    private addHeader(doc: jsPDF, prestamo: Prestamo) {
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();

        const logo = '/assets/demo/images/encabezado_footer_horizontal4k.png';
        doc.addImage(logo, 'PNG', 0, -18, 370, 50);

        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text(
            `Historial del préstamo de ${prestamo.empleado}`,
            doc.internal.pageSize.width / 2,
            50,
            {
                align: 'center',
            }
        );

        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        doc.text(
            `Fecha de emisión: ${date} ${time}`,
            doc.internal.pageSize.width - 10,
            10,
            { align: 'right' }
        );

        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        doc.text(
            `Generado por: ${this.Usuario}`,
            doc.internal.pageSize.width - 10,
            20,
            { align: 'right' }
        );
    }

    private addFooter(doc: jsPDF, pageNumber: number) {
        doc.setDrawColor(255, 215, 0);
        doc.setLineWidth(1);
        doc.line(10, 287, doc.internal.pageSize.width - 10, 287);

        const footerLogo =
            '/assets/demo/images/encabezado_footer_horizontal4k.png';
        doc.addImage(footerLogo, 'PNG', 0, 197.8, 375, 50);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(
            `Página ${pageNumber}`,
            doc.internal.pageSize.width - 165,
            210,
            { align: 'right' }
        );
    }

    private addTabContentToDoc(doc: jsPDF, prestamo: Prestamo): void {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        // Configure the table headers
        const tableHeaders = [
            'No.',
            'Estado Préstamo',
            'Descripción',
            'Monto',
            'Interés a Pagar',
            'Tasa Interés',
            'Total a Pagar',
            'Abonado',
        ];

        // Configura las columnas del subheader
        const childSubHeader = [
            '',
            'No.',
            { content: 'Monto', colSpan: 2 },
            { content: 'Método de Pago', colSpan: 2 },
            { content: 'Fecha', colSpan: 2 },
        ];
        let tableBody;
        //Si se pasa un préstamo por parámetro se imprime el historial sólo de ese préstamo, sino el de todos
        tableBody = [
            [
                prestamo.codigo,
                prestamo.estadoPrestamo || '',
                prestamo.pres_Descripcion || '',
                `${
                    this.globalMoneda.getState().mone_Abreviatura
                } ${new Intl.NumberFormat('en-EN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(prestamo.pres_Monto)}` || '0.00',
                `${
                    this.globalMoneda.getState().mone_Abreviatura
                } ${new Intl.NumberFormat('en-EN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(prestamo.interes)}` || '0.00',
                prestamo.tasaInteres || '',
                `${
                    this.globalMoneda.getState().mone_Abreviatura
                } ${new Intl.NumberFormat('en-EN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(prestamo.total)}` || '0.00',
                `${
                    this.globalMoneda.getState().mone_Abreviatura
                } ${new Intl.NumberFormat('en-EN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(prestamo.pres_Abonado)}` || '0.00',
            ],
        ];
        if (prestamo.abonos && prestamo.abonos.length > 0) {
            // Encabezado de los abonos
            const subHeaderRow = childSubHeader;

            // Filas de los abonos
            const childRows = prestamo.abonos.map((abpr: Abono) => [
                '',
                abpr.codigo,
                {
                    content:
                        `${
                            this.globalMoneda.getState().mone_Abreviatura
                        } ${new Intl.NumberFormat('en-EN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(abpr.abpr_MontoAbonado)}` || '',
                    colSpan: 2,
                },
                {
                    content: abpr.abpr_DeducidoEnPlanilla
                        ? 'Planilla'
                        : 'Abono' || '',
                    colSpan: 2,
                },
                { content: abpr.fecha || '', colSpan: 2 },
            ]);

            // Se combinan las filas de los prestamos con las filas de los abonos
            tableBody = [tableBody[0], subHeaderRow, ...childRows];
        }

        // Generate the table in the document
        doc.autoTable({
            startY: 60,
            head: [tableHeaders], // Header row
            body: tableBody, // Data rows, including child rows
            theme: 'striped', // Optional: grid or plain
            styles: {
                halign: 'center',
                font: 'helvetica',
                lineWidth: 0.1,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [255, 237, 58],
                textColor: [0, 0, 0],
                fontSize: 12,
                fontStyle: 'bold',
                halign: 'center',
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                fontSize: 10,
                halign: 'center',
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240],
            },
            margin: { top: 60, bottom: 30 },
        });

        doc.setFontSize(10);
    }

    private openPdfInDiv(doc: jsPDF) {
        const string = doc.output('datauristring');
        const iframe = `<iframe width='100%' height='100%' src='${string}'></iframe>`;
        const pdfContainer = document.getElementById('pdfContainer');

        if (pdfContainer) {
            pdfContainer.innerHTML = iframe;
            this.isPdfVisible = true;
            //   this.cd.detectChanges();
        }
    }

    mostrarPrevisualizacion(prestamo: Prestamo) {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [216, 356],
        });

        this.addHeader(doc, prestamo);
        this.addTabContentToDoc(doc, prestamo);
        this.addFooter(doc, 1);

        const pageCount = doc.internal.pages.length;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            this.addHeader(doc, prestamo);
            //La número de página de la última página siempre es un número mayor porque seteamos el footer de forma manual
            if (i === pageCount) {
                this.addFooter(doc, i - 1);
            } else {
                this.addFooter(doc, i);
            }
        }
        this.openPdfInDiv(doc);
        this.isRegresarVisible = true;
    }
    cancelarImpresion() {
        document.getElementById('pdfContainer').innerHTML = '';
        this.isRegresarVisible = false;
        this.isPdfVisible = false;
    }
}
