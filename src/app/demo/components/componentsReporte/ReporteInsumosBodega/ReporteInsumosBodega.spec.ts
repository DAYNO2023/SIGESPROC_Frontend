import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteInsumosBodegaComponent } from './ReporteInsumosBodega.component';

describe('CategoriaViatico', () => {
  let component: ReporteInsumosBodegaComponent;
  let fixture: ComponentFixture<ReporteInsumosBodegaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteInsumosBodegaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteInsumosBodegaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
