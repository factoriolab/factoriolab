import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundLightness } from './background-lightness';

describe('BackgroundLightness', () => {
  let component: BackgroundLightness;
  let fixture: ComponentFixture<BackgroundLightness>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackgroundLightness],
    }).compileComponents();

    fixture = TestBed.createComponent(BackgroundLightness);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
