import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LugarmasenviadoComponent } from './lugarmasenviado.component';

describe('LugarmasenviadoComponent', () => {
  let component: LugarmasenviadoComponent;
  let fixture: ComponentFixture<LugarmasenviadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LugarmasenviadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LugarmasenviadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
