import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem, MessageService, TreeNode } from 'primeng/api';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { UnidadMedida } from 'src/app/demo/models/modelsgeneral/unidadmedidaviewmodel';
import { unidadMedidaService } from 'src/app/demo/services/servicesgeneral/unidadmedida.service';
import { RolService } from 'src/app/demo/services/servicesacceso/rol.service';
import { Rol } from 'src/app/demo/models/modelsacceso/rolviewmodel';
import { NodeService } from 'src/app/demo/services/node.service';
import { ToastService } from 'src/app/demo/services/toast.service';
import { Gravedades } from 'src/app/demo/models/GravedadIzitoastEnum';
import { CookieService } from 'ngx-cookie-service';
import { forEach } from 'lodash';
import { filter } from 'rxjs';

@Component({
  selector: 'acceso-rol',
  templateUrl: './rol.component.html',
  styleUrl: './rol.component.scss',
  providers: [MessageService,NodeService]
})
export class RolComponent implements OnInit {
  // Propiedades
  files1:TreeNode[] = [];

  selectedFiles1: any;

  selectedKeys: string[] = [];

  selectedState: any = null;

  Roles: Rol[] = [];

  items: MenuItem[] = [];

  Index: boolean = true;

  Create: boolean = false;

  Detail: boolean = false;

  Delete: boolean = false;

  confirm: boolean = false;

  ConfirmarRol = false;
  LoadingSubir = true;
  LoadingSubir2 = false;
  form: FormGroup;
  submitted: boolean = false;

  identity: string  = "Crear";

  loading: boolean = true;

  selectedRol: any;

  id: number = 0;

  titulo: string = "Nuevo"

  Datos = [{}];

  detalle_codigo : string  = "";

  detalle_descripcion: string  = "";

  detalle_usuaCreacion: string  = "";

  detalle_usuaModificacion: string  = "";

  detalle_FechausuaCreacion: string  = "";

  detalle_FechausuaModificacion: string  = "";

  labels: string[] = [];

  nombreImagen: string = ""

 // Constructor
  constructor(
    private messageService: MessageService,
    private service: RolService,
 
    private fb: FormBuilder,
    private nodeService: NodeService,
    private toastService: ToastService,
    private router: Router,
    public cookieService: CookieService,
  ) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      // Si la URL coincide con la de este componente, forzamos la ejecución
      if (event.urlAfterRedirects.includes('/sigesproc/acceso/rol')) {
        // Aquí puedes volver a ejecutar ngOnInit o un método específico
        this.onRouteChange();
      }
    });
    this.form = this.fb.group({
      role_Descripcion: ['', Validators.required]
    });
  }
  onRouteChange(): void {
    this.ngOnInit();
  }
