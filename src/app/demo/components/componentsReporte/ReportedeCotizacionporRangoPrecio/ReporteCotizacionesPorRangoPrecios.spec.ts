import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteCotizacionesPorRangoPreciosComponent } from './ReporteCotizacionesPorRangoPrecios.component';

describe('CategoriaViatico', () => {
  let component: ReporteCotizacionesPorRangoPreciosComponent;
  let fixture: ComponentFixture<ReporteCotizacionesPorRangoPreciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteCotizacionesPorRangoPreciosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteCotizacionesPorRangoPreciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
