import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentesactividadesdashComponent } from './incidentesactividadesdash.component';

describe('IncidentesactividadesdashComponent', () => {
  let component: IncidentesactividadesdashComponent;
  let fixture: ComponentFixture<IncidentesactividadesdashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentesactividadesdashComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IncidentesactividadesdashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
