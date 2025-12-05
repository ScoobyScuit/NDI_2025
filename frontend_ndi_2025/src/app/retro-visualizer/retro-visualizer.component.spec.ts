import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetroVisualizerComponent } from './retro-visualizer.component';

describe('RetroVisualizerComponent', () => {
  let component: RetroVisualizerComponent;
  let fixture: ComponentFixture<RetroVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetroVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
