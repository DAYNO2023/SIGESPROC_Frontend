import { Component, OnInit, NgModule, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { CategoriaService } from 'src/app/demo/services/servicesproyecto/categoria.service';
import { Categoria } from 'src/app/demo/models/modelsproyecto/categoriaviewmodel';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { dA } from '@fullcalendar/core/internal-common';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-categoria',
    templateUrl: './categoria.component.html',
    styleUrl: './categoria.component.scss',
    providers: [MessageService],
})
export class CategoriaComponent implements OnInit {
    categorias: Categoria[] = [];
    categoriass: Categoria[] = [];
    categoria: Categoria = {};
    columnas: any[] = [];
    items: MenuItem[];
    display: boolean = false;
    modaleliminar: boolean = false;
    confirmSaveDialog: boolean = false; // Controla el modal de confirmación de guardado
    modalEditar: boolean = false;
    detalles: boolean = false;
    rowactual: Categoria | null;
    Index: boolean = true;
    CrearEditar: boolean = false;
    Edit: boolean = false;
    form: FormGroup;
    submitted: boolean = false;
    confirmProveedorDialog: boolean = false; // Controla el modal de confirmación de actualización
    id: 0;
    titulo = 'Nueva';

    constructor(
      private messageService: MessageService,
      private service: CategoriaService,
      private router: Router,
      private fb: FormBuilder,
      public cookieService: CookieService,
    ) {
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          if (event.urlAfterRedirects.includes('/sigesproc/insumo/categoria')) {
            this.onRouteChange();
          }
        });

      // Inicialización del formulario
      this.form = this.fb.group({
        cate_Descripcion: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑ\\s]+$')]],
      });
    }

    onRouteChange() {
      this.Index = true;  // Mostrar la vista principal
      this.CrearEditar = false;  // Ocultar formularios
      this.modalEditar = false;  // Ocultar modales de edición
      this.form.reset();  // Reiniciar el formulario
    }

    ngOnInit(): void {
        this.cargarDatos();
        this.items = this.getItems();

        const token = this.cookieService.get('Token');
        if(token == 'false'){
          this.router.navigate(['/auth/login'])
        }
    }
    isLoading = false

    cargarDatos() {
        this.isLoading = true;
        this.service.Listar().subscribe(
          (data: any) => {
            this.categorias = data.map((categoria: any) => {
                const fechaCreacion = categoria.cate_FechaCreacion ? new Date(categoria.cate_FechaCreacion).toLocaleDateString() : '';
                const fechaModificacion = categoria.cate_FechaModificacion ? new Date(categoria.cate_FechaModificacion).toLocaleDateString() : '';
                const codigo =parseInt(categoria.codigo);
                return {
                    ...categoria,
                    cate_FechaCreacion: fechaCreacion,
                    cate_FechaModificacion: fechaModificacion,
                    codigo:codigo
                };
            });
            this.isLoading = false;
          },
          (error) => {
            console.error('Error cargando datos', error);
            this.isLoading = false;
          }
        );
      }


    getItems(): MenuItem[] {
        const items: MenuItem[] = [
            {
                label: 'Editar',
                icon: 'pi pi-user-edit',
                command: (event: any) => {
                    this.ActualizarCategoria(this.rowactual);
                },
            },
            {
                label: 'Detalle',
                icon: 'pi pi-eye',
                command: (event: any) => {
                    this.Details(this.rowactual);
                },
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: (event: any) => {
                    this.modaleliminarcategoria(this.rowactual);
                },
            },
        ];
        return items;
    }



    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    CrearCategoria() {
        this.titulo = 'Nueva';
        this.Index = false;
        this.CrearEditar = true;
        this.Edit = false;
        this.form.reset();
        this.display = false;

    }

    ActualizarCategoria(categoria: Categoria) {
        this.titulo = 'Editar';
        this.Index = false;
        this.CrearEditar = true;
        this.Edit = true;
        this.form.patchValue({ cate_Descripcion: categoria.cate_Descripcion });
        this.categoria = { ...categoria };
        this.display = false;
    }

    Cancelar() {
        this.CrearEditar = false;
        this.Edit = false;
        this.Index = true;
        this.form.reset();
        this.submitted = false;
        this.detalles = false;
        this.categoriass = []; // Limpia la lista de auditoría al cancela
    }



    confirmGuardar() {
        if (this.Edit) {
          // Si estamos en modo edición, mostramos el modal de confirmación
          this.confirmProveedorDialog = true;
        } else {
          // Si no estamos en modo edición (es una creación), guardamos directamente
          this.Guardar();
        }
      }

      Guardar() {
        if (this.form.valid) {
          const cate_Descripcion = this.form.value.cate_Descripcion.trim();
          const usua_Creacion = parseInt(this.cookieService.get('usua_Id')); // Usuario de creación
          const usua_Modificacion = parseInt(this.cookieService.get('usua_Id')); // Usuario de modificación
          const cate_Id = this.categoria.cate_Id;

          if (this.Edit) {
            // Modo edición: actualizar la categoría existente
            const categoriaActualizada = {
              cate_Id: cate_Id,
              cate_Descripcion: cate_Descripcion,
              usua_Modificacion: usua_Modificacion,
            };

            this.service.Actualizar(categoriaActualizada).subscribe(
              (respuesta: Respuesta) => {
                if (respuesta.success) {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Actualizado con Éxito.',
                    life: 3000,
                  });
                  this.ngOnInit(); // Recarga los datos
                  this.Edit = false; // Cierra el modo de edición
                  this.CrearEditar = false;
                  this.Index = true;
                } else {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Actualización fallida',
                    life: 3000,
                  });
                }
              },
              (error) => {
                console.error('Error actualizando:', error);
              }
            );
          } else {
            // Modo creación: insertar una nueva categoría
            const nuevaCategoria = {
              cate_Descripcion: cate_Descripcion,
              usua_Creacion: usua_Creacion,
            };

            this.service.Insertar(nuevaCategoria).subscribe(
              (respuesta: Respuesta) => {
                if (respuesta.success) {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Insertado con Éxito.',
                    life: 3000,
                  });
                  this.ngOnInit(); // Recarga los datos
                  this.CrearEditar = false;
                  this.Index = true;
                } else {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Inserción fallida',
                    life: 3000,
                  });
                }
              },
              (error) => {
                console.error('Error insertando:', error);
              }
            );
          }
        } else {
          this.submitted = true;
        }
      }

      confirmarActualizacion() {
        this.confirmProveedorDialog = false; // Cierra el modal de confirmación
        this.Guardar(); // Llama al método que realmente guarda los datos
      }

    // confirmarActualizacion() {
    //     this.confirmProveedorDialog = false; // Cierra el modal de confirmación
    //     this.realizarGuardado(); // Llama al método que realmente guarda los datos
    // }

    realizarGuardado() {
        const cate_Descripcion = this.form.value.cate_Descripcion;
        const usua_Creacion = 3;
        const usua_Modificacion = 3;
        const cate_Id = this.categoria.cate_Id;

        const Categoria: any = {
            cate_Descripcion: cate_Descripcion,
            usua_Creacion: usua_Creacion,
        };

        const Categoria2: any = {
            cate_Id: cate_Id,
            cate_Descripcion: cate_Descripcion,
            usua_Modificacion: usua_Modificacion,
        };

        if (this.Edit) {
            this.service.Actualizar(Categoria2).subscribe(
                (respuesta: Respuesta) => {
                    if (respuesta.success) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Actualizado con Éxito.',
                            life: 3000,
                        });

                        this.ngOnInit();

                        this.CrearEditar = false;
                        this.Index = true;
                        this.Edit = false;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Actualización fallida',
                            life: 3000,
                        });
                    }
                },
                (error) => {
                    console.error('Error actualizando:', error);
                }
            );
        } else {
            this.service.Insertar(Categoria).subscribe(
                (respuesta: Respuesta) => {
                    if (respuesta.success) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Insertado con Éxito.',
                            life: 3000,
                        });

                        this.CrearEditar = false;
                        this.Index = true;
                        this.ngOnInit();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Inserción fallida',
                            life: 3000,
                        });
                    }
                },
                (error) => {
                    console.error('Error insertando:', error);
                }
            );
        }
    }

    modaleliminarcategoria(categoria: Categoria) {
        this.modaleliminar = true;
        this.categoria = { ...categoria };
    }

    async EliminarCategoria() {
        // Cierra el cuadro de diálogo de eliminación
        this.modaleliminar = false;

        try {
            const response = await this.service.Eliminar(this.categoria.cate_Id);
            const { code, data, message } = response;

            let severity = 'error';
            let summary = 'Error';
            let detail = data?.messageStatus || message;

            if (code === 200) {
              severity = data.codeStatus > 0 ? 'success' : 'warn';
              summary = data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
              this.cargarDatos();
            } else if (code === 500) {
              severity = 'error';
              summary = 'Error Interno';
            }

            this.messageService.add({
              severity,
              summary,
              detail,
              life: 3000
            });
            this.ngOnInit();
          } catch (error) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error Externo',
              detail: error.message || error,
              life: 3000
            });
          } finally {
            this.modaleliminar = false;
          }
    }

    hola() {
        this.Index = true;
        this.detalles = false;
        this.categoriass = [];
    }

    Details(categoria: Categoria) {
        this.display = false;
        this.Index = false;
        this.detalles = true;
        this.categoria = { ...categoria };
        this.service.Buscar(this.categoria.cate_Id).subscribe(
            (data: any) => {
                const detalle = {
                    ...data,
                };
                this.categoriass.push(detalle);
            },
            error => {
                console.error('Error fetching data:', error);
            }
        );
        this.columnas = [
            { field: 'UsuarioCreacion' },
            { field: 'UsuarioModificacion' },
            { field: 'cate_FechaCreacion' },
            { field: 'cate_FechaModificacion' },
        ];
    }

    ValidarNumeros(event: KeyboardEvent) {
        const inputElement = event.target as HTMLInputElement;
        const key = event.key;
        if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
            event.preventDefault();
        }
        if (key === ' ' && inputElement.selectionStart === 0) {
            event.preventDefault();
        }
    }

    ValidarTexto(event: KeyboardEvent) {
        const inputElement = event.target as HTMLInputElement;
        const key = event.key;
        if (!/^[a-zA-Z\s]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
          event.preventDefault();
        }
        if (key === ' ' && inputElement.selectionStart === 0) {
          event.preventDefault();
        }
      }

    ValidarTextoNumeros(event: KeyboardEvent) {
        const key = event.key;
        const inputElement = event.target as HTMLInputElement;

        // Expresión regular que excluye emojis y permite solo letras, números, ñ, Ñ, y un solo espacio.
        const regex = /^[a-zA-ZñÑ0-9\s]$/;

        const controlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'];

        if (!regex.test(key) && !controlKeys.includes(key)) {
            event.preventDefault();
        }

        if (key === ' ' && (inputElement.selectionStart === 0 || inputElement.value.slice(-1) === ' ')) {
            event.preventDefault();
        }
    }

    allowOnlyAlphanumeric(event: Event) {
        const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    inputElement.value = texto
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');

    this.form.controls['cate_Descripcion'].setValue(inputElement.value);
      }
}
