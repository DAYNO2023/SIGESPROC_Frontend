import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteProgresoActividadesComponent } from './ReporteProgresoActividades.component';

describe('CategoriaViatico', () => {
  let component: ReporteProgresoActividadesComponent;
  let fixture: ComponentFixture<ReporteProgresoActividadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteProgresoActividadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteProgresoActividadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
