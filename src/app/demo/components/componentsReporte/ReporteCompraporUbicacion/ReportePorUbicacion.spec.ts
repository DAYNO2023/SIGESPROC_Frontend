import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportePorUbicacionComponent } from './ReportePorUbicacion.component';

describe('CategoriaViatico', () => {
  let component: ReportePorUbicacionComponent;
  let fixture: ComponentFixture<ReportePorUbicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportePorUbicacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportePorUbicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
