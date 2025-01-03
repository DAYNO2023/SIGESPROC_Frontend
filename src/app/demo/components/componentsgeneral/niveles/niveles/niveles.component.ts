import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { Niveles } from 'src/app/demo/models/modelsgeneral/nivelesviewmodel';
import { NivelesService } from 'src/app/demo/services/servicesgeneral/niveles.service';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-niveles',
  templateUrl: './niveles.component.html',
  styleUrls: ['./niveles.component.scss'],
  providers: [MessageService]
})
export class NivelesComponent implements OnInit {
  niveles: Niveles[] = [];
  items: MenuItem[] = [];
  Index = true;
  Create = false;
  Detail = false;
  Delete = false;
  confirmProveedorDialog = false;
  form: FormGroup;
  submitted = false;
  identity = 'Crear';
  selectedNivel: Niveles | null = null;
  id = 0;
  titulo = 'Nuevo';

  // Detalles
  Datos: any[] = [];
  detalle_nive_Id = '';
  detalle_codigo = '';
  detalle_nive_Descripcion = '';
  detalle_usuarioCreacion = '';
  detalle_usuarioModifica = '';
  detalle_FechausuaCreacion = '';
  detalle_FechausuaModificacion = '';
  nivel: any;


  constructor(
    private messageService: MessageService,
    private service: NivelesService,
    private router: Router,
    private fb: FormBuilder,
    public cookieService: CookieService,
  ) {
    this.form = this.fb.group({
      nive_Descripcion: ['', Validators.required]
    });

    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/general/nivel')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
  }

  onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar
  
    this.ngOnInit();
  }


  ngOnInit(): void {

    this.Index = true;
    this.Detail = false;
    this.Create = false;

    const token = this.cookieService.get('Token');
    if (token === 'false') {
        this.router.navigate(['/auth/login']);
    }
    this.cargarDatos();

    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: () => this.EditarNivel() },
      { label: 'Detalle', icon: 'pi pi-eye', command: () => this.DetalleNivel(this.selectedNivel) },
      { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.EliminarNivel() },
    ];
  }
  isLoading = false

  handleInput2(event: any) {
    const input = event.target;
    
    // Recortar los espacios solo al principio y al final
    const trimmedValue = input.value.trim();
    
    // Actualiza el valor visual del campo de entrada
    input.value = trimmedValue;
    
    // Sincroniza el valor recortado con el control del formulario en Angular
    this.form.controls['nive_Descripcion'].setValue(trimmedValue, { emitEvent: false });
  }
  
  
  

  cargarDatos() {
    this.isLoading = true;  
    this.service.Listar().subscribe(
      (data: Niveles[]) => {
        this.niveles = data.map((nivel: any) => ({
          ...nivel,
          nive_FechaCreacion: new Date(nivel.nive_FechaCreacion!).toLocaleDateString(),
          nive_FechaModificacion: new Date(nivel.nive_FechaModificacion!).toLocaleDateString()
        }));
        this.isLoading = false;
      },
      (error) => {
        console.error('Error cargando datos', error);
        this.isLoading = false;
      }
    );

  }


  

  CrearNivel() {
    this.Create = true;
    this.Detail = false;
    this.Index = false;
    this.form.reset();
    this.identity = 'crear';
    this.titulo = 'Nuevo';
  }

  CerrarNivel() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
  }

  EditarNivel() {
    if (this.selectedNivel) {
      this.Detail = false;
      this.Index = false;
      this.Create = true;
      this.identity = 'editar';
      this.titulo = 'Editar';
      this.form.patchValue({
        nive_Descripcion: this.selectedNivel.nive_Descripcion,
      });
      this.id = this.selectedNivel.nive_Id!;
    }
  }

  DetalleNivel(nivel: Niveles | null) {
    if (nivel) {
      this.Index = false;
      this.Detail = true;
      this.nivel = { ...nivel };
  
      this.service.Listar().subscribe(
        (data: Niveles[]) => {
          const nivelDetalle = data.find(n => n.nive_Id === this.nivel.nive_Id);
          if (nivelDetalle) {
            this.detalle_codigo = nivelDetalle.codigo!.toString();
            this.detalle_nive_Id = nivelDetalle.nive_Id!.toString();
            this.detalle_nive_Descripcion = nivelDetalle.nive_Descripcion!;
            this.detalle_usuarioCreacion = nivelDetalle.usuaCreacion;
            this.detalle_usuarioModifica = nivelDetalle.usuaModificacion;
            this.detalle_FechausuaCreacion = new Date(nivelDetalle.nive_FechaCreacion).toLocaleDateString();
  
            // Verificación de la fecha de modificación
            this.detalle_FechausuaModificacion = nivelDetalle.nive_FechaModificacion
              ? new Date(nivelDetalle.nive_FechaModificacion).toLocaleDateString()
              : '';
  
            // Construir el array de Datos
            this.Datos = [
              {
                accion: 'Creado',
                usuario: this.detalle_usuarioCreacion,
                fecha: this.detalle_FechausuaCreacion
              },
              {
                accion: 'Modificado',
                usuario: this.detalle_usuarioModifica,
                fecha: this.detalle_FechausuaModificacion || ''
              }
            ];
          }
        },
        error => {
          console.error('Error fetching data:', error);
        }
      );
    }
  }
  
  
  

  EliminarNivel() {
    if (this.selectedNivel) {
      this.detalle_nive_Descripcion = this.selectedNivel.nive_Descripcion!;
      this.id = this.selectedNivel.nive_Id!;
      this.Delete = true;
    }
  }

  onRowSelect(nivel: Niveles) {
    this.selectedNivel = nivel;
  }

  confirmGuardar() {
    if (this.form.valid) {
      if (this.identity === 'editar') {
        this.confirmProveedorDialog = true;
      } else {
        this.realizarGuardado();
      }
    } else {
      this.submitted = true;
    }
  }

  confirmarActualizacion() {
    this.confirmProveedorDialog = false;
    this.realizarGuardado();
  }

  realizarGuardado() {
    const Nivel: Niveles = {
      nive_Id: this.id,
      nive_Descripcion: this.form.value.nive_Descripcion,
      usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
      usua_Modificacion: parseInt(this.cookieService.get('usua_Id'))
    };

    if (this.identity !== 'editar') {
      this.service.Insertar(Nivel).subscribe(
        (respuesta: Respuesta) => {
          if (respuesta.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Insertado con Éxito.', life: 3000 });
            this.cargarDatos();
            this.CerrarNivel();
            this.submitted = false;
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El nivel ya existe.', life: 3000 });
          }
        }
      );
    } else {
      this.service.Actualizar(Nivel).subscribe(
        (respuesta: Respuesta) => {
          if (respuesta.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 });
            this.cargarDatos();
            this.CerrarNivel();
            this.submitted = false;
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El nivel ya existe.', life: 3000 });
          }
        }
      );
    }
  }

  async Eliminar() {
    try {
      const response = await this.service.Eliminar(this.id);
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

    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error Externo',
        detail: error.message || error,
        life: 3000
      });
    } finally {
      this.Delete = false;
    }
  }

  handleInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    inputElement.value = texto.replace(/[^a-zñA-ZÑáéíóúüÁÉÍÓÚÜ\s]/g, '');
    this.form.controls['nive_Descripcion'].setValue(inputElement.value);
  }

  
}
