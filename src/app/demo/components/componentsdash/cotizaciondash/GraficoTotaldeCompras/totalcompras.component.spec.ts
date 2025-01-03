import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalcomprasComponent } from './totalcompras.component';

describe('TotalcomprasComponent', () => {
  let component: TotalcomprasComponent;
  let fixture: ComponentFixture<TotalcomprasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalcomprasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TotalcomprasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
