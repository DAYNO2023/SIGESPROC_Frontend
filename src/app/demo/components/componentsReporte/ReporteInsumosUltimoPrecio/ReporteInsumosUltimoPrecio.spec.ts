import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteInsumosUltimoPrecioComponent } from './ReporteInsumosUltimoPrecio.component';

describe('CategoriaViatico', () => {
  let component: ReporteInsumosUltimoPrecioComponent;
  let fixture: ComponentFixture<ReporteInsumosUltimoPrecioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteInsumosUltimoPrecioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteInsumosUltimoPrecioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
