import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodegaPorInsumoComponent } from './bodegaporinsumo.component';

describe('BodegaporinsumoComponent', () => {
  let component: BodegaPorInsumoComponent;
  let fixture: ComponentFixture<BodegaPorInsumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BodegaPorInsumoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BodegaPorInsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
