import { ComponentFixture, TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
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

  describe('save', () => {
    it('should call setValue if the editValue is defined', () => {
      spyOn(component, 'setValue');
      component.save();
      expect(component.setValue).not.toHaveBeenCalled();
      component.editValue.set({} as any);
      component.save();
      expect(component.setValue).toHaveBeenCalled();
    });
  });

  describe('setStack', () => {
    it('should update the stack value', () => {
      component.setStack(rational.one);
      expect(component.editValue()?.stack).toEqual(rational.one);
    });
  });

  describe('setBelt', () => {
    it('should update the beltId value', () => {
      component.setBelt('id');
      expect(component.editValue()?.beltId).toEqual('id');
    });
  });
});
