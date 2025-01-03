import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteVentasPorEmpresaComponent } from './ReporteVentasPorEmpresa.component';

describe('CategoriaViatico', () => {
  let component: ReporteVentasPorEmpresaComponent;
  let fixture: ComponentFixture<ReporteVentasPorEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteVentasPorEmpresaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteVentasPorEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
