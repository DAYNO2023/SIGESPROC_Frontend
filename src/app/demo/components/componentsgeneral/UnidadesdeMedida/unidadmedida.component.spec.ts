import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadMedidaComponent } from './unidadmedida.component';

describe('UnidadMedidaComponent', () => {
  let component: UnidadMedidaComponent;
  let fixture: ComponentFixture<UnidadMedidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnidadMedidaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnidadMedidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
