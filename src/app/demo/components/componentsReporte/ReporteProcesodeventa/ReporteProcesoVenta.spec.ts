import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteProcesoVentaComponent } from './ReporteProcesoVenta.component';

describe('CategoriaViatico', () => {
  let component: ReporteProcesoVentaComponent;
  let fixture: ComponentFixture<ReporteProcesoVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteProcesoVentaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteProcesoVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