// Primera carga
 async ngOnInit() {
  //Resetear todo
  this.files1 = [];

  this.selectedFiles1 = null;

  this.selectedKeys = [];

  this.selectedState = null;

  this.Roles = [];

  this.items = [];

  this.Index = true;

  this.Create = false;

  this.Detail  = false;

  this.Delete = false;

  this.confirm= false;

 this.ConfirmarRol = false;
 
  this.submitted = false;

  this.identity = "Crear";

  this.id = 0;

  this.titulo = "Nuevo"

  this.Datos = [{}];

  this.detalle_codigo   = "";

  this.detalle_descripcion = "";

  this.detalle_usuaCreacion = "";

  this.detalle_usuaModificacion  = "";

  this.detalle_FechausuaCreacion  = "";

  this.detalle_FechausuaModificacion  = "";

  this.labels = [];

  this.nombreImagen = ""
  const token =  this.cookieService.get('Token');
  if(token == 'false'){
    this.router.navigate(['/auth/login'])
  }

   this.Listado();

    this.items = [
      { label: 'Editar', icon: 'pi pi-user-edit', command: (event) => this.EditarRol() },
      { label: 'Detalle', icon: 'pi pi-eye',command: (event) => this.DetalleRol() },
      { label: 'Eliminar', icon: 'pi pi-trash',command: (event) => this.EliminarRol() },
    ];
    this.nodeService.getFiles().then(files => this.files1 = files);


  


  }
   //Setear los datos de la lista de roles en la tabla
   Listado() {
    //Inica spinner de tabla
    this.loading = true;

    // Subscripcion para traer los datos y setear la tabla del index
    this.service.Listar()
      .subscribe((data: any) => {
        //Formateamos las fecha creacion y la de modificacion
        this.Roles = data.map((Roles: any) => ({
          ...Roles,
          role_FechaCreacion: new Date(Roles.role_FechaCreacion).toLocaleDateString(),
          role_FechaModificiacion: new Date(Roles.role_FechaModificiacion).toLocaleDateString()
        }));
        this.loading = false; 
      }),()=>{
        this.loading = false;
      }
  }

  //Se ejecuta al seleccionar y guardar las keys en un arreglo
  onNodeSelect(event: any) {
    this.updateSelectedKeys();
  }
  //Se ejecuta cuando quitamos una seleccion y elimina las keys en un arreglo
  onNodeUnselect(event: any) {
    this.updateSelectedKeys();
  }

  //Actualiza el tree view y  guardar las llaves en un arreglo o las elimina
  updateSelectedKeys() {
    const excludedKeys = ['1000', '1001', '1002', '1003','1004','1005','1006','1007','1008'];
    this.selectedKeys = this.selectedFiles1
      .map(node => node.key)
      .filter(key => !excludedKeys.includes(key));

  }

  //Filtro de busqueda de la tabla
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  //Setea el listado de roles al ejecutar ya sea una opcion de eliminar,detalles o editar
  selectRoles(roles: any) {
    this.selectedRol = roles;
  }

  //Creamos un rol
  CrearRol() {
    //El Treeview venga vacio
    this.selectedFiles1 = [];
    //Que no vena ni una llaveñ
    this.selectedKeys = [];
    //Traemos el listado para crear el Tree View
    this.nodeService.getFiles().then(files => this.files1 = files);
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.form.reset();
    this.identity = "crear";
    this.confirm = false
    this.titulo= "Nuevo"
  }

  //Por si cerramos el rol, que vuelva a la normalidad los collapse
  CerrarRol() {
    this.Index = true;
    this.Detail = false;
    this.Create = false;
    this.submitted = false;
  }
  //Mandamos a llamar la lista de las pantallas y ejecutamos ciertas funciones para llenar el tree view
  EditarRol() {
    this.loading = true;
    console.log("El loading es" + this.loading)
    this.Detail = false;
    this.Index = false;
    this.Create = true;
    this.identity = "editar";
    this.titulo= "Editar"
    this.confirm = true;

    //Seteamos los valores seleccionados de esa fila paraos input
    this.form.patchValue({
      role_Descripcion: this.selectedRol.role_Descripcion,
    });
    //Traemos el listado
    this.nodeService.getFiles().then(treeFiles => {
      //Seteeamos los datos en el Tree View
      this.files1 = treeFiles;

      //Subscripcion para traer las llaves ya marcadas por el rol que estamos seleccionando
      this.service.Buscar(this.selectedRol.role_Id).subscribe((data) => {
        if (Array.isArray(data)) {
          const pantIds = data.map((item) => item.pant_Id);


          this.markAddedScreens(treeFiles, pantIds);
          this.loading = false;
        } else {
          console.error("El formato de datos devuelto no es un arreglo.");
        }
      });

    },

  );
    this.id = this.selectedRol.role_Id;
    
  }

  allowObservacion(event: any) {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]|(?<=\s)[^\sa-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s/, '');
  }
  //Mapea las pantallas id en un arreglo para enviarselas a otro metodo que sera el encargado de marcar el treview para que aparezca cargado
  markAddedScreens(treeNodes: TreeNode[], pantIds: number[]) {
    const addedKeys = pantIds.map((id) => id.toString());
    //Usamos una funcion que retorna ya creado el Tree View con selecciones
    this.selectedFiles1 = this.findNodesByKey(treeNodes, addedKeys);
    //actualizamos el arrego con las llaves seleccionadas
    this.updateSelectedKeys();
  }
  //Evalua que las id, y si todos los id de un padre estan marca al padre.
  findNodesByKey(nodes: TreeNode[], keys: string[], parent: TreeNode | null = null): TreeNode[] {
    let selected: TreeNode[] = [];

    nodes.forEach((node) => {
        let childrenSelected: TreeNode[] = [];

        // Si el nodo tiene hijos, recursivamente verifica su selección
        if (node.children && node.children.length > 0) {
            childrenSelected = this.findNodesByKey(node.children, keys, node);
            selected = selected.concat(childrenSelected);  // Agrega hijos seleccionados al arreglo de seleccionados
        }

        // Verifica si la clave del nodo actual está en las claves seleccionadas
        const isSelected = keys.includes(node.key);

        // Verifica si **todos** los hijos están seleccionados
        const allChildrenSelected = node.children && node.children.length > 0 && node.children.every(child => child.partialSelected === false && keys.includes(child.key));
        const hasSelectedChildren = childrenSelected.length > 0;

        // Actualiza el estado de selección del nodo actual
        if (isSelected || allChildrenSelected) {
            selected.push(node);  // Marca el nodo como seleccionado
            node.partialSelected = false;  // Totalmente seleccionado, no parcialmente
            node.expanded = true;  // Expande los nodos completamente seleccionados
        } else if (hasSelectedChildren) {
            node.partialSelected = true;  // Algunos hijos seleccionados, marca como parcialmente
            node.expanded = true;  // Expande los nodos parcialmente seleccionados
        } else {
            node.partialSelected = false;  // Ninguna selección
            node.expanded = false;  // Colapsa si no está seleccionado
        }

        // Si hay un nodo padre, actualiza su estado en base a los hijos
        if (parent) {
            // Si algún hijo está parcialmente o completamente seleccionado, expande el padre
            parent.expanded = true;

            // Si todos los hijos están seleccionados, marca el padre como seleccionado
            if (node.children && node.children.every(child => child.partialSelected === false && keys.includes(child.key))) {
                parent.partialSelected = false;
            } else {
                parent.partialSelected = parent.partialSelected || hasSelectedChildren;
            }

            // Marca el padre como parcialmente seleccionado si algunos pero no todos los hijos están seleccionados
            if (hasSelectedChildren && !allChildrenSelected) {
                parent.partialSelected = true;
            }
        }
    });

    // Verificación especial después del marcado general
    nodes.forEach((node) => {
        if (node.key === "1000") {
          

            // Verifica si todos los hijos tienen partialSelected: false
            const allChildrenNotPartial = node.children && node.children.length > 0 && node.children.every(child => child.partialSelected === false);
            
   

            // Si ninguno de los hijos tiene partialSelected: true, marca el nodo "1000" como seleccionado
            if (allChildrenNotPartial) {
                selected.push(node);  // Marca "1000" como seleccionado
                node.partialSelected = false;  // Totalmente seleccionado
                node.expanded = true;  // Expande los nodos completamente seleccionados
            } else if (node.children.length > 0) {
                node.partialSelected = true;  // Algunos hijos seleccionados parcialmente, marca como parcialmente
                node.expanded = true;  // Expande el nodo parcialmente seleccionado
            } else {
                node.partialSelected = false;  // Ninguna selección
                node.expanded = false;  // Colapsa si no está seleccionado
            }
        }
        if (node.key === "1020") {
    
      
          // Verifica si todos los hijos de node.children tienen expanded: false
          let allChildrenNotPartial = true;
          node.children.forEach(children => {
            children.children.forEach(grandchild => {
          
              if (grandchild.expanded == false) {
                allChildrenNotPartial = false;
              }
              // Aquí iteras sobre los nietos
          });

          
          });


          
      
     
      
          // Si todos los hijos de todos los children tienen expanded en false, marca el nodo "1020" como seleccionado
          if (allChildrenNotPartial) {
              selected.push(node);  // Marca "1020" como seleccionado
              node.partialSelected = false;  // Totalmente seleccionado
              node.expanded = true;  // Expande los nodos completamente seleccionados
          } else {
              // Si hay algún hijo cuyos hijos tienen expanded: true, marca el padre como parcialmente seleccionado
              node.partialSelected = true;  // Algunos hijos o nietos seleccionados parcialmente
              node.expanded = true;  // Expande el nodo si tiene hijos o nietos seleccionados
          }
      }
      if (node.key === "1030") {

    
        // Verifica si todos los hijos de node.children tienen expanded: false
        let allChildrenNotPartial = true;
        node.children.forEach(children => {
          children.children.forEach(grandchild => {
    
            if (grandchild.expanded == false) {
              allChildrenNotPartial = false;
            }
            // Aquí iteras sobre los nietos
        });

        
        });


        
    
  
        
    
        // Si todos los hijos de todos los children tienen expanded en false, marca el nodo "1020" como seleccionado
        if (allChildrenNotPartial) {
            selected.push(node);  // Marca "1020" como seleccionado
            node.partialSelected = false;  // Totalmente seleccionado
            node.expanded = true;  // Expande los nodos completamente seleccionados
        } else {
            // Si hay algún hijo cuyos hijos tienen expanded: true, marca el padre como parcialmente seleccionado
            node.partialSelected = true;  // Algunos hijos o nietos seleccionados parcialmente
            node.expanded = true;  // Expande el nodo si tiene hijos o nietos seleccionados
        }
    }
      
      
    });

    // Si estamos en el nivel más alto (sin padre), verifica si todas las claves están seleccionadas
    if (!parent && keys.length > 0) {
        const totalKeys = nodes.reduce((count, node) => count + 1 + (node.children ? node.children.length : 0), 0);
        if (keys.length === totalKeys) {
            nodes.forEach((node) => {
                node.partialSelected = false;  // Totalmente seleccionado, sin selección parcial
                if (!selected.includes(node)) {
                    selected.push(node);  // Agrega el nodo completamente seleccionado
                }
            });
        }
    }

    return selected;
}







  //En el mismo guardar se pueden ejecutar tanto como editar y crear si es editar ejecutara un modal
  Guardar() {

    //Preguntamos si es false para no levantar un modal
    if (this.confirm == false) {
    if (this.form.valid) {
      this.LoadingSubir = false;
      this.LoadingSubir2 = true;
      this.ConfirmarRol = false;
      const roles: any = {
        role_Id: this.id,
        role_Descripcion: this.form.value.role_Descripcion,
        pantallasSeleccionadas: this.selectedKeys,
        usua_Creacion: parseInt(this.cookieService.get('usua_Id')),
        usua_Modificacion:parseInt(this.cookieService.get('usua_Id'))
        };


      if (this.identity != "editar") {
        this.service.Insertar(roles).subscribe(
          (respuesta: Respuesta) => {
          
            if (respuesta.success) {
              this.toastService.toast(
                Gravedades.success,
                'Insertado con Éxito.'
              )

              //Recargamos el listado y cerramos el rol
              this.Listado();
              this.CerrarRol();
              this.LoadingSubir = true;
              this.LoadingSubir2 = false;
              this.ConfirmarRol = false;
              this.submitted = false;
            } else {
              this.toastService.toast(
                Gravedades.error,
                'El rol ya existe.'
              )
        
              this.ConfirmarRol = false;
              this.LoadingSubir = true;
              this.LoadingSubir2 = false;
            }
          }
        );
      }else{
        this.service.Actualizar(roles).subscribe(
          (respuesta: Respuesta) => {
          
            if (respuesta.success) {
              this.toastService.toast(
                Gravedades.success,
                'Actualizado con Éxito.'
              )
               //Recargamos el listado y cerramos el rol
              this.Listado();
              this.LoadingSubir = true;
              this.LoadingSubir2 = false;
              this.CerrarRol();
              this.submitted = false;
              this.ConfirmarRol = false;
            } else {
              this.toastService.toast(
                Gravedades.error,
                'El rol ya existe.'
              )
          
              this.ConfirmarRol = false;
              this.LoadingSubir = true;
              this.LoadingSubir2 = false;            }
          }
        );
      }

    } else {
     this.submitted = true;
    }}else {
      if (this.form.valid) {
        this.confirm = false
      
        this.ConfirmarRol = true;
      }else{
        this.submitted = true
      }
     
    }
  }

    //Aqui el confirmar editar en envia al editar
    async confirmarRol(){
      await this.Guardar();
  }






