import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxCell } from './checkbox-cell';

describe('CheckboxCell', () => {
  let component: CheckboxCell;
  let fixture: ComponentFixture<CheckboxCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckboxCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
