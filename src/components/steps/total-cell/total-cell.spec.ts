import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalCell } from './total-cell';

describe('TotalCell', () => {
  let component: TotalCell;
  let fixture: ComponentFixture<TotalCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
