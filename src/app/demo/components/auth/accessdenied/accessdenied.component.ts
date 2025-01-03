import { Component, OnInit, OnDestroy } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Router } from '@angular/router';

@Component({
    templateUrl: './accessdenied.component.html',
    styleUrls: ['./accessdenied.css'],
})
export class AccessdeniedComponent implements OnInit, OnDestroy {

    constructor(
        public layoutService: LayoutService,
        private router: Router
    ) {}

    ngOnInit(): void {
        // Suscribirse al evento popstate del navegador para detectar el botón atrás
        window.addEventListener('popstate', this.onPopState);
    }

    ngOnDestroy(): void {
        // Limpiar el event listener cuando el componente se destruye
        window.removeEventListener('popstate', this.onPopState);
    }

    // Método que será llamado cuando el usuario presione el botón "Atrás" del navegador
    onPopState = (event: PopStateEvent) => {
        // Redirigir a la página principal si el usuario intenta ir hacia atrás
        this.router.navigateByUrl('/sigesproc/Paginaprincipal');
    };
}
