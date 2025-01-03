import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FletesasociadosaproyectosComponent } from './fletesasociadosaproyectos.component';

describe('FletesasociadosaproyectosComponent', () => {
  let component: FletesasociadosaproyectosComponent;
  let fixture: ComponentFixture<FletesasociadosaproyectosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FletesasociadosaproyectosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FletesasociadosaproyectosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
