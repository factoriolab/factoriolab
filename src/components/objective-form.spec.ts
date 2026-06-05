import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { rational } from '~/rational/rational';
import { ObjectiveBase } from '~/state/objectives/objective';
import { ObjectiveType } from '~/state/objectives/objective-type';
import { ObjectiveUnit } from '~/state/objectives/objective-unit';

import { ObjectiveForm } from './objective-form';

class TestObjectiveForm extends ObjectiveForm {
  addObjective(_value: ObjectiveBase): void {}
}

describe('ObjectiveForm', () => {
  let objectiveForm: TestObjectiveForm;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      objectiveForm = new TestObjectiveForm();
    });
  });

  describe('openPicker', () => {
    it('should open the item picker and add an objective', () => {
      spyOn(objectiveForm['picker'], 'pickItem').and.returnValue(of('id'));
      spyOn(objectiveForm, 'addObjective');
      objectiveForm.openPicker();
      expect(objectiveForm.addObjective).toHaveBeenCalledWith({
        targetId: 'id',
        value: rational.one,
        unit: ObjectiveUnit.Items,
        type: ObjectiveType.Output,
      });
    });

    it('should open the item picker and add an objective', () => {
      objectiveForm.unit.set(ObjectiveUnit.Machines);
      spyOn(objectiveForm['picker'], 'pickRecipe').and.returnValue(of('id'));
      spyOn(objectiveForm, 'addObjective');
      objectiveForm.openPicker();
      expect(objectiveForm.addObjective).toHaveBeenCalledWith({
        targetId: 'id',
        value: rational.one,
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      });
    });
  });
});
