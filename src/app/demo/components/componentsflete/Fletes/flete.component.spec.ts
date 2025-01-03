import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleteComponent } from './Fletes.component';

describe('FleteComponent', () => {
  let component: FleteComponent;
  let fixture: ComponentFixture<FleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
