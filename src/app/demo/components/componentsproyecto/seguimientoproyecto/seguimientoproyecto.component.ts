import { Component } from '@angular/core';
import { editingData, editingResources } from './data';
import { gantt } from 'dhtmlx-gantt';
import { GanttComponent } from '../gantt/gantt.component';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { GanttService } from 'src/app/demo/services/servicesproyecto/gantt.service';
import { Router } from "@angular/router";
import { DialogModule } from 'primeng/dialog';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-seguimientoproyecto',
    standalone: true,
    imports: [GanttComponent, ButtonModule, GanttComponent, InputSwitchModule, DropdownModule, DialogModule, TooltipModule],
    templateUrl: './seguimientoproyecto.component.html',
    styleUrl: './seguimientoproyecto.component.scss',
})
export class SeguimientoproyectoComponent {
    public opciones: any[]; 
    public crear: boolean = false;
    public proyecto: any = {};

    constructor(private GanttService: GanttService, private router: Router, private CookieService: CookieService,     private Router: Router,
        ) {}

    public ngOnInit(): void {
        const token = this.CookieService.get('Token');
        if (token == 'false') {
          this.Router.navigate(['/auth/login'])
        } 
        this.opciones = [{name:'año'}, {name:'mes'}, {name:'semanas'}, {name: 'dias'}];
        this.proyecto = JSON.parse(
            this.CookieService.get('proyecto')
        );


    } //end ngOnInit

    //METODOS
    public handleFullScreen(){
        const currentFullScreen = this.GanttService.fullScreen.getValue();
        this.GanttService.fullScreen.next(true);
    }

    public exportMsProject(){
        const currectMsProject = this.GanttService.msProject.getValue();
        this.GanttService.msProject.next(true);
    }

    public exportPDF(){
        const currentPDF = this.GanttService.pdf.getValue();
        this.GanttService.pdf.next(true);
        
    }

    public exportPNG(){
        const currentPNG = this.GanttService.png.getValue();
        this.GanttService.png.next(true);
    }

    public exportExcel(){
        const currentExcel = this.GanttService.excel.getValue();
        this.GanttService.excel.next(true);
    }

    public handleUndo(){
        const currentValue = this.GanttService.deshacer.getValue();
        this.GanttService.deshacer.next(!currentValue);
    }

    public handleRedo(){
        const currentValue = this.GanttService.rehacer.getValue();
        this.GanttService.rehacer.next(!currentValue);
    }

    public handleCollapse(){
        const currentValue = this.GanttService.colapsar.getValue();
        this.GanttService.colapsar.next(!currentValue);
    }

    public regresar(){
        this.router.navigate(['/sigesproc/proyecto/proyecto']);
    }
}
