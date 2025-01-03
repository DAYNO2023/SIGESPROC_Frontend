import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenteBienRaizComponent } from './agentebienraiz.component';

describe('AgenteBienRaizComponent', () => {
  let component: AgenteBienRaizComponent;
  let fixture: ComponentFixture<AgenteBienRaizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgenteBienRaizComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgenteBienRaizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});