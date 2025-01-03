import { Component , OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { UsuarioService } from '../../../services/servicesacceso/usuario.service';
import { Usuario } from '../../../models/modelsacceso/usuarioviewmodel';
import { UsuarioComponent } from '../../componentsacceso/usuario/usuario.component';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { CookieService } from 'ngx-cookie-service';
import { log } from 'mathjs';
// import { ConsoleReporter } from 'jasmine';
// import { da } from 'date-fns/locale';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit{

    InicioSesion: Usuario[] = [];
    rememberMe: boolean = false;
    usuario: string;
    clave: string;
    usuarioValidar: boolean = false;
    claveValidar: boolean = false;
    credencialesValidar: boolean = false;
    formLogin: boolean = true;
    formReestablecerClave: boolean = false;
    usuarioValidarClave: boolean = false;
    usuarioInvalidoClave: boolean = false;
    formCodigo : boolean = false;
    codigoValidar : boolean = false;
    codigoInvalido : boolean = false;
    correoUsuario: string;
    SaberUsuario : any;
    codigo : string = '';
    formNuevasContras:  boolean = false;
    nuevaContraValidar : boolean = false;
    confirmarNuevaContraValidar : boolean = false;
    nuevaContra : string = '';
    confimarNuevaContra : string = ''
    clavesNoIguales : boolean = false;
    vContra : string = 'El campo es requerido.'
    clase1 = {
        'color': '#FAFAFA',
        'margin-block-end' : '-2%'
      };
      clase2 = {
        'color': '#FAFAFA',
        'margin-block-end' : '-2%'
      };
      clase3 = {
        'color': '#FAFAFA',
        'margin-block-end' : '-2%'
      };
      clase4 = {
        'color': '#FAFAFA',
        'margin-block-end' : '-2%'
      };
      clase5 = {
        'color': '#FAFAFA',
        'margin-block-end' : '-2%', 
        'font-size': '110%'
      };
      clase6 = {
        'color': '#FAFAFA',
        'margin-block-end' : '-2%'
      };
      clase7 = {
        'color': '#FAFAFA',
        'margin-block-end' : '-2%'
      };
      clase8 = {
        'color': '#FAFAFA',
        'margin-block-end' : '-2%', 
        'font-size': '110%'
      };

    constructor(
        public layoutService: LayoutService,
        private router: Router,
        public UsuarioService: UsuarioService,
        public cookieService: CookieService,
    ) {}

    get dark(): boolean {
        return this.layoutService.config().colorScheme !== 'light';
    }

    async ngOnInit() {
        let token = this.cookieService.get('Token');
        let roleId = this.cookieService.get('role_Id');
    
        if (token === 'true' && roleId) {
             
    
            // Si no tienes las pantallas permitidas en localStorage, recupéralas
            const pantallasGuardadas = localStorage.getItem('pantallasPermitidas');
            if (!pantallasGuardadas || pantallasGuardadas === '[]') {
                 
                await this.UsuarioService.obtenerPantallasPermitidasDesdeSesion(roleId);
            } else {
                 
                this.UsuarioService.setPantallasPermitidas(JSON.parse(pantallasGuardadas));
            }
    
            // Redirigir al dashboard u otra página
            this.router.navigate(['./sigesproc/Paginaprincipal/Paginaprincipal']);
        } else {
             
            this.router.navigate(['/auth/login']);
        }
    }
    
    volver(){
        this.formNuevasContras = false;
        this.formCodigo = false;
        this.formReestablecerClave = false;
        this.formLogin = true;
    }

    onChangeUsuario(event: any) {
        this.clase1 = {
            'color': '#FAFAFA',
            'margin-block-end' : '-2%'
          };
          this.clase3 = {
            'color': '#FAFAFA',
            'margin-block-end' : '-2%'
          };
          this.clase4 = {
            'color': '#FAFAFA',
            'margin-block-end' : '-2%'
          };

        this.usuarioValidar = false;
        this.usuarioValidarClave = false;

        this.clase6 = {
            'color': '#FAFAFA',
            'margin-block-end' : '-2%'
          };
          this.clase7 = {
            'color': '#FAFAFA',
            'margin-block-end' : '-2%'
          };

          this.clase8 = {
            'color': '#FAFAFA',
            'margin-block-end' : '-2%', 
            'font-size': '110%'
          };
    }

    onChangeClave(event: any) {

          this.clase2 = {
            'color': '#FAFAFA',
            'margin-block-end' : '-2%'
          };

          this.clase3 = {
            'color': '#FAFAFA',
            'margin-block-end' : '-2%'
          };

          this.clase7 = {
            'color': '#FAFAFA',
            'margin-block-end' : '-2%'
          };

          this.clase8 = {
            'color': '#FAFAFA',
            'margin-block-end' : '-2%', 
            'font-size': '110%'
          };
    }

    VerificarContraseniaCorrecta(variable: string): boolean {
        let containsNumbers = /\d/.test(variable); // Verifica si contiene números
        let containsUppercaseLetters = /[A-Z]/.test(variable); // Verifica si contiene letras mayúsculas
        let containsSpecialCharacters = /[!@#$%^&*(),.?":{}|<>_]/.test(variable); // Incluye el guion bajo en los caracteres especiales
        let hasValidLength = variable.length >= 8;

        return containsNumbers && containsUppercaseLetters && containsSpecialCharacters && hasValidLength;
      }
      

    async Login() {
        this.formNuevasContras = false;
        this.formCodigo = false;
        this.formReestablecerClave = false;
        // Cambiar el ícono a favicon_spinner.ico cuando inicie el proceso de login
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
            link.href = "favicon_spinner.ico";
        }
    
        // this.cookieService.set('Token', 'true');
        const usuarioTrimmed = this.usuario ? this.usuario.trim() : '';
        const claveTrimmed = this.clave ? this.clave.trim() : '';
    
        if (!usuarioTrimmed) {
            this.usuarioValidar = true;
            this.clase1 = {
            'color': 'red',
            'margin-block-end' : '-2%'
            };
    
            // Restaurar el ícono a favicon.ico si hay validación fallida
        }

        if(!claveTrimmed){
            this.clase2 = {
                'color': 'red',
                'margin-block-end' : '-2%'
            };
        }

        else {

        try {
            const usuarios = await this.UsuarioService.IniciarSesionWeb(this.usuario, this.clave);
            if (usuarios.length > 0) {
                const usuarioLogueado = usuarios[0];
    
                this.cookieService.set('Token', 'true', { path: '/', expires: 1 });  // Disponible en todo el dominio, expira en 1 día
                this.cookieService.set('usua_Id', usuarioLogueado.usua_Id.toString(), { path: '/', expires: 1 });
                this.cookieService.set('usua_Admin', usuarioLogueado.usua_EsAdministrador.toString(), { path: '/', expires: 1 });
                this.cookieService.set('role_Id', usuarioLogueado.role_Id.toString(), { path: '/', expires: 1 });
                this.cookieService.set('empleadoDNI', usuarioLogueado.empleadoDNI);
                this.cookieService.set('usua_Usuario', usuarioLogueado.usua_Usuario);
                this.cookieService.set('empleado', usuarioLogueado.nombre_Empleado);
    
                // Verifica si las cookies se han creado correctamente
                                  
                 if(usuarioLogueado.usua_Estado)
                 {
                 
                // Crear la estructura correcta para setPantallasPermitidas
                const pantallasPermitidas = usuarios.map(usuario => {
                    return {
                        pant_Descripcion: usuario.pant_Descripcion ? usuario.pant_Descripcion.toLowerCase().trim() : ''
                    };
                });
    
                // Almacenar pantallas permitidas en LocalStorage
                localStorage.setItem('pantallasPermitidas', JSON.stringify(pantallasPermitidas));
    
                this.UsuarioService.setPantallasPermitidas(pantallasPermitidas);
    
                // Redirigir al dashboard u otra página
                this.router.navigate(['./sigesproc/Paginaprincipal/Paginaprincipal']);
            }

            else{
                this.clase3 = {
                    'color': 'red',
                    'margin-block-end' : '-2%'
                };

            }
            } else {
                this.clase3 = {
                    'color': 'red',
                    'margin-block-end' : '-2%'
                };
            }
    
            // Restaurar el ícono a favicon.ico después de completar el proceso
            if (link) {
                link.href = "favicon.ico";
            }
        } catch (error) {    
            // Restaurar el ícono a favicon.ico en caso de error
            if (link) {
                link.href = "favicon.ico";
            }
        }
     }
    }
    

    async ReestablecerClave() {
        const usuarioTrimmed = this.usuario ? this.usuario.trim() : '';

        if (!usuarioTrimmed) {
            this.usuarioValidarClave = true;
        } else {
            await this.UsuarioService.Listar().then(
                (data: Usuario[]) => {
                    console.log('Me entro al metodo de reestablecer')
                    this.InicioSesion = data;

                    this.SaberUsuario = this.InicioSesion.find(usua => usua.usua_Usuario == this.usuario);
                    console.log('Este es el saber de usuario', this.SaberUsuario)                     

                    if (this.SaberUsuario == undefined) {
                        this.usuarioInvalidoClave = true;
                    } else {
                        this.usuarioInvalidoClave = false;
                    }
                }
            );

			this.UsuarioService.ReestablecerCorreoWeb(parseInt(this.SaberUsuario.usua_Id),this.SaberUsuario.empl_CorreoElectronico.toString(), this.usuario).subscribe(
                (respuuesta: Respuesta) =>{
                    if(respuuesta.code == 200 && respuuesta.success == true){
                        this.formReestablecerClave = false;
                        this.formCodigo = true;
                    }
                    console.log('Esta es la respuesta que me devolvio el servicio', respuuesta)
                }
            )

            this.correoUsuario = this.SaberUsuario.empl_CorreoElectronico;
             
        }
	}

    VerificarCodigo(){

        const codigoTrimmed = this.codigo ? this.codigo.trim() : '';
        if(!codigoTrimmed){
            this.clase4 = {
                'color': 'red',
                'margin-block-end' : '-2%'
              };
        }

        else{
            this.UsuarioService.VerificarCodigoReestablecerWeb(this.SaberUsuario.usua_Id, parseInt(this.codigo)).subscribe(
                (data : Respuesta)=>{
                     
                    if(data.code == 200 && data.success == true){
                        this.formNuevasContras = true;
                        this.formCodigo = false;
                    }
                    else{
                        this.clase5 = {
                            'color': 'red',
                            'margin-block-end' : '-2%', 
                            'font-size': '110%'
                          };
                    }
                }
            )
        }

    }

    NuevaContra(){
        const nuevaContraTrimmed = this.nuevaContra ? this.nuevaContra.trim() : '';
        const confimarNuevaContraTrimmed = this.confimarNuevaContra ? this.confimarNuevaContra.trim() : '';

        if (!nuevaContraTrimmed) {
            this.vContra = 'El campo es requerido.'
            this.clase6 = {
                'color': 'red',
                'margin-block-end' : '-2%'
              };
        }

        if(!this.VerificarContraseniaCorrecta(this.nuevaContra)){
            this.vContra = 'Contraseña inválida.'
            this.clase6 = {
                'color': 'red',
                'margin-block-end' : '-2%'
              };
        }

        if (!confimarNuevaContraTrimmed && this.VerificarContraseniaCorrecta(this.nuevaContra)) {
            this.clase7 = {
                'color': 'red',
                'margin-block-end' : '-2%'
              };
        }

        else if(this.confimarNuevaContra != this.nuevaContra && this.VerificarContraseniaCorrecta(this.nuevaContra)){
            this.clase8 = {
                'color': 'red',
                'margin-block-end' : '-2%', 
                'font-size': '110%'
              };
        }



        else if(this.VerificarContraseniaCorrecta(this.nuevaContra)){
            const UsuarioViewModel: any = {
                Usua_Id: this.SaberUsuario.usua_Id,
                usua_Usuario: '',
                usua_Clave: this.nuevaContra,
                usua_EsAdministrador: true,
                role_Id: 0,
                empl_Id:  0,
                usua_Creacion: 3,
                usua_Modificacion: 3
                };

            this.UsuarioService.Reestablecer(UsuarioViewModel).subscribe(
                (respuesta: Respuesta) => {
                     
                    if (respuesta.success) {
                        this.formNuevasContras = false;
                        this.formLogin =  true;
                    // this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Reestablecido con Éxito.', life: 3000 });
                    // this.Listado();
                    // this.reestableceerModal = false
                    // this.CerrarUsuario();
                    //     this.submitted = false;
                    } else {
                    // this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Comunicarse con un administrador.', life: 3000 });
                    //  
                    }
                }
                );
        }
    }

}
