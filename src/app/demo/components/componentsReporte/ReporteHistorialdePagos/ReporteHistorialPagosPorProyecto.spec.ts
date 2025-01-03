import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteHistorialPagosPorProyectoComponent } from './ReporteHistorialPagosPorProyecto.component';

describe('CategoriaViatico', () => {
  let component: ReporteHistorialPagosPorProyectoComponent;
  let fixture: ComponentFixture<ReporteHistorialPagosPorProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteHistorialPagosPorProyectoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteHistorialPagosPorProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
