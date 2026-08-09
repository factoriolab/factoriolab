import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { rational } from '~/rational/rational';
import { ObjectiveBase } from '~/state/objectives/objective';
import { ObjectiveType } from '~/state/objectives/objective-type';
import { ObjectiveUnit } from '~/state/objectives/objective-unit';

import { ObjectiveForm } from './objective-form';

describe('ObjectiveForm', () => {
  let service: ObjectiveForm;

  beforeEach(() => {
    service = TestBed.inject(ObjectiveForm);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('openPicker', () => {
    it('should open the item picker and add an objective', () => {
      spyOn(service['picker'], 'pickItem').and.returnValue(of('id'));
      let value: ObjectiveBase | undefined;
      service.openPicker().subscribe((v) => (value = v));
      expect(value).toEqual({
        targetId: 'id',
        value: rational.one,
        unit: ObjectiveUnit.Items,
        type: ObjectiveType.Output,
      });
    });

    it('should open the item picker and add an objective', () => {
      service.unit.set(ObjectiveUnit.Machines);
      spyOn(service['picker'], 'pickRecipe').and.returnValue(of('id'));
      let value: ObjectiveBase | undefined;
      service.openPicker().subscribe((v) => (value = v));
      expect(value).toEqual({
        targetId: 'id',
        value: rational.one,
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      });
    });
  });
});
