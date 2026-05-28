import { ComponentFixture, TestBed } from '@angular/core/testing';

import { setInputs } from '~/tests/utils';

import { BeltSelect } from './belt-select';

describe('BeltSelect', () => {
  let component: BeltSelect;
  let fixture: ComponentFixture<BeltSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeltSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(BeltSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('open', () => {
    it('should set up the editValue if value is defined', () => {
      spyOn(component.editValue, 'set');
      component.open();
      expect(component.editValue.set).not.toHaveBeenCalled();
      setInputs(fixture, { value: {} });
      component.open();
      expect(component.editValue.set).toHaveBeenCalled();
    });
  });
});
