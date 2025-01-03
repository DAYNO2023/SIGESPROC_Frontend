import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteInsumosAProyectoComponent } from './ReporteInsumosAProyecto.component';

describe('CategoriaViatico', () => {
  let component: ReporteInsumosAProyectoComponent;
  let fixture: ComponentFixture<ReporteInsumosAProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteInsumosAProyectoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteInsumosAProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
