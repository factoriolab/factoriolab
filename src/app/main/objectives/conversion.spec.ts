import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { rational } from '~/rational/rational';
import { ObjectiveState } from '~/state/objectives/objective';
import { ObjectiveType } from '~/state/objectives/objective-type';
import { ObjectiveUnit } from '~/state/objectives/objective-unit';
import { ItemId } from '~/tests/item-id';
import { Mocks } from '~/tests/mocks/mocks';
import { mockObjective1, mockObjective5 } from '~/tests/mocks/objective';
import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';

import { Conversion } from './conversion';

describe('Conversion', () => {
  let service: Conversion;
  let mocks: Mocks;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    mocks = TestBed.inject(Mocks);
    service = TestBed.inject(Conversion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('changeUnit', () => {
    it('should do nothing if switching to and from machines', () => {
      spyOn(service['objectivesStore'], 'updateRecord');
      service.changeUnit(mockObjective5, ObjectiveUnit.Machines);
      expect(service['objectivesStore'].updateRecord).not.toHaveBeenCalled();
    });

    it('should auto-switch from item to recipe', () => {
      spyOn(service['objectivesStore'], 'updateRecord');
      service.changeUnit(mockObjective1, ObjectiveUnit.Machines);
      expect(service['objectivesStore'].updateRecord).toHaveBeenCalledWith(
        mockObjective1.id,
        { targetId: RecipeId.AdvancedCircuit, unit: ObjectiveUnit.Machines },
      );
    });

    it('should prompt user to switch from item to recipe', () => {
      spyOn(service['objectivesStore'], 'updateRecord');
      spyOn(service['picker'], 'pickRecipe').and.returnValue(
        of(RecipeId.AdvancedOilProcessing),
      );
      const objective: ObjectiveState = {
        id: '0',
        targetId: ItemId.PetroleumGas,
        value: rational.one,
        unit: ObjectiveUnit.Items,
        type: ObjectiveType.Output,
      };
      service.changeUnit(objective, ObjectiveUnit.Machines);
      expect(service['objectivesStore'].updateRecord).toHaveBeenCalledWith(
        '0',
        {
          targetId: RecipeId.AdvancedOilProcessing,
          unit: ObjectiveUnit.Machines,
        },
      );
    });

    it('should auto-switch from recipe to item', () => {
      spyOn(service['objectivesStore'], 'updateRecord');
      service.changeUnit(mockObjective5, ObjectiveUnit.Items);
      expect(service['objectivesStore'].updateRecord).toHaveBeenCalledWith(
        mockObjective5.id,
        {
          targetId: ItemId.PiercingRoundsMagazine,
          unit: ObjectiveUnit.Items,
        },
      );
    });

    it('should prompt user to switch from recipe to item', () => {
      spyOn(service['objectivesStore'], 'updateRecord');
      spyOn(service['picker'], 'pickItem').and.returnValue(of('id'));
      service.changeUnit(
        {
          id: '0',
          targetId: RecipeId.AdvancedOilProcessing,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
        },
        ObjectiveUnit.Items,
      );
      expect(service['objectivesStore'].updateRecord).toHaveBeenCalledWith(
        '0',
        { targetId: 'id', unit: ObjectiveUnit.Items },
      );
    });

    it('should auto-switch between items rate units', () => {
      spyOn(service['objectivesStore'], 'updateRecord');
      service.changeUnit(mockObjective1, ObjectiveUnit.Belts);
      expect(service['objectivesStore'].updateRecord).toHaveBeenCalledWith(
        mockObjective1.id,
        { targetId: mockObjective1.targetId, unit: ObjectiveUnit.Belts },
      );
    });
  });

  describe('convertItemsToMachines', () => {
    it('should convert the objective value', () => {
      spyOn(
        service['preferencesStore'],
        'convertObjectiveValues',
      ).and.returnValue(true);
      spyOn(service['objectivesStore'], 'updateRecord');
      service.convertItemsToMachines(
        mocks.objectives()[0],
        RecipeId.AdvancedCircuit,
      );
      expect(service['objectivesStore'].updateRecord).toHaveBeenCalledWith(
        '1',
        { value: rational(10n, 441n) },
      );
    });

    it('should not convert the value on maximize objectives', () => {
      spyOn(
        service['preferencesStore'],
        'convertObjectiveValues',
      ).and.returnValue(true);
      spyOn(service['objectivesStore'], 'updateRecord');
      service.convertItemsToMachines(
        mocks.objectives()[2],
        RecipeId.AdvancedCircuit,
      );
      expect(service['objectivesStore'].updateRecord).toHaveBeenCalledTimes(1);
    });
  });

  describe('convertMachinesToItems', () => {
    it('should convert the objective value', () => {
      spyOn(
        service['preferencesStore'],
        'convertObjectiveValues',
      ).and.returnValue(true);
      spyOn(service['objectivesStore'], 'updateRecord');
      service.convertMachinesToItems(
        mocks.objectives()[4],
        ItemId.PiercingRoundsMagazine,
        ObjectiveUnit.Items,
      );
      expect(service['objectivesStore'].updateRecord).toHaveBeenCalledWith(
        '5',
        { value: rational(78n) },
      );
    });

    it('should not convert the value on maximize objectives', () => {
      spyOn(
        service['preferencesStore'],
        'convertObjectiveValues',
      ).and.returnValue(true);
      spyOn(service['objectivesStore'], 'updateRecord');
      service.convertMachinesToItems(
        mocks.objectives()[2],
        ItemId.AdvancedCircuit,
        ObjectiveUnit.Items,
      );
      expect(service['objectivesStore'].updateRecord).toHaveBeenCalledTimes(1);
    });
  });

  describe('convertItemsToItems', () => {
    it('should convert the objective value', () => {
      spyOn(
        service['preferencesStore'],
        'convertObjectiveValues',
      ).and.returnValue(true);
      spyOn(service['objectivesStore'], 'updateRecord');
      service.convertItemsToItems(
        mocks.objectives()[0],
        ItemId.AdvancedCircuit,
        ObjectiveUnit.Belts,
      );
      expect(service['objectivesStore'].updateRecord).toHaveBeenCalledWith(
        '1',
        { value: rational(1n, 2700n) },
      );
    });

    it('should not convert the value on maximize objectives', () => {
      spyOn(
        service['preferencesStore'],
        'convertObjectiveValues',
      ).and.returnValue(true);
      spyOn(service['objectivesStore'], 'updateRecord');
      service.convertItemsToItems(
        mocks.objectives()[2],
        ItemId.AdvancedCircuit,
        ObjectiveUnit.Items,
      );
      expect(service['objectivesStore'].updateRecord).toHaveBeenCalledTimes(1);
    });
  });
});