//Cargamos las pantallas al collapse de detalles y las pantallas igual
  DetalleRol(){
    //Subscripcion para traer todas las pantallas que tiene ese rol
    this.service.Buscar(this.selectedRol.role_Id).subscribe((data) => {
    if (Array.isArray(data)) {
    this.labels = data.map((item) => item.pant_Descripcion);
    }
    });

    this.Index = false;
    this.Create = false;
    this.Detail = true;
 
    
    //Guardamos los valores en detalles que se mostraran en el html
    this.detalle_codigo = this.selectedRol.codigo;
    this.detalle_descripcion = this.selectedRol.role_Descripcion;
    this.detalle_usuaCreacion = this.selectedRol.usuaCreacion;
    if (this.selectedRol.usuaModificacion != null) {
      this.detalle_usuaModificacion = this.selectedRol.usuaModificacion;
      this.detalle_FechausuaModificacion = this.selectedRol.role_FechaModificiacion;

    }else{
      this.detalle_usuaModificacion = "";
      this.detalle_FechausuaModificacion = "";
    }

    this.detalle_FechausuaCreacion = this.selectedRol.role_FechaCreacion;

    }


    //Abrimos el modal de eliminar
    EliminarRol(){
    this.detalle_descripcion = this.selectedRol.role_Descripcion;
    this.id = this.selectedRol.role_Id;
    this.Delete = true;
   }





      async Eliminar() {

        this.Delete = false;

        try {
            // Llama al servicio de eliminación y espera la respuesta
            const response = await this.service.Eliminar(this.id);
            const { code, data, message } = response; // Desestructura la respuesta para obtener el código, los datos y el mensaje

            // Inicializa las variables para el mensaje de la notificación
            let severity = 'error'; // Severidad inicial en error
            let summary = 'Error'; // Resumen inicial en Error
            let detail = data?.messageStatus || message; // Detalle del mensaje, se toma de los datos o del mensaje general

            // Si el código de respuesta es 200 (éxito)
            if (code === 200) {
                // Ajusta la severidad y el resumen según el código de estado en los datos
                severity = data.codeStatus > 0 ? 'success' : 'warn';
                summary = data.codeStatus > 0 ? 'Éxito' : 'Advertencia';
            } else if (code === 500) {
                // Si el código es 500 (error interno del servidor)
                severity = 'error';
                summary = 'Error Interno';
            }

            // Muestra el mensaje de notificación según la severidad
            if (severity != 'success') {
              this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: detail, life: 3000,styleClass:'iziToast-custom'});
            } else {
              this.toastService.toast(
                Gravedades.success, // Muestra un mensaje de éxito
                detail
              )
            }

            // Actualiza la lista después de la eliminación
            this.Listado();
        } catch (error) {
            // En caso de error en la operación, muestra un mensaje de error
            this.toastService.toast(
                Gravedades.error, // Muestra un error crítico
                'Comunicarse con un administrador.'
              )
        }
    }

  //Regex
  ValidarTexto($event: KeyboardEvent | ClipboardEvent | InputEvent) {
    const inputElement = $event.target as HTMLInputElement;


    if ($event instanceof KeyboardEvent) {
      const key = $event.key;


      if (
        key === 'Backspace' ||
        key === 'Delete' ||
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        key === 'Tab'
      ) {
        return;
      }


      if (inputElement.value.length === 0 && key === ' ') {
        $event.preventDefault();
        return;
      }


      if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]$/.test(key)) {
        $event.preventDefault();
      }
    }


    if ($event instanceof ClipboardEvent) {
      const clipboardData = $event.clipboardData;
      const pastedData = clipboardData.getData('text');


      if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]*$/.test(pastedData)) {
        $event.preventDefault();
      }


      if (inputElement.value.length === 0 && pastedData.startsWith(' ')) {
        $event.preventDefault();
      }
    }


    if ($event instanceof InputEvent) {
      inputElement.value = inputElement.value.replace(/[^a-zA-Z\sáéíóúÁÉÍÓÚñÑ]/g, '');

      if (inputElement.value.startsWith(' ')) {
        inputElement.value = inputElement.value.trimStart();
      }
    }
  }


}


