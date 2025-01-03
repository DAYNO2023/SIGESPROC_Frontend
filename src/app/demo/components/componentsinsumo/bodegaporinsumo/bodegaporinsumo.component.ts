import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { BodegaService } from 'src/app/demo/services/servicesinsumo/bodega.service';
import { BodegaPorInsumoService } from 'src/app/demo/services/servicesinsumo/bodegaporinsumo.service';
import { DropDownBodega } from 'src/app/demo/models/modelsinsumo/bodegaviewmodel';
import { BodegaPorInsumo } from 'src/app/demo/models/modelsinsumo/bodegaporinsumoviewmodel';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-bodegaporinsumo',
  templateUrl: './bodegaporinsumo.component.html',
  providers: [MessageService],
  styleUrl: './bodegaporinsumo.component.scss'
})
export class BodegaPorInsumoComponent {


  bodegasporinsumo: BodegaPorInsumo[] = [];
  items: MenuItem[] = [];
  bodegas: DropDownBodega[] = [];

  Index: boolean = true;
  Create: boolean = false;
  Detail: boolean = false;
  Delete: boolean = false;
  form: FormGroup;
  formb: FormGroup;
  identity: string  = "Crear";
  selectedbodegaporinsumo: any;
  id: number = 0;
  submitted: boolean = false;
  Datos = [{}];
  detalle_bopi_Id : string  = "";
  detalle_bode_Id : string  = "";
  detalle_inpp_Id: string  = "";
  detalle_bode_Descripcion: string  = "";
  detalle_bode_DireccionExacta: string  = "";
  detalle_insu_Descripcion: string  = "";
  detalle_bopi_Stock : string  = "";
  detalle_usuaCreacion: string  = "";
  detalle_usuaModificacion: string  = "";
  detalle_FechausuaCreacion: string  = "";
  detalle_FechausuaModificacion: string  = "";

  constructor(
    private messageService: MessageService,
    private bodegaservice: BodegaService,
    private service:BodegaPorInsumoService,
    private fb: FormBuilder,
    private fbs: FormBuilder,
    private cookieService: CookieService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      bode_Id: ['', Validators.required],
      inpp_Id: ['', Validators.required],
      bopi_Stock: ['', Validators.required],
    });
    this.formb = this.fbs.group({
      bopi_Id: ['', Validators.required]
    })
    }

    ngOnInit(): void {
      const token = this.cookieService.get('Token');
      if (token === 'false') {
          this.router.navigate(['/auth/login']);
      }
  this.ListaBodegas();
      this.items = [
        { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarBodegaPorInsumo() },
        { label: 'Detalle', icon: 'pi pi-eye', command: (event) => this.DetalleBodegaPorInsumo() },
        { label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.EliminarBodegaPorInsumo() },
    ];
    };

ListaBodegas(){
  this.bodegaservice.Listar().subscribe(
    (data: DropDownBodega[]) => {
      this.bodegas = data;
      console.log(data);
 });
}

    Listado() {

      if (this.formb.valid) {
        const BodegaPorInsumo: any = {
          bopi_Id: this.formb.value.bopi_Id
        };


        console.log("Entra "+  BodegaPorInsumo)


        this.service.Listar(BodegaPorInsumo.bopi_Id).subscribe(
          (data: any) => {
          console.log(data);
          if(data.length > 0){
            this.bodegasporinsumo = data.map((bodegaporinsumo: any) => ({
              ...bodegaporinsumo
            }));
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se encontraron bodegas por insumo', life: 3000 });

          }
          },
          error => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se encontraron bodegas por insumo', life: 3000 });
              console.log(error);
          }
        );

      } else {
        console.log("Entra invalido");
   this.submitted = true;

      }




    }

    onGlobalFilter(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
    selectBodegaPorInsumo(bodegaporinsumo: any) {
      this.selectedbodegaporinsumo = bodegaporinsumo;
    }

  CrearBodegaPorInsumo() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.form.reset();
    this.identity = "crear";
    this.submitted = false;
  }

  cancelar(){
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
  }

  EditarBodegaPorInsumo() {
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.identity = "editar";
    this.form.patchValue({
      bode_Id: this.selectedbodegaporinsumo.bode_Id,
      inpp_Id: this.selectedbodegaporinsumo.inpp_Id,
      bopi_Stock: this.selectedbodegaporinsumo.bopi_Stock,
    });
    this.id = this.selectedbodegaporinsumo.bopi_Id;
  }

  DetalleBodegaPorInsumo(){
    this.Index = false;
    this.Create = false;
    this.Detail = true;
    this.detalle_bopi_Id = this.selectedbodegaporinsumo.bopi_Id;
    this.detalle_bode_Descripcion = this.selectedbodegaporinsumo.bode_Descripcion;
    this.detalle_insu_Descripcion = this.selectedbodegaporinsumo.insu_Descripcion;
    this.detalle_bopi_Stock = this.selectedbodegaporinsumo.bopi_Stock;
    this.detalle_usuaCreacion = this.selectedbodegaporinsumo.usua_Usuario;
    if (this.selectedbodegaporinsumo.usuaModificacion != null) {
      this.detalle_usuaModificacion = this.selectedbodegaporinsumo.usuaModificacion;
      this.detalle_FechausuaModificacion = this.selectedbodegaporinsumo.bopi_FechaModificacion;

    }else{
      this.detalle_usuaModificacion = "";
      this.detalle_FechausuaModificacion = "";
    }

    this.detalle_FechausuaCreacion = this.selectedbodegaporinsumo.bopi_FechaCreacion;
    console.log(this.selectedbodegaporinsumo)
    }

    EliminarBodegaPorInsumo(){
      this.id = this.selectedbodegaporinsumo.bopi_Id;
      this.Delete = true;
     }

Guardar() {
  if (this.form.valid) {
    const BodegaPorInsumo: any = {
      bopi_Id: this.id,
      bode_Id: this.form.value.bode_Id,
      inpp_Id: this.form.value.inpp_Id,
      bopi_Stock: this.form.value.bopi_Stock,
      usua_Creacion: 3,
      usua_Modificacion: 3
    };

    if(this.identity != "editar"){
    this.service.Insertar(BodegaPorInsumo).subscribe(
      (respuesta: Respuesta) => {
        console.log(respuesta)
        if (respuesta.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 });
          this.Listado();
          this.cancelar();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Actualizado fallido.', life: 3000 });
          console.log('RESPONSE:' + respuesta.success)
        }
      }
    );
  }else{
    this.service.Actualizar(BodegaPorInsumo).subscribe(
      (respuesta: Respuesta) => {
        console.log(respuesta)
        if (respuesta.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado con Éxito.', life: 3000 });
          this.Listado();
          this.cancelar();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Actualizado fallido.', life: 3000 });
          console.log('RESPONSE:' + respuesta.success)
        }
      }
    );
  }

  } else {
console.log("invalido");

   this.submitted = true;
  }
}

  Eliminar() {
    this.service.Eliminar(this.id).subscribe(
      (respuesta: Respuesta) => {
        console.log(respuesta)
        if (respuesta.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Eliminado con Éxito.', life: 3000 });
          this.Listado();
          this.Delete = false;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Eliminado fallido.', life: 3000 });
          this.Delete = false;
        }
      }
    );
  }
}
