import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { RoleGuard } from 'src/app/guards/role.guard';

@NgModule({
    imports: [RouterModule.forChild([
        { 
            path: 'usuario', 
            data: { breadcrumb: 'Usuarios' }, 
            loadChildren: () => import('../componentsacceso/usuario/usuario.module').then(m => m.UsuarioModule),
            canActivate: [AuthGuard, RoleGuard],  // Aplica los guards
        },
        { 
            path: 'rol', 
            data: { breadcrumb: 'Roles' }, 
            loadChildren: () => import('../componentsacceso/rol/rol.module').then(m => m.RolModule),
            canActivate: [AuthGuard, RoleGuard]  // Aplica los guards
        },
        { 
            path: 'perfil', 
            data: { breadcrumb: 'Perfil' }, 
            loadChildren: () => import('../componentsacceso/perfil/perfil.module').then(m => m.PerfilModule),
            canActivate: [AuthGuard, RoleGuard]  // Aplica los guards
        },    
    ])],
    exports: [RouterModule]
})
export class AccesoRoutingModule { }
