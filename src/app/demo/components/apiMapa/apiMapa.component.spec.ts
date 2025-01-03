import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiMapaComponent } from './apiMapa.component';

describe('CargoComponent', () => {
  let component: ApiMapaComponent;
  let fixture: ComponentFixture<ApiMapaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiMapaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiMapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
