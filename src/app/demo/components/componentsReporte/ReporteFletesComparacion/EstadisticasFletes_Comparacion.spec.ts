import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticasFletes_ComparacionComponent } from './EstadisticasFletes_Comparacion.component';

describe('CategoriaViatico', () => {
  let component: EstadisticasFletes_ComparacionComponent;
  let fixture: ComponentFixture<EstadisticasFletes_ComparacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticasFletes_ComparacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticasFletes_ComparacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
