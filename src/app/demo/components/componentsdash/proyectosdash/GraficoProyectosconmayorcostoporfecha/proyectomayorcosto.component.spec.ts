import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyectomayorcostoComponent } from './proyectomayorcosto.component';

describe('ProyectomayorcostoComponent', () => {
  let component: ProyectomayorcostoComponent;
  let fixture: ComponentFixture<ProyectomayorcostoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProyectomayorcostoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProyectomayorcostoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
