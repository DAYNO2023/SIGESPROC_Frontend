import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasbienesraicespormesComponent } from './ventasbienesraicespormes.component';

describe('VentasbienesraicespormesComponent', () => {
  let component: VentasbienesraicespormesComponent;
  let fixture: ComponentFixture<VentasbienesraicespormesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasbienesraicespormesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VentasbienesraicespormesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
