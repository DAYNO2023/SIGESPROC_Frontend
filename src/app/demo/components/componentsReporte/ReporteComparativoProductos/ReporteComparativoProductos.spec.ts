import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteComparativoProductosComponent } from './ReporteComparativoProductos.component';

describe('CategoriaViatico', () => {
  let component: ReporteComparativoProductosComponent;
  let fixture: ComponentFixture<ReporteComparativoProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteComparativoProductosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteComparativoProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
