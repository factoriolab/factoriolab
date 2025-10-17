import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeltSelect } from './belt-select';

describe('BeltSelect', () => {
  let component: BeltSelect;
  let fixture: ComponentFixture<BeltSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeltSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeltSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
