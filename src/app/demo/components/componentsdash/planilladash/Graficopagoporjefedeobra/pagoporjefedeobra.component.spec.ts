import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoporjefedeobraComponent } from './pagoporjefedeobra.component';

describe('PagoporjefedeobraComponent', () => {
  let component: PagoporjefedeobraComponent;
  let fixture: ComponentFixture<PagoporjefedeobraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoporjefedeobraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PagoporjefedeobraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
