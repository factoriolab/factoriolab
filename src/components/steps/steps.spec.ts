import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Steps } from './steps';

describe('Steps', () => {
  let component: Steps;
  let fixture: ComponentFixture<Steps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Steps]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Steps);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
