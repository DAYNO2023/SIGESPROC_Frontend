import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BienesRaicesComponent } from './bienraiz.component';

describe('BienesRaicesComponent', () => {
  let component: BienesRaicesComponent;
  let fixture: ComponentFixture<BienesRaicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BienesRaicesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BienesRaicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
