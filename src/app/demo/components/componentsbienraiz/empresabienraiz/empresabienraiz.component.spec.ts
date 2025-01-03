import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresaBienRaizComponent } from './empresabienraiz.component';

describe('EmpresabienraizComponent', () => {
  let component: EmpresaBienRaizComponent;
  let fixture: ComponentFixture<EmpresaBienRaizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresaBienRaizComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmpresaBienRaizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
