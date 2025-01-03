import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProveedoresmascompradosComponent } from './proveedoresmascomprados.component';

describe('ProveedoresmascompradosComponent', () => {
  let component: ProveedoresmascompradosComponent;
  let fixture: ComponentFixture<ProveedoresmascompradosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProveedoresmascompradosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProveedoresmascompradosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
