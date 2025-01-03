import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteComprasRealizadasComponent } from './ReporteComprasRealizadas.component';

describe('CategoriaViatico', () => {
  let component: ReporteComprasRealizadasComponent;
  let fixture: ComponentFixture<ReporteComprasRealizadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteComprasRealizadasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteComprasRealizadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
