import { ComponentFixture, TestBed } from '@angular/core/testing';

import { clienteComponent } from './cliente.component';

describe('CargoComponent', () => {
  let component: clienteComponent;
  let fixture: ComponentFixture<clienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [clienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(clienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
