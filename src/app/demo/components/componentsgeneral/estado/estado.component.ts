import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { EstadoService } from 'src/app/demo/services/servicesgeneral/estado.service';
import { Estado } from 'src/app/demo/models/modelsgeneral/estadoviewmodel';
import { DropDownPaises } from 'src/app/demo/models/modelsgeneral/estadoviewmodel ';
import { CookieService } from 'ngx-cookie-service';
import { Pais } from 'src/app/demo/models/modelsgeneral/paisviewmodel';
import { filter } from 'rxjs';

@Component({
  selector: 'app-Estado',
  templateUrl: './estado.component.html',
  styleUrl: './estado.component.scss',
  providers: [MessageService]
})
export  class EstadoComponent implements OnInit {

  estados: Estado[] = [];
  paises: DropDownPaises[] = [];
  filteredPaises: any[] = [];
  selectedPais: string = "";
  items: MenuItem[] = [];
  Index: boolean = true;
  Create: boolean = false;
  Detail: boolean = false;
  Delete: boolean = false;
  isTableLoading: boolean = false;

  confirmEstadoDialog: boolean = false; //propiedad para levantar el modal de editar
  confirm: boolean = true; //propiedad de confirmacion para el editar

  editarEstadoDialog: boolean = false;
  loading: boolean = false;
  form: FormGroup;
  submitted: boolean = false;
  identity: string  = "Crear";
  selectedEstado: any;
  id: number = 0;
  titulo: string = "Nuevo"
  //Detalles
  Datos = [{}];
  detalle_esta_Id : string  = "";
  detalle_esta_Codigo: string  = "";
  detalle_esta_Nombre: string  = "";
  detalle_pais_Id: string  = "";
  detalle_pais_Nombre: string  = "";
  detalle_usuaCreacion: string  = "";
  detalle_usuaModificacion: string  = "";
  detalle_FechausuaCreacion: string  = "";
  detalle_FechausuaModificacion: string  = "";

  usua_Id: string = "";
  filtradoPaises: Pais[] = [];

  errorPais: String = "El campo es requerido.";

  constructor(
    private messageService: MessageService,
    private service: EstadoService,
    private router: Router,
    private fb: FormBuilder,
    private cookieService: CookieService,
  ) {

      this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/general/estado')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });

    this.form = this.fb.group({
      esta_Codigo: ['', Validators.required],
      esta_Nombre: ['', Validators.required],
      pais_Nombre: ['']
    });
  }

  ngOnInit(): void {
    if(this.cookieService.get("Token") == 'false'){
      this.router.navigate(['/auth/login']);
    }
    this.usua_Id = this.cookieService.get('usua_Id');

    this.Listado();
    this.Index = true;
    this.Create = false;
    this.Detail = false;
    this.Delete = false;

    this.items = [
        { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarEstado() },
        { label: 'Detalle', icon: 'pi pi-eye',command: (event) => this.DetalleEstado() },
        { label: 'Eliminar', icon: 'pi pi-trash',command: (event) => this.EliminarEstado() },
      ];


  };

  onRouteChange(): void {
    // Aquí puedes llamar cualquier método que desees reejecutar
    this.ngOnInit();
  }

  Listado() {
    this.loading = true;
    this.service.Listar().subscribe(
      (data: any) => {

        this.estados = data.map((Estados: any) => ({
          ...Estados,
          esta_FechaCreacion: new Date(Estados.esta_FechaCreacion).toLocaleDateString(),
          esta_FechaModificacion: new Date(Estados.esta_FechaModificacion).toLocaleDateString()
        }));
        this.loading = false;
      },
      error => {

      }
    );

    this.service.DropDownPaises().subscribe((response: any) => {
      if (Array.isArray(response)) {
        this.paises = response
          .map((pais: any) => ({
            ...pais
          }))
          .sort((a, b) => a.pais_Nombre.localeCompare(b.pais_Nombre));
      } else {

        this.paises = [];
      }
    });

  }
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  selectEstado(Estado: any) {
    this.selectedEstado = Estado;
  }

  onPaisSelect(event: any) {
    const paisSeleccionado = event;
    this.form.patchValue({pais_Nombre: paisSeleccionado.value.pais_Nombre})
}

filterPais(event: any) {
    const query = event.query.toLowerCase();
    this.filtradoPaises = this.paises.filter((proveedor) =>
      proveedor.pais_Nombre.toLowerCase().includes(query)
    );
  }


