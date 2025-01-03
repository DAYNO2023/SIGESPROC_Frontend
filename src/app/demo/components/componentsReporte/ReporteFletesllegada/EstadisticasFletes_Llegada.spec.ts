import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticasFletes_LlegadaComponent } from './EstadisticasFletes_Llegada.component';

describe('CategoriaViatico', () => {
  let component: EstadisticasFletes_LlegadaComponent;
  let fixture: ComponentFixture<EstadisticasFletes_LlegadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticasFletes_LlegadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticasFletes_LlegadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
