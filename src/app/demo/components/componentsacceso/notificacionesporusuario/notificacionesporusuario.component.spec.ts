import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificacionesporusuarioComponent } from './notificacionesporusuario.component';

describe('NotificacionesporusuarioComponent', () => {
  let component: NotificacionesporusuarioComponent;
  let fixture: ComponentFixture<NotificacionesporusuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificacionesporusuarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificacionesporusuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
