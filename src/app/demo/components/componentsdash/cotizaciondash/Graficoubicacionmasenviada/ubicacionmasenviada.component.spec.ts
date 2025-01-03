import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbicacionmasenviadaComponent } from './ubicacionmasenviada.component';

describe('UbicacionmasenviadaComponent', () => {
  let component: UbicacionmasenviadaComponent;
  let fixture: ComponentFixture<UbicacionmasenviadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UbicacionmasenviadaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UbicacionmasenviadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
