import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoCivilComponent } from './estadoCivil.component';

describe('EstadoCivilComponent', () => {
  let component: EstadoCivilComponent;
  let fixture: ComponentFixture<EstadoCivilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoCivilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoCivilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
