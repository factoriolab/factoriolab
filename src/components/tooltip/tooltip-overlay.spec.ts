import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipOverlay } from './tooltip-overlay';

describe('TooltipOverlay', () => {
  let component: TooltipOverlay;
  let fixture: ComponentFixture<TooltipOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TooltipOverlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
