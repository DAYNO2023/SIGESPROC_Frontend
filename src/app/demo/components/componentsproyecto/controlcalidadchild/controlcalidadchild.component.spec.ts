import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlcalidadchildComponent } from './controlcalidadchild.component';

describe('ControlcalidadchildComponent', () => {
  let component: ControlcalidadchildComponent;
  let fixture: ComponentFixture<ControlcalidadchildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlcalidadchildComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ControlcalidadchildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
