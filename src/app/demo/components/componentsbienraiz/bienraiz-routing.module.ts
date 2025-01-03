import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { RoleGuard } from 'src/app/guards/role.guard';

@NgModule({
    imports: [RouterModule.forChild([
        { 
            path: 'terreno', 
            data: { breadcrumb: 'Terreno' }, 
            loadChildren: () => import('../componentsbienraiz/terreno/terreno.module').then(m => m.TerrenoModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'ventadebienesraices', 
            data: { breadcrumb: 'Venta de Bienes Raíces' }, 
            loadChildren: () => import('./VentadeBienesRaíces/VentadeBienesRaíces.module').then(m => m.VentabienraizModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'agentesdebienesraices', 
            data: { breadcrumb: 'Agentes de Bienes Raíces' }, 
            loadChildren: () => import('./AgentesdeBienesRaices/agentebienraiz.module').then(m => m.AgenteBienRaizModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'empresabienraiz', 
            data: { breadcrumb: 'Empresas de Bienes Raíces' }, 
            loadChildren: () => import('../componentsbienraiz/empresabienraiz/empresabienraiz.module').then(m => m.EmpresabienraizModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'bienesraices', 
            data: { breadcrumb: 'Bienes Raíces' }, 
            loadChildren: () => import('./BienesRaices/bienraiz.module').then(m => m.BienraizModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
        { 
            path: 'tiposdedocumentos', 
            data: { breadcrumb: 'Tipos de Documentos' }, 
            loadChildren: () => import('./TiposdeDocumentos/TipoDocumento.module').then(m => m.UnidadMedidaModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
    ])],
    exports: [RouterModule]
})
export class BienRaizRoutingModule { }
