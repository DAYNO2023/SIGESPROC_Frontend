import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionAdicionalComponent } from './gestionadicional.component';

describe('ControlcalidadComponent', () => {
  let component: GestionAdicionalComponent;
  let fixture: ComponentFixture<GestionAdicionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionAdicionalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionAdicionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
