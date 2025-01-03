import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoproyectoComponent } from './seguimientoproyecto.component';

describe('SeguimientoproyectoComponent', () => {
  let component: SeguimientoproyectoComponent;
  let fixture: ComponentFixture<SeguimientoproyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeguimientoproyectoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeguimientoproyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
