import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FletecontrolycalidadComponent } from './fletecontrolycalidad.component';

describe('FletecontrolycalidadComponent', () => {
  let component: FletecontrolycalidadComponent;
  let fixture: ComponentFixture<FletecontrolycalidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FletecontrolycalidadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FletecontrolycalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
