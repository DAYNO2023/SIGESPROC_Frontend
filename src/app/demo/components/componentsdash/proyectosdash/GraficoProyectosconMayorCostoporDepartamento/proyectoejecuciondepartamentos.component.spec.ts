import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyectoejecuciondepartamentosComponent } from './proyectoejecuciondepartamentos.component';

describe('ProyectoejecuciondepartamentosComponent', () => {
  let component: ProyectoejecuciondepartamentosComponent;
  let fixture: ComponentFixture<ProyectoejecuciondepartamentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProyectoejecuciondepartamentosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProyectoejecuciondepartamentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
