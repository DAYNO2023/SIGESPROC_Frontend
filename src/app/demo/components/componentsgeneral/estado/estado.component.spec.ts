import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoComponent } from './estado.component';

describe('EstadoCivilComponent', () => {
  let component: EstadoComponent;
  let fixture: ComponentFixture<EstadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
