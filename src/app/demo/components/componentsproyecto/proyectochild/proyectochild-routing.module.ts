import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ProyectoChildComponent } from "./proyectochild.component";

@NgModule({
    imports: [RouterModule.forChild([
		{ path: '', component: ProyectoChildComponent, children: [
            // TabMenu options
            { path: 'datosgenerales', loadChildren: () => import('./general/proyectochild-datosgenerales.module').then(m => m.ProyectoChildDatosGeneralesModule) },
            { path: 'etapas', loadChildren: () => import('./etapas/proyectochild-etapas.module').then(m => m.ProyectoChildEtapasModule) },
            { path: 'documentos', loadChildren: () => import('./documentos/proyectochild-documentos.module').then(m => m.ProyectoChildDocumentosModule) },
            { path: 'riesgos', loadChildren: () => import('./riesgos/proyectochild-riesgos.module').then(m => m.ProyectoChildRiesgosModule) },
        ]}
	])],
    exports: [RouterModule],
})
export class ProyectoChildRoutingModule { }
