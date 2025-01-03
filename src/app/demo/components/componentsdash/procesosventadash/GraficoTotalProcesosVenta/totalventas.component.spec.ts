import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalventasComponent } from './totalventas.component';

describe('TotalventasComponent', () => {
  let component: TotalventasComponent;
  let fixture: ComponentFixture<TotalventasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalventasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TotalventasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
