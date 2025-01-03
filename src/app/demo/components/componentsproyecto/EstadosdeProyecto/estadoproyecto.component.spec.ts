import { ComponentFixture, TestBed } from '@angular/core/testing';

import { estadoproyectoComponent } from './estadoproyecto.component';

describe('estadoproyectoComponent', () => {
  let component: estadoproyectoComponent;
  let fixture: ComponentFixture<estadoproyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [estadoproyectoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(estadoproyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
