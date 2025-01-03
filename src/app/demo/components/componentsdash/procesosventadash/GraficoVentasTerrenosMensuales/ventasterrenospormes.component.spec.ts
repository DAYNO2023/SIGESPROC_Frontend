import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasterrenospormesComponent } from './ventasterrenospormes.component';

describe('VentasterrenospormesComponent', () => {
  let component: VentasterrenospormesComponent;
  let fixture: ComponentFixture<VentasterrenospormesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasterrenospormesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VentasterrenospormesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
