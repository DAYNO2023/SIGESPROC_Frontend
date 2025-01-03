import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentabienraizComponent } from './VentadeBienesRaíces.component';

describe('VentabienraizComponent', () => {
  let component: VentabienraizComponent;
  let fixture: ComponentFixture<VentabienraizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentabienraizComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VentabienraizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
