import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteArticulosActividades } from './ReporteArticulosActividades.component';

describe('CategoriaViatico', () => {
  let component: ReporteArticulosActividades;
  let fixture: ComponentFixture<ReporteArticulosActividades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteArticulosActividades]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteArticulosActividades);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
