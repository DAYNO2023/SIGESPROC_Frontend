import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { RoleGuard } from 'src/app/guards/role.guard';

@NgModule({
    imports: [RouterModule.forChild([
        {
            path: 'Paginaprincipal',
            data: { breadcrumb: 'Principal' },
            loadChildren: () => import('../componentsgraficosprincipales/graficos/graficos.module').then(m => m.GraficosPrincipalesModule),
            //  canActivate: [AuthGuard, RoleGuard]
        }
    ])],
    exports: [RouterModule],
})
export class GraficosRoutingModule { }
