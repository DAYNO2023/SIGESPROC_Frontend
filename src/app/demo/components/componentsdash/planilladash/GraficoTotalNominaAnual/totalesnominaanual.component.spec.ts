import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalesnominaanualComponent } from './totalesnominaanual.component';

describe('TotalesnominaanualComponent', () => {
  let component: TotalesnominaanualComponent;
  let fixture: ComponentFixture<TotalesnominaanualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalesnominaanualComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TotalesnominaanualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
