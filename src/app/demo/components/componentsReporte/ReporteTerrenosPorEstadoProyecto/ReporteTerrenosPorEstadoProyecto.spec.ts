import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteTerrenosPorEstadoProyectoComponent } from './ReporteTerrenosPorEstadoProyecto.component';

describe('CategoriaViatico', () => {
  let component: ReporteTerrenosPorEstadoProyectoComponent;
  let fixture: ComponentFixture<ReporteTerrenosPorEstadoProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteTerrenosPorEstadoProyectoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteTerrenosPorEstadoProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
