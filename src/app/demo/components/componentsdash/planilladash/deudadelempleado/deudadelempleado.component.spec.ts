import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeudadelempleadoComponent } from './deudadelempleado.component';

describe('DeudadelempleadoComponent', () => {
  let component: DeudadelempleadoComponent;
  let fixture: ComponentFixture<DeudadelempleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeudadelempleadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeudadelempleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
