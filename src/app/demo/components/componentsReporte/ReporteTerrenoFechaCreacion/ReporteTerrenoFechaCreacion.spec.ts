import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteTerrenoFechaCreacionComponent } from './ReporteTerrenoFechaCreacion.component';

describe('CategoriaViatico', () => {
  let component: ReporteTerrenoFechaCreacionComponent;
  let fixture: ComponentFixture<ReporteTerrenoFechaCreacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteTerrenoFechaCreacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteTerrenoFechaCreacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
