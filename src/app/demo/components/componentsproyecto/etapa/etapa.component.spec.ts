import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtapaComponent } from './etapa.component';

describe('EtapaComponent', () => {
  let component: EtapaComponent;
  let fixture: ComponentFixture<EtapaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtapaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EtapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
