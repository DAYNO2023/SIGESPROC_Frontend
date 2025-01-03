import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasacambioComponent } from './tasacambio.component';

describe('TasacambioComponent', () => {
  let component: TasacambioComponent;
  let fixture: ComponentFixture<TasacambioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasacambioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TasacambioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
