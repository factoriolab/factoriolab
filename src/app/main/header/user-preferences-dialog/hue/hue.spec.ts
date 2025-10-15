import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hue } from './hue';

describe('Hue', () => {
  let component: Hue;
  let fixture: ComponentFixture<Hue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
