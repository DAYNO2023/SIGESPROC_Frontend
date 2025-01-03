import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BancosmasacreditadosComponent } from './bancosmasacreditados.component';

describe('BancosmasacreditadosComponent', () => {
  let component: BancosmasacreditadosComponent;
  let fixture: ComponentFixture<BancosmasacreditadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BancosmasacreditadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BancosmasacreditadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
