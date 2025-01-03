import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteEmpleadoPorEstadoComponent } from './ReporteEmpleadoPorEstado.component';

describe('CategoriaViatico', () => {
  let component: ReporteEmpleadoPorEstadoComponent;
  let fixture: ComponentFixture<ReporteEmpleadoPorEstadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteEmpleadoPorEstadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteEmpleadoPorEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
