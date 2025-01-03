import { ComponentFixture, TestBed } from '@angular/core/testing';

import { equiposeguridadComponent } from './equiposeguridad.component';

describe('equiposeguridadComponent', () => {
  let component: equiposeguridadComponent;
  let fixture: ComponentFixture<equiposeguridadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [equiposeguridadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(equiposeguridadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