  CrearEstado() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.confirm = false;
    this.selectedPais = null;
    this.form.reset();
    this.identity = "crear";
    this.titulo= "Nuevo"
  }
  CerrarEstado() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
  }



  EditarEstado() {
    this.detalle_esta_Nombre = this.selectedEstado.esta_Nombre;

    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.confirm = true;
    this.identity = "editar";
    this.titulo= "Editar"
    this.selectedPais = this.paises.find(pais => pais.pais_Id === this.selectedEstado.pais_Id).pais_Nombre;
    this.form.patchValue({
      esta_Codigo: this.selectedEstado.esta_Codigo,
      esta_Nombre: this.selectedEstado.esta_Nombre,
      pais_Nombre: this.selectedEstado.pais_Nombre,
    });
    this.id = this.selectedEstado.esta_Id;
  }

  DetalleEstado(){
    this.Index = false;
    this.Create = false;
    this.Detail = true;
    this.detalle_esta_Id = this.selectedEstado.codigo;
    this.detalle_esta_Codigo = this.selectedEstado.esta_Codigo;
    this.detalle_esta_Nombre = this.selectedEstado.esta_Nombre;
    this.detalle_pais_Id = this.selectedEstado.pais_Id;
    this.detalle_pais_Nombre = this.selectedEstado.pais_Nombre;

    this.detalle_usuaCreacion = this.selectedEstado.usuaCreacion;
    if (this.selectedEstado.usuaModificacion != null) {
      this.detalle_usuaModificacion = this.selectedEstado.usuaModificacion;
      this.detalle_FechausuaModificacion = this.selectedEstado.esta_FechaModificacion;

    }else{
      this.detalle_usuaModificacion = "";
      this.detalle_FechausuaModificacion = "";
    }

    this.detalle_FechausuaCreacion = this.selectedEstado.esta_FechaCreacion;

    }

    EliminarEstado(){
    this.detalle_esta_Nombre = this.selectedEstado.esta_Nombre;
    this.id = this.selectedEstado.esta_Id;
    this.Delete = true;
   }

   ValidarNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;


    if (!/[0-9]/.test(key) && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }


    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }


    if (inputElement.value.length >= 2 && key !== 'Backspace' && key !== 'Tab') {
      event.preventDefault();
    }
  }

  ValidarTexto(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z\s ]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  ValidarTextoNumeros(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    if (!/^[a-zA-Z\s 0-9]+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        event.preventDefault();
    }
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  handleInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    // Solo permitir letras y un espacio después de cada letra
    inputElement.value = texto
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');

    // Actualizar el valor en el formulario
    this.form.controls['esta_Nombre'].setValue(inputElement.value);
  }

  handleInput2(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const texto = inputElement.value;

    // Solo permitir números, eliminando cualquier espacio
    inputElement.value = texto.replace(/[^0-9]/g, '');

    // Actualizar el valor en el formulario
    this.form.controls['esta_Codigo'].setValue(inputElement.value);
  }

    Guardar() {
            this.submitted = true;

            //Traer el id del rol y validar si existe.
            let idPais = this.paises.find(rol => rol.pais_Nombre ===
              this.form.value.pais_Nombre)?.pais_Id ?? 0;
               //Si es diferente a 0 le declaramos que no tendra ninguna validacion

               if (idPais !== 0) {
               this.form.get('pais_Nombre')?.setErrors(null);
               //De lo contrario le decimos si esta vacio para ver decirle que el campo es
               } else if(this.form.value.pais_Nombre == "" ||
              this.form.value.pais_Nombre == null){
               //Puede ser cualquier texto el invalidRoleId
              this.errorPais = "El campo es requerido."
               this.form.get('pais_Nombre')?.setErrors({ 'invalidPaisId': true });
               //Si no es ninguna de las dos es por que tiene texto, pero no existe la opcion
               }else {
               //Puede ser cualquier texto el invalidRoleId
               this.errorPais = "Opción no encontrada."
               this.form.get('pais_Nombre')?.setErrors({ 'invalidPaisId': true });
              }
              if (this.form.invalid) {
                  this.form.markAllAsTouched();
                  return;
              }

              if (!this.confirm) {
                  this.insertarEstado();
              } else if (this.confirm == true) {
                  this.editarEstadoDialog = true;
              }
          }


    allowAlfa(event: any) {
        // Expresión regular ajustada para bloquear los espacios y caracteres no permitidos
        event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ._-]/g, '');
      }

      allowCaracteresEspacio(event: any) {
        // Detectar si el evento es de tipo 'paste' (pegado)
        if (event.type === 'paste') {
            // Obtener el contenido del portapapeles
            const clipboardData = event.clipboardData;
            const pastedData = clipboardData.getData('text');

            // Expresión regular para bloquear los números
            if (/\d/.test(pastedData)) {
                // Si contiene números, prevenir el pegado
                event.preventDefault();
                return;
            }
        }

        // Expresión regular ajustada para permitir solo un espacio entre palabras y bloquear caracteres no permitidos
        event.target.value = event.target.value
            // Reemplazar caracteres no permitidos excepto letras, acentos, ñ, guiones, puntos y un solo espacio
            .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ._\-\s]/g, '')
            // Reemplazar múltiples espacios consecutivos por un solo espacio
            .replace(/\s{2,}/g, ' ');
    }


      insertarEstado(){
                const form2 = this.form.value;

                const estaNombre = form2.esta_Nombre;


                    // Expresión regular: solo permite letras y un solo espacio entre palabras
                    const regex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;

                    if (!regex.test(estaNombre.trim())) {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Advertencia',
                            detail: 'El nombre del estado es inválido.',
                            life: 3000,
                            styleClass: 'iziToast-custom',
                        });
                        return;
                    }


      let idPais = this.paises.find(rol => rol.pais_Nombre ===
          this.form.value.pais_Nombre)?.pais_Id ?? 0;

      const Estado: any = {
        esta_Id: this.id,
        esta_Codigo: form2.esta_Codigo.trim(),
        esta_Nombre: form2.esta_Nombre.trim(),
        pais_Id: idPais,
        usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
        };


      if (this.identity != "editar") {
        this.service.Insertar(Estado).subscribe(
          (respuesta: Respuesta) => {

            if (respuesta.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Insertado con Éxito.', life: 3000 });
              this.Listado();
              this.CerrarEstado();
              this.submitted = false;
            } else {
              this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass: 'iziToast-custom', detail: 'El registro ya existe.' , life: 3000 });


            }
          }
        );
      }else{

          this.editarEstadoDialog = true;


      }
    }




    confirmarEditar() {

        const form2 = this.form.value;

        const estaNombre = form2.esta_Nombre;


            // Expresión regular: solo permite letras y un solo espacio entre palabras
            const regex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;

            if (!regex.test(estaNombre.trim())) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'El nombre del estado es inválido.',
                    life: 3000,
                    styleClass: 'iziToast-custom',
                });
                return;
            }

        let idPais = this.paises.find(rol => rol.pais_Nombre ===
            this.form.value.pais_Nombre)?.pais_Id ?? 0;

        const Estado1: any = {
          esta_Id: this.id,
          esta_Codigo: form2.esta_Codigo.trim(),
          esta_Nombre: form2.esta_Nombre.trim(),
          pais_Id: idPais,
          usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
          usua_Modificacion: parseInt(this.cookieService.get('usua_Id')),
          };

        if (this.editarEstadoDialog) {
            this.editarEstadoDialog = false;

            this.service.Actualizar(Estado1).subscribe(
              (respuesta: Respuesta) => {

                if (respuesta.success) {
                  this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Actualizado con Éxito.', life: 3000 });
                  this.Listado();
                  this.CerrarEstado();
                  this.submitted = false;
                } else {
                  this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass: 'iziToast-custom', detail: 'El registro ya existe.', life: 3000 });

                }
              }
            );
          }
    }

  //   if(this.selectedPais){
  //     this.form.value.pais_Id = this.paises.find(pais => pais.pais_Nombre === this.selectedPais).pais_Id;
  //   }

  //   if (this.form.valid) {


  //   } else {
  //    this.submitted = true;
  //   }
  // }

  Eliminar() {
    this.service.Eliminar(this.id).subscribe(
      (respuesta: Respuesta) => {

        if (respuesta.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', styleClass: 'iziToast-custom', detail: 'Eliminado con Éxito.', life: 3000 });
          this.Listado();
          this.Delete = false;
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Advertencia', styleClass: 'iziToast-custom', detail: 'El registro depende de Ciudades', life: 3000 });
          this.Delete = false;
        }
      }
    );


  }
}
