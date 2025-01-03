import { ComponentFixture, TestBed } from '@angular/core/testing';

import {  incidentescompletoComponent } from './incidentes-completo.component';

describe('incidentescompletoComponent', () => {
  let component: incidentescompletoComponent;
  let fixture: ComponentFixture<incidentescompletoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [incidentescompletoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(incidentescompletoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
