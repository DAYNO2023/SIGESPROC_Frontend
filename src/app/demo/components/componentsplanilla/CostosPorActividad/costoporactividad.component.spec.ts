import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostoporactividadComponent } from './costoporactividad.component';

describe('CostoporactividadComponent', () => {
  let component: CostoporactividadComponent;
  let fixture: ComponentFixture<CostoporactividadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostoporactividadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CostoporactividadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
