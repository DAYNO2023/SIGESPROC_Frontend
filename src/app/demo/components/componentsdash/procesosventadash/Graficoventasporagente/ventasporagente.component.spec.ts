import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasporagenteComponent } from './ventasporagente.component';

describe('VentasporagenteComponent', () => {
  let component: VentasporagenteComponent;
  let fixture: ComponentFixture<VentasporagenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasporagenteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VentasporagenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
