import { TestBed } from '@angular/core/testing';

import { POWER_ID } from '~/data/schema/item';
import { ObjectiveUnit } from '~/state/objectives/objective-unit';
import { ItemId } from '~/tests/item-id';

import { ItemUnitOptionsPipe } from './item-unit-options-pipe';

describe('ItemUnitOptionsPipe', () => {
  let pipe: ItemUnitOptionsPipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new ItemUnitOptionsPipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should change the label for power items to display as kW', () => {
      expect(
        pipe.transform(POWER_ID, [{ value: ObjectiveUnit.Items, label: '' }])[0]
          .label,
      ).toEqual('options.powerUnit.kW');
    });

    it('should not affect the label for power machines', () => {
      expect(
        pipe.transform(POWER_ID, [
          { value: ObjectiveUnit.Machines, label: 'machines' },
        ])[0].label,
      ).toEqual('machines');
    });

    it('should not affect label for non-power items', () => {
      expect(
        pipe.transform(ItemId.IronPlate, [
          { value: ObjectiveUnit.Items, label: 'label' },
        ])[0].label,
      ).toEqual('label');
    });
  });
});
