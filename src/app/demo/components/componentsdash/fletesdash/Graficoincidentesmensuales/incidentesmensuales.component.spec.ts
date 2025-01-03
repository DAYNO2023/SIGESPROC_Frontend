import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentesmensualesComponent } from './incidentesmensuales.component';

describe('IncidentesmensualesComponent', () => {
  let component: IncidentesmensualesComponent;
  let fixture: ComponentFixture<IncidentesmensualesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentesmensualesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IncidentesmensualesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
