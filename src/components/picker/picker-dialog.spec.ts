import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickerDialog } from './picker-dialog';

describe('PickerDialog', () => {
  let component: PickerDialog;
  let fixture: ComponentFixture<PickerDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickerDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(PickerDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
