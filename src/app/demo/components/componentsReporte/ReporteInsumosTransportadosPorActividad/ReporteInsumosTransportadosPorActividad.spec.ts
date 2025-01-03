import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteInsumosTransportadosPorActividadComponent } from './ReporteInsumosTransportadosPorActividad.component';

describe('CategoriaViatico', () => {
  let component: ReporteInsumosTransportadosPorActividadComponent;
  let fixture: ComponentFixture<ReporteInsumosTransportadosPorActividadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteInsumosTransportadosPorActividadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteInsumosTransportadosPorActividadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
