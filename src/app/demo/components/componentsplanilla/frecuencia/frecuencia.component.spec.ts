import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrecuenciaComponent } from './frecuencia.component';

describe('FrecuenciaComponent', () => {
  let component: FrecuenciaComponent;
  let fixture: ComponentFixture<FrecuenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrecuenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FrecuenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
