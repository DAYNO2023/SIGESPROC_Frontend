import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { RoleGuard } from 'src/app/guards/role.guard';

@NgModule({
    imports: [RouterModule.forChild([
        { 
            path: 'Fletes', 
            data: { breadcrumb: 'Fletes' }, 
            loadChildren: () => import('./Fletes/Fletes.module').then(m => m.FleteModule),
            canActivate: [AuthGuard, RoleGuard]  
        },
    ])],
    exports: [RouterModule]
})
export class FleteRoutingModule { }
