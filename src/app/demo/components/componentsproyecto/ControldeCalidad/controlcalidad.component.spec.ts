import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlcalidadComponent } from './controlcalidad.component';

describe('ControlcalidadComponent', () => {
  let component: ControlcalidadComponent;
  let fixture: ComponentFixture<ControlcalidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlcalidadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ControlcalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
