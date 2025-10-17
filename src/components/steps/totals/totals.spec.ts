import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Totals } from './totals';

describe('Totals', () => {
  let component: Totals;
  let fixture: ComponentFixture<Totals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Totals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Totals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
