import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteComparacionMonetaria } from './ReporteComparacionMonetaria.component';

describe('CategoriaViatico', () => {
  let component: ReporteComparacionMonetaria;
  let fixture: ComponentFixture<ReporteComparacionMonetaria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteComparacionMonetaria]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteComparacionMonetaria);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
