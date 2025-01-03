import { ComponentFixture, TestBed } from '@angular/core/testing';

import { categoriaviaticoComponent } from './mantenimiento.component';

describe('CategoriaViatico', () => {
  let component: categoriaviaticoComponent;
  let fixture: ComponentFixture<categoriaviaticoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [categoriaviaticoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(categoriaviaticoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
