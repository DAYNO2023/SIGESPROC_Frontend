import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportecomprasPendientesEnvioComponent } from './ReportecomprasPendientesEnvio.component';

describe('CategoriaViatico', () => {
  let component: ReportecomprasPendientesEnvioComponent;
  let fixture: ComponentFixture<ReportecomprasPendientesEnvioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportecomprasPendientesEnvioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportecomprasPendientesEnvioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
